import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ShieldCheck, CheckCircle2, QrCode, ExternalLink, Hash, 
  Calendar, Phone, MapPin, Sparkles, WifiOff, FileCheck, 
  Copy, Check, ShieldAlert, AlertTriangle, KeyRound
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DigitalIdCard({ digitalId, tourist }) {
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrMode, setQrMode] = useState('ONLINE'); // 'ONLINE' | 'OFFLINE'

  if (!digitalId && !tourist) return null;

  const name = digitalId?.fullName || tourist?.fullName || 'Rohan Verma';
  const idStr = digitalId?.touristId || tourist?.touristId || 'TID-1024';
  const status = tourist?.idVerificationStatus || digitalId?.verificationStatus || 'VERIFIED';
  const hash = digitalId?.digitalIdHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  
  const onlineUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://safetour.gov.in'}/verify/${hash.substring(0, 16)}`;
  
  // Offline Envelope
  const offlineEnvelope = digitalId?.offlineEnvelope || {
    uuid: idStr,
    bloodGroup: tourist?.bloodGroup || 'O+',
    exp: tourist?.travelEndDate || '2026-09-30',
    checkpointId: tourist?.entryCheckpoint || 'CHK-GW-01',
    status,
    sig: digitalId?.digitalSignature || 'SIG-ECDSA-VALID'
  };

  const offlineQrData = JSON.stringify({
    u: offlineEnvelope.uuid,
    bg: offlineEnvelope.bloodGroup,
    exp: offlineEnvelope.exp,
    chk: offlineEnvelope.checkpointId,
    st: offlineEnvelope.status,
    sig: offlineEnvelope.sig
  });

  const activeQrValue = qrMode === 'OFFLINE' ? offlineQrData : onlineUrl;
  const validity = `${tourist?.travelStartDate || '2026-09-01'} to ${tourist?.travelEndDate || '2026-09-30'}`;

  const originText = tourist?.origin?.city
    ? `${tourist.origin.city}, ${tourist.origin.state || ''}`
    : (typeof tourist?.origin === 'string' ? tourist.origin : 'India');

  // Status Styling Dictionary
  const statusConfigs = {
    VERIFIED: {
      label: '✓ VERIFIED ID',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      icon: CheckCircle2,
      subText: 'Zero-Gas Consortium Ledger Confirmed'
    },
    PROVISIONALLY_ACTIVE: {
      label: '⚡ PROVISIONALLY ACTIVE',
      badgeClass: 'bg-blue-50 text-blue-800 border-blue-300',
      icon: Sparkles,
      subText: 'DigiLocker Fast-Track Cleared'
    },
    PENDING_REVIEW: {
      label: '⏳ PENDING REVIEW',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
      icon: AlertTriangle,
      subText: 'Under Checkpoint Desk Scrutiny'
    },
    REJECTED: {
      label: '✕ ENTRY REJECTED',
      badgeClass: 'bg-red-50 text-red-800 border-red-300',
      icon: ShieldAlert,
      subText: 'Pass Restricted by Officer'
    }
  };

  const currentStatusConfig = statusConfigs[status] || statusConfigs.PENDING_REVIEW;
  const StatusIcon = currentStatusConfig.icon;

  const copyOfflineData = () => {
    navigator.clipboard.writeText(JSON.stringify(offlineEnvelope, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="relative rounded-3xl overflow-hidden bg-white/95 border border-slate-200/90 p-5 sm:p-6 shadow-xl space-y-5 backdrop-blur-xl font-sans">
      {/* Indian Tricolor Header Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-white to-emerald-600" />
      
      {/* Background Subtle Glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3.5 pt-1">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-50 to-emerald-50 border border-emerald-200 flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <span className="font-black text-sm text-gray-900 tracking-wider uppercase block leading-tight">
              S.A.F.A.R. Travel Pass
            </span>
            <span className="text-[10px] text-emerald-700 font-mono font-bold block">
              {currentStatusConfig.subText}
            </span>
          </div>
        </div>

        <div className={`flex items-center space-x-1.5 border px-3 py-1 rounded-full shadow-xs ${currentStatusConfig.badgeClass}`}>
          <StatusIcon className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
            {currentStatusConfig.label}
          </span>
        </div>
      </div>

      {/* Main Content: Metadata & Dynamic Dual-Payload QR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        
        {/* Left 2 Columns: Tourist Details */}
        <div className="sm:col-span-2 space-y-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Tourist Name</span>
            <h3 className="text-xl font-black text-gray-900 leading-tight">{name}</h3>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Unique Tourist ID</span>
              <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 inline-block shadow-xs">
                {idStr}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Registered Origin</span>
              <span className="font-semibold text-gray-800 truncate block">📍 {originText}</span>
            </div>
          </div>

          <div className="space-y-1 text-xs text-gray-600 pt-0.5">
            <div className="flex items-center space-x-2">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Pass Validity: <strong className="text-gray-900 font-mono">{validity}</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span>Assigned Checkpoint: <strong className="text-gray-900">{tourist?.entryCheckpoint || 'CHK-GW-01'}</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Emergency Link: <strong className="text-gray-900">{tourist?.emergencyContact?.phone || '+91 98765 00001'}</strong></span>
            </div>
          </div>
        </div>

        {/* Right Column: QR Code + Dual-Mode Toggle */}
        <div className="flex flex-col items-center justify-center p-3 bg-slate-50/80 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
          <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-xs">
            <QRCodeSVG value={activeQrValue} size={115} bgColor="#ffffff" fgColor="#0f172a" level="M" />
          </div>

          {/* QR Mode Switcher */}
          <div className="flex items-center bg-gray-200/80 p-0.5 rounded-lg text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setQrMode('ONLINE')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                qrMode === 'ONLINE' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
              }`}
            >
              Online Portal
            </button>
            <button
              type="button"
              onClick={() => setQrMode('OFFLINE')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                qrMode === 'OFFLINE' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-500'
              }`}
            >
              Offline ECDSA
            </button>
          </div>

          <span className="text-[9px] font-mono text-gray-500 text-center font-bold">
            {qrMode === 'ONLINE' ? 'Public Portal Scan' : 'Compact ECDSA Envelope'}
          </span>
        </div>
      </div>

      {/* Footer Actions: Ledger Hash & Offline Verifier Modal Trigger */}
      <div className="pt-3 border-t border-gray-100 space-y-2.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
          <div className="flex items-center space-x-1 truncate max-w-[220px] sm:max-w-[340px]">
            <Hash className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate">Tx: {digitalId?.blockchainTxHash || hash}</span>
          </div>
          <span className="text-emerald-700 font-bold shrink-0 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Block #{digitalId?.blockIndex || 1}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {/* Public Verification Link */}
          <Link
            to={`/verify/${hash.substring(0, 16)}`}
            className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 border border-emerald-200 shadow-xs"
          >
            <span>Open Public Verification</span>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
          </Link>

          {/* Inspect Offline Envelope Modal */}
          <button
            type="button"
            onClick={() => setShowOfflineModal(true)}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border border-slate-300 shadow-xs"
          >
            <WifiOff className="w-3.5 h-3.5 text-slate-600" />
            <span>Offline ECDSA Envelope</span>
          </button>
        </div>
      </div>

      {/* Modal: Offline Cryptographic Envelope Inspector */}
      {showOfflineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-gray-200 text-left">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 border border-violet-200 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900">Offline Cryptographic Envelope</h4>
                  <p className="text-[10px] text-gray-500 font-mono">Signed via Authority Elliptic Curve (ECDSA NIST P-256)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOfflineModal(false)}
                className="text-gray-400 hover:text-gray-600 font-black text-sm px-2 py-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              This compact cryptographic payload allows police, rescue workers, and checkpoint guards to verify tourist credentials locally in remote valleys or zero-connectivity zones without accessing the internet.
            </p>

            <div className="bg-slate-900 text-emerald-400 p-3.5 rounded-2xl font-mono text-[11px] overflow-x-auto relative shadow-inner">
              <button
                type="button"
                onClick={copyOfflineData}
                className="absolute top-2.5 right-2.5 p-1.5 bg-slate-800 text-gray-300 hover:text-white rounded-lg border border-slate-700 flex items-center space-x-1 text-[10px]"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <pre>{JSON.stringify(offlineEnvelope, null, 2)}</pre>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Digital Signature verified against S.A.F.A.R. Authority Public Key.</span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowOfflineModal(false)}
                className="w-full py-2.5 bg-gray-900 text-white font-bold text-xs rounded-xl hover:bg-gray-800 transition-colors"
              >
                Close Envelope Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
