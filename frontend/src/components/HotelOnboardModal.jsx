import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Building, MapPin, ShieldCheck } from 'lucide-react';

const SPRING = { type: 'spring', stiffness: 360, damping: 28 };

export default function HotelOnboardModal({ isOpen, onClose, onHotelAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    city: 'Ayodhya',
    state: 'Uttar Pradesh',
    stationCode: '',
    location: '',
    phoneContact: '',
    rate2h: 299,
    rate4h: 499,
    rate6h: 750,
    rateFullDay: 2200
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

    const payload = {
      name: formData.name,
      city: formData.city,
      state: formData.state,
      stationCode: formData.stationCode,
      location: formData.location,
      phoneContact: formData.phoneContact,
      hourlyRates: {
        '2h': Number(formData.rate2h),
        '4h': Number(formData.rate4h),
        '6h': Number(formData.rate6h),
        fullDay: Number(formData.rateFullDay)
      },
      amenities: ['Air-Conditioned Day Room', 'High-Speed Wi-Fi', 'Luggage Cloakroom', 'Shower Station', 'Sugamya Accessible Ramps']
    };

    try {
      const res = await fetch('/api/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.success && data.hotel) {
        setSuccessMsg(data.message);
        if (onHotelAdded) onHotelAdded(data.hotel);
        setTimeout(() => {
          onClose();
        }, 3200);
      } else {
        setErrorMsg(data.error || 'Failed to onboard hotel partner');
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
        <div className="px-6 py-5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Building className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Partner Your Stay or Cloakroom</h3>
              <p className="text-xs text-white/80">Smart Transit Pod & Micro-Stay Onboarding</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Official Authority Notice */}
        <div className="mx-5 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-2.5 text-blue-900 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p>
            <strong>Official Verification Notice:</strong> All newly onboarded stays undergo compliance & safety review by the S.A.F.A.R. Tourism Authority Officer before going live for tourist booking.
          </p>
        </div>

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
              <label className="block font-bold text-slate-700 mb-1">Property / Pod Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Ayodhya Heritage Day Lounge"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">City *</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Ayodhya">Ayodhya</option>
                <option value="Varanasi">Varanasi</option>
                <option value="Agra">Agra</option>
                <option value="Jaipur">Jaipur</option>
                <option value="Delhi">Delhi</option>
                <option value="Guwahati">Guwahati</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nearest Station Code</label>
              <input
                type="text"
                name="stationCode"
                value={formData.stationCode}
                onChange={handleChange}
                placeholder="e.g. AY (Ayodhya Dham Jn)"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Phone *</label>
              <input
                type="text"
                name="phoneContact"
                required
                value={formData.phoneContact}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Precise Location Address *</label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. 200m from Station Gate 2, Ayodhya"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">2h Rate (₹)</label>
              <input
                type="number"
                name="rate2h"
                value={formData.rate2h}
                onChange={handleChange}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-blue-600 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">4h Rate (₹)</label>
              <input
                type="number"
                name="rate4h"
                value={formData.rate4h}
                onChange={handleChange}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-blue-600 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">6h Rate (₹)</label>
              <input
                type="number"
                name="rate6h"
                value={formData.rate6h}
                onChange={handleChange}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-blue-600 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">24h Tariff (₹)</label>
              <input
                type="number"
                name="rateFullDay"
                value={formData.rateFullDay}
                onChange={handleChange}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-700 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-extrabold rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <span>Registering Stay Partner to Live Database...</span>
            ) : (
              <span>✓ Onboard Stay / Cloakroom to S.A.F.A.R.</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
