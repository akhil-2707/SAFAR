import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radio, SignalZero, WifiOff, ShieldCheck, Activity, CheckCircle2, 
  AlertTriangle, PhoneCall, Volume2, Compass, Cpu, Zap, ArrowRight, 
  Share2, MapPin, X, BatteryCharging, Battery, Radar, UserCheck, ShieldAlert
} from 'lucide-react';

export default function OfflineGhostMeshModal({ isOpen, onClose, tourist, isRedZoneTriggered = false }) {
  const [activeTab, setActiveTab] = useState('mesh'); // 'mesh' | 'solo_beacon'
  
  // Mesh Relay State
  const [activeStep, setActiveStep] = useState(0); // 0: Ready, 1: Hop 1, 2: Hop 2, 3: Delivered to Uplink
  const [isRelaying, setIsRelaying] = useState(false);
  const [isUltrasonicActive, setIsUltrasonicActive] = useState(false);
  const [dispatchResult, setDispatchResult] = useState(null);

  // Solo Duty-Cycle Beacon State
  const [beaconActive, setBeaconActive] = useState(true);
  const [dutyState, setDutyState] = useState('TRANSMITTING'); // 'TRANSMITTING' (3s) | 'SLEEPING' (12s)
  const [cycleSecondsRemaining, setCycleSecondsRemaining] = useState(3);
  const [simulatedDistance, setSimulatedDistance] = useState(65); // meters from rescue team
  const [rescueLocked, setRescueLocked] = useState(false);

  // Duty Cycle Loop: 3s TRANSMIT -> 12s SLEEP -> repeat
  useEffect(() => {
    if (!beaconActive) return;

    const interval = setInterval(() => {
      setCycleSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (dutyState === 'TRANSMITTING') {
            setDutyState('SLEEPING');
            return 12; // 12 seconds sleep
          } else {
            setDutyState('TRANSMITTING');
            return 3; // 3 seconds transmit
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [beaconActive, dutyState]);

  if (!isOpen) return null;

  // Calculate RSSI based on simulated distance (close: -40dBm, far: -95dBm)
  const calculateRssi = (distance) => {
    // 5m -> -38dBm, 150m -> -95dBm
    const ratio = Math.min(1, Math.max(0, (distance - 5) / 145));
    return Math.round(-38 - ratio * 57);
  };

  const currentRssi = calculateRssi(simulatedDistance);

  const handleTriggerMeshSOS = async () => {
    setIsRelaying(true);
    setActiveStep(1);

    try {
      setTimeout(() => setActiveStep(2), 1200);
      setTimeout(() => setActiveStep(3), 2400);

      const res = await fetch('/api/mesh-rescue/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          touristId: tourist?.touristId || 'TID-1024',
          touristName: tourist?.fullName || 'Active Tourist',
          bloodGroup: tourist?.bloodGroup || 'O+ Positive',
          emergencyType: isRedZoneTriggered ? 'RESTRICTED_RED_ZONE_BREACH' : 'INJURED_IMMOBILE_IN_GORGE',
          coords: {
            lat: tourist?.currentLocation?.lat || 25.5684,
            lng: tourist?.currentLocation?.lng || 94.0624
          },
          batteryLevel: 42
        })
      });

      const data = await res.json();
      if (data.success) {
        setTimeout(() => {
          setDispatchResult(data.dispatch);
          setIsRelaying(false);
        }, 3000);
      }
    } catch (err) {
      console.error('Mesh broadcast error:', err);
      setIsRelaying(false);
    }
  };

  const resetSimulator = () => {
    setActiveStep(0);
    setIsRelaying(false);
    setDispatchResult(null);
  };

  return typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md overflow-y-auto select-none font-sans">
      <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl max-w-4xl w-full p-6 space-y-5 shadow-2xl relative text-gray-900 overflow-hidden my-auto"
          style={{
            background: 'rgba(255, 255, 255, 0.98)',
            border: '1.5px solid rgba(239, 68, 68, 0.35)',
            boxShadow: '0 25px 70px rgba(0, 0, 0, 0.2)'
          }}
        >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge & Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Radio className="w-6 h-6 text-red-500 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h2 className="text-xl font-black text-gray-900 tracking-tight">
                  Offline Ghost-Mesh & Solo S&R Beacon
                </h2>
                <span className="text-[10px] font-mono font-black bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full border border-red-200 uppercase">
                  Zero Network / 0-Bar SOS
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Autonomous Peer Hop Mesh + 72-Hour Duty-Cycled BLE Search Radar for Isolated Trails
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-red-50 px-3 py-1.5 rounded-xl border border-red-200">
            <SignalZero className="w-4 h-4 text-red-600 shrink-0" />
            <span className="text-[11px] font-mono text-gray-700 font-semibold">
              Cellular: <strong className="text-red-600 font-bold">0% (DEAD ZONE)</strong>
            </span>
          </div>
        </div>

        {/* Red Zone Auto-Engaged Notice */}
        {isRedZoneTriggered && (
          <div className="bg-red-50 border border-red-300 rounded-2xl p-3 flex items-center space-x-2.5 text-red-900 shadow-sm">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 animate-bounce-short" />
            <p className="text-xs font-bold leading-tight">
              🚨 <span className="font-black text-red-700">Restricted Red Zone Breach Detected:</span> Ghost-Mesh Relay was auto-engaged to maintain emergency telemetry over offline peer-to-peer radio channels.
            </p>
          </div>
        )}

        {/* Protocol Mode Switcher Tabs */}
        <div className="flex items-center space-x-2 bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
          <button
            onClick={() => setActiveTab('mesh')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'mesh'
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-violet-600" />
            <span>Mode 1: Peer Multi-Hop Mesh (Trails with Other Hikers)</span>
          </button>

          <button
            onClick={() => setActiveTab('solo_beacon')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'solo_beacon'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Radar className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Mode 2: Solo Tourist Duty-Cycle Beacon & Police Radar</span>
          </button>
        </div>

        {/* TAB 1: PEER MULTI-HOP MESH */}
        {activeTab === 'mesh' && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Interactive Mesh Topology Visualization */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
                  <Share2 className="w-4 h-4 text-violet-600" />
                  <span>Live P2P Mesh Hop Architecture (Dzukou Valley Corridor)</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  AES-256 Encrypted Packets
                </span>
              </div>

              {/* 4 Nodes Interactive Flow */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
                {/* Node 1: Stranded Tourist */}
                <div className={`p-3.5 rounded-2xl border transition-all ${
                  activeStep >= 1 ? 'bg-rose-50 border-rose-300 shadow-md' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-rose-700 uppercase">Node 1: Origin</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                  </div>
                  <span className="text-xs font-black block text-gray-900">Rohan Verma (TID-1024)</span>
                  <span className="text-[10px] text-gray-500 block font-mono">📍 Dzukou Gorge (25.5684° N)</span>
                  <div className="mt-2 text-[10px] font-mono bg-white p-1.5 rounded-lg border border-gray-200 text-rose-700 font-bold flex items-center space-x-1">
                    <WifiOff className="w-3 h-3 text-rose-500" />
                    <span>Cellular: 0 Bars</span>
                  </div>
                </div>

                {/* Node 2: Peer Hiker 1 */}
                <div className={`p-3.5 rounded-2xl border transition-all ${
                  activeStep >= 2 ? 'bg-amber-50 border-amber-300 shadow-md' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-amber-700 uppercase">Node 2: Relay 1</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${activeStep >= 1 ? 'bg-amber-500 animate-pulse' : 'bg-gray-300'}`}></span>
                  </div>
                  <span className="text-xs font-black block text-gray-900">Hiker (Priya S.)</span>
                  <span className="text-[10px] text-gray-500 block font-mono">Distance: 85m away</span>
                  <div className="mt-2 text-[10px] font-mono bg-white p-1.5 rounded-lg border border-gray-200 text-amber-800 font-bold">
                    Protocol: BLE 5.3 Coded PHY
                  </div>
                </div>

                {/* Node 3: Trek Guide 2 */}
                <div className={`p-3.5 rounded-2xl border transition-all ${
                  activeStep >= 3 ? 'bg-cyan-50 border-cyan-300 shadow-md' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-cyan-700 uppercase">Node 3: Relay 2</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${activeStep >= 2 ? 'bg-cyan-500 animate-pulse' : 'bg-gray-300'}`}></span>
                  </div>
                  <span className="text-xs font-black block text-gray-900">Guide (Tashi D.)</span>
                  <span className="text-[10px] text-gray-500 block font-mono">Distance: 115m away</span>
                  <div className="mt-2 text-[10px] font-mono bg-white p-1.5 rounded-lg border border-gray-200 text-cyan-800 font-bold">
                    Protocol: Wi-Fi Direct Peer Hop
                  </div>
                </div>

                {/* Node 4: Forest Ranger Post / Internet Gateway */}
                <div className={`p-3.5 rounded-2xl border transition-all ${
                  dispatchResult ? 'bg-emerald-50 border-emerald-400 shadow-md' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">Node 4: Gateway</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${dispatchResult ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                  </div>
                  <span className="text-xs font-black block text-gray-900">Forest Ranger Station</span>
                  <span className="text-[10px] text-gray-500 block font-mono">Uplink: 4G / Satellite</span>
                  <div className="mt-2 text-[10px] font-mono bg-white p-1.5 rounded-lg border border-gray-200 text-emerald-800 font-bold">
                    Status: {dispatchResult ? '112 ERSS CONNECTED 🟢' : 'Listening...'}
                  </div>
                </div>
              </div>

              {/* Hop Progress Animation Bar */}
              {isRelaying && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-gray-700 font-mono">
                    <span className="flex items-center space-x-1.5">
                      <Zap className="w-4 h-4 text-amber-500 animate-bounce" />
                      <span>Hopping encrypted distress packets across offline peer mesh...</span>
                    </span>
                    <span className="text-amber-700 font-bold">Hop {activeStep} of 3</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500"
                      initial={{ width: '0%' }}
                      animate={{ width: activeStep === 1 ? '33%' : activeStep === 2 ? '66%' : '100%' }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Live Rescue Confirmation Ticket */}
            {dispatchResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <span className="text-sm font-black text-emerald-950">
                      Distress Relay Confirmed: Mountain Rescue Unit Dispatched!
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-300">
                    ETA: ~{dispatchResult.uplinkConfirmation.etaMinutes} mins
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-200 shadow-sm">
                    <span className="text-[10px] text-gray-500 block font-semibold">ERSS-112 Ticket</span>
                    <span className="text-emerald-700 font-bold">{dispatchResult.uplinkConfirmation.erss112Ticket}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-200 shadow-sm">
                    <span className="text-[10px] text-gray-500 block font-semibold">Assigned Unit</span>
                    <span className="text-gray-900 font-bold">{dispatchResult.uplinkConfirmation.assignedRescueTeam}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-200 shadow-sm">
                    <span className="text-[10px] text-gray-500 block font-semibold">Relay Gateway Node</span>
                    <span className="text-gray-900 font-bold">{dispatchResult.uplinkConfirmation.gatewayNode}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-200 shadow-sm">
                    <span className="text-[10px] text-gray-500 block font-semibold">Total Hops & Latency</span>
                    <span className="text-cyan-700 font-bold">{dispatchResult.totalHops} Hops (71ms)</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Acoustic Ultrasonic / Infrasonic Audio Beacon Widget */}
            <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isUltrasonicActive ? 'bg-purple-600 text-white shadow-md animate-pulse' : 'bg-white text-purple-600 border border-purple-200'
                }`}>
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Acoustic High-Frequency Sound Beacon (18.5 kHz)
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      isUltrasonicActive ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'bg-white text-gray-600 border border-gray-200'
                    }`}>
                      {isUltrasonicActive ? 'EMITTING SONAR PULSE' : 'OFFLINE STANDBY'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                    Emits inaudible ultrasonic audio pulses via smartphone speaker detectable by rescue search dogs & ranger microphones up to 350 meters in thick fog.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsUltrasonicActive(!isUltrasonicActive)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 shadow-sm ${
                  isUltrasonicActive
                    ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md'
                    : 'bg-white text-purple-700 hover:bg-purple-50 border border-purple-300'
                }`}
              >
                {isUltrasonicActive ? '🔊 Stop Sonar Pulse' : '📡 Arm Ultrasonic Pulse'}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-[11px] text-gray-500 font-medium flex items-center space-x-1.5">
                <Cpu className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Curve25519 encrypted peer hop. Zero cellular network required.</span>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                {dispatchResult && (
                  <button
                    onClick={resetSimulator}
                    className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors border border-gray-200"
                  >
                    Reset Simulator
                  </button>
                )}

                <button
                  disabled={isRelaying}
                  onClick={handleTriggerMeshSOS}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center space-x-2 shadow-lg ${
                    isRelaying
                      ? 'bg-amber-600 text-white animate-pulse'
                      : 'bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white hover:scale-105 active:scale-95'
                  }`}
                >
                  <Radio className="w-4 h-4" />
                  <span>{isRelaying ? 'Relaying Packet Across Mesh...' : 'Broadcast Ghost-Mesh SOS (Demo)'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: SOLO DUTY-CYCLED BEACON & RESCUE RADAR (User Audio Request) */}
        {activeTab === 'solo_beacon' && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Solo Scenario Explanation Alert */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <strong className="block font-black text-amber-950 uppercase tracking-wide">
                    Isolated Lost Tourist Scenario: No Nearby Peers Found
                  </strong>
                  <span className="text-amber-800">
                    When you are completely alone with zero phones within radio range, the app activates the <strong>Duty-Cycle Battery Saver Beacon</strong>. It emits a brief 3s BLE pulse, then sleeps for 12s, keeping battery alive for <strong>72+ hours</strong> while police/NDRF search teams track you!
                  </span>
                </div>
              </div>

              <button
                onClick={() => setBeaconActive(!beaconActive)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 shadow-sm ${
                  beaconActive
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {beaconActive ? '🟢 Beacon Active' : '⚪ Beacon Paused'}
              </button>
            </div>

            {/* 2-Column Grid: Duty-Cycle Pulse Monitor vs Rescue Direction Finder Radar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Column A: Duty-Cycle Battery Saver Transmitter Engine */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4 relative overflow-hidden border border-slate-700 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BatteryCharging className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                      Duty-Cycle Pulse Engine
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    72+ HOURS LONGEVITY
                  </span>
                </div>

                {/* Animated State Indicator Box */}
                <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 flex flex-col items-center justify-center space-y-3 text-center relative">
                  {dutyState === 'TRANSMITTING' ? (
                    <>
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <motion.span
                          className="absolute inset-0 rounded-full bg-red-500/30"
                          animate={{ scale: [1, 2], opacity: [0.8, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        <motion.span
                          className="absolute inset-0 rounded-full bg-rose-500/50"
                          animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                        />
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-lg relative z-10">
                          <Radio className="w-6 h-6 animate-pulse" />
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-widest text-red-400 block">
                          ⚡ TRANSMITTING BLE SOS PULSE ({cycleSecondsRemaining}s remaining)
                        </span>
                        <span className="text-[10px] text-slate-300 font-mono">
                          Broadcasting GPS [26.2800°N, 91.5200°E] + Medical ID
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-slate-700/60 border border-slate-600 flex items-center justify-center text-slate-400">
                        <Battery className="w-7 h-7 text-cyan-400" />
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-widest text-cyan-400 block">
                          💤 ULTRA-LOW POWER STANDBY ({cycleSecondsRemaining}s remaining)
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          BLE Radio Dormant • Saving 88% Battery Power
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Duty Cycle Timeline Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Active Cycle: <strong>3s Transmit / 12s Sleep</strong></span>
                    <span className="text-amber-400 font-bold">15s Total Period</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                    <div className="w-[20%] bg-rose-500 h-full"></div>
                    <div className="w-[80%] bg-cyan-500/40 h-full"></div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span className="text-rose-400 font-bold">● 20% Tx Time</span>
                    <span className="text-cyan-400 font-bold">● 80% Sleep Time (Power Saver)</span>
                  </div>
                </div>

                {/* Longevity comparison card */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-semibold">Continuous BLE</span>
                    <span className="text-rose-400 font-black text-sm">~6-8 Hours</span>
                    <span className="text-[9px] text-slate-500 block">Battery drains dead</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60">
                    <span className="text-[10px] text-emerald-300 block font-semibold">Duty-Cycled S.A.F.A.R.</span>
                    <span className="text-emerald-400 font-black text-sm">72+ Hours</span>
                    <span className="text-[9px] text-emerald-300 block">3 Full Survival Days</span>
                  </div>
                </div>
              </div>

              {/* Column B: Police / NDRF Rescue Team Handheld Direction Finder (Radar & RSSI Meter) */}
              <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-4 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Compass className="w-4 h-4 text-violet-600 animate-spin" style={{ animationDuration: '10s' }} />
                      <span className="text-xs font-black uppercase tracking-wider text-gray-800">
                        Police / NDRF S&R Direction Finder
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200">
                      Simulated Scanner
                    </span>
                  </div>

                  {/* Distance control slider */}
                  <div className="space-y-1 pt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 font-medium">Search Team Proximity:</span>
                      <span className="font-mono font-black text-violet-700">{simulatedDistance} Meters</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="150"
                      value={simulatedDistance}
                      onChange={(e) => setSimulatedDistance(Number(e.target.value))}
                      className="w-full accent-violet-600 cursor-pointer"
                    />
                    <div className="flex items-center justify-between text-[9px] text-gray-400 font-mono">
                      <span>3m (Immediate Proximity)</span>
                      <span>150m (Edge of BLE Range)</span>
                    </div>
                  </div>

                  {/* Live RSSI Signal Meter */}
                  <div className="mt-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">Received Signal (RSSI)</span>
                      <span className={`text-sm font-black font-mono ${
                        currentRssi > -60 ? 'text-emerald-600' : currentRssi > -80 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {currentRssi} dBm
                      </span>
                    </div>

                    {/* RSSI Signal Bar */}
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          currentRssi > -60
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                            : currentRssi > -80
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                            : 'bg-gradient-to-r from-rose-500 to-red-500'
                        }`}
                        style={{ width: `${Math.round(((currentRssi + 100) / 70) * 100)}%` }}
                      />
                    </div>

                    <div className="text-[10px] text-gray-600 flex items-center justify-between">
                      <span>Signal State: <strong>{currentRssi > -60 ? 'STRONG (Target Direct)' : currentRssi > -80 ? 'MODERATE (Approaching)' : 'WEAK (Search Sector)'}</strong></span>
                      <span className="font-mono text-gray-500">Bearing: 318° NW</span>
                    </div>
                  </div>
                </div>

                {/* Target Pinpoint Action */}
                <div className="space-y-2 pt-2">
                  {rescueLocked ? (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Target Pinpointed! NDRF Unit 7 dispatched to coordinates with medical stretcher.</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRescueLocked(true)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs transition-all shadow-md flex items-center justify-center space-x-2"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Lock Target Coordinates & Dispatch Rescue</span>
                    </button>
                  )}
                </div>

              </div>

            </div>

          </motion.div>
        )}

        </motion.div>
      </div>
    </div>,
    document.body
  ) : null;
}
