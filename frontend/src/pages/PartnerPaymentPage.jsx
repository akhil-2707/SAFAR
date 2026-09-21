import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  CreditCard, ShieldCheck, CheckCircle2, AlertTriangle, Building2, 
  Sparkles, ArrowLeft, ArrowRight, RefreshCw, Check, Download, Info, Leaf
} from 'lucide-react';
import SafarLogo from '../components/SafarLogo';

const SPRING = { type: 'spring', stiffness: 380, damping: 28 };

const DEFAULT_PARTNERS = [
  {
    id: 'part_01',
    name: 'Hotel Grand Ayodhya Heritage',
    type: 'HOTEL',
    location: 'Ayodhya',
    address: 'Ram Path, Near Circuit House, Ayodhya, UP',
    status: 'ACTIVE',
    rewardCoins: 1,
    isSpecialEco: false,
    rating: 4.8,
    maximumDiscount: 20
  },
  {
    id: 'part_02',
    name: 'Sarayu Riverfront Eco Resort',
    type: 'HOTEL',
    location: 'Ayodhya',
    address: 'Guptar Ghat Road, Ayodhya, UP',
    status: 'ACTIVE',
    rewardCoins: 2,
    isSpecialEco: true,
    rating: 4.9,
    maximumDiscount: 15
  },
  {
    id: 'part_03',
    name: 'Taj View Eco Bistro & Cafe',
    type: 'CAFE',
    location: 'Agra',
    address: 'Taj East Gate Road, Agra, UP',
    status: 'ACTIVE',
    rewardCoins: 1,
    isSpecialEco: false,
    rating: 4.7,
    maximumDiscount: 5
  },
  {
    id: 'part_04',
    name: 'Royal Awadh Dining & Pure Veg',
    type: 'RESTAURANT',
    location: 'Ayodhya',
    address: 'Civil Lines, Ayodhya, UP',
    status: 'ACTIVE',
    rewardCoins: 1,
    isSpecialEco: false,
    rating: 4.6,
    maximumDiscount: 10
  },
  {
    id: 'part_05',
    name: 'Kashi Organic Thali Heritage',
    type: 'RESTAURANT',
    location: 'Varanasi',
    address: 'Assi Ghat Road, Varanasi, UP',
    status: 'ACTIVE',
    rewardCoins: 2,
    isSpecialEco: true,
    rating: 4.8,
    maximumDiscount: 18
  },
  {
    id: 'part_06',
    name: 'Brahmaputra Breeze Green Cafe',
    type: 'CAFE',
    location: 'Guwahati',
    address: 'MG Road, Riverside Walk, Guwahati, Assam',
    status: 'ACTIVE',
    rewardCoins: 1,
    isSpecialEco: false,
    rating: 4.5,
    maximumDiscount: 8
  },
  {
    id: 'part_07',
    name: 'Himalayan Pine Valley Hotel',
    type: 'HOTEL',
    location: 'Katra',
    address: 'Katra Main Road, Katra, Jammu & Kashmir',
    status: 'ACTIVE',
    rewardCoins: 1,
    isSpecialEco: false,
    rating: 4.7,
    maximumDiscount: 20
  }
];

export default function PartnerPaymentPage() {
  const [searchParams] = useSearchParams();
  const initialPartnerId = searchParams.get('partnerId') || 'part_01';
  const initialPaymentMethod = searchParams.get('paymentMethod') || 'UPI / QR Code';
  const navigate = useNavigate();

  // User info
  const [currentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('safar_user');
      return stored ? JSON.parse(stored) : { touristId: 'TID-1035', name: 'Ananya Mishra' };
    } catch {
      return { touristId: 'TID-1035', name: 'Ananya Mishra' };
    }
  });

  const activeTid = currentUser?.touristId || 'TID-1035';

  const [partners, setPartners] = useState(DEFAULT_PARTNERS);
  const [selectedPartnerId, setSelectedPartnerId] = useState(initialPartnerId);
  const [originalBill, setOriginalBill] = useState(1000);
  const [partnerSpecialDiscount, setPartnerSpecialDiscount] = useState(0);
  const [applyDiscount, setApplyDiscount] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState(initialPaymentMethod);

  // Backend calculation result
  const [calculation, setCalculation] = useState(null);
  const [loadingCalculation, setLoadingCalculation] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Load partners on mount
  useEffect(() => {
    fetch('/api/rewards/partners')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.partners) {
          setPartners(d.partners);
          if (!selectedPartnerId && d.partners.length > 0) {
            setSelectedPartnerId(d.partners[0].id);
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Recalculate discount with backend engine whenever partner or bill changes
  useEffect(() => {
    if (!selectedPartnerId || !originalBill || originalBill <= 0) return;

    const timer = setTimeout(() => {
      fetchBackendDiscountCalculation();
    }, 200);

    return () => clearTimeout(timer);
  }, [selectedPartnerId, originalBill, activeTid, partnerSpecialDiscount]);

  const fetchBackendDiscountCalculation = async () => {
    try {
      setLoadingCalculation(true);
      setErrorMessage(null);
      const res = await fetch('/api/rewards/calculate-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          touristId: activeTid,
          partnerId: selectedPartnerId,
          originalBill: Number(originalBill),
          partnerSpecialDiscountPercent: Number(partnerSpecialDiscount)
        })
      });

      const data = await res.json();
      if (data.success && data.calculation) {
        setCalculation(data.calculation);
      } else {
        setErrorMessage(data.error || 'Failed to calculate discount');
      }
    } catch (err) {
      console.error('Calculation Error:', err);
    } finally {
      setLoadingCalculation(false);
    }
  };

  const handleProcessPayment = async () => {
    try {
      setPaymentProcessing(true);
      setErrorMessage(null);

      const res = await fetch('/api/rewards/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          touristId: activeTid,
          partnerId: selectedPartnerId,
          originalBill: Number(originalBill),
          paymentMethod,
          partnerSpecialDiscountPercent: Number(partnerSpecialDiscount)
        })
      });

      const data = await res.json();
      if (data.success && data.receipt) {
        setPaymentReceipt(data.receipt);
      } else {
        setErrorMessage(data.error || 'Payment execution failed');
      }
    } catch (err) {
      setErrorMessage('Network error during checkout. Please retry.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const selectedPartner = partners.find((p) => p.id === selectedPartnerId);

  // Values computed from backend calculation
  const originalAmount = Number(originalBill) || 0;
  const discountPercent = applyDiscount ? (calculation?.effectiveTotalDiscountPercent ?? calculation?.applicableDiscountPercent ?? 0) : 0;
  const discountSavings = applyDiscount ? (calculation?.discountAmount || 0) : 0;
  const finalPayable = applyDiscount ? (calculation?.finalPayable ?? originalAmount) : originalAmount;

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-6" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
      
      {/* Back Button */}
      <Link
        to="/green-rewards"
        className="text-xs font-bold text-slate-500 hover:text-emerald-700 flex items-center space-x-1 transition-colors w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Green Rewards Hub</span>
      </Link>

      {/* Main Payment Card */}
      <div 
        className="rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-2xl relative overflow-hidden"
        style={{
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.08)'
        }}
      >
        {/* Tricolor Ribbon Header */}
        <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

        {/* Title */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
              <CreditCard className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  SAFAR Partner Payment
                </h1>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Green Checkout
                </span>
              </div>
              <p className="text-xs text-slate-500">Official verified settlement gateway</p>
            </div>
          </div>

          <SafarLogo size="sm" showText={false} />
        </div>

        {errorMessage && (
          <div className="my-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-5 my-6">
          {/* Partner Select */}
          <div>
            <label className="font-bold text-xs text-slate-700 block mb-1">
              SAFAR Certified Partner Establishment
            </label>
            <select
              value={selectedPartnerId}
              onChange={(e) => setSelectedPartnerId(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-300 bg-white font-bold text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.location} · {p.type}) — Max Green Coin {p.maximumDiscount || 40}%
                </option>
              ))}
            </select>
            {/* Partner Special Discount Input */}
            <div className="mt-3">
              <label className="font-bold text-xs text-slate-700 block mb-1">
                Partner Special Discount (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={partnerSpecialDiscount}
                onChange={(e) => setPartnerSpecialDiscount(Math.max(0, Number(e.target.value)))}
                className="w-full p-3 rounded-2xl border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Original Bill Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-xs text-slate-700">Original Bill Amount (₹)</label>
              <div className="flex items-center space-x-1.5">
                {[500, 1000, 2500, 5000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setOriginalBill(preset)}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-sm font-black text-slate-400">₹</span>
              <input
                type="number"
                min={10}
                required
                value={originalBill}
                onChange={(e) => setOriginalBill(Math.max(1, Number(e.target.value)))}
                className="w-full pl-8 pr-4 py-3 rounded-2xl border border-slate-300 font-mono text-base font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Toggle Apply Discount */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Leaf className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-xs font-black text-slate-900 block">
                  Apply Green Coin Discount Tier
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Your Balance: <strong>{calculation?.userCoins || 27} Green Coins</strong>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setApplyDiscount(!applyDiscount)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                applyDiscount
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {applyDiscount ? '✓ Applied' : 'Don\'t Apply'}
            </button>
          </div>

          {/* Live Backend Calculation Breakdown (Matching User Prompt Section 16 Exactly) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50/70 border border-emerald-200/90 space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60 font-mono text-[11px]">
              <span className="text-slate-600">Partner:</span>
              <span className="font-bold text-slate-900 truncate max-w-[220px]">
                {calculation?.partnerName || selectedPartner?.name || 'Selected Partner'}
              </span>
            </div>

            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-slate-600">Original Bill:</span>
              <span className="font-black text-slate-900">₹{originalAmount.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-slate-600">Your Green Coins:</span>
              <span className="font-black text-emerald-700">{calculation?.userCoins || 27}</span>
            </div>

            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-slate-600">Green Coin Tier Discount:</span>
              <span className="font-black text-blue-700">
                {applyDiscount ? `${calculation?.greenCoinDiscountPercent || 0}%` : '0%'}
              </span>
            </div>

            {calculation?.partnerSpecialDiscountPercent > 0 && (
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-slate-600">Partner Special Discount:</span>
                <span className="font-black text-indigo-700">
                  +{calculation.partnerSpecialDiscountPercent}%
                </span>
              </div>
            )}

            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-slate-600">Total Effective Discount:</span>
              <span className="font-black text-emerald-700">
                {applyDiscount ? `${discountPercent}%` : '0%'}
              </span>
            </div>

            <div className="flex items-center justify-between font-mono text-xs text-emerald-700">
              <span className="font-bold">Total Discount Savings:</span>
              <span className="font-black">-₹{discountSavings.toLocaleString()}</span>
            </div>

            <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-sm sm:text-base font-mono">
              <span className="font-black text-slate-900">Final Amount Payable:</span>
              <span className="font-black text-emerald-800 text-lg sm:text-xl">
                ₹{finalPayable.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Mandatory Business Rule Reminder */}
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 flex items-start space-x-2.5 text-[11px] text-blue-950 leading-relaxed">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>SAFAR Fair Tourism Protocol (Mandatory):</strong>
              <p className="mt-0.5 text-blue-800">
                Maximum Green Coin Discount = <strong>40%</strong>. A purchase can <strong>never become completely free</strong>. Even with 100+ coins on a ₹1,000 bill, final amount remains ₹600 (minimum 60% payable). Partners may offer higher discounts for special occasions, but the system will never charge less than 60% of the original amount.
              </p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="font-bold text-xs text-slate-700 block mb-1.5">Payment Method</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { id: 'UPI / QR Code', emoji: '📱', label: 'UPI / QR' },
                { id: 'PayTM', emoji: '🔵', label: 'PayTM' },
                { id: 'Google Pay', emoji: '🟢', label: 'Google Pay' },
                { id: 'PhonePe', emoji: '💜', label: 'PhonePe' },
                { id: 'Debit / Credit Card', emoji: '💳', label: 'Card' },
                { id: 'Net Banking', emoji: '🏦', label: 'Net Banking' },
              ].map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center space-y-0.5 ${
                    paymentMethod === method.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-400'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base">{method.emoji}</span>
                  <span className="text-[10px] font-black leading-tight">{method.label}</span>
                </button>
              ))}
            </div>

            {/* UPI Deep-Link Info */}
            {(paymentMethod === 'UPI / QR Code' || paymentMethod === 'PayTM' || paymentMethod === 'Google Pay' || paymentMethod === 'PhonePe') && (
              <div className="mt-2.5 p-3 rounded-2xl bg-violet-50 border border-violet-200 text-[11px] text-violet-900 font-semibold flex items-start space-x-2">
                <span className="text-base shrink-0">📲</span>
                <div>
                  <strong className="text-violet-800">UPI Payment via {paymentMethod}</strong>
                  <p className="text-[10px] text-violet-700 mt-0.5">
                    Your SAFAR Green Coin discount is applied first, then you'll be redirected to <strong>{paymentMethod}</strong> to complete the payment of the discounted amount. The partner receives the full amount — SAFAR subsidizes the difference.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Submit Payment Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={SPRING}
            onClick={handleProcessPayment}
            disabled={paymentProcessing || loadingCalculation}
            className="w-full py-4 rounded-2xl font-black text-sm text-white shadow-xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              boxShadow: '0 8px 30px rgba(16, 185, 129, 0.35)'
            }}
          >
            {paymentProcessing ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Pay ₹{finalPayable.toLocaleString()} at {selectedPartner?.name || 'Partner'}</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Payment Receipt Modal */}
      <AnimatePresence>
        {paymentReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 relative overflow-hidden"
            >
              <div className="h-2 w-full absolute top-0 left-0 bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

              <div className="text-center space-y-1.5 pt-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h2 className="text-xl font-black text-slate-900">Payment Successful!</h2>
                <p className="text-xs text-slate-500">Official SAFAR Green Discount Settlement</p>
              </div>

              {/* Receipt Body */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment ID:</span>
                  <span className="font-bold text-slate-800">{paymentReceipt.paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Auth Code:</span>
                  <span className="font-bold text-blue-700">{paymentReceipt.authorizationCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Partner:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[180px]">{paymentReceipt.partnerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Original Bill:</span>
                  <span className="text-slate-800 font-bold">₹{paymentReceipt.originalBill}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Green Discount ({paymentReceipt.discountPercent}%):</span>
                  <span className="font-bold">-₹{paymentReceipt.discountSavings}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                  <span>Amount Paid:</span>
                  <span className="text-emerald-800">₹{paymentReceipt.finalAmountPaid}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                  <span>Gateway:</span>
                  <span>{paymentReceipt.verifiedBy}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => window.print()}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download / Print Receipt</span>
                </button>

                <button
                  onClick={() => {
                    setPaymentReceipt(null);
                    navigate('/green-rewards?tab=history');
                  }}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
                >
                  View in Reward & Transaction History
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
