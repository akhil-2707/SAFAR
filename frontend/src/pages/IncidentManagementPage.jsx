import React, { useState } from 'react';
import IncidentTimeline from '../components/IncidentTimeline';
import MiniMap from '../components/MiniMap';
import { AlertOctagon, ShieldAlert, CheckCircle2, Clock, UserCheck, Edit3, MessageSquare, Filter, MapPin } from 'lucide-react';

export default function IncidentManagementPage({ incidents = [], geofences = [], onUpdateStatus }) {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // Status update form states
  const [newStatus, setNewStatus] = useState('');
  const [assignedTeam, setAssignedTeam] = useState('');
  const [note, setNote] = useState('');
  const [categoryOverride, setCategoryOverride] = useState('');
  const [severityOverride, setSeverityOverride] = useState('');

  const filteredIncidents = incidents.filter((i) => {
    if (filterSeverity !== 'ALL' && i.severity !== filterSeverity) return false;
    if (filterStatus !== 'ALL' && i.status !== filterStatus) return false;
    return true;
  });

  const handleOpenModal = (inc) => {
    setSelectedIncident(inc);
    setNewStatus(inc.status);
    setAssignedTeam(inc.assignedAuthority || 'Assam Tourist Police HQ');
    setNote('');
    setCategoryOverride(inc.type);
    setSeverityOverride(inc.severity);
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    if (!selectedIncident) return;
    await onUpdateStatus(
      selectedIncident.id,
      newStatus,
      assignedTeam,
      note,
      severityOverride,
      categoryOverride
    );
    setSelectedIncident(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="bg-white/95 border border-gray-200/80 rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Emergency Incident Management Console</h2>
          <p className="text-xs text-gray-500 font-medium">
            Real-Time Response Dispatch & AI Category Override Console
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-2 text-xs">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-800 rounded-xl p-2 font-bold shadow-sm"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">CRITICAL 🔴</option>
            <option value="HIGH">HIGH 🟠</option>
            <option value="MEDIUM">MEDIUM 🟡</option>
            <option value="LOW">LOW 🟢</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-800 rounded-xl p-2 font-bold shadow-sm"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">NEW</option>
            <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
        </div>
      </div>

      {/* Incidents Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredIncidents.length === 0 ? (
          <div className="md:col-span-2 bg-white/95 border border-gray-200 rounded-2xl p-12 text-center text-gray-500 text-sm shadow-md">
            No incidents match selected filters
          </div>
        ) : (
          filteredIncidents.map((inc) => (
            <div
              key={inc.id}
              className="bg-white/95 border border-gray-200/80 rounded-2xl p-5 shadow-lg space-y-4 hover:border-gray-300 transition-all flex flex-col justify-between backdrop-blur-xl"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-black text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 shadow-sm">
                      {inc.id}
                    </span>
                    <span className="font-extrabold text-sm text-gray-900">{inc.touristName}</span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      inc.severity === 'CRITICAL'
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : inc.severity === 'HIGH'
                        ? 'bg-orange-50 text-orange-800 border border-orange-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {inc.severity}
                  </span>
                </div>

                {/* Embedded MiniMap of Incident Location */}
                {inc.location && (
                  <MiniMap
                    center={inc.location}
                    geofences={geofences}
                    title={`Incident Spot: ${inc.id}`}
                    height="140px"
                    markerColor="#EF4444"
                  />
                )}

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-200 shadow-sm">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">Category</span>
                    <span className="font-bold text-gray-900">{inc.type}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">Status</span>
                    <span className="font-extrabold text-emerald-700">{inc.status}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-700 bg-gray-50/80 p-3 rounded-xl border border-gray-200 leading-relaxed shadow-sm">
                  {inc.description}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-gray-500 font-mono font-medium">
                  {new Date(inc.time).toLocaleTimeString()}
                </span>

                <button
                  onClick={() => handleOpenModal(inc)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-emerald-600 hover:from-orange-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Update Workflow</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Workflow & Response Update Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white/98 border border-gray-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto backdrop-blur-2xl">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900">Incident Response Command Modal</h3>
                <span className="text-xs font-mono font-bold text-red-700">{selectedIncident.id} — {selectedIncident.touristName}</span>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                ✕
              </button>
            </div>

            {/* Embedded MiniMap inside Modal */}
            {selectedIncident.location && (
              <MiniMap
                center={selectedIncident.location}
                geofences={geofences}
                title={`Incident Spot: ${selectedIncident.location.address}`}
                height="160px"
                markerColor="#EF4444"
              />
            )}

            {/* Interactive Timeline */}
            <IncidentTimeline timeline={selectedIncident.timeline} />

            {/* Update Form */}
            <form onSubmit={handleSaveUpdate} className="space-y-4 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                Update Status & Override Parameters
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Status Transition</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="NEW">NEW</option>
                    <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Assigned Dispatch Unit</label>
                  <input
                    type="text"
                    value={assignedTeam}
                    onChange={(e) => setAssignedTeam(e.target.value)}
                    placeholder="Assam Tourist Police Unit 4"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-gray-700 font-semibold block mb-1">AI Category Override</label>
                  <select
                    value={categoryOverride}
                    onChange={(e) => setCategoryOverride(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="SOS Emergency">SOS Emergency</option>
                    <option value="Medical Emergency">Medical Emergency</option>
                    <option value="Accident">Accident</option>
                    <option value="Missing Tourist">Missing Tourist</option>
                    <option value="Geo-fence Violation">Geo-fence Violation</option>
                    <option value="Suspicious Movement">Suspicious Movement</option>
                    <option value="Natural Hazard">Natural Hazard</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Severity Override</label>
                  <select
                    value={severityOverride}
                    onChange={(e) => setSeverityOverride(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-bold"
                  >
                    <option value="CRITICAL">CRITICAL 🔴</option>
                    <option value="HIGH">HIGH 🟠</option>
                    <option value="MEDIUM">MEDIUM 🟡</option>
                    <option value="LOW">LOW 🟢</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-700 font-semibold block mb-1">Response Log Note</label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Enter official response notes / dispatch telemetry updates..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedIncident(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all"
                >
                  Save & Update Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
