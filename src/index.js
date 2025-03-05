// src/index.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./utils/database');
const walletRoutes = require('./routes/walletRoutes');
const { initializeExchangeRate, getCurrentRate } = require('./utils/currencyconvertor');


const app = express();
const port = process.env.PORT || 3000;


// Initialize exchange rate when server starts
initializeExchangeRate();


// Middleware
app.use(express.json());

// Routes
app.use('/api', walletRoutes);

// Create a route to get the current rate
app.get('/api/rate', (req, res) => {
  res.json({
    rate: getCurrentRate(),
    currencyPair: 'USD/KES'
  });
});


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Database connection and server start
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
  });