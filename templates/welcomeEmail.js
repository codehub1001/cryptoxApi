const welcomeEmail = ({ name, referralCode }) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
    <h2 style="color: #0b5ed7;">Welcome to CryptoVault 🎉</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Welcome to <strong>CryptoVault</strong>, your secure crypto investment platform.</p>

    <p>Your referral code:</p>
    <div style="background: #f8f9fa; padding: 10px 15px; font-weight: bold; width: fit-content; border-left: 4px solid #0b5ed7;">
      ${referralCode}
    </div>

    <p style="margin-top: 20px;">You can now start exploring and investing securely.</p>

    <hr style="margin: 30px 0;" />
    <p style="font-size: 12px; color: #999;">If you did not register for CryptoVault, please ignore this email.</p>
  </div>
`;

module.exports = welcomeEmail;
