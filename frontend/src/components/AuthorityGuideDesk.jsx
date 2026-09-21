import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, ShieldCheck, CheckCircle2, Clock, AlertTriangle, UserCheck, 
  MapPin, Star, Phone, RefreshCw, ChevronRight, X, ShieldAlert,
  Send, FileCheck, Search, Filter, Ban, ExternalLink, CreditCard
} from 'lucide-react';
import GuideDigitalIdCard from './GuideDigitalIdCard';

export default function AuthorityGuideDesk({ onRefreshData }) {
  const [activeSubTab, setActiveSubTab] = useState('PENDING'); // 'PENDING' | 'REQUESTS' | 'VERIFIED' | 'COMPLAINTS'
  const [guides, setGuides] = useState([]);
  const [requests, setRequests] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGuideForId, setSelectedGuideForId] = useState(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState(null);

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState('ALL');

  useEffect(() => {
    fetchDeskData();
  }, []);

  const fetchDeskData = async () => {
    try {
      setLoading(true);
      const [resG, resR, resC] = await Promise.all([
        fetch('/api/guides'),
        fetch('/api/guides/requests'),
        fetch('/api/guides/complaints')
      ]);

      const [dataG, dataR, dataC] = await Promise.all([
        resG.json(),
        resR.json(),
        resC.json()
      ]);

      if (dataG.success) setGuides(dataG.guides || []);
      if (dataR.success) setRequests(dataR.requests || []);
      if (dataC.success) setComplaints(dataC.complaints || []);
    } catch (err) {
      console.error('Fetch Guide Desk Data Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 4500);
  };

  // 1. Verify Guide
  const handleVerifyGuide = async (guide) => {
    try {
      const res = await fetch(`/api/guides/${guide.id || guide.guideId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`✓ Guide ${guide.fullName} verified! Official Digital ID minted on Blockchain.`);
        await fetchDeskData();
        if (onRefreshData) onRefreshData();
      } else {
        alert(data.error || 'Failed to verify guide');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // 2. Reject Guide
  const handleRejectGuide = async (guide) => {
    const reason = prompt(`Enter reason for rejecting ${guide.fullName}'s application:`, 'ID document could not be validated.');
    if (!reason) return;

    try {
      const res = await fetch(`/api/guides/${guide.id || guide.guideId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Application for ${guide.fullName} rejected.`);
        await fetchDeskData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // 3. Assign Guide to Tourist Request
  const handleAssignGuide = async (requestId, guideId) => {
    try {
      const res = await fetch(`/api/guides/requests/${requestId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`✓ Guide assigned successfully! Tourist has been notified.`);
        await fetchDeskData();
        if (onRefreshData) onRefreshData();
      } else {
        alert(data.error || 'Failed to assign guide');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // 4. Update Complaint Status
  const handleUpdateComplaint = async (complaintId, status, actionTaken) => {
    try {
      const res = await fetch(`/api/guides/complaints/${complaintId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, actionTaken })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Complaint status updated to ${status}`);
        await fetchDeskData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Filtered lists
  const pendingGuides = guides.filter(g => g.status === 'PENDING_VERIFICATION');
  const verifiedGuides = guides.filter(g => g.status === 'VERIFIED');
  const pendingRequests = requests.filter(r => r.status === 'PENDING_ASSIGNMENT');
  const activeComplaints = complaints.filter(c => c.status !== 'RESOLVED');

  return (
    <div className="space-y-4 sm:space-y-6" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
      
      {/* Action Toast */}
      <AnimatePresence>
        {actionSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-lg"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtabs Switcher with Counter Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/95 p-2 rounded-2xl border border-slate-200 shadow-sm backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveSubTab('PENDING')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-2 ${
              activeSubTab === 'PENDING'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Verifications</span>
            {pendingGuides.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeSubTab === 'PENDING' ? 'bg-white text-amber-600' : 'bg-amber-100 text-amber-800'
              }`}>
                {pendingGuides.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('REQUESTS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-2 ${
              activeSubTab === 'REQUESTS'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-slate-100'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Tourist Requests</span>
            {pendingRequests.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeSubTab === 'REQUESTS' ? 'bg-white text-orange-600' : 'bg-orange-100 text-orange-800'
              }`}>
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('VERIFIED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-2 ${
              activeSubTab === 'VERIFIED'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Guides Directory ({verifiedGuides.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('COMPLAINTS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-2 ${
              activeSubTab === 'COMPLAINTS'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Safety Complaints</span>
            {activeComplaints.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeSubTab === 'COMPLAINTS' ? 'bg-white text-red-600' : 'bg-red-100 text-red-800'
              }`}>
                {activeComplaints.length}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={fetchDeskData}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl border border-slate-200 text-gray-600 font-bold text-xs hover:bg-slate-50 flex items-center space-x-1 transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* SUBTAB 1: PENDING GUIDE VERIFICATIONS */}
      {activeSubTab === 'PENDING' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Guides awaiting identity verification and police clearance. Click <strong>Verify & Issue Digital ID</strong> to register credentials on the Prototype Blockchain Ledger.
              </span>
            </div>
            <span className="font-black">{pendingGuides.length} Pending</span>
          </div>

          {pendingGuides.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-gray-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="font-bold text-sm">All Guide Applications Verified</p>
              <p className="text-xs">No pending guide submissions at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingGuides.map((guide) => (
                <div
                  key={guide.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-md space-y-3.5 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-black text-base text-gray-900">{guide.fullName}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          {guide.guideId}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-orange-500" />
                        <span>{guide.city} Circuit</span>
                      </p>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                      Pending
                    </span>
                  </div>

                  {/* ID Proof Credentials */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Document Type:</span>
                      <strong className="text-gray-900">{guide.idProofType}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Document / License No:</span>
                      <strong className="font-mono text-orange-600">{guide.idProofNumber}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Experience:</span>
                      <strong className="text-gray-900">{guide.experienceYears} Years ({guide.specialization})</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Spoken Languages:</span>
                      <strong className="text-gray-900">{(guide.languages || []).join(', ')}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Contact Phone:</span>
                      <strong className="text-gray-900">{guide.phone}</strong>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 italic line-clamp-2">
                    "{guide.bio}"
                  </p>

                  {/* Verification Actions */}
                  <div className="flex items-center space-x-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => handleRejectGuide(guide)}
                      className="px-3 py-2 rounded-xl border border-red-200 text-red-700 font-bold text-xs hover:bg-red-50 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleVerifyGuide(guide)}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md flex items-center justify-center space-x-1.5 transition-all"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verify & Issue Digital ID</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: TOURIST REQUESTS & NEARBY ASSIGNMENT */}
      {activeSubTab === 'REQUESTS' && (
        <div className="space-y-4">
          <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-2xl text-xs text-orange-900 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Send className="w-4 h-4 text-orange-600 shrink-0" />
              <span>
                Real-time queue of tourist guide requests. Match and assign available verified guides operating in the traveler's destination circuit.
              </span>
            </div>
            <span className="font-black">{pendingRequests.length} Waiting</span>
          </div>

          {requests.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-gray-500">
              No tourist guide requests currently filed.
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => {
                // Find matching verified guides for this destination circuit
                const reqCity = (req.city || req.destination || '').toLowerCase();
                const matchedGuides = verifiedGuides.filter(g => 
                  (g.city && g.city.toLowerCase().includes(reqCity.split(' ')[0])) ||
                  (g.operatingDestinations && g.operatingDestinations.some(d => d.toLowerCase().includes(reqCity.split(' ')[0]))) ||
                  true // fallback to any verified guide if circuit empty
                );

                const isAssigned = req.status === 'ASSIGNED';

                return (
                  <div
                    key={req.id}
                    className={`bg-white rounded-2xl p-4 sm:p-5 border shadow-sm space-y-3 ${
                      isAssigned ? 'border-emerald-200 bg-emerald-50/20' : 'border-orange-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-black text-sm text-gray-900">{req.touristName}</h4>
                          <span className="text-[10px] font-mono font-bold text-gray-500 bg-slate-100 px-1.5 py-0.2 rounded">
                            {req.touristId}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isAssigned ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 mt-1">
                          <span className="flex items-center space-x-1 font-bold text-orange-700">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span>{req.destination}</span>
                          </span>
                          <span>•</span>
                          <span>Date: <strong>{req.travelDate}</strong></span>
                          <span>•</span>
                          <span>Language: <strong>{req.preferredLanguage}</strong></span>
                          <span>•</span>
                          <span>Interest: <strong>{req.tourType}</strong></span>
                        </div>
                      </div>

                      {isAssigned ? (
                        <div className="text-right sm:self-center">
                          <div className="text-xs font-bold text-emerald-700 flex items-center space-x-1 sm:justify-end">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Assigned to {req.assignedGuideName}</span>
                          </div>
                          <span className="text-[10px] text-gray-500 font-mono">
                            Guide ID: {req.assignedGuideId} ({req.assignedGuidePhone})
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-xl border border-orange-200 self-start sm:self-center">
                          Waiting for Dispatch
                        </span>
                      )}
                    </div>

                    {req.notes && (
                      <p className="text-xs text-gray-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        "{req.notes}"
                      </p>
                    )}

                    {/* Nearby Available Guide Assignment Controls */}
                    {!isAssigned && (
                      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center space-x-1.5 text-xs text-gray-600">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          <span className="font-semibold">Recommended Available Guides:</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {matchedGuides.slice(0, 2).map((g) => (
                            <button
                              key={g.id}
                              onClick={() => handleAssignGuide(req.id, g.guideId)}
                              className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-sm cursor-pointer"
                            >
                              <span>Assign {g.fullName}</span>
                              <span className="text-[10px] font-mono text-orange-200">({g.rating > 0 ? g.rating.toFixed(1) : '5.0'}★)</span>
                            </button>
                          ))}

                          {verifiedGuides.length > 0 && (
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAssignGuide(req.id, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              defaultValue=""
                              className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-gray-700 cursor-pointer focus:outline-none focus:border-orange-500"
                            >
                              <option value="" disabled>Or select any verified guide...</option>
                              {verifiedGuides.map((g) => (
                                <option key={g.id} value={g.guideId}>
                                  {g.fullName} ({g.city || 'India'}) • {g.rating > 0 ? g.rating.toFixed(1) : '5.0'}★
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: VERIFIED GUIDES DIRECTORY */}
      {activeSubTab === 'VERIFIED' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {verifiedGuides.map((guide) => (
              <div
                key={guide.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-all relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-black text-sm">
                      {guide.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-gray-900">{guide.fullName}</h4>
                      <span className="text-[10px] font-mono font-bold text-orange-600">
                        {guide.guideId}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    guide.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-gray-600'
                  }`}>
                    {guide.isAvailable ? 'On Duty' : 'Off Duty'}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Operating Circuit:</span>
                    <strong className="text-gray-900">{guide.city}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Rating:</span>
                    <strong className="text-amber-700 flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{guide.rating > 0 ? guide.rating.toFixed(1) : '5.0'} ({guide.totalReviews || 0} reviews)</span>
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Tours Completed:</span>
                    <strong className="text-emerald-700">{guide.toursCompleted || 0}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <strong className="text-gray-900">{guide.phone}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedGuideForId(guide)}
                    className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-gray-800 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                    <span>View Digital ID Badge</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 4: SAFETY COMPLAINTS DESK */}
      {activeSubTab === 'COMPLAINTS' && (
        <div className="space-y-4">
          <div className="p-4 bg-red-50/70 border border-red-200 rounded-2xl text-xs text-red-900 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                Safety complaints submitted by tourists. Authorities can issue warnings, dispatch officers, or suspend guide licenses.
              </span>
            </div>
            <span className="font-black">{complaints.length} Total</span>
          </div>

          {complaints.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-gray-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="font-bold text-sm mt-2">Zero Active Complaints</p>
              <p className="text-xs">No misconduct reports lodged against local guides.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.map((comp) => (
                <div
                  key={comp.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-red-200 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-sm text-red-700">{comp.category}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                          comp.urgency === 'CRITICAL' ? 'bg-red-600 text-white animate-pulse' :
                          comp.urgency === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {comp.urgency}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-gray-700 px-2 py-0.5 rounded-full font-bold">
                          Status: {comp.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Reported by Tourist: <strong>{comp.touristName}</strong> ({comp.touristPhone}) against Guide: <strong>{comp.guideName}</strong> ({comp.guideId})
                      </p>
                    </div>

                    <span className="text-[11px] font-mono text-gray-400">
                      {new Date(comp.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <p className="text-xs text-gray-800 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    "{comp.description}"
                  </p>

                  {comp.actionTaken && (
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>Authority Action:</strong> {comp.actionTaken}</span>
                    </div>
                  )}

                  {/* Authority Action Controls */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleUpdateComplaint(comp.id, 'WARNING_ISSUED', 'Official written warning issued to guide regarding tariff regulation compliance.')}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs transition-colors"
                    >
                      Issue Formal Warning
                    </button>
                    <button
                      onClick={() => handleUpdateComplaint(comp.id, 'SUSPENDED', 'Guide license suspended pending full inquiry by Tourism Authority.')}
                      className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs transition-colors"
                    >
                      Suspend Guide License
                    </button>
                    <button
                      onClick={() => handleUpdateComplaint(comp.id, 'RESOLVED', 'Complaint investigated and amicably resolved with tourist refund/clearance.')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-colors"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Guide Digital ID Modal */}
      {selectedGuideForId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md">
          <div className="relative w-full max-w-2xl">
            <button
              onClick={() => setSelectedGuideForId(null)}
              className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 hover:bg-slate-100 transition-colors"
            >
              ✕
            </button>
            <GuideDigitalIdCard guide={selectedGuideForId} />
          </div>
        </div>
      )}
    </div>
  );
}
