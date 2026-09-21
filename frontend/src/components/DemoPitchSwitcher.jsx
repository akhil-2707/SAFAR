import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Check, MapPin, Radio, ChevronDown, Sparkles } from 'lucide-react';

export default function DemoPitchSwitcher({
  currentTouristId,
  allTourists = [],
  onSelectTourist,
  onActivateLiveGps
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const demoPresets = [
    {
      id: 'TID-1035',
      name: 'Ananya Mishra',
      icon: '🛕',
      location: 'Ayodhya Ram Janmabhoomi',
      badge: 'Pilgrim Hub'
    },
    {
      id: 'TID-1036',
      name: 'Vikram Singh',
      icon: '🏔️',
      location: 'Katra Vaishno Devi Track',
      badge: 'Alpine Pass'
    },
    {
      id: 'TID-1039',
      name: 'Priya Nair',
      icon: '🕌',
      location: 'Agra Taj Mahal Corridor',
      badge: 'UNESCO Heritage'
    },
    {
      id: 'TID-1038',
      name: 'Rahul Roy',
      icon: '🦏',
      location: 'Kaziranga Forest Buffer',
      badge: 'Wildlife Zone'
    },
    {
      id: 'TID-REAL',
      name: 'Live Device GPS',
      icon: '📍',
      location: 'Current Browser Coordinates',
      badge: 'Hardware Sensor',
      isLiveSensor: true
    }
  ];

  const handleSelect = (preset) => {
    if (preset.isLiveSensor) {
      if (onActivateLiveGps) onActivateLiveGps();
      if (onSelectTourist) onSelectTourist('TID-REAL');
    } else {
      if (onSelectTourist) onSelectTourist(preset.id);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
        style={{
          background: 'rgba(240, 240, 245, 0.9)',
          border: '1px solid rgba(120, 120, 128, 0.2)',
          color: '#3C3C43'
        }}
        title="Quick persona switcher for jury and pitch presentation"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span className="hidden sm:inline">Pitch Persona</span>
        <span className="sm:hidden">Demo</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 mt-1.5 w-72 rounded-2xl p-2 z-50 shadow-2xl border bg-white/95 backdrop-blur-xl border-slate-200/90 text-slate-800"
          >
            <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Evaluation Scenarios
              </span>
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                Demo Switcher
              </span>
            </div>

            <div className="space-y-1">
              {demoPresets.map((preset) => {
                const isSelected = currentTouristId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelect(preset)}
                    className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-orange-50 border border-orange-200/80 text-orange-950 font-bold'
                        : 'hover:bg-slate-50 text-slate-700 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0">{preset.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs truncate">{preset.name}</p>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold shrink-0">
                            {preset.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{preset.location}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-orange-600 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
