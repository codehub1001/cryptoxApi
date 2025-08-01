// templates/withdrawalRequestEmail.js
module.exports.withdrawalRequestEmail = ({ name, amount, coin, destinationWallet, date }) => `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2>Hi ${name},</h2>
    <p>We’ve received your withdrawal request and it’s currently pending admin approval.</p>

    <table style="margin-top: 1rem; font-size: 15px;">
      <tr><td><strong>Amount:</strong></td><td>${amount}usd</td></tr>
    
      <tr><td><strong>Date:</strong></td><td>${date}</td></tr>
    </table>

    <p>You will receive a confirmation email once your withdrawal is processed.</p>
    <br/>
    <p>Thank you for using <strong>zentraVault</strong>!</p>
  </div>
`;
