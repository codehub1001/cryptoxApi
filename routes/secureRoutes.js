const express = require('express');
const protect = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/api/secure-data', protect, (req, res) => {
  res.json({ message: 'This is protected data', userId: req.user.id });
});

module.exports = router;
