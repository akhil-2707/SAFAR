import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;

const createMiniIcon = (color) => {
  const svgHtml = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="24" height="24" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `;
  return L.divIcon({
    html: svgHtml,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -20]
  });
};

export default function MiniMap({
  center = { lat: 26.1445, lng: 91.7362 },
  zoom = 11,
  height = "160px",
  geofences = [],
  title = "Location Preview",
  markerColor = "#10B981"
}) {
  const lat = (typeof center?.lat === 'number') ? center.lat : (Array.isArray(center) && typeof center[0] === 'number' ? center[0] : 26.1445);
  const lng = (typeof center?.lng === 'number') ? center.lng : (Array.isArray(center) && typeof center[1] === 'number' ? center[1] : 91.7362);

  return (
    <div className="w-full relative rounded-xl overflow-hidden border border-gray-200 shadow-md">
      <div className="absolute top-2 left-2 z-20 bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-bold text-gray-800 border border-gray-200 shadow-sm">
        📍 {title}
      </div>
      <div style={{ height }}>
        <MapContainer
          center={[lat, lng]}
          zoom={zoom}
          maxZoom={22}
          scrollWheelZoom={false}
          dragging={true}
          zoomControl={false}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; Google Maps HD'
            url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            maxZoom={22}
            maxNativeZoom={20}
          />

          {Array.isArray(geofences) && geofences.map((gf) => {
            if (!gf) return null;

            // Render Circle geofences (e.g. Taj Mahal heritage perimeter or danger areas)
            if (gf.shape === 'CIRCLE' || (!gf.coordinates?.length && gf.center && gf.radiusMeters)) {
              const cLat = typeof gf.center?.lat === 'number' ? gf.center.lat : (Array.isArray(gf.center) ? gf.center[0] : null);
              const cLng = typeof gf.center?.lng === 'number' ? gf.center.lng : (Array.isArray(gf.center) ? gf.center[1] : null);
              if (cLat == null || cLng == null) return null;
              const radius = gf.radiusMeters || 500;

              return (
                <Circle
                  key={gf.id || Math.random()}
                  center={[cLat, cLng]}
                  radius={radius}
                  pathOptions={{
                    color: gf.strokeColor || gf.color || '#EF4444',
                    fillColor: gf.color || '#EF4444',
                    fillOpacity: 0.25,
                    weight: 1.5
                  }}
                />
              );
            }

            // Render Polygon geofences safely with validated coordinates
            if (Array.isArray(gf.coordinates) && gf.coordinates.length >= 3) {
              const validPoints = gf.coordinates.filter(
                (pt) => Array.isArray(pt) && pt.length >= 2 && typeof pt[0] === 'number' && typeof pt[1] === 'number'
              );
              if (validPoints.length < 3) return null;

              return (
                <Polygon
                  key={gf.id || Math.random()}
                  positions={validPoints}
                  pathOptions={{
                    color: gf.strokeColor || gf.color || '#10B981',
                    fillColor: gf.color || '#10B981',
                    fillOpacity: 0.2,
                    weight: 1.5
                  }}
                />
              );
            }

            return null;
          })}

          <Marker position={[lat, lng]} icon={createMiniIcon(markerColor)}>
            <Popup>
              <span className="text-xs font-bold text-gray-900">Target Location</span>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
