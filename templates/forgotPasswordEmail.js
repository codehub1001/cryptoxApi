module.exports = ({ name, resetLink }) => `
  <h2>Hello ${name},</h2>
  <p>You requested to reset your password.</p>
  <p>Click the link below to create a new password:</p>
  <a href="${resetLink}">Reset Password</a>
  <p>This link expires in 1 hour.</p>
`;
