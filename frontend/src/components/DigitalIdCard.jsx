import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, CheckCircle2, QrCode, ExternalLink, Hash, Calendar, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DigitalIdCard({ digitalId, tourist }) {
  if (!digitalId && !tourist) return null;

  const name = digitalId?.fullName || tourist?.fullName || 'Rohan Verma';
  const idStr = digitalId?.touristId || tourist?.touristId || 'TID-1024';
  const status = digitalId?.verificationStatus || 'VERIFIED';
  const hash = digitalId?.digitalIdHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const qrUrl = digitalId?.qrCodeData || `https://safetour.gov.in/verify-id/${idStr}`;
  const validity = `${tourist?.travelStartDate || '2026-08-10'} to ${tourist?.travelEndDate || '2026-08-20'}`;

  return (
    <div className="relative rounded-2xl overflow-hidden bg-white/95 border border-emerald-200/80 p-6 shadow-xl space-y-6 backdrop-blur-xl">
      {/* Indian Tricolor Header Strip */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-white to-emerald-600" />
      
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 pt-1">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-gray-900 tracking-wider uppercase block">
              Digital Tourist ID
            </span>
            <span className="text-[10px] text-emerald-700 font-mono font-semibold">
              Prototype Blockchain Ledger Verified
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider">{status}</span>
        </div>
      </div>

      {/* Main Content: ID Details + QR Code */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        
        {/* Left Column: Personal Metadata */}
        <div className="sm:col-span-2 space-y-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Tourist Name</span>
            <h3 className="text-xl font-extrabold text-gray-900">{name}</h3>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Unique Tourist ID</span>
              <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 inline-block shadow-sm">
                {idStr}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500 block">ID Proof Verified</span>
              <span className="font-semibold text-gray-800">{tourist?.idProofType || 'Aadhaar Card'}</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-gray-700">
            <div className="flex items-center space-x-2">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Validity: <strong className="text-gray-900">{validity}</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Emergency: <strong className="text-gray-900">{tourist?.emergencyContact?.phone || '+91 98765 43210'}</strong> ({tourist?.emergencyContact?.name || 'Contact'})</span>
            </div>
          </div>
        </div>

        {/* Right Column: QR Code */}
        <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-gray-200 shadow-md space-y-2">
          <QRCodeSVG value={qrUrl} size={110} bgColor="#ffffff" fgColor="#0f172a" level="H" />
          <span className="text-[9px] font-mono text-gray-500 text-center font-bold">Scan to Verify Authenticity</span>
        </div>
      </div>

      {/* Cryptographic Ledger Footer */}
      <div className="pt-3 border-t border-gray-100 space-y-2.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
          <div className="flex items-center space-x-1 truncate max-w-[240px] sm:max-w-[340px]">
            <Hash className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate">Hash: {hash}</span>
          </div>
          <span className="text-emerald-700 font-bold shrink-0 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Block #{digitalId?.blockIndex || 1}</span>
        </div>

        {/* Verification Link Button */}
        <Link
          to={`/verify-id/${idStr}`}
          className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center space-x-2 border border-emerald-200 shadow-sm"
        >
          <span>Verify Digital ID on Ledger</span>
          <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
        </Link>
      </div>
    </div>
  );
}
