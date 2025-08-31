const RiskEvent = require('../models/RiskEvent');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Input = require('../models/Input');
const { generateSMSMessage, generateDashboardMessage } = require('./i18n');
const { sendHighRiskAlert } = require('./emailService');

const SIMULATION_MODE = process.env.SIMULATION === 'true';
const COOLDOWN_HOURS = 0; // Disabled for testing
const MAX_ALERTS_PER_DAY = 999; // Increased for testing

/**
 * Check if alert should be throttled
 * @param {string} parcelId - Parcel ID
 * @param {string} band - Risk band
 * @returns {boolean} True if should throttle
 */
async function shouldThrottleAlert(parcelId, band) {
  const cooldownTime = new Date(Date.now() - COOLDOWN_HOURS * 60 * 60 * 1000);
  
  const recentAlert = await RiskEvent.findOne({
    parcelId,
    band,
    generatedAt: { $gte: cooldownTime }
  });

  return !!recentAlert;
}

/**
 * Check daily alert cap for user
 * @param {string} userId - User ID
 * @returns {boolean} True if cap exceeded
 */
async function hasExceededDailyCap(userId) {
  // Get user's subscribed parcels
  const subscriptions = await Subscription.find({ userId, isActive: true });
  const parcelIds = subscriptions.map(s => s.parcelId);

  if (parcelIds.length === 0) return false;

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);

  const todayAlerts = await RiskEvent.countDocuments({
    parcelId: { $in: parcelIds },
    generatedAt: { $gte: dayStart },
    'audience': 'people' // Only count user-facing alerts
  });

  return todayAlerts >= MAX_ALERTS_PER_DAY;
}

/**
 * Generate alerts for a risk event
 * @param {Object} riskEvent - Risk event data
 * @param {string} riskEvent.parcelId - Parcel ID
 * @param {string} riskEvent.location - Village name
 * @param {number} riskEvent.riskScore - Risk score 0-100
 * @param {string} riskEvent.band - Risk band (Green/Yellow/Red)
 * @param {string} riskEvent.why - Risk reason
 * @param {number} riskEvent.timeWindowHrs - Time window
 * @returns {Array} Array of generated alerts
 */
async function generateAlertsForRisk(riskEvent) {
  const { parcelId, location, riskScore, band, why, timeWindowHrs = 12 } = riskEvent;

  // Only generate alerts for Yellow/Red risks
  if (band === 'Green') {
    return [];
  }

  // Check throttling
  if (await shouldThrottleAlert(parcelId, band)) {
    console.log(`Alert throttled for parcel ${parcelId}, band ${band}`);
    return [];
  }

  // Find active subscriptions for this parcel
  const subscriptions = await Subscription.find({ 
    parcelId: parcelId.toString(), 
    isActive: true 
  });

  if (subscriptions.length === 0) {
    console.log(`No active subscriptions for parcel ${parcelId}`);
    return [];
  }

  const alerts = [];

  for (const subscription of subscriptions) {
    // Check daily cap for user
    if (await hasExceededDailyCap(subscription.userId)) {
      console.log(`Daily cap exceeded for user ${subscription.userId}`);
      continue;
    }

    // Get user details for language
    const user = await User.findOne({ userId: subscription.userId });
    if (!user) {
      console.warn(`User not found: ${subscription.userId}`);
      continue;
    }

    // Generate localized messages
    const smsShort = generateSMSMessage(
      user.language, 
      band, 
      location, 
      timeWindowHrs, 
      why, 
      SIMULATION_MODE
    );

    const dashboard = generateDashboardMessage(
      band, 
      riskScore, 
      location, 
      timeWindowHrs, 
      why
    );

    // Create alert document (reusing existing RiskEvent schema)
    const alertData = {
      sourceComputationId: null, // Will be set if we have the source
      parcelId: parcelId.toString(),
      location,
      riskScore,
      band,
      why,
      timeWindowHrs,
      audience: ['people'],
      messages: {
        smsShort,
        dashboard
      },
      generatedAt: new Date(),
      // Additional fields for user alerts
      userId: subscription.userId,
      userLanguage: user.language
    };

    const alert = new RiskEvent(alertData);
    await alert.save();

    // Send email for high-risk alerts (Red band only)
    if (band === 'Red' && user.email) {
      try {
        const emailResult = await sendHighRiskAlert(user, {
          location,
          riskScore,
          band,
          why,
          timeWindowHrs
        });
        
        if (emailResult.success) {
          console.log(`📧 High-risk email sent to ${user.email} for ${location}`);
        } else {
          console.warn(`⚠️ Failed to send email to ${user.email}:`, emailResult.error);
        }
      } catch (emailError) {
        console.error(`❌ Email error for ${user.email}:`, emailError.message);
        // Don't fail the alert generation if email fails
      }
    }

    alerts.push({
      alertId: alert._id,
      userId: subscription.userId,
      parcelId,
      location,
      band,
      riskScore,
      smsShort,
      dashboard,
      language: user.language
    });
  }

  return alerts;
}

/**
 * Process alerts for all recent risk events
 * Called when Module 4 completes or on schedule
 */
async function processRecentRiskEvents() {
  try {
    // Get recent risk events (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const recentRisks = await RiskEvent.find({
      generatedAt: { $gte: oneHourAgo },
      userId: { $exists: false } // Only original risk computations, not user alerts
    }).sort({ generatedAt: -1 });

    let totalAlerts = 0;

    for (const risk of recentRisks) {
      const alerts = await generateAlertsForRisk({
        parcelId: risk.parcelId,
        location: risk.location,
        riskScore: risk.riskScore,
        band: risk.band,
        why: risk.why,
        timeWindowHrs: risk.timeWindowHrs
      });

      totalAlerts += alerts.length;
    }

    console.log(`Processed ${recentRisks.length} risk events, generated ${totalAlerts} user alerts`);
    return { processed: recentRisks.length, generated: totalAlerts };
  } catch (error) {
    console.error('Error processing risk events:', error);
    throw error;
  }
}

/**
 * Get user's alerts (inbox)
 * @param {string} userId - User ID
 * @param {number} limit - Max alerts to return
 * @returns {Array} User's alerts
 */
async function getUserAlerts(userId, limit = 50) {
  try {
    // Get user's subscribed locations
    const subscriptions = await Subscription.find({ userId, isActive: true });
    const subscribedLocations = subscriptions.map(s => s.location);

    if (subscribedLocations.length === 0) {
      return [];
    }

    // Get alerts for user's subscribed locations only
    const alerts = await RiskEvent.find({
      location: { $in: subscribedLocations }
    })
    .sort({ generatedAt: -1 })
    .limit(limit);

    return alerts.map(alert => ({
      id: alert._id,
      parcelId: alert.parcelId,
      location: alert.location,
      riskScore: alert.riskScore,
      band: alert.band,
      why: alert.why,
      timeWindowHrs: alert.timeWindowHrs,
      smsShort: alert.messages?.smsShort || '',
      dashboard: alert.messages?.dashboard || '',
      generatedAt: alert.generatedAt,
      isUserAlert: !!alert.userId
    }));
  } catch (error) {
    console.error('Error getting user alerts:', error);
    throw error;
  }
}

module.exports = {
  generateAlertsForRisk,
  processRecentRiskEvents,
  getUserAlerts,
  shouldThrottleAlert,
  hasExceededDailyCap
};
