const express = require('express');
const router = express.Router();
const { executeScenario } = require('../controllers/demoController');

router.post('/scenario/:scenarioId', executeScenario);

module.exports = router;
