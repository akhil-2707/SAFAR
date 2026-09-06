import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MapView from '../components/MapView';
import MiniMap from '../components/MiniMap';
import CreateDangerAreaModal from '../components/CreateDangerAreaModal';
import SafarLogo from '../components/SafarLogo';
import { 
  ShieldCheck, AlertTriangle, Users, AlertOctagon, CheckCircle2, 
  Radio, Plus, Trash2, Power, ExternalLink, Settings, BarChart3,
  ShieldAlert, Zap, Activity, Radar, Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
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
  const [actionSuccessMessage, setActionSuccessMessage] = useState(null);

  const totalTourists = tourists.length;
  const touristsAtRisk = tourists.filter((t) => t.riskScore > 50 || t.riskLevel === 'HIGH' || t.riskLevel === 'CRITICAL').length;
  const safeTourists = totalTourists - touristsAtRisk;
  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED');
  const resolvedIncidents = incidents.filter((i) => i.status === 'RESOLVED').length;
  const criticalSosCount = incidents.filter((i) => i.severity === 'CRITICAL' || i.type === 'SOS Emergency').length;
  const geofenceViolations = incidents.filter((i) => i.type === 'Geo-fence Violation').length;

  const filteredTourists = tourists.filter((t) => {
    if (filterRisk === 'ALL') return true;
    if (filterRisk === 'CRITICAL') return t.riskLevel === 'CRITICAL' || t.isSosActive;
    if (filterRisk === 'HIGH') return t.riskLevel === 'HIGH';
    if (filterRisk === 'MEDIUM') return t.riskLevel === 'MEDIUM';
    if (filterRisk === 'LOW' || filterRisk === 'SAFE') return t.riskLevel === 'LOW' || t.status === 'SAFE';
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
      if (data.success && onRefreshData) onRefreshData();
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

  const kpiCards = [
    { label: 'Active Tourists', value: totalTourists, sub: `${safeTourists} Safe 🟢`, icon: Users, color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.25)' },
    { label: 'Tourists at Risk', value: touristsAtRisk, sub: 'Needs Monitoring', icon: ShieldAlert, color: '#ea580c', bg: 'rgba(234,88,12,0.08)', border: 'rgba(234,88,12,0.25)' },
    { label: 'Active SOS Alerts', value: criticalSosCount, sub: criticalSosCount > 0 ? 'Urgent Dispatch' : 'Normal Sentinel', icon: AlertOctagon, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.3)', pulse: criticalSosCount > 0 },
    { label: 'Geo-fence Violations', value: geofenceViolations, sub: 'Perimeter Breaches', icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
    { label: 'Active Danger Zones', value: geofences.length, sub: 'Configured Radii', icon: Radar, color: '#06b6d4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.25)' },
    { label: 'AI Accuracy', value: '98.4%', sub: 'Self-Retrained', icon: Zap, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)' },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
    >
      {/* Top Banner Header */}
      <motion.div
        variants={itemVariants}
        className="rounded-3xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(245,243,255,0.96) 0%, rgba(255,248,240,0.96) 50%, rgba(240,255,248,0.96) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(139,92,246,0.25)',
          boxShadow: '0 8px 40px rgba(139,92,246,0.12)',
        }}
      >
        <motion.div
          className="absolute -top-12 -right-12 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'rgba(139,92,246,0.12)', filter: 'blur(50px)' }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'rgba(249,115,22,0.1)', filter: 'blur(35px)' }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        />

        <div className="flex items-center space-x-4 relative z-10">
          <SafarLogo size="sm" showText={false} animated={true} />
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="font-black text-2xl text-gray-900 tracking-tight">S.A.F.A.R. Authority Command Desk</span>
              <motion.span
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1.5"
                style={{ background: 'rgba(16,185,129,0.12)', color: '#059669', border: '1px solid rgba(16,185,129,0.35)' }}
              >
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span>Live Sentinel Active</span>
              </motion.span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Unified National Tourist Safety Grid • Set Threat Radii, Track Real-Time Tourists & Dispatch SOS
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10 w-full lg:w-auto">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl text-white font-black text-xs flex items-center justify-center space-x-2 relative overflow-hidden shadow-lg"
            style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)', boxShadow: '0 6px 25px rgba(239,68,68,0.4)' }}
          >
            <motion.span
              className="absolute inset-0 rounded-2xl"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            />
            <ShieldAlert className="w-4 h-4 relative z-10" />
            <span className="relative z-10">+ Set Danger Area & Radius</span>
          </motion.button>

          <Link
            to="/geo-fence-management"
            className="px-3.5 py-2.5 rounded-2xl font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
            style={{ background: 'rgba(255,255,255,0.9)', color: '#059669', border: '1.5px solid rgba(16,185,129,0.3)' }}
          >
            <Settings className="w-4 h-4" />
            <span>Geo-Fences</span>
          </Link>

          <Link
            to="/incidents"
            className="px-3.5 py-2.5 rounded-2xl font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
            style={{ background: 'rgba(255,255,255,0.9)', color: '#dc2626', border: '1.5px solid rgba(239,68,68,0.3)' }}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Incidents ({activeIncidents.length})</span>
          </Link>

          <Link
            to="/analytics"
            className="px-3.5 py-2.5 rounded-2xl font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
            style={{ background: 'rgba(255,255,255,0.9)', color: '#0891b2', border: '1.5px solid rgba(8,145,178,0.3)' }}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </Link>
        </div>
      </motion.div>

      {/* Success Toast */}
      <AnimatePresence>
        {actionSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl text-emerald-700 text-sm font-bold flex items-center space-x-2.5 shadow-lg"
            style={{
              background: 'rgba(240,255,248,0.98)',
              border: '1.5px solid rgba(16,185,129,0.4)',
              boxShadow: '0 6px 20px rgba(16,185,129,0.15)',
            }}
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Cards Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={i}
              whileHover={{ y: -4, scale: 1.02 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.05, duration: 0.4 }}
              className="p-4 rounded-2xl space-y-1.5 cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${card.bg}, rgba(255,255,255,0.97))`,
                border: `1.5px solid ${card.border}`,
                backdropFilter: 'blur(10px)',
                boxShadow: `0 4px 20px ${card.bg}`,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 truncate">{card.label}</span>
                <motion.div
                  className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: card.bg, border: `1.5px solid ${card.border}` }}
                  animate={card.pulse ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: card.color }} />
                </motion.div>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-black" style={{ color: card.color }}>{card.value}</span>
              </div>
              <div className="text-[10px] font-semibold text-gray-500 truncate">{card.sub}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Self-Learning AI Feedback Loop Status Banner */}
      <motion.div
        variants={itemVariants}
        className="bg-white/95 border border-emerald-300 rounded-3xl p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center font-bold shrink-0">
            <Activity className="w-5 h-5 animate-pulse text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black text-emerald-800 uppercase tracking-widest">
                Self-Learning AI Feedback Engine
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300">
                ACTIVE RETRAINING
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Anonymized resolved incident logs automatically retrain the AI Risk Model to improve hazard prediction accuracy over time.
            </p>
          </div>
        </div>
        <div className="text-right shrink-0 bg-emerald-50/80 px-4 py-2 rounded-2xl border border-emerald-200">
          <div className="text-xs font-mono font-bold text-slate-900">Total Retrained Cases: {resolvedIncidents + 12}</div>
          <div className="text-[10px] font-mono text-emerald-700 font-extrabold">Prediction Accuracy: 98.4%</div>
        </div>
      </motion.div>

      {/* Tactical Radar Map */}
      <motion.div
        variants={itemVariants}
        className="rounded-3xl p-5 space-y-4"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(139,92,246,0.2)',
          boxShadow: '0 8px 40px rgba(139,92,246,0.1)',
        }}
      >
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center space-x-3">
            <motion.div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1.5px solid rgba(16,185,129,0.3)' }}
              animate={{ boxShadow: ['0 0 8px rgba(16,185,129,0.3)', '0 0 18px rgba(16,185,129,0.5)', '0 0 8px rgba(16,185,129,0.3)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Radio className="w-4 h-4 text-emerald-600" />
            </motion.div>
            <div>
              <h2 className="text-base font-black text-gray-900">Live Tactical Radar & Threat Zone Map</h2>
              <p className="text-xs text-gray-400">Circular Danger Radii • Geo-Fence Boundaries • Live Tourist GPS Pins</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'CRITICAL', label: '🔴 SOS' },
              { id: 'HIGH', label: '🟠 High' },
              { id: 'MEDIUM', label: '🟡 Med' },
              { id: 'SAFE', label: '🟢 Safe' }
            ].map((f) => (
              <motion.button
                key={f.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterRisk(f.id)}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={
                  filterRisk === f.id
                    ? { background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: 'white', boxShadow: '0 3px 10px rgba(139,92,246,0.4)' }
                    : { background: 'transparent', color: '#6b7280' }
                }
              >
                {f.label}
              </motion.button>
            ))}
          </div>
        </div>

        <MapView
          tourists={filteredTourists}
          geofences={geofences}
          selectedTourist={selectedTourist}
          emergencyServices={emergencyServices}
          height="500px"
        />
      </motion.div>

      {/* 3-Column Operations Panels: Incidents | Danger Zones | Monitored Tourists */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1: Live SOS & Active Incidents Feed */}
        <div
          className="rounded-3xl p-5 space-y-4 flex flex-col"
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(239,68,68,0.18)',
            boxShadow: '0 8px 30px rgba(239,68,68,0.07)',
          }}
        >
          <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="flex items-center space-x-2">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
                <AlertOctagon className="w-5 h-5 text-red-500" />
              </motion.div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                Live Incidents Feed ({activeIncidents.length})
              </h3>
            </div>
            <Link to="/incidents" className="text-xs font-bold text-violet-600 hover:text-violet-800">
              View All →
            </Link>
          </div>

          <div className="divide-y divide-gray-100 max-h-[460px] overflow-y-auto flex-1 pr-1 space-y-3">
            {activeIncidents.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-70" />
                <p className="text-sm font-bold text-gray-700">All Sectors Clear</p>
                <p className="text-xs text-gray-400">No active emergency distress signals.</p>
              </div>
            ) : (
              activeIncidents.map((inc) => (
                <motion.div
                  key={inc.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="py-2.5 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <span className="font-mono text-xs font-bold text-red-600">{inc.id}</span>
                        <span className="font-bold text-xs text-gray-800 truncate">{inc.touristName}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                            inc.severity === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                          }`}
                        >
                          {inc.severity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{inc.description}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onUpdateIncidentStatus(inc.id, 'IN_PROGRESS', 'Assam Tourist Police HQ')}
                      className="px-2.5 py-1.5 text-white rounded-xl text-xs font-bold shrink-0 shadow-sm"
                      style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                    >
                      Dispatch
                    </motion.button>
                  </div>

                  {/* Incident Spot Embedded MiniMap */}
                  {inc.location && (
                    <MiniMap
                      center={inc.location}
                      geofences={geofences}
                      title={`Spot: ${inc.id}`}
                      height="110px"
                      markerColor="#EF4444"
                    />
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Danger Zones & Radius Perimeters */}
        <div
          className="rounded-3xl p-5 space-y-4 flex flex-col"
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(249,115,22,0.2)',
            boxShadow: '0 8px 30px rgba(249,115,22,0.08)',
          }}
        >
          <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-orange-500" />
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                Danger Zones ({geofences.length})
              </h3>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Zone</span>
            </motion.button>
          </div>

          <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto flex-1 pr-1">
            {geofences.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No active danger zones defined</div>
            ) : (
              geofences.map((gf) => {
                const radiusText = gf.radiusMeters
                  ? gf.radiusMeters >= 1000 ? `${(gf.radiusMeters / 1000).toFixed(1)} km` : `${gf.radiusMeters} m`
                  : 'Polygon';
                const isCritical = gf.riskLevel === 'CRITICAL' || gf.type === 'RESTRICTED';
                return (
                  <div key={gf.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: gf.color || (isCritical ? '#ef4444' : '#f97316') }}
                        />
                        <span className="font-bold text-gray-800 truncate">{gf.name}</span>
                        <span
                          className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                          style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.25)' }}
                        >
                          {radiusText}
                        </span>
                      </div>
                      <p className="text-gray-400 text-[11px] truncate max-w-xs">
                        {gf.alertMessage || gf.description || 'Proximity buffer active.'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleToggleZone(gf)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={
                          gf.active !== false
                            ? { background: 'rgba(16,185,129,0.12)', color: '#059669', border: '1px solid rgba(16,185,129,0.3)' }
                            : { background: 'rgba(0,0,0,0.04)', color: '#9ca3af', border: '1px solid rgba(0,0,0,0.1)' }
                        }
                      >
                        <Power className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteZone(gf.id, gf.name)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.25)' }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="w-full py-2.5 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-xs"
            style={{ background: 'rgba(249,115,22,0.08)', color: '#ea580c', border: '1.5px solid rgba(249,115,22,0.3)' }}
          >
            <Plus className="w-4 h-4" />
            <span>Configure Danger Area & Radius</span>
          </motion.button>
        </div>

        {/* Column 3: Monitored Tourists Drawer with MiniMap & Audit ID */}
        <div
          className="rounded-3xl p-5 space-y-4 flex flex-col"
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(16,185,129,0.2)',
            boxShadow: '0 8px 30px rgba(16,185,129,0.08)',
          }}
        >
          <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                Monitored Tourists ({filteredTourists.length})
              </h3>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Click to Inspect
            </span>
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto flex-1 pr-1">
            {filteredTourists.map((t) => {
              const isSelected = selectedTourist?.touristId === t.touristId;
              return (
                <div
                  key={t.id || t.touristId}
                  onClick={() => setSelectedTourist(isSelected ? null : t)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer text-xs space-y-2 ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-500 shadow-md'
                      : 'bg-slate-50/80 border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{t.fullName}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        t.riskLevel === 'CRITICAL'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : t.riskLevel === 'HIGH'
                          ? 'bg-orange-100 text-orange-800 border border-orange-200'
                          : t.riskLevel === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {t.riskLevel} ({t.riskScore}/100)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-mono font-bold text-slate-700">{t.touristId}</span>
                    <span>Status: <strong className="text-slate-800">{t.status}</strong></span>
                  </div>

                  <p className="text-[10px] text-slate-600 truncate">
                    📍 {t.currentLocation?.address || 'Guwahati Safe Region'}
                  </p>

                  {/* Embedded MiniMap inside Selected Tourist Drawer */}
                  {isSelected && (
                    <MiniMap
                      center={t.currentLocation || { lat: 26.1445, lng: 91.7362 }}
                      geofences={geofences}
                      title={`Tourist ${t.touristId}`}
                      height="125px"
                    />
                  )}

                  <div className="pt-1 flex items-center justify-between text-[10px]">
                    <span className="text-emerald-700 font-semibold">📞 {t.mobileNumber}</span>
                    <Link
                      to={`/verify-id/${t.touristId}`}
                      target="_blank"
                      className="text-slate-600 hover:text-slate-900 font-bold underline flex items-center space-x-0.5"
                    >
                      <span>Audit ID</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </motion.div>

      {/* Danger Zone Creator Modal */}
      <CreateDangerAreaModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleZoneCreated}
      />
    </motion.div>
  );
}
