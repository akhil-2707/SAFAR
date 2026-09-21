import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, MapPin, Calendar, Languages, ShieldCheck, 
  Sparkles, X, CheckCircle2, ArrowRight, User, Compass 
} from 'lucide-react';

const SPRING = { type: 'spring', stiffness: 360, damping: 28 };

export default function TouristGuidePromptModal({
  isOpen,
  onClose,
  tourist,
  onRequestSuccess
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
  React.useEffect(() => {
    if (isOpen) {
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
  }, [isOpen, tourist?.touristId, tourist?.destination]);

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={SPRING}
          className="relative w-full max-w-lg bg-white/95 rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-200/90 overflow-hidden text-gray-900 my-8"
          style={{
            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            boxShadow: '0 25px 70px rgba(245, 158, 11, 0.2)'
          }}
        >
          {/* Top Indian Tricolor Strip */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-white to-emerald-600" />
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {success ? (
            <div className="py-8 text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={SPRING}
                className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center border-2 border-emerald-300 shadow-md"
              >
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Request Dispatched!</h2>
              <p className="text-sm text-gray-600 max-w-sm mx-auto">
                The Central Authority Desk has received your request. A verified local guide matching <strong>{destination}</strong> will be assigned shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              {/* Header */}
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                      Need a Certified Local Guide?
                    </h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                      S.A.F.A.R. Verified
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Govt-authorized, police-cleared local guides for safe & insightful tours
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">
                  {error}
                </div>
              )}

              {/* Destination Input */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-gray-600 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  <span>Destination Circuit</span>
                </label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Ayodhya, Taj Mahal Agra, Kaziranga, Varanasi..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-xs sm:text-sm font-semibold text-gray-800 bg-white"
                />
              </div>

              {/* Date & Language Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-600 flex items-center space-x-1">
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
                  <label className="text-xs font-black uppercase tracking-wider text-gray-600 flex items-center space-x-1">
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
                <label className="text-xs font-black uppercase tracking-wider text-gray-600 flex items-center space-x-1">
                  <Compass className="w-3.5 h-3.5 text-orange-500" />
                  <span>Tour Interest / Category</span>
                </label>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
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
                      className={`p-2 rounded-xl border font-bold text-left transition-all ${
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

              {/* Special Notes */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500">
                  Special Requirements (Optional)
                </label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Traveling with elderly parents; need wheelchair friendly path..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-xs text-gray-800 bg-white"
                />
              </div>

              {/* Safety Badge Notice */}
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center space-x-2 text-[11px] text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All assigned guides carry cryptographic Digital IDs verified by Tourist Police.</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 transition-colors"
                >
                  Maybe Later
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-2.5 px-4 rounded-xl text-white font-black text-xs flex items-center justify-center space-x-1.5 shadow-lg transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4)'
                  }}
                >
                  {loading ? (
                    <span>Submitting Request...</span>
                  ) : (
                    <>
                      <span>Request Certified Guide</span>
                      <ArrowRight className="w-4 h-4" />
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
