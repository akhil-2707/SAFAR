const express = require('express');
const router = express.Router();
const {
  triggerSOS,
  cancelSOS,
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncidentStatus,
  getEmergencyServices
} = require('../controllers/incidentController');

router.get('/emergency-services', getEmergencyServices);
router.post('/sos', triggerSOS);
router.post('/sos/cancel', cancelSOS);
router.get('/', getIncidents);
router.get('/:id', getIncidentById);
router.post('/', createIncident);
router.patch('/:id', updateIncidentStatus);

module.exports = router;
