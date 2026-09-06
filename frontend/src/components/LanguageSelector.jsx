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
                  ? 'bg-emerald-50 border-emerald-500/80 text-emerald-800 shadow-sm shadow-emerald-500/10'
                  : 'bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.nativeName}</span>
              {isActive && <Check className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />}
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
        className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-white/90 hover:bg-white border border-gray-200 hover:border-emerald-500/50 text-gray-800 transition-all shadow-sm group"
        title={t('selectLanguage', 'Select Language')}
      >
        <Globe className="w-4 h-4 text-emerald-600 group-hover:rotate-12 transition-transform shrink-0" />
        <span className="text-sm">{activeLangMeta.flag}</span>
        <span className="text-xs font-bold font-mono tracking-wider hidden sm:inline text-gray-700">
          {activeLangMeta.code.toUpperCase()}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white/95 border border-gray-200 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 mb-1 flex items-center justify-between">
            <span>{t('selectLanguage', 'Select Language')}</span>
            <span className="text-emerald-700 font-mono text-[9px] bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">5 Available</span>
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
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-base">{lang.flag}</span>
                    <div className="text-left">
                      <div className="leading-none text-gray-900 font-semibold">{lang.nativeName}</div>
                      <div className="text-[10px] text-gray-500 leading-none mt-0.5">{lang.label}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
