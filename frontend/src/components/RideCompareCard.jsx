import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Clock, Users, Zap, Award, Info, Luggage, Calculator } from 'lucide-react';

export default function RideCompareCard({ option, onViewBreakdown }) {
  if (!option) return null;

  const {
    provider,
    serviceName,
    category,
    minFare,
    maxFare,
    currency = 'INR',
    etaMins,
    approxDistanceKm,
    approxDurationMins,
    capacity = 4,
    passengerGuidance,
    luggageGuidance,
    dataSource,
    disclaimer,
    bookingUrl,
    handoffNote,
    isCheapest,
    isFastest,
    isBestBalanced,
    isEnclosedVehicle
  } = option;

  // Provider brand styling palette
  const getProviderTheme = () => {
    switch (provider) {
      case 'Uber':
        return {
          cardBorder: 'rgba(30, 41, 59, 0.25)',
          badgeBg: 'bg-slate-900',
          badgeText: 'text-white',
          btnBg: 'bg-slate-900 hover:bg-slate-800 text-white',
          accentColor: '#0f172a',
          logoBg: 'bg-slate-100 text-slate-900 border-slate-300'
        };
      case 'Ola':
        return {
          cardBorder: 'rgba(16, 185, 129, 0.3)',
          badgeBg: 'bg-emerald-600',
          badgeText: 'text-white',
          btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          accentColor: '#059669',
          logoBg: 'bg-emerald-50 text-emerald-800 border-emerald-300'
        };
      case 'Rapido':
        return {
          cardBorder: 'rgba(245, 158, 11, 0.35)',
          badgeBg: 'bg-amber-500',
          badgeText: 'text-slate-950',
          btnBg: 'bg-amber-500 hover:bg-amber-600 text-slate-950',
          accentColor: '#d97706',
          logoBg: 'bg-amber-50 text-amber-900 border-amber-300'
        };
      default:
        return {
          cardBorder: 'rgba(100, 116, 139, 0.2)',
          badgeBg: 'bg-slate-700',
          badgeText: 'text-white',
          btnBg: 'bg-slate-800 hover:bg-slate-700 text-white',
          accentColor: '#334155',
          logoBg: 'bg-slate-50 text-slate-800 border-slate-200'
        };
    }
  };

  const theme = getProviderTheme();

  // Category Icon & Label
  const getCategoryDetails = () => {
    switch (category) {
      case 'BIKE':
        return { icon: '🏍️', label: 'Bike Taxi', desc: 'Fast solo transit' };
      case 'AUTO':
        return { icon: '🛺', label: 'Auto-Rickshaw', desc: 'Affordable local ride' };
      case 'PREMIUM':
        return { icon: '✨', label: 'Premium Sedan', desc: 'Top rated & comfort' };
      case 'CAB':
      default:
        return { icon: '🚕', label: 'Economy Cab', desc: 'Standard 4-seater car' };
    }
  };

  const cat = getCategoryDetails();
  const isLive = dataSource === 'LIVE_API';

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 bg-white/95 border shadow-sm backdrop-blur-xl relative overflow-hidden"
      style={{ borderColor: theme.cardBorder }}
    >
      {/* Top Header: Provider Brand & Service Title */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          {/* Provider Pill */}
          <div className="flex items-center space-x-2">
            <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText} tracking-wider shadow-xs`}>
              {provider}
            </span>
            <span className="text-sm font-extrabold text-slate-900 flex items-center space-x-1">
              <span>{cat.icon}</span>
              <span>{serviceName}</span>
            </span>
          </div>

          {/* Highlights Badges (Cheapest / Fastest / Best Balanced) */}
          <div className="flex items-center space-x-1 shrink-0">
            {isCheapest && (
              <span className="inline-flex items-center space-x-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                <Award className="w-3 h-3 text-emerald-600" />
                <span>Lowest Fare</span>
              </span>
            )}
            {isFastest && !isCheapest && (
              <span className="inline-flex items-center space-x-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
                <Zap className="w-3 h-3 text-indigo-600" />
                <span>Fastest Arrival</span>
              </span>
            )}
            {isBestBalanced && !isCheapest && !isFastest && (
              <span className="inline-flex items-center space-x-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                <span>Balanced Value</span>
              </span>
            )}
          </div>
        </div>

        {/* Data Source Pill (MANDATORY PROTOTYPE ESTIMATE BADGE) */}
        <div className="flex items-center justify-between text-[10px] font-bold">
          <span className="text-slate-600 flex items-center space-x-1 font-semibold">
            <Users className="w-3 h-3 text-slate-400" />
            <span>{passengerGuidance || `Suitable for 1–${capacity} passengers`}</span>
          </span>

          {isLive ? (
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold">
              🟢 LIVE API
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-extrabold flex items-center space-x-1">
              <span>🏷️</span>
              <span>ESTIMATED FARE</span>
            </span>
          )}
        </div>

        {/* Luggage Capacity Guidance */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
          <span className="flex items-center space-x-1.5 font-medium">
            <Luggage className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{luggageGuidance || 'Standard luggage allowance'}</span>
          </span>
          {isEnclosedVehicle && (
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
              Enclosed Vehicle
            </span>
          )}
        </div>
      </div>

      {/* Main Fare & ETA Block */}
      <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/70 space-y-1.5">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {isLive ? 'Live Quoted Fare' : 'Estimated Fare Range'}
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tracking-tight">
              ₹{minFare} {minFare !== maxFare && <span className="text-lg font-bold text-slate-500 font-sans">– ₹{maxFare}</span>}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Pickup Arrival
            </span>
            <div className="text-xs sm:text-sm font-black text-emerald-700 flex items-center justify-end space-x-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>~{etaMins} min nominal pickup</span>
            </div>
          </div>
        </div>

        {/* View Formula Breakdown Trigger */}
        <div className="pt-1.5 border-t border-slate-200/50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onViewBreakdown && onViewBreakdown(option)}
            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1 transition-colors underline cursor-pointer"
          >
            <Calculator className="w-3 h-3" />
            <span>View Calculation Details</span>
          </button>

          <span className="text-[9px] text-slate-400 font-mono">
            {isLive ? 'API Verified' : 'Calibrated Formula'}
          </span>
        </div>
      </div>

      {/* 1-Click Action Button: Legitimate Official Deep Link */}
      <div className="space-y-1">
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm ${theme.btnBg}`}
        >
          <span>Book on {provider}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <span className="text-[9px] text-slate-400 text-center block pt-0.5">
          {handoffNote || (provider === 'Rapido'
            ? 'Opens official Rapido portal (coordinates require in-app confirmation)'
            : `Handoff opens official ${provider} app/web with pre-filled coordinates`)}
        </span>
      </div>
    </motion.div>
  );
}

