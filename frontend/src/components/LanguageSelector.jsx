import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSelector({ variant = 'navbar', className = '' }) {
  const { currentLanguage, setLanguage, supportedLanguages, activeLangMeta, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  if (variant === 'pills') {
    return (
      <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
        {supportedLanguages.map((lang) => {
          const isActive = lang.code === currentLanguage;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelect(lang.code)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 border ${
                isActive
                  ? 'bg-emerald-500/20 border-emerald-500/80 text-emerald-300 shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.nativeName}</span>
              {isActive && <Check className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-850 border border-slate-700/80 hover:border-emerald-500/50 text-slate-200 transition-all shadow-md group"
        title={t('selectLanguage', 'Select Language')}
      >
        <Globe className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform shrink-0" />
        <span className="text-sm">{activeLangMeta.flag}</span>
        <span className="text-xs font-bold font-mono tracking-wider hidden sm:inline">
          {activeLangMeta.code.toUpperCase()}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-navy-900 border border-slate-800 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1 flex items-center justify-between">
            <span>{t('selectLanguage', 'Select Language')}</span>
            <span className="text-emerald-400 font-mono text-[9px]">5 Available</span>
          </div>

          <div className="space-y-0.5">
            {supportedLanguages.map((lang) => {
              const isSelected = lang.code === currentLanguage;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 shadow-inner'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-base">{lang.flag}</span>
                    <div className="text-left">
                      <div className="leading-none text-slate-200">{lang.nativeName}</div>
                      <div className="text-[10px] text-slate-400 leading-none mt-0.5">{lang.label}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
