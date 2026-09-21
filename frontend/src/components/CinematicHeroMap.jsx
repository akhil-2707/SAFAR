import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Play, Pause, SkipForward, RotateCcw, Navigation, ShieldAlert, AlertOctagon, 
  CheckCircle2, Sparkles, MapPin, Eye, Compass, Zap, Shield, Phone, Radio, Activity
} from 'lucide-react';
import { useBrowserGeolocation } from '../hooks/useBrowserGeolocation';

// Configurable Demo Journey Destinations
const DESTINATIONS = {
  INDIA: { name: 'India Overview', lat: 22.5937, lng: 78.9629, zoom: 5, pitch: 0 },
  MUMBAI: { name: 'Mumbai (Origin)', lat: 19.0760, lng: 72.8777, zoom: 11, desc: 'Journey Starting Point' },
  DELHI: { name: 'Delhi (Transit Hub)', lat: 28.6139, lng: 77.2090, zoom: 11, desc: 'Northern Aviation Gateway' },
  GUWAHATI: { name: 'Guwahati (NE Entry)', lat: 26.1445, lng: 91.7362, zoom: 12, desc: 'Gateway to North-East India' },
  RESTRICTED_ZONE: { name: 'Kamakhya Reserve Forest', lat: 26.1600, lng: 91.7500, zoom: 14, desc: 'Restricted Border Zone' }
};

// Mumbai to Delhi to Guwahati Animated Waypoints
const ROUTE_WAYPOINTS = [
  [19.0760, 72.8777], // Mumbai
  [21.1458, 79.0882], // Nagpur transit
  [25.4358, 81.8463], // Prayagraj
  [28.6139, 77.2090], // Delhi
  [26.4499, 80.3319], // Kanpur
  [25.5941, 85.1376], // Patna
  [26.7271, 88.3953], // Siliguri
  [26.1445, 91.7362]  // Guwahati
];

// Restricted Geo-Fence Polygon Coordinates
const RESTRICTED_POLYGON = [
  [26.1650, 91.7450],
  [26.1680, 91.7600],
  [26.1580, 91.7650],
  [26.1520, 91.7500]
];

// Emergency Response Unit Location
const POLICE_STATION_LOC = [26.1400, 91.7200];

// Custom Leaflet Icons
const createCinematicIcon = (color, pulse = false, iconSymbol = '📍') => {
  return L.divIcon({
    className: 'custom-cinematic-marker',
    html: `
      <div class="relative flex items-center justify-center">
        ${pulse ? `<div class="absolute w-10 h-10 rounded-full animate-ping opacity-75" style="background-color: ${color}"></div>` : ''}
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-xl border-2 border-white/90 text-sm font-bold backdrop-blur-md" style="background-color: ${color}">
          ${iconSymbol}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

// Smooth Map Camera Animation Helper Component
function MapCameraController({ center, zoom, bounds }) {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.flyToBounds(bounds, { duration: 2.2, easeLinearity: 0.25 });
    } else if (center && zoom) {
      map.flyTo(center, zoom, { duration: 2.5, easeLinearity: 0.2 });
    }
  }, [center, zoom, bounds, map]);

  return null;
}

export default function CinematicHeroMap({ onScenarioTrigger }) {
  // Demo Execution State (Scenes 1 to 13)
  const [currentScene, setCurrentScene] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [travelProgress, setTravelProgress] = useState(0); // 0 to 100%
  const [touristPos, setTouristPos] = useState(DESTINATIONS.MUMBAI);
  const [riskScore, setRiskScore] = useState(12);
  const [riskLevel, setRiskLevel] = useState('LOW');
  const [activeAlert, setActiveAlert] = useState(null);
  const [isSosActive, setIsSosActive] = useState(false);
  const [responseEta, setResponseEta] = useState(null);
  const [followMe, setFollowMe] = useState(false);

  // Map View State
  const [mapCenter, setMapCenter] = useState([DESTINATIONS.INDIA.lat, DESTINATIONS.INDIA.lng]);
  const [mapZoom, setMapZoom] = useState(DESTINATIONS.INDIA.zoom);

  // Live GPS Hook
  const { coords: liveCoords, isLive: isLiveGps, permissionStatus, error: gpsError, startTracking, stopTracking } = useBrowserGeolocation();

  const timerRef = useRef(null);

  // Update tourist position smoothly when real GPS is active
  useEffect(() => {
    if (isLiveGps && liveCoords && followMe) {
      setTouristPos({
        lat: liveCoords.lat,
        lng: liveCoords.lng,
        name: 'Live GPS Tourist Location'
      });
      setMapCenter([liveCoords.lat, liveCoords.lng]);
      setMapZoom(15);
    }
  }, [liveCoords, isLiveGps, followMe]);

  // Automated 13-Scene Judge Demo Controller
  const executeScene = (sceneIndex) => {
    setCurrentScene(sceneIndex);

    switch (sceneIndex) {
      case 1: // India Overview
        setMapCenter([DESTINATIONS.INDIA.lat, DESTINATIONS.INDIA.lng]);
        setMapZoom(DESTINATIONS.INDIA.zoom);
        setTouristPos(DESTINATIONS.MUMBAI);
        setRiskScore(10);
        setRiskLevel('LOW');
        setActiveAlert(null);
        setIsSosActive(false);
        setResponseEta(null);
        setTravelProgress(0);
        break;

      case 2: // Zoom to Mumbai
        setMapCenter([DESTINATIONS.MUMBAI.lat, DESTINATIONS.MUMBAI.lng]);
        setMapZoom(DESTINATIONS.MUMBAI.zoom);
        setTouristPos(DESTINATIONS.MUMBAI);
        setActiveAlert({ type: 'INFO', title: '📍 MUMBAI - JOURNEY START', msg: 'Tourist verified at Chhatrapati Shivaji Maharaj Airport' });
        setTravelProgress(10);
        break;

      case 3: // Route to Delhi
        setMapCenter([23.8, 75.0]);
        setMapZoom(6);
        setTravelProgress(40);
        setActiveAlert({ type: 'INFO', title: '✈️ EN ROUTE TO DELHI', msg: 'Animated travel path drawing in real-time across corridor' });
        break;

      case 4: // Reach Delhi
        setMapCenter([DESTINATIONS.DELHI.lat, DESTINATIONS.DELHI.lng]);
        setMapZoom(DESTINATIONS.DELHI.zoom);
        setTouristPos(DESTINATIONS.DELHI);
        setTravelProgress(50);
        setActiveAlert({ type: 'INFO', title: '📍 DELHI TRANSIT HUB', msg: 'Connecting flight boarded for North-East Gateway' });
        break;

      case 5: // North East Destination (Guwahati)
        setMapCenter([DESTINATIONS.GUWAHATI.lat, DESTINATIONS.GUWAHATI.lng]);
        setMapZoom(DESTINATIONS.GUWAHATI.zoom);
        setTouristPos(DESTINATIONS.GUWAHATI);
        setTravelProgress(100);
        setActiveAlert({ type: 'SAFE', title: '📍 GUWAHATI - NORTH EAST ARRIVAL', msg: 'Tourist entered Guwahati Safe Zone corridor' });
        break;

      case 6: // Tourist Moving Toward Restricted Zone
        setMapCenter([26.1550, 91.7420]);
        setMapZoom(14);
        setTouristPos({ lat: 26.1520, lng: 91.7400, name: 'Approaching Restricted Boundary' });
        setRiskScore(32);
        setRiskLevel('LOW');
        setActiveAlert({ type: 'NEUTRAL', title: '🚶 TOURIST IN MOTION', msg: 'Moving north toward Kamakhya Reserve Forest boundary' });
        break;

      case 7: // Pre-Entry Warning (300m Proximity)
        setTouristPos({ lat: 26.1560, lng: 91.7440, name: '300m From Restricted Zone' });
        setRiskScore(68);
        setRiskLevel('HIGH');
        setActiveAlert({ type: 'WARNING', title: '⚠️ PRE-ENTRY WARNING (300m)', msg: 'Caution! You are approaching a Restricted Military Border Zone' });
        if (onScenarioTrigger) onScenarioTrigger('APPROACH_300M');
        break;

      case 8: // Enters Restricted Zone
        setTouristPos({ lat: 26.1600, lng: 91.7500, name: 'Inside Restricted Zone' });
        setRiskScore(92);
        setRiskLevel('CRITICAL');
        setActiveAlert({ type: 'BREACH', title: '🚨 NO ENTRY ZONE BREACHED', msg: 'CRITICAL ALERT: Unauthorized entry into Restricted Military Polygon!' });
        if (onScenarioTrigger) onScenarioTrigger('2');
        break;

      case 9: // AI Risk Critical
        setRiskScore(98);
        setRiskLevel('CRITICAL');
        setActiveAlert({ type: 'CRITICAL', title: '🤖 AI RISK SCORE: 98/100', msg: 'AI Engine: Severe hazard due to off-route border breach at 19:42 hrs' });
        break;

      case 10: // SOS Trigger
        setIsSosActive(true);
        setActiveAlert({ type: 'SOS', title: '🚨 SOS DISTRESS LOCK ACTIVATED', msg: '1-Click SOS distress signal locked. GPS & Medical Telemetry dispatched.' });
        if (onScenarioTrigger) onScenarioTrigger('4');
        break;

      case 11: // Authority Alert Received
        setActiveAlert({ type: 'AUTHORITY', title: '🛡️ DISPATCH COMMAND NOTIFIED', msg: 'Assam State Police Patrol Unit #4 dispatched to tourist coordinates' });
        break;

      case 12: // Response Route & ETA Counter
        setResponseEta('03:45 mins');
        setMapCenter([26.1500, 91.7350]);
        setMapZoom(14);
        setActiveAlert({ type: 'RESPONSE', title: '🚑 RESPONSE EN ROUTE (ETA: 03:45)', msg: 'Emergency vehicle moving along optimized response corridor' });
        break;

      case 13: // Incident Resolved
        setIsSosActive(false);
        setRiskScore(15);
        setRiskLevel('LOW');
        setResponseEta(null);
        setActiveAlert({ type: 'RESOLVED', title: '✅ INCIDENT RESOLVED', msg: 'Tourist safely escorted by Patrol Unit. Safety status restored.' });
        if (onScenarioTrigger) onScenarioTrigger('1');
        break;

      default:
        break;
    }
  };

  // Play / Pause Demo Loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentScene((prev) => {
          if (prev >= 13) {
            setIsPlaying(false);
            return 13;
          }
          const next = prev + 1;
          executeScene(next);
          return next;
        });
      }, 4500); // 4.5 seconds per scene for smooth reading
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const handleNext = () => {
    const next = currentScene < 13 ? currentScene + 1 : 1;
    executeScene(next);
  };

  const handleRestart = () => {
    setIsPlaying(false);
    executeScene(1);
  };

  return (
    <div className="relative w-full h-[68vh] sm:h-[82vh] lg:h-[90vh] min-h-[460px] sm:min-h-[580px] overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-emerald-500/20 shadow-xl bg-slate-100">
      
      {/* Map Camera Controller Sync */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        maxZoom={22}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <MapCameraController center={mapCenter} zoom={mapZoom} />

        <TileLayer
          attribution='&copy; Google Maps Satellite HD'
          url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          maxZoom={22}
          maxNativeZoom={20}
        />

        {/* Restricted Polygon Zone */}
        <Polygon
          positions={RESTRICTED_POLYGON}
          pathOptions={{
            color: currentScene >= 8 ? '#EF4444' : '#F59E0B',
            fillColor: currentScene >= 8 ? '#EF4444' : '#F59E0B',
            fillOpacity: currentScene >= 8 ? 0.35 : 0.2,
            weight: currentScene >= 8 ? 4 : 2,
            dashArray: currentScene >= 8 ? '8, 8' : undefined
          }}
        />

        {/* Animated Flight / Travel Route Polyline */}
        <Polyline
          positions={ROUTE_WAYPOINTS}
          pathOptions={{
            color: '#10B981',
            weight: 4,
            opacity: 0.8,
            dashArray: '8, 12'
          }}
        />

        {/* Emergency Response Unit Route (Scenes 11-13) */}
        {currentScene >= 11 && (
          <Polyline
            positions={[POLICE_STATION_LOC, [touristPos.lat, touristPos.lng]]}
            pathOptions={{
              color: '#3B82F6',
              weight: 5,
              dashArray: '4, 8'
            }}
          />
        )}

        {/* Destination Markers */}
        <Marker position={[DESTINATIONS.MUMBAI.lat, DESTINATIONS.MUMBAI.lng]} icon={createCinematicIcon('#10B981', false, '🛫')} />
        <Marker position={[DESTINATIONS.DELHI.lat, DESTINATIONS.DELHI.lng]} icon={createCinematicIcon('#3B82F6', false, '🛬')} />
        <Marker position={[DESTINATIONS.GUWAHATI.lat, DESTINATIONS.GUWAHATI.lng]} icon={createCinematicIcon('#06B6D4', false, '🏔️')} />

        {/* Tourist Location Marker */}
        <Marker
          position={[touristPos.lat, touristPos.lng]}
          icon={createCinematicIcon(
            isSosActive || currentScene >= 8 ? '#EF4444' : currentScene >= 7 ? '#F97316' : '#10B981',
            isSosActive || currentScene >= 7,
            isSosActive ? '🚨' : '🚶'
          )}
        >
          <Popup>
            <div className="p-2 space-y-1 text-xs text-gray-900">
              <span className="font-bold block text-emerald-700">{touristPos.name || 'Tourist Position'}</span>
              <p className="text-gray-600">Lat: {touristPos.lat.toFixed(4)}, Lng: {touristPos.lng.toFixed(4)}</p>
              <p className="font-semibold text-amber-800">Risk Score: {riskScore}/100 ({riskLevel})</p>
            </div>
          </Popup>
        </Marker>

        {/* Emergency Response Unit Marker */}
        {currentScene >= 11 && (
          <Marker position={POLICE_STATION_LOC} icon={createCinematicIcon('#3B82F6', true, '🚓')}>
            <Popup>
              <div className="p-2 text-xs text-gray-900">
                <span className="font-bold text-blue-700">Patrol Unit #4 (Assam Police)</span>
                <p className="text-gray-600 font-semibold mt-1">Status: En Route to SOS Lock</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Top Floating Overlay: Live GPS Telemetry Badge & Hero Branding - BRIGHT */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-10 flex flex-wrap items-center justify-between gap-1.5 sm:gap-3 pointer-events-none">
        
        {/* Hero Branding Badge */}
        <div
          className="pointer-events-auto backdrop-blur-xl px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl shadow-xl flex items-center space-x-2 sm:space-x-3 max-w-[calc(100vw-24px)]"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1.5px solid rgba(16, 185, 129, 0.35)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)'
          }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-black text-gray-900 tracking-wide truncate">SAFE-TOUR CINEMATIC COMMAND</h2>
            <p className="text-[9px] sm:text-[10px] font-bold text-emerald-700 uppercase tracking-widest hidden sm:block">
              Live GPS • Geo-Fence Containment • AI Risk Telemetry
            </p>
          </div>
        </div>

        {/* Live GPS Status Pill */}
        <div
          className="pointer-events-auto backdrop-blur-xl px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl shadow-xl flex items-center space-x-2 sm:space-x-3"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1.5px solid rgba(0, 0, 0, 0.1)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)'
          }}
        >
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${isLiveGps ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-[11px] sm:text-xs font-black text-gray-800">
              {isLiveGps ? '🟢 LIVE' : '🟡 DEMO'}
            </span>
          </div>

          <button
            onClick={() => {
              if (isLiveGps) stopTracking();
              else startTracking();
            }}
            className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-bold rounded-lg sm:rounded-xl bg-gray-100 hover:bg-gray-200 text-emerald-700 border border-gray-200 transition-colors shadow-sm"
          >
            {isLiveGps ? 'Demo Mode' : 'Real GPS'}
          </button>

          <button
            onClick={() => setFollowMe(!followMe)}
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-bold rounded-lg sm:rounded-xl transition-colors shadow-sm ${
              followMe ? 'bg-emerald-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
            }`}
          >
            {followMe ? '🎯 Locked' : 'Follow'}
          </button>
        </div>
      </div>

      {/* Active Story Alert Card Overlay - BRIGHT */}
      {activeAlert && (
        <div className="absolute top-16 sm:top-20 left-2 sm:left-4 z-10 max-w-[calc(100vw-20px)] sm:max-w-md pointer-events-auto transition-all animate-bounce-short">
          <div
            className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl backdrop-blur-xl border shadow-xl sm:shadow-2xl space-y-1 sm:space-y-2 ${
              activeAlert.type === 'WARNING'
                ? 'bg-amber-50/95 border-amber-400 text-amber-950'
                : activeAlert.type === 'BREACH' || activeAlert.type === 'SOS' || activeAlert.type === 'CRITICAL'
                ? 'bg-red-50/95 border-red-500 text-red-950'
                : activeAlert.type === 'RESPONSE'
                ? 'bg-blue-50/95 border-blue-400 text-blue-950'
                : activeAlert.type === 'RESOLVED' || activeAlert.type === 'SAFE'
                ? 'bg-emerald-50/95 border-emerald-400 text-emerald-950'
                : 'bg-white/95 border-gray-300 text-gray-900'
            }`}
            style={{ boxShadow: '0 12px 35px rgba(0,0,0,0.12)' }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 truncate">
                <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span className="truncate">{activeAlert.title}</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono font-bold bg-white/80 border border-gray-200 px-1.5 py-0.5 rounded text-gray-700 shrink-0">
                {currentScene}/13
              </span>
            </div>
            <p className="text-[11px] sm:text-xs font-semibold leading-snug sm:leading-relaxed">{activeAlert.msg}</p>
          </div>
        </div>
      )}

      {/* AI Risk Score Gauge Overlay (Right Floating) - BRIGHT */}
      <div
        className="absolute top-36 sm:top-20 right-2 sm:right-4 z-10 pointer-events-auto backdrop-blur-xl p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl space-y-1.5 sm:space-y-2 w-36 sm:w-48"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1.5px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)'
        }}
      >
        <div className="flex items-center justify-between text-[10px] sm:text-xs">
          <span className="font-extrabold text-gray-600 uppercase tracking-wider">AI Risk</span>
          <span className={`font-black px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] ${
            riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700 border border-red-200' :
            riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
            'bg-emerald-100 text-emerald-700 border border-emerald-200'
          }`}>
            {riskLevel}
          </span>
        </div>

        <div className="relative pt-0.5">
          <div className="flex mb-0.5 items-center justify-between text-xs">
            <span className="text-lg sm:text-2xl font-black text-gray-900">{riskScore}</span>
            <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold">/ 100</span>
          </div>
          <div className="overflow-hidden h-2 sm:h-2.5 text-xs flex rounded-full bg-gray-100 border border-gray-200">
            <div
              style={{ width: `${riskScore}%` }}
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${
                riskScore > 80 ? 'bg-red-500' : riskScore > 50 ? 'bg-orange-500' : 'bg-emerald-500'
              }`}
            />
          </div>
        </div>

        {responseEta && (
          <div className="pt-1.5 border-t border-gray-100 text-[10px] sm:text-[11px] text-blue-700 font-bold flex items-center justify-between">
            <span>ETA:</span>
            <span className="bg-blue-50 px-1.5 py-0.5 rounded text-blue-700 border border-blue-200 font-mono text-[10px]">{responseEta}</span>
          </div>
        )}
      </div>

      {/* Bottom Floating Control Bar: 13-Scene Judge Demo Player - BRIGHT */}
      <div
        className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 z-10 pointer-events-auto backdrop-blur-2xl p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl space-y-2 sm:space-y-3 max-w-[calc(100vw-16px)] mx-auto"
        style={{
          background: 'rgba(255, 255, 255, 0.96)',
          border: '2px solid rgba(16, 185, 129, 0.35)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)'
        }}
      >
        {/* Timeline Scene Indicators */}
        <div className="flex items-center justify-start gap-1 sm:gap-1.5 overflow-x-auto pb-1 no-scrollbar touch-scroll">
          {[
            '1. India', '2. Mumbai', '3. Route', '4. Delhi', '5. NE Arrive', 
            '6. Moving', '7. 300m Warn', '8. Breach', '9. AI Risk', '10. SOS Lock', 
            '11. Dispatch', '12. Response', '13. Resolved'
          ].map((label, idx) => {
            const sceneNum = idx + 1;
            const isActive = currentScene === sceneNum;
            return (
              <button
                key={label}
                onClick={() => {
                  setIsPlaying(false);
                  executeScene(sceneNum);
                }}
                className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-bold transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md scale-105 font-black'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Master Playback & Scenario Controls */}
        <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-2 flex-wrap">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-[11px] sm:text-xs rounded-xl shadow-md transition-all flex items-center space-x-1"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : '▶ Play 3D Demo'}</span>
            </button>

            <button
              onClick={handleNext}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-[11px] sm:text-xs rounded-xl border border-gray-200 transition-colors flex items-center space-x-1 shadow-sm"
            >
              <span>Next</span>
              <SkipForward className="w-3 h-3" />
            </button>

            <button
              onClick={handleRestart}
              className="p-1.5 sm:p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 rounded-xl border border-gray-200 transition-colors shadow-sm"
              title="Restart Demo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-[10px] sm:text-[11px] text-gray-500 font-semibold hidden md:block">
            SIH Mode: <span className="text-emerald-700 font-bold">13-Scene Storyboard</span>
          </div>
        </div>
      </div>
    </div>
  );
}