/**
 * S.A.F.A.R. AI Travel Intelligence Service
 * 
 * Provides core tourism intelligence:
 * - Destination recommendations
 * - Personalized day-by-day itinerary generation
 * - Itemized budget estimation
 * - Transport mode suggestions
 * - Stay / hotel recommendations
 * - Certified guide matching
 * - Contextual travel information (best time, customs, dress codes)
 * - Contextual safety information (crowd peak times, terrain caution, verified zones)
 * 
 * Uses realistic deterministic local models with zero dependency on paid third-party APIs.
 */

const { searchFoodOutlets } = require('./foodService');

const DESTINATION_INTELLIGENCE = {
  AYODHYA: {
    id: 'ayodhya',
    name: 'Ayodhya Dham & Ram Janmabhoomi Corridor',
    state: 'Uttar Pradesh',
    circuit: 'Heritage & Spiritual Pilgrimage',
    tagline: 'Ancient spiritual capital on the sacred banks of River Saryu',
    idealDays: 3,
    bestSeason: 'October to March (Pleasant weather, festive illumination)',
    avgDailyBudgetInr: {
      budget: 1200,
      moderate: 2800,
      luxury: 6500
    },
    contextualTravelTips: [
      'Early morning Aarti at Saryu Ghat (Ram Ki Paidi) offers the best uncrowded photography experience.',
      'Electric e-rickshaws are the most eco-friendly and convenient way to navigate inner temple lanes.',
      'Carry modest traditional attire for temple darshan; mobile lockers are available at the Janmabhoomi entry pavilion.'
    ],
    contextualSafetyTips: [
      'Saryu river currents can be swift during monsoon and evening high-discharge periods; bathe only in designated safe barricaded ghats.',
      'Follow QR-verified signage along the Ram Path pilgrim corridor; avoid touts offering shortcut VIP passes.'
    ],
    attractions: [
      { name: 'Shri Ram Janmabhoomi Mandir', durationHours: 3.5, timeOfDay: 'Morning', category: 'Spiritual', entryFee: 0 },
      { name: 'Hanuman Garhi', durationHours: 1.5, timeOfDay: 'Morning', category: 'Spiritual Heritage', entryFee: 0 },
      { name: 'Kanak Bhawan', durationHours: 1.5, timeOfDay: 'Afternoon', category: 'Architecture', entryFee: 0 },
      { name: 'Ram Ki Paidi & Saryu Ghat Aarti', durationHours: 2.0, timeOfDay: 'Evening', category: 'Cultural', entryFee: 0 },
      { name: 'Nageshwarnath Temple', durationHours: 1.0, timeOfDay: 'Morning', category: 'Ancient Heritage', entryFee: 0 },
      { name: 'Surya Kund Heritage Complex', durationHours: 1.5, timeOfDay: 'Afternoon', category: 'Gardens & Sound Show', entryFee: 20 }
    ],
    stays: [
      { name: 'Ramayana Heritage Pilgrim Niwas', type: 'Pilgrim Guest House', pricePerNight: 1400, rating: 4.8, distance: '0.6 km from Mandir', amenities: ['Pure Veg Dining', '24h Hot Water', 'Luggage Cloakroom'] },
      { name: 'Saryu Riverfront Eco Retreat', type: 'Curated Homestay', pricePerNight: 2200, rating: 4.9, distance: '1.2 km from Ghats', amenities: ['River View', 'Wi-Fi', 'Local Host Assistance'] },
      { name: 'The Royal Heritage Ayodhya', type: 'Heritage Hotel', pricePerNight: 4800, rating: 4.7, distance: '2.5 km from City Center', amenities: ['Car Parking', 'Restaurant', 'Guide Desk'] }
    ]
  },
  JAMMU: {
    id: 'jammu',
    name: 'Katra Vaishno Devi & Jammu Pilgrim Track',
    state: 'Jammu & Kashmir',
    circuit: 'Mountain Pilgrimage & Himalayan Foothills',
    tagline: 'Holy shrine nestled at 5,200 ft amidst the Trikuta Mountains',
    idealDays: 3,
    bestSeason: 'March to November (Pleasant; carry heavy woolens in winter)',
    avgDailyBudgetInr: {
      budget: 1400,
      moderate: 3200,
      luxury: 7200
    },
    contextualTravelTips: [
      'Obtain official RFID yatra tracking card at Katra Railway Station before starting the 12 km trek.',
      'Battery-operated cars operate between Adhkuwari and Bhawan for senior citizens with pre-booking.',
      'Carry light rain poncho and trekking poles for the mountain ascent.'
    ],
    contextualSafetyTips: [
      'Track automated weather alerts for sudden fog or rockfall risk between Himkoti and Sanjichhat.',
      'Stay on designated covered tracks; do not attempt shortcut cliff trails.'
    ],
    attractions: [
      { name: 'Mata Vaishno Devi Bhawan', durationHours: 5.0, timeOfDay: 'Night / Morning', category: 'Sacred Cave Shrine', entryFee: 0 },
      { name: 'Bhairon Baba Temple (Via Ropeway)', durationHours: 2.0, timeOfDay: 'Morning', category: 'Mountain Viewpoint', entryFee: 100 },
      { name: 'Adhkuwari Cave Temple', durationHours: 3.0, timeOfDay: 'Mid-Trek', category: 'Heritage', entryFee: 0 },
      { name: 'Banganga Holy River Staging Point', durationHours: 1.0, timeOfDay: 'Morning', category: 'Yatra Entry', entryFee: 0 },
      { name: 'Raghunath Temple & Heritage Bazaar (Jammu)', durationHours: 2.0, timeOfDay: 'Afternoon', category: 'Historical Temple', entryFee: 0 }
    ],
    stays: [
      { name: 'Shri Mata Vaishno Devi Shrine Board Yatri Niwas', type: 'Shrine Board Stay', pricePerNight: 950, rating: 4.6, distance: '0.4 km from Katra Station', amenities: ['Subsidized Dining', 'Medical Unit', 'Security Desk'] },
      { name: 'Trikuta Mountain View Resort', type: 'Comfort Hotel', pricePerNight: 2600, rating: 4.7, distance: '1.0 km from Banganga', amenities: ['Helipad Shuttle', 'Steam Bath', 'Wi-Fi'] },
      { name: 'Kashmir Valley Pine Retreat', type: 'Curated Homestay', pricePerNight: 1800, rating: 4.8, distance: '1.8 km from Katra Market', amenities: ['Home Cooked Meals', 'Trekking Assistance'] }
    ]
  },
  AGRA: {
    id: 'agra',
    name: 'Agra World Heritage Corridor & Taj Mahal',
    state: 'Uttar Pradesh',
    circuit: 'Mughal Architecture & UNESCO World Heritage',
    tagline: 'Home to the iconic symbol of eternal love and majestic Mughal citadels',
    idealDays: 2,
    bestSeason: 'October to March (Comfortable winter sightseeing)',
    avgDailyBudgetInr: {
      budget: 1300,
      moderate: 3000,
      luxury: 8000
    },
    contextualTravelTips: [
      'Taj Mahal is closed on Fridays for prayers; plan your itinerary accordingly.',
      'Sunrise entrance from the East Gate provides cooler temperatures and softest illumination.',
      'Government authorized electric golf carts shuttle visitors from the outer parking to the monument gate.'
    ],
    contextualSafetyTips: [
      'Beware of unauthorized touts outside Agra Cantt station promising priority entry or marble discounts; verify official QR credentials.',
      'Pre-paid auto fares from Agra Cantt station avoid standard tourist surcharges.'
    ],
    attractions: [
      { name: 'Taj Mahal (Sunrise Tour)', durationHours: 3.0, timeOfDay: 'Sunrise / Morning', category: 'UNESCO World Heritage', entryFee: 50 },
      { name: 'Agra Fort Citadel & Diwan-i-Khas', durationHours: 2.5, timeOfDay: 'Afternoon', category: 'Mughal Fort', entryFee: 50 },
      { name: 'Mehtab Bagh Sunset Reflection Garden', durationHours: 2.0, timeOfDay: 'Sunset', category: 'River Viewpoint', entryFee: 25 },
      { name: 'Fatehpur Sikri Imperial City', durationHours: 4.0, timeOfDay: 'Full Morning (Excursion)', category: 'UNESCO Heritage', entryFee: 50 },
      { name: 'Itimad-ud-Daulah (Baby Taj)', durationHours: 1.5, timeOfDay: 'Afternoon', category: 'Marble Mosaic', entryFee: 30 }
    ],
    stays: [
      { name: 'Tajganj Heritage Homestay', type: 'Curated Homestay', pricePerNight: 1600, rating: 4.9, distance: '0.7 km from East Gate', amenities: ['Rooftop Taj View', 'Home Breakfast', 'Wi-Fi'] },
      { name: 'Agra City Center Comfort Inn', type: 'Modern Hotel', pricePerNight: 2400, rating: 4.5, distance: '3.0 km from Station', amenities: ['Air Conditioning', 'Buffet Breakfast', 'Airport Cab'] },
      { name: 'Mughal Courtyard Boutique Palace', type: 'Heritage Boutique', pricePerNight: 5200, rating: 4.8, distance: '1.5 km from Taj Nature Walk', amenities: ['Swimming Pool', 'Garden Dining', 'Certified Tour Desk'] }
    ]
  },
  VARANASI: {
    id: 'varanasi',
    name: 'Kashi Vishwanath & Varanasi Sacred Ghats',
    state: 'Uttar Pradesh',
    circuit: 'Living Cultural Heritage & Ganga Ghats',
    tagline: 'The timeless spiritual capital of India on the sacred Ganga',
    idealDays: 3,
    bestSeason: 'November to February (Pleasant winter breezes, Dev Deepawali)',
    avgDailyBudgetInr: {
      budget: 1100,
      moderate: 2500,
      luxury: 6000
    },
    contextualTravelTips: [
      'Experience the Subah-e-Banaras early morning sunrise boat ride from Assi Ghat to Dashashwamedh Ghat.',
      'Kashi Vishwanath Temple corridor offers seamless river-to-temple access; digital lockers are available.',
      'Savor iconic Banarasi culinary traditions: Malaiyo (winter), Tamatar Chaat, and Kachori Jalebi.'
    ],
    contextualSafetyTips: [
      'Ghat boatmen rates should be verified with the municipal pre-fixed boat tariff board.',
      'Take caution on slippery river stone steps during morning bathing hours.'
    ],
    attractions: [
      { name: 'Kashi Vishwanath Corridor & Golden Temple', durationHours: 2.5, timeOfDay: 'Morning', category: 'Spiritual', entryFee: 0 },
      { name: 'Ganga Sunrise Boat Ride (Assi to Manikarnika)', durationHours: 2.0, timeOfDay: 'Dawn', category: 'River Heritage', entryFee: 150 },
      { name: 'Grand Ganga Evening Aarti (Dashashwamedh)', durationHours: 2.0, timeOfDay: 'Evening', category: 'Spiritual Ritual', entryFee: 0 },
      { name: 'Sarnath Buddhist Heritage Site & Deer Park', durationHours: 3.5, timeOfDay: 'Afternoon', category: 'Buddhist Pilgrimage', entryFee: 25 },
      { name: 'Ramnagar Fort & Museum', durationHours: 2.0, timeOfDay: 'Afternoon', category: 'Historical Palace', entryFee: 50 }
    ],
    stays: [
      { name: 'Ganga View Heritage Haveli', type: 'Heritage Stay', pricePerNight: 1900, rating: 4.8, distance: 'Directly on Ghats', amenities: ['River Balcony', 'Yoga Sessions', 'Wi-Fi'] },
      { name: 'Kashi Atithi Pilgrim Niwas', type: 'Guest House', pricePerNight: 1100, rating: 4.6, distance: '0.3 km from Vishwanath Temple', amenities: ['Pure Veg Meals', 'Clean Linen', '24h Reception'] },
      { name: 'Benares Palace Heritage Hotel', type: 'Boutique Hotel', pricePerNight: 4500, rating: 4.7, distance: '2.0 km from Cantonment', amenities: ['Courtyard Garden', 'Classical Music Evenings'] }
    ]
  },
  MEGHALAYA: {
    id: 'meghalaya',
    name: 'Shillong & Cherrapunji Monsoon Corridor',
    state: 'Meghalaya',
    circuit: 'Eco-Adventure, Waterfalls & Living Root Bridges',
    tagline: 'Abode of the clouds with crystalline rivers and living root bridges',
    idealDays: 4,
    bestSeason: 'September to May (Clear skies, emerald pools); June-Aug for monsoon cascades',
    avgDailyBudgetInr: {
      budget: 1500,
      moderate: 3500,
      luxury: 7500
    },
    contextualTravelTips: [
      'Double Decker Living Root Bridge trek in Nongriat requires approx. 3,500 stone steps; start by 7:00 AM.',
      'Carry quick-dry clothing, waterproof shoe covers, and cash as remote village stalls rarely have digital network.',
      'Hire a certified Khasi local guide for respectful community interactions in sacred groves.'
    ],
    contextualSafetyTips: [
      'Dense fog can reduce mountain highway visibility abruptly; avoid driving along Sohra cliffs after dark.',
      '0-Signal zones are common along river canyons; S.A.F.A.R. Ghost-Mesh offline emergency protocol is available.'
    ],
    attractions: [
      { name: 'Nohkalikai Falls & Cliff Viewpoint', durationHours: 2.0, timeOfDay: 'Morning', category: 'Waterfalls & Nature', entryFee: 30 },
      { name: 'Nongriat Double Decker Living Root Bridge', durationHours: 6.0, timeOfDay: 'Full Day Trek', category: 'Bio-Engineering Wonder', entryFee: 50 },
      { name: 'Dawki Umngot Crystal River Boating', durationHours: 3.0, timeOfDay: 'Morning', category: 'River Adventure', entryFee: 500 },
      { name: 'Mawsmai Limestone Caves', durationHours: 1.5, timeOfDay: 'Afternoon', category: 'Spelunking', entryFee: 20 },
      { name: 'Mawlynnong Cleanest Village in Asia', durationHours: 2.5, timeOfDay: 'Afternoon', category: 'Community Tourism', entryFee: 50 }
    ],
    stays: [
      { name: 'Cherrapunji Misty Falls Homestay', type: 'Eco Homestay', pricePerNight: 1800, rating: 4.9, distance: '1.5 km from Sohra Center', amenities: ['Khasi Organic Food', 'Local Trek Guide', 'Fireplace'] },
      { name: 'Polo Orchid Cloud Resort', type: 'Luxury Eco Resort', pricePerNight: 6200, rating: 4.8, distance: 'Cliff edge facing Seven Sisters', amenities: ['Valley View Balcony', 'Spa', 'Restaurant'] },
      { name: 'Shillong Pine Valley Guest House', type: 'Heritage Cottage', pricePerNight: 2300, rating: 4.6, distance: 'Police Bazaar, Shillong', amenities: ['Heated Rooms', 'Wi-Fi', 'Breakfast'] }
    ]
  },
  JAIPUR: {
    id: 'jaipur',
    name: 'Jaipur Pink City & Aravalli Forts',
    state: 'Rajasthan',
    circuit: 'Royal Heritage & Architectural Grandeur',
    tagline: 'Royal capital adorned with pink stone palaces and hilltop citadels',
    idealDays: 3,
    bestSeason: 'October to March (Pleasant winter weather)',
    avgDailyBudgetInr: {
      budget: 1300,
      moderate: 3000,
      luxury: 7800
    },
    contextualTravelTips: [
      'Purchase the composite entry ticket covering Amer Fort, Hawa Mahal, Jantar Mantar, and Albert Hall.',
      'Catch the evening sunset silhouette from Nahargarh Fort overlooking the illuminated Pink City.',
      'Bargain respectfully in Johari Bazaar and Bapu Bazaar for authentic textiles and blue pottery.'
    ],
    contextualSafetyTips: [
      'Use pre-paid government booths or multi-provider app rides for station-to-fort transfers.',
      'Check certified government identity cards before hiring local guides outside monument gates.'
    ],
    attractions: [
      { name: 'Amber Palace & Maota Lake Mirror', durationHours: 3.5, timeOfDay: 'Morning', category: 'UNESCO Hill Fort', entryFee: 100 },
      { name: 'Hawa Mahal Palace of Winds', durationHours: 1.5, timeOfDay: 'Morning', category: 'Architectural Icon', entryFee: 50 },
      { name: 'Jantar Mantar Astronomical Observatory', durationHours: 2.0, timeOfDay: 'Afternoon', category: 'UNESCO Science Heritage', entryFee: 50 },
      { name: 'City Palace Museum & Courtyards', durationHours: 2.5, timeOfDay: 'Afternoon', category: 'Royal Museum', entryFee: 200 },
      { name: 'Nahargarh Fort Sunset Viewpoint', durationHours: 2.0, timeOfDay: 'Sunset', category: 'Panorama', entryFee: 50 }
    ],
    stays: [
      { name: 'Haveli Kalwara Heritage Stay', type: 'Traditional Haveli', pricePerNight: 2100, rating: 4.8, distance: 'Inside Walled City', amenities: ['Courtyard Breakfast', 'Folk Evenings', 'Wi-Fi'] },
      { name: 'Pink City Central Yatri Inn', type: 'Budget Hotel', pricePerNight: 1200, rating: 4.5, distance: '0.8 km from Station', amenities: ['Clean Rooms', 'AC', '24h Desk'] },
      { name: 'Shahpura Royal Palace Hotel', type: 'Luxury Heritage Hotel', pricePerNight: 5800, rating: 4.9, distance: 'C-Scheme Heritage Quarter', amenities: ['Swimming Pool', 'Royal Dining', 'Spa'] }
    ]
  }
};

/**
 * Generate a smart, personalized day-by-day itinerary and estimated budget
 */
function generatePersonalizedPlan({
  destinationKey = 'AYODHYA',
  days = 3,
  travellers = 2,
  budgetTier = 'MODERATE', // 'BUDGET' | 'MODERATE' | 'LUXURY'
  interests = ['HERITAGE', 'SPIRITUAL'],
  preferredTransport = 'CAB'
}) {
  const normKey = (destinationKey || 'AYODHYA').toUpperCase();
  const destData = DESTINATION_INTELLIGENCE[normKey] || DESTINATION_INTELLIGENCE.AYODHYA;
  const numDays = Math.max(1, Math.min(7, Number(days) || destData.idealDays));
  const numTravellers = Math.max(1, Math.min(20, Number(travellers) || 2));
  const tierKey = (budgetTier || 'MODERATE').toLowerCase();

  const dailyBase = destData.avgDailyBudgetInr[tierKey] || destData.avgDailyBudgetInr.moderate;

  // Calculate realistic estimated budget
  const stayCostPerNight = tierKey === 'budget' ? 1200 : tierKey === 'luxury' ? 5200 : 2400;
  const roomsNeeded = Math.ceil(numTravellers / 2);
  const totalStayCost = (numDays - 1 > 0 ? numDays - 1 : 1) * stayCostPerNight * roomsNeeded;

  const transportPerDay = preferredTransport === 'BIKE' ? 350
    : preferredTransport === 'AUTO' ? 650
    : preferredTransport === 'CAB' ? 1400 : 1000;
  const totalTransportCost = numDays * transportPerDay;

  const foodAndActivitiesPerPersonDaily = tierKey === 'budget' ? 500 : tierKey === 'luxury' ? 1800 : 950;
  const totalFoodAndActivityCost = numDays * numTravellers * foodAndActivitiesPerPersonDaily;

  // Granular Food Budget Breakdown matching foodAndActivitiesPerPersonDaily
  const dailyPerPersonFoodBudget = foodAndActivitiesPerPersonDaily;
  const foodBudgetBreakdown = {
    dailyPerPersonFoodBudget,
    breakfast: Math.round(dailyPerPersonFoodBudget * 0.20),
    lunch: Math.round(dailyPerPersonFoodBudget * 0.35),
    dinner: Math.round(dailyPerPersonFoodBudget * 0.35),
    localExperience: Math.round(dailyPerPersonFoodBudget * 0.10),
    dailyTotal: dailyPerPersonFoodBudget,
    disclaimer: 'Estimated prototype benchmark values for food & culinary experiences'
  };

  const totalEstimatedBudget = totalStayCost + totalTransportCost + totalFoodAndActivityCost;

  // Build Day-by-Day schedule from curated attractions & Swachh Food recommendations
  const allAttractions = destData.attractions;
  const destFoodOutlets = searchFoodOutlets({ destination: normKey });
  const itinerary = [];

  for (let d = 1; d <= numDays; d++) {
    const startIndex = ((d - 1) * 2) % allAttractions.length;
    const dayAttractions = [
      allAttractions[startIndex],
      allAttractions[(startIndex + 1) % allAttractions.length]
    ];
    if (allAttractions[(startIndex + 2) % allAttractions.length]) {
      dayAttractions.push(allAttractions[(startIndex + 2) % allAttractions.length]);
    }

    const estimatedDayTransport = Math.round(transportPerDay);
    const estimatedDayStay = stayCostPerNight * roomsNeeded;
    const estimatedDayFood = numTravellers * foodAndActivitiesPerPersonDaily;

    const lunchOutlet = destFoodOutlets[(d - 1) % (destFoodOutlets.length || 1)] || null;
    const dinnerOutlet = destFoodOutlets[d % (destFoodOutlets.length || 1)] || null;

    itinerary.push({
      day: d,
      title: `Day ${d}: ${dayAttractions[0]?.name || 'Local Discovery'} & Sacred Circuits`,
      focus: d === 1 ? 'Arrival & Orientation' : d === numDays ? 'Cultural Wrap-up & Souvenirs' : 'Core Exploration',
      morning: dayAttractions[0] || { name: 'Morning Exploration', durationHours: 2, category: 'Leisure' },
      afternoon: dayAttractions[1] || { name: 'Afternoon Heritage Walk', durationHours: 2, category: 'Sightseeing' },
      evening: dayAttractions[2] || { name: 'Sunset View & Local Cuisine Experience', durationHours: 2, category: 'Cultural' },
      foodRecommendations: {
        lunch: lunchOutlet ? {
          id: lunchOutlet.id,
          name: lunchOutlet.name,
          cuisine: lunchOutlet.cuisine,
          averagePrice: lunchOutlet.averagePrice,
          priceRange: lunchOutlet.priceRange,
          swachhScore: lunchOutlet.swachhScore,
          routeRelevance: lunchOutlet.routeRelevance,
          distanceFromReference: lunchOutlet.distanceFromReference,
          localSpecialty: lunchOutlet.localSpecialty,
          signatureDish: lunchOutlet.signatureDish,
          mealType: 'Lunch Stop',
          added: false
        } : null,
        dinner: dinnerOutlet ? {
          id: dinnerOutlet.id,
          name: dinnerOutlet.name,
          cuisine: dinnerOutlet.cuisine,
          averagePrice: dinnerOutlet.averagePrice,
          priceRange: dinnerOutlet.priceRange,
          swachhScore: dinnerOutlet.swachhScore,
          routeRelevance: dinnerOutlet.routeRelevance,
          distanceFromReference: dinnerOutlet.distanceFromReference,
          localSpecialty: dinnerOutlet.localSpecialty,
          signatureDish: dinnerOutlet.signatureDish,
          mealType: 'Dinner Experience',
          added: false
        } : null
      },
      estimatedDayBudget: {
        transport: estimatedDayTransport,
        stay: d < numDays ? estimatedDayStay : 0,
        foodAndActivities: estimatedDayFood,
        totalDay: estimatedDayTransport + (d < numDays ? estimatedDayStay : 0) + estimatedDayFood
      }
    });
  }

  return {
    success: true,
    destination: {
      id: destData.id,
      name: destData.name,
      state: destData.state,
      circuit: destData.circuit,
      tagline: destData.tagline,
      bestSeason: destData.bestSeason
    },
    planSummary: {
      days: numDays,
      travellers: numTravellers,
      budgetTier: budgetTier.toUpperCase(),
      preferredTransport: preferredTransport.toUpperCase(),
      totalEstimatedBudgetInr: totalEstimatedBudget,
      perPersonEstimatedBudgetInr: Math.round(totalEstimatedBudget / numTravellers),
      itemizedBudget: {
        stayCost: totalStayCost,
        transportCost: totalTransportCost,
        foodAndActivitiesCost: totalFoodAndActivityCost,
        foodBudgetBreakdown
      },
      budgetDisclaimer: 'Estimated budget based on calibrated benchmark seasonal tariffs. Real costs vary with booking date and season.'
    },
    foodBudgetBreakdown,
    itinerary,
    recommendedStays: destData.stays,
    contextualTips: {
      travelAdvice: destData.contextualTravelTips,
      safetyAdvice: destData.contextualSafetyTips
    }
  };
}

function getAllDestinations() {
  return Object.values(DESTINATION_INTELLIGENCE).map((dest) => ({
    id: dest.id,
    key: dest.id.toUpperCase(),
    name: dest.name,
    state: dest.state,
    circuit: dest.circuit,
    tagline: dest.tagline,
    idealDays: dest.idealDays,
    bestSeason: dest.bestSeason,
    avgDailyBudgetInr: dest.avgDailyBudgetInr,
    topAttractions: dest.attractions.slice(0, 3).map((a) => a.name),
    sampleStays: dest.stays.slice(0, 2).map((s) => ({ name: s.name, price: s.pricePerNight, rating: s.rating }))
  }));
}

function getDestinationDetail(key) {
  const normKey = (key || 'AYODHYA').toUpperCase();
  return DESTINATION_INTELLIGENCE[normKey] || DESTINATION_INTELLIGENCE.AYODHYA;
}

module.exports = {
  DESTINATION_INTELLIGENCE,
  generatePersonalizedPlan,
  getAllDestinations,
  getDestinationDetail
};
