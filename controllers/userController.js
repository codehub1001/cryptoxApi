// controllers/userController.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateReferralCode } = require('../middlewares/generateReferralCode');
const welcomeEmail = require('../templates/welcomeEmail');
const { sendMail } = require('../middlewares/mailer'); // adjust path accordingly

const prisma = new PrismaClient();
exports.registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      dob,
      country,
      nationality,
      referralCode: inputReferralCode,
    } = req.body;

    if (!name || !email || !password || !confirmPassword || !dob || !country || !nationality) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    let referredById = null;
    let referrer = null;

    if (inputReferralCode) {
      referrer = await prisma.user.findUnique({
        where: { referralCode: inputReferralCode },
      });

      if (!referrer) {
        return res.status(400).json({ message: 'Invalid referral code' });
      }

      referredById = referrer.id;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        dob: new Date(dob),
        country,
        nationality,
        referralCode: generateReferralCode(),
        referredById,
      },
    });

    await prisma.wallet.create({
      data: {
        userId: newUser.id,
      },
    });

    // ✅ Send Welcome Email
    await sendMail({
      to: newUser.email,
      subject: 'Welcome to zentravault 🎉',
      html:  welcomeEmail({ name: newUser.name, referralCode: newUser.referralCode }),
    });

    // ✅ Notify Referrer
    if (referrer) {
      await sendMail({
        to: referrer.email,
        subject: 'You Referred Someone! 🎁',
        html: `
          <h2>Hi ${referrer.name},</h2>
          <p><strong>${newUser.name}</strong> just registered using your referral code.</p>
          <p>You will receive a 5% bonus on their first deposit.</p>
          <p>Thanks for referring!</p>
        `,
      });
    }

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        referralCode: newUser.referralCode,
        referredById: newUser.referredById,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'All fields are required' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(401).json({ message: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: 'Invalid email or password' });

   const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });


    return res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name,  role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id; // req.user should be set by JWT middleware

    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        dob: true,
        country: true,
        nationality: true,
        referralCode: true,
        referredById: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('getUserProfile error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/profile — Update user profile
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, dob, country, nationality } = req.body;

  console.log('Received update for user:', userId);
  console.log({ name, dob, country, nationality }); // 👈 log what's received

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        dob: dob ? new Date(dob) : undefined,
        country,
        nationality,
      },
    });

    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Server error updating profile' });
  }
};
// referralController.js
exports.getReferralSummary = async (req, res) => {
  const userId = req.user.id;

  try {
    const referredUsers = await prisma.user.findMany({
      where: { referredById: userId },
    });

    const bonusTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'BONUS',
        status: 'SUCCESS',
      },
    });

    const totalBonus = bonusTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    res.json({
      referredCount: referredUsers.length,
      totalBonus,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch referral summary' });
  }
};



