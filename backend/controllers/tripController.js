const { dbStore } = require('../config/db');
const { calculateTouristRisk } = require('../services/aiRiskEngine');

function createTrip(req, res) {
  const { startingLocation, destination, plannedRoute, startDate, endDate, routeWaypoints, touristId } = req.body;
  const targetId = touristId || (req.user ? req.user.touristId : 'TID-1024');

  const newTrip = dbStore.insert('trips', {
    id: `trip_${Date.now()}`,
    touristId: targetId,
    startingLocation: startingLocation || 'Guwahati Airport',
    destination: destination || 'Cherrapunji Circuit',
    startDate: startDate || new Date().toISOString().split('T')[0],
    endDate: endDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    plannedRoute: plannedRoute || 'Guwahati -> Nongpoh -> Shillong -> Cherrapunji',
    routeWaypoints: routeWaypoints || [
      { lat: 26.1445, lng: 91.7362 },
      { lat: 25.5788, lng: 91.8933 },
      { lat: 25.2986, lng: 91.7321 }
    ]
  });

  return res.status(201).json({ success: true, trip: newTrip });
}

function getTripByTourist(req, res) {
  const { touristId } = req.params;
  const trip = dbStore.findOne('trips', (tr) => tr.touristId === touristId);

  if (!trip) {
    return res.status(404).json({ success: false, error: 'No planned trip found for this tourist' });
  }

  return res.json({ success: true, trip });
}

function simulateRouteDeviation(req, res) {
  const { touristId, offsetKm } = req.body;
  const targetId = touristId || 'TID-1024';

  const tourist = dbStore.findOne('tourists', (t) => t.touristId === targetId || t.id === targetId);
  if (!tourist) return res.status(404).json({ success: false, error: 'Tourist not found' });

  // Move location 3.8 km away into off-path wilderness
  const deviatedLocation = {
    lat: 25.8200, // Offset lat
    lng: 91.4500, // Offset lng
    address: `Off-Path Wilderness (${offsetKm || 3.8} km route offset deviation)`
  };

  const geofences = dbStore.get('geofences');
  const plannedTrip = dbStore.findOne('trips', (tr) => tr.touristId === targetId);

  const updatedTempTourist = { ...tourist, currentLocation: deviatedLocation };
  const riskAnalysis = calculateTouristRisk(updatedTempTourist, geofences, plannedTrip);

  const updated = dbStore.update('tourists', tourist.id, {
    currentLocation: deviatedLocation,
    riskScore: Math.max(52, riskAnalysis.score),
    riskLevel: 'HIGH',
    status: 'HIGH_RISK',
    lastSeen: new Date().toISOString()
  });

  const notif = dbStore.insert('notifications', {
    id: `notif_dev_${Date.now()}`,
    type: 'HIGH',
    title: '⚠️ AI Anomaly: Route Deviation Detected',
    message: `Tourist ${tourist.fullName} (${targetId}) strays ${offsetKm || 3.8} km away from registered itinerary route.`,
    timestamp: new Date().toISOString(),
    read: false,
    touristId: targetId
  });

  return res.json({
    success: true,
    message: 'Route deviation anomaly simulated successfully!',
    tourist: updated,
    riskAnalysis,
    notification: notif
  });
}

module.exports = {
  createTrip,
  getTripByTourist,
  simulateRouteDeviation
};
