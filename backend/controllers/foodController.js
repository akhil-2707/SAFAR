const {
  getFoodOutlets,
  searchFoodOutlets,
  getFoodOutletById,
  getAiFoodRecommendations,
  recordTravellerFeedback
} = require('../services/foodService');

// 1. GET /api/food
function getFoodList(req, res) {
  try {
    const {
      destination,
      cuisine,
      budget,
      vegetarian,
      minScore,
      maxDistance,
      nearRoute,
      search
    } = req.query;

    const outlets = searchFoodOutlets({
      destination,
      cuisine,
      budget,
      vegetarian,
      minScore,
      maxDistance,
      nearRoute,
      search
    });

    return res.json({
      success: true,
      total: outlets.length,
      outlets,
      prototypeNotice: 'SAFAR Prototype Swachh Food Registry: Prototype intelligence benchmark data. Not official certification.'
    });
  } catch (error) {
    console.error('getFoodList error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch food registry' });
  }
}

// 2. GET /api/food/:id
function getFoodById(req, res) {
  try {
    const { id } = req.params;
    const outlet = getFoodOutletById(id);

    if (!outlet) {
      return res.status(404).json({ success: false, error: 'Food outlet not found' });
    }

    return res.json({
      success: true,
      outlet
    });
  } catch (error) {
    console.error('getFoodById error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch food outlet details' });
  }
}

// 3. GET /api/food/nearby
function getNearbyFood(req, res) {
  try {
    const { lat, lng, destination, maxDistanceKm } = req.query;
    const maxDist = Number(maxDistanceKm) || 3.0;

    let outlets = searchFoodOutlets({
      destination,
      maxDistance: maxDist,
      nearRoute: true
    });

    return res.json({
      success: true,
      total: outlets.length,
      outlets,
      reference: { lat: Number(lat) || null, lng: Number(lng) || null, destination: destination || 'ALL' }
    });
  } catch (error) {
    console.error('getNearbyFood error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch nearby food stops' });
  }
}

// 4. GET /api/food/recommendations
function getRecommendations(req, res) {
  try {
    const {
      destination,
      travellers,
      budgetTier,
      cuisine,
      vegetarian,
      meal
    } = req.query;

    const recommendations = getAiFoodRecommendations({
      destination,
      travellers,
      budgetTier,
      preferredCuisine: cuisine,
      vegetarian,
      currentMeal: meal || 'LUNCH'
    });

    return res.json(recommendations);
  } catch (error) {
    console.error('getRecommendations error:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate food recommendations' });
  }
}

// 5. POST /api/food/:id/feedback
function submitFeedback(req, res) {
  try {
    const { id } = req.params;
    const {
      cleanliness,
      waterAvailable,
      wasteManagement,
      foodExperience,
      notes,
      touristId
    } = req.body;

    const result = recordTravellerFeedback(id, {
      cleanliness,
      waterAvailable,
      wasteManagement,
      foodExperience,
      notes,
      touristId: touristId || (req.user ? req.user.touristId : 'TID-1035')
    });

    if (!result) {
      return res.status(404).json({ success: false, error: 'Target food outlet not found' });
    }

    return res.json(result);
  } catch (error) {
    console.error('submitFeedback error:', error);
    return res.status(500).json({ success: false, error: 'Failed to record traveller feedback' });
  }
}

module.exports = {
  getFoodList,
  getFoodById,
  getNearbyFood,
  getRecommendations,
  submitFeedback
};
