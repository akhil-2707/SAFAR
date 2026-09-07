import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, CheckCircle2, AlertTriangle, MapPin, HeartPulse, 
  Phone, User, Calendar, Shield, Lock, ArrowLeft, ExternalLink, Globe
} from 'lucide-react';
import SafarLogo from '../components/SafarLogo';

export default function TouristVerifyPage() {
  const { touristId } = useParams();
  const [searchParams] = useSearchParams();
  const hash = searchParams.get('hash');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVerification();
  }, [touristId, hash]);

  const fetchVerification = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParam = hash ? `?hash=${encodeURIComponent(hash)}` : '';
      const token = localStorage.getItem('safar_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/digital-id/verify/${touristId}${queryParam}`, {
        method: 'GET',
        headers
      });
      const result = await res.json();
      if (!result.success && result.error) {
        setError(result.error);
      } else {
        setData(result);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Unable to contact S.A.F.A.R. Prototype Blockchain Ledger.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
        <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-gray-700">
          Querying S.A.F.A.R. Prototype Blockchain Ledger for Tourist ID...
        </p>
        <span className="text-xs text-gray-400 font-mono">Verifying cryptographic signature</span>
      </div>
    );
  }

  const isVerified = Boolean(data?.verified);
  const tourist = data?.tourist;
  const digitalId = data?.digitalId;
  const medical = data?.emergencyMedical;
  const isRestricted = Boolean(data?.medicalRestricted);

  return (
    <div 
      className="min-h-[85vh] py-8 sm:py-12 px-4 max-w-xl mx-auto space-y-6"
      style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
    >
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          to="/" 
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to S.A.F.A.R. Home</span>
        </Link>
        <div className="flex items-center space-x-1.5">
          <SafarLogo size="xs" showSubtitle={false} />
        </div>
      </div>

      {/* Main Verification Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
        style={{
          boxShadow: isVerified
            ? '0 20px 60px rgba(16, 185, 129, 0.15), 0 4px 20px rgba(0,0,0,0.06)'
            : '0 20px 60px rgba(239, 68, 68, 0.15), 0 4px 20px rgba(0,0,0,0.06)'
        }}
      >
        {/* Header Ribbon */}
        <div className={`py-3 px-6 text-center text-xs font-black tracking-widest uppercase flex items-center justify-center space-x-2 ${
          isVerified ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <ShieldCheck className="w-4 h-4" />
          <span>TOURIST VERIFICATION PORTAL</span>
        </div>

        {/* Section 1: Tourist Identity */}
        <div className="p-6 sm:p-8 text-center space-y-4">
          
          {/* Tourist Photo / Avatar */}
          <div className="relative inline-block mx-auto">
            {tourist?.photoUrl ? (
              <img 
                src={tourist.photoUrl} 
                alt={tourist?.fullName || 'Tourist'} 
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center shadow-lg mx-auto border-4 border-white">
                <span className="text-3xl sm:text-4xl font-black">
                  {(tourist?.fullName || 'T')[0]}
                </span>
              </div>
            )}

            <div className={`absolute bottom-0 right-0 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-md ${
              isVerified ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
            }`}>
              {isVerified ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
          </div>

          {/* Name & ID */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {tourist?.fullName || digitalId?.fullName || (isVerified ? 'Verified Tourist' : 'Unknown / Invalid Record')}
            </h2>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xs font-mono font-bold text-gray-500">
                Tourist ID:
              </span>
              <span className="text-xs font-mono font-black text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-200">
                {touristId || digitalId?.touristId}
              </span>
            </div>
          </div>

          {/* Verification Status Badge */}
          <div className="pt-1">
            <span className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm border ${
              isVerified 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-red-50 text-red-800 border-red-300'
            }`}>
              {isVerified ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>✓ ID VERIFIED</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>✕ NOT VERIFIED</span>
                </>
              )}
            </span>
          </div>

          {digitalId?.digitalSignature && (
            <div className="text-[10px] text-gray-400 font-mono">
              Sig: {digitalId.digitalSignature}
            </div>
          )}
        </div>

        {/* Section 2: Destination Information */}
        <div className="border-t border-gray-100 bg-slate-50/70 p-6 sm:p-7 space-y-2.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 block">
            Destination Information
          </span>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-start space-x-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-sm font-black text-gray-900 block leading-tight">
                {tourist?.destination || 'Heritage Corridor Circuit'}
              </span>
              <span className="text-xs text-gray-500 block">
                Authorized Travel Circuit • {tourist?.nationality || 'Indian National'}
              </span>
              {tourist?.travelValidity && (
                <span className="text-[11px] text-emerald-700 font-bold block pt-1 font-mono">
                  Validity: {tourist.travelValidity}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Emergency Medical Information */}
        <div className="border-t border-gray-100 p-6 sm:p-7 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 flex items-center space-x-1.5">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              <span>Emergency Medical Information</span>
            </span>
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
              For First Responders & Police
            </span>
          </div>

          {medical ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 bg-rose-50/50 rounded-2xl border border-rose-200/80 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">
                  Blood Group
                </span>
                <span className="text-xl font-black text-rose-700 font-mono block">
                  {medical.bloodGroup}
                </span>
              </div>

              <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">
                  Allergies
                </span>
                <span className="text-xs font-bold text-gray-900 block">
                  {medical.allergies}
                </span>
              </div>

              <div className="sm:col-span-2 p-3.5 bg-blue-50/50 rounded-2xl border border-blue-200/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">
                  Emergency Contact
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-900">
                    {medical.emergencyContactName} ({medical.emergencyContactRelation})
                  </span>
                  <a
                    href={`tel:${medical.emergencyContactPhone}`}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{medical.emergencyContactPhone}</span>
                  </a>
                </div>
              </div>

              {medical.medicalConditions && medical.medicalConditions !== 'None' && medical.medicalConditions !== 'None reported' && (
                <div className="sm:col-span-2 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">Medical Conditions / Notes</span>
                  <span className="font-semibold text-gray-800">{medical.medicalConditions}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-center">
              <div className="flex items-center justify-center space-x-1.5 text-slate-700 font-bold text-xs">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Confidential Medical Records Protected</span>
              </div>
              <p className="text-[11px] text-gray-500 max-w-sm mx-auto leading-relaxed">
                Emergency medical data is protected under India DPDP Act 2023 and requires scanning the official QR cryptographic security hash or logging in with Police/Authority credentials.
              </p>
            </div>
          )}
        </div>

        {/* Blockchain Ledger Proof Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 text-center text-[10px] text-gray-500 flex items-center justify-center space-x-2">
          <Globe className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>Cryptographically validated against S.A.F.A.R. Prototype Blockchain Ledger • SIH 2026</span>
        </div>
      </motion.div>
    </div>
  );
}
