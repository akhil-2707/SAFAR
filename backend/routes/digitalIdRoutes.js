const express = require('express');
const router = express.Router();
const { getDigitalId, verifyDigitalIdPublic } = require('../controllers/digitalIdController');

router.get('/verify/:touristId', verifyDigitalIdPublic);
router.get('/:id', getDigitalId);
router.post('/verify', verifyDigitalIdPublic);

module.exports = router;
