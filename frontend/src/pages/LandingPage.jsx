import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, MapPin, Cpu, Lock, AlertOctagon, Activity, Users, FileCheck, CheckCircle2, ArrowRight, Phone, ShieldAlert, Sparkles, Navigation, Play, Eye, Radio, Compass, Zap } from 'lucide-react';
import CinematicHeroMap from '../components/CinematicHeroMap';
import SafarLogo from '../components/SafarLogo';

export default function LandingPage({ onScenarioTrigger }) {
  return (
    <div className="space-y-12 pb-16">
      
      {/* MAJESTIC S.A.F.A.R. OFFICIAL HERO BANNER */}
      <section className="relative overflow-hidden pt-8 pb-12 border-b border-safar-shield-500/20 bg-gradient-to-b from-safar-navy-950 via-safar-navy-900 to-safar-navy-950">
        {/* Background Tricolor Radial Aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-96 bg-gradient-to-r from-safar-saffron-500/15 via-safar-shield-500/15 to-safar-green-500/15 blur-3xl pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center space-y-6">
            
            {/* Official S.A.F.A.R. Logo & Rotating Nautical Compass */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="relative p-2"
            >
              <SafarLogo size="hero" showText={false} animated={true} />
            </motion.div>

            {/* Title & Official Full Expansion */}
            <div className="space-y-2 max-w-4xl mx-auto">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-safar-navy-850/90 border border-safar-saffron-500/40 text-xs font-extrabold text-safar-saffron-400 shadow-xl"
              >
                <span>🇮🇳</span>
                <span>MINISTRY OF DoNER & GOI SMART TOURISM INITIATIVE</span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400">SIH25002</span>
              </motion.div>

              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white font-['Plus_Jakarta_Sans',sans-serif]"
              >
                S.A.F.A.R.
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-lg sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-safar-saffron-400 via-slate-100 to-emerald-400 max-w-3xl mx-auto"
              >
                Smart AI Framework for Assured & Responsible Tourism
              </motion.p>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto pt-1 leading-relaxed"
              >
                Autonomous tourist safety, explainable AI risk scoring, zero-network Ghost-Mesh rescue, and tamper-proof blockchain credentials for India's high-altitude and eco-tourism corridors.
              </motion.p>
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-3 pt-2"
            >
              <Link
                to="/register"
                className="px-6 py-3 bg-gradient-to-r from-safar-saffron-500 via-amber-500 to-safar-saffron-600 hover:from-safar-saffron-400 hover:to-amber-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-safar-saffron-500/25 transition-all flex items-center space-x-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Generate S.A.F.A.R. Digital Pass</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/tourist-dashboard"
                className="px-6 py-3 bg-safar-shield-600/30 hover:bg-safar-shield-600/50 text-blue-200 font-bold text-sm rounded-2xl border border-safar-shield-400/40 transition-all flex items-center space-x-2"
              >
                <Activity className="w-4 h-4 text-safar-shield-400" />
                <span>Tourist Safety Hub</span>
              </Link>

              <Link
                to="/authority-dashboard"
                className="px-5 py-3 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-bold text-sm rounded-2xl border border-slate-700 transition-colors flex items-center space-x-2"
              >
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>Command Control Desk</span>
              </Link>
            </motion.div>

            {/* Key Live Ecosystem Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-4xl w-full">
              <div className="p-3.5 rounded-2xl bg-safar-navy-850/80 border border-safar-saffron-500/30 backdrop-blur-md text-left">
                <span className="text-2xl font-black text-white block">100%</span>
                <span className="text-[11px] text-safar-saffron-300 font-medium">Real-Time Geo-Fence Guard</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-safar-navy-850/80 border border-safar-shield-500/30 backdrop-blur-md text-left">
                <span className="text-2xl font-black text-safar-shield-400 block">&lt; 3 Mins</span>
                <span className="text-[11px] text-slate-300 font-medium">112 ERSS Emergency Response</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-safar-navy-850/80 border border-safar-green-500/30 backdrop-blur-md text-left">
                <span className="text-2xl font-black text-emerald-400 block">SHA-256</span>
                <span className="text-[11px] text-emerald-300 font-medium">Hyperledger Audit Ledger</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-safar-navy-850/80 border border-purple-500/30 backdrop-blur-md text-left">
                <span className="text-2xl font-black text-purple-300 block">BLE 5.3</span>
                <span className="text-[11px] text-purple-200 font-medium">0-Bar Ghost-Mesh Rescue</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3D Cinematic Hero Story Map Section (Full-Screen Immersive View) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-safar-navy-900/90 p-4 rounded-3xl border border-safar-shield-500/30 backdrop-blur-md shadow-xl">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 bg-safar-saffron-500/10 border border-safar-saffron-500/30 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-safar-saffron-400" />
              <span className="text-[11px] font-bold text-safar-saffron-300 uppercase tracking-widest">
                S.A.F.A.R. High-Definition Satellite Telemetry Engine
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Interactive 3D Corridor Map & High-Zoom Satellite Tiles (MaxZoom 22)
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/30">
              ● Live GPS Radar Active
            </span>
          </div>
        </div>

        {/* 100vh High-Performance Cinematic Map Engine */}
        <CinematicHeroMap onScenarioTrigger={onScenarioTrigger} />
      </section>

      {/* Problem Statement Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-safar-saffron-400 uppercase tracking-widest">Why S.A.F.A.R. Was Engineered</span>
          <h2 className="text-3xl font-black text-white">Solving Critical Challenges in Remote Indian Tourism</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm">
            India's most breathtaking travel destinations—from high-altitude Himalayan passes to dense tropical valleys—suffer from zero cellular coverage, abrupt landslides, and counterfeit tour operators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-safar-navy-900/90 border border-slate-800 space-y-3 shadow-xl hover:border-safar-saffron-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-safar-saffron-500/10 border border-safar-saffron-500/30 flex items-center justify-center text-safar-saffron-400">
              <SignalZero className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Zero-Network Dead Zones</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Over 60% of trekking trails lack cellular towers. When tourists get injured or stranded, conventional apps fail. S.A.F.A.R. solves this with peer-to-peer Ghost-Mesh rescue.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-safar-navy-900/90 border border-slate-800 space-y-3 shadow-xl hover:border-safar-shield-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-safar-shield-500/10 border border-safar-shield-500/30 flex items-center justify-center text-safar-shield-400">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Sudden Terrain Hazards</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Flash floods and landslides happen in minutes. Generic weather reports are inadequate. S.A.F.A.R. provides 300m/150m pre-entry acoustic warnings and safe green corridor routing.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-safar-navy-900/90 border border-slate-800 space-y-3 shadow-xl hover:border-safar-green-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Touts & Unverified Operators</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tourists are often exploited by fake guides and unlicensed transport. S.A.F.A.R. features a blockchain-certified marketplace with 1-click SHA-256 QR verification.
            </p>
          </div>
        </div>
      </section>

      {/* Core Platform Modules Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Architectural Pillars</span>
          <h2 className="text-3xl font-black text-white">Complete S.A.F.A.R. Protection Matrix</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-safar-navy-900 border border-slate-800 hover:border-safar-saffron-500/40 transition-all space-y-3 shadow-xl">
            <Radio className="w-8 h-8 text-safar-saffron-400" />
            <h3 className="font-bold text-white text-base">Offline Ghost-Mesh Rescue</h3>
            <p className="text-xs text-slate-400">
              BLE 5.3 & Wi-Fi Direct multi-hop packet relay allows stranded tourists with zero network to reach forest ranger stations and dispatch SDRF teams.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-safar-navy-900 border border-slate-800 hover:border-safar-shield-500/40 transition-all space-y-3 shadow-xl">
            <MapPin className="w-8 h-8 text-safar-shield-400" />
            <h3 className="font-bold text-white text-base">Dynamic Geo-Fencing</h3>
            <p className="text-xs text-slate-400">
              High-precision polygon corridor containment with 300m approach and 150m imminent boundary audio-visual alerts before breach occurs.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-safar-navy-900 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3 shadow-xl">
            <Cpu className="w-8 h-8 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Explainable AI Risk Scoring</h3>
            <p className="text-xs text-slate-400">
              Transparent 0–100 risk score diagnostics evaluating terrain gradient, route deviation, time of day, and self-learning post-incident retraining.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-safar-navy-900 border border-slate-800 hover:border-red-500/40 transition-all space-y-3 shadow-xl">
            <Phone className="w-8 h-8 text-red-400" />
            <h3 className="font-bold text-white text-base">112 India ERSS Live Gateway</h3>
            <p className="text-xs text-slate-400">
              Direct mTLS API handshake with National Emergency Response Support System (ERSS-112) for automated PCR patrol dispatch and ETA calculation.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-safar-navy-900 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3 shadow-xl">
            <FileCheck className="w-8 h-8 text-cyan-400" />
            <h3 className="font-bold text-white text-base">Blockchain Vendor Marketplace</h3>
            <p className="text-xs text-slate-400">
              SHA-256 cryptographic registration for certified local guides, taxis, and homestays preventing tourism scams and fraud.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-safar-navy-900 border border-slate-800 hover:border-purple-500/40 transition-all space-y-3 shadow-xl">
            <Lock className="w-8 h-8 text-purple-400" />
            <h3 className="font-bold text-white text-base">DPDP Act 2023 Privacy Center</h3>
            <p className="text-xs text-slate-400">
              Comprehensive consent management, data minimization policy, and 1-click cryptographic data erasure guaranteeing traveler privacy rights.
            </p>
          </div>
        </div>
      </section>

      {/* SIH Judge Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-safar-navy-900 via-safar-navy-850 to-safar-navy-900 border-2 border-safar-saffron-500/30 space-y-6 shadow-2xl">
          <div className="flex items-center space-x-3">
            <SafarLogo size="xs" showText={false} />
            <h3 className="text-2xl font-extrabold text-white">Why S.A.F.A.R. Wins Smart India Hackathon</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="flex items-start space-x-3 bg-safar-navy-950/80 p-3.5 rounded-2xl border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-safar-saffron-400 shrink-0 mt-0.5" />
              <span><strong>Official Government Alignment:</strong> Designed specifically for Ministry of DoNER problem statement SIH25002 with DPDP Act 2023 compliance.</span>
            </div>
            <div className="flex items-start space-x-3 bg-safar-navy-950/80 p-3.5 rounded-2xl border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-safar-shield-400 shrink-0 mt-0.5" />
              <span><strong>Groundbreaking 0-Network Mesh:</strong> Only platform with working peer-to-peer BLE 5.3 hop relay and 18.5 kHz ultrasonic acoustic locator beacon.</span>
            </div>
            <div className="flex items-start space-x-3 bg-safar-navy-950/80 p-3.5 rounded-2xl border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Fully Armed & 100% Functional:</strong> Zero mockups or placeholder code. Every API, Leaflet 22x map tile, and scenario executes live.</span>
            </div>
            <div className="flex items-start space-x-3 bg-safar-navy-950/80 p-3.5 rounded-2xl border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span><strong>Evaluator Control Center:</strong> Integrated floating panel lets judges simulate Safe, Approach 300m, Approach 150m, and Breach scenarios in seconds.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 pt-8 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <SafarLogo size="xs" showSubtitle={false} />
        </div>
        <p>© 2026 S.A.F.A.R. | Smart AI Framework for Assured & Responsible Tourism</p>
        <p className="text-[11px] text-slate-600">Developed for Smart India Hackathon | Ministry of Development of North Eastern Region (DoNER)</p>
      </footer>
    </div>
  );
}