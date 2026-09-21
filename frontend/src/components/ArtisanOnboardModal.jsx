import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Sparkles, Building, Phone, MapPin, Tag } from 'lucide-react';

const SPRING = { type: 'spring', stiffness: 360, damping: 28 };

export default function ArtisanOnboardModal({ isOpen, onClose, onArtisanAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    craftName: '',
    region: '',
    state: 'Jammu & Kashmir',
    giTagNumber: '',
    applicationNumber: '',
    certificateNumber: '',
    registeredProprietor: '',
    craftHeritageYears: 75,
    artisanStory: '',
    typicalMarketScamPrice: 8000,
    officialFairPriceRange: '₹2,500 – ₹3,500',
    fairBasePrice: 2800,
    artisanUpiVpa: '',
    phoneContact: '',
    cooperativeAddress: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/artisans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.success && data.artisan) {
        setSuccessMsg(data.message);
        if (onArtisanAdded) onArtisanAdded(data.artisan);
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setErrorMsg(data.error || 'Failed to onboard artisan');
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg('Network error: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={SPRING}
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-purple-800 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Onboard Master Artisan Society</h3>
              <p className="text-xs text-white/80">Government GI Registry Direct Onboarding Desk</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[calc(85vh-100px)] overflow-y-auto text-xs">
          
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 font-bold">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Artisan / Guild Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Kashmir Pashmina Karigar Society"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Craft Discipline *</label>
              <input
                type="text"
                name="craftName"
                required
                value={formData.craftName}
                onChange={handleChange}
                placeholder="e.g. Pure Handloom Kani Shawls"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">State *</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Jammu & Kashmir">Jammu & Kashmir</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Assam">Assam</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="Odisha">Odisha</option>
                <option value="West Bengal">West Bengal</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">City / Region *</label>
              <input
                type="text"
                name="region"
                required
                value={formData.region}
                onChange={handleChange}
                placeholder="e.g. Srinagar, J&K"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">GI Tag Number *</label>
              <input
                type="text"
                name="giTagNumber"
                required
                value={formData.giTagNumber}
                onChange={handleChange}
                placeholder="e.g. GI-IN-0046"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Govt Fair Price (₹)</label>
              <input
                type="number"
                name="fairBasePrice"
                value={formData.fairBasePrice}
                onChange={handleChange}
                placeholder="3500"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Market Scam Price (₹)</label>
              <input
                type="number"
                name="typicalMarketScamPrice"
                value={formData.typicalMarketScamPrice}
                onChange={handleChange}
                placeholder="12000"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-red-600 outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Artisan Direct UPI VPA *</label>
              <input
                type="text"
                name="artisanUpiVpa"
                required
                value={formData.artisanUpiVpa}
                onChange={handleChange}
                placeholder="e.g. society@upi"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Cooperative Story / Traditional Method</label>
            <textarea
              name="artisanStory"
              rows={2}
              value={formData.artisanStory}
              onChange={handleChange}
              placeholder="Describe the craft heritage, charkha technique, or hand-weaving process..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-extrabold rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <span>Persisting to MongoDB Atlas & Cryptographic Ledger...</span>
            ) : (
              <span>✓ Onboard Cooperative to National GI Registry</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
