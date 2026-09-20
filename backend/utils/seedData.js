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
    },
    {
      id: 'usr_tourist_ayodhya',
      name: 'Ananya Mishra',
      email: 'ananya.mishra@example.com',
      password: defaultPasswordHash,
      role: 'TOURIST',
      touristId: 'TID-1035'
    },
    {
      id: 'usr_tourist_jammu',
      name: 'Vikas Chandel',
      email: 'vikas.chandel@example.com',
      password: defaultPasswordHash,
      role: 'TOURIST',
      touristId: 'TID-1036'
    },
    {
      id: 'usr_tourist_varanasi',
      name: 'Sneha Kulkarni',
      email: 'sneha.k@example.com',
      password: defaultPasswordHash,
      role: 'TOURIST',
      touristId: 'TID-1037'
    },
    {
      id: 'usr_tourist_jaipur',
      name: 'Kabir Rathore',
      email: 'kabir.rathore@example.com',
      password: defaultPasswordHash,
      role: 'TOURIST',
      touristId: 'TID-1038'
    },
    {
      id: 'usr_tourist_tajmahal',
      name: 'Aarav Sharma',
      email: 'aarav.taj@example.com',
      password: defaultPasswordHash,
      role: 'TOURIST',
      touristId: 'TID-1039'
    },
    {
      id: 'usr_tourist_realtime',
      name: 'Real-Time Device Tourist',
      email: 'reallive@safetour.gov.in',
      password: defaultPasswordHash,
      role: 'TOURIST',
      touristId: 'TID-REAL'
    },
    // Verified Local Guides & Demo Guide Accounts
    {
      id: 'usr_guide_ayodhya',
      name: 'Rajesh Sharma',
      email: 'rajesh.guide@safetour.gov.in',
      password: defaultPasswordHash,
      role: 'GUIDE',
      guideId: 'GID-2026-AYODHYA'
    },
    {
      id: 'usr_guide_tajmahal',
      name: 'Imran Khan',
      email: 'imran.guide@safetour.gov.in',
      password: defaultPasswordHash,
      role: 'GUIDE',
      guideId: 'GID-2026-TAJMAHAL'
    },
    {
      id: 'usr_guide_pending',
      name: 'Amitav Sengupta',
      email: 'amitav.pending@safetour.gov.in',
      password: defaultPasswordHash,
      role: 'GUIDE',
      guideId: 'GID-PENDING-001'
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
    },
    // Ayodhya Geo-fences
    {
      id: 'gf_ayodhya_01',
      name: 'Ayodhya Ram Janmabhoomi Pilgrim Corridor',
      type: 'SAFE',
      description: 'CCTV & Drone monitored high-security temple corridor',
      center: { lat: 26.7922, lng: 82.1998 },
      coordinates: [
        [26.802, 82.190],
        [26.802, 82.210],
        [26.782, 82.210],
        [26.782, 82.190]
      ],
      color: '#10B981',
      strokeColor: '#059669'
    },
    {
      id: 'gf_ayodhya_02',
      name: 'Saryu River Deep Water Ghats',
      type: 'CAUTION',
      description: 'Deep river flow hazard - swimming strictly prohibited during high currents',
      center: { lat: 26.7980, lng: 82.2030 },
      coordinates: [
        [26.808, 82.195],
        [26.808, 82.215],
        [26.795, 82.215],
        [26.795, 82.195]
      ],
      color: '#F59E0B',
      strokeColor: '#D97706'
    },
    // Jammu & Kashmir Geo-fences
    {
      id: 'gf_jammu_01',
      name: 'Katra Vaishno Devi Bhawan Safe Corridor',
      type: 'SAFE',
      description: 'RFID tracking & Disaster Management monitored high-altitude trail',
      center: { lat: 32.9934, lng: 74.9328 },
      coordinates: [
        [33.010, 74.915],
        [33.010, 74.950],
        [32.975, 74.950],
        [32.975, 74.915]
      ],
      color: '#10B981',
      strokeColor: '#059669'
    },
    {
      id: 'gf_jammu_02',
      name: 'Banihal High-Altitude Landslide Zone',
      type: 'RESTRICTED',
      description: 'Active landslide & avalanche danger zone - entry requires border clearance',
      center: { lat: 33.4900, lng: 75.2000 },
      coordinates: [
        [33.510, 75.180],
        [33.510, 75.220],
        [33.470, 75.220],
        [33.470, 75.180]
      ],
      color: '#EF4444',
      strokeColor: '#DC2626'
    },
    // Varanasi Geo-fence
    {
      id: 'gf_varanasi_01',
      name: 'Kashi Vishwanath Cultural Safe Perimeter',
      type: 'SAFE',
      description: 'Protected heritage riverfront with tourist police river patrol',
      center: { lat: 25.3109, lng: 83.0107 },
      coordinates: [
        [25.325, 82.995],
        [25.325, 83.025],
        [25.295, 83.025],
        [25.295, 82.995]
      ],
      color: '#10B981',
      strokeColor: '#059669'
    },
    // Jaipur Geo-fences
    {
      id: 'gf_jaipur_01',
      name: 'Amber Fort Heritage Safe Zone',
      type: 'SAFE',
      description: 'UNESCO World Heritage tourist police and guide corridor',
      center: { lat: 26.9855, lng: 75.8513 },
      coordinates: [
        [27.000, 75.835],
        [27.000, 75.865],
        [26.970, 75.865],
        [26.970, 75.835]
      ],
      color: '#10B981',
      strokeColor: '#059669'
    },
    {
      id: 'gf_jaipur_02',
      name: 'Nahargarh Forest Wildlife Buffer',
      type: 'CAUTION',
      description: 'Rugged forest terrain with nocturnal wildlife movement',
      center: { lat: 26.9380, lng: 75.8160 },
      coordinates: [
        [26.955, 75.800],
        [26.955, 75.830],
        [26.920, 75.830],
        [26.920, 75.800]
      ],
      color: '#F59E0B',
      strokeColor: '#D97706'
    },
    {
      id: 'gf_tajmahal_01',
      name: 'Taj Mahal Monument Safe Heritage Perimeter',
      type: 'SAFE',
      shape: 'CIRCLE',
      center: { lat: 27.1751, lng: 78.0421 },
      radiusMeters: 550,
      color: '#10B981',
      strokeColor: '#059669',
      description: 'UNESCO World Heritage Monument and gardens with maximum CISF & Tourist Police security'
    },
    {
      id: 'gf_tajmahal_02',
      name: 'Yamuna River Shoreline Danger Zone',
      type: 'RESTRICTED',
      shape: 'CIRCLE',
      center: { lat: 27.1795, lng: 78.0425 },
      radiusMeters: 380,
      color: '#EF4444',
      strokeColor: '#B91C1C',
      description: 'Prohibited military boundary and dangerous river currents behind Taj Mahal north facade',
      alertMessage: '⚠️ RESTRICTED: Approaching hazardous Yamuna river bank! Please return to paved monument promenade.'
    }
  ];

  // Official Gateway Checkpoints
  const checkpoints = [
    { id: 'CHK-GW-01', name: 'Guwahati Entry Gateway Desk', location: 'Guwahati, Assam', region: 'North East', officerName: 'Insp. Bikram Gogoi', officerId: 'usr_auth_02' },
    { id: 'CHK-TW-02', name: 'Tawang Military & Border Pass', location: 'Tawang, Arunachal Pradesh', region: 'North East', officerName: 'Capt. T. Norbu', officerId: 'usr_auth_03' },
    { id: 'CHK-KZ-03', name: 'Kaziranga Forest Gate Sentinel', location: 'Kohora, Assam', region: 'North East', officerName: 'Range Officer H. Saikia', officerId: 'usr_auth_02' },
    { id: 'CHK-AY-04', name: 'Ayodhya Heritage Entry Corridor', location: 'Ayodhya, Uttar Pradesh', region: 'Central India', officerName: 'Officer R. S. Pandey', officerId: 'usr_auth_01' },
    { id: 'CHK-JK-05', name: 'Katra-Vaishno Devi Highway Checkpost', location: 'Katra, Jammu & Kashmir', region: 'North India', officerName: 'Insp. S. K. Dogra', officerId: 'usr_auth_02' },
    { id: 'CHK-AG-06', name: 'Agra-Taj Safe Tourism Promenade', location: 'Agra, Uttar Pradesh', region: 'North India', officerName: 'Desk Incharge M. Verma', officerId: 'usr_auth_01' }
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
        name: 'Sunita Verma',
        phone: '+91 98765 00001',
        relation: 'Mother'
      },
      bloodGroup: 'O+',
      medicalConditions: 'None',
      allergies: 'None',
      email: 'rohan.verma@example.com',
      idProofType: 'Aadhaar Card',
      idVerificationStatus: 'VERIFIED',
      entryCheckpoint: 'CHK-GW-01',
      origin: { street: '14 MG Road, Indiranagar', city: 'Bengaluru', state: 'Karnataka', country: 'India', postalCode: '560038' },
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
        name: 'Debashis Mukherjee',
        phone: '+91 98111 00000',
        relation: 'Father'
      },
      bloodGroup: 'A+',
      medicalConditions: 'Asthma (Mild)',
      allergies: 'Cold Weather, Dust',
      email: 'priya.m@example.com',
      idProofType: 'Passport',
      idVerificationStatus: 'PROVISIONALLY_ACTIVE',
      entryCheckpoint: 'CHK-GW-01',
      origin: { street: '82 Lake View Park', city: 'Kolkata', state: 'West Bengal', country: 'India', postalCode: '700029' },
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
        name: 'Sarah Miller',
        phone: '+1 415 555 9999',
        relation: 'Spouse'
      },
      bloodGroup: 'B+',
      medicalConditions: 'Hypertension',
      allergies: 'None',
      email: 'david.miller@example.org',
      idProofType: 'Passport',
      idVerificationStatus: 'VERIFIED',
      entryCheckpoint: 'CHK-KZ-03',
      origin: { street: '445 Pine St', city: 'San Francisco', state: 'California', country: 'United States', postalCode: '94104' },
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
        name: 'Vikram Sharma',
        phone: '+91 99887 00000',
        relation: 'Brother'
      },
      bloodGroup: 'O-',
      medicalConditions: 'Altitude sensitivity, Asthma',
      allergies: 'Pollen',
      email: 'aarav.s@example.com',
      idProofType: 'Driving License',
      idVerificationStatus: 'PENDING_REVIEW',
      entryCheckpoint: 'CHK-TW-02',
      origin: { street: 'Flat 402, Shanti Heights', city: 'Jaipur', state: 'Rajasthan', country: 'India', postalCode: '302001' },
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
        name: 'Kevin Chen',
        phone: '+65 9123 0000',
        relation: 'Brother'
      },
      bloodGroup: 'AB+',
      medicalConditions: 'None',
      allergies: 'Peanuts',
      email: 'emily.chen@example.sg',
      idProofType: 'Passport',
      idVerificationStatus: 'VERIFIED',
      entryCheckpoint: 'CHK-GW-01',
      origin: { street: '12 Orchard Blvd', city: 'Singapore', state: 'Singapore', country: 'Singapore', postalCode: '248644' },
      destination: 'Gangtok & Nathula Pass',
      travelStartDate: '2026-08-13',
      travelEndDate: '2026-08-19',
      currentLocation: { lat: 27.3389, lng: 88.6065, address: 'MG Marg, Gangtok' },
      riskScore: 10,
      riskLevel: 'LOW',
      isSosActive: false,
      status: 'SAFE',
      lastSeen: new Date().toISOString()
    },
    {
      id: 'tourist_ayodhya',
      touristId: 'TID-1035',
      fullName: 'Ananya Mishra',
      dob: '1997-08-20',
      gender: 'Female',
      nationality: 'Indian',
      mobileNumber: '+91 94150 11223',
      emergencyContact: {
        name: 'Ramesh Mishra',
        phone: '+91 94150 00001',
        relation: 'Father'
      },
      bloodGroup: 'B+',
      medicalConditions: 'None',
      allergies: 'None reported',
      email: 'ananya.mishra@example.com',
      idProofType: 'Aadhaar Card',
      idVerificationStatus: 'VERIFIED',
      entryCheckpoint: 'CHK-AY-04',
      origin: { street: 'B-12 Civil Lines', city: 'Lucknow', state: 'Uttar Pradesh', country: 'India', postalCode: '226001' },
      destination: 'Ayodhya Ram Janmabhoomi & Saryu Heritage Circuit',
      travelStartDate: '2026-09-01',
      travelEndDate: '2026-09-15',
      currentLocation: { lat: 26.7922, lng: 82.1998, address: 'Ram Janmabhoomi Complex, Ayodhya', speedKmH: 2.8, accuracyMeters: 6 },
      riskScore: 8,
      riskLevel: 'LOW',
      isSosActive: false,
      status: 'SAFE',
      lastSeen: new Date().toISOString()
    },
    {
      id: 'tourist_jammu',
      touristId: 'TID-1036',
      fullName: 'Vikas Chandel',
      dob: '1993-03-14',
      gender: 'Male',
      nationality: 'Indian',
      mobileNumber: '+91 97960 44556',
      emergencyContact: {
        name: 'Sunita Chandel',
        phone: '+91 97960 00002',
        relation: 'Spouse'
      },
      bloodGroup: 'O+',
      allergies: 'Penicillin',
      medicalConditions: 'Mild Altitude Sensitivity',
      email: 'vikas.chandel@example.com',
      idProofType: 'Aadhaar Card',
      idVerificationStatus: 'PROVISIONALLY_ACTIVE',
      entryCheckpoint: 'CHK-JK-05',
      origin: { street: 'House 55, Sector 4', city: 'Chandigarh', state: 'Punjab', country: 'India', postalCode: '160004' },
      destination: 'Katra Vaishno Devi Shrine & Jammu Pilgrim Track',
      travelStartDate: '2026-09-03',
      travelEndDate: '2026-09-12',
      currentLocation: { lat: 32.9934, lng: 74.9328, address: 'Vaishno Devi Bhawan Track, Katra, Jammu', speedKmH: 3.4, accuracyMeters: 8 },
      riskScore: 18,
      riskLevel: 'LOW',
      isSosActive: false,
      status: 'SAFE',
      lastSeen: new Date().toISOString()
    },
    {
      id: 'tourist_varanasi',
      touristId: 'TID-1037',
      fullName: 'Sneha Kulkarni',
      dob: '1999-10-05',
      gender: 'Female',
      nationality: 'Indian',
      mobileNumber: '+91 98220 77889',
      emergencyContact: {
        name: 'Madhusudan Kulkarni',
        phone: '+91 98220 00003',
        relation: 'Father'
      },
      bloodGroup: 'A+',
      allergies: 'Peanuts, Sulfa drugs',
      medicalConditions: 'Altitude sensitivity',
      email: 'sneha.k@example.com',
      idProofType: 'Driving License',
      idVerificationStatus: 'PENDING_REVIEW',
      entryCheckpoint: 'CHK-AY-04',
      origin: { street: '19 FC Road', city: 'Pune', state: 'Maharashtra', country: 'India', postalCode: '411004' },
      destination: 'Kashi Vishwanath Corridor & Ganga Ghats',
      travelStartDate: '2026-09-02',
      travelEndDate: '2026-09-10',
      currentLocation: { lat: 25.3109, lng: 83.0107, address: 'Dashashwamedh Ghat, Varanasi', speedKmH: 2.1, accuracyMeters: 5 },
      riskScore: 12,
      riskLevel: 'LOW',
      isSosActive: false,
      status: 'SAFE',
      lastSeen: new Date().toISOString()
    },
    {
      id: 'tourist_jaipur',
      touristId: 'TID-1038',
      fullName: 'Kabir Rathore',
      dob: '1994-06-18',
      gender: 'Male',
      nationality: 'Indian',
      mobileNumber: '+91 98290 33445',
      emergencyContact: {
        name: 'Pratap Rathore',
        phone: '+91 98290 00004',
        relation: 'Brother'
      },
      bloodGroup: 'O-',
      allergies: 'None reported',
      medicalConditions: 'None',
      email: 'kabir.rathore@example.com',
      idProofType: 'Passport',
      idVerificationStatus: 'VERIFIED',
      entryCheckpoint: 'CHK-AG-06',
      origin: { street: '77 Heritage Lane', city: 'Udaipur', state: 'Rajasthan', country: 'India', postalCode: '313001' },
      destination: 'Amber Fort & Aravalli Heritage Circuit',
      travelStartDate: '2026-09-04',
      travelEndDate: '2026-09-14',
      currentLocation: { lat: 26.9855, lng: 75.8513, address: 'Amber Palace Maota Lake, Jaipur', speedKmH: 4.2, accuracyMeters: 7 },
      riskScore: 35,
      riskLevel: 'MEDIUM',
      isSosActive: false,
      status: 'CAUTION',
      lastSeen: new Date().toISOString()
    },
    {
      id: 'tourist_tajmahal',
      touristId: 'TID-1039',
      fullName: 'Aarav Sharma',
      dob: '1998-11-12',
      gender: 'Male',
      nationality: 'Indian',
      mobileNumber: '+91 98390 55441',
      emergencyContact: {
        name: 'Sunita Sharma',
        phone: '+91 98390 00011',
        relation: 'Mother'
      },
      bloodGroup: 'AB+',
      allergies: 'Dust, Pollen',
      medicalConditions: 'None',
      email: 'aarav.taj@example.com',
      idProofType: 'Aadhaar Card',
      idVerificationStatus: 'VERIFIED',
      entryCheckpoint: 'CHK-AG-06',
      origin: { street: '58 Mall Road', city: 'Kanpur', state: 'Uttar Pradesh', country: 'India', postalCode: '208001' },
      destination: 'Taj Mahal & Agra Heritage Promenade',
      travelStartDate: '2026-09-02',
      travelEndDate: '2026-09-18',
      currentLocation: { lat: 27.1751, lng: 78.0421, address: 'Taj Mahal Complex, Agra', speedKmH: 3.6, accuracyMeters: 5 },
      riskScore: 8,
      riskLevel: 'LOW',
      isSosActive: false,
      status: 'SAFE',
      lastSeen: new Date().toISOString()
    },
    {
      id: 'tourist_realtime',
      touristId: 'TID-REAL',
      fullName: 'My Real-Time Device Location',
      dob: '2000-01-01',
      gender: 'Other',
      nationality: 'Indian',
      mobileNumber: '+91 99999 11222',
      emergencyContact: {
        name: 'National ERSS 112 Desk',
        phone: '112',
        relation: 'Official Emergency'
      },
      bloodGroup: 'O+',
      medicalConditions: 'None',
      allergies: 'None',
      email: 'reallive@safetour.gov.in',
      idProofType: 'Aadhaar Card',
      idVerificationStatus: 'PROVISIONALLY_ACTIVE',
      entryCheckpoint: 'CHK-AY-04',
      origin: { street: 'Real-Time Device GPS Location', city: 'New Delhi', state: 'Delhi', country: 'India', postalCode: '110001' },
      destination: 'Live Real Device GPS Tracking (Mobile/Browser)',
      travelStartDate: '2026-09-01',
      travelEndDate: '2026-09-30',
      currentLocation: { lat: 28.6139, lng: 77.2090, address: '📍 Live Device GPS (Detecting...)', isLiveGps: true, speedKmH: 0, accuracyMeters: 5 },
      riskScore: 10,
      riskLevel: 'LOW',
      isSosActive: false,
      status: 'SAFE',
      lastSeen: new Date().toISOString()
    }
  ];

  // Set isDemo and isRealUser flags on seed tourists
  tourists.forEach((t) => {
    if (t.touristId === 'TID-REAL') {
      t.isDemo = false;
      t.isRealUser = true;
    } else {
      t.isDemo = true;
      t.isRealUser = false;
    }
  });

  // Digital IDs with SHA-256 Hashes & Offline ECDSA Envelopes
  const digitalIds = tourists.map((t) => {
    const rawString = `${t.touristId}:${t.fullName}:${t.dob}:${t.nationality}:${t.idProofType}`;
    const touristIdHash = crypto.createHash('sha256').update(t.touristId).digest('hex');
    const digitalIdHash = crypto.createHash('sha256').update(rawString).digest('hex');

    // Add block to prototype blockchain ledger
    const block = blockchainInstance.addBlock({
      touristId: t.touristId,
      touristIdHash,
      digitalIdHash,
      verificationStatus: t.idVerificationStatus || 'VERIFIED',
      issuer: 'S.A.F.A.R. National Tourism Safety Authority',
      network: 'S.A.F.A.R. Zero-Gas Consortium Ledger',
      travelValidity: `${t.travelStartDate} to ${t.travelEndDate}`
    });

    // Offline Envelope for Cryptographic Local Verification
    const compactEnvelope = {
      uuid: t.touristId,
      bloodGroup: t.bloodGroup || 'O+',
      exp: t.travelEndDate,
      checkpointId: t.entryCheckpoint || 'CHK-GW-01',
      status: t.idVerificationStatus || 'VERIFIED',
      txHash: block.hash
    };
    const ecdsaSignature = blockchainInstance.signOfflineEnvelope(compactEnvelope);
    compactEnvelope.sig = ecdsaSignature;

    return {
      id: `did_${t.touristId}`,
      touristId: t.touristId,
      fullName: t.fullName,
      verificationStatus: t.idVerificationStatus || 'VERIFIED',
      touristIdHash,
      digitalIdHash,
      blockIndex: block.index,
      blockchainTxHash: block.hash,
      issuedAt: block.timestamp,
      expiryDate: t.travelEndDate,
      digitalSignature: `SIG-ECDSA-${ecdsaSignature.substring(0, 16).toUpperCase()}`,
      offlineEnvelope: compactEnvelope,
      qrCodeData: `https://safetour.gov.in/verify/${digitalIdHash.substring(0, 16)}`
    };
  });

  // Medical Profiles
  const medicalProfiles = tourists.map((t) => ({
    id: `med_${t.touristId}`,
    touristId: t.touristId,
    bloodGroup: t.bloodGroup || 'O+',
    conditions: t.medicalConditions ? [t.medicalConditions] : ['None reported'],
    allergies: t.allergies || 'None reported',
    emergencyContact: t.emergencyContact || { name: 'ERSS Desk', phone: '112', relation: 'Official Emergency' },
    lastUpdated: new Date().toISOString()
  }));

  // Verification Records
  const verificationRecords = tourists.map((t) => {
    const medDigest = crypto.createHash('sha256').update(`${t.bloodGroup || 'O+'}:${t.medicalConditions || 'None'}:${t.allergies || 'None'}`).digest('hex');
    const did = digitalIds.find((d) => d.touristId === t.touristId);
    return {
      id: `vr_${t.touristId}`,
      touristId: t.touristId,
      fullName: t.fullName,
      status: t.idVerificationStatus || 'VERIFIED',
      entryCheckpoint: t.entryCheckpoint || 'CHK-GW-01',
      intendedRoute: t.destination,
      origin: t.origin || { city: 'Guwahati', state: 'Assam', country: 'India' },
      govtIdProofType: t.idProofType,
      govtIdPreviewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
      medicalDataDigest: medDigest,
      approvingOfficerId: t.idVerificationStatus === 'VERIFIED' ? 'usr_auth_02' : (t.idVerificationStatus === 'PROVISIONALLY_ACTIVE' ? 'DIGILOCKER_EKYC_SYSTEM' : null),
      approvingOfficerName: t.idVerificationStatus === 'VERIFIED' ? 'Insp. Bikram Gogoi' : (t.idVerificationStatus === 'PROVISIONALLY_ACTIVE' ? 'DigiLocker Fast-Track System' : null),
      approvalTimestamp: t.idVerificationStatus === 'VERIFIED' ? did?.issuedAt : null,
      rejectionReason: null,
      blockchainTxHash: did?.blockchainTxHash || null,
      offlineEnvelope: did?.offlineEnvelope || null,
      createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      updatedAt: new Date().toISOString()
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
      availability: 'Monsoon Hazard Quick Response'
    },
    {
      id: 'es_ayodhya',
      name: 'Ayodhya Shri Ram Hospital & Tourist Police Unit',
      type: 'POLICE',
      phone: '112 / +91 5278 232 001',
      address: 'Ram Katha Park, Ayodhya, UP',
      location: { lat: 26.7950, lng: 82.2020 },
      distanceKm: 0.8,
      availability: '24/7 Rapid Pilgrim Response'
    },
    {
      id: 'es_jammu',
      name: 'Katra Shrine Board Emergency Medical Center',
      type: 'HOSPITAL',
      phone: '112 / +91 1991 232 022',
      address: 'Central Yatri Hub, Katra, Jammu',
      location: { lat: 32.9900, lng: 74.9300 },
      distanceKm: 1.1,
      availability: '24/7 Mountain Medevac'
    },
    {
      id: 'es_varanasi',
      name: 'Kashi Vishwanath Corridor Tourist Safety Desk',
      type: 'POLICE',
      phone: '112 / +91 542 250 8822',
      address: 'Gowdowlia Gate, Varanasi, UP',
      location: { lat: 25.3115, lng: 83.0080 },
      distanceKm: 0.6,
      availability: '24/7 River & Ghat Sentinel'
    },
    {
      id: 'es_jaipur',
      name: 'Rajasthan Tourist Assistance Force (TAF) Amber Post',
      type: 'POLICE',
      phone: '112 / +91 141 253 0143',
      address: 'Amber Fort Road, Jaipur, Rajasthan',
      location: { lat: 26.9880, lng: 75.8530 },
      distanceKm: 0.5,
      availability: '24/7 Heritage Patrol'
    },
    {
      id: 'es_tajmahal',
      name: 'Agra Tajganj Tourist Police & Emergency First Aid Station',
      type: 'POLICE',
      phone: '112 / +91 562 222 6112',
      address: 'Taj East Gate Promenade, Tajganj, Agra, UP 282001',
      location: { lat: 27.1725, lng: 78.0400 },
      distanceKm: 0.4,
      availability: '24/7 UNESCO Sentinel & Medical'
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

  // S.A.F.A.R. Verified Local Tourist Guides
  const guides = [
    {
      id: 'guide_01',
      guideId: 'GID-2026-AYODHYA',
      userId: 'usr_guide_ayodhya',
      fullName: 'Rajesh Sharma',
      email: 'rajesh.guide@safetour.gov.in',
      phone: '+91 98390 11223',
      city: 'Ayodhya',
      operatingDestinations: ['Ayodhya', 'Ram Janmabhoomi', 'Saryu Ghat', 'Hanuman Garhi', 'Kanak Bhawan'],
      languages: ['Hindi', 'English', 'Sanskrit'],
      experienceYears: 8,
      specialization: 'Spiritual & Heritage Corridor',
      idProofType: 'Ministry of Tourism License',
      idProofNumber: 'MOT-UP-AYD-2024-88',
      bio: 'Certified Grade-A Heritage Guide for Ayodhya Pilgrim & Ramayana Circuit. 8+ years guiding pilgrims, international guests, and dignitaries.',
      dailyRate: 1500,
      hourlyRate: 350,
      status: 'VERIFIED',
      isAvailable: true,
      rating: 4.9,
      totalReviews: 48,
      toursCompleted: 142,
      policeVerificationStatus: 'VERIFIED',
      digitalId: {
        guideId: 'GID-2026-AYODHYA',
        fullName: 'Rajesh Sharma',
        issuer: 'Ministry of Tourism, Govt. of India (S.A.F.A.R.)',
        issuedAt: '2026-01-15T10:00:00.000Z',
        expiryDate: '2028-01-15',
        digitalIdHash: '7a9f8c02b1e4569d8a34bc98e721ef65d8a9012bcfe89410ef32490ab8124cd1',
        blockchainTxHash: '0000a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abc',
        qrCodeData: 'https://safetour.gov.in/guide/verify/GID-2026-AYODHYA?hash=7a9f8c02b1e4569d'
      },
      reviews: [
        {
          id: 'rev_01',
          touristName: 'Ananya Mishra',
          touristId: 'TID-1035',
          rating: 5,
          comment: 'Very polite, showed us all historical facets of Saryu and temple corridor safely!',
          date: '2026-08-16'
        },
        {
          id: 'rev_02',
          touristName: 'Dr. S. K. Verma',
          touristId: 'TID-1024',
          rating: 4.8,
          comment: 'Extremely knowledgeable about ancient architecture and Ramayana history.',
          date: '2026-07-28'
        }
      ],
      createdAt: '2026-01-15T09:30:00.000Z'
    },
    {
      id: 'guide_02',
      guideId: 'GID-2026-TAJMAHAL',
      userId: 'usr_guide_tajmahal',
      fullName: 'Imran Khan',
      email: 'imran.guide@safetour.gov.in',
      phone: '+91 94120 44556',
      city: 'Agra',
      operatingDestinations: ['Taj Mahal', 'Agra Fort', 'Fatehpur Sikri', 'Mehtab Bagh'],
      languages: ['Hindi', 'English', 'French', 'Urdu'],
      experienceYears: 11,
      specialization: 'Mughal Architecture & UNESCO World Heritage',
      idProofType: 'Ministry of Tourism License',
      idProofNumber: 'MOT-UP-AGR-2022-104',
      bio: 'National Regional Level Guide (Northern Region). Expert in Mughal monument aesthetics, conservation and photography guidance.',
      dailyRate: 1800,
      hourlyRate: 400,
      status: 'VERIFIED',
      isAvailable: true,
      rating: 4.8,
      totalReviews: 82,
      toursCompleted: 310,
      policeVerificationStatus: 'VERIFIED',
      digitalId: {
        guideId: 'GID-2026-TAJMAHAL',
        fullName: 'Imran Khan',
        issuer: 'Ministry of Tourism, Govt. of India (S.A.F.A.R.)',
        issuedAt: '2026-01-20T11:00:00.000Z',
        expiryDate: '2028-01-20',
        digitalIdHash: '8b0a9d13c2f5670e9b45cd09f832fe76e9b0123cdef90521fa43501bc9235de2',
        blockchainTxHash: '0000b2c3d4e5f6a7890123456789bcdef0123456789abcdef0123456789abcde',
        qrCodeData: 'https://safetour.gov.in/guide/verify/GID-2026-TAJMAHAL?hash=8b0a9d13c2f5670e'
      },
      reviews: [
        {
          id: 'rev_03',
          touristName: 'Emily Chen',
          touristId: 'TID-1028',
          rating: 5,
          comment: 'Imran made our Taj visit magical! Handled tickets, security checks and told great historical stories.',
          date: '2026-08-05'
        }
      ],
      createdAt: '2026-01-20T10:00:00.000Z'
    },
    {
      id: 'guide_03',
      guideId: 'GID-2026-KAZIRANGA',
      userId: 'usr_guide_kaziranga',
      fullName: 'Bhaben Borah',
      email: 'bhaben.guide@safetour.gov.in',
      phone: '+91 94350 99881',
      city: 'Kaziranga / Guwahati',
      operatingDestinations: ['Kaziranga National Park', 'Guwahati', 'Kamakhya Temple', 'Brahmaputra Cruise', 'Pobitora'],
      languages: ['Assamese', 'Hindi', 'English', 'Bengali'],
      experienceYears: 7,
      specialization: 'Wildlife Tracking, Eco-Tourism & Birding Safari',
      idProofType: 'Assam Forest Dept Naturalist Badge',
      idProofNumber: 'ATDC-KZ-2023-45',
      bio: 'Eco-guide & wildlife tracker. Licensed by Assam Tourism Development Corp and Kaziranga Forest Authority.',
      dailyRate: 1600,
      hourlyRate: 350,
      status: 'VERIFIED',
      isAvailable: true,
      rating: 4.9,
      totalReviews: 36,
      toursCompleted: 98,
      policeVerificationStatus: 'VERIFIED',
      digitalId: {
        guideId: 'GID-2026-KAZIRANGA',
        fullName: 'Bhaben Borah',
        issuer: 'Ministry of Tourism, Govt. of India (S.A.F.A.R.)',
        issuedAt: '2026-02-01T09:00:00.000Z',
        expiryDate: '2028-02-01',
        digitalIdHash: '9c1bae24d3a6781fac56de10a943af87fa01234defa01632ab54612cd0346ef3',
        blockchainTxHash: '0000c3d4e5f6a7b890123456789cdef0123456789abcdef0123456789abcdef0',
        qrCodeData: 'https://safetour.gov.in/guide/verify/GID-2026-KAZIRANGA?hash=9c1bae24d3a6781f'
      },
      reviews: [
        {
          id: 'rev_04',
          touristName: 'Priya Mukherjee',
          touristId: 'TID-1025',
          rating: 5,
          comment: 'Safely guided through safari buffer zones, spotted rhinos and hornbills!',
          date: '2026-08-11'
        }
      ],
      createdAt: '2026-02-01T08:00:00.000Z'
    },
    {
      id: 'guide_04',
      guideId: 'GID-2026-VARANASI',
      userId: 'usr_guide_varanasi',
      fullName: 'Acharya Vishwanath Pandey',
      email: 'vishwanath.guide@safetour.gov.in',
      phone: '+91 94500 33221',
      city: 'Varanasi',
      operatingDestinations: ['Varanasi', 'Kashi Vishwanath', 'Dashashwamedh Ghat', 'Sarnath', 'Assi Ghat'],
      languages: ['Hindi', 'English', 'Gujarati', 'Sanskrit'],
      experienceYears: 14,
      specialization: 'Ghat Heritage, Ganga Aarti & Vedic Culture',
      idProofType: 'Ministry of Tourism License',
      idProofNumber: 'MOT-UP-VNS-2021-33',
      bio: 'Senior cultural interpreter for Kashi heritage corridor and Ganga twilight aarti ceremonies.',
      dailyRate: 1500,
      hourlyRate: 300,
      status: 'VERIFIED',
      isAvailable: true,
      rating: 5.0,
      totalReviews: 64,
      toursCompleted: 220,
      policeVerificationStatus: 'VERIFIED',
      digitalId: {
        guideId: 'GID-2026-VARANASI',
        fullName: 'Acharya Vishwanath Pandey',
        issuer: 'Ministry of Tourism, Govt. of India (S.A.F.A.R.)',
        issuedAt: '2026-01-10T10:00:00.000Z',
        expiryDate: '2028-01-10',
        digitalIdHash: 'ad2cbf35e4b7892abd67ef21b054bf98ab12345efb012743bc65723de1457fa4',
        blockchainTxHash: '0000d4e5f6a7b8c90123456789def0123456789abcdef0123456789abcdef01',
        qrCodeData: 'https://safetour.gov.in/guide/verify/GID-2026-VARANASI?hash=ad2cbf35e4b7892a'
      },
      reviews: [],
      createdAt: '2026-01-10T09:00:00.000Z'
    },
    {
      id: 'guide_05',
      guideId: 'GID-2026-JAIPUR',
      userId: 'usr_guide_jaipur',
      fullName: 'Vikram Singh Rathore',
      email: 'vikram.guide@safetour.gov.in',
      phone: '+91 98290 77889',
      city: 'Jaipur',
      operatingDestinations: ['Jaipur', 'Amber Fort', 'Hawa Mahal', 'City Palace', 'Nahargarh Fort'],
      languages: ['Hindi', 'English', 'Marwari', 'German'],
      experienceYears: 9,
      specialization: 'Royal Forts, Rajputana History & Traditional Crafts',
      idProofType: 'Rajasthan Tourism Dept Badge',
      idProofNumber: 'RTDC-JP-2023-77',
      bio: 'Registered state guide for Pink City heritage circuits. Specialist in Amber fort history and night tours.',
      dailyRate: 1600,
      hourlyRate: 350,
      status: 'VERIFIED',
      isAvailable: true,
      rating: 4.7,
      totalReviews: 41,
      toursCompleted: 165,
      policeVerificationStatus: 'VERIFIED',
      digitalId: {
        guideId: 'GID-2026-JAIPUR',
        fullName: 'Vikram Singh Rathore',
        issuer: 'Ministry of Tourism, Govt. of India (S.A.F.A.R.)',
        issuedAt: '2026-02-10T11:00:00.000Z',
        expiryDate: '2028-02-10',
        digitalIdHash: 'be3dca46f5c8903bce78fa32c165ca09bc23456fac013854cd76834ef2568ab5',
        blockchainTxHash: '0000e5f6a7b8c9d0123456789ef0123456789abcdef0123456789abcdef012',
        qrCodeData: 'https://safetour.gov.in/guide/verify/GID-2026-JAIPUR?hash=be3dca46f5c8903b'
      },
      reviews: [],
      createdAt: '2026-02-10T10:00:00.000Z'
    },
    {
      id: 'guide_06',
      guideId: 'GID-2026-JAMMU',
      userId: 'usr_guide_jammu',
      fullName: 'Sunil Kotwal',
      email: 'sunil.guide@safetour.gov.in',
      phone: '+91 97970 22334',
      city: 'Jammu / Katra',
      operatingDestinations: ['Katra', 'Vaishno Devi Bhawan', 'Bhairon Temple', 'Jammu', 'Patnitop'],
      languages: ['Dogri', 'Hindi', 'English', 'Punjabi'],
      experienceYears: 6,
      specialization: 'High Altitude Pilgrimage & Disaster Evacuation Assistance',
      idProofType: 'Shri Mata Vaishno Devi Shrine Board Permit',
      idProofNumber: 'SMVDSB-GD-2024-19',
      bio: 'Certified pilgrim guide and first-responder certified by Disaster Management unit for Vaishno Devi track.',
      dailyRate: 1400,
      hourlyRate: 300,
      status: 'VERIFIED',
      isAvailable: true,
      rating: 4.9,
      totalReviews: 29,
      toursCompleted: 112,
      policeVerificationStatus: 'VERIFIED',
      digitalId: {
        guideId: 'GID-2026-JAMMU',
        fullName: 'Sunil Kotwal',
        issuer: 'Ministry of Tourism, Govt. of India (S.A.F.A.R.)',
        issuedAt: '2026-02-15T09:30:00.000Z',
        expiryDate: '2028-02-15',
        digitalIdHash: 'cf4edb57a6d9014cdf89ab43d276db10cd34567abd014965de87945fa3679bc6',
        blockchainTxHash: '0000f6a7b8c9d0e123456789f0123456789abcdef0123456789abcdef0123',
        qrCodeData: 'https://safetour.gov.in/guide/verify/GID-2026-JAMMU?hash=cf4edb57a6d9014c'
      },
      reviews: [],
      createdAt: '2026-02-15T08:30:00.000Z'
    },
    // Pending Verification Guide (For Authority Desk Approval Demo)
    {
      id: 'guide_07',
      guideId: 'GID-PENDING-001',
      userId: 'usr_guide_pending',
      fullName: 'Amitav Sengupta',
      email: 'amitav.pending@safetour.gov.in',
      phone: '+91 98300 55667',
      city: 'Guwahati / Shillong',
      operatingDestinations: ['Guwahati', 'Shillong', 'Cherrapunji', 'Dawki River'],
      languages: ['Bengali', 'Hindi', 'English', 'Khasi'],
      experienceYears: 4,
      specialization: 'Adventure Caving, Living Root Bridges & Monsoon Trekking',
      idProofType: 'Aadhaar Card & Tourism Diploma',
      idProofNumber: 'AADHAAR-8901-2345-6789',
      bio: 'Certified trekking enthusiast and Meghalaya caves naturalist. Awaiting central authority verification of documents.',
      dailyRate: 1400,
      hourlyRate: 300,
      status: 'PENDING_VERIFICATION',
      isAvailable: false,
      rating: 0,
      totalReviews: 0,
      toursCompleted: 0,
      policeVerificationStatus: 'PENDING',
      digitalId: null,
      reviews: [],
      createdAt: new Date().toISOString()
    }
  ];

  // Tourist Local Guide Requests
  const guideRequests = [
    {
      id: 'req_demo_01',
      touristId: 'TID-1035',
      touristName: 'Ananya Mishra',
      touristPhone: '+91 98765 43210',
      destination: 'Ayodhya Ram Janmabhoomi Pilgrim Corridor',
      city: 'Ayodhya',
      preferredLanguage: 'Hindi',
      travelDate: '2026-08-16',
      tourType: 'Spiritual & Temple Darshan',
      notes: 'Need elderly family friendly route with minimum staircase walking.',
      status: 'ASSIGNED',
      assignedGuideId: 'GID-2026-AYODHYA',
      assignedGuideName: 'Rajesh Sharma',
      assignedGuidePhone: '+91 98390 11223',
      assignedAt: '2026-08-15T10:00:00.000Z',
      createdAt: '2026-08-15T09:00:00.000Z'
    },
    {
      id: 'req_demo_02',
      touristId: 'TID-1039',
      touristName: 'Aarav Sharma',
      touristPhone: '+91 99887 76655',
      destination: 'Taj Mahal Monument Safe Heritage Perimeter',
      city: 'Agra',
      preferredLanguage: 'English',
      travelDate: '2026-08-20',
      tourType: 'Heritage & Architectural Photography',
      notes: 'Sunrise visit to eastern gate and Mehtab Bagh reflection spot.',
      status: 'PENDING_ASSIGNMENT',
      assignedGuideId: null,
      assignedGuideName: null,
      assignedGuidePhone: null,
      assignedAt: null,
      createdAt: new Date(Date.now() - 30 * 60000).toISOString()
    }
  ];

  // Tourist Complaints against Guides
  const guideComplaints = [
    {
      id: 'comp_01',
      touristId: 'TID-1027',
      touristName: 'Aarav Sharma',
      touristPhone: '+91 99887 76655',
      guideId: 'GID-2026-TAJMAHAL',
      guideName: 'Imran Khan',
      category: 'Overcharging / Tariff Discrepancy',
      description: 'Requested extra tip for camera permit assistance outside standard pre-fixed tariff.',
      status: 'INVESTIGATING', // 'PENDING' | 'INVESTIGATING' | 'WARNING_ISSUED' | 'SUSPENDED' | 'RESOLVED'
      urgency: 'MEDIUM',
      actionTaken: 'Contacted guide for clarification regarding authorized locker receipt.',
      createdAt: new Date(Date.now() - 120 * 60000).toISOString()
    }
  ];

  return {
    users,
    geofences,
    tourists,
    digitalIds,
    emergencyServices,
    incidents,
    trips,
    checkpoints,
    verificationRecords,
    medicalProfiles,
    guides,
    guideRequests,
    guideComplaints
  };
}

module.exports = {
  getInitialData
};
