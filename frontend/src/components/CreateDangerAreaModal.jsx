import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, AlertTriangle, MapPin, X, Check, Radio, Navigation, 
  Sparkles, Search, Loader2, Compass, Globe, ExternalLink 
} from 'lucide-react';

// Curated Instant Database of 50+ Top Indian Tourist, Mountain, Pilgrimage & Border Hotspots
const INDIA_LOCATIONS_DATABASE = [
  // North-East India (Priority Corridor)
  { name: 'Guwahati Safe Tourism Hub', state: 'Assam', lat: 26.1445, lng: 91.7362, type: 'State Hub' },
  { name: 'Kaziranga National Park', state: 'Assam', lat: 26.5775, lng: 93.1711, type: 'Wildlife Sanctuary' },
  { name: 'Kamrup Restricted Border Zone', state: 'Assam', lat: 26.3500, lng: 91.6000, type: 'Border Buffer' },
  { name: 'Cherrapunji (Sohra) Gorge', state: 'Meghalaya', lat: 25.2986, lng: 91.7324, type: 'High Rainfall Valley' },
  { name: 'Shillong Peak & City', state: 'Meghalaya', lat: 25.5788, lng: 91.8933, type: 'Hill Station' },
  { name: 'Dawki Umngot River Border', state: 'Meghalaya', lat: 25.1873, lng: 92.0195, type: 'International Border' },
  { name: 'Mawsynram Wet Caves', state: 'Meghalaya', lat: 25.3000, lng: 91.5833, type: 'Cave System' },
  { name: 'Tawang Monastery & Mountain Pass', state: 'Arunachal Pradesh', lat: 27.5860, lng: 91.8655, type: 'High Altitude Pass' },
  { name: 'Sela Pass High-Altitude Lake', state: 'Arunachal Pradesh', lat: 27.5050, lng: 92.1050, type: 'Snow Hazard Pass' },
  { name: 'Ziro Valley Pine Groves', state: 'Arunachal Pradesh', lat: 27.5956, lng: 93.8291, type: 'Valley Corridor' },
  { name: 'Majuli River Island', state: 'Assam', lat: 26.9535, lng: 94.2037, type: 'River Island' },
  { name: 'Dzukou Valley Trek', state: 'Nagaland / Manipur', lat: 25.5600, lng: 94.0700, type: 'Trekking Hazard' },
  { name: 'Kohima Heritage Ridge', state: 'Nagaland', lat: 25.6751, lng: 94.1086, type: 'Mountain Town' },
  { name: 'Loktak Lake & Floating Phumdis', state: 'Manipur', lat: 24.5500, lng: 93.7800, type: 'Freshwater Lake' },
  { name: 'Gangtok Ridge', state: 'Sikkim', lat: 27.3314, lng: 88.6138, type: 'Himalayan Capital' },
  { name: 'Nathula Border Pass (14,140 ft)', state: 'Sikkim', lat: 27.3865, lng: 88.8310, type: 'Border Defense Line' },
  { name: 'Gurudongmar High Lake', state: 'Sikkim', lat: 27.9940, lng: 88.7090, type: 'Extreme Altitude' },
  { name: 'Darjeeling Tiger Hill', state: 'West Bengal', lat: 27.0410, lng: 88.2663, type: 'Himalayan Ridge' },

  // Northern Mountains, Pilgrimage & Himalayan Passes
  { name: 'Manali Solang Valley', state: 'Himachal Pradesh', lat: 32.2432, lng: 77.1892, type: 'Alpine Adventure' },
  { name: 'Rohtang Pass (13,058 ft)', state: 'Himachal Pradesh', lat: 32.3716, lng: 77.2466, type: 'Blizzard & Avalanche Zone' },
  { name: 'Atal Tunnel North Portal', state: 'Himachal Pradesh', lat: 32.4100, lng: 77.1700, type: 'Highway Gateway' },
  { name: 'Spiti Valley (Kaza)', state: 'Himachal Pradesh', lat: 32.2276, lng: 78.0710, type: 'Cold Desert' },
  { name: 'Shimla Ridge & Mall', state: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734, type: 'Hill Station' },
  { name: 'Dharamshala / McLeodGanj', state: 'Himachal Pradesh', lat: 32.2190, lng: 76.3234, type: 'Sub-Himalayan' },
  { name: 'Kasol & Parvati Valley', state: 'Himachal Pradesh', lat: 32.0100, lng: 77.3150, type: 'Steep River Gorge' },
  { name: 'Leh Ladakh City', state: 'Ladakh', lat: 34.1526, lng: 77.5771, type: 'High Altitude Plateau' },
  { name: 'Pangong Tso Lake (14,270 ft)', state: 'Ladakh', lat: 33.7595, lng: 78.6674, type: 'Border Saline Lake' },
  { name: 'Khardung La Pass (17,582 ft)', state: 'Ladakh', lat: 34.2786, lng: 77.6047, type: 'Extreme High Pass' },
  { name: 'Nubra Valley (Hunder Dunes)', state: 'Ladakh', lat: 34.6863, lng: 77.5673, type: 'Cold Desert Valley' },
  { name: 'Kedarnath Temple Valley', state: 'Uttarakhand', lat: 30.7352, lng: 79.0669, type: 'Flash-Flood Hazard' },
  { name: 'Badrinath Dham', state: 'Uttarakhand', lat: 30.7433, lng: 79.4938, type: 'Pilgrimage Corridor' },
  { name: 'Rishikesh Ganga River Valley', state: 'Uttarakhand', lat: 30.0869, lng: 78.2676, type: 'River Rafting Sector' },
  { name: 'Nainital Lake District', state: 'Uttarakhand', lat: 29.3919, lng: 79.4542, type: 'Lake Town' },
  { name: 'Mussoorie Queen of Hills', state: 'Uttarakhand', lat: 30.4598, lng: 78.0644, type: 'Hill Station' },
  { name: 'Jim Corbett Tiger Reserve', state: 'Uttarakhand', lat: 29.5300, lng: 78.7747, type: 'Wild Predator Zone' },
  { name: 'Joshimath Land Subsidence Zone', state: 'Uttarakhand', lat: 30.5564, lng: 79.5661, type: 'Geological Risk Zone' },
  { name: 'Gulmarg Ski Resort & Apharwat', state: 'Jammu & Kashmir', lat: 34.0484, lng: 74.3805, type: 'Avalanche Snow Zone' },
  { name: 'Pahalgam Betaab Valley', state: 'Jammu & Kashmir', lat: 34.0163, lng: 75.3150, type: 'River Corridor' },
  { name: 'Srinagar Dal Lake', state: 'Jammu & Kashmir', lat: 34.0837, lng: 74.7973, type: 'Waterway Sector' },
  { name: 'Sonamarg Thajiwas Glacier', state: 'Jammu & Kashmir', lat: 34.3100, lng: 75.2900, type: 'Glacial Hazard' },

  // Western, Central & Southern Tourism & Coastal Zones
  { name: 'Jaipur Amer Fort', state: 'Rajasthan', lat: 26.9855, lng: 75.8513, type: 'Historical Landmark' },
  { name: 'Jaisalmer Thar Desert Sand Dunes', state: 'Rajasthan', lat: 26.9157, lng: 70.9083, type: 'Extreme Heat & Sand' },
  { name: 'Udaipur Lake Pichola', state: 'Rajasthan', lat: 24.5854, lng: 73.7125, type: 'Heritage Lake' },
  { name: 'Varanasi Dashashwamedh Ghat', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739, type: 'High Density Ghat' },
  { name: 'Agra Taj Mahal Precinct', state: 'Uttar Pradesh', lat: 27.1751, lng: 78.0421, type: 'Heritage Sector' },
  { name: 'Munnar Anamudi Peak', state: 'Kerala', lat: 10.0889, lng: 77.0595, type: 'Steep Foggy Hills' },
  { name: 'Wayanad Chembra Peak', state: 'Kerala', lat: 11.6854, lng: 76.1320, type: 'Landslide Risk Zone' },
  { name: 'Alleppey Backwaters Corridor', state: 'Kerala', lat: 9.4981, lng: 76.3388, type: 'Water Navigation' },
  { name: 'Ooty Nilgiri Mountain Range', state: 'Tamil Nadu', lat: 11.4102, lng: 76.6950, type: 'Mountain Reserve' },
  { name: 'Kodaikanal Lake & Pillar Rocks', state: 'Tamil Nadu', lat: 10.2381, lng: 77.4892, type: 'Deep Valley Mist' },
  { name: 'Goa Calangute Coastal Sector', state: 'Goa', lat: 15.5439, lng: 73.7553, type: 'High Tide Beach' },
  { name: 'Hampi UNESCO Ruins', state: 'Karnataka', lat: 15.3350, lng: 76.4600, type: 'Rocky Boulders' },
  { name: 'Coorg (Madikeri) Rain Corridor', state: 'Karnataka', lat: 12.4244, lng: 75.7382, type: 'Heavy Rain Hills' },
  { name: 'Andaman Radhanagar Beach', state: 'Andaman & Nicobar', lat: 11.9840, lng: 92.9876, type: 'Rip Current Hazard' },
  { name: 'Rann of Kutch Salt Desert', state: 'Gujarat', lat: 23.7337, lng: 69.8597, type: 'Vast Salt Marsh' },
  { name: 'Sundarbans Mangrove Delta', state: 'West Bengal', lat: 21.9497, lng: 89.1833, type: 'Tidal Tiger Reserve' }
];

const THREAT_LEVELS = [
  {
    id: 'CAUTION',
    level: 'MEDIUM',
    label: 'Caution Advisory',
    color: '#F59E0B',
    bgColor: 'bg-yellow-950/60',
    borderColor: 'border-yellow-500/60',
    textColor: 'text-yellow-400',
    badge: '🟡 Advisory',
    desc: 'Heavy fog, slippery terrain, or moderate congestion. Advisory warning sent to tourists.'
  },
  {
    id: 'HIGH_RISK',
    level: 'HIGH',
    label: 'High Risk Hazard',
    color: '#F97316',
    bgColor: 'bg-orange-950/60',
    borderColor: 'border-orange-500/60',
    textColor: 'text-orange-400',
    badge: '🟠 High Hazard',
    desc: 'Steep cliff, wild animal crossing, or flash-flood buffer. Increases tourist risk index by +40%.'
  },
  {
    id: 'RESTRICTED',
    level: 'CRITICAL',
    label: 'Critical No-Entry Zone',
    color: '#EF4444',
    bgColor: 'bg-red-950/70',
    borderColor: 'border-red-500',
    textColor: 'text-red-400',
    badge: '🔴 Strict No-Entry',
    desc: 'Landslide, avalanche, or military border breach. Triggers acoustic siren on tourist phone & logs incident.'
  }
];

export default function CreateDangerAreaModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState('Kamrup Landslide Hazard Sector');
  const [selectedThreat, setSelectedThreat] = useState(THREAT_LEVELS[2]); // Default RESTRICTED / CRITICAL
  const [radiusMeters, setRadiusMeters] = useState(500);
  const [warningDistance, setWarningDistance] = useState(300);
  
  // Location States
  const [center, setCenter] = useState({ 
    lat: 26.3500, 
    lng: 91.6000, 
    name: 'Kamrup Restricted Border', 
    state: 'Assam' 
  });
  const [customLat, setCustomLat] = useState('26.3500');
  const [customLng, setCustomLng] = useState('91.6000');
  const [alertMessage, setAlertMessage] = useState('🔴 RESTRICTED ZONE: Unauthorized entry detected. Turn back immediately.');
  
  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        searchInputRef.current && !searchInputRef.current.contains(e.target)
      ) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dual-Layer Search Engine: Instant Local + Live OpenStreetMap Nominatim Geocoding
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const trimmed = searchQuery.trim().toLowerCase();

    // 1. Instant match against our curated 50+ Indian tourism & hazard database
    const localMatches = INDIA_LOCATIONS_DATABASE.filter((item) => {
      return (
        item.name.toLowerCase().includes(trimmed) ||
        item.state.toLowerCase().includes(trimmed) ||
        item.type.toLowerCase().includes(trimmed)
      );
    }).map((item) => ({
      name: item.name,
      state: item.state,
      subtitle: `${item.type} • ${item.state}, India`,
      lat: item.lat,
      lng: item.lng,
      isLocal: true
    }));

    setSearchResults(localMatches);
    setShowSearchDropdown(true);

    // 2. Debounced query to live OpenStreetMap Nominatim for ANY village, mountain, or road in India
    setIsSearching(true);
    const debounceTimer = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&countrycodes=in&limit=6&addressdetails=1`;
        
        const response = await fetch(url, {
          headers: {
            'Accept-Language': 'en'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const onlineResults = data.map((item) => {
            const displayNameParts = item.display_name.split(',');
            const primaryName = displayNameParts[0];
            const stateOrRegion = displayNameParts.slice(1, 4).join(',').trim();

            return {
              name: primaryName,
              state: item.address?.state || 'India',
              subtitle: stateOrRegion || 'India',
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              isLocal: false
            };
          });

          // Merge local curated results with online geocoded results (avoiding duplicates)
          const merged = [...localMatches];
          onlineResults.forEach((online) => {
            const alreadyExists = merged.some(
              (m) => Math.abs(m.lat - online.lat) < 0.01 && Math.abs(m.lng - online.lng) < 0.01
            );
            if (!alreadyExists) {
              merged.push(online);
            }
          });

          setSearchResults(merged.slice(0, 10));
        }
      } catch (err) {
        console.warn('Online geocoding fallback to local database:', err);
      } finally {
        setIsSearching(false);
      }
    }, 380);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleSelectLocation = (loc) => {
    setCenter(loc);
    setCustomLat(loc.lat.toFixed(4));
    setCustomLng(loc.lng.toFixed(4));
    setName(`${loc.name} Threat Sector`);
    setShowSearchDropdown(false);
    setSearchQuery('');
  };

  const handleThreatChange = (threat) => {
    setSelectedThreat(threat);
    if (threat.id === 'RESTRICTED') {
      setAlertMessage(`🔴 RESTRICTED ZONE: Unauthorized entry detected in ${center.name}. Turn back immediately.`);
    } else if (threat.id === 'HIGH_RISK') {
      setAlertMessage(`🟠 WARNING: Approaching High Hazard Sector in ${center.name}. Stay on marked pathway.`);
    } else {
      setAlertMessage(`🟡 CAUTION: Moderate hazard advisory in ${center.name}. Proceed with care.`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const lat = parseFloat(customLat) || center.lat;
    const lng = parseFloat(customLng) || center.lng;

    const payload = {
      name,
      type: selectedThreat.id,
      riskLevel: selectedThreat.level,
      description: `${selectedThreat.label} centered at ${center.name} with ${radiusMeters}m perimeter radius.`,
      shape: 'CIRCLE',
      center: { lat, lng },
      radiusMeters: parseInt(radiusMeters),
      warningDistance: parseInt(warningDistance),
      alertMessage,
      active: true,
      createdBy: 'S.A.F.A.R. Authority Command Desk'
    };

    try {
      const res = await fetch('/api/geofences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create danger zone');
      }

      if (onCreated) {
        onCreated(data.geofence);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Approximate area in sq km
  const areaSqKm = ((Math.PI * Math.pow(radiusMeters, 2)) / 1000000).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto select-none font-sans">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center space-x-2">
                <span>Set Danger Zone / Threat Perimeter</span>
              </h2>
              <p className="text-xs text-slate-400">
                Search any Indian destination, set the hazard radius & threat level to protect tourists
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 🌟 1. SMART INDIA LOCATION SEARCH (Requested by User) */}
          <div className="relative space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-300 font-extrabold flex items-center space-x-1.5">
                <Search className="w-3.5 h-3.5 text-emerald-400" />
                <span>Search Location in India *</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                All-India Cities, Passes, Temples & Forests
              </span>
            </div>

            {/* Search Input Box */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4 text-emerald-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onFocus={() => { if (searchResults.length > 0) setShowSearchDropdown(true); }}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type any place in India (e.g. Manali, Kedarnath, Kaziranga, Cherrapunji, Tawang, Leh, Goa...)"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-900/90 border border-slate-700/80 focus:border-emerald-400 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400 shadow-inner"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-1">
                {isSearching && (
                  <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                )}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Search Results Dropdown Menu */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div 
                ref={dropdownRef}
                className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-800/80 p-1 backdrop-blur-xl"
              >
                <div className="px-3 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Search Matches</span>
                  <span className="text-emerald-400 font-bold">{searchResults.length} Found</span>
                </div>

                {searchResults.map((result, idx) => (
                  <button
                    key={`${result.name}-${idx}`}
                    type="button"
                    onClick={() => handleSelectLocation(result)}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-800 text-left transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-start space-x-2.5 min-w-0 pr-2">
                      <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-100 truncate group-hover:text-emerald-300">
                          {result.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {result.subtitle}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-slate-400 block">
                        {result.lat.toFixed(2)}°, {result.lng.toFixed(2)}°
                      </span>
                      {result.isLocal && (
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-1 rounded border border-emerald-500/30">
                          Verified Spot
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Currently Active Selected Location Badge */}
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 min-w-0 pr-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span className="text-slate-400 text-[11px]">Selected Epicenter:</span>
                <strong className="text-white truncate">{center.name}</strong>
              </div>
              <span className="font-mono text-cyan-400 text-[11px] font-bold shrink-0">
                {customLat}° N, {customLng}° E
              </span>
            </div>
          </div>

          {/* 2. Zone Name */}
          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1">
              Danger Zone Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Solang Valley Avalanche Risk, Kaziranga Elephant Crossing"
              className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* 3. Threat Level Selection */}
          <div>
            <label className="text-xs text-slate-300 font-bold block mb-2">
              Select Threat Level / Risk Severity *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {THREAT_LEVELS.map((t) => {
                const isSelected = selectedThreat.id === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleThreatChange(t)}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? `${t.bgColor} ${t.borderColor} ring-2 ring-emerald-400/40 shadow-lg`
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-black ${t.textColor}`}>{t.badge}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div className="text-[11px] font-bold text-white leading-tight">{t.label}</div>
                    <div className="text-[10px] text-slate-400 mt-1 leading-snug">{t.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Threat Radius Slider & Presets */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-extrabold text-slate-200 block">
                  Threat Perimeter Radius (Meters)
                </label>
                <span className="text-[11px] text-slate-400">
                  Coverage Area: <strong className="text-emerald-400 font-mono">~{areaSqKm} km²</strong>
                </span>
              </div>
              <span className="text-base font-black font-mono text-amber-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                {radiusMeters >= 1000 ? `${(radiusMeters / 1000).toFixed(1)} km` : `${radiusMeters} m`}
              </span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="100"
              max="5000"
              step="50"
              value={radiusMeters}
              onChange={(e) => setRadiusMeters(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-950 rounded-lg"
            />

            {/* Radius Quick Presets */}
            <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-400 pt-1">
              <span>Quick Presets:</span>
              {[250, 500, 1000, 2000, 5000].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRadiusMeters(r)}
                  className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold transition-colors ${
                    radiusMeters === r
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  {r >= 1000 ? `${r / 1000}km` : `${r}m`}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Warning Broadcast Message to Tourists */}
          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1">
              Acoustic & Screen Warning Message (Broadcast to Tourists)
            </label>
            <input
              type="text"
              required
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white text-xs font-bold border border-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-black shadow-xl transition-all flex items-center space-x-2"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>{loading ? 'Deploying Danger Zone...' : 'Deploy Danger Zone & Threat Radius'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
