import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, LogOut, ShieldCheck, AlertTriangle, Activity, X, CheckCircle } from 'lucide-react';
import SafarLogo from './SafarLogo';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../context/LanguageContext';

const SPRING = { type: 'spring', stiffness: 380, damping: 30 };

export default function Navbar({ currentUser, onLogout, notifications = [], onMarkRead }) {
  const location = useLocation();
  const [showNotifs, setShowNotifs] = useState(false);
  const { t } = useLanguage();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    setShowNotifs(false);
  }, [location.pathname]);

  // Close notifs on outside click
  useEffect(() => {
    if (!showNotifs) return;
    const handler = (e) => {
      if (!e.target.closest('#notif-panel') && !e.target.closest('#notif-btn')) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifs]);

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-40 navbar-ios"
    >
      {/* Tricolor Ribbon — ultra thin */}
      <div className="h-[2.5px] w-full" style={{
        background: 'linear-gradient(90deg, #FF9F0A 0%, #FF9F0A 33%, #ffffff 33%, #ffffff 66%, #34C759 66%, #34C759 100%)',
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-5 h-14 flex items-center justify-between gap-3">

        {/* Brand */}
        <Link to="/" className="flex-shrink-0 group">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} transition={SPRING}>
            <SafarLogo size="sm" showSubtitle={true} />
          </motion.div>
        </Link>

        {/* Desktop Nav Links — centered pill nav */}
        {currentUser?.role === 'AUTHORITY' ? (
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl" style={{
            background: 'rgba(120,120,128,0.1)',
          }}>
            {[
              { to: '/authority-dashboard', label: t('navCommandDesk', 'Command Desk'), icon: ShieldCheck },
              { to: '/incidents', label: t('navIncidents', 'Incidents'), icon: AlertTriangle },
              { to: '/geo-fence-management', label: 'Zones', icon: Activity },
              { to: '/blockchain-ledger', label: 'Blockchain', icon: ShieldCheck },
            ].map((nl) => {
              const IconC = nl.icon;
              const active = location.pathname === nl.to;
              return (
                <Link key={nl.to} to={nl.to}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    transition={SPRING}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    style={{
                      background: active ? 'rgba(255,255,255,0.85)' : 'transparent',
                      color: active ? '#1C1C1E' : 'rgba(60,60,67,0.7)',
                      boxShadow: active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    }}
                  >
                    <IconC className="w-3.5 h-3.5" />
                    <span>{nl.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        ) : (
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-2xl" style={{
            background: 'rgba(120,120,128,0.1)',
          }}>
            {[
              { to: '/tourist-dashboard', label: 'Safety Map' },
              { to: '/digital-id', label: 'Digital ID' },
              { to: '/deadman-switch', label: 'Deadman Switch' },
              { to: '/fares', label: 'Transport Fares' },
              { to: '/emergency-help', label: 'Help & 112' },
            ].map((nl) => {
              const active = location.pathname === nl.to;
              return (
                <Link key={nl.to} to={nl.to}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    transition={SPRING}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                    style={{
                      background: active ? 'rgba(255,255,255,0.85)' : 'transparent',
                      color: active ? '#0A84FF' : 'rgba(60,60,67,0.7)',
                      boxShadow: active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    }}
                  >
                    <span>{nl.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <LanguageSelector variant="navbar" />

          {/* Notification Bell */}
          <div className="relative">
            <motion.button
              id="notif-btn"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              transition={SPRING}
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
              style={{
                background: showNotifs ? 'rgba(10,132,255,0.12)' : 'rgba(120,120,128,0.1)',
                color: showNotifs ? '#0A84FF' : 'rgba(60,60,67,0.7)',
              }}
            >
              <Bell className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={SPRING}
                    className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 font-bold text-[9px] rounded-full flex items-center justify-center text-white"
                    style={{
                      background: '#FF3B30',
                      width: 18, height: 18,
                      boxShadow: '0 0 0 2px rgba(242,242,247,0.9)',
                    }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Notification Panel */}
            <AnimatePresence>
              {showNotifs && (
                <motion.div
                  id="notif-panel"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={SPRING}
                  className="absolute right-0 mt-2 w-80 sm:w-96 overflow-hidden z-50 apple-sheet"
                  style={{ transformOrigin: 'top right' }}
                >
                  {/* Panel Header */}
                  <div className="px-4 py-3 flex items-center justify-between" style={{
                    borderBottom: '0.5px solid rgba(60,60,67,0.12)',
                    background: 'rgba(255,255,255,0.5)',
                  }}>
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4" style={{ color: '#0A84FF' }} />
                      <span className="text-sm font-semibold" style={{ color: '#1C1C1E', letterSpacing: '-0.01em' }}>
                        Alerts
                      </span>
                      {unreadCount > 0 && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{
                          background: 'rgba(255,59,48,0.1)', color: '#FF3B30',
                        }}>
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={() => onMarkRead()}
                          className="text-xs font-medium transition-colors"
                          style={{ color: '#0A84FF' }}
                        >
                          Mark all read
                        </button>
                      )}
                      <button onClick={() => setShowNotifs(false)} style={{ color: 'rgba(60,60,67,0.5)' }}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2" style={{ color: '#34C759' }} />
                        <p className="text-sm font-medium" style={{ color: 'rgba(60,60,67,0.6)' }}>No active alerts</p>
                      </div>
                    ) : (
                      notifications.map((n, i) => (
                        <motion.div
                          key={n.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04, ...SPRING }}
                          className="px-4 py-3"
                          style={{
                            borderBottom: '0.5px solid rgba(60,60,67,0.06)',
                            background: !n.read ? 'rgba(10,132,255,0.04)' : 'transparent',
                            borderLeft: !n.read ? '3px solid #0A84FF' : '3px solid transparent',
                            opacity: n.read ? 0.65 : 1,
                          }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md" style={{
                              background: n.type === 'CRITICAL' ? 'rgba(255,59,48,0.1)'
                                : n.type === 'HIGH' ? 'rgba(255,159,10,0.1)'
                                : n.type === 'MEDIUM' ? 'rgba(255,204,0,0.12)' : 'rgba(52,199,89,0.1)',
                              color: n.type === 'CRITICAL' ? '#FF3B30'
                                : n.type === 'HIGH' ? '#FF9F0A'
                                : n.type === 'MEDIUM' ? '#FFCC00' : '#34C759',
                            }}>
                              {n.type}
                            </span>
                            <span className="text-[10px]" style={{ color: 'rgba(60,60,67,0.45)' }}>
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm font-semibold" style={{ color: '#1C1C1E', letterSpacing: '-0.01em' }}>{n.title}</p>
                          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgba(60,60,67,0.65)' }}>{n.message}</p>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Avatar */}
          {currentUser ? (
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={SPRING}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl"
              style={{
                background: 'rgba(120,120,128,0.1)',
                border: '0.5px solid rgba(60,60,67,0.1)',
              }}
            >
              <motion.div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs"
                style={{
                  background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)',
                  boxShadow: '0 2px 8px rgba(10,132,255,0.3)',
                }}
                animate={{
                  boxShadow: ['0 2px 8px rgba(10,132,255,0.3)', '0 2px 14px rgba(94,92,230,0.4)', '0 2px 8px rgba(10,132,255,0.3)']
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
              </motion.div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold leading-tight" style={{ color: '#1C1C1E', letterSpacing: '-0.01em' }}>
                  {currentUser.name}
                </p>
                <p className="text-[10px] font-medium" style={{ color: '#0A84FF' }}>
                  {currentUser.role}{currentUser.touristId ? ` · ${currentUser.touristId}` : ''}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onLogout}
                className="ml-0.5 p-1 rounded-lg transition-colors"
                style={{ color: 'rgba(60,60,67,0.45)' }}
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </motion.button>
            </motion.div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors"
                style={{
                  background: 'rgba(120,120,128,0.1)',
                  color: 'rgba(60,60,67,0.8)',
                  border: '0.5px solid rgba(60,60,67,0.12)',
                }}
              >
                {t('navLogin', 'Sign In')}
              </Link>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={SPRING}>
                <Link
                  to="/register"
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl text-white transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)',
                    boxShadow: '0 2px 10px rgba(10,132,255,0.35)',
                  }}
                >
                  Register
                </Link>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}
