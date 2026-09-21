import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, ShieldAlert, CheckCircle2, AlertTriangle, Radio, Mail, 
  Send, RefreshCw, Zap, Bell, Volume2, ShieldCheck, WifiOff
} from 'lucide-react';

export default function DeadmanSwitch({
  tourist,
  isDangerZone = false,
  isLowNetwork = false,
  onTriggerSos,
  onAddNotification
}) {
  const INITIAL_SECONDS = 7200; // 2 Hours
  const WARNING_THRESHOLD = 900; // 15 Minutes

  const [isActive, setIsActive] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(INITIAL_SECONDS);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [emailDispatched, setEmailDispatched] = useState(null);
  const [lastCheckInTime, setLastCheckInTime] = useState(null);
  const [expiredSosTriggered, setExpiredSosTriggered] = useState(false);

  const timerRef = useRef(null);

  // Auto-activate when entering Red Zone or Low Network Area
  useEffect(() => {
    if ((isDangerZone || isLowNetwork) && !isActive) {
      handleArmSwitch(isLowNetwork ? 'Low Cellular Signal / 0-Signal Zone' : 'Restricted Red Hazard Zone');
    }
  }, [isDangerZone, isLowNetwork]);

  // Main countdown timer interval
  useEffect(() => {
    if (isActive && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimerExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, secondsRemaining]);

  // Trigger 15-Minute Warning Pop-Up
  useEffect(() => {
    if (isActive && secondsRemaining > 0 && secondsRemaining <= WARNING_THRESHOLD && !showCheckInModal) {
      setShowCheckInModal(true);
    }
  }, [secondsRemaining, isActive, showCheckInModal]);

  // Arm the Deadman Switch
  const handleArmSwitch = (triggerReason = 'Manual Activation') => {
    setIsActive(true);
    setSecondsRemaining(INITIAL_SECONDS);
    setShowCheckInModal(false);
    setExpiredSosTriggered(false);

    const touristName = tourist?.fullName || 'Active Tourist';
    const contactEmail = tourist?.email || 'emergency.contact@safetour.gov.in';
    const locationStr = tourist?.currentLocation?.address || 'Restricted Corridor Buffer';

    // Simulated automated emergency email dispatch
    const emailData = {
      to: contactEmail,
      subject: `🚨 SAFAR Alert: 2-Hour Deadman Switch Protocol Activated for ${touristName}`,
      timestamp: new Date().toLocaleTimeString(),
      location: locationStr,
      reason: triggerReason
    };
    setEmailDispatched(emailData);

    if (onAddNotification) {
      onAddNotification({
        id: 'notif_deadman_' + Date.now(),
        type: 'HIGH',
        title: '⏳ Deadman Switch Protocol Active',
        message: `Safety timer set for 2 hours. Notification dispatched to ${contactEmail}.`,
        timestamp: new Date().toISOString(),
        read: false
      });
    }
  };

  // Tourist presses "Main Surakshit Hoon (I Am Safe)"
  const handleTouristCheckIn = () => {
    setSecondsRemaining(INITIAL_SECONDS);
    setShowCheckInModal(false);
    setLastCheckInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

    const touristName = tourist?.fullName || 'Active Tourist';
    const emailData = {
      to: tourist?.email || 'emergency.contact@safetour.gov.in',
      subject: `🟢 SAFAR Check-In: ${touristName} is SAFE (Deadman Timer Reset)`,
      timestamp: new Date().toLocaleTimeString(),
      location: tourist?.currentLocation?.address || 'Current Tracked Location',
      reason: 'Tourist confirmed safe status'
    };
    setEmailDispatched(emailData);
  };

  // Disarm Deadman Switch
  const handleDisarmSwitch = () => {
    setIsActive(false);
    setShowCheckInModal(false);
    setSecondsRemaining(INITIAL_SECONDS);
    clearInterval(timerRef.current);
  };

  // Fail-Safe: Timer Expired (Hits 00:00:00) -> Full SOS
  const handleTimerExpired = () => {
    setExpiredSosTriggered(true);
    setShowCheckInModal(false);
    if (onTriggerSos) {
      onTriggerSos('DEADMAN_TIMER_EXPIRED');
    }
  };

  // Fast-forward demo helpers
  const handleSimulate15MinWarning = () => {
    if (!isActive) handleArmSwitch('SIH Demo Test');
    setSecondsRemaining(899); // 14 mins 59 secs
    setShowCheckInModal(true);
  };

  const handleSimulate5SecExpiry = () => {
    if (!isActive) handleArmSwitch('SIH Demo Test');
    setSecondsRemaining(5);
  };

  // Time format: HH:MM:SS
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.max(0, Math.min(100, (secondsRemaining / INITIAL_SECONDS) * 100));

  return (
    <>
      {/* Main Deadman's Switch Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-5 sm:p-6 space-y-4 relative overflow-hidden"
        style={{
          background: isActive
            ? secondsRemaining <= WARNING_THRESHOLD
              ? 'linear-gradient(135deg, rgba(254,242,242,0.98), rgba(255,255,255,0.98))'
              : 'linear-gradient(135deg, rgba(255,247,237,0.98), rgba(255,255,255,0.98))'
            : 'rgba(255, 255, 255, 0.94)',
          border: isActive
            ? secondsRemaining <= WARNING_THRESHOLD
              ? '2px solid rgba(239,68,68,0.5)'
              : '2px solid rgba(249,115,22,0.4)'
            : '1.5px solid rgba(226,232,240,0.9)',
          boxShadow: isActive
            ? '0 12px 36px rgba(249,115,22,0.15)'
            : '0 4px 20px rgba(0,0,0,0.04)',
        }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-start sm:items-center space-x-3 min-w-0">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
              style={{
                background: isActive ? 'linear-gradient(135deg, #f97316, #ef4444)' : 'rgba(241,245,249,1)',
                color: isActive ? 'white' : '#64748b'
              }}
            >
              <Clock className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="text-sm sm:text-base font-black text-gray-900">
                  Automated Deadman's Switch
                </h3>
                <span
                  className={`text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                    isActive
                      ? secondsRemaining <= WARNING_THRESHOLD
                        ? 'bg-red-100 text-red-700 border-red-300 animate-pulse'
                        : 'bg-orange-100 text-orange-700 border-orange-300'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  {isActive ? (secondsRemaining <= WARNING_THRESHOLD ? '⚠️ 15M Check-In Due' : '🟢 Sentinel Active (2h)') : '⚪ Armed on Red Zone'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
                Auto-engages in 0-signal or red danger zones. Requires safety confirmation before 2h expiry.
              </p>
            </div>
          </div>

          {/* Toggle Button */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            {!isActive ? (
              <button
                onClick={() => handleArmSwitch('Manual User Start')}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Start 2h Safety Timer</span>
              </button>
            ) : (
              <button
                onClick={handleDisarmSwitch}
                className="w-full sm:w-auto px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors text-center"
              >
                Stop / Disarm
              </button>
            )}
          </div>
        </div>

        {/* Live Timer Display & Progress Bar */}
        {isActive && (
          <div className="space-y-3 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="space-y-0.5">
                <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wide block">
                  Check-In Countdown Window
                </span>
                <div className="text-2xl sm:text-4xl font-black font-mono tracking-tight text-gray-900 flex items-center space-x-2">
                  <span className={secondsRemaining <= WARNING_THRESHOLD ? 'text-red-600' : 'text-orange-600'}>
                    {formatTime(secondsRemaining)}
                  </span>
                  <span className="text-xs font-sans font-bold text-gray-400">/ 02:00:00</span>
                </div>
              </div>

              {/* Instant "Main Surakshit Hoon" Check-In Action */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleTouristCheckIn}
                className="w-full sm:w-auto px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg transition-all"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: '0 6px 20px rgba(16,185,129,0.35)'
                }}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Main Surakshit Hoon (I Am Safe)</span>
              </motion.button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <motion.div
                className={`h-full transition-all duration-500 ${
                  secondsRemaining <= WARNING_THRESHOLD ? 'bg-red-500' : 'bg-gradient-to-r from-orange-500 to-amber-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Last Check-In Confirmation */}
            {lastCheckInTime && (
              <p className="text-[11px] font-semibold text-emerald-700 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Last verified safe check-in at {lastCheckInTime}. 2-hour timer reset successfully.</span>
              </p>
            )}

            {/* Simulated Automated Emergency Email Dispatch Badge */}
            {emailDispatched && (
              <div className="p-3 bg-white/90 border border-orange-200 rounded-2xl text-xs space-y-1 shadow-xs">
                <div className="flex items-center justify-between font-bold text-orange-950">
                  <span className="flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-orange-600" />
                    <span>Automated Email Dispatch Sent</span>
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-gray-500">{emailDispatched.timestamp}</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-snug">
                  <strong>To:</strong> <span className="font-mono text-gray-800">{emailDispatched.to}</span> • <strong>Alert:</strong> {emailDispatched.subject}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Demo Fast-Forward Simulation Bar (For Evaluators / Demonstration) */}
        <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span className="font-bold text-gray-400 uppercase tracking-wide">SIH Fast-Forward Simulator:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={handleSimulate15MinWarning}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-bold transition-all"
              title="Jump countdown to 14m 59s to test the 15-min warning pop-up"
            >
              ⏱️ Simulate 15-Min Pop-up
            </button>
            <button
              onClick={handleSimulate5SecExpiry}
              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-800 border border-red-300 rounded-lg font-bold transition-all"
              title="Fast-forward to 5 seconds to test fail-safe SOS trigger"
            >
              🚨 Simulate 5s Expiry
            </button>
          </div>
        </div>
      </motion.div>

      {/* ⚠️ CRITICAL 15-MINUTE POP-UP CHECK-IN MODAL */}
      <AnimatePresence>
        {showCheckInModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-red-400 space-y-6 text-center"
            >
              {/* Radar Alert Icon */}
              <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                <motion.div
                  className="absolute inset-0 rounded-full bg-red-500/20"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shadow-md relative z-10">
                  <ShieldAlert className="w-9 h-9 animate-bounce" />
                </div>
              </div>

              {/* Title & Warning */}
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                  ⚠️ 15 Minutes Remaining!
                </span>
                <h3 className="text-2xl font-black text-gray-900">
                  Are You Safe?
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
                  Your Deadman Safety Switch has <strong>{formatTime(secondsRemaining)}</strong> remaining. Please press the button below to confirm you are safe and prevent automated police dispatch.
                </p>
              </div>

              {/* Primary Green Check-In Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleTouristCheckIn}
                className="w-full py-4 px-6 rounded-2xl text-white font-black text-base shadow-xl flex items-center justify-center space-x-2"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: '0 8px 30px rgba(16,185,129,0.45)'
                }}
              >
                <CheckCircle2 className="w-6 h-6" />
                <span>MAIN SURAKSHIT HOON (I AM SAFE)</span>
              </motion.button>

              <p className="text-[11px] text-gray-400 font-medium">
                Pressing this resets the timer to 2 hours and sends a safe confirmation to your emergency contacts.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
