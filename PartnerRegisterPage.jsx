import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, User, Mail, Lock, Phone, MapPin, ArrowRight, AlertCircle, Store, FileCheck } from 'lucide-react';
import SafarLogo from '../../components/SafarLogo';

export default function PartnerRegisterPage({ onRegisterSuccess }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    password: '',
    mobileNumber: '',
    businessType: 'Tour Operator',
    gstNumber: '',
    address: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // For demo, we bypass backend reg and login with the mocked partner account:
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'contact@himalayantours.in', password: 'tourist123' })
      });
      const data = await loginRes.json();
      if (!data.success) throw new Error(data.error || 'Registration failed');
      
      if (onRegisterSuccess) onRegisterSuccess(data);
      navigate('/partner-dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        
        <div className="bg-emerald-600 px-6 py-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-emerald-500 opacity-50 blur-2xl"></div>
          <div className="relative z-10 space-y-3">
            <div className="flex justify-center mb-2">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm border border-white/30">
                <Store className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Become a S.A.F.A.R. Partner</h2>
            <p className="text-emerald-50 text-sm font-medium">Join the Verified Tour Marketplace and grow your business</p>
          </div>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Business Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Store className="h-5 w-5 text-slate-400" />
                  </div>
                  <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} required
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium bg-slate-50 transition-colors"
                    placeholder="E.g. Himalayan Treks" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Contact Person</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} required
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium bg-slate-50 transition-colors"
                    placeholder="Your Name" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium bg-slate-50 transition-colors"
                    placeholder="contact@agency.in" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Mobile Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium bg-slate-50 transition-colors"
                    placeholder="+91 9876543210" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">GST / Business Registration No.</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileCheck className="h-5 w-5 text-slate-400" />
                </div>
                <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} required
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium bg-slate-50 transition-colors"
                  placeholder="22AAAAA0000A1Z5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium bg-slate-50 transition-colors"
                  placeholder="Create a strong password" />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-4 rounded-xl font-bold text-[15px] shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.98]"
              >
                <span>{loading ? 'Submitting...' : 'Register as S.A.F.A.R. Partner'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-center text-xs text-slate-500 font-medium pt-2">
              By registering, your profile will be sent to the Authority Panel for verification.
            </p>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-4">
            <Link to="/login" className="inline-block text-emerald-600 font-bold text-sm hover:underline">
              Already a registered Partner? Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
