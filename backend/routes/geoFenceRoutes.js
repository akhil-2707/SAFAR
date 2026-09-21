const express = require('express');
const router = express.Router();
const {
  getGeoFences,
  createGeoFence,
  updateGeoFence,
  deleteGeoFence,
  checkLocationProximity
} = require('../controllers/geoFenceController');

router.get('/', getGeoFences);
router.post('/', createGeoFence);
router.patch('/:id', updateGeoFence);
router.delete('/:id', deleteGeoFence);
router.post('/check', checkLocationProximity);

module.exports = router;
