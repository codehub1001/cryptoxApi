const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET all users
exports.getAllUsers = async (req, res) => {
  const users = await prisma.user.findMany({ include: { wallet: true } });
  res.json(users);
};

// GET single user
exports.getUserById = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: { wallet: true }
  });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

// UPDATE user
exports.updateUser = async (req, res) => {
  const { name, role, bonus } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { name, role, bonus }
  });
  res.json(user);
};

// DELETE user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Delete related records first
    await prisma.wallet.deleteMany({ where: { userId: id } });
    await prisma.investment.deleteMany({ where: { userId: id } });
    await prisma.transaction.deleteMany({ where: { userId: id } });

    // Now delete the user
    await prisma.user.delete({ where: { id } });

    res.json({ message: 'User and related data deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

