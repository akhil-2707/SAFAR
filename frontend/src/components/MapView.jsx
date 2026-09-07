import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ShieldCheck, AlertTriangle, Phone, ExternalLink, Layers, Eye, EyeOff, Maximize2, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

delete L.Icon.Default.prototype._getIconUrl;

const createCustomIcon = (color, isSos = false, isLive = false) => {
  const pulseHtml = (isSos || isLive) ? `
    <div style="
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: ${isSos ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)'};
      border: 2px solid ${isSos ? '#ef4444' : '#10b981'};
      animation: sos-radar 1.6s infinite ease-out;
      pointer-events: none;
    "></div>
  ` : '';

  const svgHtml = `
    <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
      ${pulseHtml}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="34" height="34" style="position: relative; z-index: 2; filter: drop-shadow(0px 3px 6px rgba(0,0,0,0.5)); transition: transform 0.4s ease;">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>
  `;
  return L.divIcon({
    className: '',
    html: svgHtml,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32]
  });
};

// Distinctive Blue Map Pin with Dark Circular Center matching user's reference
const createRealTimePinIcon = () => {
  const pulseHtml = `
    <div style="
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: rgba(66, 133, 244, 0.28);
      border: 2px solid #3b82f6;
      animation: sos-radar 1.5s infinite ease-out;
      pointer-events: none;
    "></div>
  `;

  const svgHtml = `
    <div style="position: relative; width: 40px; height: 50px; display: flex; align-items: center; justify-content: center;">
      ${pulseHtml}
      <svg viewBox="0 0 384 512" width="38" height="50" style="position: relative; z-index: 3; filter: drop-shadow(0px 4px 8px rgba(0,0,0,0.5));">
        <path fill="#5482F6" stroke="#1D4ED8" stroke-width="6" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"/>
        <circle cx="192" cy="192" r="72" fill="#5F6368" stroke="#374151" stroke-width="4"/>
      </svg>
    </div>
  `;
  return L.divIcon({
    className: '',
    html: svgHtml,
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -46]
  });
};

// 🔵 Small Blue Circular Marker / "You are here" marker
const createLiveUserIcon = () => {
  const html = `
    <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
      <div style="
        position: absolute;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: rgba(37, 99, 235, 0.28);
        border: 2px solid #2563eb;
        animation: sos-radar 1.6s infinite ease-out;
        pointer-events: none;
      "></div>
      <div style="
        width: 15px;
        height: 15px;
        border-radius: 50%;
        background: #2563eb;
        border: 2.5px solid #ffffff;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        position: relative;
        z-index: 2;
      "></div>
    </div>
  `;
  return L.divIcon({
    className: 'live-user-marker',
    html: html,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17]
  });
};

// 📍 Visually distinct Destination Marker
const createDestinationIcon = (color = '#EF4444') => {
  const svgHtml = `
    <div style="position: relative; width: 36px; height: 46px; display: flex; align-items: center; justify-content: center;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="36" height="46" style="filter: drop-shadow(0px 3px 6px rgba(0,0,0,0.45));">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
      <span style="position: absolute; top: 8px; color: white; font-size: 11px; font-weight: 900; pointer-events: none;">★</span>
    </div>
  `;
  return L.divIcon({
    className: 'destination-marker',
    html: svgHtml,
    iconSize: [36, 46],
    iconAnchor: [18, 44],
    popupAnchor: [0, -42]
  });
};

// Standard Geographic Haversine Distance in Kilometers
function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(distanceKm) {
  if (distanceKm == null || isNaN(distanceKm)) return null;
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

const INDIA_REGIONS = {
  ayodhya: { name: '🛕 Ayodhya (Ram Mandir)', center: { lat: 26.7922, lng: 82.1998 }, zoom: 14 },
  jammu: { name: '🏔️ Jammu (Vaishno Devi)', center: { lat: 32.9934, lng: 74.9328 }, zoom: 13 },
  tajmahal: { name: '🕌 Taj Mahal (Agra)', center: { lat: 27.1751, lng: 78.0421 }, zoom: 15 },
  realtime: { name: '📍 Real-Time Location (Live GPS)', center: null, zoom: 16 },
  all: { name: '🇮🇳 All India (Overview)', center: { lat: 23.5937, lng: 80.9629 }, zoom: 5 }
};

function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && typeof center.lat === 'number' && typeof center.lng === 'number') {
      try {
        map.flyTo([center.lat, center.lng], zoom || map.getZoom(), { duration: 1.4 });
      } catch (err) {
        console.warn('MapRecenter flyTo error:', err);
      }
    }
  }, [center, zoom, map]);
  return null;
}

// Automatically fits map bounds so both Current Location and Destination are visible
function MapAutoBounds({ currentLocation, destination }) {
  const map = useMap();
  const fittedRef = React.useRef(false);

  useEffect(() => {
    if (
      currentLocation &&
      destination &&
      typeof currentLocation.lat === 'number' &&
      typeof currentLocation.lng === 'number' &&
      typeof destination.lat === 'number' &&
      typeof destination.lng === 'number'
    ) {
      try {
        const bounds = L.latLngBounds([
          [currentLocation.lat, currentLocation.lng],
          [destination.lat, destination.lng]
        ]);
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 16,
          animate: true,
          duration: 1.2
        });
        fittedRef.current = true;
      } catch (err) {
        console.warn('MapAutoBounds fitBounds error:', err);
      }
    }
  }, [currentLocation?.lat, currentLocation?.lng, destination?.lat, destination?.lng, map]);

  return null;
}

export default function MapView({
  tourists = [],
  geofences = [],
  selectedTourist = null,
  destination: destinationProp = null,
  plannedRoute = null,
  emergencyServices = [],
  height = "500px",
  onRealTimeLocationFound = null,
  showLiveUserLocation = true
}) {
  const [mapProvider, setMapProvider] = useState('google_streets');
  const [selectedRegion, setSelectedRegion] = useState(
    selectedTourist?.touristId === 'TID-1036' ? 'jammu' :
    selectedTourist?.touristId === 'TID-1039' ? 'tajmahal' :
    selectedTourist?.touristId === 'TID-REAL' ? 'realtime' : 'ayodhya'
  );
  const [showZones, setShowZones] = useState(true);
  const [showServices, setShowServices] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [locatingUser, setLocatingUser] = useState(false);

  // 1. Separate State: Current User Live GPS Location
  const [currentLocation, setCurrentLocation] = useState(null);
  const [geoStatus, setGeoStatus] = useState('idle'); // 'idle' | 'prompt' | 'granted' | 'denied' | 'unavailable' | 'timeout' | 'unsupported'
  const [geoErrorMsg, setGeoErrorMsg] = useState(null);

  // 2. Separate State: Destination Location
  const [destination, setDestination] = useState(() => {
    if (destinationProp && typeof destinationProp.lat === 'number') {
      return destinationProp;
    }
    return {
      lat: selectedTourist?.destinationLat || selectedTourist?.currentLocation?.lat || INDIA_REGIONS.ayodhya.center.lat,
      lng: selectedTourist?.destinationLng || selectedTourist?.currentLocation?.lng || INDIA_REGIONS.ayodhya.center.lng,
      name: selectedTourist?.destination || selectedTourist?.currentLocation?.address || 'Ayodhya Ram Mandir Complex',
      address: selectedTourist?.currentLocation?.address || 'Ayodhya, Uttar Pradesh'
    };
  });

  const activeGeofences = geofences.filter((f) => f.active !== false);

  // Initialize center and zoom based on destination or selectedTourist
  const [mapCenter, setMapCenter] = useState(
    destinationProp?.lat ? { lat: destinationProp.lat, lng: destinationProp.lng } :
    selectedTourist?.currentLocation || INDIA_REGIONS.ayodhya.center
  );
  const [mapZoom, setMapZoom] = useState(14);

  // Synchronize destination state when destinationProp or selectedTourist changes
  useEffect(() => {
    if (destinationProp && typeof destinationProp.lat === 'number') {
      setDestination(destinationProp);
      setMapCenter({ lat: destinationProp.lat, lng: destinationProp.lng });
    } else if (selectedTourist) {
      const destLat = selectedTourist.destinationLat || selectedTourist.currentLocation?.lat || INDIA_REGIONS[selectedRegion]?.center?.lat || 26.7922;
      const destLng = selectedTourist.destinationLng || selectedTourist.currentLocation?.lng || INDIA_REGIONS[selectedRegion]?.center?.lng || 82.1998;
      const destName = selectedTourist.destination || selectedTourist.currentLocation?.address || selectedTourist.fullName || 'Tourist Destination';
      const destAddr = selectedTourist.currentLocation?.address || 'Designated Tourist Safe Area';
      setDestination({
        lat: destLat,
        lng: destLng,
        name: destName,
        address: destAddr
      });
      setMapCenter({ lat: destLat, lng: destLng });
      if (selectedTourist.touristId === 'TID-1035') setSelectedRegion('ayodhya');
      else if (selectedTourist.touristId === 'TID-1036') setSelectedRegion('jammu');
      else if (selectedTourist.touristId === 'TID-1039') setSelectedRegion('tajmahal');
    }
  }, [destinationProp, selectedTourist]);

  // 3. Continuous Geolocation Watcher using navigator.geolocation.watchPosition
  const startLiveLocationTracking = () => {
    if (!navigator.geolocation) {
      setGeoStatus('unsupported');
      setGeoErrorMsg('Geolocation is not supported by your browser.');
      return null;
    }

    setLocatingUser(true);
    setGeoStatus('prompt');

    const handleSuccess = (position) => {
      setLocatingUser(false);
      const { latitude, longitude, accuracy, heading, speed } = position.coords;
      const liveGps = {
        lat: latitude,
        lng: longitude,
        accuracy: Math.round(accuracy || 10),
        heading: heading || 0,
        speed: speed ? Math.round(speed * 3.6 * 10) / 10 : 0,
        timestamp: position.timestamp
      };
      setCurrentLocation(liveGps);
      setGeoStatus('granted');
      setGeoErrorMsg(null);

      if (onRealTimeLocationFound) {
        onRealTimeLocationFound({
          ...liveGps,
          address: 'My Real-Time Device Location',
          isLiveGps: true,
          speedKmH: liveGps.speed
        });
      }
    };

    const handleError = (err) => {
      setLocatingUser(false);
      switch (err.code) {
        case err.PERMISSION_DENIED:
          setGeoStatus('denied');
          setGeoErrorMsg('Location access is required to show your current location.');
          break;
        case err.POSITION_UNAVAILABLE:
          setGeoStatus('unavailable');
          setGeoErrorMsg('GPS location is unavailable on your device.');
          break;
        case err.TIMEOUT:
          setGeoStatus('timeout');
          setGeoErrorMsg('GPS request timed out. Retrying...');
          break;
        default:
          setGeoStatus('unavailable');
          setGeoErrorMsg(err.message || 'Unable to retrieve location.');
      }
    };

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };

    // Initial position fetch
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);

    // Continuous real-time watcher
    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, options);
    return watchId;
  };

  useEffect(() => {
    if (!showLiveUserLocation) return;
    const watchId = startLiveLocationTracking();
    return () => {
      if (watchId !== null && watchId !== undefined && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [showLiveUserLocation]);

  const handleRegionChange = (regKey) => {
    setSelectedRegion(regKey);
    if (regKey === 'realtime') {
      if (currentLocation) {
        setMapCenter({ lat: currentLocation.lat, lng: currentLocation.lng });
        setMapZoom(16);
      } else {
        startLiveLocationTracking();
      }
      return;
    }
    const reg = INDIA_REGIONS[regKey];
    if (reg && reg.center) {
      setDestination({
        lat: reg.center.lat,
        lng: reg.center.lng,
        name: reg.name,
        address: `${reg.name} Heritage Corridor`
      });
      setMapCenter(reg.center);
      setMapZoom(reg.zoom);
    }
  };

  // 4. Dynamic Geographic Distance between Current Location and Destination
  const calculatedDistanceKm = (currentLocation && destination && typeof currentLocation.lat === 'number' && typeof destination.lat === 'number')
    ? calculateHaversineDistanceKm(currentLocation.lat, currentLocation.lng, destination.lat, destination.lng)
    : null;

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

  const isCustomHeightClass = typeof height === 'string' && height.startsWith('h-');

  return (
    <div
      style={{
        height: isFullscreen ? '100vh' : (isCustomHeightClass ? undefined : undefined)
      }}
      className={`w-full relative rounded-2xl overflow-hidden shadow-xl border border-gray-200 transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none h-screen'
          : (isCustomHeightClass ? height : 'h-[330px] xs:h-[370px] sm:h-[440px] md:h-[500px]')
      }`}
    >
      {/* Map Control Bar Overlay - RESPONSIVE BRIGHT THEME */}
      <div className="absolute top-2 right-2 left-2 sm:left-auto sm:right-3 z-20 flex flex-wrap items-center justify-between sm:justify-end gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-xl text-xs max-w-[calc(100%-16px)]"
        style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(14px)', border: '1px solid rgba(139,92,246,0.25)', boxShadow: '0 4px 20px rgba(139,92,246,0.12)' }}>
        
        {/* Pan-India Region Switcher */}
        <select
          value={selectedRegion}
          onChange={(e) => handleRegionChange(e.target.value)}
          className="font-bold px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg border focus:outline-none cursor-pointer text-[11px] sm:text-xs max-w-[130px] xs:max-w-[150px] sm:max-w-none truncate"
          style={{ background: 'rgba(254,243,199,0.95)', color: '#b45309', border: '1px solid rgba(245,158,11,0.45)' }}
          title="Jump to Region / City"
        >
          {Object.entries(INDIA_REGIONS).map(([key, reg]) => (
            <option key={key} value={key}>{reg.name}</option>
          ))}
        </select>

        {/* Real-Time Live GPS Quick Button */}
        <button
          type="button"
          onClick={handleFindRealTimeLocation}
          disabled={locatingUser}
          className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg flex items-center space-x-1 font-black text-[11px] sm:text-xs transition-all shadow-xs ${
            locatingUser
              ? 'bg-blue-600 text-white animate-pulse'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:brightness-110'
          }`}
          title="Detect and fly to your real-time GPS location"
        >
          <Compass className={`w-3.5 h-3.5 ${locatingUser ? 'animate-spin' : ''}`} />
          <span>{locatingUser ? 'Locating...' : '📍 GPS'}</span>
        </button>

        {/* Map Layer Switcher */}
        <select
          value={mapProvider}
          onChange={(e) => setMapProvider(e.target.value)}
          className="font-bold px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg border focus:outline-none cursor-pointer text-[11px] sm:text-xs"
          style={{ background: 'rgba(245,243,255,1)', color: '#7c3aed', border: '1px solid rgba(139,92,246,0.3)' }}
        >
          <option value="google_streets">🗺️ Streets</option>
          <option value="google_satellite">🛰️ Satellite</option>
          <option value="carto_voyager">🌐 Voyager</option>
          <option value="carto_dark">🌙 Dark</option>
        </select>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            onClick={() => setShowZones(!showZones)}
            className={`p-1 sm:p-1.5 rounded-lg flex items-center space-x-1 font-semibold transition-all ${
              showZones ? 'text-emerald-700 border border-emerald-300' : 'text-gray-500 hover:text-gray-800'
            }`}
            style={showZones ? { background: 'rgba(16,185,129,0.12)' } : { background: 'transparent' }}
            title="Toggle Zones"
          >
            {showZones ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Zones</span>
          </button>

          <button
            onClick={() => setShowServices(!showServices)}
            className={`p-1 sm:p-1.5 rounded-lg flex items-center space-x-1 font-semibold transition-all ${
              showServices ? 'text-blue-700 border border-blue-300' : 'text-gray-500 hover:text-gray-800'
            }`}
            style={showServices ? { background: 'rgba(59,130,246,0.12)' } : { background: 'transparent' }}
            title="Toggle Help Centers"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Help</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 sm:p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Map Legend - BRIGHT FROSTED GLASS */}
      <div
        className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 z-20 p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-lg text-[9px] sm:text-[10px] space-y-1 sm:space-y-1.5 backdrop-blur-md max-w-[85%] sm:max-w-none"
        style={{
          background: 'rgba(255, 255, 255, 0.94)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)'
        }}
      >
        <div className="hidden sm:flex items-center justify-between pb-1 space-x-2 border-b border-gray-100">
          <span className="font-extrabold text-gray-800 block">Map Engine: <span className="text-emerald-600">Max Zoom 22 HD</span></span>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3 text-gray-700 font-semibold flex-wrap">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Safe</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Caution</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>High</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>Restricted</span>
          </span>
        </div>
      </div>

      <MapContainer
        center={[
          (mapCenter && typeof mapCenter.lat === 'number') ? mapCenter.lat : 26.7922,
          (mapCenter && typeof mapCenter.lng === 'number') ? mapCenter.lng : 82.1998
        ]}
        zoom={mapZoom}
        maxZoom={22}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <MapRecenter center={mapCenter} zoom={mapZoom} />

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
                        <span className="font-bold text-sm text-gray-900">{gf.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] pt-1">
                        <span className="font-bold uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                          {gf.type} • {gf.riskLevel || 'HIGH'}
                        </span>
                        <span className="font-mono text-cyan-800 font-bold">
                          Radius: {radius >= 1000 ? `${(radius / 1000).toFixed(1)} km` : `${radius}m`}
                        </span>
                      </div>
                      {gf.alertMessage && (
                        <p className="text-[11px] text-red-800 bg-red-50 p-1.5 rounded border border-red-200 mt-1 font-semibold">
                          ⚠️ {gf.alertMessage}
                        </p>
                      )}
                    </div>
                  </Popup>
                </Circle>
              );
            }

            if (!Array.isArray(gf.coordinates) || gf.coordinates.length < 3) return null;
            const validCoords = gf.coordinates.filter(
              (c) => Array.isArray(c) && c.length >= 2 && typeof c[0] === 'number' && typeof c[1] === 'number'
            );
            if (validCoords.length < 3) return null;

            return (
              <Polygon
                key={gf.id}
                positions={validCoords}
                pathOptions={{
                  color: gf.strokeColor || gf.color,
                  fillColor: gf.color,
                  fillOpacity: 0.25,
                  weight: 2
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1.5 text-gray-900">
                    <div className="flex items-center space-x-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: gf.color }}
                      />
                      <span className="font-extrabold text-sm text-gray-900">{gf.name}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-800 border border-gray-200">
                        {gf.type}
                      </span>
                      <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        Warn: {gf.warningDistance || 300}m
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{gf.description}</p>
                  </div>
                </Popup>
              </Polygon>
            );
          })}

        {/* Map Auto-Fit Bounds for both Live Location & Destination */}
        <MapAutoBounds currentLocation={currentLocation} destination={destination} />

        {/* Planned Route Polyline */}
        {plannedRoute && plannedRoute.routeWaypoints && plannedRoute.routeWaypoints.length > 1 && (
          <Polyline
            positions={plannedRoute.routeWaypoints.map((w) => [w.lat, w.lng])}
            pathOptions={{ color: '#3B82F6', weight: 4, dashArray: '6, 8' }}
          />
        )}

        {/* Direct Connecting Polyline between Live Location and Destination */}
        {currentLocation && destination && typeof currentLocation.lat === 'number' && typeof destination.lat === 'number' && (
          <Polyline
            positions={[
              [currentLocation.lat, currentLocation.lng],
              [destination.lat, destination.lng]
            ]}
            pathOptions={{
              color: '#2563EB',
              weight: 2.5,
              dashArray: '6, 8',
              opacity: 0.85
            }}
          />
        )}

        {/* 🔵 Current / Live Location Marker ("You are here") */}
        {currentLocation && typeof currentLocation.lat === 'number' && (
          <React.Fragment>
            <Circle
              center={[currentLocation.lat, currentLocation.lng]}
              radius={currentLocation.accuracy || 15}
              pathOptions={{ color: '#2563EB', fillColor: '#3B82F6', fillOpacity: 0.15, weight: 1.5 }}
            />
            <Marker
              position={[currentLocation.lat, currentLocation.lng]}
              icon={createLiveUserIcon()}
              zIndexOffset={1000}
            >
              <Popup>
                <div className="p-1.5 space-y-1 text-xs text-gray-900 min-w-[190px]">
                  <div className="flex items-center space-x-1.5 font-black text-blue-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                    <span>You Are Here (Live Location)</span>
                  </div>
                  <p className="text-[10px] font-mono text-gray-600">
                    [{currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)}]
                  </p>
                  <p className="text-[10px] text-gray-500">
                    GPS Accuracy: ±{currentLocation.accuracy}m
                  </p>
                  {calculatedDistanceKm !== null && (
                    <div className="mt-1 pt-1 border-t border-gray-100 font-bold text-emerald-700 text-[11px]">
                      Distance to Destination: {formatDistance(calculatedDistanceKm)}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        )}

        {/* 📍 Destination Marker */}
        {destination && typeof destination.lat === 'number' && (
          <Marker
            position={[destination.lat, destination.lng]}
            icon={createDestinationIcon('#EF4444')}
            zIndexOffset={900}
          >
            <Popup>
              <div className="p-1.5 space-y-1 text-xs text-gray-900 min-w-[200px]">
                <div className="flex items-center space-x-1.5">
                  <span className="text-base">📍</span>
                  <span className="font-extrabold text-sm text-gray-900">{destination.name}</span>
                </div>
                {destination.address && (
                  <p className="text-[11px] text-gray-600 leading-tight">{destination.address}</p>
                )}
                <span className="text-[10px] font-mono text-cyan-800 font-bold block">
                  [{destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}]
                </span>
                {calculatedDistanceKm !== null && (
                  <div className="mt-1 pt-1 border-t border-gray-100 text-[11px] font-bold text-blue-700">
                    Distance from You: {formatDistance(calculatedDistanceKm)}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Tourist Markers with Smooth Coordinate Interpolation */}
        {tourists.map((t) => {
          const lat = t.currentLocation?.lat || 26.1445;
          const lng = t.currentLocation?.lng || 91.7362;
          const isSos = t.isSosActive || t.riskLevel === 'CRITICAL';
          const isLive = Boolean(t.currentLocation?.isLiveGps || (t.currentLocation?.speedKmH && t.currentLocation.speedKmH > 0));
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

              <Marker 
                position={[lat, lng]} 
                icon={t.touristId === 'TID-REAL' || t.isRealTime ? createRealTimePinIcon() : createCustomIcon(markerColor, isSos, isLive)}
              >
                <Popup>
                  <div className="p-1.5 space-y-2 min-w-[220px] text-gray-900">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                      <span className="font-extrabold text-sm text-gray-900">{t.fullName}</span>
                      <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                        {t.touristId}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-semibold">Risk Level:</span>
                        <span
                          className={`font-black px-1.5 py-0.5 rounded text-[10px] uppercase ${
                            isSos
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : t.riskLevel === 'HIGH'
                              ? 'bg-orange-100 text-orange-700 border border-orange-200'
                              : t.riskLevel === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-700 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {t.riskLevel || 'LOW'} ({t.riskScore || 10}/100)
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-semibold">Telemetry:</span>
                        <span className="font-bold text-gray-800">
                          {isLive ? '🟢 LIVE ACTIVE' : '🟡 SIMULATOR'}
                          {t.currentLocation?.speedKmH ? ` • ${t.currentLocation.speedKmH} km/h` : ''}
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-600 truncate font-medium">
                        📍 {t.currentLocation?.address || 'Safe Tourist Corridor'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-[11px] text-emerald-700 font-bold">
                        <Phone className="w-3 h-3" />
                        <span>{t.mobileNumber}</span>
                      </div>
                      <Link
                        to={`/verify-id/${t.touristId}`}
                        target="_blank"
                        className="text-[10px] font-bold text-violet-600 hover:text-violet-800 hover:underline flex items-center space-x-0.5"
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
                <div className="p-1.5 space-y-1 text-gray-900">
                  <span className="font-extrabold text-xs text-blue-700">{es.name}</span>
                  <p className="text-[11px] text-gray-600">{es.address}</p>
                  <p className="text-[10px] text-emerald-700 font-bold">📞 {es.phone}</p>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* Floating Distance & Location Card (Corner Overlay) */}
      <div
        className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-20 p-2.5 sm:p-3 rounded-2xl text-xs space-y-2 backdrop-blur-xl max-w-[240px] xs:max-w-[270px] sm:max-w-[310px] shadow-xl transition-all"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          boxShadow: '0 8px 28px rgba(0, 0, 0, 0.12)'
        }}
      >
        <div className="space-y-1.5">
          {/* Destination */}
          <div className="flex items-start space-x-2">
            <span className="text-sm shrink-0">📍</span>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Destination</span>
              <strong className="text-gray-900 font-extrabold text-xs truncate block leading-tight">
                {destination?.name || 'Selected Destination'}
              </strong>
            </div>
          </div>

          {/* Your Location */}
          <div className="flex items-start space-x-2">
            <div className="w-3.5 h-3.5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Your Location</span>
              <span className="text-gray-800 font-bold text-xs truncate block leading-tight">
                {currentLocation ? 'You are here (Live GPS)' : geoStatus === 'denied' ? 'Access Denied' : 'Acquiring GPS...'}
              </span>
            </div>
          </div>
        </div>

        {/* Distance Summary */}
        <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] font-bold text-gray-600">Distance:</span>
          {calculatedDistanceKm !== null ? (
            <span className="text-xs font-black font-mono px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              {formatDistance(calculatedDistanceKm)}
            </span>
          ) : (
            <span className="text-[10px] font-mono text-gray-400">Calculating...</span>
          )}
        </div>

        {/* User-Friendly Warning Message if Location Denied */}
        {geoStatus === 'denied' && (
          <div className="p-1.5 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-900 space-y-1">
            <div className="flex items-center space-x-1 font-semibold leading-tight">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Location access is required to show your current location.</span>
            </div>
            <button
              type="button"
              onClick={startLiveLocationTracking}
              className="w-full py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[10px] transition-colors"
            >
              Allow / Retry GPS
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
