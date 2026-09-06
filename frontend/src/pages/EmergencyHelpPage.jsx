import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PhoneCall, ShieldCheck, HeartPulse, Siren, Radio, MapPin, 
  ExternalLink, Zap, WifiOff, Share2, Copy, Check, Info, ShieldAlert, Compass
} from 'lucide-react';
import { Link } from 'react-router-dom';
import OfflineGhostMeshModal from '../components/OfflineGhostMeshModal';
import Emergency112Modal from '../components/Emergency112Modal';

const SPRING = { type: 'spring', stiffness: 360, damping: 28 };

export default function EmergencyHelpPage({ tourist, emergencyServices = [] }) {
  const [showMeshModal, setShowMeshModal] = useState(false);
  const [show112Modal, setShow112Modal] = useState(false);
  const [copiedLocation, setCopiedLocation] = useState(false);

  const locationAddr = tourist?.currentLocation?.address || 'Ayodhya Safe Tourism Hub';
  const lat = tourist?.currentLocation?.lat?.toFixed(5) || '26.79220';
  const lng = tourist?.currentLocation?.lng?.toFixed(5) || '82.19980';

  const handleShareLocation = () => {
    const text = `🚨 SAFAR TOURIST EMERGENCY BEACON\nName: ${tourist?.fullName || 'Tourist'}\nTourist ID: ${tourist?.touristId || 'TID-1035'}\nLocation: ${locationAddr}\nGPS: https://maps.google.com/?q=${lat},${lng}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedLocation(true);
      setTimeout(() => setCopiedLocation(false), 2500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.99 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold mb-1" style={{ color: '#34C759' }}>
            <Link to="/tourist-dashboard" className="hover:underline">Dashboard</Link>
            <span style={{ color: 'rgba(60,60,67,0.3)' }}>/</span>
            <span>Emergency Help & Rescue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: '#1C1C1E', letterSpacing: '-0.025em' }}>
            24×7 Emergency & Rescue Center
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(60,60,67,0.6)' }}>
            Integrated gateway for 112 ERSS, nearest hospitals, tourist police, and zero-signal rescue.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          transition={SPRING}
          onClick={handleShareLocation}
          className="px-4 py-2 rounded-2xl text-xs font-bold apple-card flex items-center gap-2"
          style={{ color: '#0A84FF' }}
        >
          {copiedLocation ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          <span>{copiedLocation ? 'GPS Beacon Copied!' : 'Share Live GPS Beacon'}</span>
        </motion.button>
      </div>

      {/* Two Hero Gateways: 112 ERSS + 0-Signal Ghost-Mesh */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* 112 ERSS India Gateway Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={SPRING}
          className="p-6 rounded-3xl relative overflow-hidden text-white flex flex-col justify-between space-y-4"
          style={{
            background: 'linear-gradient(135deg, #FF3B30, #FF375F)',
            boxShadow: '0 10px 30px rgba(255,59,48,0.35)',
          }}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Siren className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/20">
                National ERSS
              </span>
            </div>
            <h3 className="text-xl font-black tracking-tight">112 India Dispatch Gateway</h3>
            <p className="text-xs opacity-90 leading-relaxed">
              Direct live handshake with Ministry of Home Affairs Emergency Response Support System (ERSS 112) for unified Police, Fire, and Ambulance response.
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShow112Modal(true)}
            className="w-full py-3 rounded-2xl bg-white text-red-600 font-bold text-xs shadow-md flex items-center justify-center gap-2 hover:bg-red-50"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Open 112 Emergency Gateway</span>
          </motion.button>
        </motion.div>

        {/* 0-Signal Ghost-Mesh Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={SPRING}
          className="p-6 rounded-3xl relative overflow-hidden text-white flex flex-col justify-between space-y-4"
          style={{
            background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)',
            boxShadow: '0 10px 30px rgba(10,132,255,0.35)',
          }}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <WifiOff className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/20">
                Zero Cellular Needed
              </span>
            </div>
            <h3 className="text-xl font-black tracking-tight">0-Signal Ghost-Mesh Rescue</h3>
            <p className="text-xs opacity-90 leading-relaxed">
              When entering deep valleys, dense forests, or zero-connectivity dead zones, broadcast peer-to-peer encrypted BLE packets to nearby tourist phones until reaching a forest ranger uplink.
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMeshModal(true)}
            className="w-full py-3 rounded-2xl bg-white text-blue-600 font-bold text-xs shadow-md flex items-center justify-center gap-2 hover:bg-blue-50"
          >
            <Zap className="w-4 h-4" />
            <span>Launch Ghost-Mesh Simulator</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Emergency Hotlines Directory Grid */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-gray-900 tracking-tight">
          National Emergency Helplines (Toll-Free 24×7)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { num: '112', title: 'All Emergencies (ERSS)', desc: 'Police, Ambulance & Fire', color: '#FF3B30', bg: 'rgba(255,59,48,0.06)' },
            { num: '1363', title: 'Incredible India Tourist', desc: '12-Language Ministry Helpline', color: '#0A84FF', bg: 'rgba(10,132,255,0.06)' },
            { num: '108', title: 'Free Medical Ambulance', desc: 'State EMS Dispatch Desk', color: '#34C759', bg: 'rgba(52,199,89,0.06)' },
            { num: '1077', title: 'Disaster Relief Control', desc: 'Flash floods, landslide & weather', color: '#FF9F0A', bg: 'rgba(255,159,10,0.06)' },
          ].map((h) => (
            <motion.a
              key={h.num}
              href={`tel:${h.num}`}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={SPRING}
              className="p-4 rounded-2xl apple-card block space-y-1.5"
              style={{ background: h.bg, border: `0.5px solid ${h.color}30` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black font-mono" style={{ color: h.color }}>{h.num}</span>
                <PhoneCall className="w-4 h-4" style={{ color: h.color }} />
              </div>
              <h4 className="text-xs font-bold text-gray-900">{h.title}</h4>
              <p className="text-[10px] text-gray-500">{h.desc}</p>
            </motion.a>
          ))}
        </div>
      </div>

      {/* Nearby Verified Emergency Responders */}
      <div className="p-6 rounded-3xl apple-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Nearby Verified Responders</h3>
              <p className="text-xs text-gray-500">Live distance calculated from your current GPS coordinates</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-gray-100 text-gray-700">
            {emergencyServices.length} Stations Found
          </span>
        </div>

        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {emergencyServices.map((es) => (
            <div
              key={es.id}
              className="p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs bg-gray-50/70 border border-gray-200/60"
            >
              <div className="space-y-0.5">
                <span className="font-bold text-gray-900 block text-sm">{es.name}</span>
                <span className="text-[11px] text-gray-500 block">
                  {es.type === 'POLICE' ? '🛡️ Tourist Police Station' : es.type === 'HOSPITAL' ? '🏥 Trauma & General Hospital' : '🚒 Emergency Station'}
                </span>
                <span className="text-xs font-mono font-semibold text-emerald-700 block">
                  📞 {es.phone}
                </span>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200">
                  {es.distanceKm} km
                </span>
                <a
                  href={`tel:${es.phone}`}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-sm flex items-center gap-1"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <OfflineGhostMeshModal
        isOpen={showMeshModal}
        onClose={() => setShowMeshModal(false)}
      />

      <Emergency112Modal
        isOpen={show112Modal}
        onClose={() => setShow112Modal(false)}
        location={locationAddr}
      />
    </motion.div>
  );
}
