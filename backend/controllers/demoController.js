const { dbStore } = require('../config/db');
const { simulateZone } = require('./touristController');
const { simulateRouteDeviation } = require('./tripController');
const { triggerSOS } = require('./incidentController');
const { verifyBlockchainIntegrity, tamperBlockchainLedger, restoreBlockchainLedger } = require('./blockchainController');

function executeScenario(req, res) {
  const { scenarioId } = req.params;
  const targetId = req.body.touristId || 'TID-1024';

  switch (scenarioId) {
    case '1':
      // Scenario 1: Normal Tourist
      req.body.targetZoneType = 'SAFE';
      req.body.touristId = targetId;
      return simulateZone(req, res);

    case '2':
      // Scenario 2: Geo-fence Violation (Restricted)
      req.body.targetZoneType = 'RESTRICTED';
      req.body.touristId = targetId;
      return simulateZone(req, res);

    case '3':
      // Scenario 3: Route Deviation Anomaly
      req.body.touristId = targetId;
      req.body.offsetKm = 3.8;
      return simulateRouteDeviation(req, res);

    case '4':
      // Scenario 4: SOS Emergency Trigger
      req.body.touristId = targetId;
      req.body.address = 'Kaziranga High Hazard Zone (SIH Judge Scenario 4)';
      return triggerSOS(req, res);

    case '5':
      // Scenario 5: Blockchain Verification
      return restoreBlockchainLedger(req, res);

    case '6':
      // Scenario 6: Blockchain Tampering Simulation
      req.body.targetIndex = 1;
      return tamperBlockchainLedger(req, res);

    default:
      return res.status(400).json({ success: false, error: 'Unknown scenario ID. Use 1 to 6.' });
  }
}

module.exports = {
  executeScenario
};
