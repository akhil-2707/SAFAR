const { generateSafetyAdvice } = require('../services/aiSafetyAdvisor');

async function getSafetyAdvice(req, res) {
  try {
    const { riskAnalysis, context } = req.body || {};
    if (!riskAnalysis || typeof riskAnalysis !== 'object') {
      return res.status(400).json({ success: false, error: 'riskAnalysis is required' });
    }

    const advice = await generateSafetyAdvice(riskAnalysis, context || {});
    return res.json({ success: true, advice });
  } catch (error) {
    console.error('AI Advisor Error:', error);
    return res.status(500).json({ success: false, error: 'Unable to generate AI safety advice' });
  }
}

module.exports = { getSafetyAdvice };
