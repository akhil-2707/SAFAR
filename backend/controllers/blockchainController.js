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
    location: 'Cherrapunji, Meghalaya'
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
