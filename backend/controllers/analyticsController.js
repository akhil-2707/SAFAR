const { dbStore } = require('../config/db');

function getAnalytics(req, res) {
  const tourists = dbStore.get('tourists');
  const incidents = dbStore.get('incidents');
  const geofences = dbStore.get('geofences');

  // KPI Overview Cards
  const totalTourists = tourists.length;
  const touristsAtRisk = tourists.filter((t) => t.riskScore > 50 || t.riskLevel === 'HIGH' || t.riskLevel === 'CRITICAL').length;
  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED').length;
  const resolvedIncidents = incidents.filter((i) => i.status === 'RESOLVED').length;
  const sosAlerts = incidents.filter((i) => i.type === 'SOS Emergency' || i.severity === 'CRITICAL').length;
  const geofenceViolations = incidents.filter((i) => i.type === 'Geo-fence Violation').length;

  // Tourist Risk Level Distribution
  const riskDistribution = [
    { name: 'LOW 🟢', value: tourists.filter((t) => t.riskLevel === 'LOW').length, color: '#10B981' },
    { name: 'MEDIUM 🟡', value: tourists.filter((t) => t.riskLevel === 'MEDIUM').length, color: '#F59E0B' },
    { name: 'HIGH 🟠', value: tourists.filter((t) => t.riskLevel === 'HIGH').length, color: '#F97316' },
    { name: 'CRITICAL 🔴', value: tourists.filter((t) => t.riskLevel === 'CRITICAL').length, color: '#EF4444' }
  ];

  // Incidents by Type
  const incidentTypesMap = {};
  incidents.forEach((i) => {
    incidentTypesMap[i.type] = (incidentTypesMap[i.type] || 0) + 1;
  });
  const incidentsByType = Object.keys(incidentTypesMap).map((type) => ({
    type,
    count: incidentTypesMap[type]
  }));

  // Incidents by Severity
  const incidentsBySeverity = [
    { severity: 'CRITICAL', count: incidents.filter((i) => i.severity === 'CRITICAL').length, color: '#EF4444' },
    { severity: 'HIGH', count: incidents.filter((i) => i.severity === 'HIGH').length, color: '#F97316' },
    { severity: 'MEDIUM', count: incidents.filter((i) => i.severity === 'MEDIUM').length, color: '#F59E0B' },
    { severity: 'LOW', count: incidents.filter((i) => i.severity === 'LOW').length, color: '#10B981' }
  ];

  // Daily Trend (Last 7 days demo curve)
  const dailyTrend = [
    { day: 'Mon', incidents: 3, sos: 1, resolved: 3 },
    { day: 'Tue', incidents: 5, sos: 2, resolved: 4 },
    { day: 'Wed', incidents: 2, sos: 0, resolved: 2 },
    { day: 'Thu', incidents: 7, sos: 3, resolved: 6 },
    { day: 'Fri', incidents: 4, sos: 1, resolved: 4 },
    { day: 'Sat', incidents: 8, sos: 4, resolved: 7 },
    { day: 'Sun (Today)', incidents: incidents.length, sos: sosAlerts, resolved: resolvedIncidents }
  ];

  return res.json({
    success: true,
    overview: {
      totalTourists,
      touristsAtRisk,
      activeIncidents,
      resolvedIncidents,
      sosAlerts,
      geofenceViolations,
      avgResponseTimeMinutes: 3.8
    },
    riskDistribution,
    incidentsByType,
    incidentsBySeverity,
    dailyTrend
  });
}

module.exports = {
  getAnalytics
};
