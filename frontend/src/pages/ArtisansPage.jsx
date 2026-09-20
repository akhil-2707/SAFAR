import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, QrCode, CheckCircle2, Award, Heart, Sparkles, 
  ExternalLink, Search, Star, AlertTriangle, ArrowRight, IndianRupee, ShieldAlert,
  Cpu, PlusCircle, Filter, Phone, MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AICraftScannerModal from '../components/AICraftScannerModal';
import ArtisanOnboardModal from '../components/ArtisanOnboardModal';

const SPRING = { type: 'spring', stiffness: 360, damping: 28 };

export default function ArtisansPage({ tourist }) {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [selectedArtisan, setSelectedArtisan] = useState(null);
  const [verificationModal, setVerificationModal] = useState(null);
  const [directPayModal, setDirectPayModal] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [customTip, setCustomTip] = useState(100);

  useEffect(() => {
    fetchArtisans();
  }, []);

  const fetchArtisans = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/artisans');
      const data = await res.json();
      if (data.success && Array.isArray(data.artisans)) {
        setArtisans(data.artisans);
      }
    } catch (err) {
      console.error('Fetch Artisans Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyGI = async (artisan) => {
    setSelectedArtisan(artisan);
    try {
      const res = await fetch(`/api/artisans/verify/${artisan.id}`);
      const data = await res.json();
      if (data.success) {
        setVerificationModal(data.blockchainAudit);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecutePayment = async () => {
    if (!directPayModal) return;
    try {
      const totalAmount = directPayModal.fairBasePrice + customTip;
      const res = await fetch('/api/artisans/direct-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artisanId: directPayModal.id,
          amount: totalAmount,
          payerName: tourist?.fullName || 'Verified Tourist'
        })
      });
      const data = await res.json();
      if (data.success && data.receipt) {
        setPaymentSuccess(data.receipt);
        setDirectPayModal(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredArtisans = artisans.filter(art => {
    const matchesState = selectedState === 'ALL' || (art.state && art.state.toLowerCase() === selectedState.toLowerCase());
    const matchesSearch = !searchQuery || 
      art.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.craftName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (art.giTagNumber && art.giTagNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesState && matchesSearch;
  });

  const statesList = ['ALL', 'Jammu & Kashmir', 'Uttar Pradesh', 'Rajasthan', 'Assam', 'Karnataka', 'Tamil Nadu', 'Telangana'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-32"
    >
      {/* Top Banner with Action Buttons */}
      <div className="rounded-3xl p-6 sm:p-8 apple-card border border-purple-200/80 bg-gradient-to-br from-purple-50/90 via-white to-pink-50/70 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-purple-800">
                Government of India GI Registry Certified • Sector: Others
              </span>
              <span className="bg-purple-100 text-purple-900 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-purple-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-purple-700" />
                <span>DPIIT REGISTRY VERIFIED</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              National GI Master Artisans & Fair Trade Direct Hub
            </h1>
            <p className="text-xs text-gray-600 max-w-2xl leading-relaxed">
              Eliminating 60–75% middleman showroom kickbacks. Direct-from-source authentic Kashmiri Pashmina, Banarasi Silk, Moradabad Brassware, and Assam Muga Silk with 95% direct artisan UPI payout & cryptographic provenance audit.
            </p>
          </div>

          {/* Presentation Round Quick Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowScannerModal(true)}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-extrabold text-xs shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-95"
            >
              <Cpu className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>🤖 AI Craft Vision & Scam Inspector</span>
            </button>

            <button
              onClick={() => setShowOnboardModal(true)}
              className="px-4 py-3 rounded-2xl bg-white hover:bg-purple-50 text-purple-900 border-2 border-purple-300 font-extrabold text-xs shadow-sm flex items-center justify-center space-x-1.5 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-purple-600" />
              <span>➕ Onboard Guild (Live DB)</span>
            </button>
          </div>
        </div>

        {/* State Filters & Live Search Bar */}
        <div className="pt-2 border-t border-purple-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {statesList.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedState(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedState === st
                    ? 'bg-purple-700 text-white shadow-sm'
                    : 'bg-white/80 text-gray-600 hover:bg-purple-100 border border-purple-200/60'
                }`}
              >
                {st === 'ALL' ? '🇮🇳 All India Guilds' : st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search GI Tag, Craft, City..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
        </div>
      </div>

      {/* Artisans Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-500 font-bold">Querying National Geographical Indications Registry...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtisans.map((artisan) => (
            <div
              key={artisan.id}
              className="bg-white/95 rounded-3xl border border-gray-200/80 shadow-md hover:shadow-xl hover:border-purple-400 transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Image & Official GI Tag Badge */}
                <div className="h-48 relative overflow-hidden">
                  <img
                    src={artisan.image}
                    alt={artisan.craftName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-purple-900/90 text-white text-[10px] font-black uppercase backdrop-blur-md flex items-center gap-1 shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                      <span>{artisan.giTagNumber}</span>
                    </span>
                    {artisan.applicationNumber && (
                      <span className="px-2 py-0.5 rounded-full bg-white/90 text-purple-900 text-[9px] font-extrabold shadow-sm">
                        App #{artisan.applicationNumber}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2.5 py-1 rounded-xl text-[10px] font-bold backdrop-blur-md">
                    Heritage: {artisan.craftHeritageYears}+ Years
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-base font-black text-gray-900 group-hover:text-purple-700 transition-colors">
                      {artisan.name}
                    </h3>
                    <p className="text-xs font-bold text-purple-700">{artisan.craftName}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                      <span>{artisan.region}</span>
                    </p>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {artisan.artisanStory}
                  </p>

                  {artisan.cooperativeAddress && (
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-[10px] text-slate-500">
                      <strong>Registered Society:</strong> {artisan.registeredProprietor || artisan.name}
                    </div>
                  )}

                  {/* Anti-Scam Pricing Battle */}
                  <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-200/70 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Middleman Emporium Price:</span>
                      <span className="line-through text-red-500 font-bold font-mono">
                        ₹{artisan.typicalMarketScamPrice}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-purple-900">Govt Certified Fair Price:</span>
                      <span className="font-extrabold text-emerald-700 font-mono text-sm">
                        {artisan.officialFairPriceRange}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleVerifyGI(artisan)}
                    className="py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs rounded-xl border border-purple-200 transition-all flex items-center justify-center space-x-1"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Verify GI Hash</span>
                  </button>

                  <button
                    onClick={() => setDirectPayModal(artisan)}
                    className="py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1"
                  >
                    <Heart className="w-3.5 h-3.5" />
                    <span>Pay / Tip Direct</span>
                  </button>
                </div>

                {artisan.officialRegistryUrl && (
                  <a
                    href={artisan.officialRegistryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition-all flex items-center justify-center space-x-1"
                  >
                    <span>Inspect Record on IP India (DPIIT)</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: BLOCKCHAIN GI VERIFICATION AUDIT */}
      {selectedArtisan && verificationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 border-2 border-purple-400"
          >
            <div className="flex items-center space-x-3 text-purple-900 font-black text-lg">
              <ShieldCheck className="w-7 h-7 text-purple-600" />
              <span>Immutable GI Provenance Audit</span>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-mono space-y-2 text-gray-800">
              <div className="text-purple-800 font-bold text-sm">{selectedArtisan.craftName}</div>
              <div>Master Artisan Guild: <strong>{selectedArtisan.name}</strong></div>
              <div>Govt GI Tag Number: <strong className="text-purple-700">{selectedArtisan.giTagNumber}</strong></div>
              <div>Block Ledger Index: <strong>#{verificationModal.blockIndex}</strong></div>
              <div className="break-all text-[10px] text-gray-500">
                SHA-256 Hash: {verificationModal.provenanceHash}
              </div>
              <div className="text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                ✓ Cryptographically Verified: Matches Government of India GI Registry record standards.
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedArtisan(null);
                setVerificationModal(null);
              }}
              className="w-full py-2.5 bg-gray-900 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Close Verification Audit
            </button>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: DIRECT FAIR TRADE PAY */}
      {directPayModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 border-2 border-purple-400"
          >
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-800">
                Vocal For Local Direct Settlement
              </span>
              <h3 className="text-xl font-black text-gray-900">
                Support Master Artisan {directPayModal.name}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {directPayModal.craftName} ({directPayModal.region})
              </p>
            </div>

            {/* Split breakdown card */}
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Base Fair Price:</span>
                <span className="font-bold text-gray-900 font-mono">₹{directPayModal.fairBasePrice}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Artisan Appreciation Tip:</span>
                <div className="flex gap-1.5">
                  {[50, 100, 200].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setCustomTip(amt)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all ${
                        customTip === amt ? 'bg-purple-700 text-white' : 'bg-white text-gray-700 border border-gray-200'
                      }`}
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-purple-200/80 flex justify-between items-center text-sm font-black">
                <span className="text-purple-900">Total Direct Payout:</span>
                <span className="text-lg font-mono text-purple-900">
                  ₹{directPayModal.fairBasePrice + customTip}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-purple-200 text-[11px] text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>95% To Artisan's Bank ({directPayModal.artisanUpiVpa}):</span>
                  <span className="font-bold text-emerald-700">₹{Math.round((directPayModal.fairBasePrice + customTip) * 0.95)}</span>
                </div>
                <div className="flex justify-between">
                  <span>5% To Local Heritage Restoration Fund:</span>
                  <span className="font-bold text-blue-700">₹{Math.round((directPayModal.fairBasePrice + customTip) * 0.05)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Middleman Commission:</span>
                  <span className="font-bold text-emerald-700">₹0 (ZERO)</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setDirectPayModal(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleExecutePayment}
                className="flex-2 py-2.5 px-6 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
              >
                <span>Authorize UPI Direct Transfer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL 3: PAYMENT RECEIPT */}
      {paymentSuccess && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 border-2 border-emerald-400"
          >
            <div className="flex items-center space-x-3 text-emerald-700 font-black text-lg">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              <span>Direct Fair Trade Settled!</span>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs font-mono space-y-2 text-gray-800">
              <div className="text-emerald-900 font-bold text-sm">{paymentSuccess.artisanName}</div>
              <div>Receipt ID: <strong>{paymentSuccess.receiptId}</strong></div>
              <div>Total Transferred: <strong>₹{paymentSuccess.totalPaid} INR</strong></div>
              <div>Artisan VPA: <strong className="text-emerald-700">{paymentSuccess.splitBreakdown.artisanUpiVpa} ({paymentSuccess.splitBreakdown.percentageToArtisan})</strong></div>
              <div>Heritage Guild Fund: <strong className="text-blue-700">₹{paymentSuccess.splitBreakdown.heritagePreservationFundAmount} (5%)</strong></div>
              <div className="text-[10px] text-gray-500 break-all">Tx Hash: {paymentSuccess.txHash}</div>
            </div>

            <p className="text-[11px] text-gray-500 italic">
              🎉 Congratulations! You directly preserved Indian handloom heritage and bypassed commercial kickback touts.
            </p>

            <button
              onClick={() => setPaymentSuccess(null)}
              className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Done / Close Receipt
            </button>
          </motion.div>
        </div>
      )}

      {/* AI SCANNER MODAL */}
      <AICraftScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
      />

      {/* ARTISAN ONBOARD MODAL */}
      <ArtisanOnboardModal
        isOpen={showOnboardModal}
        onClose={() => setShowOnboardModal(false)}
        onArtisanAdded={(newArt) => {
          setArtisans((prev) => [newArt, ...prev]);
        }}
      />
    </motion.div>
  );
}
