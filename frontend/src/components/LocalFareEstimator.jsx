import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ShieldCheck, MapPin, Car, AlertCircle, ArrowRight, CheckCircle2, IndianRupee, Sparkles } from 'lucide-react';

const DESTINATION_FARES = {
  ayodhya: {
    cityName: '🛕 Ayodhya Dham (Uttar Pradesh)',
    baseFareAuto: 30,
    perKmAuto: 11,
    baseFareCab: 60,
    perKmCab: 15,
    eRickshawShared: '₹15 - ₹25 per passenger',
    commonRoutes: [
      { from: 'Ayodhya Cantt Railway Station', to: 'Ram Janmabhoomi Complex', distKm: 7.2, autoFare: '₹70 - ₹90', cabFare: '₹220 - ₹260' },
      { from: 'Maharishi Valmiki Airport (AYJ)', to: 'Ram Mandir / Dharamshala', distKm: 12.5, autoFare: '₹130 - ₹160', cabFare: '₹350 - ₹420' },
      { from: 'Hanuman Garhi', to: 'Saryu River Ghats (Naya Ghat)', distKm: 2.5, autoFare: '₹30 - ₹45', cabFare: '₹120 - ₹150' },
    ]
  },
  jammu: {
    cityName: '🏔️ Jammu & Katra (Vaishno Devi)',
    baseFareAuto: 40,
    perKmAuto: 14,
    baseFareCab: 80,
    perKmCab: 18,
    eRickshawShared: '₹20 - ₹30 flat within Katra',
    commonRoutes: [
      { from: 'Jammu Tawi Railway Station', to: 'Katra Base Camp', distKm: 48.0, autoFare: '₹140 - ₹180 (Shared bus/jeep)', cabFare: '₹850 - ₹1100 (Prepaid Cab)' },
      { from: 'Katra Bus Stand', to: 'Banganga / Helipad Gate', distKm: 3.2, autoFare: '₹40 - ₹60', cabFare: '₹150 - ₹180' },
      { from: 'Jammu Airport (IXJ)', to: 'Raghunath Temple Jammu', distKm: 6.8, autoFare: '₹80 - ₹110', cabFare: '₹250 - ₹300' },
    ]
  },
  tajmahal: {
    cityName: '🕌 Agra (Taj Mahal Heritage Circuit)',
    baseFareAuto: 35,
    perKmAuto: 12,
    baseFareCab: 70,
    perKmCab: 16,
    eRickshawShared: '₹15 - ₹20 shared near monument',
    commonRoutes: [
      { from: 'Agra Cantt Railway Station', to: 'Taj Mahal East Gate', distKm: 6.5, autoFare: '₹70 - ₹95', cabFare: '₹220 - ₹270' },
      { from: 'Taj Mahal Complex', to: 'Agra Fort (UNESCO)', distKm: 3.1, autoFare: '₹40 - ₹55', cabFare: '₹130 - ₹160' },
      { from: 'Agra Fort', to: 'Mehtab Bagh (Sunset View)', distKm: 7.8, autoFare: '₹80 - ₹110', cabFare: '₹240 - ₹290' },
    ]
  },
  general: {
    cityName: '🇮🇳 Pan-India Tourist Standard (MoRTH Rates)',
    baseFareAuto: 30,
    perKmAuto: 12,
    baseFareCab: 60,
    perKmCab: 16,
    eRickshawShared: '₹15 - ₹25 standard',
    commonRoutes: [
      { from: 'Nearest City Transit Terminal', to: 'Primary Tourism Hub', distKm: 5.0, autoFare: '₹55 - ₹75', cabFare: '₹180 - ₹220' },
      { from: 'City Center Hub', to: 'State Heritage Monument', distKm: 8.5, autoFare: '₹95 - ₹125', cabFare: '₹280 - ₹340' },
    ]
  }
};

export default function LocalFareEstimator({ currentTourist }) {
  const touristId = currentTourist?.touristId;
  const initialRegion =
    touristId === 'TID-1036' ? 'jammu' :
    touristId === 'TID-1039' ? 'tajmahal' :
    touristId === 'TID-1035' ? 'ayodhya' : 'ayodhya';

  const [selectedCity, setSelectedCity] = useState(initialRegion);
  const [distanceKm, setDistanceKm] = useState(5);
  const [vehicleType, setVehicleType] = useState('AUTO'); // 'AUTO' | 'ERIKSHAW' | 'CAB'
  const [showDriverCard, setShowDriverCard] = useState(false);

  const cityConfig = DESTINATION_FARES[selectedCity] || DESTINATION_FARES.general;

  // Calculate estimated fair fare
  const computeFare = (dist, type) => {
    const numDist = parseFloat(dist) || 1;
    if (type === 'ERIKSHAW') {
      if (numDist <= 3) return { min: 20, max: 30, text: '₹20 - ₹30 (Shared) / ₹80 Private' };
      return { min: 30, max: 50, text: '₹30 - ₹50 (Shared) / ₹120 Private' };
    }
    if (type === 'AUTO') {
      const base = cityConfig.baseFareAuto;
      const min = Math.round(base + (numDist - 1.5 > 0 ? (numDist - 1.5) * cityConfig.perKmAuto : 0));
      const max = Math.round(min * 1.25);
      return { min, max, text: `₹${min} - ₹${max}` };
    }
    // CAB
    const base = cityConfig.baseFareCab;
    const min = Math.round(base + (numDist - 2 > 0 ? (numDist - 2) * cityConfig.perKmCab : 0));
    const max = Math.round(min * 1.25);
    return { min, max, text: `₹${min} - ₹${max}` };
  };

  const currentFare = computeFare(distanceKm, vehicleType);

  return (
    <div
      className="rounded-3xl p-5 sm:p-6 space-y-5 bg-white/95 border border-slate-200/90 shadow-md backdrop-blur-md"
      style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-black text-gray-900">
                Local Transport Budget & Auto Fare Guide
              </h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Govt Regulated
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Official Auto, E-Rickshaw & Taxi anti-scam rate card for tourists.
            </p>
          </div>
        </div>

        {/* City Selector */}
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="font-bold text-xs px-3 py-1.5 rounded-xl border border-orange-200 bg-orange-50 text-orange-950 focus:outline-none cursor-pointer shadow-2xs"
        >
          <option value="ayodhya">🛕 Ayodhya Dham Fares</option>
          <option value="jammu">🏔️ Jammu & Katra Fares</option>
          <option value="tajmahal">🕌 Agra (Taj Mahal) Fares</option>
          <option value="general">🇮🇳 Pan-India Standard</option>
        </select>
      </div>

      {/* Fair Fare Calculator Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80">
        
        {/* Vehicle Selection */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide block">
            1. Select Vehicle Type
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => setVehicleType('AUTO')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                vehicleType === 'AUTO'
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              🛺 Auto
            </button>
            <button
              onClick={() => setVehicleType('ERIKSHAW')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                vehicleType === 'ERIKSHAW'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              🔋 E-Rick
            </button>
            <button
              onClick={() => setVehicleType('CAB')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                vehicleType === 'CAB'
                  ? 'bg-violet-600 text-white border-violet-700 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              🚕 Taxi/Cab
            </button>
          </div>
        </div>

        {/* Distance Slider / Input */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[11px] font-bold text-gray-600 uppercase">
            <span>2. Trip Distance</span>
            <span className="text-orange-600 font-extrabold">{distanceKm} KM</span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            step="0.5"
            value={distanceKm}
            onChange={(e) => setDistanceKm(parseFloat(e.target.value))}
            className="w-full accent-orange-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-400 font-mono">
            <span>1 km</span>
            <span>15 km</span>
            <span>30 km</span>
          </div>
        </div>

        {/* Calculated Official Price Card */}
        <div className="p-3 bg-white rounded-2xl border-2 border-amber-300/80 shadow-sm text-center space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
            Regulated Fair Fare
          </span>
          <div className="text-2xl font-black text-amber-900 tracking-tight">
            {currentFare.text}
          </div>
          <button
            onClick={() => setShowDriverCard(true)}
            className="text-[11px] font-bold text-orange-600 hover:text-orange-800 underline block mx-auto"
          >
            📱 Show Driver Card (चालक को दिखाएं)
          </button>
        </div>

      </div>

      {/* Popular Tourist Routes Rate Card Table */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wide text-gray-800 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Popular Route Rate Cards ({cityConfig.cityName.split('(')[0]})</span>
          </span>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
            No Surge Pricing
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {cityConfig.commonRoutes.map((rt, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2 hover:border-orange-300 transition-colors text-xs"
            >
              <div className="font-bold text-gray-900 flex items-start space-x-1">
                <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <span>{rt.from}</span>
                  <span className="text-gray-400 block text-[10px]">➔ {rt.to} ({rt.distKm} km)</span>
                </div>
              </div>

              <div className="pt-1 border-t border-slate-200/60 flex justify-between items-center text-[11px]">
                <span className="text-gray-600 font-medium">🛺 Auto: <strong className="text-amber-900">{rt.autoFare}</strong></span>
                <span className="text-gray-600 font-medium">🚕 Cab: <strong className="text-violet-900">{rt.cabFare.split(' ')[0]}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 📱 Fullscreen "Show Driver Card" Modal to prevent driver bargaining scams */}
      <AnimatePresence>
        {showDriverCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border-4 border-amber-400 space-y-5 text-center"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shadow-sm">
                <IndianRupee className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  परिवहन विभाग अधिकृत किराया दर
                </span>
                <h3 className="text-xl font-black text-gray-900 pt-2">
                  {cityConfig.cityName.split('(')[0]}
                </h3>
                <p className="text-xs text-gray-500">
                  अनुमानित दूरी: <strong>{distanceKm} किलोमीटर</strong>
                </p>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 text-amber-950 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider block">उचित सरकारी दर:</span>
                <span className="text-4xl font-black tracking-tight">{currentFare.text}</span>
                <span className="text-[11px] text-gray-600 block pt-1">
                  (वाहन: {vehicleType === 'AUTO' ? 'ऑटो रिक्शा' : vehicleType === 'ERIKSHAW' ? 'ई-रिक्शा' : 'टैक्सी/कैब'})
                </span>
              </div>

              <button
                onClick={() => setShowDriverCard(false)}
                className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition-colors"
              >
                बंद करें (Close Card)
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
