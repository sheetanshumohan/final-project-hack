// Simple i18n message templates for EN/HI/GU
const messages = {
  en: {
    riskHigh: 'High risk at {village} next {hours}h: {why}.',
    riskMedium: 'Medium risk at {village} next {hours}h: {why}.',
    staySafe: 'Stay safe. Avoid shore.'
  },
  hi: {
    riskHigh: '{village} में अगले {hours} घंटे में उच्च जोखिम: {why}.',
    riskMedium: '{village} में अगले {hours} घंटे में मध्यम जोखिम: {why}.',
    staySafe: 'सुरक्षित रहें। तट से दूर रहें।'
  },
  gu: {
    riskHigh: '{village} માં આગામી {hours} કલાકમાં ઊંચો જોખમ: {why}.',
    riskMedium: '{village} માં આગામી {hours} કલાકમાં મધ્યમ જોખમ: {why}.',
    staySafe: 'સાવચેત રહો. કિનારા થી દૂર રહો.'
  }
};

/**
 * Get localized message template
 * @param {string} language - Language code (en/hi/gu)
 * @param {string} key - Message key
 * @returns {string} Template string
 */
function getTemplate(language, key) {
  const lang = messages[language] || messages.en;
  return lang[key] || messages.en[key] || '';
}

/**
 * Replace placeholders in template string
 * @param {string} template - Template with {placeholder} syntax
 * @param {object} variables - Key-value pairs for replacement
 * @returns {string} Formatted message
 */
function formatMessage(template, variables) {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
}

/**
 * Generate localized SMS message
 * @param {string} language - Language code
 * @param {string} band - Risk band (Green/Yellow/Red)
 * @param {string} village - Village name
 * @param {number} hours - Time window hours
 * @param {string} why - Risk reason
 * @param {boolean} simulation - Whether in simulation mode
 * @returns {string} Complete SMS message
 */
function generateSMSMessage(language, band, village, hours, why, simulation = false) {
  const riskKey = band === 'Red' ? 'riskHigh' : 'riskMedium';
  const riskTemplate = getTemplate(language, riskKey);
  const staySafeTemplate = getTemplate(language, 'staySafe');
  
  const riskMessage = formatMessage(riskTemplate, { village, hours, why });
  const fullMessage = `${riskMessage} ${staySafeTemplate}`;
  
  return simulation ? `${fullMessage} (SIM)` : fullMessage;
}

/**
 * Generate dashboard message (always in English for now)
 * @param {string} band - Risk band
 * @param {number} riskScore - Risk score 0-100
 * @param {string} village - Village name
 * @param {number} hours - Time window hours
 * @param {string} why - Risk reason
 * @returns {string} Dashboard message
 */
function generateDashboardMessage(band, riskScore, village, hours, why) {
  return `${band.toUpperCase()}: Risk ${riskScore}/100 for ${village} (${hours}h). Reason: ${why}.`;
}

module.exports = {
  getTemplate,
  formatMessage,
  generateSMSMessage,
  generateDashboardMessage,
  messages
};
