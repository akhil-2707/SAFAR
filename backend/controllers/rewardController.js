const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { dbStore } = require('../config/db');

// ============================================================
// SAFAR GREEN REWARDS POLICY CONSTANTS (Ministry of Tourism)
// ============================================================
const SAFAR_MAX_GREEN_DISCOUNT_PERCENT = 40;   // Max discount from Green Coins = 40%
const SAFAR_MIN_PAYABLE_PERCENT = 60;          // Tourist must always pay minimum 60%

// Helper to calculate SHA-256 hash of proof image / content
function getProofHash(content) {
  if (!content) return null;
  return crypto.createHash('sha256').update(String(content)).digest('hex');
}

// Helper to determine discount percentage based on tiers and coin balance
function getTierDiscount(coins, policyTiers, defaultTiers) {
  const tiers = (policyTiers && policyTiers.length > 0) ? policyTiers : defaultTiers;
  if (!tiers || tiers.length === 0) return 0;

  // If partner tiers format: { coins: 10, discountPercent: 2 }
  if (tiers[0].coins !== undefined) {
    const eligible = tiers
      .filter((t) => coins >= t.coins)
      .sort((a, b) => b.discountPercent - a.discountPercent);
    return eligible.length > 0 ? eligible[0].discountPercent : 0;
  }

  // If default tiers format: { minCoins: 10, maxCoins: 24, discountPercent: 5 }
  const matched = tiers.find((t) => coins >= t.minCoins && coins <= t.maxCoins);
  if (matched) return matched.discountPercent;
  if (coins >= 100) return SAFAR_MAX_GREEN_DISCOUNT_PERCENT;
  return 0;
}

// Valid activity types
const VALID_ACTIVITY_TYPES = [
  'ECO_VEHICLE',
  'PARTNER_HOTEL',
  'PARTNER_RESTAURANT',
  'PARTNER_CAFE',
  'TOURIST_PLACE'
];

// 1. GET /api/rewards/partners - List active SAFAR Partners
function getPartners(req, res) {
  try {
    const { all, type, location } = req.query;
    let partners = dbStore.get('partners');

    // Only active partners unless explicitly querying all as authority
    if (all !== 'true') {
      partners = partners.filter((p) => p.status === 'ACTIVE');
    }

    if (type && type !== 'ALL') {
      partners = partners.filter((p) => p.type === type.toUpperCase());
    }

    if (location && location !== 'ALL') {
      partners = partners.filter((p) => p.location.toLowerCase() === location.toLowerCase());
    }

    return res.json({ success: true, count: partners.length, partners });
  } catch (err) {
    console.error('getPartners Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve partners' });
  }
}

// 2. GET /api/rewards/partners/:id - Get specific partner details
function getPartnerById(req, res) {
  try {
    const partner = dbStore.findById('partners', req.params.id);
    if (!partner) {
      return res.status(404).json({ success: false, error: 'Partner not found' });
    }
    return res.json({ success: true, partner });
  } catch (err) {
    console.error('getPartnerById Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve partner' });
  }
}

// 3. POST /api/rewards/partners - Create Partner (Authority Desk)
function createPartner(req, res) {
  try {
    const { name, type, location, address, contactPhone, description, rewardCoins, discountPolicy, maximumDiscount } = req.body;

    if (!name || !type || !location || !address) {
      return res.status(400).json({ success: false, error: 'Name, type, location, and address are required' });
    }

    // Partners may set their own maximum discount (even beyond 40% Green Coin cap if they choose for special events)
    const cappedMaxDiscount = Number(maximumDiscount) || SAFAR_MAX_GREEN_DISCOUNT_PERCENT;

    // Sanitize discount policy tiers
    const sanitizedTiers = (discountPolicy || []).map((t) => ({
      coins: Number(t.coins) || 0,
      discountPercent: Math.min(Number(t.discountPercent) || 0, cappedMaxDiscount)
    }));

    const newPartner = dbStore.insert('partners', {
      name,
      type: type.toUpperCase(),
      location,
      address,
      contactPhone: contactPhone || '+91 90000 00000',
      description: description || 'Certified SAFAR Tourism Partner',
      status: 'ACTIVE',
      rewardCoins: Number(rewardCoins) || 1,
      isSpecialEco: Boolean(req.body.isSpecialEco),
      rating: 4.8,
      discountPolicy: sanitizedTiers,
      maximumDiscount: cappedMaxDiscount
    });

    return res.status(201).json({
      success: true,
      message: `SAFAR Partner created successfully. Max Green Coin discount: ${cappedMaxDiscount}%`,
      partner: newPartner
    });
  } catch (err) {
    console.error('createPartner Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create partner' });
  }
}

// 4. PATCH /api/rewards/partners/:id - Update Partner & Discount Policy
function updatePartner(req, res) {
  try {
    const { id } = req.params;
    const partner = dbStore.findById('partners', id);
    if (!partner) {
      return res.status(404).json({ success: false, error: 'Partner not found' });
    }

    const updates = { ...req.body };

    if (updates.discountPolicy) {
      const maxCap = updates.maximumDiscount !== undefined ? updates.maximumDiscount : (partner.maximumDiscount || SAFAR_MAX_GREEN_DISCOUNT_PERCENT);
      updates.discountPolicy = updates.discountPolicy.map((t) => ({
        coins: Number(t.coins) || 0,
        discountPercent: Math.min(Number(t.discountPercent) || 0, maxCap)
      }));
    }

    const updated = dbStore.update('partners', id, updates);
    return res.json({
      success: true,
      message: 'Partner updated successfully',
      partner: updated
    });
  } catch (err) {
    console.error('updatePartner Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update partner' });
  }
}

// 5. POST /api/rewards/submit - Tourist Submits Proof
function submitRewardProof(req, res) {
  try {
    const {
      touristId,
      activityType,
      vehicleType,
      vehicleNumber,
      farePaid,
      partnerId,
      // Tourist Place fields
      placeName,
      placeLocation,
      placeCategory,
      placeReview,
      proofImage,
      notes
    } = req.body;

    const activeTouristId = touristId || req.user?.touristId;
    if (!activeTouristId) {
      return res.status(400).json({ success: false, error: 'Tourist ID required' });
    }

    const tourist = dbStore.findById('tourists', activeTouristId);
    const touristName = tourist ? tourist.fullName : (req.user?.name || 'Tourist');

    if (!VALID_ACTIVITY_TYPES.includes(activityType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid activity type. Must be one of: ${VALID_ACTIVITY_TYPES.join(', ')}`
      });
    }

    if (!proofImage) {
      return res.status(400).json({ success: false, error: 'Verification photograph / proof is required' });
    }

    // SHA-256 Proof Hash Generation
    const proofHash = getProofHash(proofImage);

    // MANDATORY BACKEND DUPLICATE REWARD CHECK
    const allRewards = dbStore.get('greenRewards');

    // 1. Proof hash check: Cannot upload exact same photo multiple times
    const duplicatePhoto = allRewards.find(
      (r) => r.touristId === activeTouristId && r.proofHash === proofHash
    );
    if (duplicatePhoto) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate submission detected: This exact photograph / proof has already been submitted for verification.'
      });
    }

    const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
    const now = Date.now();

    let vehicleClean = null;
    let partnerObj = null;
    let sourceCategory = 'Eco Travel';

    // ---- Activity 1: Eco Vehicle ----
    if (activityType === 'ECO_VEHICLE') {
      if (!vehicleType) {
        return res.status(400).json({ success: false, error: 'Eco-friendly vehicle type is required' });
      }
      if (!vehicleNumber || vehicleNumber.trim().length < 3) {
        return res.status(400).json({ success: false, error: 'Valid vehicle registration number is required' });
      }

      vehicleClean = vehicleNumber.trim().toUpperCase().replace(/\s+/g, '-');

      const duplicateVehicle = allRewards.find((r) => {
        if (r.touristId !== activeTouristId || r.activityType !== 'ECO_VEHICLE') return false;
        if (r.vehicleNumber !== vehicleClean) return false;
        const subTime = new Date(r.submittedAt).getTime();
        return now - subTime < TWELVE_HOURS_MS;
      });

      if (duplicateVehicle) {
        return res.status(400).json({
          success: false,
          error: `Duplicate journey detected: An eco-travel reward for vehicle ${vehicleClean} has already been submitted by you today.`
        });
      }

      sourceCategory = 'Eco Travel';

    // ---- Activity 2: Partner Visit ----
    } else if (['PARTNER_HOTEL', 'PARTNER_RESTAURANT', 'PARTNER_CAFE'].includes(activityType)) {
      if (!partnerId) {
        return res.status(400).json({ success: false, error: 'SAFAR Partner selection is required' });
      }

      partnerObj = dbStore.findById('partners', partnerId);
      if (!partnerObj) {
        return res.status(404).json({ success: false, error: 'Selected partner does not exist in SAFAR directory' });
      }

      if (partnerObj.status !== 'ACTIVE') {
        return res.status(400).json({
          success: false,
          error: 'Only ACTIVE SAFAR Partner establishments are eligible for Green Rewards.'
        });
      }

      const duplicatePartner = allRewards.find((r) => {
        if (r.touristId !== activeTouristId || r.partnerId !== partnerId) return false;
        const subTime = new Date(r.submittedAt).getTime();
        return now - subTime < TWELVE_HOURS_MS;
      });

      if (duplicatePartner) {
        return res.status(400).json({
          success: false,
          error: `Duplicate visit detected: You have already submitted a proof for ${partnerObj.name} today.`
        });
      }

      sourceCategory = partnerObj.type === 'HOTEL' ? 'Partner Hotels'
        : partnerObj.type === 'RESTAURANT' ? 'Restaurants'
        : partnerObj.type === 'CAFE' ? 'Cafes' : 'Partner Visit';

    // ---- Activity 3: Tourist Place ----
    } else if (activityType === 'TOURIST_PLACE') {
      if (!placeName || placeName.trim().length < 3) {
        return res.status(400).json({ success: false, error: 'Name of the tourist place is required (min 3 characters)' });
      }

      if (!placeLocation || placeLocation.trim().length < 2) {
        return res.status(400).json({ success: false, error: 'Location / City of the tourist place is required' });
      }

      // Mandatory user tagging: User must tag both Authority Desk and Tourist Place
      const hasTaggedAuthority = req.body.taggedAuthorityDesk === true || req.body.taggedAuthorityDesk === 'true';
      const hasTaggedPlace = req.body.taggedPlaceName === true || req.body.taggedPlaceName === 'true';
      if (!hasTaggedAuthority || !hasTaggedPlace) {
        return res.status(400).json({
          success: false,
          error: 'Compulsory tagging required: You must confirm tagging both the S.A.F.A.R. Authority Desk and the Tourist Place before uploading.'
        });
      }

      // Check: same tourist cannot submit the same place name more than once per day
      const cleanPlaceName = placeName.trim().toLowerCase();
      const duplicatePlace = allRewards.find((r) => {
        if (r.touristId !== activeTouristId || r.activityType !== 'TOURIST_PLACE') return false;
        if ((r.placeName || '').trim().toLowerCase() !== cleanPlaceName) return false;
        const subTime = new Date(r.submittedAt).getTime();
        return now - subTime < TWELVE_HOURS_MS;
      });

      if (duplicatePlace) {
        return res.status(400).json({
          success: false,
          error: `You have already submitted a photo for "${placeName}" today. Try a different tourist spot!`
        });
      }

      sourceCategory = 'Tourist Places';
    }

    // Save image to server filesystem disk if base64 data URL
    let savedFilePath = null;
    let savedFileUrl = null;
    if (proofImage && typeof proofImage === 'string' && proofImage.startsWith('data:image/')) {
      try {
        const uploadsDir = path.join(__dirname, '../uploads/rewards');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const matches = proofImage.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
          const buffer = Buffer.from(matches[2], 'base64');
          const fileName = `reward_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
          const fullPath = path.join(uploadsDir, fileName);
          fs.writeFileSync(fullPath, buffer);
          savedFilePath = fullPath;
          savedFileUrl = `/uploads/rewards/${fileName}`;
          console.log(`[SAFAR Storage] Saved reward photo to disk: ${fullPath} (${buffer.length} bytes)`);
        }
      } catch (saveErr) {
        console.warn('[SAFAR Storage] Warning saving photo to filesystem:', saveErr.message);
      }
    }

    // Insert pending submission
    const newSubmission = dbStore.insert('greenRewards', {
      touristId: activeTouristId,
      touristName,
      activityType,
      vehicleType: vehicleType || null,
      vehicleNumber: vehicleClean,
      farePaid: Number(farePaid) || null,
      partnerId: partnerObj ? partnerObj.id : null,
      partnerName: partnerObj ? partnerObj.name : null,
      partnerType: partnerObj ? partnerObj.type : null,
      // Tourist Place fields
      placeName: activityType === 'TOURIST_PLACE' ? placeName?.trim() : null,
      placeLocation: activityType === 'TOURIST_PLACE' ? (placeLocation?.trim() || null) : null,
      placeCategory: activityType === 'TOURIST_PLACE' ? (placeCategory || 'Heritage Site') : null,
      placeReview: activityType === 'TOURIST_PLACE' ? (placeReview?.trim() || null) : null,
      status: 'PENDING',
      coins: 0,
      sourceCategory,
      proofImage: savedFileUrl || proofImage,
      proofImageBase64: proofImage,
      savedFilePath,
      savedFileUrl,
      proofHash,
      isLiveCameraCaptured: Boolean(req.body.isLiveCameraCaptured !== false),
      notes: notes || null,
      taggedAuthorityDesk: 'S.A.F.A.R. Central Command Desk',
      submittedAt: new Date().toISOString(),
      verifiedAt: null,
      verifiedBy: null,
      rejectionReason: null
    });

    return res.status(201).json({
      success: true,
      message: 'Proof submitted successfully to SAFAR Authority Desk for verification',
      reward: newSubmission
    });
  } catch (err) {
    console.error('submitRewardProof Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to submit reward proof' });
  }
}

// 6. GET /api/rewards/requests - List verification requests for SAFAR Authority Desk
function getRewardRequests(req, res) {
  try {
    const { status, activityType } = req.query;
    let requests = dbStore.get('greenRewards');

    if (status && status !== 'ALL') {
      requests = requests.filter((r) => r.status === status.toUpperCase());
    }

    if (activityType && activityType !== 'ALL') {
      requests = requests.filter((r) => r.activityType === activityType.toUpperCase());
    }

    // Sort newest first
    requests.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    return res.json({ success: true, count: requests.length, requests });
  } catch (err) {
    console.error('getRewardRequests Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve reward requests' });
  }
}

// 7. PATCH /api/rewards/requests/:id/verify - Authority Approves or Rejects Request
function verifyRewardRequest(req, res) {
  try {
    const { id } = req.params;
    const { action, rejectionReason, awardedCoinsOverride } = req.body; // 'APPROVE' or 'REJECT'

    const reward = dbStore.findById('greenRewards', id);
    if (!reward) {
      return res.status(404).json({ success: false, error: 'Reward request not found' });
    }

    if (reward.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: `Request has already been processed with status: ${reward.status}`
      });
    }

    const configs = dbStore.get('rewardConfig');
    const config = configs[0] || {
      ecoVehicleRates: { 'E-Rickshaw': 1, 'E-Auto': 1, 'Electric Cab': 2, 'Electric Bus': 1, 'Other EV': 1 },
      partnerBaseRate: 1,
      specialEcoPartnerRate: 2,
      touristPlaceRate: 2
    };

    const authorityName = req.user?.name || 'S.A.F.A.R. Authority Desk';

    if (action === 'APPROVE') {
      let awardedCoins = 1;

      if (awardedCoinsOverride && Number(awardedCoinsOverride) > 0) {
        // Authority can override coin award (for tourist places especially)
        awardedCoins = Number(awardedCoinsOverride);
      } else if (reward.activityType === 'ECO_VEHICLE') {
        const rates = config.ecoVehicleRates || {};
        awardedCoins = rates[reward.vehicleType] || 1;
      } else if (reward.activityType === 'TOURIST_PLACE') {
        // Tourist Place: base 2 coins, authority can bump up for exceptional photos/reviews
        awardedCoins = config.touristPlaceRate || 2;
      } else {
        // Partner reward rate
        const partner = reward.partnerId ? dbStore.findById('partners', reward.partnerId) : null;
        if (partner && partner.isSpecialEco) {
          awardedCoins = config.specialEcoPartnerRate || 2;
        } else if (partner && partner.rewardCoins) {
          awardedCoins = partner.rewardCoins;
        } else {
          awardedCoins = config.partnerBaseRate || 1;
        }
      }

      const updatedReward = dbStore.update('greenRewards', id, {
        status: 'APPROVED',
        coins: awardedCoins,
        verifiedAt: new Date().toISOString(),
        verifiedBy: authorityName,
        rejectionReason: null
      });

      // Record in immutable GreenCoinTransactions audit trail
      const descriptionMap = {
        ECO_VEHICLE: `Verified Eco-Travel via ${reward.vehicleType} (${reward.vehicleNumber})`,
        PARTNER_HOTEL: `Verified stay at SAFAR Partner: ${reward.partnerName}`,
        PARTNER_RESTAURANT: `Verified dining at SAFAR Partner: ${reward.partnerName}`,
        PARTNER_CAFE: `Verified visit to SAFAR Cafe: ${reward.partnerName}`,
        TOURIST_PLACE: `Verified Tourist Photo: ${reward.placeName}${reward.placeLocation ? ` (${reward.placeLocation})` : ''}`
      };

      const transaction = dbStore.insert('greenCoinTransactions', {
        userId: `usr_${reward.touristId}`,
        touristId: reward.touristId,
        rewardId: reward.id,
        transactionType: 'EARNED',
        coins: awardedCoins,
        source: reward.sourceCategory || 'Green Rewards',
        description: descriptionMap[reward.activityType] || `Verified activity: ${reward.activityType}`,
        createdAt: new Date().toISOString()
      });

      dbStore.insert('notifications', {
        type: 'SUCCESS',
        title: '🌱 Green Coins Awarded!',
        message: `+${awardedCoins} Green Coin(s) added to your Green Wallet for ${reward.sourceCategory}.`,
        timestamp: new Date().toISOString(),
        read: false,
        touristId: reward.touristId
      });

      return res.json({
        success: true,
        message: `Request approved. +${awardedCoins} Green Coins credited to tourist wallet.`,
        reward: updatedReward,
        transaction
      });
    } else if (action === 'REJECT') {
      const reason = rejectionReason || 'Proof photograph could not be verified by authority';
      const updatedReward = dbStore.update('greenRewards', id, {
        status: 'REJECTED',
        coins: 0,
        verifiedAt: new Date().toISOString(),
        verifiedBy: authorityName,
        rejectionReason: reason
      });

      dbStore.insert('notifications', {
        type: 'INFO',
        title: 'Green Reward Request Update',
        message: `Your reward request was not approved: "${reason}"`,
        timestamp: new Date().toISOString(),
        read: false,
        touristId: reward.touristId
      });

      return res.json({
        success: true,
        message: 'Reward request rejected with reason logged',
        reward: updatedReward
      });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid action. Must be APPROVE or REJECT' });
    }
  } catch (err) {
    console.error('verifyRewardRequest Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to verify reward request' });
  }
}

// 8. GET /api/rewards/wallet/:touristId - Retrieve Tourist Green Wallet
function getUserWallet(req, res) {
  try {
    const touristId = req.params.touristId || req.user?.touristId;
    if (!touristId) {
      return res.status(400).json({ success: false, error: 'Tourist ID is required' });
    }

    const allRewards = dbStore.get('greenRewards').filter(
      (r) => r.touristId === touristId && r.status === 'APPROVED'
    );

    let ecoTravelCoins = 0;
    let hotelCoins = 0;
    let restaurantCoins = 0;
    let cafeCoins = 0;
    let touristPlaceCoins = 0;

    allRewards.forEach((r) => {
      const c = Number(r.coins) || 0;
      if (r.activityType === 'ECO_VEHICLE') ecoTravelCoins += c;
      else if (r.activityType === 'PARTNER_HOTEL') hotelCoins += c;
      else if (r.activityType === 'PARTNER_RESTAURANT') restaurantCoins += c;
      else if (r.activityType === 'PARTNER_CAFE') cafeCoins += c;
      else if (r.activityType === 'TOURIST_PLACE') touristPlaceCoins += c;
    });

    const totalCoins = ecoTravelCoins + hotelCoins + restaurantCoins + cafeCoins + touristPlaceCoins;

    // Updated default tiers for 40% max discount
    const configs = dbStore.get('rewardConfig');
    const defaultTiers = configs[0]?.defaultTiers || [
      { minCoins: 1,   maxCoins: 9,      discountPercent: 2 },
      { minCoins: 10,  maxCoins: 24,     discountPercent: 5 },
      { minCoins: 25,  maxCoins: 49,     discountPercent: 10 },
      { minCoins: 50,  maxCoins: 74,     discountPercent: 20 },
      { minCoins: 75,  maxCoins: 99,     discountPercent: 30 },
      { minCoins: 100, maxCoins: 999999, discountPercent: 40 }
    ];

    const availableDiscountTier = getTierDiscount(totalCoins, null, defaultTiers);

    return res.json({
      success: true,
      wallet: {
        touristId,
        totalCoins,
        earnedFrom: {
          ecoTravel: ecoTravelCoins,
          partnerHotels: hotelCoins,
          restaurants: restaurantCoins,
          cafes: cafeCoins,
          touristPlaces: touristPlaceCoins
        },
        availableDiscountTier,
        maximumPossible: SAFAR_MAX_GREEN_DISCOUNT_PERCENT,
        minimumPayablePercent: SAFAR_MIN_PAYABLE_PERCENT,
        policyNotice: `Green Coins determine your discount tier (up to ${SAFAR_MAX_GREEN_DISCOUNT_PERCENT}% max). You always pay at least ${SAFAR_MIN_PAYABLE_PERCENT}% of the bill — purchases can never be free. Partners may offer additional special discounts beyond the Green Coin tier on their own discretion.`
      }
    });
  } catch (err) {
    console.error('getUserWallet Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve wallet' });
  }
}

// 9. GET /api/rewards/history/:touristId - Tourist Submission History
function getUserRewardHistory(req, res) {
  try {
    const touristId = req.params.touristId || req.user?.touristId;
    if (!touristId) {
      return res.status(400).json({ success: false, error: 'Tourist ID is required' });
    }

    const history = dbStore.get('greenRewards')
      .filter((r) => r.touristId === touristId)
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    const transactions = dbStore.get('greenCoinTransactions')
      .filter((t) => t.touristId === touristId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ success: true, count: history.length, history, transactions });
  } catch (err) {
    console.error('getUserRewardHistory Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve reward history' });
  }
}

// 10. POST /api/rewards/calculate-discount - Backend Calculation Engine
// Max Green Coin Discount = 40%. Min payable = 60%.
// Partners CAN offer extra special discounts beyond the Green Coin tier at their discretion.
function calculateDiscount(req, res) {
  try {
    const { touristId, partnerId, originalBill, partnerSpecialDiscountPercent } = req.body;

    const bill = Number(originalBill);
    if (!bill || bill <= 0 || isNaN(bill)) {
      return res.status(400).json({ success: false, error: 'A valid positive bill amount is required' });
    }

    if (!partnerId) {
      return res.status(400).json({ success: false, error: 'Partner ID is required' });
    }

    const partner = dbStore.findById('partners', partnerId);
    if (!partner) {
      return res.status(404).json({ success: false, error: 'Partner not found' });
    }

    if (partner.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, error: 'Partner is currently inactive for green rewards' });
    }

    // Determine verified user coins from database (NEVER trust frontend coins!)
    const activeTouristId = touristId || req.user?.touristId;
    let userCoins = 0;
    if (activeTouristId) {
      const approvedRewards = dbStore.get('greenRewards').filter(
        (r) => r.touristId === activeTouristId && r.status === 'APPROVED'
      );
      userCoins = approvedRewards.reduce((sum, r) => sum + (Number(r.coins) || 0), 0);
    }

    const configs = dbStore.get('rewardConfig');
    const defaultTiers = configs[0]?.defaultTiers || [
      { minCoins: 1,   maxCoins: 9,      discountPercent: 2 },
      { minCoins: 10,  maxCoins: 24,     discountPercent: 5 },
      { minCoins: 25,  maxCoins: 49,     discountPercent: 10 },
      { minCoins: 50,  maxCoins: 74,     discountPercent: 20 },
      { minCoins: 75,  maxCoins: 99,     discountPercent: 30 },
      { minCoins: 100, maxCoins: 999999, discountPercent: 40 }
    ];

    // Green Coin tier discount
    const rawTierDiscount = getTierDiscount(userCoins, partner.discountPolicy, defaultTiers);

    // Cap Green Coin discount at partner's maximum AND at system max (40%)
    const partnerGreenMax = partner.maximumDiscount !== undefined ? partner.maximumDiscount : SAFAR_MAX_GREEN_DISCOUNT_PERCENT;
    const greenCoinDiscountPercent = Math.min(rawTierDiscount, partnerGreenMax, SAFAR_MAX_GREEN_DISCOUNT_PERCENT);

    // Partner Special Discount (e.g. festival offer, they can set whatever they want)
    const partnerSpecial = Number(partnerSpecialDiscountPercent) || 0;
    const validatedPartnerSpecial = Math.max(0, Math.min(partnerSpecial, 100));

    // Combined discount — but ALWAYS enforce min 60% payable
    const totalDiscountPercent = Math.min(greenCoinDiscountPercent + validatedPartnerSpecial, SAFAR_MAX_GREEN_DISCOUNT_PERCENT);
    // If partner offers beyond 40% special, we allow up to their limit (partner's own money)
    const effectiveTotalDiscount = greenCoinDiscountPercent + validatedPartnerSpecial;

    const calculatedDiscountAmount = Math.round((bill * effectiveTotalDiscount) / 100);

    // Enforce minimum 60% payable — even with partner specials, tourist always pays at least 60%
    const minPayable = Math.ceil(bill * (SAFAR_MIN_PAYABLE_PERCENT / 100));
    const maxAllowedDiscount = bill - minPayable;
    const finalDiscountAmount = Math.min(calculatedDiscountAmount, maxAllowedDiscount);
    const finalPayable = bill - finalDiscountAmount;

    return res.json({
      success: true,
      calculation: {
        partnerId: partner.id,
        partnerName: partner.name,
        partnerType: partner.type,
        originalBill: bill,
        userCoins,
        greenCoinDiscountPercent,
        partnerSpecialDiscountPercent: validatedPartnerSpecial,
        effectiveTotalDiscountPercent: Math.round((finalDiscountAmount / bill) * 100),
        partnerMaxGreenDiscount: partnerGreenMax,
        safarGreenMaxCap: SAFAR_MAX_GREEN_DISCOUNT_PERCENT,
        discountAmount: finalDiscountAmount,
        finalPayable,
        minimumPayablePercentage: SAFAR_MIN_PAYABLE_PERCENT,
        canBeFree: false,
        note: `Calculated by SAFAR Backend Engine. Min payable = ${SAFAR_MIN_PAYABLE_PERCENT}% of bill. Green Coin max = ${SAFAR_MAX_GREEN_DISCOUNT_PERCENT}%. Partners may add their own special discounts.`
      }
    });
  } catch (err) {
    console.error('calculateDiscount Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to calculate discount' });
  }
}

// 11. POST /api/rewards/pay - Checkout / Payment at SAFAR Partner
function processPartnerPayment(req, res) {
  try {
    const { touristId, partnerId, originalBill, paymentMethod, partnerSpecialDiscountPercent } = req.body;

    const bill = Number(originalBill);
    if (!bill || bill <= 0) {
      return res.status(400).json({ success: false, error: 'Valid original bill amount required' });
    }

    const partner = dbStore.findById('partners', partnerId);
    if (!partner || partner.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, error: 'Invalid or inactive partner' });
    }

    // Determine verified user coins from database
    const activeTouristId = touristId || req.user?.touristId;
    let userCoins = 0;
    if (activeTouristId) {
      const approvedRewards = dbStore.get('greenRewards').filter(
        (r) => r.touristId === activeTouristId && r.status === 'APPROVED'
      );
      userCoins = approvedRewards.reduce((sum, r) => sum + (Number(r.coins) || 0), 0);
    }

    // Backend independent calculation
    const configs = dbStore.get('rewardConfig');
    const defaultTiers = configs[0]?.defaultTiers || [
      { minCoins: 1,   maxCoins: 9,      discountPercent: 2 },
      { minCoins: 10,  maxCoins: 24,     discountPercent: 5 },
      { minCoins: 25,  maxCoins: 49,     discountPercent: 10 },
      { minCoins: 50,  maxCoins: 74,     discountPercent: 20 },
      { minCoins: 75,  maxCoins: 99,     discountPercent: 30 },
      { minCoins: 100, maxCoins: 999999, discountPercent: 40 }
    ];

    const rawTierDiscount = getTierDiscount(userCoins, partner.discountPolicy, defaultTiers);
    const partnerGreenMax = partner.maximumDiscount !== undefined ? partner.maximumDiscount : SAFAR_MAX_GREEN_DISCOUNT_PERCENT;
    const greenCoinDiscountPercent = Math.min(rawTierDiscount, partnerGreenMax, SAFAR_MAX_GREEN_DISCOUNT_PERCENT);

    const partnerSpecial = Number(partnerSpecialDiscountPercent) || 0;
    const validatedPartnerSpecial = Math.max(0, Math.min(partnerSpecial, 100));

    const totalCalculated = Math.round((bill * (greenCoinDiscountPercent + validatedPartnerSpecial)) / 100);
    const minPayable = Math.ceil(bill * (SAFAR_MIN_PAYABLE_PERCENT / 100));
    const maxAllowedDiscount = bill - minPayable;
    const finalDiscountAmount = Math.min(totalCalculated, maxAllowedDiscount);
    const finalAmount = bill - finalDiscountAmount;
    const effectivePct = Math.round((finalDiscountAmount / bill) * 100);

    const paymentId = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const authorizationCode = `AUTH-SAFAR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const tx = dbStore.insert('greenCoinTransactions', {
      userId: `usr_${activeTouristId}`,
      touristId: activeTouristId,
      paymentId,
      transactionType: 'DISCOUNT_APPLIED',
      coinsUsedForTier: userCoins,
      greenCoinDiscountPercent,
      partnerSpecialDiscountPercent: validatedPartnerSpecial,
      effectiveDiscountPercent: effectivePct,
      savingsAmount: finalDiscountAmount,
      description: `${effectivePct}% total discount at ${partner.name} (Green Coins: ${greenCoinDiscountPercent}%${validatedPartnerSpecial > 0 ? ` + Partner Special: ${validatedPartnerSpecial}%` : ''})`,
      createdAt: new Date().toISOString()
    });

    dbStore.insert('notifications', {
      type: 'SUCCESS',
      title: 'Payment Successful',
      message: `Paid ₹${finalAmount} at ${partner.name} (Saved ₹${finalDiscountAmount} — ${effectivePct}% off with Green Rewards${validatedPartnerSpecial > 0 ? ' + Partner Special' : ''}).`,
      timestamp: new Date().toISOString(),
      read: false,
      touristId: activeTouristId
    });

    return res.status(201).json({
      success: true,
      message: 'Payment completed successfully with Green Rewards verified discount',
      receipt: {
        paymentId,
        authorizationCode,
        partnerId: partner.id,
        partnerName: partner.name,
        touristId: activeTouristId,
        originalBill: bill,
        greenCoinsQualified: userCoins,
        greenCoinDiscountPercent,
        partnerSpecialDiscountPercent: validatedPartnerSpecial,
        effectiveDiscountPercent: effectivePct,
        discountSavings: finalDiscountAmount,
        finalAmountPaid: finalAmount,
        paymentMethod: paymentMethod || 'UPI / QR Code',
        timestamp: new Date().toISOString(),
        verifiedBy: 'SAFAR Green Rewards Gateway'
      }
    });
  } catch (err) {
    console.error('processPartnerPayment Error:', err);
    return res.status(500).json({ success: false, error: 'Payment processing failed' });
  }
}

// 12. GET /api/rewards/config & PATCH /api/rewards/config - Configuration Management
function getRewardConfig(req, res) {
  try {
    const configs = dbStore.get('rewardConfig');
    return res.json({ success: true, config: configs[0] || {} });
  } catch (err) {
    console.error('getRewardConfig Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve config' });
  }
}

function updateRewardConfig(req, res) {
  try {
    const configs = dbStore.get('rewardConfig');
    const existing = configs[0];
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Config not found' });
    }

    const updates = { ...req.body };
    const updated = dbStore.update('rewardConfig', existing.id, updates);
    return res.json({ success: true, message: 'Configuration updated successfully', config: updated });
  } catch (err) {
    console.error('updateRewardConfig Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update config' });
  }
}

// 14. GET /api/rewards/public-gallery - Public Tourist Places Gallery
// Only returns successfully submitted, non-rejected tourist place photos with complete details
function getPublicGallery(req, res) {
  try {
    const allRewards = dbStore.get('greenRewards') || [];
    const publicPhotos = allRewards
      .filter((r) => 
        (r.activityType === 'TOURIST_PLACE' || r.placeName) &&
        r.proofImage &&
        typeof r.proofImage === 'string' &&
        r.proofImage.trim().length > 3 &&
        r.status !== 'REJECTED' // Never show rejected uploads
      )
      .map((r) => ({
        id: r.id,
        touristId: r.touristId,
        touristName: r.touristName || 'Verified Tourist',
        activityType: r.activityType || 'TOURIST_PLACE',
        placeName: r.placeName || r.partnerName || 'Tourist Destination',
        placeLocation: r.placeLocation || 'India',
        placeCategory: r.placeCategory || (r.activityType === 'TOURIST_PLACE' ? 'Heritage Site' : 'Eco Partner'),
        placeReview: r.placeReview || null,
        proofImage: r.proofImage,
        coins: r.coins || 2,
        status: r.status,
        isLiveCameraCaptured: r.isLiveCameraCaptured !== false,
        taggedAuthorityDesk: r.taggedAuthorityDesk || 'S.A.F.A.R. Central Command Desk',
        submittedAt: r.submittedAt,
        verifiedAt: r.verifiedAt
      }))
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    return res.json({
      success: true,
      count: publicPhotos.length,
      gallery: publicPhotos
    });
  } catch (err) {
    console.error('getPublicGallery Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve public gallery' });
  }
}

// -------------------------------------------------------------
// E-VEHICLE SUSTAINABILITY REWARDS ENGINE (NO PHOTOS REQUIRED)
// -------------------------------------------------------------

function getWeekStart() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday of current week
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * 15. GET /api/rewards/e-vehicle/config
 * Retrieves configurable reward parameters
 */
function getEVehicleConfig(req, res) {
  try {
    const configs = dbStore.get('rewardConfig');
    const config = configs[0] || {};
    const baseRewardCoins = config.eVehicleBaseCoins || 3;
    const weeklyMilestoneTarget = config.eVehicleWeeklyMilestoneTarget || 10;
    const weeklyMilestoneBonus = config.eVehicleWeeklyMilestoneBonus || 2;

    return res.json({
      success: true,
      config: {
        baseRewardCoins,
        weeklyMilestoneTarget,
        weeklyMilestoneBonus
      }
    });
  } catch (err) {
    console.error('getEVehicleConfig Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 16. GET /api/rewards/e-vehicle/stats/:touristId
 * Returns weekly trip count, progress to 10-trip bonus, and payment history
 */
function getEVehicleStats(req, res) {
  try {
    const touristId = req.params.touristId || req.user?.touristId || 'TID-1035';
    const configs = dbStore.get('rewardConfig');
    const config = configs[0] || {};
    const baseRewardCoins = config.eVehicleBaseCoins || 3;
    const weeklyMilestoneTarget = config.eVehicleWeeklyMilestoneTarget || 10;
    const weeklyMilestoneBonus = config.eVehicleWeeklyMilestoneBonus || 2;

    const monday = getWeekStart();

    // Query all e-vehicle payment transactions
    const allTx = dbStore.get('greenCoinTransactions').filter((t) => 
      t.touristId === touristId && t.transactionType === 'ECO_VEHICLE_PAYMENT'
    );

    // This week's trips
    const thisWeekTx = allTx.filter((t) => new Date(t.createdAt) >= monday);
    const thisWeekTrips = thisWeekTx.length;
    const thisWeekCoins = thisWeekTx.reduce((sum, t) => sum + (Number(t.coinsAwarded) || baseRewardCoins), 0);

    // Check if weekly bonus already awarded this week
    const weeklyBonusTx = dbStore.findOne('greenCoinTransactions', (t) => 
      t.touristId === touristId && 
      t.transactionType === 'ECO_VEHICLE_WEEKLY_BONUS' &&
      new Date(t.createdAt) >= monday
    );
    const weeklyBonusUnlocked = Boolean(weeklyBonusTx) || thisWeekTrips >= weeklyMilestoneTarget;
    const totalWeeklyCoins = thisWeekCoins + (weeklyBonusTx ? weeklyMilestoneBonus : 0);
    const remainingForBonus = Math.max(0, weeklyMilestoneTarget - thisWeekTrips);

    // Recent payments (top 10 sorted newest first)
    const recentPayments = allTx
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map((t) => ({
        id: t.id || t.paymentId,
        paymentId: t.paymentId,
        fareAmount: t.fareAmount || t.amountPaid,
        amountPaid: t.amountPaid,
        coinsAwarded: t.coinsAwarded || baseRewardCoins,
        vehicleType: t.vehicleType || 'E-Rickshaw',
        driverName: t.driverName || 'Verified E-Vehicle Pilot',
        status: t.status || 'SUCCESS',
        createdAt: t.createdAt
      }));

    return res.json({
      success: true,
      stats: {
        thisWeekTrips,
        thisWeekCoins: totalWeeklyCoins,
        weeklyMilestoneTarget,
        weeklyMilestoneBonus,
        weeklyBonusUnlocked,
        remainingForBonus,
        baseRewardCoins,
        recentPayments
      }
    });
  } catch (err) {
    console.error('getEVehicleStats Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 17. POST /api/rewards/e-vehicle/pay
 * Passenger pays exact fare to E-Vehicle driver through SAFAR & gets rewarded Green Coins
 */
function processEVehiclePayment(req, res) {
  try {
    const {
      touristId,
      fareAmount,
      vehicleType = 'E-Rickshaw',
      driverName = 'Verified E-Vehicle Pilot',
      paymentMethod = 'UPI'
    } = req.body;

    const fare = Number(fareAmount);
    if (!fare || fare <= 0 || isNaN(fare)) {
      return res.status(400).json({ success: false, error: 'A valid positive fare amount is required' });
    }

    const activeTouristId = touristId || req.user?.touristId || 'TID-1035';
    const tourist = dbStore.findById('tourists', activeTouristId);
    const touristName = tourist ? tourist.fullName : (req.user?.name || 'Tourist');

    const configs = dbStore.get('rewardConfig');
    const config = configs[0] || {};
    const baseRewardCoins = config.eVehicleBaseCoins || 3;
    const weeklyMilestoneTarget = config.eVehicleWeeklyMilestoneTarget || 10;
    const weeklyMilestoneBonus = config.eVehicleWeeklyMilestoneBonus || 2;

    const monday = getWeekStart();
    const now = new Date().toISOString();

    // Check week count before this payment
    const existingWeekTx = dbStore.get('greenCoinTransactions').filter((t) => 
      t.touristId === activeTouristId && 
      t.transactionType === 'ECO_VEHICLE_PAYMENT' &&
      new Date(t.createdAt) >= monday
    );
    const previousWeekCount = existingWeekTx.length;
    const newWeekCount = previousWeekCount + 1;

    // Check if bonus already awarded this week
    const alreadyBonus = dbStore.findOne('greenCoinTransactions', (t) => 
      t.touristId === activeTouristId && 
      t.transactionType === 'ECO_VEHICLE_WEEKLY_BONUS' &&
      new Date(t.createdAt) >= monday
    );

    // If new count hits milestone and not yet awarded bonus, award milestone!
    const is10thMilestone = (newWeekCount >= weeklyMilestoneTarget && !alreadyBonus);
    const milestoneBonusCoins = is10thMilestone ? weeklyMilestoneBonus : 0;
    const totalCoinsEarned = baseRewardCoins + milestoneBonusCoins;

    const paymentId = `EV-PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Insert Payment Transaction (Driver receives 100% full fare - NO discount!)
    const paymentTx = dbStore.insert('greenCoinTransactions', {
      userId: req.user?.id || `usr_${activeTouristId}`,
      touristId: activeTouristId,
      paymentId,
      transactionType: 'ECO_VEHICLE_PAYMENT',
      fareAmount: fare,
      amountPaid: fare, // Driver gets 100% full actual fare
      coinsAwarded: baseRewardCoins,
      vehicleType,
      driverName,
      paymentMethod,
      status: 'SUCCESS',
      description: `E-Vehicle Trip (${vehicleType}) — Full fare ₹${fare} paid. Rewarded +${baseRewardCoins} Green Coins 🌱`,
      createdAt: now
    });

    // 2. If 10th milestone reached, insert weekly bonus transaction
    if (is10thMilestone) {
      dbStore.insert('greenCoinTransactions', {
        userId: req.user?.id || `usr_${activeTouristId}`,
        touristId: activeTouristId,
        paymentId: `EV-BONUS-${Date.now()}`,
        transactionType: 'ECO_VEHICLE_WEEKLY_BONUS',
        coinsAwarded: weeklyMilestoneBonus,
        milestoneTripCount: newWeekCount,
        status: 'SUCCESS',
        description: `Weekly Green Mobility Bonus (${weeklyMilestoneTarget} E-Vehicle Trips Milestone) — Awarded +${weeklyMilestoneBonus} Green Coins 🎉`,
        createdAt: now
      });
    }

    // 3. Register directly in greenRewards as APPROVED so wallet auto-increments
    dbStore.insert('greenRewards', {
      touristId: activeTouristId,
      touristName,
      activityType: 'ECO_VEHICLE',
      vehicleType,
      farePaid: fare,
      coins: totalCoinsEarned,
      status: 'APPROVED',
      sourceCategory: 'Eco Travel',
      submittedAt: now,
      verifiedAt: now,
      verifiedBy: 'SAFAR Automated Green Transit Engine'
    });

    // 4. Send notification
    dbStore.insert('notifications', {
      type: 'SUCCESS',
      title: 'E-Vehicle Fare Paid',
      message: `Paid ₹${fare} for ${vehicleType}. +${baseRewardCoins} Green Coins earned 🌱${is10thMilestone ? ` + ${weeklyMilestoneBonus} Weekly Bonus Coins! 🎉` : ''}`,
      timestamp: now,
      read: false,
      touristId: activeTouristId
    });

    return res.status(201).json({
      success: true,
      message: 'E-Vehicle fare payment successful',
      transaction: {
        paymentId,
        fareAmount: fare,
        amountPaid: fare,
        baseCoins: baseRewardCoins,
        milestoneBonusCoins,
        totalCoinsEarned,
        weeklyTripCount: newWeekCount,
        weeklyMilestoneTarget,
        isWeeklyMilestoneReached: is10thMilestone,
        vehicleType,
        driverName,
        createdAt: now
      }
    });
  } catch (err) {
    console.error('processEVehiclePayment Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to process E-Vehicle payment' });
  }
}

module.exports = {
  getPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  submitRewardProof,
  getRewardRequests,
  verifyRewardRequest,
  getUserWallet,
  getUserRewardHistory,
  calculateDiscount,
  processPartnerPayment,
  getRewardConfig,
  updateRewardConfig,
  getPublicGallery,
  getEVehicleConfig,
  getEVehicleStats,
  processEVehiclePayment
};
