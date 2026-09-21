const express = require('express');
const router = express.Router();
const deadmanController = require('../controllers/deadmanController');

// 1. Pre-entry trigger (100–200m buffer)
router.post('/pre-entry', deadmanController.handlePreEntry);

// 2. Tourist Check-In ("I Am Safe" tap)
router.post('/check-in', deadmanController.handleCheckIn);

// 3. Get Active Sessions for Authority Command Desk
router.get('/active', deadmanController.getActiveSessions);

// 4. Duty-Cycled Search Beacon Heartbeat
router.post('/beacon-ping', deadmanController.handleBeaconPing);

module.exports = router;
