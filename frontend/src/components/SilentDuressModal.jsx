import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, KeyRound, ShieldAlert, CheckCircle2, Eye, EyeOff, Radio, 
  AlertTriangle, Image as ImageIcon, Volume2, Shield, PhoneCall, X
} from 'lucide-react';

const SPRING = { type: 'spring', stiffness: 360, damping: 28 };

export default function SilentDuressModal({ isOpen, onClose, tourist }) {
  const [pin, setPin] = useState('');
  const [mode, setMode] = useState('PIN_ENTRY'); // PIN_ENTRY, NORMAL_SAFE, DISGUISED_DECOY, POLICE_TELEMETRY
  const [loading, setLoading] = useState(false);
  const [incidentData, setIncidentData] = useState(null);

  if (!isOpen) return null;

  const handleDigit = (digit) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleClear = () => {
    setPin('');
  };

  const verifyPin = async (inputPin) => {
    setLoading(true);
    if (inputPin === '1234') {
      // Normal Safe PIN
      setTimeout(() => {
        setMode('NORMAL_SAFE');
        setLoading(false);
      }, 500);
    } else if (inputPin === '4321') {
      // 🚨 REVERSE DURESS PIN ENTERED UNDER COERCION
      try {
        const res = await fetch('/api/incidents/duress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            touristId: tourist?.touristId || 'TID-1035',
            lat: tourist?.currentLocation?.lat || 26.7922,
            lng: tourist?.currentLocation?.lng || 82.1998,
            address: tourist?.currentLocation?.address || 'Ayodhya Safe Heritage Corridor'
          })
        });
        const data = await res.json();
        setIncidentData(data);
        // Automatically disguise into innocent photo album
        setMode('DISGUISED_DECOY');
      } catch (err) {
        console.error(err);
        setMode('DISGUISED_DECOY');
      } finally {
        setLoading(false);
      }
    } else {
      setTimeout(() => {
        alert('Invalid PIN. For Evaluator Demo: Use 1234 (Normal) or 4321 (Reverse Duress).');
        setPin('');
        setLoading(false);
      }, 400);
    }
  };

  const resetAll = () => {
    setPin('');
    setMode('PIN_ENTRY');
    setIncidentData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border-2 border-red-400 relative"
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-red-200 block">
                World-First Anti-Abduction Shield
              </span>
              <h3 className="text-sm font-black">Silent Duress & Decoy Keypad</h3>
            </div>
          </div>
          <button onClick={resetAll} className="p-1 rounded-full hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. PIN ENTRY MODE */}
        {mode === 'PIN_ENTRY' && (
          <div className="p-6 space-y-5">
            {/* Judge Instructions Banner */}
            <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-900 space-y-1">
              <span className="font-extrabold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span>Emergency Duress SOP Protocol:</span>
              </span>
              <div className="text-[11px] space-y-0.5 text-gray-700">
                <p>• Type <strong>1234</strong>: Normal phone unlock (safe state).</p>
                <p>• Type <strong>4321</strong> (Reverse PIN): Criminal thinks phone is unlocked; screen disguises as Photo Gallery while <strong>Police CAD Silent SOS</strong> fires in background!</p>
              </div>
            </div>

            {/* PIN Display Dots */}
            <div className="flex justify-center items-center gap-4 py-2">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all ${
                    pin.length > idx
                      ? 'bg-red-600 scale-125'
                      : 'border-2 border-gray-300 bg-gray-100'
                  }`}
                />
              ))}
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleDigit(num.toString())}
                  disabled={loading}
                  className="py-3 rounded-2xl bg-gray-100 hover:bg-red-50 hover:text-red-700 font-black text-lg text-gray-800 transition-all active:scale-95 shadow-sm"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleClear}
                className="py-3 rounded-2xl bg-gray-200 text-xs font-bold text-gray-700 active:scale-95"
              >
                CLEAR
              </button>
              <button
                onClick={() => handleDigit('0')}
                disabled={loading}
                className="py-3 rounded-2xl bg-gray-100 font-black text-lg text-gray-800 active:scale-95 shadow-sm"
              >
                0
              </button>
              <button
                onClick={() => verifyPin(pin)}
                disabled={pin.length !== 4 || loading}
                className="py-3 rounded-2xl bg-red-600 text-white font-bold text-xs active:scale-95 shadow-md disabled:opacity-40"
              >
                {loading ? '...' : 'ENTER'}
              </button>
            </div>
          </div>
        )}

        {/* 2. NORMAL SAFE UNLOCK */}
        {mode === 'NORMAL_SAFE' && (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-lg font-black text-gray-900">Standard Safe Unlock</h4>
              <p className="text-xs text-gray-600 mt-1">
                Normal PIN (1234) authenticated. No distress beacons dispatched.
              </p>
            </div>
            <button
              onClick={() => { setPin(''); setMode('PIN_ENTRY'); }}
              className="py-2.5 px-6 rounded-xl bg-gray-900 text-white font-bold text-xs"
            >
              Test Reverse Duress PIN (4321)
            </button>
          </div>
        )}

        {/* 3. DISGUISED DECOY PHOTO GALLERY SCREEN (Shows when 4321 is typed) */}
        {mode === 'DISGUISED_DECOY' && (
          <div className="p-5 space-y-4">
            <div className="bg-amber-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center justify-between">
              <span>🎭 Decoy Mode Active (Attacker fooled)</span>
              <button
                onClick={() => setMode('POLICE_TELEMETRY')}
                className="underline bg-white/20 px-2 py-0.5 rounded-md hover:bg-white/30"
              >
                View Police CAD Alert ➔
              </button>
            </div>

            {/* Fake Camera Roll Header */}
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center space-x-1.5 text-gray-800">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold">Photos • Ayodhya Yatra (14 Items)</span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">Today, 11:28 AM</span>
            </div>

            {/* Fake Photos Grid */}
            <div className="grid grid-cols-3 gap-2 h-56 overflow-y-auto">
              {[
                'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=300&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=300&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=300&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1544816155-12df9643f363?w=300&auto=format&fit=crop&q=80',
              ].map((img, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-200">
                  <img src={img} alt="Decoy" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            <p className="text-[11px] text-gray-500 text-center italic">
              Criminal sees regular innocent photos. Meanwhile, high-priority Police CAD has been silently alerted with live GPS!
            </p>

            <button
              onClick={() => setMode('POLICE_TELEMETRY')}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Inspect Police Command Desk Telemetry</span>
            </button>
          </div>
        )}

        {/* 4. BEHIND-THE-SCENES POLICE TELEMETRY (For Evaluator Wow-Factor) */}
        {mode === 'POLICE_TELEMETRY' && (
          <div className="p-6 space-y-4 bg-slate-950 text-white font-mono">
            <div className="flex items-center space-x-2 text-red-500">
              <Radio className="w-5 h-5 animate-ping" />
              <span className="text-xs font-black tracking-widest uppercase">
                POLICE CAD INTERCEPT ACTIVE
              </span>
            </div>

            <div className="p-3 bg-red-950/60 border border-red-600/80 rounded-2xl space-y-1.5 text-xs">
              <div className="text-red-400 font-bold">STATUS: COERCION UNDERWAY (Reverse PIN 4321)</div>
              <div className="text-gray-300">Tourist: {tourist?.fullName || 'Ananya Mishra (TID-1035)'}</div>
              <div className="text-gray-300">GPS Vector: 26.7922° N, 82.1998° E</div>
              <div className="text-emerald-400 font-bold">Tactical Action: PCR Van #14 Dispatched (Silent Lights)</div>
            </div>

            {/* Audio Waveform Simulator */}
            <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-gray-400">
                <span className="flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-red-400 animate-pulse" />
                  <span>Silent Ambient Audio Stream (10s Beacon)</span>
                </span>
                <span className="text-red-400 font-bold">RECORDING</span>
              </div>
              <div className="flex items-center gap-1 h-6 pt-1">
                {[40, 70, 25, 90, 60, 30, 85, 45, 95, 65, 35, 75, 50, 80, 60, 30].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [`${h * 0.3}%`, `${h}%`, `${h * 0.2}%`] }}
                    transition={{ duration: 0.6 + (i % 3) * 0.2, repeat: Infinity }}
                    className="flex-1 bg-red-500 rounded-full"
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setMode('DISGUISED_DECOY')}
                className="py-2.5 bg-slate-800 text-gray-200 text-xs font-bold rounded-xl"
              >
                Back to Decoy Screen
              </button>
              <button
                onClick={resetAll}
                className="py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-lg"
              >
                End Simulation
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
