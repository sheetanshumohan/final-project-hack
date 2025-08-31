const express = require('express');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Input = require('../models/Input');

const router = express.Router();

/**
 * POST /api/auth/signin
 * Simple sign-in: create/find user and set session
 */
router.post('/signin', async (req, res) => {
  try {
    const { name, email, language = 'en', phone, role } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Generate simple userId from name (in production, use proper auth)
    const userId = name.toLowerCase().replace(/\s+/g, '_');

    // Create or update user
    const user = await User.findOneAndUpdate(
      { userId },
      { name: name.trim(), email: email.trim().toLowerCase(), language, phone, role },
      { upsert: true, new: true }
    );

    // Set simple session cookie (no OTP in MVP)
    res.cookie('userId', userId, { 
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true 
    });

    res.json({
      success: true,
      user: {
        userId: user.userId,
        name: user.name,
        language: user.language,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/subscribe
 * Subscribe user to villages/parcels
 */
router.post('/subscribe', async (req, res) => {
  try {
    const { userId, parcels } = req.body;

    if (!userId || !parcels || !Array.isArray(parcels)) {
      return res.status(400).json({ error: 'userId and parcels array required' });
    }

    // Verify user exists
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const subscriptions = [];
    
    for (const parcelName of parcels) {
      // Find the parcel to get its details
      const input = await Input.findOne({ parcelName });
      if (!input) {
        console.warn(`Parcel not found: ${parcelName}`);
        continue;
      }

      // Upsert subscription
      const subscription = await Subscription.findOneAndUpdate(
        { userId, parcelId: input._id.toString() },
        { 
          location: input.villageName || parcelName,
          channels: ['inapp'],
          isActive: true
        },
        { upsert: true, new: true }
      );

      subscriptions.push({
        parcelId: subscription.parcelId,
        parcelName,
        location: subscription.location,
        isActive: subscription.isActive
      });
    }

    res.json({
      success: true,
      subscriptions
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/auth/subscriptions/:userId
 * Get user's current subscriptions
 */
router.get('/subscriptions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const subscriptions = await Subscription.find({ userId });
    
    // Enrich with parcel names
    const enriched = [];
    for (const sub of subscriptions) {
      const input = await Input.findById(sub.parcelId);
      enriched.push({
        parcelId: sub.parcelId,
        parcelName: input?.parcelName || 'Unknown',
        location: sub.location,
        isActive: sub.isActive,
        channels: sub.channels,
        createdAt: sub.createdAt
      });
    }

    res.json({ subscriptions: enriched });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/auth/subscription/:userId/:parcelId/toggle
 * Toggle subscription active status
 */
router.put('/subscription/:userId/:parcelId/toggle', async (req, res) => {
  try {
    const { userId, parcelId } = req.params;

    const subscription = await Subscription.findOne({ userId, parcelId });
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    subscription.isActive = !subscription.isActive;
    await subscription.save();

    res.json({
      success: true,
      subscription: {
        parcelId: subscription.parcelId,
        location: subscription.location,
        isActive: subscription.isActive
      }
    });
  } catch (error) {
    console.error('Toggle subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/auth/available-parcels
 * Get list of available parcels for subscription
 */
router.get('/available-parcels', async (req, res) => {
  try {
    const parcels = await Input.find({}, 'parcelName villageName areaTotal').sort({ parcelName: 1 });
    
    res.json({
      parcels: parcels.map(p => ({
        parcelName: p.parcelName,
        villageName: p.villageName,
        areaTotal: p.areaTotal
      }))
    });
  } catch (error) {
    console.error('Get available parcels error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
