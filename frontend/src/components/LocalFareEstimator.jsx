import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ShieldCheck, MapPin, Car, AlertCircle, ArrowRight, CheckCircle2, IndianRupee, Sparkles } from 'lucide-react';

const DESTINATION_FARES = {
  ayodhya: {
    cityName: '🛕 Ayodhya Dham (Uttar Pradesh)',
    baseFareERickshaw: 15,
    perKmERickshaw: 7.0,
    baseFareAuto: 30,
    perKmAuto: 11,
    baseFareCab: 60,
    perKmCab: 15,
    baseFareBike: 15,
    perKmBike: 6.0,
    eRickshawShared: '₹15 - ₹25 per passenger',
    commonRoutes: [
      { from: 'Ayodhya Cantt Railway Station', to: 'Ram Janmabhoomi Complex', distKm: 7.2, eRickFare: '₹55 - ₹70', autoFare: '₹70 - ₹90', cabFare: '₹220 - ₹260' },
      { from: 'Maharishi Valmiki Airport (AYJ)', to: 'Ram Mandir / Dharamshala', distKm: 12.5, eRickFare: '₹90 - ₹120', autoFare: '₹130 - ₹160', cabFare: '₹350 - ₹420' },
      { from: 'Hanuman Garhi', to: 'Saryu River Ghats (Naya Ghat)', distKm: 2.5, eRickFare: '₹20 - ₹30', autoFare: '₹30 - ₹45', cabFare: '₹120 - ₹150' },
    ]
  },
  jammu: {
    cityName: '🏔️ Jammu & Katra (Vaishno Devi)',
    baseFareERickshaw: 20,
    perKmERickshaw: 8.5,
    baseFareAuto: 40,
    perKmAuto: 14,
    baseFareCab: 80,
    perKmCab: 18,
    baseFareBike: 20,
    perKmBike: 7.0,
    eRickshawShared: '₹20 - ₹30 flat within Katra',
    commonRoutes: [
      { from: 'Jammu Tawi Railway Station', to: 'Katra Base Camp', distKm: 48.0, eRickFare: '₹120 (Local zone)', autoFare: '₹140 - ₹180 (Shared)', cabFare: '₹850 - ₹1100 (Prepaid Cab)' },
      { from: 'Katra Bus Stand', to: 'Banganga / Helipad Gate', distKm: 3.2, eRickFare: '₹30 - ₹45', autoFare: '₹40 - ₹60', cabFare: '₹150 - ₹180' },
      { from: 'Jammu Airport (IXJ)', to: 'Raghunath Temple Jammu', distKm: 6.8, eRickFare: '₹60 - ₹80', autoFare: '₹80 - ₹110', cabFare: '₹250 - ₹300' },
    ]
  },
  tajmahal: {
    cityName: '🕌 Agra (Taj Mahal Heritage Circuit)',
    baseFareERickshaw: 18,
    perKmERickshaw: 8.0,
    baseFareAuto: 35,
    perKmAuto: 12,
    baseFareCab: 70,
    perKmCab: 16,
    baseFareBike: 18,
    perKmBike: 6.5,
    eRickshawShared: '₹15 - ₹20 shared near monument',
    commonRoutes: [
      { from: 'Agra Cantt Railway Station', to: 'Taj Mahal East Gate', distKm: 6.5, eRickFare: '₹55 - ₹75', autoFare: '₹70 - ₹95', cabFare: '₹220 - ₹270' },
      { from: 'Taj Mahal Complex', to: 'Agra Fort (UNESCO)', distKm: 3.1, eRickFare: '₹25 - ₹40', autoFare: '₹40 - ₹55', cabFare: '₹130 - ₹160' },
      { from: 'Agra Fort', to: 'Mehtab Bagh (Sunset View)', distKm: 7.8, eRickFare: '₹65 - ₹85', autoFare: '₹80 - ₹110', cabFare: '₹240 - ₹290' },
    ]
  },
  general: {
    cityName: '🇮🇳 Pan-India Tourist Standard (MoRTH Rates)',
    baseFareERickshaw: 15,
    perKmERickshaw: 7.5,
    baseFareAuto: 30,
    perKmAuto: 12,
    baseFareCab: 60,
    perKmCab: 16,
    baseFareBike: 15,
    perKmBike: 6.0,
    eRickshawShared: '₹15 - ₹25 standard',
    commonRoutes: [
      { from: 'Nearest City Transit Terminal', to: 'Primary Tourism Hub', distKm: 5.0, eRickFare: '₹40 - ₹60', autoFare: '₹55 - ₹75', cabFare: '₹180 - ₹220' },
      { from: 'City Center Hub', to: 'State Heritage Monument', distKm: 8.5, eRickFare: '₹70 - ₹95', autoFare: '₹95 - ₹125', cabFare: '₹280 - ₹340' },
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
  const [vehicleType, setVehicleType] = useState('ERICKSHAW'); // 'ERICKSHAW' | 'AUTO' | 'BIKE' | 'CAB'
  const [showDriverCard, setShowDriverCard] = useState(false);

  const cityConfig = DESTINATION_FARES[selectedCity] || DESTINATION_FARES.general;

  // Calculate estimated fair fare with canonical matching
  const computeFare = (dist, rawType) => {
    const numDist = parseFloat(dist) || 1;
    const type = (rawType || '').toUpperCase().replace(/[^A-Z]/g, '');

    // ⚡ E-Rickshaw canonical matching (ERICKSHAW, E-RICKSHAW, ERICK, RICKSHAW)
    if (type.includes('RICK') || type.includes('ERICK')) {
      const base = cityConfig.baseFareERickshaw || 15;
      const perKm = cityConfig.perKmERickshaw || 7.5;
      const extraKm = Math.max(0, numDist - 1.5);
      const min = Math.round(base + extraKm * perKm);
      const max = Math.round(min * 1.25);
      const sharedFare = numDist <= 3 ? '₹15 - ₹25' : numDist <= 8 ? '₹25 - ₹40' : '₹45 - ₹60';
      return { 
        min, 
        max, 
        text: `₹${min} - ₹${max}`, 
        sharedText: `${sharedFare} (Shared/Seat)`,
        vehicleLabel: 'E-Rickshaw (ई-रिक्शा)',
        rateInfo: `₹${perKm}/km after 1.5km base ₹${base}`
      };
    }

    // 🏍️ Bike-Taxi matching (BIKE, MOTO)
    if (type.includes('BIKE') || type.includes('MOTO')) {
      const base = cityConfig.baseFareBike || 15;
      const perKm = cityConfig.perKmBike || 6.0;
      const extraKm = Math.max(0, numDist - 1.0);
      const min = Math.round(base + extraKm * perKm);
      const max = Math.round(min * 1.2);
      return {
        min,
        max,
        text: `₹${min} - ₹${max}`,
        sharedText: 'Solo Bike Pilot',
        vehicleLabel: 'Bike-Taxi (बाइक टैक्सी)',
        rateInfo: `₹${perKm}/km after 1km base ₹${base}`
      };
    }

    // 🛺 Auto matching (AUTO)
    if (type.includes('AUTO')) {
      const base = cityConfig.baseFareAuto || 30;
      const perKm = cityConfig.perKmAuto || 11;
      const extraKm = Math.max(0, numDist - 1.5);
      const min = Math.round(base + extraKm * perKm);
      const max = Math.round(min * 1.25);
      return { 
        min, 
        max, 
        text: `₹${min} - ₹${max}`,
        sharedText: 'Full Auto Metered',
        vehicleLabel: 'Auto-Rickshaw (ऑटो)',
        rateInfo: `₹${perKm}/km after 1.5km base ₹${base}`
      };
    }

    // 🚕 Cab matching (CAB, TAXI)
    const base = cityConfig.baseFareCab || 60;
    const perKm = cityConfig.perKmCab || 16;
    const extraKm = Math.max(0, numDist - 2.0);
    const min = Math.round(base + extraKm * perKm);
    const max = Math.round(min * 1.25);
    return { 
      min, 
      max, 
      text: `₹${min} - ₹${max}`,
      sharedText: 'Private Sedan/Hatchback',
      vehicleLabel: 'Taxi / Cab (टैक्सी/कैब)',
      rateInfo: `₹${perKm}/km after 2km base ₹${base}`
    };
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
                Local Transport Budget & Fare Guide
              </h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Govt Regulated
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Official E-Rickshaw, Auto, Bike-Taxi & Cab anti-scam rate card for tourists.
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button
              onClick={() => setVehicleType('ERICKSHAW')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                vehicleType === 'ERICKSHAW'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              ⚡ E-Rick
            </button>
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
              onClick={() => setVehicleType('BIKE')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                vehicleType === 'BIKE'
                  ? 'bg-sky-600 text-white border-sky-700 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              🏍️ Bike
            </button>
            <button
              onClick={() => setVehicleType('CAB')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                vehicleType === 'CAB'
                  ? 'bg-violet-600 text-white border-violet-700 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              🚕 Cab
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
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
              Regulated Fair Fare
            </span>
            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-orange-100 text-orange-800">
              {currentFare.vehicleLabel.split(' ')[0]}
            </span>
          </div>
          <div className="text-2xl font-black text-amber-900 tracking-tight">
            {currentFare.text}
          </div>
          {currentFare.sharedText && (
            <span className="text-[10px] text-emerald-700 font-bold block">
              {currentFare.sharedText}
            </span>
          )}
          <button
            onClick={() => setShowDriverCard(true)}
            className="text-[11px] font-bold text-orange-600 hover:text-orange-800 underline block mx-auto pt-0.5"
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

              <div className="pt-1.5 border-t border-slate-200/60 flex flex-wrap justify-between items-center text-[10px] sm:text-[11px] gap-1">
                <span className="text-gray-600 font-medium">⚡ E-Rick: <strong className="text-emerald-700">{rt.eRickFare || '₹40 - ₹60'}</strong></span>
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
                <span className="text-[11px] text-gray-700 font-semibold block pt-1">
                  (वाहन: {currentFare.vehicleLabel})
                </span>
                {currentFare.sharedText && (
                  <span className="text-[10px] text-emerald-800 font-mono block">
                    {currentFare.sharedText}
                  </span>
                )}
                <span className="text-[9px] text-gray-500 block pt-0.5">
                  दर नियम: {currentFare.rateInfo}
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
