import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Siren, PhoneCall, ShieldAlert, Mic, MicOff, AlertOctagon, CheckCircle2, 
  MapPin, Radio, Users, Volume2, ArrowLeft, Clock, ShieldCheck, HeartPulse
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SPRING = { type: 'spring', stiffness: 360, damping: 28 };

export default function SosPage({
  tourist,
  activeSosIncident,
  onTriggerSos,
  onCancelSos,
  emergencyServices = []
}) {
  const [isVoiceActive, setIsVoiceActive] = useState(true);
  const [countdown, setCountdown] = useState(null);
  const [isTriggering, setIsTriggering] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [micRecognizedWord, setMicRecognizedWord] = useState(null);

  // Simulated Voice SOS word detection
  useEffect(() => {
    if (!isVoiceActive) return;
    const interval = setInterval(() => {
      // Periodic subtle listening indicator
      const sampleDistress = ['Listening for "Bachao"...', 'Listening for "Help"...', 'Background Sound: Normal'];
      const randomMsg = sampleDistress[Math.floor(Math.random() * sampleDistress.length)];
      setMicRecognizedWord(randomMsg);
    }, 4000);
    return () => clearInterval(interval);
  }, [isVoiceActive]);

  // Handle SOS Click with 5-second abort countdown window
  const handleStartSos = () => {
    if (activeSosIncident) return;
    setCountdown(5);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // Trigger emergency SOS
      setIsTriggering(true);
      if (onTriggerSos) onTriggerSos('BUTTON_PRESS', tourist);
      setCountdown(null);
      setIsTriggering(false);
    }
  }, [countdown]);

  const handleAbortCountdown = () => {
    setCountdown(null);
  };

  const handleConfirmCancel = () => {
    if (onCancelSos) {
      onCancelSos(cancelReason || 'False Alarm / Situation Resolved');
    }
    setShowCancelModal(false);
    setCancelReason('');
  };

  const isEmergencyActive = Boolean(activeSosIncident);
  const locationAddr = tourist?.currentLocation?.address || 'Ayodhya Safe Tourism Corridor';
  const lat = tourist?.currentLocation?.lat?.toFixed(5) || '26.79220';
  const lng = tourist?.currentLocation?.lng?.toFixed(5) || '82.19980';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.99 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold mb-1" style={{ color: '#FF3B30' }}>
            <Link to="/tourist-dashboard" className="hover:underline">Dashboard</Link>
            <span style={{ color: 'rgba(60,60,67,0.3)' }}>/</span>
            <span>Emergency Mission Cockpit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: '#1C1C1E', letterSpacing: '-0.025em' }}>
            Emergency SOS & 112 ERSS Gateway
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(60,60,67,0.6)' }}>
            1-Touch distress broadcast linked to National 112 Command Desk & Nearest Responders.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="flex h-3 w-3 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isEmergencyActive ? 'bg-red-500' : 'bg-emerald-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isEmergencyActive ? 'bg-red-600' : 'bg-emerald-500'}`}></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: isEmergencyActive ? '#FF3B30' : '#34C759' }}>
            {isEmergencyActive ? '🚨 SOS ACTIVE & DISPATCHED' : 'READY · STANDBY 24×7'}
          </span>
        </div>
      </div>

      {/* 🔴 ACTIVE EMERGENCY BANNER (If SOS Incident is Live) */}
      <AnimatePresence>
        {isEmergencyActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="p-6 rounded-3xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,59,48,0.12), rgba(255,255,255,0.95))',
              border: '2px solid rgba(255,59,48,0.5)',
              boxShadow: '0 8px 32px rgba(255,59,48,0.2)',
            }}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-red-600 text-white shadow-lg animate-pulse">
                  <Siren className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-red-600 tracking-tight">
                    CRITICAL DISTRESS SIGNAL ACTIVE
                  </h3>
                  <p className="text-xs text-gray-700 mt-1">
                    Emergency Incident ID: <strong>{activeSosIncident?.id || 'INC-LIVE-SOS'}</strong> · GPS Telemetry locked at ({lat}, {lng}).
                  </p>
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                    ✓ 112 ERSS Police Dispatch notified · ETA: ~4.2 mins
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={SPRING}
                onClick={() => setShowCancelModal(true)}
                className="px-5 py-2.5 rounded-2xl bg-white border border-red-300 text-red-600 font-bold text-xs shadow-md flex items-center gap-2 hover:bg-red-50"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>I Am Safe (Cancel SOS)</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main SOS Trigger Center Card */}
      <div className="p-6 sm:p-12 rounded-2xl sm:rounded-3xl apple-card flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8 relative overflow-hidden">
        {/* Soft Ambient Red Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,59,48,0.12) 0%, transparent 70%)', filter: 'blur(30px)' }}
        />

        <div className="space-y-2 relative z-10 max-w-md">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
            Emergency Trigger
          </span>
          <h2 className="text-lg sm:text-2xl font-black text-gray-900">
            Hold or Press to Broadcast SOS
          </h2>
          <p className="text-xs text-gray-500">
            Instantly alerts nearest police van, sends automated SMS with live GPS link to your emergency contacts, and sounds audible alarm.
          </p>
        </div>

        {/* The Massive Pulsing SOS Button */}
        <div className="relative flex items-center justify-center py-2 sm:py-4">
          {/* Concentric Radar Rings */}
          <span className="wave-ring w-48 h-48 sm:w-56 sm:h-56 -top-4 -left-4" />
          <span className="wave-ring w-60 h-60 sm:w-72 sm:h-72 -top-10 -left-10 sm:-top-12 sm:-left-12" />

          {countdown !== null ? (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-36 h-36 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center bg-red-600 text-white shadow-2xl relative z-20 cursor-pointer"
            >
              <span className="text-4xl sm:text-5xl font-black">{countdown}</span>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mt-1">Tap to Cancel</span>
              <button
                onClick={handleAbortCountdown}
                className="mt-1.5 sm:mt-2 text-[10px] font-bold px-3 py-1 rounded-full bg-white/20 hover:bg-white/30"
              >
                Abort
              </button>
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              transition={SPRING}
              onClick={handleStartSos}
              disabled={isEmergencyActive}
              className="w-36 h-36 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center text-white relative z-20 shadow-2xl transition-all select-none"
              style={{
                background: isEmergencyActive
                  ? 'linear-gradient(145deg, #8E8E93, #636366)'
                  : 'linear-gradient(145deg, #FF3B30, #FF2D55)',
                boxShadow: isEmergencyActive
                  ? '0 4px 20px rgba(0,0,0,0.2)'
                  : '0 12px 40px rgba(255,59,48,0.5), 0 0 0 10px rgba(255,59,48,0.15)',
              }}
            >
              <Siren className="w-10 h-10 sm:w-14 sm:h-14 mb-1 animate-pulse" />
              <span className="text-2xl sm:text-3xl font-black tracking-wider">SOS</span>
              <span className="text-[9px] sm:text-[10px] font-semibold opacity-90 tracking-wide mt-0.5">
                {isEmergencyActive ? 'INCIDENT LIVE' : 'PRESS FOR HELP'}
              </span>
            </motion.button>
          )}
        </div>

        {/* Current Locked GPS Sensor Coordinates */}
        <div className="flex items-center space-x-2 text-[11px] sm:text-xs font-mono p-2.5 sm:p-3 rounded-2xl bg-gray-50 border border-gray-200/80 relative z-10 max-w-full">
          <MapPin className="w-4 h-4 text-red-500 shrink-0" />
          <span className="text-gray-700 truncate">
            <strong>Location:</strong> {locationAddr} ({lat}, {lng})
          </span>
        </div>
      </div>

      {/* Voice SOS Equalizer Card */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl apple-card space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0 ${isVoiceActive ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
              {isVoiceActive ? <Mic className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" /> : <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900">
                Voice-Activated SOS Recognition
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-500">
                AI acoustic listener detects shouted distress keywords like <strong>"Bachao"</strong> or <strong>"Help"</strong>.
              </p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsVoiceActive(!isVoiceActive)}
            className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl text-xs font-bold shrink-0 self-end sm:self-auto"
            style={{
              background: isVoiceActive ? 'rgba(52,199,89,0.12)' : 'rgba(120,120,128,0.12)',
              color: isVoiceActive ? '#248A3D' : '#636366',
              border: `0.5px solid ${isVoiceActive ? 'rgba(52,199,89,0.3)' : 'rgba(120,120,128,0.2)'}`,
            }}
          >
            {isVoiceActive ? 'Listening 🟢' : 'Muted ⚪'}
          </motion.button>
        </div>

        {/* Audio Equalizer Frequency Waveform Bars */}
        {isVoiceActive && (
          <div className="flex items-center justify-center space-x-1.5 sm:space-x-2 py-2.5 sm:py-3 px-2 bg-gray-50/80 rounded-2xl border border-gray-200/60 overflow-hidden">
            <div className="w-1.5 rounded-full bg-blue-500 eq-bar-1" />
            <div className="w-1.5 rounded-full bg-blue-600 eq-bar-2" />
            <div className="w-1.5 rounded-full bg-indigo-500 eq-bar-3" />
            <div className="w-1.5 rounded-full bg-blue-500 eq-bar-4" />
            <div className="w-1.5 rounded-full bg-indigo-600 eq-bar-5" />
            <div className="w-1.5 rounded-full bg-blue-400 eq-bar-2" />
            <div className="w-1.5 rounded-full bg-blue-600 eq-bar-1" />
            <span className="text-[10px] sm:text-xs font-mono text-gray-500 ml-2 sm:ml-4 truncate">
              {micRecognizedWord || 'Microphone Active · Zero False Alarm Threshold'}
            </span>
          </div>
        )}
      </div>

      {/* Emergency Hotlines Directory */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-gray-900 tracking-tight">
          Direct One-Touch Emergency Numbers
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'National ERSS', num: '112', desc: 'Police · Fire · Medical', color: '#FF3B30', bg: 'rgba(255,59,48,0.08)' },
            { label: 'Tourist Helpline', num: '1363', desc: '24×7 Multilingual Support', color: '#0A84FF', bg: 'rgba(10,132,255,0.08)' },
            { label: 'Ambulance EMS', num: '108', desc: 'Emergency Medical Transport', color: '#34C759', bg: 'rgba(52,199,89,0.08)' },
            { label: 'Women Safety', num: '1090', desc: 'Dedicated Tourist Protection', color: '#BF5AF2', bg: 'rgba(191,90,242,0.08)' },
          ].map((h) => (
            <motion.a
              key={h.num}
              href={`tel:${h.num}`}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={SPRING}
              className="p-4 rounded-2xl apple-card flex flex-col justify-between space-y-2 block"
              style={{ background: h.bg, border: `0.5px solid ${h.color}35` }}
            >
              <div>
                <span className="text-xs font-bold text-gray-500 block uppercase tracking-wide">{h.label}</span>
                <span className="text-2xl font-black font-mono block" style={{ color: h.color }}>{h.num}</span>
              </div>
              <p className="text-[11px] text-gray-600">{h.desc}</p>
            </motion.a>
          ))}
        </div>
      </div>

      {/* Cancel SOS Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="apple-sheet p-6 max-w-md w-full space-y-4"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Resolve Emergency Signal</h3>
                  <p className="text-xs text-gray-500">Confirm your safety to cancel police dispatch</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Reason for cancellation:</label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Accidental press / Safe at hotel"
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Keep SOS Active
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-md hover:bg-emerald-700"
                >
                  Confirm I Am Safe
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
