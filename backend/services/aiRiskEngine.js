const {
  isPointInPolygon,
  getMinDistanceToPolygonInMeters,
  getDistanceToCircleInMeters,
  getMinDistanceToRoute
} = require('../utils/geoFenceUtils');

/**
 * Explainable AI Tourist Risk Scoring Engine (Upgraded)
 * Computes transparent, weighted risk score (0-100), pre-entry proximity alerts, and safety diagnostics.
 */
function calculateTouristRisk(tourist, geofences = [], plannedTrip = null) {
  let baseScore = 0;
  const contributingFactors = [];
  const detectedAnomalies = [];
  const recommendedActions = [];
  let proximityWarning = null; // { tier: 'APPROACH' | 'IMMINENT' | 'BREACH', zoneName, distanceMeters, message }

  const currentLat = tourist.currentLocation?.lat || 26.1445;
  const currentLng = tourist.currentLocation?.lng || 91.7362;
  const currentPoint = { lat: currentLat, lng: currentLng };

  // 1. SOS Trigger Evaluation
  if (tourist.isSosActive || tourist.status === 'CRITICAL_SOS') {
    baseScore += 65;
    contributingFactors.push({
      factor: 'SOS Activation',
      weight: 65,
      description: 'Emergency SOS signal actively triggered by tourist'
    });
    detectedAnomalies.push('ACTIVE SOS EMERGENCY SIGNAL DISPATCHED');
    recommendedActions.push('Immediate police and emergency medical dispatch required');
  }

  // 2. Geo-Fence Containment & Pre-Entry Proximity Analysis
  let currentZone = null;
  let nearestHazardZone = null;
  let minProximityMeters = Infinity;

  // Active geo-fences only
  const activeFences = geofences.filter((f) => f.active !== false);

  for (const fence of activeFences) {
    let distanceMeters = Infinity;

    if (fence.shape === 'CIRCLE' && fence.center && fence.radiusMeters) {
      distanceMeters = getDistanceToCircleInMeters(currentPoint, fence.center, fence.radiusMeters);
    } else if (fence.coordinates && fence.coordinates.length > 0) {
      distanceMeters = getMinDistanceToPolygonInMeters(currentPoint, fence.coordinates);
    }

    if (distanceMeters === 0) {
      currentZone = fence;
    } else if (fence.type === 'RESTRICTED' || fence.type === 'HIGH_RISK' || fence.type === 'CAUTION') {
      if (distanceMeters < minProximityMeters) {
        minProximityMeters = distanceMeters;
        nearestHazardZone = { fence, distanceMeters };
      }
    }
  }

  // Inside a Zone
  if (currentZone) {
    if (currentZone.type === 'HIGH_RISK') {
      baseScore += 55;
      contributingFactors.push({
        factor: 'High-Risk Zone Containment',
        weight: 55,
        description: `Tourist inside High-Risk Zone: ${currentZone.name}`
      });
      detectedAnomalies.push(`Unauthorized entry into high-hazard zone (${currentZone.name})`);
      recommendedActions.push('Alert local authority patrol and issue urgent turn-back navigation');
      proximityWarning = {
        tier: 'BREACH',
        severity: 'CRITICAL',
        zoneName: currentZone.name,
        distanceMeters: 0,
        message: currentZone.alertMessage || `🔴 HIGH RISK ZONE ENTRY: You have entered ${currentZone.name}.`
      };
    } else if (currentZone.type === 'RESTRICTED') {
      baseScore += 45;
      contributingFactors.push({
        factor: 'Restricted Zone Breach',
        weight: 45,
        description: `Tourist inside Restricted/No-Entry Zone: ${currentZone.name}`
      });
      detectedAnomalies.push(`Permit/Security boundary breach detected in ${currentZone.name}`);
      recommendedActions.push('Verify tourist permit status and issue zone exit notification');
      proximityWarning = {
        tier: 'BREACH',
        severity: 'CRITICAL',
        zoneName: currentZone.name,
        distanceMeters: 0,
        message: currentZone.alertMessage || `🔴 NO ENTRY — RESTRICTED ZONE: You have entered ${currentZone.name}.`
      };
    } else if (currentZone.type === 'CAUTION') {
      baseScore += 20;
      contributingFactors.push({
        factor: 'Caution Area Presence',
        weight: 20,
        description: `Tourist navigating in Caution Zone: ${currentZone.name}`
      });
      recommendedActions.push('Maintain automated geo-tracking monitoring');
      proximityWarning = {
        tier: 'BREACH',
        severity: 'MEDIUM',
        zoneName: currentZone.name,
        distanceMeters: 0,
        message: currentZone.alertMessage || `🟡 CAUTION ZONE: You are in ${currentZone.name}. Proceed with care.`
      };
    } else if (currentZone.type === 'SAFE') {
      contributingFactors.push({
        factor: 'Safe Zone Verified',
        weight: 0,
        description: `Tourist within verified Safe Tourism Corridor: ${currentZone.name}`
      });
    }
  } 
  // Outside Zone, but Approaching Hazard Zone (Pre-Entry Proximity Detection)
  else if (nearestHazardZone) {
    const { fence, distanceMeters } = nearestHazardZone;
    const warningLimit = fence.warningDistance || 300;

    if (distanceMeters <= warningLimit) {
      if (distanceMeters <= 100) {
        // Imminent Warning (0m - 100m)
        const weight = fence.type === 'RESTRICTED' || fence.type === 'HIGH_RISK' ? 35 : 20;
        baseScore += weight;
        contributingFactors.push({
          factor: `${fence.name} Imminent Proximity (${distanceMeters}m)`,
          weight,
          description: `Tourist is ${distanceMeters}m away from ${fence.name} boundary`
        });
        detectedAnomalies.push(`Imminent hazard entry: ${distanceMeters}m from ${fence.name}`);
        recommendedActions.push(`Issue turn-back warning for ${fence.name}`);

        proximityWarning = {
          tier: 'IMMINENT',
          severity: 'HIGH',
          zoneName: fence.name,
          distanceMeters,
          message: `🟠 HIGH RISK AREA APPROACHING: You are approximately ${distanceMeters}m away from ${fence.name}.`
        };
      } else {
        // Approach Warning (100m - warningLimit)
        const weight = fence.type === 'RESTRICTED' || fence.type === 'HIGH_RISK' ? 20 : 10;
        baseScore += weight;
        contributingFactors.push({
          factor: `${fence.name} Approach Warning (${distanceMeters}m)`,
          weight,
          description: `Tourist approaching ${fence.name} (${distanceMeters}m away)`
        });
        detectedAnomalies.push(`Approaching dangerous zone (${distanceMeters}m to ${fence.name})`);

        proximityWarning = {
          tier: 'APPROACH',
          severity: 'MEDIUM',
          zoneName: fence.name,
          distanceMeters,
          message: `🟡 RESTRICTED AREA AHEAD: You are approximately ${distanceMeters}m away from ${fence.name}.`
        };
      }
    }
  }

  // 3. Trip Route Deviation Analysis
  if (plannedTrip && plannedTrip.routeWaypoints && plannedTrip.routeWaypoints.length > 0) {
    const devDistance = getMinDistanceToRoute(currentPoint, plannedTrip.routeWaypoints);
    if (devDistance > 5.0) {
      baseScore += 35;
      contributingFactors.push({
        factor: 'Major Route Deviation',
        weight: 35,
        description: `Tourist strays ${devDistance} km away from planned itinerary route`
      });
      detectedAnomalies.push(`Off-route anomaly: ${devDistance} km offset from registered path`);
      recommendedActions.push('Contact tourist emergency contact to confirm location intention');
    } else if (devDistance > 2.0) {
      baseScore += 20;
      contributingFactors.push({
        factor: 'Moderate Route Deviation',
        weight: 20,
        description: `Tourist is ${devDistance} km offset from registered route`
      });
      detectedAnomalies.push(`Route deviation detected (${devDistance} km)`);
    }
  }

  // 4. Time of Day Hazard Assessment (Night Hours 22:00 to 05:00)
  const currentHour = new Date().getHours();
  const isNightTime = currentHour >= 22 || currentHour < 5;
  if (isNightTime && (currentZone?.type === 'RESTRICTED' || currentZone?.type === 'HIGH_RISK' || !currentZone)) {
    baseScore += 15;
    contributingFactors.push({
      factor: 'Nocturnal Wilderness Movement',
      weight: 15,
      description: 'Travel detected during high-risk night hours in isolated area'
    });
    detectedAnomalies.push('Late-night movement anomaly in restricted terrain');
  }

  // Cap risk score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, Math.round(baseScore)));

  // Categorize Risk Level
  let level = 'LOW';
  if (finalScore >= 76) {
    level = 'CRITICAL';
    if (!recommendedActions.includes('Immediate police dispatch recommended')) {
      recommendedActions.unshift('Immediate emergency response team dispatch');
    }
  } else if (finalScore >= 51) {
    level = 'HIGH';
    if (recommendedActions.length === 0) {
      recommendedActions.push('Escalate to active monitoring desk');
    }
  } else if (finalScore >= 31) {
    level = 'MEDIUM';
    if (recommendedActions.length === 0) {
      recommendedActions.push('Send advisory safety notification to tourist app');
    }
  } else {
    level = 'LOW';
    if (recommendedActions.length === 0) {
      recommendedActions.push('Standard monitoring - Safe journey');
    }
  }

  return {
    score: finalScore,
    level,
    zone: currentZone ? currentZone.name : nearestHazardZone ? `Near ${nearestHazardZone.fence.name}` : 'Unmapped Area',
    zoneType: currentZone ? currentZone.type : 'UNMAPPED',
    proximityWarning,
    contributingFactors,
    detectedAnomalies,
    recommendedActions,
    lastEvaluatedAt: new Date().toISOString()
  };
}

module.exports = {
  calculateTouristRisk
};
