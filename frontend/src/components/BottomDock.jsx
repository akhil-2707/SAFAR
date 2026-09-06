import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, CreditCard, Siren, Banknote, Phone, Clock, ShieldCheck } from 'lucide-react';

const SPRING = { type: 'spring', stiffness: 380, damping: 28 };

const TOURIST_TABS = [
  { id: 'map',   to: '/tourist-dashboard', icon: Map,        label: 'Map',    color: '#0A84FF' },
  { id: 'id',    to: '/digital-id',        icon: CreditCard, label: 'ID',     color: '#5E5CE6' },
  { id: 'sos',   to: '/sos',               icon: Siren,      label: 'SOS',    color: '#FF3B30', isSos: true },
  { id: 'fares', to: '/fares',             icon: Banknote,   label: 'Fares',  color: '#FF9F0A' },
  { id: 'help',  to: '/emergency-help',    icon: Phone,      label: 'Help',   color: '#34C759' },
];

export default function BottomDock({ currentUser, onTriggerSos }) {
  const location = useLocation();
  const [sosPressed, setSosPressed] = useState(false);

  if (!currentUser || currentUser.role !== 'TOURIST') return null;

  const tabs = TOURIST_TABS;

  const isActive = (tab) => {
    return location.pathname === tab.to;
  };

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, ...SPRING }}
      className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center pb-4 px-4 sm:px-6 pointer-events-none"
    >
      {/* Mini Floating Deadman's Switch Pill above Dock */}
      {location.pathname !== '/deadman-switch' && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={SPRING}
          className="pointer-events-auto mb-2"
        >
          <Link
            to="/deadman-switch"
            className="px-3.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 shadow-md backdrop-blur-xl transition-transform hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.85)',
              border: '0.5px solid rgba(94,92,230,0.3)',
              color: '#5E5CE6',
              boxShadow: '0 2px 10px rgba(94,92,230,0.15)',
            }}
          >
            <Clock className="w-3 h-3 text-indigo-600 animate-spin-slow" />
            <span>Deadman Switch: <strong>Armed (2h)</strong></span>
            <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-mono">15m Check-in</span>
          </Link>
        </motion.div>
      )}

      {/* Dock Bar */}
      <motion.div
        className="dock-container pointer-events-auto flex items-end px-3 pt-2 pb-2 gap-1"
        style={{ minWidth: 320, maxWidth: 430, width: '100%' }}
      >
        {tabs.map((tab) => (
          tab.isSos
            ? <SosTab key={tab.id} tab={tab} active={isActive(tab)} onTriggerSos={onTriggerSos} currentUser={currentUser} />
            : <RegularTab key={tab.id} tab={tab} active={isActive(tab)} />
        ))}
      </motion.div>
    </motion.div>
  );
}

function RegularTab({ tab, active }) {
  const IconComp = tab.icon;
  return (
    <Link
      to={tab.to}
      className="flex-1 flex flex-col items-center gap-0.5 py-1 px-1 rounded-2xl relative group"
      style={{ minWidth: 52, textDecoration: 'none' }}
    >
      {/* Active indicator pill */}
      <AnimatePresence>
        {active && (
          <motion.div
            layoutId="dock-indicator"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={SPRING}
            className="absolute inset-0 rounded-2xl"
            style={{ background: `${tab.color}18`, border: `0.5px solid ${tab.color}35` }}
          />
        )}
      </AnimatePresence>

      {/* Icon */}
      <motion.div
        whileHover={{ scale: 1.15, y: -2 }}
        whileTap={{ scale: 0.88 }}
        transition={SPRING}
        className="relative z-10 w-8 h-8 flex items-center justify-center"
      >
        <IconComp
          style={{ color: active ? tab.color : 'rgba(60,60,67,0.55)', strokeWidth: active ? 2.5 : 1.8 }}
          className="w-5 h-5 transition-colors duration-200"
        />
      </motion.div>

      {/* Label */}
      <span
        className="relative z-10 text-[10px] font-semibold tracking-tight transition-colors duration-200"
        style={{ color: active ? tab.color : 'rgba(60,60,67,0.5)' }}
      >
        {tab.label}
      </span>
    </Link>
  );
}

function SosTab({ tab, active, onTriggerSos, currentUser }) {
  const IconComp = tab.icon;
  return (
    <div className="flex-1 flex flex-col items-center justify-end pb-0.5" style={{ minWidth: 64 }}>
      <Link to={tab.to}>
        <motion.div
          whileHover={{ scale: 1.1, y: -3 }}
          whileTap={{ scale: 0.88 }}
          transition={SPRING}
          className="relative flex items-center justify-center rounded-full shadow-lg"
          style={{
            width: 56,
            height: 56,
            background: 'linear-gradient(145deg, #FF3B30, #FF375F)',
            boxShadow: active
              ? '0 0 0 3px #FFFFFF, 0 4px 20px rgba(255,59,48,0.6)'
              : '0 4px 16px rgba(255,59,48,0.45), 0 2px 6px rgba(255,59,48,0.3)',
          }}
        >
          {/* Breathing pulse rings */}
          <span
            className="absolute inset-0 rounded-full"
            style={{
              animation: 'sos-breathe 2.2s ease-in-out infinite',
              background: 'transparent',
            }}
          />
          <IconComp className="w-6 h-6 text-white relative z-10" strokeWidth={2.5} />
        </motion.div>
      </Link>
      <span className="text-[10px] font-bold mt-1 tracking-tight" style={{ color: '#FF3B30' }}>
        SOS
      </span>
    </div>
  );
}

