import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, ShieldCheck, CheckCircle2, Clock, Phone, MapPin, 
  Star, CreditCard, Power, AlertTriangle, MessageSquare, 
  RefreshCw, User, Calendar, BookOpen, ExternalLink, ShieldAlert
} from 'lucide-react';
import GuideDigitalIdCard from '../components/GuideDigitalIdCard';
import SafarLogo from '../components/SafarLogo';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function GuideDashboard({ currentUser, onLogout }) {
  const [guide, setGuide] = useState(null);
  const [assignedRequests, setAssignedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingDuty, setTogglingDuty] = useState(false);
  const [showIdModal, setShowIdModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    fetchGuideData();
  }, [currentUser?.guideId, currentUser?.id]);

  const fetchGuideData = async () => {
    try {
      setLoading(true);
      const targetId = currentUser?.guideId || currentUser?.id;
      if (!targetId) return;

      const res = await fetch(`/api/guides/${targetId}`);
      const data = await res.json();
      if (data.success && data.guide) {
        setGuide(data.guide);

        // Fetch requests assigned to this guide
        const resR = await fetch(`/api/guides/requests?guideId=${data.guide.guideId}`);
        const dataR = await resR.json();
        if (dataR.success) {
          setAssignedRequests(dataR.requests || []);
        }
      }
    } catch (err) {
      console.error('Fetch Guide Data Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!guide) return;
    try {
      setTogglingDuty(true);
      const res = await fetch(`/api/guides/${guide.id || guide.guideId}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !guide.isAvailable })
      });
      const data = await res.json();
      if (data.success && data.guide) {
        setGuide(data.guide);
        setActionSuccess(`Duty Status updated: ${data.guide.isAvailable ? 'AVAILABLE (On Duty)' : 'OFF DUTY'}`);
        setTimeout(() => setActionSuccess(null), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingDuty(false);
    }
  };

  if (loading && !guide) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-sm font-bold text-gray-500">Loading S.A.F.A.R. Guide Cockpit...</p>
      </div>
    );
  }

  const isPending = guide?.status === 'PENDING_VERIFICATION';
  const isSuspended = guide?.status === 'SUSPENDED';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6"
      style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
    >
      {/* Top Banner Header */}
      <motion.div
        variants={itemVariants}
        className="rounded-3xl p-5 sm:p-7 bg-white/95 border border-amber-200/90 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-xl"
        style={{
          boxShadow: '0 15px 50px rgba(245, 158, 11, 0.1)'
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md font-black text-lg">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                {guide?.fullName || currentUser?.name || 'Local Guide Portal'}
              </h1>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                {guide?.guideId || 'GID-PENDING'}
              </span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                isPending ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                isSuspended ? 'bg-red-100 text-red-800 border border-red-300' :
                'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                {guide?.status || 'PENDING'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              <span>{guide?.city || 'India'} Circuit • Ministry of Tourism Certified</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
          {!isPending && !isSuspended && (
            <>
              <button
                onClick={handleToggleAvailability}
                disabled={togglingDuty}
                className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl font-black text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all ${
                  guide?.isAvailable
                    ? 'bg-emerald-500 text-white shadow-emerald-200'
                    : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{guide?.isAvailable ? 'On Duty (Available)' : 'Off Duty (Busy)'}</span>
              </button>

              <button
                onClick={() => setShowIdModal(true)}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-white border border-slate-200 font-bold text-xs text-gray-800 hover:bg-slate-50 flex items-center justify-center space-x-1.5 shadow-sm transition-all"
              >
                <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                <span>View Digital ID</span>
              </button>
            </>
          )}

          <button
            onClick={fetchGuideData}
            title="Refresh"
            className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Success Notification */}
      <AnimatePresence>
        {actionSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-md"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PENDING VERIFICATION STATE BANNER */}
      {isPending && (
        <motion.div
          variants={itemVariants}
          className="rounded-3xl p-6 sm:p-8 bg-amber-50/90 border-2 border-amber-300/80 shadow-lg space-y-4"
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-black text-amber-900">
                Application Under Central Authority Verification
              </h2>
              <p className="text-xs sm:text-sm text-amber-800">
                Your credentials and document details (<strong>{guide?.idProofType}: {guide?.idProofNumber}</strong>) have been submitted to the Ministry of Tourism & Central Authority Command Desk.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-white/80 p-3.5 rounded-2xl border border-amber-200 space-y-1">
              <span className="text-[10px] font-black uppercase text-amber-700">Step 1: Application</span>
              <p className="text-xs font-bold text-gray-800 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Submitted Successfully</span>
              </p>
            </div>

            <div className="bg-white/80 p-3.5 rounded-2xl border border-amber-200 space-y-1">
              <span className="text-[10px] font-black uppercase text-amber-700">Step 2: Verification</span>
              <p className="text-xs font-bold text-amber-800 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                <span>Authority Review in Progress</span>
              </p>
            </div>

            <div className="bg-white/80 p-3.5 rounded-2xl border border-amber-200 space-y-1">
              <span className="text-[10px] font-black uppercase text-amber-700">Step 3: Digital ID</span>
              <p className="text-xs font-bold text-gray-400 flex items-center space-x-1">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Blockchain Minting on Approval</span>
              </p>
            </div>
          </div>

          <div className="p-3 bg-white/90 rounded-2xl border border-amber-200 text-xs text-gray-600 flex items-center justify-between">
            <span>💡 <strong>Live Evaluation Tip:</strong> Log in as Command Desk (Authority) to approve this application with 1 click!</span>
            <span className="font-mono font-bold text-amber-800">ID: {guide?.guideId}</span>
          </div>
        </motion.div>
      )}

      {/* KPI METRICS (FOR VERIFIED GUIDES) */}
      {!isPending && (
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-black uppercase text-gray-400">Total Tours Completed</span>
            <div className="text-2xl font-black text-emerald-600">{guide?.toursCompleted || 0}</div>
            <span className="text-[11px] text-gray-500">Certified S.A.F.A.R. Trips</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-black uppercase text-gray-400">Overall Rating</span>
            <div className="text-2xl font-black text-amber-500 flex items-center space-x-1">
              <Star className="w-5 h-5 fill-amber-500" />
              <span>{guide?.rating > 0 ? guide.rating.toFixed(1) : '5.0'}</span>
            </div>
            <span className="text-[11px] text-gray-500">Based on {guide?.totalReviews || 0} reviews</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-black uppercase text-gray-400">Active Duty Status</span>
            <div className={`text-xl font-black ${guide?.isAvailable ? 'text-emerald-600' : 'text-slate-500'}`}>
              {guide?.isAvailable ? 'ON DUTY' : 'OFF DUTY'}
            </div>
            <span className="text-[11px] text-gray-500">{guide?.isAvailable ? 'Accepting Assignments' : 'Standby Mode'}</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-black uppercase text-gray-400">Standard Daily Tariff</span>
            <div className="text-2xl font-black text-gray-900">₹{guide?.dailyRate || 1500}</div>
            <span className="text-[11px] text-gray-500">Govt. Certified Guide Rate</span>
          </div>
        </motion.div>
      )}

      {/* ASSIGNED TOURS QUEUE */}
      {!isPending && (
        <motion.div variants={itemVariants} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-gray-900 tracking-tight flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>Assigned Tourist Tours ({assignedRequests.length})</span>
            </h3>
          </div>

          {assignedRequests.length === 0 ? (
            <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-gray-500 text-xs">
              No active tour assignments at this moment. When Authority assigns a traveler, their trip itinerary will appear here.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {assignedRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-black text-sm text-gray-900">{req.touristName}</h4>
                      <p className="text-xs text-gray-500 flex items-center space-x-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-orange-500" />
                        <span>{req.destination}</span>
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Confirmed Tour
                    </span>
                  </div>

                  <div className="text-xs text-gray-600 bg-slate-50 p-2.5 rounded-xl space-y-1">
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <strong>{req.travelDate}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Preferred Language:</span>
                      <strong>{req.preferredLanguage}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Tourist Phone:</span>
                      <strong className="text-emerald-700">{req.touristPhone}</strong>
                    </div>
                  </div>

                  {req.notes && (
                    <p className="text-xs text-gray-500 italic">
                      "{req.notes}"
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href={`tel:${req.touristPhone}`}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center space-x-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call Tourist</span>
                    </a>
                    <span className="text-[10px] font-mono text-gray-400">
                      TID: {req.touristId}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* RECENT REVIEWS SECTION */}
      {guide?.reviews && guide.reviews.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-3">
          <h3 className="text-base font-black text-gray-900 tracking-tight flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-amber-500" />
            <span>Tourist Reviews & Testimonials</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {guide.reviews.map((rev, idx) => (
              <div
                key={rev.id || idx}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-900">{rev.touristName}</span>
                  <div className="flex items-center space-x-1 text-xs font-bold text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{rev.rating} / 5</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 italic">
                  "{rev.comment}"
                </p>
                <span className="text-[10px] font-mono text-gray-400 block text-right">
                  {rev.date}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* DIGITAL ID POPUP MODAL */}
      {showIdModal && guide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md">
          <div className="relative w-full max-w-2xl">
            <button
              onClick={() => setShowIdModal(false)}
              className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 hover:bg-slate-100 transition-colors"
            >
              ✕
            </button>
            <GuideDigitalIdCard guide={guide} />
          </div>
        </div>
      )}
    </motion.div>
  );
}
