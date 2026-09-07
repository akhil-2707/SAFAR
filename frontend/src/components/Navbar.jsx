import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, LogOut, ShieldCheck, AlertTriangle, Activity, X, CheckCircle, 
  Menu, Compass, CreditCard, Clock, PhoneCall, Radio, FileText, Sparkles, BarChart2, UserCheck
} from 'lucide-react';
import SafarLogo from './SafarLogo';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../context/LanguageContext';

const SPRING = { type: 'spring', stiffness: 380, damping: 30 };

export default function Navbar({ 
  currentUser, 
  onLogout, 
  notifications = [], 
  onMarkRead,
  onOpenMeshModal,
  onShowLoader
}) {
  const location = useLocation();
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    setShowNotifs(false);
    setMobileMenuOpen(false);
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
      className="sticky top-0 z-40 navbar-ios w-full"
    >
      {/* Tricolor Ribbon — ultra thin */}
      <div className="h-[2.5px] w-full" style={{
        background: 'linear-gradient(90deg, #FF9F0A 0%, #FF9F0A 33%, #ffffff 33%, #ffffff 66%, #34C759 66%, #34C759 100%)',
      }} />

      <div className="max-w-7xl mx-auto px-3 sm:px-5 h-14 flex items-center justify-between gap-2">

        {/* Brand */}
        <Link to="/" className="flex-shrink-0 group">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} transition={SPRING}>
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
              { to: '/analytics', label: 'Analytics', icon: BarChart2 },
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
              className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl transition-colors"
              style={{
                background: showNotifs ? 'rgba(10,132,255,0.12)' : 'rgba(120,120,128,0.1)',
                color: showNotifs ? '#0A84FF' : 'rgba(60,60,67,0.7)',
              }}
              title="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={SPRING}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 font-bold text-[9px] rounded-full flex items-center justify-center text-white"
                    style={{
                      background: '#FF3B30',
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
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={SPRING}
                  className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:mt-2 w-auto sm:w-96 max-w-[calc(100vw-24px)] overflow-hidden z-50 apple-sheet"
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
                          onClick={() => onMarkRead?.()}
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
                          key={n.id || i}
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
                              {n.timestamp ? new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
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
            <div
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-2xl"
              style={{
                background: 'rgba(120,120,128,0.1)',
                border: '0.5px solid rgba(60,60,67,0.1)',
              }}
            >
              <motion.div
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)',
                  boxShadow: '0 2px 8px rgba(10,132,255,0.3)',
                }}
              >
                {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
              </motion.div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold leading-tight max-w-[90px] md:max-w-[120px] truncate" style={{ color: '#1C1C1E', letterSpacing: '-0.01em' }}>
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
                className="p-1 rounded-lg transition-colors"
                style={{ color: 'rgba(60,60,67,0.45)' }}
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Link
                to="/login"
                className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors"
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
                  className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl text-white transition-all hidden xs:inline-block"
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

          {/* Mobile Hamburger Menu Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-xl text-slate-700 transition-colors"
            style={{
              background: mobileMenuOpen ? 'rgba(10,132,255,0.12)' : 'rgba(120,120,128,0.1)',
              color: mobileMenuOpen ? '#0A84FF' : '#1C1C1E',
            }}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation Drawer Sheet */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden border-t"
            style={{
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(30px) saturate(190%)',
              borderColor: 'rgba(60,60,67,0.12)',
              boxShadow: '0 20px 30px rgba(0,0,0,0.12)',
            }}
          >
            <div className="px-4 py-4 space-y-3 max-h-[calc(100vh-64px)] overflow-y-auto">
              {/* User badge on mobile drawer */}
              {currentUser && (
                <div className="p-3 rounded-2xl bg-slate-100/80 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-sm">
                      {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                      <p className="text-[11px] font-medium text-blue-600">
                        {currentUser.role}{currentUser.touristId ? ` · ${currentUser.touristId}` : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onLogout?.();
                      setMobileMenuOpen(false);
                    }}
                    className="px-2.5 py-1 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Out</span>
                  </button>
                </div>
              )}

              {/* Navigation Items List */}
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-2 pt-1 pb-0.5">
                  {currentUser?.role === 'AUTHORITY' ? 'Authority Command Suite' : 'Tourist Safety Portal'}
                </p>

                {currentUser?.role === 'AUTHORITY' ? (
                  <>
                    <Link
                      to="/authority-dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                        location.pathname === '/authority-dashboard' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                      <span>Command Desk & Tactical Radar</span>
                    </Link>
                    <Link
                      to="/incidents"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                        location.pathname === '/incidents' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span>Incident Management</span>
                    </Link>
                    <Link
                      to="/geo-fence-management"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                        location.pathname === '/geo-fence-management' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Activity className="w-4 h-4 text-emerald-500" />
                      <span>Geo-Fencing & Boundary Zones</span>
                    </Link>
                    <Link
                      to="/blockchain-ledger"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                        location.pathname === '/blockchain-ledger' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-indigo-500" />
                      <span>Immutable Blockchain Ledger</span>
                    </Link>
                    <Link
                      to="/analytics"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                        location.pathname === '/analytics' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <BarChart2 className="w-4 h-4 text-purple-500" />
                      <span>AI Predictive Safety Analytics</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/tourist-dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                        location.pathname === '/tourist-dashboard' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Compass className="w-4 h-4 text-blue-500" />
                      <span>Live Safety Map & Zones</span>
                    </Link>
                    <Link
                      to="/digital-id"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                        location.pathname === '/digital-id' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 text-emerald-500" />
                      <span>3D Holographic Digital ID</span>
                    </Link>
                    <Link
                      to="/sos"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                        location.pathname === '/sos' ? 'bg-red-50 text-red-600 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Radio className="w-4 h-4 text-red-500" />
                      <span>Emergency SOS Cockpit</span>
                    </Link>
                    <Link
                      to="/deadman-switch"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                        location.pathname === '/deadman-switch' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>Deadman Automated Check-in</span>
                    </Link>
                    <Link
                      to="/fares"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                        location.pathname === '/fares' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-purple-500" />
                      <span>Pre-paid Taxi & Auto Fares</span>
                    </Link>
                    <Link
                      to="/emergency-help"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                        location.pathname === '/emergency-help' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <PhoneCall className="w-4 h-4 text-green-500" />
                      <span>112 ERSS Helpline & Police</span>
                    </Link>
                  </>
                )}

                {/* Additional Quick Utility Actions */}
                <div className="pt-2 border-t border-slate-200/60 mt-2 space-y-1">
                  {onOpenMeshModal && (
                    <button
                      onClick={() => {
                        onOpenMeshModal();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 text-left transition-colors"
                    >
                      <Radio className="w-4 h-4 text-violet-500" />
                      <span>Offline Ghost-Mesh Simulator</span>
                    </button>
                  )}
                  {onShowLoader && (
                    <button
                      onClick={() => {
                        onShowLoader();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 text-left transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Replay Flag Welcome Intro</span>
                    </button>
                  )}
                  <Link
                    to="/privacy-compliance"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span>DPDP Privacy Compliance</span>
                  </Link>
                  <Link
                    to="/vendor-marketplace"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Verified Vendor Marketplace</span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

