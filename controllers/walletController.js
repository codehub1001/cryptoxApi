const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendMail } = require('../middlewares/mailer');
const depositRequestEmail = require('../templates/depositRequestEmail');
const { withdrawalRequestEmail } = require('../templates/withdrawalRequestEmail');

exports.getWallet = async (req, res) => {
  try {
    console.log('User from token:', req.user);

    const userId = req.user?.id;
    if (!userId) {
      console.error('No user ID found in request');
      return res.status(401).json({ message: 'Unauthorized: User ID missing' });
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!wallet) {
      console.warn('Wallet not found for user:', userId);
      return res.status(404).json({ message: 'Wallet not found' });
    }

    res.json(wallet);
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ message: 'Server error fetching wallet' });
  }
};


exports.deposit = async (req, res) => {
  const userId = req.user.id;
  const { amount, description } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than zero' });
  }

  try {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

    // 🔒 Block if wallet is frozen
    if (wallet.frozen) {
      return res.status(403).json({ message: 'Wallet is frozen. Deposit not allowed.' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount,
        type: 'DEPOSIT',
        status: 'PENDING',
        description,
      },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });

    await sendMail({
      to: user.email,
      subject: '💰 Deposit Request Received',
      html: depositRequestEmail({
        name: user.name,
        amount: amount.toFixed(2),
        date: new Date().toLocaleString(),
      }),
    });

    res.json({ message: 'Deposit request created and pending approval.', transaction });
  } catch (error) {
    console.error('Deposit request error:', error);
    res.status(500).json({ message: 'Server error during deposit request' });
  }
};




exports.withdraw = async (req, res) => {
  const userId = req.user.id;
  const { amount, description } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than zero' });
  }

  try {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

    // ❌ Block if wallet is frozen
    if (wallet.frozen) {
      return res.status(403).json({ message: 'Your wallet is frozen. Please contact support.' });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // Create a PENDING withdrawal transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount,
        type: 'WITHDRAW',
        status: 'PENDING',
        description,
      },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });

    // ✅ Send withdrawal request email
    await sendMail({
      to: user.email,
      subject: '📤 Withdrawal Request Submitted',
      html: withdrawalRequestEmail({
        name: user.name,
        amount: amount.toFixed(2),
        description,
        date: new Date().toLocaleString(),
      }),
    });

    res.json({ message: 'Withdrawal request submitted and user notified', transaction });
  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({ message: 'Server error during withdrawal' });
  }
};


exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Fetching transactions for user:', userId);

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    console.log('Found transactions:', transactions.length);

    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error fetching transactions' });
  }
};

