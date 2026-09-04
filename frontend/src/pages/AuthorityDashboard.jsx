import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MapView from '../components/MapView';
import MiniMap from '../components/MiniMap';
import CreateDangerAreaModal from '../components/CreateDangerAreaModal';
import SafarLogo from '../components/SafarLogo';
import { 
  ShieldCheck, AlertTriangle, Users, AlertOctagon, CheckCircle2, 
  Radio, BarChart3, Settings, MapPin, Plus, Trash2, Power, Eye, 
  Sparkles, Compass, ShieldAlert, Zap, Clock, ChevronRight, Activity, Radar
} from 'lucide-react';
import { Link } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
  }
};

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
  const [activeTab, setActiveTab] = useState('incidents');
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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
    >
      
      {/* 1. Ultra-Frosted Tactical Command Header */}
      <motion.div 
        variants={itemVariants}
        className="pro-glass-card rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center space-x-4 relative z-10">
          <SafarLogo size="sm" showText={false} animated={true} />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-2xl text-white tracking-tight">S.A.F.A.R. Authority Command Desk</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/40 uppercase tracking-wider glow-green">
                Live Sentinel Active
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Unified National Tourist Safety Grid • Set Threat Radii, Track Real-Time Tourists & Dispatch SOS
            </p>
          </div>
        </div>

        {/* Highlighted Primary Action: Set New Danger Area & Radius */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto relative z-10">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-xl glow-red flex items-center justify-center space-x-2 transition-all"
          >
            <ShieldAlert className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>+ Set New Danger Area & Threat Radius</span>
          </motion.button>

          <Link
            to="/incidents"
            className="px-4 py-3 bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-2xl border border-slate-700/80 transition-colors flex items-center space-x-2 shadow-md"
          >
            <AlertOctagon className="w-4 h-4 text-red-400" />
            <span>Incidents ({activeIncidents.length})</span>
          </Link>
        </div>
      </motion.div>

      {/* Success Toast Notification */}
      <AnimatePresence>
        {actionSuccessMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 bg-emerald-950/90 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs font-semibold flex items-center space-x-2 shadow-xl glow-green"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Simplified 4 Key Metric Cards with Pro-Glass HUD styling */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Active Tourists */}
        <motion.div whileHover={{ y: -3 }} className="pro-glass-card p-4 rounded-2xl space-y-1 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 uppercase font-extrabold tracking-wider">Active Tourists</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{totalTourists}</span>
            <span className="text-xs font-bold text-emerald-400">({safeTourists} Safe 🟢)</span>
          </div>
          <div className="text-[10px] text-amber-400 font-medium">
            {touristsAtRisk} tourists approaching warning buffers
          </div>
        </motion.div>

        {/* Card 2: Active Incidents & SOS */}
        <motion.div whileHover={{ y: -3 }} className="pro-glass-card p-4 rounded-2xl border-red-500/30 space-y-1 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-red-400 uppercase font-extrabold tracking-wider">Emergency Incidents</span>
            <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertOctagon className="w-3.5 h-3.5 animate-pulse" />
            </div>
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
        </motion.div>

        {/* Card 3: Danger Zones & Threat Radii */}
        <motion.div whileHover={{ y: -3 }} className="pro-glass-card p-4 rounded-2xl border-amber-500/30 space-y-1 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-amber-400 uppercase font-extrabold tracking-wider">Danger Zones & Radii</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-amber-300">{geofences.length}</span>
            <span className="text-xs text-slate-400 font-semibold">Active Perimeters</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-medium">
            Real-time proximity alarms armed
          </div>
        </motion.div>

        {/* Card 4: Response Latency / AI Defense */}
        <motion.div whileHover={{ y: -3 }} className="pro-glass-card p-4 rounded-2xl border-emerald-500/30 space-y-1 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-emerald-400 uppercase font-extrabold tracking-wider">AI Defense Engine</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-emerald-300">98.4%</span>
            <span className="text-xs text-slate-400">Hazard Detection</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Avg Police SOS Dispatch: <strong className="text-white">~3.8 min</strong>
          </div>
        </motion.div>

      </motion.div>

      {/* 3. Hero Command Map with Quick Filter */}
      <motion.div variants={itemVariants} className="pro-glass-card rounded-3xl p-5 space-y-3 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Live Tactical Radar & Threat Zone Map</h2>
              <p className="text-xs text-slate-400">
                Circular Danger Radii • Geo-Fence Boundaries • Live Tourist GPS Pins
              </p>
            </div>
          </div>

          {/* Easy Filter Buttons */}
          <div className="flex items-center space-x-1.5 text-xs bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
            <span className="text-slate-400 ml-2 mr-1 hidden sm:inline font-bold">Filter:</span>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'CRITICAL', label: '🔴 SOS Alerts' },
              { id: 'HIGH', label: '🟠 At-Risk' },
              { id: 'SAFE', label: '🟢 Safe' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterRisk(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterRisk === f.id
                    ? 'bg-emerald-500 text-white shadow-md glow-green'
                    : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-850'
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
      </motion.div>

      {/* 4. Simplified Operations Center: 2 Clean Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Panel A: Live Emergency SOS & Incidents */}
        <div className="pro-glass-card rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2">
                <AlertOctagon className="w-5 h-5 text-red-400 animate-pulse" />
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Live Emergency SOS & Incidents ({activeIncidents.length})
                </h3>
              </div>
              <Link to="/incidents" className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline font-bold">
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

                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => onUpdateIncidentStatus(inc.id, 'IN_PROGRESS', 'Assam Tourist Police HQ')}
                        className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold shrink-0 shadow-md transition-all"
                      >
                        Dispatch Police Team
                      </motion.button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>State Police Dispatch CAD: <strong className="text-emerald-400 font-mono">CONNECTED</strong></span>
            <span>Emergency Toll Free: <strong className="text-amber-300 font-mono">112 / 108</strong></span>
          </div>
        </div>

        {/* Panel B: Active Danger Zones & Threat Radii Controller */}
        <div className="pro-glass-card rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Active Danger Zones & Threat Radii ({geofences.length})
                </h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Danger Area</span>
              </motion.button>
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
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleToggleZone(gf)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            gf.active !== false
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 glow-green'
                              : 'bg-slate-800 text-slate-500 border-slate-700'
                          }`}
                          title={gf.active !== false ? 'Deactivate Zone' : 'Activate Zone'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </motion.button>

                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteZone(gf.id, gf.name)}
                          className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60 border border-red-500/30 transition-colors"
                          title="Delete Zone"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setShowCreateModal(true)}
            className="w-full py-2.5 bg-slate-900/90 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl border border-slate-700/80 transition-colors flex items-center justify-center space-x-2 shadow-md"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Configure New Danger Area & Radius</span>
          </motion.button>
        </div>

      </motion.div>

      {/* Interactive Modal: Set New Danger Area & Radius */}
      <CreateDangerAreaModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleZoneCreated}
      />

    </motion.div>
  );
}
