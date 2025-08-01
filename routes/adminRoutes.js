const express = require('express');
const router = express.Router();
const isAdmin = require('../middlewares/isAdmin');
const userCtrl = require('../controllers/adminUserController');
const walletCtrl = require('../controllers/adminWalletController');
const transactionCtrl = require('../controllers/adminWalletController');
const { topUpUserWallet } = require('../controllers/adminWalletController');

// User management
router.get('/users', isAdmin, userCtrl.getAllUsers);
router.get('/users/:id', isAdmin, userCtrl.getUserById);
router.put('/users/:id', isAdmin, userCtrl.updateUser);
router.delete('/users/:id', isAdmin, userCtrl.deleteUser);

// Wallet management
router.get('/wallets', isAdmin, walletCtrl.getAllWallets);
router.get('/wallets/:userId', isAdmin, walletCtrl.getWalletByUserId);
router.put('/wallets/:userId', isAdmin, walletCtrl.updateWallet);
router.get('/pending-deposits', isAdmin, transactionCtrl.getPendingDeposits);
// routes/admin.js
router.post('/approve-deposit/:transactionId', isAdmin, transactionCtrl.approveDeposit);
// Example admin approve withdrawal

router.post('/disapprove-deposit/:transactionId', isAdmin, transactionCtrl.disapproveDeposit);
router.get('/pending-withdrawals', isAdmin, transactionCtrl.getAllWithdrawals);

router.post('/disapprove-withdrawal/:transactionId', isAdmin, transactionCtrl.disapproveWithdrawal);
// router.post('/disapprove-withdrawal/:transactionId', isAdmin, transactionCtrl.approveWithdrawal);
router.post('/approve-withdrawal/:id', isAdmin,transactionCtrl.approveWithdrawal);
router.post('/wallets/:userId/freeze', isAdmin, transactionCtrl .freezeWallet);


router.post('/wallets/debit',isAdmin, walletCtrl.debitWallet);

router.post('/topup', isAdmin, topUpUserWallet);
module.exports = router;
