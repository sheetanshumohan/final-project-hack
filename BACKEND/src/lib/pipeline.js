const mongoose = require('mongoose');
const Input = require('../models/Input');
const Output = require('../models/Output');
const RiskEvent = require('../models/RiskEvent');
const { processMangroveTracking } = require('./module1');
const { computeRisk, maybeLLMEnhanceMessages, clamp } = require('./module4');

/**
 * Run all modules sequentially for a given input parcel
 * @param {string} identifier - Either MongoDB ObjectId or parcel name
 * @param {Object} options - Pipeline options
 * @returns {Object} - Complete pipeline results
 */
async function runCompletePipeline(identifier, options = {}) {
  const results = {
    identifier,
    timestamp: new Date().toISOString(),
    modules: {
      module1: null,
      module2: null,
      module3: null, // Note: Module 3 is integrated in Module 1
      module4: null
    },
    errors: [],
    success: false
  };
  
  try {
    let input;
    
    // Check if identifier is an ObjectId or parcel name
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      // Load by ID
      input = await Input.findById(identifier);
    } else {
      // Load by parcel name
      input = await Input.findOne({ parcelName: identifier });
    }
    
    if (!input) {
      throw new Error(`Input record not found for: ${identifier}`);
    }
    
    console.log(`🚀 Starting pipeline for parcel: ${input.parcelName}`);
    
    // ============= MODULE 1: Image Greenness Analysis =============
    console.log('📸 Running Module 1: Image Greenness Analysis...');
    try {
      const module1Result = await processMangroveTracking(input.parcelName);
      results.modules.module1 = {
        success: true,
        data: module1Result
      };
      console.log('✅ Module 1 completed');
    } catch (error) {
      const errorMsg = `Module 1 failed: ${error.message}`;
      results.errors.push(errorMsg);
      results.modules.module1 = { success: false, error: errorMsg };
      console.error('❌ Module 1 failed:', error.message);
      // Don't continue if Module 1 fails as others depend on it
      return results;
    }
    
    // ============= MODULE 2: Vulnerability Assessment =============
    console.log('🏔️ Running Module 2: Vulnerability Assessment...');
    try {
      // Check if Module 2 scores exist in Input
      if (!input.elevScore || !input.distScore || !input.landCoverScore) {
        throw new Error('Missing Module 2 scores: elevScore, distScore, landCoverScore');
      }
      
      // Get mangScore from Output (Module 1 result)
      const output = await Output.findOne({ parcelId: input._id });
      if (!output || output.mangScore == null) {
        throw new Error('Module 1 output not found');
      }
      
      // Calculate vulnerability score
      const vulnScore = Math.round(
        0.3 * input.elevScore +
        0.3 * input.distScore +
        0.2 * input.landCoverScore +
        0.2 * output.mangScore
      );
      
      // Update only vulnScore, preserve other fields
      await Output.findOneAndUpdate(
        { parcelId: input._id },
        { vulnScore }, // Direct assignment, not $set
        { upsert: true, new: true }
      );
      
      results.modules.module2 = {
        success: true,
        data: { parcelId: input._id, vulnScore }
      };
      console.log('✅ Module 2 completed - vulnScore:', vulnScore);
    } catch (error) {
      const errorMsg = `Module 2 failed: ${error.message}`;
      results.errors.push(errorMsg);
      results.modules.module2 = { success: false, error: errorMsg };
      console.error('❌ Module 2 failed:', error.message);
      // Continue to Module 4 even if Module 2 fails (with default vulnScore)
    }
    
    // ============= MODULE 3: CO2e Calculation =============
    // Module 3 is already integrated in Module 1 (extraCarbon calculation)
    results.modules.module3 = {
      success: true,
      data: { 
        note: 'Module 3 (CO2e calculation) is integrated in Module 1',
        extraCarbon: results.modules.module1.data.extraCarbon
      }
    };
    console.log('✅ Module 3 completed (integrated in Module 1)');
    
    // ============= MODULE 4: Real-time Risk Assessment =============
    console.log('⚠️ Running Module 4: Real-time Risk Assessment...');
    try {
      // Get updated output data
      const output = await Output.findOne({ parcelId: input._id });
      if (!output) {
        throw new Error('Output data not found for risk assessment');
      }
      
      // Extract and clamp input values with legacy fallbacks
      // Convert rain/tide from 0-1 to 0-100 scale
      const rain01 = clamp((input.rain ?? input.Rain) * 100);
      const tide01 = clamp((input.tide ?? input.Tide) * 100);
      const exposure = clamp(input.exposure ?? input.Exposure);
      const vulnScore = clamp(output.vulnScore || 50); // Use default if Module 2 failed
      
      // Compute risk score, band, and deterministic why
      const { riskScore, band, why } = computeRisk({
        rain01,
        tide01,
        vulnScore,
        exposure
      });
      
      // Get time window from options or default to 12 hours
      const timeWindowHrs = Number(options.timeWindowHrs) || 12;
      
      // Get audience from options or use default
      const audience = options.audience || ['people', 'officials'];
      
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
      
      results.modules.module4 = {
        success: true,
        data: savedEvent.toObject()
      };
      console.log('✅ Module 4 completed - Risk:', riskScore, 'Band:', band);
    } catch (error) {
      const errorMsg = `Module 4 failed: ${error.message}`;
      results.errors.push(errorMsg);
      results.modules.module4 = { success: false, error: errorMsg };
      console.error('❌ Module 4 failed:', error.message);
    }
    
    // ============= PIPELINE COMPLETION =============
    const successfulModules = Object.values(results.modules).filter(m => m.success).length;
    results.success = successfulModules >= 2; // Consider success if at least 2 modules completed
    
    console.log(`🎉 Pipeline completed! ${successfulModules}/4 modules successful`);
    
    return results;
    
  } catch (error) {
    console.error('❌ Pipeline failed:', error.message);
    results.errors.push(error.message);
    return results;
  }
}

/**
 * Quick pipeline run that just returns the final risk assessment
 * @param {string} identifier - Either MongoDB ObjectId or parcel name
 * @param {Object} options - Pipeline options
 * @returns {Object} - Final risk event or error
 */
async function runQuickPipeline(identifier, options = {}) {
  const fullResults = await runCompletePipeline(identifier, options);
  
  if (fullResults.success && fullResults.modules.module4?.success) {
    return {
      success: true,
      riskEvent: fullResults.modules.module4.data,
      summary: {
        modulesCompleted: Object.values(fullResults.modules).filter(m => m.success).length,
        errors: fullResults.errors
      }
    };
  } else {
    return {
      success: false,
      errors: fullResults.errors,
      modules: fullResults.modules
    };
  }
}

module.exports = {
  runCompletePipeline,
  runQuickPipeline
};
