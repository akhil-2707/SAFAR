import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Key, UserCheck, ShieldAlert, ArrowRight } from 'lucide-react';

import SafarLogo from '../components/SafarLogo';

export default function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('rohan.verma@example.com');
  const [password, setPassword] = useState('tourist123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
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
      if (data.user.role === 'AUTHORITY') {
        navigate('/authority-dashboard');
      } else {
        navigate('/tourist-dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectLogin = async (role) => {
    setLoading(true);
    setError(null);
    const targetEmail = role === 'AUTHORITY' ? 'authority@safetour.gov.in' : 'rohan.verma@example.com';
    const targetPassword = 'admin123';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: targetPassword })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Login failed');

      onLoginSuccess(data);
      if (data.user.role === 'AUTHORITY') {
        navigate('/authority-dashboard');
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
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-safar-navy-900 border border-safar-shield-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
        
        {/* Header with S.A.F.A.R. Logo */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <SafarLogo size="lg" showText={false} animated={true} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">S.A.F.A.R. Gateway Login</h2>
            <p className="text-xs text-safar-saffron-400 font-bold uppercase tracking-wider mt-0.5">
              Smart AI Framework for Assured & Responsible Tourism
            </p>
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Direct 1-Click Evaluation Access for Hackathon Judges & Field Teams
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-red-300 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* 1-CLICK DIRECT DEMO LOGIN CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Card 1: Authority Direct Login */}
          <div className="bg-slate-900/90 border-2 border-teal-500/40 hover:border-teal-400 rounded-2xl p-5 shadow-xl transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-6 h-6" />
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Command Desk
                </span>
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-teal-300 transition-colors">
                Authority Portal
              </h3>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                • Edit & Create Restricted Zones<br />
                • Set Hazard Radius / Area Meters<br />
                • Monitor Tourist Violations & Emergency SOS
              </p>
            </div>

            <button
              disabled={loading}
              onClick={() => handleDirectLogin('AUTHORITY')}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Logging In...' : '🚀 Direct Login as Authority'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Tourist Direct Login */}
          <div className="bg-slate-900/90 border-2 border-emerald-500/40 hover:border-emerald-400 rounded-2xl p-5 shadow-xl transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                  <UserCheck className="w-6 h-6" />
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/20">
                  Tourist Portal
                </span>
              </div>
              <h3 className="text-lg font-black text-white group-hover:text-emerald-300 transition-colors">
                Tourist Safety Hub
              </h3>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                • View SHA-256 Crypto Digital ID & QR<br />
                • Track AI Safety Score (0-100)<br />
                • Trigger 1-Click Emergency SOS Dispatch
              </p>
            </div>

            <button
              disabled={loading}
              onClick={() => handleDirectLogin('TOURIST')}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Logging In...' : '🚀 Direct Login as Tourist'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Standard Manual Login Form */}
        <div className="pt-6 border-t border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Or Standard Credentials Login:</span>
            <span className="text-[10px] text-slate-500">Password protected for production</span>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In With Credentials'}</span>
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </div>
          </form>
        </div>

        <div className="text-center text-xs text-slate-400">
          Need a Digital Tourist ID?{' '}
          <Link to="/register" className="text-emerald-400 hover:underline font-bold">
            Register Here
          </Link>
        </div>

      </div>
    </div>
  );
}
