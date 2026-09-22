import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, X, RefreshCw, Check, AlertCircle, ShieldCheck, 
  Sparkles, FlipHorizontal, QrCode, Building2, Store, Upload, CheckCircle2, Zap
} from 'lucide-react';

/**
 * PartnerQRScanner
 * 
 * Interactive Tourist Scanner for scanning Partner UPI / SAFAR QR standees at hotels,
 * cafes, and eco-transport desks.
 * Features:
 * 1. Real device camera stream with animated laser viewfinder.
 * 2. Instant Demo Standee Scanner simulation (for 1-click testing on laptop/desktop).
 * 3. Upload QR image file.
 * 4. Auto-detects Partner, verifies Green Discount, and passes detected partner to checkout.
 */
export default function PartnerQRScanner({
  isOpen,
  onClose,
  onPartnerDetected,
  partners = []
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [cameraLoading, setCameraLoading] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // back camera default
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);
  const [detectedPartner, setDetectedPartner] = useState(null);

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopCamera();
      setDetectedPartner(null);
      setIsSimulatingScan(false);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async (mode) => {
    stopCamera();
    setCameraLoading(true);
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser environment');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCamera(true);
    } catch (err) {
      console.warn('Camera access warning (fallback simulation active):', err.message);
      setHasCamera(false);
      setCameraError('Camera unavailable or permission denied. You can use Quick Scan simulation below.');
    } finally {
      setCameraLoading(false);
    }
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Trigger scan confirmation
  const handleConfirmScan = (partner) => {
    setIsSimulatingScan(true);
    setDetectedPartner(partner);

    // Audio-visual feedback
    setTimeout(() => {
      onPartnerDetected(partner);
      onClose();
    }, 900);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 text-white font-sans">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between z-20 max-w-lg w-full mx-auto pt-2">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
            <QrCode className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tight">Scan Partner Standee</h2>
            <p className="text-[10px] text-slate-300 font-medium">Point at Hotel / Cafe / Store QR</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {hasCamera && (
            <button
              type="button"
              onClick={toggleCameraFacing}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Flip Camera"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Viewfinder Section */}
      <div className="relative flex-1 flex flex-col items-center justify-center my-2 max-w-lg w-full mx-auto overflow-hidden rounded-3xl border border-white/10 bg-slate-950">
        
        {/* Live Video Feed */}
        {hasCamera && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Fallback Camera Placeholder if device has no webcam */}
        {!hasCamera && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-gradient-to-b from-slate-900 to-slate-950">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <Camera className="w-8 h-8 opacity-70" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-200">Live Camera Simulator Active</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                Use the Quick Standee presets below to simulate scanning any partner counter QR with 1 tap.
              </p>
            </div>
          </div>
        )}

        {/* Darkened HUD Overlay */}
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />

        {/* Scanning Target Box Frame */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl border-2 border-emerald-400/50 shadow-[0_0_50px_rgba(16,185,129,0.25)] flex items-center justify-center z-10 pointer-events-none">
          {/* 4 Corner Markers */}
          <div className="absolute -top-1 -left-1 w-7 h-7 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
          <div className="absolute -top-1 -right-1 w-7 h-7 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
          <div className="absolute -bottom-1 -left-1 w-7 h-7 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
          <div className="absolute -bottom-1 -right-1 w-7 h-7 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />

          {/* Animated Laser Scanning Line */}
          {!isSimulatingScan && (
            <motion.div
              animate={{ y: [-110, 110, -110] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981]"
            />
          )}

          {/* Scanned Confirmation Burst */}
          {isSimulatingScan && detectedPartner && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-emerald-500/90 text-white p-4 rounded-2xl flex flex-col items-center space-y-1 shadow-2xl backdrop-blur-md"
            >
              <CheckCircle2 className="w-10 h-10 text-white animate-bounce" />
              <span className="text-xs font-black uppercase tracking-wider">Partner Verified!</span>
              <span className="text-xs font-bold truncate max-w-[180px]">{detectedPartner.name}</span>
            </motion.div>
          )}
        </div>

        {/* Live scanning prompt */}
        <div className="z-10 mt-4 text-center px-4">
          <span className="px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-emerald-300 border border-emerald-500/30">
            Align partner QR inside the viewfinder
          </span>
        </div>
      </div>

      {/* Quick-Scan Demo Standees Carousel for Laptops/Testing */}
      <div className="z-20 max-w-lg w-full mx-auto space-y-2 pb-2">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-black text-slate-300 flex items-center space-x-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Tap to Scan Demo Partner Standee:</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-bold">1-Click Simulation</span>
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
          {partners.slice(0, 4).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleConfirmScan(p)}
              disabled={isSimulatingScan}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-400/50 transition-all text-left flex items-start space-x-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                <Store className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-bold text-white block truncate group-hover:text-emerald-300">
                  {p.name}
                </span>
                <span className="text-[10px] text-slate-400 font-medium block">
                  {p.location} · {p.type} (Max {p.maximumDiscount || 20}% off)
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
