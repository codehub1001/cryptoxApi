module.exports = function withdrawalApprovedEmail({ name, amount, coin, date }) {
  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #2ecc71;">✅ Withdrawal Approved</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your withdrawal request has been <strong>approved</strong>.</p>
      <ul>
        <li><strong>Amount:</strong> ${amount}usd</li>
        <li><strong>Date:</strong> ${date}</li>
      </ul>
      <p>The funds will be processed shortly. Thank you for using <strong>zentraVault</strong>.</p>
      <br/>
      <p>Regards,<br/><strong>zentraVault Team</strong></p>
    </div>
  `;
};
