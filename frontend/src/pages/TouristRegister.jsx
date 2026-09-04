import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, User, Mail, Lock, Phone, Calendar, MapPin, FileCheck, ArrowRight, AlertCircle, Globe } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import { useLanguage } from '../context/LanguageContext';

export default function TouristRegister({ onRegisterSuccess }) {
  const navigate = useNavigate();
  const { t, currentLanguage, setLanguage } = useLanguage();

  const [formData, setFormData] = useState({
    fullName: '',
    dob: '1998-05-15',
    gender: 'Male',
    nationality: 'Indian',
    preferredLanguage: currentLanguage || 'en',
    mobileNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: 'Family',
    email: '',
    password: '',
    idProofType: 'Aadhaar Card',
    destination: 'Guwahati & Kaziranga Safe Corridor',
    travelStartDate: new Date().toISOString().split('T')[0],
    travelEndDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'preferredLanguage') {
      setLanguage(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      onRegisterSuccess(data);
      navigate('/tourist-dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-navy-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2 border-b border-slate-800 pb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {t('regTitle', 'Create Digital Tourist ID')}
          </h2>
          <p className="text-xs text-slate-400">
            {t('regSubtitle', 'Mint your tamper-evident Digital Tourist ID on the S.A.F.A.R. Cryptographic Ledger')}
          </p>
        </div>

        {/* Multi-Language Quick Selector Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-2.5">
            <Globe className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-200">{t('selectLanguage', 'Select Language')}</p>
              <p className="text-[10px] text-slate-400">{t('regLanguageNotice', 'Select your preferred language for safety alerts & emergency assistance')}</p>
            </div>
          </div>
          <LanguageSelector variant="pills" />
        </div>

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Personal Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
              {t('regSec1Title', '1. Tourist Profile Details')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  {t('regFullName', 'Full Name')} *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Rohan Verma"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  {t('regDob', 'Date of Birth')} *
                </label>
                <input
                  type="date"
                  name="dob"
                  required
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  {t('regGender', 'Gender')} *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Male">{t('regMale', 'Male')}</option>
                  <option value="Female">{t('regFemale', 'Female')}</option>
                  <option value="Other">{t('regOther', 'Other')}</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  {t('regNationality', 'Nationality')} *
                </label>
                <input
                  type="text"
                  name="nationality"
                  required
                  value={formData.nationality}
                  onChange={handleChange}
                  placeholder="e.g. Indian / French / Korean"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Emergency Alert Language Preference */}
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  {t('regPreferredLangLabel', 'Emergency Alert Language Preference')} *
                </label>
                <select
                  name="preferredLanguage"
                  value={formData.preferredLanguage}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="en">🇬🇧 English (Default International)</option>
                  <option value="hi">🇮🇳 हिन्दी (Hindi - Official India)</option>
                  <option value="fr">🇫🇷 Français (French)</option>
                  <option value="ko">🇰🇷 한국어 (Korean)</option>
                  <option value="zh">🇨🇳 中文 (Chinese)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Emergency */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
              {t('regSec2Title', '2. Emergency Contact & Family Link')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  {t('regMobile', 'Mobile Number')} *
                </label>
                <input
                  type="text"
                  name="mobileNumber"
                  required
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  {t('regEmail', 'Email Address')} *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="rohan@example.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  {t('regContactName', 'Emergency Contact Name')} *
                </label>
                <input
                  type="text"
                  name="emergencyContactName"
                  required
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  placeholder="Sunita Verma (Mother)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  {t('regContactPhone', 'Emergency Contact Phone')} *
                </label>
                <input
                  type="text"
                  name="emergencyContactPhone"
                  required
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  placeholder="+91 98765 00001"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Identity & Travel Itinerary */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
              {t('regSec3Title', '3. Travel Circuit & KYC Verification')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  {t('regIdProofType', 'Government ID Type')} *
                </label>
                <select
                  name="idProofType"
                  value={formData.idProofType}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Aadhaar Card">Aadhaar Card (India)</option>
                  <option value="Passport">International Passport</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Voter ID">National ID Card</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  {t('regDestination', 'Primary Destination / Circuit')} *
                </label>
                <input
                  type="text"
                  name="destination"
                  required
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="e.g. Guwahati & Kaziranga Safari"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  {t('regStartDate', 'Travel Start Date')} *
                </label>
                <input
                  type="date"
                  name="travelStartDate"
                  required
                  value={formData.travelStartDate}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  {t('regEndDate', 'Travel End Date')} *
                </label>
                <input
                  type="date"
                  name="travelEndDate"
                  required
                  value={formData.travelEndDate}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  {t('regPassword', 'Account Password')} *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Set secure password"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-xl transition-all flex items-center justify-center space-x-2"
          >
            <span>{loading ? t('regSubmitting', 'Minting SHA-256 Digital Credential...') : t('regSubmitBtn', 'Generate & Mint Cryptographic Tourist ID')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          <Link to="/login" className="text-emerald-400 hover:underline font-bold">
            {t('regAlreadyHaveAccount', 'Already registered? Login to Safety Hub')}
          </Link>
        </div>
      </div>
    </div>
  );
}
