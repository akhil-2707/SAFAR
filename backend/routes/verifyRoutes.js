const express = require('express');
const router = express.Router();
const {
  getVerification,
  unlockEmergencyMedical,
  getAuthorityPublicKey,
  verifyOfflineSignature
} = require('../controllers/verify.controller');

// Public verification endpoints
router.get('/public-key', getAuthorityPublicKey);
router.post('/offline-verify', verifyOfflineSignature);
router.post('/unlock-medical', unlockEmergencyMedical);

// Resolve verification by hash or touristId
router.get('/:hash', getVerification);
router.get('/', getVerification);

module.exports = router;
