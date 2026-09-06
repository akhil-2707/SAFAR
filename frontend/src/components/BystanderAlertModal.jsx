import React, { useState } from 'react';
import { Users, AlertTriangle, CheckCircle2, Shield, HeartHandshake, MapPin } from 'lucide-react';

export default function BystanderAlertModal({ isOpen, onClose, incident, onRespond }) {
  const [hasResponded, setHasResponded] = useState(false);

  if (!isOpen || !incident) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-bounce-soft">
      <div className="bg-white/95 border-2 border-amber-400 rounded-3xl p-5 shadow-2xl space-y-4 backdrop-blur-xl relative">
        
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-300 flex items-center justify-center font-black shrink-0 shadow-sm">
            <HeartHandshake className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black text-amber-800 uppercase tracking-widest">
                Community Safety Net
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-200">
                Nearby Alert (~450m)
              </span>
            </div>
            <h4 className="text-sm font-black text-gray-900">Verified Tourist Emergency Nearby</h4>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-700 leading-relaxed bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200">
          📍 <span className="font-extrabold text-gray-900">{incident.touristName || 'Fellow Tourist'}</span> triggered SOS at{' '}
          <span className="text-amber-900 font-bold">{incident.location?.address || 'Guwahati Sector 4'}</span>.
          Official response team is en-route. Can you offer immediate bystander guidance?
        </p>

        {/* Buttons */}
        {hasResponded ? (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center space-x-2 text-xs font-bold text-emerald-900 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Response Registered! Official responders notified of your standby.</span>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setHasResponded(true);
                if (onRespond) onRespond();
              }}
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs rounded-xl shadow-md transition-all"
            >
              🤝 I Can Assist / Stay Nearby
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl border border-gray-300 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
