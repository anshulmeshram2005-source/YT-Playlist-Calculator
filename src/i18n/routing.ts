import { LOCALES, DEFAULT_LOCALE, type Locale, isValidLocale, LOCALE_METADATA } from './config';

export const SITE_URL = 'https://ytplaylistcal.com';

/**
 * Remove any existing locale prefix from a pathname
 * e.g. '/es/tools/' -> '/tools/'
 *      '/es' -> '/'
 *      '/tools/' -> '/tools/'
 */
export function stripLocaleFromPath(pathname: string): string {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const segments = normalized.split('/').filter(Boolean);

  if (segments.length > 0 && isValidLocale(segments[0])) {
    const rest = segments.slice(1).join('/');
    return rest ? `/${rest}/` : '/';
  }

  return normalized.endsWith('/') ? normalized : `${normalized}/`;
}

/**
 * Build a localized relative URL for a path and locale
 * e.g. ('tools', 'es') -> '/es/tools/'
 *      ('/', 'hi') -> '/hi/'
 */
export function getLocalizedUrl(path: string, locale: Locale): string {
  const cleanPath = stripLocaleFromPath(path);
  if (cleanPath === '/') {
    return `/${locale}/`;
  }
  const trimmed = cleanPath.replace(/^\/|\/$/g, '');
  return `/${locale}/${trimmed}/`;
}

/**
 * Build a localized absolute URL
 */
export function getAbsoluteLocalizedUrl(path: string, locale: Locale, siteUrl = SITE_URL): string {
  const relative = getLocalizedUrl(path, locale);
  return `${siteUrl.replace(/\/$/, '')}${relative}`;
}

export interface HreflangLink {
  hreflang: string;
  href: string;
}

/**
 * Generate hreflang alternate links for all 22 supported languages + x-default
 * for any given page path.
 */
export function getHreflangLinks(currentPath: string, siteUrl = SITE_URL): HreflangLink[] {
  const cleanPath = stripLocaleFromPath(currentPath);
  const base = siteUrl.replace(/\/$/, '');

  const links: HreflangLink[] = LOCALES.map((locale) => {
    const meta = LOCALE_METADATA[locale];
    const url = getAbsoluteLocalizedUrl(cleanPath, locale, base);
    return {
      hreflang: meta.bcp47,
      href: url,
    };
  });

  // x-default points to default language (English)
  links.push({
    hreflang: 'x-default',
    href: getAbsoluteLocalizedUrl(cleanPath, DEFAULT_LOCALE, base),
  });

  return links;
}

/**
 * Extract locale from URL pathname
 */
export function extractLocaleFromPath(pathname: string): { locale: Locale; pathWithoutLocale: string } {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const segments = normalized.split('/').filter(Boolean);

  if (segments.length > 0 && isValidLocale(segments[0])) {
    const locale = segments[0] as Locale;
    const rest = segments.slice(1).join('/');
    return {
      locale,
      pathWithoutLocale: rest ? `/${rest}/` : '/',
    };
  }

  return {
    locale: DEFAULT_LOCALE,
    pathWithoutLocale: normalized.endsWith('/') ? normalized : `${normalized}/`,
  };
}

