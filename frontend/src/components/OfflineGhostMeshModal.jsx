import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, SignalZero, WifiOff, ShieldCheck, Activity, CheckCircle2, AlertTriangle, PhoneCall, Volume2, Compass, Cpu, Zap, ArrowRight, Share2, MapPin, X } from 'lucide-react';

export default function OfflineGhostMeshModal({ isOpen, onClose }) {
  const [activeStep, setActiveStep] = useState(0); // 0: Ready, 1: Hop 1, 2: Hop 2, 3: Delivered to Uplink
  const [isRelaying, setIsRelaying] = useState(false);
  const [isUltrasonicActive, setIsUltrasonicActive] = useState(false);
  const [dispatchResult, setDispatchResult] = useState(null);
  const [selectedHopInfo, setSelectedHopInfo] = useState(null);

  if (!isOpen) return null;

  const handleTriggerMeshSOS = async () => {
    setIsRelaying(true);
    setActiveStep(1);

    try {
      // Step 1 Simulation delay
      setTimeout(() => {
        setActiveStep(2);
      }, 1200);

      // Step 2 Simulation delay
      setTimeout(() => {
        setActiveStep(3);
      }, 2400);

      const res = await fetch('/api/mesh-rescue/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          touristId: 'TID-1024',
          touristName: 'Rohan Verma',
          bloodGroup: 'O+ Positive',
          emergencyType: 'INJURED_IMMOBILE_IN_GORGE',
          coords: { lat: 25.5684, lng: 94.0624 },
          batteryLevel: 34
        })
      });

      const data = await res.json();
      if (data.success) {
        setTimeout(() => {
          setDispatchResult(data.dispatch);
          setIsRelaying(false);
        }, 3000);
      }
    } catch (err) {
      console.error('Mesh broadcast error:', err);
      setIsRelaying(false);
    }
  };

  const resetSimulator = () => {
    setActiveStep(0);
    setIsRelaying(false);
    setDispatchResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-navy-950 border border-slate-700/80 rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl relative text-white"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge & Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-navy-950 rounded-[14px] flex items-center justify-center">
                <Radio className="w-6 h-6 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold tracking-tight">
                  Offline Ghost-Mesh Rescue Protocol
                </h2>
                <span className="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 px-2.5 py-0.5 rounded-full border border-rose-500/30 uppercase">
                  Zero Network / 0-Bar SOS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Peer-to-Peer BLE 5.3 & Wi-Fi Direct Multi-Hop Relay for Mountain Trails & Remote Valleys
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <SignalZero className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="text-[11px] font-mono text-slate-300">Carrier Signal: <strong className="text-rose-400">0% (DEAD ZONE)</strong></span>
          </div>
        </div>

        {/* Interactive Mesh Topology Visualization */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span>Live P2P Mesh Hop Architecture (Dzukou Valley Corridor)</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              AES-256 Encrypted Packets
            </span>
          </div>

          {/* 4 Nodes Interactive Flow */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
            
            {/* Node 1: Stranded Tourist */}
            <div className={`p-3.5 rounded-2xl border transition-all ${
              activeStep >= 1 ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'bg-slate-800/60 border-slate-700'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-rose-400 uppercase">Node 1: Origin</span>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              </div>
              <span className="text-xs font-extrabold block text-white">Rohan Verma (TID-1024)</span>
              <span className="text-[10px] text-slate-400 block font-mono">📍 Dzukou Gorge (25.5684° N)</span>
              <div className="mt-2 text-[10px] font-mono bg-slate-900/90 p-1.5 rounded text-rose-300 flex items-center space-x-1">
                <WifiOff className="w-3 h-3 text-rose-400" />
                <span>Cellular: 0 Bars</span>
              </div>
            </div>

            {/* Node 2: Peer Hiker 1 */}
            <div className={`p-3.5 rounded-2xl border transition-all ${
              activeStep >= 2 ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-slate-800/60 border-slate-700'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase">Node 2: Relay 1</span>
                <span className={`w-2.5 h-2.5 rounded-full ${activeStep >= 1 ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`}></span>
              </div>
              <span className="text-xs font-extrabold block text-white">Hiker (Priya S.)</span>
              <span className="text-[10px] text-slate-400 block font-mono">Distance: 85m away</span>
              <div className="mt-2 text-[10px] font-mono bg-slate-900/90 p-1.5 rounded text-amber-300">
                Protocol: BLE 5.3 Coded PHY
              </div>
            </div>

            {/* Node 3: Trek Guide 2 */}
            <div className={`p-3.5 rounded-2xl border transition-all ${
              activeStep >= 3 ? 'bg-cyan-950/40 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-slate-800/60 border-slate-700'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-cyan-400 uppercase">Node 3: Relay 2</span>
                <span className={`w-2.5 h-2.5 rounded-full ${activeStep >= 2 ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`}></span>
              </div>
              <span className="text-xs font-extrabold block text-white">Guide (Tashi D.)</span>
              <span className="text-[10px] text-slate-400 block font-mono">Distance: 115m away</span>
              <div className="mt-2 text-[10px] font-mono bg-slate-900/90 p-1.5 rounded text-cyan-300">
                Protocol: Wi-Fi Direct Peer Hop
              </div>
            </div>

            {/* Node 4: Forest Ranger Post / Internet Gateway */}
            <div className={`p-3.5 rounded-2xl border transition-all ${
              dispatchResult ? 'bg-emerald-950/50 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-slate-800/60 border-slate-700'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Node 4: Gateway</span>
                <span className={`w-2.5 h-2.5 rounded-full ${dispatchResult ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
              </div>
              <span className="text-xs font-extrabold block text-white">Forest Ranger Station</span>
              <span className="text-[10px] text-slate-400 block font-mono">Uplink: 4G / Satellite</span>
              <div className="mt-2 text-[10px] font-mono bg-slate-900/90 p-1.5 rounded text-emerald-300">
                Status: {dispatchResult ? '112 ERSS CONNECTED 🟢' : 'Listening...'}
              </div>
            </div>

          </div>

          {/* Hop Progress Animation Bar */}
          {isRelaying && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
                <span className="flex items-center space-x-1.5">
                  <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span>Hopping encrypted distress packets across offline peer mesh...</span>
                </span>
                <span className="text-amber-400 font-bold">Hop {activeStep} of 3</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-400"
                  initial={{ width: '0%' }}
                  animate={{ width: activeStep === 1 ? '33%' : activeStep === 2 ? '66%' : '100%' }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Live Rescue Confirmation Ticket (When Packet Reaches Gateway) */}
        {dispatchResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-navy-900 to-emerald-950/70 border border-emerald-500/50 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <span className="text-sm font-extrabold text-white">
                  Distress Relay Confirmed: Mountain Rescue Unit Dispatched!
                </span>
              </div>
              <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/40">
                ETA: ~{dispatchResult.uplinkConfirmation.etaMinutes} mins
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">ERSS-112 Ticket</span>
                <span className="text-emerald-400 font-bold">{dispatchResult.uplinkConfirmation.erss112Ticket}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Assigned Unit</span>
                <span className="text-slate-200 font-bold">{dispatchResult.uplinkConfirmation.assignedRescueTeam}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Relay Gateway Node</span>
                <span className="text-slate-200 font-bold">{dispatchResult.uplinkConfirmation.gatewayNode}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Total Hops & Latency</span>
                <span className="text-cyan-400 font-bold">{dispatchResult.totalHops} Hops (71ms)</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Acoustic Ultrasonic / Infrasonic Audio Beacon Widget */}
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isUltrasonicActive ? 'bg-purple-500/20 text-purple-400 border border-purple-500 animate-pulse' : 'bg-slate-800 text-slate-400'
            }`}>
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Acoustic High-Frequency Sound Beacon (18.5 kHz)
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  isUltrasonicActive ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isUltrasonicActive ? 'EMITTING SONAR PULSE' : 'OFFLINE STANDBY'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Emits inaudible ultrasonic audio pulses via smartphone speaker detectable by rescue search dogs & ranger microphones up to 350 meters in thick fog.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsUltrasonicActive(!isUltrasonicActive)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              isUltrasonicActive
                ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-600/30'
                : 'bg-slate-800 text-purple-300 hover:bg-slate-700 border border-purple-500/30'
            }`}
          >
            {isUltrasonicActive ? '🔊 Stop Sonar Pulse' : '📡 Arm Ultrasonic Pulse'}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
            <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Encrypted using Curve25519 asymmetric cryptography. Zero cellular network required.</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {dispatchResult && (
              <button
                onClick={resetSimulator}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                Reset Simulator
              </button>
            )}

            <button
              disabled={isRelaying}
              onClick={handleTriggerMeshSOS}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center space-x-2 shadow-xl ${
                isRelaying
                  ? 'bg-amber-600 text-white animate-pulse'
                  : 'bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>{isRelaying ? 'Relaying Packet Across Mesh...' : 'Broadcast Ghost-Mesh SOS (Demo)'}</span>
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
