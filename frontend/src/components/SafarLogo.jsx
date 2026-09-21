import React from 'react';
import { motion } from 'framer-motion';

export default function SafarLogo({
  size = 'md',
  showText = true,
  showSubtitle = true,
  animated = true,
  className = ''
}) {
  // Dimensions map
  const sizeMap = {
    xs: { emblem: 'w-7 h-7', title: 'text-sm tracking-wider', subtitle: 'text-[9px]' },
    sm: { emblem: 'w-10 h-10', title: 'text-base tracking-widest', subtitle: 'text-[10px]' },
    md: { emblem: 'w-12 h-12', title: 'text-lg tracking-widest', subtitle: 'text-xs' },
    lg: { emblem: 'w-20 h-20', title: 'text-2xl tracking-widest', subtitle: 'text-xs' },
    xl: { emblem: 'w-28 h-28', title: 'text-4xl tracking-widest', subtitle: 'text-sm' },
    hero: { emblem: 'w-36 h-36 sm:w-44 sm:h-44', title: 'text-4xl sm:text-6xl tracking-widest', subtitle: 'text-xs sm:text-sm' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Nautical Compass & Emblem Wrapper */}
      <div className={`relative shrink-0 ${currentSize.emblem} flex items-center justify-center`}>
        
        {/* Animated Tricolor Halo Glow */}
        {animated && (
          <div className="absolute -inset-2 bg-gradient-to-tr from-safar-saffron-500/20 via-safar-shield-500/20 to-safar-green-500/20 rounded-full blur-md animate-pulse-slow pointer-events-none" />
        )}

        {/* Outer Rotating Compass Tick Ring */}
        {animated && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 32, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-dashed border-safar-shield-400/30 pointer-events-none"
          />
        )}

        {/* Real Official S.A.F.A.R. Logo Image */}
        <div className="relative w-full h-full rounded-full overflow-hidden p-0.5 bg-gradient-to-b from-safar-saffron-500 via-safar-shield-500 to-safar-green-500 shadow-xl">
          <img
            src="/safar-logo.png"
            alt="S.A.F.A.R. Official Logo"
            className="w-full h-full object-cover rounded-full bg-white transition-transform hover:scale-105 duration-300"
            onError={(e) => {
              // fallback if needed
              e.currentTarget.src = '/safar-logo.jpg';
            }}
          />
        </div>

        {/* Compass Cardinal Points Indicator Dots */}
        {size !== 'xs' && (
          <>
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-safar-saffron-500 shadow-sm shadow-safar-saffron-500" />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-safar-green-500 shadow-sm shadow-safar-green-500" />
          </>
        )}
      </div>

      {/* Brand Name & Subtitle Typography */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center space-x-1.5">
            <span className={`font-black text-gray-900 ${currentSize.title} drop-shadow-sm font-['Plus_Jakarta_Sans',sans-serif]`}>
              S.A.F.A.R.
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-orange-50 text-orange-700 border border-orange-200 shadow-sm">
              GOI
            </span>
          </div>
          {showSubtitle && (
            <span className={`hidden sm:inline text-gray-500 font-medium ${currentSize.subtitle} leading-tight truncate max-w-[260px]`}>
              Smart AI Framework for Assured & Responsible Tourism
            </span>
          )}
        </div>
      )}
    </div>
  );
}
