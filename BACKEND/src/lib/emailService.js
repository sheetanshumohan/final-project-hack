const nodemailer = require('nodemailer');
const { generateSMSMessage } = require('./i18n');

// Ensure environment variables are loaded
require('dotenv').config();

// Create transporter with your Gmail credentials
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.GMAIL_USER, // your gmail address
    pass: process.env.GMAIL_APP_PASSWORD // your app password
  }
});

/**
 * Send high-risk alert email to user
 * @param {Object} user - User object with name, email, language
 * @param {Object} alert - Alert object with location, riskScore, band, why
 * @returns {Promise} Email send result
 */
async function sendHighRiskAlert(user, alert) {
  try {
    // Generate localized SMS message for email content
    const smsMessage = generateSMSMessage(
      user.language,
      alert.band,
      alert.location,
      alert.timeWindowHrs || 12,
      alert.why
    );

    const info = await transporter.sendMail({
      from: `"Coastal Guard AI" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: `🚨 HIGH RISK ALERT for ${alert.location} - Coastal Guard AI`,
      text: `Hi ${user.name},

URGENT: HIGH COASTAL RISK DETECTED

Location: ${alert.location}
Risk Score: ${alert.riskScore}/100
Risk Level: ${alert.band}
Time Window: ${alert.timeWindowHrs}h

Reason: ${alert.why}

Alert Message: ${smsMessage}

Please take necessary precautions and stay safe.

Thanks,
Coastal Guard AI Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🚨 HIGH RISK ALERT</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Coastal Guard AI Early Warning System</p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0;">
            <h2 style="color: #1e293b; margin-top: 0;">Hello ${user.name},</h2>
            
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin: 15px 0;">
              <h3 style="color: #dc2626; margin: 0 0 10px 0;">⚠️ URGENT: High Coastal Risk Detected</h3>
              <p style="margin: 0; color: #7f1d1d;"><strong>Immediate attention required for your safety.</strong></p>
            </div>
            
            <div style="background: white; border-radius: 8px; padding: 15px; margin: 15px 0; border: 1px solid #e2e8f0;">
              <h4 style="margin: 0 0 10px 0; color: #1e293b;">Alert Details:</h4>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 5px 0; font-weight: bold; color: #374151;">Location:</td>
                  <td style="padding: 5px 0; color: #1e293b;">${alert.location}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-weight: bold; color: #374151;">Risk Score:</td>
                  <td style="padding: 5px 0; color: #dc2626; font-weight: bold;">${alert.riskScore}/100</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-weight: bold; color: #374151;">Risk Level:</td>
                  <td style="padding: 5px 0;">
                    <span style="background: #dc2626; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                      ${alert.band.toUpperCase()}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-weight: bold; color: #374151;">Time Window:</td>
                  <td style="padding: 5px 0; color: #1e293b;">${alert.timeWindowHrs} hours</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-weight: bold; color: #374151; vertical-align: top;">Reason:</td>
                  <td style="padding: 5px 0; color: #1e293b;">${alert.why}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 15px; margin: 15px 0;">
              <h4 style="margin: 0 0 10px 0; color: #1e40af;">📱 Share this alert:</h4>
              <p style="background: white; padding: 10px; border-radius: 4px; margin: 0; border: 1px solid #d1d5db; font-family: monospace; font-size: 14px; color: #374151;">
                ${smsMessage}
              </p>
            </div>
            
            <div style="background: #f59e0b; color: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h4 style="margin: 0 0 10px 0;">🛡️ Safety Recommendations:</h4>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Avoid coastal areas and beaches</li>
                <li>Stay informed about weather conditions</li>
                <li>Follow local authority instructions</li>
                <li>Keep emergency contacts ready</li>
              </ul>
            </div>
          </div>
          
          <div style="background: #1e293b; color: white; padding: 15px; border-radius: 0 0 10px 10px; text-align: center;">
            <p style="margin: 0; font-size: 14px; opacity: 0.8;">
              Stay safe,<br>
              <strong>Coastal Guard AI Team</strong>
            </p>
          </div>
        </div>
      `,
    });

    console.log("✅ High-risk alert email sent:", info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Test email configuration
 */
async function testEmailConfig() {
  try {
    await transporter.verify();
    console.log("✅ Email configuration is valid");
    return true;
  } catch (error) {
    console.error("❌ Email configuration error:", error);
    return false;
  }
}

module.exports = {
  sendHighRiskAlert,
  testEmailConfig
};
