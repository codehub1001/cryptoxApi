const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Hardcoded plans OR fetch from DB (for demo, we'll fetch from DB)
exports.getPlans = async (req, res) => {
  try {
    const plans = await prisma.investmentPlan.findMany();
    res.json(plans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching plans' });
  }
};

exports.createInvestment = async (req, res) => {
  const userId = req.user.id;
  const { planId, amount } = req.body;

  if (!planId || !amount) {
    return res.status(400).json({ message: 'Plan and amount are required' });
  }

  try {
    const plan = await prisma.investmentPlan.findUnique({ where: { id: planId } });
    if (!plan) return res.status(404).json({ message: 'Investment plan not found' });

    // Validate amount within plan limits
    if (amount < plan.minAmount || (plan.maxAmount && amount > plan.maxAmount)) {
      return res.status(400).json({ message: 'Amount not in allowed plan range' });
    }

    // Check user wallet balance
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

    // ❌ Prevent investment if wallet is frozen
    if (wallet.frozen) {
      return res.status(403).json({ message: 'Your wallet is frozen. Please contact support.' });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Deduct amount from wallet
    await prisma.wallet.update({
      where: { userId },
      data: { balance: wallet.balance - amount },
    });

    // Calculate expected return (compound daily)
    const expectedReturn = amount * Math.pow(1 + plan.dailyReturn, plan.duration);

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + plan.duration);

    // Create investment record
    const investment = await prisma.investment.create({
      data: {
        userId,
        planId,
        amount,
        startDate,
        endDate,
        expectedReturn,
        status: 'ACTIVE',
      },
    });

    res.status(201).json(investment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating investment' });
  }
};


exports.getUserInvestments = async (req, res) => {
  const userId = req.user.id;

  try {
    const investments = await prisma.investment.findMany({
      where: { userId },
      include: { plan: true },
      orderBy: { startDate: 'desc' },
    });
    res.json(investments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching user investments' });
  }
};
