import React, { useState } from 'react';
import { AtSign, ShieldAlert, CheckCircle2, XCircle, ArrowLeft, Check } from 'lucide-react';

/**
 * UPIIdInput
 * 
 * Component for paying via custom UPI Virtual Payment Address (VPA).
 * In DEMO MODE: Validates UPI ID syntax and allows realistic payment simulation.
 * In RAZORPAY MODE: Connects to Razorpay UPI Collect API flow.
 */
export default function UPIIdInput({
  amount = 0,
  partnerName = 'SAFAR Partner',
  onSimulateSuccess,
  onSimulateFailure,
  onCancel,
  loading = false
}) {
  const [upiId, setUpiId] = useState('tourist@upi');
  const [isValid, setIsValid] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const validateUpi = (value) => {
    // Standard UPI VPA format: username@bank
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,49}@[a-zA-Z]{2,}$/;
    if (!value || value.trim().length === 0) {
      setIsValid(false);
      setErrorMsg('UPI ID cannot be empty');
      return false;
    }
    if (!upiRegex.test(value.trim())) {
      setIsValid(false);
      setErrorMsg('Invalid UPI ID format. Expected format: username@bank (e.g. rahul@okhdfcbank)');
      return false;
    }
    setIsValid(true);
    setErrorMsg('');
    return true;
  };

  const handleChange = (e) => {
    const val = e.target.value.toLowerCase().trim();
    setUpiId(val);
    if (val.includes('@')) {
      validateUpi(val);
    }
  };

  const handleSuccess = () => {
    if (validateUpi(upiId)) {
      onSimulateSuccess(upiId);
    }
  };

  const handleFailure = () => {
    if (validateUpi(upiId)) {
      onSimulateFailure(upiId);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-5">
      <div className="text-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-sm mb-2">
          <ShieldAlert className="w-3.5 h-3.5 mr-1 text-amber-700" />
          <span>DEMO UPI COLLECT MODE</span>
        </div>
        <h3 className="text-xl font-black text-slate-900">Pay using UPI ID</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Transfer ₹<strong>{amount.toLocaleString()}</strong> to {partnerName}
        </p>
      </div>

      {/* Input Field */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 block">
          Virtual Payment Address (VPA)
        </label>
        <div className="relative">
          <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={upiId}
            onChange={handleChange}
            placeholder="e.g. mobile@upi or name@okhdfcbank"
            className={`w-full pl-10 pr-4 py-3 rounded-2xl border font-mono text-sm font-bold text-slate-900 bg-white focus:outline-none transition-all ${
              isValid ? 'border-slate-300 focus:ring-2 focus:ring-emerald-500' : 'border-rose-300 focus:ring-2 focus:ring-rose-500'
            }`}
          />
        </div>
        {errorMsg && (
          <p className="text-[11px] font-medium text-rose-600 pl-1">{errorMsg}</p>
        )}

        {/* Quick Demo UPI suggestions */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="text-[10px] text-slate-400 font-bold self-center">Demo VPAs:</span>
          {['tourist@upi', 'ananya@okhdfcbank', '9876543210@paytm', 'safar.user@icici'].map((demoVpa) => (
            <button
              key={demoVpa}
              type="button"
              onClick={() => {
                setUpiId(demoVpa);
                setIsValid(true);
                setErrorMsg('');
              }}
              className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
            >
              {demoVpa}
            </button>
          ))}
        </div>
      </div>

      {/* Demo Warning Card */}
      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
        <p className="font-bold flex items-center space-x-1">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-700 inline" />
          <span>Demo Payment Mode</span>
        </p>
        <p className="text-[11px] text-amber-800 mt-1">
          No collect request will actually be sent to your bank app. Use the simulation buttons below to test the full lifecycle.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-2">
        <button
          type="button"
          onClick={handleSuccess}
          disabled={loading || !isValid}
          className="w-full py-3.5 px-4 rounded-2xl font-black text-xs text-white shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98] cursor-pointer disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
          }}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-100" />
          <span>Simulate Successful Payment (₹{amount})</span>
        </button>

        <button
          type="button"
          onClick={handleFailure}
          disabled={loading}
          className="w-full py-3 px-4 rounded-2xl font-bold text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98] cursor-pointer"
        >
          <XCircle className="w-4 h-4 text-rose-500" />
          <span>Simulate Collect Request Declined</span>
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-2xl font-bold text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center justify-center space-x-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Cancel & Choose Other Method</span>
        </button>
      </div>
    </div>
  );
}
