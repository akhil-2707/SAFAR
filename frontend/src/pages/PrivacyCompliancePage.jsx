import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Trash2, CheckCircle2, FileText, Server, AlertCircle, RefreshCw, Key } from 'lucide-react';

export default function PrivacyCompliancePage() {
  const [privacyAudit, setPrivacyAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erasureLoading, setErasureLoading] = useState(false);
  const [erasureResult, setErasureResult] = useState(null);

  useEffect(() => {
    fetchPrivacyData();
  }, []);

  const fetchPrivacyData = async () => {
    try {
      const res = await fetch('/api/privacy/status?touristId=TID-1024');
      const data = await res.json();
      if (data.success) {
        setPrivacyAudit(data.privacyAudit);
      }
    } catch (err) {
      console.error('Privacy Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleErasureRequest = async () => {
    if (!window.confirm('Are you sure you want to execute Cryptographic Data Erasure under DPDP Act 2023? This will wipe transient GPS history & contact metadata.')) return;
    setErasureLoading(true);
    try {
      const res = await fetch('/api/privacy/erasure-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          touristId: 'TID-1024',
          reason: 'User exercised Right to Erasure under DPDP Act 2023 Section 12'
        })
      });
      const data = await res.json();
      if (data.success) {
        setErasureResult(data.erasureTicket);
        fetchPrivacyData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setErasureLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-white/95 border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold shadow-sm">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-widest text-emerald-800">
                  Data Governance & Legal Compliance
                </span>
                <span className="bg-emerald-50 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-sm">
                  DPDP ACT 2023 COMPLIANT
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Digital Personal Data Protection Center</h1>
            </div>
          </div>

          <button
            onClick={fetchPrivacyData}
            className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold border border-gray-300 flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
            <span>Audit Privacy Status</span>
          </button>
        </div>
        <p className="text-xs text-gray-600 max-w-3xl leading-relaxed">
          SafeTour NE explicitly complies with the <strong className="text-gray-900 font-bold">DPDP Act 2023 (Republic of India)</strong>. Tourist data collection is strictly consent-based, data-minimized, and protected using SHA-256 cryptographic hashing with complete <strong>Right to Erasure</strong> support.
        </p>
      </div>

      {/* Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Consent Framework Card */}
        <div className="bg-white/95 border border-gray-200/80 rounded-3xl p-6 shadow-lg space-y-4 backdrop-blur-xl">
          <div className="flex items-center space-x-2.5 text-emerald-700 border-b border-gray-100 pb-3">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="text-base font-bold text-gray-900">1. Consent-Based Access</h3>
          </div>
          <div className="space-y-2.5 text-xs text-gray-700">
            <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-200 shadow-sm">
              <span className="font-medium">Location GPS Tracking</span>
              <span className="text-emerald-700 font-extrabold">OPTED-IN (ACTIVE)</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-200 shadow-sm">
              <span className="font-medium">Digital ID Cryptographic Hash</span>
              <span className="text-emerald-700 font-extrabold">CONSENTED</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-200 shadow-sm">
              <span className="font-medium">Emergency 112 Dispatch</span>
              <span className="text-emerald-700 font-extrabold">CONSENTED</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-200 shadow-sm">
              <span className="font-medium">Anonymized AI Model Retraining</span>
              <span className="text-emerald-700 font-extrabold">OPTED-IN</span>
            </div>
          </div>
        </div>

        {/* 2. Data Minimization & Retention Policy Card */}
        <div className="bg-white/95 border border-gray-200/80 rounded-3xl p-6 shadow-lg space-y-4 backdrop-blur-xl">
          <div className="flex items-center space-x-2.5 text-cyan-700 border-b border-gray-100 pb-3">
            <Server className="w-5 h-5" />
            <h3 className="text-base font-bold text-gray-900">2. Data Minimization</h3>
          </div>
          <div className="space-y-2 text-xs text-gray-700">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Storage Server:</span>
              <div className="font-semibold text-gray-900">MeitY-Empaneled Cloud Data Center (India)</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Retention Schedule:</span>
              <div className="font-semibold text-gray-900">Auto-Purged 30 Days Post Travel Validity</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Commercial Policy:</span>
              <div className="font-bold text-emerald-700">Zero Commercial Sharing / No Data Sale</div>
            </div>
          </div>
        </div>

        {/* 3. Right to Erasure Action Card */}
        <div className="bg-white/95 border-2 border-red-200 rounded-3xl p-6 shadow-lg space-y-4 flex flex-col justify-between backdrop-blur-xl">
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5 text-red-600 border-b border-gray-100 pb-3">
              <Trash2 className="w-5 h-5" />
              <h3 className="text-base font-bold text-gray-900">3. Right to Erasure</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Under DPDP Act 2023 Section 12, tourists can execute 1-click <strong className="text-gray-900">Cryptographic Data Erasure</strong> to purge personal location trail data instantly.
            </p>
          </div>

          <button
            disabled={erasureLoading}
            onClick={handleErasureRequest}
            className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>{erasureLoading ? 'Purging Cryptographic Data...' : 'Execute Cryptographic Erasure'}</span>
          </button>
        </div>

      </div>

      {/* Erasure Execution Ticket Notification */}
      {erasureResult && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-emerald-800 font-black text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>DPDP ACT 2023 CRYPTOGRAPHIC DATA ERASURE TICKET EXECUTED</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-emerald-200 space-y-2 text-xs shadow-sm">
            <div className="flex justify-between font-mono text-emerald-800 font-bold">
              <span>Ticket ID: {erasureResult.ticketId}</span>
              <span>Timestamp: {new Date(erasureResult.timestamp).toLocaleString()}</span>
            </div>
            <div className="text-gray-700">
              <strong className="text-gray-900">Purged Data Types:</strong> {erasureResult.erasedFields.join(', ')}
            </div>
            <div className="text-gray-600 text-[11px]">
              Status: <span className="font-black text-emerald-700">{erasureResult.status}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
