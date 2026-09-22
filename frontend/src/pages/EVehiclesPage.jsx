import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Zap, ShieldCheck } from 'lucide-react';
import EVehicleTransitSection from '../components/EVehicleTransitSection';
import SafarLogo from '../components/SafarLogo';

export default function EVehiclesPage() {
  const [currentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('safar_user');
      return stored ? JSON.parse(stored) : { touristId: 'TID-1035', name: 'Ananya Mishra' };
    } catch {
      return { touristId: 'TID-1035', name: 'Ananya Mishra' };
    }
  });

  const activeTid = currentUser?.touristId || 'TID-1035';

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-6" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      {/* Top Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/green-rewards"
          className="text-xs font-bold text-slate-500 hover:text-emerald-700 flex items-center space-x-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Green Rewards Hub</span>
        </Link>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            Govt. of India Eco Transit
          </span>
          <SafarLogo size="sm" showText={false} />
        </div>
      </div>

      {/* Main E-Vehicle Dashboard & Payment Flow */}
      <EVehicleTransitSection touristId={activeTid} />
    </div>
  );
}
