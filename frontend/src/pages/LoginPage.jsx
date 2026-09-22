import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Mail,
  KeyRound,
  CheckCircle2,
  Sparkles,
  Compass,
  MapPin,
  X,
  Award,
  Users,
  AlertTriangle,
  Building2
} from 'lucide-react';
import SafarLogo from '../components/SafarLogo';

export default function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL query role initialization ('authority', 'guide', 'tourist')
  const initialRole = searchParams.get('role');
  const redirectTarget = searchParams.get('redirect');

  const [roleTab, setRoleTab] = useState(() => {
    if (initialRole === 'authority') return 'AUTHORITY';
    if (initialRole === 'guide') return 'GUIDE';
    return 'TOURIST';
  });

  // Login mode: 'PASSWORD' or 'OTP' (for tourists)
  const [authMode, setAuthMode] = useState('PASSWORD');

  // Form states: securely initialized empty so credentials are never pre-filled
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Email OTP States
  const [otpStep, setOtpStep] = useState('EMAIL'); // 'EMAIL' | 'VERIFY'
  const [otpCode, setOtpCode] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDemoModal, setShowDemoModal] = useState(false);

  // Synchronize role change: reset fields cleanly
  const handleRoleSwitch = (newRole) => {
    setRoleTab(newRole);
    setError(null);
    setEmail('');
    setPassword('');
  };

  // 1-Click Demo Login for Testing & Video Presentation
  const handleDemoPersonaLogin = async (targetEmail, targetPassword, targetRole) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: targetPassword })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Login failed');

      onLoginSuccess(data);
      if (redirectTarget) {
        navigate(redirectTarget);
      } else if (data.user.role === 'AUTHORITY') {
        navigate('/authority-dashboard');
      } else if (data.user.role === 'GUIDE') {
        navigate('/guide-dashboard');
      } else {
        navigate('/tourist-dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 5 Field Personas (Ayodhya, Agra, Jammu, Guide, Police Officer)
  const demoPersonas = [
    {
      id: 'ananya_ayodhya',
      label: '🛕 Ananya Mishra (Ayodhya)',
      email: 'ananya.mishra@example.com',
      password: 'admin123',
      role: 'TOURIST',
      location: 'Kamrup / Ayodhya Pilgrim Corridor',
      tag: '⚠️ Caution Zone',
      desc: '300m buffer breach telemetry. Appears in Red/Caution status on Officer Command Radar.'
    },
    {
      id: 'aarav_taj',
      label: '🕌 Aarav Sharma (Agra)',
      email: 'aarav.taj@example.com',
      password: 'admin123',
      role: 'TOURIST',
      location: 'Taj Mahal UNESCO Heritage Promenade',
      tag: '🟢 Safe Corridor',
      desc: 'Nominal green status with active digital blockchain travel pass.'
    },
    {
      id: 'vikas_jammu',
      label: '🏔️ Vikas Chandel (Jammu)',
      email: 'vikas.chandel@example.com',
      password: 'admin123',
      role: 'TOURIST',
      location: 'Katra - Vaishno Devi High Track',
      tag: '🟢 High Altitude',
      desc: 'Monitored via high-altitude geofence with nominal health telemetry.'
    },
    {
      id: 'rajesh_guide',
      label: '🪪 Rajesh Sharma (Guide)',
      email: 'rajesh.guide@safetour.gov.in',
      password: 'admin123',
      role: 'GUIDE',
      location: 'Ayodhya Heritage Sector',
      tag: '⭐ Verified Guide',
      desc: 'Licensed guide cockpit with tourist requests, direct tips and assigned escorts.'
    },
    {
      id: 'bikram_police',
      label: '👮 Insp. Bikram Gogoi (Officer)',
      email: 'police@safetour.gov.in',
      password: 'admin123',
      role: 'AUTHORITY',
      location: 'Assam / State Tourism Police & CAD HQ',
      tag: '🛡️ Active Officer',
      desc: 'Field Command Desk for dispatching patrols, guide allocation & zone surveillance.'
    }
  ];

  // Password Submit
  const handlePasswordSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Authentication failed');

      onLoginSuccess(data);

      if (redirectTarget) {
        navigate(redirectTarget);
      } else if (data.user.role === 'AUTHORITY') {
        navigate('/authority-dashboard');
      } else if (data.user.role === 'GUIDE') {
        navigate('/guide-dashboard');
      } else {
        navigate('/tourist-dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Send OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), purpose: 'LOGIN' })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to send OTP');

      setDemoOtp(data.demoOtp || '');
      setOtpStep('VERIFY');
      setResendCooldown(45);
      setOtpCode('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP Login
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit OTP code');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/verify-otp-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otpCode.trim() })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'OTP verification failed');

      onLoginSuccess(data);
      if (redirectTarget) {
        navigate(redirectTarget);
      } else if (data.user.role === 'AUTHORITY') {
        navigate('/authority-dashboard');
      } else if (data.user.role === 'GUIDE') {
        navigate('/guide-dashboard');
      } else {
        navigate('/tourist-dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-12 relative overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Dynamic Aurora Glow */}
      <motion.div
        className="absolute -top-20 -left-20 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background:
            roleTab === 'AUTHORITY'
              ? 'rgba(139,92,246,0.18)'
              : roleTab === 'GUIDE'
              ? 'rgba(245,158,11,0.18)'
              : 'rgba(249,115,22,0.18)',
          filter: 'blur(80px)'
        }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 7, repeat: Infinity }}
      />

      <div className="w-full max-w-xl relative z-10">
        <div
          className="rounded-3xl p-6 sm:p-9 space-y-6 relative overflow-hidden bg-white/95 backdrop-blur-2xl border border-white/80"
          style={{
            boxShadow:
              roleTab === 'AUTHORITY'
                ? '0 30px 80px rgba(139,92,246,0.16), 0 8px 24px rgba(0,0,0,0.06)'
                : '0 30px 80px rgba(0,0,0,0.08), 0 8px 24px rgba(249,115,22,0.08)'
          }}
        >
          {/* Header */}
          <div className="text-center space-y-2 relative z-10">
            <div className="flex justify-center">
              <SafarLogo size="lg" showText={false} animated={true} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                S.A.F.A.R. Secure Portal
              </h1>
              <p
                className="text-xs sm:text-sm font-bold mt-1"
                style={{
                  color:
                    roleTab === 'AUTHORITY'
                      ? '#7c3aed'
                      : roleTab === 'GUIDE'
                      ? '#d97706'
                      : '#ea580c'
                }}
              >
                Smart AI Framework for Assured & Responsible Tourism
              </p>
            </div>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Ministry of Tourism • Government of India Safe Tourism Grid
            </p>
          </div>

          {/* 3-Role Tab Switcher */}
          <div className="p-1 rounded-2xl bg-slate-100/90 border border-slate-200/80 flex items-center justify-between text-xs font-bold relative z-10">
            <button
              type="button"
              onClick={() => handleRoleSwitch('TOURIST')}
              className={`flex-1 py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                roleTab === 'TOURIST'
                  ? 'bg-white text-orange-600 shadow-sm border border-orange-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>🎒</span>
              <span>Tourist</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSwitch('GUIDE')}
              className={`flex-1 py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                roleTab === 'GUIDE'
                  ? 'bg-white text-amber-700 shadow-sm border border-amber-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>🪪</span>
              <span>Local Guide</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSwitch('AUTHORITY')}
              className={`flex-1 py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                roleTab === 'AUTHORITY'
                  ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Command Desk</span>
            </button>
          </div>

          {/* Global Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-3.5 rounded-2xl text-xs font-bold relative z-10 shadow-xs flex items-start gap-2.5 ${
                  error.includes('Officer Clearance Pending')
                    ? 'bg-amber-50 border border-amber-300 text-amber-900'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {error.includes('Officer Clearance Pending') ? (
                  <>
                    <ShieldCheck className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                    <div className="space-y-0.5 text-left">
                      <p className="font-black text-amber-950 uppercase tracking-wide text-[10px]">
                        Officer Clearance Awaiting DG Approval
                      </p>
                      <p className="text-[11px] font-medium leading-relaxed text-amber-900">
                        {error}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                    <span className="text-center w-full">{error}</span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ROLE 1: AUTHORITY COMMAND DESK */}
          {roleTab === 'AUTHORITY' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Security Banner */}
              <div className="p-3.5 rounded-2xl bg-purple-50/90 border border-purple-200/90 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-purple-950">
                    Restricted Government Authority & Security Desk
                  </h3>
                  <p className="text-[11px] text-purple-800/80 leading-normal mt-0.5">
                    Authorized access for Director General Akhil Gupta and verified SDRF / Police CAD dispatch officers.
                  </p>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Official Command Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-purple-600 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="officer@domain.gov.in"
                      className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-purple-500 focus:bg-white text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Master Security Passphrase
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-purple-600 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-purple-500 focus:bg-white text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  {loading ? (
                    <span>Verifying Security Clearance...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Authenticate & Enter Command Desk</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Departmental officer registration note */}
              <div className="pt-2 text-center text-xs text-slate-500">
                <span>Departmental officer without credentials? </span>
                <Link
                  to="/register?role=authority"
                  className="text-purple-700 font-bold hover:underline"
                >
                  Register Officer Profile
                </Link>
                <p className="text-[10px] text-slate-400 mt-1">
                  (Official registrations require clearance verification by DG Akhil Gupta before activation)
                </p>
              </div>
            </motion.div>
          )}

          {/* ROLE 2: TOURIST LOGIN */}
          {roleTab === 'TOURIST' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {authMode === 'PASSWORD' ? (
                <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Registered Tourist Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-orange-500 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tourist@example.com"
                        className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-orange-500 focus:bg-white text-slate-900 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Account Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-orange-500 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-orange-500 focus:bg-white text-slate-900 font-medium"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 cursor-pointer"
                  >
                    {loading ? (
                      <span>Connecting...</span>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Sign In to Tourist Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </form>
              ) : (
                /* OTP FLOW */
                <div>
                  {otpStep === 'EMAIL' ? (
                    <form onSubmit={handleSendOtp} className="space-y-3.5">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Enter Email for Instant OTP
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-orange-500 absolute left-3.5 top-3.5" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tourist@example.com"
                            className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-orange-500 focus:bg-white text-slate-900 font-medium"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                      <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-medium space-y-1">
                        <p>OTP dispatched to: <strong>{email}</strong></p>
                        {demoOtp && (
                          <div className="flex items-center justify-between pt-1 border-t border-emerald-200">
                            <span className="font-mono font-bold text-sm text-emerald-800">
                              Demo OTP: {demoOtp}
                            </span>
                            <button
                              type="button"
                              onClick={() => setOtpCode(demoOtp)}
                              className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] cursor-pointer"
                            >
                              Auto-Fill
                            </button>
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="w-full text-center tracking-[8px] font-mono text-xl font-bold py-2.5 rounded-xl border border-emerald-400 bg-white"
                      />
                      <button
                        type="submit"
                        disabled={loading || otpCode.length !== 6}
                        className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer shadow-md"
                      >
                        Verify & Access
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Tourist Switch Links */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'PASSWORD' ? 'OTP' : 'PASSWORD')}
                  className="text-orange-600 hover:underline font-semibold cursor-pointer"
                >
                  {authMode === 'PASSWORD' ? 'Use Email OTP Instead' : 'Use Password Instead'}
                </button>
                <div>
                  <span>New Tourist? </span>
                  <Link to="/register" className="text-orange-600 font-bold hover:underline">
                    Get Digital Pass
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* ROLE 3: LOCAL GUIDE LOGIN */}
          {roleTab === 'GUIDE' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-amber-950">
                    Certified Local Heritage Guide Portal
                  </h3>
                  <p className="text-[11px] text-amber-800/80 leading-normal mt-0.5">
                    Access your active tourist escort assignments, direct tourist tips, and Ministry badge credentials.
                  </p>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Licensed Guide Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-amber-600 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="guide@domain.gov.in"
                      className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-amber-500 focus:bg-white text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Guide Passcode
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-amber-600 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:border-amber-500 focus:bg-white text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 cursor-pointer"
                >
                  {loading ? (
                    <span>Verifying Guide License...</span>
                  ) : (
                    <>
                      <Award className="w-4 h-4" />
                      <span>Enter Guide Cockpit</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>

              <div className="pt-2 text-center text-xs text-slate-500">
                <span>Want to register as a certified guide? </span>
                <Link to="/guide-register" className="text-amber-700 font-bold hover:underline">
                  Apply for Accreditation
                </Link>
              </div>
            </motion.div>
          )}

          {/* Footer Security Badges & Simulation Personas */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>TLS 1.3 • AES-256</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">DPDP Act 2023</span>
            </div>

            <button
              type="button"
              onClick={() => setShowDemoModal(true)}
              className="text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>Demo Simulation Personas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Discrete Simulation Personas Modal */}
      <AnimatePresence>
        {showDemoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 relative text-slate-800"
            >
              <button
                onClick={() => setShowDemoModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200">
                  S.A.F.A.R. Field Testbed
                </span>
                <span className="text-xs text-slate-400">1-Click Live Demonstration</span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Select a Verified Field Persona
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Instant login to observe live GPS radar, caution zone breach telemetry, and dispatch command.
              </p>

              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {demoPersonas.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleDemoPersonaLogin(p.email, p.password, p.role)}
                    className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 transition flex items-center justify-between text-left group cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{p.label}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            p.role === 'AUTHORITY'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : p.role === 'GUIDE'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {p.role}
                        </span>
                        {p.tag && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold">
                            {p.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{p.location}</p>
                      <p className="text-[11px] text-slate-400">{p.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
