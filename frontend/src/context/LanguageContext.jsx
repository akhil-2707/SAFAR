import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { translations, HINDI_EXACT_MAP, HINDI_PHRASE_DICTIONARY } from '../i18n/translations';
import { SUPPORTED_LANGUAGES, SAFAR_GLOSSARY_TERMS } from '../i18n/languages';

const LanguageContext = createContext();

// WeakMaps storing original English text for DOM Nodes and Elements
const originalTextMap = new WeakMap();
const originalPlaceholderMap = new WeakMap();
const originalTitleMap = new WeakMap();

// In-Memory Translation Cache: targetLang -> Map<originalText, translatedText>
const clientTranslationCache = new Map();

/**
 * Pre-seeds and returns the high-speed translation cache for a language.
 * Combines built-in dictionaries + phrase dictionaries + localStorage cache.
 */
function getCachedTranslations(langCode) {
  if (!clientTranslationCache.has(langCode)) {
    const memMap = new Map();

    // 1. Seed from static key dictionaries (translations.en -> translations[langCode])
    const enDict = translations.en || {};
    const targetDict = translations[langCode] || {};
    Object.keys(enDict).forEach((k) => {
      const enVal = enDict[k];
      const targetVal = targetDict[k];
      if (
        typeof enVal === 'string' &&
        typeof targetVal === 'string' &&
        enVal.trim() &&
        targetVal.trim() &&
        enVal !== targetVal
      ) {
        memMap.set(enVal.trim(), targetVal.trim());
      }
    });

    // 2. Pre-seed Hindi exact mappings & phrase dictionaries
    if (langCode === 'hi') {
      if (HINDI_EXACT_MAP && typeof HINDI_EXACT_MAP === 'object') {
        Object.entries(HINDI_EXACT_MAP).forEach(([en, hi]) => {
          memMap.set(en.trim(), hi.trim());
        });
      }
      if (Array.isArray(HINDI_PHRASE_DICTIONARY)) {
        HINDI_PHRASE_DICTIONARY.forEach(([en, hi]) => {
          memMap.set(en.trim(), hi.trim());
        });
      }
    }

    // 3. Load persistent client cache from localStorage
    try {
      const raw = localStorage.getItem(`safar_trans_cache_${langCode}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        Object.entries(parsed).forEach(([k, v]) => memMap.set(k, v));
      }
    } catch {
      // Ignore parse error
    }

    clientTranslationCache.set(langCode, memMap);
  }
  return clientTranslationCache.get(langCode);
}

/**
 * Persist translation map updates to localStorage
 */
function saveCachedTranslations(langCode, newTranslationsMap) {
  try {
    const memMap = getCachedTranslations(langCode);
    const obj = {};
    memMap.forEach((v, k) => { obj[k] = v; });
    Object.assign(obj, newTranslationsMap);
    localStorage.setItem(`safar_trans_cache_${langCode}`, JSON.stringify(obj));
  } catch {
    // LocalStorage safety
  }
}

/**
 * Determines whether a DOM TextNode should be translated.
 */
function isTranslatableTextNode(node) {
  if (!node || node.nodeType !== Node.TEXT_NODE) return false;
  const val = node.nodeValue;
  if (!val || !val.trim()) return false;

  const trimmed = val.trim();
  // Skip pure numbers, times, percentages, and currencies
  if (/^[\d\s.,:;/%+\-₹$€#@_()]+$/.test(trimmed)) return false;
  // Skip phone numbers and ISO dates
  if (/^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(trimmed)) return false;
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return false;

  const parent = node.parentElement;
  if (!parent) return false;

  const tag = parent.tagName;
  // Ignore non-translatable container elements
  if (['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'CODE', 'PRE', 'SVG', 'PATH', 'NOSCRIPT'].includes(tag)) {
    return false;
  }

  if (parent.isContentEditable) return false;
  if (parent.closest('[data-no-translate]')) return false;

  return true;
}

/**
 * Synchronously applies all known cached translations across text nodes and input placeholders.
 */
function applyInstantTranslations(root, langCode) {
  if (!root) return;

  // If restoring to English, restore text nodes, placeholders, and titles
  if (langCode === 'en') {
    // Restore text nodes
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      if (originalTextMap.has(node)) {
        const original = originalTextMap.get(node);
        if (node.nodeValue !== original) {
          node.nodeValue = original;
        }
        originalTextMap.delete(node);
      }
      node = walker.nextNode();
    }

    // Restore input placeholders
    const inputs = root.querySelectorAll('input[placeholder], textarea[placeholder]');
    inputs.forEach((el) => {
      if (originalPlaceholderMap.has(el)) {
        el.placeholder = originalPlaceholderMap.get(el);
        originalPlaceholderMap.delete(el);
      }
    });

    return;
  }

  const langCache = getCachedTranslations(langCode);

  // 1. Translate text nodes
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node) {
    if (isTranslatableTextNode(node)) {
      if (!originalTextMap.has(node)) {
        originalTextMap.set(node, node.nodeValue);
      }
      const original = originalTextMap.get(node);
      const trimmed = original.trim();

      let translated = langCache.get(trimmed);

      // Fast-path phrase match for Hindi
      if (!translated && langCode === 'hi' && Array.isArray(HINDI_PHRASE_DICTIONARY)) {
        let replaced = trimmed;
        for (let i = 0; i < HINDI_PHRASE_DICTIONARY.length; i++) {
          const [en, hi] = HINDI_PHRASE_DICTIONARY[i];
          if (replaced.includes(en)) {
            replaced = replaced.replaceAll(en, hi);
          }
        }
        if (replaced !== trimmed) {
          translated = replaced;
          langCache.set(trimmed, translated);
        }
      }

      if (translated) {
        const leading = original.match(/^\s*/)[0];
        const trailing = original.match(/\s*$/)[0];
        const finalString = leading + translated + trailing;
        if (node.nodeValue !== finalString) {
          node.nodeValue = finalString;
        }
      }
    }
    node = walker.nextNode();
  }

  // 2. Translate input placeholders
  const inputs = root.querySelectorAll('input[placeholder], textarea[placeholder]');
  inputs.forEach((el) => {
    if (el.closest('[data-no-translate]')) return;
    if (!originalPlaceholderMap.has(el)) {
      originalPlaceholderMap.set(el, el.placeholder);
    }
    const origPlaceholder = originalPlaceholderMap.get(el);
    const trimmed = (origPlaceholder || '').trim();
    if (langCache.has(trimmed)) {
      el.placeholder = langCache.get(trimmed);
    }
  });
}

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('safar_language') || localStorage.getItem('safar_preferred_language') || 'en';
  });

  const [isTranslating, setIsTranslating] = useState(false);
  const [translationStatus, setTranslationStatus] = useState({ provider: 'native', cachedCount: 0 });
  
  const activeLangMeta = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
  const pendingRequestsRef = useRef(new Set());
  const debounceTimerRef = useRef(null);

  /**
   * Set direction attribute (RTL / LTR) and language tag on HTML document
   */
  useEffect(() => {
    const isRtl = activeLangMeta?.direction === 'rtl';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage, activeLangMeta]);

  /**
   * High-Speed Instant Language Switcher (0ms response time)
   */
  const changeLanguage = (langCode) => {
    if (!langCode || langCode === currentLanguage) return;
    
    // 1. Instantly trigger DOM update synchronously
    const root = document.getElementById('root') || document.body;
    applyInstantTranslations(root, langCode);

    // 2. Set direction immediately
    const targetMeta = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
    if (targetMeta) {
      document.documentElement.dir = targetMeta.direction === 'rtl' ? 'rtl' : 'ltr';
      document.documentElement.lang = langCode;
    }

    // 3. Persist and update React state
    setCurrentLanguage(langCode);
    localStorage.setItem('safar_language', langCode);
    localStorage.setItem('safar_preferred_language', langCode);
  };

  /**
   * Static Dictionary Translation Helper with Dynamic Variable Interpolation
   */
  const t = useCallback((key, fallback = '', params = {}) => {
    const activeDict = translations[currentLanguage] || translations.en || {};
    let text = activeDict[key];
    if (text === undefined) {
      text = translations.en?.[key] !== undefined ? translations.en[key] : (fallback || key);
    }

    if (params && typeof params === 'object' && typeof text === 'string') {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replaceAll(`{${k}}`, v);
      });
    }

    return text;
  }, [currentLanguage]);

  /**
   * Full-Page Autonomous TreeWalker & Dynamic Batch Translation Engine
   */
  useEffect(() => {
    const root = document.getElementById('root') || document.body;
    if (!root) return;

    // Run instant synchronous pass first
    applyInstantTranslations(root, currentLanguage);

    if (currentLanguage === 'en') {
      setIsTranslating(false);
      return;
    }

    const langCache = getCachedTranslations(currentLanguage);

    /**
     * Walks DOM to find any residual uncached strings and sends a batch request.
     */
    const syncUncachedStrings = async () => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const uncachedStrings = new Set();
      let node = walker.nextNode();

      // Gather from text nodes
      while (node) {
        if (isTranslatableTextNode(node)) {
          if (!originalTextMap.has(node)) {
            originalTextMap.set(node, node.nodeValue);
          }
          const original = originalTextMap.get(node);
          const trimmed = original.trim();

          if (langCache.has(trimmed)) {
            const translatedTrimmed = langCache.get(trimmed);
            const leading = original.match(/^\s*/)[0];
            const trailing = original.match(/\s*$/)[0];
            const finalString = leading + translatedTrimmed + trailing;
            if (node.nodeValue !== finalString) {
              node.nodeValue = finalString;
            }
          } else {
            if (!pendingRequestsRef.current.has(trimmed)) {
              uncachedStrings.add(trimmed);
            }
          }
        }
        node = walker.nextNode();
      }

      // Gather from input placeholders
      const inputs = root.querySelectorAll('input[placeholder], textarea[placeholder]');
      inputs.forEach((el) => {
        if (el.closest('[data-no-translate]')) return;
        if (!originalPlaceholderMap.has(el)) {
          originalPlaceholderMap.set(el, el.placeholder);
        }
        const origPlaceholder = originalPlaceholderMap.get(el);
        const trimmed = (origPlaceholder || '').trim();
        if (trimmed) {
          if (langCache.has(trimmed)) {
            el.placeholder = langCache.get(trimmed);
          } else if (!pendingRequestsRef.current.has(trimmed)) {
            uncachedStrings.add(trimmed);
          }
        }
      });

      // If there are uncached strings, fetch batch from /api/translation/batch
      if (uncachedStrings.size > 0) {
        const textArray = Array.from(uncachedStrings);
        textArray.forEach((s) => pendingRequestsRef.current.add(s));
        setIsTranslating(true);

        try {
          const res = await fetch('/api/translation/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              texts: textArray,
              targetLang: currentLanguage
            })
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && data.translations) {
              const newMap = {};
              Object.entries(data.translations).forEach(([orig, trans]) => {
                langCache.set(orig, trans);
                newMap[orig] = trans;
              });
              saveCachedTranslations(currentLanguage, newMap);
              setTranslationStatus({
                provider: data.provider || 'router',
                cachedCount: langCache.size
              });

              // Apply updated translations instantly
              applyInstantTranslations(root, currentLanguage);
            }
          }
        } catch (err) {
          console.warn('[S.A.F.A.R. Global Translation Router] Network error:', err.message);
        } finally {
          setIsTranslating(false);
          textArray.forEach((s) => pendingRequestsRef.current.delete(s));
        }
      }
    };

    syncUncachedStrings();

    // Observe dynamic React DOM mutations
    const observer = new MutationObserver(() => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        applyInstantTranslations(root, currentLanguage);
        syncUncachedStrings();
      }, 70);
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: false
    });

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      observer.disconnect();
    };
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage: changeLanguage,
        t,
        direction: activeLangMeta?.direction || 'ltr',
        supportedLanguages: SUPPORTED_LANGUAGES,
        activeLangMeta,
        isTranslating,
        translationStatus
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
