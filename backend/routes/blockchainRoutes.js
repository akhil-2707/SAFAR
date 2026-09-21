const express = require('express');
const router = express.Router();
const {
  getBlockchainLedger,
  verifyBlockchainIntegrity,
  tamperBlockchainLedger,
  restoreBlockchainLedger,
  getVendors,
  verifyVendor
} = require('../controllers/blockchainController');

router.get('/', getBlockchainLedger);
router.post('/verify', verifyBlockchainIntegrity);
router.post('/tamper', tamperBlockchainLedger);
router.post('/restore', restoreBlockchainLedger);
router.get('/vendors', getVendors);
router.get('/verify-vendor/:id', verifyVendor);

module.exports = router;
