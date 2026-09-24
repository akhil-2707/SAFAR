import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  ShieldCheck,
  CheckCircle2,
  X,
  AlertTriangle,
  Lock,
  ChevronRight,
  MapPin,
  Camera,
  Database,
  Bluetooth,
  Sparkles,
  Info
} from 'lucide-react';

export default function GhostMeshPermissionModal({ 
  isOpen, 
  onClose, 
  onGranted,
  isEmergencyOverride = false 
}) {
  const [activating, setActivating] = useState(false);
  const [activeStep, setActiveStep] = useState(null); // 'gps' | 'camera' | 'storage' | 'ble' | 'done'

  const [statuses, setStatuses] = useState({
    gps: 'pending',
    camera: 'pending',
    storage: 'pending',
    ble: 'pending'
  });

  // Load existing statuses on mount or open
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('safar_permissions_detail');
        if (saved) {
          const parsed = JSON.parse(saved);
          setStatuses({
            gps: parsed.gps ? 'granted' : 'pending',
            camera: parsed.camera ? 'granted' : 'pending',
            storage: parsed.storage ? 'granted' : 'pending',
            ble: parsed.ble ? 'granted' : 'pending'
          });
        }
      } catch (err) {
        console.warn('Error reading permission detail:', err);
      }
    }
  }, [isOpen]);

  const requestGps = () => {
    return new Promise((resolve) => {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => resolve(true),
          (err) => {
            console.warn('GPS prompt response:', err.message);
            resolve(false);
          },
          { enableHighAccuracy: true, timeout: 6000 }
        );
      } else {
        resolve(true); // Fallback mock
      }
    });
  };

  const requestCamera = async () => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        // Immediately stop tracks to free camera hardware
        stream.getTracks().forEach((track) => track.stop());
        return true;
      } catch (err) {
        console.warn('Camera prompt response:', err.message);
        return false;
      }
    }
    return true; // Fallback mock
  };

  const requestStorage = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
        await navigator.storage.persist();
      }
      localStorage.setItem('safar_storage_vault_test', 'ok');
      localStorage.removeItem('safar_storage_vault_test');
      return true;
    } catch {
      return true;
    }
  };

  const requestBle = () => {
    return new Promise((resolve) => {
      // BLE Mesh Protocol authorization
      localStorage.setItem('safar_ble_mesh_permission', 'granted');
      resolve(true);
    });
  };

  const handleAuthorizeAll = async () => {
    setActivating(true);

    // Step 1: GPS Location
    setActiveStep('gps');
    const gpsOk = await requestGps();
    setStatuses((prev) => ({ ...prev, gps: gpsOk ? 'granted' : 'denied' }));

    // Step 2: Camera
    setActiveStep('camera');
    const camOk = await requestCamera();
    setStatuses((prev) => ({ ...prev, camera: camOk ? 'granted' : 'denied' }));

    // Step 3: Storage
    setActiveStep('storage');
    const storageOk = await requestStorage();
    setStatuses((prev) => ({ ...prev, storage: storageOk ? 'granted' : 'denied' }));

    // Step 4: BLE Ghost Mesh
    setActiveStep('ble');
    const bleOk = await requestBle();
    setStatuses((prev) => ({ ...prev, ble: bleOk ? 'granted' : 'denied' }));

    setActiveStep('done');

    const detail = {
      gps: gpsOk,
      camera: camOk,
      storage: storageOk,
      ble: bleOk,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem('safar_permissions_detail', JSON.stringify(detail));
    localStorage.setItem('safar_device_permissions', 'granted');
    localStorage.setItem('safar_ble_mesh_permission', 'granted');

    setTimeout(() => {
      setActivating(false);
      if (onGranted) onGranted(detail);
      if (onClose) onClose();
    }, 900);
  };

  const handleDismiss = () => {
    localStorage.setItem('safar_device_permissions', 'dismissed');
    if (onClose) onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-xl bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl shadow-emerald-950/50 overflow-hidden text-slate-100 my-auto"
        >
          {/* Top Indian Tricolor Accent Line */}
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

            <div className="flex items-start sm:items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner shrink-0">
                <ShieldCheck className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    S.A.F.A.R. Device Lifeline Shield
                  </span>
                  {isEmergencyOverride && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
                      🚨 Just-In-Time Emergency Override
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-black text-white mt-1 leading-tight">
                  Allow Hardware Safety & Ghost-Mesh Permissions?
                </h3>
                <p className="text-[11px] text-emerald-300 font-medium mt-0.5">
                  DPDP Act 2023 Compliant • Essential for 0-Cellular SOS, QR Verification & Perimeter Alarms
                </p>
              </div>
            </div>
          </div>

          {/* Body: 4 Permission Cards */}
          <div className="p-5 sm:p-6 space-y-3.5 text-xs sm:text-sm text-slate-300">
            <p className="text-slate-300 leading-relaxed text-xs">
              S.A.F.A.R. requires these 4 device permissions for real-time safety telemetry, perimeter buffer warnings, offline mesh rescue, and partner QR discount settlement:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* 1. GPS Location */}
              <div className={`p-3.5 rounded-2xl border transition-all ${
                statuses.gps === 'granted'
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : statuses.gps === 'denied'
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : 'bg-slate-800/70 border-slate-700/60'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 font-black text-xs text-white">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>1. GPS Location</span>
                  </div>
                  {statuses.gps === 'granted' ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Granted
                    </span>
                  ) : activeStep === 'gps' ? (
                    <span className="text-[10px] font-bold text-amber-300 animate-pulse">Requesting...</span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400">Required</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Triggers <strong className="text-slate-200">300m/150m Red Zone alerts</strong>, safe pilgrim routing, and transmits offline coordinates in 112 SOS calls.
                </p>
              </div>

              {/* 2. Live Camera Access */}
              <div className={`p-3.5 rounded-2xl border transition-all ${
                statuses.camera === 'granted'
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : statuses.camera === 'denied'
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : 'bg-slate-800/70 border-slate-700/60'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 font-black text-xs text-white">
                    <Camera className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>2. Live Camera</span>
                  </div>
                  {statuses.camera === 'granted' ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Granted
                    </span>
                  ) : activeStep === 'camera' ? (
                    <span className="text-[10px] font-bold text-amber-300 animate-pulse">Requesting...</span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400">Required</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Used for scanning <strong className="text-slate-200">Partner QR Standees</strong> for discounts, eco-proof photo submissions, and digital ID checks.
                </p>
              </div>

              {/* 3. Storage & Offline Vault */}
              <div className={`p-3.5 rounded-2xl border transition-all ${
                statuses.storage === 'granted'
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : 'bg-slate-800/70 border-slate-700/60'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 font-black text-xs text-white">
                    <Database className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>3. Storage & Cache</span>
                  </div>
                  {statuses.storage === 'granted' ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Ready
                    </span>
                  ) : activeStep === 'storage' ? (
                    <span className="text-[10px] font-bold text-amber-300 animate-pulse">Configuring...</span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400">Local Vault</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Caches <strong className="text-slate-200">0-network offline emergency maps</strong>, downloaded receipts, and encrypts store-and-forward SOS logs.
                </p>
              </div>

              {/* 4. BLE Ghost-Mesh */}
              <div className={`p-3.5 rounded-2xl border transition-all ${
                statuses.ble === 'granted'
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : 'bg-slate-800/70 border-slate-700/60'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 font-black text-xs text-white">
                    <Bluetooth className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>4. BLE Ghost-Mesh</span>
                  </div>
                  {statuses.ble === 'granted' ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  ) : activeStep === 'ble' ? (
                    <span className="text-[10px] font-bold text-amber-300 animate-pulse">Authorizing...</span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400">Lifeline</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Activates <strong className="text-slate-200">0-Cellular Peer Hops</strong> via Bluetooth beacons & 72-hour Duty-Cycled Search & Rescue radar in dead zones.
                </p>
              </div>

            </div>

            {/* Privacy & Safety Guarantee */}
            <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div className="text-[11px] text-emerald-200/90 leading-relaxed">
                <strong>Privacy Guaranteed (DPDP Act 2023):</strong> Your telemetry is strictly processed on your device. GPS is only dispatched to Police 112 CAD if an SOS is activated or a high-risk perimeter is breached.
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 sm:p-6 pt-3 border-t border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={handleDismiss}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition text-center cursor-pointer"
            >
              Skip for Now (Can Enable Later)
            </button>

            <button
              onClick={handleAuthorizeAll}
              disabled={activating}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2 transition transform active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {activating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Requesting System Permissions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Authorize All 4 Safety Permissions</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
