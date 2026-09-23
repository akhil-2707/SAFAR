const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const {
  registerPartner,
  getPackages,
  createPackage,
  updatePackageStatus,
  createBooking,
  getBookings
} = require('../controllers/marketplaceController');

// --- PARTNER ---
router.post('/partner/register', registerPartner); // Public for registration

// --- PACKAGES ---
// getPackages logic handles public vs authenticated automatically based on token, but we need optional auth.
// We can use a custom middleware or just make it public and check req.user if present.
// Actually, let's use authenticateToken but make it not strict for public?
// The current `authenticateToken` returns 401 if token is missing. Let's make a soft auth middleware.

const optionalAuth = (req, res, next) => {
  const jwt = require('jsonwebtoken');
  const { JWT_SECRET } = require('../middleware/authMiddleware');
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err) {
      req.user = user;
    } else {
      req.user = null;
    }
    next();
  });
};

router.get('/packages', optionalAuth, getPackages);
router.post('/packages', authenticateToken, requireRole(['PARTNER']), createPackage);
router.put('/packages/:id/status', authenticateToken, requireRole(['AUTHORITY']), updatePackageStatus);

// --- BOOKINGS ---
router.get('/bookings', authenticateToken, getBookings);
router.post('/bookings', authenticateToken, requireRole(['TOURIST']), createBooking);
router.put('/bookings/:id/status', authenticateToken, requireRole(['PARTNER']), require('../controllers/marketplaceController').updateBookingStatus);
module.exports = router;
