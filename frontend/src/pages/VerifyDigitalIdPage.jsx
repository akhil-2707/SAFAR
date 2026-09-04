import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MiniMap from '../components/MiniMap';
import { ShieldCheck, CheckCircle2, AlertTriangle, Hash, Calendar, FileCode, Lock, Globe } from 'lucide-react';

export default function VerifyDigitalIdPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVerification();
  }, [id]);

  const fetchVerification = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/digital-id/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ touristId: id || 'TID-1024' })
      });
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError('Failed to fetch verification status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center text-slate-400">
        Verifying Digital Tourist ID against Prototype Blockchain Ledger...
      </div>
    );
  }

  const isValid = data?.verified;
  const digitalId = data?.digitalId;
  const tourist = data?.tourist;
  const audit = data?.blockchainAudit;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      
      {/* Verification Card */}
      <div className={`bg-navy-900 border-2 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 ${
        isValid ? 'border-emerald-500/40 glow-green' : 'border-red-500/40 glow-red'
      }`}>
        
        {/* Banner Header */}
        <div className="text-center space-y-2 border-b border-slate-800 pb-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border ${
            isValid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {isValid ? <CheckCircle2 className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
          </div>

          <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${
            isValid ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'
          }`}>
            {isValid ? '✓ DIGITAL ID VALID & VERIFIED' : '✗ TAMPERING DETECTED / INVALID'}
          </span>

          <h2 className="text-2xl font-black text-white">{tourist?.fullName || digitalId?.fullName || 'Rohan Verma'}</h2>
          <p className="text-xs font-mono font-bold text-emerald-400">Tourist ID: {digitalId?.touristId || id}</p>
        </div>

        {/* Embedded Location MiniMap */}
        <MiniMap
          center={{ lat: 26.1445, lng: 91.7362 }}
          title="Last Verified Location Preview"
          height="140px"
        />

        {/* Prototype Blockchain Ledger Badge Disclaimer */}
        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs text-slate-300 flex items-start space-x-2">
          <Globe className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block">Prototype Blockchain Ledger Audit Proof</span>
            <p className="text-[11px] text-slate-400">
              Verified using private cryptographic SHA-256 block ledger consensus. Privacy preserved by storing zero raw personal documents on public chain.
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Issuer Authority</span>
            <span className="font-bold text-slate-200 block">S.A.F.A.R. National Tourism Safety Authority</span>
          </div>

          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Nationality & Destination</span>
            <span className="font-semibold text-slate-200 block">{tourist?.nationality || 'Indian'} ({tourist?.destination || 'North East Circuit'})</span>
          </div>

          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Travel Validity Period</span>
            <span className="font-semibold text-slate-200 block">{tourist?.travelValidity || digitalId?.expiryDate || '2026-08-10 to 2026-08-20'}</span>
          </div>

          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Ledger Block Index</span>
            <span className="font-mono font-bold text-emerald-400 block">Block #{audit?.blockIndex || digitalId?.blockIndex || 1}</span>
          </div>
        </div>

        {/* Cryptographic Hashes */}
        <div className="space-y-2 pt-2 border-t border-slate-800 font-mono text-[11px]">
          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Verification Hash (SHA-256)</span>
            <span className="text-emerald-400 break-all">{digitalId?.digitalIdHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}</span>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Blockchain Tx Hash Reference</span>
            <span className="text-cyan-400 break-all">{digitalId?.blockchainTxHash || audit?.verificationHash || '0000a4b8f9e12c4d98e7f12a34b56c78'}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
