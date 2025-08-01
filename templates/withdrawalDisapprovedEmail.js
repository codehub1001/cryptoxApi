module.exports = function withdrawalDisapprovedEmail({ name, amount, coin, date, reason }) {
  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #e74c3c;">❌ Withdrawal Disapproved</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your withdrawal request has been <strong>disapproved</strong>.</p>
      <ul>
        <li><strong>Amount:</strong> ${amount}Usd</li>
        <li><strong>Date:</strong> ${date}</li>
        // <li><strong>Reason:</strong> ${reason}</li>
      </ul>
      <p>If you believe this was a mistake or need help, please contact support.</p>
      <br/>
      <p>Regards,<br/><strong>zentraVault Team</strong></p>
    </div>
  `;
};
