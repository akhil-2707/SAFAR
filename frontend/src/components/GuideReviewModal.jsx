import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, CheckCircle2, Award, Heart, MessageSquare } from 'lucide-react';

const SPRING = { type: 'spring', stiffness: 360, damping: 28 };

export default function GuideReviewModal({
  isOpen,
  onClose,
  guide,
  tourist,
  onReviewSuccess
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !guide) return null;

  const ratingLabels = {
    1: 'Poor Service',
    2: 'Fair Experience',
    3: 'Good Tour',
    4: 'Very Knowledgeable & Helpful',
    5: 'Outstanding 5-Star Experience! ⭐'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const guideId = guide.guideId || guide.id;
      const res = await fetch(`/api/guides/${guideId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment,
          touristName: tourist?.fullName || 'Verified Tourist',
          touristId: tourist?.touristId || 'TID-1000'
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSuccess(true);
      if (onReviewSuccess) {
        onReviewSuccess(data.guide, data.review);
      }

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={SPRING}
          className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-amber-200 text-gray-900 overflow-hidden"
          style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
        >
          {/* Top Tricolor Strip */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-white to-emerald-600" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {success ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-gray-900">Thank You for Your Feedback!</h3>
              <p className="text-xs text-gray-600">
                Your rating helps fellow tourists and recognizes quality certified guides.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
                  <Star className="w-6 h-6 fill-amber-500" />
                </div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight">Rate Your Local Guide</h3>
                <p className="text-xs text-gray-500">
                  How was your experience with <strong>{guide.fullName}</strong> ({guide.city})?
                </p>
              </div>

              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold text-center">
                  {error}
                </div>
              )}

              {/* Star Picker */}
              <div className="flex flex-col items-center space-y-1 py-2">
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          (hoverRating || rating) >= star
                            ? 'text-amber-500 fill-amber-400'
                            : 'text-gray-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-700">
                  {ratingLabels[hoverRating || rating]}
                </span>
              </div>

              {/* Comment */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-gray-600 flex items-center space-x-1">
                  <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
                  <span>Review Comments</span>
                </label>
                <textarea
                  rows="3"
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about punctuality, knowledge, safety precautions and hospitality..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-xs text-gray-800 bg-white"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-2.5 px-4 rounded-xl text-white font-black text-xs shadow-md transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)'
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
