/**
 * Rapido Provider Adapter
 * 
 * Note: Rapido does not offer a self-serve public developer API for ride pricing.
 * In compliance with SIH truthfulness standards, this adapter operates in
 * PROTOTYPE_ESTIMATE mode using calibrated regional tariff models, and supplies
 * official web intent links for booking handoff.
 */

async function getEstimates({ pickup, dropoff, approxDistanceKm, approxDurationMins }) {
  return generatePrototypeEstimates(pickup, dropoff, approxDistanceKm, approxDurationMins);
}

function generatePrototypeEstimates(pickup, dropoff, approxDistanceKm, approxDurationMins) {
  const dist = Math.max(0.5, approxDistanceKm);
  const duration = Math.max(2, approxDurationMins);

  const services = [
    {
      serviceName: 'Rapido Bike Taxi',
      category: 'BIKE',
      baseFare: 18,
      perKm: 6.5,
      perMin: 0.9,
      capacity: 1,
      etaMins: 2,
      surge: 1.0
    },
    {
      serviceName: 'Rapido Auto',
      category: 'AUTO',
      baseFare: 30,
      perKm: 10.0,
      perMin: 1.1,
      capacity: 3,
      etaMins: 3,
      surge: 1.0
    },
    {
      serviceName: 'Rapido Economy Cab',
      category: 'CAB',
      baseFare: 55,
      perKm: 13.5,
      perMin: 1.6,
      capacity: 4,
      etaMins: 6,
      surge: 1.02
    }
  ];

  return services.map((s) => {
    const distComponent = Math.round(dist * s.perKm);
    const timeComponent = Math.round(duration * s.perMin);
    const rawFare = (s.baseFare + dist * s.perKm + duration * s.perMin) * s.surge;
    const minFare = Math.round(rawFare * 0.95);
    const maxFare = Math.round(rawFare * 1.15);

    return {
      provider: 'Rapido',
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
        : 'Standard luggage (2–3 trolley bags)',
      dataSource: 'PROTOTYPE_ESTIMATE',
      disclaimer: 'Prototype Estimate based on calibrated regional tariff model. Rapido operates without a public developer API. Final fares confirmed in Rapido app.',
      bookingUrl: buildRapidoDeepLink(pickup, dropoff),
      handoffNote: 'Opens official Rapido portal (coordinates require in-app confirmation)',
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

function buildRapidoDeepLink(pickup, dropoff) {
  const pName = encodeURIComponent(pickup.address || 'Pickup');
  const dName = encodeURIComponent(dropoff.address || 'Destination');
  return `https://rapido.bike/?pickup=${pName}&drop=${dName}`;
}

module.exports = {
  getEstimates,
  buildRapidoDeepLink
};
