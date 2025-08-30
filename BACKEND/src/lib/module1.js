const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');
const Input = require('../models/Input');
const Output = require('../models/Output');

// Connect to MongoDB once, reuse connection
async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return; // Already connected
  }
  
  try {
    await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
}

// Fetch Input document by parcel name with fallback
async function fetchInputDataByName(parcelName) {
  try {
    // Try preferred field first
    let record = await Input.findOne({ parcelName });
    
    // Fallback to legacy name field if not found
    if (!record) {
      record = await Input.findOne({ name: parcelName });
    }
    
    return record;
  } catch (error) {
    throw new Error(`Failed to fetch input data: ${error.message}`);
  }
}

// Resolve image paths from database fields
function resolveImagePaths(record) {
  // Get before image path
  let beforePath = record.beforeImgUrl || record.before_Images_URL;
  let afterPath = record.afterImgUrl || record.after_Images_URL;
  
  // Resolve relative paths
  if (beforePath && !path.isAbsolute(beforePath)) {
    beforePath = path.join(__dirname, '../uploads', beforePath);
  }
  
  if (afterPath && !path.isAbsolute(afterPath)) {
    afterPath = path.join(__dirname, '../uploads', afterPath);
  }
  
  return { beforePath, afterPath };
}

// Get area value with fallback
function getAreaValue(record) {
  return record.areaTotal || record.areaHa || 0;
}

// Initialize OpenAI client only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Convert image to base64
function imageToBase64(imagePath) {
  try {
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }
    const imageBuffer = fs.readFileSync(imagePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    throw new Error(`Failed to read image ${imagePath}: ${error.message}`);
  }
}

// Real LLM analysis using GPT-4o with vision
async function performLLMAnalysis(beforePath, afterPath) {
  try {
    // Check if OpenAI is available
    if (!openai) {
      throw new Error('OpenAI API key not configured');
    }
    
    // Convert images to base64
    const beforeBase64 = imageToBase64(beforePath);
    const afterBase64 = imageToBase64(afterPath);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using latest GPT-4o model with vision capabilities
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are analyzing satellite images for mangrove loss detection.
              
Please analyze these BEFORE and AFTER images and provide:
1. Do you see mangrove/seagrass loss between these images? (yes/no)
2. Confidence level: Low/Medium/High
3. Describe the change in one line
4. Based on your visual analysis, what MangScore (0-1) would you assign? (where 0 = complete loss, 1 = no loss)

BEFORE IMAGE (first image):
AFTER IMAGE (second image):

Respond in this exact JSON format:
{
  "loss": "yes" or "no",
  "confidence": "Low", "Medium", or "High",
  "summary": "your one-line description",
  "aiMangScore": your_score_as_number
}`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${beforeBase64}`,
                detail: "high"
              }
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${afterBase64}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.1
    });

    // Parse the response
    const responseText = response.choices[0].message.content.trim();
    
    // Try to extract JSON from the response
    let analysisResult;
    try {
      // Look for JSON in the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      // If JSON parsing fails, create a structured response
      analysisResult = {
        loss: responseText.toLowerCase().includes('yes') ? 'yes' : 'no',
        confidence: 'Medium',
        summary: responseText.substring(0, 100),
        aiMangScore: 0.5
      };
    }
    
    // Normalize the response to match our schema
    const verdict = analysisResult.loss === 'yes' ? 'Loss' : 'NoLoss';
    const analysis = `Confidence: ${analysisResult.confidence}. ${analysisResult.summary}`;
    const aiMangScore = Math.max(0, Math.min(1, analysisResult.aiMangScore || 0.5));
    
    return {
      verdict,
      analysis,
      aiMangScore,
      rawResponse: analysisResult
    };
    
  } catch (error) {
    // Fallback on error
    console.error('LLM Analysis error:', error.message);
    return {
      verdict: 'NoLoss',
      analysis: `Error in LLM analysis: ${error.message}`,
      aiMangScore: 0.5,
      rawResponse: null
    };
  }
}

// Mock greenness calculation (replace with actual implementation)
function calculateGreennessDropPct(beforePath, afterPath) {
  // This is a placeholder - replace with your actual image processing logic
  return Math.floor(Math.random() * 50); // Random 0-50% for testing
}

// Main processing function
async function processMangroveTracking(parcelName) {
  try {
    // Connect to database
    await connectDB();
    
    // Fetch input data
    const record = await fetchInputDataByName(parcelName);
    if (!record) {
      throw new Error(`No input data found for parcel: ${parcelName}`);
    }
    
    // Resolve image paths
    const { beforePath, afterPath } = resolveImagePaths(record);
    
    // Get area value
    const areaTotal = getAreaValue(record);
    
    // Calculate greenness drop percentage
    const dropPct = calculateGreennessDropPct(beforePath, afterPath);
    
    // Get LLM analysis using GPT-4o
    const llmResult = await performLLMAnalysis(beforePath, afterPath);
    
    // Determine state: LLM verdict takes priority, then dropPct threshold
    let state;
    if (llmResult.verdict === 'Loss') {
      state = 'Loss';
    } else if (dropPct >= 25) {
      state = 'Loss';
    } else {
      state = 'NoLoss';
    }
    
    // Calculate lost area in hectares
    const lostAreaPct = state === 'Loss' ? dropPct : 0;
    const lostArea = (lostAreaPct / 100) * areaTotal;
    
    // Convert AI score from 0-1 to 0-100 scale
    const aiScoreNormalized = llmResult.aiMangScore * 100; // Convert 0-1 to 0-100
    const mangScore = aiScoreNormalized || Math.max(0, 100 - dropPct);
    
    // Convert LLM analysis to string if needed
    const llmAnalysis = typeof llmResult.analysis === 'string' 
      ? llmResult.analysis 
      : JSON.stringify(llmResult.analysis);
    
    // Calculate extraCarbon (CO2e) - Module 3 logic
    const carbonPerHa = 10; // From config, tons CO2e per hectare
    const extraCarbon = lostArea * carbonPerHa;
    
    // Set needsReview flag if confidence is low
    const needsReview = llmResult.rawResponse?.confidence === 'Low';
    
    // Prepare Module 1 specific fields (don't overwrite Module 2 data)
    const module1Fields = {
      mangScore: Math.round(mangScore),
      lostArea: Math.round(lostArea * 100) / 100, // Round to 2 decimals
      llmAnalysis,
      state,
      extraCarbon: Math.round(extraCarbon * 100) / 100, // Round to 2 decimals
      dropPct: Math.round(dropPct),
      needsReview
    };
    
    // Check if Output document exists
    const existingOutput = await Output.findOne({ parcelId: record._id });
    
    let outputData;
    if (existingOutput) {
      // Update only Module 1 fields, preserve existing vulnScore and other data
      outputData = await Output.findOneAndUpdate(
        { parcelId: record._id },
        { 
          ...module1Fields,
          // Preserve existing vulnScore if it exists, otherwise set default
          ...(existingOutput.vulnScore == null && { vulnScore: 50 })
        },
        { new: true }
      );
    } else {
      // Create new document with Module 1 fields and default vulnScore
      outputData = await Output.create({
        parcelId: record._id,
        ...module1Fields,
        vulnScore: 50 // Default vulnerability score
      });
    }
    
    console.log('✅ Module 1 output saved to database:', outputData._id);
    
    // Return the complete saved output data
    return outputData.toObject();
    
  } catch (error) {
    throw new Error(`Module 1 processing failed: ${error.message}`);
  }
}

module.exports = {
  processMangroveTracking,
  fetchInputDataByName,
  connectDB,
  performLLMAnalysis,
  calculateGreennessDropPct
};
