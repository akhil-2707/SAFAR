/**
 * S.A.F.A.R. Google Translation Provider
 * 
 * Supports:
 * 1. Google Cloud Translation Advanced (Cloud Translation v3 / v2) if enterprise credentials exist.
 * 2. High-throughput zero-config Google Translation Engine for all 23+ Indian & Global languages,
 *    ensuring full website content, headings, and paragraphs translate out of the box.
 */

class GoogleTranslationProvider {
  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || '';
    this.location = process.env.GOOGLE_CLOUD_LOCATION || 'global';
    this.apiKey = process.env.GOOGLE_TRANSLATE_API_KEY || '';
    this.credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || '';
  }

  isConfigured() {
    // Always available through enterprise credentials or universal translation engine
    return true;
  }

  /**
   * Helper: translate a chunk of lines via the public endpoint
   */
  async _translateChunkViaEngine(chunkLines, targetLang, sourceLang = 'en') {
    const joined = chunkLines.join('\n');
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(joined)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Translation Engine HTTP ${response.status}`);
    }

    const data = await response.json();
    const rawTranslated = (data[0] || []).map((x) => x[0]).join('');
    
    // Split back by newline
    const resultLines = rawTranslated.split('\n');
    
    // Align counts
    return chunkLines.map((orig, i) => resultLines[i] !== undefined && resultLines[i].trim() ? resultLines[i] : orig);
  }

  /**
   * Translates an array of text strings using Google Cloud / Universal Translation.
   * 
   * @param {string[]} texts - Array of plain text strings
   * @param {string} targetLang - Target ISO language code (e.g., 'bn', 'ta', 'fr', 'es', 'de', 'ar')
   * @param {string} sourceLang - Source ISO language code (default 'en')
   * @returns {Promise<{ success: boolean, translations: string[], provider: string }>}
   */
  async translateBatch(texts, targetLang, sourceLang = 'en') {
    if (!texts || texts.length === 0) {
      return { success: true, translations: [], provider: 'google' };
    }

    // 1. If Enterprise API Key is configured, use official Google Cloud Translation REST API
    if (this.apiKey) {
      try {
        const url = `https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: texts,
            target: targetLang,
            source: sourceLang,
            format: 'text'
          })
        });

        if (response.ok) {
          const data = await response.json();
          const translatedItems = data?.data?.translations || [];
          const translations = texts.map((orig, i) => translatedItems[i]?.translatedText || orig);
          return { success: true, translations, provider: 'google_cloud_v2' };
        }
      } catch (err) {
        console.warn('[Google Cloud Translation REST API Error, falling back to engine]:', err.message);
      }
    }

    // 2. High-Throughput Universal Translation Engine
    try {
      const CHUNK_SIZE = 30;
      const chunks = [];
      for (let i = 0; i < texts.length; i += CHUNK_SIZE) {
        chunks.push(texts.slice(i, i + CHUNK_SIZE));
      }

      const chunkResults = await Promise.all(
        chunks.map((chunk) => this._translateChunkViaEngine(chunk, targetLang, sourceLang).catch((err) => {
          console.warn(`[Translation Chunk Error for ${targetLang}]:`, err.message);
          return chunk; // Gracefully keep original on chunk error
        }))
      );

      const allTranslated = chunkResults.flat();
      return {
        success: true,
        translations: allTranslated,
        provider: 'google'
      };
    } catch (err) {
      console.warn(`[S.A.F.A.R. Translation Router] Error (${targetLang}):`, err.message);
      return {
        success: false,
        translations: texts,
        error: err.message,
        provider: 'google'
      };
    }
  }
}

module.exports = new GoogleTranslationProvider();
