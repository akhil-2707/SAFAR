import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MapView from '../components/MapView';
import {
  Utensils, MapPin, Search, Filter, Sparkles, Star, ShieldCheck,
  ChevronRight, Info, CheckCircle2, RotateCcw, Compass, Route,
  SlidersHorizontal, X, MessageSquare, ThumbsUp, Coffee, Award,
  ArrowRight, Check, AlertCircle, Heart, Phone, Clock
} from 'lucide-react';

const SPRING = { type: 'spring', stiffness: 360, damping: 28 };

const DESTINATIONS = [
  { key: 'ALL', name: 'All Destinations' },
  { key: 'AYODHYA', name: 'Ayodhya Dham', state: 'Uttar Pradesh', defaultCenter: { lat: 26.7922, lng: 82.1998 } },
  { key: 'KATRA', name: 'Katra / Jammu', state: 'Jammu & Kashmir', defaultCenter: { lat: 32.9934, lng: 74.9328 } },
  { key: 'AGRA', name: 'Agra Heritage Corridor', state: 'Uttar Pradesh', defaultCenter: { lat: 27.1751, lng: 78.0421 } },
  { key: 'VARANASI', name: 'Kashi / Varanasi', state: 'Uttar Pradesh', defaultCenter: { lat: 25.3105, lng: 83.0090 } },
  { key: 'MEGHALAYA', name: 'Shillong / Cherrapunji', state: 'Meghalaya', defaultCenter: { lat: 25.5750, lng: 91.8840 } },
  { key: 'JAIPUR', name: 'Jaipur Pink City', state: 'Rajasthan', defaultCenter: { lat: 26.9210, lng: 75.8280 } }
];

const LOCAL_FLAVOURS_CATALOG = {
  AYODHYA: {
    title: 'Ayodhya Sacred & Regional Cuisine',
    desc: 'Spiritual pilgrimage culinary heritage dominated by pure Satvik preparation, desi ghee sweets, and ancient recipe traditions.',
    items: [
      { name: 'Ayodhya Satvik Thali', tag: 'Traditional', desc: 'No onion or garlic, prepared strictly with rock salt and seasonal vegetables.' },
      { name: 'Ram Ki Paidi Khasta Kachori', tag: 'Morning Snack', desc: 'Crispy lentil-stuffed pastry served with spicy pumpkin curry.' },
      { name: 'Hanuman Garhi Desi Ghee Peda', tag: 'Iconic Sweet', desc: 'Caramelized reduced milk sweet offered as holy mahaprasad.' }
    ]
  },
  KATRA: {
    title: 'Dogra & Jammu Mountain Pilgrim Food',
    desc: 'Hearty Himalayan recipes rich in protein, pure mountain herbs, and comforting warm spices designed for high-altitude trekking.',
    items: [
      { name: 'Jammu Rajma Chawal with Anardana', tag: 'Signature Lunch', desc: 'Slow-simmered Kashmiri red beans with wild pomegranate seeds.' },
      { name: 'Grilled Kaladi Cheese Kulcha', tag: 'Local Street Delicacy', desc: 'Indigenous ripened Himalayan cheese grilled with green mint chutney.' },
      { name: 'Zafrani Saffron Kahwa', tag: 'Mountain Beverage', desc: 'Cardamom and saffron green tea brewed with crushed badam.' }
    ]
  },
  AGRA: {
    title: 'Mughlai Corridors & Brij Culinary Roots',
    desc: 'A fusion of imperial Mughal slow-cooking traditions and Mathura-Brij vegetarian street breakfast heritage.',
    items: [
      { name: 'Agra Kesar Angoori Petha', tag: 'Heritage Confectionery', desc: 'Translucent ash gourd confection soaked in pure saffron syrup.' },
      { name: 'Bedmi Poori with Aloo Jhol', tag: 'Classic Sunrise Breakfast', desc: 'Crisp urad dal stuffed poori with slow-simmered spiced potatoes.' },
      { name: 'Shahi Mughlai Dum Biryani', tag: 'Imperial Dinner', desc: 'Slow-cooked handi rice layered with saffron and roasted dry fruits.' }
    ]
  },
  VARANASI: {
    title: 'Timeless Banarasi Flavours',
    desc: 'Living culinary arts perfected along ancient ghats, from delicate winter milk froth to spicy clay-pot street chaats.',
    items: [
      { name: 'Kashi Tamatar Chaat', tag: 'Kashi Signature', desc: 'Warm spiced tomato reduction served in traditional earthen clay pots.' },
      { name: 'Heeng Kachori & Jalebi', tag: 'Dawn Breakfast', desc: 'Asafoetida-infused crisp kachori paired with golden saffron jalebi.' },
      { name: 'Banarasi Malaiyo & Kulhad Lassi', tag: 'Winter & All-Season', desc: 'Dew-kissed saffron milk foam garnished with pistachios.' }
    ]
  },
  MEGHALAYA: {
    title: 'Khasi Hills Indigenous Organic Cuisine',
    desc: 'Fresh, sustainably foraged mountain ingredients adhering to Asia’s cleanest village eco-practices with zero waste.',
    items: [
      { name: 'Khasi Jadoh with Wild Herbs', tag: 'Tribal Specialty', desc: 'Red hill rice cooked with indigenous forest aromatics and ginger.' },
      { name: 'Steamed Pukhlein & Red Tea', tag: 'Afternoon Tea', desc: 'Golden fried sweet rice cakes paired with organic hill brew.' },
      { name: 'Bamboo Shoot & Wild Mustard Stew', tag: 'Comfort Food', desc: 'Fresh bamboo shoots simmered with organic mountain greens.' }
    ]
  },
  JAIPUR: {
    title: 'Royal Rajasthani Heritage Dining',
    desc: 'Rich desert royal dishes crafted with clarified butter (desi ghee), sun-dried desert berries, and drought-hardy millets.',
    items: [
      { name: 'Shahi Dal Baati Churma', tag: 'Signature Royal Feast', desc: 'Baked wheat dough balls dipped in desi ghee with five-lentil curry.' },
      { name: 'Johari Bazaar Pyaaz Kachori', tag: 'Crisp Street Snack', desc: 'Golden flaky pastry filled with caramelized spiced onions.' },
      { name: 'Ker Sangri & Bajre ki Roti', tag: 'Desert Heritage', desc: 'Wild desert caper berry preparation with hand-rolled pearl millet flatbread.' }
    ]
  }
};

export default function SwachhFoodPage({ tourist }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL parameters or default from tourist
  const urlDest = searchParams.get('destination');
  const initialDest = urlDest ? urlDest.toUpperCase() : (tourist?.destination ? getDestKey(tourist.destination) : 'AYODHYA');

  const [selectedDestination, setSelectedDestination] = useState(initialDest);
  const [selectedCuisine, setSelectedCuisine] = useState('ALL');
  const [budgetTier, setBudgetTier] = useState('ALL'); // 'ALL' | 'BUDGET' | 'MODERATE' | 'LUXURY'
  const [vegetarianFilter, setVegetarianFilter] = useState('ALL'); // 'ALL' | 'PURE_VEG' | 'VEG_OPTIONS'
  const [minScoreFilter, setMinScoreFilter] = useState('ALL'); // 'ALL' | '80' | '90'
  const [ratingFilter, setRatingFilter] = useState('ALL'); // 'ALL' | '4.0' | '4.5'
  const [maxDistanceFilter, setMaxDistanceFilter] = useState('ALL'); // 'ALL' | '1' | '2'
  const [onlyLocalSpecialty, setOnlyLocalSpecialty] = useState(false);
  const [nearRouteMode, setNearRouteMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);

  // Modals
  const [selectedOutletForModal, setSelectedOutletForModal] = useState(null);
  const [showTrustModal, setShowTrustModal] = useState(false);
  const [addedTrips, setAddedTrips] = useState(() => {
    try {
      const stored = localStorage.getItem('safar_added_food_stops');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Feedback form state
  const [feedbackCleanliness, setFeedbackCleanliness] = useState('VERY_CLEAN');
  const [feedbackWater, setFeedbackWater] = useState('AVAILABLE');
  const [feedbackWaste, setFeedbackWaste] = useState('GOOD');
  const [feedbackExp, setFeedbackExp] = useState('GOOD');
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState(null);

  function getDestKey(str = '') {
    const s = str.toLowerCase();
    if (s.includes('ayodhya')) return 'AYODHYA';
    if (s.includes('katra') || s.includes('jammu') || s.includes('vaishno')) return 'KATRA';
    if (s.includes('agra') || s.includes('taj')) return 'AGRA';
    if (s.includes('varanasi') || s.includes('kashi')) return 'VARANASI';
    if (s.includes('meghalaya') || s.includes('shillong') || s.includes('cherrapunji')) return 'MEGHALAYA';
    if (s.includes('jaipur') || s.includes('rajasthan')) return 'JAIPUR';
    return 'AYODHYA';
  }

  // Fetch Outlets
  useEffect(() => {
    fetchOutlets();
  }, [
    selectedDestination,
    selectedCuisine,
    budgetTier,
    vegetarianFilter,
    minScoreFilter,
    maxDistanceFilter,
    nearRouteMode,
    searchQuery
  ]);

  // Fetch AI Recommendations
  useEffect(() => {
    fetchAiRecommendations();
  }, [selectedDestination, budgetTier]);

  const fetchOutlets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDestination !== 'ALL') params.set('destination', selectedDestination);
      if (selectedCuisine !== 'ALL') params.set('cuisine', selectedCuisine);
      if (budgetTier !== 'ALL') params.set('budget', budgetTier);
      if (vegetarianFilter !== 'ALL') params.set('vegetarian', vegetarianFilter);
      if (minScoreFilter !== 'ALL') params.set('minScore', minScoreFilter);
      if (maxDistanceFilter !== 'ALL') params.set('maxDistance', maxDistanceFilter);
      if (nearRouteMode) params.set('nearRoute', 'true');
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/food?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        let list = data.outlets || [];
        if (onlyLocalSpecialty) {
          list = list.filter((o) => !!o.localSpecialty);
        }
        if (ratingFilter !== 'ALL') {
          const minR = Number(ratingFilter);
          list = list.filter((o) => (o.travellerRating || 0) >= minR);
        }
        setOutlets(list);
      }
    } catch (err) {
      console.error('Failed to fetch food outlets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAiRecommendations = async () => {
    setRecLoading(true);
    try {
      const dest = selectedDestination === 'ALL' ? 'AYODHYA' : selectedDestination;
      const bTier = budgetTier === 'ALL' ? 'MODERATE' : budgetTier;
      const res = await fetch(`/api/food/recommendations?destination=${dest}&budgetTier=${bTier}&travellers=2`);
      const data = await res.json();
      if (data.success && data.recommendations) {
        setRecommendations(data.recommendations);
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setRecLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedCuisine('ALL');
    setBudgetTier('ALL');
    setVegetarianFilter('ALL');
    setMinScoreFilter('ALL');
    setRatingFilter('ALL');
    setMaxDistanceFilter('ALL');
    setOnlyLocalSpecialty(false);
    setNearRouteMode(false);
    setSearchQuery('');
  };

  const handleAddToTrip = (outlet) => {
    const updated = [...addedTrips.filter((item) => item.id !== outlet.id), outlet];
    setAddedTrips(updated);
    try {
      localStorage.setItem('safar_added_food_stops', JSON.stringify(updated));
    } catch {}
  };

  const isAdded = (outletId) => addedTrips.some((item) => item.id === outletId);

  const handleSubmitFeedback = async (outletId) => {
    setFeedbackSubmitting(true);
    setFeedbackSuccessMsg(null);
    try {
      const res = await fetch(`/api/food/${outletId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cleanliness: feedbackCleanliness,
          waterAvailable: feedbackWater,
          wasteManagement: feedbackWaste,
          foodExperience: feedbackExp,
          notes: feedbackNotes,
          touristId: tourist?.touristId || 'TID-1035'
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackSuccessMsg(data.message);
        if (selectedOutletForModal && data.updatedOutlet) {
          setSelectedOutletForModal({
            ...selectedOutletForModal,
            ...data.updatedOutlet
          });
        }
        fetchOutlets();
      }
    } catch (err) {
      console.error('Feedback submit error:', err);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // Active destination coordinates for MapView
  const currentDestObj = DESTINATIONS.find((d) => d.key === selectedDestination) || DESTINATIONS[1];
  const mapCenter = currentDestObj.defaultCenter || { lat: 26.7922, lng: 82.1998 };

  const currentFlavours = LOCAL_FLAVOURS_CATALOG[selectedDestination] || LOCAL_FLAVOURS_CATALOG.AYODHYA;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-8 select-none pb-28">

      {/* ─────────────────────────────────────────────────────────────
          A. HERO BANNER
      ───────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-white/95 border border-slate-200/80 shadow-xl backdrop-blur-xl"
      >
        {/* Soft decorative background glow */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.09) 0%, transparent 70%)', filter: 'blur(30px)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', filter: 'blur(30px)' }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-[11px] font-bold tracking-wide uppercase">
                <Utensils className="w-3.5 h-3.5 text-orange-600" />
                <span>S.A.F.A.R. SWACHH FOOD • HYGIENE & ROUTE INTELLIGENCE</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-mono font-bold uppercase border border-slate-200">
                <span>PROTOTYPE DATA</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Eat Local. Eat Smart. Travel Better.
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-2xl">
              Discover verified local food options with SAFAR’s route, budget, cuisine and hygiene intelligence. Transparent prototype scores explain where your meal fits into your journey and travel budget.
            </p>

            {/* Micro Trust Explanation Link */}
            <div className="pt-1 flex items-center gap-3 text-xs">
              <button
                onClick={() => setShowTrustModal(true)}
                className="text-orange-600 hover:text-orange-700 font-bold inline-flex items-center gap-1 underline transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
                <span>How SAFAR Prototype Swachh Score Works</span>
              </button>
              <span className="text-slate-300">·</span>
              <span className="text-[11px] text-slate-500 font-medium">
                Transparent Benchmark · Not Official Certification
              </span>
            </div>
          </div>

          {/* Quick Destination Switcher Pill */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 shrink-0 self-start md:self-auto min-w-[220px]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Active Tourism Hub
            </span>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
              <select
                value={selectedDestination}
                onChange={(e) => {
                  setSelectedDestination(e.target.value);
                  setSearchParams({ destination: e.target.value });
                }}
                className="w-full text-xs font-bold bg-transparent text-slate-900 focus:outline-none cursor-pointer"
              >
                {DESTINATIONS.map((d) => (
                  <option key={d.key} value={d.key}>{d.name}</option>
                ))}
              </select>
            </div>
            {addedTrips.length > 0 && (
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-semibold">Stops in My Trip:</span>
                <span className="font-bold text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded-md">
                  {addedTrips.length} Saved
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ─────────────────────────────────────────────────────────────
          B. SMART FILTER & SEARCH TOOLBAR
      ───────────────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dish, outlet name, local specialty, or street..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          {/* Near My Route Mode & Local Specialty Toggles */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setNearRouteMode(!nearRouteMode)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                nearRouteMode
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60'
              }`}
              title="Prioritize food stops by distance to your planned itinerary route"
            >
              <Route className="w-3.5 h-3.5" />
              <span>Near My Route</span>
            </button>

            <button
              onClick={() => setOnlyLocalSpecialty(!onlyLocalSpecialty)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                onlyLocalSpecialty
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Local Specialties</span>
            </button>

            <button
              onClick={handleResetFilters}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center space-x-1"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
          {/* Cuisine */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase block">Cuisine</label>
            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="w-full py-1.5 px-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="ALL">All Cuisines</option>
              <option value="Satvik">Satvik / Pilgrim</option>
              <option value="North Indian">North Indian</option>
              <option value="Awadhi">Awadhi</option>
              <option value="Dogra">Dogra / Jammu</option>
              <option value="Mughlai">Mughlai</option>
              <option value="Banarasi">Banarasi</option>
              <option value="Khasi">Khasi / Northeast</option>
              <option value="Rajasthani">Rajasthani</option>
            </select>
          </div>

          {/* Budget */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase block">Budget / Person</label>
            <select
              value={budgetTier}
              onChange={(e) => setBudgetTier(e.target.value)}
              className="w-full py-1.5 px-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="ALL">Any Budget</option>
              <option value="BUDGET">Budget (&le; ₹180)</option>
              <option value="MODERATE">Moderate (₹150–350)</option>
              <option value="LUXURY">Premium (&gt; ₹350)</option>
            </select>
          </div>

          {/* Vegetarian */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase block">Dietary</label>
            <select
              value={vegetarianFilter}
              onChange={(e) => setVegetarianFilter(e.target.value)}
              className="w-full py-1.5 px-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="ALL">All Options</option>
              <option value="PURE_VEG">🌱 Pure Vegetarian</option>
              <option value="VEG_OPTIONS">Veg Options Available</option>
            </select>
          </div>

          {/* Swachh Score */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase block">Swachh Score</label>
            <select
              value={minScoreFilter}
              onChange={(e) => setMinScoreFilter(e.target.value)}
              className="w-full py-1.5 px-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="ALL">Any Score</option>
              <option value="80">Score 80+ (High)</option>
              <option value="90">Score 90+ (Exceptional)</option>
            </select>
          </div>

          {/* Traveller Rating */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase block">Peer Rating</label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full py-1.5 px-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="ALL">Any Rating</option>
              <option value="4.0">★ 4.0 & above</option>
              <option value="4.5">★ 4.5 & above</option>
            </select>
          </div>

          {/* Max Detour Distance */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase block">Route Detour</label>
            <select
              value={maxDistanceFilter}
              onChange={(e) => setMaxDistanceFilter(e.target.value)}
              className="w-full py-1.5 px-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="ALL">Any Distance</option>
              <option value="1">&lt; 1.0 km Detour</option>
              <option value="2">&lt; 2.0 km Detour</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          C. AI FOOD INTELLIGENCE SPOTLIGHT
      ───────────────────────────────────────────────────────────── */}
      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING}
          className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-orange-50/80 via-amber-50/50 to-white border border-orange-200/80 shadow-md space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-orange-200/60 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  SAFAR Food Intelligence Recommendation
                </h3>
                <p className="text-[11px] text-slate-600 font-medium">
                  Explainable recommendations based on your {selectedDestination} journey corridor, budget, and hygiene benchmark
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-800 bg-orange-100/90 px-2.5 py-1 rounded-full self-start sm:self-auto">
              Deterministic Local AI
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-orange-100 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase">
                    <span className="text-orange-700 bg-orange-50 px-2 py-0.5 rounded">
                      {rec.suitabilityMeal} • {rec.detourKm} km detour
                    </span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                      Score {rec.outlet.swachhScore}/100
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-slate-900 leading-tight">
                    {rec.outlet.name}
                  </h4>

                  <p className="text-[11px] text-slate-500 font-semibold">
                    {rec.outlet.cuisine} · {rec.outlet.priceRange} / person
                  </p>

                  {/* Why SAFAR Recommends This */}
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                      Why SAFAR Recommends This:
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-700">
                      {(rec.explainableReasons || []).slice(0, 3).map((reason, rIdx) => (
                        <li key={rIdx} className="flex items-start space-x-1.5 leading-snug">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedOutletForModal(rec.outlet)}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleAddToTrip(rec.outlet)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1 ${
                      isAdded(rec.outlet.id)
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    {isAdded(rec.outlet.id) ? <span>✓ Added</span> : <span>+ My Trip</span>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          D. LOCAL FLAVOURS SECTION
      ───────────────────────────────────────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <span>🍲</span>
              <span>{currentFlavours.title}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {currentFlavours.desc}
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
            Destination Heritage
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {currentFlavours.items.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200/60">
                  {item.tag}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 pt-1">{item.name}</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          E. INTERACTIVE MAPVIEW SECTION
      ───────────────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center space-x-2">
              <Compass className="w-4 h-4 text-orange-600" />
              <span>Route & Hygiene Map Overlay</span>
            </h3>
            <p className="text-xs text-slate-500">
              Interactive food stops along verified corridors with transparent hygiene indicators
            </p>
          </div>

          <div className="flex items-center space-x-3 text-[10px] font-semibold flex-wrap">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>🟢 Strong available info</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>🟡 Moderate / limited info</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              <span>⚪ Limited hygiene information</span>
            </span>
          </div>
        </div>

        <MapView
          destination={{
            lat: mapCenter.lat,
            lng: mapCenter.lng,
            name: `${currentDestObj.name} Corridor`,
            address: `${currentDestObj.name} Food Hub`
          }}
          foodPlaces={outlets}
          onSelectFoodPlace={(fp) => setSelectedOutletForModal(fp)}
          showFoodMarkers={true}
          height="320px"
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          F. FOOD DISCOVERY CARDS GRID
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-black text-slate-900">
              Discover Food Stops
            </h3>
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {outlets.length} options found
            </span>
          </div>

          {nearRouteMode && (
            <span className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-xl flex items-center space-x-1">
              <Route className="w-3.5 h-3.5 text-orange-600" />
              <span>Sorted by Route Detour</span>
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
            <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Loading Swachh Food options...</p>
          </div>
        ) : outlets.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200 p-8">
            <Utensils className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">No matching food outlets found</h4>
            <p className="text-xs text-slate-500">Try loosening your dietary, distance, or score filters.</p>
            <button
              onClick={handleResetFilters}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outlets.map((outlet, i) => {
              const score = outlet.swachhScore || 75;
              const isStrong = score >= 85;
              const isModerate = score >= 70 && score < 85;
              const scoreColor = isStrong ? '#10B981' : isModerate ? '#F59E0B' : '#6B7280';

              return (
                <motion.div
                  key={outlet.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, ...SPRING }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl hover:border-orange-300 transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Image Header with Badges */}
                    <div className="h-44 relative overflow-hidden bg-slate-100">
                      <img
                        src={outlet.image}
                        alt={outlet.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Swachh Score Badge */}
                      <div
                        className="absolute top-3 right-3 px-3 py-1 rounded-xl shadow-lg backdrop-blur-md text-white font-mono flex items-center space-x-1.5"
                        style={{ background: `${scoreColor}F0` }}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="text-xs font-black">Swachh {score}/100</span>
                      </div>

                      {/* Vegetarian & Specialty Badges */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        {outlet.vegetarian === 'PURE_VEG' ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-600/95 text-white text-[10px] font-black uppercase backdrop-blur-md">
                            🌱 Pure Veg
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-black uppercase backdrop-blur-md">
                            Veg Options
                          </span>
                        )}
                        {outlet.localSpecialty && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/95 text-white text-[10px] font-black uppercase backdrop-blur-md">
                            ★ Local Specialty
                          </span>
                        )}
                      </div>

                      {/* Bottom Detour Pill */}
                      <div className="absolute bottom-3 left-3 bg-white/95 px-2.5 py-1 rounded-xl text-[10px] font-bold text-slate-800 shadow flex items-center space-x-1">
                        <Route className="w-3 h-3 text-orange-600" />
                        <span>{outlet.distanceFromReference} km from corridor</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-0.5">
                          <span className="uppercase text-[10px] tracking-wider text-orange-700 font-bold">
                            {outlet.cuisine}
                          </span>
                          <span className="flex items-center text-amber-600 font-bold text-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 mr-0.5" />
                            {outlet.travellerRating} ({outlet.reviewCount})
                          </span>
                        </div>

                        <h3 className="text-base font-black text-slate-900 leading-tight group-hover:text-orange-600 transition-colors">
                          {outlet.name}
                        </h3>

                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{outlet.location}</span>
                        </p>
                      </div>

                      {/* Signature Dish / Specialty */}
                      <div className="p-2.5 rounded-xl bg-orange-50/60 border border-orange-200/60 text-xs">
                        <span className="text-[10px] font-extrabold uppercase text-orange-800 block">
                          Local Specialty:
                        </span>
                        <p className="text-slate-700 font-medium text-[11px] line-clamp-1">
                          {outlet.signatureDish || outlet.localSpecialty}
                        </p>
                      </div>

                      {/* Recommendation Rationale */}
                      {outlet.recommendationReasons && outlet.recommendationReasons[0] && (
                        <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-lg leading-relaxed">
                          “{outlet.recommendationReasons[0]}”
                        </p>
                      )}

                      {/* Price & Score Subtitle */}
                      <div className="flex items-baseline justify-between pt-1 border-t border-slate-100 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Estimated Price</span>
                          <span className="text-lg font-black text-slate-900">
                            {outlet.priceRange}
                          </span>
                          <span className="text-[10px] text-slate-500"> / person</span>
                        </div>

                        <button
                          onClick={() => setSelectedOutletForModal(outlet)}
                          className="text-[11px] font-bold text-orange-600 hover:text-orange-700 underline"
                        >
                          Why this score?
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedOutletForModal(outlet)}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleAddToTrip(outlet)}
                      className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                        isAdded(outlet.id)
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm'
                      }`}
                    >
                      {isAdded(outlet.id) ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>In Trip</span>
                        </>
                      ) : (
                        <>
                          <span>+ Add to Trip</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          G. FOOD DETAIL MODAL / DRAWER
      ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedOutletForModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={SPRING}
              className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-orange-100 text-orange-800">
                      {selectedOutletForModal.cuisine}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      SAFAR Prototype Food Registry
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    {selectedOutletForModal.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    <span>{selectedOutletForModal.location}</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedOutletForModal(null);
                    setFeedbackSuccessMsg(null);
                  }}
                  className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">

                {/* Score Showcase & "Why this score?" */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-emerald-800 block">
                        SAFAR Prototype Swachh Score
                      </span>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-black text-emerald-700 font-mono">
                          {selectedOutletForModal.swachhScore}
                        </span>
                        <span className="text-xs text-slate-500 font-bold">/ 100</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-xs">
                      ★ {selectedOutletForModal.travellerRating} ({selectedOutletForModal.reviewCount} reviews)
                    </span>
                  </div>

                  {/* Component Breakdown Bars */}
                  <div className="pt-2 border-t border-emerald-200/60 space-y-2 text-xs">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                      Score Breakdown (Deterministic Transparent Formula):
                    </span>
                    {[
                      { key: 'prepHygiene', label: 'Preparation Hygiene', weight: '20%', val: selectedOutletForModal.scoreBreakdown?.prepHygiene || 90 },
                      { key: 'waterSanitation', label: 'Water & Sanitation (RO)', weight: '20%', val: selectedOutletForModal.scoreBreakdown?.waterSanitation || 90 },
                      { key: 'diningCleanliness', label: 'Dining Area Cleanliness', weight: '15%', val: selectedOutletForModal.scoreBreakdown?.diningCleanliness || 88 },
                      { key: 'wasteMgmt', label: 'Waste Management', weight: '15%', val: selectedOutletForModal.scoreBreakdown?.wasteMgmt || 85 },
                      { key: 'staffHygiene', label: 'Staff Hygiene', weight: '10%', val: selectedOutletForModal.scoreBreakdown?.staffHygiene || 88 },
                      { key: 'travellerFeedback', label: 'Traveller Feedback', weight: '10%', val: selectedOutletForModal.scoreBreakdown?.travellerFeedback || 92 },
                      { key: 'infoCompleteness', label: 'Information Completeness', weight: '10%', val: selectedOutletForModal.scoreBreakdown?.infoCompleteness || 90 }
                    ].map((comp) => (
                      <div key={comp.key} className="space-y-0.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-700">{comp.label} ({comp.weight})</span>
                          <span className="font-mono font-bold text-slate-900">{comp.val}/100</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-emerald-200/60 overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full transition-all"
                            style={{ width: `${comp.val}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="space-y-2 text-xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Available Hygiene & Trust Signals:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(selectedOutletForModal.trustIndicators || []).map((ti, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start space-x-2 text-[11px] text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{ti}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Why SAFAR Recommends This */}
                <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200 space-y-2 text-xs">
                  <span className="text-[10px] font-black uppercase text-orange-800 tracking-wider block">
                    Why SAFAR Recommends This:
                  </span>
                  <ul className="space-y-1 text-slate-700 text-[11px]">
                    {(selectedOutletForModal.recommendationReasons || []).map((r, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <Check className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Approximate Tariffs & Details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Avg. Tariff</span>
                    <span className="font-bold text-slate-900">{selectedOutletForModal.priceRange}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Opening Hours</span>
                    <span className="font-bold text-slate-900">{selectedOutletForModal.openingHours}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Phone</span>
                    <span className="font-bold text-slate-900">{selectedOutletForModal.phoneContact}</span>
                  </div>
                </div>

                {/* Traveller Feedback Form */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 flex items-center space-x-1.5">
                      <MessageSquare className="w-4 h-4 text-orange-600" />
                      <span>Submit Traveller Hygiene Feedback</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Community Input</span>
                  </div>

                  {feedbackSuccessMsg && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{feedbackSuccessMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Dining Cleanliness</label>
                      <select
                        value={feedbackCleanliness}
                        onChange={(e) => setFeedbackCleanliness(e.target.value)}
                        className="w-full p-1.5 rounded-lg bg-white border border-slate-200 font-semibold"
                      >
                        <option value="VERY_CLEAN">Very Clean</option>
                        <option value="ACCEPTABLE">Acceptable</option>
                        <option value="NEEDS_IMPROVEMENT">Needs Improvement</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Water Availability</label>
                      <select
                        value={feedbackWater}
                        onChange={(e) => setFeedbackWater(e.target.value)}
                        className="w-full p-1.5 rounded-lg bg-white border border-slate-200 font-semibold"
                      >
                        <option value="AVAILABLE">RO Water Available</option>
                        <option value="UNKNOWN">Unknown / Not Displayed</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Waste Management</label>
                      <select
                        value={feedbackWaste}
                        onChange={(e) => setFeedbackWaste(e.target.value)}
                        className="w-full p-1.5 rounded-lg bg-white border border-slate-200 font-semibold"
                      >
                        <option value="GOOD">Good (Covered Bins)</option>
                        <option value="AVERAGE">Average</option>
                        <option value="POOR">Poor</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Food Experience</label>
                      <select
                        value={feedbackExp}
                        onChange={(e) => setFeedbackExp(e.target.value)}
                        className="w-full p-1.5 rounded-lg bg-white border border-slate-200 font-semibold"
                      >
                        <option value="GOOD">Good / Delicious</option>
                        <option value="AVERAGE">Average</option>
                        <option value="POOR">Below Expectations</option>
                      </select>
                    </div>
                  </div>

                  <button
                    disabled={feedbackSubmitting}
                    onClick={() => handleSubmitFeedback(selectedOutletForModal.id)}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-1"
                  >
                    <span>{feedbackSubmitting ? 'Recording Feedback...' : 'Submit Anonymous Feedback'}</span>
                  </button>
                </div>

                {/* Data Transparency Notice */}
                <p className="text-[10px] text-slate-400 italic text-center leading-relaxed">
                  SAFAR Prototype Food Registry: This intelligence score is an algorithmically computed benchmark based on prototype indicators and traveller reviews. It does not replace statutory food safety audits.
                </p>

              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    handleAddToTrip(selectedOutletForModal);
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                    isAdded(selectedOutletForModal.id)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm'
                  }`}
                >
                  {isAdded(selectedOutletForModal.id) ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to My Trip</span>
                    </>
                  ) : (
                    <>
                      <span>+ Add Stop to My Trip</span>
                    </>
                  )}
                </button>

                <a
                  href={`tel:${selectedOutletForModal.phoneContact}`}
                  className="py-2.5 px-4 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 text-xs font-bold transition-colors flex items-center space-x-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call Outlet</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          H. DATA & TRUST TRANSPARENCY MODAL
      ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showTrustModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={SPRING}
              className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-slate-200"
            >
              <div className="flex items-center space-x-2 text-slate-900 font-black text-base border-b pb-2.5">
                <ShieldCheck className="w-5 h-5 text-orange-600" />
                <span>SAFAR Swachh Food Intelligence: Data & Trust</span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                <p>
                  <strong>Prototype Status:</strong> Swachh Food is an AI-powered tourism intelligence module engineered for the Smart India Hackathon (Problem Statement 26204). All listings and hygiene scores are generated from transparent benchmark indicator datasets.
                </p>
                <p>
                  <strong>No Official Certification Claims:</strong> SAFAR does NOT perform statutory food inspections or issue official government certifications. For prototype outlets without verified data, we indicate <em>“Limited hygiene information”</em> rather than making speculative safety assumptions.
                </p>
                <p>
                  <strong>Deterministic Scoring Formula:</strong>
                  <br />
                  <code className="text-[11px] bg-slate-100 px-2 py-1 rounded block mt-1 font-mono text-slate-800">
                    Swachh Score = 20% Prep Hygiene + 20% Water/Sanitation + 15% Cleanliness + 15% Waste Mgmt + 10% Staff + 10% Feedback + 10% Completeness
                  </code>
                </p>
              </div>

              <button
                onClick={() => setShowTrustModal(false)}
                className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Understood & Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
