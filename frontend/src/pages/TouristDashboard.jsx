import React, { useState, useEffect } from 'react';
import MapView from '../components/MapView';
import SOSButtonModal from '../components/SOSButtonModal';
import OfflineGhostMeshModal from '../components/OfflineGhostMeshModal';
import SafarLogo from '../components/SafarLogo';
import { useBrowserGeolocation } from '../hooks/useBrowserGeolocation';
import { ShieldCheck, MapPin, Navigation, AlertTriangle, Radio, Compass, PhoneCall, Zap, WifiOff, Sparkles, ShieldAlert } from 'lucide-react';

export default function TouristDashboard({
  tourist,
  geofences = [],
  emergencyServices = [],
  activeSosIncident,
  onUpdateLocation,
  onSimulateZone,
  onSimulateDeviation,
  onTriggerSos,
  onCancelSos
}) {
  const [currentTourist, setCurrentTourist] = useState(tourist);
  const [loading, setLoading] = useState(false);
  const [useLiveGpsMode, setUseLiveGpsMode] = useState(false);
  const [showMeshModal, setShowMeshModal] = useState(false);

  // Native Browser Geolocation Hook
  const { coords, isLive, permissionStatus, error: gpsError, startTracking, stopTracking } = useBrowserGeolocation();

  useEffect(() => {
    setCurrentTourist(tourist);
  }, [tourist]);

  // When live GPS coordinates change, post telemetry to API
  useEffect(() => {
    if (useLiveGpsMode && isLive && coords) {
      onUpdateLocation(
        coords.lat,
        coords.lng,
        `Live GPS Sensor (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`,
        coords.speedKmH,
        coords.headingDeg,
        true
      );
    }
  }, [coords, isLive, useLiveGpsMode]);

  const handleToggleLiveGps = () => {
    if (!useLiveGpsMode) {
      setUseLiveGpsMode(true);
      startTracking();
    } else {
      setUseLiveGpsMode(false);
      stopTracking();
      onUpdateLocation(26.1445, 91.7362, 'Guwahati Safe Tourism Hub', 0, 0, false);
    }
  };

  const handleSimulate = async (type) => {
    if (useLiveGpsMode) {
      setUseLiveGpsMode(false);
      stopTracking();
    }

    setLoading(true);
    try {
      if (type === 'DEVIATION') {
        await onSimulateDeviation();
      } else {
        await onSimulateZone(type);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const proxWarn = currentTourist?.riskAnalysis?.proximityWarning;
  const isLiveGpsActive = useLiveGpsMode && isLive;
  const currentSpeed = currentTourist?.currentLocation?.speedKmH || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Banner: S.A.F.A.R. Tourist Safety Hub */}
      <div className="bg-safar-navy-900 border border-safar-shield-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <SafarLogo size="sm" showText={false} animated={true} />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-black text-2xl text-white tracking-tight">{currentTourist?.fullName || 'Rohan Verma'}</span>
              <span className="text-xs font-mono font-extrabold bg-safar-navy-850 text-safar-saffron-400 px-2.5 py-0.5 rounded-lg border border-safar-saffron-500/30">
                PASS #{currentTourist?.touristId || 'TID-1024'}
              </span>

              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center space-x-1 border ${
                isLiveGpsActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 glow-green'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                <Radio className={`w-3 h-3 ${isLiveGpsActive ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
                <span>{isLiveGpsActive ? '🟢 Live Phone GPS Active' : '🟡 Simulator Mode'}</span>
              </span>
            </div>

            <p className="text-xs text-slate-300 flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-safar-saffron-400 shrink-0" />
              <span>Location: <strong className="text-white">{currentTourist?.currentLocation?.address || 'Guwahati Safe Tourism Hub'}</strong></span>
            </p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleToggleLiveGps}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all border ${
              useLiveGpsMode
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 glow-green'
                : 'bg-safar-navy-850 hover:bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            <Compass className={`w-4 h-4 ${useLiveGpsMode ? 'animate-spin' : ''}`} />
            <span>{useLiveGpsMode ? 'Live Phone GPS Active' : 'Enable Live Phone GPS'}</span>
          </button>

          <button
            onClick={() => setShowMeshModal(true)}
            className="px-4 py-2 rounded-xl font-extrabold text-xs bg-gradient-to-r from-rose-600/30 to-amber-500/30 hover:from-rose-600/50 hover:to-amber-500/50 text-amber-300 border border-amber-500/40 shadow-md transition-all flex items-center space-x-1.5"
          >
            <WifiOff className="w-4 h-4 text-amber-400" />
            <span>No-Network Mesh SOS</span>
          </button>
        </div>
      </div>

      {/* Real-Time Restricted Area Proximity Warning Banner */}
      {proxWarn && (
        <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xl ${
          proxWarn.severity === 'CRITICAL'
            ? 'bg-red-950/90 border-red-500 text-red-100 glow-red'
            : proxWarn.severity === 'HIGH'
            ? 'bg-orange-950/90 border-orange-500 text-orange-100'
            : 'bg-amber-950/90 border-amber-500 text-amber-100'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-red-400 animate-pulse" />
            </div>
            <div>
              <span className="font-black text-sm block tracking-wide">
                {proxWarn.tier === 'APPROACH' ? '🟡 RESTRICTED AREA APPROACHING (300M BUFFER)' : proxWarn.tier === 'IMMINENT' ? '🟠 HIGH-RISK ZONE IMMINENT (150M BUFFER)' : '🔴 RESTRICTED AREA BREACH DETECTED!'}
              </span>
              <p className="text-xs text-slate-200 mt-0.5">{proxWarn.message}</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-mono font-bold bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 inline-block">
              Distance: <strong className="text-amber-400">{proxWarn.distanceMeters} meters</strong>
            </span>
          </div>
        </div>
      )}

      {/* Main Tourist Focus: 1-Tap Emergency SOS Banner */}
      <SOSButtonModal
        tourist={currentTourist}
        activeSosIncident={activeSosIncident}
        onTriggerSos={onTriggerSos}
        onCancelSos={onCancelSos}
        nearbyServices={emergencyServices}
      />

      {/* Primary Map: Live Safety Map & Restricted Geo-Fences */}
      <div className="bg-safar-navy-900 border border-safar-shield-500/30 rounded-3xl p-5 space-y-3 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-safar-shield-400" />
            <div>
              <h2 className="text-base font-black text-white">Live Safety Map & Restricted Danger Zones</h2>
              <p className="text-xs text-slate-400">Green Safe Paths • Orange Caution Corridors • Red Restricted Border Areas (MaxZoom 22)</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="text-slate-300">Speed: <strong className="text-emerald-400">{currentSpeed} km/h</strong></span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">Status: <strong className="text-safar-saffron-400">{currentSpeed > 0 ? 'Moving 🚶' : 'Stationed 📍'}</strong></span>
          </div>
        </div>

        {/* High-Zoom Map Component */}
        <MapView
          tourists={currentTourist ? [currentTourist] : []}
          geofences={geofences}
          selectedTourist={currentTourist}
          emergencyServices={emergencyServices}
          height="520px"
        />
      </div>

      {/* Two Essential Cards: Restricted Area Movement Simulator + Offline Mesh Rescue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Restricted Area Test Bar */}
        <div className="bg-safar-navy-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-safar-saffron-400" />
              <span>Test Restricted Zone Proximity Warning</span>
            </span>
            <span className="text-[10px] font-mono text-safar-saffron-400 bg-safar-saffron-500/10 px-2 py-0.5 rounded border border-safar-saffron-500/30">
              Evaluator Controls
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Simulate moving towards a restricted zone to test automatic acoustic and visual warnings:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <button
              disabled={loading}
              onClick={() => handleSimulate('SAFE')}
              className="py-2 px-2 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all text-center"
            >
              🟢 Safe Zone
            </button>
            <button
              disabled={loading}
              onClick={() => handleSimulate('APPROACH_300M')}
              className="py-2 px-2 rounded-xl bg-yellow-950/50 hover:bg-yellow-900/70 border border-yellow-500/40 text-yellow-300 text-xs font-bold transition-all text-center"
            >
              🟡 Approach 300m
            </button>
            <button
              disabled={loading}
              onClick={() => handleSimulate('APPROACH_150M')}
              className="py-2 px-2 rounded-xl bg-orange-950/50 hover:bg-orange-900/70 border border-orange-500/40 text-orange-300 text-xs font-bold transition-all text-center"
            >
              🟠 Approach 150m
            </button>
            <button
              disabled={loading}
              onClick={() => handleSimulate('RESTRICTED')}
              className="py-2 px-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/50 text-red-300 text-xs font-bold transition-all text-center"
            >
              🔴 Breach Zone
            </button>
          </div>
        </div>

        {/* Card 2: Offline Ghost-Mesh Rescue (0-Network) */}
        <div className="bg-gradient-to-br from-rose-950/60 via-safar-navy-900 to-amber-950/50 border border-amber-500/40 rounded-3xl p-5 space-y-3 shadow-xl flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Zero-Network Ghost-Mesh Rescue</span>
              </span>
              <span className="text-[10px] font-mono text-rose-300 font-bold bg-rose-950/90 px-2 py-0.5 rounded border border-rose-500/40">
                P2P BLE 5.3 + Wi-Fi
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              In deep valleys with 0 cellular signal, relay encrypted distress packets peer-to-peer across nearby hikers' phones until reaching a forest ranger uplink.
            </p>
          </div>

          <button
            onClick={() => setShowMeshModal(true)}
            className="w-full py-2.5 bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Launch Offline Ghost-Mesh Simulator</span>
          </button>
        </div>

      </div>

      {/* Offline Ghost-Mesh Rescue Modal Simulator */}
      <OfflineGhostMeshModal
        isOpen={showMeshModal}
        onClose={() => setShowMeshModal(false)}
      />
    </div>
  );
}
