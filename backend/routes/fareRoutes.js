const express = require('express');
const router = express.Router();
const { handleCompareFares, getPopularRoutes } = require('../controllers/fareCompareController');

// GET /api/fares - Default benchmark popular routes
router.get('/', getPopularRoutes);

// POST /api/fares/compare - Multi-provider ride fare comparison
router.post('/compare', handleCompareFares);

// GET /api/fares/popular-routes - Pre-calculated popular tourism presets
router.get('/popular-routes', getPopularRoutes);

module.exports = router;
