/**
 * Deadman Switch Controller — Synchronized between Tourist & Govt Authority Command Desk
 */

// In-memory registry of tourists currently approaching or inside Red Zones
const activeDeadmanSessions = new Map();

// Seed initial active session for Ayodhya/NorthEast demo
const initialEntryTime = Date.now() - 15 * 60 * 1000; // 15 mins ago
activeDeadmanSessions.set('TID-1035', {
  touristId: 'TID-1035',
  touristName: 'Ananya Mishra',
  phone: '+91 94150 00001',
  enteredZoneName: 'Kamrup Restricted Border Buffer (Red Zone)',
  zoneType: 'RESTRICTED',
  entryTimestamp: initialEntryTime,
  lastGps: {
    lat: 26.2800,
    lng: 91.5200,
    address: 'Kamrup International Border Buffer (150m Pre-Entry Boundary)'
  },
  durationSeconds: 7200, // 2 Hours
  expiresAt: initialEntryTime + 7200 * 1000,
  status: 'ARMED',
  lastCheckIn: null,
  authorityNotified: true,
  emailDispatchedTo: 'ananya.mishra@example.com'
});

/**
 * 1. Pre-Entry Trigger (100–200m buffer before Red Zone)
 * Called automatically when tourist approaches a Red Zone
 */
exports.handlePreEntry = (req, res) => {
  const { touristId, touristName, zoneName, lat, lng, address, distanceMeters } = req.body;
  const tid = touristId || 'TID-1035';
  const now = Date.now();

  const session = {
    touristId: tid,
    touristName: touristName || 'Ananya Mishra',
    phone: '+91 94150 00001',
    enteredZoneName: zoneName || 'Restricted Wildlife & Military Corridor (Red Zone)',
    zoneType: 'RESTRICTED',
    entryTimestamp: now,
    lastGps: {
      lat: Number(lat) || 26.2800,
      lng: Number(lng) || 91.5200,
      address: address || `Red Zone Approach (${distanceMeters || 150}m Buffer)`
    },
    durationSeconds: 7200,
    expiresAt: now + 7200 * 1000,
    status: 'ARMED',
    lastCheckIn: null,
    authorityNotified: true,
    emailDispatchedTo: 'ananya.mishra@example.com'
  };

  activeDeadmanSessions.set(tid, session);

  console.log(`\n======================================================`);
  console.log(`🚨 [GOVT AUTHORITY COMMAND DESK ALERT] RED ZONE PRE-ENTRY`);
  console.log(` Tourist:     ${session.touristName} (${tid})`);
  console.log(` Zone:        ${session.enteredZoneName}`);
  console.log(` Location:    ${session.lastGps.address} [${session.lastGps.lat}, ${session.lastGps.lng}]`);
  console.log(` Countdown:   2 Hours (7200s) Synchronized with Central Server`);
  console.log(` 15m Prompt:  Required at 1h 45m mark`);
  console.log(`======================================================\n`);

  res.json({
    success: true,
    message: 'Pre-entry location recorded and 2-hour timer synchronized with Authority Command Desk.',
    session: {
      ...session,
      remainingSeconds: Math.max(0, Math.floor((session.expiresAt - now) / 1000))
    }
  });
};

/**
 * 2. Tourist Check-In ("I Am Safe" Button Tap)
 * Resets 2-hour timer and logs to Authority Command Desk
 */
exports.handleCheckIn = (req, res) => {
  const { touristId, notes } = req.body;
  const tid = touristId || 'TID-1035';
  const now = Date.now();

  const existing = activeDeadmanSessions.get(tid);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'No active deadman session found' });
  }

  // Reset 2-hour timer
  existing.entryTimestamp = now;
  existing.expiresAt = now + 7200 * 1000;
  existing.status = 'CHECKED_IN';
  existing.lastCheckIn = now;
  existing.notes = notes || 'User tapped "I Am Safe" - Confirmed conscious & secure';

  activeDeadmanSessions.set(tid, existing);

  console.log(`\n✅ [GOVT AUTHORITY COMMAND DESK] CHECK-IN RECEIVED`);
  console.log(` Tourist:   ${existing.touristName} (${tid})`);
  console.log(` Status:    SAFE (Timer Reset for next 2 hours)`);
  console.log(` Notes:     ${existing.notes}`);
  console.log(`======================================================\n`);

  res.json({
    success: true,
    message: 'Safety check-in verified. 2-Hour timer reset on Central Authority Server.',
    session: {
      ...existing,
      remainingSeconds: 7200
    }
  });
};

/**
 * 3. Get Active Deadman Sessions (For Authority Command Desk & Tourist Dashboard)
 */
exports.getActiveSessions = (req, res) => {
  const now = Date.now();
  const sessions = Array.from(activeDeadmanSessions.values()).map((s) => {
    const remainingSeconds = Math.max(0, Math.floor((s.expiresAt - now) / 1000));
    return {
      ...s,
      remainingSeconds,
      isLowTime: remainingSeconds <= 900 && remainingSeconds > 0, // <= 15 min
      isExpired: remainingSeconds === 0
    };
  });

  res.json({
    success: true,
    count: sessions.length,
    sessions
  });
};

/**
 * 4. Duty-Cycled Search Beacon Heartbeat (3s ON / 12s SLEEP cycle)
 */
exports.handleBeaconPing = (req, res) => {
  const { touristId, rssi, batteryLevel, mode } = req.body;
  const tid = touristId || 'TID-1035';

  res.json({
    success: true,
    beaconStatus: 'ACTIVE_DUTY_CYCLED',
    touristId: tid,
    cycle: '3s_TRANSMIT_12s_SLEEP',
    batteryLongevityHours: 72,
    receivedRssi: rssi || -72,
    timestamp: Date.now()
  });
};
