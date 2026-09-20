import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Award, ShieldCheck, User, Mail, Lock, Phone, MapPin, 
  Languages, FileCheck, ArrowRight, CheckCircle2, Star, Sparkles 
} from 'lucide-react';
import SafarLogo from '../components/SafarLogo';

export default function GuideRegisterPage({ onRegisterSuccess }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    city: 'Ayodhya',
    operatingDestinations: 'Ram Janmabhoomi, Saryu Ghat, Hanuman Garhi',
    languages: 'Hindi, English',
    experienceYears: 5,
    specialization: 'Spiritual & Heritage Corridor',
    idProofType: 'Ministry of Tourism License',
    idProofNumber: '',
    dailyRate: 1500,
    hourlyRate: 350,
    bio: ''
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
      const res = await fetch('/api/guides/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Guide registration failed');
      }

      // Automatically log the registered guide in
      if (onRegisterSuccess) {
        onRegisterSuccess(data);
      }
      navigate('/guide-dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
      <div className="rounded-3xl p-6 sm:p-10 bg-white/95 border-2 border-amber-300/80 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
        {/* Tricolor Strip */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="flex justify-center">
            <SafarLogo size="md" showText={false} animated={true} />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block mb-1">
              Ministry of Tourism • Govt. of India
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Register as a Verified Local Guide
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto mt-1">
              Join the official S.A.F.A.R. Tourist Safety Grid. Receive a Blockchain Digital ID, accept travelers, and build verified reputation.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Personal & Account */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-700 flex items-center space-x-1 border-b border-gray-100 pb-1">
              <User className="w-3.5 h-3.5" />
              <span>Personal & Account Credentials</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Rajesh Kumar Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-xs sm:text-sm text-gray-900 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Mobile Phone Number *</label>
                <input
                  type="tel"
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-xs sm:text-sm text-gray-900 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Email Address *</label>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="rajesh.guide@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-xs sm:text-sm text-gray-900 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Create Password *</label>
                <input
                  type="password"
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-xs sm:text-sm text-gray-900 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Operating Destination & Specialization */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-700 flex items-center space-x-1 border-b border-gray-100 pb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Operating Circuit & Expertise</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Primary Operating City *</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-xs sm:text-sm text-gray-900 bg-white"
                >
                  <option value="Ayodhya">Ayodhya (Ram Janmabhoomi)</option>
                  <option value="Agra">Agra (Taj Mahal & Fort)</option>
                  <option value="Varanasi">Varanasi (Kashi & Ghats)</option>
                  <option value="Kaziranga / Guwahati">Kaziranga & Guwahati</option>
                  <option value="Jaipur">Jaipur (Pink City & Forts)</option>
                  <option value="Jammu / Katra">Jammu & Katra Vaishno Devi</option>
                  <option value="Shillong / Cherrapunji">Shillong & Meghalaya</option>
                  <option value="Delhi NCR">Delhi NCR Heritage</option>
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-gray-700">Specific Circuits / Monuments</label>
                <input
                  type="text"
                  name="operatingDestinations"
                  value={formData.operatingDestinations}
                  onChange={handleChange}
                  placeholder="e.g. Ram Janmabhoomi, Saryu River, Hanuman Garhi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-xs sm:text-sm text-gray-900 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Experience (Years)</label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  name="experienceYears"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-xs sm:text-sm text-gray-900 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Spoken Languages</label>
                <input
                  type="text"
                  name="languages"
                  value={formData.languages}
                  onChange={handleChange}
                  placeholder="e.g. Hindi, English, Sanskrit"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-xs sm:text-sm text-gray-900 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="e.g. Spiritual & Temple Heritage"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-xs sm:text-sm text-gray-900 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Govt Identification & Tariffs */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-700 flex items-center space-x-1 border-b border-gray-100 pb-1">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Government Identity & Tariff</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-gray-700">Govt ID Proof Type *</label>
                <select
                  name="idProofType"
                  value={formData.idProofType}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-xs sm:text-sm text-gray-900 bg-white"
                >
                  <option value="Ministry of Tourism License">Ministry of Tourism License (Central)</option>
                  <option value="State Tourism Dept Badge">State Tourism Dept Badge (State Govt)</option>
                  <option value="Aadhaar Card">Aadhaar Card (National UID)</option>
                  <option value="Forest Dept Eco-Guide Permit">Forest Dept Eco-Guide Permit</option>
                  <option value="Archaeological Survey of India (ASI) License">ASI Monument License</option>
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-gray-700">Govt Document / License No. *</label>
                <input
                  type="text"
                  required
                  name="idProofNumber"
                  value={formData.idProofNumber}
                  onChange={handleChange}
                  placeholder="e.g. MOT-UP-AYD-2024-88 or 12-digit Aadhaar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-xs sm:text-sm text-gray-900 bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Standard Daily Tariff (₹)</label>
                <input
                  type="number"
                  name="dailyRate"
                  value={formData.dailyRate}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-xs sm:text-sm text-gray-900 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Hourly Rate (₹)</label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-xs sm:text-sm text-gray-900 bg-white"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-gray-700">Professional Bio & Experience Summary</label>
                <input
                  type="text"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="e.g. Certified heritage guide with 8 years escorting pilgrims in Ayodhya."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-xs sm:text-sm text-gray-900 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Safety Notice */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start space-x-3 text-xs text-amber-900">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block">Official Verification Process:</strong>
              Once registered, your details will be verified by the S.A.F.A.R. Authority Desk. Upon approval, an immutable Digital Guide ID will be generated on the Blockchain Ledger with a verifiable QR code.
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <Link to="/login" className="text-xs font-bold text-gray-500 hover:text-gray-900">
              Already registered as a Guide? Log in here →
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-white font-black text-sm flex items-center justify-center space-x-2 shadow-xl transition-all"
              style={{
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                boxShadow: '0 6px 20px rgba(249, 115, 22, 0.4)'
              }}
            >
              {loading ? (
                <span>Registering Profile...</span>
              ) : (
                <>
                  <span>Submit for Official Certification</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
