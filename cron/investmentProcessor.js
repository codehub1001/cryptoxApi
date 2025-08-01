const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function processInvestments() {
  console.log('Starting daily investment processing:', new Date());

  const now = new Date();

  try {
    // Find all active investments whose endDate has passed
    const toComplete = await prisma.investment.findMany({
      where: {
        status: 'ACTIVE',
        endDate: { lte: now },
      },
    });

    for (const invest of toComplete) {
      // Update investment status
      await prisma.investment.update({
        where: { id: invest.id },
        data: { status: 'COMPLETED' },
      });

      // Credit wallet with expectedReturn
      const wallet = await prisma.wallet.findUnique({ where: { userId: invest.userId } });
      if (wallet) {
        await prisma.wallet.update({
          where: { userId: invest.userId },
          data: { balance: wallet.balance + invest.expectedReturn },
        });
      }

      console.log(`Processed investment ${invest.id} for user ${invest.userId}`);
    }
  } catch (err) {
    console.error('Error processing investments:', err);
  }

  console.log('Finished investment processing.');
}

module.exports = processInvestments;
