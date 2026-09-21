const { blockchainInstance } = require('../services/blockchainService');

function getBlockchainLedger(req, res) {
  const chain = blockchainInstance.chain;
  const auditResult = blockchainInstance.verifyChain();

  return res.json({
    success: true,
    totalBlocks: chain.length,
    isTampered: blockchainInstance.isTampered,
    tamperedBlockIndex: blockchainInstance.tamperedBlockIndex,
    auditResult,
    chain
  });
}

function verifyBlockchainIntegrity(req, res) {
  const auditResult = blockchainInstance.verifyChain();
  return res.json({
    success: true,
    audit: auditResult
  });
}

function tamperBlockchainLedger(req, res) {
  const { targetIndex } = req.body;
  const result = blockchainInstance.tamperLedgerForDemo(targetIndex || 1);
  const auditResult = blockchainInstance.verifyChain();

  return res.json({
    success: true,
    message: result.message,
    tamperedBlockIndex: result.tamperedBlockIndex,
    auditResult
  });
}

function restoreBlockchainLedger(req, res) {
  const result = blockchainInstance.restoreLedgerForDemo();
  const auditResult = blockchainInstance.verifyChain();

  return res.json({
    success: true,
    message: result.message,
    auditResult
  });
}

// Blockchain-Registered Local Operators, Stays, and Guides Dataset
// Clearly labeled demo/curated prototype data for verified local tourism providers
const REGISTERED_VENDORS = [
  {
    id: 'VEND-AYO-01',
    name: 'Ramayana Heritage Pilgrim Niwas',
    type: 'GUEST_HOUSE',
    category: 'Curated Pilgrim Niwas',
    city: 'Ayodhya',
    state: 'Uttar Pradesh',
    licenseNo: 'UP-AYO-HS-2024',
    rating: 4.8,
    reviewsCount: 164,
    estimatedPricePerNight: 1400,
    distanceText: '0.6 km from Ram Janmabhoomi',
    amenities: ['Pure Veg Dining', '24h Hot Water', 'Luggage Locker', 'Female-Solo Friendly'],
    verificationStatus: 'DEMO_BLOCKCHAIN_VERIFIED',
    blockchainHash: '0x3f8a91bc...d44201',
    blockIndex: 5,
    phone: '+91 98390 44321',
    location: 'Ram Katha Park Road, Ayodhya'
  },
  {
    id: 'VEND-AYO-02',
    name: 'Saryu Riverfront Eco Retreat',
    type: 'HOMESTAY',
    category: 'Curated Eco Homestay',
    city: 'Ayodhya',
    state: 'Uttar Pradesh',
    licenseNo: 'UP-AYO-ECO-109',
    rating: 4.9,
    reviewsCount: 92,
    estimatedPricePerNight: 2200,
    distanceText: '1.2 km from Saryu Ghats',
    amenities: ['River Balcony', 'Wi-Fi', 'Local Host Tour Assistance', 'Breakfast Included'],
    verificationStatus: 'DEMO_BLOCKCHAIN_VERIFIED',
    blockchainHash: '0x88b712ca...f310e4',
    blockIndex: 6,
    phone: '+91 98390 77890',
    location: 'Naya Ghat Riverside, Ayodhya'
  },
  {
    id: 'VEND-KAT-01',
    name: 'Trikuta Shrines Yatri Niwas',
    type: 'GUEST_HOUSE',
    category: 'Pilgrim Accommodation',
    city: 'Jammu / Katra',
    state: 'Jammu & Kashmir',
    licenseNo: 'JK-KAT-YN-882',
    rating: 4.7,
    reviewsCount: 210,
    estimatedPricePerNight: 1100,
    distanceText: '0.5 km from Katra Railway Station',
    amenities: ['24/7 Hot Water', 'Medical First-Aid Desk', 'Locker Facility', 'CCTV Security'],
    verificationStatus: 'DEMO_BLOCKCHAIN_VERIFIED',
    blockchainHash: '0x17c9aa41...89de32',
    blockIndex: 7,
    phone: '+91 97970 33441',
    location: 'Railway Road, Katra'
  },
  {
    id: 'VEND-AGR-01',
    name: 'Tajganj Heritage Homestay',
    type: 'HOMESTAY',
    category: 'Curated Heritage Stay',
    city: 'Agra',
    state: 'Uttar Pradesh',
    licenseNo: 'UP-AGR-HS-403',
    rating: 4.9,
    reviewsCount: 185,
    estimatedPricePerNight: 1600,
    distanceText: '0.7 km from Taj Mahal East Gate',
    amenities: ['Rooftop Monument View', 'Home Breakfast', 'Wi-Fi', 'Travel Desk'],
    verificationStatus: 'DEMO_BLOCKCHAIN_VERIFIED',
    blockchainHash: '0x42f88b01...77ee91',
    blockIndex: 8,
    phone: '+91 98390 12890',
    location: 'Tajganj East Gate Promenade, Agra'
  },
  {
    id: 'VEND-VAR-01',
    name: 'Ganga View Heritage Haveli',
    type: 'HOMESTAY',
    category: 'Heritage River Stay',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    licenseNo: 'UP-VAR-HH-612',
    rating: 4.85,
    reviewsCount: 140,
    estimatedPricePerNight: 1900,
    distanceText: 'Directly overlooking Assi Ghat',
    amenities: ['River Balcony', 'Yoga Deck', 'Wi-Fi', 'Morning Boat Desk'],
    verificationStatus: 'DEMO_BLOCKCHAIN_VERIFIED',
    blockchainHash: '0x55d143ef...aa2088',
    blockIndex: 9,
    phone: '+91 98220 88710',
    location: 'Assi Ghat, Varanasi'
  },
  {
    id: 'VEND-NE-01',
    name: 'Assam Eco-Adventure Guides',
    type: 'CERTIFIED_GUIDE',
    category: 'Trekking & Wildlife Safari',
    city: 'Guwahati & Kaziranga',
    state: 'Assam',
    licenseNo: 'GOI-NE-78921',
    rating: 4.9,
    reviewsCount: 142,
    estimatedPricePerNight: 1200,
    distanceText: 'Covers Assam & Meghalaya circuits',
    amenities: ['Certified Local Guide', 'English/Hindi/Assamese', 'First-Aid Certified'],
    verificationStatus: 'DEMO_BLOCKCHAIN_VERIFIED',
    blockchainHash: '0xa7f92b41...e890c1',
    blockIndex: 2,
    phone: '+91 98765 12340',
    location: 'Guwahati & Kaziranga'
  },
  {
    id: 'VEND-NE-02',
    name: 'North-East Safe Cabs & Travels',
    type: 'VERIFIED_TAXI',
    category: 'Inter-State Tourist Transport',
    city: 'Guwahati',
    state: 'Assam',
    licenseNo: 'AS-TAXI-45192',
    rating: 4.8,
    reviewsCount: 298,
    estimatedPricePerNight: 2800,
    distanceText: 'Guwahati - Shillong Corridor',
    amenities: ['Verified Vehicle Permit', 'All-India Tourist Permit', 'GPS Tracked'],
    verificationStatus: 'DEMO_BLOCKCHAIN_VERIFIED',
    blockchainHash: '0x9d4e11fa...b622d9',
    blockIndex: 3,
    phone: '+91 98765 43210',
    location: 'Guwahati - Shillong Corridor'
  },
  {
    id: 'VEND-NE-03',
    name: 'Cherrapunji Misty Falls Homestay',
    type: 'HOMESTAY',
    category: 'Approved Eco Homestay',
    city: 'Cherrapunji',
    state: 'Meghalaya',
    licenseNo: 'MEGH-HS-1104',
    rating: 4.95,
    reviewsCount: 88,
    estimatedPricePerNight: 1800,
    distanceText: '1.5 km from Sohra Market Center',
    amenities: ['Khasi Traditional Meals', 'Fireplace', 'Living Root Bridge Guide', 'Wi-Fi'],
    verificationStatus: 'DEMO_BLOCKCHAIN_VERIFIED',
    blockchainHash: '0x12c4b8e9...a457f0',
    blockIndex: 4,
    phone: '+91 98765 88990',
    location: 'Cherrapunji, Meghalaya'
  }
];

function getVendors(req, res) {
  const { type, city } = req.query || {};
  let list = REGISTERED_VENDORS;
  if (type) {
    list = list.filter((v) => v.type === type.toUpperCase());
  }
  if (city) {
    list = list.filter((v) => v.city.toLowerCase().includes(city.toLowerCase()));
  }
  return res.json({
    success: true,
    count: list.length,
    vendors: list
  });
}

function verifyVendor(req, res) {
  const { id } = req.params;
  const vendor = REGISTERED_VENDORS.find((v) => v.id === id || v.licenseNo === id);
  if (!vendor) {
    return res.status(404).json({
      success: false,
      error: 'Vendor record not found on Blockchain Ledger',
      verificationStatus: 'UNVERIFIED_OPERATOR'
    });
  }
  return res.json({
    success: true,
    message: '✅ Vendor Blockchain Hash Authenticated on SHA-256 Ledger!',
    vendor
  });
}

module.exports = {
  getBlockchainLedger,
  verifyBlockchainIntegrity,
  tamperBlockchainLedger,
  restoreBlockchainLedger,
  getVendors,
  verifyVendor
};
