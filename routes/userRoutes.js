const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const protect = require('../middlewares/authMiddleware');
const { forgotPassword } = require('../controllers/forgotPasswordController');
const { resetPassword } = require('../controllers/resetPasswordController');

// ...




// Auth
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Profile
router.get('/profile', protect, userController.getUserProfile);
router.patch('/profile', protect, userController.updateProfile);
router.get('/referrals', protect, userController.getReferralSummary);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);


module.exports = router;
