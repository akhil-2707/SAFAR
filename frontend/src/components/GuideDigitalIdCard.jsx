import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ShieldCheck, CheckCircle2, Award, Calendar, Phone, MapPin, 
  Languages, Star, Hash, ExternalLink, Shield, Sparkles 
} from 'lucide-react';

export default function GuideDigitalIdCard({ guide }) {
  if (!guide) return null;

  const name = guide.fullName || 'Verified Local Guide';
  const guideId = guide.guideId || 'GID-2026';
  const status = guide.status || 'VERIFIED';
  const city = guide.city || 'India';
  const languages = guide.languages || ['Hindi', 'English'];
  const rating = guide.rating || 4.9;
  const reviews = guide.totalReviews || 0;
  const tours = guide.toursCompleted || 0;
  const digitalId = guide.digitalId;

  const hash = digitalId?.digitalIdHash || '7a9f8c02b1e4569d8a34bc98e721ef65d8a9012bcfe89410ef32490ab8124cd1';
  const issuedAt = digitalId?.issuedAt 
    ? new Date(digitalId.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '15 Jan 2026';
  const expiryDate = digitalId?.expiryDate || '15 Jan 2028';
  const qrUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/guide/verify/${guideId}?hash=${hash.substring(0, 16)}`
    : `https://safetour.gov.in/guide/verify/${guideId}?hash=${hash.substring(0, 16)}`;

  return (
    <div className="relative rounded-3xl overflow-hidden bg-white/95 border-2 border-amber-300/80 p-6 sm:p-7 shadow-2xl space-y-6 backdrop-blur-2xl text-gray-900"
      style={{
        boxShadow: '0 20px 60px rgba(245, 158, 11, 0.15), 0 4px 20px rgba(16, 185, 129, 0.1)',
        fontFamily: "'Space Grotesk', 'Inter', sans-serif"
      }}>
      
      {/* Top Tricolor Strip */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-white to-emerald-600" />
      
      {/* Ambient background gold aura */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-60 h-60 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with National Emblems & Verification Tag */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 pt-1">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md text-white">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-sm tracking-wider uppercase text-gray-900">
                Official Digital Guide ID
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-black bg-amber-100 text-amber-800 border border-amber-300">
                Govt. Certified
              </span>
            </div>
            <span className="text-[10px] text-emerald-700 font-mono font-bold block">
              Ministry of Tourism • S.A.F.A.R. Verified
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-black text-emerald-800 uppercase tracking-wider">
            {status}
          </span>
        </div>
      </div>

      {/* Card Body: Details & QR Code */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Left 2 Cols: Guide Bio, City, Experience & Credentials */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Authorized Local Guide
              </span>
              <span className="text-xs font-bold text-gray-500 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                <span>{city} Circuit</span>
              </span>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{name}</h3>
            <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{guide.bio || guide.specialization}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[9px] uppercase font-black text-gray-400 block tracking-wider">Unique Guide ID</span>
              <span className="font-mono font-bold text-orange-600 text-xs sm:text-sm">{guideId}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[9px] uppercase font-black text-gray-400 block tracking-wider">Rating & Reviews</span>
              <div className="flex items-center space-x-1 font-bold text-gray-800">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{rating > 0 ? rating.toFixed(1) : 'New'} ({reviews} reviews)</span>
              </div>
            </div>
          </div>

          {/* Languages & Specialization */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center space-x-2">
              <Languages className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="font-semibold text-gray-700">Languages:</span>
              <div className="flex flex-wrap gap-1">
                {languages.map((l, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-800 font-bold text-[10px] border border-orange-200">
                    {l}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="font-semibold text-gray-700">Direct Contact:</span>
              <span className="font-bold text-gray-900">{guide.phone || '+91 98000 00000'}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="font-semibold text-gray-700">Valid Till:</span>
              <span className="font-bold text-gray-900">{expiryDate} (Issued: {issuedAt})</span>
            </div>
          </div>
        </div>

        {/* Right Col: Verifiable QR Code & Security Hologram */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50/90 rounded-2xl border border-slate-200/90 space-y-2 text-center">
          <div className="p-2 bg-white rounded-xl shadow-md border border-gray-100">
            <QRCodeSVG value={qrUrl} size={118} level="M" includeMargin={false} />
          </div>
          <span className="text-[10px] font-mono font-bold text-gray-500 tracking-wider">
            Scan to Verify Credentials
          </span>
          <div className="flex items-center space-x-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3 h-3" />
            <span>Police Background Cleared</span>
          </div>
        </div>
      </div>

      {/* Footer: Blockchain Signature */}
      <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[10px] text-gray-500 font-mono gap-2">
        <div className="flex items-center space-x-1.5 truncate max-w-full">
          <Hash className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate">Ledger Hash: {hash.substring(0, 32)}...</span>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {tours} Tours Completed
          </span>
          <span className="text-gray-400">S.A.F.A.R. v2.4</span>
        </div>
      </div>
    </div>
  );
}
