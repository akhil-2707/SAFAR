import React, { useState } from 'react';
import MapView from '../components/MapView';
import MiniMap from '../components/MiniMap';
import CreateDangerAreaModal from '../components/CreateDangerAreaModal';
import SafarLogo from '../components/SafarLogo';
import { 
  ShieldCheck, AlertTriangle, Users, AlertOctagon, CheckCircle2, 
  Radio, BarChart3, Settings, MapPin, Plus, Trash2, Power, Eye, 
  Sparkles, Compass, ShieldAlert, Zap, Clock, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AuthorityDashboard({
  tourists = [],
  geofences = [],
  incidents = [],
  notifications = [],
  emergencyServices = [],
  onUpdateIncidentStatus,
  onRefreshData
}) {
  const [selectedTourist, setSelectedTourist] = useState(null);
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('incidents'); // 'incidents' | 'danger_areas' | 'tourists'
  const [actionSuccessMessage, setActionSuccessMessage] = useState(null);

  // Statistics
  const totalTourists = tourists.length;
  const touristsAtRisk = tourists.filter((t) => t.riskScore > 50 || t.riskLevel === 'HIGH' || t.riskLevel === 'CRITICAL').length;
  const safeTourists = totalTourists - touristsAtRisk;
  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED');
  const criticalSosCount = incidents.filter((i) => i.severity === 'CRITICAL' || i.type === 'SOS Emergency').length;

  const filteredTourists = tourists.filter((t) => {
    if (filterRisk === 'ALL') return true;
    if (filterRisk === 'CRITICAL') return t.riskLevel === 'CRITICAL' || t.isSosActive;
    if (filterRisk === 'HIGH') return t.riskLevel === 'HIGH';
    if (filterRisk === 'SAFE') return t.riskLevel === 'LOW' || t.status === 'SAFE';
    return true;
  });

  const handleZoneCreated = (newZone) => {
    setActionSuccessMessage(`Danger Zone "${newZone.name}" deployed with ${newZone.radiusMeters || 500}m radius!`);
    if (onRefreshData) onRefreshData();
    setTimeout(() => setActionSuccessMessage(null), 5000);
  };

  const handleToggleZone = async (zone) => {
    try {
      const res = await fetch(`/api/geofences/${zone.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !zone.active })
      });
      const data = await res.json();
      if (data.success) {
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteZone = async (id, name) => {
    if (!window.confirm(`Remove Danger Zone "${name}"?`)) return;
    try {
      const res = await fetch(`/api/geofences/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMessage(`Danger Zone "${name}" removed.`);
        if (onRefreshData) onRefreshData();
        setTimeout(() => setActionSuccessMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* 1. Clear, Simplified Top Header with Primary Action */}
      <div className="bg-safar-navy-900 border border-safar-shield-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <SafarLogo size="sm" showText={false} animated={true} />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-2xl text-white">S.A.F.A.R. Authority Command Desk</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/40 uppercase tracking-wider">
                Live Sentinel Active
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Unified National Tourist Safety Grid • Set Threat Radii, Track Real-Time Tourists & Dispatch SOS
            </p>
          </div>
        </div>

        {/* Highlighted Primary Action: Set New Danger Area & Radius */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-xl glow-red flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
          >
            <ShieldAlert className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>+ Set New Danger Area & Threat Radius</span>
          </button>

          <Link
            to="/incidents"
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center space-x-1.5"
          >
            <AlertOctagon className="w-4 h-4 text-red-400" />
            <span>Incidents ({activeIncidents.length})</span>
          </Link>
        </div>
      </div>

      {/* Success Toast Notification */}
      {actionSuccessMessage && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs font-semibold flex items-center space-x-2 shadow-xl animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* 2. Simplified 4 Key Metric Cards (Easy & Clear at a Glance) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Active Tourists */}
        <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 space-y-1 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 uppercase font-extrabold">Active Tourists</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{totalTourists}</span>
            <span className="text-xs font-bold text-emerald-400">({safeTourists} Safe 🟢)</span>
          </div>
          <div className="text-[10px] text-amber-400 font-medium">
            {touristsAtRisk} tourists approaching warning buffers
          </div>
        </div>

        {/* Card 2: Active Incidents & SOS */}
        <div className="p-4 rounded-2xl bg-navy-900 border border-red-500/30 space-y-1 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-red-400 uppercase font-extrabold">Emergency Incidents</span>
            <AlertOctagon className="w-4 h-4 text-red-400 animate-pulse" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-red-400">{activeIncidents.length}</span>
            {criticalSosCount > 0 && (
              <span className="text-xs font-bold text-rose-300">({criticalSosCount} Critical SOS)</span>
            )}
          </div>
          <div className="text-[10px] text-slate-400">
            Immediate dispatch response team assigned
          </div>
        </div>

        {/* Card 3: Danger Zones & Threat Radii */}
        <div className="p-4 rounded-2xl bg-navy-900 border border-amber-500/30 space-y-1 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-amber-400 uppercase font-extrabold">Danger Zones & Radii</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-amber-300">{geofences.length}</span>
            <span className="text-xs text-slate-400 font-semibold">Active Perimeters</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-medium">
            Real-time proximity alarms armed
          </div>
        </div>

        {/* Card 4: Response Latency / AI Defense */}
        <div className="p-4 rounded-2xl bg-navy-900 border border-emerald-500/30 space-y-1 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-emerald-400 uppercase font-extrabold">AI Defense Engine</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-emerald-300">98.4%</span>
            <span className="text-xs text-slate-400">Hazard Detection</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Avg Police SOS Dispatch: <strong className="text-white">~3.8 min</strong>
          </div>
        </div>

      </div>

      {/* 3. Hero Command Map with Quick Filter */}
      <div className="bg-navy-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
            <div>
              <h2 className="text-base font-black text-white">Live Tactical Radar & Threat Zone Map</h2>
              <p className="text-xs text-slate-400">
                Circular Danger Radii • Geo-Fence Boundaries • Live Tourist GPS Pins
              </p>
            </div>
          </div>

          {/* Easy Filter Buttons */}
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-slate-400 mr-1 hidden sm:inline">Filter:</span>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'CRITICAL', label: '🔴 SOS Alerts' },
              { id: 'HIGH', label: '🟠 At-Risk' },
              { id: 'SAFE', label: '🟢 Safe' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterRisk(f.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  filterRisk === f.id
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Map */}
        <MapView
          tourists={filteredTourists}
          geofences={geofences}
          selectedTourist={selectedTourist}
          emergencyServices={emergencyServices}
          height="500px"
        />
      </div>

      {/* 4. Simplified Operations Center: 2 Clean Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Panel A: Live Emergency SOS & Incidents */}
        <div className="bg-navy-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <AlertOctagon className="w-5 h-5 text-red-400 animate-pulse" />
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Live Emergency SOS & Incidents ({activeIncidents.length})
                </h3>
              </div>
              <Link to="/incidents" className="text-xs text-emerald-400 hover:underline font-bold">
                View Full Log →
              </Link>
            </div>

            <div className="divide-y divide-slate-800/80 max-h-[360px] overflow-y-auto pr-1">
              {activeIncidents.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto opacity-60" />
                  <p className="text-xs font-bold text-slate-300">All Sectors Clear</p>
                  <p className="text-[11px] text-slate-500">No active SOS alerts or safety breaches reported.</p>
                </div>
              ) : (
                activeIncidents.map((inc) => (
                  <div key={inc.id} className="py-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-red-400">{inc.id}</span>
                          <span className="font-bold text-xs text-white">{inc.touristName}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                              inc.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-orange-500/20 text-orange-400'
                            }`}
                          >
                            {inc.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">{inc.description}</p>
                      </div>

                      <button
                        onClick={() => onUpdateIncidentStatus(inc.id, 'IN_PROGRESS', 'Assam Tourist Police HQ')}
                        className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold shrink-0 shadow-md transition-all"
                      >
                        Dispatch Police Team
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>State Police Dispatch CAD: <strong className="text-emerald-400 font-mono">CONNECTED</strong></span>
            <span>Emergency Toll Free: <strong className="text-amber-300 font-mono">112 / 108</strong></span>
          </div>
        </div>

        {/* Panel B: Active Danger Zones & Threat Radii Controller */}
        <div className="bg-navy-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Active Danger Zones & Threat Radii ({geofences.length})
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Danger Area</span>
              </button>
            </div>

            <div className="divide-y divide-slate-800/80 max-h-[360px] overflow-y-auto pr-1 space-y-1">
              {geofences.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No active danger zones defined</div>
              ) : (
                geofences.map((gf) => {
                  const radiusText = gf.radiusMeters 
                    ? gf.radiusMeters >= 1000 ? `${(gf.radiusMeters / 1000).toFixed(1)} km` : `${gf.radiusMeters} m`
                    : 'Polygon';
                  const isCritical = gf.riskLevel === 'CRITICAL' || gf.type === 'RESTRICTED';

                  return (
                    <div key={gf.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: gf.color || (isCritical ? '#EF4444' : '#F59E0B') }}
                          />
                          <span className="font-bold text-slate-200 truncate">{gf.name}</span>
                          <span className="font-mono text-[10px] font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-500/30">
                            {radiusText}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate max-w-sm">
                          {gf.alertMessage || gf.description || 'Proximity buffer active.'}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => handleToggleZone(gf)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            gf.active !== false
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-500 border-slate-700'
                          }`}
                          title={gf.active !== false ? 'Deactivate Zone' : 'Activate Zone'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteZone(gf.id, gf.name)}
                          className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60 border border-red-500/30 transition-colors"
                          title="Delete Zone"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Configure New Danger Area & Radius</span>
          </button>
        </div>

      </div>

      {/* Interactive Modal: Set New Danger Area & Radius */}
      <CreateDangerAreaModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleZoneCreated}
      />

    </div>
  );
}
