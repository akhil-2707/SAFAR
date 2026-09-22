import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, SUPPORTED_LANGUAGES, HINDI_EXACT_MAP, HINDI_PHRASE_DICTIONARY } from '../i18n/translations';

const LanguageContext = createContext();

// WeakMap to store the original English text for each text node so it can be cleanly restored
const originalTextMap = new WeakMap();

function isTranslatableTextNode(node) {
  if (!node || node.nodeType !== Node.TEXT_NODE) return false;
  const val = node.nodeValue;
  if (!val || !val.trim()) return false;
  
  const parent = node.parentElement;
  if (!parent) return false;
  
  const tag = parent.tagName;
  // Ignore scripts, styles, forms, and code blocks
  if (['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'CODE', 'PRE', 'SVG', 'PATH'].includes(tag)) {
    return false;
  }
  if (parent.isContentEditable) return false;
  if (parent.closest('[data-no-translate]')) return false;

  return true;
}

function translateText(text, lang) {
  if (lang === 'en' || !text || !text.trim()) return text;
  
  if (lang === 'hi') {
    const trimmed = text.trim();
    if (HINDI_EXACT_MAP[trimmed]) {
      const match = HINDI_EXACT_MAP[trimmed];
      const leading = text.match(/^\s*/)[0];
      const trailing = text.match(/\s*$/)[0];
      return leading + match + trailing;
    }
    
    let result = text;
    for (let i = 0; i < HINDI_PHRASE_DICTIONARY.length; i++) {
      const [en, hi] = HINDI_PHRASE_DICTIONARY[i];
      if (result.includes(en)) {
        result = result.replaceAll(en, hi);
      }
    }
    return result;
  }
  
  return text;
}

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('safar_preferred_language') || 'en';
  });

  const changeLanguage = (langCode) => {
    if (translations[langCode]) {
      setCurrentLanguage(langCode);
      localStorage.setItem('safar_preferred_language', langCode);
    }
  };

  const t = (key, fallback = '') => {
    const activeDict = translations[currentLanguage] || translations.en;
    if (activeDict && activeDict[key] !== undefined) {
      return activeDict[key];
    }
    // Fallback to English dictionary if key missing in active language
    if (translations.en && translations.en[key] !== undefined) {
      return translations.en[key];
    }
    return fallback || key;
  };

  const activeLangMeta = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  // Autonomous In-Browser Translation Engine for Full-Page Multilingual Experience
  useEffect(() => {
    const root = document.getElementById('root') || document.body;
    if (!root) return;

    if (currentLanguage === 'en') {
      // Restore all text nodes to their original English text
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        if (originalTextMap.has(node)) {
          node.nodeValue = originalTextMap.get(node);
          originalTextMap.delete(node);
        }
        node = walker.nextNode();
      }
      return;
    }

    let isTranslating = false;

    const runTranslation = () => {
      if (isTranslating) return;
      isTranslating = true;
      try {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let node = walker.nextNode();
        while (node) {
          if (isTranslatableTextNode(node)) {
            if (!originalTextMap.has(node)) {
              originalTextMap.set(node, node.nodeValue);
            }
            const original = originalTextMap.get(node);
            const translated = translateText(original, currentLanguage);
            if (translated !== node.nodeValue) {
              node.nodeValue = translated;
            }
          }
          node = walker.nextNode();
        }
      } finally {
        isTranslating = false;
      }
    };

    // Run translation immediately
    runTranslation();

    // Observe dynamic React DOM mutations (route changes, modal openings, tab switches)
    let timeoutId = null;
    const observer = new MutationObserver(() => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(runTranslation, 60);
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage: changeLanguage,
        t,
        supportedLanguages: SUPPORTED_LANGUAGES,
        activeLangMeta,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
