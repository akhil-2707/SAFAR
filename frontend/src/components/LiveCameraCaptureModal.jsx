import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  X, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles,
  FlipHorizontal
} from 'lucide-react';

export default function LiveCameraCaptureModal({
  isOpen,
  onClose,
  onCapture,
  title = 'Live Camera Verification',
  category = 'Verification',
  placeName = ''
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameras, setCameras] = useState([]);
  const [currentFacingMode, setCurrentFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [capturedImage, setCapturedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [flashActive, setFlashActive] = useState(false);
  const [liveTime, setLiveTime] = useState(new Date().toLocaleTimeString());

  // Update live clock every second
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setLiveTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Clean up streams when closing
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Start Camera Stream
  const startCamera = async (facing = currentFacingMode) => {
    stopStream();
    setIsLoading(true);
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsLoading(false);
      setCameraError({
        type: 'UNSUPPORTED',
        message: 'Camera API is not supported in this browser or context. Live camera requires a secure connection (HTTPS or localhost).'
      });
      return;
    }

    try {
      // Discover available devices
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setCameras(videoInputs);
      } catch (enumErr) {
        console.warn('Enumerate devices warning:', enumErr);
      }

      // First attempt with preferred facing mode
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (firstErr) {
        console.warn('Ideal facingMode failed, falling back to any video input:', firstErr);
        // Fallback to basic video constraint
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Camera access error:', err);
      setIsLoading(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError({
          type: 'PERMISSION_DENIED',
          message: 'Camera permission was denied. S.A.F.A.R. strictly requires live camera capture to prevent internet downloads and fake claims. Please allow camera access in your browser address bar, then click "Retry Camera".'
        });
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError({
          type: 'NOT_FOUND',
          message: 'No camera hardware detected on this device. A camera is required for live photo verification.'
        });
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError({
          type: 'IN_USE',
          message: 'Camera is currently in use by another application or browser tab. Please close other camera apps and retry.'
        });
      } else {
        setCameraError({
          type: 'GENERIC',
          message: err.message || 'Unable to access live camera for verification.'
        });
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      startCamera(currentFacingMode);
    } else {
      stopStream();
      setCapturedImage(null);
      setCameraError(null);
    }

    return () => {
      stopStream();
    };
  }, [isOpen, currentFacingMode]);

  // Flip camera between front & rear
  const toggleCameraFacing = () => {
    const nextMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    setCurrentFacingMode(nextMode);
  };

  // Play a short synth shutter click sound using Web Audio API
  const playShutterSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio optional
    }
  };

  // Capture frame from video onto canvas with watermark
  const handleCapturePhoto = () => {
    if (!videoRef.current || !streamRef.current) return;
    const video = videoRef.current;
    
    // Trigger shutter sound & visual flash
    playShutterSound();
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 180);

    const canvas = document.createElement('canvas');
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame
    ctx.drawImage(video, 0, 0, width, height);

    // Embed subtle security verification stamp at the bottom
    const nowIso = new Date().toISOString();
    const watermarkText = `[SAFAR LIVE VERIFIED] • ${nowIso.replace('T', ' ').slice(0, 19)} UTC`;
    
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, height - 36, width, 36);
    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = '#34D399';
    ctx.fillText('🛡️ S.A.F.A.R. CAMERA-VERIFIED SNAPSHOT', 16, height - 13);
    ctx.fillStyle = '#E2E8F0';
    ctx.textAlign = 'right';
    ctx.fillText(watermarkText, width - 16, height - 13);
    ctx.restore();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    stopStream();
  };

  // Retake photo: clear captured photo and restart live camera
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(currentFacingMode);
  };

  // Confirm photo and send back to parent
  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      handleClose();
    }
  };

  const handleClose = () => {
    stopStream();
    setCapturedImage(null);
    setCameraError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center space-x-2">
                <span>{title}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                  Live Only
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {placeName ? `Capturing: ${placeName} (${category})` : 'Live viewfinder active — gallery uploads disabled'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-xl bg-slate-700/70 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Viewfinder / Preview Body */}
        <div className="relative flex-1 min-h-[340px] sm:min-h-[400px] bg-black flex items-center justify-center overflow-hidden">
          {/* Visual Shutter Flash Effect */}
          {flashActive && (
            <div className="absolute inset-0 bg-white z-40 transition-opacity duration-150 pointer-events-none" />
          )}

          {/* Loading State */}
          {isLoading && !cameraError && (
            <div className="text-center p-6 space-y-3 z-10">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
              <p className="text-xs font-bold text-white">Initializing live camera stream...</p>
              <p className="text-[11px] text-slate-400">Requesting device hardware permission</p>
            </div>
          )}

          {/* Error State: Permission Denied or Unavailable */}
          {cameraError && !capturedImage && (
            <div className="p-6 sm:p-8 text-center max-w-md mx-auto space-y-4 z-10">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-white">Camera Access Required</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {cameraError.message}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 text-[11px] text-slate-300 text-left space-y-1.5">
                <div className="font-bold text-emerald-400 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Why is live camera mandatory?</span>
                </div>
                <p className="text-slate-400 text-[10px] leading-normal">
                  To ensure authentic visits and prevent counterfeit Green Coin claims, SAFAR verifies real-time camera captures directly on-site. Uploading pre-existing files from your gallery is intentionally prohibited.
                </p>
              </div>

              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => startCamera(currentFacingMode)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-lg"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Camera</span>
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Live Video Feed (when not captured and no error) */}
          {!capturedImage && !cameraError && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder HUD Overlays */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-20">
                {/* Top HUD: Live Indicator + Timestamp */}
                <div className="flex items-center justify-between">
                  <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/40 flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[10px] font-black text-emerald-300 tracking-wider">
                      LIVE CAMERA
                    </span>
                  </div>

                  <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-slate-200 border border-white/10">
                    {liveTime}
                  </div>
                </div>

                {/* Viewfinder Target Reticle / Brackets */}
                <div className="relative w-48 h-48 sm:w-64 sm:h-64 mx-auto my-auto pointer-events-none">
                  {/* Corners */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-400 rounded-br-lg" />

                  {/* Center Target */}
                  <div className="absolute inset-0 m-auto w-4 h-4 flex items-center justify-center opacity-40">
                    <div className="w-full h-[1px] bg-emerald-400" />
                    <div className="h-full w-[1px] bg-emerald-400 absolute" />
                  </div>
                </div>

                {/* Bottom HUD: Instructions */}
                <div className="text-center">
                  <span className="inline-block bg-black/65 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-medium text-slate-200 border border-white/10">
                    Position subject in frame and tap shutter to click
                  </span>
                </div>
              </div>

              {/* Camera Switch Button (if mobile / multiple cameras) */}
              {cameras.length > 1 && (
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md transition-all shadow-md"
                  title="Switch Camera"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
              )}
            </>
          )}

          {/* Captured Image Preview */}
          {capturedImage && (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={capturedImage}
                alt="Captured Proof"
                className="w-full h-full object-contain max-h-[460px]"
              />

              {/* Preview Badge */}
              <div className="absolute top-4 left-4 z-20 bg-emerald-500/90 text-white backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center space-x-1.5 shadow-lg">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Verified Live Snapshot</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Controls Footer */}
        <div className="p-4 sm:p-5 bg-slate-800/95 border-t border-slate-700/80">
          {!capturedImage ? (
            /* Mode 1: Live Viewfinder Controls */
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors"
              >
                Cancel
              </button>

              {/* Central Shutter Button */}
              <button
                type="button"
                disabled={isLoading || Boolean(cameraError)}
                onClick={handleCapturePhoto}
                className="relative group flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                title="Click Photo"
              >
                {/* Outer Ring */}
                <div className="w-16 h-16 rounded-full border-4 border-emerald-400 group-hover:scale-105 transition-transform flex items-center justify-center bg-emerald-500/20">
                  {/* Inner Shutter Core */}
                  <div className="w-12 h-12 rounded-full bg-emerald-500 group-hover:bg-emerald-400 transition-colors shadow-lg flex items-center justify-center text-white">
                    <Camera className="w-5 h-5" />
                  </div>
                </div>
              </button>

              {cameras.length > 1 ? (
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center space-x-1.5 transition-colors"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Flip</span>
                </button>
              ) : (
                <div className="w-16" />
              )}
            </div>
          ) : (
            /* Mode 2: Captured Photo Review Controls */
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Live photo verified! You can confirm to attach this photo, or retake if needed.</span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-slate-700 hover:bg-slate-600 text-white transition-all flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake Photo</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 py-3 px-4 rounded-xl font-black text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Use This Photo</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
