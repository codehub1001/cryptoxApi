const depositRequestEmail = ({ name, amount, coin }) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
    <h2 style="color: #ffc107;">Deposit Request Received 💳</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>We've received your deposit request of <strong>${amount} USD</strong> .</p>

    <p>Our admin will review and approve your deposit shortly. You’ll get an email confirmation once approved.</p>

    <p style="margin-top: 20px;">Thank you for using <strong>CryptoVault</strong>.</p>

    <hr style="margin: 30px 0;" />
    <p style="font-size: 12px; color: #999;">This is an automated notification. Please do not reply.</p>
  </div>
`;

module.exports = depositRequestEmail;
