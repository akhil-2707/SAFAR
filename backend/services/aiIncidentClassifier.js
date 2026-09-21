/**
 * AI Incident Classifier & Severity Estimator
 * Analyzes incident text description, risk score, and telemetry signals to auto-classify category & priority severity.
 */
function classifyIncident(rawCategory, description = '', riskScore = 0, isSos = false) {
  const text = (description + ' ' + rawCategory).toLowerCase();

  let category = 'Other';
  let severity = 'MEDIUM';
  let confidence = 0.85;

  if (isSos || text.includes('sos') || text.includes('distress') || text.includes('panic')) {
    category = 'SOS Emergency';
    severity = 'CRITICAL';
    confidence = 0.98;
  } else if (text.includes('medical') || text.includes('heart') || text.includes('collapse') || text.includes('injury') || text.includes('bleeding')) {
    category = 'Medical Emergency';
    severity = riskScore > 60 ? 'CRITICAL' : 'HIGH';
    confidence = 0.94;
  } else if (text.includes('accident') || text.includes('crash') || text.includes('fall') || text.includes('vehicle')) {
    category = 'Accident';
    severity = 'HIGH';
    confidence = 0.91;
  } else if (text.includes('missing') || text.includes('lost') || text.includes('unreachable') || text.includes('disappeared')) {
    category = 'Missing Tourist';
    severity = 'HIGH';
    confidence = 0.89;
  } else if (text.includes('geo-fence') || text.includes('geofence') || text.includes('restricted') || text.includes('boundary') || text.includes('forbidden')) {
    category = 'Geo-fence Violation';
    severity = riskScore >= 75 ? 'HIGH' : 'MEDIUM';
    confidence = 0.96;
  } else if (text.includes('landslide') || text.includes('flood') || text.includes('storm') || text.includes('hazard') || text.includes('earthquake')) {
    category = 'Natural Hazard';
    severity = 'HIGH';
    confidence = 0.92;
  } else if (text.includes('suspicious') || text.includes('deviation') || text.includes('stall') || text.includes('unusual')) {
    category = 'Suspicious Movement';
    severity = riskScore > 50 ? 'MEDIUM' : 'LOW';
    confidence = 0.87;
  }

  // Adjust severity by risk score threshold if not explicitly critical
  if (riskScore >= 80) {
    severity = 'CRITICAL';
  } else if (riskScore >= 60 && severity === 'LOW') {
    severity = 'HIGH';
  }

  return {
    category,
    severity,
    confidence,
    aiAnalysis: `Auto-classified as ${category} (${severity} Severity) with ${(confidence * 100).toFixed(0)}% AI confidence.`
  };
}

module.exports = {
  classifyIncident
};
