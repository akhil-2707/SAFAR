import { 
  Building2, Clock, ShieldCheck, Sparkles, MapPin, 
  CheckCircle2, ArrowRight, Zap, QrCode, Percent, Coffee, Wifi, 
  ShowerHead, Flame, Compass, ChevronRight, AlertCircle, Award, PlusCircle,
  Smartphone, Key, Check, LogOut
} from 'lucide-react';
import { Link } from 'react-router-dom';
import HotelOnboardModal from '../components/HotelOnboardModal';
import HotelFastCheckinModal from '../components/HotelFastCheckinModal';

const SPRING = { type: 'spring', stiffness: 360, damping: 28 };

export default function MicroStaysPage({ tourist, sugamyaMode }) {
  const getCityFromTourist = (t) => {
    const dest = (t?.destination || t?.currentLocation?.address || '').toLowerCase();
    if (dest.includes('agra') || dest.includes('taj')) return 'Agra';
    if (dest.includes('varanasi') || dest.includes('kashi')) return 'Varanasi';
    if (dest.includes('jaipur') || dest.includes('rajasthan')) return 'Jaipur';
    if (dest.includes('jammu') || dest.includes('katra') || dest.includes('vaishno')) return 'Katra';
    if (dest.includes('guwahati') || dest.includes('assam') || dest.includes('kamrup') || dest.includes('kaziranga')) return 'Guwahati';
    return 'Ayodhya';
  };

  const [activeTab, setActiveTab] = useState('MICRO_STAYS'); // MICRO_STAYS, SPILLOVER
  const [selectedCity, setSelectedCity] = useState(getCityFromTourist(tourist));
  const [duration, setDuration] = useState('4h');
  const [hotels, setHotels] = useState([]);
  const [spilloverDeals, setSpilloverDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHotelOnboardModal, setShowHotelOnboardModal] = useState(false);
  const [showFastCheckinModal, setShowFastCheckinModal] = useState(false);
  const [selectedCheckinHotel, setSelectedCheckinHotel] = useState(null);
  const [activeStay, setActiveStay] = useState(null);

  // Booking states
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    if (tourist) {
      setSelectedCity(getCityFromTourist(tourist));
      fetchActiveStay();
    }
  }, [tourist?.touristId, tourist?.destination]);

  const fetchActiveStay = async () => {
    try {
      const tid = tourist?.touristId || 'TID-1035';
      const res = await fetch(`/api/hotels/active-checkin/${tid}`);
      const data = await res.json();
      if (data.success && data.hasActiveStay) {
        setActiveStay(data.stay);
      } else {
        setActiveStay(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCity]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/hotels/micro-stays?city=${selectedCity}`);
      const data = await res.json();
      if (data.success) {
        setHotels(data.hotels);
      }

      const resSpill = await fetch('/api/hotels/spillover-deals');
      const dataSpill = await resSpill.json();
      if (dataSpill.success) {
        setSpilloverDeals(dataSpill.spilloverDeals);
      }
    } catch (err) {
      console.error('Fetch Hotels Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookMicroStay = async (hotel) => {
    try {
      const res = await fetch('/api/hotels/book-micro-stay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelId: hotel.id,
          touristId: tourist?.touristId || 'TID-1035',
          touristName: tourist?.fullName || 'Verified Tourist',
          duration,
          slot: hotel.availableSlots[0] || '11:00 - 15:00',
          guestCount: 1
        })
      });
      const data = await res.json();
      if (data.success) {
        setBookingSuccess(data.booking);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-32"
    >
      {/* ⚡ 1-Tap Digital ID Hotel Fast Check-in Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 border border-emerald-400/30"
      >
        <div className="relative z-10 flex items-start sm:items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 text-2xl shadow-inner">
            ⚡
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full border border-white/25">
                DPDP Act 2023 Compliant
              </span>
              <span className="text-[10px] font-bold bg-white/25 text-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-white/20">
                <Sparkles className="w-2.5 h-2.5 text-emerald-200" /> Zero Paper / 3-Sec Protocol
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight mt-1 text-white">
              1-Tap Digital ID Hotel Fast Check-in Terminal
            </h3>
            <p className="text-xs sm:text-sm text-emerald-50/90 font-medium max-w-2xl mt-0.5">
              Skip 15-minute front-desk queues & risky paper Aadhaar photocopies. Show your S.A.F.A.R. QR for instant cryptographic check-in, smart door PIN & automatic police e-register compliance.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setSelectedCheckinHotel(null);
              setShowFastCheckinModal(true);
            }}
            className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-white text-emerald-800 hover:bg-emerald-50 transition-all shadow-lg flex items-center space-x-2 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Open Fast Check-In Desk</span>
          </button>
        </div>
      </motion.div>

      {/* 🟢 Active Hotel Stay Notice Banner */}
      {activeStay && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border-2 border-emerald-500/40 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Active Guest In-House
                </span>
                <strong className="text-sm font-black text-slate-900">{activeStay.hotelName}</strong>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Allotted: <strong className="text-slate-900 font-mono">{activeStay.roomNumber}</strong> • Door PIN: <strong className="text-emerald-700 font-mono">{activeStay.digitalKeyPin}</strong> • Register ID: {activeStay.registerId}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedCheckinHotel(hotels.find(h => h.id === activeStay.hotelId) || null);
              setShowFastCheckinModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs shadow-sm flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>View Digital Room Key</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="rounded-3xl p-6 sm:p-8 apple-card border border-blue-200/80 bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/70 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase tracking-widest text-blue-800">
                Ministry of Tourism • Sector: Verified Hospitality Hub
              </span>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-blue-200">
                ZERO OTA COMMISSION
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              Smart Micro-Stays & Digital Cloakroom Hub
            </h1>
            <p className="text-xs text-gray-600 max-w-2xl mt-1 leading-relaxed">
              Monetizing daytime vacant hotel rooms (09 AM–04 PM) with flexible 2–6 hour stays at 70% lower tariff, plus verified secure luggage locker mesh for bag-free city tourism.
            </p>
          </div>

          {/* Presentation Round Quick Actions & City Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => setShowHotelOnboardModal(true)}
              className="px-3.5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center space-x-1.5 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>➕ Partner Stay (Live DB)</span>
            </button>

            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/90 border border-gray-200 shadow-sm">
              <MapPin className="w-4 h-4 text-blue-600 pl-1" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="text-xs font-bold px-2 py-1.5 rounded-xl cursor-pointer bg-transparent focus:outline-none text-gray-800"
              >
                <option value="Ayodhya">🛕 Ayodhya Dham (AY)</option>
                <option value="Katra">🏔️ Katra • Vaishno Devi (SVDK)</option>
                <option value="Agra">🕌 Agra Cantt (AGC)</option>
                <option value="Varanasi">🕉️ Varanasi Cantt (BSB)</option>
                <option value="Jaipur">🏰 Jaipur Junction (JP)</option>
                <option value="Guwahati">🦏 Guwahati • Kamakhya (KYQ)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3 Main Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200/70 flex-wrap">
          {[
            { id: 'MICRO_STAYS', label: '2–4 Hr Smart Day Stays', icon: Building2, desc: 'Shower, rest & recharge' },
            { id: 'SPILLOVER', label: 'Hotspot Spillover Flash Deals', icon: Percent, desc: '50% off satellite homestays' }
          ].map((t) => {
            const active = activeTab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                    : 'bg-white/80 hover:bg-gray-100 text-gray-700 border border-gray-200/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: SMART MICRO STAYS */}
      {activeTab === 'MICRO_STAYS' && (
        <div className="space-y-6">
          {/* Duration Selector Bar */}
          <div className="p-4 rounded-2xl apple-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/90 border border-gray-200/80">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <span className="text-xs font-bold text-gray-900 block">Choose Day-Stay Duration</span>
                <span className="text-[10px] text-gray-500">Pay only for the hours you need between 08:00 AM – 08:00 PM</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-gray-100/80 p-1 rounded-xl">
              {[
                { key: '2h', label: '⚡ 2 Hours (Quick Refresh)' },
                { key: '4h', label: '🛌 4 Hours (Comfort Nap)' },
                { key: '6h', label: '☕ 6 Hours (Full Work & Rest)' }
              ].map((d) => (
                <button
                  key={d.key}
                  onClick={() => setDuration(d.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    duration === d.key
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hotel Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => {
              const currentRate = hotel.hourlyRates[duration] || hotel.hourlyRates['4h'];
              const savings = hotel.hourlyRates.fullDay - currentRate;
              return (
                <div
                  key={hotel.id}
                  className="bg-white/95 rounded-3xl border border-gray-200/80 shadow-md hover:shadow-xl hover:border-blue-400 transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Hotel Image with Badges */}
                    <div className="h-44 relative overflow-hidden">
                      <img
                        src={hotel.image}
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-full bg-blue-600/90 text-white text-[10px] font-black uppercase backdrop-blur-md">
                          ⚡ {duration.toUpperCase()} DAY-USE
                        </span>
                        {hotel.wheelchairFriendly && (
                          <span className="px-2 py-1 rounded-full bg-emerald-600/90 text-white text-[10px] font-black uppercase backdrop-blur-md flex items-center gap-1">
                            ♿ Accessible
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-white/95 px-2.5 py-1 rounded-xl shadow-md text-xs font-black text-gray-900 flex items-center gap-1">
                        ⭐ {hotel.rating} <span className="text-[10px] text-gray-500 font-normal">({hotel.reviewsCount})</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="text-base font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                          {hotel.name}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span>{hotel.location}</span>
                        </p>
                      </div>

                      {/* Amenities Pills */}
                      <div className="flex flex-wrap gap-1.5">
                        {hotel.amenities.map((am, i) => (
                          <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600">
                            {am}
                          </span>
                        ))}
                      </div>

                      {/* Pricing Comparison Box */}
                      <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200/60 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-gray-500 block uppercase">
                            {duration} Micro-Stay Rate
                          </span>
                          <span className="text-xl font-black text-blue-700 font-mono">
                            ₹{currentRate} <span className="text-xs font-normal text-gray-500">INR</span>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-gray-400 block line-through">
                            ₹{hotel.hourlyRates.fullDay} 24h
                          </span>
                          <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            Save ₹{savings}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 space-y-2">
                    <button
                      onClick={() => {
                        setSelectedCheckinHotel(hotel);
                        setShowFastCheckinModal(true);
                      }}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 active:scale-98 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>⚡ 1-Tap Fast Check-In (3s Zero Paper)</span>
                    </button>

                    <button
                      onClick={() => handleBookMicroStay(hotel)}
                      className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <span>Book Scheduled {duration} Day Stay</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}



      {/* TAB 3: SPILLOVER SATELLITE DEALS (Feature 2) */}
      {activeTab === 'SPILLOVER' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-white border border-amber-200/80 apple-card space-y-2">
            <div className="flex items-center space-x-2 text-amber-800">
              <Percent className="w-6 h-6 text-amber-600" />
              <h2 className="text-lg font-black">AI Footfall Spillover & Satellite Homestay Flash Stays</h2>
            </div>
            <p className="text-xs text-gray-600 max-w-3xl leading-relaxed">
              When tourist hotspots (Mall Road, Taj East Gate, Ram Mandir Corridor) approach carrying capacity (&gt;85%), this engine reroutes tourists to verified satellite eco-stays at 50% flat discount with VIP guaranteed next-day morning entry slots.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {spilloverDeals.map((deal) => (
              <div
                key={deal.id}
                className="bg-white/95 rounded-3xl border-2 border-amber-300 p-6 shadow-lg hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[10px] font-black uppercase">
                      Choked Hotspot: {deal.hotspotTarget}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase">
                      {deal.discountPercent}% OFF
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-gray-900">{deal.satelliteName}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">📍 {deal.distanceKm} km off-beat green corridor</p>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-1">
                    <span className="font-extrabold text-amber-900 block">✨ Guaranteed VIP Advantage:</span>
                    <span className="text-gray-700 text-[11px] block">{deal.vipPerk}</span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Spillover Flash Price</span>
                      <span className="text-2xl font-black text-gray-900 font-mono">₹{deal.spilloverFlashPrice}</span>
                      <span className="text-xs text-gray-400 line-through ml-2 font-mono">₹{deal.regularPrice}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg">
                      0% Commission
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => alert(`✓ Flash Stay Reserved at ${deal.satelliteName}! Next-Day VIP slot confirmed.`)}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
                >
                  <Award className="w-4 h-4" />
                  <span>Claim Flash Deal & VIP Pass</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Micro-Stay */}
      {bookingSuccess && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 border border-blue-300"
          >
            <div className="flex items-center space-x-3 text-emerald-700 font-black text-lg">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              <span>Day-Stay Confirmed!</span>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-2 font-mono">
              <div className="text-blue-800 font-bold text-sm">{bookingSuccess.hotelName}</div>
              <div>Booking ID: <strong>{bookingSuccess.bookingId}</strong></div>
              <div>Duration: <strong>{bookingSuccess.duration} Day Use</strong> ({bookingSuccess.slot})</div>
              <div>Amount Paid: <strong>₹{bookingSuccess.totalCost} INR</strong></div>
              <div className="text-emerald-700 font-bold">You Saved: ₹{bookingSuccess.savedComparedToFullDay} compared to 24h tariff!</div>
              <div className="text-gray-400 text-[10px] truncate">Hash: {bookingSuccess.passHash}</div>
            </div>
            <button
              onClick={() => setBookingSuccess(null)}
              className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Done & Save Digital Pass
            </button>
          </motion.div>
        </div>
      )}



      {/* HOTEL ONBOARD MODAL */}
      <HotelOnboardModal
        isOpen={showHotelOnboardModal}
        onClose={() => setShowHotelOnboardModal(false)}
        onHotelAdded={(newH) => {
          setHotels((prev) => [newH, ...prev]);
        }}
      />

      {/* 1-TAP HOTEL FAST CHECK-IN MODAL */}
      <HotelFastCheckinModal
        isOpen={showFastCheckinModal}
        onClose={() => setShowFastCheckinModal(false)}
        tourist={tourist}
        preselectedHotel={selectedCheckinHotel}
        allHotels={hotels}
        onCheckinSuccess={(rec) => {
          setActiveStay(rec);
        }}
      />
    </motion.div>
  );
}
