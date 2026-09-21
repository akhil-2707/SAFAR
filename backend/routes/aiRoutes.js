const express = require('express');
const router = express.Router();
const { getSafetyAdvice } = require('../controllers/aiController');

router.post('/safety-advice', getSafetyAdvice);

module.exports = router;
