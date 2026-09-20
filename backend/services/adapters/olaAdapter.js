/**
 * Ola Provider Adapter
 * Implements dual-mode fare estimation:
 * - LIVE_API: Activates ONLY if OLA_API_KEY is configured and returns valid estimates.
 * - PROTOTYPE_ESTIMATE: Calibrated regional tariff model clearly labeled as prototype data.
 * 
 * Generates official web intent deep links for 1-click booking handoff.
 */

const https = require('https');

async function getEstimates({ pickup, dropoff, approxDistanceKm, approxDurationMins }) {
  const apiKey = process.env.OLA_API_KEY;

  // 1. Check if official live API credentials exist
  if (apiKey) {
    try {
      const liveEstimates = await fetchLiveOlaEstimates(pickup, dropoff, apiKey, approxDistanceKm, approxDurationMins);
      if (liveEstimates && liveEstimates.length > 0) {
        return liveEstimates;
      }
    } catch (err) {
      console.warn('[OlaAdapter] Live API query failed, falling back to PROTOTYPE_ESTIMATE:', err.message);
    }
  }

  // 2. Fallback: Calibrated Regional Prototype Estimation
  return generatePrototypeEstimates(pickup, dropoff, approxDistanceKm, approxDurationMins);
}

function fetchLiveOlaEstimates(pickup, dropoff, apiKey, approxDistanceKm, approxDurationMins) {
  return new Promise((resolve, reject) => {
    const query = new URLSearchParams({
      pickup_lat: pickup.lat,
      pickup_lng: pickup.lng,
      drop_lat: dropoff.lat,
      drop_lng: dropoff.lng,
      category: 'all'
    }).toString();

    const options = {
      hostname: 'devapi.olacabs.com',
      path: `/v1/bookings/create?${query}`,
      method: 'GET',
      headers: {
        'X-APP-TOKEN': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(data);
            const rideEstimates = parsed.ride_estimates || [];
            const results = rideEstimates.map((item) => ({
              provider: 'Ola',
              serviceName: item.display_name || item.category,
              category: mapCategory(item.category),
              minFare: Math.round(item.amount_min || item.estimated_fare * 0.95),
              maxFare: Math.round(item.amount_max || item.estimated_fare * 1.15),
              currency: item.currency || 'INR',
              etaMins: item.eta || 5,
              approxDistanceKm: Number(approxDistanceKm.toFixed(1)),
              approxDurationMins: Math.round(approxDurationMins),
              capacity: item.capacity || 4,
              dataSource: 'LIVE_API',
              disclaimer: 'Live pricing returned from official Ola API.',
              bookingUrl: buildOlaDeepLink(pickup, dropoff)
            }));
            resolve(results);
          } catch (e) {
            reject(new Error('Failed to parse Ola live response'));
          }
        } else {
          reject(new Error(`Ola live API returned status ${res.statusCode}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Ola live API request timed out'));
    });
    req.end();
  });
}

function generatePrototypeEstimates(pickup, dropoff, approxDistanceKm, approxDurationMins) {
  const dist = Math.max(0.5, approxDistanceKm);
  const duration = Math.max(2, approxDurationMins);

  const services = [
    {
      serviceName: 'Ola Bike',
      category: 'BIKE',
      baseFare: 20,
      perKm: 7.0,
      perMin: 1.0,
      capacity: 1,
      etaMins: 3,
      surge: 1.0
    },
    {
      serviceName: 'Ola Auto',
      category: 'AUTO',
      baseFare: 32,
      perKm: 10.5,
      perMin: 1.1,
      capacity: 3,
      etaMins: 4,
      surge: 1.0
    },
    {
      serviceName: 'Ola Mini',
      category: 'CAB',
      baseFare: 60,
      perKm: 14.5,
      perMin: 1.8,
      capacity: 4,
      etaMins: 6,
      surge: 1.03
    },
    {
      serviceName: 'Ola Prime Sedan',
      category: 'PREMIUM',
      baseFare: 90,
      perKm: 18.5,
      perMin: 2.2,
      capacity: 4,
      etaMins: 8,
      surge: 1.05
    }
  ];

  return services.map((s) => {
    const distComponent = Math.round(dist * s.perKm);
    const timeComponent = Math.round(duration * s.perMin);
    const rawFare = (s.baseFare + dist * s.perKm + duration * s.perMin) * s.surge;
    const minFare = Math.round(rawFare * 0.95);
    const maxFare = Math.round(rawFare * 1.15);

    return {
      provider: 'Ola',
      serviceName: s.serviceName,
      category: s.category,
      minFare,
      maxFare,
      currency: 'INR',
      etaMins: s.etaMins,
      etaLabel: 'Nominal pickup estimate',
      approxDistanceKm: Number(dist.toFixed(1)),
      approxDurationMins: Math.round(duration),
      capacity: s.capacity,
      passengerGuidance: s.capacity === 1 ? 'Suitable for 1 passenger' : `Suitable for 1–${s.capacity} passengers`,
      luggageGuidance: s.category === 'BIKE' ? 'Limited luggage (backpack only)'
        : s.category === 'AUTO' ? 'Standard luggage (1–2 small bags)'
        : s.category === 'PREMIUM' ? 'More luggage capacity (3–4 trolley bags)'
        : 'Standard luggage (2–3 trolley bags)',
      dataSource: 'PROTOTYPE_ESTIMATE',
      disclaimer: 'Prototype Estimate based on calibrated regional tariff model. Live surge and driver availability subject to final confirmation in Ola app.',
      bookingUrl: buildOlaDeepLink(pickup, dropoff),
      handoffNote: 'Handoff opens official Ola web booking with pre-filled coordinates',
      breakdown: {
        category: s.category,
        serviceName: s.serviceName,
        approxDistanceKm: Number(dist.toFixed(1)),
        approxDurationMins: Math.round(duration),
        baseFare: s.baseFare,
        perKmRate: s.perKm,
        distComponent,
        perMinRate: s.perMin,
        timeComponent,
        calibrationFactor: s.surge,
        calculatedMedian: Math.round(rawFare),
        minFare,
        maxFare
      }
    };
  });
}

function buildOlaDeepLink(pickup, dropoff) {
  const pLat = encodeURIComponent(pickup.lat || '');
  const pLng = encodeURIComponent(pickup.lng || '');
  const pName = encodeURIComponent(pickup.address || 'Pickup');
  const dLat = encodeURIComponent(dropoff.lat || '');
  const dLng = encodeURIComponent(dropoff.lng || '');
  const dName = encodeURIComponent(dropoff.address || 'Destination');

  return `https://book.olacabs.com/?lat=${pLat}&lng=${pLng}&drop_lat=${dLat}&drop_lng=${dLng}&pickup_name=${pName}&drop_name=${dName}`;
}

function mapCategory(categoryName) {
  const name = (categoryName || '').toUpperCase();
  if (name.includes('BIKE') || name.includes('MOTO')) return 'BIKE';
  if (name.includes('AUTO')) return 'AUTO';
  if (name.includes('PRIME') || name.includes('SEDAN') || name.includes('SUV')) return 'PREMIUM';
  return 'CAB';
}

module.exports = {
  getEstimates,
  buildOlaDeepLink
};
