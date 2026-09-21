import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calculator, Info, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

export default function FareBreakdownModal({ isOpen, onClose, option }) {
  if (!isOpen || !option) return null;

  const {
    provider,
    serviceName,
    category,
    minFare,
    maxFare,
    currency = 'INR',
    approxDistanceKm,
    approxDurationMins,
    dataSource,
    breakdown = {}
  } = option;

  const {
    baseFare = 35,
    perKmRate = 11,
    distComponent = Math.round((approxDistanceKm || 5) * 11),
    perMinRate = 1.2,
    timeComponent = Math.round((approxDurationMins || 15) * 1.2),
    calibrationFactor = 1.0,
    calculatedMedian = Math.round((minFare + maxFare) / 2)
  } = breakdown;

  const isLive = dataSource === 'LIVE_API';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200/90 space-y-4 max-h-[90vh] overflow-y-auto"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Fare Formula Details
                </span>
                <h3 className="text-base font-black text-slate-900">
                  {provider} {serviceName}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mandatory Prototype Transparency Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-300/80 text-amber-950 space-y-1 text-xs shadow-xs">
            <div className="flex items-center space-x-1.5 font-black uppercase text-[10px] tracking-wider text-amber-800">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{isLive ? 'LIVE PROVIDER PRICING' : 'PROTOTYPE ESTIMATE'}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-700 font-medium">
              Illustrative calculation model for demonstration. Commercial provider fares are determined dynamically by the provider at ride booking time.
            </p>
          </div>

          {/* Route Parameters Summary */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Route Distance</span>
              <span className="font-mono font-bold text-slate-900 text-sm">~{approxDistanceKm} km</span>
              <span className="text-[9px] text-slate-400 block">1.3x road approx</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Travel Duration</span>
              <span className="font-mono font-bold text-slate-900 text-sm">~{approxDurationMins} mins</span>
              <span className="text-[9px] text-slate-400 block">25 km/h urban speed</span>
            </div>
          </div>

          {/* Transparent Calculation Breakdown Table */}
          <div className="space-y-2 text-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Illustrative Component Breakdown
            </span>

            <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                <span className="text-slate-600 font-medium">1. Base Dispatch Component:</span>
                <span className="font-mono font-bold text-slate-900">₹{baseFare}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                <span className="text-slate-600 font-medium">
                  2. Distance Charge (~{approxDistanceKm} km × ₹{perKmRate}/km):
                </span>
                <span className="font-mono font-bold text-slate-900">₹{distComponent}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                <span className="text-slate-600 font-medium">
                  3. Transit Time (~{approxDurationMins}m × ₹{perMinRate}/m):
                </span>
                <span className="font-mono font-bold text-slate-900">₹{timeComponent}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                <span className="text-slate-600 font-medium">4. Nominal Calibration Factor:</span>
                <span className="font-mono font-bold text-slate-900">{calibrationFactor}x</span>
              </div>

              <div className="flex justify-between items-center pt-1.5 text-slate-900 font-black">
                <span>Calculated Prototype Median:</span>
                <span className="font-mono text-sm">₹{calculatedMedian}</span>
              </div>
            </div>
          </div>

          {/* Displayed Range Output */}
          <div className="p-3 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                Displayed Prototype Range
              </span>
              <div className="text-xl font-black font-mono text-amber-400">
                ₹{minFare} – ₹{maxFare}
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              ±10% Traffic Band
            </span>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
          >
            Close Breakdown
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
