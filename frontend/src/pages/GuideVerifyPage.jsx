import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, CheckCircle2, AlertTriangle, ArrowLeft, RefreshCw, Hash, Calendar, Phone } from 'lucide-react';
import GuideDigitalIdCard from '../components/GuideDigitalIdCard';
import SafarLogo from '../components/SafarLogo';

export default function GuideVerifyPage() {
  const { guideId } = useParams();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGuide();
  }, [guideId]);

  const fetchGuide = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/guides/${guideId}`);
      const data = await res.json();

      if (data.success && data.guide) {
        setGuide(data.guide);
      } else {
        setError(data.error || 'Guide not found in official registry');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-6" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
      <div className="w-full max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-xs font-bold text-gray-500 hover:text-gray-900 flex items-center space-x-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to S.A.F.A.R. Portal</span>
          </Link>
          <SafarLogo size="sm" showText={false} />
        </div>

        {loading ? (
          <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3 shadow-lg">
            <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
            <p className="text-sm font-bold text-gray-600">Verifying Guide Credentials against Blockchain Ledger...</p>
          </div>
        ) : error || !guide ? (
          <div className="p-8 bg-white rounded-3xl border border-red-200 text-center space-y-3 shadow-xl">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-gray-900">Guide Verification Alert</h2>
            <p className="text-xs text-red-600 font-bold">{error || 'Guide ID not found in Ministry of Tourism registry.'}</p>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Please verify the QR code or request the guide to show their physical S.A.F.A.R. badge.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs text-emerald-900 shadow-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-bold">
                  Official Verification Confirmed: <strong>{guide.fullName}</strong> ({guide.guideId}) is a certified Ministry of Tourism guide.
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                ACTIVE
              </span>
            </div>

            <GuideDigitalIdCard guide={guide} />
          </div>
        )}
      </div>
    </div>
  );
}
