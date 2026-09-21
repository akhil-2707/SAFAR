/**
 * Fare Comparison Controller
 * 
 * Handles coordinate validation, input sanitization, estimated route-distance
 * and travel time approximations, and delegates to fareCompareService.
 */

const { getHaversineDistance } = require('../utils/geoFenceUtils');
const { compareFares } = require('../services/fareCompareService');
const { calculateRouteBenchmark } = require('../utils/transitBenchmarkData');

async function handleCompareFares(req, res) {
  try {
    const { pickup, dropoff, preference = 'ALL' } = req.body;

    // 1. Validate required objects
    if (!pickup || !dropoff) {
      return res.status(400).json({
        success: false,
        error: 'Both pickup and dropoff locations are required.'
      });
    }

    const pLat = parseFloat(pickup.lat);
    const pLng = parseFloat(pickup.lng);
    const dLat = parseFloat(dropoff.lat);
    const dLng = parseFloat(dropoff.lng);

    // 2. Validate geographic coordinate boundaries
    if (isNaN(pLat) || isNaN(pLng) || pLat < -90 || pLat > 90 || pLng < -180 || pLng > 180) {
      return res.status(400).json({
        success: false,
        error: 'Invalid pickup coordinates. Latitude must be -90 to 90 and Longitude -180 to 180.'
      });
    }

    if (isNaN(dLat) || isNaN(dLng) || dLat < -90 || dLat > 90 || dLng < -180 || dLng > 180) {
      return res.status(400).json({
        success: false,
        error: 'Invalid dropoff coordinates. Latitude must be -90 to 90 and Longitude -180 to 180.'
      });
    }

    // 3. Sanitize location names
    const sanitizedPickup = {
      lat: pLat,
      lng: pLng,
      address: String(pickup.address || 'Pickup Location').trim().slice(0, 250)
    };

    const sanitizedDropoff = {
      lat: dLat,
      lng: dLng,
      address: String(dropoff.address || 'Destination').trim().slice(0, 250)
    };

    // 4. Calculate Estimated Route-Distance Approximation
    // Uses Haversine geometric calculation with standard 1.3x road network curvature factor
    const directHaversineKm = getHaversineDistance(pLat, pLng, dLat, dLng);
    const approxDistanceKm = Math.max(0.5, directHaversineKm * 1.3);

    // 5. Calculate Approximate Travel Time
    // Benchmark calculation based on nominal urban transit speed (25 km/h) plus 3 min intersection buffer
    // Explicitly labeled as an approximation, not real-time traffic
    const approxDurationMins = Math.max(3, (approxDistanceKm / 25) * 60 + 3);

    // 6. Sanitize preference filter
    const validPreferences = ['ALL', 'BIKE', 'AUTO', 'CAB', 'PREMIUM', 'LOWEST_COST', 'FASTEST_ARRIVAL', 'SAFETY_COMFORT', 'BALANCED_VALUE'];
    const sanitizedPreference = typeof preference === 'string' && validPreferences.includes(preference.trim().toUpperCase())
      ? preference.trim().toUpperCase()
      : 'ALL';

    // 7. Execute Multi-Provider Comparison
    const comparisonResult = await compareFares({
      pickup: sanitizedPickup,
      dropoff: sanitizedDropoff,
      approxDistanceKm,
      approxDurationMins,
      preference: sanitizedPreference
    });

    // 8. Calculate Local Regional Benchmark for this route (Fare Guard)
    const localBenchmark = calculateRouteBenchmark({
      pLat,
      pLng,
      dLat,
      dLng,
      approxDistanceKm
    });

    // Attach verified distance and benchmark metadata to summary
    if (comparisonResult && comparisonResult.summary) {
      comparisonResult.summary.directDistanceKm = Number(directHaversineKm.toFixed(2));
      comparisonResult.summary.directDistanceLabel = 'Direct Distance';
      comparisonResult.summary.distanceLabel = 'Estimated Route Distance';
      comparisonResult.summary.durationLabel = 'Approximate Travel Time';
      comparisonResult.summary.localBenchmark = localBenchmark;
      comparisonResult.summary.pickupCoordinates = { lat: pLat, lng: pLng, address: sanitizedPickup.address };
      comparisonResult.summary.dropoffCoordinates = { lat: dLat, lng: dLng, address: sanitizedDropoff.address };
    }
    comparisonResult.localBenchmark = localBenchmark;

    return res.json(comparisonResult);
  } catch (err) {
    console.error('[FareCompareController] Error executing comparison:', err);
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred while calculating fare estimates.'
    });
  }
}

// Preset popular routes for evaluators and tourists across major tourism circuits
function getPopularRoutes(req, res) {
  const routes = [
    {
      id: 'ayodhya_01',
      circuit: 'Ayodhya Dham',
      label: 'Ayodhya Cantt Station ➔ Ram Janmabhoomi',
      pickup: { lat: 26.7725, lng: 82.1384, address: 'Ayodhya Cantt Railway Station' },
      dropoff: { lat: 26.7922, lng: 82.1998, address: 'Ram Janmabhoomi Complex' }
    },
    {
      id: 'agra_01',
      circuit: 'Agra Heritage',
      label: 'Agra Cantt Railway Station ➔ Taj Mahal East Gate',
      pickup: { lat: 27.1592, lng: 77.9942, address: 'Agra Cantt Railway Station' },
      dropoff: { lat: 27.1751, lng: 78.0421, address: 'Taj Mahal East Gate' }
    },
    {
      id: 'jammu_01',
      circuit: 'Jammu & Katra',
      label: 'Katra Railway Station ➔ Banganga Yatra Entry',
      pickup: { lat: 32.9912, lng: 74.9312, address: 'Shri Mata Vaishno Devi Katra Station' },
      dropoff: { lat: 33.0035, lng: 74.9542, address: 'Banganga Yatra Checkpost' }
    },
    {
      id: 'guwahati_01',
      circuit: 'Guwahati Circuit',
      label: 'Guwahati Railway Station ➔ Kamakhya Temple',
      pickup: { lat: 26.1824, lng: 91.7505, address: 'Guwahati Central Railway Station' },
      dropoff: { lat: 26.1664, lng: 91.7054, address: 'Maa Kamakhya Temple Gate' }
    },
    {
      id: 'delhi_01',
      circuit: 'Delhi Heritage',
      label: 'New Delhi Station ➔ India Gate',
      pickup: { lat: 28.6429, lng: 77.2195, address: 'New Delhi Railway Station' },
      dropoff: { lat: 28.6129, lng: 77.2295, address: 'India Gate Monument' }
    }
  ];

  return res.json({ success: true, routes });
}

module.exports = {
  handleCompareFares,
  getPopularRoutes
};
