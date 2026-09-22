const express = require('express');
const router = express.Router();
const {
  getFoodList,
  getFoodById,
  getNearbyFood,
  getRecommendations,
  submitFeedback
} = require('../controllers/foodController');

// S.A.F.A.R. Swachh Food Intelligence Routes
router.get('/', getFoodList);
router.get('/nearby', getNearbyFood);
router.get('/recommendations', getRecommendations);
router.get('/:id', getFoodById);
router.post('/:id/feedback', submitFeedback);

module.exports = router;
