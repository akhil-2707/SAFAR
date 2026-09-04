import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, Bell, User, LogOut, Navigation, FileCheck, BarChart3, Settings, Activity } from 'lucide-react';

export default function Navbar({ currentUser, onLogout, notifications = [], onMarkRead, onShowLoader, onOpenMeshModal }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifs, setShowNotifs] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-navy-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Emblem */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 p-0.5 shadow-lg group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-brand-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-emerald-400">
                SafeTour NE
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                SIH25002
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Ministry of Development of North Eastern Region
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {/* Replay Patriotic Indian Flag Intro */}
          {onShowLoader && (
            <button
              onClick={onShowLoader}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500/20 via-slate-100/10 to-emerald-500/20 border border-slate-700 text-amber-300 hover:text-white hover:border-amber-400 transition-all flex items-center space-x-1.5 shadow-sm"
              title="Play Indian Flag Intro Animation"
            >
              <span>🇮🇳</span>
              <span>Flag Intro</span>
            </button>
          )}

          <Link
            to="/"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/' ? 'bg-slate-800 text-emerald-400' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            Overview
          </Link>

          {currentUser?.role === 'TOURIST' && (
            <>
              <Link
                to="/tourist-dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  location.pathname === '/tourist-dashboard' ? 'bg-slate-800 text-emerald-400' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Safety Hub</span>
              </Link>
              <Link
                to="/trip-planner"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  location.pathname === '/trip-planner' ? 'bg-slate-800 text-emerald-400' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <Navigation className="w-4 h-4" />
                <span>Trip Planner</span>
              </Link>
            </>
          )}

          {currentUser?.role === 'AUTHORITY' && (
            <>
              <Link
                to="/authority-dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  location.pathname === '/authority-dashboard' ? 'bg-slate-800 text-emerald-400' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Command Desk</span>
              </Link>
              <Link
                to="/geo-fence-management"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  location.pathname === '/geo-fence-management' ? 'bg-slate-800 text-emerald-400' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4 text-emerald-400" />
                <span>Geo-Fences</span>
              </Link>
              <Link
                to="/incidents"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  location.pathname === '/incidents' ? 'bg-slate-800 text-emerald-400' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Incidents</span>
              </Link>
              <Link
                to="/blockchain-ledger"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  location.pathname === '/blockchain-ledger' ? 'bg-slate-800 text-emerald-400' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>Blockchain</span>
              </Link>
            </>
          )}

          <Link
            to="/vendor-marketplace"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
              location.pathname === '/vendor-marketplace' ? 'bg-slate-800 text-cyan-400' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <span>Vendors</span>
          </Link>

          <Link
            to="/privacy-compliance"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
              location.pathname === '/privacy-compliance' ? 'bg-slate-800 text-emerald-400' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <span>DPDP Privacy</span>
          </Link>

          <button
            onClick={onOpenMeshModal}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-gradient-to-r from-rose-600/30 to-amber-500/30 hover:from-rose-600/50 hover:to-amber-500/50 text-amber-300 border border-amber-500/40 flex items-center space-x-1.5 shadow-md"
            title="Zero-Network Offline Ghost-Mesh Rescue"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span>📡 Ghost-Mesh SOS</span>
          </button>
        </nav>

        {/* User & Notifications CTA */}
        <div className="flex items-center space-x-3">
          
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-bounce-soft">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Drawer */}
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-navy-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-bold text-white">Live System Alerts</span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => onMarkRead()}
                      className="text-xs text-emerald-400 hover:underline font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-sm">No active alerts</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs transition-colors ${
                          !n.read ? 'bg-slate-800/60 border-l-2 border-emerald-500' : 'opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded ${
                              n.type === 'CRITICAL'
                                ? 'bg-red-500/20 text-red-400'
                                : n.type === 'HIGH'
                                ? 'bg-orange-500/20 text-orange-400'
                                : n.type === 'MEDIUM'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {n.type}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-200 mb-0.5">{n.title}</p>
                        <p className="text-slate-400 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Auth State */}
          {currentUser ? (
            <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                {currentUser.name ? currentUser.name[0] : 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-200 leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-emerald-400 font-mono font-medium">
                  {currentUser.role} {currentUser.touristId ? `(${currentUser.touristId})` : ''}
                </p>
              </div>
              <button
                onClick={onLogout}
                className="p-1 text-slate-400 hover:text-red-400 transition-colors ml-1"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 rounded-lg shadow-md transition-all"
              >
                Register Digital ID
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
