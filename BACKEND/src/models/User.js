const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  language: {
    type: String,
    enum: ['en', 'hi', 'gu'],
    default: 'en'
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['fisher', 'ngo', 'official'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster lookups
userSchema.index({ userId: 1 });

module.exports = mongoose.model('User', userSchema);
