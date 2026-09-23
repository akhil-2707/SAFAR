/**
 * S.A.F.A.R. BHASHINI Translation Provider
 * 
 * Implements official Government of India BHASHINI (ULCA / Anuvaad) API
 * for 22 scheduled Indian languages.
 */

const DEFAULT_INFERENCE_URL = 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline';

class BhashiniProvider {
  constructor() {
    this.userId = process.env.BHASHINI_USER_ID || '';
    this.apiKey = process.env.BHASHINI_API_KEY || '';
    this.pipelineId = process.env.BHASHINI_PIPELINE_ID || '';
    this.inferenceUrl = process.env.BHASHINI_INFERENCE_URL || DEFAULT_INFERENCE_URL;
  }

  /**
   * Checks if live credentials have been configured in environment variables.
   */
  isConfigured() {
    return Boolean(this.userId && this.apiKey);
  }

  /**
   * Translates an array of text strings from source language to target language.
   * 
   * @param {string[]} texts - Array of plain text strings
   * @param {string} targetLang - Target ISO language code (e.g., 'hi', 'bn', 'ta')
   * @param {string} sourceLang - Source ISO language code (default 'en')
   * @returns {Promise<{ success: boolean, translations: string[], provider: string }>}
   */
  async translateBatch(texts, targetLang, sourceLang = 'en') {
    if (!this.isConfigured()) {
      return {
        success: false,
        translations: texts,
        error: 'BHASHINI_CREDENTIALS_NOT_CONFIGURED',
        provider: 'bhashini'
      };
    }

    if (!texts || texts.length === 0) {
      return { success: true, translations: [], provider: 'bhashini' };
    }

    try {
      const payload = {
        pipelineTasks: [
          {
            taskType: 'translation',
            config: {
              language: {
                sourceLanguage: sourceLang,
                targetLanguage: targetLang
              },
              ...(this.pipelineId ? { serviceId: this.pipelineId } : {})
            }
          }
        ],
        inputData: {
          input: texts.map((t) => ({ source: t }))
        }
      };

      const headers = {
        'Content-Type': 'application/json',
        'userID': this.userId,
        'ulcaApiKey': this.apiKey
      };

      const response = await fetch(this.inferenceUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`BHASHINI API HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const outputList = data?.pipelineResponse?.[0]?.output || [];
      
      const translations = texts.map((orig, idx) => {
        return outputList[idx]?.target || orig;
      });

      return {
        success: true,
        translations,
        provider: 'bhashini'
      };
    } catch (err) {
      console.warn(`[S.A.F.A.R. Translation Router] BHASHINI Error (${targetLang}):`, err.message);
      return {
        success: false,
        translations: texts,
        error: err.message,
        provider: 'bhashini'
      };
    }
  }
}

module.exports = new BhashiniProvider();
