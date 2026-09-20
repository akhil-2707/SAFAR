const express = require('express');
const router = express.Router();
const {
  getCheckpoints,
  getCheckpointQueue,
  approveEntryPass,
  rejectEntryPass,
  simulateOfflineScan
} = require('../controllers/authority.controller');

// Checkpoint endpoints
router.get('/checkpoints', getCheckpoints);
router.get('/queue', getCheckpointQueue);
router.post('/approve', approveEntryPass);
router.post('/reject', rejectEntryPass);
router.post('/offline-verify', simulateOfflineScan);

module.exports = router;
