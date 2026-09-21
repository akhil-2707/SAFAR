/**
 * Offline Ghost-Mesh Rescue Controller
 * Simulates BLE / Wi-Fi Direct Peer-to-Peer Multi-Hop Distress Relay
 * for zero-cellular / zero-internet remote mountain tourist trails.
 */

let MESH_NODES = [
  {
    id: 'NODE-ORIGIN-01',
    name: 'Stranded Tourist (Rohan Verma)',
    role: 'STRANDED_TOURIST',
    coords: { lat: 25.5684, lng: 94.0624 }, // Dzukou Valley Deadzone
    signalStrength: '0 Bars (NO_CARRIER)',
    battery: '34%',
    status: 'DISTRESS_BEACON_ARMED',
    bleRangeMeters: 90
  },
  {
    id: 'NODE-RELAY-01',
    name: 'Peer Hiker Node #1 (Priya Sharma)',
    role: 'MOBILE_RELAY',
    coords: { lat: 25.5720, lng: 94.0670 },
    signalStrength: '0 Bars (OFFLINE_MESH_ONLY)',
    battery: '78%',
    status: 'LISTENING_FOR_BEACONS',
    bleRangeMeters: 110
  },
  {
    id: 'NODE-RELAY-02',
    name: 'Trek Guide Node #2 (Tashi Dorjee)',
    role: 'MOBILE_RELAY',
    coords: { lat: 25.5810, lng: 94.0750 },
    signalStrength: '1 Bar (INTERMITTENT)',
    battery: '91%',
    status: 'ACTIVE_PACKET_FORWARDER',
    bleRangeMeters: 130
  },
  {
    id: 'NODE-GATEWAY-01',
    name: 'Forest Ranger Post & Police Uplink',
    role: 'INTERNET_GATEWAY',
    coords: { lat: 25.5950, lng: 94.0890 },
    signalStrength: '5 Bars (4G/5G + SATELLITE_UPLINK)',
    battery: '100% (STATIONARY_POWER)',
    status: 'ONLINE_CONNECTED_TO_112_ERSS',
    bleRangeMeters: 250
  }
];

let ACTIVE_MESH_DISPATCHES = [];

exports.getMeshTopology = (req, res) => {
  return res.json({
    success: true,
    protocol: 'BLE 5.3 + Wi-Fi Direct Opportunistic Mesh (Ghost-Mesh v2.4)',
    coverageArea: 'Dzukou Valley / Sela Pass Remote Corridor (Zero-Cellular Zone)',
    totalNodes: MESH_NODES.length,
    activeDispatches: ACTIVE_MESH_DISPATCHES,
    nodes: MESH_NODES
  });
};

exports.broadcastOfflineBeacon = (req, res) => {
  const {
    touristId = 'TID-1024',
    touristName = 'Rohan Verma',
    bloodGroup = 'O+ Positive',
    emergencyType = 'INJURED_IMMOBILE_IN_GORGE',
    coords = { lat: 25.5684, lng: 94.0624 },
    batteryLevel = 34
  } = req.body;

  const dispatchId = `MESH-SOS-${Date.now().toString().slice(-6)}`;
  const timestamp = new Date().toISOString();

  const hopSequence = [
    {
      hopIndex: 1,
      fromNode: 'Stranded Tourist Phone (TID-1024)',
      toNode: 'Peer Hiker Node #1 (Priya Sharma)',
      protocol: 'BLE 5.3 Long-Range Coded PHY',
      distanceMeters: 85,
      latencyMs: 14,
      packetHash: '0x7e3f...8a19',
      status: 'RELAYED_SUCCESS'
    },
    {
      hopIndex: 2,
      fromNode: 'Peer Hiker Node #1',
      toNode: 'Trek Guide Node #2 (Tashi Dorjee)',
      protocol: 'Wi-Fi Direct Peer Hop',
      distanceMeters: 115,
      latencyMs: 19,
      packetHash: '0x9a4c...12b8',
      status: 'RELAYED_SUCCESS'
    },
    {
      hopIndex: 3,
      fromNode: 'Trek Guide Node #2',
      toNode: 'Forest Ranger Post & Police Uplink',
      protocol: 'Radio Long-Range Uplink + LoRa Gateway',
      distanceMeters: 190,
      latencyMs: 38,
      packetHash: '0x3d7b...cc91',
      status: 'DELIVERED_TO_GATEWAY'
    }
  ];

  const newDispatch = {
    dispatchId,
    timestamp,
    touristId,
    touristName,
    bloodGroup,
    emergencyType,
    coordinates: coords,
    batteryLevel,
    networkStatus: 'OFFLINE_RELAYED_VIA_MESH',
    totalHops: hopSequence.length,
    hopSequence,
    uplinkConfirmation: {
      gatewayNode: 'Forest Ranger Post (Dzukou North Gate)',
      assignedRescueTeam: 'State Disaster Response Force (SDRF) Team Alpha-4',
      erss112Ticket: `112-MESH-${Math.floor(100000 + Math.random() * 900000)}`,
      etaMinutes: 18,
      status: 'RESCUE_TEAM_DISPATCHED'
    }
  };

  ACTIVE_MESH_DISPATCHES.unshift(newDispatch);

  return res.json({
    success: true,
    message: 'Encrypted Ghost-Mesh distress packet successfully hopped through 3 peer nodes and reached Forest Ranger Internet Gateway!',
    dispatch: newDispatch
  });
};

exports.resolveMeshRescue = (req, res) => {
  const { dispatchId } = req.body;
  ACTIVE_MESH_DISPATCHES = ACTIVE_MESH_DISPATCHES.filter(d => d.dispatchId !== dispatchId);
  return res.json({
    success: true,
    message: `Mesh rescue ticket ${dispatchId} marked as RESOLVED by SDRF Mountain Rescue Unit.`
  });
};
