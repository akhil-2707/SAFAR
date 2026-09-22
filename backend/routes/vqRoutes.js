const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Simulated in-memory store for active VQ passes
const vqStore = new Map();

// Official Pilgrimage & Heritage Circuits Registry
const MONUMENT_CIRCUITS = {
  AYODHYA_RAM_MANDIR: {
    id: 'AYODHYA_RAM_MANDIR',
    name: 'Shree Ram Janmabhoomi Temple Complex',
    city: 'Ayodhya',
    state: 'Uttar Pradesh',
    gate: 'Dedicated Express Gate #3 (Sugamya Fast-Track)',
    physicalQueueStats: {
      crowdDensity: 'HIGH (18,400 in physical barricades)',
      averagePhysicalWaitHours: 4.5,
      temperatureC: 34,
      dehydrationRisk: 'MODERATE'
    },
    defaultVouchers: {
      microStay: {
        partnerId: 'hotel_ayodhya_02',
        partnerName: 'UPSTDC Hotel Sarayu & IRCTC Transit Pods',
        type: 'HOTEL_MICRO_STAY',
        title: '2-Hour Refresh & Rest Micro-Stay',
        originalRate: 750,
        offerRate: 399,
        discountPercent: 47,
        amenities: ['AC Day-Room / Pod', 'Hot Rain Shower', 'High-Speed Wi-Fi', 'Luggage Cloakroom', 'Phone Fast-Charging'],
        badge: 'UP Tourism & IRCTC Certified'
      },
      swachhFood: {
        partnerId: 'food_ayodhya_01',
        partnerName: 'Shree Ram Bhojanalaya & Satvik Rasoi',
        type: 'SWACHH_FOOD',
        title: '15% Off Swachh Satvik Heritage Meal Voucher',
        originalRate: 250,
        offerRate: 212,
        discountPercent: 15,
        hygieneScore: 94,
        amenities: ['FSSAI 5-Star Hygiene Audited', '100% RO Mineral Water', 'Pure Desi Ghee Preparation', 'Satvik (No Onion/Garlic)'],
        badge: 'S.A.F.A.R. 94/100 Hygiene Benchmarked'
      },
      giArtisan: {
        partnerId: 'artisan_ayodhya_01',
        partnerName: 'Ayodhya Ram Darbar Terracotta & Sacred Wood Guild',
        type: 'GI_ARTISAN',
        title: 'Direct Weaver Heritage Trail & Live Craft Demo Pass',
        originalRate: 0,
        offerRate: 0,
        discountPercent: 10,
        amenities: ['Live Potter & Wood Carver Demo', 'Zero-Middleman Direct UPI', 'Govt GI Craft Certificate', 'Complimentary Prasadam Token'],
        badge: 'Govt. Certified GI Heritage Guild'
      },
      transitShuttle: {
        partnerId: 'transit_ayodhya_01',
        partnerName: 'Ayodhya Dham Pilgrim Corridor E-Rickshaw Grid',
        type: 'ECO_TRANSIT',
        title: 'Fixed-Tariff Eco EV Shuttle Voucher',
        originalRate: 120,
        offerRate: 40,
        discountPercent: 66,
        amenities: ['Fixed ₹40 Govt Tariff', 'Zero Auto-Driver Overcharging', 'Zero Emission Electric Cart', 'Direct Gate #3 Handoff'],
        badge: 'Ayodhya Development Authority Approved'
      }
    }
  },
  VARANASI_KASHI: {
    id: 'VARANASI_KASHI',
    name: 'Kashi Vishwanath Corridor & Ganga Dwar',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    gate: 'Ganga Dwar VIP Turnstile (Turnstile B)',
    physicalQueueStats: {
      crowdDensity: 'CRITICAL (22,100 in physical barricades)',
      averagePhysicalWaitHours: 5.0,
      temperatureC: 33,
      dehydrationRisk: 'HIGH'
    },
    defaultVouchers: {
      microStay: {
        partnerId: 'hotel_varanasi_01',
        partnerName: 'IRCTC Executive Lounge & Station Day-Rooms',
        type: 'HOTEL_MICRO_STAY',
        title: '2-Hour Refresh & Rest Micro-Stay',
        originalRate: 720,
        offerRate: 380,
        discountPercent: 47,
        amenities: ['Executive Shower Cubicle', 'Air-Conditioned Rest Pod', 'High-Speed Wi-Fi', 'Safe Locker'],
        badge: 'IRCTC Certified Railway Facility'
      },
      swachhFood: {
        partnerId: 'food_varanasi_01',
        partnerName: 'Kashi Vishwanath Annapurna Satvik Rasoi',
        type: 'SWACHH_FOOD',
        title: '15% Off Swachh Satvik Kashi Thali Voucher',
        originalRate: 220,
        offerRate: 187,
        discountPercent: 15,
        hygieneScore: 93,
        amenities: ['FSSAI Clean Street Hub', 'Purity Verified', 'Free Mineral Water Refill'],
        badge: 'S.A.F.A.R. 93/100 Hygiene Benchmarked'
      },
      giArtisan: {
        partnerId: 'artisan_varanasi_01',
        partnerName: 'Banaras Brocade & GI Silk Weavers Collective',
        type: 'GI_ARTISAN',
        title: 'Live Silk Handloom Weaving & Direct Artisan Pass',
        originalRate: 0,
        offerRate: 0,
        discountPercent: 10,
        amenities: ['Master Weaver Handloom Demo', 'Silk Mark Verified', 'Direct Weaver UPI QR'],
        badge: 'Ministry of Textiles GI Certified'
      },
      transitShuttle: {
        partnerId: 'transit_varanasi_01',
        partnerName: 'Kashi Smart EV E-Rickshaw Corridor',
        type: 'ECO_TRANSIT',
        title: 'Fixed-Tariff Eco EV Shuttle Voucher',
        originalRate: 150,
        offerRate: 40,
        discountPercent: 73,
        amenities: ['Govt Fixed ₹40 Fare', 'Pre-calibrated route to Ganga Dwar', 'Zero Hustle'],
        badge: 'Varanasi Smart City Partner'
      }
    }
  },
  KATRA_VAISHNO_DEVI: {
    id: 'KATRA_VAISHNO_DEVI',
    name: 'Mata Vaishno Devi Holy Bhawan',
    city: 'Katra',
    state: 'Jammu & Kashmir',
    gate: 'Bhawan Gate #2 Express RFID Turnstile',
    physicalQueueStats: {
      crowdDensity: 'HIGH (15,200 along track barricades)',
      averagePhysicalWaitHours: 4.0,
      temperatureC: 18,
      dehydrationRisk: 'LOW (High Altitude Fatigue)'
    },
    defaultVouchers: {
      microStay: {
        partnerId: 'hotel_katra_01',
        partnerName: 'SMVDSB Shrine Board Complex & Shivalik Day Rooms',
        type: 'HOTEL_MICRO_STAY',
        title: '2-Hour High-Altitude Refresh & Shower Pass',
        originalRate: 650,
        offerRate: 350,
        discountPercent: 46,
        amenities: ['Warm Water Shower', 'Heated Day Rest Lounge', 'Locker for Yatri Baggage'],
        badge: 'SMVDSB Shrine Board Certified'
      },
      swachhFood: {
        partnerId: 'food_katra_01',
        partnerName: 'Trikuta Yatri Satvik Rasoi & Herbal Tea',
        type: 'SWACHH_FOOD',
        title: '20% Off Pilgrim Energy & Satvik Meal Voucher',
        originalRate: 200,
        offerRate: 160,
        discountPercent: 20,
        hygieneScore: 95,
        amenities: ['Nutritious High-Altitude Rajma Chawal', 'Electrolyte & Kahwa Station', 'Sterilized Kitchen'],
        badge: 'S.A.F.A.R. 95/100 Hygiene Benchmarked'
      },
      giArtisan: {
        partnerId: 'artisan_katra_01',
        partnerName: 'Jammu & Kashmir GI Walnut Woodcrafts Guild',
        type: 'GI_ARTISAN',
        title: 'Authentic Kashmiri Woodcraft & Shawl Trail',
        originalRate: 0,
        offerRate: 0,
        discountPercent: 12,
        amenities: ['Artisan Direct Pricing', 'GI Kashmir Authenticity Tag', 'Complimentary Mata Chunari'],
        badge: 'J&K Handicrafts Directorate Verified'
      },
      transitShuttle: {
        partnerId: 'transit_katra_01',
        partnerName: 'Shrine Board Himkoti Eco Battery Cart',
        type: 'ECO_TRANSIT',
        title: 'Priority Himkoti Battery Cart Shuttle Pass',
        originalRate: 100,
        offerRate: 50,
        discountPercent: 50,
        amenities: ['Priority Boarding Token', 'Eco Friendly Electric Drive', 'Direct Track Access'],
        badge: 'SMVDSB Official Cart Service'
      }
    }
  },
  AGRA_TAJ_MAHAL: {
    id: 'AGRA_TAJ_MAHAL',
    name: 'Taj Mahal UNESCO World Heritage Monument',
    city: 'Agra',
    state: 'Uttar Pradesh',
    gate: 'East Gate Express Smart Turnstile (Gate E-1)',
    physicalQueueStats: {
      crowdDensity: 'MODERATE (14,800 visitors in physical queues)',
      averagePhysicalWaitHours: 3.5,
      temperatureC: 32,
      dehydrationRisk: 'MODERATE'
    },
    defaultVouchers: {
      microStay: {
        partnerId: 'hotel_agra_01',
        partnerName: 'Agra Cantt Railway Pod Hotel & Transit Suites',
        type: 'HOTEL_MICRO_STAY',
        title: '2-Hour Air-Conditioned Rest Pod & Shower',
        originalRate: 690,
        offerRate: 350,
        discountPercent: 49,
        amenities: ['AC Sleep Capsule', 'Shower Station', 'High-Speed Wi-Fi', 'Luggage Cloakroom'],
        badge: 'Indian Railways Partner'
      },
      swachhFood: {
        partnerId: 'food_agra_01',
        partnerName: 'Petha Heritage & Brijwasi Sweets',
        type: 'SWACHH_FOOD',
        title: '15% Off Bedmi Poori & GI Petha Sampler Voucher',
        originalRate: 220,
        offerRate: 187,
        discountPercent: 15,
        hygieneScore: 92,
        amenities: ['Authentic Agra Petha GI Certified', 'FSSAI Hygiene Inspected', 'Filtered Water Dispenser'],
        badge: 'S.A.F.A.R. 92/100 Hygiene Benchmarked'
      },
      giArtisan: {
        partnerId: 'artisan_agra_01',
        partnerName: 'Agra Marble Inlay & Pietra Dura Crafts Guild',
        type: 'GI_ARTISAN',
        title: 'Mughal Marble Inlay Live Demonstration Pass',
        originalRate: 0,
        offerRate: 0,
        discountPercent: 10,
        amenities: ['Master Inlay Artist Live Demo', 'Govt GI Craft Guarantee', 'Direct UPI Zero Commission'],
        badge: 'UP Handicrafts Council Certified'
      },
      transitShuttle: {
        partnerId: 'transit_agra_01',
        partnerName: 'Taj Eco Green Zone Electric Cart Shuttle',
        type: 'ECO_TRANSIT',
        title: 'Taj Non-Pollution Zone Battery Shuttle Pass',
        originalRate: 80,
        offerRate: 30,
        discountPercent: 62,
        amenities: ['Zero Emissions Electric Cart', 'Pre-paid Fixed ₹30 Govt Tariff', 'Direct East Gate Drop'],
        badge: 'Archaeological Survey of India Partner'
      }
    }
  }
};

// 1. GET /api/vq/circuits - List supported crowd-dispersal pilgrimage & monument circuits
router.get('/circuits', (req, res) => {
  res.json({
    success: true,
    circuits: Object.values(MONUMENT_CIRCUITS)
  });
});

// 2. POST /api/vq/book-slot - Generate tokenized entry window and auto-mint time vouchers
router.post('/book-slot', (req, res) => {
  try {
    const {
      touristId,
      touristName,
      circuitId = 'AYODHYA_RAM_MANDIR',
      partySize = 2,
      preferredSlotTime
    } = req.body;

    const circuit = MONUMENT_CIRCUITS[circuitId] || MONUMENT_CIRCUITS.AYODHYA_RAM_MANDIR;

    // Calculate time-window: 3.5 hours from now
    const now = new Date();
    const waitHours = 3.5;
    const entryTime = new Date(now.getTime() + waitHours * 60 * 60 * 1000);
    const windowEndTime = new Date(entryTime.getTime() + 30 * 60 * 1000); // 30 min window

    const batchNumber = `Batch #${Math.floor(1 + Math.random() * 8).toString().padStart(2, '0')}`;
    const tokenHash = crypto.createHash('sha256')
      .update(`${touristId || 'TID-1024'}_${circuitId}_${now.toISOString()}`)
      .digest('hex');

    const passId = `vq_pass_${Date.now()}`;

    // Format readable slot time: e.g. "04:30 PM - 05:00 PM"
    const formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedSlot = `${formatTime(entryTime)} – ${formatTime(windowEndTime)}`;

    const newPass = {
      passId,
      touristId: touristId || 'TID-1024',
      touristName: touristName || 'Verified S.A.F.A.R. Pilgrim',
      circuitId: circuit.id,
      circuitName: circuit.name,
      city: circuit.city,
      gate: circuit.gate,
      batchNumber,
      tokenHash,
      turnstileQrPayload: `SAFAR_VQ_ENTRY:${passId}:${tokenHash.substring(0, 16)}:${circuit.id}`,
      bookingTimestamp: now.toISOString(),
      entryWindowStart: entryTime.toISOString(),
      entryWindowEnd: windowEndTime.toISOString(),
      formattedSlot,
      safeFreeTimeMinutes: Math.round(waitHours * 60),
      partySize: Number(partySize) || 2,
      status: 'ACTIVE_DISPERSED', // ACTIVE_DISPERSED | RECALL_NOTIFIED | TURNSTILE_CLEARED
      physicalWaitSavedHours: circuit.physicalQueueStats.averagePhysicalWaitHours,
      estimatedMoneySavedRupees: 840,
      vouchers: [
        {
          id: `vchr_stay_${Date.now()}`,
          category: 'HOTEL_MICRO_STAY',
          ...circuit.defaultVouchers.microStay,
          status: 'UNREDEEMED',
          voucherCode: `STAY-${Math.floor(1000 + Math.random() * 9000)}`,
          redeemQr: `SAFAR_VOUCHER:HOTEL:${passId}`
        },
        {
          id: `vchr_food_${Date.now()}`,
          category: 'SWACHH_FOOD',
          ...circuit.defaultVouchers.swachhFood,
          status: 'UNREDEEMED',
          voucherCode: `SWACHH-${Math.floor(1000 + Math.random() * 9000)}`,
          redeemQr: `SAFAR_VOUCHER:FOOD:${passId}`
        },
        {
          id: `vchr_art_${Date.now()}`,
          category: 'GI_ARTISAN',
          ...circuit.defaultVouchers.giArtisan,
          status: 'UNREDEEMED',
          voucherCode: `ARTISAN-${Math.floor(1000 + Math.random() * 9000)}`,
          redeemQr: `SAFAR_VOUCHER:ARTISAN:${passId}`
        },
        {
          id: `vchr_trans_${Date.now()}`,
          category: 'ECO_TRANSIT',
          ...circuit.defaultVouchers.transitShuttle,
          status: 'UNREDEEMED',
          voucherCode: `EV-SHUTTLE-${Math.floor(1000 + Math.random() * 9000)}`,
          redeemQr: `SAFAR_VOUCHER:TRANSIT:${passId}`
        }
      ]
    };

    vqStore.set(touristId || 'TID-1024', newPass);

    return res.status(201).json({
      success: true,
      message: `VIP Virtual Queue Token minted! You have ${waitHours} hours of safe free time with 4 bundled micro-economy vouchers.`,
      pass: newPass
    });
  } catch (error) {
    console.error('VQ booking error:', error);
    return res.status(500).json({ success: false, error: 'Failed to mint Virtual Queue Token' });
  }
});

// 3. GET /api/vq/active-pass/:touristId - Fetch tourist active pass & vouchers
router.get('/active-pass/:touristId', (req, res) => {
  const { touristId } = req.params;
  const pass = vqStore.get(touristId);

  if (pass) {
    return res.json({ success: true, hasActivePass: true, pass });
  }

  // Generate fallback active demonstration pass for instant live preview
  const circuit = MONUMENT_CIRCUITS.AYODHYA_RAM_MANDIR;
  const now = new Date();
  const entryTime = new Date(now.getTime() + 3.5 * 60 * 60 * 1000);
  const windowEndTime = new Date(entryTime.getTime() + 30 * 60 * 1000);
  const formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const defaultDemoPass = {
    passId: 'vq_pass_demo_01',
    touristId: touristId || 'TID-1024',
    touristName: 'Rohan Verma',
    circuitId: circuit.id,
    circuitName: circuit.name,
    city: circuit.city,
    gate: circuit.gate,
    batchNumber: 'Batch #04',
    tokenHash: 'a89c45b8e91d3f2c7a6e11894bfa29381c0029b384617a9e0134bc58271e89f1',
    turnstileQrPayload: `SAFAR_VQ_ENTRY:vq_pass_demo_01:a89c45b8e91d3f2c:AYODHYA_RAM_MANDIR`,
    bookingTimestamp: now.toISOString(),
    entryWindowStart: entryTime.toISOString(),
    entryWindowEnd: windowEndTime.toISOString(),
    formattedSlot: `${formatTime(entryTime)} – ${formatTime(windowEndTime)}`,
    safeFreeTimeMinutes: 210,
    partySize: 2,
    status: 'ACTIVE_DISPERSED',
    physicalWaitSavedHours: 4.5,
    estimatedMoneySavedRupees: 840,
    vouchers: [
      {
        id: 'vchr_stay_01',
        category: 'HOTEL_MICRO_STAY',
        ...circuit.defaultVouchers.microStay,
        status: 'UNREDEEMED',
        voucherCode: 'STAY-4281',
        redeemQr: 'SAFAR_VOUCHER:HOTEL:demo'
      },
      {
        id: 'vchr_food_01',
        category: 'SWACHH_FOOD',
        ...circuit.defaultVouchers.swachhFood,
        status: 'UNREDEEMED',
        voucherCode: 'SWACHH-8921',
        redeemQr: 'SAFAR_VOUCHER:FOOD:demo'
      },
      {
        id: 'vchr_art_01',
        category: 'GI_ARTISAN',
        ...circuit.defaultVouchers.giArtisan,
        status: 'UNREDEEMED',
        voucherCode: 'ARTISAN-1928',
        redeemQr: 'SAFAR_VOUCHER:ARTISAN:demo'
      },
      {
        id: 'vchr_trans_01',
        category: 'ECO_TRANSIT',
        ...circuit.defaultVouchers.transitShuttle,
        status: 'UNREDEEMED',
        voucherCode: 'EV-SHUTTLE-7712',
        redeemQr: 'SAFAR_VOUCHER:TRANSIT:demo'
      }
    ]
  };

  return res.json({ success: true, hasActivePass: true, pass: defaultDemoPass, isDemoSimulation: true });
});

// 4. POST /api/vq/redeem-voucher - Redeem individual micro-economy voucher
router.post('/redeem-voucher', (req, res) => {
  const { touristId = 'TID-1024', voucherId, category } = req.body;
  const pass = vqStore.get(touristId);

  if (pass) {
    const voucher = pass.vouchers.find(v => v.id === voucherId || v.category === category);
    if (voucher) {
      voucher.status = 'REDEEMED';
      voucher.redeemedAt = new Date().toISOString();
      return res.json({
        success: true,
        message: `✓ ${voucher.title} successfully redeemed at certified partner desk!`,
        voucher
      });
    }
  }

  return res.json({
    success: true,
    message: '✓ Simulated voucher redemption verified on S.A.F.A.R. local ledger!',
    voucher: { id: voucherId, category, status: 'REDEEMED', redeemedAt: new Date().toISOString() }
  });
});

// 5. POST /api/vq/verify-turnstile - Turnstile express scanner gate unlock
router.post('/verify-turnstile', (req, res) => {
  const { touristId = 'TID-1024', passId, gate = 'Gate #3' } = req.body;
  const pass = vqStore.get(touristId);

  if (pass) {
    pass.status = 'TURNSTILE_CLEARED';
    pass.gateClearedAt = new Date().toISOString();
  }

  return res.json({
    success: true,
    status: 'EXPRESS_GATE_CLEARED',
    turnstileUnlock: true,
    gate,
    message: '✓ Cryptographic Pass Authenticated. Turnstile Unlocked. Welcome to Shree Ram Janmabhoomi Darshan!'
  });
});

module.exports = router;
