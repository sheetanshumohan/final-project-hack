const express = require('express');
const mongoose = require('mongoose');
const Input = require('../models/Input');
const Output = require('../models/Output');
const RiskEvent = require('../models/RiskEvent');
const { computeRisk, maybeLLMEnhanceMessages, clamp } = require('../lib/module4');

const router = express.Router();

/**
 * POST /api/m4/run/:inputId
 * Run Module 4 real-time risk assessment for a specific input parcel
 */
router.post('/run/:inputId', async (req, res) => {
  try {
    const { inputId } = req.params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(inputId)) {
      return res.status(400).json({ 
        error: 'Invalid inputId format' 
      });
    }
    
    // Load Input document
    const input = await Input.findById(inputId);
    if (!input) {
      return res.status(404).json({ 
        error: 'Input record not found' 
      });
    }
    
    // Load Output document to get vulnScore
    const output = await Output.findOne({ parcelId: input._id });
    if (!output || output.vulnScore == null) {
      return res.status(409).json({ 
        error: 'Module 2 must run first' 
      });
    }
    
    // Extract and clamp input values with legacy fallbacks
    // Note: rain and tide are stored as 0-1, convert to 0-100 scale
    const rain01 = clamp((input.rain ?? input.Rain) * 100);
    const tide01 = clamp((input.tide ?? input.Tide) * 100);
    const exposure = clamp(input.exposure ?? input.Exposure);
    const vulnScore = clamp(output.vulnScore);
    
    // Compute risk score, band, and deterministic why
    const { riskScore, band, why } = computeRisk({
      rain01,
      tide01,
      vulnScore,
      exposure
    });
    
    // Get time window from request body or default to 12 hours
    const timeWindowHrs = Number(req.body?.timeWindowHrs) || 12;
    
    // Get audience from request body or use default
    const audience = req.body?.audience || ['people', 'officials'];
    
    // Get location with fallbacks
    const location = input.villageName ?? input.VillageName ?? input.parcelName;
    
    // Build context for message generation
    const context = {
      location,
      riskScore,
      band,
      why,
      timeWindowHrs,
      rain01,
      tide01,
      vulnScore,
      exposure
    };
    
    // Generate messages (with optional LLM enhancement)
    const enhancedMessages = await maybeLLMEnhanceMessages(context);
    
    // Create RiskEvent document
    const riskEventData = {
      sourceComputationId: output._id,
      parcelId: input._id.toString(),
      location,
      riskScore,
      band,
      why: enhancedMessages.why,
      timeWindowHrs,
      audience,
      messages: {
        smsShort: enhancedMessages.smsShort,
        dashboard: enhancedMessages.dashboard
      },
      generatedAt: new Date()
    };
    
    // Save to RiskEvent collection
    const riskEvent = new RiskEvent(riskEventData);
    const savedEvent = await riskEvent.save();
    
    // Return the saved document
    res.status(200).json(savedEvent.toObject());
    
  } catch (error) {
    console.error('Module 4 error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check for Module 4
router.get('/health', (req, res) => {
  res.json({
    module: 'Module 4 - Real-time Risk Assessment',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
