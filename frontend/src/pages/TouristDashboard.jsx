import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MapView from '../components/MapView';
import MiniMap from '../components/MiniMap';
import DigitalIdCard from '../components/DigitalIdCard';
import SOSButtonModal from '../components/SOSButtonModal';
import WearableBandCard from '../components/WearableBandCard';
import Emergency112Modal from '../components/Emergency112Modal';
import BystanderAlertModal from '../components/BystanderAlertModal';
import OfflineGhostMeshModal from '../components/OfflineGhostMeshModal';
import SafarLogo from '../components/SafarLogo';
import DeadmanSwitch from '../components/DeadmanSwitch';
import LocalFareEstimator from '../components/LocalFareEstimator';
import RedZonePreEntryBanner from '../components/RedZonePreEntryBanner';
import { useBrowserGeolocation } from '../hooks/useBrowserGeolocation';
import { 
  ShieldCheck, MapPin, Navigation, AlertTriangle, Radio, Compass, 
  PhoneCall, Zap, WifiOff, Sparkles, ShieldAlert, Activity, Wifi, Shield,
  Phone, AlertCircle, Clock, HeartHandshake
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const SPRING = { type: 'spring', stiffness: 360, damping: 28 };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 360, damping: 26 }
  }
};

export default function TouristDashboard({
  tourist,
  allTourists = [],
  onSelectTourist,
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
  const { t } = useLanguage();
  const [currentTourist, setCurrentTourist] = useState(tourist);
  const [loading, setLoading] = useState(false);
  const [useLiveGpsMode, setUseLiveGpsMode] = useState(false);
  const [isAutoWandering, setIsAutoWandering] = useState(false);
  const [showMeshModal, setShowMeshModal] = useState(false);
  const [show112Modal, setShow112Modal] = useState(false);
  const [aiAdvice, setAiAdvice] = useState(null);
  const [aiAdviceLoading, setAiAdviceLoading] = useState(false);

  const wanderIntervalRef = React.useRef(null);
  const wanderStepRef = React.useRef(0);

  const { coords, isLive, permissionStatus, error: gpsError, startTracking, stopTracking } = useBrowserGeolocation();

  useEffect(() => {
    setCurrentTourist(tourist);
    // If tourist changed, cancel previous wandering interval
    if (isAutoWandering && wanderIntervalRef.current) {
      clearInterval(wanderIntervalRef.current);
      setIsAutoWandering(false);
    }
  }, [tourist]);

  // Live generative-AI explanation layer. Deterministic risk engine remains the source of truth; AI explains signals.
  useEffect(() => {
    const riskAnalysis = currentTourist?.riskAnalysis;
    if (!riskAnalysis) return;

    let cancelled = false;
    const loadAiAdvice = async () => {
      setAiAdviceLoading(true);
      try {
        const response = await fetch('/api/ai/safety-advice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            riskAnalysis,
            context: {
              routeDeviationKm: currentTourist?.routeDeviationKm ?? null,
              isLiveGps: currentTourist?.currentLocation?.isLiveGps ?? false
            }
          })
        });
        const data = await response.json();
        if (!cancelled && data.success) setAiAdvice(data.advice);
      } catch (error) {
        console.error('AI advice error:', error);
      } finally {
        if (!cancelled) setAiAdviceLoading(false);
      }
    };

    loadAiAdvice();
    return () => { cancelled = true; };
  }, [currentTourist?.riskAnalysis, currentTourist?.currentLocation?.isLiveGps, currentTourist?.routeDeviationKm]);

  useEffect(() => {
    return () => {
      if (wanderIntervalRef.current) clearInterval(wanderIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (useLiveGpsMode && isLive && coords) {
      onUpdateLocation(
        coords.lat,
        coords.lng,
        `Live Phone GPS Sensor (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`,
        coords.speedKmH,
        coords.headingDeg,
        true
      );
    }
  }, [coords, isLive, useLiveGpsMode]);

  const handleToggleLiveGps = () => {
    if (isAutoWandering) {
      clearInterval(wanderIntervalRef.current);
      setIsAutoWandering(false);
    }
    if (!useLiveGpsMode) {
      setUseLiveGpsMode(true);
      startTracking();
    } else {
      setUseLiveGpsMode(false);
      stopTracking();
      const baseLat = currentTourist?.currentLocation?.lat || 26.7922;
      const baseLng = currentTourist?.currentLocation?.lng || 82.1998;
      const baseAddr = currentTourist?.currentLocation?.address || 'Ayodhya Safe Tourism Hub';
      onUpdateLocation(baseLat, baseLng, baseAddr, 0, 0, false);
    }
  };

  const handleToggleAutoWander = () => {
    if (isAutoWandering) {
      if (wanderIntervalRef.current) clearInterval(wanderIntervalRef.current);
      setIsAutoWandering(false);
      const baseLat = currentTourist?.currentLocation?.lat || 26.7922;
      const baseLng = currentTourist?.currentLocation?.lng || 82.1998;
      const baseAddr = currentTourist?.currentLocation?.address || 'Safe Corridor';
      onUpdateLocation(baseLat, baseLng, baseAddr, 0, 0, false);
    } else {
      if (useLiveGpsMode) {
        setUseLiveGpsMode(false);
        stopTracking();
      }
      setIsAutoWandering(true);

      const baseLat = currentTourist?.currentLocation?.lat || 26.7922;
      const baseLng = currentTourist?.currentLocation?.lng || 82.1998;
      const baseAddr = currentTourist?.currentLocation?.address || 'Safe Corridor';

      // Perform initial step
      wanderStepRef.current += 1;
      const step = wanderStepRef.current;
      const angle = (step * 0.35) % (2 * Math.PI);
      const radius = 0.0012 + Math.sin(step * 0.4) * 0.0004;
      const nLat = Number((baseLat + Math.cos(angle) * radius).toFixed(6));
      const nLng = Number((baseLng + Math.sin(angle) * radius).toFixed(6));
      const heading = Math.round(((angle * 180 / Math.PI) + 90) % 360);
      const speed = Number((4.3 + Math.sin(step) * 1.1).toFixed(1));

      onUpdateLocation(
        nLat,
        nLng,
        `🚶 Live Walk: ${baseAddr}`,
        speed,
        heading,
        true
      );

      // Interval for periodic live wander
      if (wanderIntervalRef.current) clearInterval(wanderIntervalRef.current);
      wanderIntervalRef.current = setInterval(() => {
        wanderStepRef.current += 1;
        const s = wanderStepRef.current;
        const ang = (s * 0.35) % (2 * Math.PI);
        const rad = 0.0012 + Math.sin(s * 0.4) * 0.0004;
        const curLat = Number((baseLat + Math.cos(ang) * rad).toFixed(6));
        const curLng = Number((baseLng + Math.sin(ang) * rad).toFixed(6));
        const hdg = Math.round(((ang * 180 / Math.PI) + 90) % 360);
        const spd = Number((4.3 + Math.sin(s) * 1.1).toFixed(1));

        onUpdateLocation(
          curLat,
          curLng,
          `🚶 Live Walk: ${baseAddr}`,
          spd,
          hdg,
          true
        );
      }, 2800);
    }
  };

  const handleSimulate = async (type) => {
    if (useLiveGpsMode) {
      setUseLiveGpsMode(false);
      stopTracking();
    }
    if (isAutoWandering) {
      clearInterval(wanderIntervalRef.current);
      setIsAutoWandering(false);
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
  const isLiveGpsActive = (useLiveGpsMode && isLive) || isAutoWandering;
  const currentSpeed = currentTourist?.currentLocation?.speedKmH || 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-4 sm:py-5"
    >
      {/* ── Tourist Header Banner ── */}
      <motion.div
        variants={itemVariants}
        className="rounded-3xl px-5 py-4 sm:px-6 sm:py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.78)',
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
          border: '0.5px solid rgba(255,255,255,0.9)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.9)',
        }}
      >
        {/* Subtle tinted orbs */}
        <div
          className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(10,132,255,0.08) 0%, transparent 70%)', filter: 'blur(20px)' }}
        />
        <div
          className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(52,199,89,0.07) 0%, transparent 70%)', filter: 'blur(16px)' }}
        />

        <div className="flex items-start sm:items-center space-x-3 relative z-10 w-full md:w-auto">
          <SafarLogo size="sm" showText={false} animated={true} />
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-xl sm:text-2xl tracking-tight" style={{ color: '#1C1C1E', letterSpacing: '-0.025em' }}>
                {currentTourist?.fullName || 'Ananya Mishra'}
              </span>
              <span
                className="text-xs font-semibold px-2.5 py-0.5 rounded-lg"
                style={{ background: 'rgba(10,132,255,0.1)', color: '#0A84FF', border: '0.5px solid rgba(10,132,255,0.25)' }}
              >
                #{currentTourist?.touristId || 'TID-1035'}
              </span>
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center space-x-1.5"
                style={
                  isLiveGpsActive
                    ? { background: 'rgba(52,199,89,0.12)', color: '#248A3D', border: '0.5px solid rgba(52,199,89,0.3)' }
                    : { background: 'rgba(255,159,10,0.1)', color: '#CC7A00', border: '0.5px solid rgba(255,159,10,0.25)' }
                }
              >
                <Radio className="w-3 h-3" />
                <span>{isAutoWandering ? 'Live Walk' : useLiveGpsMode ? 'Phone GPS' : 'Simulator'}</span>
              </motion.span>
            </div>

            {/* Demo Location Switcher */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'rgba(60,60,67,0.5)' }}>Location:</span>
              <select
                value={currentTourist?.touristId || 'TID-1035'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'TID-REAL') {
                    if (isAutoWandering) { clearInterval(wanderIntervalRef.current); setIsAutoWandering(false); }
                    setUseLiveGpsMode(true); startTracking();
                  } else if (useLiveGpsMode) { setUseLiveGpsMode(false); stopTracking(); }
                  if (onSelectTourist) onSelectTourist(val);
                }}
                className="text-xs font-medium px-2.5 py-1.5 rounded-xl cursor-pointer focus:outline-none"
                style={{
                  background: 'rgba(120,120,128,0.1)',
                  border: '0.5px solid rgba(60,60,67,0.12)',
                  color: '#1C1C1E',
                  maxWidth: '100%',
                }}
              >
                <option value="TID-1035">🛕 Ayodhya — Ram Janmabhoomi</option>
                <option value="TID-1036">🏔️ Jammu — Vaishno Devi</option>
                <option value="TID-1039">🕌 Taj Mahal — Agra</option>
                <option value="TID-REAL">📍 Real-Time — Live GPS</option>
              </select>
            </div>

            <p className="text-xs flex items-center space-x-1.5" style={{ color: 'rgba(60,60,67,0.55)' }}>
              <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: '#FF9F0A' }} />
              <span className="truncate">{currentTourist?.currentLocation?.address || 'Ayodhya Safe Tourism Hub'}</span>
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 relative z-10 w-full md:w-auto justify-start md:justify-end">
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }} transition={SPRING}
            onClick={handleToggleAutoWander}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            style={
              isAutoWandering
                ? { background: '#34C759', color: 'white', boxShadow: '0 2px 10px rgba(52,199,89,0.35)' }
                : { background: 'rgba(52,199,89,0.1)', color: '#248A3D', border: '0.5px solid rgba(52,199,89,0.3)' }
            }
          >
            <span>{isAutoWandering ? '⏹' : '🚶‍♂️'}</span>
            <span>{isAutoWandering ? 'Stop Walk' : 'Live Walk'}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }} transition={SPRING}
            onClick={handleToggleLiveGps}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            style={
              useLiveGpsMode
                ? { background: '#0A84FF', color: 'white', boxShadow: '0 2px 10px rgba(10,132,255,0.4)' }
                : { background: 'rgba(10,132,255,0.08)', color: '#0A84FF', border: '0.5px solid rgba(10,132,255,0.25)' }
            }
          >
            <Compass className={`w-3.5 h-3.5 ${useLiveGpsMode ? 'animate-spin' : ''}`} />
            <span>Phone GPS</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }} transition={SPRING}
            onClick={() => setShowMeshModal(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            style={{ background: 'rgba(255,59,48,0.08)', color: '#FF3B30', border: '0.5px solid rgba(255,59,48,0.2)' }}
          >
            <WifiOff className="w-3.5 h-3.5" />
            <span>Mesh</span>
          </motion.button>

          {/* Risk badge */}
          <span
            className="text-xs font-bold px-3 py-1.5 rounded-xl uppercase tracking-wide"
            style={{
              background: riskLevel === 'CRITICAL' ? 'rgba(255,59,48,0.1)'
                : riskLevel === 'HIGH' ? 'rgba(255,159,10,0.1)'
                : riskLevel === 'MEDIUM' ? 'rgba(255,204,0,0.1)' : 'rgba(52,199,89,0.1)',
              color: riskLevel === 'CRITICAL' ? '#FF3B30'
                : riskLevel === 'HIGH' ? '#FF9F0A'
                : riskLevel === 'MEDIUM' ? '#FFCC00' : '#34C759',
              border: `0.5px solid ${riskLevel === 'CRITICAL' ? 'rgba(255,59,48,0.25)' : riskLevel === 'HIGH' ? 'rgba(255,159,10,0.25)' : 'rgba(52,199,89,0.25)'}`,
            }}
          >
            {riskLevel} {riskScore}/100
          </span>
        </div>
      </motion.div>

      {/* Permission Denied Warning Banner */}
      {gpsError && (
        <div className="p-4 bg-amber-50/95 border border-amber-300 rounded-2xl text-amber-900 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold text-gray-900 block">Location Sensor Alert</span>
              <p className="text-[11px] text-amber-800">{gpsError}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-white px-2.5 py-1 rounded-lg text-amber-700 border border-amber-200">
            Fallback Active
          </span>
        </div>
      )}

      {/* 🔴 High-Definition Red-Zone Pre-Entry Floating Motion Banner (Govt Synchronized Deadman) */}
      <RedZonePreEntryBanner
        tourist={currentTourist}
        proximityWarning={proxWarn}
        isDangerZone={currentTourist?.riskLevel === 'CRITICAL' || currentTourist?.riskLevel === 'HIGH'}
      />

      {/* Main Grid: Left Column (2 cols) & Right Column (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): SOS + Live Map + Telemetry MiniMap + Evaluator Simulator */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Prominent Emergency SOS Trigger Button */}
          <motion.div variants={itemVariants}>
            <SOSButtonModal
              tourist={currentTourist}
              activeSosIncident={activeSosIncident}
              onTriggerSos={onTriggerSos}
              onCancelSos={onCancelSos}
              nearbyServices={emergencyServices}
            />
          </motion.div>

          {/* Interactive Leaflet Map */}
          <motion.div
            variants={itemVariants}
            className="rounded-3xl p-4 space-y-3 apple-card"
          >
            <div
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3"
              style={{ borderBottom: '0.5px solid rgba(60,60,67,0.08)' }}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(10,132,255,0.1)', border: '0.5px solid rgba(10,132,255,0.2)' }}
                >
                  <Navigation className="w-4 h-4" style={{ color: '#0A84FF' }} />
                </div>
                <div>
                  <h2 className="text-base font-semibold" style={{ color: '#1C1C1E', letterSpacing: '-0.01em' }}>Live Safety Map</h2>
                  <p className="text-xs" style={{ color: 'rgba(60,60,67,0.5)' }}>Safe Corridors · Danger Zones · Live Tracking</p>
                </div>
              </div>
              <div
                className="flex items-center space-x-2 text-xs px-3 py-1.5 rounded-xl font-mono"
                style={{ background: 'rgba(120,120,128,0.08)', border: '0.5px solid rgba(60,60,67,0.08)' }}
              >
                <span style={{ color: 'rgba(60,60,67,0.6)' }}>Speed: <strong style={{ color: '#34C759' }}>{currentSpeed} km/h</strong></span>
                <span style={{ color: 'rgba(60,60,67,0.2)' }}>·</span>
                <strong style={{ color: currentSpeed > 0 ? '#FF9F0A' : 'rgba(60,60,67,0.5)' }}>{currentSpeed > 0 ? 'Moving 🚶' : 'Stationed 📍'}</strong>
              </div>
            </div>

            <MapView
              tourists={allTourists && allTourists.length > 0 ? allTourists : (currentTourist ? [currentTourist] : [])}
              geofences={geofences}
              selectedTourist={currentTourist}
              emergencyServices={emergencyServices}
              height="480px"
            />
          </motion.div>

          {/* ⏳ Automated Deadman's Switch (2h Timer, 15m Check-in, Auto-Arm on Red Zones) */}
          <motion.div variants={itemVariants}>
            <DeadmanSwitch
              tourist={currentTourist}
              isDangerZone={currentTourist?.riskLevel === 'CRITICAL' || currentTourist?.riskLevel === 'HIGH' || !!proxWarn}
              isLowNetwork={false}
              onTriggerSos={onTriggerSos}
            />
          </motion.div>

          {/* 🛺 Local Transport Budget & Anti-Scam Auto/Cab Fare Guide */}
          <motion.div variants={itemVariants}>
            <LocalFareEstimator currentTourist={currentTourist} />
          </motion.div>

          {/* Live Telemetry Inspector */}
          <motion.div
            variants={itemVariants}
            className="apple-card p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold flex items-center space-x-2" style={{ color: '#1C1C1E', letterSpacing: '-0.01em' }}>
                <Radio className="w-4 h-4 animate-pulse" style={{ color: '#34C759' }} />
                <span>Live Telemetry</span>
              </span>
              <span className="text-[10px] font-mono" style={{ color: 'rgba(60,60,67,0.45)' }}>
                {currentTourist?.currentLocation?.lastUpdated ? new Date(currentTourist.currentLocation.lastUpdated).toLocaleTimeString() : 'Just now'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <MiniMap
                center={currentTourist?.currentLocation || { lat: 26.1445, lng: 91.7362 }}
                geofences={geofences}
                title="GPS Location"
                height="140px"
              />

              <div className="space-y-1.5 text-xs p-3 rounded-2xl" style={{ background: 'rgba(120,120,128,0.06)', border: '0.5px solid rgba(60,60,67,0.08)' }}>
                {[
                  { label: 'Sensor Mode', value: isLiveGpsActive ? 'LIVE GPS 🟢' : 'DEMO 🟡', color: isLiveGpsActive ? '#34C759' : '#FF9F0A' },
                  { label: 'Speed', value: `${currentTourist?.currentLocation?.speedKmH || 0} km/h`, color: '#1C1C1E' },
                  { label: 'Movement', value: (currentTourist?.currentLocation?.speedKmH || 0) > 0 ? 'Moving 🚶' : 'Stationed 📍', color: '#1C1C1E' },
                  { label: 'GPS Accuracy', value: `± ${currentTourist?.currentLocation?.accuracyMeters || (isLiveGpsActive ? 8 : 15)}m`, color: '#1C1C1E' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between py-0.5">
                    <span style={{ color: 'rgba(60,60,67,0.55)' }}>{label}</span>
                    <span className="font-semibold font-mono" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>



          {/* SIH Evaluator Zone Simulator */}
          <motion.div
            variants={itemVariants}
            className="apple-card p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold flex items-center gap-2" style={{ color: '#1C1C1E', letterSpacing: '-0.01em' }}>
                <Sparkles className="w-4 h-4" style={{ color: '#FF9F0A' }} />
                <span>Zone Simulator</span>
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg" style={{ background: 'rgba(255,159,10,0.1)', color: '#CC7A00', border: '0.5px solid rgba(255,159,10,0.2)' }}>
                SIH Evaluator
              </span>
            </div>
            <p className="text-xs" style={{ color: 'rgba(60,60,67,0.5)' }}>Test geofence proximity alerts and zone breaches:</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { label: '🟢 Safe', type: 'SAFE',          color: '#34C759', bg: 'rgba(52,199,89,0.08)'    },
                { label: '🟡 300m', type: 'APPROACH_300M', color: '#FFCC00', bg: 'rgba(255,204,0,0.08)'    },
                { label: '🟠 150m', type: 'APPROACH_150M', color: '#FF9F0A', bg: 'rgba(255,159,10,0.08)'   },
                { label: '🔴 Breach', type: 'RESTRICTED',  color: '#FF3B30', bg: 'rgba(255,59,48,0.08)'    },
                { label: '⚠️ Route', type: 'DEVIATION',    color: '#5E5CE6', bg: 'rgba(94,92,230,0.08)', span: true },
              ].map(({ label, type, color, bg, span }) => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.92 }}
                  transition={SPRING}
                  disabled={loading}
                  onClick={() => handleSimulate(type)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all text-center ${span ? 'col-span-2 sm:col-span-1' : ''}`}
                  style={{ background: bg, color, border: `0.5px solid ${color}40` }}
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </motion.div>
          {/* Ghost-Mesh Card */}
          <motion.div
            variants={itemVariants}
            className="apple-card p-4 space-y-3 relative overflow-hidden"
          >
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none" style={{ background: 'rgba(255,59,48,0.08)', filter: 'blur(20px)' }} />
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-sm font-semibold flex items-center gap-2" style={{ color: '#FF3B30', letterSpacing: '-0.01em' }}>
                <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
                  <Radio className="w-4 h-4" style={{ color: '#FF3B30' }} />
                </motion.div>
                <span>0-Signal Ghost-Mesh</span>
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg" style={{ background: 'rgba(255,59,48,0.08)', color: '#FF3B30', border: '0.5px solid rgba(255,59,48,0.2)' }}>P2P BLE 5.3</span>
            </div>
            <p className="text-xs relative z-10" style={{ color: 'rgba(60,60,67,0.55)' }}>
              In 0-signal valleys, relay encrypted SOS packets peer-to-peer until reaching a forest ranger uplink.
            </p>
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={SPRING}
              onClick={() => setShowMeshModal(true)}
              className="relative z-10 w-full py-3 text-white font-semibold text-sm rounded-2xl flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #FF3B30, #FF375F)', boxShadow: '0 4px 16px rgba(255,59,48,0.35)' }}
            >
              <Zap className="w-4 h-4" />
              <span>Launch Ghost-Mesh Simulator</span>
            </motion.button>
          </motion.div>

        </div>

        {/* Right Column (1 Col): Digital ID + Explainable AI Panel + 112 Gateway + IoT Wearable + Emergency Services */}
        <div className="space-y-6">
          
          {/* Holographic Digital Tourist ID */}
          <motion.div variants={itemVariants}>
            <DigitalIdCard digitalId={digitalId} tourist={currentTourist} />
          </motion.div>

          {/* IoT / Wearable Smart Safety Band Card */}
          <motion.div variants={itemVariants}>
            <WearableBandCard />
          </motion.div>

          {/* Emergency Services Directory */}
          <motion.div
            variants={itemVariants}
            className="apple-card p-4 space-y-3"
          >
            <span className="text-sm font-semibold flex items-center gap-2" style={{ color: '#1C1C1E', letterSpacing: '-0.01em' }}>
              <PhoneCall className="w-4 h-4" style={{ color: '#34C759' }} />
              <span>Nearby Emergency Services</span>
            </span>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {emergencyServices.map((es) => (
                <div
                  key={es.id}
                  className="p-2.5 rounded-2xl flex items-center justify-between text-xs"
                  style={{ background: 'rgba(120,120,128,0.06)', border: '0.5px solid rgba(60,60,67,0.08)' }}
                >
                  <div>
                    <span className="font-semibold block" style={{ color: '#1C1C1E' }}>{es.name}</span>
                    <span className="text-[11px] font-mono" style={{ color: '#34C759' }}>📞 {es.phone}</span>
                  </div>
                  <span className="font-mono font-semibold px-2 py-0.5 rounded-lg shrink-0" style={{ background: 'rgba(10,132,255,0.08)', color: '#0A84FF', fontSize: 10 }}>
                    {es.distanceKm} km
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

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

      {/* Offline Ghost-Mesh Modal */}
      <OfflineGhostMeshModal
        isOpen={showMeshModal}
        onClose={() => setShowMeshModal(false)}
      />
    </motion.div>
  );
}
