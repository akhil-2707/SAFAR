import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, CheckCircle2, ShieldCheck, ArrowRight, RefreshCw, 
  Sparkles, Trophy, Leaf, Clock, AlertCircle, Heart, Globe, X
} from 'lucide-react';

const SPRING = { type: 'spring', stiffness: 380, damping: 28 };

const PRESET_FARES = [50, 100, 200, 600];

const VEHICLE_TYPES = [
  { id: 'E-Rickshaw', label: 'E-Rickshaw', icon: '🛺', desc: 'Zero-emission city shuttle' },
  { id: 'E-Auto', label: 'E-Auto', icon: '🛺', desc: 'Electric 3-wheeler auto' },
  { id: 'Electric Cab', label: 'Electric Cab', icon: '⚡', desc: 'EV sedan or hatchback' },
  { id: 'Electric Bus', label: 'Electric Bus', icon: '🚌', desc: 'Green public transit' }
];

export default function EVehicleTransitSection({ touristId = 'TID-1035', onCoinsUpdated }) {
  const navigate = useNavigate();
  const [fareAmount, setFareAmount] = useState(600);
  const [selectedVehicleType, setSelectedVehicleType] = useState('E-Rickshaw');
  const [driverName, setDriverName] = useState('Verified E-Vehicle Pilot');

  // Backend Stats & Config
  const [stats, setStats] = useState({
    thisWeekTrips: 0,
    thisWeekCoins: 0,
    weeklyMilestoneTarget: 10,
    weeklyMilestoneBonus: 2,
    weeklyBonusUnlocked: false,
    remainingForBonus: 10,
    baseRewardCoins: 3,
    recentPayments: []
  });

  const [loadingStats, setLoadingStats] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);
  const [milestoneToast, setMilestoneToast] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Fetch stats on mount and after payments
  useEffect(() => {
    fetchStats();
  }, [touristId]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await fetch(`/api/rewards/e-vehicle/stats/${touristId}`);
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.warn('Failed to load e-vehicle stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Process fare payment - Navigates directly to dedicated SAFAR Payment Gateway
  const handlePayFare = () => {
    const numFare = Number(fareAmount);
    if (!numFare || numFare <= 0) {
      setErrorMessage('Please enter a valid journey fare.');
      return;
    }

    setErrorMessage(null);
    navigate(`/partner-pay?amount=${numFare}&category=e-vehicle&vehicleType=${encodeURIComponent(selectedVehicleType)}`);
  };

  const tripsCount = stats.thisWeekTrips;
  const target = stats.weeklyMilestoneTarget || 10;
  const progressPercent = Math.min(100, Math.round((tripsCount / target) * 100));
  const isTargetAchieved = tripsCount >= target || stats.weeklyBonusUnlocked;

  return (
    <div className="space-y-6" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      {/* SECTION 1: HEADER & MOTTO */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-Emission Mobility Hub</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center space-x-2">
              <span>E-Vehicles</span>
              <span className="text-emerald-400">⚡🌱</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 italic">
              « Travel green. Earn Green Coins. »
            </p>
          </div>

          {/* This Week Stats Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex items-center space-x-5 shrink-0 shadow-lg">
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-emerald-300 block">This Week</span>
              <span className="text-2xl font-black text-white font-mono">{tripsCount} Trips</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-emerald-300 block">Earned</span>
              <span className="text-2xl font-black text-emerald-300 font-mono">+{stats.thisWeekCoins} Coins</span>
            </div>
          </div>
        </div>

        {/* Weekly Progress Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 relative z-10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-slate-200 flex items-center space-x-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Weekly Sustainability Milestone:</span>
            </span>
            <span className="font-mono font-black text-emerald-300">
              {tripsCount} / {target} trips
            </span>
          </div>

          {/* Progress track */}
          <div className="w-full h-3.5 rounded-full bg-white/10 p-0.5 border border-white/15 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_12px_rgba(52,211,153,0.6)]"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-300">
            {isTargetAchieved ? (
              <span className="font-black text-emerald-300 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Weekly Bonus Unlocked ✓ (+{stats.weeklyMilestoneBonus || 2} Green Coins Credited)</span>
              </span>
            ) : (
              <span>
                <strong>{stats.remainingForBonus} more E-Vehicle trips</strong> to unlock your weekly <strong>+{stats.weeklyMilestoneBonus || 2} Green Coins</strong> bonus!
              </span>
            )}
            <span className="text-[10px] text-slate-400 font-mono">Mon – Sun Window</span>
          </div>
        </div>
      </div>

      {/* ERROR ALERT */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* SECTION 2: CLEAN PAYMENT CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">E-Vehicle Fare Settlement</h3>
              <p className="text-xs text-slate-500">Pay the driver's exact fare & earn sustainability rewards</p>
            </div>
          </div>
          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            +{stats.baseRewardCoins || 3} Coins / Trip
          </span>
        </div>

        {/* Vehicle Selection Chips */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-2">Select Vehicle Mode</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {VEHICLE_TYPES.map((v) => {
              const isSelected = selectedVehicleType === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVehicleType(v.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-400'
                      : 'border-slate-200 bg-slate-50 hover:bg-white'
                  }`}
                >
                  <span className="text-xl">{v.icon}</span>
                  <div className="mt-2">
                    <span className="font-black text-xs text-slate-900 block">{v.label}</span>
                    <span className="text-[10px] text-slate-500 block leading-tight">{v.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Driver's Actual Fare Input with Presets */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700">
              Driver's Exact Fare (₹)
            </label>
            <div className="flex items-center space-x-1.5">
              {PRESET_FARES.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setFareAmount(preset)}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                >
                  ₹{preset}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <span className="absolute left-4 top-3.5 text-base font-black text-slate-400">₹</span>
            <input
              type="number"
              min={1}
              required
              value={fareAmount}
              onChange={(e) => setFareAmount(Math.max(1, Number(e.target.value)))}
              placeholder="e.g., 600"
              className="w-full pl-9 pr-4 py-3.5 rounded-2xl border border-slate-300 font-mono text-xl font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            />
          </div>
        </div>

        {/* IMPORTANT NOTICE: FARE IS NOT DISCOUNTED */}
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start space-x-3">
          <Leaf className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-950 space-y-1">
            <div className="flex items-center justify-between">
              <strong className="text-emerald-900">🌱 Green Coins Reward:</strong>
              <span className="font-mono font-black text-emerald-700 text-sm">+{stats.baseRewardCoins || 3} Coins after payment</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              The driver receives the full <strong>₹{fareAmount}</strong> actual fare. Green Coins are awarded directly to your SAFAR Green Wallet as an eco-incentive!
            </p>
          </div>
        </div>

        {/* PRIMARY PAYMENT BUTTON */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={SPRING}
          type="button"
          onClick={handlePayFare}
          disabled={!fareAmount || fareAmount <= 0}
          className="w-full py-4 rounded-2xl font-black text-base text-white shadow-xl flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            boxShadow: '0 8px 30px rgba(16, 185, 129, 0.35)'
          }}
        >
          <Zap className="w-5 h-5" />
          <span>Pay ₹{Number(fareAmount).toLocaleString()} via SAFAR Gateway</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>

      {/* SECTION 3: RECENT PAYMENT CONFIRMATION RECEIPT */}
      <AnimatePresence>
        {lastReceipt && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="p-5 sm:p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-300 shadow-md relative space-y-3 text-emerald-950"
          >
            <button
              onClick={() => setLastReceipt(null)}
              className="absolute top-4 right-4 text-emerald-700 hover:text-emerald-900 p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-base text-emerald-900">Payment Successful ✓</h4>
                <p className="text-xs text-emerald-700">Settled through SAFAR Green Transit Network</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 flex items-center justify-between font-mono text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Fare Paid</span>
                <span className="text-lg font-black text-slate-900">₹{lastReceipt.amountPaid} paid</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px] uppercase">Reward Credited</span>
                <span className="text-lg font-black text-emerald-700">+{lastReceipt.totalCoinsEarned || lastReceipt.baseCoins} 🌱</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 4: RECENT E-VEHICLE PAYMENTS HISTORY */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-black text-slate-900">Recent E-Vehicle Payments</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400">Auto-rewarded on payment</span>
        </div>

        {stats.recentPayments && stats.recentPayments.length > 0 ? (
          <div className="space-y-2.5">
            {stats.recentPayments.map((tx) => (
              <div
                key={tx.id || tx.paymentId}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm">
                    ⚡
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 block">
                      E-Vehicle Trip ({tx.vehicleType || 'E-Rickshaw'})
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(tx.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                      })}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-slate-900 block font-mono">
                    ₹{tx.amountPaid || tx.fareAmount} paid
                  </span>
                  <span className="text-xs font-black text-emerald-700 inline-flex items-center space-x-0.5">
                    <span>+{tx.coinsAwarded || 3}</span>
                    <span>🌱</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 space-y-2">
            <Zap className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-medium">No E-Vehicle payments yet this week.</p>
            <p className="text-[11px] text-slate-400">Pay your first e-rickshaw or electric cab fare above to earn Green Coins!</p>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SECTION 5: SMALL, ELEGANT THANK-YOU TOAST (10-TRIP MILESTONE) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {milestoneToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-6 right-4 sm:right-8 z-50 max-w-sm w-full bg-slate-950 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-start space-x-3.5 backdrop-blur-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
              <Sparkles className="w-5 h-5 text-emerald-300 animate-pulse" />
            </div>

            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-emerald-300 uppercase tracking-wide">
                  🌱 {milestoneToast.title}
                </span>
                <button
                  onClick={() => setMilestoneToast(null)}
                  className="text-slate-400 hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs font-bold text-white">
                You've completed {milestoneToast.trips} E-Vehicle trips this week.
              </p>

              <div className="inline-block font-mono font-black text-xs text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30 my-0.5">
                +{milestoneToast.bonusCoins} Green Coins Credited
              </div>

              <p className="text-[11px] text-slate-300 leading-snug pt-0.5">
                {milestoneToast.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
