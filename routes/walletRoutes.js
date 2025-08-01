const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const protect = require('../middlewares/authMiddleware');

router.get('/wallet', protect, walletController.getWallet);
router.post('/wallet/deposit', protect, walletController.deposit);
router.post('/wallet/withdraw', protect, walletController.withdraw);
router.get('/wallet/transactions', protect, walletController.getTransactions);

module.exports = router;
