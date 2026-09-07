import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { 
  ShieldCheck, MapPin, Cpu, Lock, AlertOctagon, Activity, Users, 
  FileCheck, CheckCircle2, ArrowRight, Phone, ShieldAlert, Sparkles, 
  Navigation, Play, Eye, Radio, Compass, Zap, SignalZero, Globe, ChevronRight,
  Route, FileCode, Loader2, UserCheck
} from 'lucide-react';
import CinematicHeroMap from '../components/CinematicHeroMap';
import SafarLogo from '../components/SafarLogo';

// Motion Variants
const fadeInUp = {
  hidden: { y: 30, opacity: 0 },
  visible: (delay = 0) => ({
    y: 0, opacity: 1,
    transition: { duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }
  })
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } }
};

// 3D tilt card
function TiltCard({ children, className = '' }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-60, 60], [6, -6]);
  const rotateY = useTransform(x, [-60, 60], [-6, 6]);

  return (
    <motion.div
      className={`perspective-wrapper ${className}`}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - rect.left - rect.width / 2);
        y.set(e.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >
      <motion.div className="tilt-card" style={{ rotateX, rotateY }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

// Animated floating background orb
const Orb = ({ color, size, x, y, delay = 0 }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{ width: size, height: size, background: color, filter: 'blur(60px)', left: x, top: y, opacity: 0.5 }}
    animate={{ y: [0, -40, 0], x: [0, 20, 0], scale: [1, 1.1, 1] }}
    transition={{ duration: 7 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
  />
);

export default function LandingPage({ onScenarioTrigger, onSwitchUser }) {
  const navigate = useNavigate();
  const [executingScenario, setExecutingScenario] = useState(null);

  const handleScenarioClick = async (scenarioId, path) => {
    setExecutingScenario(scenarioId);
    try {
      if (onScenarioTrigger) {
        await onScenarioTrigger(scenarioId);
      }
      if (path) {
        navigate(path);
      }
    } catch (err) {
      console.error('Scenario execution failed:', err);
    } finally {
      setExecutingScenario(null);
    }
  };
  return (
    <div className="pb-20 select-none overflow-hidden" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>

      {/* 🌈 Animated Ticker Ribbon */}
      <div className="relative overflow-hidden py-2.5 px-4"
        style={{
          background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(139,92,246,0.1), rgba(16,185,129,0.08))',
          borderBottom: '1px solid rgba(249,115,22,0.2)',
        }}>
        <div className="ticker-wrap">
          <motion.div
            className="flex items-center space-x-10 text-xs font-bold whitespace-nowrap"
            animate={{ x: ['100vw', '-100%'] }}
            transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
          >
            {[
              { icon: '🛡️', text: 'NATIONAL DEFENSE SENTINEL: OPERATIONAL', color: '#10b981' },
              { icon: '📡', text: 'GHOST-MESH RELAY: 0-SIGNAL RESCUE READY', color: '#8b5cf6' },
              { icon: '🔒', text: 'SHA-256 DIGITAL ID: TAMPER-PROOF LEDGER', color: '#f97316' },
              { icon: '🚨', text: 'POLICE CAD: 112 ERSS LINKED', color: '#ef4444' },
              { icon: '🛰️', text: 'SATELLITE CORRIDORS: LIVE TRACKING ACTIVE', color: '#3b82f6' },
              { icon: '🇮🇳', text: 'SIH 2026 — MINISTRY OF TOURISM, GOVT OF INDIA', color: '#f97316' },
            ].map((item, i) => (
              <span key={i} className="flex items-center space-x-2" style={{ color: item.color }}>
                <span>{item.icon}</span>
                <span>{item.text}</span>
                <span className="text-gray-300">•</span>
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ✨ HERO SECTION */}
      <section className="relative pt-10 pb-20 overflow-hidden hero-gradient">
        {/* Background Orbs */}
        <Orb color="rgba(249,115,22,0.55)" size={500} x="-10%" y="-10%" delay={0} />
        <Orb color="rgba(139,92,246,0.45)" size={600} x="60%" y="-5%" delay={2} />
        <Orb color="rgba(16,185,129,0.4)" size={450} x="30%" y="50%" delay={1} />
        <Orb color="rgba(59,130,246,0.35)" size={350} x="80%" y="60%" delay={3} />

        {/* Particle grid overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: 'radial-gradient(rgba(139,92,246,0.3) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}
            className="flex flex-col items-center text-center space-y-8">

            {/* Emblem */}
            <motion.div variants={fadeInUp} custom={0} className="relative">
              <motion.div
                className="w-28 h-28 rounded-full mx-auto flex items-center justify-center relative"
                animate={{ boxShadow: ['0 0 30px rgba(249,115,22,0.4)', '0 0 60px rgba(139,92,246,0.5)', '0 0 40px rgba(16,185,129,0.4)', '0 0 30px rgba(249,115,22,0.4)'] }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid rgba(249,115,22,0.3)' }}
              >
                {/* Outer spin ring */}
                <motion.div className="absolute -inset-4 rounded-full"
                  style={{ border: '2px dashed rgba(249,115,22,0.4)' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} />
                <motion.div className="absolute -inset-8 rounded-full"
                  style={{ border: '1.5px solid rgba(139,92,246,0.25)' }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} />
                <SafarLogo size="hero" showText={false} animated={true} />
              </motion.div>
            </motion.div>

            {/* Badge */}
            <motion.div variants={fadeInUp} custom={0.1}
              className="inline-flex flex-wrap items-center justify-center gap-1.5 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-2xl sm:rounded-full text-[10px] sm:text-xs font-bold shadow-lg max-w-[95vw] text-center"
              style={{
                background: 'rgba(255,255,255,0.92)',
                border: '1.5px solid rgba(249,115,22,0.35)',
                backdropFilter: 'blur(10px)',
                color: '#ea580c',
              }}>
              <span className="text-sm sm:text-base">🇮🇳</span>
              <span className="tracking-wider sm:tracking-widest">GOVERNMENT OF INDIA • MINISTRY OF TOURISM</span>
              <span className="text-gray-300 hidden sm:inline">•</span>
              <span style={{ color: '#7c3aed' }}>SMART INDIA HACKATHON 2026</span>
            </motion.div>

            {/* Title */}
            <div className="space-y-3 max-w-5xl mx-auto px-2">
              <motion.h1 variants={fadeInUp} custom={0.2}
                className="text-5xl sm:text-8xl lg:text-9xl font-black tracking-tight relative"
                style={{
                  background: 'linear-gradient(135deg, #f97316 0%, #8b5cf6 40%, #10b981 70%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  backgroundSize: '200% 200%',
                  textShadow: 'none',
                }}
              >
                <motion.span
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                  style={{ display: 'block', backgroundSize: '200% 200%' }}
                >
                  S.A.F.A.R.
                </motion.span>
              </motion.h1>

              <motion.p variants={fadeInUp} custom={0.3}
                className="text-lg sm:text-3xl font-extrabold text-gray-700 max-w-4xl mx-auto">
                Smart AI Framework for{' '}
                <span style={{ color: '#f97316' }}>Assured</span> &{' '}
                <span style={{ color: '#8b5cf6' }}>Responsible</span> Tourism
              </motion.p>

              <motion.p variants={fadeInUp} custom={0.4}
                className="text-gray-500 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
                Autonomous tourist safety grid featuring{' '}
                <strong className="text-emerald-600">MaxZoom 22 satellite corridors</strong>,{' '}
                <strong className="text-orange-600">zero-network Ghost-Mesh rescue</strong>, and{' '}
                <strong className="text-violet-600">tamper-proof cryptographic digital passes</strong> across India.
              </motion.p>
            </div>

            {/* CTA Buttons */}
            <motion.div variants={fadeInUp} custom={0.5}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2 w-full max-w-xs sm:max-w-none px-4 sm:px-0">
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link to="/register"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center space-x-2 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #f97316, #8b5cf6)',
                    backgroundSize: '200% 200%',
                    boxShadow: '0 8px 30px rgba(139,92,246,0.4)',
                  }}>
                  <motion.span className="absolute inset-0 rounded-2xl"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }}
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
                  <span className="relative z-10">Issue Digital Tourist Pass</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link to="/tourist-dashboard"
                  className="w-full sm:w-auto px-5 sm:px-7 py-3.5 sm:py-4 font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center space-x-2 border-2"
                  style={{
                    background: 'rgba(255,255,255,0.9)',
                    border: '2px solid rgba(16,185,129,0.4)',
                    color: '#059669',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 25px rgba(16,185,129,0.15)',
                  }}>
                  <Activity className="w-4 h-4" />
                  <span>Tourist Safety Hub</span>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Link to="/authority-dashboard"
                  className="w-full sm:w-auto px-5 sm:px-7 py-3.5 sm:py-4 font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center space-x-2"
                  style={{
                    background: 'rgba(255,255,255,0.9)',
                    border: '2px solid rgba(139,92,246,0.4)',
                    color: '#7c3aed',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 25px rgba(139,92,246,0.15)',
                  }}>
                  <Compass className="w-4 h-4" />
                  <span>Authority Command Desk</span>
                </Link>
              </motion.div>
            </motion.div>

            {/* KPI Pills */}
            <motion.div variants={fadeInUp} custom={0.65}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 pt-4 max-w-4xl w-full">
              {[
                { value: '100%', label: 'Geo-Fencing', sub: 'Acoustic Warning', color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.25)' },
                { value: '< 3.8m', label: 'Emergency', sub: '112 ERSS Handshake', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.25)' },
                { value: 'SHA-256', label: 'Blockchain ID', sub: 'Zero-Trust QR Verify', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)' },
                { value: '0-Bars', label: 'Ghost-Mesh', sub: 'Offline BLE Relay', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)' },
              ].map((kpi, i) => (
                <TiltCard key={i}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    whileHover={{ scale: 1.03 }}
                    className="p-3 sm:p-5 rounded-2xl text-left space-y-1 cursor-pointer"
                    style={{ background: kpi.bg, border: `1.5px solid ${kpi.border}`, backdropFilter: 'blur(8px)' }}
                  >
                    <span className="text-xl sm:text-3xl font-black block font-mono" style={{ color: kpi.color }}>
                      {kpi.value}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-gray-700 block truncate">{kpi.label}</span>
                    <span className="text-[10px] sm:text-xs text-gray-400 block truncate">{kpi.sub}</span>
                  </motion.div>
                </TiltCard>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 🗺️ INTERACTIVE MAP SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(249,115,22,0.2)',
            boxShadow: '0 8px 30px rgba(249,115,22,0.1)',
          }}>
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)' }}>
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                S.A.F.A.R. High-Definition Satellite Telemetry Engine
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              Interactive 3D Corridor Map & Satellite Tiles{' '}
              <span className="text-violet-600">(MaxZoom 22)</span>
            </h2>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-2"
              style={{
                background: 'rgba(16,185,129,0.1)',
                border: '1.5px solid rgba(16,185,129,0.35)',
                color: '#059669',
              }}>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>LIVE GPS RADAR ACTIVE</span>
            </motion.span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="rounded-3xl overflow-hidden"
          style={{ border: '2px solid rgba(139,92,246,0.2)', boxShadow: '0 20px 60px rgba(139,92,246,0.12)' }}>
          <CinematicHeroMap onScenarioTrigger={onScenarioTrigger} />
        </motion.div>
      </section>

      {/* 🎯 SIH EVALUATOR GUIDED SCENARIO SECTION (INLINE BELOW INDIAN MAP) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-6 sm:p-8 rounded-3xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(249,250,251,0.94))',
            border: '2px solid rgba(139,92,246,0.3)',
            boxShadow: '0 20px 60px rgba(139,92,246,0.12), 0 4px 20px rgba(0,0,0,0.04)',
            backdropFilter: 'blur(20px)'
          }}
        >
          {/* Top Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full"
                style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)' }}>
                <Sparkles className="w-4 h-4 text-orange-600 animate-spin-slow" />
                <span className="text-[11px] font-black text-orange-600 uppercase tracking-widest">
                  SIH 2026 EVALUATOR LAB • GUIDED TESTBED
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                SIH Evaluator Guided Scenarios & Live Triggers
              </h2>
              <p className="text-sm text-gray-600 max-w-2xl font-medium">
                Execute real-time edge cases with 1-click: trigger buffer warnings, geo-fence breaches, automated 112 ERSS police patrol dispatch, and cryptographic blockchain pass validation.
              </p>
            </div>

            {/* Quick Role Switches */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                onClick={() => {
                  if (onSwitchUser) onSwitchUser('TOURIST');
                  navigate('/tourist-dashboard');
                }}
                className="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'rgba(16,185,129,0.12)',
                  border: '1.5px solid rgba(16,185,129,0.4)',
                  color: '#047857'
                }}
              >
                <UserCheck className="w-4 h-4" />
                <span>Tourist Safety Hub</span>
              </button>

              <button
                onClick={() => {
                  if (onSwitchUser) onSwitchUser('AUTHORITY');
                  navigate('/authority-dashboard');
                }}
                className="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'rgba(139,92,246,0.12)',
                  border: '1.5px solid rgba(139,92,246,0.4)',
                  color: '#6d28d9'
                }}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Command Desk</span>
              </button>
            </div>
          </div>

          {/* Scenario Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-6">
            {[
              {
                id: '1',
                title: '1. Safe Location',
                tag: 'STANDARD CORRIDOR',
                desc: 'Set tourist in verified safe corridor. AI Risk Score < 15 with nominal green status.',
                icon: CheckCircle2,
                color: '#10b981',
                bg: 'rgba(16,185,129,0.06)',
                border: 'rgba(16,185,129,0.25)',
                path: '/tourist-dashboard'
              },
              {
                id: 'APPROACH_300M',
                title: '2. Approach 300m',
                tag: 'PRE-ENTRY BUFFER',
                desc: 'Advance to 300m buffer from restricted zone. Triggers amber caution and acoustic banner.',
                icon: Navigation,
                color: '#f59e0b',
                bg: 'rgba(245,158,11,0.06)',
                border: 'rgba(245,158,11,0.25)',
                path: '/tourist-dashboard'
              },
              {
                id: 'APPROACH_150M',
                title: '3. Approach 150m',
                tag: 'IMMINENT HAZARD',
                desc: 'Move to 150m from perimeter. Fires urgent orange warning pulse and tactile vibration.',
                icon: ShieldAlert,
                color: '#ea580c',
                bg: 'rgba(234,88,12,0.06)',
                border: 'rgba(234,88,12,0.25)',
                path: '/tourist-dashboard'
              },
              {
                id: '2',
                title: '4. Geo-Fence Breach',
                tag: 'ZONE BREACH',
                desc: 'Simulate entry into Kamakhya Restricted Polygon. Risk Score jumps to 92 (Critical).',
                icon: AlertOctagon,
                color: '#ef4444',
                bg: 'rgba(239,68,68,0.06)',
                border: 'rgba(239,68,68,0.25)',
                path: '/tourist-dashboard'
              },
              {
                id: '3',
                title: '5. Route Deviation',
                tag: 'AI ANOMALY',
                desc: 'Trajectory shift beyond permissible variance. Flags automated abnormal route alert.',
                icon: Route,
                color: '#8b5cf6',
                bg: 'rgba(139,92,246,0.06)',
                border: 'rgba(139,92,246,0.25)',
                path: '/tourist-dashboard'
              },
              {
                id: '4',
                title: '6. Trigger 112 SOS',
                tag: 'EMERGENCY CAD',
                desc: 'Broadcast panic telemetry packet. Initiates 112 ERSS handshake, calculates PCR ETA.',
                icon: Phone,
                color: '#e11d48',
                bg: 'rgba(225,29,72,0.06)',
                border: 'rgba(225,29,72,0.25)',
                path: '/tourist-dashboard'
              },
              {
                id: '5',
                title: '7. Blockchain Verify',
                tag: 'SHA-256 PASS',
                desc: 'Validate tourist digital ID against immutable ledger and confirm zero tampering.',
                icon: FileCode,
                color: '#0284c7',
                bg: 'rgba(2,132,199,0.06)',
                border: 'rgba(2,132,199,0.25)',
                path: '/blockchain-ledger'
              },
              {
                id: '6',
                title: '8. Tampering Test',
                tag: 'ZERO-TRUST AUDIT',
                desc: 'Simulate corrupted cryptographic hash on digital ID. System flags invalid block.',
                icon: ShieldAlert,
                color: '#db2777',
                bg: 'rgba(219,39,119,0.06)',
                border: 'rgba(219,39,119,0.25)',
                path: '/blockchain-ledger'
              }
            ].map((scen) => {
              const Icon = scen.icon;
              const isExecuting = executingScenario === scen.id;

              return (
                <motion.div
                  key={scen.id}
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 rounded-2xl flex flex-col justify-between space-y-3 cursor-pointer transition-all"
                  style={{
                    background: scen.bg,
                    border: `1.5px solid ${scen.border}`,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
                  }}
                  onClick={() => handleScenarioClick(scen.id, scen.path)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${scen.color}15`, border: `1px solid ${scen.border}` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: scen.color }} />
                      </div>
                      <span
                        className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md"
                        style={{ background: `${scen.color}15`, color: scen.color }}
                      >
                        {scen.tag}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-gray-900 leading-tight">
                      {scen.title}
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                      {scen.desc}
                    </p>
                  </div>

                  <button
                    disabled={isExecuting}
                    className="w-full py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 transition-all text-white shadow-sm"
                    style={{
                      background: isExecuting
                        ? '#9ca3af'
                        : `linear-gradient(135deg, ${scen.color}, #4b5563)`,
                      boxShadow: `0 4px 12px ${scen.color}30`
                    }}
                  >
                    {isExecuting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Simulating...</span>
                      </>
                    ) : (
                      <>
                        <span>Execute Scenario</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* 🚨 WHY SAFAR WINS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center space-y-3">
          <span className="text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest"
            style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', color: '#ea580c' }}>
            Solving Real National Safety Challenges
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-gray-900">
            Why Conventional Apps{' '}
            <span style={{ color: '#ef4444' }}>Fail</span> in India
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm">
            India's most breathtaking destinations suffer from zero coverage, abrupt landslides, and counterfeit permits.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: SignalZero, color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.25)', title: 'Zero-Network Dead Zones', desc: "Over 60% of trekking trails in remote mountains have zero cellular coverage. S.A.F.A.R. bridges this using autonomous multi-hop Ghost-Mesh signals.", delay: 0 },
            { icon: AlertOctagon, color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.25)', title: 'Abrupt Terrain Hazards', desc: 'Landslides, flash floods, and wildlife crossings happen in seconds. S.A.F.A.R. issues dynamic 300m/150m proximity warnings before breach.', delay: 0.1 },
            { icon: Lock, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', title: 'Unverified Touts & Scams', desc: "Travelers are frequently exploited by fake guides. S.A.F.A.R.'s blockchain pass guarantees verified government credentials.", delay: 0.2 },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <TiltCard key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: card.delay, duration: 0.6 }}
                  whileHover={{ y: -5 }}
                  className="p-7 rounded-3xl space-y-4 h-full"
                  style={{
                    background: `linear-gradient(135deg, ${card.bg}, rgba(255,255,255,0.95))`,
                    border: `1.5px solid ${card.border}`,
                    backdropFilter: 'blur(10px)',
                    boxShadow: `0 8px 30px ${card.bg}`,
                  }}>
                  <motion.div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: card.bg, border: `1.5px solid ${card.border}` }}
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: i * 1.5 }}
                  >
                    <Icon className="w-7 h-7" style={{ color: card.color }} />
                  </motion.div>
                  <h3 className="text-xl font-black text-gray-900">{card.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{card.desc}</p>
                </motion.div>
              </TiltCard>
            );
          })}
        </div>
      </section>

      {/* 🛡️ ARCHITECTURE MODULES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center space-y-3">
          <span className="text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest"
            style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', color: '#7c3aed' }}>
            6 Architectural Pillars
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-gray-900">
            Complete S.A.F.A.R.{' '}
            <span style={{ color: '#8b5cf6' }}>Protection Matrix</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Radio, color: '#f97316', title: 'Offline Ghost-Mesh Rescue', desc: 'BLE 5.3 & Wi-Fi Direct multi-hop packet relay allows stranded tourists with zero network to reach forest ranger stations.', delay: 0 },
            { icon: MapPin, color: '#8b5cf6', title: 'Dynamic Geo-Fencing', desc: 'High-precision polygon corridor containment with 300m approach and 150m imminent boundary audio-visual alerts before breach.', delay: 0.07 },
            { icon: Cpu, color: '#10b981', title: 'Explainable AI Risk Scoring', desc: 'Transparent 0–100 risk score evaluating terrain gradient, route deviation, time of day, and self-learning post-incident retraining.', delay: 0.14 },
            { icon: Phone, color: '#ef4444', title: '112 India ERSS Live Gateway', desc: 'Direct API handshake with National Emergency Response Support System for automated PCR patrol dispatch and ETA calculation.', delay: 0.21 },
            { icon: FileCheck, color: '#3b82f6', title: 'Blockchain Digital ID', desc: 'SHA-256 cryptographic registration for tourists and certified operators, preventing identity fraud and providing instant verification.', delay: 0.28 },
            { icon: Lock, color: '#ec4899', title: 'DPDP Act 2023 Privacy Center', desc: 'Comprehensive consent management, data minimization policy, and 1-click cryptographic data erasure guaranteeing traveler privacy.', delay: 0.35 },
          ].map((mod, i) => {
            const Icon = mod.icon;
            return (
              <TiltCard key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: mod.delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -6 }}
                  className="p-7 rounded-3xl space-y-4 h-full relative overflow-hidden"
                  style={{
                    background: 'rgba(255,255,255,0.88)',
                    backdropFilter: 'blur(12px)',
                    border: `1.5px solid ${mod.color}30`,
                    boxShadow: `0 8px 30px ${mod.color}12`,
                  }}
                >
                  {/* Gradient orb in card */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none"
                    style={{ background: `${mod.color}12`, filter: 'blur(20px)' }} />

                  <motion.div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center relative z-10"
                    style={{ background: `${mod.color}12`, border: `1.5px solid ${mod.color}35` }}
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    <Icon className="w-7 h-7" style={{ color: mod.color }} />
                  </motion.div>
                  <h3 className="text-lg font-black text-gray-900 relative z-10">{mod.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed relative z-10">{mod.desc}</p>
                </motion.div>
              </TiltCard>
            );
          })}
        </div>
      </section>

      {/* 🏆 FOOTER */}
      <footer className="pt-12 pb-6 text-center space-y-4"
        style={{ borderTop: '1px solid rgba(139,92,246,0.15)' }}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center justify-center space-x-2">
          <SafarLogo size="xs" showSubtitle={false} />
        </motion.div>
        <p className="text-sm text-gray-500 font-medium">
          © 2026 S.A.F.A.R. | Smart AI Framework for Assured & Responsible Tourism
        </p>
        <p className="text-xs text-gray-400">
          Developed for Smart India Hackathon 2026 | Ministry of Tourism, Govt. of India
        </p>
        {/* Tricolor footer bar */}
        <div className="h-1 max-w-xs mx-auto rounded-full"
          style={{ background: 'linear-gradient(90deg, #f97316, #ffffff, #10b981)' }} />
      </footer>
    </div>
  );
}