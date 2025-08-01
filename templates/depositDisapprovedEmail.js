// templates/depositDisapprovedEmail.js

function depositDisapprovedEmail({ name, amount, coin, date, reason }) {
  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Hello ${name},</h2>
      <p>❌ Unfortunately, your <strong>${coin}</strong> deposit of <strong>$${amount}</strong> was disapproved on ${date}.</p>
      <p>Please review your deposit details or contact support for assistance.</p>
      <br/>
      <p>— The zentraVault Team</p>
    </div>
  `;
}

module.exports = { depositDisapprovedEmail };
