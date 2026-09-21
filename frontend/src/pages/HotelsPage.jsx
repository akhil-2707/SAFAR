import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Hotel, Home, MapPin, Star, ShieldCheck, Sparkles, Filter, 
  Search, CheckCircle2, QrCode, ExternalLink, Info, ArrowRight,
  Wifi, Coffee, Car, Lock, Shield, PhoneCall
} from 'lucide-react';

const SPRING = { type: 'spring', stiffness: 360, damping: 28 };

export default function HotelsPage() {
  const [searchParams] = useSearchParams();
  const initialCircuit = searchParams.get('circuit') || 'ALL';

  const [stays, setStays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCircuit, setSelectedCircuit] = useState(initialCircuit);
  const [selectedType, setSelectedType] = useState('ALL');
  const [maxPrice, setMaxPrice] = useState(6000);
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedModalVendor, setVerifiedModalVendor] = useState(null);

  useEffect(() => {
    fetchStays();
  }, []);

  const fetchStays = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/blockchain/vendors');
      const data = await res.json();
      if (data.success && data.vendors) {
        // Filter stays/hotels/guesthouses
        const stayList = data.vendors.filter((v) => 
          ['HOMESTAY', 'HOTEL', 'GUEST_HOUSE'].includes(v.type)
        );
        setStays(stayList);
      }
    } catch (err) {
      console.error('Failed to fetch stays:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyBlockchain = async (vendor) => {
    try {
      const res = await fetch(`/api/blockchain/verify-vendor/${vendor.id}`);
      const data = await res.json();
      setVerifiedModalVendor(data.vendor || vendor);
    } catch (err) {
      setVerifiedModalVendor(vendor);
    }
  };

  const circuits = ['ALL', 'Ayodhya', 'Katra', 'Agra', 'Varanasi', 'Cherrapunji'];
  const stayTypes = ['ALL', 'HOMESTAY', 'GUEST_HOUSE'];

  const filteredStays = stays.filter((stay) => {
    const matchesSearch = 
      stay.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stay.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stay.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCircuit = 
      selectedCircuit === 'ALL' || 
      stay.city.toLowerCase().includes(selectedCircuit.toLowerCase());

    const matchesType = 
      selectedType === 'ALL' || 
      stay.type === selectedType;

    const matchesPrice = 
      !stay.estimatedPricePerNight || 
      stay.estimatedPricePerNight <= maxPrice;

    return matchesSearch && matchesCircuit && matchesType && matchesPrice;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-8 select-none">
      
      {/* 🏨 Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="rounded-3xl p-6 sm:p-10 relative overflow-hidden bg-white/95 border border-slate-200/80 shadow-xl backdrop-blur-xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', filter: 'blur(30px)' }} />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold tracking-wide uppercase">
            <Home className="w-3.5 h-3.5 text-emerald-600" />
            <span>STAYS & ACCOMMODATION • PROTOTYPE REGISTRY</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Curated Stays, Pilgrim Niwas & Eco Homestays
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Browse authentic local accommodations curated across major Indian circuits with transparent estimated tariffs, proximity information, and prototype blockchain verification.
          </p>

          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900 font-medium">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Prototype Notice: </span>
              All stay rates shown are realistic benchmark price estimates for travel planning and demonstration purposes. No live booking transactions are processed.
            </div>
          </div>
        </div>
      </motion.div>

      {/* 🔍 Search & Filters */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
          
          {/* Text Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stay name or area..."
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Circuit Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Circuit:</span>
            <select
              value={selectedCircuit}
              onChange={(e) => setSelectedCircuit(e.target.value)}
              className="flex-1 py-2 px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
            >
              {circuits.map((c) => (
                <option key={c} value={c}>{c === 'ALL' ? 'All Indian Circuits' : c}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="flex-1 py-2 px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="ALL">All Stay Categories</option>
              <option value="HOMESTAY">Curated Homestay</option>
              <option value="GUEST_HOUSE">Pilgrim Niwas / Guest House</option>
            </select>
          </div>

          {/* Max Price Slider */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Max:</span>
            <input
              type="range"
              min="1000"
              max="5000"
              step="200"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="flex-1 accent-emerald-600"
            />
            <span className="text-xs font-mono font-bold text-emerald-700 w-16 text-right">
              ₹{maxPrice}
            </span>
          </div>

        </div>
      </div>

      {/* 🏘️ Stays Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Loading verified stays & homestays...</p>
        </div>
      ) : filteredStays.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200 p-8">
          <Hotel className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No matching stays found</h3>
          <p className="text-xs text-slate-500">Try broadening your circuit or price filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStays.map((stay, i) => (
            <motion.div
              key={stay.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, ...SPRING }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6 space-y-4">
                
                {/* Badge & Type */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>CURATED PROTOTYPE STAY</span>
                  </span>
                  <div className="flex items-center space-x-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>{stay.rating}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({stay.reviewsCount})</span>
                  </div>
                </div>

                {/* Stay Name & Circuit */}
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    {stay.name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{stay.city}, {stay.state}</span>
                  </p>
                </div>

                {/* Distance & Category */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Category:</span>
                    <span className="font-bold text-slate-900">{stay.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Proximity:</span>
                    <span className="font-semibold text-emerald-700">{stay.distanceText}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>License Record:</span>
                    <span className="font-mono text-[11px] text-slate-700">{stay.licenseNo}</span>
                  </div>
                </div>

                {/* Amenities Tags */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Features & Amenities</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(stay.amenities || []).map((amenity, idx) => (
                      <span key={idx} className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price Display */}
                <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Estimated Rate</span>
                    <span className="text-2xl font-black text-slate-900">
                      ₹{stay.estimatedPricePerNight?.toLocaleString('en-IN') || 1500}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium"> / night (est.)</span>
                  </div>
                  <button
                    onClick={() => handleVerifyBlockchain(stay)}
                    className="text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-colors"
                    title="Audit blockchain verification hash"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Audit Pass</span>
                  </button>
                </div>

              </div>

              {/* Card Footer Action */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2">
                <Link
                  to={`/trip-planner?dest=${encodeURIComponent(stay.city)}`}
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-sm transition-all flex items-center justify-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Add to Trip Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href={`tel:${stay.phone || '1800-123-7233'}`}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Contact Information"
                >
                  <PhoneCall className="w-4 h-4 text-emerald-600" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 🔐 Blockchain Verification Audit Modal */}
      <AnimatePresence>
        {verifiedModalVendor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900">Prototype Blockchain Audit</h3>
                </div>
                <button
                  onClick={() => setVerifiedModalVendor(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified SHA-256 Ledger Record (Block #{verifiedModalVendor.blockIndex || 4})</span>
                </div>

                <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Operator / Stay:</span>
                    <span className="font-bold text-slate-900">{verifiedModalVendor.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">License ID:</span>
                    <span className="font-mono text-slate-900">{verifiedModalVendor.licenseNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Verification Hash:</span>
                    <span className="font-mono text-[10px] text-indigo-700 truncate max-w-[180px]">
                      {verifiedModalVendor.blockchainHash}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Non-sensitive operator credentials are hashed onto the prototype ledger to verify authenticity and prevent counterfeit tout listings.
                </p>
              </div>

              <button
                onClick={() => setVerifiedModalVendor(null)}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              >
                Close Audit View
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
