const express = require('express');
const router = express.Router();
const {
  getMeshTopology,
  broadcastOfflineBeacon,
  resolveMeshRescue
} = require('../controllers/meshRescueController');

router.get('/topology', getMeshTopology);
router.post('/broadcast', broadcastOfflineBeacon);
router.post('/resolve', resolveMeshRescue);

module.exports = router;
