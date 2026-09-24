import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, MapPin, Calendar, Clock, Users, IndianRupee, Search, 
  CheckCircle2, Sparkles, ShieldAlert, ArrowRight, X, PhoneCall, 
  Compass, Award, Check, Filter, HeartHandshake
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function Marketplace() {
  const user = JSON.parse(localStorage.getItem('safar_user') || 'null');
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  // Booking state
  const [bookingDate, setBookingDate] = useState('');
  const [touristsCount, setTouristsCount] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetchApprovedPackages();
  }, []);

  const fetchApprovedPackages = async () => {
    try {
      const res = await fetch('/api/marketplace/packages');
      const data = await res.json();
      if (data.success) {
        setPackages(data.packages);
      }
    } catch (err) {
      console.error('Error fetching marketplace packages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      // Category filter
      if (selectedCategory === 'PILGRIMAGE') {
        const isPilgrim = pkg.name?.toLowerCase().includes('ram') || 
                          pkg.name?.toLowerCase().includes('mandir') || 
                          pkg.name?.toLowerCase().includes('kashi') || 
                          pkg.name?.toLowerCase().includes('heritage') ||
                          pkg.destination?.toLowerCase().includes('ayodhya') ||
                          pkg.destination?.toLowerCase().includes('varanasi');
        if (!isPilgrim) return false;
      } else if (selectedCategory === 'TREK') {
        const isTrek = pkg.name?.toLowerCase().includes('trek') || 
                       pkg.name?.toLowerCase().includes('alpine') || 
                       pkg.name?.toLowerCase().includes('solang') ||
                       pkg.destination?.toLowerCase().includes('manali') ||
                       pkg.destination?.toLowerCase().includes('himachal');
        if (!isTrek) return false;
      } else if (selectedCategory === 'WILDLIFE') {
        const isWildlife = pkg.name?.toLowerCase().includes('wildlife') || 
                           pkg.name?.toLowerCase().includes('rhino') || 
                           pkg.name?.toLowerCase().includes('cruise') ||
                           pkg.destination?.toLowerCase().includes('kaziranga') ||
                           pkg.destination?.toLowerCase().includes('assam');
        if (!isWildlife) return false;
      }

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        pkg.name?.toLowerCase().includes(q) ||
        pkg.destination?.toLowerCase().includes(q) ||
        pkg.partnerName?.toLowerCase().includes(q) ||
        pkg.inclusions?.toLowerCase().includes(q)
      );
    });
  }, [packages, selectedCategory, searchQuery]);

  const handleOpenBooking = (pkg) => {
    setSelectedPackage(pkg);
    setBookingDate(pkg.availableDates?.[0] || '');
    setTouristsCount(1);
    setBookingSuccess(false);
  };

  const handleBook = async () => {
    if (!user) {
      alert(t('loginRequiredBooking', 'Please log in as a Tourist to book a package.'));
      navigate('/login');
      return;
    }
    if (user.role !== 'TOURIST') {
      alert(t('onlyTouristsCanBook', 'Only Tourists can book packages.'));
      return;
    }
    if (!bookingDate) {
      alert(t('selectTravelDateAlert', 'Please select a travel date.'));
      return;
    }

    setBookingLoading(true);
    try {
      const res = await fetch('/api/marketplace/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('safar_token')}`
        },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          travelDate: bookingDate,
          touristsCount: Number(touristsCount)
        })
      });
      const data = await res.json();
      if (data.success) {
        setBookingSuccess(true);
        setTimeout(() => {
          setSelectedPackage(null);
          setBookingSuccess(false);
        }, 1800);
      } else {
        alert('Booking error: ' + (data.error || 'Unable to confirm booking.'));
      }
    } catch (err) {
      console.error(err);
      alert('Network error while creating booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        
        {/* Modern Tasteful Header Banner */}
        <div className="relative rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-sm overflow-hidden backdrop-blur-xl">
          {/* Subtle Ambient Glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-sky-200/40 via-blue-100/20 to-transparent rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none -mb-20" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-[11px] font-bold tracking-wide uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                  <span>S.A.F.A.R. CENTRAL AUTHORITY</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-extrabold uppercase border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>100% VERIFIED OPERATORS</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Verified Tour & Pilgrimage Packages
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Direct booking with government-verified tour operators across India. Every circuit includes certified local guides, transparent pre-fixed pricing, and integrated 24x7 ERSS 112 emergency tracking.
              </p>
            </div>

            {/* Quick Trust Badges Strip */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full lg:w-auto shrink-0">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero Hidden Fees or Kickbacks</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700">
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Linked with 24x7 S.A.F.A.R. 112 SOS</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700">
                <Award className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Certified Multilingual Tour Guides</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Navigation Bar */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: 'All Circuits', icon: Compass },
              { id: 'PILGRIMAGE', label: 'Sacred Pilgrimage', icon: Sparkles },
              { id: 'TREK', label: 'Mountain & Trek', icon: MapPin },
              { id: 'WILDLIFE', label: 'Wildlife & Nature', icon: Award }
            ].map((cat) => {
              const IconC = cat.icon;
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    active 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  <IconC className={`w-3.5 h-3.5 ${active ? 'text-sky-400' : 'text-slate-500'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by state, circuit, or tour..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 focus:bg-white text-slate-800 font-medium placeholder:text-slate-400 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Counter and Results Header */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-semibold">
          <span>Showing {filteredPackages.length} Certified Tour {filteredPackages.length === 1 ? 'Package' : 'Packages'}</span>
          <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
            ✓ Direct Verified Partner Fares
          </span>
        </div>

        {/* Packages Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-500">Loading S.A.F.A.R. Verified Packages...</p>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <Compass className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No matching tour packages found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query or reset the category filter to explore all verified circuits.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredPackages.map((pkg) => {
              const nameLower = (pkg.name || '').toLowerCase();
              const destLower = (pkg.destination || '').toLowerCase();
              const isAyodhya = pkg.id === 'pkg_ayodhya_01' || nameLower.includes('ayodhya') || nameLower.includes('ram') || destLower.includes('ayodhya');
              const defaultImage = isAyodhya 
                ? '/images/ram-mandir-ayodhya.jpg' 
                : (pkg.images?.[0] && !pkg.images[0].includes('1548013146-72479768bada') ? pkg.images[0] : '/images/ram-mandir-ayodhya.jpg');
              return (
                <div 
                  key={pkg.id} 
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col justify-between group overflow-hidden"
                >
                  <div>
                    {/* Image Header with Badges */}
                    <div className="h-52 relative overflow-hidden bg-slate-100">
                      <img 
                        src={defaultImage} 
                        alt={pkg.name} 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = isAyodhya ? '/images/ram-mandir-ayodhya.jpg' : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      
                      {/* Gradient overlay for readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/30 pointer-events-none" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="bg-slate-900/90 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1 shadow-sm border border-white/10">
                          <MapPin className="w-3 h-3 text-sky-400" />
                          <span>{pkg.destination.split(',')[0]}</span>
                        </span>
                      </div>

                      <div className="absolute top-3 right-3 bg-emerald-600/95 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm flex items-center gap-1 border border-emerald-400/30">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Authority Verified</span>
                      </div>

                      {/* Bottom Image Details */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold">
                        <span className="flex items-center gap-1 text-[11px] bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-xl">
                          <Clock className="w-3 h-3 text-amber-300" />
                          <span>{pkg.duration}</span>
                        </span>
                        <span className="flex items-center gap-1 text-[11px] bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-xl">
                          <Users className="w-3 h-3 text-sky-300" />
                          <span>Max {pkg.groupCapacity} guests</span>
                        </span>
                      </div>
                    </div>
                    
                    {/* Content Details */}
                    <div className="p-5 space-y-3.5">
                      <div>
                        <div className="flex items-center text-[11px] font-semibold text-slate-500 mb-1">
                          <span className="text-sky-700 font-bold flex items-center gap-1">
                            <HeartHandshake className="w-3.5 h-3.5 text-sky-600" />
                            {pkg.partnerName}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-slate-900 leading-snug group-hover:text-sky-700 transition-colors line-clamp-2">
                          {pkg.name}
                        </h3>
                      </div>

                      {/* Itinerary Preview */}
                      {pkg.itinerary && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                          {pkg.itinerary}
                        </p>
                      )}

                      {/* Inclusions Highlights */}
                      {pkg.inclusions && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Included in package</span>
                          <div className="flex flex-wrap gap-1">
                            {pkg.inclusions.split(',').slice(0, 3).map((inc, i) => (
                              <span 
                                key={i} 
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200/70"
                              >
                                <Check className="w-2.5 h-2.5 text-emerald-600" />
                                {inc.trim()}
                              </span>
                            ))}
                            {pkg.inclusions.split(',').length > 3 && (
                              <span className="text-[10px] text-slate-400 font-semibold self-center pl-1">
                                +{pkg.inclusions.split(',').length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Safety & Guide Info */}
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-[10px] text-slate-500 space-y-0.5">
                        <div className="flex items-center gap-1 font-semibold text-slate-700">
                          <Award className="w-3 h-3 text-amber-500" />
                          <span>{pkg.guideDetails || 'Certified Multilingual Guide included'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Price & Action */}
                  <div className="p-5 pt-0 mt-auto">
                    <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Certified Fair Fare
                        </span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-xl font-black text-slate-900 flex items-center">
                            <IndianRupee className="w-4 h-4 mr-0.5 text-slate-700" />
                            {Number(pkg.price).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">/ person</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleOpenBooking(pkg)}
                        className="bg-slate-900 hover:bg-sky-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer"
                      >
                        <span>View & Book</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Polish Booking Modal */}
        <AnimatePresence>
          {selectedPackage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[92vh] border border-slate-200"
              >
                {/* Left Column: Tour Details & Itinerary */}
                <div className="w-full md:w-3/5 p-6 overflow-y-auto bg-slate-50/70 space-y-5">
                  {/* Tour Image Banner */}
                  <div className="h-44 w-full rounded-2xl overflow-hidden relative shadow-sm border border-slate-200">
                    <img
                      src={
                        (selectedPackage.id === 'pkg_ayodhya_01' || selectedPackage.name?.toLowerCase().includes('ayodhya') || selectedPackage.destination?.toLowerCase().includes('ayodhya') || selectedPackage.name?.toLowerCase().includes('ram'))
                          ? '/images/ram-mandir-ayodhya.jpg'
                          : (selectedPackage.images?.[0] || '/images/ram-mandir-ayodhya.jpg')
                      }
                      alt={selectedPackage.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                    <span className="absolute bottom-2.5 left-3 text-white text-[10px] font-black uppercase bg-slate-900/80 px-2.5 py-1 rounded-full backdrop-blur-md">
                      {selectedPackage.destination}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-extrabold uppercase">
                        S.A.F.A.R. Approved Circuit
                      </span>
                      <span className="text-xs font-bold text-slate-500">By {selectedPackage.partnerName}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                      {selectedPackage.name}
                    </h2>
                    <p className="text-xs text-slate-600 flex items-center gap-1 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {selectedPackage.destination} · {selectedPackage.duration}
                    </p>
                  </div>

                  {/* Authority Verification Banner */}
                  <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="leading-tight">DPIIT & Ministry of Tourism Certified Safety Corridor</p>
                      <p className="text-[11px] font-normal text-emerald-700 mt-0.5">Pre-verified route safety, vetted accommodation, and GPS SOS beacons enabled.</p>
                    </div>
                  </div>

                  {/* Day-Wise Itinerary */}
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-sky-600" />
                      Circuit Itinerary
                    </h4>
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 text-xs text-slate-700 leading-relaxed space-y-2">
                      {selectedPackage.itinerary?.split(',').map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-tight pt-0.5">{step.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Inclusions & Exclusions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 space-y-1.5">
                      <h4 className="font-bold text-emerald-800 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Inclusions
                      </h4>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {selectedPackage.inclusions}
                      </p>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-rose-100 space-y-1.5">
                      <h4 className="font-bold text-rose-800 flex items-center gap-1">
                        <X className="w-3.5 h-3.5 text-rose-500" /> Exclusions
                      </h4>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {selectedPackage.exclusions}
                      </p>
                    </div>
                  </div>

                  {/* Safety & Emergency Contact */}
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-1">
                    <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Safety & Emergency Protocol
                    </h4>
                    <p className="text-amber-800 text-[11px] leading-relaxed">
                      {selectedPackage.safetyInformation}
                    </p>
                    {selectedPackage.emergencyContact && (
                      <p className="text-[11px] font-bold text-amber-900 pt-1 flex items-center gap-1">
                        <PhoneCall className="w-3 h-3 text-amber-700" />
                        Dedicated 24x7 Escort Desk: {selectedPackage.emergencyContact}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column: Interactive Booking Form */}
                <div className="w-full md:w-2/5 p-6 bg-white border-t md:border-t-0 md:border-l border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="font-black text-base text-slate-900">Book Safe Package</h3>
                        <p className="text-[11px] text-slate-500">Government Verified Reservation</p>
                      </div>
                      <button 
                        onClick={() => setSelectedPackage(null)} 
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Close dialog"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4 pt-4">
                      {/* Date Selection */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-sky-600" />
                          Select Travel Date
                        </label>
                        <select 
                          value={bookingDate} 
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none font-semibold text-slate-800 bg-slate-50 cursor-pointer"
                        >
                          <option value="">Select departure date...</option>
                          {selectedPackage.availableDates?.map((d) => (
                            <option key={d} value={d}>
                              {new Date(d).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Number of Guests Counter */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-sky-600" />
                          Number of Tourists
                        </label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setTouristsCount(Math.max(1, touristsCount - 1))}
                            className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 flex items-center justify-center text-sm cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-10 text-center font-bold text-sm text-slate-900">{touristsCount}</span>
                          <button
                            type="button"
                            onClick={() => setTouristsCount(Math.min(selectedPackage.groupCapacity || 10, Number(touristsCount) + 1))}
                            className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 flex items-center justify-center text-sm cursor-pointer"
                          >
                            +
                          </button>
                          <span className="text-[11px] text-slate-400 font-medium ml-1">
                            (Max {selectedPackage.groupCapacity} pax)
                          </span>
                        </div>
                      </div>

                      {/* Pricing Summary Box */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 mt-4">
                        <div className="flex justify-between text-xs text-slate-500 font-medium">
                          <span>Fare per tourist</span>
                          <span className="font-semibold text-slate-700">₹{selectedPackage.price}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 font-medium">
                          <span>Verified Tourists</span>
                          <span className="font-semibold text-slate-700">× {touristsCount}</span>
                        </div>
                        <div className="flex justify-between text-xs text-emerald-700 font-medium">
                          <span>Safety Escort & SOS Fee</span>
                          <span className="font-bold">FREE (Govt Funded)</span>
                        </div>
                        <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                          <span>Total Amount</span>
                          <span className="text-sky-700">₹{(selectedPackage.price * touristsCount).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Action */}
                  <div className="pt-4">
                    {bookingSuccess ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Booking Confirmed! Check Dashboard</span>
                      </div>
                    ) : (
                      <button 
                        onClick={handleBook}
                        disabled={bookingLoading}
                        className="w-full bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-700 hover:from-sky-700 hover:to-indigo-800 text-white font-extrabold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all text-xs flex items-center justify-center gap-2 active:scale-98 disabled:opacity-70 cursor-pointer"
                      >
                        {bookingLoading ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Confirming S.A.F.A.R. Booking...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4 text-sky-200" />
                            <span>Confirm S.A.F.A.R. Verified Booking</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
