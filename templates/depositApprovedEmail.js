const depositApprovedEmail = ({ name, amount, coin }) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
    <h2 style="color: #28a745;">Deposit Approved ✅</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Your deposit of <strong>${amount} USD</strong>  has been successfully approved and credited to your wallet.</p>

    <p>You can now start investing or withdrawing anytime.</p>

    <p style="margin-top: 20px;">Thank you for trusting <strong>CryptoVault</strong>.</p>

    <hr style="margin: 30px 0;" />
    <p style="font-size: 12px; color: #999;">For any questions, please contact our support.</p>
  </div>
`;

module.exports = {depositApprovedEmail};
