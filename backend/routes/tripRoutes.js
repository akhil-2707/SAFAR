const express = require('express');
const router = express.Router();
const { createTrip, getTripByTourist, simulateRouteDeviation } = require('../controllers/tripController');

router.post('/', createTrip);
router.get('/:touristId', getTripByTourist);
router.post('/simulate-deviation', simulateRouteDeviation);

module.exports = router;
