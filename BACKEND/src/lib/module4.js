const OpenAI = require('openai');

// Clamp utility function
const clamp = (value) => Math.max(0, Math.min(100, Number(value) || 0));

// Risk scoring weights (sum = 1.0)
const WEIGHTS = {
  rain: 0.35,
  tide: 0.30,
  vuln: 0.25,
  exposure: 0.10
};

/**
 * Compute risk score and band from input factors
 * @param {Object} factors - { rain01, tide01, vulnScore, exposure }
 * @returns {Object} - { riskScore, band, why }
 */
function computeRisk({ rain01, tide01, vulnScore, exposure }) {
  // Clamp all inputs to 0-100 range
  const rain = clamp(rain01);
  const tide = clamp(tide01);
  const vuln = clamp(vulnScore);
  const exp = clamp(exposure);
  
  // Calculate weighted risk score
  const riskScore = Math.round(
    WEIGHTS.rain * rain +
    WEIGHTS.tide * tide +
    WEIGHTS.vuln * vuln +
    WEIGHTS.exposure * exp
  );
  
  // Determine band (title-case for storage)
  const band = riskScore < 40 ? 'Green' : (riskScore < 70 ? 'Yellow' : 'Red');
  
  // Generate deterministic "why" explanation
  const drivers = [];
  if (rain >= 60) drivers.push('heavy rain');
  if (tide >= 60) drivers.push('high tide');
  if (vuln >= 60) drivers.push('high vulnerability');
  if (exp >= 60) drivers.push('dense population');
  
  const why = drivers.length > 0 ? drivers.join(' + ') : 'moderate combined factors';
  
  return { riskScore, band, why };
}

/**
 * Generate deterministic messages for SMS and dashboard
 * @param {Object} context - { location, riskScore, band, why, timeWindowHrs }
 * @returns {Object} - { smsShort, dashboard }
 */
function generateMessages({ location, riskScore, band, why, timeWindowHrs }) {
  const emoji = band === 'Red' ? '🔴' : (band === 'Yellow' ? '🟡' : '🟢');
  const bandUpper = band.toUpperCase();
  
  const smsShort = `${emoji} ${band} risk at ${location} next ${timeWindowHrs}h: ${why}. Stay safe.`;
  const dashboard = `${bandUpper}: Risk ${riskScore}/100 for ${location} (${timeWindowHrs}h). Reason: ${why}.`;
  
  return { smsShort, dashboard };
}

/**
 * Optionally enhance messages using LLM if OpenAI API key is available
 * @param {Object} context - { location, riskScore, band, why, timeWindowHrs, rain01, tide01, vulnScore, exposure }
 * @returns {Object} - Enhanced or fallback { smsShort, dashboard, why }
 */
async function maybeLLMEnhanceMessages(context) {
  // Check if OpenAI API key is available
  if (!process.env.OPENAI_API_KEY) {
    // Use deterministic fallback
    const messages = generateMessages(context);
    return {
      why: context.why,
      smsShort: messages.smsShort,
      dashboard: messages.dashboard
    };
  }
  
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    const { location, riskScore, band, timeWindowHrs, rain01, tide01, vulnScore, exposure } = context;
    
    const prompt = `Given these coastal risk factors for ${location}:
- Rain: ${rain01}/100
- Tide: ${tide01}/100  
- Vulnerability: ${vulnScore}/100
- Exposure: ${exposure}/100
- Risk Score: ${riskScore}/100 (${band})
- Time Window: ${timeWindowHrs} hours

Generate a crisp one-line reason and two messages. Keep factual, non-alarmist, SMS max 160 chars.

Respond in this exact JSON format:
{
  "why": "brief reason phrase",
  "smsShort": "SMS message under 160 chars",
  "dashboard": "dashboard message"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.1
    });
    
    const responseText = response.choices[0].message.content.trim();
    
    // Try to parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const llmResult = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (llmResult.why && llmResult.smsShort && llmResult.dashboard) {
        return {
          why: llmResult.why,
          smsShort: llmResult.smsShort,
          dashboard: llmResult.dashboard
        };
      }
    }
    
    // Fall back to deterministic if LLM response is invalid
    throw new Error('Invalid LLM response format');
    
  } catch (error) {
    console.warn('LLM enhancement failed, using fallback:', error.message);
    
    // Use deterministic fallback
    const messages = generateMessages(context);
    return {
      why: context.why,
      smsShort: messages.smsShort,
      dashboard: messages.dashboard
    };
  }
}

module.exports = {
  computeRisk,
  generateMessages,
  maybeLLMEnhanceMessages,
  clamp,
  WEIGHTS
};
