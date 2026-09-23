import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Globe, Check, Search, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSelector({ variant = 'navbar', className = '' }) {
  const { currentLanguage, setLanguage, supportedLanguages, activeLangMeta, t, isTranslating } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'INDIAN' | 'GLOBAL'
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSelect = (code) => {
    setLanguage(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Filter languages based on search query and active tab
  const filteredLanguages = useMemo(() => {
    return supportedLanguages.filter((lang) => {
      const matchesTab = activeTab === 'ALL' || lang.region === activeTab;
      if (!matchesTab) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        lang.name.toLowerCase().includes(q) ||
        lang.nativeName.toLowerCase().includes(q) ||
        lang.code.toLowerCase().includes(q)
      );
    });
  }, [supportedLanguages, searchQuery, activeTab]);

  if (variant === 'pills') {
    return (
      <div data-no-translate="true" className={`flex flex-wrap items-center gap-1.5 ${className}`}>
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
              <span data-no-translate="true">{lang.nativeName}</span>
              {lang.direction === 'rtl' && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-500 font-mono">RTL</span>
              )}
              {isActive && <Check className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div data-no-translate="true" className={`relative shrink-0 ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-white/90 hover:bg-white border border-slate-200/90 hover:border-emerald-500/60 text-slate-700 hover:text-emerald-700 transition-all shadow-xs group shrink-0 cursor-pointer"
        title={t('selectLanguage', 'Select Language')}
        aria-label="Select Language"
        aria-expanded={isOpen}
      >
        <Globe className={`w-4 h-4 text-emerald-600 transition-transform shrink-0 ${isTranslating ? 'animate-spin' : 'group-hover:rotate-12'}`} />
        <span className="absolute -bottom-0.5 -right-0.5 text-[8px] font-black font-mono px-1 rounded-sm bg-emerald-600 text-white leading-tight shadow-xs uppercase">
          {activeLangMeta.code}
        </span>
      </button>

      {isOpen && (
        <div 
          data-no-translate="true"
          className="absolute right-0 mt-2 w-72 sm:w-80 bg-white/95 border border-slate-200/90 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl text-left"
          style={{ direction: 'ltr' }}
        >
          {/* Header */}
          <div className="px-1.5 py-1 flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800">
                {t('selectLanguage', 'Global Language')}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                {supportedLanguages.length} Languages
              </span>
            </div>
          </div>

          {/* Quick Search */}
          <div className="mt-2 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search language (e.g. Hindi, French, தமிழ்)..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-800 font-medium placeholder:text-slate-400"
            />
          </div>

          {/* Category Filter Tabs */}
          <div className="grid grid-cols-3 gap-1 mt-2 p-0.5 bg-slate-100/80 rounded-xl text-[10px] font-bold text-slate-600">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`py-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              All ({supportedLanguages.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('INDIAN')}
              className={`py-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'INDIAN' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              🇮🇳 Indian (12)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('GLOBAL')}
              className={`py-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'GLOBAL' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              🌍 Global (11)
            </button>
          </div>

          {/* Languages List */}
          <div className="mt-2 space-y-0.5 max-h-60 overflow-y-auto pr-1">
            {filteredLanguages.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No matching language found
              </div>
            ) : (
              filteredLanguages.map((lang) => {
                const isSelected = lang.code === currentLanguage;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelect(lang.code)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200 shadow-xs'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div data-no-translate="true" className="flex items-center gap-2.5">
                      <span data-no-translate="true" className="text-base">{lang.flag}</span>
                      <div data-no-translate="true" className="text-left">
                        <div data-no-translate="true" className="leading-tight text-slate-900 font-semibold flex items-center gap-1.5">
                          <span data-no-translate="true">{lang.nativeName}</span>
                          {lang.direction === 'rtl' && (
                            <span className="text-[8px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-mono font-bold">RTL</span>
                          )}
                        </div>
                        <div data-no-translate="true" className="text-[10px] text-slate-400 leading-tight mt-0.5 flex items-center gap-1">
                          <span data-no-translate="true">{lang.name}</span>
                          <span>•</span>
                          <span data-no-translate="true" className="font-mono text-[9px] uppercase">{lang.code}</span>
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Router Provider Note */}
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Multi-Provider AI Router</span>
            </span>
            <span className="text-[9px] font-mono text-slate-500">BHASHINI • Google</span>
          </div>
        </div>
      )}
    </div>
  );
}
