import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Banknote, Navigation, ShieldCheck, AlertTriangle, Info, CheckCircle2, 
  MapPin, Clock, Moon, Luggage, HelpCircle, PhoneCall, ChevronRight, Calculator, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SPRING = { type: 'spring', stiffness: 360, damping: 28 };

const CITY_TARIFFS = {
  AYODHYA: {
    name: 'Ayodhya (UP)',
    baseFare: 30, // first 1.5 km
    baseKm: 1.5,
    perKmAuto: 10.5,
    perKmERickshaw: 7.0,
    perKmCab: 16.0,
    nightSurchargePercent: 25,
    typicalScamMultiplier: 2.8,
    popularRoutes: [
      { from: 'Ayodhya Cantt Railway Station', to: 'Ram Janmabhoomi Mandir', km: 8.5 },
      { from: 'Maharishi Valmiki Airport', to: 'Hanuman Garhi', km: 10.2 },
      { from: 'Saryu Ghat', to: 'Kanak Bhawan', km: 3.2 }
    ]
  },
  JAMMU: {
    name: 'Jammu & Kashmir',
    baseFare: 40,
    baseKm: 2.0,
    perKmAuto: 12.0,
    perKmERickshaw: 8.5,
    perKmCab: 18.5,
    nightSurchargePercent: 25,
    typicalScamMultiplier: 2.5,
    popularRoutes: [
      { from: 'Katra Railway Station', to: 'Banganga Helipad/Yatra Entry', km: 4.5 },
      { from: 'Jammu Tawi Station', to: 'Raghunath Temple', km: 3.8 },
      { from: 'Jammu Airport', to: 'Bahu Fort', km: 7.5 }
    ]
  },
  AGRA: {
    name: 'Agra / Taj Mahal (UP)',
    baseFare: 35,
    baseKm: 1.5,
    perKmAuto: 11.0,
    perKmERickshaw: 8.0,
    perKmCab: 17.0,
    nightSurchargePercent: 25,
    typicalScamMultiplier: 3.2,
    popularRoutes: [
      { from: 'Agra Cantt Railway Station', to: 'Taj Mahal East Gate', km: 6.8 },
      { from: 'Taj Mahal', to: 'Agra Fort', km: 2.5 },
      { from: 'Agra Cantt', to: 'Fatehpur Sikri', km: 38.0 }
    ]
  },
  DELHI: {
    name: 'Delhi NCR',
    baseFare: 30,
    baseKm: 1.5,
    perKmAuto: 11.0,
    perKmERickshaw: 8.0,
    perKmCab: 18.0,
    nightSurchargePercent: 25,
    typicalScamMultiplier: 2.2,
    popularRoutes: [
      { from: 'New Delhi Railway Station', to: 'India Gate', km: 4.2 },
      { from: 'IGI Airport Terminal 3', to: 'Connaught Place', km: 16.5 },
      { from: 'Red Fort', to: 'Qutub Minar', km: 18.0 }
    ]
  },
  GUWAHATI: {
    name: 'Guwahati (North East)',
    baseFare: 35,
    baseKm: 1.5,
    perKmAuto: 11.5,
    perKmERickshaw: 8.0,
    perKmCab: 17.5,
    nightSurchargePercent: 20,
    typicalScamMultiplier: 2.4,
    popularRoutes: [
      { from: 'Guwahati Railway Station', to: 'Kamakhya Temple', km: 7.0 },
      { from: 'Lokpriya Gopinath Airport', to: 'Paltan Bazaar', km: 22.0 },
      { from: 'Umananda Ghat', to: 'Srimanta Sankaradeva Kalakshetra', km: 12.5 }
    ]
  }
};

export default function FaresPage({ tourist }) {
  const [selectedCityKey, setSelectedCityKey] = useState('AYODHYA');
  const [vehicleType, setVehicleType] = useState('AUTO'); // AUTO, ERICKSHAW, CAB
  const [distanceKm, setDistanceKm] = useState(6.5);
  const [isNight, setIsNight] = useState(false);
  const [luggageCount, setLuggageCount] = useState(1);
  const [showOverchargeTips, setShowOverchargeTips] = useState(false);

  const city = CITY_TARIFFS[selectedCityKey] || CITY_TARIFFS.AYODHYA;

  // Compute Govt Fare
  let ratePerKm = city.perKmAuto;
  if (vehicleType === 'ERICKSHAW') ratePerKm = city.perKmERickshaw;
  if (vehicleType === 'CAB') ratePerKm = city.perKmCab;

  const extraKm = Math.max(0, distanceKm - city.baseKm);
  let baseCalc = city.baseFare + extraKm * ratePerKm;
  if (luggageCount > 1) {
    baseCalc += (luggageCount - 1) * 10; // 10 Rs per heavy luggage
  }
  if (isNight) {
    baseCalc *= 1 + city.nightSurchargePercent / 100;
  }

  const govtFare = Math.round(baseCalc);
  const estimatedScamFare = Math.round(govtFare * city.typicalScamMultiplier);
  const savedAmount = estimatedScamFare - govtFare;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.99 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold mb-1" style={{ color: '#FF9F0A' }}>
            <Link to="/tourist-dashboard" className="hover:underline">Dashboard</Link>
            <span style={{ color: 'rgba(60,60,67,0.3)' }}>/</span>
            <span>Local Transit & Budget</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: '#1C1C1E', letterSpacing: '-0.025em' }}>
            Local Transport Fare Estimator
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(60,60,67,0.6)' }}>
            Official government regulated tariffs & anti-scam price transparency engine.
          </p>
        </div>

        {/* City Picker Dropdown */}
        <div className="p-1.5 rounded-2xl apple-card flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-500 pl-1" />
          <select
            value={selectedCityKey}
            onChange={(e) => setSelectedCityKey(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl cursor-pointer focus:outline-none"
            style={{
              background: 'rgba(120,120,128,0.1)',
              border: '0.5px solid rgba(60,60,67,0.15)',
              color: '#1C1C1E',
            }}
          >
            <option value="AYODHYA">🛕 Ayodhya (UP)</option>
            <option value="JAMMU">🏔️ Jammu & Katra (J&K)</option>
            <option value="AGRA">🕌 Agra / Taj Mahal (UP)</option>
            <option value="DELHI">🏛️ Delhi NCR</option>
            <option value="GUWAHATI">🌿 Guwahati (Assam)</option>
          </select>
        </div>
      </div>

      {/* Main Fare Calculator Glassmorphic Card */}
      <div className="p-6 sm:p-8 rounded-3xl apple-card space-y-6">
        
        {/* Vehicle Selection Chips */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
            Select Vehicle Mode
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'AUTO', label: 'Auto-Rickshaw', icon: '🛺', rate: `₹${city.perKmAuto}/km` },
              { id: 'ERICKSHAW', label: 'E-Rickshaw (Shared/Private)', icon: '⚡', rate: `₹${city.perKmERickshaw}/km` },
              { id: 'CAB', label: 'Taxi / AC Cab', icon: '🚕', rate: `₹${city.perKmCab}/km` },
            ].map((v) => {
              const active = vehicleType === v.id;
              return (
                <motion.button
                  key={v.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  transition={SPRING}
                  onClick={() => setVehicleType(v.id)}
                  className="p-3.5 rounded-2xl text-left transition-all relative overflow-hidden"
                  style={{
                    background: active ? 'rgba(255,159,10,0.12)' : 'rgba(120,120,128,0.06)',
                    border: active ? '1.5px solid #FF9F0A' : '0.5px solid rgba(60,60,67,0.12)',
                  }}
                >
                  <span className="text-2xl block mb-1">{v.icon}</span>
                  <span className="text-xs font-bold block" style={{ color: active ? '#CC7A00' : '#1C1C1E' }}>
                    {v.label}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono block mt-0.5">{v.rate}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Distance Range Slider */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600">Travel Distance</span>
            <span className="text-sm font-black font-mono px-3 py-1 rounded-xl bg-orange-50 text-orange-600 border border-orange-200">
              {distanceKm} km
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="40"
            step="0.5"
            value={distanceKm}
            onChange={(e) => setDistanceKm(parseFloat(e.target.value))}
            className="w-full accent-orange-500 cursor-pointer h-2 bg-gray-200 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-gray-400 font-mono">
            <span>0.5 km</span>
            <span>10 km</span>
            <span>20 km</span>
            <span>30 km</span>
            <span>40 km</span>
          </div>
        </div>

        {/* Popular Route Presets */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold text-gray-500 block">Popular Route Quick Presets ({city.name}):</span>
          <div className="flex flex-wrap gap-2">
            {city.popularRoutes.map((r, i) => (
              <button
                key={i}
                onClick={() => setDistanceKm(r.km)}
                className="text-xs font-medium px-3 py-1.5 rounded-xl border border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-colors text-gray-700 text-left"
              >
                📍 <strong>{r.from}</strong> ➔ {r.to} ({r.km} km)
              </button>
            ))}
          </div>
        </div>

        {/* Night & Luggage Modifiers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div
            onClick={() => setIsNight(!isNight)}
            className="p-3.5 rounded-2xl border border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              <Moon className={`w-4 h-4 ${isNight ? 'text-indigo-600' : 'text-gray-400'}`} />
              <div>
                <span className="text-xs font-bold block text-gray-800">Night Tariff (11 PM - 5 AM)</span>
                <span className="text-[10px] text-gray-500">+{city.nightSurchargePercent}% Govt Approved Premium</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isNight}
              onChange={() => {}}
              className="accent-indigo-600 w-4 h-4 rounded cursor-pointer"
            />
          </div>

          <div className="p-3.5 rounded-2xl border border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Luggage className="w-4 h-4 text-gray-500" />
              <div>
                <span className="text-xs font-bold block text-gray-800">Heavy Luggage / Bags</span>
                <span className="text-[10px] text-gray-500">₹10/bag after 1st free bag</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLuggageCount(Math.max(0, luggageCount - 1))}
                className="w-6 h-6 rounded-lg bg-gray-100 font-bold text-xs hover:bg-gray-200"
              >
                -
              </button>
              <span className="text-xs font-bold font-mono w-4 text-center">{luggageCount}</span>
              <button
                onClick={() => setLuggageCount(luggageCount + 1)}
                className="w-6 h-6 rounded-lg bg-gray-100 font-bold text-xs hover:bg-gray-200"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* 🏷️ THE FARE COMPARISON SHOWDOWN */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50/80 via-white to-amber-50/80 border-2 border-emerald-300/70 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/60 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Govt Regulated Tariff Estimate
              </span>
              <h3 className="text-3xl font-black text-gray-900 font-mono mt-1">
                ₹{govtFare} <span className="text-xs font-normal text-gray-500 font-sans">INR</span>
              </h3>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs font-bold uppercase tracking-wide text-red-500 flex items-center sm:justify-end gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Typical Tout Demand
              </span>
              <h4 className="text-xl font-bold line-through text-red-400 font-mono">
                ₹{estimatedScamFare}
              </h4>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-gray-600 font-medium">
              💡 By insisting on meter or pre-fixed govt rate, you save:
            </span>
            <span className="font-extrabold text-emerald-700 font-mono text-sm bg-emerald-100 px-2.5 py-1 rounded-xl">
              Save ₹{savedAmount} (approx {(city.typicalScamMultiplier * 100 - 100).toFixed(0)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Driver Dispute Guidance & Helpline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl apple-card space-y-3">
          <div className="flex items-center space-x-2 text-orange-600">
            <Info className="w-4 h-4" />
            <h4 className="font-bold text-sm text-gray-900">Driver Refuses Meter?</h4>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Show this screen to the auto or taxi driver. Under Section 178 of the Motor Vehicles Act, refusal of ply or charging above designated government notification rate is punishable with license suspension.
          </p>
        </div>

        <div className="p-5 rounded-3xl apple-card space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-emerald-600">
              <PhoneCall className="w-4 h-4" />
              <h4 className="font-bold text-sm text-gray-900">Report Overcharging</h4>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Direct police helpline to report transport harassment, touts, or vehicle meter tampering.
            </p>
          </div>
          <a
            href="tel:112"
            className="inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <span>Dial 112 / Tourist Police Helpdesk</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
}
