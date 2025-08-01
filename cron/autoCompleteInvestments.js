const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const completeInvestments = async () => {
  const now = new Date();

  const maturedInvestments = await prisma.investment.findMany({
    where: {
      status: 'ACTIVE',
      endDate: {
        lte: now,
      },
    },
  });

  for (const investment of maturedInvestments) {
    const returnAmount = investment.amount + investment.expectedReturn;

    await prisma.$transaction([
      prisma.investment.update({
        where: { id: investment.id },
        data: { status: 'COMPLETED' },
      }),
      prisma.wallet.update({
        where: { userId: investment.userId },
        data: {
          balance: {
            increment: returnAmount,
          },
        },
      }),
    ]);

    console.log(`✅ Investment ${investment.id} completed.`);
  }
};

module.exports = completeInvestments;
