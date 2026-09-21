import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, MapPin, Calendar, Languages, ShieldCheck, 
  Sparkles, X, CheckCircle2, ArrowRight, Compass, ChevronLeft 
} from 'lucide-react';

const SPRING = { type: 'spring', stiffness: 360, damping: 28 };

export default function TouristGuidePromptModal({
  isOpen,
  onClose,
  tourist,
  onRequestSuccess,
  initialStep = 'PROMPT'
}) {
  const getInitialDestination = (t) => {
    if (t?.destination) return t.destination;
    const tid = t?.touristId;
    if (tid === 'TID-1036' || t?.fullName?.includes('Vikas')) {
      return 'Katra Vaishno Devi Shrine & Jammu Pilgrim Track';
    }
    if (tid === 'TID-1039' || t?.fullName?.includes('Aarav')) {
      return 'Taj Mahal & Agra Heritage Promenade';
    }
    if (tid === 'TID-1035' || t?.fullName?.includes('Ananya')) {
      return 'Ayodhya Ram Janmabhoomi & Saryu Heritage Circuit';
    }
    return 'Ayodhya Ram Janmabhoomi Corridor';
  };

  const [step, setStep] = useState(initialStep); // 'PROMPT' | 'FORM'
  const [destination, setDestination] = useState(getInitialDestination(tourist));
  const [travelDate, setTravelDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [preferredLanguage, setPreferredLanguage] = useState(
    tourist?.touristId === 'TID-1039' ? 'English' : 'Hindi'
  );
  const [tourType, setTourType] = useState(
    tourist?.touristId === 'TID-1039' ? 'Heritage & Monument History' : 'Spiritual & Temple Darshan'
  );
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Sync state whenever tourist changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
      setDestination(getInitialDestination(tourist));
      if (tourist?.touristId === 'TID-1039') {
        setPreferredLanguage('English');
        setTourType('Heritage & Monument History');
      } else {
        setPreferredLanguage('Hindi');
        setTourType('Spiritual & Temple Darshan');
      }
      setSuccess(false);
      setError(null);
    }
  }, [isOpen, tourist?.touristId, tourist?.destination, initialStep]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/guides/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          touristId: tourist?.touristId || 'TID-1035',
          touristName: tourist?.fullName || 'Active Tourist',
          touristPhone: tourist?.mobileNumber || '+91 98765 43210',
          destination,
          preferredLanguage,
          travelDate,
          tourType,
          notes
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to submit guide request');
      }

      setSuccess(true);
      if (onRequestSuccess) {
        onRequestSuccess(data.request);
      }

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {/* Top-Anchored Overlay: User sees this immediately at top of page without scrolling */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-3 sm:pt-6 px-3 sm:px-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.96 }}
          transition={SPRING}
          className="relative w-full max-w-lg bg-white/98 rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-amber-300/80 overflow-hidden text-gray-900 my-2 sm:my-4"
          style={{
            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            boxShadow: '0 20px 60px rgba(245, 158, 11, 0.25), 0 8px 24px rgba(0, 0, 0, 0.12)'
          }}
        >
          {/* Top Indian Tricolor Strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-white to-emerald-600" />
          
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-gray-500 transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Success State */}
          {success ? (
            <div className="py-6 text-center space-y-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={SPRING}
                className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center border-2 border-emerald-300 shadow-md"
              >
                <CheckCircle2 className="w-8 h-8" />
              </motion.div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Request Dispatched!</h3>
              <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
                The Central Authority Desk has received your request for <strong className="text-gray-900">{destination}</strong>. A verified local guide will be assigned shortly.
              </p>
            </div>
          ) : step === 'PROMPT' ? (
            /* ── STEP 1: Quick Top Prompt (Yes vs Maybe Later) ── */
            <div className="space-y-4 pt-1">
              <div className="flex items-start space-x-3.5 pr-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shrink-0 mt-0.5">
                  <Award className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                      Need a Certified Local Guide?
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                      S.A.F.A.R. Verified
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">
                    Visiting <strong className="text-orange-600">{destination}</strong>? Connect with a govt-authorized, police-verified guide for safe navigation & heritage insights.
                  </p>
                </div>
              </div>

              {/* Action Buttons: Yes vs Maybe Later */}
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('FORM')}
                  className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    boxShadow: '0 4px 15px rgba(249, 115, 22, 0.35)'
                  }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Yes, I Need a Guide</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 sm:py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-gray-700 font-bold text-xs sm:text-sm transition-all border border-slate-200 active:scale-[0.98] cursor-pointer"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          ) : (
            /* ── STEP 2: Detailed Booking Form (Only shown if tourist clicked "Yes") ── */
            <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
              {/* Header with Back button */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 pr-8">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setStep('PROMPT')}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <span className="text-gray-300">•</span>
                  <h4 className="text-sm font-black text-gray-900">
                    Guide Request Details
                  </h4>
                </div>
              </div>

              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">
                  {error}
                </div>
              )}

              {/* Destination Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-600 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  <span>Destination Circuit</span>
                </label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Ayodhya, Taj Mahal Agra, Katra Jammu..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-xs sm:text-sm font-semibold text-gray-800 bg-white"
                />
              </div>

              {/* Date & Language Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-gray-600 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-orange-500" />
                    <span>Travel Date</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-xs sm:text-sm font-semibold text-gray-800 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-gray-600 flex items-center space-x-1">
                    <Languages className="w-3.5 h-3.5 text-orange-500" />
                    <span>Preferred Language</span>
                  </label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-xs sm:text-sm font-semibold text-gray-800 bg-white"
                  >
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="English">English</option>
                    <option value="Assamese">Assamese (অসমীয়া)</option>
                    <option value="Bengali">Bengali (বাংলা)</option>
                    <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                  </select>
                </div>
              </div>

              {/* Tour Type */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-600 flex items-center space-x-1">
                  <Compass className="w-3.5 h-3.5 text-orange-500" />
                  <span>Tour Interest / Category</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  {[
                    'Heritage & Monument History',
                    'Spiritual & Temple Darshan',
                    'Wildlife Safari & Nature Trek',
                    'Local Markets & Food Trail'
                  ].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setTourType(cat)}
                      className={`p-2 rounded-xl border font-bold text-left transition-all truncate ${
                        tourType === cat
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'bg-slate-50 text-gray-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Requirements */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500">
                  Special Requirements (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Wheelchair access, elderly assistance..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-xs text-gray-800 bg-white"
                />
              </div>

              {/* Verified Police ID notice */}
              <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center space-x-2 text-[11px] text-emerald-800 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Assigned guide will carry a Police-cleared Digital ID with QR verify.</span>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-3.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 rounded-xl text-white font-black text-xs flex items-center justify-center space-x-1.5 shadow-lg transition-all cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4)'
                  }}
                >
                  {loading ? (
                    <span>Dispatching Request...</span>
                  ) : (
                    <>
                      <Award className="w-4 h-4" />
                      <span>Submit Request to Authority Desk</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
