/**
 * S.A.F.A.R. Centralized Language Registry & Glossary Configuration
 * 
 * Defines all supported Indian (BHASHINI primary) and International (Google primary)
 * languages, script directions, and protected SAFAR product glossary terms.
 */

const SUPPORTED_LANGUAGES = [
  // --- Indian Languages (22 Scheduled & Popular Regional - BHASHINI Preferred) ---
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    direction: 'ltr',
    region: 'INDIAN',
    primaryProvider: 'bhashini',
    fallbackProvider: 'google'
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇮🇳',
    direction: 'ltr',
    region: 'INDIAN',
    primaryProvider: 'bhashini',
    fallbackProvider: 'google'
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    direction: 'ltr',
    region: 'INDIAN',
    primaryProvider: 'bhashini',
    fallbackProvider: 'google'
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    direction: 'ltr',
    region: 'INDIAN',
    primaryProvider: 'bhashini',
    fallbackProvider: 'google'
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    flag: '🇮🇳',
    direction: 'ltr',
    region: 'INDIAN',
    primaryProvider: 'bhashini',
    fallbackProvider: 'google'
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    flag: '🇮🇳',
    direction: 'ltr',
    region: 'INDIAN',
    primaryProvider: 'bhashini',
    fallbackProvider: 'google'
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    flag: '🇮🇳',
    direction: 'ltr',
    region: 'INDIAN',
    primaryProvider: 'bhashini',
    fallbackProvider: 'google'
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    flag: '🇮🇳',
    direction: 'ltr',
    region: 'INDIAN',
    primaryProvider: 'bhashini',
    fallbackProvider: 'google'
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    flag: '🇮🇳',
    direction: 'ltr',
    region: 'INDIAN',
    primaryProvider: 'bhashini',
    fallbackProvider: 'google'
  },
  {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    flag: '🇮🇳',
    direction: 'ltr',
    region: 'INDIAN',
    primaryProvider: 'bhashini',
    fallbackProvider: 'google'
  },
  {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    flag: '🇮🇳',
    direction: 'ltr',
    region: 'INDIAN',
    primaryProvider: 'bhashini',
    fallbackProvider: 'google'
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    flag: '🇮🇳',
    direction: 'rtl',
    region: 'INDIAN',
    primaryProvider: 'bhashini',
    fallbackProvider: 'google'
  },

  // --- International / Global Languages (Google Cloud Translation Preferred) ---
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    direction: 'ltr',
    region: 'GLOBAL',
    primaryProvider: 'native',
    fallbackProvider: 'native'
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    direction: 'ltr',
    region: 'GLOBAL',
    primaryProvider: 'google',
    fallbackProvider: 'google'
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    direction: 'ltr',
    region: 'GLOBAL',
    primaryProvider: 'google',
    fallbackProvider: 'google'
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    direction: 'ltr',
    region: 'GLOBAL',
    primaryProvider: 'google',
    fallbackProvider: 'google'
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    direction: 'ltr',
    region: 'GLOBAL',
    primaryProvider: 'google',
    fallbackProvider: 'google'
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    direction: 'ltr',
    region: 'GLOBAL',
    primaryProvider: 'google',
    fallbackProvider: 'google'
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    direction: 'ltr',
    region: 'GLOBAL',
    primaryProvider: 'google',
    fallbackProvider: 'google'
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    direction: 'ltr',
    region: 'GLOBAL',
    primaryProvider: 'google',
    fallbackProvider: 'google'
  },
  {
    code: 'zh',
    name: 'Chinese (Simplified)',
    nativeName: '中文 (简体)',
    flag: '🇨🇳',
    direction: 'ltr',
    region: 'GLOBAL',
    primaryProvider: 'google',
    fallbackProvider: 'google'
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    direction: 'rtl',
    region: 'GLOBAL',
    primaryProvider: 'google',
    fallbackProvider: 'google'
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    direction: 'ltr',
    region: 'GLOBAL',
    primaryProvider: 'google',
    fallbackProvider: 'google'
  }
];

/**
 * Protected S.A.F.A.R. Glossary / Brand Terms
 * These terms must never be corrupted, transliterated into gibberish, or randomly translated.
 */
const SAFAR_GLOSSARY_TERMS = [
  'S.A.F.A.R.',
  'SAFAR',
  'SafeID',
  'SafeTour',
  'Green Coins',
  'Smart Micro-Stays',
  'Virtual Queue',
  'Swachh Food',
  'Ghost-Mesh',
  'Ghost Mesh',
  'E-Vehicles',
  'ERSS 112',
  '112 ERSS',
  'Tourist Police',
  'DPDP Act 2023',
  'Deadman Switch',
  'Kaziranga',
  'Brahmaputra',
  'Tawang',
  'Ayodhya',
  'Varanasi',
  'Kashi Vishwanath',
  'Ram Mandir'
];

module.exports = {
  SUPPORTED_LANGUAGES,
  SAFAR_GLOSSARY_TERMS
};
