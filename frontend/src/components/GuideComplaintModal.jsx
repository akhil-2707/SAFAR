import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, AlertTriangle, X, CheckCircle2, PhoneCall, Send, FileWarning } from 'lucide-react';

const SPRING = { type: 'spring', stiffness: 360, damping: 28 };

export default function GuideComplaintModal({
  isOpen,
  onClose,
  guide,
  tourist,
  onComplaintSuccess
}) {
  const [category, setCategory] = useState('Overcharging / Tariff Discrepancy');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('MEDIUM');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !guide) return null;

  const categories = [
    'Overcharging / Tariff Discrepancy',
    'Unprofessional Conduct / Misbehavior',
    'Unauthorized Route Deviation',
    'Absence / Unpunctual / No-Show',
    'Safety & Security Violation',
    'Refusal of Standard Service'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const guideId = guide.guideId || guide.id;
      const res = await fetch(`/api/guides/${guideId}/complain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          description,
          urgency,
          touristId: tourist?.touristId || 'TID-1000',
          touristName: tourist?.fullName || 'Verified Tourist',
          touristPhone: tourist?.mobileNumber || '+91 98765 00000'
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to lodge complaint');
      }

      setSuccess(true);
      if (onComplaintSuccess) {
        onComplaintSuccess(data.complaint);
      }

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2500);
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
          className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-red-200 text-gray-900 overflow-hidden"
          style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
        >
          {/* Top Red Alert Strip */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-600" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {success ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center border-2 border-red-300">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-gray-900">Complaint Formally Registered!</h3>
              <p className="text-xs text-gray-600 max-w-sm mx-auto">
                Your report against <strong>{guide.fullName}</strong> ({guide.guideId}) has been logged with the Central Command Desk and Tourist Police unit.
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-gray-600">
                Incident Reference ID: <strong>COMP-{Date.now().toString().slice(-6)}</strong> • A safety officer may contact you if required.
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shadow-sm">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">
                    Lodge Safety Complaint
                  </h3>
                  <p className="text-xs text-gray-500">
                    Reporting Guide: <strong>{guide.fullName}</strong> ({guide.guideId})
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">
                  {error}
                </div>
              )}

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-gray-600">
                  Complaint Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-xs font-semibold text-gray-800 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Urgency */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-gray-600">
                  Severity Level
                </label>
                <div className="grid grid-cols-4 gap-2 text-center text-xs font-black">
                  {[
                    { id: 'LOW', label: 'Low', color: 'bg-slate-100 text-gray-700 border-slate-200' },
                    { id: 'MEDIUM', label: 'Medium', color: 'bg-amber-50 text-amber-800 border-amber-300' },
                    { id: 'HIGH', label: 'High', color: 'bg-orange-50 text-orange-800 border-orange-300' },
                    { id: 'CRITICAL', label: 'Urgent', color: 'bg-red-50 text-red-800 border-red-300' }
                  ].map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setUrgency(u.id)}
                      className={`py-2 px-1 rounded-xl border transition-all ${
                        urgency === u.id
                          ? 'ring-2 ring-red-500 font-black shadow-sm ' + u.color
                          : 'bg-slate-50 text-gray-500 border-gray-200'
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-gray-600">
                  Detailed Explanation
                </label>
                <textarea
                  rows="3"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe specifically what occurred, location, time, and any unauthorized demands..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-xs text-gray-800 bg-white"
                />
              </div>

              {/* Emergency Callout */}
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 flex items-start space-x-2 text-[11px] text-red-800">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>
                  For immediate physical danger or distress, trigger the <strong>Emergency SOS</strong> or call <strong>112</strong> immediately.
                </span>
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
                  className="flex-[2] py-2.5 px-4 rounded-xl text-white font-black text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
                  style={{
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
                  }}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Dispatching Complaint...' : 'File Official Complaint'}</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
