// Ray-casting algorithm to test if a point (lat, lng) is inside a polygon [[lat, lng], [lat, lng], ...]
function isPointInPolygon(point, polygonCoordinates) {
  const x = point.lat;
  const y = point.lng;
  let inside = false;

  for (let i = 0, j = polygonCoordinates.length - 1; i < polygonCoordinates.length; j = i++) {
    const xi = polygonCoordinates[i][0];
    const yi = polygonCoordinates[i][1];
    const xj = polygonCoordinates[j][0];
    const yj = polygonCoordinates[j][1];

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

// Haversine distance in meters between two lat/lng coordinates
function getHaversineDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getHaversineDistance(lat1, lon1, lat2, lon2) {
  return getHaversineDistanceInMeters(lat1, lon1, lat2, lon2) / 1000; // in km
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

// Minimum distance in meters from a point to a line segment (p1 to p2)
function getDistanceToSegmentInMeters(point, p1, p2) {
  const x = point.lat;
  const y = point.lng;
  const x1 = p1[0];
  const y1 = p1[1];
  const x2 = p2[0];
  const y2 = p2[1];

  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  let param = -1;

  if (len_sq !== 0) param = dot / len_sq;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  return getHaversineDistanceInMeters(x, y, xx, yy);
}

// Minimum distance in meters from a point to polygon boundary
function getMinDistanceToPolygonInMeters(point, polygonCoordinates) {
  if (!polygonCoordinates || polygonCoordinates.length === 0) return Infinity;

  // Check if inside polygon
  if (isPointInPolygon(point, polygonCoordinates)) {
    return 0; // Inside polygon
  }

  let minDistance = Infinity;

  for (let i = 0, j = polygonCoordinates.length - 1; i < polygonCoordinates.length; j = i++) {
    const p1 = polygonCoordinates[i];
    const p2 = polygonCoordinates[j];
    const dist = getDistanceToSegmentInMeters(point, p1, p2);
    if (dist < minDistance) minDistance = dist;
  }

  return Math.round(minDistance);
}

// Distance in meters to a circle zone boundary
function getDistanceToCircleInMeters(point, circleCenter, radiusMeters) {
  const distToCenter = getHaversineDistanceInMeters(point.lat, point.lng, circleCenter.lat, circleCenter.lng);
  if (distToCenter <= radiusMeters) return 0; // Inside circle
  return Math.round(distToCenter - radiusMeters);
}

// Calculate minimum distance from a point to a route path
function getMinDistanceToRoute(point, routeWaypoints) {
  if (!routeWaypoints || routeWaypoints.length === 0) return 0;
  if (routeWaypoints.length === 1) {
    return getHaversineDistance(point.lat, point.lng, routeWaypoints[0].lat, routeWaypoints[0].lng);
  }

  let minDistance = Infinity;

  for (let i = 0; i < routeWaypoints.length - 1; i++) {
    const p1 = routeWaypoints[i];
    const p2 = routeWaypoints[i + 1];

    const d1 = getHaversineDistance(point.lat, point.lng, p1.lat, p1.lng);
    if (d1 < minDistance) minDistance = d1;

    const d2 = getHaversineDistance(point.lat, point.lng, p2.lat, p2.lng);
    if (d2 < minDistance) minDistance = d2;
  }

  return Math.round(minDistance * 100) / 100;
}

module.exports = {
  isPointInPolygon,
  getHaversineDistanceInMeters,
  getHaversineDistance,
  getMinDistanceToPolygonInMeters,
  getDistanceToCircleInMeters,
  getMinDistanceToRoute
};
