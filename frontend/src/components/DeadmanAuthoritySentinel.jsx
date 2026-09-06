import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Clock, CheckCircle2, AlertTriangle, Radio, Phone, Send, ShieldCheck, MapPin, RefreshCw, BellRing } from 'lucide-react';

export default function DeadmanAuthoritySentinel() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [toastMessage, setToastMessage] = useState(null);
  const [simulatingCheckIn, setSimulatingCheckIn] = useState(false);

  const fetchActiveSessions = async () => {
    try {
      const res = await fetch('/api/deadman/active');
      const data = await res.json();
      if (data.success && data.sessions) {
        setSessions(data.sessions);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch active deadman sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveSessions();
    // Poll API every 5s to stay synchronized with backend state
    const apiInterval = setInterval(fetchActiveSessions, 5000);
    return () => clearInterval(apiInterval);
  }, []);

  // Real-time 1-second countdown tick for smooth UI display
  useEffect(() => {
    const timer = setInterval(() => {
      setSessions((prev) =>
        prev.map((s) => {
          const rem = Math.max(0, s.remainingSeconds - 1);
          return {
            ...s,
            remainingSeconds: rem,
            isLowTime: rem <= 900 && rem > 0,
            isExpired: rem === 0
          };
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSeconds) => {
    if (totalSeconds <= 0) return '00:00:00';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSimulateCheckIn = async (touristId) => {
    setSimulatingCheckIn(true);
    try {
      const res = await fetch('/api/deadman/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          touristId: touristId || 'TID-1035',
          notes: 'Remote check-in confirmed via "I Am Safe" tap'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✓ Check-In Verified! 2-Hour Timer Reset on Central Server & Tourist Device.`);
        fetchActiveSessions();
      }
    } catch (err) {
      console.error(err);
      showToast('Error syncing check-in with server.');
    } finally {
      setSimulatingCheckIn(false);
    }
  };

  const handleDispatchPatrol = (session) => {
    showToast(`🚨 Intercept Patrol Dispatched to ${session.lastGps?.address || 'Buffer Location'}`);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl p-6 relative overflow-hidden space-y-4"
      style={{
        background: 'linear-gradient(135deg, rgba(254,242,242,0.98) 0%, rgba(255,255,255,0.98) 50%, rgba(254,242,242,0.95) 100%)',
        border: '1.5px solid rgba(239, 68, 68, 0.35)',
        boxShadow: '0 10px 40px rgba(239, 68, 68, 0.12)',
      }}
    >
      {/* Background ambient red glow */}
      <motion.div
        className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'rgba(239,68,68,0.12)', filter: 'blur(50px)' }}
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-lg relative z-20"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-red-100 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-md relative">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-black text-gray-900 tracking-tight">
                Synchronized Red-Zone Deadman Sentinel Desk
              </h2>
              <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                100–200m Pre-Entry Buffer
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Pre-entry location automatically logged • 2-Hour live countdown synchronized between Tourist Device & Central 112 Desk
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono text-gray-500">
            Live Sync: <strong className="text-gray-700">{lastUpdated.toLocaleTimeString()}</strong>
          </span>
          <button
            onClick={fetchActiveSessions}
            className="p-1.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 transition-all shadow-sm"
            title="Refresh Sessions"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Monitored Red-Zone Pre-Entry Sessions */}
      <div className="space-y-3 relative z-10">
        {sessions.length === 0 ? (
          <div className="p-8 text-center bg-white/70 rounded-2xl border border-red-100">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="text-xs font-bold text-gray-700">No Tourists Currently Inside Red-Zone Buffers</p>
            <p className="text-[11px] text-gray-400">All tourist devices are outside dangerous perimeters.</p>
          </div>
        ) : (
          sessions.map((s) => {
            const isLowTime = s.isLowTime || (s.remainingSeconds <= 900 && s.remainingSeconds > 0);
            const isExpired = s.remainingSeconds === 0;

            return (
              <motion.div
                key={s.touristId}
                layout
                className="bg-white/95 rounded-2xl p-4.5 border space-y-3.5 transition-all shadow-sm"
                style={{
                  borderColor: isExpired ? 'rgba(239,68,68,0.6)' : isLowTime ? 'rgba(245,158,11,0.6)' : 'rgba(239,68,68,0.25)',
                  boxShadow: isExpired ? '0 4px 20px rgba(239,68,68,0.15)' : '0 2px 10px rgba(0,0,0,0.03)'
                }}
              >
                {/* Top session row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-sm font-black text-gray-900">{s.touristName}</span>
                      <span className="text-xs font-mono font-bold text-gray-500">({s.touristId})</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-gray-100 text-gray-700">
                        📞 {s.phone}
                      </span>
                      {isExpired ? (
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-red-600 text-white animate-bounce">
                          🚨 TIMEOUT: 112 DISPATCHED
                        </span>
                      ) : isLowTime ? (
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">
                          ⚠️ 15-MIN CHECK-IN WINDOW OPEN
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                          🟢 2h TIMER ARMED & SYNCED
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5 text-xs text-rose-700 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{s.enteredZoneName}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-[11px] text-gray-500 font-mono">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>{s.lastGps?.address} [{s.lastGps?.lat.toFixed(4)}, {s.lastGps?.lng.toFixed(4)}]</span>
                    </div>
                  </div>

                  {/* Synchronized 2-Hour Clock Box */}
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-red-50 to-rose-50 px-4 py-2.5 rounded-2xl border border-red-200 shrink-0">
                    <Clock className="w-5 h-5 text-red-600 animate-spin" style={{ animationDuration: '8s' }} />
                    <div>
                      <div className="text-[10px] font-mono uppercase font-bold text-gray-500">
                        Synchronized 2h Safety Clock
                      </div>
                      <div className={`text-2xl font-black font-mono tracking-wider ${
                        isExpired ? 'text-red-600 animate-pulse' : isLowTime ? 'text-amber-600' : 'text-gray-900'
                      }`}>
                        {formatCountdown(s.remainingSeconds)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Workflow timeline steps bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-black text-[10px] flex items-center justify-center shrink-0">1</span>
                    <span className="text-gray-600 font-medium">150m Pre-Entry Buffer Auto-Logged</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-black text-[10px] flex items-center justify-center shrink-0">2</span>
                    <span className="text-gray-600 font-medium">Check-In Required at 1h 45m (15m mark)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 font-black text-[10px] flex items-center justify-center shrink-0">3</span>
                    <span className="text-gray-600 font-medium">Auto 112 SOS Dispatch if no check-in</span>
                  </div>
                </div>

                {/* Authority Operations Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="text-[11px] text-gray-500 flex items-center space-x-1.5 font-medium">
                    <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                    <span>Live Bi-Directional Heartbeat Sync: OK</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Check In Action Simulation */}
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={simulatingCheckIn}
                      onClick={() => handleSimulateCheckIn(s.touristId)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-sm flex items-center space-x-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{simulatingCheckIn ? 'Resetting...' : 'Verify "I Am Safe" (Reset 2h)'}</span>
                    </motion.button>

                    {/* Dispatch Patrol Action */}
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleDispatchPatrol(s)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 border border-red-200 transition-all flex items-center space-x-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Patrol Intercept</span>
                    </motion.button>
                  </div>
                </div>

              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
