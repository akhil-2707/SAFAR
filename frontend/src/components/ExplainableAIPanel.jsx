import React from 'react';
import AnimatedScore from './AnimatedScore';
import {
  Cpu, CheckCircle2, ShieldAlert, Navigation, Sparkles, Gauge,
  Radio, Target, Zap, BrainCircuit, ChevronRight
} from 'lucide-react';

export default function ExplainableAIPanel({ riskAnalysis, aiAdvice, aiAdviceLoading }) {
  const score = riskAnalysis?.score || 15;
  const level = riskAnalysis?.level || 'LOW';
  const factors = riskAnalysis?.contributingFactors || [];
  const anomalies = riskAnalysis?.detectedAnomalies || [];
  const actions = riskAnalysis?.recommendedActions || [];
  const proxWarn = riskAnalysis?.proximityWarning;

  const levelMeta = {
    CRITICAL: {
      text: 'text-red-700', border: 'border-red-300', bg: 'bg-red-50',
      badge: 'bg-red-50 text-red-700 border-red-300',
      gradient: 'from-red-600 to-rose-500', decision: 'EMERGENCY', urgency: 'IMMEDIATE'
    },
    HIGH: {
      text: 'text-orange-700', border: 'border-orange-300', bg: 'bg-orange-50',
      badge: 'bg-orange-50 text-orange-700 border-orange-300',
      gradient: 'from-orange-500 to-amber-500', decision: 'ESCALATE', urgency: 'HIGH'
    },
    MEDIUM: {
      text: 'text-amber-700', border: 'border-amber-300', bg: 'bg-amber-50',
      badge: 'bg-amber-50 text-amber-700 border-amber-300',
      gradient: 'from-amber-500 to-yellow-400', decision: 'WARN', urgency: 'ELEVATED'
    }
  };
  const meta = levelMeta[level] || {
    text: 'text-emerald-700', border: 'border-emerald-300', bg: 'bg-emerald-50',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    gradient: 'from-emerald-500 to-teal-400', decision: 'MONITOR', urgency: 'ROUTINE'
  };

  const decision = aiAdvice?.decision || meta.decision;
  const urgency = aiAdvice?.urgency || meta.urgency;
  const confidence = aiAdvice?.confidence ?? Math.min(96, 68 + factors.length * 5 + (proxWarn ? 3 : 0));
  const signalCount = aiAdvice?.signalCount ?? new Set([
    ...factors.map((f) => f.factor), ...anomalies,
    proxWarn ? `PROXIMITY:${proxWarn.tier}` : null
  ].filter(Boolean)).size;

  const signalSummary = aiAdvice?.signalSummary?.length
    ? aiAdvice.signalSummary
    : factors.filter((f) => Number(f.weight) > 0).sort((a, b) => Number(b.weight) - Number(a.weight)).slice(0, 4).map((f) => ({
        signal: f.factor, impact: `+${f.weight}`, detail: f.description
      }));

  const topDrivers = aiAdvice?.topRiskDrivers?.length
    ? aiAdvice.topRiskDrivers
    : factors.filter((f) => Number(f.weight) > 0).sort((a, b) => Number(b.weight) - Number(a.weight)).slice(0, 3).map((f) => ({
        name: f.factor, weight: Number(f.weight) || 0, description: f.description
      }));

  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl p-5 shadow-md shadow-slate-200/50 space-y-4">
      {/* Engine header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Explainable AI Safety Engine</h3>
            <p className="text-[10px] text-slate-500 font-medium">Multi-Factor Real-time Diagnostics</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider border ${meta.badge}`}>
          {level} RISK
        </span>
      </div>

      {/* Risk score */}
      <div className="space-y-2">
        <div className="flex items-end justify-between">
          <span className="text-xs text-slate-600 font-semibold">Composite AI Risk Score</span>
          <div className="flex items-baseline gap-1">
            <AnimatedScore targetScore={score} className={`text-3xl font-black ${meta.text}`} />
            <span className="text-xs text-slate-500 font-bold">/ 100</span>
          </div>
        </div>
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
          <div className={`h-full rounded-full bg-gradient-to-r ${meta.gradient} transition-all duration-700`} style={{ width: `${Math.max(5, score)}%` }} />
        </div>
        <div className="flex justify-between text-[9px] text-slate-500 font-bold px-1">
          <span>0 SAFE</span><span>30 LOW</span><span>50 MED</span><span>75 HIGH</span><span>100 CRITICAL</span>
        </div>
      </div>

      {/* AI interpretation */}
      <div className={`rounded-2xl border ${meta.border} ${meta.bg} p-3.5 space-y-3`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className={`w-4 h-4 ${meta.text}`} />
            <span className={`text-xs font-black ${meta.text}`}>AI Safety Interpretation</span>
          </div>
          <span className="text-[8px] font-black uppercase tracking-wider bg-white/90 text-slate-600 border border-slate-200 px-2 py-1 rounded-full">
            {aiAdvice?.provider === 'openai' ? 'LIVE AI' : 'EXPLAINABLE FALLBACK'}
          </span>
        </div>

        {aiAdviceLoading ? (
          <div className="flex items-center gap-2 text-xs text-slate-600 animate-pulse">
            <Cpu className="w-4 h-4" /> Fusing latest safety signals…
          </div>
        ) : aiAdvice ? (
          <>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${meta.badge}`}>Decision</span>
                <span className={`text-sm font-black ${meta.text}`}>{decision}</span>
                <span className="text-[9px] font-bold text-slate-500 ml-auto">{urgency}</span>
              </div>
              <p className="text-xs leading-5 font-bold text-slate-900">{aiAdvice.summary}</p>
              <p className="text-[10px] leading-4 text-slate-600 mt-1.5">{aiAdvice.reasoning}</p>
            </div>

            {/* Decision intelligence */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/90 border border-slate-200 rounded-xl p-2">
                <div className="flex items-center gap-1 text-[8px] text-slate-500 font-black uppercase"><Target className="w-3 h-3" /> Decision</div>
                <div className={`text-[10px] font-black mt-1 ${meta.text}`}>{decision}</div>
              </div>
              <div className="bg-white/90 border border-slate-200 rounded-xl p-2">
                <div className="flex items-center gap-1 text-[8px] text-slate-500 font-black uppercase"><Gauge className="w-3 h-3" /> Confidence</div>
                <div className="text-[10px] font-black text-slate-900 mt-1">{confidence}%</div>
              </div>
              <div className="bg-white/90 border border-slate-200 rounded-xl p-2">
                <div className="flex items-center gap-1 text-[8px] text-slate-500 font-black uppercase"><Radio className="w-3 h-3" /> Signals</div>
                <div className="text-[10px] font-black text-slate-900 mt-1">{signalCount} fused</div>
              </div>
            </div>

            {/* Signal fusion */}
            {signalSummary.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-slate-700">
                  <Zap className="w-3.5 h-3.5" /> Signal Fusion
                </div>
                {signalSummary.slice(0, 4).map((signal, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white/90 border border-slate-200 rounded-xl px-2.5 py-2">
                    <div className={`w-1.5 h-7 rounded-full bg-gradient-to-b ${meta.gradient}`} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-black text-slate-800 truncate">{signal.signal}</div>
                      <div className="text-[9px] text-slate-500 truncate">{signal.detail}</div>
                    </div>
                    <span className="shrink-0 text-[9px] font-black text-slate-800 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md">{signal.impact}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Top drivers */}
            {topDrivers.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[9px] font-black uppercase tracking-wider text-slate-700">Top Risk Drivers</div>
                {topDrivers.slice(0, 3).map((driver, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-4 text-[9px] font-black text-slate-400">#{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2 text-[9px] font-bold">
                        <span className="truncate text-slate-700">{driver.name}</span>
                        <span className={meta.text}>+{driver.weight}</span>
                      </div>
                      <div className="mt-1 h-1.5 bg-white rounded-full overflow-hidden border border-slate-200">
                        <div className={`h-full rounded-full bg-gradient-to-r ${meta.gradient}`} style={{ width: `${Math.min(100, (driver.weight / Math.max(score, 1)) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Next best actions */}
            {aiAdvice.recommendedActions?.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[9px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5" /> Next Best Actions
                </div>
                {aiAdvice.recommendedActions.slice(0, 3).map((action, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[10px] font-semibold text-slate-700 bg-white/90 border border-slate-200 rounded-xl px-2.5 py-2">
                    <span className={`w-4 h-4 shrink-0 rounded-full flex items-center justify-center text-[8px] font-black ${meta.badge}`}>{idx + 1}</span>
                    <span className="leading-4">{action}</span>
                    <ChevronRight className="w-3 h-3 ml-auto mt-0.5 text-slate-400 shrink-0" />
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1.5 text-[8px] text-slate-500 pt-1 border-t border-slate-200/70">
              <ShieldAlert className="w-3 h-3" /> Deterministic, auditable decision support • No paid API required
            </div>
          </>
        ) : (
          <p className="text-xs text-slate-500">Waiting for the safety interpretation…</p>
        )}
      </div>

      {/* Proximity warning */}
      {proxWarn && (
        <div className={`p-3 rounded-xl border space-y-1 ${
          proxWarn.severity === 'CRITICAL' ? 'bg-red-50 border-red-300 text-red-900' :
          proxWarn.severity === 'HIGH' ? 'bg-orange-50 border-orange-300 text-orange-900' :
          'bg-amber-50 border-amber-300 text-amber-900'
        }`}>
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1"><Navigation className="w-3.5 h-3.5" />{proxWarn.tier} WARNING</span>
            <span className="text-[10px] font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-300 text-slate-800">{proxWarn.distanceMeters}m Away</span>
          </div>
          <p className="text-xs font-semibold">{proxWarn.message}</p>
        </div>
      )}

      {/* Existing engine evidence */}
      {anomalies.length > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-red-700"><ShieldAlert className="w-4 h-4" />Detected Safety Anomalies</div>
          <ul className="space-y-1 pl-5 list-disc text-xs text-red-800">{anomalies.map((a, idx) => <li key={idx}>{a}</li>)}</ul>
        </div>
      )}

      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-800 block">Contributing Safety Factors</span>
        <div className="space-y-1.5">
          {factors.length === 0 ? <p className="text-xs text-slate-500 italic">No elevated risk factors detected</p> : factors.map((f, idx) => (
            <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div><span className="font-semibold text-slate-900 block">{f.factor}</span><span className="text-[11px] text-slate-600">{f.description}</span></div>
              {f.weight > 0 && <span className="px-2 py-0.5 rounded bg-slate-200 text-amber-800 font-mono font-bold shrink-0 ml-2 border border-slate-300">+{f.weight} pts</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-800 block">AI Recommended Actions</span>
        <div className="space-y-1">{actions.map((act, idx) => (
          <div key={idx} className="flex items-start gap-2 text-xs text-slate-800 bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" /><span>{act}</span>
          </div>
        ))}</div>
      </div>
    </div>
  );
}
