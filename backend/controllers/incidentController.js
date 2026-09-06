const { dbStore } = require('../config/db');
const { classifyIncident } = require('../services/aiIncidentClassifier');
const { getHaversineDistance } = require('../utils/geoFenceUtils');

// 1-Click Emergency SOS Trigger
function triggerSOS(req, res) {
  try {
    const { touristId, lat, lng, address } = req.body;
    const targetId = touristId || (req.user ? req.user.touristId : 'TID-1024');

    const tourist = dbStore.findOne('tourists', (t) => t.touristId === targetId || t.id === targetId);
    if (!tourist) {
      return res.status(404).json({ success: false, error: 'Tourist profile not found' });
    }

    const currentLoc = {
      lat: parseFloat(lat) || tourist.currentLocation.lat,
      lng: parseFloat(lng) || tourist.currentLocation.lng,
      address: address || tourist.currentLocation.address || 'Emergency GPS Lock'
    };

    // Update Tourist state
    dbStore.update('tourists', tourist.id, {
      currentLocation: currentLoc,
      riskScore: 100,
      riskLevel: 'CRITICAL',
      isSosActive: true,
      status: 'CRITICAL_SOS',
      lastSeen: new Date().toISOString()
    });

    // Create Emergency Incident
    const incId = `INC-SOS-${Date.now().toString().slice(-4)}`;
    const nowIso = new Date().toISOString();

    const newIncident = dbStore.insert('incidents', {
      id: incId,
      touristId: targetId,
      touristName: tourist.fullName,
      type: 'SOS Emergency',
      severity: 'CRITICAL',
      location: currentLoc,
      time: nowIso,
      description: `HIGH PRIORITY EMERGENCY SOS TRIGGERED BY TOURIST ${tourist.fullName}. Urgent assistance requested at ${currentLoc.address}.`,
      aiRiskScore: 100,
      assignedAuthority: 'State Emergency Command Desk',
      status: 'NEW',
      responseNotes: 'Auto-dispatched via SOS System. Dispatch timer started.',
      timeline: [
        { status: 'NEW', title: 'SOS Triggered by Tourist', timestamp: nowIso, note: 'Emergency button activated on mobile application' },
        { status: 'ACKNOWLEDGED', title: 'Location Fixed', timestamp: nowIso, note: `Coordinates locked at ${currentLoc.lat}, ${currentLoc.lng}` },
        { status: 'ASSIGNED', title: 'Command Desk Notified', timestamp: nowIso, note: 'High priority alert dispatched to all active authority terminals' }
      ]
    });

    // Calculate nearby emergency services with live distance
    const services = dbStore.get('emergencyServices').map((s) => {
      const dist = getHaversineDistance(currentLoc.lat, currentLoc.lng, s.location.lat, s.location.lng);
      return {
        ...s,
        distanceKm: Math.round(dist * 10) / 10
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);

    // Push High Priority Notification
    const notif = dbStore.insert('notifications', {
      id: `notif_sos_${Date.now()}`,
      type: 'CRITICAL',
      title: '🚨 CRITICAL SOS EMERGENCY ALERT',
      message: `Tourist ${tourist.fullName} (${targetId}) triggered SOS at ${currentLoc.address}.`,
      timestamp: nowIso,
      read: false,
      touristId: targetId
    });

    return res.status(201).json({
      success: true,
      message: '🚨 EMERGENCY SOS DISPATCHED SUCCESSFULLY!',
      incident: newIncident,
      nearbyServices: services,
      notification: notif
    });
  } catch (err) {
    console.error('SOS Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to trigger SOS dispatch' });
  }
}

// Cancel Active SOS
function cancelSOS(req, res) {
  try {
    const { touristId, reason } = req.body;
    const targetId = touristId || (req.user ? req.user.touristId : 'TID-1024');

    const tourist = dbStore.findOne('tourists', (t) => t.touristId === targetId || t.id === targetId);
    if (!tourist) return res.status(404).json({ success: false, error: 'Tourist profile not found' });

    // Update Tourist state back to SAFE / LOW
    dbStore.update('tourists', tourist.id, {
      riskScore: 20,
      riskLevel: 'LOW',
      isSosActive: false,
      status: 'SAFE',
      lastSeen: new Date().toISOString()
    });

    // Resolve any active SOS incident
    const activeSosInc = dbStore.findOne(
      'incidents',
      (i) => i.touristId === targetId && i.type === 'SOS Emergency' && i.status !== 'RESOLVED'
    );

    let updatedIncident = null;
    if (activeSosInc) {
      const nowIso = new Date().toISOString();
      const updatedTimeline = [
        ...activeSosInc.timeline,
        { status: 'RESOLVED', title: 'SOS Cancelled by Tourist', timestamp: nowIso, note: `Cancellation reason: ${reason || 'Accidental trigger / Safe'}` }
      ];

      updatedIncident = dbStore.update('incidents', activeSosInc.id, {
        status: 'RESOLVED',
        responseNotes: `SOS Cancelled. Reason: ${reason || 'User confirmed safety.'}`,
        timeline: updatedTimeline
      });
    }

    dbStore.insert('notifications', {
      id: `notif_sos_cancel_${Date.now()}`,
      type: 'SAFE',
      title: '🟢 SOS Stand-Down',
      message: `Tourist ${tourist.fullName} (${targetId}) cancelled active SOS signal.`,
      timestamp: new Date().toISOString(),
      read: false,
      touristId: targetId
    });

    return res.json({
      success: true,
      message: 'SOS emergency cancelled. Tourist safety status restored to SAFE.',
      incident: updatedIncident
    });
  } catch (err) {
    console.error('Cancel SOS Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to cancel SOS' });
  }
}

// Get Incidents with filters
function getIncidents(req, res) {
  const { status, severity, touristId } = req.query;
  let incidents = dbStore.get('incidents');

  if (status) {
    incidents = incidents.filter((i) => i.status === status);
  }
  if (severity) {
    incidents = incidents.filter((i) => i.severity === severity);
  }
  if (touristId) {
    incidents = incidents.filter((i) => i.touristId === touristId);
  }

  return res.json({ success: true, count: incidents.length, incidents });
}

function getIncidentById(req, res) {
  const { id } = req.params;
  const incident = dbStore.findOne('incidents', (i) => i.id === id);

  if (!incident) return res.status(404).json({ success: false, error: 'Incident not found' });

  const tourist = dbStore.findOne('tourists', (t) => t.touristId === incident.touristId);

  return res.json({ success: true, incident, tourist });
}

// Create new Incident (General / AI Auto-classified)
function createIncident(req, res) {
  const { touristId, type, description, lat, lng, address } = req.body;

  const targetId = touristId || (req.user ? req.user.touristId : 'TID-1024');
  const tourist = dbStore.findOne('tourists', (t) => t.touristId === targetId || t.id === targetId);

  const loc = {
    lat: parseFloat(lat) || (tourist ? tourist.currentLocation.lat : 26.1445),
    lng: parseFloat(lng) || (tourist ? tourist.currentLocation.lng : 91.7362),
    address: address || (tourist ? tourist.currentLocation.address : 'Guwahati Region')
  };

  // AI Classification
  const aiResult = classifyIncident(type, description, tourist ? tourist.riskScore : 50, type === 'SOS Emergency');

  const incId = `INC-${Date.now().toString().slice(-4)}`;
  const nowIso = new Date().toISOString();

  const newIncident = dbStore.insert('incidents', {
    id: incId,
    touristId: targetId,
    touristName: tourist ? tourist.fullName : 'Registered Tourist',
    type: aiResult.category,
    severity: aiResult.severity,
    location: loc,
    time: nowIso,
    description: description || `Reported ${aiResult.category} event.`,
    aiRiskScore: tourist ? tourist.riskScore : 60,
    assignedAuthority: 'Assam Tourist Police Headquarters',
    status: 'NEW',
    responseNotes: aiResult.aiAnalysis,
    timeline: [
      { status: 'NEW', title: 'Incident Created & AI Classified', timestamp: nowIso, note: aiResult.aiAnalysis }
    ]
  });

  return res.status(201).json({ success: true, incident: newIncident, aiClassification: aiResult });
}

// Update Incident Status & Response Workflow
function updateIncidentStatus(req, res) {
  const { id } = req.params;
  const { status, assignedAuthority, responseNotes, manualSeverityOverride, manualCategoryOverride } = req.body;

  const incident = dbStore.findOne('incidents', (i) => i.id === id);
  if (!incident) return res.status(404).json({ success: false, error: 'Incident not found' });

  const nowIso = new Date().toISOString();

  const currentTimeline = incident.timeline || [];
  const statusTitles = {
    ACKNOWLEDGED: 'Incident Acknowledged by Authority Desk',
    ASSIGNED: `Response Team Assigned (${assignedAuthority || 'Tourist Police Unit'})`,
    IN_PROGRESS: 'Dispatch Unit En-Route / Active Intervention',
    RESOLVED: 'Incident Successfully Resolved'
  };

  if (status && status !== incident.status) {
    currentTimeline.push({
      status,
      title: statusTitles[status] || `Status updated to ${status}`,
      timestamp: nowIso,
      note: responseNotes || `Updated by authority official.`
    });
  }

  const updatedFields = {};
  if (status) updatedFields.status = status;
  if (assignedAuthority) updatedFields.assignedAuthority = assignedAuthority;
  if (responseNotes) updatedFields.responseNotes = responseNotes;
  if (manualSeverityOverride) updatedFields.severity = manualSeverityOverride;
  if (manualCategoryOverride) updatedFields.type = manualCategoryOverride;
  updatedFields.timeline = currentTimeline;

  const updated = dbStore.update('incidents', incident.id, updatedFields);

  // If resolved and it was an SOS, stand down tourist risk
  if (status === 'RESOLVED' && incident.type === 'SOS Emergency') {
    const tourist = dbStore.findOne('tourists', (t) => t.touristId === incident.touristId);
    if (tourist) {
      dbStore.update('tourists', tourist.id, {
        isSosActive: false,
        riskScore: 15,
        riskLevel: 'LOW',
        status: 'SAFE'
      });
    }
  }

  return res.json({
    success: true,
    message: `Incident ${id} updated to ${status || 'new parameters'}`,
    incident: updated
  });
};

const getEmergencyServices = (req, res) => {
  try {
    const services = dbStore.get('emergencyServices') || [];
    return res.json({
      success: true,
      count: services.length,
      emergencyServices: services,
      services
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  triggerSOS,
  cancelSOS,
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncidentStatus,
  getEmergencyServices
};
