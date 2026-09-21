const express = require('express');
const router = express.Router();
const { getPrivacyStatus, requestDataErasure } = require('../controllers/privacyController');

router.get('/status', getPrivacyStatus);
router.post('/erasure-request', requestDataErasure);

module.exports = router;
