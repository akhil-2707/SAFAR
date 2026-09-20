/**
 * Fare Comparison Orchestration Service
 * 
 * Concurrently queries Uber, Ola, and Rapido adapters via Promise.allSettled().
 * Isolates individual adapter errors so a failure in one provider never breaks
 * the entire comparison response for the tourist.
 * 
 * Normalizes all outputs to a standard schema and computes comparison highlights
 * (cheapest fare, fastest arrival).
 */

const uberAdapter = require('./adapters/uberAdapter');
const olaAdapter = require('./adapters/olaAdapter');
const rapidoAdapter = require('./adapters/rapidoAdapter');

async function compareFares({ pickup, dropoff, approxDistanceKm, approxDurationMins, preference = 'ALL' }) {
  const context = { pickup, dropoff, approxDistanceKm, approxDurationMins };

  // 1. Run all provider adapters concurrently with independent error isolation
  const adapterPromises = [
    uberAdapter.getEstimates(context).catch((err) => {
      console.error('[FareCompareService] Uber adapter error:', err.message);
      return [];
    }),
    olaAdapter.getEstimates(context).catch((err) => {
      console.error('[FareCompareService] Ola adapter error:', err.message);
      return [];
    }),
    rapidoAdapter.getEstimates(context).catch((err) => {
      console.error('[FareCompareService] Rapido adapter error:', err.message);
      return [];
    })
  ];

  const results = await Promise.allSettled(adapterPromises);

  // 2. Flatten fulfilled results
  let allOptions = [];
  results.forEach((res) => {
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      allOptions.push(...res.value);
    }
  });

  // 3. Filter by category or preference mode if requested
  const prefUpper = (preference || 'ALL').toUpperCase();
  let filteredOptions = allOptions;
  if (['BIKE', 'AUTO', 'CAB', 'PREMIUM'].includes(prefUpper)) {
    filteredOptions = allOptions.filter((opt) => opt.category === prefUpper);
    if (filteredOptions.length === 0) {
      filteredOptions = allOptions;
    }
  } else if (prefUpper === 'SAFETY_COMFORT') {
    filteredOptions = allOptions.filter((opt) => opt.category !== 'BIKE' && ((opt.capacity && opt.capacity > 1) || (opt.passengerCapacity && opt.passengerCapacity > 1)));
    if (filteredOptions.length === 0) {
      filteredOptions = allOptions;
    }
  }

  // 4. Identify best-in-class highlights
  let lowestFare = Infinity;
  let lowestEta = Infinity;
  let lowestBalancedScore = Infinity;

  // Compute balanced composite score: (minFare * 0.6) + (etaMins * 15 * 0.4)
  // Transparent factors: cost carries 60% weight, pickup time carries 40% weight
  filteredOptions.forEach((opt) => {
    if (opt.minFare < lowestFare) lowestFare = opt.minFare;
    if (opt.etaMins < lowestEta) lowestEta = opt.etaMins;
    const score = Math.round((opt.minFare * 0.6) + (opt.etaMins * 15 * 0.4));
    opt.balancedScore = score;
    if (score < lowestBalancedScore) lowestBalancedScore = score;
  });

  const enrichedOptions = filteredOptions.map((opt) => ({
    ...opt,
    isCheapest: opt.minFare === lowestFare,
    isFastest: opt.etaMins === lowestEta,
    isBestBalanced: opt.balancedScore === lowestBalancedScore,
    isEnclosedVehicle: opt.category === 'CAB' || opt.category === 'PREMIUM' || opt.category === 'AUTO'
  }));

  // 5. Sort according to preference mode
  if (prefUpper === 'FASTEST_ARRIVAL') {
    enrichedOptions.sort((a, b) => a.etaMins - b.etaMins);
  } else if (prefUpper === 'BALANCED_VALUE') {
    enrichedOptions.sort((a, b) => a.balancedScore - b.balancedScore);
  } else {
    // Default or LOWEST_COST or SAFETY_COMFORT: lowest fare first
    enrichedOptions.sort((a, b) => a.minFare - b.minFare);
  }

  const activeProviders = [...new Set(enrichedOptions.map((o) => o.provider))];
  const hasLiveProvider = enrichedOptions.some((o) => o.dataSource === 'LIVE_API');

  return {
    success: true,
    summary: {
      approxDistanceKm: Number(approxDistanceKm.toFixed(1)),
      distanceLabel: 'Estimated Route-Distance Approximation',
      approxDurationMins: Math.round(approxDurationMins),
      durationLabel: 'Approximate Travel Time',
      totalOptions: enrichedOptions.length,
      activeProviders,
      hasLiveProvider,
      operatingMode: hasLiveProvider ? 'HYBRID_LIVE_PROTOTYPE' : 'PROTOTYPE_ESTIMATE',
      cheapestFare: lowestFare !== Infinity ? lowestFare : null,
      fastestEta: lowestEta !== Infinity ? lowestEta : null,
      timestamp: new Date().toISOString()
    },
    options: enrichedOptions
  };
}

module.exports = {
  compareFares
};
