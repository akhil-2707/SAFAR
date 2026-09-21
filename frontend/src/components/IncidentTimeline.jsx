import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, UserCheck, AlertTriangle } from 'lucide-react';

export default function IncidentTimeline({ timeline = [] }) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700">
        Incident Response Workflow Timeline
      </h4>
      <div className="relative pl-6 border-l-2 border-emerald-500/40 space-y-6">
        {timeline.map((step, idx) => (
          <div key={idx} className="relative group">
            {/* Step Node Icon */}
            <div className="absolute -left-[31px] top-0.5 w-6 h-6 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center text-emerald-600 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>

            {/* Step Body */}
            <div className="bg-gray-50/90 p-3 rounded-xl border border-gray-200 space-y-1 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-gray-900">{step.title}</span>
                <span className="text-[10px] text-gray-500 font-mono">
                  {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-gray-700">{step.note}</p>
              <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider inline-block">
                Status: {step.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
