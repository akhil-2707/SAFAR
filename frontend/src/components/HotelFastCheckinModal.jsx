import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, ShieldCheck, CheckCircle2, QrCode, Lock, Key, 
  Clock, X, Sparkles, User, FileText, Smartphone, ArrowRight,
  ShieldAlert, RefreshCw, LogOut, Check, Phone, Globe, ChevronRight
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const SPRING = { type: 'spring', stiffness: 360, damping: 28 };

export default function HotelFastCheckinModal({
  isOpen,
  onClose,
  tourist,
  preselectedHotel = null,
  allHotels = [],
  onCheckinSuccess
}) {
  const [selectedHotelId, setSelectedHotelId] = useState(preselectedHotel?.id || 'hotel_ayodhya_02');
  const [guestId, setGuestId] = useState(tourist?.touristId || 'TID-1035');
  const [stayDuration, setStayDuration] = useState(4);
  const [roomType, setRoomType] = useState('DELUXE_DAY_ROOM');

  // Multi-step checkin state
  const [step, setStep] = useState('READY'); // READY, PROCESSING, SUCCESS, REGISTER
  const [checkinStepProgress, setCheckinStepProgress] = useState(0); // 0 to 3
  const [checkinResult, setCheckinResult] = useState(null);
  const [activeStay, setActiveStay] = useState(null);
  const [loading, setLoading] = useState(false);
  const [guestRegister, setGuestRegister] = useState([]);
  const [loadingRegister, setLoadingRegister] = useState(false);

  useEffect(() => {
    if (preselectedHotel?.id) {
      setSelectedHotelId(preselectedHotel.id);
    }
  }, [preselectedHotel]);

  useEffect(() => {
    if (tourist?.touristId) {
      setGuestId(tourist.touristId);
      checkActiveStay(tourist.touristId);
    }
  }, [tourist?.touristId, isOpen]);

  const checkActiveStay = async (tid) => {
    try {
      const res = await fetch(`/api/hotels/active-checkin/${tid}`);
      const data = await res.json();
      if (data.success && data.hasActiveStay) {
        setActiveStay(data.stay);
      } else {
        setActiveStay(null);
      }
    } catch (err) {
      console.error('Active check-in check error:', err);
    }
  };

  const fetchRegister = async (hid) => {
    setLoadingRegister(true);
    try {
      const res = await fetch(`/api/hotels/guest-register/${hid || selectedHotelId}`);
      const data = await res.json();
      if (data.success) {
        setGuestRegister(data.register || []);
      }
    } catch (err) {
      console.error('Error fetching register:', err);
    } finally {
      setLoadingRegister(false);
    }
  };

  const handleStartFastCheckin = async () => {
    setLoading(true);
    setStep('PROCESSING');
    setCheckinStepProgress(1);

    // Step 1: Simulating Cryptographic Handshake (0.8s)
    await new Promise(r => setTimeout(r, 800));
    setCheckinStepProgress(2);

    // Step 2: Simulating DPDP Act 2023 Tokenization (0.8s)
    await new Promise(r => setTimeout(r, 800));
    setCheckinStepProgress(3);

    try {
      const res = await fetch('/api/hotels/fast-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelId: selectedHotelId,
          touristId: guestId,
          roomType,
          stayDurationHours: Number(stayDuration)
        })
      });

      const data = await res.json();
      if (data.success) {
        setCheckinResult(data.checkIn);
        setActiveStay(data.checkIn);
        setStep('SUCCESS');
        if (onCheckinSuccess) onCheckinSuccess(data.checkIn);
      } else {
        alert(data.error || 'Check-in failed');
        setStep('READY');
      }
    } catch (err) {
      console.error(err);
      alert('Network error during check-in');
      setStep('READY');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!activeStay) return;
    try {
      setLoading(true);
      const res = await fetch('/api/hotels/fast-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkInId: activeStay.checkInId,
          touristId: activeStay.touristId
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveStay(null);
        setCheckinResult(null);
        setStep('READY');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentHotel = allHotels.find(h => h.id === selectedHotelId) || preselectedHotel || {
    id: selectedHotelId,
    name: 'UPSTDC Hotel Sarayu (Uttar Pradesh State Tourism)',
    city: 'Ayodhya'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={SPRING}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
      >
        {/* Header Bar with Indian Tricolor Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-500" />

        <div className="p-5 sm:p-6 space-y-5">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    1-Tap Digital ID Fast Check-in
                  </h2>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    3-SEC PROTOCOL
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Zero Paper • Zero Aadhaar Photocopy • DPDP Act 2023 Compliant
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Switcher: Check-in / Live Guest Register */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 text-xs font-bold text-slate-600">
            <button
              onClick={() => setStep(checkinResult ? 'SUCCESS' : 'READY')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                step !== 'REGISTER' ? 'bg-white text-orange-600 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Tap Check-In Terminal</span>
            </button>
            <button
              onClick={() => {
                setStep('REGISTER');
                fetchRegister(selectedHotelId);
              }}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                step === 'REGISTER' ? 'bg-white text-orange-600 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Hotel Digital Guest Register</span>
            </button>
          </div>

          {/* MODE: REGISTER VIEW */}
          {step === 'REGISTER' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Police & Tourism Compliant E-Register
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {currentHotel.name} • {currentHotel.city}
                  </p>
                </div>
                <button
                  onClick={() => fetchRegister(selectedHotelId)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingRegister ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {loadingRegister ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading guest register...</div>
              ) : guestRegister.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No active check-ins for this property yet.</p>
                  <p className="text-[11px] text-slate-400">Use the 1-Tap Terminal to check in guests instantly.</p>
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {guestRegister.map((g) => (
                    <div
                      key={g.checkInId}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <strong className="text-slate-900 font-bold">{g.touristName}</strong>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
                            {g.touristId}
                          </span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            g.status === 'CHECKED_IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {g.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {g.roomNumber} ({g.roomType}) • Check-in: {new Date(g.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-[10px] text-emerald-700 font-mono font-semibold">
                          {g.tokenizedIdProof}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-400 block">{g.registerId}</span>
                        {g.status === 'CHECKED_IN' && (
                          <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg border border-orange-200 inline-block mt-1">
                            PIN: {g.digitalKeyPin}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MODE: ACTIVE STAY CARD */}
          {activeStay && step !== 'REGISTER' && step !== 'PROCESSING' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border-2 border-emerald-500/40 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      ✓ Active Hotel Stay
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                      {activeStay.hotelName}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 text-xs font-bold transition-all shadow-xs flex items-center space-x-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>1-Tap Checkout</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-3 bg-white rounded-2xl border border-emerald-100 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Room Allotted</span>
                  <span className="text-base sm:text-lg font-black text-slate-900 block font-mono">
                    {activeStay.roomNumber}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-emerald-100 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Digital Door PIN</span>
                  <span className="text-base sm:text-lg font-black text-emerald-700 block font-mono">
                    {activeStay.digitalKeyPin}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-emerald-100 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Guest Register ID</span>
                  <span className="text-xs font-mono font-bold text-slate-800 block truncate mt-1">
                    {activeStay.registerId}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-emerald-100 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Check-in Time</span>
                  <span className="text-xs font-mono font-bold text-slate-800 block mt-1">
                    {new Date(activeStay.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-emerald-100 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-700">DPDP Act 2023 Identity Seal</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  {activeStay.tokenizedIdProof}
                </span>
              </div>
            </motion.div>
          )}

          {/* MODE: PROCESSING ANIMATION (3 SECONDS) */}
          {step === 'PROCESSING' && (
            <div className="py-8 space-y-6 text-center">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-orange-500/20 animate-ping" />
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">
                  Executing 3-Second Fast Check-In...
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {checkinStepProgress === 1 && '1/3: Reading S.A.F.A.R. Prototype Blockchain Digital ID...'}
                  {checkinStepProgress === 2 && '2/3: Applying DPDP Act 2023 Tokenization (Zero Paper / Zero Aadhaar Photocopy)...'}
                  {checkinStepProgress === 3 && '3/3: Auto-filling Police Guest Register & Allotting Smart Room Key...'}
                </p>
              </div>

              {/* Step checklist */}
              <div className="max-w-md mx-auto space-y-2 text-left text-xs">
                <div className={`p-2.5 rounded-xl border flex items-center space-x-2.5 ${
                  checkinStepProgress >= 1 ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}>
                  <CheckCircle2 className={`w-4 h-4 ${checkinStepProgress >= 1 ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>Digital ID Cryptographic Signature Authenticated</span>
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center space-x-2.5 ${
                  checkinStepProgress >= 2 ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}>
                  <CheckCircle2 className={`w-4 h-4 ${checkinStepProgress >= 2 ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>DPDP Act 2023 Zero-Photocopy Tokenization Seal Generated</span>
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center space-x-2.5 ${
                  checkinStepProgress >= 3 ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}>
                  <CheckCircle2 className={`w-4 h-4 ${checkinStepProgress >= 3 ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>Hotel Digital E-Register Logged & Room Key Issued</span>
                </div>
              </div>
            </div>
          )}

          {/* MODE: READY (CHECK-IN FORM / KIOSK) */}
          {step === 'READY' && !activeStay && (
            <div className="space-y-4">
              {/* Hotel Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-orange-500" />
                  <span>Select Hotel / Retiring Facility Desk</span>
                </label>
                <select
                  value={selectedHotelId}
                  onChange={(e) => setSelectedHotelId(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                >
                  {allHotels.length > 0 ? (
                    allHotels.map(h => (
                      <option key={h.id} value={h.id}>
                        🏨 {h.name} ({h.city})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="hotel_ayodhya_02">🏨 UPSTDC Hotel Sarayu (Ayodhya)</option>
                      <option value="hotel_ayodhya_01">🏨 IRCTC Executive Retiring Pods (Ayodhya Dham)</option>
                      <option value="hotel_varanasi_01">🏨 IRCTC Executive Lounge (Varanasi Cantt)</option>
                      <option value="hotel_agra_01">🏨 Agra Cantt Railway Pod Hotel (Agra)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Tourist Digital ID Card / QR Preview */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-orange-50/40 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-16 h-16 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                    <QRCodeSVG
                      value={`SAFAR_HOTEL_CHECKIN:${guestId}:${selectedHotelId}`}
                      size={54}
                      level="M"
                    />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-black text-slate-900">
                        {tourist?.fullName || 'Verified Guest (Ananya Mishra)'}
                      </h4>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        {guestId}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Verified Nationality: <strong className="text-slate-700">{tourist?.nationality || 'Indian'}</strong> • Proof: <strong className="text-slate-700">{tourist?.idProofType || 'Aadhaar Verified'}</strong>
                    </p>
                    <p className="text-[10px] text-emerald-700 font-bold mt-1 flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Zero Paper: Raw Aadhaar copy will NOT be shared or printed</span>
                    </p>
                  </div>
                </div>

                <div className="text-center sm:text-right shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 block">Est. Check-in Time</span>
                  <span className="text-lg font-black text-emerald-600 font-mono block">~3 Seconds</span>
                  <span className="text-[10px] text-slate-400">vs 15m physical line</span>
                </div>
              </div>

              {/* Room & Duration options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Room Category</label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none"
                  >
                    <option value="DELUXE_DAY_ROOM">AC Deluxe Day-Room / Suite</option>
                    <option value="AC_SLEEP_POD">IRCTC Capsule / Sleep Pod</option>
                    <option value="EXECUTIVE_TRANSIT_ROOM">Executive Transit Room</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Stay Duration</label>
                  <select
                    value={stayDuration}
                    onChange={(e) => setStayDuration(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none"
                  >
                    <option value={2}>2 Hours (Quick Refresh & Shower)</option>
                    <option value={4}>4 Hours (Standard Day-Stay)</option>
                    <option value={6}>6 Hours (Extended Rest)</option>
                    <option value={24}>24 Hours (Full Overnight Stay)</option>
                  </select>
                </div>
              </div>

              {/* DPDP Act 2023 Callout */}
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>DPDP Act 2023 Compliant Check-In:</strong> Hotel desk receives instant cryptographic verification token. No physical paper photocopy, no unencrypted document storage. All guest logs are auto-synced with the local tourism police digital directory.
                </p>
              </div>

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={SPRING}
                onClick={handleStartFastCheckin}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Verify & 1-Tap Check-In (3 Seconds)</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          )}

          {/* MODE: SUCCESS CARD */}
          {step === 'SUCCESS' && checkinResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                        Check-in Confirmed in 2.8s
                      </span>
                      <h3 className="text-base font-black mt-0.5">{checkinResult.hotelName}</h3>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold bg-white text-emerald-800 px-2.5 py-1 rounded-xl">
                    {checkinResult.checkInId}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                    <span className="text-[10px] font-bold text-white/80 uppercase block">Allotted Room</span>
                    <span className="text-2xl font-black block font-mono mt-0.5">
                      {checkinResult.roomNumber}
                    </span>
                  </div>

                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                    <span className="text-[10px] font-bold text-white/80 uppercase block">Digital Door PIN</span>
                    <span className="text-2xl font-black block font-mono mt-0.5 text-amber-300">
                      {checkinResult.digitalKeyPin}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-white/90 space-y-1 border-t border-white/20 pt-3">
                  <div className="flex items-center justify-between">
                    <span>Guest: <strong>{checkinResult.touristName}</strong> ({checkinResult.touristId})</span>
                    <span className="font-mono text-[10px]">{checkinResult.registerId}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-white/80">
                    <span>Nationality: {checkinResult.nationality}</span>
                    <span>Zero Photocopy: <strong>DPDP 2023 Verified</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setStep('REGISTER');
                    fetchRegister(selectedHotelId);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                >
                  View Digital Guest Register
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors shadow-md"
                >
                  Done (Room Key Active)
                </button>
              </div>
            </motion.div>
          )}

          {/* Footer note */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>S.A.F.A.R. Hotels Boost Protocol • SIH 2026</span>
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>100% Paperless Front Desk</span>
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
