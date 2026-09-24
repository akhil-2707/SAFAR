import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  CreditCard, ShieldCheck, CheckCircle2, AlertTriangle, Building2, 
  Sparkles, ArrowLeft, ArrowRight, RefreshCw, Check, Download, Info, Leaf,
  QrCode, Smartphone, AtSign, ShieldAlert, XCircle, RotateCcw, Camera, ScanLine, Store, Zap
} from 'lucide-react';
import SafarLogo from '../components/SafarLogo';
import PaymentQR from '../components/payment/PaymentQR';
import PaymentAppModal, { PAYMENT_APPS_CONFIG } from '../components/payment/PaymentAppModal';
import UPIIdInput from '../components/payment/UPIIdInput';
import PartnerQRScanner from '../components/payment/PartnerQRScanner';

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
  const initialMethodParam = searchParams.get('paymentMethod') || '';
  const autoScanParam = searchParams.get('scan') === 'true';
  const autoPayParam = searchParams.get('autoPay') === 'true';
  const categoryParam = searchParams.get('category') || 'partner';
  const isEVehicle = categoryParam === 'e-vehicle' || categoryParam === 'e_vehicle';
  const isArtisan = categoryParam === 'artisan';
  const vehicleTypeParam = searchParams.get('vehicleType') || 'E-Rickshaw';
  const partnerNameParam = searchParams.get('partnerName');
  const amountParam = searchParams.get('amount');
  const initialAmount = amountParam ? Math.max(1, Number(amountParam)) : (isEVehicle ? 600 : 1000);
  const navigate = useNavigate();

  // Normalize initial payment method
  const normMethod = (initialMethodParam || '').toLowerCase();
  const initialCategory = 
    normMethod.includes('app') || normMethod.includes('paytm') || normMethod.includes('phonepe') || normMethod.includes('gpay') || normMethod.includes('google') || normMethod.includes('bhim')
      ? 'APPS'
      : normMethod.includes('upi')
      ? 'UPI_ID'
      : isEVehicle
      ? 'APPS'
      : 'SCANNER';

  const initialAppKey = 
    normMethod.includes('paytm') ? 'demo_paytm'
    : normMethod.includes('phonepe') ? 'demo_phonepe'
    : normMethod.includes('gpay') || normMethod.includes('google') ? 'demo_gpay'
    : normMethod.includes('bhim') ? 'demo_bhim'
    : 'demo_paytm';

  // User session
  const [currentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('safar_user');
      return stored ? JSON.parse(stored) : { touristId: 'TID-1035', name: 'Ananya Mishra' };
    } catch {
      return { touristId: 'TID-1035', name: 'Ananya Mishra' };
    }
  });

  const activeTid = currentUser?.touristId || 'TID-1035';

  // State
  const [partners, setPartners] = useState(DEFAULT_PARTNERS);
  const [selectedPartnerId, setSelectedPartnerId] = useState(initialPartnerId);
  const [originalBill, setOriginalBill] = useState(initialAmount);
  const [partnerSpecialDiscount, setPartnerSpecialDiscount] = useState(0);
  const [applyDiscount, setApplyDiscount] = useState(!isEVehicle && !isArtisan);

  // Active Method Tab: 'SCANNER' | 'APPS' | 'UPI_ID' | 'SHOW_QR'
  const [selectedMethodCategory, setSelectedMethodCategory] = useState(initialCategory);

  // Live Camera Scanner State
  const [isScannerOpen, setIsScannerOpen] = useState(autoScanParam);
  const [scannedAlert, setScannedAlert] = useState(null);

  // Gateway configuration from backend
  const [paymentConfig, setPaymentConfig] = useState({
    mode: 'demo',
    isConfigured: true,
    label: 'SAFAR Demo Payment Gateway'
  });

  // Discount calculation
  const [calculation, setCalculation] = useState(null);
  const [loadingCalculation, setLoadingCalculation] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Payment State Machine: 'IDLE' | 'PENDING' | 'SUCCESS' | 'FAILED'
  const [paymentState, setPaymentState] = useState('IDLE');
  const [activePayment, setActivePayment] = useState(null);
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [failureReason, setFailureReason] = useState(null);
  const [processingAction, setProcessingAction] = useState(false);

  // App Modal State
  const [selectedAppKey, setSelectedAppKey] = useState(initialAppKey);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);

  // 1. Fetch Gateway Config
  useEffect(() => {
    fetch('/api/payments/config')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPaymentConfig(d);
      })
      .catch((err) => console.warn('Payment config error:', err));
  }, []);

  // 2. Fetch Partners
  useEffect(() => {
    fetch('/api/rewards/partners')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.partners && d.partners.length > 0) {
          setPartners(d.partners);
        }
      })
      .catch((err) => console.warn('Partners fetch error:', err));
  }, []);

  // 3. Live Backend Discount Calculation
  useEffect(() => {
    if (isEVehicle || isArtisan) {
      setCalculation({
        originalBill: Number(originalBill),
        greenCoinDiscountPercent: 0,
        partnerSpecialDiscountPercent: 0,
        effectiveTotalDiscountPercent: 0,
        discountAmount: 0,
        finalPayable: Number(originalBill),
        maxAllowedDiscount: 0,
        minPayableRequired: Number(originalBill),
        cappedAtMax: false
      });
      return;
    }

    if (!selectedPartnerId || !originalBill || originalBill <= 0) return;

    const timer = setTimeout(() => {
      fetchBackendDiscountCalculation();
    }, 200);

    return () => clearTimeout(timer);
  }, [selectedPartnerId, originalBill, activeTid, partnerSpecialDiscount, isEVehicle, isArtisan]);

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

  // Helper: Create Payment Session via Backend
  const createPaymentSession = async (methodType, customUpi = null) => {
    try {
      setProcessingAction(true);
      setErrorMessage(null);

      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          touristId: activeTid,
          partnerId: isEVehicle ? 'part_ev_transit' : isArtisan ? 'part_artisan' : selectedPartnerId,
          originalBill: Number(originalBill),
          paymentMethod: methodType,
          partnerSpecialDiscountPercent: isEVehicle || isArtisan ? 0 : Number(partnerSpecialDiscount),
          upiId: customUpi,
          category: categoryParam,
          vehicleType: vehicleTypeParam,
          partnerName: partnerNameParam
        })
      });

      const data = await res.json();
      if (data.success && data.payment) {
        setActivePayment(data.payment);
        setPaymentState('PENDING');
        return data.payment;
      } else {
        setErrorMessage(data.error || 'Failed to initialize payment');
        return null;
      }
    } catch (err) {
      setErrorMessage('Network error while starting checkout. Please retry.');
      return null;
    } finally {
      setProcessingAction(false);
    }
  };

  // Trigger: User chooses to generate Dynamic QR
  const handleOpenDynamicQrFlow = async () => {
    await createPaymentSession('demo_qr');
  };

  // Trigger: User selects a Payment App
  const handleSelectApp = async (appKey, directSimulate = false) => {
    setSelectedAppKey(appKey);
    const session = await createPaymentSession(appKey);
    if (session) {
      if (directSimulate) {
        await handleSimulateSuccess(session.id);
      } else {
        setIsAppModalOpen(true);
      }
    }
  };

  // Trigger: Partner Scanner successfully detects a standee
  const handlePartnerDetected = (partner) => {
    setSelectedPartnerId(partner.id);
    setScannedAlert(`Verified Partner Standee: ${partner.name}`);
    setTimeout(() => setScannedAlert(null), 4000);
  };

  // Simulate Success (supporting direct session ID or fallback)
  const handleSimulateSuccess = async (targetSessionOrId = null) => {
    let paymentId = null;
    if (typeof targetSessionOrId === 'string' && targetSessionOrId.startsWith('PAY-')) {
      paymentId = targetSessionOrId;
    } else if (targetSessionOrId && typeof targetSessionOrId === 'object' && targetSessionOrId.id) {
      paymentId = targetSessionOrId.id;
    } else {
      paymentId = activePayment?.id;
    }

    if (!paymentId) {
      const vpa = (typeof targetSessionOrId === 'string' && !targetSessionOrId.startsWith('PAY-')) ? targetSessionOrId : null;
      const newSession = await createPaymentSession(
        selectedMethodCategory === 'UPI_ID' ? 'demo_upi_id' : selectedAppKey || 'demo_paytm',
        vpa
      );
      if (!newSession) return;
      paymentId = newSession.id;
    }

    try {
      setProcessingAction(true);
      setErrorMessage(null);

      const res = await fetch(`/api/payments/${paymentId}/simulate-success`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();
      if (data.success && data.receipt) {
        setIsAppModalOpen(false);
        setPaymentReceipt(data.receipt);
        setPaymentState('SUCCESS');
      } else {
        setErrorMessage(data.error || 'Payment simulation failed');
      }
    } catch (err) {
      setErrorMessage('Simulation network error');
    } finally {
      setProcessingAction(false);
    }
  };

  // Auto-Pay trigger if coming with autoPay=true (e.g. from E-Vehicle Pay with Paytm)
  useEffect(() => {
    if (autoPayParam) {
      const appToUse = initialAppKey || 'demo_paytm';
      createPaymentSession(appToUse).then((session) => {
        if (session) {
          handleSimulateSuccess(session.id);
        }
      });
    }
  }, []);

  // Simulate Failure
  const handleSimulateFailure = async (reason = 'Simulated payment decline') => {
    let paymentId = activePayment?.id;

    if (!paymentId) {
      const newSession = await createPaymentSession('demo_qr');
      if (!newSession) return;
      paymentId = newSession.id;
    }

    try {
      setProcessingAction(true);
      const res = await fetch(`/api/payments/${paymentId}/simulate-fail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Simulated banking decline / card limit exceeded' })
      });

      const data = await res.json();
      setIsAppModalOpen(false);
      setFailureReason(data.payment?.failureReason || reason);
      setPaymentState('FAILED');
    } catch (err) {
      setIsAppModalOpen(false);
      setFailureReason('Simulated network failure');
      setPaymentState('FAILED');
    } finally {
      setProcessingAction(false);
    }
  };

  // Cancel & Return to Method Selection
  const handleCancelPayment = async () => {
    if (activePayment?.id) {
      try {
        await fetch(`/api/payments/${activePayment.id}/cancel`, { method: 'POST' });
      } catch {}
    }
    setIsAppModalOpen(false);
    setActivePayment(null);
    setPaymentState('IDLE');
  };

  const selectedPartner = partners.find((p) => p.id === selectedPartnerId) || partners[0];
  const originalAmount = Number(originalBill) || 0;
  const discountPercent = applyDiscount ? (calculation?.effectiveTotalDiscountPercent ?? calculation?.greenCoinDiscountPercent ?? 0) : 0;
  const discountSavings = applyDiscount ? (calculation?.discountAmount || 0) : 0;
  const finalPayable = applyDiscount ? (calculation?.finalPayable ?? originalAmount) : originalAmount;

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-6" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      {/* Top Breadcrumb & Demo Mode Watermark */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <Link
          to="/green-rewards"
          className="text-xs font-bold text-slate-500 hover:text-emerald-700 flex items-center space-x-1.5 transition-colors w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Green Rewards Hub</span>
        </Link>

        {/* Demo Mode Notice Banner */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-amber-100/90 text-amber-900 border border-amber-300 shadow-sm w-fit">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>DEMO PAYMENT MODE — No real money transferred</span>
        </div>
      </div>

      {/* Main Payment Container Card */}
      <div 
        className="rounded-3xl p-5 sm:p-8 bg-white border border-slate-200 shadow-2xl relative overflow-hidden"
        style={{ boxShadow: '0 20px 50px rgba(0, 0, 0, 0.08)' }}
      >
        {/* Tricolor Ribbon Header */}
        <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-orange-500 via-white to-emerald-600" />
        {/* Card Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md ${
              isEVehicle ? 'bg-emerald-600 text-white' : isArtisan ? 'bg-purple-700 text-white' : 'bg-slate-900 text-white'
            }`}>
              <CreditCard className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {isEVehicle ? 'E-Vehicle Transit Fare Settlement' : isArtisan ? 'Artisan Direct Fair Trade Payout' : 'Pay to Partner'}
                </h1>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                  isEVehicle 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                    : isArtisan 
                    ? 'bg-purple-100 text-purple-800 border-purple-300' 
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  {isEVehicle ? '⚡ Zero-Emission Transit' : isArtisan ? '🌿 Fair Trade' : 'Green Checkout'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {isEVehicle 
                  ? "Pay the driver's exact fare & earn +3 Green Coins automatically"
                  : isArtisan 
                  ? '100% fair trade direct transfer to master artisan'
                  : 'Scan partner standee or pay with verified Green Coin discount'}
              </p>
            </div>
          </div>

          <SafarLogo size="sm" showText={false} />
        </div>

        {/* Scanned Success Alert Banner */}
        {scannedAlert && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-black flex items-center space-x-2 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{scannedAlert}</span>
          </motion.div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="my-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* STATE 1: IDLE - Setup Partner, Bill & Choose Payment Method */}
        {/* ============================================================ */}
        {paymentState === 'IDLE' && (
          <div className="space-y-6 my-6">

            {/* Quick Action: Open Camera Scanner to Scan Counter QR */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center space-x-3 z-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shadow-inner">
                  <ScanLine className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight">
                    {isEVehicle ? "At the vehicle? Scan Driver's QR Standee" : "At the counter? Scan Partner's QR"}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {isEVehicle ? "Opens your camera to scan driver UPI QR on vehicle" : "Opens your phone camera to scan the partner's standee"}
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center space-x-2 shadow-lg transition-all shrink-0 cursor-pointer z-10"
              >
                <Camera className="w-4 h-4" />
                <span>Open Camera Scanner</span>
              </motion.button>
            </div>
            
            {/* 1. Destination / Partner / Vehicle Details */}
            {isEVehicle ? (
              <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-xs flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-2xl shadow-sm">
                    {vehicleTypeParam.toLowerCase().includes('cab') ? '⚡' : vehicleTypeParam.toLowerCase().includes('bus') ? '🚌' : '🛺'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Verified Eco Transit</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    </div>
                    <h3 className="text-base font-black text-slate-900">{vehicleTypeParam} Journey</h3>
                    <p className="text-xs text-slate-500">Pilot: Verified SAFAR Eco Pilot · Zero-Emission Transit</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Reward</span>
                  <span className="text-xs font-black text-emerald-800 bg-white px-3 py-1 rounded-full border border-emerald-200 inline-block shadow-2xs">
                    +3 Green Coins 🌱
                  </span>
                </div>
              </div>
            ) : isArtisan ? (
              <div className="p-4 rounded-3xl bg-purple-50 border border-purple-200 shadow-xs flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-300 flex items-center justify-center text-2xl shadow-sm">
                    🎨
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block">Master Artisan Direct Transfer</span>
                    <h3 className="text-base font-black text-slate-900">{partnerNameParam || 'Master Artisan Guild'}</h3>
                    <p className="text-xs text-slate-500">100% Direct Fair Trade Payout (Zero Middleman Commission)</p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-xs text-slate-700 block">
                    SAFAR Certified Partner Establishment
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Scan Standee</span>
                  </button>
                </div>

                <select
                  value={selectedPartnerId}
                  onChange={(e) => setSelectedPartnerId(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-slate-300 bg-white font-bold text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.location} · {p.type}) — Max Green Discount {p.maximumDiscount || 40}%
                    </option>
                  ))}
                </select>

                {/* Partner Address pill */}
                {selectedPartner && (
                  <p className="text-[11px] text-slate-500 mt-1 pl-1">
                    📍 {selectedPartner.address}
                  </p>
                )}
              </div>
            )}

            {/* 2. Bill / Fare Amount */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-xs text-slate-700">
                  {isEVehicle ? "Driver's Exact Fare (₹)" : "Original Bill Amount (₹)"}
                </label>
                <div className="flex items-center space-x-1.5">
                  {(isEVehicle ? [50, 100, 200, 600] : [500, 1000, 2500, 5000]).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setOriginalBill(preset)}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
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

            {/* E-VEHICLE DRIVER PROTECTION BANNER */}
            {isEVehicle && (
              <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 flex items-start space-x-3">
                <Leaf className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-emerald-900">🌱 Driver Fare Protection:</strong>
                    <span className="font-mono font-black text-emerald-700">+3 Coins Eco Incentive</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    The driver receives the full <strong>₹{originalBill}</strong> actual fare without any deduction. Green Coins are awarded directly to your SAFAR Green Wallet as an eco-incentive!
                  </p>
                </div>
              </div>
            )}

            {/* 3. Partner Special Discount (%) - Hidden for E-Vehicles and Artisans */}
            {!isEVehicle && !isArtisan && (
              <div>
                <label className="font-bold text-xs text-slate-700 block mb-1">
                  Partner Promotional / Special Discount (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={partnerSpecialDiscount}
                  onChange={(e) => setPartnerSpecialDiscount(Math.max(0, Number(e.target.value)))}
                  placeholder="0"
                  className="w-full p-3 rounded-2xl border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            )}

            {/* 4. Toggle Apply Discount - Hidden for E-Vehicles */}
            {!isEVehicle && !isArtisan && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="text-xs font-black text-slate-900 block">
                      Apply Green Coin Discount Tier
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Verified Wallet Balance: <strong>{calculation?.userCoins || 29} Green Coins</strong>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setApplyDiscount(!applyDiscount)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    applyDiscount
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {applyDiscount ? '✓ Applied' : 'Don\'t Apply'}
                </button>
              </div>
            )}

            {/* 5. Calculation / Fare Settlement Summary */}
            <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50/70 border border-emerald-200/90 space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60 font-mono text-[11px]">
                <span className="text-slate-600">{isEVehicle ? 'Transit Service:' : isArtisan ? 'Artisan:' : 'Partner:'}</span>
                <span className="font-bold text-slate-900 truncate max-w-[220px]">
                  {isEVehicle ? `SAFAR Eco-Transit (${vehicleTypeParam})` : isArtisan ? (partnerNameParam || 'Master Artisan Guild') : (calculation?.partnerName || selectedPartner?.name)}
                </span>
              </div>

              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-slate-600">{isEVehicle ? "Driver's Actual Fare:" : 'Original Bill:'}</span>
                <span className="font-black text-slate-900">₹{originalAmount.toLocaleString()}</span>
              </div>

              {isEVehicle ? (
                <>
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-slate-600">Driver Earnings Protected:</span>
                    <span className="font-black text-emerald-700">100% Full Fare</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-xs text-emerald-700">
                    <span className="font-bold">Eco Reward to Your Wallet:</span>
                    <span className="font-black">+3 Green Coins 🌱</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-slate-600">Your Green Coins:</span>
                    <span className="font-black text-emerald-700">{calculation?.userCoins || 29}</span>
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
                </>
              )}

              <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-sm sm:text-base font-mono">
                <span className="font-black text-slate-900">Final Amount Payable:</span>
                <span className="font-black text-emerald-800 text-lg sm:text-xl">
                  ₹{finalPayable.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Mandatory Protocol Alert */}
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 flex items-start space-x-2.5 text-[11px] text-blue-950 leading-relaxed">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>SAFAR Fair Tourism Protocol:</strong>
                <p className="mt-0.5 text-blue-800">
                  Maximum Green Coin Discount = <strong>40%</strong>. A purchase can <strong>never become completely free</strong>. Even with 100+ coins, tourist pays at least 60% of the bill.
                </p>
              </div>
            </div>

            {/* 6. Payment Method Category Tabs */}
            <div className="space-y-3 pt-2">
              <label className="font-bold text-xs text-slate-700 block">
                Choose how you want to pay
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 bg-slate-100 rounded-2xl">
                
                {/* TAB 1: Scan Partner QR (Camera Viewfinder) */}
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className={`py-3 px-2 rounded-xl text-xs font-black transition-all flex flex-col items-center space-y-1 ${
                    selectedMethodCategory === 'SCANNER'
                      ? 'bg-white text-slate-900 shadow-md ring-2 ring-emerald-500'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>Scan Standee</span>
                </button>

                {/* TAB 2: UPI / Payment App */}
                <button
                  type="button"
                  onClick={() => setSelectedMethodCategory('APPS')}
                  className={`py-3 px-2 rounded-xl text-xs font-black transition-all flex flex-col items-center space-y-1 ${
                    selectedMethodCategory === 'APPS'
                      ? 'bg-white text-slate-900 shadow-md ring-2 ring-emerald-500'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-indigo-600" />
                  <span>UPI App</span>
                </button>

                {/* TAB 3: Pay using UPI ID */}
                <button
                  type="button"
                  onClick={() => setSelectedMethodCategory('UPI_ID')}
                  className={`py-3 px-2 rounded-xl text-xs font-black transition-all flex flex-col items-center space-y-1 ${
                    selectedMethodCategory === 'UPI_ID'
                      ? 'bg-white text-slate-900 shadow-md ring-2 ring-emerald-500'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <AtSign className="w-4 h-4 text-violet-600" />
                  <span>Pay by UPI ID</span>
                </button>

                {/* TAB 4: Show Dynamic Scannable QR */}
                <button
                  type="button"
                  onClick={() => setSelectedMethodCategory('SHOW_QR')}
                  className={`py-3 px-2 rounded-xl text-xs font-black transition-all flex flex-col items-center space-y-1 ${
                    selectedMethodCategory === 'SHOW_QR'
                      ? 'bg-white text-slate-900 shadow-md ring-2 ring-emerald-500'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-slate-800" />
                  <span>Show My QR</span>
                </button>
              </div>

              {/* Sub-Panels based on selected Category */}

              {/* CATEGORY 1: Scan Partner QR Standee */}
              {selectedMethodCategory === 'SCANNER' && (
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                    <Camera className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Scan Counter QR Standee</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
                      Point your phone camera to scan the partner's UPI QR standee or tap below to launch viewfinder.
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={SPRING}
                    onClick={() => setIsScannerOpen(true)}
                    className="w-full py-4 rounded-2xl font-black text-sm text-white shadow-xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      boxShadow: '0 8px 30px rgba(16, 185, 129, 0.35)'
                    }}
                  >
                    <Camera className="w-5 h-5" />
                    <span>Launch Camera Scanner Viewfinder</span>
                  </motion.button>
                </div>
              )}

              {/* CATEGORY 2: Pay using UPI / Payment App */}
              {selectedMethodCategory === 'APPS' && (
                <div className="space-y-3 pt-1">
                  <p className="text-xs text-slate-500">Select an installed application to simulate checkout:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {Object.values(PAYMENT_APPS_CONFIG).map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => handleSelectApp(app.id)}
                        disabled={processingAction}
                        className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-md transition-all flex items-center space-x-3 text-left cursor-pointer group"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm shrink-0"
                          style={{ backgroundColor: app.bgColor }}
                        >
                          {app.iconEmoji}
                        </div>
                        <div className="overflow-hidden">
                          <span className="font-black text-xs text-slate-900 block truncate group-hover:text-emerald-700">
                            {app.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold block">
                            Demo Pay
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CATEGORY 3: Pay using UPI ID */}
              {selectedMethodCategory === 'UPI_ID' && (
                <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200">
                  <UPIIdInput
                    amount={finalPayable}
                    partnerName={selectedPartner?.name}
                    onSimulateSuccess={handleSimulateSuccess}
                    onSimulateFailure={handleSimulateFailure}
                    onCancel={() => setSelectedMethodCategory('SCANNER')}
                    loading={processingAction}
                  />
                </div>
              )}

              {/* CATEGORY 4: Show Dynamic Scannable QR (for merchant or desktop testing) */}
              {selectedMethodCategory === 'SHOW_QR' && (
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-sm">
                    <QrCode className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Show My Payment QR Pass</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
                      Generates a dynamic settlement QR on your screen for the merchant to scan.
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={SPRING}
                    onClick={handleOpenDynamicQrFlow}
                    disabled={processingAction || loadingCalculation}
                    className="w-full py-4 rounded-2xl font-black text-sm text-white shadow-xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                      boxShadow: '0 8px 30px rgba(15, 23, 42, 0.3)'
                    }}
                  >
                    {processingAction ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <QrCode className="w-5 h-5 text-emerald-400" />
                        <span>Generate Scannable QR (₹{finalPayable.toLocaleString()})</span>
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STATE 2: PENDING - Displaying QR Code & Simulation Controls */}
        {/* ============================================================ */}
        {paymentState === 'PENDING' && (
          <div className="my-6">
            <PaymentQR
              mode={paymentConfig.mode}
              amount={activePayment?.finalAmount || finalPayable}
              payment={activePayment}
              qrData={activePayment?.qrPayload}
              onSimulateSuccess={() => handleSimulateSuccess()}
              onSimulateFailure={() => handleSimulateFailure()}
              onCancel={handleCancelPayment}
              loading={processingAction}
            />
          </div>
        )}

        {/* ============================================================ */}
        {/* STATE 3: SUCCESS - Official Settlement Receipt Screen */}
        {/* ============================================================ */}
        {paymentState === 'SUCCESS' && paymentReceipt && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="my-6 space-y-5 text-center"
          >
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-sm mb-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                <span>DEMO PAYMENT — No real money was transferred</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">Payment Successful!</h2>
              <div className="text-3xl font-black text-emerald-700 font-mono mt-1">
                ₹{paymentReceipt.finalAmountPaid.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Settled with <strong>{paymentReceipt.partnerName}</strong>
              </p>

              {paymentReceipt.isEVehicle && (
                <div className="mt-3 p-3 rounded-2xl bg-emerald-100/80 border border-emerald-300 inline-block text-xs font-black text-emerald-900 shadow-xs">
                  🌱 +{paymentReceipt.coinsAwarded || 3} Green Coins Auto-Credited to your SAFAR Wallet!
                  {paymentReceipt.isMilestoneReached && (
                    <div className="text-amber-800 font-extrabold text-[11px] mt-0.5">
                      🎉 10th Weekly Trip Milestone Reached! +2 Bonus Coins Credited!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Receipt Details Card */}
            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 text-xs space-y-2.5 font-mono text-left max-w-md mx-auto">
              <div className="flex justify-between pb-1 border-b border-slate-200">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-bold text-slate-800">{paymentReceipt.transactionId || paymentReceipt.paymentId}</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-200">
                <span className="text-slate-500">Auth Code:</span>
                <span className="font-bold text-blue-700">{paymentReceipt.authorizationCode}</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-200">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-bold text-slate-800 uppercase">{paymentReceipt.paymentMethod || 'UPI / QR'}</span>
              </div>

              {paymentReceipt.isEVehicle ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transit Mode:</span>
                    <span className="text-slate-800 font-bold">{paymentReceipt.vehicleType || vehicleTypeParam || 'E-Rickshaw'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Original Bill:</span>
                    <span className="text-slate-800 font-bold">₹{paymentReceipt.originalBill || paymentReceipt.finalAmountPaid}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Green Reward Earned:</span>
                    <span className="font-black">+{paymentReceipt.coinsAwarded || 3} Green Coins 🌱</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Driver Payout (100% Full Fare):</span>
                    <span className="font-black">₹{paymentReceipt.finalAmountPaid} (No deduction)</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Original Bill:</span>
                    <span className="text-slate-800 font-bold">₹{paymentReceipt.originalBill}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Green Discount ({paymentReceipt.discountPercent}%):</span>
                    <span className="font-black">-₹{paymentReceipt.discountSavings}</span>
                  </div>
                </>
              )}

              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                <span>Total Amount Paid:</span>
                <span className="text-emerald-800 font-mono">₹{paymentReceipt.finalAmountPaid}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                <span>Gateway Status:</span>
                <span className="text-emerald-600 font-bold">SETTLED (DEMO)</span>
              </div>
            </div>

            {/* Navigation & Actions */}
            <div className="space-y-2.5 max-w-md mx-auto pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-3 rounded-2xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download / Print Official Receipt</span>
              </button>

              {paymentReceipt.isEVehicle && (
                <button
                  type="button"
                  onClick={() => navigate('/e-vehicles')}
                  className="w-full py-3 rounded-2xl font-bold text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-900 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-emerald-700" />
                  <span>Return to E-Vehicles Transit Hub</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => navigate('/green-rewards?tab=history')}
                className="w-full py-3.5 rounded-2xl font-black text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <span>View in Reward & Transaction History</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentReceipt(null);
                  setActivePayment(null);
                  setPaymentState('IDLE');
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Make Another Payment
              </button>
            </div>
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* STATE 4: FAILED - Failure / Decline Screen */}
        {/* ============================================================ */}
        {paymentState === 'FAILED' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="my-6 space-y-5 text-center max-w-md mx-auto"
          >
            <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-lg">
              <XCircle className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-sm mb-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                <span>DEMO PAYMENT — No real money was transferred</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">Payment Failed</h2>
              <p className="text-xs text-slate-500 mt-1">
                Your payment could not be completed at this time.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-left text-xs text-rose-900 space-y-1">
              <span className="font-bold block">Decline Reason:</span>
              <p className="font-mono text-xs">{failureReason || 'Simulated banking decline or payment timeout.'}</p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentState('IDLE');
                  setActivePayment(null);
                  setFailureReason(null);
                }}
                className="w-full py-3.5 rounded-2xl font-black text-xs text-white bg-slate-900 hover:bg-slate-800 shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>

              <Link
                to="/green-rewards"
                className="block w-full py-3 rounded-2xl font-bold text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors text-center"
              >
                Back to Green Coins Hub
              </Link>
            </div>
          </motion.div>
        )}

      </div>

      {/* Live Camera Scanner Viewfinder Modal for Partner QR Standees */}
      <PartnerQRScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onPartnerDetected={handlePartnerDetected}
        partners={partners}
      />

      {/* Payment App Modal Sheet */}
      <PaymentAppModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
        appKey={selectedAppKey}
        amount={finalPayable}
        partnerName={
          isEVehicle
            ? `SAFAR Eco-Transit (${vehicleTypeParam})`
            : isArtisan
            ? (partnerNameParam || 'Master Artisan Guild')
            : selectedPartner?.name
        }
        onSimulateSuccess={() => handleSimulateSuccess(activePayment?.id)}
        onSimulateFailure={handleSimulateFailure}
        loading={processingAction}
      />
    </div>
  );
}
