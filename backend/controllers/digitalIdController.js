const jwt = require('jsonwebtoken');
const { dbStore } = require('../config/db');
const { blockchainInstance } = require('../services/blockchainService');
const { JWT_SECRET } = require('../middleware/authMiddleware');

function getDigitalId(req, res) {
  const { id } = req.params;
  const digitalId = dbStore.findOne('digitalIds', (d) => d.id === id || d.touristId === id);

  if (!digitalId) {
    return res.status(404).json({ success: false, error: 'Digital Tourist ID not found' });
  }

  const tourist = dbStore.findOne('tourists', (t) => t.touristId === digitalId.touristId);

  // Cross verify with blockchain ledger
  const auditResult = blockchainInstance.verifyDigitalID(digitalId.touristId, digitalId.digitalIdHash);

  return res.json({
    success: true,
    digitalId,
    tourist,
    blockchainAudit: auditResult
  });
}

function verifyDigitalIdPublic(req, res) {
  const touristId = req.params.touristId || req.body?.touristId || req.query?.touristId;
  const providedHash = req.body?.digitalIdHash || req.body?.hash || req.query?.hash || req.query?.digitalIdHash;

  if (!touristId && !providedHash) {
    return res.status(400).json({ success: false, error: 'Tourist ID or Digital ID Hash required for verification' });
  }

  // Check optional JWT auth
  let authUser = req.user;
  if (!authUser && req.headers['authorization']) {
    try {
      const token = req.headers['authorization'].split(' ')[1];
      if (token) authUser = jwt.verify(token, JWT_SECRET);
    } catch (e) {}
  }

  const digitalId = dbStore.findOne(
    'digitalIds',
    (d) => (touristId && d.touristId.toLowerCase() === touristId.toLowerCase()) || 
           (providedHash && d.digitalIdHash === providedHash)
  );

  if (!digitalId) {
    return res.json({
      success: true,
      verified: false,
      status: 'NOT_VERIFIED',
      displayStatus: '✕ Not Verified',
      message: '✗ Digital ID not found on S.A.F.A.R. Prototype Blockchain Ledger.',
      tourist: null
    });
  }

  const tourist = dbStore.findOne('tourists', (t) => t.touristId === digitalId.touristId);
  const auditResult = blockchainInstance.verifyDigitalID(digitalId.touristId, digitalId.digitalIdHash);

  // Privacy verification: Medical data requires either the QR cryptographic hash OR authorized session
  const hasValidHash = providedHash && (
    providedHash === digitalId.digitalIdHash ||
    digitalId.digitalIdHash.startsWith(providedHash) ||
    (providedHash.length >= 8 && digitalId.digitalIdHash.includes(providedHash))
  );

  const isAuthorized = authUser && (
    authUser.role === 'AUTHORITY' ||
    authUser.touristId === digitalId.touristId
  );

  const canAccessMedical = Boolean(hasValidHash || isAuthorized);

  const emergencyMedical = (canAccessMedical && tourist) ? {
    bloodGroup: tourist.bloodGroup || 'O+',
    allergies: tourist.allergies || 'None reported',
    emergencyContact: tourist.emergencyContact ? `${tourist.emergencyContact.name} (${tourist.emergencyContact.phone})` : '+91 112 (National ERSS)',
    emergencyContactName: tourist.emergencyContact?.name || 'Emergency Contact',
    emergencyContactPhone: tourist.emergencyContact?.phone || '112',
    emergencyContactRelation: tourist.emergencyContact?.relation || 'Family',
    medicalConditions: tourist.medicalConditions || 'None reported',
    accessAuthorized: true
  } : null;

  return res.json({
    success: true,
    verified: auditResult.verified,
    status: auditResult.verified ? 'VERIFIED' : 'NOT_VERIFIED',
    displayStatus: auditResult.verified ? '✓ ID Verified' : '✕ Not Verified',
    message: auditResult.verified
      ? '✓ Digital Tourist ID Authenticity Cryptographically Verified on Prototype Blockchain Ledger.'
      : `✗ Verification Failed: ${auditResult.reason}`,
    digitalId: {
      touristId: digitalId.touristId,
      fullName: digitalId.fullName,
      expiryDate: digitalId.expiryDate,
      issuedAt: digitalId.issuedAt,
      blockIndex: digitalId.blockIndex,
      digitalSignature: digitalId.digitalSignature
    },
    tourist: tourist ? {
      touristId: tourist.touristId,
      fullName: tourist.fullName,
      nationality: tourist.nationality || 'Indian',
      idProofType: tourist.idProofType || 'Aadhaar Card',
      destination: tourist.destination || 'National Tourist Circuit',
      travelValidity: `${tourist.travelStartDate} to ${tourist.travelEndDate}`,
      photoUrl: tourist.photoUrl || null
    } : null,
    emergencyMedical,
    medicalRestricted: !canAccessMedical,
    blockchainAudit: auditResult
  });
}

module.exports = {
  getDigitalId,
  verifyDigitalIdPublic
};
