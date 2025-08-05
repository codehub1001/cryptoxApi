const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // easycoininvest.com
  port: parseInt(process.env.EMAIL_PORT), // 465
  secure: true, // SSL/TLS for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  logger: true,
  debug: true,
});


const sendMail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: `"ZentraVault" <no-reply@zentravault.com>`,
      to,
      subject,
      html,
    };

    console.log('📬 Sending email to:', to);
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Email failed: ${error.message}`);
  }
};

module.exports = { sendMail };

