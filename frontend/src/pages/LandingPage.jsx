import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, MapPin, Cpu, Lock, AlertOctagon, Activity, Users, 
  FileCheck, CheckCircle2, ArrowRight, Phone, ShieldAlert, Sparkles, 
  Navigation, Play, Eye, Radio, Compass, Zap, SignalZero, Globe, ChevronRight 
} from 'lucide-react';
import CinematicHeroMap from '../components/CinematicHeroMap';
import SafarLogo from '../components/SafarLogo';

// Motion transition variants
const fadeInUp = {
  hidden: { y: 25, opacity: 0 },
  visible: (delay = 0) => ({
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }
  })
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

export default function LandingPage({ onScenarioTrigger }) {
  return (
    <div className="space-y-16 pb-20 select-none font-sans overflow-hidden">
      
      {/* 🟢 Real-time Live Security Ticker Ribbon */}
      <div className="bg-slate-950/90 border-b border-slate-800/80 py-2 px-4 backdrop-blur-md overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="hidden sm:inline">NATIONAL DEFENSE SENTINEL:</span>
            <span className="text-white">OPERATIONAL</span>
          </div>

          <div className="hidden md:flex items-center space-x-6 text-[11px] text-slate-400">
            <span className="flex items-center space-x-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>GHOST-MESH RELAY: <strong className="text-cyan-300">0-SIGNAL RESCUE READY</strong></span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>SHA-256 DIGITAL ID: <strong className="text-amber-300">TAMPER-PROOF LEDGER</strong></span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center space-x-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>POLICE CAD: <strong className="text-rose-300">112 ERSS LINKED</strong></span>
            </span>
          </div>

          <div className="text-[11px] text-amber-400 font-bold">
            SIH 2026 OFFICIAL MATRIX
          </div>
        </div>
      </div>

      {/* 🌟 MAJESTIC S.A.F.A.R. HERO SECTION */}
      <section className="relative pt-6 pb-16 border-b border-slate-800/70 bg-gradient-to-b from-[#030712] via-[#050b18] to-[#030712] overflow-hidden">
        
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-orange-500/10 via-blue-600/10 to-emerald-500/10 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/8 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/8 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center text-center space-y-7"
          >
            
            {/* S.A.F.A.R. Official Emblem with Concentric Compass Ring */}
            <motion.div
              variants={fadeInUp}
              custom={0}
              className="relative p-2"
            >
              <div className="relative group cursor-pointer">
                <SafarLogo size="hero" showText={false} animated={true} />
              </div>
            </motion.div>

            {/* Title & Official Expansion */}
            <div className="space-y-3 max-w-4xl mx-auto">
              
              {/* National Authority Badge */}
              <motion.div
                variants={fadeInUp}
                custom={0.1}
                className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-xs font-extrabold text-amber-300 shadow-xl backdrop-blur-xl"
              >
                <span className="text-sm">🇮🇳</span>
                <span className="tracking-wide">GOVERNMENT OF INDIA • MINISTRY OF TOURISM</span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400">SMART INDIA HACKATHON 2026</span>
              </motion.div>

              {/* Main Brand Title */}
              <motion.h1
                variants={fadeInUp}
                custom={0.2}
                className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
              >
                S.A.F.A.R.
              </motion.h1>

              {/* Subtitle with Glowing Tricolor Gradient */}
              <motion.p
                variants={fadeInUp}
                custom={0.3}
                className="text-lg sm:text-2xl lg:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-slate-100 to-emerald-400 max-w-3xl mx-auto tracking-tight"
              >
                Smart AI Framework for Assured & Responsible Tourism
              </motion.p>

              {/* Mission Statement */}
              <motion.p
                variants={fadeInUp}
                custom={0.4}
                className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto pt-1 leading-relaxed font-normal"
              >
                Autonomous tourist safety grid featuring <strong className="text-emerald-300 font-semibold">MaxZoom 22 satellite corridors</strong>, <strong className="text-amber-300 font-semibold">zero-network Ghost-Mesh rescue</strong>, and <strong className="text-cyan-300 font-semibold">tamper-proof cryptographic digital passes</strong> across India.
              </motion.p>
            </div>

            {/* Interactive Call to Action Buttons */}
            <motion.div
              variants={fadeInUp}
              custom={0.5}
              className="flex flex-wrap items-center justify-center gap-3.5 pt-2"
            >
              <Link
                to="/register"
                className="px-7 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm rounded-2xl shadow-2xl shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center space-x-2"
              >
                <ShieldCheck className="w-5 h-5 text-slate-950" />
                <span>Issue Digital Tourist Pass</span>
                <ArrowRight className="w-4 h-4 text-slate-950 ml-1" />
              </Link>

              <Link
                to="/tourist-dashboard"
                className="px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-emerald-300 font-bold text-sm rounded-2xl border border-emerald-500/30 hover:border-emerald-500/60 transition-all shadow-xl backdrop-blur-xl flex items-center space-x-2"
              >
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Tourist Safety Hub</span>
              </Link>

              <Link
                to="/authority-dashboard"
                className="px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-bold text-sm rounded-2xl border border-slate-700 hover:border-slate-500 transition-all shadow-xl backdrop-blur-xl flex items-center space-x-2"
              >
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Authority Command Desk</span>
              </Link>
            </motion.div>

            {/* 4 Interactive Feature KPI Pills */}
            <motion.div 
              variants={fadeInUp}
              custom={0.6}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-6 max-w-4xl w-full"
            >
              <div className="p-4 rounded-2xl pro-glass-card text-left space-y-1">
                <span className="text-2xl sm:text-3xl font-black text-amber-400 block font-mono">100%</span>
                <span className="text-xs text-slate-200 font-bold block">Dynamic Geo-Fencing</span>
                <span className="text-[10px] text-slate-400">Acoustic Pre-Entry Warning</span>
              </div>
              
              <div className="p-4 rounded-2xl pro-glass-card text-left space-y-1">
                <span className="text-2xl sm:text-3xl font-black text-cyan-400 block font-mono">&lt; 3.8m</span>
                <span className="text-xs text-slate-200 font-bold block">Emergency Dispatch</span>
                <span className="text-[10px] text-slate-400">112 ERSS Police Handshake</span>
              </div>

              <div className="p-4 rounded-2xl pro-glass-card text-left space-y-1">
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 block font-mono">SHA-256</span>
                <span className="text-xs text-slate-200 font-bold block">Blockchain Credential</span>
                <span className="text-[10px] text-slate-400">Zero-Trust QR Verification</span>
              </div>

              <div className="p-4 rounded-2xl pro-glass-card text-left space-y-1">
                <span className="text-2xl sm:text-3xl font-black text-rose-400 block font-mono">0-Bars</span>
                <span className="text-xs text-slate-200 font-bold block">Ghost-Mesh P2P</span>
                <span className="text-[10px] text-slate-400">Offline BLE Hop Relay</span>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* 🗺️ 3D CINEMATIC INTERACTIVE STORY MAP SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-3xl border border-slate-800 backdrop-blur-xl shadow-2xl">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                S.A.F.A.R. High-Definition Satellite Telemetry Engine
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Interactive 3D Corridor Map & High-Zoom Satellite Tiles (MaxZoom 22)
            </h2>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/30 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE GPS RADAR ACTIVE</span>
            </span>
          </div>
        </div>

        {/* 100vh High-Performance Cinematic Map Engine */}
        <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
          <CinematicHeroMap onScenarioTrigger={onScenarioTrigger} />
        </div>
      </section>

      {/* 🚨 CRITICAL CHALLENGES IN INDIAN TOURISM (Why S.A.F.A.R. Wins) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2.5">
          <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Solving Real National Safety Challenges
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Why Conventional Travel Apps Fail in India</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-xs sm:text-sm">
            India's most breathtaking tourism destinations—from high-altitude Himalayan passes to dense tropical valleys—suffer from zero cellular coverage, abrupt landslides, and counterfeit permits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-3xl pro-glass-card space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <SignalZero className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Zero-Network Dead Zones</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Over 60% of trekking trails in remote mountains have zero cellular coverage. S.A.F.A.R. bridges this gap using autonomous multi-hop peer-to-peer Ghost-Mesh signals without internet.
            </p>
          </div>

          <div className="p-6 rounded-3xl pro-glass-card space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Abrupt Terrain Hazards</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Landslides, flash floods, and wildlife crossings happen in seconds. S.A.F.A.R. issues dynamic 300m/150m proximity warnings before a tourist enters danger zones.
            </p>
          </div>

          <div className="p-6 rounded-3xl pro-glass-card space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Unverified Touts & Scams</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Foreign and domestic travelers are frequently exploited by fake guides. S.A.F.A.R.'s blockchain pass and marketplace guarantee verified government credentials.
            </p>
          </div>

        </div>
      </section>

      {/* 🛡️ ARCHITECTURAL MODULES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2.5">
          <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            6 Architectural Pillars
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Complete S.A.F.A.R. Protection Matrix</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-3xl pro-glass-card space-y-3">
            <Radio className="w-8 h-8 text-amber-400" />
            <h3 className="font-bold text-white text-base">Offline Ghost-Mesh Rescue</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              BLE 5.3 & Wi-Fi Direct multi-hop packet relay allows stranded tourists with zero network to reach forest ranger stations and dispatch rescue teams.
            </p>
          </div>

          <div className="p-6 rounded-3xl pro-glass-card space-y-3">
            <MapPin className="w-8 h-8 text-blue-400" />
            <h3 className="font-bold text-white text-base">Dynamic Geo-Fencing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-precision polygon corridor containment with 300m approach and 150m imminent boundary audio-visual alerts before breach occurs.
            </p>
          </div>

          <div className="p-6 rounded-3xl pro-glass-card space-y-3">
            <Cpu className="w-8 h-8 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Explainable AI Risk Scoring</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transparent 0–100 risk score diagnostics evaluating terrain gradient, route deviation, time of day, and self-learning post-incident retraining.
            </p>
          </div>

          <div className="p-6 rounded-3xl pro-glass-card space-y-3">
            <Phone className="w-8 h-8 text-rose-400" />
            <h3 className="font-bold text-white text-base">112 India ERSS Live Gateway</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct API handshake with National Emergency Response Support System (ERSS-112) for automated PCR patrol dispatch and ETA calculation.
            </p>
          </div>

          <div className="p-6 rounded-3xl pro-glass-card space-y-3">
            <FileCheck className="w-8 h-8 text-cyan-400" />
            <h3 className="font-bold text-white text-base">Blockchain Digital ID</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              SHA-256 cryptographic registration for tourists and certified operators, preventing identity fraud and providing instant verification.
            </p>
          </div>

          <div className="p-6 rounded-3xl pro-glass-card space-y-3">
            <Lock className="w-8 h-8 text-purple-400" />
            <h3 className="font-bold text-white text-base">DPDP Act 2023 Privacy Center</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Comprehensive consent management, data minimization policy, and 1-click cryptographic data erasure guaranteeing traveler privacy rights.
            </p>
          </div>

        </div>
      </section>

      {/* 🏆 FOOTER */}
      <footer className="border-t border-slate-800/80 pt-10 text-center text-xs text-slate-500 space-y-3">
        <div className="flex items-center justify-center space-x-2">
          <SafarLogo size="xs" showSubtitle={false} />
        </div>
        <p className="font-medium text-slate-400">
          © 2026 S.A.F.A.R. | Smart AI Framework for Assured & Responsible Tourism
        </p>
        <p className="text-[11px] text-slate-600">
          Developed for Smart India Hackathon 2026 | Ministry of Tourism, Govt. of India
        </p>
      </footer>

    </div>
  );
}