const mongoose = require('mongoose');

const outputSchema = new mongoose.Schema({
  parcelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Input',
    required: true
  },
  mangScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    // Mangrove health score (0-100)
  },
  lostArea: {
    type: Number,
    required: true,
    min: 0,
    // Lost area in hectares
  },
  llmAnalysis: {
    type: String,
    required: true,
    trim: true,
    // LLM analysis result text
  },
  state: {
    type: String,
    required: true,
    enum: ['Loss', 'NoLoss'],
    // Classification state
  },
  vulnScore: {
    type: Number,
    required: false, // Will be set by Module 2
    min: 0,
    max: 100,
    default: 50,
    // Vulnerability score (0-100)
  },
  extraCarbon: {
    type: Number,
    required: false, // Will be calculated by Module 3
    min: 0,
    default: 0,
    // Extra carbon released (CO2e in tons)
  },
  
  // Additional computed fields for comprehensive tracking
  dropPct: {
    type: Number,
    min: 0,
    max: 100,
    // Greenness drop percentage
  },
  needsReview: {
    type: Boolean,
    default: false,
    // Flag for manual review
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    // Real-time risk score from Module 4
  },
  riskBand: {
    type: String,
    enum: ['green', 'yellow', 'red'],
    // Risk classification band
  }
}, {
  timestamps: true,
  // Automatically adds createdAt and updatedAt
});

// Index for faster queries
outputSchema.index({ parcelId: 1 });
outputSchema.index({ state: 1 });
outputSchema.index({ vulnScore: -1 });
outputSchema.index({ createdAt: -1 });

// Virtual for populated parcel data
outputSchema.virtual('parcelData', {
  ref: 'Input',
  localField: 'parcelId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
outputSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Output', outputSchema);
