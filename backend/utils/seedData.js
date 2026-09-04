const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { blockchainInstance } = require('../services/blockchainService');

function getInitialData() {
  const defaultPasswordHash = bcrypt.hashSync('admin123', 10);

  // Authority & Admin Accounts
  const users = [
    {
      id: 'usr_auth_01',
      name: 'Dr. Ananya Sharma',
      email: 'authority@safetour.gov.in',
      password: defaultPasswordHash,
      role: 'AUTHORITY',
      department: 'S.A.F.A.R. Central Command Desk',
      phone: '+91 98640 12345'
    },
    {
      id: 'usr_auth_02',
      name: 'Insp. Bikram Gogoi',
      email: 'police@safetour.gov.in',
      password: defaultPasswordHash,
      role: 'AUTHORITY',
      department: 'Assam Tourist Police Headquarters',
      phone: '+91 98640 54321'
    },
    {
      id: 'usr_auth_03',
      name: 'Rajesh Khonglah',
      email: 'disaster@safetour.gov.in',
      password: defaultPasswordHash,
      role: 'AUTHORITY',
      department: 'State Disaster Management Unit',
      phone: '+91 98640 99887'
    },
    {
      id: 'usr_tourist_01',
      name: 'Rohan Verma',
      email: 'rohan.verma@example.com',
      password: defaultPasswordHash,
      role: 'TOURIST',
      touristId: 'TID-1024'
    },
    {
      id: 'usr_tourist_02',
      name: 'Priya Mukherjee',
      email: 'priya.m@example.com',
      password: defaultPasswordHash,
      role: 'TOURIST',
      touristId: 'TID-1025'
    }
  ];

  // Geo-fences in North East India Region
  const geofences = [
    {
      id: 'gf_01',
      name: 'Guwahati Safe Tourist Hub',
      type: 'SAFE',
      description: 'Monitored city center, hotels, and transport terminals',
      center: { lat: 26.1445, lng: 91.7362 },
      coordinates: [
        [26.170, 91.700],
        [26.170, 91.780],
        [26.120, 91.780],
        [26.120, 91.700]
      ],
      color: '#10B981',
      strokeColor: '#059669'
    },
    {
      id: 'gf_02',
      name: 'Kaziranga Tourist Lodge Corridor',
      type: 'SAFE',
      description: 'Authorized Safari Staging Area and Eco-resorts',
      center: { lat: 26.5775, lng: 93.1711 },
      coordinates: [
        [26.590, 93.150],
        [26.590, 93.200],
        [26.550, 93.200],
        [26.550, 93.150]
      ],
      color: '#10B981',
      strokeColor: '#059669'
    },
    {
      id: 'gf_03',
      name: 'Cherrapunji Falls Monsoon Trail',
      type: 'CAUTION',
      description: 'Slippery cliff edges, heavy fog & sudden torrential rain hazard',
      center: { lat: 25.2986, lng: 91.7321 },
      coordinates: [
        [25.320, 91.710],
        [25.320, 91.760],
        [25.270, 91.760],
        [25.270, 91.710]
      ],
      color: '#F59E0B',
      strokeColor: '#D97706'
    },
    {
      id: 'gf_04',
      name: 'Kamrup International Border Buffer Zone',
      type: 'RESTRICTED',
      description: 'High-security border zone requiring Inner Line Permit (ILP)',
      center: { lat: 26.2800, lng: 91.5200 },
      coordinates: [
        [26.310, 91.480],
        [26.310, 91.560],
        [26.250, 91.560],
        [26.250, 91.480]
      ],
      color: '#EF4444',
      strokeColor: '#DC2626'
    },
    {
      id: 'gf_05',
      name: 'Tawang High-Altitude Military Pass',
      type: 'RESTRICTED',
      description: 'Extreme altitude & restricted military border access area',
      center: { lat: 27.5861, lng: 91.8594 },
      coordinates: [
        [27.610, 91.820],
        [27.610, 91.890],
        [27.550, 91.890],
        [27.550, 91.820]
      ],
      color: '#EF4444',
      strokeColor: '#DC2626'
    },
    {
      id: 'gf_06',
      name: 'Kaziranga Core Forest Elephant Sanctuary',
      type: 'HIGH_RISK',
      description: 'Wild animal migration corridor - strictly forbidden without armed forest guards',
      center: { lat: 26.6500, lng: 93.3000 },
      coordinates: [
        [26.680, 93.250],
        [26.680, 93.350],
        [26.620, 93.350],
        [26.620, 93.250]
      ],
      color: '#991B1B',
      strokeColor: '#7F1D1D'
    }
  ];

  // Registered Tourists
  const tourists = [
    {
      id: 'tourist_01',
      touristId: 'TID-1024',
      fullName: 'Rohan Verma',
      dob: '1995-04-12',
      gender: 'Male',
      nationality: 'Indian',
      mobileNumber: '+91 98765 43210',
      emergencyContact: {
        name: 'Sunita Verma (Mother)',
        phone: '+91 98765 00001',
        relation: 'Mother'
      },
      email: 'rohan.verma@example.com',
      idProofType: 'Aadhaar Card',
      idVerificationStatus: 'VERIFIED',
      destination: 'Guwahati & Shillong Circuit',
      travelStartDate: '2026-08-10',
      travelEndDate: '2026-08-20',
      currentLocation: { lat: 26.1445, lng: 91.7362, address: 'Paltan Bazaar, Guwahati' },
      riskScore: 15,
      riskLevel: 'LOW',
      isSosActive: false,
      status: 'SAFE',
      lastSeen: new Date().toISOString()
    },
    {
      id: 'tourist_02',
      touristId: 'TID-1025',
      fullName: 'Priya Mukherjee',
      dob: '1998-11-23',
      gender: 'Female',
      nationality: 'Indian',
      mobileNumber: '+91 98111 22334',
      emergencyContact: {
        name: 'Debashis Mukherjee (Father)',
        phone: '+91 98111 00000',
        relation: 'Father'
      },
      email: 'priya.m@example.com',
      idProofType: 'Passport',
      idVerificationStatus: 'VERIFIED',
      destination: 'Cherrapunji & Dawki River Trail',
      travelStartDate: '2026-08-12',
      travelEndDate: '2026-08-18',
      currentLocation: { lat: 25.2986, lng: 91.7321, address: 'Nohkalikai Viewpoint, Cherrapunji' },
      riskScore: 42,
      riskLevel: 'MEDIUM',
      isSosActive: false,
      status: 'CAUTION',
      lastSeen: new Date().toISOString()
    },
    {
      id: 'tourist_03',
      touristId: 'TID-1026',
      fullName: 'David Miller',
      dob: '1990-07-04',
      gender: 'Male',
      nationality: 'United States',
      mobileNumber: '+1 415 555 2671',
      emergencyContact: {
        name: 'Sarah Miller (Spouse)',
        phone: '+1 415 555 9999',
        relation: 'Spouse'
      },
      email: 'david.miller@example.org',
      idProofType: 'Passport',
      idVerificationStatus: 'VERIFIED',
      destination: 'Kaziranga National Park Wildlife Safari',
      travelStartDate: '2026-08-14',
      travelEndDate: '2026-08-25',
      currentLocation: { lat: 26.6500, lng: 93.3000, address: 'Kaziranga Core Forest Zone 2' },
      riskScore: 82,
      riskLevel: 'CRITICAL',
      isSosActive: true,
      status: 'CRITICAL_SOS',
      lastSeen: new Date().toISOString()
    },
    {
      id: 'tourist_04',
      touristId: 'TID-1027',
      fullName: 'Aarav Sharma',
      dob: '2001-02-15',
      gender: 'Male',
      nationality: 'Indian',
      mobileNumber: '+91 99887 76655',
      emergencyContact: {
        name: 'Vikram Sharma (Brother)',
        phone: '+91 99887 00000',
        relation: 'Brother'
      },
      email: 'aarav.s@example.com',
      idProofType: 'Driving License',
      idVerificationStatus: 'VERIFIED',
      destination: 'Tawang Monastery Trek',
      travelStartDate: '2026-08-11',
      travelEndDate: '2026-08-22',
      currentLocation: { lat: 26.2800, lng: 91.5200, address: 'Kamrup Restricted Border Buffer' },
      riskScore: 68,
      riskLevel: 'HIGH',
      isSosActive: false,
      status: 'HIGH_RISK',
      lastSeen: new Date().toISOString()
    },
    {
      id: 'tourist_05',
      touristId: 'TID-1028',
      fullName: 'Emily Chen',
      dob: '1996-09-18',
      gender: 'Female',
      nationality: 'Singapore',
      mobileNumber: '+65 9123 4567',
      emergencyContact: {
        name: 'Kevin Chen (Brother)',
        phone: '+65 9123 0000',
        relation: 'Brother'
      },
      email: 'emily.chen@example.sg',
      idProofType: 'Passport',
      idVerificationStatus: 'VERIFIED',
      destination: 'Gangtok & Nathula Pass',
      travelStartDate: '2026-08-13',
      travelEndDate: '2026-08-19',
      currentLocation: { lat: 27.3389, lng: 88.6065, address: 'MG Marg, Gangtok' },
      riskScore: 10,
      riskLevel: 'LOW',
      isSosActive: false,
      status: 'SAFE',
      lastSeen: new Date().toISOString()
    }
  ];

  // Digital IDs with SHA-256 Hashes
  const digitalIds = tourists.map((t) => {
    const rawString = `${t.touristId}:${t.fullName}:${t.dob}:${t.nationality}:${t.idProofType}`;
    const touristIdHash = crypto.createHash('sha256').update(t.touristId).digest('hex');
    const digitalIdHash = crypto.createHash('sha256').update(rawString).digest('hex');

    // Add block to prototype blockchain ledger
    const block = blockchainInstance.addBlock({
      touristId: t.touristId,
      touristIdHash,
      digitalIdHash,
      verificationStatus: 'VERIFIED',
      issuer: 'S.A.F.A.R. National Tourism Safety Authority',
      network: 'Prototype Blockchain Ledger',
      travelValidity: `${t.travelStartDate} to ${t.travelEndDate}`
    });

    return {
      id: `did_${t.touristId}`,
      touristId: t.touristId,
      fullName: t.fullName,
      verificationStatus: 'VERIFIED',
      touristIdHash,
      digitalIdHash,
      blockIndex: block.index,
      blockchainTxHash: block.hash,
      issuedAt: block.timestamp,
      expiryDate: t.travelEndDate,
      digitalSignature: `SIG-SHA256-${digitalIdHash.substring(0, 16).toUpperCase()}`,
      qrCodeData: `https://safetour.gov.in/verify-id/${t.touristId}?hash=${digitalIdHash.substring(0, 16)}`
    };
  });

  // Emergency Services Seed Data
  const emergencyServices = [
    {
      id: 'es_01',
      name: 'Assam Tourist Police HQ',
      type: 'POLICE',
      phone: '112 / 0361 252 0222',
      address: 'Paltan Bazaar, Guwahati, Assam',
      location: { lat: 26.1795, lng: 91.7512 },
      distanceKm: 1.2,
      availability: '24/7 Active Dispatch'
    },
    {
      id: 'es_02',
      name: 'Guwahati Medical College & Hospital (GMCH)',
      type: 'HOSPITAL',
      phone: '+91 361 252 9457',
      address: 'Bhangagarh, Guwahati, Assam',
      location: { lat: 26.1550, lng: 91.7700 },
      distanceKm: 3.5,
      availability: '24/7 Emergency & ICU'
    },
    {
      id: 'es_03',
      name: 'S.A.F.A.R. Tourist Safety Help Desk',
      type: 'TOURIST_HELP',
      phone: '1800 123 7233 (Toll Free)',
      address: 'NE Council Complex, Shillong / Guwahati Desk',
      location: { lat: 26.1445, lng: 91.7362 },
      distanceKm: 0.5,
      availability: '24/7 Multilingual Support'
    },
    {
      id: 'es_04',
      name: 'Cherrapunji Disaster Rescue Post',
      type: 'DISASTER_RESCUE',
      phone: '+91 3637 244 221',
      address: 'Sohra Civil Sub-Division, Meghalaya',
      location: { lat: 25.2986, lng: 91.7321 },
      distanceKm: 2.1,
      availability: 'Monsoon High-Alert Team'
    }
  ];

  // Incidents
  const incidents = [
    {
      id: 'INC-2026-001',
      touristId: 'TID-1026',
      touristName: 'David Miller',
      type: 'SOS Emergency',
      severity: 'CRITICAL',
      location: { lat: 26.6500, lng: 93.3000, address: 'Kaziranga Core Forest Zone 2' },
      time: new Date(Date.now() - 15 * 60000).toISOString(),
      description: 'Emergency SOS activated by tourist. Handset GPS shows entry inside wild animal wildlife reserve.',
      aiRiskScore: 82,
      assignedAuthority: 'Assam Tourist Police Headquarters',
      status: 'IN_PROGRESS',
      responseNotes: 'Forest Range Officer Unit 4 dispatched with jeep unit. Emergency contacts alerted.',
      timeline: [
        { status: 'NEW', title: 'SOS Triggered', timestamp: new Date(Date.now() - 15 * 60000).toISOString(), note: 'Tourist clicked SOS on mobile dashboard' },
        { status: 'ACKNOWLEDGED', title: 'Location Received', timestamp: new Date(Date.now() - 12 * 60000).toISOString(), note: 'GPS lock confirmed at 26.6500 N, 93.3000 E' },
        { status: 'ASSIGNED', title: 'Response Team Assigned', timestamp: new Date(Date.now() - 8 * 60000).toISOString(), note: 'Assigned to Insp. Bikram Gogoi (Unit 4)' },
        { status: 'IN_PROGRESS', title: 'Team En-Route', timestamp: new Date(Date.now() - 3 * 60000).toISOString(), note: 'Rescue team 2.4 km from target location' }
      ]
    },
    {
      id: 'INC-2026-002',
      touristId: 'TID-1027',
      touristName: 'Aarav Sharma',
      type: 'Geo-fence Violation',
      severity: 'HIGH',
      location: { lat: 26.2800, lng: 91.5200, address: 'Kamrup Restricted Border Buffer' },
      time: new Date(Date.now() - 45 * 60000).toISOString(),
      description: 'Tourist crossed restricted boundary perimeter without active Inner Line Permit (ILP) digital validation.',
      aiRiskScore: 68,
      assignedAuthority: 'Kamrup Border Security Patrol',
      status: 'ACKNOWLEDGED',
      responseNotes: 'Automated SMS warning issued to tourist handset. Border checkpoint notified.',
      timeline: [
        { status: 'NEW', title: 'Perimeter Breach Detected', timestamp: new Date(Date.now() - 45 * 60000).toISOString(), note: 'AI Ray-casting engine flagged restricted zone entry' },
        { status: 'ACKNOWLEDGED', title: 'Acknowledged by Authority', timestamp: new Date(Date.now() - 30 * 60000).toISOString(), note: 'Border desk reviewing permit records' }
      ]
    },
    {
      id: 'INC-2026-003',
      touristId: 'TID-1025',
      touristName: 'Priya Mukherjee',
      type: 'Suspicious Movement',
      severity: 'MEDIUM',
      location: { lat: 25.2986, lng: 91.7321, address: 'Nohkalikai Viewpoint, Cherrapunji' },
      time: new Date(Date.now() - 120 * 60000).toISOString(),
      description: 'Route deviation offset > 3.2 km detected along heavy fog waterfall cliff trail.',
      aiRiskScore: 42,
      assignedAuthority: 'State Disaster Management Unit',
      status: 'RESOLVED',
      responseNotes: 'Tourist confirmed via call that she took authorized view-deck detour with local guide.',
      timeline: [
        { status: 'NEW', title: 'Route Offset Detected', timestamp: new Date(Date.now() - 120 * 60000).toISOString(), note: 'Planned route variance exceeded 3km' },
        { status: 'ACKNOWLEDGED', title: 'Desk Verification', timestamp: new Date(Date.now() - 100 * 60000).toISOString(), note: 'Safety phone check initiated' },
        { status: 'RESOLVED', title: 'Verified Safe', timestamp: new Date(Date.now() - 75 * 60000).toISOString(), note: 'Tourist confirmed accompanied travel' }
      ]
    }
  ];

  // Sample Planned Trips
  const trips = [
    {
      id: 'trip_01',
      touristId: 'TID-1024',
      startingLocation: 'Guwahati Airport (GAU)',
      destination: 'Shillong & Elephant Falls',
      startDate: '2026-08-10',
      endDate: '2026-08-20',
      plannedRoute: 'Guwahati -> Nongpoh -> Shillong Peak -> Elephant Falls',
      routeWaypoints: [
        { lat: 26.1445, lng: 91.7362 },
        { lat: 25.9000, lng: 91.8800 },
        { lat: 25.5788, lng: 91.8933 }
      ]
    },
    {
      id: 'trip_02',
      touristId: 'TID-1025',
      startingLocation: 'Shillong Bus Stand',
      destination: 'Cherrapunji (Sohra) Waterfalls',
      startDate: '2026-08-12',
      endDate: '2026-08-18',
      plannedRoute: 'Shillong -> Mawdok Valley -> Nohkalikai -> Cherrapunji',
      routeWaypoints: [
        { lat: 25.5788, lng: 91.8933 },
        { lat: 25.4000, lng: 91.7800 },
        { lat: 25.2986, lng: 91.7321 }
      ]
    }
  ];

  return {
    users,
    geofences,
    tourists,
    digitalIds,
    emergencyServices,
    incidents,
    trips
  };
}

module.exports = {
  getInitialData
};
