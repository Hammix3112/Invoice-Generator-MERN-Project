const express = require('express');
const connectToMongo = require('./db');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const invoiceRoutes = require('./routes/invoices');
const historyRoutes = require('./routes/history');

const app = express();

// Connect to MongoDB
connectToMongo();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/history', historyRoutes);

// Optional test route
app.get('/', (req, res) => {
  res.send('Backend is working!');
});

// If running locally, start a listener (Vercel doesn’t need this)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

// Export app for Vercel serverless function
module.exports = app;
