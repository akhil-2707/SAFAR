import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Clock, ShieldCheck, Ticket, Sparkles, Building2, Utensils, 
  Award, Zap, ArrowRight, CheckCircle2, QrCode, AlertCircle, 
  MapPin, Bell, Compass, RefreshCw, Smartphone, ExternalLink,
  ChevronRight, Lock, UserCheck, Flame, Info
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SPRING = { type: 'spring', stiffness: 360, damping: 28 };

export default function VirtualQueuePage({ tourist }) {
  const [circuits, setCircuits] = useState([]);
  const [selectedCircuitId, setSelectedCircuitId] = useState('AYODHYA_RAM_MANDIR');
  const [activePass, setActivePass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [partySize, setPartySize] = useState(2);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [redeemedVouchers, setRedeemedVouchers] = useState({});
  const [isTurnstilePassed, setIsTurnstilePassed] = useState(false);
  const [showRecallAlert, setShowRecallAlert] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(3 * 3600 + 28 * 60 + 45); // 3h 28m 45s

  useEffect(() => {
    fetchCircuits();
    fetchActivePass();
  }, [tourist?.touristId]);

  // Live countdown timer for safe free time
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSec) => {
    const hours = Math.floor(totalSec / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSec % 60).toString().padStart(2, '0');
    return { hours, minutes, seconds };
  };

  const fetchCircuits = async () => {
    try {
      const res = await fetch('/api/vq/circuits');
      const data = await res.json();
      if (data.success && data.circuits) {
        setCircuits(data.circuits);
      }
    } catch (e) {
      console.error('Failed to load VQ circuits', e);
    }
  };

  const fetchActivePass = async () => {
    try {
      setLoading(true);
      const tid = tourist?.touristId || 'TID-1024';
      const res = await fetch(`/api/vq/active-pass/${tid}`);
      const data = await res.json();
      if (data.success && data.pass) {
        setActivePass(data.pass);
        setSelectedCircuitId(data.pass.circuitId || 'AYODHYA_RAM_MANDIR');
      }
    } catch (e) {
      console.error('Failed to load active pass', e);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNewSlot = async (circuitId) => {
    try {
      setLoading(true);
      const tid = tourist?.touristId || 'TID-1024';
      const name = tourist?.fullName || 'Verified S.A.F.A.R. Pilgrim';
      const res = await fetch('/api/vq/book-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          touristId: tid,
          touristName: name,
          circuitId,
          partySize
        })
      });
      const data = await res.json();
      if (data.success && data.pass) {
        setActivePass(data.pass);
        setSelectedCircuitId(circuitId);
        setIsTurnstilePassed(false);
        setShowRecallAlert(false);
        setCountdownSeconds(3 * 3600 + 29 * 60);
      }
    } catch (e) {
      console.error('Booking failed', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemVoucher = async (voucher) => {
    try {
      await fetch('/api/vq/redeem-voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          touristId: tourist?.touristId || 'TID-1024',
          voucherId: voucher.id,
          category: voucher.category
        })
      });
      setRedeemedVouchers(prev => ({ ...prev, [voucher.id]: true }));
      setSelectedVoucher({ ...voucher, status: 'REDEEMED' });
    } catch (e) {
      console.error('Redeem failed', e);
    }
  };

  const handleVerifyTurnstile = async () => {
    try {
      const res = await fetch('/api/vq/verify-turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          touristId: tourist?.touristId || 'TID-1024',
          passId: activePass?.passId,
          gate: activePass?.gate
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsTurnstilePassed(true);
      }
    } catch (e) {
      console.error('Turnstile failed', e);
    }
  };

  const currentCircuit = circuits.find(c => c.id === selectedCircuitId) || circuits[0];
  const { hours, minutes, seconds } = formatCountdown(countdownSeconds);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
      
      {/* ── HEADER BANNER ── */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-purple-800/40">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-purple-500/30 text-purple-300 border border-purple-400/30">
                S.A.F.A.R. VQ-Commerce Protocol
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Crowd-Dispersal Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Virtual Queue & Micro-Economy Time Vouchers
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed">
              Don’t stand 6 hours trapped in metal barricades. Get an instant cryptographic VIP entry window and spend your <strong>3.5 hours of safe free time</strong> enjoying discounted hotel micro-stays, certified satvik food, and local heritage crafts.
            </p>
          </div>

          {/* Quick Problem-Solver Metric Pill */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shrink-0 space-y-2 text-center md:text-left">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>The 6-Hour Black Hole Solution</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              4.5h Wait ➔ <span className="text-emerald-400">0s Queue</span>
            </div>
            <p className="text-[11px] text-purple-200/70">
              Fast-Track Express Turnstile Entry at Gate #3
            </p>
          </div>
        </div>
      </div>

      {/* ── PILGRIMAGE & HERITAGE CIRCUIT SELECTOR ── */}
      <div className="space-y-2.5">
        <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
          Select Pilgrimage Corridor / Heritage Monument
        </label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { id: 'AYODHYA_RAM_MANDIR', label: '🛕 Ayodhya Ram Mandir', state: 'Uttar Pradesh' },
            { id: 'VARANASI_KASHI', label: '🔱 Kashi Vishwanath', state: 'Varanasi, UP' },
            { id: 'KATRA_VAISHNO_DEVI', label: '🏔️ Vaishno Devi Bhawan', state: 'Katra, J&K' },
            { id: 'AGRA_TAJ_MAHAL', label: '🕌 Taj Mahal Heritage', state: 'Agra, UP' }
          ].map((c) => {
            const isSelected = selectedCircuitId === c.id;
            return (
              <motion.button
                key={c.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={SPRING}
                onClick={() => handleBookNewSlot(c.id)}
                className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer shadow-xs ${
                  isSelected
                    ? 'bg-purple-900 text-white border-purple-700 shadow-md ring-2 ring-purple-500/30'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-purple-300'
                }`}
              >
                <span className="text-xs sm:text-sm font-black block truncate">{c.label}</span>
                <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-purple-300' : 'text-slate-400'}`}>
                  {c.state}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── 2-COLUMN MAIN LAYOUT: LEFT = VIP ENTRY PASS, RIGHT = 4 VOUCHERS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ── LEFT COLUMN (5 COLS): VIP TICKET & COUNTDOWN ── */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          
          {/* Main Virtual Queue VIP Card */}
          <div className="rounded-3xl bg-white border border-purple-200 shadow-xl p-5 sm:p-6 space-y-5 relative overflow-hidden">
            {/* Header Ticket Pattern */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shadow-xs">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-purple-900 block">
                    {activePass?.batchNumber || 'Batch #04'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Cryptographic Turnstile Token
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-black">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>CONFIRMED</span>
              </div>
            </div>

            {/* Monument Name & Assigned Gate */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Destination</span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                {activePass?.circuitName || currentCircuit?.name}
              </h2>
              <p className="text-xs font-bold text-purple-800 flex items-center gap-1 pt-1">
                <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>{activePass?.gate || currentCircuit?.gate}</span>
              </p>
            </div>

            {/* Live Safe Free-Time Countdown Box */}
            <div className="rounded-2xl p-4 bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100/60 border border-purple-200 text-center space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-900 block">
                ⏳ Safe Free-Time Remaining Before Entry
              </span>
              <div className="flex items-center justify-center gap-2 font-mono font-black text-2xl sm:text-3xl text-purple-950">
                <div className="bg-white px-3 py-1.5 rounded-xl border border-purple-200 shadow-xs">
                  {hours}<span className="text-[10px] text-slate-400 font-sans block">HRS</span>
                </div>
                <span>:</span>
                <div className="bg-white px-3 py-1.5 rounded-xl border border-purple-200 shadow-xs">
                  {minutes}<span className="text-[10px] text-slate-400 font-sans block">MIN</span>
                </div>
                <span>:</span>
                <div className="bg-white px-3 py-1.5 rounded-xl border border-purple-200 shadow-xs">
                  {seconds}<span className="text-[10px] text-slate-400 font-sans block">SEC</span>
                </div>
              </div>
              <p className="text-[11px] text-purple-800 font-semibold">
                Your VIP Entry Window: <strong>{activePass?.formattedSlot || '04:30 PM – 05:00 PM'}</strong>
              </p>
            </div>

            {/* Express Turnstile QR Code */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center space-y-2.5 text-center">
              <div className="p-2.5 bg-white rounded-xl shadow-xs border border-slate-200">
                <QRCodeSVG
                  value={activePass?.turnstileQrPayload || 'SAFAR_VQ_ENTRY:PASS_DEMO'}
                  size={120}
                  level="H"
                />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 block">
                  Scan at Gate Turnstile Reader
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  SHA-256: {activePass?.tokenHash?.substring(0, 16) || 'a89c45b8e91d3f2c'}...
                </span>
              </div>
            </div>

            {/* Turnstile Pass Status / Simulator Trigger */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              {isTurnstilePassed ? (
                <div className="p-3 bg-emerald-500 text-white rounded-2xl text-center space-y-1 shadow-md">
                  <div className="flex items-center justify-center gap-1.5 text-sm font-black">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>✓ EXPRESS GATE #3 CLEARED!</span>
                  </div>
                  <p className="text-[11px] text-emerald-100">
                    Turnstile unlocked in 1.8s. Welcome to your holy darshan!
                  </p>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={SPRING}
                  onClick={handleVerifyTurnstile}
                  className="w-full py-3 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 hover:from-purple-800 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Simulate Fast-Track Turnstile Scan</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              )}

              {/* Haptic GPS Recall Simulator Button */}
              <button
                type="button"
                onClick={() => setShowRecallAlert(!showRecallAlert)}
                className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Bell className="w-3.5 h-3.5 text-amber-600" />
                <span>{showRecallAlert ? 'Hide Simulated GPS Alert' : 'Simulate T-15 Mins Recall Notification'}</span>
              </button>
            </div>
          </div>

          {/* Simulated Haptic Push Recall Alert */}
          <AnimatePresence>
            {showRecallAlert && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 rounded-2xl bg-amber-500 text-white shadow-xl space-y-2 border-2 border-amber-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide">
                    <Bell className="w-4 h-4 animate-bounce text-white" />
                    <span>🚨 HAPTIC SMART RECALL ALERT (T - 15 MINS)</span>
                  </div>
                  <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-full">NOW</span>
                </div>
                <p className="text-xs text-amber-50 leading-relaxed font-medium">
                  <strong>Batch #04 Call:</strong> Your VIP window opens in 15 minutes! Please wrap up your micro-stay or craft demo and proceed directly to <strong>{activePass?.gate || 'Dedicated Gate #3'}</strong> for express entry.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Old Way vs VQ-Commerce Engine Comparison Card */}
          <div className="rounded-2xl p-4 bg-slate-900 text-slate-200 text-xs space-y-3 border border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
              Economic Impact Matrix
            </span>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-start gap-2">
                <span className="text-red-400 font-bold shrink-0">❌ Old Physical Line:</span>
                <span className="text-slate-400">4.5 hours in steel barricades · ₹0 spent on city · Dehydration & stampede risk.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">🚀 S.A.F.A.R. VQ-Engine:</span>
                <span className="text-slate-300">0s line wait · 3.5h safe free time · ₹840 saved on hotel & food vouchers · 40% hotel occupancy boost.</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (7 COLS): THE 4 MICRO-ECONOMY TIME-VOUCHERS ── */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-5">
          
          <div className="flex items-center justify-between pb-1">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Time-Banked Micro-Economy Vouchers</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                  4 Active Passes
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                While your queue slot approaches, spend your free time supporting certified local partners within 1.5 km.
              </p>
            </div>
          </div>

          {/* ── VOUCHER 1: 2-HOUR HOTEL MICRO-STAY ── */}
          {activePass?.vouchers?.find(v => v.category === 'HOTEL_MICRO_STAY') && (() => {
            const v = activePass.vouchers.find(v => v.category === 'HOTEL_MICRO_STAY');
            const isRedeemed = redeemedVouchers[v.id] || v.status === 'REDEEMED';
            return (
              <motion.div
                variants={SPRING}
                className="rounded-3xl p-5 bg-white border border-purple-200 shadow-sm hover:shadow-md transition-all space-y-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-900">
                          🏨 Pillar 1: Hotels Boost
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">11 AM – 3 PM Window</span>
                      </div>
                      <h4 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">{v.title}</h4>
                      <p className="text-xs text-slate-500">{v.partnerName}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-purple-950">₹{v.offerRate}</div>
                    <span className="text-[10px] text-slate-400 line-through">₹{v.originalRate}</span>
                    <span className="text-[10px] font-black text-emerald-600 block">47% OFF</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {v.amenities?.map((am, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium">
                      ✓ {am}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-purple-800 font-bold bg-purple-50 px-2 py-1 rounded-lg">
                    {v.badge}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <Link
                      to="/hotels"
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-purple-700 border border-slate-200 hover:bg-slate-50 transition"
                    >
                      View Stays
                    </Link>
                    <button
                      onClick={() => { setSelectedVoucher(v); setShowVoucherModal(true); }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                        isRedeemed 
                          ? 'bg-emerald-600 text-white'
                          : 'bg-purple-700 hover:bg-purple-800 text-white'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{isRedeemed ? 'Voucher Claimed ✓' : 'Claim Hotel Pass'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* ── VOUCHER 2: SWACHH FOOD HERITAGE MEAL ── */}
          {activePass?.vouchers?.find(v => v.category === 'SWACHH_FOOD') && (() => {
            const v = activePass.vouchers.find(v => v.category === 'SWACHH_FOOD');
            const isRedeemed = redeemedVouchers[v.id] || v.status === 'REDEEMED';
            return (
              <motion.div
                variants={SPRING}
                className="rounded-3xl p-5 bg-white border border-orange-200 shadow-sm hover:shadow-md transition-all space-y-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center font-bold shrink-0">
                      <Utensils className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-orange-100 text-orange-900">
                          🍲 Pillar 2: Swachh Swaad Food
                        </span>
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {v.hygieneScore}/100 Hygiene Score
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">{v.title}</h4>
                      <p className="text-xs text-slate-500">{v.partnerName}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-orange-900">₹{v.offerRate}</div>
                    <span className="text-[10px] text-slate-400 line-through">₹{v.originalRate}</span>
                    <span className="text-[10px] font-black text-emerald-600 block">{v.discountPercent}% OFF</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {v.amenities?.map((am, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-xl bg-orange-50/50 border border-orange-100 text-slate-700 font-medium">
                      ✓ {am}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-orange-800 font-bold bg-orange-50 px-2 py-1 rounded-lg">
                    {v.badge}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <Link
                      to="/swachh-food"
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-orange-700 border border-slate-200 hover:bg-slate-50 transition"
                    >
                      Explore Menu
                    </Link>
                    <button
                      onClick={() => { setSelectedVoucher(v); setShowVoucherModal(true); }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                        isRedeemed 
                          ? 'bg-emerald-600 text-white'
                          : 'bg-orange-600 hover:bg-orange-700 text-white'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{isRedeemed ? 'Coupon Applied ✓' : 'Redeem Food Voucher'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* ── VOUCHER 3: GI ARTISAN HERITAGE TRAIL ── */}
          {activePass?.vouchers?.find(v => v.category === 'GI_ARTISAN') && (() => {
            const v = activePass.vouchers.find(v => v.category === 'GI_ARTISAN');
            const isRedeemed = redeemedVouchers[v.id] || v.status === 'REDEEMED';
            return (
              <motion.div
                variants={SPRING}
                className="rounded-3xl p-5 bg-white border border-amber-200 shadow-sm hover:shadow-md transition-all space-y-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                          🏺 Pillar 3: GI Artisans Boost
                        </span>
                        <span className="text-[10px] text-amber-700 font-bold">Zero Middleman</span>
                      </div>
                      <h4 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">{v.title}</h4>
                      <p className="text-xs text-slate-500">{v.partnerName}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-1 rounded-lg">
                      FREE ENTRY
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {v.amenities?.map((am, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-xl bg-amber-50/50 border border-amber-100 text-slate-700 font-medium">
                      ✓ {am}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-1 rounded-lg">
                    {v.badge}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <Link
                      to="/artisans"
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-amber-700 border border-slate-200 hover:bg-slate-50 transition"
                    >
                      Artisans Guild
                    </Link>
                    <button
                      onClick={() => { setSelectedVoucher(v); setShowVoucherModal(true); }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                        isRedeemed 
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-700 hover:bg-amber-800 text-white'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{isRedeemed ? 'Pass Active ✓' : 'Get Artisan Trail Pass'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* ── VOUCHER 4: FIXED-TARIFF ECO EV SHUTTLE ── */}
          {activePass?.vouchers?.find(v => v.category === 'ECO_TRANSIT') && (() => {
            const v = activePass.vouchers.find(v => v.category === 'ECO_TRANSIT');
            const isRedeemed = redeemedVouchers[v.id] || v.status === 'REDEEMED';
            return (
              <motion.div
                variants={SPRING}
                className="rounded-3xl p-5 bg-white border border-emerald-200 shadow-sm hover:shadow-md transition-all space-y-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                          🛺 Pillar 4: Anti-Scam Travel
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold">Govt Tariff</span>
                      </div>
                      <h4 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">{v.title}</h4>
                      <p className="text-xs text-slate-500">{v.partnerName}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-emerald-900">₹{v.offerRate} Flat</div>
                    <span className="text-[10px] text-slate-400 line-through">₹{v.originalRate}</span>
                    <span className="text-[10px] font-black text-emerald-600 block">{v.discountPercent}% SAVED</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {v.amenities?.map((am, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-xl bg-emerald-50/50 border border-emerald-100 text-slate-700 font-medium">
                      ✓ {am}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                    {v.badge}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <Link
                      to="/fares"
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-emerald-700 border border-slate-200 hover:bg-slate-50 transition"
                    >
                      Compare Fares
                    </Link>
                    <button
                      onClick={() => { setSelectedVoucher(v); setShowVoucherModal(true); }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                        isRedeemed 
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{isRedeemed ? 'Driver Token Shown ✓' : 'Show Shuttle Token'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })()}

        </div>
      </div>

      {/* ── MODAL: 1-TAP QR REDEMPTION MODAL ── */}
      <AnimatePresence>
        {showVoucherModal && selectedVoucher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-purple-200 space-y-4 text-center relative"
            >
              <button
                onClick={() => setShowVoucherModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 inline-block">
                  S.A.F.A.R. Authenticated Voucher
                </span>
                <h3 className="text-lg font-black text-slate-900">{selectedVoucher.title}</h3>
                <p className="text-xs text-slate-500">{selectedVoucher.partnerName}</p>
              </div>

              {/* QR Code Container */}
              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200 flex flex-col items-center justify-center space-y-2">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
                  <QRCodeSVG
                    value={selectedVoucher.redeemQr || 'SAFAR_VOUCHER_DEMO'}
                    size={140}
                    level="H"
                  />
                </div>
                <span className="font-mono font-black text-xs text-purple-900 tracking-wider">
                  VOUCHER: {selectedVoucher.voucherCode}
                </span>
                <span className="text-[10px] text-slate-400">
                  Present this QR at certified partner counter or auto-rickshaw
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold space-y-1">
                <div className="flex items-center justify-between">
                  <span>Special Fixed Tariff:</span>
                  <span className="font-black text-sm text-emerald-800">
                    {selectedVoucher.offerRate > 0 ? `₹${selectedVoucher.offerRate}` : 'COMPLIMENTARY PASS'}
                  </span>
                </div>
                <p className="text-[10px] text-emerald-700 text-left">
                  Valid strictly within your 3.5-hour free time window prior to Express Gate #3 entry.
                </p>
              </div>

              <button
                onClick={() => {
                  handleRedeemVoucher(selectedVoucher);
                  setShowVoucherModal(false);
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition"
              >
                Mark as Redeemed & Proceed
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
