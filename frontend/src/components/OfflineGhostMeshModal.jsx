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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto select-none font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl relative text-gray-900"
        style={{
          background: 'rgba(255, 255, 255, 0.98)',
          border: '1.5px solid rgba(239, 68, 68, 0.35)',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge & Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Radio className="w-6 h-6 text-red-500 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-gray-900 tracking-tight">
                  Offline Ghost-Mesh Rescue Protocol
                </h2>
                <span className="text-[10px] font-mono font-bold bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full border border-red-200 uppercase">
                  Zero Network / 0-Bar SOS
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Peer-to-Peer BLE 5.3 & Wi-Fi Direct Multi-Hop Relay for Mountain Trails & Remote Valleys
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-red-50 px-3 py-1.5 rounded-xl border border-red-200">
            <SignalZero className="w-4 h-4 text-red-600 shrink-0" />
            <span className="text-[11px] font-mono text-gray-700 font-semibold">Carrier Signal: <strong className="text-red-600 font-bold">0% (DEAD ZONE)</strong></span>
          </div>
        </div>

        {/* Interactive Mesh Topology Visualization */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
              <Share2 className="w-4 h-4 text-violet-600" />
              <span>Live P2P Mesh Hop Architecture (Dzukou Valley Corridor)</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
              AES-256 Encrypted Packets
            </span>
          </div>

          {/* 4 Nodes Interactive Flow */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
            
            {/* Node 1: Stranded Tourist */}
            <div className={`p-3.5 rounded-2xl border transition-all ${
              activeStep >= 1 ? 'bg-rose-50 border-rose-300 shadow-md' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-rose-700 uppercase">Node 1: Origin</span>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              </div>
              <span className="text-xs font-black block text-gray-900">Rohan Verma (TID-1024)</span>
              <span className="text-[10px] text-gray-500 block font-mono">📍 Dzukou Gorge (25.5684° N)</span>
              <div className="mt-2 text-[10px] font-mono bg-white p-1.5 rounded-lg border border-gray-200 text-rose-700 font-bold flex items-center space-x-1">
                <WifiOff className="w-3 h-3 text-rose-500" />
                <span>Cellular: 0 Bars</span>
              </div>
            </div>

            {/* Node 2: Peer Hiker 1 */}
            <div className={`p-3.5 rounded-2xl border transition-all ${
              activeStep >= 2 ? 'bg-amber-50 border-amber-300 shadow-md' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-amber-700 uppercase">Node 2: Relay 1</span>
                <span className={`w-2.5 h-2.5 rounded-full ${activeStep >= 1 ? 'bg-amber-500 animate-pulse' : 'bg-gray-300'}`}></span>
              </div>
              <span className="text-xs font-black block text-gray-900">Hiker (Priya S.)</span>
              <span className="text-[10px] text-gray-500 block font-mono">Distance: 85m away</span>
              <div className="mt-2 text-[10px] font-mono bg-white p-1.5 rounded-lg border border-gray-200 text-amber-800 font-bold">
                Protocol: BLE 5.3 Coded PHY
              </div>
            </div>

            {/* Node 3: Trek Guide 2 */}
            <div className={`p-3.5 rounded-2xl border transition-all ${
              activeStep >= 3 ? 'bg-cyan-50 border-cyan-300 shadow-md' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-cyan-700 uppercase">Node 3: Relay 2</span>
                <span className={`w-2.5 h-2.5 rounded-full ${activeStep >= 2 ? 'bg-cyan-500 animate-pulse' : 'bg-gray-300'}`}></span>
              </div>
              <span className="text-xs font-black block text-gray-900">Guide (Tashi D.)</span>
              <span className="text-[10px] text-gray-500 block font-mono">Distance: 115m away</span>
              <div className="mt-2 text-[10px] font-mono bg-white p-1.5 rounded-lg border border-gray-200 text-cyan-800 font-bold">
                Protocol: Wi-Fi Direct Peer Hop
              </div>
            </div>

            {/* Node 4: Forest Ranger Post / Internet Gateway */}
            <div className={`p-3.5 rounded-2xl border transition-all ${
              dispatchResult ? 'bg-emerald-50 border-emerald-400 shadow-md' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Node 4: Gateway</span>
                <span className={`w-2.5 h-2.5 rounded-full ${dispatchResult ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
              </div>
              <span className="text-xs font-black block text-gray-900">Forest Ranger Station</span>
              <span className="text-[10px] text-gray-500 block font-mono">Uplink: 4G / Satellite</span>
              <div className="mt-2 text-[10px] font-mono bg-white p-1.5 rounded-lg border border-gray-200 text-emerald-800 font-bold">
                Status: {dispatchResult ? '112 ERSS CONNECTED 🟢' : 'Listening...'}
              </div>
            </div>

          </div>

          {/* Hop Progress Animation Bar */}
          {isRelaying && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-gray-700 font-mono">
                <span className="flex items-center space-x-1.5">
                  <Zap className="w-4 h-4 text-amber-500 animate-bounce" />
                  <span>Hopping encrypted distress packets across offline peer mesh...</span>
                </span>
                <span className="text-amber-700 font-bold">Hop {activeStep} of 3</span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500"
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
            className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <span className="text-sm font-black text-emerald-950">
                  Distress Relay Confirmed: Mountain Rescue Unit Dispatched!
                </span>
              </div>
              <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-300">
                ETA: ~{dispatchResult.uplinkConfirmation.etaMinutes} mins
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-white p-2.5 rounded-xl border border-emerald-200 shadow-sm">
                <span className="text-[10px] text-gray-500 block font-semibold">ERSS-112 Ticket</span>
                <span className="text-emerald-700 font-bold">{dispatchResult.uplinkConfirmation.erss112Ticket}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-emerald-200 shadow-sm">
                <span className="text-[10px] text-gray-500 block font-semibold">Assigned Unit</span>
                <span className="text-gray-900 font-bold">{dispatchResult.uplinkConfirmation.assignedRescueTeam}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-emerald-200 shadow-sm">
                <span className="text-[10px] text-gray-500 block font-semibold">Relay Gateway Node</span>
                <span className="text-gray-900 font-bold">{dispatchResult.uplinkConfirmation.gatewayNode}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-emerald-200 shadow-sm">
                <span className="text-[10px] text-gray-500 block font-semibold">Total Hops & Latency</span>
                <span className="text-cyan-700 font-bold">{dispatchResult.totalHops} Hops (71ms)</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Acoustic Ultrasonic / Infrasonic Audio Beacon Widget */}
        <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isUltrasonicActive ? 'bg-purple-600 text-white shadow-md animate-pulse' : 'bg-white text-purple-600 border border-purple-200'
            }`}>
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Acoustic High-Frequency Sound Beacon (18.5 kHz)
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  isUltrasonicActive ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'bg-white text-gray-600 border border-gray-200'
                }`}>
                  {isUltrasonicActive ? 'EMITTING SONAR PULSE' : 'OFFLINE STANDBY'}
                </span>
              </div>
              <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                Emits inaudible ultrasonic audio pulses via smartphone speaker detectable by rescue search dogs & ranger microphones up to 350 meters in thick fog.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsUltrasonicActive(!isUltrasonicActive)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 shadow-sm ${
              isUltrasonicActive
                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md'
                : 'bg-white text-purple-700 hover:bg-purple-50 border border-purple-300'
            }`}
          >
            {isUltrasonicActive ? '🔊 Stop Sonar Pulse' : '📡 Arm Ultrasonic Pulse'}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-[11px] text-gray-500 font-medium flex items-center space-x-1.5">
            <Cpu className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Encrypted using Curve25519 asymmetric cryptography. Zero cellular network required.</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {dispatchResult && (
              <button
                onClick={resetSimulator}
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors border border-gray-200"
              >
                Reset Simulator
              </button>
            )}

            <button
              disabled={isRelaying}
              onClick={handleTriggerMeshSOS}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center space-x-2 shadow-lg ${
                isRelaying
                  ? 'bg-amber-600 text-white animate-pulse'
                  : 'bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white hover:scale-105 active:scale-95'
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
