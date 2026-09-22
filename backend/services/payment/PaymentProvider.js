/**
 * PaymentProvider (Base Class / Interface)
 * 
 * Abstract contract for payment processing providers in SAFAR.
 * Specific providers (DemoPaymentProvider, RazorpayPaymentProvider)
 * must implement these methods.
 */
class PaymentProvider {
  constructor(name) {
    this.name = name;
  }

  /**
   * Returns provider capability and configuration metadata
   */
  getConfig() {
    return {
      provider: this.name,
      isConfigured: true,
      mode: this.name
    };
  }

  /**
   * Creates an order/transaction with the provider
   * @param {Object} payment - Internal SAFAR payment entity
   * @param {Object} options - Additional payment parameters (paymentMethod, etc.)
   */
  async createOrder(payment, options = {}) {
    throw new Error(`createOrder() not implemented for provider ${this.name}`);
  }

  /**
   * Verifies a completed payment
   * @param {Object} payment - Internal SAFAR payment entity
   * @param {Object} verificationPayload - Provider signature / auth payload
   */
  async verifyPayment(payment, verificationPayload) {
    throw new Error(`verifyPayment() not implemented for provider ${this.name}`);
  }

  /**
   * Handles incoming webhooks from payment gateway
   * @param {Object} rawBody
   * @param {string} signature
   * @param {Object} headers
   */
  async handleWebhook(rawBody, signature, headers) {
    throw new Error(`handleWebhook() not implemented for provider ${this.name}`);
  }

  /**
   * Simulates successful payment for testing / demo mode
   * @param {Object} payment
   */
  async simulateSuccess(payment) {
    throw new Error(`simulateSuccess() not implemented for provider ${this.name}`);
  }

  /**
   * Simulates failed payment for testing / demo mode
   * @param {Object} payment
   * @param {string} reason
   */
  async simulateFailure(payment, reason) {
    throw new Error(`simulateFailure() not implemented for provider ${this.name}`);
  }
}

module.exports = PaymentProvider;
