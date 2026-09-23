/**
 * S.A.F.A.R. Translation API Endpoints
 * 
 * Provides:
 * - GET  /api/translation/languages : List of supported languages and router provider status
 * - POST /api/translation/batch     : High-speed batch translation endpoint
 * - GET  /api/translation/status    : Provider connectivity status and cache statistics
 */

const express = require('express');
const router = express.Router();
const translationRouter = require('../services/translationRouter');

// GET /api/translation/languages
router.get('/languages', (req, res) => {
  try {
    const status = translationRouter.getSystemStatus();
    res.json({
      success: true,
      languages: status.supportedLanguages,
      providers: status.providers
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve languages',
      message: err.message
    });
  }
});

// GET /api/translation/status
router.get('/status', (req, res) => {
  try {
    const status = translationRouter.getSystemStatus();
    res.json({
      success: true,
      ...status
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve translation status',
      message: err.message
    });
  }
});

// POST /api/translation/batch
router.post('/batch', async (req, res) => {
  try {
    const { texts, targetLang, context } = req.body;

    if (!targetLang) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_TARGET_LANGUAGE',
        message: 'Field targetLang is required'
      });
    }

    if (!Array.isArray(texts)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PAYLOAD',
        message: 'Field texts must be an array of strings'
      });
    }

    const result = await translationRouter.translateBatch(texts, targetLang, context);
    res.json({
      success: true,
      targetLanguage: targetLang,
      provider: result.provider,
      cachedCount: result.cachedCount,
      translations: result.translations
    });
  } catch (err) {
    console.error('[S.A.F.A.R. Translation API Error]:', err);
    res.status(500).json({
      success: false,
      error: 'TRANSLATION_ROUTING_ERROR',
      message: err.message
    });
  }
});

module.exports = router;
