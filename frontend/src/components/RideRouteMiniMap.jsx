import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin, Compass, Info } from 'lucide-react';

// Custom lightweight SVG pins for Pickup and Dropoff
const createMapPinIcon = (color, labelText) => {
  const svgHtml = `
    <div style="position: relative; width: 32px; height: 42px; display: flex; flex-direction: column; align-items: center;">
      <svg viewBox="0 0 24 24" fill="${color}" width="32" height="32" style="filter: drop-shadow(0px 2px 5px rgba(0,0,0,0.35));">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
      <span style="position: absolute; bottom: 0; font-size: 9px; font-weight: 900; background: white; color: #1e293b; padding: 1px 4px; border-radius: 4px; border: 0.5px solid #cbd5e1; box-shadow: 0 1px 3px rgba(0,0,0,0.1); white-space: nowrap;">
        ${labelText}
      </span>
    </div>
  `;
  return L.divIcon({
    className: '',
    html: svgHtml,
    iconSize: [32, 42],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30]
  });
};

// Helper to calculate straight-line Haversine distance on client
function computeClientHaversineKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// Helper component to auto-fit map bounds to both pickup & dropoff
function BoundsFitter({ pickup, dropoff }) {
  const map = useMap();

  useEffect(() => {
    if (pickup?.lat && pickup?.lng && dropoff?.lat && dropoff?.lng) {
      const bounds = L.latLngBounds(
        [pickup.lat, pickup.lng],
        [dropoff.lat, dropoff.lng]
      );
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [map, pickup?.lat, pickup?.lng, dropoff?.lat, dropoff?.lng]);

  return null;
}

export default function RideRouteMiniMap({
  pickup,
  dropoff,
  directDistanceKm,
  approxDistanceKm,
  approxDurationMins,
  summary
}) {
  if (!pickup?.lat || !pickup?.lng || !dropoff?.lat || !dropoff?.lng) {
    return null;
  }

  // Client-side baseline calculations from coordinates when server summary is not yet available
  const clientDirectKm = computeClientHaversineKm(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
  const clientApproxDist = clientDirectKm != null ? Number((clientDirectKm * 1.3).toFixed(1)) : null;
  const clientApproxDur = clientApproxDist != null ? Math.max(3, Math.round((clientApproxDist / 25) * 60 + 3)) : null;

  const resolvedDirectDist = directDistanceKm != null
    ? directDistanceKm
    : (summary?.directDistanceKm != null ? summary.directDistanceKm : clientDirectKm);

  const resolvedApproxDist = approxDistanceKm != null
    ? approxDistanceKm
    : (summary?.approxDistanceKm != null ? summary.approxDistanceKm : clientApproxDist);

  const resolvedApproxDuration = approxDurationMins != null
    ? approxDurationMins
    : (summary?.approxDurationMins != null ? summary.approxDurationMins : clientApproxDur);

  const pickupPos = [pickup.lat, pickup.lng];
  const dropoffPos = [dropoff.lat, dropoff.lng];
  const center = [(pickup.lat + dropoff.lat) / 2, (pickup.lng + dropoff.lng) / 2];

  const pickupIcon = createMapPinIcon('#10b981', 'Pickup');
  const dropoffIcon = createMapPinIcon('#f59e0b', 'Drop');

  return (
    <div className="rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm bg-white/95 space-y-2.5 p-3.5 sm:p-4 backdrop-blur-md">
      
      {/* Top Map Header & Non-Navigation Truthfulness Pill */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-1 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-black text-slate-800 tracking-tight">
            Transit Route Directional Overview
          </span>
        </div>

        <div className="flex items-center space-x-1.5 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          <Info className="w-3 h-3 text-slate-500" />
          <span>Estimated Route — Not Live Navigation</span>
        </div>
      </div>

      {/* Leaflet Map Preview */}
      <div className="h-48 sm:h-56 w-full rounded-2xl overflow-hidden relative z-0 border border-slate-200/80 shadow-inner">
        <MapContainer
          center={center}
          zoom={12}
          scrollWheelZoom={false}
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <BoundsFitter pickup={pickup} dropoff={dropoff} />

          {/* Pickup Marker */}
          <Marker position={pickupPos} icon={pickupIcon}>
            <Popup>
              <div className="text-xs font-semibold p-1">
                <strong className="text-emerald-700 block">Pickup Location</strong>
                <span>{pickup.address}</span>
              </div>
            </Popup>
          </Marker>

          {/* Dropoff Marker */}
          <Marker position={dropoffPos} icon={dropoffIcon}>
            <Popup>
              <div className="text-xs font-semibold p-1">
                <strong className="text-amber-700 block">Destination Point</strong>
                <span>{dropoff.address}</span>
              </div>
            </Popup>
          </Marker>

          {/* Dashed directional corridor line */}
          <Polyline
            positions={[pickupPos, dropoffPos]}
            pathOptions={{
              color: '#0A84FF',
              weight: 3.5,
              dashArray: '6, 8',
              opacity: 0.85
            }}
          />
        </MapContainer>
      </div>

      {/* Distance & Travel Time Approximation Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Direct Distance
          </span>
          <span className="text-sm font-black font-mono text-slate-700">
            {resolvedDirectDist != null ? `${resolvedDirectDist} km` : '—'}
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5">Straight-line Haversine</span>
        </div>

        <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-center">
          <span className="text-[10px] uppercase font-bold text-blue-600 block tracking-wider">
            Estimated Route Distance
          </span>
          <span className="text-sm font-black font-mono text-blue-950">
            {resolvedApproxDist != null ? `~${resolvedApproxDist} km` : '—'}
          </span>
          <span className="text-[9px] text-blue-500 block mt-0.5">1.3x road network approximation</span>
        </div>

        <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-center">
          <span className="text-[10px] uppercase font-bold text-amber-700 block tracking-wider">
            Approximate Travel Time
          </span>
          <span className="text-sm font-black font-mono text-amber-950">
            {resolvedApproxDuration != null ? `~${resolvedApproxDuration} mins` : '—'}
          </span>
          <span className="text-[9px] text-amber-600 block mt-0.5">25 km/h nominal speed benchmark</span>
        </div>
      </div>

    </div>
  );
}
