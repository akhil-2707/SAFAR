import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, Navigation, Globe, Lock, Radio, Cpu } from 'lucide-react';
import SafarLogo from './SafarLogo';

// Sleek 24-Spoke Ashoka Chakra Vector Ring
const AshokaChakraSymbol = ({ size = 28, className = "" }) => {
  const spokes = Array.from({ length: 24 });
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`shrink-0 ${className}`}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
    >
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.8" />
      <circle cx="50" cy="50" r="7" fill="currentColor" />
      {spokes.map((_, i) => {
        const angle = i * 15;
        const rad = (angle * Math.PI) / 180;
        const x2 = 50 + 44 * Math.sin(rad);
        const y2 = 50 - 44 * Math.cos(rad);
        return (
          <line
            key={i}
            x1="50"
            y1="50"
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.9"
          />
        );
      })}
    </motion.svg>
  );
};

export default function PatrioticLoader({ onLoadingComplete }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initiating S.A.F.A.R. Security Enclave...');
  const [stageCode, setStageCode] = useState('SYS_INIT');
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const durationMs = 2400; // Snappy & professional 2.4s intro
    const intervalMs = 20;
    const totalSteps = durationMs / intervalMs;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const nextProgress = Math.min(100, Math.round((currentStep / totalSteps) * 100));
      setProgress(nextProgress);

      if (nextProgress < 25) {
        setStageCode('SYS_INIT');
        setStatusText('Verifying SHA-256 Tourist Cryptographic Credentials...');
      } else if (nextProgress < 55) {
        setStageCode('GEOSPATIAL');
        setStatusText('Calibrating Satellite Geo-Corridors & High-Hazard Polygons...');
      } else if (nextProgress < 80) {
        setStageCode('GHOST_MESH');
        setStatusText('Synchronizing Zero-Network Offline Relay Protocols...');
      } else if (nextProgress < 96) {
        setStageCode('RAPID_SOS');
        setStatusText('Interfacing State Police Command & Community Safety Net...');
      } else {
        setStageCode('READY');
        setStatusText('S.A.F.A.R. Safety Gateway Operational & Active.');
      }

      if (nextProgress >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          setIsFinished(true);
          if (onLoadingComplete) onLoadingComplete();
        }, 400);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  if (isFinished) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-[9999] bg-[#030712] flex items-center justify-center overflow-hidden select-none font-sans"
      >
        {/* Subtle Ambient Backlight - Saffron Top Left, Navy Center, Emerald Bottom Right */}
        <div className="absolute -top-40 -left-40 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/8 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Cyber Tactical Grid Background */}
        <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(to_right,#38bdf8_1px,transparent_1px),linear-gradient(to_bottom,#38bdf8_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        {/* Central Card */}
        <div className="relative z-10 w-full max-w-xl px-6 py-8 mx-auto text-center space-y-7">
          
          {/* Top National Authority Badge */}
          <motion.div
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-slate-300 shadow-xl backdrop-blur-md"
          >
            <span className="text-sm">🇮🇳</span>
            <span className="text-amber-300 font-bold tracking-wide">MINISTRY OF TOURISM</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-bold tracking-wide">GOVERNMENT OF INDIA</span>
          </motion.div>

          {/* S.A.F.A.R. Official Identity Presentation */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col items-center space-y-4"
          >
            {/* Logo with Dynamic Rotating Halo */}
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
                className="absolute -inset-3 rounded-full border border-dashed border-emerald-500/30"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
                className="absolute -inset-6 rounded-full border border-slate-800/60"
              />
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-blue-900 to-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.25)] flex items-center justify-center bg-slate-950">
                <img
                  src="/safar-logo.png"
                  alt="S.A.F.A.R."
                  className="w-full h-full object-cover rounded-full bg-white"
                  onError={(e) => { e.currentTarget.src = '/safar-logo.jpg'; }}
                />
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1">
              <div className="flex items-center justify-center space-x-2">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
                  S.A.F.A.R.
                </h1>
                <div className="flex items-center text-blue-400">
                  <AshokaChakraSymbol size={22} className="text-blue-400" />
                </div>
              </div>
              <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-emerald-400">
                Smart AI Framework for Assured & Responsible Tourism
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                SIH Problem Statement SIH25002 • Autonomous Safety Matrix
              </p>
            </div>
          </motion.div>

          {/* Telemetry & Progress Dashboard Console */}
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-2xl backdrop-blur-xl space-y-3.5 text-left"
          >
            {/* Real-time Status Header */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 min-w-0 pr-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  {stageCode}
                </span>
                <span className="text-slate-200 font-mono text-xs truncate">
                  {statusText}
                </span>
              </div>
              <span className="font-mono font-bold text-amber-300 text-sm shrink-0">
                {progress}%
              </span>
            </div>

            {/* High-Precision Tricolor Progress Bar */}
            <div className="relative w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-slate-100 to-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]"
                style={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>

            {/* Bottom Telemetry Status Markers */}
            <div className="pt-2 border-t border-slate-800/70 grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400">
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="truncate">POLICE CAD: ACTIVE</span>
              </div>
              <div className="flex items-center space-x-1.5 justify-center">
                <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">SHA-256 LEDGER</span>
              </div>
              <div className="flex items-center space-x-1.5 justify-end">
                <Radio className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate">GHOST-MESH P2P</span>
              </div>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
