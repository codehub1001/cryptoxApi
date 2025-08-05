require('dotenv').config();
require('./cron/scheduler');
require('./cron/autoCompleteInvestments');
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const secureRoutes = require('./routes/secureRoutes'); // 👈 Import secure routes
const walletRoutes = require('./routes/walletRoutes');
const adminRoutes = require('./routes/adminRoutes');
const investmentRoutes = require('./routes/investmentRoutes');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({
  origin: [
    "http://localhost:5173",                      // For local development
    "https://zentra-nu-woad.vercel.app",          // Vercel frontend
    "http://zentravault.us/"           // Vercel frontend
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Routes
app.use('/api', userRoutes);
app.use('/api', secureRoutes);
app.use('/api', walletRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/investment', investmentRoutes);


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
