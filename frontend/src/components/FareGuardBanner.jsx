import React from 'react';
import { ShieldCheck, Info, Scale, ExternalLink, HelpCircle } from 'lucide-react';

export default function FareGuardBanner({ localBenchmark, displayedOptions = [], options = [] }) {
  const candidateOptions = options && options.length > 0 ? options : displayedOptions;

  // If benchmark is not available for this geographic coordinate region
  if (!localBenchmark || !localBenchmark.available) {
    return (
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-600 text-xs flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-xl bg-slate-200/70 text-slate-500 flex items-center justify-center shrink-0">
            <Scale className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-extrabold text-slate-800 block">
              SAFAR Fare Guard: Local benchmark unavailable for this route
            </span>
            <p className="text-[11px] text-slate-500">
              Verified municipal tariff rate card is currently not registered for these specific coordinates.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
          General Standard
        </span>
      </div>
    );
  }

  // Find lowest Auto quote and lowest Cab quote from options for direct comparison
  const autoOption = candidateOptions.find((o) => o.category === 'AUTO');
  const cabOption = candidateOptions.find((o) => o.category === 'CAB');
  const bikeOption = candidateOptions.find((o) => o.category === 'BIKE');

  // Benchmark for Auto (primary tourist urban benchmark)
  const autoBenchmark = localBenchmark.benchmarks?.AUTO;
  const cabBenchmark = localBenchmark.benchmarks?.CAB;

  // Calculate neutral variance for Auto
  let autoVariance = null;
  let autoStatus = 'WITHIN';
  if (autoOption && autoBenchmark) {
    const diffMin = autoOption.minFare - autoBenchmark.min;
    if (diffMin > 30) {
      autoStatus = 'ABOVE';
      autoVariance = `+₹${diffMin} above local benchmark`;
    } else if (diffMin < -10) {
      autoStatus = 'BELOW';
      autoVariance = `₹${Math.abs(diffMin)} below local benchmark`;
    } else {
      autoStatus = 'WITHIN';
      autoVariance = 'Within local benchmark';
    }
  }

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-white/95 border border-emerald-200/80 shadow-md backdrop-blur-xl text-slate-900 space-y-3.5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                SAFAR Fare Guard — Municipal Transit Benchmark Overlay
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {localBenchmark.regionName}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Source: {localBenchmark.authoritySource} ({localBenchmark.effectiveYear})
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200/80">
          Route Distance: ~{localBenchmark.distanceKm} km
        </span>
      </div>

      {/* Comparison Grid: Local Municipal Standard vs Provider Estimates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
        
        {/* Auto-Rickshaw Benchmark Box */}
        {autoBenchmark && (
          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
              <span className="uppercase tracking-wider font-extrabold text-slate-700">🛺 Auto-Rickshaw</span>
              <span className="text-slate-600 font-semibold">{autoBenchmark.rateDescription}</span>
            </div>
            
            <div className="flex justify-between items-baseline pt-0.5">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Local Benchmark:</span>
                <span className="text-base font-black font-mono text-emerald-600">
                  ₹{autoBenchmark.min} – ₹{autoBenchmark.max}
                </span>
              </div>

              {autoOption && (
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">App Prototype:</span>
                  <span className="text-base font-black font-mono text-slate-900">
                    ₹{autoOption.minFare} – ₹{autoOption.maxFare}
                  </span>
                </div>
              )}
            </div>

            {autoVariance && (
              <div className="pt-1.5 border-t border-slate-200/70 flex items-center justify-between text-[10px]">
                <span className="text-slate-500 font-medium">Comparison Status:</span>
                <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                  autoStatus === 'WITHIN' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : autoStatus === 'BELOW' ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {autoVariance}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Taxi / Cab Benchmark Box */}
        {cabBenchmark && (
          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
              <span className="uppercase tracking-wider font-extrabold text-slate-700">🚕 Standard Taxi / Cab</span>
              <span className="text-slate-600 font-semibold">{cabBenchmark.rateDescription}</span>
            </div>

            <div className="flex justify-between items-baseline pt-0.5">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Local Benchmark:</span>
                <span className="text-base font-black font-mono text-emerald-600">
                  ₹{cabBenchmark.min} – ₹{cabBenchmark.max}
                </span>
              </div>

              {cabOption && (
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">App Prototype:</span>
                  <span className="text-base font-black font-mono text-slate-900">
                    ₹{cabOption.minFare} – ₹{cabOption.maxFare}
                  </span>
                </div>
              )}
            </div>

            {cabOption && (
              <div className="pt-1.5 border-t border-slate-200/70 flex items-center justify-between text-[10px]">
                <span className="text-slate-500 font-medium">Comparison Status:</span>
                <span className="font-bold px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                  {cabOption.minFare > cabBenchmark.max ? 'Above local benchmark' : 'Within benchmark'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Informational Guidance Box */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/90 flex flex-col justify-between space-y-2 text-slate-600 text-[11px] leading-relaxed">
          <div className="flex items-start space-x-2">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="font-medium text-slate-600">
              Provider prototype estimates include platform convenience fees. Municipal benchmarks reflect standard meter tariffs published by local transport authorities.
            </p>
          </div>
          <span className="text-[10px] text-slate-500 font-semibold block pt-1 border-t border-slate-200/60">
            Tip: Use this benchmark when evaluating unmetered offline street quotes.
          </span>
        </div>

      </div>

    </div>
  );
}
