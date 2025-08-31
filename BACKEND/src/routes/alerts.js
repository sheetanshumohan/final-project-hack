const express = require('express');
const { processRecentRiskEvents, getUserAlerts } = require('../lib/alertGenerator');

const router = express.Router();

/**
 * POST /api/alerts/process
 * Process recent risk events and generate user alerts
 * Called manually or by scheduler
 */
router.post('/process', async (req, res) => {
  try {
    const result = await processRecentRiskEvents();
    
    res.json({
      success: true,
      message: `Processed ${result.processed} risk events, generated ${result.generated} user alerts`,
      ...result
    });
  } catch (error) {
    console.error('Process alerts error:', error);
    res.status(500).json({ error: 'Failed to process alerts' });
  }
});

/**
 * GET /api/alerts/inbox/:userId
 * Get user's alert inbox
 */
router.get('/inbox/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const alerts = await getUserAlerts(userId, limit);
    
    res.json({
      success: true,
      alerts,
      count: alerts.length
    });
  } catch (error) {
    console.error('Get inbox error:', error);
    res.status(500).json({ error: 'Failed to get alerts' });
  }
});

/**
 * GET /api/alerts/stats/:userId
 * Get alert statistics for user
 */
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const alerts = await getUserAlerts(userId, 100);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const stats = {
      total: alerts.length,
      today: alerts.filter(a => new Date(a.generatedAt) >= today).length,
      byBand: {
        red: alerts.filter(a => a.band === 'Red').length,
        yellow: alerts.filter(a => a.band === 'Yellow').length,
        green: alerts.filter(a => a.band === 'Green').length
      },
      latest: alerts[0] || null
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

module.exports = router;
