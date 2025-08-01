const cron = require('node-cron');
const completeInvestments = require('./autoCompleteInvestments');

// ⏱️ Runs every hour at minute 0
cron.schedule('0 0 * * *', async () => {
  console.log('⏳ Running daily investment completion check...');
  await completeInvestments();
});

// ✅ Optional: Also run once on startup
completeInvestments();
