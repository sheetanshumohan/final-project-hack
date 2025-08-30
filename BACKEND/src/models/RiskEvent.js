const mongoose = require('mongoose');

const riskEventSchema = new mongoose.Schema({
  sourceComputationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Output',
    required: true
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
  }
}, {
  timestamps: false // We use generatedAt instead
});

// Index for faster queries
riskEventSchema.index({ parcelId: 1, generatedAt: -1 });

module.exports = mongoose.model('RiskEvent', riskEventSchema);
