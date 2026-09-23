const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { blockchainInstance } = require('../services/blockchainService');

function getInitialData() {
  const defaultPasswordHash = bcrypt.hashSync('admin123', 10);
  const dgPasswordHash = bcrypt.hashSync('12345678', 10);

  // Authority & Admin Accounts
  const users = [
    {
      id: 'usr_auth_dg_01',
      name: 'Director General Akhil Gupta',
      email: 'akhil@gmail.com',
      password: dgPasswordHash,
      role: 'AUTHORITY',
      isMasterAuthority: true,
      status: 'APPROVED',
      department: 'S.A.F.A.R. Supreme Central Command Desk',
      designation: 'Director General & Supreme Authority',
      serviceBadgeId: 'DG-SAFAR-001',
      jurisdiction: 'National Tourism Safety Grid (Pan-India)',
      phone: '+91 98100 12345'
    },
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
      id: 'usr_tourist_anshika',
      name: 'Anshika Shukla',
      email: 'anshikab1306@gmail.com',
      password: defaultPasswordHash,
      role: 'TOURIST',
      touristId: 'TID-1306'
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
    },
    // Verified Tour & Safety Partner
    {
      id: 'usr_partner_01',
      name: 'Himalayan Tours & Treks',
      email: 'contact@himalayantours.in',
      password: defaultPasswordHash,
      role: 'PARTNER',
      status: 'APPROVED',
      phone: '+91 98123 45678',
      partnerId: 'PRT-101'
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

  // Registered Tourists
  const tourists = [
    {
      id: 'tourist_anshika',
      touristId: 'TID-1306',
      fullName: 'Anshika Shukla',
      dob: '2002-06-13',
      gender: 'Female',
      nationality: 'Indian',
      preferredLanguage: 'hi',
      mobileNumber: '+91 98765 43210',
      emergencyContact: {
        name: 'Family Contact',
        phone: '+91 98765 00001',
        relation: 'Family'
      },
      email: 'anshikab1306@gmail.com',
      idProofType: 'Aadhaar Card',
      idVerificationStatus: 'VERIFIED',
      destination: 'Ayodhya & Saryu Heritage Circuit',
      travelStartDate: '2026-09-01',
      travelEndDate: '2026-10-31',
      currentLocation: { lat: 26.7980, lng: 82.2040, address: 'Ram Ki Paidi, Ayodhya', isLiveGps: true },
      riskScore: 8,
      riskLevel: 'LOW',
      isSosActive: false,
      status: 'SAFE',
      lastSeen: new Date().toISOString()
    },
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
        name: 'Ramesh Mishra (Father)',
        phone: '+91 94150 00001',
        relation: 'Father'
      },
      bloodGroup: 'B+',
      allergies: 'None reported',
      medicalConditions: 'None',
      email: 'ananya.mishra@example.com',
      idProofType: 'Aadhaar Card',
      idVerificationStatus: 'VERIFIED',
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
        name: 'Sunita Chandel (Spouse)',
        phone: '+91 97960 00002',
        relation: 'Spouse'
      },
      bloodGroup: 'O+',
      allergies: 'Penicillin',
      medicalConditions: 'Mild Altitude Sensitivity',
      email: 'vikas.chandel@example.com',
      idProofType: 'Aadhaar Card',
      idVerificationStatus: 'VERIFIED',
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
        name: 'Madhusudan Kulkarni (Father)',
        phone: '+91 98220 00003',
        relation: 'Father'
      },
      bloodGroup: 'A+',
      allergies: 'Peanuts, Sulfa drugs',
      medicalConditions: 'None',
      email: 'sneha.k@example.com',
      idProofType: 'Driving License',
      idVerificationStatus: 'VERIFIED',
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
        name: 'Pratap Rathore (Brother)',
        phone: '+91 98290 00004',
        relation: 'Brother'
      },
      bloodGroup: 'O-',
      allergies: 'None reported',
      medicalConditions: 'None',
      email: 'kabir.rathore@example.com',
      idProofType: 'Passport',
      idVerificationStatus: 'VERIFIED',
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
        name: 'Sunita Sharma (Mother)',
        phone: '+91 98390 00011',
        relation: 'Mother'
      },
      bloodGroup: 'AB+',
      allergies: 'Dust, Pollen',
      medicalConditions: 'None',
      email: 'aarav.taj@example.com',
      idProofType: 'Aadhaar Card',
      idVerificationStatus: 'VERIFIED',
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
      email: 'reallive@safetour.gov.in',
      idProofType: 'Aadhaar Card',
      idVerificationStatus: 'VERIFIED',
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

  // 1. SAFAR Certified Partners (Hotels, Restaurants, Cafes)
  const partners = [
    {
      id: 'part_01',
      name: 'Hotel Grand Ayodhya Heritage',
      type: 'HOTEL',
      location: 'Ayodhya',
      address: 'Ram Path, Near Circuit House, Ayodhya, UP',
      status: 'ACTIVE',
      rewardCoins: 1,
      isSpecialEco: false,
      contactPhone: '+91 98765 43210',
      rating: 4.8,
      description: 'Solar-powered eco-heritage hotel on the sacred Ram Path corridor.',
      discountPolicy: [
        { coins: 10, discountPercent: 2 },
        { coins: 25, discountPercent: 5 },
        { coins: 50, discountPercent: 10 },
        { coins: 100, discountPercent: 20 }
      ],
      maximumDiscount: 20
    },
    {
      id: 'part_02',
      name: 'Sarayu Riverfront Eco Resort',
      type: 'HOTEL',
      location: 'Ayodhya',
      address: 'Guptar Ghat Road, Ayodhya, UP',
      status: 'ACTIVE',
      rewardCoins: 2,
      isSpecialEco: true,
      contactPhone: '+91 98765 43211',
      rating: 4.9,
      description: 'Certified 0-waste luxury eco-resort on the tranquil banks of River Sarayu.',
      discountPolicy: [
        { coins: 10, discountPercent: 2 },
        { coins: 25, discountPercent: 5 },
        { coins: 50, discountPercent: 8 },
        { coins: 100, discountPercent: 15 }
      ],
      maximumDiscount: 15
    },
    {
      id: 'part_03',
      name: 'Taj View Eco Bistro & Cafe',
      type: 'CAFE',
      location: 'Agra',
      address: 'Taj East Gate Road, Agra, UP',
      status: 'ACTIVE',
      rewardCoins: 1,
      isSpecialEco: false,
      contactPhone: '+91 98765 43212',
      rating: 4.7,
      description: 'Panoramic rooftop view of Taj Mahal with organic farm-to-table beverages.',
      discountPolicy: [
        { coins: 10, discountPercent: 1 },
        { coins: 25, discountPercent: 3 },
        { coins: 50, discountPercent: 5 }
      ],
      maximumDiscount: 5
    },
    {
      id: 'part_04',
      name: 'Royal Awadh Dining & Pure Veg',
      type: 'RESTAURANT',
      location: 'Ayodhya',
      address: 'Civil Lines, Ayodhya, UP',
      status: 'ACTIVE',
      rewardCoins: 1,
      isSpecialEco: false,
      contactPhone: '+91 98765 43213',
      rating: 4.6,
      description: 'Authentic Satvik Awadhi delicacies cooked with organic ingredients.',
      discountPolicy: [
        { coins: 10, discountPercent: 1 },
        { coins: 25, discountPercent: 4 },
        { coins: 50, discountPercent: 7 },
        { coins: 100, discountPercent: 10 }
      ],
      maximumDiscount: 10
    },
    {
      id: 'part_05',
      name: 'Kashi Organic Thali Heritage',
      type: 'RESTAURANT',
      location: 'Varanasi',
      address: 'Assi Ghat Road, Varanasi, UP',
      status: 'ACTIVE',
      rewardCoins: 2,
      isSpecialEco: true,
      contactPhone: '+91 98765 43214',
      rating: 4.8,
      description: 'Traditional multi-course Banarasi Thali using locally farmed millets and solar kitchen.',
      discountPolicy: [
        { coins: 10, discountPercent: 3 },
        { coins: 25, discountPercent: 6 },
        { coins: 50, discountPercent: 12 },
        { coins: 100, discountPercent: 18 }
      ],
      maximumDiscount: 18
    },
    {
      id: 'part_06',
      name: 'Brahmaputra Breeze Green Cafe',
      type: 'CAFE',
      location: 'Guwahati',
      address: 'MG Road, Riverside Walk, Guwahati, Assam',
      status: 'ACTIVE',
      rewardCoins: 1,
      isSpecialEco: false,
      contactPhone: '+91 98765 43215',
      rating: 4.5,
      description: 'Eco-friendly tea lounge serving indigenous organic Assam green teas.',
      discountPolicy: [
        { coins: 10, discountPercent: 2 },
        { coins: 25, discountPercent: 4 },
        { coins: 50, discountPercent: 8 }
      ],
      maximumDiscount: 8
    },
    {
      id: 'part_07',
      name: 'Himalayan Pine Valley Hotel',
      type: 'HOTEL',
      location: 'Jammu',
      address: 'Katra Main Road, Katra, Jammu & Kashmir',
      status: 'ACTIVE',
      rewardCoins: 1,
      isSpecialEco: false,
      contactPhone: '+91 98765 43216',
      rating: 4.7,
      description: 'Eco-certified pilgrim hotel with renewable water heating and mountain views.',
      discountPolicy: [
        { coins: 10, discountPercent: 2 },
        { coins: 25, discountPercent: 5 },
        { coins: 50, discountPercent: 10 },
        { coins: 100, discountPercent: 20 }
      ],
      maximumDiscount: 20
    },
    {
      id: 'part_08',
      name: 'Non-Partner Sample Diner',
      type: 'OTHER',
      location: 'Ayodhya',
      address: 'Station Road, Ayodhya, UP',
      status: 'INACTIVE',
      rewardCoins: 0,
      isSpecialEco: false,
      contactPhone: '+91 98765 43299',
      rating: 3.2,
      description: 'Demo inactive commercial establishment (not eligible for green rewards).',
      discountPolicy: [],
      maximumDiscount: 0
    },
    {
      id: 'part_himalayan_01',
      partnerId: 'PRT-101',
      userId: 'usr_partner_01',
      businessName: 'Himalayan Tours & Treks',
      name: 'Himalayan Tours & Treks',
      contactEmail: 'contact@himalayantours.in',
      contactPhone: '+91 98123 45678',
      address: 'Near Old Bus Stand, Manali / Ayodhya Office',
      registrationNumber: 'HP-TO-2024-8841',
      status: 'APPROVED',
      createdAt: new Date().toISOString()
    }
  ];

  // 2. Global Reward System Configuration
  const rewardConfig = [
    {
      id: 'config_global_rewards',
      maxDiscountCap: 20, // Strict SAFAR System Hard Maximum Limit
      minPayablePercent: 80, // A bill can NEVER be free!
      ecoVehicleRates: {
        'E-Rickshaw': 1,
        'E-Auto': 1,
        'Electric Cab': 2,
        'Electric Bus': 1,
        'Other EV': 1
      },
      partnerBaseRate: 1,
      specialEcoPartnerRate: 2,
      defaultTiers: [
        { minCoins: 1, maxCoins: 9, discountPercent: 1 },
        { minCoins: 10, maxCoins: 24, discountPercent: 3 },
        { minCoins: 25, maxCoins: 49, discountPercent: 5 },
        { minCoins: 50, maxCoins: 74, discountPercent: 10 },
        { minCoins: 75, maxCoins: 99, discountPercent: 15 },
        { minCoins: 100, maxCoins: 999999, discountPercent: 20 }
      ]
    }
  ];

  // 3. Green Rewards Submissions (Approved records totaling 27 coins for TID-1035 + Pending records for testing)
  const greenRewards = [
    // --- Approved Submissions for TID-1035 (Ananya Mishra) ---
    // Source A: Eco Travel (+15 coins)
    {
      id: 'gr_01',
      touristId: 'TID-1035',
      touristName: 'Ananya Mishra',
      activityType: 'ECO_VEHICLE',
      vehicleType: 'Electric Cab',
      vehicleNumber: 'UP-42-EV-1001',
      partnerId: null,
      partnerName: null,
      farePaid: 650,
      status: 'APPROVED',
      coins: 2,
      sourceCategory: 'Eco Travel',
      proofImage: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
      proofHash: 'hash_gr_01_demo_ev',
      submittedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      verifiedAt: new Date(Date.now() - 14 * 86400000 + 3600000).toISOString(),
      verifiedBy: 'S.A.F.A.R. Authority Desk (Dr. Ananya Sharma)'
    },
    {
      id: 'gr_02',
      touristId: 'TID-1035',
      touristName: 'Ananya Mishra',
      activityType: 'ECO_VEHICLE',
      vehicleType: 'E-Rickshaw',
      vehicleNumber: 'UP-42-ER-2002',
      partnerId: null,
      partnerName: null,
      farePaid: 80,
      status: 'APPROVED',
      coins: 1,
      sourceCategory: 'Eco Travel',
      proofImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80',
      proofHash: 'hash_gr_02_demo_er',
      submittedAt: new Date(Date.now() - 13 * 86400000).toISOString(),
      verifiedAt: new Date(Date.now() - 13 * 86400000 + 3600000).toISOString(),
      verifiedBy: 'S.A.F.A.R. Authority Desk (Dr. Ananya Sharma)'
    },
    {
      id: 'gr_03',
      touristId: 'TID-1035',
      touristName: 'Ananya Mishra',
      activityType: 'ECO_VEHICLE',
      vehicleType: 'Electric Cab',
      vehicleNumber: 'UP-42-EV-1003',
      partnerId: null,
      partnerName: null,
      farePaid: 720,
      status: 'APPROVED',
      coins: 2,
      sourceCategory: 'Eco Travel',
      proofImage: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
      proofHash: 'hash_gr_03_demo_ev',
      submittedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      verifiedAt: new Date(Date.now() - 12 * 86400000 + 3600000).toISOString(),
      verifiedBy: 'S.A.F.A.R. Authority Desk (Insp. Bikram Gogoi)'
    },
    {
      id: 'gr_04',
      touristId: 'TID-1035',
      touristName: 'Ananya Mishra',
      activityType: 'ECO_VEHICLE',
      vehicleType: 'E-Rickshaw',
      vehicleNumber: 'UP-42-ER-2004',
      partnerId: null,
      partnerName: null,
      farePaid: 100,
      status: 'APPROVED',
      coins: 1,
      sourceCategory: 'Eco Travel',
      proofImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80',
      proofHash: 'hash_gr_04_demo_er',
      submittedAt: new Date(Date.now() - 11 * 86400000).toISOString(),
      verifiedAt: new Date(Date.now() - 11 * 86400000 + 3600000).toISOString(),
      verifiedBy: 'S.A.F.A.R. Authority Desk (Dr. Ananya Sharma)'
    },
    {
      id: 'gr_05',
      touristId: 'TID-1035',
      touristName: 'Ananya Mishra',
      activityType: 'ECO_VEHICLE',
      vehicleType: 'Electric Bus',
      vehicleNumber: 'UP-42-EB-3005',
      partnerId: null,
      partnerName: null,
      farePaid: 45,
      status: 'APPROVED',
      coins: 1,
      sourceCategory: 'Eco Travel',
      proofImage: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80',
      proofHash: 'hash_gr_05_demo_eb',
      submittedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      verifiedAt: new Date(Date.now() - 10 * 86400000 + 3600000).toISOString(),
      verifiedBy: 'S.A.F.A.R. Authority Desk (Insp. Bikram Gogoi)'
    },
    {
      id: 'gr_06',
      touristId: 'TID-1035',
      touristName: 'Ananya Mishra',
      activityType: 'ECO_VEHICLE',
      vehicleType: 'Electric Cab',
      vehicleNumber: 'UP-42-EV-1006',
      partnerId: null,
      partnerName: null,
      farePaid: 800,
      status: 'APPROVED',
      coins: 2,
      sourceCategory: 'Eco Travel',
      proofImage: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
      proofHash: 'hash_gr_06_demo_ev',
      submittedAt: new Date(Date.now() - 9 * 86400000).toISOString(),
      verifiedAt: new Date(Date.now() - 9 * 86400000 + 3600000).toISOString(),
      verifiedBy: 'S.A.F.A.R. Authority Desk (Dr. Ananya Sharma)'
    },
    {
      id: 'gr_07',
      touristId: 'TID-1035',
      touristName: 'Ananya Mishra',
      activityType: 'ECO_VEHICLE',
      vehicleType: 'E-Auto',
      vehicleNumber: 'UP-42-EA-4007',
      partnerId: null,
      partnerName: null,
      farePaid: 150,
      status: 'APPROVED',
      coins: 1,
      sourceCategory: 'Eco Travel',
      proofImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80',
      proofHash: 'hash_gr_07_demo_ea',
      submittedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      verifiedAt: new Date(Date.now() - 8 * 86400000 + 3600000).toISOString(),
      verifiedBy: 'S.A.F.A.R. Authority Desk (Insp. Bikram Gogoi)'
    },
    {
      id: 'gr_08',
      touristId: 'TID-1035',
      touristName: 'Ananya Mishra',
      activityType: 'ECO_VEHICLE',
      vehicleType: 'Electric Cab',
      vehicleNumber: 'UP-42-EV-1008',
      partnerId: null,
      partnerName: null,
      farePaid: 690,
      status: 'APPROVED',
      coins: 2,
      sourceCategory: 'Eco Travel',
      proofImage: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
      proofHash: 'hash_gr_08_demo_ev',
      submittedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      verifiedAt: new Date(Date.now() - 7 * 86400000 + 3600000).toISOString(),
      verifiedBy: 'S.A.F.A.R. Authority Desk (Dr. Ananya Sharma)'
    },
    {
      id: 'gr_09',
      touristId: 'TID-1035',
      touristName: 'Ananya Mishra',
      activityType: 'ECO_VEHICLE',
      vehicleType: 'E-Rickshaw',
      vehicleNumber: 'UP-42-ER-2009',
      partnerId: null,
      partnerName: null,
      farePaid: 90,
      status: 'APPROVED',
      coins: 1,
      sourceCategory: 'Eco Travel',
      proofImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80',
      proofHash: 'hash_gr_09_demo_er',
      submittedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      verifiedAt: new Date(Date.now() - 6 * 86400000 + 3600000).toISOString(),
      verifiedBy: 'S.A.F.A.R. Authority Desk (Dr. Ananya Sharma)'
    },
    {
      id: 'gr_10',
      touristId: 'TID-1035',
      touristName: 'Ananya Mishra',
      activityType: 'ECO_VEHICLE',
      vehicleType: 'Electric Cab',
      vehicleNumber: 'UP-42-EV-1010',
      partnerId: null,
      partnerName: null,
      farePaid: 850,
      status: 'APPROVED',
      coins: 2,
      sourceCategory: 'Eco Travel',
      proofImage: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
      proofHash: 'hash_gr_10_demo_ev',
      submittedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      verifiedAt: new Date(Date.now() - 5 * 86400000 + 3600000).toISOString(),
      verifiedBy: 'S.A.F.A.R. Authority Desk (Insp. Bikram Gogoi)'
    },

    // Source B: Partner Hotels (+7 coins)
    {
      id: 'gr_11',
      touristId: 'TID-1035',
      touristName: 'Ananya Mishra',
      activityType: 'PARTNER_HOTEL',
      vehicleType: null,
      vehicleNumber: null,
      partnerId: 'part_01',
      partnerName: 'Hotel Grand Ayodhya Heritage',
      partnerType: 'HOTEL',
      status: 'APPROVED',
      coins: 1,
      sourceCategory: 'Partner Hotels',
      proofImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
      proofHash: 'hash_gr_11_demo_hotel',
      submittedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      verifiedAt: new Date(Date.now() - 5 * 86400000 + 4000000).toISOString(),
      verifiedBy: 'S.A.F.A.R. Authority Desk (Dr. Ananya Sharma)'
    },
    {
      id: 'gr_12',
      touristId: 'TID-1035',
      touristName: 'Ananya Mishra',
      activityType: 'PARTNER_HOTEL',
      vehicleType: null,
      vehicleNumber: null,
      partnerId: 'part_02',
      partnerName: 'Sarayu Riverfront Eco Resort',
      partnerType: 'HOTEL',
      status: 'APPROVED',
      coins: 2,
      sourceCategory: 'Partner Hotels',
      proofImage: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80',
      proofHash: 'hash_gr_12_demo_hotel',
      submittedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      verifiedAt: new Date(Date.now() - 4 * 86400000 + 4000000).toISOString(),
      verifiedBy: 'S.A.F.A.R. Authority Desk (Dr. Ananya Sharma)'
    },
    {
      id: 'gr_13',
      touristId: 'TID-1035',
      touristName: 'Ananya Mishra',
      activityType: 'PARTNER_HOTEL',
      vehicleType: null,
      vehicleNumber: null,
      partnerId: 'part_02',
      partnerName: 'Sarayu Riverfront Eco Resort',
      partnerType: 'HOTEL',
      status: 'APPROVED',
      coins: 2,
      sourceCategory: 'Partner Hotels',
      proofImage: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80',
      proofHash: 'hash_gr_13_demo_hotel',
      submittedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      verifiedAt: new Date(Date.now() - 3 * 86400000 + 4000000).toISOString(),
      verifiedBy: 'S.A.F.A.R. Authority Desk (Dr. Ananya Sharma)'
    },
    {
      id: 'gr_14',
      touristId: 'TID-1035',
      touristName: 'Ananya Mishra',
      activityType: 'PARTNER_HOTEL',
      vehicleType: null,
      vehicleNumber: null,
      partnerId: 'part_07',
      partnerName: 'Himalayan Pine Valley Hotel',
      partnerType: 'HOTEL',
      status: 'APPROVED',
      coins: 2,
      sourceCategory: 'Partner Hotels',
      proofImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
      proofHash: 'hash_gr_14_demo_hotel',
      submittedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      verifiedAt: new Date(Date.now() - 2 * 86400000 + 4000000).toISOString(),
      verifiedBy: 'S.A.F.A.R. Authority Desk (Insp. Bikram Gogoi)'
    },

    // Source B: Partner Restaurants (+3 coins)
    {
      id: 'gr_15',
      touristId: 'TID-1035',
      touristName: 'Ananya Mishra',
      activityType: 'PARTNER_RESTAURANT',
      vehicleType: null,
      vehicleNumber: null,
      partnerId: 'part_04',
      partnerName: 'Royal Awadh Dining & Pure Veg',
      partnerType: 'RESTAURANT',
      status: 'APPROVED',
      coins: 1,
      sourceCategory: 'Restaurants',
      proofImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
      proofHash: 'hash_gr_15_demo_rest',
      submittedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      verifiedAt: new Date(Date.now() - 2 * 86400000 + 3600000).toISOString(),
      verifiedBy: 'S.A.F.A.R. Authority Desk (Dr. Ananya Sharma)'
    },
    {
      id: 'gr_16',
      touristId: 'TID-1035',
      touristName: 'Ananya Mishra',
      activityType: 'PARTNER_RESTAURANT',
      vehicleType: null,
      vehicleNumber: null,
      partnerId: 'part_05',
      partnerName: 'Kashi Organic Thali Heritage',
      partnerType: 'RESTAURANT',
      status: 'APPROVED',
      coins: 2,
      sourceCategory: 'Restaurants',
      proofImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
      proofHash: 'hash_gr_16_demo_rest',
      submittedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      verifiedAt: new Date(Date.now() - 1 * 86400000 + 3600000).toISOString(),
      verifiedBy: 'S.A.F.A.R. Authority Desk (Dr. Ananya Sharma)'
    },

    // Source B: Partner Cafes (+2 coins)
    {
      id: 'gr_17',
      touristId: 'TID-1035',
      touristName: 'Ananya Mishra',
      activityType: 'PARTNER_CAFE',
      vehicleType: null,
      vehicleNumber: null,
      partnerId: 'part_03',
      partnerName: 'Taj View Eco Bistro & Cafe',
      partnerType: 'CAFE',
      status: 'APPROVED',
      coins: 1,
      sourceCategory: 'Cafes',
      proofImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
      proofHash: 'hash_gr_17_demo_cafe',
      submittedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      verifiedAt: new Date(Date.now() - 1 * 86400000 + 2000000).toISOString(),
      verifiedBy: 'S.A.F.A.R. Authority Desk (Dr. Ananya Sharma)'
    },
    {
      id: 'gr_18',
      touristId: 'TID-1035',
      touristName: 'Ananya Mishra',
      activityType: 'PARTNER_CAFE',
      vehicleType: null,
      vehicleNumber: null,
      partnerId: 'part_06',
      partnerName: 'Brahmaputra Breeze Green Cafe',
      partnerType: 'CAFE',
      status: 'APPROVED',
      coins: 1,
      sourceCategory: 'Cafes',
      proofImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
      proofHash: 'hash_gr_18_demo_cafe',
      submittedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
      verifiedAt: new Date(Date.now() - 11 * 3600000).toISOString(),
      verifiedBy: 'S.A.F.A.R. Authority Desk (Insp. Bikram Gogoi)'
    },

    // Source C: Verified Public Gallery Tourist Places (+10 coins)
    {
      id: 'gr_tp_01',
      touristId: 'TID-1035',
      touristName: 'Ananya Mishra',
      activityType: 'TOURIST_PLACE',
      placeName: 'Shri Ram Janmabhoomi Mandir',
      placeLocation: 'Ayodhya, Uttar Pradesh',
      placeCategory: 'Religious Place',
      placeReview: 'Magnificent architectural marvel with peaceful spiritual ambiance. Solar lighting and zero-emission battery carts installed.',
      status: 'APPROVED',
      coins: 2,
      sourceCategory: 'Tourist Places',
      proofImage: 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?auto=format&fit=crop&w=800&q=80',
      proofHash: 'hash_tp_01_ayodhya_ram_mandir',
      isLiveCameraCaptured: true,
      taggedAuthorityDesk: 'S.A.F.A.R. Central Command Desk',
      submittedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      verifiedAt: new Date(Date.now() - 3 * 86400000 + 1800000).toISOString(),
      verifiedBy: 'S.A.F.A.R. Authority Desk (Dr. Ananya Sharma)'
    },
    {
      id: 'gr_tp_02',
      touristId: 'TID-1036',
      touristName: 'Vikas Chandel',
      activityType: 'TOURIST_PLACE',
      placeName: 'Kaziranga National Park & Rhino Sanctuary',
      placeLocation: 'Golaghat & Nagaon, Assam',
      placeCategory: 'National Park / Wildlife',
      placeReview: 'Witnessed the great Indian one-horned rhinoceros in its pristine natural habitat. Guided safari strictly follows eco-corridor norms.',
      status: 'APPROVED',
      coins: 2,
      sourceCategory: 'Tourist Places',
      proofImage: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=800&q=80',
      proofHash: 'hash_tp_02_kaziranga_rhino',
      isLiveCameraCaptured: true,
      taggedAuthorityDesk: 'S.A.F.A.R. Central Command Desk',
      submittedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      verifiedAt: new Date(Date.now() - 2 * 86400000 + 2400000).toISOString(),
      verifiedBy: 'S.A.F.A.R. Authority Desk (Insp. Bikram Gogoi)'
    },
    {
      id: 'gr_tp_03',
      touristId: 'TID-1037',
      touristName: 'Sneha Kulkarni',
      activityType: 'TOURIST_PLACE',
      placeName: 'Saryu Riverfront Eco Ghats',
      placeLocation: 'Ayodhya, Uttar Pradesh',
      placeCategory: 'Scenic Viewpoint',
      placeReview: 'Evening maha aarti view along the calm river waters. Clean riverfront with solar boats and electric ferries in action.',
      status: 'APPROVED',
      coins: 2,
      sourceCategory: 'Tourist Places',
      proofImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
      proofHash: 'hash_tp_03_saryu_ghat',
      isLiveCameraCaptured: true,
      taggedAuthorityDesk: 'S.A.F.A.R. Central Command Desk',
      submittedAt: new Date(Date.now() - 36 * 3600000).toISOString(),
      verifiedAt: new Date(Date.now() - 35 * 3600000).toISOString(),
      verifiedBy: 'S.A.F.A.R. Authority Desk (Dr. Ananya Sharma)'
    },
    {
      id: 'gr_tp_04',
      touristId: 'TID-1038',
      touristName: 'Rajesh Nair',
      activityType: 'TOURIST_PLACE',
      placeName: 'Taj Mahal Heritage Complex',
      placeLocation: 'Agra, Uttar Pradesh',
      placeCategory: 'Heritage Site',
      placeReview: 'World Wonder in white marble. Clean air Taj Trapezium Zone visited using the Taj East Gate EV shuttle service.',
      status: 'APPROVED',
      coins: 2,
      sourceCategory: 'Tourist Places',
      proofImage: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
      proofHash: 'hash_tp_04_taj_mahal',
      isLiveCameraCaptured: true,
      taggedAuthorityDesk: 'S.A.F.A.R. Central Command Desk',
      submittedAt: new Date(Date.now() - 20 * 3600000).toISOString(),
      verifiedAt: new Date(Date.now() - 19 * 3600000).toISOString(),
      verifiedBy: 'S.A.F.A.R. Authority Desk (Insp. Bikram Gogoi)'
    },
    {
      id: 'gr_tp_05',
      touristId: 'TID-1039',
      touristName: 'Pooja Verma',
      activityType: 'TOURIST_PLACE',
      placeName: 'Kashi Vishwanath Corridor & Ghats',
      placeLocation: 'Varanasi, Uttar Pradesh',
      placeCategory: 'Cultural Center',
      placeReview: 'Splendid walkway connecting the sacred temple to Ganga ghats. Clean, pedestrianized, and easily accessible.',
      status: 'APPROVED',
      coins: 2,
      sourceCategory: 'Tourist Places',
      proofImage: 'https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&w=800&q=80',
      proofHash: 'hash_tp_05_kashi_vishwanath',
      isLiveCameraCaptured: true,
      taggedAuthorityDesk: 'S.A.F.A.R. Central Command Desk',
      submittedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
      verifiedAt: new Date(Date.now() - 7 * 3600000).toISOString(),
      verifiedBy: 'S.A.F.A.R. Authority Desk (Dr. Ananya Sharma)'
    },

    // --- PENDING Verification Requests for SIH / Evaluator Testing ---
    {
      id: 'gr_pend_01',
      touristId: 'TID-1035',
      touristName: 'Ananya Mishra',
      activityType: 'ECO_VEHICLE',
      vehicleType: 'E-Rickshaw',
      vehicleNumber: 'UP-42-ER-5511',
      partnerId: null,
      partnerName: null,
      farePaid: 120,
      status: 'PENDING',
      coins: 0,
      sourceCategory: 'Eco Travel',
      proofImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80',
      proofHash: 'hash_gr_pend_01_er',
      submittedAt: new Date(Date.now() - 25 * 60000).toISOString(),
      verifiedAt: null,
      verifiedBy: null,
      rejectionReason: null
    },
    {
      id: 'gr_pend_02',
      touristId: 'TID-1036',
      touristName: 'Vikas Chandel',
      activityType: 'PARTNER_HOTEL',
      vehicleType: null,
      vehicleNumber: null,
      partnerId: 'part_01',
      partnerName: 'Hotel Grand Ayodhya Heritage',
      partnerType: 'HOTEL',
      status: 'PENDING',
      coins: 0,
      sourceCategory: 'Partner Hotels',
      proofImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
      proofHash: 'hash_gr_pend_02_hotel',
      submittedAt: new Date(Date.now() - 40 * 60000).toISOString(),
      verifiedAt: null,
      verifiedBy: null,
      rejectionReason: null
    },
    {
      id: 'gr_pend_03',
      touristId: 'TID-1037',
      touristName: 'Sneha Kulkarni',
      activityType: 'ECO_VEHICLE',
      vehicleType: 'Electric Cab',
      vehicleNumber: 'UP-32-EV-7722',
      partnerId: null,
      partnerName: null,
      farePaid: 880,
      status: 'PENDING',
      coins: 0,
      sourceCategory: 'Eco Travel',
      proofImage: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80',
      proofHash: 'hash_gr_pend_03_ev',
      submittedAt: new Date(Date.now() - 65 * 60000).toISOString(),
      verifiedAt: null,
      verifiedBy: null,
      rejectionReason: null
    },
    {
      id: 'gr_pend_04',
      touristId: 'TID-1039',
      touristName: 'Aarav Sharma',
      activityType: 'PARTNER_CAFE',
      vehicleType: null,
      vehicleNumber: null,
      partnerId: 'part_03',
      partnerName: 'Taj View Eco Bistro & Cafe',
      partnerType: 'CAFE',
      status: 'PENDING',
      coins: 0,
      sourceCategory: 'Cafes',
      proofImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
      proofHash: 'hash_gr_pend_04_cafe',
      submittedAt: new Date(Date.now() - 90 * 60000).toISOString(),
      verifiedAt: null,
      verifiedBy: null,
      rejectionReason: null
    }
  ];

  // 4. Green Coin Transactions Audit Ledger
  const greenCoinTransactions = greenRewards
    .filter((r) => r.status === 'APPROVED')
    .map((r, idx) => ({
      id: `tx_gc_${idx + 1}`,
      userId: `usr_tourist_${r.touristId.toLowerCase()}`,
      touristId: r.touristId,
      rewardId: r.id,
      transactionType: 'EARNED',
      coins: r.coins,
      source: r.sourceCategory,
      description: r.activityType === 'ECO_VEHICLE' 
        ? `Eco Travel via ${r.vehicleType} (${r.vehicleNumber})`
        : `Verified visit to SAFAR Partner ${r.partnerName}`,
      createdAt: r.verifiedAt || r.submittedAt
    }));

  // 5. Tourism Safety Packages (Private Operators & Authority Approved)
  const packages = [
    {
      id: 'pkg_ayodhya_01',
      partnerId: 'PRT-101',
      partnerName: 'Himalayan Tours & Treks',
      name: 'Ayodhya Divine Heritage & Ram Mandir VIP Circuit',
      destination: 'Ayodhya, Uttar Pradesh',
      itinerary: 'Day 1: Arrival & Saryu Aarti, Day 2: Ram Janmabhoomi & Hanuman Garhi Darshan, Day 3: Heritage Craft & Souvenir Walk.',
      duration: '3 Days / 2 Nights',
      price: 4999,
      inclusions: 'Hotel Stay, Breakfast & Dinner, VIP Darshan Slot, Certified Guide, AC Transport',
      exclusions: 'Personal Expenses, Flight/Train Tickets',
      groupCapacity: 15,
      availableDates: ['2026-10-05', '2026-10-12', '2026-10-20'],
      images: ['https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80'],
      guideDetails: 'Govt Certified English/Hindi Pilgrimage Guide included',
      emergencyContact: '+91 98123 45678 (24x7 Escort Desk)',
      safetyInformation: 'Linked to S.A.F.A.R. 112 ERSS & High-Altitude / Sacred Corridor Geo-fence alerts.',
      status: 'APPROVED',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: 'pkg_manali_02',
      partnerId: 'PRT-101',
      partnerName: 'Himalayan Tours & Treks',
      name: 'Kullu-Manali Alpine Safe Trek & Solang Valley Expedition',
      destination: 'Manali, Himachal Pradesh',
      itinerary: 'Day 1: Acclimatization & Old Manali Walk, Day 2: Solang Valley & Atal Tunnel Safe Corridor, Day 3: Jogini Waterfalls Eco-Trek, Day 4: Departure.',
      duration: '4 Days / 3 Nights',
      price: 8999,
      inclusions: 'Eco Resort Homestay, High-Altitude Safety Kit, All Meals, Local Guide, Trekking Permits',
      exclusions: 'Snow Gear Rental, Paragliding Tickets',
      groupCapacity: 10,
      availableDates: ['2026-10-10', '2026-10-18', '2026-10-25'],
      images: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'],
      guideDetails: 'Certified Mountaineering Guide (NIM Uttarkashi)',
      emergencyContact: '+91 98123 45678 / Manali Police Rescue Desk',
      safetyInformation: 'Ghost-Mesh offline relay beacons deployed at all high-altitude campsite transit points.',
      status: 'APPROVED',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
      id: 'pkg_kashi_03',
      partnerId: 'PRT-101',
      partnerName: 'Himalayan Tours & Treks',
      name: 'Kashi Vishwanath Corridor & Ganga Heritage Walk',
      destination: 'Varanasi, Uttar Pradesh',
      itinerary: 'Day 1: Sunrise Boat Ride, Kashi Vishwanath Temple, Evening Dashashwamedh Aarti. Day 2: Sarnath Heritage Site & Banarasi Silk Weaving Village.',
      duration: '2 Days / 1 Night',
      price: 3499,
      inclusions: 'Heritage Stay near Ghats, Private Boat Ride, Temple Entry, Verified Guide',
      exclusions: 'Special Puja donations',
      groupCapacity: 12,
      availableDates: ['2026-10-08', '2026-10-15'],
      images: ['/images/varanasi-ganga-aarti.jpg'],
      guideDetails: 'Local Heritage Historian & Registered Guide',
      emergencyContact: '+91 98123 45678',
      safetyInformation: 'Varanasi Tourist Police CAD linked with S.A.F.A.R. real-time SOS.',
      status: 'APPROVED',
      createdAt: new Date().toISOString()
    },
    {
      id: 'pkg_kaziranga_04',
      partnerId: 'PRT-101',
      partnerName: 'Kaziranga Eco-Trails & Safaris',
      name: 'Kaziranga Rhino Wildlife & Brahmaputra River Cruise',
      destination: 'Kaziranga, Assam',
      itinerary: 'Day 1: Arrival & Brahmaputra Sunset Cruise, Day 2: Early Morning Elephant Safari & Central Range Jeep Safari, Day 3: Tea Estate Walk & Departure.',
      duration: '3 Days / 2 Nights',
      price: 5499,
      groupCapacity: 8,
      status: 'APPROVED',
      images: ['https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop'],
      availableDates: ['2026-10-06', '2026-10-14', '2026-10-22'],
      inclusions: 'Forest Jeep Safari, Certified Nature Guide, Eco-Lodge Stay, Breakfast & Dinner, Wildlife Permits',
      exclusions: 'Airfare, Personal Expenses, Alcoholic Beverages',
      guideDetails: 'Forest Department Certified Wildlife Naturalist',
      emergencyContact: '+91 3776 268007 / 24x7 Forest Ranger Desk',
      safetyInformation: 'Mandatory GPS tracker tag provided at entry gate, 24x7 Forest Ranger emergency support, First aid kit with escort vehicle.',
      createdAt: new Date().toISOString()
    }
  ];

  // 6. Tourism Package Bookings
  const bookings = [
    {
      id: 'bkg_demo_01',
      bookingId: 'BKG-2026-1001',
      touristId: 'TID-1035',
      touristName: 'Ananya Mishra',
      packageId: 'pkg_ayodhya_01',
      packageName: 'Ayodhya Divine Heritage & Ram Mandir VIP Circuit',
      partnerId: 'PRT-101',
      partnerName: 'Himalayan Tours & Treks',
      travelDate: '2026-10-12',
      touristsCount: 2,
      totalPrice: 9998,
      status: 'CONFIRMED',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
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
    guides,
    guideRequests,
    guideComplaints,
    partners,
    packages,
    bookings,
    rewardConfig,
    greenRewards,
    greenCoinTransactions
  };
}

module.exports = {
  getInitialData
};

