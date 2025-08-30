const express = require('express');
const mongoose = require('mongoose');
const { runCompletePipeline, runQuickPipeline } = require('../lib/pipeline');

const router = express.Router();

/**
 * POST /api/pipeline/run/:identifier
 * Run complete pipeline (all 4 modules) for a specific input parcel
 * identifier can be either ObjectId or parcel name
 */
router.post('/run/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    if (!identifier || identifier.trim() === '') {
      return res.status(400).json({ 
        error: 'Identifier (parcel name or ID) is required' 
      });
    }
    
    // Extract options from request body
    const options = {
      timeWindowHrs: req.body?.timeWindowHrs || 12,
      audience: req.body?.audience || ['people', 'officials']
    };
    
    console.log(`🚀 Starting complete pipeline for: ${identifier}`);
    
    // Run the complete pipeline
    const results = await runCompletePipeline(identifier, options);
    
    // Return appropriate status based on success
    if (results.success) {
      res.status(200).json({
        message: 'Pipeline completed successfully',
        ...results
      });
    } else {
      res.status(422).json({
        message: 'Pipeline completed with errors',
        ...results
      });
    }
    
  } catch (error) {
    console.error('Pipeline endpoint error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/pipeline/quick/:identifier
 * Run quick pipeline and return just the final risk assessment
 * identifier can be either ObjectId or parcel name
 */
router.post('/quick/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    if (!identifier || identifier.trim() === '') {
      return res.status(400).json({ 
        error: 'Identifier (parcel name or ID) is required' 
      });
    }
    
    // Extract options from request body
    const options = {
      timeWindowHrs: req.body?.timeWindowHrs || 12,
      audience: req.body?.audience || ['people', 'officials']
    };
    
    console.log(`⚡ Starting quick pipeline for: ${identifier}`);
    
    // Run the quick pipeline
    const result = await runQuickPipeline(identifier, options);
    
    if (result.success) {
      res.status(200).json({
        message: 'Pipeline completed successfully',
        ...result
      });
    } else {
      res.status(422).json({
        message: 'Pipeline failed',
        ...result
      });
    }
    
  } catch (error) {
    console.error('Quick pipeline endpoint error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/pipeline/status/:identifier
 * Check what modules have been completed for an input
 * identifier can be either ObjectId or parcel name
 */
router.get('/status/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    if (!identifier || identifier.trim() === '') {
      return res.status(400).json({ 
        error: 'Identifier (parcel name or ID) is required' 
      });
    }
    
    const Input = require('../models/Input');
    const Output = require('../models/Output');
    const RiskEvent = require('../models/RiskEvent');
    
    let input;
    
    // Check if identifier is an ObjectId or parcel name
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      input = await Input.findById(identifier);
    } else {
      input = await Input.findOne({ parcelName: identifier });
    }
    
    if (!input) {
      return res.status(404).json({ 
        error: `Input record not found for: ${identifier}` 
      });
    }
    
    // Check Module 1 & 3 (Output exists with mangScore, lostArea, extraCarbon)
    const output = await Output.findOne({ parcelId: input._id });
    const module1Complete = output && output.mangScore != null && output.lostArea != null;
    const module3Complete = output && output.extraCarbon != null;
    
    // Check Module 2 (vulnScore in Output)
    const module2Complete = output && output.vulnScore != null;
    
    // Check Module 4 (RiskEvent exists)
    const riskEvent = await RiskEvent.findOne({ parcelId: input._id.toString() });
    const module4Complete = riskEvent != null;
    
    const status = {
      inputId: input._id,
      parcelName: input.parcelName,
      modules: {
        module1: { complete: module1Complete, name: 'Image Greenness Analysis' },
        module2: { complete: module2Complete, name: 'Vulnerability Assessment' },
        module3: { complete: module3Complete, name: 'CO2e Calculation' },
        module4: { complete: module4Complete, name: 'Risk Assessment' }
      },
      overallComplete: module1Complete && module2Complete && module3Complete && module4Complete,
      canRunPipeline: true,
      lastUpdated: output?.updatedAt || input.updatedAt
    };
    
    res.json(status);
    
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check for Pipeline
router.get('/health', (req, res) => {
  res.json({
    service: 'Pipeline - Complete Coastal Warning System',
    modules: ['Module 1', 'Module 2', 'Module 3', 'Module 4'],
    endpoints: ['/run/:identifier', '/quick/:identifier', '/status/:identifier'],
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
