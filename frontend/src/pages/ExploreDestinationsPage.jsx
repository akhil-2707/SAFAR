import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Compass, MapPin, Calendar, Sparkles, ArrowRight, ShieldCheck, 
  Star, Coins, Users, Search, Filter, CheckCircle2, Navigation,
  Hotel, Award, Car, Clock, Utensils
} from 'lucide-react';
import SafarLogo from '../components/SafarLogo';

const SPRING = { type: 'spring', stiffness: 360, damping: 28 };

export default function ExploreDestinationsPage() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCircuit, setSelectedCircuit] = useState('ALL');

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/destinations');
      const data = await res.json();
      if (data.success && data.destinations) {
        setDestinations(data.destinations);
      }
    } catch (err) {
      console.error('Failed to fetch destinations:', err);
    } finally {
      setLoading(false);
    }
  };

  const circuits = ['ALL', 'Spiritual', 'Heritage', 'Adventure', 'Nature'];

  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch = 
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.circuit.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCircuit === 'ALL') return matchesSearch;
    return matchesSearch && dest.circuit.toLowerCase().includes(selectedCircuit.toLowerCase());
  });

  const handlePlanTrip = (destKey) => {
    navigate(`/trip-planner?dest=${destKey}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-8 select-none">
      
      {/* 🌟 Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="rounded-3xl p-6 sm:p-10 relative overflow-hidden bg-white/95 border border-slate-200/80 shadow-xl backdrop-blur-xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)', filter: 'blur(30px)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)', filter: 'blur(30px)' }} />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-[11px] font-bold tracking-wide uppercase">
            <Compass className="w-3.5 h-3.5 text-orange-600" />
            <span>DISCOVER INDIA • S.A.F.A.R. SMART TOURISM CIRCUITS</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Explore Sacred, Heritage & Adventure Circuits
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Discover verified travel corridors across India with transparent transport fares, curated stays, and certified local guides — all anchored by an integrated smart safety net.
          </p>

          {/* Search & Filter Bar */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by city, temple, monument, or state..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {circuits.map((circ) => (
                <button
                  key={circ}
                  onClick={() => setSelectedCircuit(circ)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    selectedCircuit === circ
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {circ}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 🧭 Destinations Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Loading verified tourism destinations...</p>
        </div>
      ) : filteredDestinations.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200 p-8">
          <MapPin className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No destinations found</h3>
          <p className="text-xs text-slate-500">Try adjusting your search terms or circuit filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((dest, i) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, ...SPRING }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl hover:border-orange-300 transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Header Top */}
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                      {dest.circuit}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-orange-600 transition-colors mt-2">
                      {dest.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span>{dest.state}</span>
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {dest.tagline}
                </p>

                {/* Key Insights Chips */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-700 pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-0.5">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Ideal Duration</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      {dest.idealDays} Days Tour
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-0.5">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Estimated Daily</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <Coins className="w-3 h-3" />
                      ~₹{dest.avgDailyBudgetInr.moderate.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Top Attractions List */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Key Highlights</span>
                  <div className="space-y-1">
                    {dest.topAttractions.map((attr, idx) => (
                      <div key={idx} className="flex items-center space-x-1.5 text-xs text-slate-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span className="truncate">{attr}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Best Season */}
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-[11px] text-amber-900 font-medium">
                  <span className="font-bold">Best Season: </span>{dest.bestSeason}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handlePlanTrip(dest.key)}
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-sm transition-all flex items-center justify-center space-x-1.5 min-w-[120px]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Plan Trip</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <Link
                  to={`/swachh-food?destination=${dest.key}`}
                  className="py-2.5 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 transition-colors flex items-center gap-1.5 font-bold text-xs"
                  title="Explore Local Food & Swachh Scores"
                >
                  <Utensils className="w-3.5 h-3.5 text-orange-600" />
                  <span>Explore Local Food</span>
                </Link>
                <Link
                  to={`/hotels?circuit=${encodeURIComponent(dest.name.split(' ')[0])}`}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                  title="View Curated Stays"
                >
                  <Hotel className="w-4 h-4 text-slate-600" />
                </Link>
                <Link
                  to={`/fares?tab=compare`}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Compare Transport Fares"
                >
                  <Car className="w-4 h-4 text-slate-600" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 🛡️ Tourism + Safety Handshake Footer Info */}
      <div className="p-5 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold">Every destination is backed by the S.A.F.A.R. Safety & Trust Grid</h4>
            <p className="text-xs text-slate-400">
              Real-time geo-fencing, certified local guides, multi-provider fare guarantees, and emergency 112 support.
            </p>
          </div>
        </div>
        <Link
          to="/trip-planner"
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition-all shrink-0 flex items-center space-x-1.5"
        >
          <span>Launch Smart Trip Planner</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
