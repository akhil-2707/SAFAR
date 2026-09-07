import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, UserCheck, ShieldAlert, ArrowRight, Mail, KeyRound, 
  CheckCircle2, Sparkles, RefreshCw, Send, Compass, ShieldCheck, MapPin
} from 'lucide-react';
import SafarLogo from '../components/SafarLogo';

export default function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  // Default to 1-Click Instant Login (No OTP friction)
  const [activeTab, setActiveTab] = useState('1CLICK'); // '1CLICK' | 'PASSWORD' | 'OTP'

  // Email OTP States (optional fallback)
  const [email, setEmail] = useState('');
  const [otpStep, setOtpStep] = useState('EMAIL'); // 'EMAIL' | 'VERIFY'
  const [otpCode, setOtpCode] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [otpSuccessMessage, setOtpSuccessMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Standard Password State
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(null);
  const [error, setError] = useState(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Direct 1-Click Instant Login
  const handleDirectLogin = async (targetEmail) => {
    setLoading(true);
    setLoadingEmail(targetEmail);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: 'tourist123' })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Login failed');
      onLoginSuccess(data);
      if (data.user.role === 'AUTHORITY') navigate('/authority-dashboard');
      else navigate('/tourist-dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingEmail(null);
    }
  };

  // Handle Password Submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Login failed');
      onLoginSuccess(data);
      if (data.user.role === 'AUTHORITY') navigate('/authority-dashboard');
      else navigate('/tourist-dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Optional Send OTP
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
      setOtpSuccessMessage(data.message || `OTP dispatched to ${email}`);
      setOtpStep('VERIFY');
      setResendCooldown(45);
      setOtpCode('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Optional Verify OTP Login
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
      if (data.user.role === 'AUTHORITY') navigate('/authority-dashboard');
      else navigate('/tourist-dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Curated demo locations as requested: Ayodhya, Jammu, Taj Mahal, Real-Time Location, and Command Desk
  const demoAccounts = [
    {
      id: 'ayodhya',
      label: '🛕 Ayodhya',
      location: 'Ram Janmabhoomi & Saryu Corridor',
      name: 'Ananya Mishra',
      email: 'ananya.mishra@example.com',
      role: 'TOURIST',
      badge: 'Pilgrim Hub',
      gradient: 'linear-gradient(135deg, rgba(255,247,237,0.98), rgba(255,255,255,0.99))',
      border: 'rgba(249,115,22,0.35)',
      btnGrad: 'linear-gradient(135deg, #f97316, #ea580c)'
    },
    {
      id: 'jammu',
      label: '🏔️ Jammu',
      location: 'Katra Vaishno Devi Bhawan Track',
      name: 'Vikas Chandel',
      email: 'vikas.chandel@example.com',
      role: 'TOURIST',
      badge: 'Mountain Route',
      gradient: 'linear-gradient(135deg, rgba(240,249,255,0.98), rgba(255,255,255,0.99))',
      border: 'rgba(14,165,233,0.35)',
      btnGrad: 'linear-gradient(135deg, #0284c7, #0369a1)'
    },
    {
      id: 'tajmahal',
      label: '🕌 Taj Mahal',
      location: 'Agra World Heritage Complex',
      name: 'Aarav Sharma',
      email: 'aarav.taj@example.com',
      role: 'TOURIST',
      badge: 'UNESCO Heritage',
      gradient: 'linear-gradient(135deg, rgba(240,253,244,0.98), rgba(255,255,255,0.99))',
      border: 'rgba(16,185,129,0.35)',
      btnGrad: 'linear-gradient(135deg, #10b981, #059669)'
    },
    {
      id: 'realtime',
      label: '📍 Real-Time Location',
      location: 'Live Physical Device GPS & Telemetry',
      name: 'Real Device Tourist',
      email: 'reallive@safetour.gov.in',
      role: 'TOURIST',
      badge: 'Real Device GPS',
      gradient: 'linear-gradient(135deg, rgba(238,242,255,0.98), rgba(255,255,255,0.99))',
      border: 'rgba(99,102,241,0.4)',
      btnGrad: 'linear-gradient(135deg, #4f46e5, #4338ca)'
    },
    {
      id: 'authority',
      label: '🏛️ Command Desk',
      location: 'National Safety & Emergency Dispatch',
      name: 'Dr. Ananya Sharma',
      email: 'authority@safetour.gov.in',
      role: 'AUTHORITY',
      badge: 'Central Desk',
      gradient: 'linear-gradient(135deg, rgba(245,243,255,0.98), rgba(255,255,255,0.99))',
      border: 'rgba(139,92,246,0.4)',
      btnGrad: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    }
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-12 relative overflow-hidden"
      style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>

      {/* Dynamic Aurora Glow Orbs */}
      <motion.div className="absolute -top-20 -left-20 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'rgba(249,115,22,0.18)', filter: 'blur(80px)' }}
        animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 7, repeat: Infinity }} />
      <motion.div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'rgba(139,92,246,0.18)', filter: 'blur(80px)' }}
        animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 9, repeat: Infinity, delay: 2 }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="rounded-3xl p-6 sm:p-9 space-y-6 relative overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.94)',
            backdropFilter: 'blur(24px)',
            border: '1.5px solid rgba(255,255,255,0.95)',
            boxShadow: '0 30px 80px rgba(139,92,246,0.12), 0 8px 24px rgba(249,115,22,0.08)',
          }}>

          {/* Header */}
          <div className="text-center space-y-2 relative z-10">
            <div className="flex justify-center">
              <SafarLogo size="lg" showText={false} animated={true} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                S.A.F.A.R. Secure Portal
              </h1>
              <p className="text-xs sm:text-sm font-bold mt-1" style={{ color: '#ea580c' }}>
                Smart AI Framework for Assured & Responsible Tourism
              </p>
            </div>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Ministry of Tourism • Government of India Tourist Safety System
            </p>
          </div>

          {/* Authentication Mode Switcher */}
          <div className="flex items-center justify-center p-1 rounded-2xl bg-slate-100/90 border border-slate-200/80 max-w-sm mx-auto relative z-10 text-xs font-bold">
            <button
              onClick={() => { setActiveTab('1CLICK'); setError(null); }}
              className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === '1CLICK'
                  ? 'bg-white text-orange-600 shadow-md border border-orange-200'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>⚡ 1-Click Fast Login</span>
            </button>

            <button
              onClick={() => { setActiveTab('PASSWORD'); setError(null); }}
              className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'PASSWORD'
                  ? 'bg-white text-slate-800 shadow-md border border-slate-200'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Password Login</span>
            </button>
          </div>

          {/* Global Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="p-3.5 rounded-2xl text-red-700 text-xs font-bold text-center relative z-10 bg-red-50 border border-red-200 shadow-xs">
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* TAB 1: 1-CLICK INSTANT DEMO LOGIN (DEFAULT & FAST) */}
          {activeTab === '1CLICK' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 relative z-10"
            >
              <div className="text-center">
                <span className="text-xs font-black uppercase tracking-wider text-gray-500">
                  Select a Demo Location to Enter Instantly:
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {demoAccounts.map((acc) => {
                  const isCurrentLoading = loadingEmail === acc.email;
                  return (
                    <motion.div
                      key={acc.id}
                      whileHover={{ y: -3, scale: 1.01 }}
                      className="rounded-2xl p-4 flex flex-col justify-between space-y-3"
                      style={{
                        background: acc.gradient,
                        border: `1.5px solid ${acc.border}`,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                      }}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-base font-black text-gray-900">{acc.label}</span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/80 text-gray-700 border border-gray-200 shadow-xs">
                            {acc.badge}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-gray-800">{acc.name}</p>
                        <p className="text-[11px] text-gray-500 flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                          <span className="truncate">{acc.location}</span>
                        </p>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        onClick={() => handleDirectLogin(acc.email)}
                        className="w-full py-2.5 text-white font-black text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-all"
                        style={{ background: acc.btnGrad }}
                      >
                        {isCurrentLoading ? (
                          <span>Connecting...</span>
                        ) : (
                          <>
                            <span>{acc.role === 'AUTHORITY' ? '🚀 Enter Command Desk' : `🚀 Enter (${acc.label.split(' ')[1] || 'Tourist'})`}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 2: PASSWORD LOGIN */}
          {activeTab === 'PASSWORD' && (
            <motion.form
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              onSubmit={handlePasswordSubmit}
              className="space-y-4 relative z-10"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-700 font-bold block mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl p-3 text-sm text-gray-800 focus:outline-none"
                    style={{ background: 'rgba(0,0,0,0.04)', border: '1.5px solid rgba(0,0,0,0.1)' }}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-700 font-bold block mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl p-3 text-sm text-gray-800 focus:outline-none"
                    style={{ background: 'rgba(0,0,0,0.04)', border: '1.5px solid rgba(0,0,0,0.1)' }}
                  />
                </div>
              </div>

              {/* Demo Account Fill Chips */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-gray-500 block">Quick Auto-Fill:</span>
                <div className="flex flex-wrap gap-1.5">
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => { setEmail(acc.email); setPassword('tourist123'); setError(null); }}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl transition-all border ${
                        email === acc.email
                          ? 'bg-orange-500 text-white border-orange-600 shadow-xs'
                          : 'bg-white hover:bg-orange-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      <span>{acc.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 font-bold text-sm rounded-2xl flex items-center justify-center space-x-2 bg-slate-800 text-white shadow-md hover:bg-slate-900 transition-all"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In With Password'}</span>
                <Lock className="w-3.5 h-3.5" />
              </motion.button>
            </motion.form>
          )}

          {/* TAB 3: OPTIONAL EMAIL OTP (Tucked away, non-intrusive) */}
          {activeTab === 'OTP' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 relative z-10"
            >
              {otpStep === 'EMAIL' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-700 font-extrabold block">Email Address:</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-orange-500 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. tourist@example.com"
                        className="w-full rounded-2xl pl-10 pr-4 py-3 text-sm text-gray-900 font-medium focus:outline-none"
                        style={{ background: 'rgba(255,247,237,0.8)', border: '1.5px solid rgba(251,146,60,0.4)' }}
                      />
                    </div>
                  </div>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 text-white font-black text-xs rounded-xl flex items-center justify-center space-x-2 shadow-md"
                    style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                  >
                    <span>{loading ? 'Sending...' : 'Send OTP Code'}</span>
                  </motion.button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-950 space-y-2 text-xs">
                    <p className="font-bold">Code sent to: {email}</p>
                    {demoOtp && (
                      <div className="flex items-center justify-between border-t border-emerald-200 pt-1.5">
                        <span className="font-mono font-black text-base text-emerald-800">OTP: {demoOtp}</span>
                        <button
                          type="button"
                          onClick={() => setOtpCode(demoOtp)}
                          className="px-2 py-1 bg-emerald-600 text-white rounded font-bold text-[10px]"
                        >
                          Auto Fill
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
                    className="w-full text-center tracking-[10px] font-mono text-xl font-black rounded-xl py-2.5 text-gray-900 border border-emerald-400"
                  />
                  <motion.button
                    type="submit"
                    disabled={loading || otpCode.length !== 6}
                    className="w-full py-3 text-white font-black text-xs rounded-xl bg-emerald-600 shadow-md"
                  >
                    <span>Verify & Login</span>
                  </motion.button>
                </form>
              )}
            </motion.div>
          )}

          {/* Footer & Option to switch to Email OTP if needed */}
          <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2 relative z-10">
            <div>
              Need an ID?{' '}
              <Link to="/register" className="font-extrabold hover:underline" style={{ color: '#ea580c' }}>
                Register Here
              </Link>
            </div>
            <div>
              {activeTab !== 'OTP' ? (
                <button
                  type="button"
                  onClick={() => { setActiveTab('OTP'); setError(null); }}
                  className="text-gray-400 hover:text-orange-600 underline text-[11px]"
                >
                  Use Email OTP Login
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setActiveTab('1CLICK'); setError(null); }}
                  className="text-orange-600 hover:text-orange-800 font-bold underline text-[11px]"
                >
                  Back to 1-Click Login
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
