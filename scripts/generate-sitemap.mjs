// scripts/generate-sitemap.mjs
// Generates a fully compliant multilingual XML Sitemap with reciprocal xhtml:link alternates (22 locales + x-default)

import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = 'https://ytplaylistcal.com';
const TODAY = '2026-10-31';

const LOCALES = [
  'en', 'zh-CN', 'zh-TW', 'ar', 'es', 'fr', 'hi', 'id', 'fil', 'ru',
  'pl', 'nl', 'tr', 'vi', 'de', 'ja', 'pt-BR', 'it', 'th', 'ko', 'sv', 'he'
];

const PAGES = [
  { path: '', priority: '1.0', changefreq: 'weekly' },
  { path: 'tools', priority: '0.8', changefreq: 'weekly' },
  { path: 'how-it-works', priority: '0.8', changefreq: 'monthly' },
  { path: 'faq', priority: '0.8', changefreq: 'weekly' },
  { path: 'about', priority: '0.6', changefreq: 'monthly' },
  { path: 'contact', priority: '0.6', changefreq: 'monthly' },
  { path: 'privacy', priority: '0.4', changefreq: 'monthly' },
  { path: 'terms', priority: '0.4', changefreq: 'monthly' },
  { path: 'disclaimer', priority: '0.4', changefreq: 'monthly' },
  { path: 'youtube-playlist-duration-calculator', priority: '0.9', changefreq: 'weekly' },
  { path: 'youtube-playlist-remaining-time', priority: '0.9', changefreq: 'weekly' },
  { path: 'youtube-watch-time-calculator', priority: '0.9', changefreq: 'weekly' },
  { path: 'youtube-watch-time-at-1-5x', priority: '0.9', changefreq: 'weekly' },
  { path: 'youtube-watch-time-at-2x', priority: '0.9', changefreq: 'weekly' },
];

function buildUrl(locale, subpath) {
  if (!subpath) {
    return `${SITE_URL}/${locale}/`;
  }
  return `${SITE_URL}/${locale}/${subpath}/`;
}

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

let count = 0;

for (const page of PAGES) {
  for (const locale of LOCALES) {
    const loc = buildUrl(locale, page.path);
    xml += `  <url>\n`;
    xml += `    <loc>${loc}</loc>\n`;
    xml += `    <lastmod>${TODAY}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;

    // Reciprocal xhtml:link alternates for all 22 locales
    for (const altLocale of LOCALES) {
      const altHref = buildUrl(altLocale, page.path);
      xml += `    <xhtml:link rel="alternate" hreflang="${altLocale}" href="${altHref}" />\n`;
    }

    // x-default points to English
    const xDefaultHref = buildUrl('en', page.path);
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefaultHref}" />\n`;

    xml += `  </url>\n`;
    count++;
  }
}

xml += `</urlset>\n`;

const outPath = path.resolve('public/sitemap.xml');
fs.writeFileSync(outPath, xml, 'utf8');

console.log(`Successfully generated public/sitemap.xml with ${count} URLs (14 pages × 22 locales).`);

