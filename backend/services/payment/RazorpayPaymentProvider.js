const crypto = require('crypto');
const PaymentProvider = require('./PaymentProvider');

/**
 * RazorpayPaymentProvider
 * 
 * Production payment gateway provider for Razorpay.
 * Architecture is fully prepared for official Razorpay integration.
 * If credentials are not supplied, it safely reports unconfigured status
 * without crashing or breaking the application.
 */
class RazorpayPaymentProvider extends PaymentProvider {
  constructor() {
    super('razorpay');
    this.keyId = process.env.RAZORPAY_KEY_ID || null;
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || null;
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || null;

    this.isConfigured = Boolean(this.keyId && this.keySecret);
    this.client = null;

    if (this.isConfigured) {
      try {
        // Dynamically load razorpay SDK if installed
        const Razorpay = require('razorpay');
        this.client = new Razorpay({
          key_id: this.keyId,
          key_secret: this.keySecret
        });
      } catch (err) {
        console.warn('[RazorpayPaymentProvider] "razorpay" package not installed. Run: npm install razorpay in backend.');
      }
    }
  }

  getConfig() {
    return {
      provider: 'razorpay',
      mode: 'razorpay',
      isConfigured: this.isConfigured,
      keyId: this.keyId || null,
      label: 'Razorpay Payment Gateway (Official)',
      supportedMethods: [
        'razorpay_checkout',
        'razorpay_qr',
        'razorpay_upi',
        'razorpay_card',
        'razorpay_netbanking'
      ]
    };
  }

  _assertConfigured() {
    if (!this.isConfigured || !this.keyId || !this.keySecret) {
      throw new Error(
        'Razorpay is not configured. Please supply RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file or set PAYMENT_MODE=demo.'
      );
    }
  }

  /**
   * Creates an official Razorpay Order
   */
  async createOrder(payment, options = {}) {
    this._assertConfigured();

    if (!this.client) {
      throw new Error('Razorpay SDK client not initialized. Ensure "razorpay" package is installed.');
    }

    // Razorpay amount is in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(payment.finalAmount * 100);

    const orderPayload = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: payment.id,
      notes: {
        paymentId: payment.id,
        touristId: payment.touristId,
        partnerId: payment.partnerId,
        partnerName: payment.partnerName,
        discountPercent: `${payment.effectiveDiscountPercent}%`
      }
    };

    const order = await this.client.orders.create(orderPayload);

    return {
      success: true,
      provider: 'razorpay',
      providerOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: this.keyId,
      // For dynamic QR, Razorpay QR API provides QR payload; fallback to order id
      qrData: order.qr_code_url || `upi://pay?pa=razorpay@icici&pn=SAFAR&tr=${order.id}&am=${payment.finalAmount}&cu=INR`
    };
  }

  /**
   * Verifies Razorpay payment signature
   */
  async verifyPayment(payment, verificationPayload = {}) {
    this._assertConfigured();

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = verificationPayload;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error('Missing required Razorpay signature parameters for verification');
    }

    // HMAC-SHA256 signature verification as per official Razorpay specs
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(body.toString())
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      throw new Error('Invalid Razorpay signature. Payment verification failed.');
    }

    return {
      success: true,
      status: 'SUCCESS',
      provider: 'razorpay',
      providerPaymentId: razorpay_payment_id,
      authorizationCode: `AUTH-RZP-${razorpay_payment_id.substring(4, 10).toUpperCase()}`,
      verifiedAt: new Date().toISOString()
    };
  }

  /**
   * Validates and processes Razorpay Webhooks
   */
  async handleWebhook(rawBody, signature, headers) {
    if (!this.webhookSecret) {
      throw new Error('RAZORPAY_WEBHOOK_SECRET is not configured on the backend.');
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new Error('Invalid Razorpay webhook signature');
    }

    const event = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    return {
      received: true,
      event: event.event,
      payload: event.payload
    };
  }

  /**
   * Simulation is disabled in real Razorpay mode
   */
  async simulateSuccess(payment) {
    throw new Error('Simulation is disabled in Razorpay mode. Set PAYMENT_MODE=demo to test simulations.');
  }

  async simulateFailure(payment, reason) {
    throw new Error('Simulation is disabled in Razorpay mode. Set PAYMENT_MODE=demo to test simulations.');
  }
}

module.exports = RazorpayPaymentProvider;
