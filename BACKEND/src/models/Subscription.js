const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    trim: true
  },
  parcelId: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  channels: {
    type: [String],
    default: ['inapp'],
    enum: ['inapp', 'sms', 'push']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for user + parcel lookups
subscriptionSchema.index({ userId: 1, parcelId: 1 }, { unique: true });
subscriptionSchema.index({ parcelId: 1, isActive: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
