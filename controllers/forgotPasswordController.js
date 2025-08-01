const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');
 // or wherever your prisma instance is
const { sendMail } = require('../middlewares/mailer') // your mail function
const forgotPasswordEmail = require('../templates/forgotPasswordEmail'); // your HTML template

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpires: expires,
      },
    });

    // Send email
    const resetLink = `http://localhost:5173/reset-password/${token}`;
    await sendMail({
      to: user.email,
      subject: '🔐 Reset Your Password',
      html: forgotPasswordEmail({ name: user.name, resetLink }),
    });

    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error sending reset email' });
  }
};
