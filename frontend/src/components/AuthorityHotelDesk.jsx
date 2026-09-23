import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, ShieldCheck, CheckCircle2, Clock, AlertTriangle, 
  MapPin, Phone, RefreshCw, X, ShieldAlert, Search, Filter, 
  Check, Ban, Eye, Sparkles, ExternalLink, BedDouble, Key, Award
} from 'lucide-react';

const SPRING = { type: 'spring', stiffness: 360, damping: 28 };

export default function AuthorityHotelDesk({ onRefreshData }) {
  const [activeTab, setActiveTab] = useState('PENDING'); // 'PENDING' | 'APPROVED' | 'REJECTED'
  const [hotelsData, setHotelsData] = useState({
    total: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    hotels: [],
    pending: [],
    approved: [],
    rejected: []
  });
  const [loading, setLoading] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState(null);
  const [selectedHotelModal, setSelectedHotelModal] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState('ALL');

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/hotels/authority/all');
      const data = await res.json();
      if (data.success) {
        setHotelsData(data);
      }
    } catch (err) {
      console.error('Failed to load authority hotels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const showNotification = (msg) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 4500);
  };

  const handleVerify = async (hotel, status) => {
    let reviewNotes = '';
    if (status === 'REJECTED') {
      const input = prompt(
        `Enter compliance deficiency reason for rejecting "${hotel.name}":`,
        'Inadequate fire safety clearance or unverified local municipal registration.'
      );
      if (input === null) return; // Cancelled
      reviewNotes = input;
    } else {
      reviewNotes = 'Verified on-site safety, valid trade license & 1-tap fast check-in readiness.';
    }

    try {
      const officerUser = JSON.parse(localStorage.getItem('safar_user') || '{}');
      const officerName = officerUser.name || 'Central Tourism Command Officer';

      const res = await fetch(`/api/hotels/${hotel.id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reviewNotes,
          officerName
        })
      });

      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        await fetchHotels();
        if (onRefreshData) onRefreshData();
      } else {
        alert(data.error || 'Failed to update hotel verification status');
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  // Filter list based on active tab, search, and city
  const currentList = 
    activeTab === 'PENDING' ? hotelsData.pending :
    activeTab === 'APPROVED' ? hotelsData.approved :
    hotelsData.rejected;

  const filteredHotels = currentList.filter(h => {
    const matchesSearch = 
      (h.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = filterCity === 'ALL' || (h.city || '').toLowerCase() === filterCity.toLowerCase();
    return matchesSearch && matchesCity;
  });

  const cities = ['ALL', 'Ayodhya', 'Varanasi', 'Katra', 'Agra', 'Guwahati', 'Cherrapunji', 'Jaipur'];

  return (
    <div className="space-y-6">
      
      {/* ── HEADER BANNER ── */}
      <div className="rounded-3xl p-6 sm:p-7 relative overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                MINISTRY OF TOURISM • HOSPITALITY ACCREDITATION
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                STATUTORY VERIFICATION DESK
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Hospitality & Stay Partner Verification Console
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium">
              Review and authorize newly registered hotels, micro-stays, and transit pods. Only properties verified by an authorized officer receive the S.A.F.A.R. Trust Seal and become bookable by tourists.
            </p>
          </div>

          <button
            onClick={fetchHotels}
            disabled={loading}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 font-bold text-xs flex items-center gap-2 transition active:scale-95 cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live Records</span>
          </button>
        </div>
      </div>

      {/* ── SUCCESS TOAST ── */}
      <AnimatePresence>
        {actionSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-md"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── METRIC STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Total Registered</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">{hotelsData.total}</div>
          <p className="text-[11px] text-slate-400 font-medium">All properties in registry</p>
        </div>

        <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-amber-800">
            <span>Pending Clearance</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900 flex items-center gap-2">
            <span>{hotelsData.pendingCount}</span>
            {hotelsData.pendingCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full animate-pulse">
                Action Required
              </span>
            )}
          </div>
          <p className="text-[11px] text-amber-700/80 font-medium">Awaiting officer inspection</p>
        </div>

        <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
            <span>Officially Approved</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900">{hotelsData.approvedCount}</div>
          <p className="text-[11px] text-emerald-700/80 font-medium">Live on Tourist Stays portal</p>
        </div>

        <div className="p-4 bg-red-50/80 rounded-2xl border border-red-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-red-800">
            <span>Rejected / On Hold</span>
            <Ban className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-black text-red-900">{hotelsData.rejectedCount}</div>
          <p className="text-[11px] text-red-700/80 font-medium">Non-compliant applications</p>
        </div>
      </div>

      {/* ── TAB SELECTOR & SEARCH ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'PENDING', label: 'Pending Approval', count: hotelsData.pendingCount, color: 'amber' },
            { id: 'APPROVED', label: 'Verified Partners', count: hotelsData.approvedCount, color: 'emerald' },
            { id: 'REJECTED', label: 'Rejected / Deficient', count: hotelsData.rejectedCount, color: 'red' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & City Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stay or location..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 font-bold text-slate-700 outline-none"
          >
            {cities.map(c => (
              <option key={c} value={c}>{c === 'ALL' ? 'All Cities' : c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── HOTEL CARDS LIST ── */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-500">Loading hotel records...</p>
        </div>
      ) : filteredHotels.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-3xl border border-slate-200">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No {activeTab.toLowerCase()} hotel records found.</p>
          <p className="text-xs text-slate-400 mt-1">Try switching tabs or adjusting search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHotels.map((hotel) => {
            const isPending = hotel.status === 'PENDING_VERIFICATION';
            const isApproved = hotel.status === 'APPROVED' || !hotel.status;

            return (
              <motion.div
                key={hotel.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
              >
                {/* Image Banner & Badges */}
                <div className="relative h-40 bg-slate-100 overflow-hidden">
                  <img
                    src={hotel.image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop&q=80'}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-white/95 text-slate-900 shadow-sm border border-white/40">
                      📍 {hotel.city}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 ${
                      isPending ? 'bg-amber-500 text-white' :
                      isApproved ? 'bg-emerald-600 text-white' :
                      'bg-red-600 text-white'
                    }`}>
                      {isPending ? <Clock className="w-3 h-3" /> :
                       isApproved ? <ShieldCheck className="w-3 h-3" /> :
                       <Ban className="w-3 h-3" />}
                      <span>{isPending ? 'PENDING REVIEW' : isApproved ? 'OFFICIALLY VERIFIED' : 'REJECTED'}</span>
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <h3 className="font-extrabold text-sm line-clamp-1 leading-snug">{hotel.name}</h3>
                    <p className="text-[11px] text-white/80 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">{hotel.location}</span>
                    </p>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-4 space-y-3 text-xs flex-1">
                  {/* Rates Matrix */}
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Approved Tariffs</span>
                    <div className="grid grid-cols-4 gap-1 text-center font-bold">
                      <div className="bg-white p-1 rounded-lg border border-slate-200">
                        <div className="text-[9px] text-slate-500">2h Rest</div>
                        <div className="text-slate-900 text-xs">₹{hotel.hourlyRates?.['2h'] || 299}</div>
                      </div>
                      <div className="bg-white p-1 rounded-lg border border-slate-200">
                        <div className="text-[9px] text-slate-500">4h Stay</div>
                        <div className="text-slate-900 text-xs">₹{hotel.hourlyRates?.['4h'] || 499}</div>
                      </div>
                      <div className="bg-white p-1 rounded-lg border border-slate-200">
                        <div className="text-[9px] text-slate-500">6h Pod</div>
                        <div className="text-slate-900 text-xs">₹{hotel.hourlyRates?.['6h'] || 750}</div>
                      </div>
                      <div className="bg-emerald-50 p-1 rounded-lg border border-emerald-200 text-emerald-900">
                        <div className="text-[9px] text-emerald-700">Full Day</div>
                        <div className="text-xs">₹{hotel.hourlyRates?.fullDay || 2200}</div>
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Features & Amenities</span>
                    <div className="flex flex-wrap gap-1">
                      {(hotel.amenities || ['Air-Conditioned', 'Wi-Fi', 'Cloakroom']).slice(0, 3).map((am, i) => (
                        <span key={i} className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                          {am}
                        </span>
                      ))}
                      {(hotel.amenities || []).length > 3 && (
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">
                          +{hotel.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contact & Station */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {hotel.phoneContact || '+91 9876543210'}
                    </span>
                    <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
                      {hotel.stationCode || 'CITY CENTER'}
                    </span>
                  </div>

                  {hotel.reviewNotes && (
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                      <strong className="text-slate-800">Officer Notes:</strong> {hotel.reviewNotes}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="p-3 bg-slate-50/90 border-t border-slate-100 flex items-center gap-2">
                  {isPending ? (
                    <>
                      <button
                        onClick={() => handleVerify(hotel, 'APPROVED')}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Approve & Verify</span>
                      </button>
                      <button
                        onClick={() => handleVerify(hotel, 'REJECTED')}
                        className="py-2 px-3 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 font-extrabold text-xs transition active:scale-95 cursor-pointer"
                        title="Reject Application"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  ) : isApproved ? (
                    <div className="w-full flex items-center justify-between text-xs">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Active Verified Partner</span>
                      </span>
                      <button
                        onClick={() => handleVerify(hotel, 'REJECTED')}
                        className="text-[10px] font-bold text-red-600 hover:underline cursor-pointer"
                      >
                        Revoke Seal
                      </button>
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-between text-xs">
                      <span className="text-red-700 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                        <span>Compliance Deficiency</span>
                      </span>
                      <button
                        onClick={() => handleVerify(hotel, 'APPROVED')}
                        className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Re-Approve
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
