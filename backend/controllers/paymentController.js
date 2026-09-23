const { dbStore } = require('../config/db');
const { getPaymentProvider } = require('../services/payment');

const SAFAR_MAX_GREEN_DISCOUNT_PERCENT = 40; // Max 40% discount
const SAFAR_MIN_PAYABLE_PERCENT = 60;        // Min 60% payable (cannot be free)

function getTierDiscount(coins, partnerPolicy = null, defaultTiers = []) {
  if (partnerPolicy && Array.isArray(partnerPolicy) && partnerPolicy.length > 0) {
    const sorted = [...partnerPolicy].sort((a, b) => b.coins - a.coins);
    for (const tier of sorted) {
      if (coins >= tier.coins) {
        return tier.discountPercent;
      }
    }
  }

  const sortedDefault = [...defaultTiers].sort((a, b) => b.minCoins - a.minCoins);
  for (const tier of sortedDefault) {
    if (coins >= tier.minCoins) {
      return tier.discountPercent;
    }
  }

  return 0;
}

/**
 * 1. GET /api/payments/config
 * Returns current payment mode and gateway availability without exposing credentials.
 */
function getPaymentConfig(req, res) {
  try {
    const provider = getPaymentProvider();
    const config = provider.getConfig();

    return res.json({
      success: true,
      mode: config.mode,
      provider: config.provider,
      isConfigured: config.isConfigured,
      keyId: config.keyId || null,
      label: config.label,
      notice: config.notice || null,
      supportedMethods: config.supportedMethods
    });
  } catch (err) {
    console.error('getPaymentConfig Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve payment config' });
  }
}

/**
 * 2. POST /api/payments/create
 * Creates a new payment session with verified backend discount calculation
 */
async function createPayment(req, res) {
  try {
    const {
      touristId,
      partnerId,
      originalBill,
      paymentMethod = 'demo_qr',
      partnerSpecialDiscountPercent = 0,
      upiId = null,
      category = 'partner',
      vehicleType = 'E-Rickshaw',
      partnerName = null
    } = req.body;

    const bill = Number(originalBill);
    if (!bill || bill <= 0 || isNaN(bill)) {
      return res.status(400).json({ success: false, error: 'A valid positive bill amount is required' });
    }

    const isEVehicle = category === 'e-vehicle' || category === 'e_vehicle';
    const isArtisan = category === 'artisan';

    let partner = null;
    let greenCoinDiscountPercent = 0;
    let validatedPartnerSpecial = 0;
    let finalDiscountAmount = 0;
    let finalAmount = bill;
    let effectivePct = 0;

    // Active Tourist & verified Green Coins
    const activeTouristId = touristId || req.user?.touristId || 'TID-1035';
    const approvedRewards = dbStore.get('greenRewards').filter(
      (r) => r.touristId === activeTouristId && r.status === 'APPROVED'
    );
    const userCoins = approvedRewards.reduce((sum, r) => sum + (Number(r.coins) || 0), 0);

    if (isEVehicle) {
      partner = {
        id: 'part_ev_transit',
        name: `SAFAR Eco-Transit (${vehicleType || 'E-Rickshaw'})`,
        type: 'TRANSIT',
        location: 'Ayodhya Urban Corridor',
        status: 'ACTIVE'
      };
      // Driver fare protection: 100% full fare to driver, 0% discount deduction
      finalAmount = bill;
      finalDiscountAmount = 0;
      effectivePct = 0;
    } else if (isArtisan) {
      partner = {
        id: 'part_artisan',
        name: partnerName || 'Master Artisan Guild',
        type: 'ARTISAN',
        location: 'Fair Trade Handicrafts Corridor',
        status: 'ACTIVE'
      };
      finalAmount = bill;
      finalDiscountAmount = 0;
      effectivePct = 0;
    } else {
      if (!partnerId) {
        return res.status(400).json({ success: false, error: 'Partner ID is required' });
      }

      partner = dbStore.findById('partners', partnerId);
      if (!partner) {
        return res.status(404).json({ success: false, error: 'Partner establishment not found' });
      }

      if (partner.status !== 'ACTIVE') {
        return res.status(400).json({ success: false, error: 'Partner is not currently active for SAFAR checkouts' });
      }

      // Retrieve system tier config
      const configs = dbStore.get('rewardConfig');
      const defaultTiers = configs[0]?.defaultTiers || [
        { minCoins: 1,   maxCoins: 9,      discountPercent: 2 },
        { minCoins: 10,  maxCoins: 24,     discountPercent: 5 },
        { minCoins: 25,  maxCoins: 49,     discountPercent: 10 },
        { minCoins: 50,  maxCoins: 74,     discountPercent: 20 },
        { minCoins: 75,  maxCoins: 99,     discountPercent: 30 },
        { minCoins: 100, maxCoins: 999999, discountPercent: 40 }
      ];

      // Calculate Green Coin tier discount
      const rawTierDiscount = getTierDiscount(userCoins, partner.discountPolicy, defaultTiers);
      const partnerGreenMax = partner.maximumDiscount !== undefined ? partner.maximumDiscount : SAFAR_MAX_GREEN_DISCOUNT_PERCENT;
      greenCoinDiscountPercent = Math.min(rawTierDiscount, partnerGreenMax, SAFAR_MAX_GREEN_DISCOUNT_PERCENT);

      const partnerSpecial = Number(partnerSpecialDiscountPercent) || 0;
      validatedPartnerSpecial = Math.max(0, Math.min(partnerSpecial, 100));

      // Mandatory rule: Minimum 60% payable (max discount 40%)
      const totalCalculated = Math.round((bill * (greenCoinDiscountPercent + validatedPartnerSpecial)) / 100);
      const minPayable = Math.ceil(bill * (SAFAR_MIN_PAYABLE_PERCENT / 100));
      const maxAllowedDiscount = bill - minPayable;
      finalDiscountAmount = Math.min(totalCalculated, maxAllowedDiscount);
      finalAmount = bill - finalDiscountAmount;
      effectivePct = Math.round((finalDiscountAmount / bill) * 100);
    }

    const paymentId = `PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const transactionId = `SAFAR-TXN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const provider = getPaymentProvider();

    const paymentRecord = {
      id: paymentId,
      transactionId,
      touristId: activeTouristId,
      userId: req.user?.id || `usr_${activeTouristId}`,
      partnerId: partner.id,
      partnerName: partner.name,
      partnerType: partner.type,
      partnerLocation: partner.location,
      category,
      vehicleType: isEVehicle ? vehicleType : null,
      originalBill: bill,
      userCoinsQualified: userCoins,
      greenCoinDiscountPercent,
      partnerSpecialDiscountPercent: validatedPartnerSpecial,
      effectiveDiscountPercent: effectivePct,
      discountSavings: finalDiscountAmount,
      finalAmount,
      paymentMethod,
      upiId,
      paymentProvider: provider.name,
      status: 'PENDING',
      providerOrderId: null,
      providerPaymentId: null,
      authorizationCode: null,
      failureReason: null,
      qrPayload: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null
    };

    // Call provider to create gateway order / QR payload
    let orderResult;
    try {
      orderResult = await provider.createOrder(paymentRecord, { paymentMethod, upiId });
      paymentRecord.providerOrderId = orderResult.providerOrderId || null;
      paymentRecord.qrPayload = orderResult.qrData || null;
    } catch (providerErr) {
      console.warn('[Payment Gateway] Provider order creation notice:', providerErr.message);
      // In demo mode or fallback, provide graceful simulated payload
      paymentRecord.providerOrderId = `order_demo_${Date.now()}`;
      paymentRecord.qrPayload = `upi://pay?pa=demo-safar@gov.in&pn=SAFAR+Demo+${encodeURIComponent(partner.name)}&am=${finalAmount}&cu=INR&tn=DEMO+SAFAR+${paymentId}`;
    }

    const insertedPayment = dbStore.insert('payments', paymentRecord);

    return res.status(201).json({
      success: true,
      message: 'Payment session created successfully',
      payment: insertedPayment,
      providerInfo: provider.getConfig(),
      orderDetails: orderResult
    });
  } catch (err) {
    console.error('createPayment Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to initialize payment session' });
  }
}

/**
 * 3. GET /api/payments/:id
 * Retrieves payment status and complete telemetry
 */
function getPaymentById(req, res) {
  try {
    const { id } = req.params;
    const payment = dbStore.findOne('payments', (p) => p.id === id || p.transactionId === id);

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment record not found' });
    }

    return res.json({
      success: true,
      payment
    });
  } catch (err) {
    console.error('getPaymentById Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve payment details' });
  }
}

/**
 * 4. POST /api/payments/:id/simulate-success
 * Transitions a payment from PENDING to SUCCESS in Demo Mode
 */
async function simulateSuccess(req, res) {
  try {
    const { id } = req.params;
    const payment = dbStore.findOne('payments', (p) => p.id === id || p.transactionId === id);

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment record not found' });
    }

    // Idempotent check: if already successful, return existing receipt
    if (payment.status === 'SUCCESS') {
      const isEVehicle = payment.category === 'e-vehicle' || payment.category === 'e_vehicle';
      return res.json({
        success: true,
        message: 'Payment has already completed successfully',
        payment,
        receipt: {
          paymentId: payment.id,
          transactionId: payment.transactionId,
          authorizationCode: payment.authorizationCode,
          partnerId: payment.partnerId,
          partnerName: payment.partnerName,
          touristId: payment.touristId,
          originalBill: payment.originalBill,
          discountPercent: payment.effectiveDiscountPercent || 0,
          discountSavings: payment.discountSavings || 0,
          finalAmountPaid: payment.finalAmount,
          paymentMethod: payment.paymentMethod || 'DEMO_PAYTM',
          isEVehicle,
          vehicleType: payment.vehicleType || 'E-Rickshaw',
          coinsAwarded: isEVehicle ? 3 : 0,
          completedAt: payment.completedAt,
          verifiedBy: isEVehicle ? 'S.A.F.A.R. Eco-Transit Network' : 'S.A.F.A.R. Mock Payment Settlement Authority'
        }
      });
    }

    const provider = getPaymentProvider();
    const simResult = await provider.simulateSuccess(payment);

    const authorizationCode = simResult.authorizationCode || `AUTH-SAFAR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const providerPaymentId = simResult.providerPaymentId || `pay_demo_${Date.now()}`;
    const completedAt = simResult.completedAt || new Date().toISOString();

    // 1. Update Payment Status to SUCCESS
    const updatedPayment = dbStore.update('payments', payment.id, {
      status: 'SUCCESS',
      authorizationCode,
      providerPaymentId,
      completedAt,
      failureReason: null
    });

    const isEVehicle = payment.category === 'e-vehicle' || payment.category === 'e_vehicle';

    // 2. Insert into Green Coins Transaction Ledger (preventing double deduction/reward)
    const existingTx = dbStore.findOne('greenCoinTransactions', (t) => t.paymentId === payment.id);
    let coinsEarnedThisPayment = 0;
    let isMilestoneReached = false;

    if (!existingTx) {
      if (isEVehicle) {
        coinsEarnedThisPayment = 3;
        
        // Calculate weekly milestone
        const monday = new Date();
        monday.setHours(0, 0, 0, 0);
        const day = monday.getDay();
        const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
        monday.setDate(diff);

        const existingWeekTx = dbStore.get('greenCoinTransactions').filter((t) => 
          t.touristId === payment.touristId && 
          t.transactionType === 'ECO_VEHICLE_PAYMENT' &&
          new Date(t.createdAt) >= monday
        );
        const newTripCount = existingWeekTx.length + 1;
        const alreadyBonus = dbStore.findOne('greenCoinTransactions', (t) => 
          t.touristId === payment.touristId && 
          t.transactionType === 'ECO_VEHICLE_WEEKLY_BONUS' &&
          new Date(t.createdAt) >= monday
        );

        isMilestoneReached = (newTripCount >= 10 && !alreadyBonus);

        // Record E-Vehicle Payment Transaction
        dbStore.insert('greenCoinTransactions', {
          userId: payment.userId,
          touristId: payment.touristId,
          paymentId: payment.id,
          transactionId: payment.transactionId,
          transactionType: 'ECO_VEHICLE_PAYMENT',
          amountPaid: payment.finalAmount,
          fareAmount: payment.originalBill,
          vehicleType: payment.vehicleType || 'E-Rickshaw',
          coinsAwarded: 3,
          paymentMethod: payment.paymentMethod,
          provider: payment.paymentProvider,
          status: 'SUCCESS',
          authorizationCode,
          description: `E-Vehicle Trip (${payment.vehicleType || 'E-Rickshaw'}) — Full fare ₹${payment.finalAmount} paid. Rewarded +3 Green Coins 🌱`,
          createdAt: completedAt
        });

        // Insert into approved greenRewards to increment wallet balance
        dbStore.insert('greenRewards', {
          id: `gr_ev_${Date.now()}`,
          touristId: payment.touristId,
          touristName: 'Tourist',
          activityType: 'ECO_VEHICLE',
          vehicleType: payment.vehicleType || 'E-Rickshaw',
          farePaid: payment.finalAmount,
          coins: 3,
          status: 'APPROVED',
          sourceCategory: 'Eco Travel',
          description: `Zero-Emission ${payment.vehicleType || 'E-Rickshaw'} fare payment via SAFAR`,
          submittedAt: completedAt,
          verifiedAt: completedAt,
          verifiedBy: 'S.A.F.A.R. Eco-Transit Network (Auto-Verified)'
        });

        if (isMilestoneReached) {
          coinsEarnedThisPayment += 2;
          dbStore.insert('greenCoinTransactions', {
            userId: payment.userId,
            touristId: payment.touristId,
            paymentId: `EV-BONUS-${Date.now()}`,
            transactionType: 'ECO_VEHICLE_WEEKLY_BONUS',
            coinsAwarded: 2,
            milestoneTripCount: newTripCount,
            status: 'SUCCESS',
            description: `Weekly Green Mobility Bonus (10 E-Vehicle Trips Milestone) — Awarded +2 Green Coins 🎉`,
            createdAt: completedAt
          });

          dbStore.insert('greenRewards', {
            id: `gr_ev_bonus_${Date.now()}`,
            touristId: payment.touristId,
            touristName: 'Tourist',
            activityType: 'ECO_VEHICLE',
            vehicleType: payment.vehicleType || 'E-Rickshaw',
            farePaid: 0,
            coins: 2,
            status: 'APPROVED',
            sourceCategory: 'Eco Travel',
            description: `Weekly Green Mobility Bonus (10 E-Vehicle Trips) — +2 Coins`,
            submittedAt: completedAt,
            verifiedAt: completedAt,
            verifiedBy: 'S.A.F.A.R. System Milestone'
          });
        }
      } else {
        dbStore.insert('greenCoinTransactions', {
          userId: payment.userId,
          touristId: payment.touristId,
          paymentId: payment.id,
          transactionId: payment.transactionId,
          transactionType: 'PARTNER_CHECKOUT',
          partnerId: payment.partnerId,
          partnerName: payment.partnerName,
          amountPaid: payment.finalAmount,
          originalBill: payment.originalBill,
          coinsUsedForTier: payment.userCoinsQualified,
          greenCoinDiscountPercent: payment.greenCoinDiscountPercent,
          partnerSpecialDiscountPercent: payment.partnerSpecialDiscountPercent,
          effectiveDiscountPercent: payment.effectiveDiscountPercent,
          savingsAmount: payment.discountSavings,
          paymentMethod: payment.paymentMethod,
          provider: payment.paymentProvider,
          status: 'SUCCESS',
          authorizationCode,
          description: `${payment.effectiveDiscountPercent}% discount applied at ${payment.partnerName} (${payment.paymentMethod})`,
          createdAt: completedAt
        });
      }
    }

    // 3. Trigger User & Command Desk Notification
    dbStore.insert('notifications', {
      type: 'SUCCESS',
      title: isEVehicle ? '🌱 E-Vehicle Fare Paid & Green Coins Awarded!' : 'Payment Successful',
      message: isEVehicle 
        ? `Paid ₹${payment.finalAmount} to driver. Rewarded +${coinsEarnedThisPayment || 3} Green Coins to your wallet!`
        : `Paid ₹${payment.finalAmount} at ${payment.partnerName} (Saved ₹${payment.discountSavings} — ${payment.effectiveDiscountPercent}% off with Green Rewards).`,
      timestamp: completedAt,
      read: false,
      touristId: payment.touristId
    });

    return res.json({
      success: true,
      message: 'Demo payment simulated successfully',
      payment: updatedPayment,
      receipt: {
        paymentId: updatedPayment.id,
        transactionId: updatedPayment.transactionId,
        authorizationCode,
        providerPaymentId,
        partnerId: updatedPayment.partnerId,
        partnerName: updatedPayment.partnerName,
        touristId: updatedPayment.touristId,
        originalBill: updatedPayment.originalBill,
        discountPercent: updatedPayment.effectiveDiscountPercent,
        discountSavings: updatedPayment.discountSavings,
        finalAmountPaid: updatedPayment.finalAmount,
        paymentMethod: updatedPayment.paymentMethod,
        isEVehicle,
        vehicleType: payment.vehicleType || 'E-Rickshaw',
        coinsAwarded: isEVehicle ? (coinsEarnedThisPayment || 3) : 0,
        isMilestoneReached,
        completedAt,
        verifiedBy: isEVehicle ? 'S.A.F.A.R. Eco-Transit Network' : 'S.A.F.A.R. Demo Payment Authority',
        isDemoPayment: true
      }
    });
  } catch (err) {
    console.error('simulateSuccess Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to simulate payment success' });
  }
}

/**
 * 5. POST /api/payments/:id/simulate-fail
 * Transitions a payment from PENDING to FAILED in Demo Mode
 */
async function simulateFailure(req, res) {
  try {
    const { id } = req.params;
    const { reason = 'Simulated user cancellation or banking decline' } = req.body;

    const payment = dbStore.findOne('payments', (p) => p.id === id || p.transactionId === id);
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment record not found' });
    }

    const provider = getPaymentProvider();
    const failResult = await provider.simulateFailure(payment, reason);

    const updatedPayment = dbStore.update('payments', payment.id, {
      status: 'FAILED',
      failureReason: failResult.failureReason || reason,
      updatedAt: new Date().toISOString()
    });

    return res.json({
      success: true,
      message: 'Payment simulation resulted in failure',
      payment: updatedPayment
    });
  } catch (err) {
    console.error('simulateFailure Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to simulate payment failure' });
  }
}

/**
 * 6. POST /api/payments/:id/cancel
 * Transitions a payment from PENDING to CANCELLED
 */
function cancelPayment(req, res) {
  try {
    const { id } = req.params;
    const payment = dbStore.findOne('payments', (p) => p.id === id || p.transactionId === id);

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment record not found' });
    }

    if (payment.status === 'SUCCESS') {
      return res.status(400).json({ success: false, error: 'Cannot cancel an already successful payment' });
    }

    const updatedPayment = dbStore.update('payments', payment.id, {
      status: 'CANCELLED',
      failureReason: 'Payment cancelled by user',
      updatedAt: new Date().toISOString()
    });

    return res.json({
      success: true,
      message: 'Payment cancelled',
      payment: updatedPayment
    });
  } catch (err) {
    console.error('cancelPayment Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to cancel payment' });
  }
}

/**
 * 7. POST /api/payments/verify
 * Real Razorpay signature verification endpoint
 */
async function verifyPaymentSignature(req, res) {
  try {
    const { paymentId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const payment = dbStore.findOne('payments', (p) => p.id === paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment record not found' });
    }

    const provider = getPaymentProvider();
    const verification = await provider.verifyPayment(payment, {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    if (verification.success) {
      const completedAt = verification.verifiedAt || new Date().toISOString();
      const updatedPayment = dbStore.update('payments', payment.id, {
        status: 'SUCCESS',
        authorizationCode: verification.authorizationCode,
        providerPaymentId: verification.providerPaymentId,
        completedAt
      });

      // Insert into greenCoinTransactions
      dbStore.insert('greenCoinTransactions', {
        userId: payment.userId,
        touristId: payment.touristId,
        paymentId: payment.id,
        transactionId: payment.transactionId,
        transactionType: 'PARTNER_CHECKOUT',
        partnerId: payment.partnerId,
        partnerName: payment.partnerName,
        amountPaid: payment.finalAmount,
        originalBill: payment.originalBill,
        coinsUsedForTier: payment.userCoinsQualified,
        greenCoinDiscountPercent: payment.greenCoinDiscountPercent,
        effectiveDiscountPercent: payment.effectiveDiscountPercent,
        savingsAmount: payment.discountSavings,
        paymentMethod: payment.paymentMethod,
        provider: 'razorpay',
        status: 'SUCCESS',
        authorizationCode: verification.authorizationCode,
        description: `${payment.effectiveDiscountPercent}% discount applied at ${payment.partnerName} via Razorpay`,
        createdAt: completedAt
      });

      return res.json({
        success: true,
        message: 'Payment verified successfully via Razorpay',
        payment: updatedPayment
      });
    }

    return res.status(400).json({ success: false, error: 'Signature verification failed' });
  } catch (err) {
    console.error('verifyPaymentSignature Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Verification error' });
  }
}

/**
 * 8. POST /api/payments/webhook
 * Official Razorpay Webhook receiver
 */
async function handleWebhook(req, res) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const provider = getPaymentProvider();

    const webhookResult = await provider.handleWebhook(req.body, signature, req.headers);
    return res.json({ success: true, webhookResult });
  } catch (err) {
    console.error('handleWebhook Error:', err);
    return res.status(400).json({ success: false, error: err.message });
  }
}

module.exports = {
  getPaymentConfig,
  createPayment,
  getPaymentById,
  simulateSuccess,
  simulateFailure,
  cancelPayment,
  verifyPaymentSignature,
  handleWebhook
};
