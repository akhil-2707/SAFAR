import React, { useState, useEffect } from 'react';
import { AlertOctagon, PhoneCall, ShieldAlert, X, CheckCircle2, Clock, MapPin, Hospital, Building2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SOSButtonModal({
  tourist,
  activeSosIncident,
  onTriggerSos,
  onCancelSos,
  nearbyServices = []
}) {
  const { t } = useLanguage();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [loading, setLoading] = useState(false);

  const isSosActive = tourist?.isSosActive || tourist?.status === 'CRITICAL_SOS';

  // Live timer tick for active SOS
  useEffect(() => {
    let interval = null;
    if (isSosActive) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setTimerSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isSosActive]);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConfirmTrigger = async () => {
    setLoading(true);
    try {
      await onTriggerSos();
      setShowConfirmModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    setLoading(true);
    try {
      await onCancelSos(cancelReason || 'Tourist confirmed safe condition');
      setShowCancelConfirmModal(false);
      setCancelReason('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Prominent SOS Button */}
      {!isSosActive ? (
        <button
          onClick={() => setShowConfirmModal(true)}
          className="w-full py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xl rounded-2xl shadow-2xl glow-red flex items-center justify-center space-x-3 transition-transform active:scale-95 group border border-red-400/40"
        >
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center sos-radar-animation">
            <AlertOctagon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </div>
          <span className="tracking-wider uppercase">{t('tdbSosButtonText', 'TRIGGER EMERGENCY SOS')}</span>
        </button>
      ) : (
        /* Active SOS Dispatch Card */
        <div className="bg-red-950/80 border-2 border-red-500 rounded-2xl p-5 shadow-2xl glow-red space-y-4 text-white">
          <div className="flex items-center justify-between border-b border-red-500/30 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <AlertOctagon className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="font-black text-lg text-white">{t('tdbSosActiveAlert', 'EMERGENCY SOS BROADCAST ACTIVE')}</h3>
                <p className="text-xs text-red-200">Authorities & Emergency Dispatchers Notified</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-red-300 uppercase font-bold block">Response Time</span>
              <span className="text-xl font-mono font-black text-red-300">{formatTimer(timerSeconds)}</span>
            </div>
          </div>

          {/* Dispatch Status */}
          <div className="bg-slate-900/80 rounded-xl p-3 border border-red-500/30 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Incident Reference:</span>
              <span className="font-mono font-bold text-red-400">{activeSosIncident?.id || 'INC-SOS-LIVE'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Dispatch Status:</span>
              <span className="font-bold text-emerald-400 uppercase">{activeSosIncident?.status || 'ASSIGNED'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Assigned Team:</span>
              <span className="font-semibold text-slate-200">{activeSosIncident?.assignedAuthority || 'Assam Tourist Police HQ'}</span>
            </div>
          </div>

          {/* Nearby Emergency Services */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-red-200 block uppercase tracking-wider">
              Nearby Emergency Services (Live Dispatch)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {nearbyServices.slice(0, 2).map((s) => (
                <div key={s.id} className="p-2 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block truncate">{s.name}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">{s.phone}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">{s.distanceKm} km</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cancel SOS Button */}
          <button
            onClick={() => setShowCancelConfirmModal(true)}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-red-400 hover:text-red-300 rounded-xl font-bold text-xs border border-red-500/40 transition-colors"
          >
            {t('tdbCancelSos', 'Cancel SOS (Mark False Alarm)')}
          </button>
        </div>
      )}

      {/* Confirmation Modal to Trigger SOS */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-navy-900 border-2 border-red-500 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center space-x-3 text-red-500">
              <ShieldAlert className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-black text-white">Confirm Emergency SOS</h3>
                <p className="text-xs text-slate-400">Trigger immediate authority & police alert</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This action will dispatch your current GPS coordinates, transmit a high-priority distress alert to the State Tourist Command Desk, and initialize emergency response teams.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <button
                disabled={loading}
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Back / Cancel
              </button>
              <button
                disabled={loading}
                onClick={handleConfirmTrigger}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-lg glow-red"
              >
                {loading ? 'Dispatching...' : 'CONFIRM SOS DISPATCH'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal to Cancel SOS */}
      {showCancelConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Cancel Emergency SOS Signal</h3>
            <p className="text-xs text-slate-300">
              Please confirm that you are safe and wish to stand down emergency dispatch units.
            </p>

            <textarea
              rows={2}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation (e.g. Accidental click / Reached safe location)..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />

            <div className="flex items-center space-x-3 pt-2">
              <button
                disabled={loading}
                onClick={() => setShowCancelConfirmModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Keep SOS Active
              </button>
              <button
                disabled={loading}
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg"
              >
                {loading ? 'Processing...' : 'Confirm Safety & Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
