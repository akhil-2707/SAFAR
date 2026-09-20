/**
 * Canonical Transit Benchmark Datasets & Calculator
 * 
 * Provides verified indicative municipal meter rate benchmarks across major
 * tourism circuits for the SAFAR Fare Guard.
 * 
 * Source metadata is explicitly attributed to regional RTO / Municipal Transport
 * Department standard tariff notifications.
 */

const REGIONAL_TARIFFS = {
  AYODHYA: {
    regionKey: 'AYODHYA',
    regionName: 'Ayodhya Dham (UP)',
    authoritySource: 'UP State Transport Authority Indicative RTO Tariff Schedule',
    effectiveYear: '2025–2026',
    bounds: { minLat: 26.65, maxLat: 26.90, minLng: 82.05, maxLng: 82.35 },
    rates: {
      AUTO: { baseFare: 30, baseKm: 1.5, perKm: 10.5, vehicleLabel: 'Auto-Rickshaw Meter' },
      ERICKSHAW: { baseFare: 16, baseKm: 1.5, perKm: 7.0, vehicleLabel: 'E-Rickshaw Standard' },
      CAB: { baseFare: 50, baseKm: 1.5, perKm: 16.0, vehicleLabel: 'Non-AC / Standard Taxi' },
      BIKE: { baseFare: 15, baseKm: 1.0, perKm: 6.0, vehicleLabel: 'Registered Bike-Taxi' }
    }
  },
  AGRA: {
    regionKey: 'AGRA',
    regionName: 'Agra Heritage Circuit (UP)',
    authoritySource: 'Agra RTO Meter Tariff Guidelines',
    effectiveYear: '2025–2026',
    bounds: { minLat: 27.05, maxLat: 27.30, minLng: 77.85, maxLng: 78.15 },
    rates: {
      AUTO: { baseFare: 35, baseKm: 1.5, perKm: 11.0, vehicleLabel: 'Auto-Rickshaw Meter' },
      ERICKSHAW: { baseFare: 18, baseKm: 1.5, perKm: 8.0, vehicleLabel: 'E-Rickshaw Standard' },
      CAB: { baseFare: 60, baseKm: 1.5, perKm: 17.0, vehicleLabel: 'Tourist Taxi Meter' },
      BIKE: { baseFare: 18, baseKm: 1.0, perKm: 6.5, vehicleLabel: 'Registered Bike-Taxi' }
    }
  },
  JAMMU: {
    regionKey: 'JAMMU',
    regionName: 'Jammu & Katra Yatra Corridor (J&K)',
    authoritySource: 'J&K Transport Department Benchmark Tariff Notification',
    effectiveYear: '2025–2026',
    bounds: { minLat: 32.65, maxLat: 33.15, minLng: 74.75, maxLng: 75.15 },
    rates: {
      AUTO: { baseFare: 40, baseKm: 2.0, perKm: 12.0, vehicleLabel: 'Auto-Rickshaw Meter' },
      ERICKSHAW: { baseFare: 20, baseKm: 1.5, perKm: 8.5, vehicleLabel: 'Local E-Rickshaw' },
      CAB: { baseFare: 70, baseKm: 2.0, perKm: 18.5, vehicleLabel: 'Prepaid Tourist Cab' },
      BIKE: { baseFare: 20, baseKm: 1.0, perKm: 7.0, vehicleLabel: 'Registered Bike-Taxi' }
    }
  },
  DELHI: {
    regionKey: 'DELHI',
    regionName: 'Delhi NCR',
    authoritySource: 'Delhi Transport Authority (STA) Metered Rates',
    effectiveYear: '2025–2026',
    bounds: { minLat: 28.35, maxLat: 28.90, minLng: 76.90, maxLng: 77.45 },
    rates: {
      AUTO: { baseFare: 30, baseKm: 1.5, perKm: 11.0, vehicleLabel: 'Delhi TSR Meter' },
      ERICKSHAW: { baseFare: 15, baseKm: 1.5, perKm: 8.0, vehicleLabel: 'Last-Mile E-Rickshaw' },
      CAB: { baseFare: 50, baseKm: 1.0, perKm: 18.0, vehicleLabel: 'Economy Taxi Meter' },
      BIKE: { baseFare: 15, baseKm: 1.0, perKm: 6.0, vehicleLabel: 'Registered Bike-Taxi' }
    }
  },
  GUWAHATI: {
    regionKey: 'GUWAHATI',
    regionName: 'Guwahati & Kamrup Circuit (Assam)',
    authoritySource: 'Kamrup District Transport Office Indicative Fare Table',
    effectiveYear: '2025–2026',
    bounds: { minLat: 26.05, maxLat: 26.35, minLng: 91.55, maxLng: 91.95 },
    rates: {
      AUTO: { baseFare: 35, baseKm: 1.5, perKm: 11.5, vehicleLabel: 'Guwahati Auto Meter' },
      ERICKSHAW: { baseFare: 15, baseKm: 1.5, perKm: 8.0, vehicleLabel: 'E-Rickshaw Standard' },
      CAB: { baseFare: 60, baseKm: 1.5, perKm: 17.5, vehicleLabel: 'Tourist Taxi Meter' },
      BIKE: { baseFare: 18, baseKm: 1.0, perKm: 6.5, vehicleLabel: 'Registered Bike-Taxi' }
    }
  }
};

/**
 * Determine if coordinates fall within region bounding box
 */
function isPointInBounds(lat, lng, bounds) {
  return lat >= bounds.minLat && lat <= bounds.maxLat && lng >= bounds.minLng && lng <= bounds.maxLng;
}

/**
 * Calculates indicative municipal benchmark rates for a given route
 * based on compiled regional tariff tables
 * 
 * @param {Object} params
 * @param {number} params.pLat - Pickup latitude
 * @param {number} params.pLng - Pickup longitude
 * @param {number} params.dLat - Dropoff latitude
 * @param {number} params.dLng - Dropoff longitude
 * @param {number} params.approxDistanceKm - Estimated route distance in km
 * @returns {Object} Benchmark summary or unavailable flag
 */
function calculateRouteBenchmark({ pLat, pLng, dLat, dLng, approxDistanceKm }) {
  const dist = Math.max(0.5, approxDistanceKm);

  // Match region by pickup or dropoff coordinates
  let matchedRegion = null;
  for (const region of Object.values(REGIONAL_TARIFFS)) {
    if (isPointInBounds(pLat, pLng, region.bounds) || isPointInBounds(dLat, dLng, region.bounds)) {
      matchedRegion = region;
      break;
    }
  }

  if (!matchedRegion) {
    return {
      available: false,
      reason: 'Local benchmark unavailable for this route',
      note: 'Verified municipal tariff rate card is currently not registered for these coordinates.'
    };
  }

  const benchmarks = {};
  for (const [cat, cfg] of Object.entries(matchedRegion.rates)) {
    const extraKm = Math.max(0, dist - cfg.baseKm);
    const rawBenchmark = cfg.baseFare + extraKm * cfg.perKm;
    const minBenchmark = Math.round(rawBenchmark);
    const maxBenchmark = Math.round(rawBenchmark * 1.15); // standard ±15% traffic/detour variance

    benchmarks[cat] = {
      category: cat,
      label: cfg.vehicleLabel,
      min: minBenchmark,
      max: maxBenchmark,
      baseFare: cfg.baseFare,
      baseKm: cfg.baseKm,
      perKm: cfg.perKm,
      rateDescription: `Base ₹${cfg.baseFare} (${cfg.baseKm} km) + ₹${cfg.perKm}/km`
    };
  }

  return {
    available: true,
    regionKey: matchedRegion.regionKey,
    regionName: matchedRegion.regionName,
    authoritySource: matchedRegion.authoritySource,
    effectiveYear: matchedRegion.effectiveYear,
    distanceKm: Number(dist.toFixed(1)),
    benchmarks
  };
}

module.exports = {
  REGIONAL_TARIFFS,
  calculateRouteBenchmark
};
