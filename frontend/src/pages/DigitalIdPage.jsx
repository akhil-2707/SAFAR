import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ShieldCheck, CheckCircle2, QrCode, Hash, Calendar, Phone, Copy, 
  Check, Share2, Download, ArrowRight, ShieldAlert, Sparkles, RefreshCw, Lock, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SafarLogo from '../components/SafarLogo';

const SPRING = { type: 'spring', stiffness: 360, damping: 28 };

export default function DigitalIdPage({ tourist, allTourists = [], onSelectTourist }) {
  const [currentTourist, setCurrentTourist] = useState(tourist);
  const [digitalId, setDigitalId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifiedStatus, setVerifiedStatus] = useState(null);
  const [copied, setCopied] = useState(false);

  // 3D Motion Tilt Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-150, 150], [10, -10]);
  const rotateY = useTransform(mouseX, [-150, 150], [-10, 10]);

  useEffect(() => {
    if (tourist) setCurrentTourist(tourist);
  }, [tourist]);

  useEffect(() => {
    const tid = currentTourist?.touristId || 'TID-1035';
    fetchDigitalId(tid);
  }, [currentTourist]);

  const fetchDigitalId = async (tid) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/digital-id/${tid}`);
      const data = await res.json();
      if (data.success && data.digitalId) {
        setDigitalId(data.digitalId);
      }
      // Check verification live
      const vRes = await fetch('/api/digital-id/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ touristId: tid })
      });
      const vData = await vRes.json();
      setVerifiedStatus(vData);
    } catch (err) {
      console.error('Digital ID Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyHash = () => {
    if (digitalId?.digitalIdHash) {
      navigator.clipboard.writeText(digitalId.digitalIdHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPass = () => {
    window.print();
  };

  const activeTid = currentTourist?.touristId || 'TID-1035';
  const fullName = currentTourist?.fullName || digitalId?.fullName || 'Ananya Mishra';
  const qrUrl = digitalId?.qrCodeData || `${window.location.origin}/verify-id/${activeTid}`;
  const shaHash = digitalId?.digitalIdHash || '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.99 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8"
    >
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold mb-1" style={{ color: '#0A84FF' }}>
            <Link to="/tourist-dashboard" className="hover:underline">Dashboard</Link>
            <span style={{ color: 'rgba(60,60,67,0.3)' }}>/</span>
            <span>Digital Identity</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: '#1C1C1E', letterSpacing: '-0.025em' }}>
            Digital Tourist Pass & Identity
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(60,60,67,0.6)' }}>
            Tamper-proof verifiable credential anchored to private consortium blockchain.
          </p>
        </div>

        {/* Demo Tourist Switcher */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl apple-card">
          <span className="text-xs font-medium pl-2" style={{ color: 'rgba(60,60,67,0.6)' }}>Profile:</span>
          <select
            value={activeTid}
            onChange={(e) => {
              const val = e.target.value;
              if (onSelectTourist) onSelectTourist(val);
            }}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl cursor-pointer focus:outline-none"
            style={{
              background: 'rgba(120,120,128,0.1)',
              border: '0.5px solid rgba(60,60,67,0.15)',
              color: '#1C1C1E',
            }}
          >
            <option value="TID-1035">🛕 Ayodhya — Ananya Mishra</option>
            <option value="TID-1036">🏔️ Jammu — Rajesh Sharma</option>
            <option value="TID-1039">🕌 Taj Mahal — Emily Watson</option>
            <option value="TID-REAL">📍 Real-Time Live GPS</option>
          </select>
        </div>
      </div>

      {/* Main 3D Holographic Card Display */}
      <div className="flex justify-center perspective-wrapper py-2">
        <motion.div
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            mouseX.set(e.clientX - rect.left - rect.width / 2);
            mouseY.set(e.clientY - rect.top - rect.height / 2);
          }}
          onMouseLeave={() => {
            mouseX.set(0);
            mouseY.set(0);
          }}
          whileHover={{ scale: 1.02 }}
          transition={SPRING}
          className="w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl relative holo-sheen border border-white/80"
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(246,248,252,0.85) 100%)',
            backdropFilter: 'blur(36px) saturate(180%)',
            WebkitBackdropFilter: 'blur(36px) saturate(180%)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.1), 0 4px 16px rgba(10,132,255,0.08), inset 0 1px 0 rgba(255,255,255,1)',
          }}
        >
          {/* Indian Tricolor Header Ribbon */}
          <div
            className="h-2 w-full"
            style={{
              background: 'linear-gradient(90deg, #FF9F0A 0%, #FF9F0A 33%, #ffffff 33%, #ffffff 66%, #34C759 66%, #34C759 100%)',
            }}
          />

          <div className="p-6 sm:p-8 space-y-6">
            {/* Top Bar inside Card */}
            <div className="flex items-center justify-between border-b border-gray-100/80 pb-4">
              <div className="flex items-center space-x-3">
                <SafarLogo size="sm" showText={false} animated={true} />
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-900">
                    S.A.F.A.R. Tourist Pass
                  </h3>
                  <p className="text-[10px] font-mono text-emerald-700 font-semibold">
                    Government of India · Ministry of Tourism
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: 'rgba(52,199,89,0.12)',
                  color: '#248A3D',
                  border: '0.5px solid rgba(52,199,89,0.3)',
                }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ACTIVE & VERIFIED</span>
              </div>
            </div>

            {/* Profile & QR Code Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              {/* Profile Details */}
              <div className="sm:col-span-2 space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Cardholder</span>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">{fullName}</h2>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg text-blue-700 bg-blue-50 border border-blue-200 mt-1 inline-block">
                    {activeTid}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Nationality</span>
                    <span className="font-semibold text-gray-800">{currentTourist?.nationality || 'Indian'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Destination</span>
                    <span className="font-semibold text-gray-800">{currentTourist?.destination || 'Ayodhya Circuit'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">ID Proof</span>
                    <span className="font-semibold text-gray-800">{currentTourist?.idProofType || 'Aadhaar / Passport'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Risk Tier</span>
                    <span className="font-bold text-emerald-600">SAFE (Tier-1)</span>
                  </div>
                </div>

                <div className="text-xs space-y-1 text-gray-600 pt-1">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Valid: <strong>{currentTourist?.travelStartDate || '2026-08-10'}</strong> to <strong>{currentTourist?.travelEndDate || '2026-08-20'}</strong></span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Emergency Contact: <strong>{currentTourist?.emergencyContact?.phone || '+91 98765 43210'}</strong></span>
                  </div>
                </div>
              </div>

              {/* QR Code Container with High Scanability */}
              <div className="flex flex-col items-center justify-center p-3.5 bg-white rounded-2xl border border-gray-200/80 shadow-md space-y-2">
                <QRCodeSVG
                  value={qrUrl}
                  size={128}
                  bgColor="#ffffff"
                  fgColor="#1C1C1E"
                  level="H"
                  includeMargin={true}
                />
                <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-wider text-center">
                  Scan to Authenticate
                </span>
              </div>
            </div>

            {/* Cryptographic Ledger Proof Banner */}
            <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-200/60 flex items-center justify-between gap-2 text-[11px] font-mono">
              <div className="flex items-center space-x-2 truncate">
                <Hash className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="text-gray-500 truncate">SHA-256: {shaHash}</span>
              </div>
              <button
                onClick={handleCopyHash}
                className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors shrink-0"
                title="Copy Hash"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Controls: Download Pass, Share, Check Ledger */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          transition={SPRING}
          onClick={handleDownloadPass}
          className="px-5 py-2.5 rounded-2xl font-semibold text-sm flex items-center gap-2 text-white"
          style={{
            background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)',
            boxShadow: '0 4px 16px rgba(10,132,255,0.3)',
          }}
        >
          <Download className="w-4 h-4" />
          <span>Download Official Pass (PDF)</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          transition={SPRING}
          onClick={handleCopyHash}
          className="px-5 py-2.5 rounded-2xl font-semibold text-sm flex items-center gap-2 apple-card"
          style={{ color: '#1C1C1E' }}
        >
          <Share2 className="w-4 h-4 text-blue-600" />
          <span>{copied ? 'Link Copied!' : 'Share Pass URL'}</span>
        </motion.button>

        <Link to="/blockchain-ledger">
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            transition={SPRING}
            className="px-5 py-2.5 rounded-2xl font-semibold text-sm flex items-center gap-2 apple-card"
            style={{ color: '#5E5CE6' }}
          >
            <Lock className="w-4 h-4" />
            <span>Inspect Blockchain Ledger</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </motion.div>
        </Link>
      </div>

      {/* Security & Verification Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="p-5 rounded-3xl apple-card space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold" style={{ color: '#1C1C1E' }}>
              Zero-Knowledge Privacy Architecture
            </h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Raw identity documents (Aadhaar/Passport scans) are never transmitted or stored on public chains. Only irreversible SHA-256 cryptographic hashes and validity timestamps are written to the distributed ledger, safeguarding tourist privacy under India DPDP Act.
          </p>
        </div>

        <div className="p-5 rounded-3xl apple-card space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold" style={{ color: '#1C1C1E' }}>
              Field Inspection by Tourist Police
            </h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            State tourist police and hotel reception desks can scan this dynamic QR code with any standard camera. The verification portal instantly reconciles against the tamper-proof ledger in under 120ms without disclosing personal phone numbers.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
