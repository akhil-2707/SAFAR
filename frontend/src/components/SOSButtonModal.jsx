import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertOctagon, PhoneCall, ShieldAlert, X, CheckCircle2, Clock, 
  MapPin, Hospital, Building2, Mic, MicOff, Volume2, Radio, Sparkles 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SOSButtonModal({
  tourist,
  activeSosIncident,
  onTriggerSos,
  onCancelSos,
  nearbyServices = []
}) {
  const { t } = useLanguage();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [loading, setLoading] = useState(false);

  // 🎙️ Voice SOS State
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const recognitionRef = useRef(null);

  const isSosActive = tourist?.isSosActive || tourist?.status === 'CRITICAL_SOS';

  // Live timer tick for active SOS
  useEffect(() => {
    let interval = null;
    if (isSosActive) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setTimerSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isSosActive]);

  // Voice SOS Speech Recognition Setup
  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN,en-IN,en-US';

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((r) => r[0].transcript)
          .join(' ')
          .toLowerCase();

        setVoiceFeedback(`"${transcript.slice(-40)}"`);

        // Check for emergency triggers
        const triggers = ['help', 'sos', 'bachao', 'emergency', 'madad', 'khatra', 'save me'];
        const matched = triggers.some((trig) => transcript.includes(trig));

        if (matched) {
          setVoiceFeedback('🚨 Voice Trigger Matched: "SOS / BACHAO"!');
          recognition.stop();
          setIsListeningVoice(false);
          handleConfirmTrigger();
        }
      };

      recognition.onerror = (err) => {
        console.warn('Speech recognition error:', err.error);
        setIsListeningVoice(false);
      };

      recognition.onend = () => {
        setIsListeningVoice(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  const toggleVoiceSos = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported by this browser. You can use the standard Emergency SOS button.');
      return;
    }

    if (isListeningVoice) {
      try { recognitionRef.current.stop(); } catch (e) {}
      setIsListeningVoice(false);
      setVoiceFeedback('');
    } else {
      try {
        recognitionRef.current.start();
        setIsListeningVoice(true);
        setVoiceFeedback('Listening... Say "HELP", "SOS", or "BACHAO"');
      } catch (err) {
        console.error('Recognition start error:', err);
      }
    }
  };

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConfirmTrigger = async () => {
    setLoading(true);
    try {
      await onTriggerSos();
      setShowConfirmModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    setLoading(true);
    try {
      await onCancelSos(cancelReason || 'Tourist confirmed safe condition');
      setShowCancelConfirmModal(false);
      setCancelReason('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── SOS Panel ── */}
      {!isSosActive ? (
        <div className="space-y-2.5">

          {/* Main SOS Button */}
          <div className="relative">
            {/* Breathing pulse rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-2xl">
              <div className="absolute inset-0 rounded-2xl" style={{ background: 'rgba(255,59,48,0.12)', animation: 'sos-breathe 2.2s ease-in-out infinite' }} />
              <div className="absolute inset-0 rounded-2xl" style={{ background: 'rgba(255,59,48,0.07)', animation: 'sos-breathe 2.2s ease-in-out 0.8s infinite' }} />
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              onClick={() => setShowConfirmModal(true)}
              className="w-full py-5 text-white font-bold text-xl rounded-2xl flex items-center justify-center gap-4 relative overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #FF3B30, #FF1A0E)',
                boxShadow: '0 6px 24px rgba(255,59,48,0.45), 0 2px 8px rgba(255,59,48,0.3)',
                letterSpacing: '-0.01em',
              }}
            >
              {/* Shimmer sweep */}
              <motion.span
                className="absolute inset-0 rounded-2xl"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="w-11 h-11 rounded-full flex items-center justify-center relative z-10"
                style={{ background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.35)' }}
                animate={{ boxShadow: ['0 0 0 0 rgba(255,255,255,0.4)', '0 0 0 10px rgba(255,255,255,0)', '0 0 0 0 rgba(255,255,255,0)'] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              >
                <AlertOctagon className="w-6 h-6 text-white" />
              </motion.div>
              <span className="tracking-widest uppercase relative z-10" style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                {t('tdbSosButtonText', 'TRIGGER EMERGENCY SOS')}
              </span>
            </motion.button>
          </div>

          {/* Voice SOS Bar */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl"
            style={{
              background: 'rgba(255,59,48,0.05)',
              border: '0.5px solid rgba(255,59,48,0.18)',
            }}
          >
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: '#FF3B30', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <span className="font-semibold" style={{ color: '#FF3B30' }}>🎙️ Voice SOS</span>
              <span className="text-[11px]" style={{ color: 'rgba(60,60,67,0.55)' }}>
                {voiceFeedback || 'Say "HELP", "SOS", or "BACHAO" to auto-dispatch'}
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              onClick={toggleVoiceSos}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all"
              style={
                isListeningVoice
                  ? { background: '#FF3B30', color: 'white', boxShadow: '0 2px 10px rgba(255,59,48,0.4)' }
                  : { background: 'rgba(255,59,48,0.08)', color: '#FF3B30', border: '0.5px solid rgba(255,59,48,0.2)' }
              }
            >
              {isListeningVoice ? <Mic className="w-3.5 h-3.5 animate-bounce" /> : <MicOff className="w-3.5 h-3.5" />}
              <span>{isListeningVoice ? 'Listening 🔴' : 'Enable Voice SOS'}</span>
            </motion.button>
          </div>
        </div>
      ) : (
        /* ── Active SOS Card ── */
        <div
          className="rounded-2xl p-4 space-y-3"
          style={{
            background: 'rgba(255,59,48,0.04)',
            border: '0.5px solid rgba(255,59,48,0.3)',
            boxShadow: '0 4px 24px rgba(255,59,48,0.12)',
          }}
        >
          <div className="flex items-center justify-between pb-3" style={{ borderBottom: '0.5px solid rgba(255,59,48,0.15)' }}>
            <div className="flex items-center gap-2.5">
              <motion.div
                className="w-4 h-4 rounded-full"
                style={{ background: '#FF3B30' }}
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <AlertOctagon className="w-5 h-5" style={{ color: '#FF3B30' }} />
              <div>
                <h3 className="font-bold text-base" style={{ color: '#FF3B30', letterSpacing: '-0.01em' }}>
                  {t('tdbSosActiveAlert', 'SOS BROADCAST ACTIVE')}
                </h3>
                <p className="text-xs" style={{ color: 'rgba(60,60,67,0.55)' }}>Authorities & Dispatchers Notified</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold block" style={{ color: 'rgba(255,59,48,0.6)' }}>Elapsed</span>
              <span className="text-xl font-mono font-bold" style={{ color: '#FF3B30' }}>{formatTimer(timerSeconds)}</span>
            </div>
          </div>

          <div className="rounded-xl p-3 space-y-1.5 text-xs" style={{ background: 'rgba(120,120,128,0.06)', border: '0.5px solid rgba(60,60,67,0.08)' }}>
            {[
              { label: 'Incident Ref', value: activeSosIncident?.id || 'INC-SOS-LIVE', color: '#FF3B30' },
              { label: 'Status', value: activeSosIncident?.status || 'ASSIGNED', color: '#34C759' },
              { label: 'Assigned Team', value: activeSosIncident?.assignedAuthority || 'Tourist Police HQ', color: '#1C1C1E' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <span style={{ color: 'rgba(60,60,67,0.5)' }}>{label}:</span>
                <span className="font-semibold font-mono" style={{ color }}>{value}</span>
              </div>
            ))}
          </div>

          {nearbyServices.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#FF3B30' }}>Nearest Services</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                {nearbyServices.slice(0, 2).map((s) => (
                  <div key={s.id} className="p-2.5 rounded-xl flex items-center justify-between" style={{ background: 'rgba(52,199,89,0.06)', border: '0.5px solid rgba(52,199,89,0.2)' }}>
                    <div>
                      <span className="font-semibold block truncate" style={{ color: '#1C1C1E' }}>{s.name}</span>
                      <span className="text-[10px] font-mono" style={{ color: '#34C759' }}>{s.phone}</span>
                    </div>
                    <span className="text-[10px] font-mono shrink-0 ml-2" style={{ color: 'rgba(60,60,67,0.45)' }}>{s.distanceKm} km</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            onClick={() => setShowCancelConfirmModal(true)}
            className="w-full py-2.5 text-xs font-semibold rounded-xl transition-colors"
            style={{ background: 'rgba(120,120,128,0.1)', color: 'rgba(60,60,67,0.7)', border: '0.5px solid rgba(60,60,67,0.12)' }}
          >
            ✓ I am Safe — Cancel SOS
          </motion.button>
        </div>
      )}

      {/* ── iOS-style Confirm SOS Modal ── */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(16px)' }}>
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="w-full max-w-sm rounded-3xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.96)', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', border: '0.5px solid rgba(60,60,67,0.1)' }}
            >
              {/* Top content */}
              <div className="p-6 text-center space-y-3">
                <motion.div
                  className="w-14 h-14 mx-auto rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,59,48,0.1)' }}
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <AlertOctagon className="w-8 h-8" style={{ color: '#FF3B30' }} />
                </motion.div>
                <h3 className="text-lg font-bold" style={{ color: '#1C1C1E', letterSpacing: '-0.02em' }}>
                  Send Emergency SOS?
                </h3>
                <p className="text-sm" style={{ color: 'rgba(60,60,67,0.6)', lineHeight: 1.5 }}>
                  This will immediately broadcast a distress beacon to Police Command, ERSS-112, and nearby responders.
                </p>
              </div>

              {/* iOS-style action sheet buttons */}
              <div style={{ borderTop: '0.5px solid rgba(60,60,67,0.12)' }}>
                <button
                  disabled={loading}
                  onClick={handleConfirmTrigger}
                  className="w-full py-3.5 text-base font-bold transition-colors"
                  style={{ color: '#FF3B30', background: 'transparent' }}
                >
                  {loading ? 'Broadcasting...' : 'Yes, Send SOS'}
                </button>
              </div>
              <div style={{ borderTop: '0.5px solid rgba(60,60,67,0.12)' }}>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full py-3.5 text-base font-semibold transition-colors"
                  style={{ color: '#0A84FF', background: 'transparent' }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Cancel SOS Modal ── */}
      <AnimatePresence>
        {showCancelConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(16px)' }}>
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="w-full max-w-sm rounded-3xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.97)', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', border: '0.5px solid rgba(60,60,67,0.1)' }}
            >
              <div className="p-6 space-y-3">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center" style={{ background: 'rgba(52,199,89,0.1)' }}>
                    <CheckCircle2 className="w-7 h-7" style={{ color: '#34C759' }} />
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: '#1C1C1E', letterSpacing: '-0.02em' }}>Cancel SOS</h3>
                  <p className="text-xs" style={{ color: 'rgba(60,60,67,0.55)' }}>Add a resolution note for the dispatch log:</p>
                </div>

                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. False alarm / Medical help received / Situation is safe..."
                  className="w-full text-xs p-3 rounded-2xl resize-none h-20 focus:outline-none"
                  style={{
                    background: 'rgba(120,120,128,0.08)',
                    border: '0.5px solid rgba(60,60,67,0.12)',
                    color: '#1C1C1E',
                  }}
                />
              </div>

              <div style={{ borderTop: '0.5px solid rgba(60,60,67,0.12)' }}>
                <button
                  disabled={loading}
                  onClick={handleConfirmCancel}
                  className="w-full py-3.5 text-base font-bold"
                  style={{ color: '#34C759' }}
                >
                  {loading ? 'Resolving...' : 'Confirm Safe'}
                </button>
              </div>
              <div style={{ borderTop: '0.5px solid rgba(60,60,67,0.12)' }}>
                <button
                  onClick={() => setShowCancelConfirmModal(false)}
                  className="w-full py-3.5 text-base font-semibold"
                  style={{ color: '#0A84FF' }}
                >
                  Back
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

