require('dotenv').config();

module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 4000,
  
  // Database Configuration
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/coastal',
  
  // Application Constants
  CARBON_PER_HA: parseInt(process.env.CARBON_PER_HA) || 10,
  
  // OpenAI Configuration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  
  // Thresholds and Constants
  GREENNESS_THRESHOLD: 25, // 25% greenness drop threshold
  VULNERABILITY_BANDS: {
    LOW: { min: 0, max: 33, color: 'green' },
    MEDIUM: { min: 34, max: 66, color: 'yellow' },
    HIGH: { min: 67, max: 100, color: 'red' }
  },
  
  // Risk Scoring Weights
  RISK_WEIGHTS: {
    RAIN: 0.3,
    TIDE: 0.3,
    VULNERABILITY: 0.4
  }
};
