import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, ShieldAlert, CheckCircle2, XCircle, Clock, Copy, Check, ArrowLeft } from 'lucide-react';

/**
 * PaymentQR
 * 
 * Provider-independent QR Payment Component.
 * In DEMO MODE: Displays demo QR clearly marked, with simulation triggers.
 * In RAZORPAY MODE: Displays official Razorpay QR payload dynamically.
 */
export default function PaymentQR({
  mode = 'demo',
  amount = 0,
  payment = null,
  qrData = '',
  onSimulateSuccess,
  onSimulateFailure,
  onCancel,
  loading = false
}) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isExpired = timeLeft <= 0;

  const handleCopy = () => {
    if (qrData) {
      navigator.clipboard.writeText(qrData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isDemo = mode === 'demo' || payment?.paymentProvider === 'demo';

  return (
    <div className="flex flex-col items-center text-center space-y-5">
      {/* Header Badge */}
      <div className="flex items-center space-x-2">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-sm">
          <ShieldAlert className="w-3.5 h-3.5 mr-1 text-amber-700" />
          {isDemo ? 'DEMO QR MODE — No Real Charge' : 'Official Secure Payment QR'}
        </span>
      </div>

      {/* Amount Display */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount to Pay</p>
        <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-0.5">
          ₹{amount.toLocaleString()}
        </div>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Paying to: <strong className="text-slate-800">{payment?.partnerName || 'SAFAR Partner'}</strong>
        </p>
      </div>

      {/* QR Code Container with Scanner Frame */}
      <div className="relative p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-xl flex flex-col items-center">
        {/* Animated Corner Accents */}
        <div className="absolute top-2 left-2 w-5 h-5 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg" />
        <div className="absolute top-2 right-2 w-5 h-5 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg" />
        <div className="absolute bottom-2 left-2 w-5 h-5 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg" />
        <div className="absolute bottom-2 right-2 w-5 h-5 border-b-4 border-r-4 border-emerald-500 rounded-br-lg" />

        {isExpired ? (
          <div className="w-52 h-52 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl text-slate-500">
            <Clock className="w-10 h-10 text-slate-400 mb-2" />
            <p className="font-bold text-sm">QR Code Expired</p>
            <p className="text-xs text-slate-400 mt-1">Please go back and regenerate</p>
          </div>
        ) : (
          <div className="p-2 bg-white rounded-2xl">
            <QRCodeSVG
              value={qrData || `upi://pay?pa=demo-safar@gov.in&pn=SAFAR+Demo&am=${amount}&cu=INR`}
              size={200}
              level="M"
              includeMargin={false}
              className="rounded-lg"
            />
          </div>
        )}

        {/* Demo Watermark Banner Across QR */}
        {isDemo && !isExpired && (
          <div className="mt-2 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[11px] font-black text-amber-800 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>Demo QR — Safe Simulation Only</span>
          </div>
        )}

        {/* Countdown Timer */}
        <div className="mt-3 flex items-center space-x-1.5 text-xs text-slate-500 font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Valid for: <strong>{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</strong></span>
        </div>
      </div>

      <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
        Scan with your favorite UPI App (Google Pay, PhonePe, Paytm, BHIM).
        {isDemo && (
          <span className="block mt-1 font-semibold text-amber-700">
            Since this is Demo Mode, you can test the entire flow using the simulation buttons below:
          </span>
        )}
      </p>

      {/* Demo Simulation Action Buttons */}
      {isDemo && !isExpired && (
        <div className="w-full max-w-md space-y-2.5 pt-2">
          <button
            type="button"
            onClick={onSimulateSuccess}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl font-black text-xs text-white flex items-center justify-center space-x-2 shadow-lg hover:shadow-emerald-500/25 transition-all transform active:scale-[0.98] cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            }}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-100" />
            <span>Simulate Successful Payment (₹{amount})</span>
          </button>

          <button
            type="button"
            onClick={onSimulateFailure}
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl font-bold text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98] cursor-pointer"
          >
            <XCircle className="w-4 h-4 text-rose-500" />
            <span>Simulate Failed Payment</span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-2xl font-bold text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center justify-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel & Change Payment Method</span>
          </button>
        </div>
      )}

      {/* Copy UPI Intent String for manual debugging */}
      <button
        type="button"
        onClick={handleCopy}
        className="text-[11px] font-mono text-slate-400 hover:text-slate-600 flex items-center space-x-1"
      >
        {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
        <span>{copied ? 'Copied Demo UPI Intent' : 'Copy Raw QR Intent'}</span>
      </button>
    </div>
  );
}
