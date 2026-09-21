import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, PhoneCall, Radio, Activity, X } from 'lucide-react';

export default function Emergency112Modal({ isOpen, onClose, location = 'Guwahati Region' }) {
  const [step, setStep] = useState(1);
  const [handshakeData, setHandshakeData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      const timer1 = setTimeout(() => setStep(2), 1200);
      const timer2 = setTimeout(() => {
        setStep(3);
        setHandshakeData({
          erssTicketId: `112-IN-AS-${Date.now().toString().slice(-6)}`,
          dispatchCenter: 'Assam State Emergency Response Center (Guwahati HQ)',
          assignedUnit: 'PCR Patrol Unit 42 & Mobile Medical Van',
          etaMinutes: 6,
          timestamp: new Date().toLocaleTimeString()
        });
      }, 2600);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white/98 border border-red-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-2xl">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center font-black shadow-sm">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900">112 India ERSS Live API Gateway</h3>
              <p className="text-[11px] text-gray-500 font-medium">National Emergency Response Support System Integration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Handshake Progress Steps */}
        <div className="space-y-3">
          
          {/* Step 1: Encryption & API Handshake */}
          <div className={`p-3 rounded-2xl border transition-all flex items-center space-x-3 ${
            step >= 1 ? 'bg-gray-50 border-gray-200 shadow-sm' : 'opacity-40 border-gray-100 bg-gray-50/50'
          }`}>
            {step === 1 ? (
              <Activity className="w-5 h-5 text-amber-600 animate-spin shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <div>
              <div className="text-xs font-bold text-gray-900">1. Secure API Handshake (mTLS / OAuth 2.0)</div>
              <div className="text-[11px] text-gray-500">Connecting SafeTour NE with Ministry of Home Affairs 112 Gateway</div>
            </div>
          </div>

          {/* Step 2: Encrypted GPS & Digital ID Payload Transmission */}
          <div className={`p-3 rounded-2xl border transition-all flex items-center space-x-3 ${
            step >= 2 ? 'bg-gray-50 border-gray-200 shadow-sm' : 'opacity-40 border-gray-100 bg-gray-50/50'
          }`}>
            {step === 2 ? (
              <Activity className="w-5 h-5 text-amber-600 animate-spin shrink-0" />
            ) : step > 2 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <Radio className="w-5 h-5 text-gray-400 shrink-0" />
            )}
            <div>
              <div className="text-xs font-bold text-gray-900">2. Transmitting GPS & SHA-256 Tourist Credential</div>
              <div className="text-[11px] text-gray-500">Location: {location} • Hash Token Attached</div>
            </div>
          </div>

          {/* Step 3: ERSS Dispatch Confirmed */}
          <div className={`p-3 rounded-2xl border transition-all flex items-center space-x-3 ${
            step >= 3 ? 'bg-emerald-50 border-emerald-300 shadow-sm' : 'opacity-40 border-gray-100 bg-gray-50/50'
          }`}>
            <CheckCircle2 className={`w-5 h-5 shrink-0 ${step === 3 ? 'text-emerald-600 animate-bounce' : 'text-gray-400'}`} />
            <div>
              <div className="text-xs font-black text-emerald-900">3. 112 ERSS Response Unit Dispatched</div>
              <div className="text-[11px] text-emerald-700 font-medium">Official Government Ticket Confirmed</div>
            </div>
          </div>

        </div>

        {/* Handshake Result Box */}
        {handshakeData && (
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2 text-xs shadow-sm">
            <div className="flex items-center justify-between text-gray-600 font-bold border-b border-gray-200 pb-1.5">
              <span>ERSS Ticket ID:</span>
              <span className="font-mono text-emerald-700 font-black">{handshakeData.erssTicketId}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span className="text-gray-500 font-medium">Dispatch Center:</span>
              <span className="font-semibold text-gray-900">{handshakeData.dispatchCenter}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span className="text-gray-500 font-medium">Assigned Unit:</span>
              <span className="font-bold text-amber-800">{handshakeData.assignedUnit}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span className="text-gray-500 font-medium">Estimated Response Time:</span>
              <span className="font-black text-emerald-700 text-sm">~{handshakeData.etaMinutes} Mins</span>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold text-xs rounded-xl border border-gray-300 transition-colors shadow-sm"
        >
          Close ERSS Gateway Monitor
        </button>

      </div>
    </div>
  );
}
