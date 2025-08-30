const mongoose = require('mongoose');

const inputSchema = new mongoose.Schema({
  parcelName: {
    type: String,
    required: true,
    trim: true
  },
  villageName: {
    type: String,
    required: true,
    trim: true
  },
  areaTotal: {
    type: Number,
    required: true,
    min: 0,
    // Area in hectares
  },
  beforeImgUrl: {
    type: String,
    required: true,
    trim: true
  },
  afterImgUrl: {
    type: String,
    required: true,
    trim: true
  },
  rain: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
    // Normalized rain value (0-1)
  },
  tide: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
    // Normalized tide value (0-1)
  },
  exposure: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    // Exposure score (0-100)
  },
  elevScore: {
    type: Number,
    min: 0,
    max: 100,
    // Elevation score (0-100) - for Module 2
  },
  distScore: {
    type: Number,
    min: 0,
    max: 100,
    // Distance score (0-100) - for Module 2
  },
  landCoverScore: {
    type: Number,
    min: 0,
    max: 100,
    // Land cover score (0-100) - for Module 2
  },
  // Legacy field names for backward compatibility
  ElevScore: {
    type: Number,
    min: 0,
    max: 100
  },
  DistScore: {
    type: Number,
    min: 0,
    max: 100
  },
  LandCoverScore: {
    type: Number,
    min: 0,
    max: 100
  }
}, {
  timestamps: true,
  // Automatically adds createdAt and updatedAt
});

// Index for faster queries
inputSchema.index({ parcelName: 1, villageName: 1 });
inputSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Input', inputSchema);
