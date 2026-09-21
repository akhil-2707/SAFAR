const { dbStore } = require('../config/db');
const {
  isPointInPolygon,
  getMinDistanceToPolygonInMeters,
  getDistanceToCircleInMeters
} = require('../utils/geoFenceUtils');

function getGeoFences(req, res) {
  const geofences = dbStore.get('geofences');
  return res.json({ success: true, count: geofences.length, geofences });
}

function createGeoFence(req, res) {
  try {
    const {
      name,
      type, // 'SAFE' | 'CAUTION' | 'HIGH_RISK' | 'RESTRICTED'
      riskLevel, // 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
      description,
      shape, // 'POLYGON' | 'CIRCLE' | 'RECTANGLE'
      center,
      radiusMeters,
      coordinates,
      warningDistance,
      alertMessage,
      active,
      createdBy
    } = req.body;

    if (!name || !type) {
      return res.status(400).json({ success: false, error: 'Zone Name and Type required' });
    }

    const defaultColors = {
      SAFE: { color: '#10B981', strokeColor: '#059669' },
      CAUTION: { color: '#F59E0B', strokeColor: '#D97706' },
      HIGH_RISK: { color: '#F97316', strokeColor: '#EA580C' },
      RESTRICTED: { color: '#EF4444', strokeColor: '#DC2626' }
    };

    const colorConfig = defaultColors[type] || defaultColors.SAFE;
    const finalCoords = coordinates || [];
    const finalCenter = center || (finalCoords.length ? { lat: finalCoords[0][0], lng: finalCoords[0][1] } : { lat: 26.1445, lng: 91.7362 });
    const finalRadius = radiusMeters ? parseInt(radiusMeters) : 500;

    // Standard GeoJSON Feature Structure
    let geoJsonGeometry = null;
    if (shape === 'CIRCLE') {
      geoJsonGeometry = {
        type: 'Point',
        coordinates: [finalCenter.lng, finalCenter.lat]
      };
    } else {
      // GeoJSON polygon expects array of [lng, lat] rings
      const geoJsonRing = finalCoords.map((c) => [c[1], c[0]]);
      if (geoJsonRing.length > 0 && (geoJsonRing[0][0] !== geoJsonRing[geoJsonRing.length - 1][0] || geoJsonRing[0][1] !== geoJsonRing[geoJsonRing.length - 1][1])) {
        geoJsonRing.push(geoJsonRing[0]); // Close polygon loop
      }
      geoJsonGeometry = {
        type: 'Polygon',
        coordinates: [geoJsonRing]
      };
    }

    const geoJsonFeature = {
      type: 'Feature',
      geometry: geoJsonGeometry,
      properties: {
        name,
        type,
        riskLevel: riskLevel || (type === 'RESTRICTED' ? 'CRITICAL' : type === 'HIGH_RISK' ? 'HIGH' : 'MEDIUM'),
        warningDistance: warningDistance ? parseInt(warningDistance) : 300,
        alertMessage: alertMessage || `Notice: Entering ${name}.`,
        radiusMeters: finalRadius
      }
    };

    const newFence = dbStore.insert('geofences', {
      id: `gf_${Date.now().toString().slice(-6)}`,
      name,
      type: type || 'RESTRICTED',
      riskLevel: riskLevel || (type === 'RESTRICTED' ? 'CRITICAL' : type === 'HIGH_RISK' ? 'HIGH' : 'MEDIUM'),
      description: description || `${type} Zone`,
      shape: shape || 'POLYGON',
      center: finalCenter,
      radiusMeters: finalRadius,
      coordinates: finalCoords,
      geoJson: geoJsonFeature,
      warningDistance: warningDistance ? parseInt(warningDistance) : 300,
      alertMessage: alertMessage || `Notice: Entering ${name}.`,
      active: active !== undefined ? active : true,
      color: colorConfig.color,
      strokeColor: colorConfig.strokeColor,
      createdBy: createdBy || 'Authority Operations Desk',
      createdAt: new Date().toISOString()
    });

    return res.status(201).json({
      success: true,
      message: `GeoJSON Geo-fence Zone "${name}" created successfully!`,
      geofence: newFence
    });
  } catch (err) {
    console.error('Create GeoFence Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create geo-fence zone' });
  }
}

function updateGeoFence(req, res) {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    const existing = dbStore.findOne('geofences', (g) => g.id === id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Geo-fence zone not found' });
    }

    if (updateFields.type) {
      const defaultColors = {
        SAFE: { color: '#10B981', strokeColor: '#059669' },
        CAUTION: { color: '#F59E0B', strokeColor: '#D97706' },
        HIGH_RISK: { color: '#F97316', strokeColor: '#EA580C' },
        RESTRICTED: { color: '#EF4444', strokeColor: '#DC2626' }
      };
      const col = defaultColors[updateFields.type] || defaultColors.SAFE;
      updateFields.color = col.color;
      updateFields.strokeColor = col.strokeColor;
    }

    const updated = dbStore.update('geofences', id, updateFields);

    return res.json({
      success: true,
      message: `Geo-fence Zone updated successfully!`,
      geofence: updated
    });
  } catch (err) {
    console.error('Update GeoFence Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update geo-fence zone' });
  }
}

function deleteGeoFence(req, res) {
  try {
    const { id } = req.params;
    const deleted = dbStore.remove('geofences', id);

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Geo-fence zone not found' });
    }

    return res.json({ success: true, message: `Geo-fence zone deleted successfully` });
  } catch (err) {
    console.error('Delete GeoFence Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete geo-fence zone' });
  }
}

function checkLocationProximity(req, res) {
  const { lat, lng } = req.body;
  const point = { lat: parseFloat(lat), lng: parseFloat(lng) };
  const geofences = dbStore.get('geofences').filter((f) => f.active !== false);

  let containingZone = null;
  let nearestZone = null;
  let minDistance = Infinity;

  for (const fence of geofences) {
    let dist = Infinity;
    if (fence.shape === 'CIRCLE' && fence.center && fence.radiusMeters) {
      dist = getDistanceToCircleInMeters(point, fence.center, fence.radiusMeters);
    } else if (fence.coordinates && fence.coordinates.length) {
      dist = getMinDistanceToPolygonInMeters(point, fence.coordinates);
    }

    if (dist === 0) {
      containingZone = fence;
      break;
    } else if (dist < minDistance) {
      minDistance = dist;
      nearestZone = fence;
    }
  }

  return res.json({
    success: true,
    containingZone,
    nearestZone,
    distanceMeters: minDistance === Infinity ? null : minDistance
  });
}

module.exports = {
  getGeoFences,
  createGeoFence,
  updateGeoFence,
  deleteGeoFence,
  checkLocationProximity
};
