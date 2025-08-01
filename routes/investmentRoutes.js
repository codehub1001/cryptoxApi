const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');
const protect = require('../middlewares/authMiddleware');

router.get('/plans', protect, investmentController.getPlans);

router.post('/invest', protect, investmentController.createInvestment);
router.get('/my-investments', protect, investmentController.getUserInvestments);

module.exports = router;
