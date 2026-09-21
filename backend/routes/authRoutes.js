const express = require('express');
const router = express.Router();
const {
  registerTourist,
  registerAuthority,
  getAuthorityOfficers,
  approveOfficer,
  rejectOfficer,
  login,
  getMe,
  sendOTP,
  verifyOTPLogin,
  verifyEmailOTP
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/register', registerTourist);
router.post('/register-authority', registerAuthority);
router.get('/officers', authenticateToken, getAuthorityOfficers);
router.patch('/officers/:id/approve', authenticateToken, approveOfficer);
router.patch('/officers/:id/reject', authenticateToken, rejectOfficer);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);

// Email OTP Endpoints
router.post('/send-otp', sendOTP);
router.post('/verify-otp-login', verifyOTPLogin);
router.post('/verify-email-otp', verifyEmailOTP);

module.exports = router;
