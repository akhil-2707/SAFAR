import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, MapPin, X, Check, Radio, Navigation, Sparkles } from 'lucide-react';

const PRESET_LOCATIONS = [
  { name: 'Guwahati Safe Hub', lat: 26.1445, lng: 91.7362, hint: 'Assam Capital Hub' },
  { name: 'Kaziranga High Hazard Zone', lat: 26.5775, lng: 93.1711, hint: 'Elephant & Rhino Sanctuary' },
  { name: 'Cherrapunji Deep Gorge', lat: 25.2986, lng: 91.7324, hint: 'Monsoon Flash-Flood Zone' },
  { name: 'Tawang High-Altitude Pass', lat: 27.5860, lng: 91.8655, hint: 'Alpine Mountain Corridor' },
  { name: 'Kamrup Restricted Border', lat: 26.3500, lng: 91.6000, hint: 'Inner-Line Restricted Buffer' }
];

const THREAT_LEVELS = [
  {
    id: 'CAUTION',
    level: 'MEDIUM',
    label: 'Caution Advisory',
    color: '#F59E0B',
    bgColor: 'bg-yellow-950/60',
    borderColor: 'border-yellow-500/60',
    textColor: 'text-yellow-400',
    badge: '🟡 Advisory',
    desc: 'Mild hazard / Heavy fog / Wet terrain. Tourists receive advisory notification.'
  },
  {
    id: 'HIGH_RISK',
    level: 'HIGH',
    label: 'High Risk Hazard',
    color: '#F97316',
    bgColor: 'bg-orange-950/60',
    borderColor: 'border-orange-500/60',
    textColor: 'text-orange-400',
    badge: '🟠 High Hazard',
    desc: 'Wildlife crossing / Steep cliff. System increases tourist risk index by +40%.'
  },
  {
    id: 'RESTRICTED',
    level: 'CRITICAL',
    label: 'Critical No-Entry Zone',
    color: '#EF4444',
    bgColor: 'bg-red-950/70',
    borderColor: 'border-red-500',
    textColor: 'text-red-400',
    badge: '🔴 Strict No-Entry',
    desc: 'Landslide / Border breach. Triggers acoustic siren on tourist phone & logs incident.'
  }
];

export default function CreateDangerAreaModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState('Kamrup Landslide Hazard Sector');
  const [selectedThreat, setSelectedThreat] = useState(THREAT_LEVELS[2]); // Default RESTRICTED / CRITICAL
  const [radiusMeters, setRadiusMeters] = useState(500);
  const [warningDistance, setWarningDistance] = useState(300);
  const [center, setCenter] = useState({ lat: 26.3500, lng: 91.6000, name: 'Kamrup Restricted Border' });
  const [customLat, setCustomLat] = useState('26.3500');
  const [customLng, setCustomLng] = useState('91.6000');
  const [alertMessage, setAlertMessage] = useState('⚠️ DANGER: You are approaching a High-Risk Restricted Hazard Zone. Turn back to the safe corridor immediately.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSelectPreset = (loc) => {
    setCenter(loc);
    setCustomLat(loc.lat.toString());
    setCustomLng(loc.lng.toString());
  };

  const handleThreatChange = (threat) => {
    setSelectedThreat(threat);
    if (threat.id === 'RESTRICTED') {
      setAlertMessage('🔴 RESTRICTED ZONE: Unauthorized entry detected. Turn back immediately.');
    } else if (threat.id === 'HIGH_RISK') {
      setAlertMessage('🟠 WARNING: Approaching High Hazard Sector. Stay on marked pathway.');
    } else {
      setAlertMessage('🟡 CAUTION: Moderate hazard advisory in this sector. Proceed with care.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const lat = parseFloat(customLat) || center.lat;
    const lng = parseFloat(customLng) || center.lng;

    const payload = {
      name,
      type: selectedThreat.id,
      riskLevel: selectedThreat.level,
      description: `${selectedThreat.label} with ${radiusMeters}m perimeter radius.`,
      shape: 'CIRCLE',
      center: { lat, lng },
      radiusMeters: parseInt(radiusMeters),
      warningDistance: parseInt(warningDistance),
      alertMessage,
      active: true,
      createdBy: 'S.A.F.A.R. Authority Command Desk'
    };

    try {
      const res = await fetch('/api/geofences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create danger zone');
      }

      if (onCreated) {
        onCreated(data.geofence);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Approximate area in sq km
  const areaSqKm = ((Math.PI * Math.pow(radiusMeters, 2)) / 1000000).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto select-none">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center space-x-2">
                <span>Set New Danger Zone / Threat Radius</span>
              </h2>
              <p className="text-xs text-slate-400">
                Define geographic radius and threat level to instantly broadcast alerts to active tourists
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 1. Zone Name */}
          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1">
              Danger Zone / Area Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Landslide Corridor, Wild Elephant Crossing"
              className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* 2. Threat Level Selection */}
          <div>
            <label className="text-xs text-slate-300 font-bold block mb-2">
              Select Threat / Risk Level *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {THREAT_LEVELS.map((t) => {
                const isSelected = selectedThreat.id === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleThreatChange(t)}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? `${t.bgColor} ${t.borderColor} ring-2 ring-emerald-400/40 shadow-lg`
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-black ${t.textColor}`}>{t.badge}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div className="text-[11px] font-bold text-white leading-tight">{t.label}</div>
                    <div className="text-[10px] text-slate-400 mt-1 leading-snug">{t.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Threat Radius Slider & Presets */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-extrabold text-slate-200 block">
                  Threat Perimeter Radius (Meters)
                </label>
                <span className="text-[11px] text-slate-400">
                  Coverage Area: <strong className="text-emerald-400 font-mono">~{areaSqKm} km²</strong>
                </span>
              </div>
              <span className="text-base font-black font-mono text-amber-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                {radiusMeters >= 1000 ? `${(radiusMeters / 1000).toFixed(1)} km` : `${radiusMeters} m`}
              </span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="100"
              max="5000"
              step="50"
              value={radiusMeters}
              onChange={(e) => setRadiusMeters(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-950 rounded-lg"
            />

            {/* Radius Quick Presets */}
            <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-400 pt-1">
              <span>Quick:</span>
              {[250, 500, 1000, 2000, 5000].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRadiusMeters(r)}
                  className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold transition-colors ${
                    radiusMeters === r
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  {r >= 1000 ? `${r / 1000}km` : `${r}m`}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Geographic Center Point */}
          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-bold block">
              Area Epicenter / GPS Coordinates
            </label>

            {/* Preset Location Pills */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              {PRESET_LOCATIONS.map((loc) => {
                const isMatch = center.name === loc.name;
                return (
                  <button
                    key={loc.name}
                    type="button"
                    onClick={() => handleSelectPreset(loc)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all flex items-center space-x-1 ${
                      isMatch
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <MapPin className="w-3 h-3 text-amber-400" />
                    <span>{loc.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Latitude (deg)</span>
                <input
                  type="text"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">Longitude (deg)</span>
                <input
                  type="text"
                  value={customLng}
                  onChange={(e) => setCustomLng(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* 5. Warning Broadcast Message to Tourists */}
          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1">
              Acoustic & Screen Broadcast Message (Triggered on Tourist Phone)
            </label>
            <input
              type="text"
              required
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white text-xs font-bold border border-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-black shadow-xl transition-all flex items-center space-x-2"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>{loading ? 'Deploying Danger Zone...' : 'Deploy Danger Zone & Activate Threat Radius'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
