import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MapView from '../components/MapView';
import { 
  Navigation, MapPin, Calendar, Route, AlertTriangle, CheckCircle2, 
  ArrowRight, Sparkles, Coins, Users, Clock, ShieldCheck, Car, 
  Hotel, Info, ChevronDown, ChevronUp, Compass, Utensils, Check, Plus
} from 'lucide-react';

const SPRING = { type: 'spring', stiffness: 360, damping: 28 };

const DESTINATION_PRESETS = [
  { key: 'AYODHYA', name: 'Ayodhya Dham & Ram Janmabhoomi', start: 'Ayodhya Cantt / Maharishi Valmiki Airport', defaultDays: 3, waypoints: [{ lat: 26.7725, lng: 82.1384 }, { lat: 26.7922, lng: 82.1998 }, { lat: 26.7980, lng: 82.2030 }] },
  { key: 'JAMMU', name: 'Katra Vaishno Devi & Jammu Pilgrim Track', start: 'Katra Railway Station / Jammu Airport', defaultDays: 3, waypoints: [{ lat: 32.9912, lng: 74.9312 }, { lat: 32.9934, lng: 74.9328 }, { lat: 33.0035, lng: 74.9542 }] },
  { key: 'AGRA', name: 'Agra World Heritage Corridor & Taj Mahal', start: 'Agra Cantt Railway Station', defaultDays: 2, waypoints: [{ lat: 27.1592, lng: 77.9942 }, { lat: 27.1751, lng: 78.0421 }, { lat: 27.1795, lng: 78.0211 }] },
  { key: 'VARANASI', name: 'Kashi Vishwanath & Ganga Ghats', start: 'Varanasi Junction / Babatpur Airport', defaultDays: 3, waypoints: [{ lat: 25.3284, lng: 82.9995 }, { lat: 25.3109, lng: 83.0107 }, { lat: 25.3115, lng: 83.0080 }] },
  { key: 'MEGHALAYA', name: 'Shillong & Cherrapunji Monsoon Corridor', start: 'Guwahati Airport (GAU)', defaultDays: 4, waypoints: [{ lat: 26.1445, lng: 91.7362 }, { lat: 25.5788, lng: 91.8933 }, { lat: 25.2986, lng: 91.7321 }] },
  { key: 'JAIPUR', name: 'Jaipur Pink City & Aravalli Forts', start: 'Jaipur Junction / Sanganer Airport', defaultDays: 3, waypoints: [{ lat: 26.9196, lng: 75.7878 }, { lat: 26.9239, lng: 75.8267 }, { lat: 26.9855, lng: 75.8513 }] }
];

export default function TripPlannerPage({ tourist, geofences = [], onSimulateDeviation }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryDest = searchParams.get('dest');
  const matchedPreset = DESTINATION_PRESETS.find(
    (p) => p.key === (queryDest || '').toUpperCase() || p.name.toLowerCase().includes((queryDest || '').toLowerCase())
  ) || DESTINATION_PRESETS[0];

  // Planner Form State
  const [selectedDestinationKey, setSelectedDestinationKey] = useState(matchedPreset.key);
  const [days, setDays] = useState(matchedPreset.defaultDays);
  const [travellers, setTravellers] = useState(2);
  const [budgetTier, setBudgetTier] = useState('MODERATE'); // BUDGET | MODERATE | LUXURY
  const [preferredTransport, setPreferredTransport] = useState('CAB'); // CAB | AUTO | BIKE | MIXED
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [interestTags, setInterestTags] = useState(['Heritage', 'Spiritual']);

  // Generated Plan State
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Evaluator Route Deviation Simulator State
  const [deviateLoading, setDeviateLoading] = useState(false);
  const [deviateMessage, setDeviateMessage] = useState(null);
  const [showEvaluatorSection, setShowEvaluatorSection] = useState(false);

  // Explicit user-added food stops
  const [selectedFoodStops, setSelectedFoodStops] = useState({});

  const handleToggleFoodStop = (day, mealKey, foodStop) => {
    setSelectedFoodStops((prev) => {
      const key = `${day}_${mealKey}`;
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = foodStop;
      }
      return next;
    });
  };

  useEffect(() => {
    handleGeneratePlan();
  }, [selectedDestinationKey, days, travellers, budgetTier, preferredTransport]);

  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationKey: selectedDestinationKey,
          days,
          travellers,
          budgetTier,
          preferredTransport,
          interests: interestTags
        })
      });
      const data = await res.json();
      if (data.success) {
        setPlanData(data);
      }
    } catch (err) {
      console.error('Plan Generation Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToMyTrip = async () => {
    try {
      const activePreset = DESTINATION_PRESETS.find((p) => p.key === selectedDestinationKey) || DESTINATION_PRESETS[0];
      await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          touristId: tourist?.touristId || 'TID-1035',
          startingLocation: activePreset.start,
          destination: planData?.destination?.name || activePreset.name,
          startDate,
          endDate: new Date(new Date(startDate).getTime() + days * 86400000).toISOString().split('T')[0],
          plannedRoute: `${activePreset.start} ➔ ${planData?.destination?.name || activePreset.name}`,
          routeWaypoints: activePreset.waypoints,
          foodStops: Object.values(selectedFoodStops)
        })
      });

      // Also persist to localStorage for quick access
      try {
        const foodStopsArr = Object.values(selectedFoodStops);
        if (foodStopsArr.length > 0) {
          localStorage.setItem('safar_added_food_stops', JSON.stringify(foodStopsArr));
        }
      } catch {}

      setSaveSuccess(true);
      setTimeout(() => {
        navigate('/tourist-dashboard');
      }, 1200);
    } catch (err) {
      console.error('Save Trip Error:', err);
    }
  };

  const handleDeviate = async () => {
    setDeviateLoading(true);
    try {
      if (onSimulateDeviation) {
        await onSimulateDeviation();
      } else {
        await fetch('/api/trips/simulate-deviation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ touristId: tourist?.touristId || 'TID-1035', offsetKm: 3.8 })
        });
      }
      setDeviateMessage('⚠️ Route deviation offset (3.8 km off-track) simulated. AI Risk Engine re-evaluated tourist risk score.');
    } catch (err) {
      console.error(err);
    } finally {
      setDeviateLoading(false);
    }
  };

  const currentPreset = DESTINATION_PRESETS.find((p) => p.key === selectedDestinationKey) || DESTINATION_PRESETS[0];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-8 select-none">
      
      {/* 🧭 Header */}
      <div className="rounded-3xl p-6 sm:p-8 bg-white/95 border border-slate-200/80 shadow-xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-[11px] font-bold uppercase">
            <Route className="w-3.5 h-3.5 text-orange-600" />
            <span>AI TOURISM ENGINE • PERSONALIZED TRIP PLANNER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Smart Trip Planner & Itinerary Builder
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Customize dates, travellers, and budget to generate a day-by-day smart itinerary with estimated tariffs and safe corridors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl flex items-center gap-1.5 animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Trip Saved to My Trip!</span>
            </span>
          )}
          <button
            onClick={handleSaveToMyTrip}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md transition-all flex items-center space-x-1.5 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Save to My Trip</span>
          </button>
        </div>
      </div>

      {/* 🛠️ Planner Controls Grid */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Step 1: Configure Journey Parameters</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Destination */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 block">Destination</label>
            <select
              value={selectedDestinationKey}
              onChange={(e) => setSelectedDestinationKey(e.target.value)}
              className="w-full py-2 px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
            >
              {DESTINATION_PRESETS.map((dest) => (
                <option key={dest.key} value={dest.key}>{dest.name}</option>
              ))}
            </select>
          </div>

          {/* Days */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 block">Duration (Days)</label>
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <input
                type="number"
                min="1"
                max="7"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
              />
              <span className="text-[11px] font-semibold text-slate-400">Days</span>
            </div>
          </div>

          {/* Travellers */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 block">Travellers</label>
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <input
                type="number"
                min="1"
                max="10"
                value={travellers}
                onChange={(e) => setTravellers(Number(e.target.value))}
                className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
              />
              <span className="text-[11px] font-semibold text-slate-400">People</span>
            </div>
          </div>

          {/* Budget Tier */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 block">Budget Preference</label>
            <select
              value={budgetTier}
              onChange={(e) => setBudgetTier(e.target.value)}
              className="w-full py-2 px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="BUDGET">Budget / Pilgrim</option>
              <option value="MODERATE">Moderate / Family</option>
              <option value="LUXURY">Premium / Heritage</option>
            </select>
          </div>

          {/* Preferred Transport */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 block">Local Transport</label>
            <select
              value={preferredTransport}
              onChange={(e) => setPreferredTransport(e.target.value)}
              className="w-full py-2 px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="CAB">Dedicated Cab (AC)</option>
              <option value="AUTO">Pre-paid Auto / E-Rickshaw</option>
              <option value="BIKE">Bike / Solo Rental</option>
              <option value="MIXED">Mixed Multi-Modal</option>
            </select>
          </div>
        </div>
      </div>

      {/* 📊 Budget Breakdown Cards */}
      {planData?.planSummary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estimated Total Budget</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-slate-900">
                ₹{planData.planSummary.totalEstimatedBudgetInr?.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">({travellers} pers)</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-bold block">
              ~₹{planData.planSummary.perPersonEstimatedBudgetInr?.toLocaleString('en-IN')} / person
            </span>
          </div>

          <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Est. Accommodation</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-emerald-700">
                ₹{planData.planSummary.itemizedBudget?.stayCost?.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium block">Curated stays & pilgrim niwas</span>
          </div>

          <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Est. Local Transport</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-orange-600">
                ₹{planData.planSummary.itemizedBudget?.transportCost?.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium block">
              Based on {preferredTransport} benchmark tariffs
            </span>
          </div>

          <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Est. Food & Entry</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-indigo-700">
                ₹{planData.planSummary.itemizedBudget?.foodAndActivitiesCost?.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium block">Local cuisine & monument entry</span>
          </div>
        </div>
      )}

      {/* 🍽️ Daily Food Budget Breakdown (SIH Flagship Swachh Food Module) */}
      {planData?.planSummary?.itemizedBudget?.foodBudgetBreakdown && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/70 border border-amber-200/80 shadow-sm space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-orange-500 text-white flex items-center justify-center">
                <Utensils className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-black text-amber-900 block">
                  Daily Food Budget Breakdown (~₹{planData.planSummary.itemizedBudget.foodBudgetBreakdown.dailyTotal} / person)
                </span>
                <span className="text-[10px] text-amber-800/80 font-medium">
                  Estimated prototype benchmark values for meals and local heritage tastings
                </span>
              </div>
            </div>
            <Link
              to={`/swachh-food?destination=${selectedDestinationKey}`}
              className="text-[11px] font-bold text-orange-700 hover:text-orange-900 underline flex items-center gap-1 shrink-0"
            >
              <span>Explore Swachh Food Registry</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-amber-200/60 shadow-xs space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Breakfast</span>
              <span className="font-extrabold text-slate-900 font-mono text-sm">
                ₹{planData.planSummary.itemizedBudget.foodBudgetBreakdown.breakfast}
              </span>
              <span className="text-[10px] text-slate-500 block">Morning energizer</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-amber-200/60 shadow-xs space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Lunch</span>
              <span className="font-extrabold text-slate-900 font-mono text-sm">
                ₹{planData.planSummary.itemizedBudget.foodBudgetBreakdown.lunch}
              </span>
              <span className="text-[10px] text-slate-500 block">Midday heritage meal</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-amber-200/60 shadow-xs space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Dinner</span>
              <span className="font-extrabold text-slate-900 font-mono text-sm">
                ₹{planData.planSummary.itemizedBudget.foodBudgetBreakdown.dinner}
              </span>
              <span className="text-[10px] text-slate-500 block">Evening sit-down dining</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-amber-200/60 shadow-xs space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Local Experience</span>
              <span className="font-extrabold text-slate-900 font-mono text-sm">
                ₹{planData.planSummary.itemizedBudget.foodBudgetBreakdown.localExperience}
              </span>
              <span className="text-[10px] text-slate-500 block">Signature sweet / chaat</span>
            </div>
          </div>
        </div>
      )}

      {/* 🗺️ Main View: Itinerary (Left 2 cols) & Map + Stays + Tips (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Day-by-Day Itinerary Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span>Personalized {days}-Day Smart Itinerary</span>
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Verified Corridor Schedule
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
              Generating optimized itinerary...
            </div>
          ) : (
            <div className="space-y-4">
              {(planData?.itinerary || []).map((dayItem) => {
                const lunchRec = dayItem.foodRecommendations?.lunch;
                const dinnerRec = dayItem.foodRecommendations?.dinner;
                const lunchAdded = Boolean(selectedFoodStops[`${dayItem.day}_lunch`]);
                const dinnerAdded = Boolean(selectedFoodStops[`${dayItem.day}_dinner`]);

                return (
                  <motion.div
                    key={dayItem.day}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={SPRING}
                    className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4 hover:border-orange-200 transition-all"
                  >
                    <div className="flex items-center justify-between border-b pb-2.5">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-100 text-orange-800">
                          {dayItem.focus}
                        </span>
                        <h4 className="text-sm font-black text-slate-900 mt-1">{dayItem.title}</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-700">
                        Day Est: ₹{dayItem.estimatedDayBudget?.totalDay?.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {/* Morning */}
                      <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-1">
                        <span className="text-[10px] font-bold text-amber-700 uppercase flex items-center gap-1">
                          <span>🌅 08:00 Morning</span>
                        </span>
                        <p className="font-bold text-slate-900">{dayItem.morning?.name}</p>
                        <span className="text-[10px] text-slate-500 block">{dayItem.morning?.category} ({dayItem.morning?.durationHours || 2}h)</span>
                      </div>

                      {/* Afternoon */}
                      <div className="p-3 rounded-2xl bg-orange-50/60 border border-orange-200/70 space-y-1">
                        <span className="text-[10px] font-bold text-orange-700 uppercase flex items-center gap-1">
                          <span>☀️ 14:30 Afternoon</span>
                        </span>
                        <p className="font-bold text-slate-900">{dayItem.afternoon?.name}</p>
                        <span className="text-[10px] text-slate-500 block">{dayItem.afternoon?.category} ({dayItem.afternoon?.durationHours || 2}h)</span>
                      </div>

                      {/* Evening */}
                      <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-200/70 space-y-1">
                        <span className="text-[10px] font-bold text-indigo-700 uppercase flex items-center gap-1">
                          <span>🌆 19:30 Evening</span>
                        </span>
                        <p className="font-bold text-slate-900">{dayItem.evening?.name}</p>
                        <span className="text-[10px] text-slate-500 block">{dayItem.evening?.category} ({dayItem.evening?.durationHours || 2}h)</span>
                      </div>
                    </div>

                    {/* 🍽️ Food Intelligence Recommendations (User explicitly clicks [Add Food Stop]) */}
                    <div className="pt-2 border-t border-slate-100 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                          <Utensils className="w-3 h-3 text-orange-600" />
                          <span>🍽 Food Intelligence Recommendations</span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Click [Add Food Stop] to incorporate into Day {dayItem.day}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {/* Lunch Stop Recommendation */}
                        {lunchRec && (
                          <div className={`p-3 rounded-2xl border transition-all ${
                            lunchAdded
                              ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                              : 'bg-slate-50/80 border-slate-200'
                          }`}>
                            <div className="flex items-start justify-between gap-1 mb-1">
                              <div>
                                <span className="text-[10px] font-black uppercase text-orange-700 block">
                                  13:00 🍽 SAFAR Recommended Lunch
                                </span>
                                <h5 className="font-bold text-slate-900 text-xs mt-0.5">{lunchRec.name}</h5>
                              </div>
                              <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-white border border-emerald-200 text-emerald-700 shrink-0">
                                Swachh {lunchRec.swachhScore}/100
                              </span>
                            </div>

                            <p className="text-[10px] text-slate-500 font-medium">
                              {lunchRec.cuisine} · ~₹{lunchRec.averagePrice}/person · {lunchRec.distanceFromReference} km detour
                            </p>

                            <div className="pt-2 mt-2 border-t border-slate-200/60 flex items-center justify-between">
                              <span className="text-[10px] font-semibold text-slate-600 truncate max-w-[140px]">
                                {lunchRec.localSpecialty?.split(',')[0]}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggleFoodStop(dayItem.day, 'lunch', lunchRec)}
                                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all flex items-center space-x-1 ${
                                  lunchAdded
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white hover:bg-orange-50 text-orange-600 border border-orange-200'
                                }`}
                              >
                                {lunchAdded ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Added Stop</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3 h-3" />
                                    <span>Add Food Stop</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Dinner Stop Recommendation */}
                        {dinnerRec && (
                          <div className={`p-3 rounded-2xl border transition-all ${
                            dinnerAdded
                              ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                              : 'bg-slate-50/80 border-slate-200'
                          }`}>
                            <div className="flex items-start justify-between gap-1 mb-1">
                              <div>
                                <span className="text-[10px] font-black uppercase text-indigo-700 block">
                                  20:30 🍽 Local Dinner Experience
                                </span>
                                <h5 className="font-bold text-slate-900 text-xs mt-0.5">{dinnerRec.name}</h5>
                              </div>
                              <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-white border border-emerald-200 text-emerald-700 shrink-0">
                                Swachh {dinnerRec.swachhScore}/100
                              </span>
                            </div>

                            <p className="text-[10px] text-slate-500 font-medium">
                              {dinnerRec.cuisine} · ~₹{dinnerRec.averagePrice}/person · {dinnerRec.distanceFromReference} km detour
                            </p>

                            <div className="pt-2 mt-2 border-t border-slate-200/60 flex items-center justify-between">
                              <span className="text-[10px] font-semibold text-slate-600 truncate max-w-[140px]">
                                {dinnerRec.localSpecialty?.split(',')[0]}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggleFoodStop(dayItem.day, 'dinner', dinnerRec)}
                                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all flex items-center space-x-1 ${
                                  dinnerAdded
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white hover:bg-orange-50 text-orange-600 border border-orange-200'
                                }`}
                              >
                                {dinnerAdded ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Added Stop</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3 h-3" />
                                    <span>Add Food Stop</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Route Map + Contextual Travel & Safety Tips */}
        <div className="space-y-4">
          
          {/* Map Preview */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                Circuit Corridor Map
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Safe Corridor
              </span>
            </div>

            <MapView
              destination={{
                lat: currentPreset.waypoints[currentPreset.waypoints.length - 1].lat,
                lng: currentPreset.waypoints[currentPreset.waypoints.length - 1].lng,
                name: currentPreset.name,
                address: currentPreset.start
              }}
              tourists={tourist ? [tourist] : []}
              geofences={geofences}
              selectedTourist={tourist}
              plannedRoute={{
                startingLocation: currentPreset.start,
                destination: currentPreset.name,
                plannedRoute: `${currentPreset.start} ➔ ${currentPreset.name}`,
                routeWaypoints: currentPreset.waypoints
              }}
              height="280px"
            />
          </div>

          {/* Contextual Travel Advice */}
          {planData?.contextualTips?.travelAdvice && (
            <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-2 text-xs">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-orange-600" />
                <span>Contextual Travel Insights</span>
              </span>
              <ul className="space-y-1.5 list-disc list-inside text-slate-600 leading-relaxed text-[11px]">
                {planData.contextualTips.travelAdvice.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Contextual Safety Advice */}
          {planData?.contextualTips?.safetyAdvice && (
            <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-2 text-xs">
              <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Contextual Safety & Corridor Insights</span>
              </span>
              <ul className="space-y-1.5 list-disc list-inside text-slate-600 leading-relaxed text-[11px]">
                {planData.contextualTips.safetyAdvice.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Prototype Stays */}
          {planData?.recommendedStays && planData.recommendedStays.length > 0 && (
            <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Hotel className="w-4 h-4 text-emerald-600" />
                  <span>Curated Stay Suggestions</span>
                </span>
                <Link to="/hotels" className="text-[10px] font-bold text-orange-600 hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-2">
                {planData.recommendedStays.slice(0, 2).map((st, idx) => (
                  <div key={idx} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900">{st.name}</p>
                      <p className="text-[10px] text-slate-500">{st.type} · {st.distance}</p>
                    </div>
                    <span className="font-bold font-mono text-emerald-700 text-xs">
                      ₹{st.pricePerNight}/night
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ⚠️ SIH Evaluator Collapsible Lab Panel (Route Deviation Anomaly Test) */}
      <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
        <button
          onClick={() => setShowEvaluatorSection(!showEvaluatorSection)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-900"
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>SIH Evaluator Demo: Route Deviation Anomaly Simulation</span>
          </div>
          {showEvaluatorSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showEvaluatorSection && (
          <div className="pt-2 border-t border-slate-200 space-y-3 text-xs">
            <p className="text-slate-500 leading-relaxed text-[11px]">
              For hackathon judge demonstration: simulate a 3.8 km off-route deviation to trigger the Explainable AI Anomaly Engine and observe risk score recalculation.
            </p>

            {deviateMessage && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 font-bold text-xs flex items-center justify-between">
                <span>{deviateMessage}</span>
                <button onClick={() => setDeviateMessage(null)} className="font-bold text-amber-700">✕</button>
              </div>
            )}

            <button
              disabled={deviateLoading}
              onClick={handleDeviate}
              className="py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{deviateLoading ? 'Simulating Anomaly...' : 'Simulate 3.8 km Route Deviation'}</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
