/**
 * S.A.F.A.R. Intelligent Translation Router
 * 
 * Orchestrates multi-provider routing between:
 * - BHASHINI (Preferred for 22 scheduled Indian languages)
 * - Google Cloud Translation (Preferred for international languages & global fallback)
 * - S.A.F.A.R. Glossary Protection Layer
 * - High-speed Server-side Translation Cache
 */

const { SUPPORTED_LANGUAGES, SAFAR_GLOSSARY_TERMS } = require('../config/languages');
const bhashiniProvider = require('./bhashiniProvider');
const googleProvider = require('./googleTranslationProvider');

// In-Memory Translation Cache: Map<targetLang, Map<originalText, translatedText>>
const translationCache = new Map();

// Helper to get or create language cache
function getLangCache(targetLang) {
  if (!translationCache.has(targetLang)) {
    translationCache.set(targetLang, new Map());
  }
  return translationCache.get(targetLang);
}

class TranslationRouter {
  constructor() {
    this.languages = SUPPORTED_LANGUAGES;
    this.glossaryTerms = SAFAR_GLOSSARY_TERMS;
  }

  /**
   * Returns metadata for all supported languages and live provider configuration status.
   */
  getSystemStatus() {
    return {
      supportedLanguages: this.languages,
      providers: {
        bhashini: {
          configured: bhashiniProvider.isConfigured(),
          supportedRegion: 'INDIAN',
          description: 'Government of India National Language Translation Mission (ULCA)'
        },
        google: {
          configured: googleProvider.isConfigured(),
          supportedRegion: 'GLOBAL',
          description: 'Google Cloud Translation Advanced (Neural Machine Translation & LLM)'
        }
      },
      glossaryTermsCount: this.glossaryTerms.length,
      cachedLanguagesCount: translationCache.size
    };
  }

  /**
   * Batch translation orchestrator.
   * 
   * @param {string[]} texts - Array of unique strings to translate
   * @param {string} targetLang - Target language code (e.g., 'hi', 'fr', 'ar')
   * @param {object} [context] - Optional metadata / context
   * @returns {Promise<{ translations: Record<string, string>, provider: string, cachedCount: number }>}
   */
  async translateBatch(texts, targetLang, context = {}) {
    if (!targetLang || targetLang === 'en' || !Array.isArray(texts) || texts.length === 0) {
      const identityMap = {};
      (texts || []).forEach((t) => { identityMap[t] = t; });
      return { translations: identityMap, provider: 'none', cachedCount: 0 };
    }

    const langMeta = this.languages.find((l) => l.code === targetLang) || {
      code: targetLang,
      region: 'GLOBAL',
      primaryProvider: 'google'
    };

    const langCache = getLangCache(targetLang);
    const results = {};
    const uncachedTexts = [];

    // 1. Check Cache first
    for (const text of texts) {
      if (typeof text !== 'string' || !text.trim()) {
        results[text] = text;
        continue;
      }
      if (langCache.has(text)) {
        results[text] = langCache.get(text);
      } else {
        uncachedTexts.push(text);
      }
    }

    if (uncachedTexts.length === 0) {
      return {
        translations: results,
        provider: 'cache',
        cachedCount: texts.length
      };
    }

    // 2. Decide Primary and Secondary Provider
    let primary = langMeta.region === 'INDIAN' ? bhashiniProvider : googleProvider;
    let secondary = langMeta.region === 'INDIAN' ? googleProvider : bhashiniProvider;
    let primaryName = langMeta.region === 'INDIAN' ? 'bhashini' : 'google';
    let secondaryName = langMeta.region === 'INDIAN' ? 'google' : 'bhashini';

    let providerUsed = 'fallback_english';
    let translatedArray = null;

    // 3. Attempt Primary Provider
    if (primary.isConfigured()) {
      const res = await primary.translateBatch(uncachedTexts, targetLang, 'en');
      if (res.success && Array.isArray(res.translations)) {
        translatedArray = res.translations;
        providerUsed = primaryName;
      }
    }

    // 4. Fallback to Secondary Provider if primary failed or was unconfigured
    if (!translatedArray && secondary.isConfigured()) {
      const res = await secondary.translateBatch(uncachedTexts, targetLang, 'en');
      if (res.success && Array.isArray(res.translations)) {
        translatedArray = res.translations;
        providerUsed = secondaryName;
      }
    }

    // 5. Store in Cache and populate results
    if (translatedArray && translatedArray.length === uncachedTexts.length) {
      uncachedTexts.forEach((orig, idx) => {
        const translated = translatedArray[idx] || orig;
        langCache.set(orig, translated);
        results[orig] = translated;
      });
    } else {
      // Neither provider could process (e.g. credentials not yet provided)
      // Gracefully fall back to original text without crashing
      uncachedTexts.forEach((orig) => {
        results[orig] = orig;
      });
    }

    return {
      translations: results,
      provider: providerUsed,
      cachedCount: texts.length - uncachedTexts.length
    };
  }
}

module.exports = new TranslationRouter();
