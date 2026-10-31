export const LOCALES = [
  'en',
  'zh-CN',
  'zh-TW',
  'ar',
  'es',
  'fr',
  'hi',
  'id',
  'fil',
  'ru',
  'pl',
  'nl',
  'tr',
  'vi',
  'de',
  'ja',
  'pt-BR',
  'it',
  'th',
  'ko',
  'sv',
  'he',
] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export interface LocaleMetadata {
  code: Locale;
  bcp47: string;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
  ogLocale: string;
}

export const LOCALE_METADATA: Record<Locale, LocaleMetadata> = {
  en: {
    code: 'en',
    bcp47: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    dir: 'ltr',
    ogLocale: 'en_US',
  },
  'zh-CN': {
    code: 'zh-CN',
    bcp47: 'zh-CN',
    name: 'Chinese Simplified',
    nativeName: '中文',
    flag: '🇨🇳',
    dir: 'ltr',
    ogLocale: 'zh_CN',
  },
  'zh-TW': {
    code: 'zh-TW',
    bcp47: 'zh-TW',
    name: 'Chinese Traditional',
    nativeName: '繁體中文',
    flag: '🇹🇼',
    dir: 'ltr',
    ogLocale: 'zh_TW',
  },
  ar: {
    code: 'ar',
    bcp47: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    dir: 'rtl',
    ogLocale: 'ar_AR',
  },
  es: {
    code: 'es',
    bcp47: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    dir: 'ltr',
    ogLocale: 'es_ES',
  },
  fr: {
    code: 'fr',
    bcp47: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    dir: 'ltr',
    ogLocale: 'fr_FR',
  },
  hi: {
    code: 'hi',
    bcp47: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    dir: 'ltr',
    ogLocale: 'hi_IN',
  },
  id: {
    code: 'id',
    bcp47: 'id',
    name: 'Indonesian',
    nativeName: 'Indonesia',
    flag: '🇮🇩',
    dir: 'ltr',
    ogLocale: 'id_ID',
  },
  fil: {
    code: 'fil',
    bcp47: 'fil',
    name: 'Filipino',
    nativeName: 'Filipino',
    flag: '🇵🇭',
    dir: 'ltr',
    ogLocale: 'fil_PH',
  },
  ru: {
    code: 'ru',
    bcp47: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    dir: 'ltr',
    ogLocale: 'ru_RU',
  },
  pl: {
    code: 'pl',
    bcp47: 'pl',
    name: 'Polish',
    nativeName: 'Polski',
    flag: '🇵🇱',
    dir: 'ltr',
    ogLocale: 'pl_PL',
  },
  nl: {
    code: 'nl',
    bcp47: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    flag: '🇳🇱',
    dir: 'ltr',
    ogLocale: 'nl_NL',
  },
  tr: {
    code: 'tr',
    bcp47: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    dir: 'ltr',
    ogLocale: 'tr_TR',
  },
  vi: {
    code: 'vi',
    bcp47: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    dir: 'ltr',
    ogLocale: 'vi_VN',
  },
  de: {
    code: 'de',
    bcp47: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    dir: 'ltr',
    ogLocale: 'de_DE',
  },
  ja: {
    code: 'ja',
    bcp47: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    dir: 'ltr',
    ogLocale: 'ja_JP',
  },
  'pt-BR': {
    code: 'pt-BR',
    bcp47: 'pt-BR',
    name: 'Portuguese (Brazilian)',
    nativeName: 'Português',
    flag: '🇧🇷',
    dir: 'ltr',
    ogLocale: 'pt_BR',
  },
  it: {
    code: 'it',
    bcp47: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    dir: 'ltr',
    ogLocale: 'it_IT',
  },
  th: {
    code: 'th',
    bcp47: 'th',
    name: 'Thai',
    nativeName: 'ไทย',
    flag: '🇹🇭',
    dir: 'ltr',
    ogLocale: 'th_TH',
  },
  ko: {
    code: 'ko',
    bcp47: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    dir: 'ltr',
    ogLocale: 'ko_KR',
  },
  sv: {
    code: 'sv',
    bcp47: 'sv',
    name: 'Swedish',
    nativeName: 'Svenska',
    flag: '🇸🇪',
    dir: 'ltr',
    ogLocale: 'sv_SE',
  },
  he: {
    code: 'he',
    bcp47: 'he',
    name: 'Hebrew',
    nativeName: 'עברית',
    flag: '🇮🇱',
    dir: 'rtl',
    ogLocale: 'he_IL',
  },
};

export function isValidLocale(code: unknown): code is Locale {
  return typeof code === 'string' && LOCALES.includes(code as Locale);
}

export function getLocaleDirection(locale: Locale): 'ltr' | 'rtl' {
  return LOCALE_METADATA[locale]?.dir ?? 'ltr';
}
