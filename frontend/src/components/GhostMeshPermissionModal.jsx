import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  ShieldCheck,
  BatteryCharging,
  WifiOff,
  Radar,
  CheckCircle2,
  X,
  AlertTriangle,
  Lock,
  Cpu,
  ChevronRight,
  MapPin,
  Smartphone
} from 'lucide-react';

export default function GhostMeshPermissionModal({ isOpen, onClose, onGranted }) {
  const [permissionState, setPermissionState] = useState(
    localStorage.getItem('safar_device_permissions') || 'pending'
  );
  const [activating, setActivating] = useState(false);

  const handleAuthorize = () => {
    setActivating(true);

    // Request actual browser / mobile GPS location
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {},
        (err) => console.warn('Browser GPS permission note:', err.message),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }

    setTimeout(() => {
      localStorage.setItem('safar_ble_mesh_permission', 'granted');
      localStorage.setItem('safar_device_permissions', 'granted');
      setPermissionState('granted');
      setActivating(false);
      if (onGranted) onGranted();
      if (onClose) onClose();
    }, 800);
  };

  const handleDismiss = () => {
    localStorage.setItem('safar_ble_mesh_permission', 'dismissed');
    localStorage.setItem('safar_device_permissions', 'dismissed');
    setPermissionState('dismissed');
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl shadow-emerald-950/50 overflow-hidden text-slate-100"
        >
          {/* Top Tricolor Accent Line */}
          <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-500" />

          {/* Header */}
          <div className="p-5 sm:p-6 pb-4 border-b border-slate-800/80 bg-slate-900/90 relative">
            <button
              onClick={handleDismiss}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner shrink-0">
                <ShieldCheck className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Mobile Safety Shield
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-medium text-slate-400">
                    S.A.F.A.R. Telemetry
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1 leading-tight">
                  Allow Location & Bluetooth Lifeline?
                </h3>
                <p className="text-[11px] text-emerald-300 font-semibold mt-0.5">
                  "Can we use your Bluetooth and Location for real-time safety monitoring and Ghost-Mesh rescue?"
                </p>
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-5 sm:p-6 space-y-3.5 text-xs sm:text-sm text-slate-300">
            <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
              S.A.F.A.R. requires these permissions for real-time tourist safety monitoring, perimeter buffer breach warnings, and peer-to-peer 0-cellular distress relays:
            </p>

            {/* Spec Cards: Location + Bluetooth */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>High-Precision GPS</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Triggers <strong className="text-slate-200">300m/150m boundary cautions</strong> before hazard zones and auto-shares coordinates in case of a 112 SOS call.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-teal-400 font-bold text-xs">
                  <Radio className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Bluetooth Ghost-Mesh</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Activates autonomous <strong className="text-slate-200">0-Signal distress hops</strong> via peer phones if you enter dead-zones with no cellular tower.
                </p>
              </div>
            </div>

            {/* Security Guarantee Box */}
            <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div className="text-[11px] sm:text-xs text-emerald-200/90 leading-relaxed">
                <strong>Privacy Guaranteed (DPDP Act 2023):</strong> Telemetry is locally processed on your device. Locations are only transmitted to state police CAD when an SOS is triggered or a restricted perimeter is breached.
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 sm:p-6 pt-3 border-t border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <button
              onClick={handleDismiss}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition text-center cursor-pointer"
            >
              Skip for Now
            </button>

            <button
              onClick={handleAuthorize}
              disabled={activating}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2 transition transform active:scale-95 cursor-pointer"
            >
              {activating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Activating Sensors...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-200" />
                  <span>Authorize Location & Bluetooth Lifeline</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
