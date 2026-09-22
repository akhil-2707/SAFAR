import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  MapPin, Navigation, ArrowUpDown, Sparkles, 
  AlertCircle, RefreshCw, Info, ShieldCheck, Scale, 
  Coins, Zap, CheckCircle2 
} from 'lucide-react';
import RideCompareCard from './RideCompareCard';
import RideRouteMiniMap from './RideRouteMiniMap';
import FareGuardBanner from './FareGuardBanner';
import FareBreakdownModal from './FareBreakdownModal';

const PRESET_ROUTES = [
  {
    circuit: 'Ayodhya Dham',
    label: 'Ayodhya Station ➔ Ram Mandir',
    pickup: { lat: 26.7725, lng: 82.1384, address: 'Ayodhya Cantt Railway Station' },
    dropoff: { lat: 26.7922, lng: 82.1998, address: 'Ram Janmabhoomi Complex' }
  },
  {
    circuit: 'Agra Circuit',
    label: 'Agra Station ➔ Taj Mahal',
    pickup: { lat: 27.1592, lng: 77.9942, address: 'Agra Cantt Railway Station' },
    dropoff: { lat: 27.1751, lng: 78.0421, address: 'Taj Mahal East Gate' }
  },
  {
    circuit: 'Jammu & Katra',
    label: 'Katra Station ➔ Banganga Yatra',
    pickup: { lat: 32.9912, lng: 74.9312, address: 'Shri Mata Vaishno Devi Katra Station' },
    dropoff: { lat: 33.0035, lng: 74.9542, address: 'Banganga Yatra Checkpost' }
  },
  {
    circuit: 'Guwahati Circuit',
    label: 'Guwahati Station ➔ Kamakhya',
    pickup: { lat: 26.1824, lng: 91.7505, address: 'Guwahati Central Railway Station' },
    dropoff: { lat: 26.1664, lng: 91.7054, address: 'Maa Kamakhya Temple Gate' }
  },
  {
    circuit: 'Delhi Heritage',
    label: 'New Delhi Station ➔ India Gate',
    pickup: { lat: 28.6429, lng: 77.2195, address: 'New Delhi Railway Station' },
    dropoff: { lat: 28.6129, lng: 77.2295, address: 'India Gate Monument' }
  }
];

export default function RideCompareView({ tourist }) {
  const [searchParams] = useSearchParams();

  // Default pickup to tourist's current location or Ayodhya
  const defaultPickup = {
    lat: tourist?.currentLocation?.lat || 26.7725,
    lng: tourist?.currentLocation?.lng || 82.1384,
    address: tourist?.currentLocation?.address || 'Ayodhya Cantt Railway Station'
  };

  const defaultDropoff = {
    lat: 26.7922,
    lng: 82.1998,
    address: 'Ram Janmabhoomi Complex, Ayodhya'
  };

  const [pickup, setPickup] = useState(defaultPickup);
  const [dropoff, setDropoff] = useState(defaultDropoff);
  const [pickupSearch, setPickupSearch] = useState(defaultPickup.address);
  const [dropoffSearch, setDropoffSearch] = useState(defaultDropoff.address);

  // Autocomplete dropdown states
  const [pickupResults, setPickupResults] = useState([]);
  const [dropoffResults, setDropoffResults] = useState([]);
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const [isSearchingDropoff, setIsSearchingDropoff] = useState(false);
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDropoffDropdown, setShowDropoffDropdown] = useState(false);

  // Tourist Preference Mode (4 Distinct Modes)
  // 'LOWEST_COST' | 'FASTEST_ARRIVAL' | 'SAFETY_COMFORT' | 'BALANCED_VALUE'
  const [touristPreference, setTouristPreference] = useState('LOWEST_COST');

  // Vehicle Category Filter
  const [preference, setPreference] = useState('ALL'); // 'ALL' | 'BIKE' | 'AUTO' | 'CAB' | 'PREMIUM'
  const [sortBy, setSortBy] = useState('OPTIMAL'); // 'OPTIMAL' | 'PRICE' | 'ETA'

  // Comparison State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);

  // Breakdown Modal State
  const [selectedBreakdownOption, setSelectedBreakdownOption] = useState(null);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);

  const pickupRef = useRef(null);
  const dropoffRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickupRef.current && !pickupRef.current.contains(e.target)) {
        setShowPickupDropdown(false);
      }
      if (dropoffRef.current && !dropoffRef.current.contains(e.target)) {
        setShowDropoffDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync with tourist prop updates
  useEffect(() => {
    if (tourist?.currentLocation?.lat && tourist?.currentLocation?.lng) {
      const loc = {
        lat: tourist.currentLocation.lat,
        lng: tourist.currentLocation.lng,
        address: tourist.currentLocation.address || 'My Live Location'
      };
      setPickup(loc);
      setPickupSearch(loc.address);
    }
  }, [tourist]);

  // Deep-linking / URL Search Params listener (decoupled auto-fill for external modules or shared links)
  useEffect(() => {
    const pLat = searchParams.get('pLat');
    const pLng = searchParams.get('pLng');
    const pName = searchParams.get('pName');
    const dLat = searchParams.get('dLat');
    const dLng = searchParams.get('dLng');
    const dName = searchParams.get('dName');
    const pref = searchParams.get('pref');

    if (pLat && pLng && dLat && dLng) {
      const parsedPickup = {
        lat: parseFloat(pLat),
        lng: parseFloat(pLng),
        address: pName || 'Selected Pickup'
      };
      const parsedDropoff = {
        lat: parseFloat(dLat),
        lng: parseFloat(dLng),
        address: dName || 'Selected Destination'
      };
      setPickup(parsedPickup);
      setPickupSearch(parsedPickup.address);
      setDropoff(parsedDropoff);
      setDropoffSearch(parsedDropoff.address);

      if (pref && ['LOWEST_COST', 'FASTEST_ARRIVAL', 'SAFETY_COMFORT', 'BALANCED_VALUE'].includes(pref)) {
        setTouristPreference(pref);
      }
      executeComparison(parsedPickup, parsedDropoff, preference);
    } else {
      // Initial automatic calculation on load with default points
      executeComparison(defaultPickup, defaultDropoff, preference);
    }
  }, [searchParams]);

  // Debounced Nominatim Geocoding for Pickup
  useEffect(() => {
    if (!pickupSearch || pickupSearch === pickup.address || pickupSearch.length < 3) {
      setPickupResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingPickup(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          pickupSearch
        )}&countrycodes=in&limit=5&addressdetails=1`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
        if (res.ok) {
          const text = await res.text();
          if (text && text.trim().length > 0) {
            try {
              const data = JSON.parse(text);
              if (Array.isArray(data)) {
                setPickupResults(
                  data.map((item) => ({
                    address: item.display_name.split(',').slice(0, 3).join(', '),
                    lat: parseFloat(item.lat),
                    lng: parseFloat(item.lon)
                  }))
                );
                setShowPickupDropdown(true);
              }
            } catch {
              // ignore invalid external geocoding response
            }
          }
        }
      } catch (err) {
        console.warn('Geocoding error:', err);
      } finally {
        setIsSearchingPickup(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [pickupSearch]);

  // Debounced Nominatim Geocoding for Dropoff
  useEffect(() => {
    if (!dropoffSearch || dropoffSearch === dropoff.address || dropoffSearch.length < 3) {
      setDropoffResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingDropoff(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          dropoffSearch
        )}&countrycodes=in&limit=5&addressdetails=1`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
        if (res.ok) {
          const text = await res.text();
          if (text && text.trim().length > 0) {
            try {
              const data = JSON.parse(text);
              if (Array.isArray(data)) {
                setDropoffResults(
                  data.map((item) => ({
                    address: item.display_name.split(',').slice(0, 3).join(', '),
                    lat: parseFloat(item.lat),
                    lng: parseFloat(item.lon)
                  }))
                );
                setShowDropoffDropdown(true);
              }
            } catch {
              // ignore invalid external geocoding response
            }
          }
        }
      } catch (err) {
        console.warn('Geocoding error:', err);
      } finally {
        setIsSearchingDropoff(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [dropoffSearch]);

  // Execute Comparison API Request
  const executeComparison = async (p = pickup, d = dropoff, pref = preference) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/fares/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickup: p,
          dropoff: d,
          preference: pref
        })
      });

      // Safely read response text first to guard against empty bodies or proxy errors
      const text = await res.text();
      let data = null;

      if (text && text.trim().length > 0) {
        try {
          data = JSON.parse(text);
        } catch {
          console.warn('[RideCompareView] Response was not valid JSON:', text.slice(0, 150));
        }
      }

      // Check HTTP status code
      if (!res.ok) {
        let errorMsg = data?.error;
        if (!errorMsg) {
          if (res.status === 504 || res.status === 502) {
            errorMsg = 'Backend service is not responding. Please ensure the backend server is running on port 5000.';
          } else if (res.status === 404) {
            errorMsg = 'Comparison endpoint (/api/fares/compare) not found. Please verify backend routes.';
          } else {
            errorMsg = 'Fare comparison service is temporarily unavailable. Please try again.';
          }
        }
        throw new Error(errorMsg);
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Fare comparison service is temporarily unavailable. Please try again.');
      }

      setComparisonData(data);
    } catch (err) {
      console.error('[RideCompareView] Comparison error:', err);
      const isSyntaxOrParseError = err.message && (
        err.message.includes('Unexpected end of JSON') ||
        err.message.includes('JSON.parse') ||
        err.message.includes('is not valid JSON') ||
        err.message.includes('Unexpected token') ||
        err.message.includes('Failed to execute')
      );
      setError(
        isSyntaxOrParseError
          ? 'Fare comparison service is temporarily unavailable. Please try again.'
          : err.message || 'Fare comparison service is temporarily unavailable. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Swap Locations Handler
  const handleSwap = () => {
    const tempP = pickup;
    const tempSearch = pickupSearch;
    setPickup(dropoff);
    setPickupSearch(dropoffSearch);
    setDropoff(tempP);
    setDropoffSearch(tempSearch);
    executeComparison(dropoff, tempP, preference);
  };

  // Use GPS Location Button
  const handleUseGps = () => {
    if (tourist?.currentLocation?.lat && tourist?.currentLocation?.lng) {
      const gpsLoc = {
        lat: tourist.currentLocation.lat,
        lng: tourist.currentLocation.lng,
        address: tourist.currentLocation.address || 'My Live Location'
      };
      setPickup(gpsLoc);
      setPickupSearch(gpsLoc.address);
      executeComparison(gpsLoc, dropoff, preference);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const live = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: 'My Current GPS Location'
        };
        setPickup(live);
        setPickupSearch(live.address);
        executeComparison(live, dropoff, preference);
      });
    }
  };

  // Handle Preset Route Selection
  const handleSelectPreset = (preset) => {
    setPickup(preset.pickup);
    setPickupSearch(preset.pickup.address);
    setDropoff(preset.dropoff);
    setDropoffSearch(preset.dropoff.address);
    executeComparison(preset.pickup, preset.dropoff, preference);
  };

  // Filter and sort options on client for instantaneous UI toggling
  const getDisplayedOptions = () => {
    if (!comparisonData?.options) return [];
    let opts = [...comparisonData.options];

    // 1. Filter by vehicle category if not ALL
    if (preference !== 'ALL') {
      opts = opts.filter((o) => o.category === preference);
    }

    // 2. Apply Tourist Preference Mode
    if (touristPreference === 'SAFETY_COMFORT') {
      // Prioritizes enclosed vehicle categories (Cabs, Autos) based on available vehicle metadata
      opts = opts.filter((o) => o.isEnclosedVehicle || (o.category !== 'BIKE' && o.passengerCapacity > 1));
      opts.sort((a, b) => a.minFare - b.minFare);
    } else if (touristPreference === 'FASTEST_ARRIVAL') {
      opts.sort((a, b) => a.etaMins - b.etaMins);
    } else if (touristPreference === 'BALANCED_VALUE') {
      opts.sort((a, b) => (a.balancedScore ?? 999) - (b.balancedScore ?? 999));
    } else {
      // LOWEST_COST
      opts.sort((a, b) => a.minFare - b.minFare);
    }

    // 3. User manual sort override (if chosen from dropdown)
    if (sortBy === 'PRICE') {
      opts.sort((a, b) => a.minFare - b.minFare);
    } else if (sortBy === 'ETA') {
      opts.sort((a, b) => a.etaMins - b.etaMins);
    }

    return opts;
  };

  const displayedOptions = getDisplayedOptions();
  const summary = comparisonData?.summary;

  return (
    <div className="space-y-6">
      
      {/* ⚠️ Mandatory Evaluator Truthfulness Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 text-xs space-y-1.5 shadow-sm">
        <div className="flex items-center space-x-2 font-bold text-amber-900">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span className="uppercase tracking-wider">SIH Prototype Transparency Note</span>
        </div>
        <p className="leading-relaxed text-slate-700">
          Prototype fare estimates from multiple provider adapters appear side-by-side. Calculated via regional tariff models. Real-world live fare APIs require enterprise commercial agreements with Uber, Ola, and Rapido. Official booking links provided below to confirm real-time fares on provider apps.
        </p>
      </div>

      {/* Main Input & Search Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white/95 border border-slate-200/90 shadow-lg space-y-5 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Multi-Provider Transit Route Comparator
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Compare calibrated ride-hailing options across Uber, Ola, and Rapido with official booking handoff.
            </p>
          </div>
          <button
            onClick={handleUseGps}
            className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-2xs"
          >
            <Navigation className="w-3.5 h-3.5 text-orange-600" />
            <span>Use My Location</span>
          </button>
        </div>

        {/* Route Input Rows */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          
          {/* Pickup Input */}
          <div ref={pickupRef} className="lg:col-span-5 relative">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Pickup Point
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
              <input
                type="text"
                value={pickupSearch}
                onChange={(e) => setPickupSearch(e.target.value)}
                onFocus={() => { if (pickupResults.length > 0) setShowPickupDropdown(true); }}
                placeholder="Enter pickup station, hotel or landmark..."
                className="w-full rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
              />
              {isSearchingPickup && (
                <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin absolute right-3.5 top-3" />
              )}
            </div>

            {/* Pickup Autocomplete Dropdown */}
            {showPickupDropdown && pickupResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 max-h-48 overflow-y-auto p-1.5 space-y-1 text-xs">
                {pickupResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPickup(item);
                      setPickupSearch(item.address);
                      setShowPickupDropdown(false);
                      executeComparison(item, dropoff, preference);
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-emerald-50 text-slate-800 font-medium flex items-center space-x-2 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{item.address}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="lg:col-span-2 flex items-center justify-center pt-4 lg:pt-0">
            <button
              onClick={handleSwap}
              type="button"
              className="p-2.5 rounded-full bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-orange-600 border border-slate-200 hover:border-orange-300 transition-all shadow-sm"
              title="Swap pickup and destination"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* Dropoff Input */}
          <div ref={dropoffRef} className="lg:col-span-5 relative">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Destination Point
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-orange-600 absolute left-3.5 top-3" />
              <input
                type="text"
                value={dropoffSearch}
                onChange={(e) => setDropoffSearch(e.target.value)}
                onFocus={() => { if (dropoffResults.length > 0) setShowDropoffDropdown(true); }}
                placeholder="Enter destination temple, monument or hub..."
                className="w-full rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white transition-all shadow-inner"
              />
              {isSearchingDropoff && (
                <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin absolute right-3.5 top-3" />
              )}
            </div>

            {/* Dropoff Autocomplete Dropdown */}
            {showDropoffDropdown && dropoffResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 max-h-48 overflow-y-auto p-1.5 space-y-1 text-xs">
                {dropoffResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDropoff(item);
                      setDropoffSearch(item.address);
                      setShowDropoffDropdown(false);
                      executeComparison(pickup, item, preference);
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-orange-50 text-slate-800 font-medium flex items-center space-x-2 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    <span className="truncate">{item.address}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Quick Route Preset Chips */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Popular Tourist Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_ROUTES.map((route, i) => (
              <button
                key={i}
                onClick={() => handleSelectPreset(route)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all border ${
                  dropoff.address === route.dropoff.address
                    ? 'bg-orange-500 text-white border-orange-600 shadow-xs'
                    : 'bg-white hover:bg-orange-50 text-slate-700 border-slate-200'
                }`}
              >
                <span>{route.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 🌟 4 Tourist Preference Modes */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Tourist Preference Mode:</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Deterministic multi-criteria ranking</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'LOWEST_COST', label: 'Lowest Cost', icon: <Coins className="w-3.5 h-3.5" />, desc: 'Min fare sorted' },
              { id: 'FASTEST_ARRIVAL', label: 'Fastest Arrival', icon: <Zap className="w-3.5 h-3.5" />, desc: 'Min pickup ETA' },
              { id: 'SAFETY_COMFORT', label: 'Safety & Comfort', icon: <ShieldCheck className="w-3.5 h-3.5" />, desc: 'Enclosed vehicles' },
              { id: 'BALANCED_VALUE', label: 'Balanced Value', icon: <Scale className="w-3.5 h-3.5" />, desc: '60% Cost / 40% ETA' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setTouristPreference(m.id);
                  setSortBy('OPTIMAL');
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all ${
                  touristPreference === m.id
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <div className="flex items-center space-x-1.5 font-bold text-xs">
                  {m.icon}
                  <span>{m.label}</span>
                </div>
                <div className={`text-[10px] mt-0.5 ${touristPreference === m.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {m.desc}
                </div>
              </button>
            ))}
          </div>

          {/* Explicit Explanations for Safety & Comfort and Balanced Value */}
          {touristPreference === 'SAFETY_COMFORT' && (
            <div className="p-2.5 rounded-xl bg-indigo-50/90 border border-indigo-200 text-indigo-950 text-xs flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                <strong>Safety &amp; Comfort preference:</strong> Prioritizes enclosed vehicle categories (Cabs, Autos) based on available vehicle metadata.
              </span>
            </div>
          )}
          {touristPreference === 'BALANCED_VALUE' && (
            <div className="p-2.5 rounded-xl bg-indigo-50/90 border border-indigo-200 text-indigo-950 text-xs flex items-center space-x-2">
              <Scale className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                <strong>Balanced Value:</strong> Deterministic weighting balancing cost (60% weight) and nominal pickup speed (40% weight).
              </span>
            </div>
          )}
        </div>

        {/* Vehicle Mode Filter Chips & Sort Override */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'ALL', label: 'All Modes' },
              { id: 'BIKE', label: '🏍️ Bike Taxi' },
              { id: 'AUTO', label: '🛺 Auto' },
              { id: 'CAB', label: '🚕 Economy Cab' },
              { id: 'PREMIUM', label: '✨ Premium' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setPreference(cat.id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all border ${
                  preference === cat.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold text-slate-600">
            <span>Sort Override:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="OPTIMAL">By Preference Mode</option>
              <option value="PRICE">Lowest Fare First</option>
              <option value="ETA">Fastest Pickup First</option>
            </select>
          </div>
        </div>

      </div>

      {/* Route Mini-Map */}
      <RideRouteMiniMap
        pickup={pickup}
        dropoff={dropoff}
        summary={comparisonData?.summary}
        directDistanceKm={comparisonData?.summary?.directDistanceKm}
        approxDistanceKm={comparisonData?.summary?.approxDistanceKm}
        approxDurationMins={comparisonData?.summary?.approxDurationMins}
      />

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => executeComparison(pickup, dropoff, preference)}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl text-xs font-extrabold transition-colors cursor-pointer shrink-0 border border-red-300"
          >
            Retry
          </button>
        </div>
      )}

      {/* Fare Guard Municipal Benchmark Overlay */}
      {comparisonData && (
        <FareGuardBanner
          localBenchmark={comparisonData.localBenchmark || comparisonData.summary?.localBenchmark}
          options={comparisonData.options}
        />
      )}

      {/* Route Distance & Duration Summary Bar */}
      {summary && (
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/95 border border-slate-200/80 text-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase block tracking-wider">
                {summary.distanceLabel}
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-slate-900">
                ~{summary.approxDistanceKm} km
              </span>
            </div>

            <div className="border-l border-slate-200 pl-4 sm:pl-6">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase block tracking-wider">
                {summary.durationLabel}
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-amber-600">
                ~{summary.approxDurationMins} mins
              </span>
            </div>

            {summary.cheapestFare && (
              <div className="border-l border-slate-200 pl-4 sm:pl-6 hidden md:block">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase block tracking-wider">
                  Lowest Prototype Quote
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-emerald-600">
                  ₹{summary.cheapestFare}
                </span>
              </div>
            )}
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {summary.operatingMode}
            </span>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
          <p className="text-xs font-bold text-slate-600">
            Calculating multi-provider mobility estimates...
          </p>
        </div>
      )}

      {/* Ride Comparison Grid */}
      {!loading && displayedOptions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wide text-slate-800 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>Estimated Provider Rides ({displayedOptions.length} Options)</span>
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              Adapters: Uber, Ola, Rapido
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedOptions.map((opt, idx) => (
              <RideCompareCard
                key={idx}
                option={opt}
                onViewBreakdown={(option) => {
                  setSelectedBreakdownOption(option);
                  setShowBreakdownModal(true);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && displayedOptions.length === 0 && !error && (
        <div className="p-8 text-center rounded-3xl bg-slate-50 border border-slate-200 text-slate-500 text-xs">
          No ride estimates found matching the selected filters. Try switching preference mode or vehicle category.
        </div>
      )}

      {/* Transparent Fare Breakdown Calculation Modal */}
      <FareBreakdownModal
        isOpen={showBreakdownModal}
        onClose={() => setShowBreakdownModal(false)}
        option={selectedBreakdownOption}
        summary={comparisonData?.summary}
      />

    </div>
  );
}
