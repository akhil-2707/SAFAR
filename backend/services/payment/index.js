const DemoPaymentProvider = require('./DemoPaymentProvider');
const RazorpayPaymentProvider = require('./RazorpayPaymentProvider');

let currentProvider = null;
let currentMode = null;

/**
 * Returns the active payment provider singleton based on environment config
 */
function getPaymentProvider() {
  const mode = (process.env.PAYMENT_MODE || 'demo').toLowerCase().trim();

  // Cache instance if mode hasn't changed
  if (currentProvider && currentMode === mode) {
    return currentProvider;
  }

  currentMode = mode;

  if (mode === 'razorpay') {
    currentProvider = new RazorpayPaymentProvider();
  } else {
    currentProvider = new DemoPaymentProvider();
  }

  return currentProvider;
}

module.exports = {
  getPaymentProvider,
  DemoPaymentProvider,
  RazorpayPaymentProvider
};
