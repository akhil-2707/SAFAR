import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, User, Mail, Lock, Phone, Calendar, MapPin, 
  FileCheck, ArrowRight, AlertCircle, Globe, HeartPulse, 
  UploadCloud, CheckCircle2, FileText, Sparkles, Navigation, AlertTriangle, Award, Building2,
  Clock
} from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import { useLanguage } from '../context/LanguageContext';

export default function TouristRegister({ onRegisterSuccess }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role');
  const [regRole, setRegRole] = useState(initialRole === 'authority' ? 'AUTHORITY' : 'TOURIST');
  const { t, currentLanguage, setLanguage } = useLanguage();
  const [pendingOfficerRegistered, setPendingOfficerRegistered] = useState(null);

  const [authorityForm, setAuthorityForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: 'State Tourism Police & CAD',
    jurisdiction: 'Ayodhya Saryu Ghat & Temple Complex',
    serviceBadgeId: '',
    designation: 'Security Field Operations Officer'
  });

  const [formData, setFormData] = useState({
    // Personal Details
    fullName: '',
    dob: '1998-05-15',
    gender: 'Male',
    nationality: 'Indian',
    preferredLanguage: currentLanguage || 'en',
    mobileNumber: '',
    email: '',
    password: '',

    // Permanent Origin (Home Address)
    originStreet: '',
    originCity: 'New Delhi',
    originState: 'Delhi',
    originCountry: 'India',
    originPostalCode: '110001',

    // Travel Context
    entryCheckpoint: 'CHK-GW-01',
    destination: 'Guwahati & Kaziranga Safe Corridor',
    intendedRoute: 'Guwahati Entry -> Kaziranga National Park -> Shillong',
    travelStartDate: new Date().toISOString().split('T')[0],
    travelEndDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],

    // Govt ID Upload
    idProofType: 'Aadhaar Card',
    idProofUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',

    // Medical & Emergency Essentials
    bloodGroup: 'O+',
    medicalConditions: [],
    customCondition: '',
    allergies: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: 'Family',

    // Fast-Track DigiLocker Verification State Machine
    fastTrackDigiLocker: true
  });

  const [idFileName, setIdFileName] = useState('Govt_ID_Proof.pdf');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const availableCheckpoints = [
    { id: 'CHK-GW-01', name: 'Guwahati Entry Gateway Desk', region: 'North East (Assam)' },
    { id: 'CHK-TW-02', name: 'Tawang Military & Border Pass', region: 'Arunachal Pradesh' },
    { id: 'CHK-KZ-03', name: 'Kaziranga Forest Gate Sentinel', region: 'Kaziranga, Assam' },
    { id: 'CHK-AY-04', name: 'Ayodhya Heritage Entry Corridor', region: 'Uttar Pradesh' },
    { id: 'CHK-JK-05', name: 'Katra-Vaishno Devi Highway Checkpost', region: 'Jammu & Kashmir' },
    { id: 'CHK-AG-06', name: 'Agra-Taj Safe Tourism Promenade', region: 'Agra, Uttar Pradesh' }
  ];

  const commonConditions = [
    'Asthma / Respiratory',
    'Altitude sensitivity',
    'Diabetes',
    'Cardiac condition',
    'Hypertension',
    'None reported'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (name === 'preferredLanguage') {
      setLanguage(value);
    }
  };

  const handleConditionToggle = (cond) => {
    setFormData((prev) => {
      let updated = [...prev.medicalConditions];
      if (cond === 'None reported') {
        return { ...prev, medicalConditions: ['None reported'] };
      }
      updated = updated.filter((c) => c !== 'None reported');
      if (updated.includes(cond)) {
        updated = updated.filter((c) => c !== cond);
      } else {
        updated.push(cond);
      }
      return { ...prev, medicalConditions: updated };
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          idProofUrl: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        fullName: formData.fullName,
        dob: formData.dob,
        gender: formData.gender,
        nationality: formData.nationality,
        preferredLanguage: formData.preferredLanguage,
        mobileNumber: formData.mobileNumber,
        email: formData.email,
        password: formData.password,
        origin: {
          street: formData.originStreet || 'Permanent Address',
          city: formData.originCity,
          state: formData.originState,
          country: formData.originCountry,
          postalCode: formData.originPostalCode
        },
        entryCheckpoint: formData.entryCheckpoint,
        destination: formData.destination,
        intendedRoute: formData.intendedRoute,
        travelStartDate: formData.travelStartDate,
        travelEndDate: formData.travelEndDate,
        idProofType: formData.idProofType,
        idProofUrl: formData.idProofUrl,
        bloodGroup: formData.bloodGroup,
        medicalConditions: formData.medicalConditions.length > 0 
          ? formData.medicalConditions.join(', ') 
          : 'None reported',
        allergies: formData.allergies || 'None reported',
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        emergencyContactRelation: formData.emergencyContactRelation,
        fastTrackDigiLocker: formData.fastTrackDigiLocker
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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

  const handleAuthorityChange = (e) => {
    const { name, value } = e.target;
    setAuthorityForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuthoritySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register-authority', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authorityForm)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Authority registration failed');

      if (data.pendingApproval) {
        setPendingOfficerRegistered(data.user);
        return;
      }

      onRegisterSuccess(data);
      navigate('/authority-dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-10 select-none font-sans">
      <div
        className="rounded-3xl p-5 sm:p-9 shadow-2xl space-y-7 text-gray-900 backdrop-blur-xl relative overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.98)',
          border: '1.5px solid rgba(249, 115, 22, 0.25)',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.08)'
        }}
      >
        {/* Tricolor Ribbon Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

        {/* Dynamic Header based on Role */}
        <div className="text-center space-y-2 border-b border-gray-100 pb-5 pt-2">
          <div className={`w-14 h-14 rounded-2xl p-0.5 shadow-md flex items-center justify-center mx-auto ${
            regRole === 'AUTHORITY'
              ? 'bg-gradient-to-tr from-purple-700 via-indigo-600 to-purple-800'
              : 'bg-gradient-to-tr from-orange-500 via-amber-400 to-emerald-500'
          }`}>
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-emerald-600">
              <ShieldCheck className={`w-8 h-8 ${regRole === 'AUTHORITY' ? 'text-purple-700' : 'text-emerald-600'}`} />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {regRole === 'AUTHORITY'
              ? 'S.A.F.A.R. Authority Personnel Registration'
              : 'S.A.F.A.R. Tourist Registration & Digital ID'}
          </h2>
          <p className="text-xs text-gray-500 font-medium max-w-lg mx-auto leading-relaxed">
            {regRole === 'AUTHORITY'
              ? 'Enroll departmental security officers, SDRF rangers, and CAD operators under Director General Akhil Gupta.'
              : 'Mint your tamper-evident Digital Tourist ID with cryptographic health credentialing on the S.A.F.A.R. Zero-Gas Consortium Ledger.'}
          </p>
        </div>

        {/* 3-Role Registration Selector */}
        <div className="p-1 rounded-2xl bg-slate-100/90 border border-slate-200/80 flex items-center justify-between text-xs font-bold">
          <button
            type="button"
            onClick={() => { setRegRole('TOURIST'); setError(null); }}
            className={`flex-1 py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              regRole === 'TOURIST'
                ? 'bg-white text-orange-600 shadow-sm border border-orange-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>🎒</span>
            <span>Register as Tourist</span>
          </button>

          <Link
            to="/guide-register"
            className="flex-1 py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50"
          >
            <span>🪪</span>
            <span>Register as Guide</span>
          </Link>

          <button
            type="button"
            onClick={() => { setRegRole('AUTHORITY'); setError(null); }}
            className={`flex-1 py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              regRole === 'AUTHORITY'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md'
                : 'text-slate-500 hover:text-purple-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Register as Authority</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center space-x-2 shadow-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {pendingOfficerRegistered ? (
          <div className="py-6 px-4 text-center space-y-5 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-700 flex items-center justify-center mx-auto shadow-md">
              <Clock className="w-8 h-8 animate-pulse text-amber-600" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Clearance Status: Pending DG Approval
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Officer Application Registered
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your credentials have been securely stored in the S.A.F.A.R. database, but your security clearance is pending supreme review.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500 font-semibold">Officer Name:</span>
                <span className="font-bold text-slate-900">{pendingOfficerRegistered.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500 font-semibold">Department:</span>
                <span className="font-bold text-slate-800">{pendingOfficerRegistered.department}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500 font-semibold">Service Badge ID:</span>
                <span className="font-mono font-bold text-purple-700">{pendingOfficerRegistered.serviceBadgeId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Authorizing Authority:</span>
                <span className="font-bold text-amber-900">Director General Akhil Gupta</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-950 text-[11px] font-medium text-left leading-relaxed">
              <strong>Supreme Command Protocol:</strong> As per Government of India security directives, new officers cannot access the Command Desk until Director General Akhil Gupta approves your clearance in the command roster.
            </div>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white font-bold text-xs shadow-lg shadow-purple-600/30 cursor-pointer hover:opacity-95 transition"
            >
              Proceed to Login Portal
            </button>
          </div>
        ) : regRole === 'AUTHORITY' ? (
          <form onSubmit={handleAuthoritySubmit} className="space-y-6">
            {/* Superior Officer Clearance Notice */}
            <div className="p-4 rounded-2xl bg-purple-50/90 border border-purple-200/90 flex items-start gap-3 text-xs text-purple-900">
              <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-purple-950">
                  Central Authority Hierarchy Protocol (S.A.F.A.R. CAD)
                </p>
                <p className="text-purple-800/90 leading-relaxed text-[11px]">
                  All newly registered field officers, SDRF rangers, and CAD operators report directly under <strong>Director General Akhil Gupta (Supreme Command)</strong>. Enrolling creates authenticated credentials for Command Desk access.
                </p>
              </div>
            </div>

            {/* Officer Personal & Account Details */}
            <div className="space-y-4 bg-slate-50/60 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
              <div className="flex items-center space-x-2 border-b border-gray-200 pb-2">
                <User className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
                  1. Officer Identity & Credentials
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs text-gray-700 font-bold block mb-1">
                    Officer Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={authorityForm.name}
                    onChange={handleAuthorityChange}
                    placeholder="e.g. Inspector R. K. Saxena"
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-700 font-bold block mb-1">
                    Official Department Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={authorityForm.email}
                    onChange={handleAuthorityChange}
                    placeholder="officer@police.gov.in or sdrf.cad@gmail.com"
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-700 font-bold block mb-1">
                    Account Passphrase *
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    value={authorityForm.password}
                    onChange={handleAuthorityChange}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-700 font-bold block mb-1">
                    Direct Duty Mobile Contact *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={authorityForm.phone}
                    onChange={handleAuthorityChange}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 shadow-xs"
                  />
                </div>
              </div>
            </div>

            {/* Departmental Deployment & Jurisdiction */}
            <div className="space-y-4 bg-slate-50/60 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
              <div className="flex items-center space-x-2 border-b border-gray-200 pb-2">
                <Building2 className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
                  2. Departmental Assignment & Jurisdiction
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs text-gray-700 font-bold block mb-1">
                    Service Badge / Officer ID *
                  </label>
                  <input
                    type="text"
                    name="serviceBadgeId"
                    required
                    value={authorityForm.serviceBadgeId}
                    onChange={handleAuthorityChange}
                    placeholder="e.g. SDRF-UK-8492 or POL-UP-3310"
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-700 font-bold block mb-1">
                    Department / Agency *
                  </label>
                  <select
                    name="department"
                    value={authorityForm.department}
                    onChange={handleAuthorityChange}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-purple-500 shadow-xs"
                  >
                    <option value="State Tourism Police & CAD">State Tourism Police & CAD</option>
                    <option value="SDRF / NDRF Disaster Response">SDRF / NDRF Disaster Response</option>
                    <option value="Forest & Wildlife Sentinel">Forest & Wildlife Sentinel</option>
                    <option value="Border Security CAD Desk">Border Security CAD Desk</option>
                    <option value="District Magistrate Emergency Operations">District Magistrate Emergency Operations</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-700 font-bold block mb-1">
                    Designation *
                  </label>
                  <select
                    name="designation"
                    value={authorityForm.designation}
                    onChange={handleAuthorityChange}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-purple-500 shadow-xs"
                  >
                    <option value="Security Operations Officer">Security Operations Officer</option>
                    <option value="Field Incident Commander">Field Incident Commander</option>
                    <option value="CAD Emergency Dispatcher">CAD Emergency Dispatcher</option>
                    <option value="Sub-Inspector / Sentinel Lead">Sub-Inspector / Sentinel Lead</option>
                    <option value="Rescue Operations Lead">Rescue Operations Lead</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-700 font-bold block mb-1">
                    Assigned Jurisdiction *
                  </label>
                  <select
                    name="jurisdiction"
                    value={authorityForm.jurisdiction}
                    onChange={handleAuthorityChange}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-purple-500 shadow-xs"
                  >
                    <option value="Ayodhya Saryu Ghat & Temple Complex">Ayodhya Saryu Ghat & Temple Complex</option>
                    <option value="Katra Vaishno Devi Alpine Track">Katra Vaishno Devi Alpine Track</option>
                    <option value="Agra Taj Mahal Heritage Corridor">Agra Taj Mahal Heritage Corridor</option>
                    <option value="Kaziranga Forest Buffer Zone">Kaziranga Forest Buffer Zone</option>
                    <option value="Central Command Desk">Central Command Desk</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-white font-black text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 hover:scale-[1.008] active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-purple-600/30"
            >
              <span>
                {loading
                  ? 'Verifying & Provisioning Officer Terminal...'
                  : 'Enroll Officer & Enter Command Desk'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div>
            {/* Language Selector Banner */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-orange-50/80 via-white to-emerald-50/80 p-3.5 rounded-2xl border border-orange-200 shadow-xs mb-6">
              <div className="flex items-center space-x-2.5">
                <Globe className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-800">Multilingual Safety Portal</p>
                  <p className="text-[10px] text-gray-500">Select language for emergency alerts & checkpoint advisories</p>
                </div>
              </div>
              <LanguageSelector variant="pills" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
          
          {/* Section 1: Personal Details */}
          <div className="space-y-4 bg-slate-50/60 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center space-x-2 border-b border-gray-200 pb-2">
              <User className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
                1. Personal Details & Account Credentials
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs text-gray-700 font-bold block mb-1">Full Name (as per Govt ID) *</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Rohan Verma"
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>

              <div>
                <label className="text-xs text-gray-700 font-bold block mb-1">Date of Birth *</label>
                <input
                  type="date"
                  name="dob"
                  required
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>

              <div>
                <label className="text-xs text-gray-700 font-bold block mb-1">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other / Non-Binary</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-700 font-bold block mb-1">Nationality *</label>
                <input
                  type="text"
                  name="nationality"
                  required
                  value={formData.nationality}
                  onChange={handleChange}
                  placeholder="e.g. Indian / French / Japanese"
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>

              <div>
                <label className="text-xs text-gray-700 font-bold block mb-1">Primary Mobile Phone *</label>
                <input
                  type="tel"
                  name="mobileNumber"
                  required
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>

              <div>
                <label className="text-xs text-gray-700 font-bold block mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tourist@example.com"
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-gray-700 font-bold block mb-1">Account Password *</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Set secure password for dashboard login"
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Permanent Origin (Home Address) */}
          <div className="space-y-4 bg-slate-50/60 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center space-x-2 border-b border-gray-200 pb-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
                2. Permanent Origin / Registered Home Address
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="sm:col-span-3">
                <label className="text-xs text-gray-700 font-bold block mb-1">Street Address / House No. *</label>
                <input
                  type="text"
                  name="originStreet"
                  required
                  value={formData.originStreet}
                  onChange={handleChange}
                  placeholder="e.g. Flat 402, Green Glen Layout, Bellandur"
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>

              <div>
                <label className="text-xs text-gray-700 font-bold block mb-1">City / Town *</label>
                <input
                  type="text"
                  name="originCity"
                  required
                  value={formData.originCity}
                  onChange={handleChange}
                  placeholder="e.g. Bengaluru"
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>

              <div>
                <label className="text-xs text-gray-700 font-bold block mb-1">State / Province *</label>
                <input
                  type="text"
                  name="originState"
                  required
                  value={formData.originState}
                  onChange={handleChange}
                  placeholder="e.g. Karnataka"
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>

              <div>
                <label className="text-xs text-gray-700 font-bold block mb-1">Postal / ZIP Code</label>
                <input
                  type="text"
                  name="originPostalCode"
                  value={formData.originPostalCode}
                  onChange={handleChange}
                  placeholder="560103"
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Travel Context & Checkpoint */}
          <div className="space-y-4 bg-slate-50/60 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center space-x-2 border-b border-gray-200 pb-2">
              <Navigation className="w-4 h-4 text-violet-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
                3. Travel Context & Designated Entry Checkpoint
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs text-gray-700 font-bold block mb-1">Designated Entry Checkpoint *</label>
                <select
                  name="entryCheckpoint"
                  value={formData.entryCheckpoint}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 font-medium focus:outline-none focus:border-emerald-500 shadow-xs"
                >
                  {availableCheckpoints.map((chk) => (
                    <option key={chk.id} value={chk.id}>
                      {chk.name} ({chk.region})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-700 font-bold block mb-1">Primary Destination / Circuit *</label>
                <input
                  type="text"
                  name="destination"
                  required
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="e.g. Kaziranga Safari & Tawang Pass"
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-gray-700 font-bold block mb-1">Intended Travel Route</label>
                <input
                  type="text"
                  name="intendedRoute"
                  value={formData.intendedRoute}
                  onChange={handleChange}
                  placeholder="e.g. Guwahati Gateway -> Tezpur -> Bomdila -> Tawang"
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>

              <div>
                <label className="text-xs text-gray-700 font-bold block mb-1">Travel Start Date *</label>
                <input
                  type="date"
                  name="travelStartDate"
                  required
                  value={formData.travelStartDate}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>

              <div>
                <label className="text-xs text-gray-700 font-bold block mb-1">Travel End Date *</label>
                <input
                  type="date"
                  name="travelEndDate"
                  required
                  value={formData.travelEndDate}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Govt ID Upload */}
          <div className="space-y-4 bg-slate-50/60 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center space-x-2 border-b border-gray-200 pb-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
                4. Government ID Document & Proof Upload
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs text-gray-700 font-bold block mb-1">Government ID Type *</label>
                <select
                  name="idProofType"
                  value={formData.idProofType}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                >
                  <option value="Aadhaar Card">Aadhaar Card (India)</option>
                  <option value="Passport">International Passport</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Voter ID">National Voter / Identity Card</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-700 font-bold block mb-1">Upload ID Document / File</label>
                <label className="w-full flex items-center justify-between px-3 py-2 bg-white border border-dashed border-gray-300 rounded-xl text-xs text-gray-600 cursor-pointer hover:border-emerald-500 shadow-xs transition-colors">
                  <div className="flex items-center space-x-2 truncate">
                    <UploadCloud className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">{idFileName}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-bold rounded-md">Browse</span>
                  <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* Section 5: Medical & Emergency Essentials */}
          <div className="space-y-4 bg-rose-50/40 p-4 sm:p-5 rounded-2xl border border-rose-200/70">
            <div className="flex items-center justify-between border-b border-rose-200/80 pb-2">
              <div className="flex items-center space-x-2">
                <HeartPulse className="w-4 h-4 text-rose-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-rose-900">
                  5. Medical & Emergency Essentials (Confidential First-Responder Vault)
                </h3>
              </div>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full">
                Protected by DPDP Act
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="text-xs text-gray-700 font-bold block mb-1">Blood Group *</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full bg-white border border-rose-200 rounded-xl p-2.5 text-xs font-bold text-rose-900 focus:outline-none focus:border-rose-500 shadow-xs"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-gray-700 font-bold block mb-1">Pre-Existing Conditions (Check all that apply)</label>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {commonConditions.map((cond) => {
                    const isSelected = formData.medicalConditions.includes(cond);
                    return (
                      <button
                        type="button"
                        key={cond}
                        onClick={() => handleConditionToggle(cond)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-rose-300'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {cond}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="text-xs text-gray-700 font-bold block mb-1">Known Allergies (Food / Medication / Environmental)</label>
                <input
                  type="text"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder="e.g. Dust, Pollen, Penicillin, Peanuts (or None)"
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>

              <div>
                <label className="text-xs text-gray-700 font-bold block mb-1">Emergency Contact Name *</label>
                <input
                  type="text"
                  name="emergencyContactName"
                  required
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  placeholder="e.g. Sunita Verma"
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>

              <div>
                <label className="text-xs text-gray-700 font-bold block mb-1">Emergency Contact Phone *</label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  required
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  placeholder="+91 98765 00001"
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>

              <div>
                <label className="text-xs text-gray-700 font-bold block mb-1">Relationship</label>
                <select
                  name="emergencyContactRelation"
                  value={formData.emergencyContactRelation}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                >
                  <option value="Family">Family / Relative</option>
                  <option value="Parent">Parent</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Friend">Friend / Colleague</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 6: State Machine & DigiLocker e-KYC Fast-Track */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-blue-50/80 to-violet-50/80 border border-emerald-300/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wide">
                    DigiLocker Fast-Track e-KYC Clearance
                  </h4>
                  <p className="text-[11px] text-gray-600">
                    Auto-verify govt credentials to transition pass directly to <strong className="text-emerald-700">PROVISIONALLY_ACTIVE</strong> for bottleneck-free checkpost transit.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                <input
                  type="checkbox"
                  name="fastTrackDigiLocker"
                  checked={formData.fastTrackDigiLocker}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="text-[10px] text-gray-500 pt-1 flex items-center space-x-1.5">
              <span className={`inline-block w-2 h-2 rounded-full ${formData.fastTrackDigiLocker ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>
                {formData.fastTrackDigiLocker
                  ? 'Active Mode: Passes instant automated KYC check (Status: PROVISIONALLY_ACTIVE)'
                  : 'Manual Mode: Enforces on-site checkpoint inspection (Status: PENDING_REVIEW)'}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-white font-black text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2 hover:scale-[1.008] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #8b5cf6 100%)',
              boxShadow: '0 8px 30px rgba(249, 115, 22, 0.35)'
            }}
          >
            <span>
              {loading 
                ? 'Minting Cryptographic Pass on Consortium Ledger...' 
                : 'Generate S.A.F.A.R. QR Travel Pass'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    )}

    <div className="text-center text-xs text-gray-500 pt-2">
          <Link to="/login" className="text-violet-600 hover:text-violet-800 hover:underline font-bold">
            Already registered? Login to Safety Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
