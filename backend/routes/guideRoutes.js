const express = require('express');
const router = express.Router();
const {
  registerGuide,
  getGuides,
  getGuideById,
  verifyGuide,
  rejectGuide,
  toggleAvailability,
  createGuideRequest,
  getGuideRequests,
  assignGuideToRequest,
  reviewGuide,
  complainAgainstGuide,
  getGuideComplaints,
  updateComplaintStatus
} = require('../controllers/guideController');

// Guide Registration & Listing
router.post('/register', registerGuide);
router.get('/', getGuides);

// Requests Management (Must be before /:id)
router.get('/requests', getGuideRequests);
router.post('/request', createGuideRequest);
router.patch('/requests/:requestId/assign', assignGuideToRequest);

// Complaints Management (Must be before /:id)
router.get('/complaints', getGuideComplaints);
router.patch('/complaints/:id/status', updateComplaintStatus);

// Specific Guide Actions
router.get('/:id', getGuideById);
router.patch('/:id/verify', verifyGuide);
router.patch('/:id/reject', rejectGuide);
router.patch('/:id/availability', toggleAvailability);
router.post('/:id/review', reviewGuide);
router.post('/:id/complain', complainAgainstGuide);

module.exports = router;
