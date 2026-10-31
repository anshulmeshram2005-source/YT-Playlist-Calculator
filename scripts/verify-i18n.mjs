// scripts/verify-i18n.mjs — Comprehensive Internationalization & SEO QA Test Runner
const BASE_URL = 'http://localhost:4321';

const LOCALES = [
  'en', 'zh-CN', 'zh-TW', 'ar', 'es', 'fr', 'hi', 'id', 'fil', 'ru',
  'pl', 'nl', 'tr', 'vi', 'de', 'ja', 'pt-BR', 'it', 'th', 'ko', 'sv', 'he'
];

const BCP47_MAP = {
  'en': 'en',
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
  'ar': 'ar',
  'es': 'es',
  'fr': 'fr',
  'hi': 'hi',
  'id': 'id',
  'fil': 'fil',
  'ru': 'ru',
  'pl': 'pl',
  'nl': 'nl',
  'tr': 'tr',
  'vi': 'vi',
  'de': 'de',
  'ja': 'ja',
  'pt-BR': 'pt-BR',
  'it': 'it',
  'th': 'th',
  'ko': 'ko',
  'sv': 'sv',
  'he': 'he',
};

const RTL_LOCALES = new Set(['ar', 'he']);

const SUBPAGES = [
  'tools', 'how-it-works', 'faq', 'about', 'contact', 'privacy', 'terms', 'disclaimer',
  'youtube-playlist-duration-calculator', 'youtube-playlist-remaining-time',
  'youtube-watch-time-calculator', 'youtube-watch-time-at-1-5x', 'youtube-watch-time-at-2x'
];

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
  } else {
    failedTests++;
    console.error(`❌ FAILED: ${message}`);
  }
}

async function run() {
  console.log('🚀 Starting Internationalization (i18n) & SEO Verification...\n');

  // 1. Test All 22 Homepage Locales
  console.log('--- 1. Testing All 22 Locales on Homepage ---');
  for (const locale of LOCALES) {
    const url = `${BASE_URL}/${locale}/`;
    const res = await fetch(url);
    assert(res.status === 200, `Homepage /${locale}/ returned status ${res.status}`);

    const html = await res.text();
    const expectedBcp47 = BCP47_MAP[locale];
    const isRtl = RTL_LOCALES.has(locale);

    // Check <html lang="..." dir="...">
    const htmlTagMatch = html.match(/<html\s+([^>]+)>/i);
    assert(!!htmlTagMatch, `/${locale}/ has valid <html> tag`);
    if (htmlTagMatch) {
      const attrs = htmlTagMatch[1];
      assert(attrs.includes(`lang="${expectedBcp47}"`), `/${locale}/ html lang="${expectedBcp47}"`);
      assert(attrs.includes(`dir="${isRtl ? 'rtl' : 'ltr'}"`), `/${locale}/ html dir="${isRtl ? 'rtl' : 'ltr'}"`);
    }

    // Check canonical URL
    const expectedCanonical = `https://ytplaylistcal.com/${locale}/`;
    assert(html.includes(`rel="canonical" href="${expectedCanonical}"`), `/${locale}/ canonical is ${expectedCanonical}`);

    // Check hreflang tags: all 22 locales + x-default = 23 hreflang tags
    const hreflangMatches = html.match(/rel="alternate"\s+hreflang="([^"]+)"/g) || [];
    assert(hreflangMatches.length === 23, `/${locale}/ has 23 hreflang alternate tags (got ${hreflangMatches.length})`);

    // Check x-default
    assert(html.includes('hreflang="x-default"'), `/${locale}/ contains x-default hreflang`);

    // Check title tag
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    assert(!!titleMatch && titleMatch[1].trim().length > 5, `/${locale}/ title is populated: "${titleMatch ? titleMatch[1] : ''}"`);
  }

  // 2. Test Subpages in Sample Locales
  console.log('\n--- 2. Testing Subpages Across Locales ---');
  const sampleLocales = ['en', 'es', 'ar', 'zh-CN', 'de', 'hi'];
  for (const slug of SUBPAGES) {
    for (const locale of sampleLocales) {
      const url = `${BASE_URL}/${locale}/${slug}/`;
      const res = await fetch(url);
      assert(res.status === 200, `Subpage /${locale}/${slug}/ returned 200`);

      const html = await res.text();
      const expectedCanonical = `https://ytplaylistcal.com/${locale}/${slug}/`;
      assert(html.includes(`rel="canonical" href="${expectedCanonical}"`), `/${locale}/${slug}/ canonical matches`);
      const hreflangs = html.match(/rel="alternate"\s+hreflang="([^"]+)"/g) || [];
      assert(hreflangs.length === 23, `/${locale}/${slug}/ has 23 hreflang alternates`);
    }
  }

  // 3. Test 301 Backward Compatibility Redirects
  console.log('\n--- 3. Testing 301 Backward Compatibility Redirects ---');
  const redirectTests = [
    { from: '/', to: '/en/' },
    { from: '/?url=https%3A%2F%2Fyoutube.com%2Fplaylist%3Flist%3Dxyz', to: '/en/?url=https%3A%2F%2Fyoutube.com%2Fplaylist%3Flist%3Dxyz' },
    { from: '/tools', to: '/en/tools/' },
    { from: '/tools/', to: '/en/tools/' },
    { from: '/about', to: '/en/about/' },
    { from: '/youtube-playlist-duration-calculator', to: '/en/youtube-playlist-duration-calculator/' },
    { from: '/youtube-watch-time-at-2x?mode=test', to: '/en/youtube-watch-time-at-2x/?mode=test' },
  ];

  for (const test of redirectTests) {
    const res = await fetch(`${BASE_URL}${test.from}`, { redirect: 'manual' });
    assert(res.status === 301, `Legacy path ${test.from} returned 301 (got ${res.status})`);
    const location = res.headers.get('location');
    assert(location === test.to, `Legacy path ${test.from} redirected to ${test.to} (got ${location})`);
  }

  // 4. Test API Route Integrity
  console.log('\n--- 4. Testing API Route Integrity (/api/playlist) ---');
  const apiRes = await fetch(`${BASE_URL}/api/playlist`);
  assert(apiRes.status === 400, `/api/playlist with no params returned status 400 (got ${apiRes.status})`);
  const apiJson = await apiRes.json();
  assert(apiJson.error && apiJson.error.code === 'MISSING_URL', `/api/playlist returned proper error code: ${apiJson.error?.code}`);

  // Summary
  console.log('\n======================================================');
  console.log(`TOTAL CHECKS: ${totalTests}`);
  console.log(`PASSED: ${passedTests}`);
  console.log(`FAILED: ${failedTests}`);
  console.log('======================================================');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL i18n & SEO TESTS PASSED WITH 100% SUCCESS!');
  }
}

run().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});

