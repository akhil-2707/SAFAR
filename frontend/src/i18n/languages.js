/**
 * S.A.F.A.R. Centralized Language Registry (Frontend)
 * 
 * Provides unified language metadata for the UI, Globe selector, and RTL layout engine.
 */

export const SUPPORTED_LANGUAGES = [
  // --- Indian Languages (BHASHINI Primary) ---
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    direction: 'ltr',
    region: 'INDIAN',
    providerTag: 'BHASHINI'
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇮🇳',
    direction: 'ltr',
    region: 'INDIAN',
    providerTag: 'BHASHINI'
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    direction: 'ltr',
    region: 'INDIAN',
    providerTag: 'BHASHINI'
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    direction: 'ltr',
    region: 'INDIAN',
    providerTag: 'BHASHINI'
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    flag: '🇮🇳',
    direction: 'ltr',
    region: 'INDIAN',
    providerTag: 'BHASHINI'
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    flag: '🇮🇳',
    direction: 'ltr',
    region: 'INDIAN',
    providerTag: 'BHASHINI'
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    flag: '🇮🇳',
    direction: 'ltr',
    region: 'INDIAN',
    providerTag: 'BHASHINI'
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    flag: '🇮🇳',
    direction: 'ltr',
    region: 'INDIAN',
    providerTag: 'BHASHINI'
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    flag: '🇮🇳',
    direction: 'ltr',
    region: 'INDIAN',
    providerTag: 'BHASHINI'
  },
  {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    flag: '🇮🇳',
    direction: 'ltr',
    region: 'INDIAN',
    providerTag: 'BHASHINI'
  },
  {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    flag: '🇮🇳',
    direction: 'ltr',
    region: 'INDIAN',
    providerTag: 'BHASHINI'
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    flag: '🇮🇳',
    direction: 'rtl',
    region: 'INDIAN',
    providerTag: 'BHASHINI'
  },

  // --- International / Global Languages (Google Cloud Translation Primary) ---
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    direction: 'ltr',
    region: 'GLOBAL',
    providerTag: 'MASTER'
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    direction: 'ltr',
    region: 'GLOBAL',
    providerTag: 'GOOGLE'
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    direction: 'ltr',
    region: 'GLOBAL',
    providerTag: 'GOOGLE'
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    direction: 'ltr',
    region: 'GLOBAL',
    providerTag: 'GOOGLE'
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    direction: 'ltr',
    region: 'GLOBAL',
    providerTag: 'GOOGLE'
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    direction: 'ltr',
    region: 'GLOBAL',
    providerTag: 'GOOGLE'
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    direction: 'ltr',
    region: 'GLOBAL',
    providerTag: 'GOOGLE'
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    direction: 'ltr',
    region: 'GLOBAL',
    providerTag: 'GOOGLE'
  },
  {
    code: 'zh',
    name: 'Chinese (Simplified)',
    nativeName: '中文 (简体)',
    flag: '🇨🇳',
    direction: 'ltr',
    region: 'GLOBAL',
    providerTag: 'GOOGLE'
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    direction: 'rtl',
    region: 'GLOBAL',
    providerTag: 'GOOGLE'
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    direction: 'ltr',
    region: 'GLOBAL',
    providerTag: 'GOOGLE'
  }
];

export const SAFAR_GLOSSARY_TERMS = [
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
  'Deadman Switch'
];
