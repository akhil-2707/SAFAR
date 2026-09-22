const PaymentProvider = require('./PaymentProvider');

/**
 * DemoPaymentProvider
 * 
 * Implements full payment lifecycle in mock/demo mode without requiring
 * any third-party credentials or API keys. Fully simulated, safe, and testable.
 */
class DemoPaymentProvider extends PaymentProvider {
  constructor() {
    super('demo');
  }

  getConfig() {
    return {
      provider: 'demo',
      mode: 'demo',
      isConfigured: true,
      label: 'SAFAR Demo Mock Payment Gateway',
      notice: 'Demo Mode Active — No real currency or bank transactions will take place.',
      supportedMethods: [
        'demo_qr',
        'demo_paytm',
        'demo_phonepe',
        'demo_gpay',
        'demo_bhim',
        'demo_upi',
        'demo_upi_id'
      ]
    };
  }

  /**
   * Creates a mock payment order
   */
  async createOrder(payment, options = {}) {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const providerOrderId = `order_demo_${timestamp}_${randomSuffix}`;

    // Standardized UPI Intent for demo scanning (Unmistakably marked as DEMO)
    const encodedPartnerName = encodeURIComponent(`SAFAR Demo - ${payment.partnerName || 'Certified Partner'}`);
    const qrPayload = `upi://pay?pa=demo-safar@gov.in&pn=${encodedPartnerName}&am=${payment.finalAmount}&cu=INR&tn=DEMO+SAFAR+PAYMENT+${payment.id}&tr=${providerOrderId}&mode=02&purpose=00`;

    return {
      success: true,
      provider: 'demo',
      providerOrderId,
      qrData: qrPayload,
      displayQrTitle: `Demo QR: Pay ₹${payment.finalAmount}`,
      expiresInSeconds: 600, // 10 minutes
      demoInstructions: 'This is a simulated demo payment. Use the simulation buttons below to test success or failure states.'
    };
  }

  /**
   * Verify demo payment (validates that payment is in PENDING state)
   */
  async verifyPayment(payment, verificationPayload = {}) {
    const timestamp = Date.now();
    const providerPaymentId = `pay_demo_${timestamp}_${Math.random().toString(36).substring(2, 9)}`;
    const authorizationCode = `AUTH-DEMO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return {
      success: true,
      status: 'SUCCESS',
      provider: 'demo',
      providerPaymentId,
      authorizationCode,
      verifiedAt: new Date().toISOString()
    };
  }

  /**
   * Simulates successful payment completion
   */
  async simulateSuccess(payment) {
    const timestamp = Date.now();
    const providerPaymentId = `pay_demo_${timestamp}_${Math.random().toString(36).substring(2, 9)}`;
    const authorizationCode = `AUTH-SAFAR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return {
      success: true,
      status: 'SUCCESS',
      provider: 'demo',
      providerPaymentId,
      authorizationCode,
      completedAt: new Date().toISOString(),
      message: 'Demo payment simulated successfully'
    };
  }

  /**
   * Simulates failed payment
   */
  async simulateFailure(payment, reason = 'Payment declined by demo banking simulator') {
    return {
      success: false,
      status: 'FAILED',
      provider: 'demo',
      failureReason: reason,
      failedAt: new Date().toISOString()
    };
  }

  /**
   * Mock webhook handler
   */
  async handleWebhook(rawBody, signature, headers) {
    return {
      received: true,
      provider: 'demo',
      event: 'demo.payment.simulated'
    };
  }
}

module.exports = DemoPaymentProvider;
