import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Clock, CheckCircle2, MapPin, Radio, Bell, 
  Send, Sparkles, AlertTriangle, X, ChevronDown, ChevronUp, ShieldCheck
} from 'lucide-react';

const SPRING = { type: 'spring', stiffness: 380, damping: 26 };
const TOTAL_SECONDS = 7200; // 2 Hours

export default function RedZonePreEntryBanner({ 
  tourist, 
  proximityWarning, 
  onCheckInSuccess,
  isDangerZone 
}) {
  const [session, setSession] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(TOTAL_SECONDS);
  const [isMinimized, setIsMinimized] = useState(false);
  const [checkedInAlert, setCheckedInAlert] = useState(false);
  const [transmitting, setTransmitting] = useState(false);
  const [govtNotified, setGovtNotified] = useState(false);

  const activeTid = tourist?.touristId || 'TID-1035';
  const shouldShow = Boolean(proximityWarning || isDangerZone || tourist?.riskLevel === 'CRITICAL' || tourist?.riskLevel === 'HIGH');

  // 1. Auto-transmit location to Govt Command Desk when entering 100-200m buffer
  useEffect(() => {
    if (!shouldShow) return;

    let cancelled = false;
    const transmitPreEntry = async () => {
      setTransmitting(true);
      try {
        const res = await fetch('/api/deadman/pre-entry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            touristId: activeTid,
            touristName: tourist?.fullName || 'Active Tourist',
            zoneName: proximityWarning?.zoneName || 'Kamrup Restricted Border Buffer (Red Zone)',
            lat: tourist?.currentLocation?.lat || 26.2800,
            lng: tourist?.currentLocation?.lng || 91.5200,
            address: tourist?.currentLocation?.address || '150m Red Zone Pre-Entry Buffer',
            distanceMeters: proximityWarning?.distanceMeters || 150
          })
        });
        const data = await res.json();
        if (!cancelled && data.success && data.session) {
          setSession(data.session);
          setSecondsRemaining(data.session.remainingSeconds || TOTAL_SECONDS);
          setGovtNotified(true);
        }
      } catch (err) {
        console.warn('Pre-entry transmit error:', err);
      } finally {
        if (!cancelled) setTransmitting(false);
      }
    };

    transmitPreEntry();
    return () => { cancelled = true; };
  }, [shouldShow, activeTid, proximityWarning?.distanceMeters]);

  // 2. Countdown Timer
  useEffect(() => {
    if (!shouldShow) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [shouldShow]);

  // 3. Check-In: Tap "I Am Safe"
  const handleCheckIn = async () => {
    try {
      const res = await fetch('/api/deadman/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          touristId: activeTid,
          notes: 'Tourist verified conscious & safe in 150m Red Zone Buffer'
        })
      });
      const data = await res.json();
      if (data.success) {
        setSecondsRemaining(TOTAL_SECONDS);
        setCheckedInAlert(true);
        setTimeout(() => setCheckedInAlert(false), 3000);
        if (onCheckInSuccess) onCheckInSuccess();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!shouldShow) return null;

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;
  const is15MinCheckInDue = secondsRemaining <= 900; // <= 15 mins left (1h 45m elapsed)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        transition={SPRING}
        className="w-full relative z-30 mb-4"
      >
        {/* Floating HD Red Rectangle Banner */}
        <div
          className="rounded-3xl p-5 sm:p-6 text-white shadow-2xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #FF3B30 0%, #D70015 60%, #9E0011 100%)',
            border: '1.5px solid rgba(255, 255, 255, 0.45)',
            boxShadow: '0 16px 48px rgba(255, 59, 48, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
          }}
        >
          {/* Subtle Ambient Radial Orbs */}
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-white/10 filter blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-black/20 filter blur-xl pointer-events-none" />

          {/* Top Bar: Alert Badge + Govt Sync Badge + Minimize */}
          <div className="flex flex-wrap items-center justify-between gap-3 relative z-10 border-b border-white/20 pb-3">
            <div className="flex items-center space-x-2.5">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-8 h-8 rounded-xl bg-white text-red-600 flex items-center justify-center shadow-md font-bold"
              >
                <ShieldAlert className="w-5 h-5" />
              </motion.div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider block">
                  🔴 RED ZONE PRE-ENTRY WARNING (150M BUFFER)
                </span>
                <span className="text-[10px] text-white/80 font-mono">
                  {proximityWarning?.zoneName || 'Kamrup Border Corridor'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md flex items-center gap-1.5 border border-white/30">
                <Send className="w-3 h-3 text-emerald-300" />
                <span>{govtNotified ? '✓ Transmitted to Govt 112 Command' : 'Syncing with Authority...'}</span>
              </span>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Main Body */}
          {!isMinimized ? (
            <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-5 items-center relative z-10">
              
              {/* Left Column: Warning & Instructions */}
              <div className="md:col-span-2 space-y-2">
                <h3 className="text-lg font-black tracking-tight text-white">
                  Autonomous 2-Hour Deadman Sentinel Initiated
                </h3>
                <p className="text-xs text-white/90 leading-relaxed">
                  Aap Red Danger Zone ke <strong>150 meter daayre</strong> mein hain. Aapki location <strong>Central Police Desk (112)</strong> ko transmit kar di gayi hai. Govt authority ke server par 2-ghante ka live timer chal raha hai.
                </p>
                <div className="flex items-center space-x-2 text-[11px] font-medium bg-black/20 p-2.5 rounded-xl border border-white/15">
                  <Clock className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>
                    <strong>Rule:</strong> 1 ghanta 45 minute ke baad (15 min bachte hi) neeche diye <strong>"I Am Safe"</strong> button ko dabana zaroori hai.
                  </span>
                </div>
              </div>

              {/* Right Column: Live Synchronized Countdown Timer */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-xl text-center space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/80 block">
                    Synced Govt Timer
                  </span>
                  <div className="text-3xl font-black font-mono tracking-tight text-white mt-0.5">
                    {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </div>
                  <span className="text-[9px] font-bold text-amber-200 uppercase tracking-wide">
                    {is15MinCheckInDue ? '⚠️ 15-MIN CHECK-IN DUE' : '2-HOUR HEARTBEAT'}
                  </span>
                </div>

                {/* Prominent "I Am Safe" Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.94 }}
                  transition={SPRING}
                  onClick={handleCheckIn}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg transition-all ${
                    is15MinCheckInDue
                      ? 'bg-emerald-400 text-gray-900 animate-pulse'
                      : 'bg-white text-red-600 hover:bg-white/95'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>I AM SAFE (Reset Timer)</span>
                </motion.button>
              </div>

            </div>
          ) : (
            /* Minimized Bar */
            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="font-semibold text-white/90">
                Red Zone Buffer Active · Govt Timer: <strong className="font-mono">{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</strong>
              </span>
              <button
                onClick={handleCheckIn}
                className="px-3 py-1 bg-white text-red-600 font-bold rounded-lg text-[11px] shadow-sm"
              >
                I Am Safe
              </button>
            </div>
          )}

          {/* Checked-In Confirmation Toast */}
          <AnimatePresence>
            {checkedInAlert && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-3 p-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-md"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>✓ Status Confirmed Safe! Timer reset for next 2 hours on Govt Command Desk.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
