import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ShieldAlert, Route, AlertOctagon, CheckCircle2, FileCode, ChevronUp, ChevronDown, Sparkles, UserCheck, ShieldCheck, Navigation, Video } from 'lucide-react';

export default function DemoControlPanel({ onTriggerScenario, onSwitchUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleScenarioClick = async (scenarioId, path = null) => {
    setLoading(true);
    try {
      if (onTriggerScenario) await onTriggerScenario(scenarioId);
      if (path) {
        navigate(path);
      }
    } catch (err) {
      console.error('Scenario Execution Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 transition-all duration-300 max-w-sm sm:max-w-md select-none font-sans">
      <div
        className="backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl transition-all"
        style={{
          background: 'rgba(255, 255, 255, 0.97)',
          border: '2px solid rgba(139, 92, 246, 0.35)',
          boxShadow: '0 25px 60px rgba(139, 92, 246, 0.2), 0 4px 15px rgba(0, 0, 0, 0.08)'
        }}
      >
        {/* Panel Header */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="p-3.5 bg-gradient-to-r from-orange-50 via-white to-violet-50 cursor-pointer flex items-center justify-between border-b border-gray-100"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-black uppercase tracking-wider text-gray-900">
              SIH Evaluator Guided Scenario Panel
            </span>
          </div>
          <button className="text-gray-400 hover:text-gray-800 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Panel Body */}
        {isOpen && (
          <div className="p-4 space-y-3.5">
            <p className="text-[11px] text-gray-600 leading-relaxed font-semibold">
              Execute live pre-entry warnings, geo-fence breaches, SOS dispatch, or 3D Cinematic Story Demo in 1 click:
            </p>

            {/* Master 3D Cinematic Demo CTA */}
            <button
              disabled={loading}
              onClick={() => {
                navigate('/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full py-2.5 px-3 rounded-2xl text-white font-black text-xs shadow-md transition-all flex items-center justify-center space-x-2 group hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #f97316, #8b5cf6)',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.35)'
              }}
            >
              <Video className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span>🎬 Start 3D Cinematic Journey Demo</span>
            </button>

            {/* Scenarios Grid */}
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={loading}
                onClick={() => handleScenarioClick('1', '/tourist-dashboard')}
                className="flex items-center space-x-2 p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left group transition-all text-xs font-bold text-emerald-800 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>1. Safe Location</span>
              </button>

              <button
                disabled={loading}
                onClick={() => handleScenarioClick('APPROACH_300M', '/tourist-dashboard')}
                className="flex items-center space-x-2 p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left group transition-all text-xs font-bold text-amber-800 shadow-sm"
              >
                <Navigation className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>2. Approach 300m</span>
              </button>

              <button
                disabled={loading}
                onClick={() => handleScenarioClick('APPROACH_150M', '/tourist-dashboard')}
                className="flex items-center space-x-2 p-2 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-left group transition-all text-xs font-bold text-orange-800 shadow-sm"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span>3. Approach 150m</span>
              </button>

              <button
                disabled={loading}
                onClick={() => handleScenarioClick('2', '/tourist-dashboard')}
                className="flex items-center space-x-2 p-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-left group transition-all text-xs font-bold text-red-800 shadow-sm"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>4. Breach Zone</span>
              </button>

              <button
                disabled={loading}
                onClick={() => handleScenarioClick('3', '/tourist-dashboard')}
                className="flex items-center space-x-2 p-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-left group transition-all text-xs font-bold text-purple-800 shadow-sm"
              >
                <Route className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>5. Route Offset</span>
              </button>

              <button
                disabled={loading}
                onClick={() => handleScenarioClick('4', '/tourist-dashboard')}
                className="flex items-center space-x-2 p-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-left group transition-all text-xs font-bold text-rose-800 shadow-sm"
              >
                <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>6. Trigger SOS</span>
              </button>

              <button
                disabled={loading}
                onClick={() => handleScenarioClick('5', '/blockchain-ledger')}
                className="flex items-center space-x-2 p-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-left group transition-all text-xs font-bold text-blue-800 shadow-sm"
              >
                <FileCode className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>7. Verify Blockchain</span>
              </button>

              <button
                disabled={loading}
                onClick={() => handleScenarioClick('6', '/blockchain-ledger')}
                className="flex items-center space-x-2 p-2 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-left group transition-all text-xs font-bold text-pink-800 shadow-sm"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                <span>8. Tampering Test</span>
              </button>
            </div>

            {/* Quick Role Switcher */}
            <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider">Role Switch:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (onSwitchUser) onSwitchUser('TOURIST');
                    navigate('/tourist-dashboard');
                  }}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-[11px] font-bold text-gray-800 rounded-xl flex items-center space-x-1.5 border border-gray-200 transition-colors shadow-sm"
                >
                  <UserCheck className="w-3 h-3 text-emerald-600" />
                  <span>Tourist Hub</span>
                </button>
                <button
                  onClick={() => {
                    if (onSwitchUser) onSwitchUser('AUTHORITY');
                    navigate('/authority-dashboard');
                  }}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-violet-50 hover:text-violet-700 text-[11px] font-bold text-gray-800 rounded-xl flex items-center space-x-1.5 border border-gray-200 transition-colors shadow-sm"
                >
                  <ShieldCheck className="w-3 h-3 text-violet-600" />
                  <span>Authority Command</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}