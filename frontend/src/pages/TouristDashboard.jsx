import React, { useState, useEffect } from 'react';
import MapView from '../components/MapView';
import MiniMap from '../components/MiniMap';
import DigitalIdCard from '../components/DigitalIdCard';
import ExplainableAIPanel from '../components/ExplainableAIPanel';
import SOSButtonModal from '../components/SOSButtonModal';
import WearableBandCard from '../components/WearableBandCard';
import Emergency112Modal from '../components/Emergency112Modal';
import BystanderAlertModal from '../components/BystanderAlertModal';
import OfflineGhostMeshModal from '../components/OfflineGhostMeshModal';
import SafarLogo from '../components/SafarLogo';
import { useBrowserGeolocation } from '../hooks/useBrowserGeolocation';
import { ShieldCheck, MapPin, Navigation, PhoneCall, AlertTriangle, CheckCircle2, Sparkles, Activity, Radio, Clock, Compass, AlertCircle, Phone, HeartHandshake, Zap, SignalZero, WifiOff } from 'lucide-react';

export default function TouristDashboard({
  tourist,
  digitalId,
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
  const [show112Modal, setShow112Modal] = useState(false);
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
      // Revert to default Guwahati Safe Hub coordinates
      onUpdateLocation(26.1445, 91.7362, 'Guwahati Entry Checkpoint', 0, 0, false);
    }
  };

  const handleSimulate = async (type) => {
    // Turn off live GPS mode if user manually clicks a simulation button
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

  const riskScore = currentTourist?.riskScore || 15;
  const riskLevel = currentTourist?.riskLevel || 'LOW';
  const proxWarn = currentTourist?.riskAnalysis?.proximityWarning;
  const isLiveGpsActive = useLiveGpsMode && isLive;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Banner: Tourist Safety Status Header */}
      <div className="bg-safar-navy-900 border border-safar-shield-500/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <SafarLogo size="sm" showText={false} animated={true} />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-2xl text-white">{currentTourist?.fullName || 'Rohan Verma'}</span>
              <span className="text-xs font-mono font-bold bg-safar-navy-850 text-safar-saffron-400 px-2.5 py-0.5 rounded border border-safar-saffron-500/30">
                S.A.F.A.R. PASS #{currentTourist?.touristId || 'TID-1024'}
              </span>

              {/* Strict Live vs Demo Badge */}
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center space-x-1 border ${
                isLiveGpsActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 glow-green'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                <Radio className={`w-3 h-3 ${isLiveGpsActive ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
                <span>{isLiveGpsActive ? '🟢 LIVE GPS SENSOR' : '🟡 SIMULATOR MODE'}</span>
              </span>
            </div>

            <p className="text-xs text-slate-300 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-safar-saffron-400 shrink-0" />
              <span>Current Corridor: <strong className="text-white">{currentTourist?.currentLocation?.address || 'Guwahati Safe Tourism Hub'}</strong></span>
            </p>
          </div>
        </div>

        {/* Live Browser GPS Sensor Toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggleLiveGps}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 shadow-lg transition-all border ${
              useLiveGpsMode
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 glow-green'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Compass className={`w-4 h-4 ${useLiveGpsMode ? 'animate-spin' : ''}`} />
            <span>{useLiveGpsMode ? 'Live GPS Sensor Active' : 'Enable Real Live Browser GPS'}</span>
          </button>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Safety Status</span>
            <span
              className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-block border ${
                riskLevel === 'CRITICAL'
                  ? 'bg-red-500/20 text-red-400 border-red-500/40 glow-red'
                  : riskLevel === 'HIGH'
                  ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                  : riskLevel === 'MEDIUM'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              }`}
            >
              {riskLevel} RISK ({riskScore}/100)
            </span>
          </div>
        </div>
      </div>

      {/* Permission Denied Warning Banner */}
      {gpsError && (
        <div className="p-3.5 bg-amber-950/80 border border-amber-500/60 rounded-2xl text-amber-200 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">Location Permission Alert</span>
              <p className="text-[11px] text-amber-300">{gpsError}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-slate-900 px-2.5 py-1 rounded text-amber-400 border border-slate-800">
            Fallback Demo Active
          </span>
        </div>
      )}

      {/* Pre-Entry Proximity Warning Banner */}
      {proxWarn && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-xl ${
          proxWarn.severity === 'CRITICAL'
            ? 'bg-red-950/80 border-red-500 text-red-100 glow-red'
            : proxWarn.severity === 'HIGH'
            ? 'bg-orange-950/80 border-orange-500 text-orange-100'
            : 'bg-amber-950/80 border-amber-500 text-amber-100'
        }`}>
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div>
              <span className="font-extrabold text-sm block">
                {proxWarn.tier === 'APPROACH' ? '🟡 RESTRICTED AREA AHEAD' : proxWarn.tier === 'IMMINENT' ? '🟠 HIGH RISK AREA APPROACHING' : '🔴 ZONE BREACH ALERT'}
              </span>
              <p className="text-xs">{proxWarn.message}</p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 shrink-0">
            {proxWarn.distanceMeters}m Away
          </span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): SOS + Live Map + MiniMap Telemetry Inspector */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Prominent Emergency SOS Trigger Button */}
          <SOSButtonModal
            tourist={currentTourist}
            activeSosIncident={activeSosIncident}
            onTriggerSos={onTriggerSos}
            onCancelSos={onCancelSos}
            nearbyServices={emergencyServices}
          />

          {/* Interactive Leaflet Map */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span>Live Safety Map & Geo-fence Corridors</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">OpenStreetMap Tiles</span>
            </div>

            <MapView
              tourists={currentTourist ? [currentTourist] : []}
              geofences={geofences}
              selectedTourist={currentTourist}
              emergencyServices={emergencyServices}
              height="440px"
            />
          </div>

          {/* MiniMap Proximity & Live Telemetry Inspector */}
          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>Live Telemetry & Sensor Inspector</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Updated: {currentTourist?.currentLocation?.lastUpdated ? new Date(currentTourist.currentLocation.lastUpdated).toLocaleTimeString() : 'Just now'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Embedded MiniMap Card */}
              <MiniMap
                center={currentTourist?.currentLocation || { lat: 26.1445, lng: 91.7362 }}
                geofences={geofences}
                title="Target Tourist GPS Location"
                height="150px"
              />

              {/* Telemetry Stats */}
              <div className="space-y-2 text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Sensor Mode:</span>
                  <span className={`font-bold ${isLiveGpsActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isLiveGpsActive ? 'LIVE BROWSER GPS 🟢' : 'DEMO SIMULATOR 🟡'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Current Speed:</span>
                  <span className="font-semibold text-slate-200">{currentTourist?.currentLocation?.speedKmH || 0} km/h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Movement Status:</span>
                  <span className="font-semibold text-slate-200">
                    {(currentTourist?.currentLocation?.speedKmH || 0) > 0 ? 'Moving 🚶' : 'Stationed 📍'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">GPS Accuracy Radius:</span>
                  <span className="font-mono text-slate-300">± {currentTourist?.currentLocation?.accuracyMeters || (isLiveGpsActive ? 8 : 15)} meters</span>
                </div>
              </div>
            </div>
          </div>

          {/* SIH Judge Pre-Entry Zone Approach Simulator */}
          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Evaluator Pre-Entry Warning & Movement Simulator
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                disabled={loading}
                onClick={() => handleSimulate('SAFE')}
                className="p-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all text-center"
              >
                🟢 Safe Zone
              </button>
              <button
                disabled={loading}
                onClick={() => handleSimulate('APPROACH_300M')}
                className="p-2 rounded-xl bg-yellow-950/40 hover:bg-yellow-900/60 border border-yellow-500/30 text-yellow-300 text-xs font-bold transition-all text-center"
              >
                🟡 Approach 300m
              </button>
              <button
                disabled={loading}
                onClick={() => handleSimulate('APPROACH_150M')}
                className="p-2 rounded-xl bg-orange-950/40 hover:bg-orange-900/60 border border-orange-500/30 text-orange-300 text-xs font-bold transition-all text-center"
              >
                🟠 Approach 150m
              </button>
              <button
                disabled={loading}
                onClick={() => handleSimulate('RESTRICTED')}
                className="p-2 rounded-xl bg-red-950/50 hover:bg-red-900/70 border border-red-500/40 text-red-300 text-xs font-bold transition-all text-center"
              >
                🔴 Breach Zone
              </button>
              <button
                disabled={loading}
                onClick={() => handleSimulate('DEVIATION')}
                className="p-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all text-center col-span-2 sm:col-span-1"
              >
                ⚠️ Route Offset
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Digital ID + Explainable AI Panel + Emergency Services */}
        <div className="space-y-6">
          
          {/* Holographic Digital Tourist ID */}
          <DigitalIdCard digitalId={digitalId} tourist={currentTourist} />

          {/* Explainable AI Risk Panel */}
          <ExplainableAIPanel riskAnalysis={currentTourist?.riskAnalysis} />

          {/* 0-Network Offline Ghost-Mesh Rescue Protocol Card */}
          <div className="bg-gradient-to-r from-rose-950/70 via-navy-900 to-amber-950/60 border border-amber-500/40 rounded-2xl p-4 space-y-2.5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Offline Ghost-Mesh Rescue (0-Bars)</span>
              </span>
              <span className="text-[10px] font-mono text-rose-300 font-bold bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/30">
                P2P BLE 5.3 Active
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              When trapped in mountain dead zones with 0 cellular network, relay encrypted SOS packets via nearby hikers' phones.
            </p>
            <button
              onClick={() => setShowMeshModal(true)}
              className="w-full py-2 bg-gradient-to-r from-rose-600/40 via-amber-600/40 to-rose-600/40 hover:from-rose-600/60 hover:to-amber-600/60 text-amber-200 border border-amber-500/50 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-lg"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Launch Ghost-Mesh P2P Simulator</span>
            </button>
          </div>

          {/* 112 India National Emergency API Gateway Trigger */}
          <div className="bg-gradient-to-r from-red-950/60 to-navy-900 border border-red-500/40 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Phone className="w-4 h-4" />
                <span>112 India ERSS Integration</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                API Handshake Live
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Direct API handshake with India's National Emergency Response Support System (ERSS-112).
            </p>
            <button
              onClick={() => setShow112Modal(true)}
              className="w-full py-2 bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/40 rounded-xl font-bold text-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>Inspect 112 ERSS Live Gateway</span>
            </button>
          </div>

          {/* IoT / Wearable Smart Safety Band Card */}
          <WearableBandCard />

          {/* Emergency Services List */}
          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 block">
              Nearby Emergency Services
            </span>
            <div className="space-y-2">
              {emergencyServices.map((es) => (
                <div key={es.id} className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-200 block">{es.name}</span>
                    <span className="text-[11px] text-emerald-400 font-mono font-semibold">📞 {es.phone}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-700 px-2 py-0.5 rounded shrink-0">
                    {es.distanceKm} km
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* 112 India ERSS Live Gateway Modal */}
      <Emergency112Modal
        isOpen={show112Modal}
        onClose={() => setShow112Modal(false)}
        location={currentTourist?.currentLocation?.address}
      />

      {/* Opt-in Community Safety Net Bystander Alert */}
      <BystanderAlertModal
        isOpen={!!activeSosIncident}
        incident={activeSosIncident}
        onClose={() => {}}
      />

      {/* Offline Ghost-Mesh Rescue Modal Simulator */}
      <OfflineGhostMeshModal
        isOpen={showMeshModal}
        onClose={() => setShowMeshModal(false)}
      />
    </div>
  );
}
