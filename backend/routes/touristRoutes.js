const express = require('express');
const router = express.Router();
const {
  getAllTourists,
  getTouristById,
  updateLocation,
  simulateZone
} = require('../controllers/touristController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', getAllTourists);
router.get('/:id', getTouristById);
router.post('/location', updateLocation);
router.post('/simulate-zone', simulateZone);

module.exports = router;
