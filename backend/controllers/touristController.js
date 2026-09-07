const jwt = require('jsonwebtoken');
const { dbStore } = require('../config/db');
const { calculateTouristRisk } = require('../services/aiRiskEngine');
const { JWT_SECRET } = require('../middleware/authMiddleware');

function getAllTourists(req, res) {
  const tourists = dbStore.get('tourists');
  const geofences = dbStore.get('geofences');

  const updatedTourists = tourists.map((t) => {
    const plannedTrip = dbStore.findOne('trips', (tr) => tr.touristId === t.touristId);
    const riskAnalysis = calculateTouristRisk(t, geofences, plannedTrip);
    return {
      ...t,
      riskScore: riskAnalysis.score,
      riskLevel: riskAnalysis.level,
      riskAnalysis
    };
  });

  return res.json({ success: true, count: updatedTourists.length, tourists: updatedTourists });
}

function getTouristById(req, res) {
  const { id } = req.params;

  // Authorization check: Verify JWT identity to prevent cross-user data exposure
  let authUser = req.user;
  if (!authUser && req.headers['authorization']) {
    try {
      const token = req.headers['authorization'].split(' ')[1];
      if (token) {
        authUser = jwt.verify(token, JWT_SECRET);
      }
    } catch (e) {
      // Invalid/expired token
    }
  }

  // If user is authenticated as TOURIST, enforce strict tenant boundary
  if (authUser && authUser.role === 'TOURIST') {
    const isOwnProfile = 
      authUser.touristId === id || 
      authUser.id === id || 
      (authUser.touristId && authUser.touristId.toLowerCase() === id.toLowerCase());
    
    if (!isOwnProfile) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Access denied. You can only view your own authorized profile.'
      });
    }
  }

  const tourist = dbStore.findOne('tourists', (t) => t.id === id || t.touristId === id);

  if (!tourist) {
    return res.status(404).json({ success: false, error: 'Tourist not found' });
  }

  const geofences = dbStore.get('geofences');
  const plannedTrip = dbStore.findOne('trips', (tr) => tr.touristId === tourist.touristId);
  const digitalId = dbStore.findOne('digitalIds', (d) => d.touristId === tourist.touristId);
  const riskAnalysis = calculateTouristRisk(tourist, geofences, plannedTrip);

  return res.json({
    success: true,
    tourist: {
      ...tourist,
      riskScore: riskAnalysis.score,
      riskLevel: riskAnalysis.level,
      riskAnalysis
    },
    digitalId,
    plannedTrip
  });
}

function updateLocation(req, res) {
  const { touristId, lat, lng, address, speedKmH, headingDeg, isLiveGps } = req.body;

  let authUser = req.user;
  if (!authUser && req.headers['authorization']) {
    try {
      const token = req.headers['authorization'].split(' ')[1];
      if (token) {
        authUser = jwt.verify(token, JWT_SECRET);
      }
    } catch (e) {}
  }

  let targetTouristId = touristId || (authUser ? authUser.touristId : 'TID-1035');
  // If user is logged in as tourist, enforce their own touristId
  if (authUser && authUser.role === 'TOURIST' && authUser.touristId) {
    targetTouristId = authUser.touristId;
  }
  const tourist = dbStore.findOne('tourists', (t) => t.touristId === targetTouristId || t.id === targetTouristId);

  if (!tourist) {
    return res.status(404).json({ success: false, error: 'Tourist not found' });
  }

  const newLocation = {
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    address: address || `Lat: ${lat}, Lng: ${lng}`,
    speedKmH: speedKmH !== undefined ? parseFloat(speedKmH) : (tourist.currentLocation?.speedKmH || 4.5),
    headingDeg: headingDeg !== undefined ? parseInt(headingDeg) : (tourist.currentLocation?.headingDeg || 45),
    isLiveGps: isLiveGps !== undefined ? isLiveGps : false,
    accuracyMeters: isLiveGps ? 8 : 15,
    lastUpdated: new Date().toISOString()
  };

  const geofences = dbStore.get('geofences');
  const plannedTrip = dbStore.findOne('trips', (tr) => tr.touristId === targetTouristId);

  const updatedTempTourist = { ...tourist, currentLocation: newLocation };
  const riskAnalysis = calculateTouristRisk(updatedTempTourist, geofences, plannedTrip);

  let newStatus = 'SAFE';
  if (riskAnalysis.level === 'CRITICAL') newStatus = 'CRITICAL_SOS';
  else if (riskAnalysis.level === 'HIGH') newStatus = 'HIGH_RISK';
  else if (riskAnalysis.level === 'MEDIUM') newStatus = 'CAUTION';

  const updated = dbStore.update('tourists', tourist.id, {
    currentLocation: newLocation,
    riskScore: riskAnalysis.score,
    riskLevel: riskAnalysis.level,
    status: newStatus,
    lastSeen: new Date().toISOString()
  });

  // Handle Proximity Alert Generation
  if (riskAnalysis.proximityWarning) {
    const pWarn = riskAnalysis.proximityWarning;
    const existingNotif = dbStore.findOne(
      'notifications',
      (n) => n.touristId === targetTouristId && !n.read && n.title.includes(pWarn.zoneName)
    );

    if (!existingNotif) {
      dbStore.insert('notifications', {
        id: `notif_prox_${Date.now()}`,
        type: pWarn.severity || 'HIGH',
        title: `${pWarn.tier === 'APPROACH' ? '🟡 APPROACH WARNING' : pWarn.tier === 'IMMINENT' ? '🟠 IMMINENT HAZARD' : '🔴 ZONE BREACH'}: ${pWarn.zoneName}`,
        message: pWarn.message,
        timestamp: new Date().toISOString(),
        read: false,
        touristId: targetTouristId
      });
    }
  }

  return res.json({
    success: true,
    message: 'Location updated and AI Risk Engine executed',
    tourist: updated,
    riskAnalysis
  });
}

// SIH Judge Demo Simulation Endpoint (Upgraded for 300m, 150m, 0m approach)
function simulateZone(req, res) {
  const { targetZoneType, touristId } = req.body; // 'SAFE' | 'APPROACH_300M' | 'APPROACH_150M' | 'RESTRICTED' | 'HIGH_RISK'
  const targetId = touristId || 'TID-1024';

  const tourist = dbStore.findOne('tourists', (t) => t.touristId === targetId || t.id === targetId);
  if (!tourist) return res.status(404).json({ success: false, error: 'Tourist not found' });

  // Preset location coordinates matching approach thresholds
  const zoneCoords = {
    SAFE: { lat: 26.1445, lng: 91.7362, address: 'Guwahati Safe Tourism Hub (Green Zone)', speedKmH: 0, isLiveGps: false },
    APPROACH_300M: { lat: 26.2770, lng: 91.5150, address: 'Kamrup Approach Corridor (300m from Restricted Zone)', speedKmH: 12, isLiveGps: false },
    APPROACH_150M: { lat: 26.2785, lng: 91.5180, address: 'Kamrup Imminent Corridor (150m from Restricted Zone)', speedKmH: 18, isLiveGps: false },
    RESTRICTED: { lat: 26.2800, lng: 91.5200, address: 'Kamrup Restricted Border Buffer (Red No-Entry Zone)', speedKmH: 2, isLiveGps: false },
    HIGH_RISK: { lat: 26.6500, lng: 93.3000, address: 'Kaziranga Core Elephant Sanctuary (Dark Red High Risk Zone)', speedKmH: 0, isLiveGps: false }
  };

  const selectedLoc = zoneCoords[targetZoneType] || zoneCoords.SAFE;
  selectedLoc.lastUpdated = new Date().toISOString();

  const geofences = dbStore.get('geofences');
  const plannedTrip = dbStore.findOne('trips', (tr) => tr.touristId === targetId);

  const tempTourist = { ...tourist, currentLocation: selectedLoc };
  const riskAnalysis = calculateTouristRisk(tempTourist, geofences, plannedTrip);

  let newStatus = 'SAFE';
  if (targetZoneType === 'HIGH_RISK' || targetZoneType === 'RESTRICTED') newStatus = 'HIGH_RISK';
  else if (targetZoneType === 'APPROACH_150M') newStatus = 'CAUTION';
  else if (targetZoneType === 'APPROACH_300M') newStatus = 'CAUTION';

  const updated = dbStore.update('tourists', tourist.id, {
    currentLocation: selectedLoc,
    riskScore: riskAnalysis.score,
    riskLevel: riskAnalysis.level,
    status: newStatus,
    lastSeen: new Date().toISOString()
  });

  // Push immediate notification to Authority Dashboard
  const alertNotif = dbStore.insert('notifications', {
    id: `notif_sim_${Date.now()}`,
    type: riskAnalysis.level,
    title: `SIMULATION: Tourist Movement to ${targetZoneType}`,
    message: `Tourist ${tourist.fullName} (${targetId}) moved to ${selectedLoc.address}. AI Risk Score: ${riskAnalysis.score}/100.`,
    timestamp: new Date().toISOString(),
    read: false,
    touristId: targetId
  });

  // If Restricted or High Risk, automatically log an Incident
  let incidentLogged = null;
  if (targetZoneType === 'RESTRICTED' || targetZoneType === 'HIGH_RISK') {
    const incId = `INC-${Date.now().toString().slice(-4)}`;
    incidentLogged = dbStore.insert('incidents', {
      id: incId,
      touristId: targetId,
      touristName: tourist.fullName,
      type: targetZoneType === 'HIGH_RISK' ? 'Natural Hazard' : 'Geo-fence Violation',
      severity: targetZoneType === 'HIGH_RISK' ? 'CRITICAL' : 'HIGH',
      location: selectedLoc,
      time: new Date().toISOString(),
      description: `Geo-fence boundary breach simulated into ${selectedLoc.address}.`,
      aiRiskScore: riskAnalysis.score,
      assignedAuthority: 'State Emergency Command Desk',
      status: 'NEW',
      responseNotes: 'Auto-triggered by AI Geo-fence monitor.',
      timeline: [
        {
          status: 'NEW',
          title: 'Zone Breach Alert',
          timestamp: new Date().toISOString(),
          note: `AI Ray-casting engine flagged entry into ${targetZoneType} zone.`
        }
      ]
    });
  }

  return res.json({
    success: true,
    message: `Movement simulation to ${targetZoneType} completed!`,
    tourist: updated,
    riskAnalysis,
    notification: alertNotif,
    incident: incidentLogged
  });
}

module.exports = {
  getAllTourists,
  getTouristById,
  updateLocation,
  simulateZone
};
