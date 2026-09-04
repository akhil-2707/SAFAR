import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ShieldCheck, AlertTriangle, Phone, ExternalLink, Layers, Eye, EyeOff, Maximize2, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

delete L.Icon.Default.prototype._getIconUrl;

const createCustomIcon = (color, isSos = false) => {
  const svgHtml = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="34" height="34" style="filter: drop-shadow(0px 3px 6px rgba(0,0,0,0.6)); transition: transform 0.5s ease-in-out;">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `;
  return L.divIcon({
    className: isSos ? 'sos-radar-animation' : '',
    html: svgHtml,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -30]
  });
};

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.flyTo([center.lat, center.lng], map.getZoom(), { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

export default function MapView({
  tourists = [],
  geofences = [],
  selectedTourist = null,
  plannedRoute = null,
  emergencyServices = [],
  height = "500px"
}) {
  const [mapProvider, setMapProvider] = useState('google_satellite');
  const [showZones, setShowZones] = useState(true);
  const [showServices, setShowServices] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeGeofences = geofences.filter((f) => f.active !== false);
  const defaultCenter = selectedTourist?.currentLocation || { lat: 26.1445, lng: 91.7362 };

  // Map Provider Tile Configurations for High Zoom Resolution
  const tileProviders = {
    google_satellite: {
      url: "https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps Satellite HD',
      maxZoom: 22,
      maxNativeZoom: 20
    },
    google_streets: {
      url: "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps Streets',
      maxZoom: 22,
      maxNativeZoom: 20
    },
    carto_dark: {
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      subdomains: ['a', 'b', 'c', 'd'],
      attribution: '&copy; CARTO Dark Cyberpunk',
      maxZoom: 22,
      maxNativeZoom: 19
    },
    carto_voyager: {
      url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      subdomains: ['a', 'b', 'c', 'd'],
      attribution: '&copy; CARTO Voyager',
      maxZoom: 22,
      maxNativeZoom: 19
    }
  };

  const currentProvider = tileProviders[mapProvider] || tileProviders.google_satellite;

  return (
    <div
      style={{ height: isFullscreen ? '100vh' : height }}
      className={`w-full relative rounded-xl overflow-hidden shadow-2xl border border-slate-800 transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* Map Control Bar Overlay */}
      <div className="absolute top-3 right-3 z-20 flex flex-wrap items-center gap-1.5 bg-navy-900/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-xl text-xs">
        
        {/* Map Layer Switcher */}
        <select
          value={mapProvider}
          onChange={(e) => setMapProvider(e.target.value)}
          className="bg-slate-800/90 text-emerald-300 font-bold px-2 py-1 rounded-lg border border-slate-600 focus:outline-none focus:border-emerald-500 cursor-pointer text-xs"
        >
          <option value="google_satellite">🛰️ Google Satellite (Ultra HD Zoom)</option>
          <option value="google_streets">🗺️ Google Streets (High Detail)</option>
          <option value="carto_dark">🌙 Dark Cyberpunk Mode</option>
          <option value="carto_voyager">🌐 CARTO Voyager Map</option>
        </select>

        <button
          onClick={() => setShowZones(!showZones)}
          className={`p-1.5 rounded-lg flex items-center space-x-1 font-semibold transition-colors ${
            showZones ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
          }`}
          title="Toggle Zones"
        >
          {showZones ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">Zones</span>
        </button>

        <button
          onClick={() => setShowServices(!showServices)}
          className={`p-1.5 rounded-lg flex items-center space-x-1 font-semibold transition-colors ${
            showServices ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-slate-400 hover:text-white'
          }`}
          title="Toggle Services"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Help</span>
        </button>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-20 bg-navy-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-800 shadow-lg text-[10px] space-y-1">
        <div className="flex items-center justify-between border-b border-slate-800 pb-0.5 space-x-2">
          <span className="font-bold text-slate-300 block">Map Engine: <span className="text-emerald-400">Max Zoom 22 HD</span></span>
        </div>
        <div className="flex items-center space-x-3 text-slate-300">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Safe</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Caution</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span>High Risk</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span>Restricted</span>
          </span>
        </div>
      </div>

      <MapContainer
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={12}
        maxZoom={22}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <MapRecenter center={defaultCenter} />

        <TileLayer
          key={mapProvider}
          attribution={currentProvider.attribution}
          url={currentProvider.url}
          subdomains={currentProvider.subdomains}
          maxZoom={currentProvider.maxZoom}
          maxNativeZoom={currentProvider.maxNativeZoom}
        />

        {/* Geo-Fence Polygons & Circular Danger Zones */}
        {showZones &&
          activeGeofences.map((gf) => {
            // If the zone is a Circle or has a center with radius
            if (gf.shape === 'CIRCLE' || (!gf.coordinates?.length && gf.center && gf.radiusMeters)) {
              const centerLat = gf.center?.lat ?? (Array.isArray(gf.center) ? gf.center[0] : 26.1445);
              const centerLng = gf.center?.lng ?? (Array.isArray(gf.center) ? gf.center[1] : 91.7362);
              const radius = gf.radiusMeters || 500;
              return (
                <Circle
                  key={gf.id}
                  center={[centerLat, centerLng]}
                  radius={radius}
                  pathOptions={{
                    color: gf.strokeColor || gf.color || '#EF4444',
                    fillColor: gf.color || '#EF4444',
                    fillOpacity: 0.28,
                    weight: 2.5,
                    dashArray: gf.type === 'RESTRICTED' ? '6, 6' : undefined
                  }}
                >
                  <Popup>
                    <div className="p-1.5 space-y-1 min-w-[190px]">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: gf.color || '#EF4444' }}
                        />
                        <span className="font-bold text-sm text-slate-100">{gf.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] pt-1">
                        <span className="font-bold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">
                          {gf.type} • {gf.riskLevel || 'HIGH'}
                        </span>
                        <span className="font-mono text-cyan-400 font-bold">
                          Radius: {radius >= 1000 ? `${(radius / 1000).toFixed(1)} km` : `${radius}m`}
                        </span>
                      </div>
                      {gf.alertMessage && (
                        <p className="text-[11px] text-red-300 bg-red-950/60 p-1.5 rounded border border-red-500/30 mt-1">
                          ⚠️ {gf.alertMessage}
                        </p>
                      )}
                    </div>
                  </Popup>
                </Circle>
              );
            }

            if (!gf.coordinates || !gf.coordinates.length) return null;

            return (
              <Polygon
                key={gf.id}
                positions={gf.coordinates}
                pathOptions={{
                  color: gf.strokeColor || gf.color,
                  fillColor: gf.color,
                  fillOpacity: 0.25,
                  weight: 2
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1">
                    <div className="flex items-center space-x-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: gf.color }}
                      />
                      <span className="font-bold text-sm text-slate-100">{gf.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {gf.type}
                      </span>
                      <span className="text-[10px] text-amber-400 font-semibold">
                        Warn: {gf.warningDistance || 300}m
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{gf.description}</p>
                  </div>
                </Popup>
              </Polygon>
            );
          })}

        {/* Planned Route Polyline */}
        {plannedRoute && plannedRoute.routeWaypoints && plannedRoute.routeWaypoints.length > 1 && (
          <Polyline
            positions={plannedRoute.routeWaypoints.map((w) => [w.lat, w.lng])}
            pathOptions={{ color: '#3B82F6', weight: 4, dashArray: '6, 8' }}
          />
        )}

        {/* Tourist Markers with Smooth Coordinate Interpolation */}
        {tourists.map((t) => {
          const lat = t.currentLocation?.lat || 26.1445;
          const lng = t.currentLocation?.lng || 91.7362;
          const isSos = t.isSosActive || t.riskLevel === 'CRITICAL';
          const markerColor =
            isSos
              ? '#EF4444'
              : t.riskLevel === 'HIGH'
              ? '#F97316'
              : t.riskLevel === 'MEDIUM'
              ? '#F59E0B'
              : '#10B981';

          return (
            <React.Fragment key={t.id || t.touristId}>
              {/* GPS Accuracy Circle Overlay */}
              <Circle
                center={[lat, lng]}
                radius={t.currentLocation?.accuracyMeters || 15}
                pathOptions={{ color: markerColor, fillColor: markerColor, fillOpacity: 0.15, weight: 1 }}
              />

              <Marker position={[lat, lng]} icon={createCustomIcon(markerColor, isSos)}>
                <Popup>
                  <div className="p-2 space-y-2 min-w-[210px]">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                      <span className="font-bold text-sm text-white">{t.fullName}</span>
                      <span className="text-[10px] font-mono font-bold bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded">
                        {t.touristId}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-300">
                      <div className="flex items-center justify-between">
                        <span>Risk Level:</span>
                        <span
                          className={`font-bold px-1.5 py-0.5 rounded text-[10px] uppercase ${
                            isSos
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : t.riskLevel === 'HIGH'
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                              : t.riskLevel === 'MEDIUM'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {t.riskLevel || 'LOW'} ({t.riskScore || 10}/100)
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Telemetry:</span>
                        <span className="font-semibold text-slate-200">
                          {t.currentLocation?.isLiveGps ? 'LIVE GPS 🟢' : 'DEMO SIMULATED 🟡'}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 truncate">
                        📍 {t.currentLocation?.address || 'Guwahati Region'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-[11px] text-emerald-400">
                        <Phone className="w-3 h-3" />
                        <span>{t.mobileNumber}</span>
                      </div>
                      <Link
                        to={`/verify-id/${t.touristId}`}
                        target="_blank"
                        className="text-[10px] font-semibold text-emerald-400 hover:underline flex items-center space-x-0.5"
                      >
                        <span>Digital ID</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* Emergency Services Markers */}
        {showServices &&
          emergencyServices.map((es) => (
            <Marker
              key={es.id}
              position={[es.location.lat, es.location.lng]}
              icon={createCustomIcon('#3B82F6')}
            >
              <Popup>
                <div className="p-1 space-y-1">
                  <span className="font-bold text-xs text-blue-400">{es.name}</span>
                  <p className="text-[11px] text-slate-300">{es.address}</p>
                  <p className="text-[10px] text-emerald-400 font-semibold">📞 {es.phone}</p>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
