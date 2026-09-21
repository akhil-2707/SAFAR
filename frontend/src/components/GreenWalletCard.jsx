import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Coins, Sparkles, ArrowRight, ShieldCheck, Leaf, 
  Car, Building2, Utensils, Coffee, CreditCard, ChevronRight, Info, Camera
} from 'lucide-react';

const SPRING = { type: 'spring', stiffness: 360, damping: 26 };

export default function GreenWalletCard({ tourist, onRefreshTrigger }) {
  const [wallet, setWallet] = useState({
    totalCoins: 27,
    earnedFrom: {
      ecoTravel: 15,
      partnerHotels: 7,
      restaurants: 3,
      cafes: 2,
      touristPlaces: 0
    },
    availableDiscountTier: 5,
    maximumPossible: 40
  });
  const [loading, setLoading] = useState(false);

  const activeTid = tourist?.touristId || 'TID-1035';

  useEffect(() => {
    fetchWallet();
  }, [activeTid, onRefreshTrigger]);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/rewards/wallet/${activeTid}`);
      const data = await res.json();
      if (data.success && data.wallet) {
        setWallet(data.wallet);
      }
    } catch (err) {
      console.error('Fetch Wallet Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const { totalCoins, earnedFrom, availableDiscountTier } = wallet;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={SPRING}
      className="apple-card p-4 sm:p-5 rounded-3xl relative overflow-hidden shadow-lg border"
      style={{
        background: 'linear-gradient(135deg, rgba(240, 253, 244, 0.95) 0%, rgba(255, 255, 255, 0.98) 55%, rgba(240, 250, 255, 0.95) 100%)',
        borderColor: 'rgba(52, 199, 89, 0.28)',
        boxShadow: '0 10px 30px rgba(52, 199, 89, 0.12)'
      }}
    >
      {/* Decorative emerald aura */}
      <div 
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: 'rgba(52, 199, 89, 0.18)', filter: 'blur(35px)' }}
      />
      <div 
        className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full pointer-events-none"
        style={{ background: 'rgba(10, 132, 255, 0.12)', filter: 'blur(30px)' }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between pb-3 border-b border-emerald-100">
        <div className="flex items-center space-x-2.5">
          <div 
            className="w-9 h-9 rounded-2xl flex items-center justify-center text-emerald-700 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', border: '1px solid rgba(52, 199, 89, 0.3)' }}
          >
            <Leaf className="w-5 h-5 text-emerald-600 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-sm font-black text-slate-900 tracking-tight">Green Wallet</span>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Sustainable Tourism Rewards</p>
          </div>
        </div>

        <Link
          to="/green-rewards"
          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-0.5 group"
        >
          <span>Open Hub</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Big Balance & Tier Banner */}
      <div className="relative z-10 my-3.5 p-3.5 rounded-2xl bg-white/90 border border-emerald-200/80 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Balance</span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="text-3xl sm:text-4xl font-black text-emerald-800 font-mono tracking-tight">
              {totalCoins}
            </span>
            <span className="text-xs font-bold text-emerald-600">Green Coins</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Discount Tier</span>
          <div className="flex items-center justify-end space-x-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-blue-700 font-mono">
              {availableDiscountTier}%
            </span>
            <span className="text-[10px] font-bold text-slate-500">/ 40% max</span>
          </div>
          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block mt-1">
            Eligible at Partner Checkout
          </span>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="relative z-10 space-y-1.5 text-xs">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
          Earned From Verified Activities
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          <div className="p-2 rounded-xl bg-white/80 border border-slate-200/70 flex flex-col justify-between">
            <div className="flex items-center space-x-1 text-slate-500 text-[10px]">
              <Car className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">Eco Travel</span>
            </div>
            <span className="text-xs font-black text-slate-800 font-mono mt-1">
              +{earnedFrom?.ecoTravel || 0}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-white/80 border border-slate-200/70 flex flex-col justify-between">
            <div className="flex items-center space-x-1 text-slate-500 text-[10px]">
              <Building2 className="w-3 h-3 text-indigo-600 shrink-0" />
              <span className="truncate">Hotels</span>
            </div>
            <span className="text-xs font-black text-slate-800 font-mono mt-1">
              +{earnedFrom?.partnerHotels || 0}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-white/80 border border-slate-200/70 flex flex-col justify-between">
            <div className="flex items-center space-x-1 text-slate-500 text-[10px]">
              <Utensils className="w-3 h-3 text-amber-600 shrink-0" />
              <span className="truncate">Restaurants</span>
            </div>
            <span className="text-xs font-black text-slate-800 font-mono mt-1">
              +{earnedFrom?.restaurants || 0}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-white/80 border border-slate-200/70 flex flex-col justify-between">
            <div className="flex items-center space-x-1 text-slate-500 text-[10px]">
              <Coffee className="w-3 h-3 text-orange-600 shrink-0" />
              <span className="truncate">Cafes</span>
            </div>
            <span className="text-xs font-black text-slate-800 font-mono mt-1">
              +{earnedFrom?.cafes || 0}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-white/80 border border-slate-200/70 flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="flex items-center space-x-1 text-slate-500 text-[10px]">
              <Camera className="w-3 h-3 text-purple-600 shrink-0" />
              <span className="truncate">Tourist Places</span>
            </div>
            <span className="text-xs font-black text-slate-800 font-mono mt-1">
              +{earnedFrom?.touristPlaces || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Rules Notice */}
      <div className="relative z-10 mt-3 p-2 rounded-xl bg-emerald-50/90 border border-emerald-200/80 flex items-center space-x-2 text-[10px] text-emerald-900 font-medium">
        <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <p className="line-clamp-1">
          Coins determine discount tier (max 40%). Minimum 60% payable bill applies.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-emerald-100">
        <Link
          to="/green-rewards?tab=submit"
          className="py-2 px-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center space-x-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Leaf className="w-3.5 h-3.5 shrink-0" />
          <span>+ Submit Activity</span>
        </Link>

        <Link
          to="/partner-payment"
          className="py-2 px-2.5 rounded-xl font-bold text-xs bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-sm flex items-center justify-center space-x-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <CreditCard className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Pay at Partner</span>
        </Link>
      </div>
    </motion.div>
  );
}
