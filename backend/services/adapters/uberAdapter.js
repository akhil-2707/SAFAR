/**
 * Uber Provider Adapter
 * Implements dual-mode fare estimation:
 * - LIVE_API: Activates ONLY if UBER_SERVER_TOKEN is configured and returns valid estimates.
 * - PROTOTYPE_ESTIMATE: Calibrated regional tariff model clearly labeled as prototype data.
 * 
 * Generates official universal deep links for 1-click booking handoff.
 */

const https = require('https');

async function getEstimates({ pickup, dropoff, approxDistanceKm, approxDurationMins }) {
  const token = process.env.UBER_SERVER_TOKEN;

  // 1. Check if official live API credentials exist
  if (token) {
    try {
      const liveEstimates = await fetchLiveUberEstimates(pickup, dropoff, token, approxDistanceKm, approxDurationMins);
      if (liveEstimates && liveEstimates.length > 0) {
        return liveEstimates;
      }
    } catch (err) {
      console.warn('[UberAdapter] Live API query failed, falling back to PROTOTYPE_ESTIMATE:', err.message);
    }
  }

  // 2. Fallback: Calibrated Regional Prototype Estimation
  return generatePrototypeEstimates(pickup, dropoff, approxDistanceKm, approxDurationMins);
}

function fetchLiveUberEstimates(pickup, dropoff, token, approxDistanceKm, approxDurationMins) {
  return new Promise((resolve, reject) => {
    const query = new URLSearchParams({
      start_latitude: pickup.lat,
      start_longitude: pickup.lng,
      end_latitude: dropoff.lat,
      end_longitude: dropoff.lng
    }).toString();

    const options = {
      hostname: 'api.uber.com',
      path: `/v1.2/estimates/price?${query}`,
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Accept-Language': 'en_US',
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
            const prices = parsed.prices || [];
            const results = prices.map((p) => ({
              provider: 'Uber',
              serviceName: p.localized_display_name || p.display_name,
              category: mapCategory(p.display_name),
              minFare: Math.round(p.low_estimate || p.high_estimate * 0.9),
              maxFare: Math.round(p.high_estimate || p.low_estimate * 1.1),
              currency: p.currency_code || 'INR',
              etaMins: Math.round((p.duration || 300) / 60) || 4,
              approxDistanceKm: Number(approxDistanceKm.toFixed(1)),
              approxDurationMins: Math.round(approxDurationMins),
              capacity: p.capacity || 4,
              dataSource: 'LIVE_API',
              disclaimer: 'Live pricing returned from official Uber API.',
              bookingUrl: buildUberDeepLink(pickup, dropoff)
            }));
            resolve(results);
          } catch (e) {
            reject(new Error('Failed to parse Uber live response'));
          }
        } else {
          reject(new Error(`Uber live API returned status ${res.statusCode}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Uber live API request timed out'));
    });
    req.end();
  });
}

function generatePrototypeEstimates(pickup, dropoff, approxDistanceKm, approxDurationMins) {
  const dist = Math.max(0.5, approxDistanceKm);
  const duration = Math.max(2, approxDurationMins);

  const services = [
    {
      serviceName: 'Uber Moto',
      category: 'BIKE',
      baseFare: 25,
      perKm: 7.5,
      perMin: 1.0,
      capacity: 1,
      etaMins: 3,
      surge: 1.0
    },
    {
      serviceName: 'Uber Auto',
      category: 'AUTO',
      baseFare: 35,
      perKm: 11.0,
      perMin: 1.2,
      capacity: 3,
      etaMins: 4,
      surge: 1.0
    },
    {
      serviceName: 'Uber Go',
      category: 'CAB',
      baseFare: 65,
      perKm: 15.0,
      perMin: 2.0,
      capacity: 4,
      etaMins: 5,
      surge: 1.05
    },
    {
      serviceName: 'Uber Premier',
      category: 'PREMIUM',
      baseFare: 95,
      perKm: 19.5,
      perMin: 2.5,
      capacity: 4,
      etaMins: 7,
      surge: 1.08
    }
  ];

  return services.map((s) => {
    const distComponent = Math.round(dist * s.perKm);
    const timeComponent = Math.round(duration * s.perMin);
    const rawFare = (s.baseFare + dist * s.perKm + duration * s.perMin) * s.surge;
    const minFare = Math.round(rawFare * 0.95);
    const maxFare = Math.round(rawFare * 1.15);

    return {
      provider: 'Uber',
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
      disclaimer: 'Prototype Estimate based on calibrated regional tariff model. Live surge and driver availability subject to final confirmation in Uber app.',
      bookingUrl: buildUberDeepLink(pickup, dropoff),
      handoffNote: 'Handoff opens official Uber app/web with pre-filled coordinates',
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

function buildUberDeepLink(pickup, dropoff) {
  const pLat = encodeURIComponent(pickup.lat || '');
  const pLng = encodeURIComponent(pickup.lng || '');
  const pName = encodeURIComponent(pickup.address || 'Pickup');
  const dLat = encodeURIComponent(dropoff.lat || '');
  const dLng = encodeURIComponent(dropoff.lng || '');
  const dName = encodeURIComponent(dropoff.address || 'Destination');

  return `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${pLat}&pickup[longitude]=${pLng}&pickup[formatted_address]=${pName}&dropoff[latitude]=${dLat}&dropoff[longitude]=${dLng}&dropoff[formatted_address]=${dName}`;
}

function mapCategory(displayName) {
  const name = (displayName || '').toUpperCase();
  if (name.includes('MOTO') || name.includes('BIKE')) return 'BIKE';
  if (name.includes('AUTO')) return 'AUTO';
  if (name.includes('PREMIER') || name.includes('BLACK') || name.includes('EXEC')) return 'PREMIUM';
  return 'CAB';
}

module.exports = {
  getEstimates,
  buildUberDeepLink
};
