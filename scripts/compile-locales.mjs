import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const enJsonPath = path.join(rootDir, 'src', 'i18n', 'locales', 'en.json');
const en = JSON.parse(fs.readFileSync(enJsonPath, 'utf8'));

// Deep clone helper
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Deep merge: target defaults to source values if missing in patch
function deepMerge(base, patch) {
  const result = deepClone(base);
  if (!patch || typeof patch !== 'object') return result;

  for (const key of Object.keys(patch)) {
    const patchVal = patch[key];
    const baseVal = result[key];

    if (
      patchVal !== null &&
      typeof patchVal === 'object' &&
      !Array.isArray(patchVal) &&
      baseVal !== null &&
      typeof baseVal === 'object' &&
      !Array.isArray(baseVal)
    ) {
      result[key] = deepMerge(baseVal, patchVal);
    } else if (patchVal !== undefined) {
      result[key] = patchVal;
    }
  }
  return result;
}

const localesMap = [
  { code: 'ar', file: 'ar.mjs', exportName: 'ar' },
  { code: 'de', file: 'de.mjs', exportName: 'de' },
  { code: 'es', file: 'es.mjs', exportName: 'es' },
  { code: 'fil', file: 'fil.mjs', exportName: 'fil' },
  { code: 'fr', file: 'fr.mjs', exportName: 'fr' },
  { code: 'he', file: 'he.mjs', exportName: 'he' },
  { code: 'hi', file: 'hi.mjs', exportName: 'hi' },
  { code: 'id', file: 'id.mjs', exportName: 'id' },
  { code: 'it', file: 'it.mjs', exportName: 'it' },
  { code: 'ja', file: 'ja.mjs', exportName: 'ja' },
  { code: 'ko', file: 'ko.mjs', exportName: 'ko' },
  { code: 'nl', file: 'nl.mjs', exportName: 'nl' },
  { code: 'pl', file: 'pl.mjs', exportName: 'pl' },
  { code: 'pt-BR', file: 'pt-BR.mjs', exportName: 'ptBR' },
  { code: 'ru', file: 'ru.mjs', exportName: 'ru' },
  { code: 'sv', file: 'sv.mjs', exportName: 'sv' },
  { code: 'th', file: 'th.mjs', exportName: 'th' },
  { code: 'tr', file: 'tr.mjs', exportName: 'tr' },
  { code: 'vi', file: 'vi.mjs', exportName: 'vi' },
  { code: 'zh-CN', file: 'zh-CN.mjs', exportName: 'zhCN' },
  { code: 'zh-TW', file: 'zh-TW.mjs', exportName: 'zhTW' },
];

async function main() {
  const localesDir = path.join(rootDir, 'src', 'i18n', 'locales');
  if (!fs.existsSync(localesDir)) {
    fs.mkdirSync(localesDir, { recursive: true });
  }

  // Ensure en.json is formatted nicely
  fs.writeFileSync(enJsonPath, JSON.stringify(en, null, 2) + '\n', 'utf8');
  console.log('✓ Verified en.json');

  let compiled = 1;

  for (const item of localesMap) {
    const modPath = path.join(__dirname, 'locales', item.file);
    if (!fs.existsSync(modPath)) {
      console.error(`Missing locale file: ${modPath}`);
      process.exit(1);
    }
    const mod = await import(`file://${modPath.replace(/\\/g, '/')}`);
    const data = mod[item.exportName] || mod.default;
    if (!data) {
      console.error(`Export ${item.exportName} not found in ${item.file}`);
      process.exit(1);
    }

    // Align seo and meta keys so both work identically
    if (data.seo && !data.meta) {
      data.meta = data.seo;
    }
    if (data.meta && !data.seo) {
      data.seo = data.meta;
    }

    const merged = deepMerge(en, data);
    merged.meta = data.meta || data.seo || en.meta;
    merged.seo = merged.meta;

    const outPath = path.join(localesDir, `${item.code}.json`);
    fs.writeFileSync(outPath, JSON.stringify(merged, null, 2) + '\n', 'utf8');
    compiled++;
    console.log(`✓ Compiled ${item.code}.json (${item.file})`);
  }

  console.log(`\nSuccessfully compiled all ${compiled} locale files into src/i18n/locales/!`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
