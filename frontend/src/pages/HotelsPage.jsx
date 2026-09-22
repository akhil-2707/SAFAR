import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Hotel, Home, MapPin, Star, ShieldCheck, Sparkles, Filter, 
  Search, CheckCircle2, QrCode, ExternalLink, Info, ArrowRight,
  Wifi, Coffee, Car, Lock, Shield, PhoneCall, Building2, Clock,
  Luggage, Zap, Percent, PlusCircle, Award, Key, Smartphone, LogOut
} from 'lucide-react';
import HotelOnboardModal from '../components/HotelOnboardModal';
import HotelFastCheckinModal from '../components/HotelFastCheckinModal';

const SPRING = { type: 'spring', stiffness: 360, damping: 28 };

export default function HotelsPage({ tourist }) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Tab handling from URL or default
  const tabParam = searchParams.get('tab');
  const getInitialTab = () => {
    if (tabParam === 'micro' || tabParam === 'micro-stays') return 'MICRO_STAYS';
    if (tabParam === 'spillover') return 'SPILLOVER';
    if (tabParam === 'cloakroom') return 'CLOAKROOM';
    return 'CURATED_STAYS';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Sync tab with URL if param changes
  useEffect(() => {
    if (tabParam === 'micro' || tabParam === 'micro-stays') setActiveTab('MICRO_STAYS');
    else if (tabParam === 'spillover') setActiveTab('SPILLOVER');
    else if (tabParam === 'cloakroom') setActiveTab('CLOAKROOM');
    else if (tabParam === 'curated' || tabParam === 'hotels') setActiveTab('CURATED_STAYS');
  }, [tabParam]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const paramMap = {
      CURATED_STAYS: 'curated',
      MICRO_STAYS: 'micro',
      SPILLOVER: 'spillover',
      CLOAKROOM: 'cloakroom'
    };
    setSearchParams({ tab: paramMap[tabId] || 'curated' });
  };

  const getCityFromTourist = (t) => {
    const dest = (t?.destination || t?.currentLocation?.address || '').toLowerCase();
    if (dest.includes('agra') || dest.includes('taj')) return 'Agra';
    if (dest.includes('varanasi') || dest.includes('kashi')) return 'Varanasi';
    if (dest.includes('jaipur') || dest.includes('rajasthan')) return 'Jaipur';
    if (dest.includes('jammu') || dest.includes('katra') || dest.includes('vaishno')) return 'Katra';
    if (dest.includes('guwahati') || dest.includes('assam') || dest.includes('kamrup') || dest.includes('kaziranga')) return 'Guwahati';
    return 'Ayodhya';
  };

  // Curated Stays State (Blockchain Vendors)
  const [stays, setStays] = useState([]);
  const [loadingCurated, setLoadingCurated] = useState(true);
  const [selectedCircuit, setSelectedCircuit] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [maxPrice, setMaxPrice] = useState(6000);
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedModalVendor, setVerifiedModalVendor] = useState(null);

  // Micro-Stays, Cloakroom & Spillover State
  const [selectedCity, setSelectedCity] = useState(getCityFromTourist(tourist));
  const [duration, setDuration] = useState('4h');
  const [hotels, setHotels] = useState([]);
  const [cloakrooms, setCloakrooms] = useState([]);
  const [spilloverDeals, setSpilloverDeals] = useState([]);
  const [loadingMicro, setLoadingMicro] = useState(true);
  const [showHotelOnboardModal, setShowHotelOnboardModal] = useState(false);
  const [showFastCheckinModal, setShowFastCheckinModal] = useState(false);
  const [selectedCheckinHotel, setSelectedCheckinHotel] = useState(null);
  const [activeStay, setActiveStay] = useState(null);

  // Booking states
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [selectedCloakroom, setSelectedCloakroom] = useState(null);
  const [cloakroomSuccess, setCloakroomSuccess] = useState(null);
  const [bagCount, setBagCount] = useState(2);
  const [cloakHours, setCloakHours] = useState(6);

  useEffect(() => {
    if (tourist) {
      setSelectedCity(getCityFromTourist(tourist));
      fetchActiveStay();
    }
  }, [tourist?.touristId, tourist?.destination]);

  const fetchActiveStay = async () => {
    try {
      const tid = tourist?.touristId || 'TID-1035';
      const res = await fetch(`/api/hotels/active-checkin/${tid}`);
      const data = await res.json();
      if (data.success && data.hasActiveStay) {
        setActiveStay(data.stay);
      } else {
        setActiveStay(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Curated Stays (Blockchain Vendors)
  useEffect(() => {
    fetchCuratedStays();
  }, []);

  const fetchCuratedStays = async () => {
    setLoadingCurated(true);
    try {
      const res = await fetch('/api/blockchain/vendors');
      const data = await res.json();
      if (data.success && data.vendors) {
        const stayList = data.vendors.filter((v) => 
          ['HOMESTAY', 'HOTEL', 'GUEST_HOUSE'].includes(v.type)
        );
        setStays(stayList);
      }
    } catch (err) {
      console.error('Failed to fetch curated stays:', err);
    } finally {
      setLoadingCurated(false);
    }
  };

  // Fetch Micro-Stays, Cloakrooms & Spillover Deals
  useEffect(() => {
    fetchMicroData();
  }, [selectedCity]);

  const fetchMicroData = async () => {
    try {
      setLoadingMicro(true);
      const res = await fetch(`/api/hotels/micro-stays?city=${selectedCity}`);
      const data = await res.json();
      if (data.success) {
        setHotels(data.hotels);
        setCloakrooms(data.cloakrooms);
      }

      const resSpill = await fetch('/api/hotels/spillover-deals');
      const dataSpill = await resSpill.json();
      if (dataSpill.success) {
        setSpilloverDeals(dataSpill.spilloverDeals);
      }
    } catch (err) {
      console.error('Fetch Hotels/Micro-stays Error:', err);
    } finally {
      setLoadingMicro(false);
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

  const handleBookMicroStay = async (hotel) => {
    try {
      const res = await fetch('/api/hotels/book-micro-stay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelId: hotel.id,
          touristId: tourist?.touristId || 'TID-1035',
          duration: duration,
          checkInSlot: '11:00 AM - 03:00 PM'
        })
      });
      const data = await res.json();
      if (data.success) {
        setBookingSuccess(data.booking);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookCloakroom = async (cloakroom) => {
    try {
      const res = await fetch('/api/hotels/book-cloakroom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloakroomId: cloakroom.id,
          touristId: tourist?.touristId || 'TID-1035',
          bagCount: bagCount,
          hours: cloakHours
        })
      });
      const data = await res.json();
      if (data.success) {
        setCloakroomSuccess(data.record);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const circuits = ['ALL', 'Ayodhya', 'Katra', 'Agra', 'Varanasi', 'Cherrapunji'];

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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6 select-none pb-28">
      
      {/* ⚡ 1-Tap Digital ID Hotel Fast Check-in Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-600 via-orange-500 to-emerald-600 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 border border-amber-300/30"
      >
        <div className="relative z-10 flex items-start sm:items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 text-2xl shadow-inner">
            ⚡
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full border border-white/25">
                DPDP Act 2023 Compliant
              </span>
              <span className="text-[10px] font-bold bg-amber-300 text-amber-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Zero Paper / 3-Sec Protocol
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-tight mt-1">
              1-Tap Digital ID Hotel Fast Check-in Terminal
            </h2>
            <p className="text-xs sm:text-sm text-white/90 font-medium max-w-2xl mt-0.5">
              Skip 15-minute front-desk queues & risky paper Aadhaar photocopies. Show your S.A.F.A.R. QR for instant cryptographic check-in, smart door PIN & automatic police e-register compliance.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setSelectedCheckinHotel(null);
              setShowFastCheckinModal(true);
            }}
            className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-white text-orange-600 hover:bg-orange-50 transition-all shadow-lg flex items-center space-x-2 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open Fast Check-In Desk</span>
          </button>
        </div>
      </motion.div>

      {/* 🟢 Active Hotel Stay Notice Banner */}
      {activeStay && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border-2 border-emerald-500/40 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Active Guest In-House
                </span>
                <strong className="text-sm font-black text-slate-900">{activeStay.hotelName}</strong>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Allotted: <strong className="text-slate-900 font-mono">{activeStay.roomNumber}</strong> • Door PIN: <strong className="text-emerald-700 font-mono">{activeStay.digitalKeyPin}</strong> • Register ID: {activeStay.registerId}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedCheckinHotel(hotels.find(h => h.id === activeStay.hotelId) || null);
              setShowFastCheckinModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs shadow-sm flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>View Digital Room Key</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 🏨 Unified Hospitality & Stays Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-white/95 border border-slate-200/80 shadow-xl backdrop-blur-xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', filter: 'blur(30px)' }} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold tracking-wide uppercase">
              <Home className="w-3.5 h-3.5 text-emerald-600" />
              <span>MINISTRY OF TOURISM • HOSPITALITY, SATELLITE & DAY-STAYS HUB</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Verified Stays, Satellite Homestays & Micro-Stays
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-2xl">
              Unified accommodation portal covering full-night verified homestays, daytime flexible 2–6 hr rest rooms, peak-rush satellite spillover deals, and secure luggage locker mesh.
            </p>
          </div>

          {/* Quick Actions & City Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 self-start md:self-auto shrink-0">
            <button
              onClick={() => setShowHotelOnboardModal(true)}
              className="px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center space-x-1.5 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>➕ Onboard Stay (Live DB)</span>
            </button>

            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <MapPin className="w-4 h-4 text-emerald-600 pl-1" />
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setSelectedCircuit(e.target.value === 'ALL' ? 'ALL' : e.target.value);
                }}
                className="text-xs font-bold px-2 py-1.5 rounded-xl cursor-pointer bg-transparent focus:outline-none text-gray-800"
              >
                <option value="Ayodhya">🛕 Ayodhya Dham</option>
                <option value="Katra">🏔️ Katra • Vaishno Devi</option>
                <option value="Agra">🕌 Agra / Taj Mahal</option>
                <option value="Varanasi">🕉️ Varanasi / Kashi</option>
                <option value="Jaipur">🏰 Jaipur / Rajasthan</option>
                <option value="Guwahati">🦏 Guwahati • Kamakhya</option>
              </select>
            </div>
          </div>
        </div>

        {/* 5 Unified Mode Tabs */}
        <div className="flex items-center gap-2 pt-5 mt-4 border-t border-slate-100 flex-wrap">
          <button
            onClick={() => {
              setSelectedCheckinHotel(null);
              setShowFastCheckinModal(true);
            }}
            className="px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition-all bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-600 text-white shadow-md shadow-orange-500/20 hover:scale-[1.02] cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>⚡ 1-Tap Fast Check-In Desk</span>
          </button>

          {[
            { id: 'CURATED_STAYS', label: '🏨 Curated Stays & Homestays', desc: 'Full night stays with blockchain badge' },
            { id: 'MICRO_STAYS', label: '⚡ 2–6 Hr Hourly Micro-Stays', desc: 'Daytime rest, shower & recharge' },
            { id: 'SPILLOVER', label: '🏘️ Satellite Spillover Flash Deals', desc: '50% off satellite homestays' },
            { id: 'CLOAKROOM', label: '🧳 Secure Cloakroom Lockers', desc: 'Digital QR baggage vault' },
          ].map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all ${
                  active
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 scale-[1.02]'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/70'
                }`}
              >
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ========================================================================= */}
      {/* TAB 1: CURATED FULL-DAY STAYS & HOMESTAYS */}
      {/* ========================================================================= */}
      {activeTab === 'CURATED_STAYS' && (
        <div className="space-y-6">
          {/* Search & Filters */}
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
                  <option value="HOTEL">Boutique Hotel</option>
                </select>
              </div>

              {/* Max Price Slider */}
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Max:</span>
                <input
                  type="range"
                  min="1000"
                  max="6000"
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

          {/* Stays Grid */}
          {loadingCurated ? (
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
                        <span>VERIFIED BLOCKCHAIN STAY</span>
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
                  <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedCheckinHotel(stay);
                        setShowFastCheckinModal(true);
                      }}
                      className="w-full sm:w-auto flex-1 py-2.5 px-3 rounded-xl text-xs font-black text-white bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 shadow-sm transition-all flex items-center justify-center space-x-1.5 cursor-pointer active:scale-98"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>⚡ 1-Tap Fast Check-In</span>
                    </button>
                    <Link
                      to={`/trip-planner?dest=${encodeURIComponent(stay.city)}`}
                      className="w-full sm:w-auto py-2.5 px-3 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-all flex items-center justify-center space-x-1.5"
                    >
                      <span>Plan Trip</span>
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SMART HOURLY MICRO STAYS */}
      {/* ========================================================================= */}
      {activeTab === 'MICRO_STAYS' && (
        <div className="space-y-6">
          {/* Duration Selector Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-xs font-bold text-gray-900 block">Choose Day-Stay Duration</span>
                <span className="text-[10px] text-gray-500">Pay only for the hours you need between 08:00 AM – 08:00 PM</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-gray-100/80 p-1 rounded-xl">
              {[
                { key: '2h', label: '⚡ 2 Hours (Quick Refresh)' },
                { key: '4h', label: '🛌 4 Hours (Comfort Nap)' },
                { key: '6h', label: '☕ 6 Hours (Full Work & Rest)' }
              ].map((d) => (
                <button
                  key={d.key}
                  onClick={() => setDuration(d.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    duration === d.key
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hotel Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => {
              const currentRate = hotel.hourlyRates?.[duration] || hotel.hourlyRates?.['4h'] || 499;
              const fullDayRate = hotel.hourlyRates?.fullDay || 1800;
              const savings = fullDayRate - currentRate;
              return (
                <div
                  key={hotel.id}
                  className="bg-white rounded-3xl border border-gray-200/80 shadow-md hover:shadow-xl hover:border-emerald-400 transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Hotel Image with Badges */}
                    <div className="h-44 relative overflow-hidden">
                      <img
                        src={hotel.image}
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-600/90 text-white text-[10px] font-black uppercase backdrop-blur-md">
                          ⚡ {duration.toUpperCase()} DAY-USE
                        </span>
                        {hotel.wheelchairFriendly && (
                          <span className="px-2 py-1 rounded-full bg-blue-600/90 text-white text-[10px] font-black uppercase backdrop-blur-md flex items-center gap-1">
                            ♿ Accessible
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-white/95 px-2.5 py-1 rounded-xl shadow-md text-xs font-black text-gray-900 flex items-center gap-1">
                        ⭐ {hotel.rating} <span className="text-[10px] text-gray-500 font-normal">({hotel.reviewsCount})</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="text-base font-black text-gray-900 group-hover:text-emerald-600 transition-colors">
                          {hotel.name}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span>{hotel.location}</span>
                        </p>
                      </div>

                      {/* Amenities Pills */}
                      <div className="flex flex-wrap gap-1.5">
                        {(hotel.amenities || []).map((am, i) => (
                          <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600">
                            {am}
                          </span>
                        ))}
                      </div>

                      {/* Pricing Comparison Box */}
                      <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-gray-500 block uppercase">
                            {duration} Micro-Stay Rate
                          </span>
                          <span className="text-xl font-black text-emerald-700 font-mono">
                            ₹{currentRate} <span className="text-xs font-normal text-gray-500">INR</span>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-gray-400 block line-through">
                            ₹{fullDayRate} 24h
                          </span>
                          <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            Save ₹{savings}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 space-y-2">
                    <button
                      onClick={() => {
                        setSelectedCheckinHotel(hotel);
                        setShowFastCheckinModal(true);
                      }}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 active:scale-98 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>⚡ 1-Tap Fast Check-In (3s Zero Paper)</span>
                    </button>

                    <button
                      onClick={() => handleBookMicroStay(hotel)}
                      className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <span>Book Scheduled {duration} Day Stay</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SATELLITE HOMESTAY FLASH SPILLOVER DEALS */}
      {/* ========================================================================= */}
      {activeTab === 'SPILLOVER' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-white border border-amber-200/80 space-y-2">
            <div className="flex items-center space-x-2 text-amber-800">
              <Percent className="w-6 h-6 text-amber-600" />
              <h2 className="text-lg font-black">AI Footfall Spillover & Satellite Homestay Flash Stays</h2>
            </div>
            <p className="text-xs text-gray-600 max-w-3xl leading-relaxed">
              When tourist hotspots (Mall Road, Taj East Gate, Ram Mandir Corridor) approach carrying capacity (&gt;85%), this engine reroutes tourists to verified satellite eco-stays at 50% flat discount with VIP guaranteed next-day morning entry slots.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {spilloverDeals.map((deal) => (
              <div
                key={deal.id}
                className="bg-white rounded-3xl border-2 border-amber-300 p-6 shadow-lg hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[10px] font-black uppercase">
                      Choked Hotspot: {deal.hotspotTarget}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase">
                      {deal.discountPercent}% OFF
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-gray-900">{deal.satelliteName}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">📍 {deal.distanceKm} km off-beat green corridor</p>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-1">
                    <span className="font-extrabold text-amber-900 block">✨ Guaranteed VIP Advantage:</span>
                    <span className="text-gray-700 text-[11px] block">{deal.vipPerk}</span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Spillover Flash Price</span>
                      <span className="text-2xl font-black text-gray-900 font-mono">₹{deal.spilloverFlashPrice}</span>
                      <span className="text-xs text-gray-400 line-through ml-2 font-mono">₹{deal.regularPrice}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg">
                      0% Commission
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => alert(`✓ Flash Stay Reserved at ${deal.satelliteName}! Next-Day VIP slot confirmed.`)}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
                >
                  <Award className="w-4 h-4" />
                  <span>Claim Flash Deal & VIP Pass</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: BAG-FREE CLOAKROOM LOCKER MESH */}
      {/* ========================================================================= */}
      {activeTab === 'CLOAKROOM' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-white border border-emerald-200/80 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-800">
              <Luggage className="w-6 h-6 text-emerald-600" />
              <h2 className="text-lg font-black">Bag-Free City Tourism Mesh</h2>
            </div>
            <p className="text-xs text-gray-600 max-w-3xl leading-relaxed">
              Leave your heavy luggage at smart verified cloakroom pods near railway stations, airports, or major temple gates. Enjoy temple darshan or heritage walks completely bag-free, backed by SHA-256 digital security tokens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cloakrooms.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-md hover:shadow-xl transition-all space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Luggage className="w-6 h-6" />
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                      {c.capacityAvailable} Lockers Free
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-gray-900">{c.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{c.location}</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 space-y-1.5 text-xs font-medium text-gray-600">
                    <div className="flex justify-between">
                      <span>Rate:</span>
                      <span className="font-bold text-gray-900">₹{c.ratePerHour}/hr per bag</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Operating Hours:</span>
                      <span className="text-gray-900">{c.operatingHours}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Security Standard:</span>
                      <span className="text-emerald-700 font-bold">{c.securityLevel}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-600">Bags:</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setBagCount(Math.max(1, bagCount - 1))}
                        className="w-6 h-6 rounded-lg bg-gray-200 font-bold hover:bg-gray-300"
                      >-</button>
                      <span className="font-bold font-mono">{bagCount}</span>
                      <button
                        onClick={() => setBagCount(bagCount + 1)}
                        className="w-6 h-6 rounded-lg bg-gray-200 font-bold hover:bg-gray-300"
                      >+</button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBookCloakroom(c)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Generate Digital QR Locker Pass</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Confirmation Modal for Micro-Stay */}
      {bookingSuccess && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 border border-emerald-300"
          >
            <div className="flex items-center space-x-3 text-emerald-700 font-black text-lg">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              <span>Day-Stay Confirmed!</span>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-2 font-mono">
              <div className="text-emerald-800 font-bold text-sm">{bookingSuccess.hotelName}</div>
              <div>Booking ID: <strong>{bookingSuccess.bookingId}</strong></div>
              <div>Duration: <strong>{bookingSuccess.duration} Day Use</strong> ({bookingSuccess.slot})</div>
              <div>Amount Paid: <strong>₹{bookingSuccess.totalCost} INR</strong></div>
              <div className="text-emerald-700 font-bold">You Saved: ₹{bookingSuccess.savedComparedToFullDay} compared to 24h tariff!</div>
              <div className="text-gray-400 text-[10px] truncate">Hash: {bookingSuccess.passHash}</div>
            </div>
            <button
              onClick={() => setBookingSuccess(null)}
              className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Done & Save Digital Pass
            </button>
          </motion.div>
        </div>
      )}

      {/* Confirmation Modal for Cloakroom */}
      {cloakroomSuccess && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 border border-emerald-300"
          >
            <div className="flex items-center space-x-3 text-emerald-700 font-black text-lg">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              <span>Luggage Locked Safely!</span>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-2 font-mono text-gray-800">
              <div className="text-emerald-900 font-bold text-sm">{cloakroomSuccess.cloakroomName}</div>
              <div>Digital Claim Token: <strong className="text-blue-700 text-base">{cloakroomSuccess.claimToken}</strong></div>
              <div>Pickup Security OTP: <strong className="text-red-600 text-base">{cloakroomSuccess.otp}</strong></div>
              <div>Bags: <strong>{cloakroomSuccess.bagCount} Bag(s)</strong></div>
              <div>Estimated Pickup Time: <strong>{cloakroomSuccess.expectedPickup}</strong></div>
              <div className="text-emerald-800 font-bold">Total Cost: ₹{cloakroomSuccess.totalCost} INR</div>
            </div>
            <p className="text-[11px] text-gray-500 italic">
              💡 Show this Digital Claim Token & OTP at the locker kiosk during pickup. Enjoy your city tour bag-free!
            </p>
            <button
              onClick={() => setCloakroomSuccess(null)}
              className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Got It / Close Token
            </button>
          </motion.div>
        </div>
      )}

      {/* Blockchain Verification Audit Modal */}
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

      {/* Hotel Onboarding Modal */}
      <HotelOnboardModal
        isOpen={showHotelOnboardModal}
        onClose={() => setShowHotelOnboardModal(false)}
        onHotelAdded={(newH) => {
          setHotels((prev) => [newH, ...prev]);
        }}
      />

      {/* 1-Tap Hotel Fast Check-in Modal */}
      <HotelFastCheckinModal
        isOpen={showFastCheckinModal}
        onClose={() => setShowFastCheckinModal(false)}
        tourist={tourist}
        preselectedHotel={selectedCheckinHotel}
        allHotels={hotels.length > 0 ? hotels : stays}
        onCheckinSuccess={(rec) => {
          setActiveStay(rec);
        }}
      />
    </div>
  );
}
