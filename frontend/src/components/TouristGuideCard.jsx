import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, ShieldCheck, MapPin, Phone, Star, MessageSquare, 
  AlertTriangle, CreditCard, ChevronRight, CheckCircle2, Clock,
  Sparkles, ExternalLink, RefreshCw
} from 'lucide-react';
import GuideDigitalIdCard from './GuideDigitalIdCard';
import TouristGuidePromptModal from './TouristGuidePromptModal';
import GuideReviewModal from './GuideReviewModal';
import GuideComplaintModal from './GuideComplaintModal';

export default function TouristGuideCard({ tourist, refreshTrigger }) {
  const [activeRequest, setActiveRequest] = useState(null);
  const [assignedGuide, setAssignedGuide] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showIdModal, setShowIdModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);

  useEffect(() => {
    fetchGuideStatus();
  }, [tourist?.touristId, refreshTrigger]);

  const fetchGuideStatus = async () => {
    try {
      setLoading(true);
      const tid = tourist?.touristId || 'TID-1035';
      const res = await fetch(`/api/guides/requests?touristId=${tid}`);
      const data = await res.json();

      if (data.success && data.requests && data.requests.length > 0) {
        // Take latest request
        const req = data.requests[0];
        setActiveRequest(req);

        if (req.assignedGuideId) {
          const resG = await fetch(`/api/guides/${req.assignedGuideId}`);
          const dataG = await resG.json();
          if (dataG.success) {
            setAssignedGuide(dataG.guide);
          }
        } else {
          setAssignedGuide(null);
        }
      } else {
        setActiveRequest(null);
        setAssignedGuide(null);
      }
    } catch (err) {
      console.error('Fetch Guide Status Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSuccess = (newRequest) => {
    setActiveRequest(newRequest);
    fetchGuideStatus();
  };

  const handleReviewSuccess = (updatedGuide) => {
    setAssignedGuide(updatedGuide);
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-white/95 border border-amber-200/80 shadow-lg relative overflow-hidden space-y-3.5 backdrop-blur-xl"
        style={{
          boxShadow: '0 10px 35px rgba(245, 158, 11, 0.08), 0 2px 10px rgba(0, 0, 0, 0.04)',
          fontFamily: "'Space Grotesk', 'Inter', sans-serif"
        }}
      >
        {/* Accent Top Strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-400 to-emerald-500" />

        {/* Header with Title & Live Status */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-sm">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-sm text-gray-900 tracking-tight">
                  Local Tourist Guide
                </span>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  S.A.F.A.R. Verified
                </span>
              </div>
              <span className="text-[11px] text-gray-500 block">
                Govt. Certified Local Heritage & Safety Escort
              </span>
            </div>
          </div>

          <button
            onClick={fetchGuideStatus}
            title="Refresh Status"
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* State 1: Assigned Guide Active */}
        {assignedGuide ? (
          <div className="space-y-3 pt-1">
            {/* Guide Info Capsule */}
            <div className="p-3 bg-gradient-to-br from-amber-50/80 via-white to-emerald-50/50 rounded-2xl border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white text-base font-black shadow-md">
                    {assignedGuide.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-black text-sm text-gray-900">{assignedGuide.fullName}</h4>
                    <span className="text-[10px] font-mono font-bold text-orange-600 bg-white px-1.5 py-0.2 rounded border border-orange-200">
                      {assignedGuide.guideId}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-600 mt-0.5">
                    <span className="flex items-center space-x-1 font-bold text-amber-700">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{assignedGuide.rating > 0 ? assignedGuide.rating.toFixed(1) : '5.0'}</span>
                    </span>
                    <span>•</span>
                    <span className="text-gray-500">{assignedGuide.city}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">{assignedGuide.toursCompleted || 1} Tours Done</span>
                  </div>
                </div>
              </div>

              {/* Direct Call & WhatsApp Contact */}
              <div className="flex items-center space-x-1.5 self-end sm:self-center">
                <a
                  href={`tel:${assignedGuide.phone || activeRequest.assignedGuidePhone}`}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center space-x-1 shadow-sm transition-all"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call Guide</span>
                </a>
                <button
                  onClick={() => setShowIdModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-gray-800 font-bold text-xs border border-gray-200 shadow-sm flex items-center space-x-1 transition-all"
                >
                  <CreditCard className="w-3 h-3 text-amber-600" />
                  <span>Digital ID</span>
                </button>
              </div>
            </div>

            {/* Circuit & Assignment details */}
            <div className="flex flex-wrap items-center justify-between text-xs text-gray-600 bg-slate-50/80 px-3 py-2 rounded-xl border border-slate-200 gap-1.5">
              <span className="flex items-center space-x-1 truncate max-w-full">
                <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                <strong className="truncate">Destination:</strong> {activeRequest.destination}
              </span>
              <span className="text-[11px] font-mono text-gray-400">
                Date: {activeRequest.travelDate}
              </span>
            </div>

            {/* Action Bar: Rate & Review, Complain, Request New */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => setShowReviewModal(true)}
                className="py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                <span>Rate & Review</span>
              </button>

              <button
                onClick={() => setShowComplaintModal(true)}
                className="py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span>File Complaint</span>
              </button>

              <button
                onClick={() => setShowPromptModal(true)}
                className="col-span-2 sm:col-span-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-gray-700 border border-slate-200 font-bold text-xs flex items-center justify-center space-x-1 transition-colors"
              >
                <span>Change Circuit</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : activeRequest ? (
          /* State 2: Request Pending Authority Assignment */
          <div className="space-y-3 pt-1">
            <div className="p-3.5 bg-amber-50/70 border border-amber-300 rounded-2xl flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4 animate-spin" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-black text-xs sm:text-sm text-gray-900">
                    Guide Request Under Assignment
                  </h4>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-200 text-amber-900 font-bold">
                    Pending Dispatch
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Target Circuit: <strong>{activeRequest.destination}</strong> ({activeRequest.preferredLanguage || 'Hindi'})
                </p>
                <p className="text-[11px] text-gray-500">
                  The S.A.F.A.R. Authority Desk is matching a nearby certified local guide. You will receive an instant notification once assigned.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-gray-500">Need to modify request?</span>
              <button
                onClick={() => setShowPromptModal(true)}
                className="font-bold text-orange-600 hover:underline"
              >
                Edit Details
              </button>
            </div>
          </div>
        ) : (
          /* State 3: No Active Request -> Prompt to Request */
          <div className="space-y-3 pt-1">
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-gray-800">
                  Exploring <strong>{tourist?.destination || 'your destination'}</strong>?
                </p>
                <p className="text-xs text-gray-500">
                  Get a certified local guide for safe navigation, temple rituals, and monument history.
                </p>
              </div>

              <button
                onClick={() => setShowPromptModal(true)}
                className="px-4 py-2 rounded-xl text-white font-black text-xs flex items-center justify-center space-x-1.5 shadow-md shrink-0 transition-all"
                style={{
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  boxShadow: '0 4px 15px rgba(249, 115, 22, 0.35)'
                }}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Request Local Guide</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Pop-up / Request Modal */}
      <TouristGuidePromptModal
        isOpen={showPromptModal}
        onClose={() => setShowPromptModal(false)}
        tourist={tourist}
        onRequestSuccess={handleRequestSuccess}
        initialStep="FORM"
      />

      {/* Digital ID Card Modal */}
      {showIdModal && assignedGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md">
          <div className="relative w-full max-w-2xl">
            <button
              onClick={() => setShowIdModal(false)}
              className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 hover:bg-slate-100 transition-colors"
            >
              ✕
            </button>
            <GuideDigitalIdCard guide={assignedGuide} />
          </div>
        </div>
      )}

      {/* Review Modal */}
      <GuideReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        guide={assignedGuide}
        tourist={tourist}
        onReviewSuccess={handleReviewSuccess}
      />

      {/* Complaint Modal */}
      <GuideComplaintModal
        isOpen={showComplaintModal}
        onClose={() => setShowComplaintModal(false)}
        guide={assignedGuide}
        tourist={tourist}
        onComplaintSuccess={() => fetchGuideStatus()}
      />
    </>
  );
}
