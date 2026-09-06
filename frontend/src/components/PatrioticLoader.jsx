import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, Navigation, Globe, Lock, Radio, Cpu, Zap } from 'lucide-react';
import SafarLogo from './SafarLogo';

// 24-Spoke Ashoka Chakra
const AshokaChakraSymbol = ({ size = 28, className = '' }) => {
  const spokes = Array.from({ length: 24 });
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 100 100" className={`shrink-0 ${className}`}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
    >
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.8" />
      <circle cx="50" cy="50" r="7" fill="currentColor" />
      {spokes.map((_, i) => {
        const angle = i * 15;
        const rad = (angle * Math.PI) / 180;
        const x2 = 50 + 44 * Math.sin(rad);
        const y2 = 50 - 44 * Math.cos(rad);
        return (
          <line key={i} x1="50" y1="50" x2={x2} y2={y2}
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
        );
      })}
    </motion.svg>
  );
};

// Floating orb particle
const FloatingOrb = ({ color, size, top, left, delay }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{ width: size, height: size, background: color, filter: 'blur(40px)', top, left, opacity: 0.35 }}
    animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.15, 1] }}
    transition={{ duration: 6 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
  />
);

const stages = [
  { code: 'SYS_INIT', text: 'Verifying SHA-256 Tourist Cryptographic Credentials...', icon: Lock, color: '#f97316' },
  { code: 'GEOSPATIAL', text: 'Calibrating Satellite Geo-Corridors & High-Hazard Polygons...', icon: Navigation, color: '#8b5cf6' },
  { code: 'GHOST_MESH', text: 'Synchronizing Zero-Network Offline Ghost-Mesh Relay...', icon: Radio, color: '#10b981' },
  { code: 'RAPID_SOS', text: 'Interfacing State Police Command & Community Safety Net...', icon: Zap, color: '#3b82f6' },
  { code: 'READY', text: 'S.A.F.A.R. Safety Gateway Operational & Active!', icon: Shield, color: '#f97316' },
];

export default function PatrioticLoader({ onLoadingComplete }) {
  const [progress, setProgress] = useState(0);
  const [stageIdx, setStageIdx] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const durationMs = 2800;
    const intervalMs = 18;
    const totalSteps = durationMs / intervalMs;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const nextProgress = Math.min(100, Math.round((currentStep / totalSteps) * 100));
      setProgress(nextProgress);

      if (nextProgress < 20) setStageIdx(0);
      else if (nextProgress < 45) setStageIdx(1);
      else if (nextProgress < 70) setStageIdx(2);
      else if (nextProgress < 90) setStageIdx(3);
      else setStageIdx(4);

      if (nextProgress >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          setIsFinished(true);
          if (onLoadingComplete) onLoadingComplete();
        }, 500);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  if (isFinished) return null;

  const currentStage = stages[stageIdx];
  const StageIcon = currentStage.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden select-none"
        style={{
          background: 'linear-gradient(135deg, #fff8f0 0%, #fdf4ff 35%, #f0fff8 65%, #f0f4ff 100%)',
        }}
      >
        {/* Floating Color Orbs */}
        <FloatingOrb color="rgba(249,115,22,0.6)" size={300} top="5%" left="5%" delay={0} />
        <FloatingOrb color="rgba(139,92,246,0.5)" size={350} top="10%" left="60%" delay={2} />
        <FloatingOrb color="rgba(16,185,129,0.5)" size={280} top="65%" left="70%" delay={1} />
        <FloatingOrb color="rgba(59,130,246,0.4)" size={250} top="70%" left="2%" delay={3} />
        <FloatingOrb color="rgba(236,72,153,0.4)" size={200} top="45%" left="40%" delay={1.5} />

        {/* Particle dot grid */}
        <div className="absolute inset-0 particle-bg opacity-40" />

        {/* Main Content Card */}
        <motion.div
          initial={{ y: 30, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-md mx-4 text-center"
        >
          {/* Card */}
          <div className="rounded-3xl p-8 space-y-7 relative overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(30px)',
              border: '1.5px solid rgba(255,255,255,0.9)',
              boxShadow: '0 30px 80px rgba(139,92,246,0.18), 0 8px 20px rgba(249,115,22,0.1)',
            }}>

            {/* Animated background pattern inside card */}
            <motion.div
              className="absolute inset-0 opacity-20 pointer-events-none rounded-3xl"
              animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, rgba(139,92,246,0.15) 0, rgba(139,92,246,0.15) 1px, transparent 0, transparent 50%)',
                backgroundSize: '10px 10px',
              }}
            />

            {/* Top Badge */}
            <motion.div
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(255,247,237,1), rgba(253,244,255,1))',
                border: '1.5px solid rgba(249,115,22,0.3)',
                color: '#ea580c',
              }}
            >
              <span>🇮🇳</span>
              <span className="tracking-wide">MINISTRY OF TOURISM</span>
              <span style={{ color: '#d1d5db' }}>•</span>
              <span style={{ color: '#7c3aed' }}>GOVT OF INDIA</span>
            </motion.div>

            {/* Logo Section */}
            <div className="flex flex-col items-center space-y-4 relative">
              {/* Rotating ring system */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* Outer ring spin */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: '2px dashed rgba(249,115,22,0.4)' }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                />
                {/* Middle ring spin */}
                <motion.div
                  className="absolute inset-3 rounded-full"
                  style={{ border: '2px solid rgba(139,92,246,0.3)' }}
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 14, ease: 'linear' }}
                />
                {/* Inner glow ring */}
                <motion.div
                  className="absolute inset-6 rounded-full"
                  style={{ border: '1.5px dashed rgba(16,185,129,0.5)' }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                />

                {/* Pulsing glow orb */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(249,115,22,0.3)',
                      '0 0 40px rgba(139,92,246,0.4)',
                      '0 0 30px rgba(16,185,129,0.3)',
                      '0 0 20px rgba(249,115,22,0.3)',
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />

                {/* Logo */}
                <div className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,247,237,1) 0%, rgba(253,244,255,1) 100%)',
                    border: '2px solid rgba(249,115,22,0.3)',
                    boxShadow: '0 8px 30px rgba(249,115,22,0.2)',
                  }}>
                  <img
                    src="/safar-logo.png" alt="S.A.F.A.R."
                    className="w-16 h-16 object-cover rounded-full"
                    onError={(e) => { e.currentTarget.src = '/safar-logo.jpg'; }}
                  />
                </div>

                {/* Ashoka Chakra decorative ring */}
                <div className="absolute top-0 right-0 text-blue-600">
                  <AshokaChakraSymbol size={24} className="text-blue-500 opacity-70" />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <motion.h1
                  className="text-4xl font-black tracking-tight"
                  style={{
                    background: 'linear-gradient(135deg, #f97316, #8b5cf6, #10b981)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    backgroundSize: '200% 200%',
                  }}
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  S.A.F.A.R.
                </motion.h1>
                <p className="text-sm font-semibold tracking-wide text-gray-600">
                  Smart AI Framework for Assured & Responsible Tourism
                </p>
                <p className="text-[11px] text-gray-400 font-mono">SIH Problem Statement SIH25002 • Autonomous Safety Matrix</p>
              </div>
            </div>

            {/* Progress Section */}
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="rounded-2xl p-4 space-y-3.5"
              style={{
                background: 'linear-gradient(135deg, rgba(249,115,22,0.05), rgba(139,92,246,0.06))',
                border: '1px solid rgba(139,92,246,0.15)',
              }}
            >
              {/* Stage indicator */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={stageIdx}
                  initial={{ x: 10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -10, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2 min-w-0 pr-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
                      style={{ background: `${currentStage.color}18`, color: currentStage.color, border: `1px solid ${currentStage.color}40` }}>
                      {currentStage.code}
                    </span>
                    <span className="text-gray-600 font-mono text-xs truncate">{currentStage.text}</span>
                  </div>
                  <motion.span
                    key={progress}
                    className="font-black text-sm shrink-0 ml-2"
                    style={{ color: currentStage.color }}
                  >
                    {progress}%
                  </motion.span>
                </motion.div>
              </AnimatePresence>

              {/* Rainbow Progress Bar */}
              <div className="relative w-full h-3 rounded-full overflow-hidden"
                style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
                <motion.div
                  className="h-full rounded-full relative"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #f97316, #8b5cf6, #10b981)',
                    backgroundSize: '200% 100%',
                  }}
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  {/* Shimmer on bar */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                    }}
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  />
                </motion.div>
              </div>

              {/* Bottom telemetry */}
              <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-gray-500 pt-1 border-t border-gray-100">
                <div className="flex items-center space-x-1">
                  <motion.span className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                    animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
                  <span>POLICE CAD</span>
                </div>
                <div className="flex items-center space-x-1 justify-center">
                  <Lock className="w-3 h-3 text-orange-400 shrink-0" />
                  <span>SHA-256</span>
                </div>
                <div className="flex items-center space-x-1 justify-end">
                  <Radio className="w-3 h-3 text-violet-500 shrink-0" />
                  <span>GHOST-MESH</span>
                </div>
              </div>
            </motion.div>

            {/* Stage icons row */}
            <div className="flex items-center justify-center space-x-3">
              {stages.map((s, i) => {
                const Icon = s.icon;
                const isActive = i === stageIdx;
                const isDone = i < stageIdx;
                return (
                  <motion.div
                    key={s.code}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    animate={{
                      scale: isActive ? 1.2 : 1,
                      opacity: isDone ? 0.5 : isActive ? 1 : 0.3,
                    }}
                    style={{
                      background: isActive ? `${s.color}20` : 'rgba(0,0,0,0.05)',
                      border: `1.5px solid ${isActive ? s.color : 'rgba(0,0,0,0.1)'}`,
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: isActive ? s.color : '#9ca3af' }} />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
