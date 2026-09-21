import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { 
  Compass, MapPin, Route, Car, Hotel, Award, ShieldCheck, Sparkles, 
  ArrowRight, CheckCircle2, ShieldAlert, AlertOctagon, Activity, Radio, 
  Phone, Users, Star, FileCode, Loader2, UserCheck, Zap, SignalZero, Lock, FileCheck, Cpu
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

  const featuredCircuits = [
    {
      name: 'Ayodhya Dham Corridor',
      state: 'Uttar Pradesh',
      desc: 'Ram Janmabhoomi Mandir, Saryu Ghat Aarti & ancient sacred paths',
      icon: '🛕',
      color: '#f97316',
      badge: 'Heritage & Spiritual',
      tag: 'AYODHYA'
    },
    {
      name: 'Katra & Vaishno Devi',
      state: 'Jammu & Kashmir',
      desc: 'Holy Trikuta Mountain track, Bhawan ropeway & Himalayan foothills',
      icon: '🏔️',
      color: '#06b6d4',
      badge: 'Mountain Pilgrimage',
      tag: 'JAMMU'
    },
    {
      name: 'Agra Heritage Promenade',
      state: 'Uttar Pradesh',
      desc: 'UNESCO Taj Mahal sunrise view, Agra Fort & Fatehpur Sikri',
      icon: '🕌',
      color: '#8b5cf6',
      badge: 'World Heritage',
      tag: 'AGRA'
    },
    {
      name: 'Kashi Vishwanath Ghats',
      state: 'Varanasi, UP',
      desc: 'Living cultural ghats, Ganga sunrise boats & evening Maha Aarti',
      icon: '🕉️',
      color: '#eab308',
      badge: 'Living Culture',
      tag: 'VARANASI'
    },
    {
      name: 'Meghalaya Monsoon Circuit',
      state: 'Shillong & Sohra',
      desc: 'Living root bridges, Nohkalikai cascade & crystal Dawki river',
      icon: '🌿',
      color: '#10b981',
      badge: 'Eco-Adventure',
      tag: 'MEGHALAYA'
    }
  ];

  return (
    <div className="pb-20 select-none overflow-hidden" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>

      {/* 🌈 Animated Tourism & Safety Ticker Ribbon */}
      <div className="relative overflow-hidden py-2.5 px-4"
        style={{
          background: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(139,92,246,0.08), rgba(16,185,129,0.08))',
          borderBottom: '1px solid rgba(249,115,22,0.18)',
        }}>
        <div className="ticker-wrap">
          <motion.div
            className="flex items-center space-x-10 text-xs font-bold whitespace-nowrap"
            animate={{ x: ['100vw', '-100%'] }}
            transition={{ duration: 36, repeat: Infinity, ease: 'linear' }}
          >
            {[
              { icon: '🧭', text: 'EXPLORE INDIA SMARTER: DISCOVER SACRED & HERITAGE CIRCUITS', color: '#f97316' },
              { icon: '🗺️', text: 'SMART TRIP PLANNER: PERSONALIZED ITINERARIES & ESTIMATED BUDGETS', color: '#8b5cf6' },
              { icon: '⚡', text: 'FAIR TRANSPORT: UBER, OLA & RAPIDO BENCHMARK ESTIMATES', color: '#f59e0b' },
              { icon: '🏨', text: 'CURATED STAYS: AUTHENTIC HOMESTAYS & PILGRIM NIWAS', color: '#10b981' },
              { icon: '🏅', text: 'CERTIFIED GUIDES: BLOCKCHAIN VERIFIED LOCAL ASSISTANCE', color: '#3b82f6' },
              { icon: '🛡️', text: 'INTEGRATED SAFETY NET: REAL-TIME GEO-FENCING & 1-CLICK SOS', color: '#ef4444' },
              { icon: '🇮🇳', text: 'SIH 2026 • PROBLEM STATEMENT ID: 26204 • AICTE', color: '#ea580c' },
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
      <section className="relative pt-8 pb-16 overflow-hidden hero-gradient">
        {/* Background Orbs */}
        <Orb color="rgba(249,115,22,0.45)" size={500} x="-10%" y="-10%" delay={0} />
        <Orb color="rgba(139,92,246,0.4)" size={600} x="60%" y="-5%" delay={2} />
        <Orb color="rgba(16,185,129,0.35)" size={450} x="30%" y="50%" delay={1} />
        <Orb color="rgba(59,130,246,0.3)" size={350} x="80%" y="60%" delay={3} />

        {/* Particle grid overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: 'radial-gradient(rgba(139,92,246,0.25) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}
            className="flex flex-col items-center text-center space-y-7">

            {/* Emblem */}
            <motion.div variants={fadeInUp} custom={0} className="relative">
              <motion.div
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full mx-auto flex items-center justify-center relative"
                animate={{ boxShadow: ['0 0 30px rgba(249,115,22,0.35)', '0 0 50px rgba(139,92,246,0.4)', '0 0 35px rgba(16,185,129,0.35)', '0 0 30px rgba(249,115,22,0.35)'] }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{ background: 'rgba(255,255,255,0.92)', border: '2px solid rgba(249,115,22,0.3)' }}
              >
                <SafarLogo size="hero" showText={false} animated={true} />
              </motion.div>
            </motion.div>

            {/* SIH 2026 AICTE Badge */}
            <motion.div variants={fadeInUp} custom={0.1}
              className="inline-flex flex-wrap items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold shadow-md text-center bg-white/95 border border-orange-200 text-orange-700">
              <span>🇮🇳</span>
              <span className="tracking-wider uppercase">SMART INDIA HACKATHON 2026</span>
              <span className="text-gray-300">•</span>
              <span className="text-violet-700">AICTE PS ID: 26204</span>
              <span className="text-gray-300">•</span>
              <span className="text-emerald-700">TRAVEL & TOURISM INNOVATION</span>
            </motion.div>

            {/* Title & Core Positioning */}
            <div className="space-y-4 max-w-5xl mx-auto px-2">
              <motion.h1 variants={fadeInUp} custom={0.2}
                className="text-4xl sm:text-7xl lg:text-8xl font-black tracking-tight relative text-slate-900"
              >
                <span>Explore India Smarter with </span>
                <span style={{
                  background: 'linear-gradient(135deg, #f97316 0%, #8b5cf6 50%, #10b981 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  S.A.F.A.R.
                </span>
              </motion.h1>

              <motion.p variants={fadeInUp} custom={0.3}
                className="text-base sm:text-2xl font-bold text-slate-700 max-w-3xl mx-auto leading-snug">
                Plan your journey, discover experiences, compare travel options and connect with verified local services — with intelligent safety support throughout your trip.
              </motion.p>

              <motion.p variants={fadeInUp} custom={0.4}
                className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto font-medium">
                DISCOVER <span className="text-orange-500">➔</span> PLAN <span className="text-orange-500">➔</span> COMPARE <span className="text-orange-500">➔</span> CONNECT <span className="text-orange-500">➔</span> TRAVEL <span className="text-emerald-600">➔ STAY SAFE</span>
              </motion.p>
            </div>

            {/* Tourism-First Primary CTAs */}
            <motion.div variants={fadeInUp} custom={0.5}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2 w-full max-w-md sm:max-w-none px-2">
              
              {/* Primary 1: Explore Destinations */}
              <Link to="/explore"
                className="px-6 sm:px-8 py-3.5 sm:py-4 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center space-x-2 relative overflow-hidden bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
                <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Explore Destinations</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Primary 2: Smart Trip Planner */}
              <Link to="/trip-planner"
                className="px-6 sm:px-8 py-3.5 sm:py-4 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center space-x-2 relative overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
                <Route className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Plan My Trip</span>
                <Sparkles className="w-4 h-4" />
              </Link>

              {/* Secondary 1: Smart Transport */}
              <Link to="/fares"
                className="px-5 sm:px-6 py-3.5 sm:py-4 font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center space-x-2 bg-white/95 border-2 border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all">
                <Car className="w-4 h-4 text-orange-600" />
                <span>Smart Transport</span>
              </Link>

              {/* Secondary 2: My Trip & Safety Hub */}
              <Link to="/tourist-dashboard"
                className="px-5 sm:px-6 py-3.5 sm:py-4 font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center space-x-2 bg-white/95 border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 shadow-sm transition-all">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>My Trip & Safety Hub</span>
              </Link>
            </motion.div>

            {/* KPI Cards: Tourism + Trust Matrix */}
            <motion.div variants={fadeInUp} custom={0.6}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 pt-4 max-w-4xl w-full">
              {[
                { value: '6+ Circuits', label: 'Explore India', sub: 'Ayodhya, Katra, Agra, NE', color: '#f97316', bg: 'rgba(249,115,22,0.06)', border: 'rgba(249,115,22,0.2)' },
                { value: 'Smart AI', label: 'Trip Itinerary', sub: 'Day-by-Day Budget Plan', color: '#8b5cf6', bg: 'rgba(139,92,246,0.06)', border: 'rgba(139,92,246,0.2)' },
                { value: '3-Way Compare', label: 'Fair Transport', sub: 'Uber, Ola, Rapido Estimates', color: '#10b981', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.2)' },
                { value: '24x7 Active', label: 'Safety & Trust Net', sub: 'Geo-Fencing, SOS & Blockchain', color: '#ef4444', bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.2)' },
              ].map((kpi, i) => (
                <TiltCard key={i}>
                  <div className="p-3.5 sm:p-4 rounded-2xl text-left space-y-1 bg-white/90 border shadow-sm"
                    style={{ borderColor: kpi.border }}>
                    <span className="text-xl sm:text-2xl font-black block font-mono" style={{ color: kpi.color }}>
                      {kpi.value}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-gray-800 block truncate">{kpi.label}</span>
                    <span className="text-[10px] sm:text-xs text-gray-500 block truncate">{kpi.sub}</span>
                  </div>
                </TiltCard>
              ))}
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* 🧭 FEATURED DESTINATIONS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <span className="text-[11px] font-black uppercase text-orange-600 tracking-wider">
              Popular Tourism Corridors
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Featured Destinations</h2>
          </div>
          <Link to="/explore" className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
            <span>Explore All 6+ Circuits</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {featuredCircuits.map((fc, i) => (
            <motion.div
              key={fc.name}
              whileHover={{ y: -3 }}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 cursor-pointer group"
              onClick={() => navigate(`/trip-planner?dest=${fc.tag}`)}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{fc.icon}</span>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {fc.badge}
                  </span>
                </div>
                <h4 className="text-sm font-black text-slate-900 group-hover:text-orange-600 transition-colors leading-tight">
                  {fc.name}
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {fc.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-orange-600">
                <span>Plan Trip</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 🗺️ INTERACTIVE 3D CORRIDOR MAP SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-3xl bg-white/95 border border-slate-200 shadow-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-[10px] font-bold uppercase">
              <Compass className="w-3 h-3" />
              <span>Interactive Tourism & Corridor Map</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Interactive 3D Corridor Map & High-Definition Satellite Telemetry
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Safe Corridors Active</span>
            </span>
          </div>
        </div>

        <div className="rounded-3xl overflow-hidden border-2 border-slate-200 shadow-xl">
          <CinematicHeroMap onScenarioTrigger={onScenarioTrigger} />
        </div>
      </section>

      {/* 🎯 SIH EVALUATOR GUIDED SCENARIO LAB (PRESERVED FOR JUDGES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-white/95 border-2 border-violet-200 shadow-xl space-y-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="space-y-1.5">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                <span>SIH 2026 EVALUATOR LAB • GUIDED TESTBED</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                Evaluator Guided Scenarios & Live Edge-Case Triggers
              </h2>
              <p className="text-xs text-slate-600 font-medium max-w-2xl">
                1-Click automated test scenarios demonstrating how SAFAR handles normal tourists, approach buffers, geo-fence breaches, route deviations, emergency SOS, and cryptographic ledger verification.
              </p>
            </div>

            {/* Quick Role Switchers */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => { if (onSwitchUser) onSwitchUser('TOURIST'); navigate('/tourist-dashboard'); }}
                className="px-3.5 py-2 rounded-xl font-bold text-xs bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100"
              >
                Tourist Hub
              </button>
              <button
                onClick={() => { if (onSwitchUser) onSwitchUser('AUTHORITY'); navigate('/authority-dashboard'); }}
                className="px-3.5 py-2 rounded-xl font-bold text-xs bg-violet-50 border border-violet-300 text-violet-800 hover:bg-violet-100"
              >
                Authority Desk
              </button>
              <button
                onClick={() => { if (onSwitchUser) onSwitchUser('GUIDE'); navigate('/guide-dashboard'); }}
                className="px-3.5 py-2 rounded-xl font-bold text-xs bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100"
              >
                Guide Cockpit
              </button>
            </div>
          </div>

          {/* Scenario Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { id: '1', title: '1. Safe Location', tag: 'SAFE CORRIDOR', desc: 'Place tourist in verified safe hub. Risk score < 15.', icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.25)', path: '/tourist-dashboard' },
              { id: 'APPROACH_300M', title: '2. Approach 300m', tag: 'PRE-ENTRY BUFFER', desc: 'Advance to 300m hazard buffer. Amber caution fires.', icon: Compass, color: '#f59e0b', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.25)', path: '/tourist-dashboard' },
              { id: 'APPROACH_150M', title: '3. Approach 150m', tag: 'IMMINENT HAZARD', desc: 'Advance to 150m. Urgent orange pulse triggered.', icon: ShieldAlert, color: '#ea580c', bg: 'rgba(234,88,12,0.06)', border: 'rgba(234,88,12,0.25)', path: '/tourist-dashboard' },
              { id: '2', title: '4. Geo-Fence Breach', tag: 'RESTRICTED BREACH', desc: 'Simulate restricted polygon breach. Score jumps to 92.', icon: AlertOctagon, color: '#ef4444', bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.25)', path: '/tourist-dashboard' },
              { id: '3', title: '5. Route Deviation', tag: 'AI ANOMALY', desc: 'Simulate 3.8 km trajectory shift off registered plan.', icon: Route, color: '#8b5cf6', bg: 'rgba(139,92,246,0.06)', border: 'rgba(139,92,246,0.25)', path: '/tourist-dashboard' },
              { id: '4', title: '6. Trigger 112 SOS', tag: 'EMERGENCY CAD', desc: 'Broadcast panic packet, calculate PCR patrol ETA.', icon: Phone, color: '#e11d48', bg: 'rgba(225,29,72,0.06)', border: 'rgba(225,29,72,0.25)', path: '/tourist-dashboard' },
              { id: '5', title: '7. Blockchain Verify', tag: 'SHA-256 PASS', desc: 'Validate tourist digital pass against prototype ledger.', icon: FileCode, color: '#0284c7', bg: 'rgba(2,132,199,0.06)', border: 'rgba(2,132,199,0.25)', path: '/blockchain-ledger' },
              { id: '6', title: '8. Tampering Test', tag: 'ZERO-TRUST AUDIT', desc: 'Simulate corrupted block hash; audit flags tampering.', icon: ShieldAlert, color: '#db2777', bg: 'rgba(219,39,119,0.06)', border: 'rgba(219,39,119,0.25)', path: '/blockchain-ledger' }
            ].map((scen) => {
              const Icon = scen.icon;
              const isExecuting = executingScenario === scen.id;

              return (
                <div
                  key={scen.id}
                  onClick={() => handleScenarioClick(scen.id, scen.path)}
                  className="p-3.5 rounded-2xl flex flex-col justify-between space-y-2.5 cursor-pointer border hover:shadow-md transition-all"
                  style={{ background: scen.bg, borderColor: scen.border }}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Icon className="w-4 h-4" style={{ color: scen.color }} />
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md" style={{ background: `${scen.color}15`, color: scen.color }}>
                        {scen.tag}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-slate-900">{scen.title}</h4>
                    <p className="text-[11px] text-slate-600 leading-tight">{scen.desc}</p>
                  </div>

                  <button
                    disabled={isExecuting}
                    className="w-full py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1 text-white shadow-sm"
                    style={{ background: isExecuting ? '#9ca3af' : `linear-gradient(135deg, ${scen.color}, #4b5563)` }}
                  >
                    {isExecuting ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Simulating...</span>
                      </>
                    ) : (
                      <>
                        <span>Run Test</span>
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 🛡️ 6 CORE PILLARS OF S.A.F.A.R. */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest bg-orange-50 text-orange-700 border border-orange-200">
            Unified Tourism Ecosystem
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
            How S.A.F.A.R. Empowers Travelers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            From discovering sacred shrines to seamless fair transport and 24x7 emergency assurance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: Compass, color: '#f97316', title: 'Explore & Smart Trip Planning', desc: 'AI-assisted personalized day-by-day itineraries across Indian spiritual, heritage, and eco-circuits with itemized budget estimation.' },
            { icon: Car, color: '#f59e0b', title: 'Multi-Provider Fair Transport', desc: 'Compare benchmark estimated fares across Uber, Ola, and Rapido alongside official pre-paid auto/taxi tariffs with direct app handoff.' },
            { icon: Hotel, color: '#10b981', title: 'Curated Stays & Verified Guides', desc: 'Discover certified homestays, pilgrim yatri niwas, and authorized tour guides with prototype blockchain credential verification.' },
            { icon: Activity, color: '#8b5cf6', title: 'Dynamic Geo-Fencing Sentinel', desc: 'Real-time polygon corridor containment with proactive 300m/150m audio-visual proximity alerts before hazardous boundary approach.' },
            { icon: Phone, color: '#ef4444', title: 'Emergency SOS & 112 Gateway', desc: '1-Click panic dispatch with instant GPS coordinates, PCR patrol response ETA calculation, and nearby hospital/police mapping.' },
            { icon: Radio, color: '#6366f1', title: '0-Signal Ghost-Mesh Support', desc: 'Multi-hop peer-to-peer Bluetooth LE packet relay allows stranded tourists in remote zero-cellular valleys to contact forest posts.' },
          ].map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div key={idx} className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: `${pillar.color}15`, color: pillar.color }}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-900">{pillar.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{pillar.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 🏆 FOOTER */}
      <footer className="pt-10 pb-6 text-center space-y-3 border-t border-slate-200">
        <div className="inline-flex items-center justify-center space-x-2">
          <SafarLogo size="xs" showSubtitle={false} />
        </div>
        <p className="text-xs font-semibold text-slate-600">
          © 2026 S.A.F.A.R. | Smart AI Framework for Assured & Responsible Tourism
        </p>
        <p className="text-[11px] text-slate-400">
          Smart India Hackathon 2026 • Problem Statement ID: 26204 • Organization: AICTE • Category: Software
        </p>
        <div className="h-1 max-w-xs mx-auto rounded-full bg-gradient-to-r from-orange-500 via-white to-emerald-500 border border-slate-200" />
      </footer>

    </div>
  );
}