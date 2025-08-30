const express = require('express');
const mongoose = require('mongoose');
const { processMangroveTracking } = require('../lib/module1');

const router = express.Router();

/**
 * POST /api/m1/run/:parcelName
 * Run Module 1 image greenness analysis for a specific parcel
 */
router.post('/run/:parcelName', async (req, res) => {
  try {
    const { parcelName } = req.params;
    
    if (!parcelName || parcelName.trim() === '') {
      return res.status(400).json({ 
        error: 'parcelName is required' 
      });
    }
    
    // Run Module 1 processing
    const result = await processMangroveTracking(parcelName);
    
    // Return the result
    res.status(200).json(result);
    
  } catch (error) {
    console.error('Module 1 error:', error);
    
    if (error.message.includes('No input data found')) {
      return res.status(404).json({ 
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/m1/run-by-id/:inputId
 * Run Module 1 by Input document ID
 */
router.post('/run-by-id/:inputId', async (req, res) => {
  try {
    const { inputId } = req.params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(inputId)) {
      return res.status(400).json({ 
        error: 'Invalid inputId format' 
      });
    }
    
    const Input = require('../models/Input');
    const input = await Input.findById(inputId);
    
    if (!input) {
      return res.status(404).json({ 
        error: 'Input record not found' 
      });
    }
    
    // Run Module 1 processing using parcelName
    const result = await processMangroveTracking(input.parcelName);
    
    // Return the result
    res.status(200).json(result);
    
  } catch (error) {
    console.error('Module 1 error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check for Module 1
router.get('/health', (req, res) => {
  res.json({
    module: 'Module 1 - Image Greenness Analysis',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
