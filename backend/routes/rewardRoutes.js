const express = require('express');
const router = express.Router();
const {
  getPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  submitRewardProof,
  getRewardRequests,
  verifyRewardRequest,
  getUserWallet,
  getUserRewardHistory,
  calculateDiscount,
  processPartnerPayment,
  getRewardConfig,
  updateRewardConfig,
  getPublicGallery,
  getEVehicleConfig,
  getEVehicleStats,
  processEVehiclePayment
} = require('../controllers/rewardController');

// 1. Partners Routes
router.get('/partners', getPartners);
router.get('/partners/:id', getPartnerById);
router.post('/partners', createPartner);
router.patch('/partners/:id', updatePartner);

// 2. Proof Submission & Verification Requests (Partners & Tourist Places)
router.post('/submit', submitRewardProof);
router.get('/requests', getRewardRequests);
router.patch('/requests/:id/verify', verifyRewardRequest);

// 3. User Wallet, History & Public Gallery
router.get('/wallet/:touristId', getUserWallet);
router.get('/history/:touristId', getUserRewardHistory);
router.get('/public-gallery', getPublicGallery);

// 4. Discount Calculation & Payment Engine
router.post('/calculate-discount', calculateDiscount);
router.post('/pay', processPartnerPayment);

// 5. E-Vehicle Transit Payment & Reward Engine (NO Photos Required)
router.get('/e-vehicle/config', getEVehicleConfig);
router.get('/e-vehicle/stats/:touristId', getEVehicleStats);
router.post('/e-vehicle/pay', processEVehiclePayment);

// 6. System Configuration
router.get('/config', getRewardConfig);
router.patch('/config', updateRewardConfig);

module.exports = router;
