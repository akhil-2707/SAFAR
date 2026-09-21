const express = require('express');
const router = express.Router();
const {
  getSafetyAdvice,
  planTrip,
  listDestinations,
  getDestination
} = require('../controllers/aiController');

// AI Tourism Intelligence Routes
router.post('/plan-trip', planTrip);
router.get('/destinations', listDestinations);
router.get('/destinations/:id', getDestination);

// AI Safety Advisor
router.post('/safety-advice', getSafetyAdvice);

module.exports = router;
