const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

// File path for storing the exchange rate
const RATE_FILE_PATH = path.join(__dirname, 'exchangeRate.json');

// Initialize exchange rate
let usdToKesRate = 0;

// Function to fetch and save exchange rate
async function updateExchangeRate() {
    try {
      const response = await axios.get(
        'https://hexarate.paikama.co/api/rates/latest/USD?target=KES'
      );
      
      // Check response structure
      if (!response.data?.data?.mid) {
        throw new Error('Invalid API response structure');
      }
  
      const newRate = response.data.data.mid;
      
      // Rest of the code remains the same
      usdToKesRate = newRate;
      
      fs.writeFileSync(RATE_FILE_PATH, JSON.stringify({
        rate: newRate,
        lastUpdated: new Date().toISOString()
      }));
      
      console.log(`Updated USD/KES rate to: ${newRate}`);
    } catch (error) {
      console.error('Failed to update exchange rate:', error.message);
    }
  }

// Initialize rate on server start
function initializeExchangeRate() {
  try {
    if (fs.existsSync(RATE_FILE_PATH)) {
      const data = JSON.parse(fs.readFileSync(RATE_FILE_PATH));
      usdToKesRate = data.rate;
      console.log(`Loaded USD/KES rate from cache: ${usdToKesRate}`);
    }
  } catch (error) {
    console.error('Error loading cached rate:', error.message);
  }
  
  // Do initial update
  updateExchangeRate();
}

// Schedule daily updates at 00:00 (midnight)
cron.schedule('0 0 * * *', updateExchangeRate);

// Export functions and rate
module.exports = {
  initializeExchangeRate,
  getCurrentRate: () => usdToKesRate
};