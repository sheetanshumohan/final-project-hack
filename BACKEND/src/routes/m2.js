const express = require('express');
const mongoose = require('mongoose');
const Input = require('../models/Input');
const Output = require('../models/Output');

const router = express.Router();

/**
 * POST /api/m2/run/:parcelId
 * Run Module 2 vulnerability assessment for a specific parcel
 */
router.post('/run/:parcelId', async (req, res) => {
  try {
    const { parcelId } = req.params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(parcelId)) {
      return res.status(400).json({ 
        error: 'Invalid parcelId format' 
      });
    }
    
    // Find Input data with Module 2 scores
    const input = await Input.findById(parcelId);
    if (!input) {
      return res.status(404).json({ 
        error: 'Input parcel not found' 
      });
    }
    
    // Check if Module 2 scores exist
    if (!input.elevScore || !input.distScore || !input.landCoverScore) {
      return res.status(400).json({ 
        error: 'Missing Module 2 scores: elevScore, distScore, landCoverScore' 
      });
    }
    
    // Get mangScore from Output (Module 1 result)
    const output = await Output.findOne({ parcelId });
    if (!output || output.mangScore == null) {
      return res.status(409).json({ 
        error: 'Module 1 must run first' 
      });
    }
    
    // Simple calculation
    const vulnScore = Math.round(
      0.3 * input.elevScore +
      0.3 * input.distScore +
      0.2 * input.landCoverScore +
      0.2 * output.mangScore
    );
    
    // Update only vulnScore, preserve other fields
    await Output.findOneAndUpdate(
      { parcelId },
      { vulnScore }, // Direct assignment, not $set
      { upsert: true, new: true }
    );
    
    // Return result
    res.json({
      parcelId,
      vulnScore
    });
    
  } catch (error) {
    console.error('Module 2 error:', error);
    res.status(500).json({ 
      error: 'Internal server error'
    });
  }
});

// Health check for Module 2
router.get('/health', (req, res) => {
  res.json({
    module: 'Module 2 - Vulnerability Assessment',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
