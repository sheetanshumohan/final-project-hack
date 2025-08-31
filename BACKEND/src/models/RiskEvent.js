const mongoose = require('mongoose');

const riskEventSchema = new mongoose.Schema({
  sourceComputationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Output',
    required: false // Optional for user alerts
  },
  parcelId: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  riskScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  band: {
    type: String,
    enum: ['Green', 'Yellow', 'Red'],
    required: true
  },
  why: {
    type: String,
    required: true
  },
  timeWindowHrs: {
    type: Number,
    default: 12
  },
  audience: {
    type: [String],
    default: ['people', 'officials']
  },
  messages: {
    smsShort: {
      type: String,
      required: true
    },
    dashboard: {
      type: String,
      required: true
    }
  },
  generatedAt: {
    type: Date,
    default: () => new Date()
  },
  // Optional fields for user-specific alerts
  userId: {
    type: String,
    required: false // Only present for user alerts, not original risk events
  },
  userLanguage: {
    type: String,
    enum: ['en', 'hi', 'gu'],
    required: false
  }
}, {
  timestamps: false // We use generatedAt instead
});

// Index for faster queries
riskEventSchema.index({ parcelId: 1, generatedAt: -1 });
riskEventSchema.index({ userId: 1, generatedAt: -1 }); // For user alert inbox

module.exports = mongoose.model('RiskEvent', riskEventSchema);
