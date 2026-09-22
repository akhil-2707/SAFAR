const express = require('express');
const router = express.Router();
const {
  getPaymentConfig,
  createPayment,
  getPaymentById,
  simulateSuccess,
  simulateFailure,
  cancelPayment,
  verifyPaymentSignature,
  handleWebhook
} = require('../controllers/paymentController');

// Configuration & Public Status
router.get('/config', getPaymentConfig);

// Payment Lifecycle
router.post('/create', createPayment);
router.get('/:id', getPaymentById);

// Demo Mode Simulations
router.post('/:id/simulate-success', simulateSuccess);
router.post('/:id/simulate-fail', simulateFailure);
router.post('/:id/cancel', cancelPayment);

// Production Razorpay Endpoints
router.post('/verify', verifyPaymentSignature);
router.post('/webhook', handleWebhook);

module.exports = router;
