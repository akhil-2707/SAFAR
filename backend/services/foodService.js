/**
 * S.A.F.A.R. Swachh Food Intelligence Service
 * 
 * Provides:
 * - Curated prototype food registry for Ayodhya, Katra/Jammu, Agra, Varanasi, Meghalaya, Jaipur
 * - Deterministic, transparent Swachh Score formula (0-100)
 * - Explainable local AI food recommendations (zero external paid APIs)
 * - Route-aware detour distance calculations
 * - Prototype traveller feedback ingestion and score recalculation
 */

const { dbStore } = require('../config/db');

// Weights for the deterministic 7-component Swachh Score formula
const SWACHH_SCORE_WEIGHTS = {
  prepHygiene: 0.20,       // 20% - Food handling, kitchen surfaces, cooking hygiene
  waterSanitation: 0.20,   // 20% - RO/potable water availability, clean dishwashing
  diningCleanliness: 0.15, // 15% - Table, seating, floor and ambient cleanliness
  wasteMgmt: 0.15,         // 15% - Wet/dry segregation, covered bins, pest prevention
  staffHygiene: 0.10,      // 10% - Caps/aprons, clean uniforms, handwashing
  travellerFeedback: 0.10, // 10% - Aggregated peer reviews and verified feedback
  infoCompleteness: 0.10   // 10% - Transparent ingredient disclosure, water source listed
};

/**
 * Calculates deterministic Swachh Score from subcomponents
 */
function calculateSwachhScore(breakdown) {
  const prep = Number(breakdown.prepHygiene) || 75;
  const water = Number(breakdown.waterSanitation) || 75;
  const dining = Number(breakdown.diningCleanliness) || 75;
  const waste = Number(breakdown.wasteMgmt) || 70;
  const staff = Number(breakdown.staffHygiene) || 70;
  const feedback = Number(breakdown.travellerFeedback) || 75;
  const info = Number(breakdown.infoCompleteness) || 70;

  const score = (
    prep * SWACHH_SCORE_WEIGHTS.prepHygiene +
    water * SWACHH_SCORE_WEIGHTS.waterSanitation +
    dining * SWACHH_SCORE_WEIGHTS.diningCleanliness +
    waste * SWACHH_SCORE_WEIGHTS.wasteMgmt +
    staff * SWACHH_SCORE_WEIGHTS.staffHygiene +
    feedback * SWACHH_SCORE_WEIGHTS.travellerFeedback +
    info * SWACHH_SCORE_WEIGHTS.infoCompleteness
  );

  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Curated Prototype Registry across the 6 SAFAR destinations
 */
const SEED_FOOD_OUTLETS = [
  // ==========================================
  // 1. AYODHYA
  // ==========================================
  {
    id: 'food_ayodhya_01',
    name: 'Shree Ram Bhojanalaya & Satvik Rasoi',
    destination: 'AYODHYA',
    city: 'Ayodhya',
    state: 'Uttar Pradesh',
    location: 'Ram Path, Near Hanuman Garhi Crossing, Ayodhya',
    lat: 26.7950,
    lng: 82.2010,
    cuisine: 'Pure Satvik North Indian',
    priceRange: '₹150–250',
    averagePrice: 190,
    vegetarian: 'PURE_VEG',
    localSpecialty: 'Ayodhya Satvik Thali, Bedmi Poori & Desi Ghee Peda',
    signatureDish: 'Mahaprasad Satvik Thali with Panchamrit Peda',
    openingHours: '07:00 AM – 10:30 PM',
    phoneContact: '+91 5278 232910',
    travellerRating: 4.8,
    reviewCount: 430,
    distanceFromReference: 0.6,
    routeRelevance: '0.6 km from Ram Janmabhoomi Pilgrim Corridor',
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=700&auto=format&fit=crop&q=80',
    scoreBreakdown: {
      prepHygiene: 94,
      waterSanitation: 92,
      diningCleanliness: 90,
      wasteMgmt: 88,
      staffHygiene: 92,
      travellerFeedback: 93,
      infoCompleteness: 90
    },
    trustIndicators: [
      'Pure Vegetarian / Satvik Kitchen (No Onion / Garlic)',
      'Reverse Osmosis (RO) Filtered Drinking Water',
      'Covered Stainless-Steel Serving Stations',
      'Daily Kitchen Sanitization Log Verified',
      'Eco-friendly Biodegradable Leaf Plates (Pattal)'
    ],
    dataSourceType: 'SAFAR Prototype Food Registry',
    prototypeStatus: 'PROTOTYPE_DATA',
    recommendationReasons: [
      'Matches your moderate budget (₹150–250 per person)',
      'Within 0.6 km of the primary Ram Mandir corridor',
      'High prototype Swachh score of 91/100',
      'Authentic pure vegetarian Satvik experience'
    ]
  },
  {
    id: 'food_ayodhya_02',
    name: 'Saryu Riverfront Rasoi & Annakshetra',
    destination: 'AYODHYA',
    city: 'Ayodhya',
    state: 'Uttar Pradesh',
    location: 'Naya Ghat, Ram Ki Paidi Promenade, Ayodhya',
    lat: 26.7995,
    lng: 82.2045,
    cuisine: 'Awadhi & Regional Vegetarian',
    priceRange: '₹100–180',
    averagePrice: 140,
    vegetarian: 'PURE_VEG',
    localSpecialty: 'Khasta Kachori with Kaddu Sabzi & Gulab Jamun',
    signatureDish: 'Ram Ki Paidi Khasta Kachori Platter',
    openingHours: '06:30 AM – 10:00 PM',
    phoneContact: '+91 5278 232740',
    travellerRating: 4.6,
    reviewCount: 310,
    distanceFromReference: 1.1,
    routeRelevance: '1.1 km detour along evening Saryu Aarti route',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=700&auto=format&fit=crop&q=80',
    scoreBreakdown: {
      prepHygiene: 88,
      waterSanitation: 89,
      diningCleanliness: 85,
      wasteMgmt: 84,
      staffHygiene: 86,
      travellerFeedback: 89,
      infoCompleteness: 85
    },
    trustIndicators: [
      'Sealed Mineral Water Counter & UV Purifier',
      'Wet and Dry Segregated Waste Collection',
      'Clean Riverfront Dining Pavilion',
      'Contactless Digital Payment Enabled'
    ],
    dataSourceType: 'SAFAR Prototype Food Registry',
    prototypeStatus: 'PROTOTYPE_DATA',
    recommendationReasons: [
      'Very economical breakfast and evening snack hub',
      'Ideal dinner stop right after Saryu Evening Aarti',
      'Strong hygiene rating (87/100) with fresh food preparation'
    ]
  },
  {
    id: 'food_ayodhya_03',
    name: 'Awadh Heritage Bhoj & Sweets',
    destination: 'AYODHYA',
    city: 'Ayodhya',
    state: 'Uttar Pradesh',
    location: 'Civil Lines, Near Ayodhya Cantt Station Road',
    lat: 26.7780,
    lng: 82.1480,
    cuisine: 'North Indian & Awadhi Thali',
    priceRange: '₹220–350',
    averagePrice: 280,
    vegetarian: 'VEG_OPTIONS',
    localSpecialty: 'Paneer Lababdar, Dal Makhani & Rabdi Malpua',
    signatureDish: 'Shahi Awadh Vegetarian Deluxe Thali',
    openingHours: '11:00 AM – 11:00 PM',
    phoneContact: '+91 5278 234120',
    travellerRating: 4.7,
    reviewCount: 260,
    distanceFromReference: 2.2,
    routeRelevance: 'Near Ayodhya Cantt station transit hub',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=700&auto=format&fit=crop&q=80',
    scoreBreakdown: {
      prepHygiene: 92,
      waterSanitation: 90,
      diningCleanliness: 93,
      wasteMgmt: 89,
      staffHygiene: 91,
      travellerFeedback: 91,
      infoCompleteness: 88
    },
    trustIndicators: [
      'Air-Conditioned Dust-Free Dining Hall',
      'Commercial UV Water Purifier',
      'Hairnets and Gloves Mandated for Chefs',
      'Digital Temperature Controlled Refrigeration'
    ],
    dataSourceType: 'SAFAR Prototype Food Registry',
    prototypeStatus: 'PROTOTYPE_DATA',
    recommendationReasons: [
      'Spacious AC dining for families arriving at Cantt station',
      'Exceptional hygiene standard with high dining cleanliness (93/100)',
      'Rich traditional Awadhi desserts'
    ]
  },

  // ==========================================
  // 2. KATRA / JAMMU
  // ==========================================
  {
    id: 'food_katra_01',
    name: 'Trikuta Yatri Satvik Rasoi & Bhojanalaya',
    destination: 'KATRA',
    city: 'Katra',
    state: 'Jammu & Kashmir',
    location: 'Baan Ganga Yatra Entry Checkpoint, Katra',
    lat: 32.9920,
    lng: 74.9350,
    cuisine: 'Dogra Regional & Pure Satvik Pilgrim Cuisine',
    priceRange: '₹120–220',
    averagePrice: 170,
    vegetarian: 'PURE_VEG',
    localSpecialty: 'Jammu Rajma Chawal with Anardana Chutney & Kaladi',
    signatureDish: 'Dogri Rajma Chawal Thali with Fresh Pudina Lassi',
    openingHours: '24 Hours (Round-the-Clock)',
    phoneContact: '+91 1991 232510',
    travellerRating: 4.9,
    reviewCount: 880,
    distanceFromReference: 0.3,
    routeRelevance: '0.3 km from Baan Ganga Holy Yatra entry staging track',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=700&auto=format&fit=crop&q=80',
    scoreBreakdown: {
      prepHygiene: 95,
      waterSanitation: 96,
      diningCleanliness: 91,
      wasteMgmt: 92,
      staffHygiene: 93,
      travellerFeedback: 95,
      infoCompleteness: 92
    },
    trustIndicators: [
      'Shrine Track Cleanliness Benchmark Compliant',
      'Dual-Stage RO Purified Mountain Drinking Water',
      'Steam-Sterilized Stainless Steel Cookware',
      '100% Pure Ghee & Cold-Pressed Mustard Oil Preparation',
      'Eco-Friendly Zero-Plastic Facility'
    ],
    dataSourceType: 'SAFAR Prototype Food Registry',
    prototypeStatus: 'PROTOTYPE_DATA',
    recommendationReasons: [
      'Convenient 24x7 opening hours for night/early morning yatris',
      'Top-tier prototype Swachh Score of 94/100',
      'Directly on the starting trek path to Mata Vaishno Devi Bhawan',
      'Famous authentic Jammu Rajma Chawal experience'
    ]
  },
  {
    id: 'food_katra_02',
    name: 'Kashmir Valley Pine Cafe & Herbal Refreshment',
    destination: 'KATRA',
    city: 'Katra',
    state: 'Jammu & Kashmir',
    location: 'Jammu Road, Near Katra Railway Station Concourse',
    lat: 32.9880,
    lng: 74.9280,
    cuisine: 'Regional Mountain Snacks & Kashmiri Kahwa',
    priceRange: '₹80–160',
    averagePrice: 120,
    vegetarian: 'PURE_VEG',
    localSpecialty: 'Saffron Kahwa with Crushed Almonds & Kaladi Kulcha',
    signatureDish: 'Kashmiri Zafrani Kahwa & Grilled Kaladi Cheese Bun',
    openingHours: '05:30 AM – 11:30 PM',
    phoneContact: '+91 1991 232180',
    travellerRating: 4.7,
    reviewCount: 340,
    distanceFromReference: 0.8,
    routeRelevance: '0.8 km from Katra Railway Station concourse',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=700&auto=format&fit=crop&q=80',
    scoreBreakdown: {
      prepHygiene: 91,
      waterSanitation: 93,
      diningCleanliness: 90,
      wasteMgmt: 87,
      staffHygiene: 89,
      travellerFeedback: 92,
      infoCompleteness: 89
    },
    trustIndicators: [
      'Fresh Himalayan Spring Water (RO Filtered)',
      'Single-Use Compostable Paper Cups',
      'Dust-Free Covered Preparation Enclosure',
      'Clear Calorie & Nutritional Content Display'
    ],
    dataSourceType: 'SAFAR Prototype Food Registry',
    prototypeStatus: 'PROTOTYPE_DATA',
    recommendationReasons: [
      'Invigorating hot Saffron Kahwa ideal for cold mountain weather',
      'Budget-friendly transit snack before trek',
      'Strong water & sanitation score (93/100)'
    ]
  },
  {
    id: 'food_katra_03',
    name: 'Maa Durga Annakshetra & Pahadi Dhaba',
    destination: 'KATRA',
    city: 'Katra',
    state: 'Jammu & Kashmir',
    location: 'Near Katra Main Bus Stand & Yatra Registration Parcha Counter',
    lat: 32.9940,
    lng: 74.9310,
    cuisine: 'North Indian & Pahadi Thali',
    priceRange: '₹100–190',
    averagePrice: 140,
    vegetarian: 'PURE_VEG',
    localSpecialty: 'Pahadi Dal, Tawa Roti, Desi Ghee Halwa & Kheer',
    signatureDish: 'Katra Pilgrim Special Thali with Kheer',
    openingHours: '05:00 AM – 11:00 PM',
    phoneContact: '+91 1991 233490',
    travellerRating: 4.8,
    reviewCount: 510,
    distanceFromReference: 0.5,
    routeRelevance: '0.5 km from Katra Central Bus Stand and Yatra Registration',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=700&auto=format&fit=crop&q=80',
    scoreBreakdown: {
      prepHygiene: 93,
      waterSanitation: 94,
      diningCleanliness: 90,
      wasteMgmt: 91,
      staffHygiene: 92,
      travellerFeedback: 94,
      infoCompleteness: 90
    },
    trustIndicators: [
      'Pure Vegetarian Satvik Kitchen',
      'Continuous Potable Hot Water for Pilgrims',
      'Dust-Free Covered Serving Counter',
      'Segregated Wet/Dry Waste Disposal'
    ],
    dataSourceType: 'SAFAR Prototype Food Registry',
    prototypeStatus: 'PROTOTYPE_DATA',
    recommendationReasons: [
      'Very affordable pilgrim meal near registration counter',
      'High hygiene standard (92/100) with fresh piping-hot rotis',
      'Hearty nourishment before beginning the holy ascent'
    ]
  },

  // ==========================================
  // 3. AGRA
  // ==========================================
  {
    id: 'food_agra_01',
    name: 'Petha Heritage & Brijwasi Sweets Hub',
    destination: 'AGRA',
    city: 'Agra',
    state: 'Uttar Pradesh',
    location: 'Fatehabad Road, 0.9 km from Taj Mahal East Gate',
    lat: 27.1680,
    lng: 78.0480,
    cuisine: 'Agra Regional Street Breakfast & Confectionery',
    priceRange: '₹80–180',
    averagePrice: 130,
    vegetarian: 'PURE_VEG',
    localSpecialty: 'Agra Kesar Angoori Petha, Bedmi Poori & Dalmoth',
    signatureDish: 'Classic Agra Bedmi Poori with Aloo Jhol & Kesar Petha',
    openingHours: '06:30 AM – 10:30 PM',
    phoneContact: '+91 562 2331405',
    travellerRating: 4.8,
    reviewCount: 520,
    distanceFromReference: 0.9,
    routeRelevance: '0.9 km detour from Taj Mahal East Gate walking corridor',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=700&auto=format&fit=crop&q=80',
    scoreBreakdown: {
      prepHygiene: 93,
      waterSanitation: 91,
      diningCleanliness: 89,
      wasteMgmt: 90,
      staffHygiene: 92,
      travellerFeedback: 94,
      infoCompleteness: 91
    },
    trustIndicators: [
      'Vacuum-Packed Petha Hygiene Certification Log',
      'RO Drinking Water Station for Travellers',
      'Gloves and Tongs Strictly Used for Sweets Serving',
      'Closed Glass Display Counters Preventing Street Dust'
    ],
    dataSourceType: 'SAFAR Prototype Food Registry',
    prototypeStatus: 'PROTOTYPE_DATA',
    recommendationReasons: [
      'Essential Agra culinary experience after sunrise Taj tour',
      'Within walking distance of East Gate electric shuttle stop',
      'Excellent 92/100 Swachh score with transparent preparation'
    ]
  },
  {
    id: 'food_agra_02',
    name: 'Dastarkhwan-e-Mughal Courtyard',
    destination: 'AGRA',
    city: 'Agra',
    state: 'Uttar Pradesh',
    location: 'Tajganj Heritage Quarter, Near Taj East Gate Promenade',
    lat: 27.1720,
    lng: 78.0440,
    cuisine: 'Authentic Mughlai & North Indian',
    priceRange: '₹300–550',
    averagePrice: 420,
    vegetarian: 'VEG_OPTIONS',
    localSpecialty: 'Mughlai Paneer Pasanda, Dal Bukhara & Shahi Tukda',
    signatureDish: 'Dum Pukht Handi Biryani with Burani Raita',
    openingHours: '12:00 PM – 11:30 PM',
    phoneContact: '+91 562 2420918',
    travellerRating: 4.7,
    reviewCount: 380,
    distanceFromReference: 0.5,
    routeRelevance: '0.5 km from Taj Nature Walk & Heritage East Gate',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700&auto=format&fit=crop&q=80',
    scoreBreakdown: {
      prepHygiene: 90,
      waterSanitation: 89,
      diningCleanliness: 92,
      wasteMgmt: 88,
      staffHygiene: 91,
      travellerFeedback: 90,
      infoCompleteness: 87
    },
    trustIndicators: [
      'UV Sanitized Cutlery & Tableware',
      'Open View Glass Kitchen Inspection Window',
      'Segregated Veg and Non-Veg Preparation Stations',
      'Digital Handwash Station for Guests'
    ],
    dataSourceType: 'SAFAR Prototype Food Registry',
    prototypeStatus: 'PROTOTYPE_DATA',
    recommendationReasons: [
      'Fine dining Mughlai experience in Tajganj heritage setting',
      'Close to today\'s walking route around monument gardens',
      'Strong hygiene rating with open-view kitchen verification'
    ]
  },
  {
    id: 'food_agra_03',
    name: 'Jahangiri Haveli Satvik Rasoi & Thali',
    destination: 'AGRA',
    city: 'Agra',
    state: 'Uttar Pradesh',
    location: 'Near Agra Fort Amar Singh Gate & Station Road, Agra',
    lat: 27.1780,
    lng: 78.0240,
    cuisine: 'North Indian Pure Vegetarian & Thali',
    priceRange: '₹180–300',
    averagePrice: 220,
    vegetarian: 'PURE_VEG',
    localSpecialty: 'Agra Matar Paneer, Bedmi Puri, Kadhai Paneer & Petha Kheer',
    signatureDish: 'Jahangiri Royal Satvik Thali with Kesar Petha',
    openingHours: '10:00 AM – 10:30 PM',
    phoneContact: '+91 562 2251890',
    travellerRating: 4.8,
    reviewCount: 460,
    distanceFromReference: 0.6,
    routeRelevance: '0.6 km from Agra Fort Amar Singh Gate entrance',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=700&auto=format&fit=crop&q=80',
    scoreBreakdown: {
      prepHygiene: 92,
      waterSanitation: 93,
      diningCleanliness: 91,
      wasteMgmt: 89,
      staffHygiene: 91,
      travellerFeedback: 93,
      infoCompleteness: 90
    },
    trustIndicators: [
      'Pure Vegetarian Traditional Kitchen',
      'Tested RO Purified Water System',
      'Fully Sanitized Air-Conditioned Haveli Seating',
      'Daily Food Waste Composting Tie-up'
    ],
    dataSourceType: 'SAFAR Prototype Food Registry',
    prototypeStatus: 'PROTOTYPE_DATA',
    recommendationReasons: [
      'Comfortable heritage dining right after visiting Agra Fort',
      'Excellent 92/100 Swachh score with high water purity',
      'Wholesome pure veg family thali options'
    ]
  },

  // ==========================================
  // 4. VARANASI
  // ==========================================
  {
    id: 'food_varanasi_01',
    name: 'Kashi Vishwanath Annapurna Rasoi',
    destination: 'VARANASI',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    location: 'Godowlia Chowk, Near Vishwanath Corridor Gateway, Varanasi',
    lat: 25.3105,
    lng: 83.0090,
    cuisine: 'Banarasi Traditional Breakfast & Satvik Meals',
    priceRange: '₹80–160',
    averagePrice: 110,
    vegetarian: 'PURE_VEG',
    localSpecialty: 'Banarasi Kachori Jalebi, Tamatar Chaat & Malaiyo',
    signatureDish: 'Kashi Tamatar Chaat & Heeng Kachori Sabzi',
    openingHours: '06:00 AM – 10:30 PM',
    phoneContact: '+91 542 2501230',
    travellerRating: 4.9,
    reviewCount: 960,
    distanceFromReference: 0.4,
    routeRelevance: '0.4 km from Kashi Vishwanath Golden Temple Corridor',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=700&auto=format&fit=crop&q=80',
    scoreBreakdown: {
      prepHygiene: 94,
      waterSanitation: 93,
      diningCleanliness: 89,
      wasteMgmt: 91,
      staffHygiene: 92,
      travellerFeedback: 96,
      infoCompleteness: 90
    },
    trustIndicators: [
      'Pattal (Leaf Bowl) Eco-Friendly Traditional Serving',
      'Commercial Reverse Osmosis Drinking Water',
      'Continuous Fly & Insect Electronic Deterrents',
      'Pure Mustard Oil & Fresh Curd Certification'
    ],
    dataSourceType: 'SAFAR Prototype Food Registry',
    prototypeStatus: 'PROTOTYPE_DATA',
    recommendationReasons: [
      'Iconic Banarasi breakfast after early morning Ganga boat tour',
      'Exceptional traveller praise (★ 4.9 from 960+ reviews)',
      'Directly adjacent to the Vishwanath temple corridor',
      'Very affordable at ₹80–160 per person'
    ]
  },
  {
    id: 'food_varanasi_02',
    name: 'Assi Ghat River View Heritage Cafe',
    destination: 'VARANASI',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    location: 'Assi Ghat Steps, Southern Promenade, Varanasi',
    lat: 25.2890,
    lng: 83.0065,
    cuisine: 'Healthy Fusion, Fresh Juices & Banarasi Snacks',
    priceRange: '₹150–280',
    averagePrice: 210,
    vegetarian: 'PURE_VEG',
    localSpecialty: 'Saffron Lassi in Clay Kulhad, Herbal Teas & Poha',
    signatureDish: 'Banarasi Thandai & Malaiyo Lassi Pot',
    openingHours: '06:30 AM – 11:00 PM',
    phoneContact: '+91 542 2314502',
    travellerRating: 4.7,
    reviewCount: 410,
    distanceFromReference: 1.8,
    routeRelevance: 'Directly on Assi Ghat staging point for Subah-e-Banaras',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=700&auto=format&fit=crop&q=80',
    scoreBreakdown: {
      prepHygiene: 91,
      waterSanitation: 92,
      diningCleanliness: 93,
      wasteMgmt: 89,
      staffHygiene: 90,
      travellerFeedback: 92,
      infoCompleteness: 89
    },
    trustIndicators: [
      'Clean Terrace Seating Overlooking Sacred Ganga',
      'Lead-Free Clay Kulhad Disposable Cups',
      'Certified Filtered Ice & Purified Water',
      'Hygiene Hand Sanitizer at Every Table'
    ],
    dataSourceType: 'SAFAR Prototype Food Registry',
    prototypeStatus: 'PROTOTYPE_DATA',
    recommendationReasons: [
      'Breathtaking sunrise river views paired with fresh kulhad lassi',
      'High dining cleanliness (93/100) on scenic riverfront',
      'Fits relaxed morning itinerary before walking the ghats'
    ]
  },
  {
    id: 'food_varanasi_03',
    name: 'Dashashwamedh Ghat Chulha & Litti Chokha',
    destination: 'VARANASI',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    location: 'Main Dashashwamedh Ghat Approach, Near Ganga Seva Nidhi',
    lat: 25.3080,
    lng: 83.0110,
    cuisine: 'Purvanchal & Bihari Traditional Snacks',
    priceRange: '₹80–150',
    averagePrice: 110,
    vegetarian: 'PURE_VEG',
    localSpecialty: 'Sattu Litti Chokha dipped in Desi Ghee & Baingan Bharta',
    signatureDish: 'Desi Ghee Litti Chokha Platter with Green Chutney',
    openingHours: '11:00 AM – 10:30 PM',
    phoneContact: '+91 542 2509180',
    travellerRating: 4.8,
    reviewCount: 630,
    distanceFromReference: 0.3,
    routeRelevance: '0.3 km from Dashashwamedh Evening Ganga Aarti Arena',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=700&auto=format&fit=crop&q=80',
    scoreBreakdown: {
      prepHygiene: 92,
      waterSanitation: 91,
      diningCleanliness: 88,
      wasteMgmt: 90,
      staffHygiene: 90,
      travellerFeedback: 94,
      infoCompleteness: 89
    },
    trustIndicators: [
      '100% Traditional Clay Oven Roasting',
      'RO Drinking Water Dispensers',
      'Single-Use Compostable Leaf Plates',
      'Pure Desi Ghee Tested'
    ],
    dataSourceType: 'SAFAR Prototype Food Registry',
    prototypeStatus: 'PROTOTYPE_DATA',
    recommendationReasons: [
      'Authentic regional soul food right before the famous Evening Aarti',
      'Very pocket-friendly (~₹110 per person)',
      'High traveller satisfaction (4.8 rating)'
    ]
  },

  // ==========================================
  // 5. MEGHALAYA
  // ==========================================
  {
    id: 'food_meghalaya_01',
    name: 'Nongrum Khasi Tribal Kitchen & Tea Stall',
    destination: 'MEGHALAYA',
    city: 'Shillong / Cherrapunji',
    state: 'Meghalaya',
    location: 'Police Bazaar Heritage Alley, Shillong & Sohra Road',
    lat: 25.5750,
    lng: 91.8840,
    cuisine: 'Indigenous Khasi & Northeast Regional',
    priceRange: '₹140–260',
    averagePrice: 190,
    vegetarian: 'VEG_OPTIONS',
    localSpecialty: 'Jadoh Rice with Local Herbs, Dohneiiong & Pukhlein',
    signatureDish: 'Organic Khasi Forest Herb Stew & Steamed Pukhlein',
    openingHours: '08:00 AM – 09:30 PM',
    phoneContact: '+91 364 2221940',
    travellerRating: 4.8,
    reviewCount: 370,
    distanceFromReference: 0.7,
    routeRelevance: '0.7 km from Shillong center transit staging point',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&auto=format&fit=crop&q=80',
    scoreBreakdown: {
      prepHygiene: 92,
      waterSanitation: 94,
      diningCleanliness: 89,
      wasteMgmt: 95,
      staffHygiene: 88,
      travellerFeedback: 91,
      infoCompleteness: 92
    },
    trustIndicators: [
      'Mawlynnong Model Strict Waste Sorting & Composting',
      'Tested Mountain Spring Gravity-Fed RO Water',
      'Locally Foraged Organic Non-Pesticide Ingredients',
      'Smokeless Bio-Pellet Cooking Station'
    ],
    dataSourceType: 'SAFAR Prototype Food Registry',
    prototypeStatus: 'PROTOTYPE_DATA',
    recommendationReasons: [
      'Unique indigenous culinary heritage of the Khasi Hills',
      'Highest waste management score (95/100) adhering to eco-standards',
      'Nutritious stamina-building meals before mountain waterfall treks'
    ]
  },
  {
    id: 'food_meghalaya_02',
    name: 'Cherra Cloud Mist Homestay Kitchen',
    destination: 'MEGHALAYA',
    city: 'Cherrapunji',
    state: 'Meghalaya',
    location: 'Sohra Market Crossing, Near Nohkalikai Trailhead',
    lat: 25.2950,
    lng: 91.7280,
    cuisine: 'Northeast Comfort Food & Fresh Mountain Greens',
    priceRange: '₹120–220',
    averagePrice: 160,
    vegetarian: 'VEG_OPTIONS',
    localSpecialty: 'Bamboo Shoot Curry, Dal with Wild Mustard & Ginger Tea',
    signatureDish: 'Fresh Bamboo Shoot & Green Pea Thali with Red Rice',
    openingHours: '07:30 AM – 09:00 PM',
    phoneContact: '+91 3637 235120',
    travellerRating: 4.7,
    reviewCount: 290,
    distanceFromReference: 1.2,
    routeRelevance: '1.2 km detour on the Cherrapunji falls circuit',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700&auto=format&fit=crop&q=80',
    scoreBreakdown: {
      prepHygiene: 90,
      waterSanitation: 93,
      diningCleanliness: 88,
      wasteMgmt: 92,
      staffHygiene: 87,
      travellerFeedback: 90,
      infoCompleteness: 88
    },
    trustIndicators: [
      'Clean Rainwater Harvesting Filtration Unit',
      'Hot Boiled Mountain Drinking Water Served Free',
      'Firewood Smoke Exhausted Away from Dining',
      'Fresh Daily Locally Harvested Produce'
    ],
    dataSourceType: 'SAFAR Prototype Food Registry',
    prototypeStatus: 'PROTOTYPE_DATA',
    recommendationReasons: [
      'Steaming hot ginger tea & hearty food amidst misty weather',
      'Warm family-run homestay kitchen hospitality',
      'Eco-friendly low-waste mountain operations'
    ]
  },
  {
    id: 'food_meghalaya_03',
    name: 'Mawlynnong Clean Village Community Kitchen',
    destination: 'MEGHALAYA',
    city: 'Mawlynnong',
    state: 'Meghalaya',
    location: 'Mawlynnong Cleanest Village Center, East Khasi Hills',
    lat: 25.2010,
    lng: 91.9050,
    cuisine: 'Organic Khasi Farm-to-Table Meals',
    priceRange: '₹120–200',
    averagePrice: 160,
    vegetarian: 'VEG_OPTIONS',
    localSpecialty: 'Organic Red Rice, Bamboo Steamed Greens & Wild Honey Tea',
    signatureDish: 'Village Harvest Organic Veg Thali',
    openingHours: '08:00 AM – 08:30 PM',
    phoneContact: '+91 364 2501920',
    travellerRating: 4.9,
    reviewCount: 420,
    distanceFromReference: 0.2,
    routeRelevance: '0.2 km from Mawlynnong Living Root Bridge starting point',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700&auto=format&fit=crop&q=80',
    scoreBreakdown: {
      prepHygiene: 96,
      waterSanitation: 95,
      diningCleanliness: 96,
      wasteMgmt: 98,
      staffHygiene: 92,
      travellerFeedback: 96,
      infoCompleteness: 91
    },
    trustIndicators: [
      'Asia\'s Cleanest Village Zero-Waste Standard (98% waste score)',
      'Gravity-Fed Natural Spring Water Tested',
      'Bamboo Crafted Bins & Compost System',
      'Open-Air Breeze Bamboo Dining Hall'
    ],
    dataSourceType: 'SAFAR Prototype Food Registry',
    prototypeStatus: 'PROROTPE_DATA',
    recommendationReasons: [
      'Gold standard of eco-friendly community waste management (98/100)',
      'Wholesome organic home-grown vegetables',
      'Directly adjacent to the living root bridge track'
    ]
  },

  // ==========================================
  // 6. JAIPUR
  // ==========================================
  {
    id: 'food_jaipur_01',
    name: 'Laxmi Rajasthani Heritage Bhojanalaya',
    destination: 'JAIPUR',
    city: 'Jaipur',
    state: 'Rajasthan',
    location: 'Johari Bazaar, Near Hawa Mahal Corridor, Pink City',
    lat: 26.9210,
    lng: 75.8280,
    cuisine: 'Authentic Rajasthani Thali & Street Snacks',
    priceRange: '₹180–320',
    averagePrice: 240,
    vegetarian: 'PURE_VEG',
    localSpecialty: 'Dal Baati Churma, Pyaaz Kachori & Gatte ki Sabzi',
    signatureDish: 'Shahi Marwari Dal Baati Churma with Ghee Pot',
    openingHours: '08:00 AM – 10:30 PM',
    phoneContact: '+91 141 2568910',
    travellerRating: 4.9,
    reviewCount: 780,
    distanceFromReference: 0.5,
    routeRelevance: '0.5 km from Hawa Mahal & City Palace walking tour',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=700&auto=format&fit=crop&q=80',
    scoreBreakdown: {
      prepHygiene: 95,
      waterSanitation: 94,
      diningCleanliness: 91,
      wasteMgmt: 90,
      staffHygiene: 93,
      travellerFeedback: 96,
      infoCompleteness: 92
    },
    trustIndicators: [
      'Pure Vegetarian Traditional Haveli Kitchen',
      'UV + Ozonated Drinking Water Plant',
      'Brass & Stainless Steel Hygienic Serveware',
      '100% Desi Ghee Lab Tested Benchmark',
      'Staff Wears Traditional Turbans, Aprons & Gloves'
    ],
    dataSourceType: 'SAFAR Prototype Food Registry',
    prototypeStatus: 'PROTOTYPE_DATA',
    recommendationReasons: [
      'Quintessential Dal Baati Churma experience in the Pink City',
      'Superb prototype hygiene score of 93/100',
      'Only 500m from Hawa Mahal',
      'Matches moderate daily budget comfortably'
    ]
  },
  {
    id: 'food_jaipur_02',
    name: 'Amer Fort Foothills Garden Rasoi',
    destination: 'JAIPUR',
    city: 'Jaipur',
    state: 'Rajasthan',
    location: 'Amer Road, Foothills of Amber Palace & Maota Lake',
    lat: 26.9820,
    lng: 75.8500,
    cuisine: 'Rajasthani Royal Dining & Light Refreshments',
    priceRange: '₹220–380',
    averagePrice: 290,
    vegetarian: 'VEG_OPTIONS',
    localSpecialty: 'Ker Sangri, Bajre ki Roti with White Butter & Chaach',
    signatureDish: 'Traditional Bajra Roti Thali with Fresh Chhachh',
    openingHours: '10:00 AM – 10:00 PM',
    phoneContact: '+91 141 2530219',
    travellerRating: 4.7,
    reviewCount: 420,
    distanceFromReference: 1.4,
    routeRelevance: '1.4 km detour along the Amer Fort heritage corridor',
    image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=700&auto=format&fit=crop&q=80',
    scoreBreakdown: {
      prepHygiene: 91,
      waterSanitation: 90,
      diningCleanliness: 94,
      wasteMgmt: 89,
      staffHygiene: 90,
      travellerFeedback: 91,
      infoCompleteness: 88
    },
    trustIndicators: [
      'Lush Open-Air Garden Courtyard Dining',
      'RO Purified Water Station',
      'Daily Pest Control Sanitization Log',
      'Covered Buffet Counter with Temperature Control'
    ],
    dataSourceType: 'SAFAR Prototype Food Registry',
    prototypeStatus: 'PROTOTYPE_DATA',
    recommendationReasons: [
      'Relaxing garden lunch stop right after exploring Amer Fort',
      'Excellent dining atmosphere with 94/100 cleanliness',
      'Nutritious rustic Rajasthani millet food'
    ]
  },
  {
    id: 'food_jaipur_03',
    name: 'Chokhi Dhani Heritage Spice Pavilion',
    destination: 'JAIPUR',
    city: 'Jaipur',
    state: 'Rajasthan',
    location: 'Tonk Road / MI Road Heritage Precinct, Pink City',
    lat: 26.8920,
    lng: 75.8050,
    cuisine: 'Royal Rajputana & Traditional Marwari',
    priceRange: '₹260–420',
    averagePrice: 330,
    vegetarian: 'PURE_VEG',
    localSpecialty: 'Gatte ki Sabzi, Malpua Rabdi & Bikaneri Rasgulla',
    signatureDish: 'Maharaja Royal Marwari Platter with Kesar Kulfi',
    openingHours: '12:00 PM – 11:00 PM',
    phoneContact: '+91 141 2780190',
    travellerRating: 4.8,
    reviewCount: 690,
    distanceFromReference: 1.8,
    routeRelevance: 'Near central transit corridor and Albert Hall Museum',
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=700&auto=format&fit=crop&q=80',
    scoreBreakdown: {
      prepHygiene: 94,
      waterSanitation: 93,
      diningCleanliness: 95,
      wasteMgmt: 91,
      staffHygiene: 93,
      travellerFeedback: 95,
      infoCompleteness: 92
    },
    trustIndicators: [
      'Live Traditional Chulha Kitchen with Steam Sanitization',
      'RO UV Potable Water Certified Daily',
      'Staff in Traditional Clean Attire with Aprons',
      'Zero Food Wastage NGO Donation Protocol'
    ],
    dataSourceType: 'SAFAR Prototype Food Registry',
    prototypeStatus: 'PROTOTYPE_DATA',
    recommendationReasons: [
      'Authentic Royal Rajasthani dining experience',
      'Outstanding cleanliness (95/100) and hospitable service',
      'Famous desserts including Malpua Rabdi'
    ]
  }
];

// Initialize prototype food outlets into memory store with calculated Swachh score
function getFoodOutlets() {
  const current = dbStore.get('foodOutlets') || [];
  if (current.length === 0) {
    SEED_FOOD_OUTLETS.forEach((outlet) => {
      const computedScore = calculateSwachhScore(outlet.scoreBreakdown);
      dbStore.insert('foodOutlets', {
        ...outlet,
        swachhScore: computedScore
      });
    });
  }
  return dbStore.get('foodOutlets');
}

/**
 * Filter food outlets based on functional criteria
 */
function searchFoodOutlets({
  destination,
  cuisine,
  budget,
  vegetarian,
  minScore,
  maxDistance,
  nearRoute,
  search
}) {
  let outlets = getFoodOutlets();

  // Normalize destination key
  if (destination && destination !== 'ALL') {
    const dUpper = destination.toUpperCase();
    outlets = outlets.filter((o) => 
      o.destination.toUpperCase().includes(dUpper) || 
      dUpper.includes(o.destination.toUpperCase()) ||
      o.city.toUpperCase().includes(dUpper)
    );
  }

  // Filter by cuisine
  if (cuisine && cuisine !== 'ALL') {
    const qCuisine = cuisine.toLowerCase();
    outlets = outlets.filter((o) => o.cuisine.toLowerCase().includes(qCuisine));
  }

  // Filter by budget tier
  if (budget && budget !== 'ALL') {
    const bTier = budget.toUpperCase();
    if (bTier === 'BUDGET') {
      outlets = outlets.filter((o) => o.averagePrice <= 180);
    } else if (bTier === 'MODERATE') {
      outlets = outlets.filter((o) => o.averagePrice > 150 && o.averagePrice <= 350);
    } else if (bTier === 'LUXURY' || bTier === 'PREMIUM') {
      outlets = outlets.filter((o) => o.averagePrice > 300);
    }
  }

  // Filter by vegetarian availability
  if (vegetarian && vegetarian !== 'ALL') {
    const vKey = vegetarian.toUpperCase();
    if (vKey === 'PURE_VEG' || vKey === 'YES') {
      outlets = outlets.filter((o) => o.vegetarian === 'PURE_VEG');
    } else if (vKey === 'VEG_OPTIONS') {
      outlets = outlets.filter((o) => o.vegetarian === 'PURE_VEG' || o.vegetarian === 'VEG_OPTIONS');
    }
  }

  // Filter by min Swachh Score
  if (minScore) {
    const minS = Number(minScore);
    if (!isNaN(minS)) {
      outlets = outlets.filter((o) => (o.swachhScore || 0) >= minS);
    }
  }

  // Filter by max distance / detour
  if (maxDistance) {
    const maxD = Number(maxDistance);
    if (!isNaN(maxD)) {
      outlets = outlets.filter((o) => (o.distanceFromReference || 0) <= maxD);
    }
  }

  // Near Route prioritization
  if (nearRoute === 'true' || nearRoute === true) {
    // Sort primarily by distance to route, secondarily by Swachh Score
    outlets = [...outlets].sort((a, b) => (a.distanceFromReference || 0) - (b.distanceFromReference || 0));
  } else {
    // Standard sort by Swachh score desc
    outlets = [...outlets].sort((a, b) => (b.swachhScore || 0) - (a.swachhScore || 0));
  }

  // General text search
  if (search && search.trim()) {
    const sTerm = search.toLowerCase().trim();
    outlets = outlets.filter((o) => 
      o.name.toLowerCase().includes(sTerm) ||
      o.location.toLowerCase().includes(sTerm) ||
      o.localSpecialty.toLowerCase().includes(sTerm) ||
      o.cuisine.toLowerCase().includes(sTerm)
    );
  }

  return outlets;
}

/**
 * Get single food outlet by ID with detailed score explanation
 */
function getFoodOutletById(id) {
  const outlets = getFoodOutlets();
  const found = outlets.find((o) => o.id === id);
  if (!found) return null;

  return {
    ...found,
    scoreFormulaExplanation: {
      formula: 'SwachhScore = 0.20*PrepHygiene + 0.20*WaterSanitation + 0.15*DiningCleanliness + 0.15*WasteMgmt + 0.10*StaffHygiene + 0.10*TravellerFeedback + 0.10*InfoCompleteness',
      weights: SWACHH_SCORE_WEIGHTS,
      transparencyNote: 'This is a transparent SAFAR prototype intelligence score calculated deterministically from available indicators and traveller feedback. It does NOT constitute official government certification.'
    }
  };
}

/**
 * Deterministic Explainable AI Recommendations
 */
function getAiFoodRecommendations({
  destination = 'AYODHYA',
  travellers = 2,
  budgetTier = 'MODERATE',
  preferredCuisine = 'ALL',
  vegetarian = 'ALL',
  currentMeal = 'LUNCH'
}) {
  const normDest = (destination || 'AYODHYA').toUpperCase();
  const allForDest = searchFoodOutlets({
    destination: normDest,
    cuisine: preferredCuisine,
    vegetarian,
    budget: budgetTier
  });

  // Fallback if strict filter yields 0
  const candidates = allForDest.length > 0 ? allForDest : searchFoodOutlets({ destination: normDest });

  const numTravellers = Math.max(1, Number(travellers) || 2);
  const tierKey = (budgetTier || 'MODERATE').toUpperCase();

  const recommendations = candidates.slice(0, 3).map((outlet) => {
    const approxGroupCost = outlet.averagePrice * numTravellers;
    const reasons = [
      `Fits ${tierKey.toLowerCase()} travel plan (~₹${outlet.averagePrice}/person, group total approx ₹${approxGroupCost})`,
      `${outlet.distanceFromReference} km detour from planned corridor in ${outlet.city}`,
      `Verified prototype Swachh Score of ${outlet.swachhScore}/100 with high water/sanitation indicators`,
      `Offers iconic local culinary specialty: ${outlet.localSpecialty.split(',')[0]}`
    ];

    return {
      ...outlet,
      outlet,
      suitabilityMeal: currentMeal,
      approxGroupCost,
      detourKm: outlet.distanceFromReference,
      explainableReasons: reasons,
      recommendationReasons: reasons
    };
  });

  return {
    success: true,
    destination: normDest,
    travellerCount: numTravellers,
    budgetTier: tierKey,
    recommendations,
    disclaimer: 'SAFAR Prototype Swachh Food Intelligence is calculated from transparent prototype benchmark metrics and traveller feedback. It does not replace statutory food safety audits.'
  };
}

/**
 * Handle Traveller Feedback & Update Component Score
 */
function recordTravellerFeedback(outletId, {
  cleanliness = 'VERY_CLEAN', // 'VERY_CLEAN' | 'ACCEPTABLE' | 'NEEDS_IMPROVEMENT'
  waterAvailable = 'AVAILABLE', // 'AVAILABLE' | 'UNKNOWN'
  wasteManagement = 'GOOD', // 'GOOD' | 'AVERAGE' | 'POOR'
  foodExperience = 'GOOD', // 'GOOD' | 'AVERAGE' | 'POOR'
  notes = '',
  touristId = 'TID-1035'
}) {
  const outlets = getFoodOutlets();
  const target = outlets.find((o) => o.id === outletId);
  if (!target) return null;

  // Convert subjective inputs to numeric impact
  const cleanScore = cleanliness === 'VERY_CLEAN' ? 95 : cleanliness === 'ACCEPTABLE' ? 80 : 55;
  const waterScore = waterAvailable === 'AVAILABLE' ? 95 : 65;
  const wasteScore = wasteManagement === 'GOOD' ? 92 : wasteManagement === 'AVERAGE' ? 75 : 55;
  const expScore = foodExperience === 'GOOD' ? 95 : foodExperience === 'AVERAGE' ? 78 : 50;

  const feedbackAvg = Math.round((cleanScore + waterScore + wasteScore + expScore) / 4);

  // Smooth update of travellerFeedback score
  const currentFb = target.scoreBreakdown?.travellerFeedback || 80;
  const newFbScore = Math.min(100, Math.max(40, Math.round(currentFb * 0.85 + feedbackAvg * 0.15)));

  const updatedBreakdown = {
    ...target.scoreBreakdown,
    travellerFeedback: newFbScore
  };

  const newTotalScore = calculateSwachhScore(updatedBreakdown);
  const newReviewCount = (target.reviewCount || 100) + 1;

  const feedbackRecord = {
    id: `fb_${outletId}_${Date.now()}`,
    outletId,
    touristId,
    cleanliness,
    waterAvailable,
    wasteManagement,
    foodExperience,
    notes,
    createdAt: new Date().toISOString()
  };

  // Persist feedback to memory/dbStore
  dbStore.insert('foodFeedback', feedbackRecord);

  const updatedOutlet = dbStore.update('foodOutlets', target.id, {
    scoreBreakdown: updatedBreakdown,
    swachhScore: newTotalScore,
    reviewCount: newReviewCount
  });

  return {
    success: true,
    message: '✓ Thank you! Your feedback has been recorded and contributed to this outlet\'s SAFAR Swachh Score.',
    updatedOutlet: updatedOutlet || { ...target, swachhScore: newTotalScore, reviewCount: newReviewCount }
  };
}

module.exports = {
  SWACHH_SCORE_WEIGHTS,
  calculateSwachhScore,
  getFoodOutlets,
  searchFoodOutlets,
  getFoodOutletById,
  getAiFoodRecommendations,
  recordTravellerFeedback
};
