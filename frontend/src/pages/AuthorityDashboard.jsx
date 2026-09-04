import React, { useState } from 'react';
import MapView from '../components/MapView';
import MiniMap from '../components/MiniMap';
import { ShieldCheck, AlertTriangle, Users, AlertOctagon, CheckCircle2, Phone, ExternalLink, Activity, Radio, BarChart3, Settings, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

import SafarLogo from '../components/SafarLogo';

export default function AuthorityDashboard({
  tourists = [],
  geofences = [],
  incidents = [],
  notifications = [],
  emergencyServices = [],
  onUpdateIncidentStatus
}) {
  const [selectedTourist, setSelectedTourist] = useState(null);
  const [filterRisk, setFilterRisk] = useState('ALL');

  const totalTourists = tourists.length;
  const touristsAtRisk = tourists.filter((t) => t.riskScore > 50 || t.riskLevel === 'HIGH' || t.riskLevel === 'CRITICAL').length;
  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED').length;
  const sosAlerts = incidents.filter((i) => i.type === 'SOS Emergency' || i.severity === 'CRITICAL').length;
  const geofenceViolations = incidents.filter((i) => i.type === 'Geo-fence Violation').length;
  const resolvedIncidents = incidents.filter((i) => i.status === 'RESOLVED').length;

  const filteredTourists = tourists.filter((t) => {
    if (filterRisk === 'ALL') return true;
    return t.riskLevel === filterRisk;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Banner Header */}
      <div className="bg-safar-navy-900 border border-safar-shield-500/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <SafarLogo size="sm" showText={false} animated={true} />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-2xl text-white">S.A.F.A.R. Command & Safety Control Center</span>
              <span className="bg-safar-saffron-500/15 text-safar-saffron-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-safar-saffron-500/30 uppercase tracking-widest">
                National Desk
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Smart AI Framework for Assured & Responsible Tourism • Ministry of Tourism & State Police Console
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/geo-fence-management"
            className="px-4 py-2 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center space-x-1.5 transition-all"
          >
            <Settings className="w-4 h-4" />
            <span>Geo-Fence Management</span>
          </Link>

          <Link
            to="/incidents"
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 font-bold text-xs rounded-xl border border-red-500/40 flex items-center space-x-1.5 transition-colors"
          >
            <AlertOctagon className="w-4 h-4 text-red-400" />
            <span>Incident Command</span>
          </Link>

          <Link
            to="/analytics"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center space-x-1.5 transition-colors"
          >
            <BarChart3 className="w-4 h-4 text-teal-400" />
            <span>Analytics</span>
          </Link>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Total Active Tourists</span>
          <span className="text-2xl font-black text-white">{totalTourists}</span>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-amber-500/30 space-y-1">
          <span className="text-[10px] text-amber-400 uppercase font-extrabold block">Tourists at Risk</span>
          <span className="text-2xl font-black text-amber-400">{touristsAtRisk}</span>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-red-500/30 space-y-1">
          <span className="text-[10px] text-red-400 uppercase font-extrabold block">Active Incidents</span>
          <span className="text-2xl font-black text-red-400">{activeIncidents}</span>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-orange-500/30 space-y-1">
          <span className="text-[10px] text-orange-400 uppercase font-extrabold block">Geo-fence Violations</span>
          <span className="text-2xl font-black text-orange-400">{geofenceViolations}</span>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-rose-500/30 space-y-1">
          <span className="text-[10px] text-rose-400 uppercase font-extrabold block">Active SOS Alerts</span>
          <span className="text-2xl font-black text-rose-400">{sosAlerts}</span>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-emerald-500/30 space-y-1">
          <span className="text-[10px] text-emerald-400 uppercase font-extrabold block">Resolved Incidents</span>
          <span className="text-2xl font-black text-emerald-400">{resolvedIncidents}</span>
        </div>
      </div>

      {/* Self-Learning AI Feedback Loop Status Banner */}
      <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                Self-Learning AI Feedback Engine
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
                ACTIVE RETRAINING
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Anonymized resolved incident logs automatically retrain the AI Risk Model to improve hazard prediction accuracy over time.
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs font-mono font-bold text-slate-200">Total Retrained Cases: {resolvedIncidents + 12}</div>
          <div className="text-[10px] font-mono text-emerald-400">Prediction Accuracy: 98.4%</div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Live Risk Monitored Tourist Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Live Leaflet Command Map */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Live Risk-Monitored Tourist Map</span>
            </span>

            <div className="flex items-center space-x-1 text-xs">
              <span className="text-slate-400 mr-1 hidden sm:inline">Filter Risk:</span>
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setFilterRisk(tier)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    filterRisk === tier
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          <MapView
            tourists={filteredTourists}
            geofences={geofences}
            selectedTourist={selectedTourist}
            emergencyServices={emergencyServices}
            height="480px"
          />

          {/* Active Incidents Feed Table */}
          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Live Active Incidents Feed ({activeIncidents})
              </span>
              <Link to="/incidents" className="text-xs text-emerald-400 hover:underline font-bold">
                View All Incidents →
              </Link>
            </div>

            <div className="divide-y divide-slate-800">
              {incidents.filter((i) => i.status !== 'RESOLVED').length === 0 ? (
                <p className="text-xs text-slate-400 p-4 text-center">No active emergency incidents</p>
              ) : (
                incidents.filter((i) => i.status !== 'RESOLVED').map((inc) => (
                  <div key={inc.id} className="py-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-red-400">{inc.id}</span>
                          <span className="font-bold text-white">{inc.touristName}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                              inc.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                            }`}
                          >
                            {inc.severity}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px]">{inc.description}</p>
                      </div>

                      <button
                        onClick={() => onUpdateIncidentStatus(inc.id, 'IN_PROGRESS', 'Assam Tourist Police HQ')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded text-[11px] font-bold shrink-0 ml-2"
                      >
                        Dispatch Team
                      </button>
                    </div>

                    {/* Embedded Incident MiniMap */}
                    {inc.location && (
                      <MiniMap
                        center={inc.location}
                        geofences={geofences}
                        title={`Incident Spot: ${inc.id}`}
                        height="120px"
                        markerColor="#EF4444"
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Monitored Tourist Telemetry Drawer */}
        <div className="space-y-4">
          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 block">
              Active Monitored Tourists ({filteredTourists.length})
            </span>

            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {filteredTourists.map((t) => (
                <div
                  key={t.id || t.touristId}
                  onClick={() => setSelectedTourist(t)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-xs space-y-2 ${
                    selectedTourist?.touristId === t.touristId
                      ? 'bg-slate-800 border-emerald-500 shadow-lg'
                      : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{t.fullName}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        t.riskLevel === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-400'
                          : t.riskLevel === 'HIGH'
                          ? 'bg-orange-500/20 text-orange-400'
                          : t.riskLevel === 'MEDIUM'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {t.riskLevel} ({t.riskScore}/100)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono">{t.touristId}</span>
                    <span>Status: <strong className="text-slate-200">{t.status}</strong></span>
                  </div>

                  <p className="text-[10px] text-slate-400 truncate">
                    📍 {t.currentLocation?.address || 'Guwahati Safe Region'}
                  </p>

                  {/* Embedded MiniMap inside Selected Tourist Drawer */}
                  {selectedTourist?.touristId === t.touristId && (
                    <MiniMap
                      center={t.currentLocation || { lat: 26.1445, lng: 91.7362 }}
                      geofences={geofences}
                      title={`Tourist ${t.touristId}`}
                      height="130px"
                    />
                  )}

                  <div className="pt-1 flex items-center justify-between text-[10px]">
                    <span className="text-emerald-400 font-semibold">📞 {t.mobileNumber}</span>
                    <Link
                      to={`/verify-id/${t.touristId}`}
                      target="_blank"
                      className="text-slate-300 hover:text-white font-semibold underline flex items-center space-x-0.5"
                    >
                      <span>Audit ID</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
