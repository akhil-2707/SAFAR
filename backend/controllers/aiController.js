const { generateSafetyAdvice } = require('../services/aiSafetyAdvisor');
const {
  generatePersonalizedPlan,
  getAllDestinations,
  getDestinationDetail
} = require('../services/aiTravelService');

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

function planTrip(req, res) {
  try {
    const plan = generatePersonalizedPlan(req.body || {});
    return res.json(plan);
  } catch (error) {
    console.error('AI Plan Trip Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate itinerary plan' });
  }
}

function listDestinations(req, res) {
  try {
    const destinations = getAllDestinations();
    return res.json({ success: true, destinations });
  } catch (error) {
    console.error('List Destinations Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch destinations' });
  }
}

function getDestination(req, res) {
  try {
    const { id } = req.params;
    const destination = getDestinationDetail(id);
    return res.json({ success: true, destination });
  } catch (error) {
    console.error('Get Destination Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch destination details' });
  }
}

module.exports = {
  getSafetyAdvice,
  planTrip,
  listDestinations,
  getDestination
};
