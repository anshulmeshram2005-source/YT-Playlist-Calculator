import { DEFAULT_LOCALE, LOCALE_METADATA, type Locale } from './config';

import ar from './locales/ar.json';
import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fil from './locales/fil.json';
import fr from './locales/fr.json';
import he from './locales/he.json';
import hi from './locales/hi.json';
import id from './locales/id.json';
import it from './locales/it.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import nl from './locales/nl.json';
import pl from './locales/pl.json';
import ptBR from './locales/pt-BR.json';
import ru from './locales/ru.json';
import sv from './locales/sv.json';
import th from './locales/th.json';
import tr from './locales/tr.json';
import vi from './locales/vi.json';
import zhCN from './locales/zh-CN.json';
import zhTW from './locales/zh-TW.json';

export type Translations = typeof en;

const translationsMap: Record<Locale, Translations> = {
  ar,
  de,
  en,
  es,
  fil,
  fr,
  he,
  hi,
  id,
  it,
  ja,
  ko,
  nl,
  pl,
  'pt-BR': ptBR,
  ru,
  sv,
  th,
  tr,
  vi,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
};

/**
 * Get translations dictionary for a given locale, falling back to English.
 */
export function getTranslations(locale?: string): Translations {
  if (locale && locale in translationsMap) {
    return translationsMap[locale as Locale];
  }
  return translationsMap[DEFAULT_LOCALE];
}

/**
 * Replaces `{varName}` patterns in a string with matching values from a dictionary.
 */
export function tFormat(template?: string, vars: Record<string, string | number> = {}): string {
  if (!template || typeof template !== 'string') return '';
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return key in vars ? String(vars[key]) : match;
  });
}

/**
 * Format a number using Intl.NumberFormat according to the locale's BCP 47 tag.
 */
export function formatLocalizedNumber(
  num: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string {
  const bcp47 = LOCALE_METADATA[locale]?.bcp47 || 'en';
  try {
    return new Intl.NumberFormat(bcp47, options).format(num);
  } catch {
    return String(num);
  }
}

/**
 * Format a date using Intl.DateTimeFormat according to the locale's BCP 47 tag.
 */
export function formatLocalizedDate(
  date: Date,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string {
  const bcp47 = LOCALE_METADATA[locale]?.bcp47 || 'en';
  try {
    return new Intl.DateTimeFormat(bcp47, options).format(date);
  } catch {
    return date.toDateString();
  }
}

/**
 * Convert seconds into a human-readable duration string: e.g. "2h 45m 12s" or "35m 10s"
 */
export function formatSecondsToHms(seconds: number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
} {
  const s = Math.max(0, Math.floor(seconds));
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  parts.push(`${sec}s`);

  return {
    days,
    hours,
    minutes,
    seconds: sec,
    formatted: parts.join(' '),
  };
}
