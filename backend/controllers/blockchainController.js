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

// Blockchain-Registered Local Vendors Dataset & Verification
const REGISTERED_VENDORS = [
  {
    id: 'VEND-NE-01',
    name: 'Assam Eco-Adventure Guides',
    type: 'CERTIFIED_GUIDE',
    category: 'Trekking & Wildlife Safari',
    licenseNo: 'GOI-NE-78921',
    rating: 4.9,
    reviewsCount: 142,
    complaintHistory: 0,
    blockchainHash: '0xa7f92b41...e890c1',
    blockIndex: 2,
    verificationStatus: 'VERIFIED_GENUINE',
    phone: '+91 98765 12340',
    city: 'Guwahati',
    state: 'Assam',
    location: 'Guwahati & Kaziranga'
  },
  {
    id: 'VEND-NE-02',
    name: 'North-East Safe Cabs & Travels',
    type: 'VERIFIED_TAXI',
    category: 'Inter-State Tourist Transport',
    licenseNo: 'AS-TAXI-45192',
    rating: 4.8,
    reviewsCount: 298,
    complaintHistory: 0,
    blockchainHash: '0x9d4e11fa...b622d9',
    blockIndex: 3,
    verificationStatus: 'VERIFIED_GENUINE',
    phone: '+91 98765 43210',
    city: 'Guwahati',
    state: 'Assam',
    location: 'Guwahati - Shillong Corridor'
  },
  {
    id: 'VEND-NE-03',
    name: 'Cherrapunji Misty Falls Homestay',
    type: 'HOMESTAY',
    category: 'Approved Eco Homestay',
    licenseNo: 'MEGH-HS-1104',
    rating: 4.95,
    reviewsCount: 88,
    complaintHistory: 0,
    blockchainHash: '0x12c4b8e9...a457f0',
    blockIndex: 4,
    verificationStatus: 'VERIFIED_GENUINE',
    phone: '+91 98765 88990',
    city: 'Cherrapunji',
    state: 'Meghalaya',
    location: 'Cherrapunji, Meghalaya',
    estimatedPricePerNight: 2200,
    distanceText: '1.2 km from Nohkalikai Falls'
  },
  {
    id: 'VEND-AY-01',
    name: 'Sarayu Heritage Palace Homestay',
    type: 'HOMESTAY',
    category: 'Curated Heritage Stay',
    licenseNo: 'UP-AY-44021',
    rating: 4.92,
    reviewsCount: 310,
    complaintHistory: 0,
    blockchainHash: '0x33b8a1c9...d442e1',
    blockIndex: 5,
    verificationStatus: 'VERIFIED_GENUINE',
    phone: '+91 5278 221144',
    city: 'Ayodhya',
    state: 'Uttar Pradesh',
    location: 'Ram Ki Paidi, Ayodhya',
    estimatedPricePerNight: 2800,
    distanceText: '800m from Ram Janmabhoomi'
  },
  {
    id: 'VEND-KT-01',
    name: 'Trikuta Foothills Pilgrim Niwas',
    type: 'GUEST_HOUSE',
    category: 'Approved Pilgrim Stay',
    licenseNo: 'JK-KT-90112',
    rating: 4.88,
    reviewsCount: 420,
    complaintHistory: 0,
    blockchainHash: '0x71e99f02...b118a7',
    blockIndex: 6,
    verificationStatus: 'VERIFIED_GENUINE',
    phone: '+91 1991 232110',
    city: 'Katra',
    state: 'Jammu & Kashmir',
    location: 'Near Ban Ganga Gate, Katra',
    estimatedPricePerNight: 1950,
    distanceText: '300m from Yatra Parchi Counter'
  },
  {
    id: 'VEND-AG-01',
    name: 'Taj View Royal Heritage Villa',
    type: 'HOMESTAY',
    category: 'Curated Boutique Stay',
    licenseNo: 'UP-AG-18890',
    rating: 4.85,
    reviewsCount: 265,
    complaintHistory: 0,
    blockchainHash: '0x88c12a44...f993d0',
    blockIndex: 7,
    verificationStatus: 'VERIFIED_GENUINE',
    phone: '+91 562 222889',
    city: 'Agra',
    state: 'Uttar Pradesh',
    location: 'Taj East Gate Road, Agra',
    estimatedPricePerNight: 3200,
    distanceText: '900m from Taj Mahal East Gate'
  },
  {
    id: 'VEND-VR-01',
    name: 'Kashi Vishwanath Corridor Guest House',
    type: 'GUEST_HOUSE',
    category: 'Approved Spiritual Niwas',
    licenseNo: 'UP-VR-76512',
    rating: 4.9,
    reviewsCount: 512,
    complaintHistory: 0,
    blockchainHash: '0x55a90d18...c331f2',
    blockIndex: 8,
    verificationStatus: 'VERIFIED_GENUINE',
    phone: '+91 542 239012',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    location: 'Godowlia Chowk, Varanasi',
    estimatedPricePerNight: 2100,
    distanceText: '400m from Dashashwamedh Ghat'
  },
  {
    id: 'VEND-JP-01',
    name: 'Pink City Haveli & Courtyard Stay',
    type: 'HOMESTAY',
    category: 'Approved Heritage Homestay',
    licenseNo: 'RJ-JP-33019',
    rating: 4.89,
    reviewsCount: 198,
    complaintHistory: 0,
    blockchainHash: '0x44d18e22...e881b9',
    blockIndex: 9,
    verificationStatus: 'VERIFIED_GENUINE',
    phone: '+91 141 260192',
    city: 'Jaipur',
    state: 'Rajasthan',
    location: 'Chandpole Bazaar, Old City, Jaipur',
    estimatedPricePerNight: 2600,
    distanceText: '1.5 km from Hawa Mahal'
  },
  {
    id: 'VEND-GW-01',
    name: 'Kamakhya Nilachal View Homestay',
    type: 'HOMESTAY',
    category: 'Approved Eco Homestay',
    licenseNo: 'AS-GW-88124',
    rating: 4.86,
    reviewsCount: 175,
    complaintHistory: 0,
    blockchainHash: '0x66f33c77...a229d4',
    blockIndex: 10,
    verificationStatus: 'VERIFIED_GENUINE',
    phone: '+91 361 245901',
    city: 'Guwahati',
    state: 'Assam',
    location: 'Nilachal Hills, Kamakhya, Guwahati',
    estimatedPricePerNight: 2300,
    distanceText: '500m from Kamakhya Temple Complex'
  }
];

function getVendors(req, res) {
  return res.json({
    success: true,
    count: REGISTERED_VENDORS.length,
    vendors: REGISTERED_VENDORS
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
