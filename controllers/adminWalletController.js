const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendMail } = require('../middlewares/mailer'); // Adjust if needed
const { depositApprovedEmail } = require('../templates/depositApprovedEmail');
const { depositDisapprovedEmail } = require('../templates/depositDisapprovedEmail');
const withdrawalApprovedEmail = require('../templates/withdrawalApprovedEmail');
const withdrawalDisapprovedEmail = require('../templates/withdrawalDisapprovedEmail');

// GET all wallets
exports.getAllWallets = async (req, res) => {
  const wallets = await prisma.wallet.findMany({ include: { user: true } });
  res.json(wallets);
};

// GET wallet by user ID
exports.getWalletByUserId = async (req, res) => {
  const wallet = await prisma.wallet.findUnique({ where: { userId: req.params.userId } });
  if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
  res.json(wallet);
};

// UPDATE wallet balance
exports.updateWallet = async (req, res) => {
  const { balance } = req.body;
  const wallet = await prisma.wallet.update({
    where: { userId: req.params.userId },
    data: { balance }
  });
  res.json(wallet);
};

exports.topUpUserWallet = async (req, res) => {
  const { userId, amount } = req.body;

  if (!userId || !amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ message: 'Valid userId and amount required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const wallet = await prisma.wallet.upsert({
      where: { userId },
      update: { balance: { increment: parseFloat(amount) } },
      create: {
        userId,
        balance: parseFloat(amount),
      },
    });

    await prisma.transaction.create({
      data: {
        userId,
        amount: parseFloat(amount),
        type: 'DEPOSIT',
        status: 'SUCCESS',
        description: 'Admin top-up',
      },
    });

    return res.status(200).json({
      message: `Wallet topped up successfully for ${user.email}`,
      wallet,
    });
  } catch (error) {
    console.error('Top-up error:', error);
    res.status(500).json({ message: 'Server error during top-up' });
  }
};
exports.getPendingDeposits = async (req, res) => {
  try {
    const deposits = await prisma.transaction.findMany({
      where: { status: 'PENDING', type: 'DEPOSIT' },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(deposits);
  } catch (error) {
    console.error('Fetch pending deposits error:', error);
    res.status(500).json({ message: 'Failed to fetch pending deposits' });
  }
};
exports.approveDeposit = async (req, res) => {
  const adminId = req.user.id;
  const { transactionId } = req.params;

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true },
    });

    if (!transaction)
      return res.status(404).json({ message: 'Transaction not found' });

    if (transaction.status !== 'PENDING')
      return res.status(400).json({ message: 'Transaction already processed' });

    const wallet = await prisma.wallet.findUnique({
      where: { userId: transaction.userId },
    });

    if (!wallet)
      return res.status(404).json({ message: 'Wallet not found' });

    const updatedWallet = await prisma.wallet.update({
      where: { userId: transaction.userId },
      data: {
        balance: wallet.balance + transaction.amount,
      },
    });

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'SUCCESS',
        approvedBy: adminId,
        approvedAt: new Date(),
      },
    });

    // ✅ Send approval email
    await sendMail({
      to: transaction.user.email,
      subject: '✅ Your Deposit Has Been Approved!',
      html: depositApprovedEmail({
        name: transaction.user.name,
        amount: transaction.amount.toFixed(2),
        // coin: transaction.coin || 'BTC',
        date: new Date().toLocaleString(),
      }),
    });

    // ✅ First deposit referral bonus
    const priorDeposits = await prisma.transaction.findMany({
      where: {
        userId: transaction.userId,
        type: 'DEPOSIT',
        status: 'SUCCESS',
      },
    });

    if (priorDeposits.length === 1) {
      const referredById = transaction.user.referredById;

      if (referredById) {
        const bonus = transaction.amount * 0.05;

        await prisma.wallet.update({
          where: { userId: referredById },
          data: {
            balance: {
              increment: bonus,
            },
          },
        });

        await prisma.transaction.create({
          data: {
            userId: referredById,
            type: 'BONUS',
            amount: bonus,
            status: 'SUCCESS',
            createdAt: new Date(),
          },
        });
      }
    }

    res.json({
      message: 'Deposit approved and referral bonus processed if eligible',
      wallet: updatedWallet,
      transaction: updatedTransaction,
    });

  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ message: 'Server error during approval' });
  }
};


// disapporve pendin depost
exports.disapproveDeposit = async (req, res) => {
  const adminId = req.user.id;
  const { transactionId } = req.params;
  // const { reason } = req.body;

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true }, // fetch user details for email
    });

    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    if (transaction.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only pending deposits can be disapproved' });
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'FAILED',
        approvedBy: adminId,
        approvedAt: new Date(),
        // description: reason || transaction.description || 'Disapproved by admin',
      },
    });

    // Send disapproval email
    await sendMail({
      to: transaction.user.email,
      subject: '❌ Deposit Disapproved',
      html: depositDisapprovedEmail({
        name: transaction.user.name,
        amount: transaction.amount.toFixed(2),
        // coin: transaction.coin || 'BTC',
        date: new Date().toLocaleString(),
        // reason: reason || 'Not specified',
      }),
    });

    res.json({ message: 'Deposit disapproved and user notified', transaction: updatedTransaction });
  } catch (error) {
    console.error('Disapprove error:', error);
    res.status(500).json({ message: 'Server error during disapproval' });
  }
};


// adminWalletController.js or adminTransactionController.js
exports.approveWithdrawal = async (req, res) => {
  const { id } = req.params;

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { user: true }, // needed for email
    });

    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.status !== 'PENDING') return res.status(400).json({ message: 'Already processed' });
    if (transaction.type !== 'WITHDRAW') return res.status(400).json({ message: 'Not a withdrawal transaction' });

    const wallet = await prisma.wallet.findUnique({ where: { userId: transaction.userId } });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    if (wallet.balance < transaction.amount) return res.status(400).json({ message: 'Insufficient funds' });

    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId: wallet.userId },
        data: { balance: wallet.balance - transaction.amount },
      }),
      prisma.transaction.update({
        where: { id },
        data: {
          status: 'SUCCESS',
          approvedAt: new Date(),
        },
      }),
    ]);

    // ✅ Send email to user
    await sendMail({
      to: transaction.user.email,
      subject: '✅ Withdrawal Approved',
      html: withdrawalApprovedEmail({
        name: transaction.user.name,
        amount: transaction.amount.toFixed(2),
        // coin: transaction.coin || 'BTC',
        date: new Date().toLocaleString(),
      }),
    });

    res.json({ message: 'Withdrawal approved and user notified' });
  } catch (error) {
    console.error('Approve withdrawal error:', error);
    res.status(500).json({ message: 'Server error approving withdrawal' });
  }
};

exports.getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await prisma.transaction.findMany({
     where: { type: 'WITHDRAW', status: 'PENDING' },
// filter withdrawals only
      include: { user: true },     // include user info if needed
      orderBy: { createdAt: 'desc' },
    });

    res.json(withdrawals);
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({ message: 'Server error fetching withdrawals' });
  }
};
exports.disapproveWithdrawal = async (req, res) => {
  const { transactionId } = req.params;
  // const { reason } = req.body; // Optional reason from admin

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true }, // Needed for email
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status !== 'PENDING' || transaction.type !== 'WITHDRAW') {
      return res.status(400).json({ message: 'Transaction is already processed or not a withdrawal' });
    }

    // Update transaction status to disapproved
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'FAILED',
        approvedAt: new Date(),
        description:  transaction.description || 'Disapproved by admin',
      },
    });

    // ✅ Send disapproval email
    await sendMail({
      to: transaction.user.email,
      subject: '❌ Withdrawal Disapproved',
      html: withdrawalDisapprovedEmail({
        name: transaction.user.name,
        amount: transaction.amount.toFixed(2),
        // coin: transaction.coin || 'BTC',
        date: new Date().toLocaleString(),
        // reason: reason || 'Not specified',
      }),
    });

    res.json({ message: 'Withdrawal disapproved and user notified' });
  } catch (error) {
    console.error('Disapprove withdrawal error:', error);
    res.status(500).json({ message: 'Server error disapproving withdrawal' });
  }
};
exports.debitWallet = async (req, res) => {
  const { userId, amount } = req.body;

  if (!userId || !amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid userId or amount' });
  }

  try {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

    if (wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient funds to debit' });
    }

    // Debit the wallet balance
    const updatedWallet = await prisma.wallet.update({
      where: { userId },
      data: { balance: wallet.balance - amount },
    });

    // Optionally, create a transaction record of type 'DEBIT'
    await prisma.transaction.create({
      data: {
        userId,
        amount,
        type: 'DEBIT',
        status: 'SUCCESS',
        description: 'Admin debited wallet',
      },
    });

    res.json({ message: 'Wallet debited successfully', wallet: updatedWallet });
  } catch (error) {
    console.error('Debit wallet error:', error);
    res.status(500).json({ message: 'Server error debiting wallet' });
  }
};
// POST /api/admin/wallets/:userId/freeze
exports.freezeWallet = async (req, res) => {
  const { userId } = req.params;
  const { freeze } = req.body; // true = freeze, false = unfreeze

  try {
    // Update wallet
    const wallet = await prisma.wallet.update({
      where: { userId },
      data: { frozen: freeze },
      include: { user: true }, // Include user for email
    });

    // Send email notification
    await sendMail({
      to: wallet.user.email,
      subject: freeze ? '🚫 Wallet Frozen' : '✅ Wallet Unfrozen',
      html: `
        <div style="font-family: sans-serif;">
          <h2>Hello ${wallet.user.name},</h2>
          <p>Your wallet has been <strong>${freeze ? 'frozen' : 'unfrozen'}</strong> by the administrator.</p>
          ${
            freeze
              ? '<p>You will not be able to deposit, withdraw, or invest until the restriction is lifted.</p>'
              : '<p>You can now resume transactions normally.</p>'
          }
          <p style="margin-top:20px;">If you have questions, please contact support.</p>
        </div>
      `,
    });

    res.json({
      message: freeze ? 'Wallet frozen and user notified' : 'Wallet unfrozen and user notified',
      wallet,
    });
  } catch (error) {
    console.error('Freeze/unfreeze error:', error);
    res.status(500).json({ message: 'Server error freezing/unfreezing wallet' });
  }
};

