import React, { useState } from 'react';
import { Watch, Heart, ShieldAlert, Wifi, Bluetooth, Radio, BatteryCharging } from 'lucide-react';

export default function WearableBandCard() {
  const [isConnected, setIsConnected] = useState(true);
  const [heartRate, setHeartRate] = useState(76);
  const [satelliteBackup, setSatelliteBackup] = useState(true);

  const simulateFallDetection = () => {
    setHeartRate(124);
    alert('⚠️ Simulated IoT Safety Band Fall Detection Triggered! Automatic SOS queued if no movement for 30s.');
  };

  return (
    <div className="bg-white/95 border border-gray-200/80 rounded-3xl p-5 shadow-lg space-y-4 backdrop-blur-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold">
            <Watch className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-900">SafeTour IoT Smart Band</h4>
            <p className="text-[10px] text-gray-500 font-medium">Wearable Hardware Layer • Remote Trekking</p>
          </div>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 ${
          isConnected ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <Bluetooth className="w-3 h-3" />
          <span>{isConnected ? 'BLE PAIRED' : 'DISCONNECTED'}</span>
        </span>
      </div>

      {/* Sensor Readouts Grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 p-2.5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-center space-x-1 text-rose-600 mb-0.5">
            <Heart className="w-3.5 h-3.5 animate-pulse" />
            <span className="text-[10px] font-bold text-gray-500">Heart Rate</span>
          </div>
          <div className="text-base font-black text-gray-900">{heartRate} <span className="text-[9px] font-normal text-gray-500">BPM</span></div>
        </div>

        <div className="bg-gray-50 p-2.5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-center space-x-1 text-cyan-600 mb-0.5">
            <Radio className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold text-gray-500">No-Signal Auto</span>
          </div>
          <div className="text-xs font-black text-cyan-800">Satellite SOS</div>
        </div>

        <div className="bg-gray-50 p-2.5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-center space-x-1 text-emerald-600 mb-0.5">
            <BatteryCharging className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold text-gray-500">Battery</span>
          </div>
          <div className="text-base font-black text-gray-900">88%</div>
        </div>
      </div>

      {/* Fall Detection & Remote Auto-SOS Feature */}
      <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-200 flex items-center justify-between text-xs shadow-sm">
        <div className="space-y-0.5">
          <div className="font-bold text-gray-900">Fall & Impact Detection</div>
          <div className="text-[10px] text-gray-500">Auto-triggers SOS if phone signal lost in mountains</div>
        </div>
        <button
          onClick={simulateFallDetection}
          className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-300 rounded-lg font-bold text-[10px] transition-colors"
        >
          Test Impact
        </button>
      </div>

    </div>
  );
}
