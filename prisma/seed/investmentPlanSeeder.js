const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedPlans() {
  const plans = [
    {
      name: 'Bronze',
      minAmount: 100,
      maxAmount: 499,
      dailyReturn: 0.10,
      duration: 7,
      perks: 'Low Risk, Beginner Friendly',
    },
    {
      name: 'Silver',
      minAmount: 500,
      maxAmount: 999,
      dailyReturn: 0.15,
      duration: 10,
      perks: 'Moderate Risk, Faster Growth, Priority Support',
    },
    {
      name: 'Gold',
      minAmount: 1000,
      maxAmount: 4999,
      dailyReturn: 0.18,
      duration: 14,
      perks: 'Higher ROI, Weekly Analytics, Dedicated Advisor',
    },
    {
      name: 'Diamond',
      minAmount: 5000,
      maxAmount: null,
      dailyReturn: 0.22,
      duration: 21,
      perks: 'Elite Returns, VIP Access, 1-on-1 Portfolio Review',
    },
  ];

  for (const plan of plans) {
    await prisma.investmentPlan.upsert({
      where: { name: plan.name },
      update: {},
      create: plan,
    });
  }

  console.log('✅ Investment plans seeded');
  await prisma.$disconnect();
}

seedPlans().catch((e) => {
  console.error('❌ Error seeding plans', e);
  prisma.$disconnect();
});
