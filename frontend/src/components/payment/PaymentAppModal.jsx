import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, CheckCircle2, XCircle, ArrowLeft, Smartphone, Building2 } from 'lucide-react';

export const PAYMENT_APPS_CONFIG = {
  demo_paytm: {
    id: 'demo_paytm',
    name: 'Paytm',
    shortName: 'Paytm',
    color: '#00BAF2',
    bgColor: '#E6F8FE',
    tagline: 'Paytm UPI & Wallet Simulation',
    iconText: 'Paytm',
    iconEmoji: '🔵'
  },
  demo_phonepe: {
    id: 'demo_phonepe',
    name: 'PhonePe',
    shortName: 'PhonePe',
    color: '#5F259F',
    bgColor: '#F3E8FD',
    tagline: 'PhonePe UPI Secure Simulation',
    iconText: 'PhonePe',
    iconEmoji: '💜'
  },
  demo_gpay: {
    id: 'demo_gpay',
    name: 'Google Pay',
    shortName: 'GPay',
    color: '#34A853',
    bgColor: '#E6F4EA',
    tagline: 'Google Pay (Tez) UPI Simulation',
    iconText: 'GPay',
    iconEmoji: '🟢'
  },
  demo_bhim: {
    id: 'demo_bhim',
    name: 'BHIM UPI',
    shortName: 'BHIM',
    color: '#0059B2',
    bgColor: '#E8F1FC',
    tagline: 'NPCI Bharat Interface for Money',
    iconText: 'BHIM',
    iconEmoji: '🇮🇳'
  },
  demo_upi: {
    id: 'demo_upi',
    name: 'Generic UPI App',
    shortName: 'UPI',
    color: '#1C1C1E',
    bgColor: '#F2F2F7',
    tagline: 'Any Installed UPI Application',
    iconText: 'UPI',
    iconEmoji: '📲'
  }
};

/**
 * PaymentAppModal
 * 
 * Realistic checkout bottom sheet for selected Payment Apps (Paytm, PhonePe, GPay, BHIM, UPI)
 * in Demo Simulation Mode.
 */
export default function PaymentAppModal({
  isOpen,
  onClose,
  appKey = 'demo_paytm',
  amount = 0,
  partnerName = 'SAFAR Certified Partner',
  onSimulateSuccess,
  onSimulateFailure,
  loading = false
}) {
  if (!isOpen) return null;

  const app = PAYMENT_APPS_CONFIG[appKey] || PAYMENT_APPS_CONFIG.demo_paytm;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop click */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative z-10 w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-5 border border-slate-200"
        >
          {/* Mobile swipe notch */}
          <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto sm:hidden" />

          {/* App Header Banner */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md text-xl"
                style={{ backgroundColor: app.bgColor, color: app.color }}
              >
                {app.iconEmoji}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">{app.name}</h3>
                <p className="text-xs text-slate-500">{app.tagline}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={loading}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1"
            >
              ✕
            </button>
          </div>

          {/* Demo Notice Banner */}
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
              <strong className="block">Demo Payment Interface</strong>
              <span className="text-[11px] text-amber-800">
                Demo Mode Active. No actual money will be debited from your bank or {app.name} account.
              </span>
            </div>
          </div>

          {/* Payment Details Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Merchant / Partner:</span>
              <strong className="text-slate-800 truncate max-w-[200px]">{partnerName}</strong>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Payment Mode:</span>
              <strong className="text-slate-800">{app.name} UPI</strong>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-600">Total Payable:</span>
              <span className="text-2xl font-black text-slate-900 font-mono">₹{amount.toLocaleString()}</span>
            </div>
          </div>

          {/* Action Simulation Buttons */}
          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={onSimulateSuccess}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-black text-xs text-white shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98] cursor-pointer"
              style={{
                backgroundColor: app.color,
                boxShadow: `0 8px 24px ${app.color}40`
              }}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simulate Successful Payment via {app.shortName}</span>
            </button>

            <button
              type="button"
              onClick={onSimulateFailure}
              disabled={loading}
              className="w-full py-3 rounded-2xl font-bold text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98] cursor-pointer"
            >
              <XCircle className="w-4 h-4 text-rose-500" />
              <span>Simulate Declined Payment</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-500 hover:text-slate-800 transition-colors text-center"
            >
              Cancel & Return
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
