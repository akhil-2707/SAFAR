import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, ShieldAlert, WifiOff, Bell, Mail, MessageSquare, CheckCircle2, 
  AlertTriangle, Play, RefreshCw, Volume2, VolumeX, Shield, Radio, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SPRING = { type: 'spring', stiffness: 360, damping: 28 };
const TOTAL_SECONDS = 7200; // 2 Hours = 7200s

export default function DeadmanSwitchPage({ tourist, onTriggerSos }) {
  const [isArmed, setIsArmed] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState(7200);
  const [checkInNotice, setCheckInNotice] = useState(false);
  const [emailNotificationSent, setEmailNotificationSent] = useState(true);
  const [smsSent, setSmsSent] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [triggerReason, setTriggerReason] = useState('Low Cellular Signal & Restricted Zone Proximity');

  // Countdown timer effect
  useEffect(() => {
    if (!isArmed) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Timeout reached -> Trigger SOS
          if (onTriggerSos) onTriggerSos('DEADMAN_TIMEOUT', tourist);
          return 0;
        }
        // If 15 minutes left (<= 900s), show pop-up check-in notice
        if (prev <= 900 && !checkInNotice) {
          setCheckInNotice(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isArmed, checkInNotice]);

  const handleResetTimer = () => {
    setSecondsRemaining(TOTAL_SECONDS);
    setCheckInNotice(false);
  };

  const handleSimulate15MinWarning = () => {
    setSecondsRemaining(890); // 14 mins 50s
    setCheckInNotice(true);
  };

  const handleTestSiren = () => {
    setSoundEnabled(true);
    // Web Audio API synthesized alert beep
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio Context error:', e);
    }
    setTimeout(() => setSoundEnabled(false), 500);
  };

  // Format Hours, Minutes, Seconds
  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;
  const progressPercent = ((TOTAL_SECONDS - secondsRemaining) / TOTAL_SECONDS) * 100;
  const strokeDashoffset = 440 - (440 * (100 - progressPercent)) / 100;

  const isLowTime = secondsRemaining <= 900; // <= 15 min

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
          <div className="flex items-center space-x-2 text-xs font-semibold mb-1" style={{ color: '#5E5CE6' }}>
            <Link to="/tourist-dashboard" className="hover:underline">Dashboard</Link>
            <span style={{ color: 'rgba(60,60,67,0.3)' }}>/</span>
            <span>Safety Sentinel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: '#1C1C1E', letterSpacing: '-0.025em' }}>
            Automated Deadman's Switch
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(60,60,67,0.6)' }}>
            Auto-arms upon entering low-network or red zones · 2-hour countdown with 15-min check-in.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
          </span>
          <span className="text-xs font-bold font-mono text-indigo-600">
            AUTO-ARMED: LOW NETWORK CORRIDOR
          </span>
        </div>
      </div>

      {/* ⚠️ 15-MINUTE POPUP CHECK-IN BANNER */}
      <AnimatePresence>
        {checkInNotice && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="p-6 rounded-3xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,159,10,0.15), rgba(255,255,255,0.98))',
              border: '2px solid rgba(255,159,10,0.6)',
              boxShadow: '0 10px 30px rgba(255,159,10,0.2)',
            }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md animate-bounce">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-amber-900 tracking-tight">
                    15 MINUTES REMAINING — CHECK-IN REQUIRED!
                  </h3>
                  <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                    You entered a low-signal area. Please tap <strong>"I Am Safe"</strong> to reset your 2-hour safety timer. If unconfirmed, emergency SMS & Gmail alerts will be dispatched to authorities.
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={SPRING}
                onClick={handleResetTimer}
                className="px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-lg flex items-center gap-2 hover:bg-emerald-700 shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>I Am Safe — Reset 2-Hour Timer</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Timer Display Card */}
      <div className="p-5 sm:p-12 rounded-2xl sm:rounded-3xl apple-card flex flex-col items-center justify-center text-center space-y-5 sm:space-y-6 relative overflow-hidden">
        
        {/* Soft Ambient Indigo Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(94,92,230,0.1) 0%, transparent 70%)', filter: 'blur(35px)' }}
        />

        {/* Circular Progress Arc */}
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            {/* Background Track */}
            <circle
              cx="80"
              cy="80"
              r="70"
              className="text-gray-200"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Progress Track */}
            <circle
              cx="80"
              cy="80"
              r="70"
              className={isLowTime ? 'text-amber-500 transition-all duration-500' : 'text-indigo-600 transition-all duration-500'}
              strokeWidth="10"
              strokeDasharray={440}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Center Digital Clock Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1 select-none">
            <Clock className={`w-6 h-6 sm:w-7 sm:h-7 ${isLowTime ? 'text-amber-500 animate-pulse' : 'text-indigo-600'}`} />
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-gray-900">
              {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {isLowTime ? 'URGENT CHECK-IN' : 'SAFETY COUNTDOWN'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 relative z-10 pt-2 w-full max-w-xs sm:max-w-none">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            transition={SPRING}
            onClick={handleResetTimer}
            className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-indigo-600 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 hover:bg-indigo-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset 2-Hour Timer</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            transition={SPRING}
            onClick={handleSimulate15MinWarning}
            className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl apple-card text-gray-700 font-bold text-xs flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Simulate 15-Min Check-in</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            transition={SPRING}
            onClick={handleTestSiren}
            className="px-4 py-2.5 sm:px-4 sm:py-3 rounded-2xl apple-card text-gray-700 font-bold text-xs flex items-center justify-center gap-2"
            title="Play Audio Alarm Beep"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-red-500" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
            <span>Test Siren</span>
          </motion.button>
        </div>
      </div>

      {/* Automated Emergency Dispatch Channel Logs */}
      <div className="p-6 rounded-3xl apple-card space-y-4">
        <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Radio className="w-4 h-4 text-indigo-600" />
          <span>Automated Outbound Dispatch Channels</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Gmail Log Card */}
          <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-gray-800">
                <Mail className="w-4 h-4 text-red-500" />
                <span>Gmail Emergency Notification</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Recipient: <strong>{tourist?.email || 'emergency.contact@safetour.gov.in'}</strong> & Emergency Kin.
            </p>
            <p className="text-[11px] font-mono text-gray-500">
              "Subject: S.A.F.A.R. Alert - Low Network Check-in Pending for {tourist?.fullName || 'Tourist'}"
            </p>
          </div>

          {/* SMS Log Card */}
          <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-gray-800">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                <span>SMS Cell Broadcast</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                STANDBY
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Target: <strong>{tourist?.emergencyContact?.phone || '+91 98765 43210'}</strong>
            </p>
            <p className="text-[11px] font-mono text-gray-500">
              Dispatches encrypted GPS coordinates automatically if 2h timer expires.
            </p>
          </div>
        </div>
      </div>

      {/* How It Protects You Informational Card */}
      <div className="p-6 rounded-3xl apple-card space-y-3">
        <div className="flex items-center space-x-2 text-indigo-600">
          <Shield className="w-5 h-5" />
          <h4 className="text-sm font-bold text-gray-900">How the Deadman's Switch Protects You</h4>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          In remote valleys and high-risk trails where phone battery may die or mobile connectivity is lost, the SAFAR central cloud monitors this heartbeat. If the tourist does not check in before the 2-hour window closes, the system automatically escalates a level-1 search alert to the nearest forest ranger checkpoint and sends distress emails to family contacts.
        </p>
      </div>
    </motion.div>
  );
}
