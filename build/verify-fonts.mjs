/**
 * Checks that the self-hosted font subsets can actually render the site.
 *
 * The subsets in public/fonts are generated from the characters present at the
 * time build_fonts.py ran. That is fine until somebody adds a line of copy: add
 * a single Urdu shop name or a guillemet to content.json and the character is
 * simply gone from the woff2. The browser does not warn. It quietly falls
 * through to the next family in the stack, and on a heading that means a hole in
 * the middle of a word that nobody notices until a shopkeeper sends a screenshot.
 *
 * So: every character in every user-visible string must be renderable by one of
 * the shipped faces, or be a symbol the platform legitimately provides.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const failures = [];
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  --  ${detail}` : ''}`);
  if (!ok) failures.push(name);
};

// ---------------------------------------------------------------------------
// Load the manifest and work out what each face can render.
// ---------------------------------------------------------------------------

const manifestPath = path.join(ROOT, 'build', 'fonts.manifest.json');
let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
} catch {
  console.error(`FAIL  build/fonts.manifest.json is missing - run \`npm run fonts\``);
  process.exit(1);
}

function parseRange(spec) {
  // "U+0020-007E, U+00A0" -> Set of codepoints
  const set = new Set();
  for (const part of spec.split(',')) {
    const t = part.trim();
    const m = /^U\+([0-9A-Fa-f]{1,6})(?:-([0-9A-Fa-f]{1,6}))?$/.exec(t);
    if (!m) continue;
    const lo = parseInt(m[1], 16);
    const hi = m[2] ? parseInt(m[2], 16) : lo;
    for (let c = lo; c <= hi; c++) set.add(c);
  }
  return set;
}

const faces = Object.entries(manifest.families).map(([slug, f]) => ({
  slug,
  family: f.family,
  file: f.file,
  kb: f.kb,
  range: parseRange(f.unicodeRange),
  weightRange: f.weightRange,
}));

const covered = new Set();
for (const f of faces) for (const c of f.range) covered.add(c);

// Categories a shipped face is responsible for. Symbols and emoji are not:
// arrows, stars and receipt glyphs come from the platform's symbol font and
// always have, because no latin webfont subset carries them.
const MUST_COVER = /^[LNMP]/;

const nameOf = (cp) => {
  try {
    return String.fromCodePoint(cp)
      .normalize('NFC');
  } catch {
    return '?';
  }
};

// ---------------------------------------------------------------------------
// Collect every character the site can put in front of a visitor.
// ---------------------------------------------------------------------------

const SOURCE_FILES = [];
(function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (/\.(tsx?|json|css|html)$/.test(entry.name)) SOURCE_FILES.push(p);
  }
})(path.join(ROOT, 'src'));
SOURCE_FILES.push(path.join(ROOT, 'index.html'));

const perFile = [];
for (const file of SOURCE_FILES) {
  const text = readFileSync(file, 'utf8');
  const bad = new Map();
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (cp === 0x0a || cp === 0x09 || cp === 0x0d) continue; // whitespace
    // Symbols and emoji are skipped: arrows, stars and receipt glyphs come from
    // the platform's symbol font, and no latin webfont subset has ever carried
    // them. Only letters, digits, marks and punctuation must be covered.
    if (!MUST_COVER.test(categoryOf(cp))) continue;
    if (covered.has(cp)) continue;
    bad.set(cp, (bad.get(cp) || 0) + 1);
  }
  if (bad.size) perFile.push({ file: path.relative(ROOT, file), bad });
}

function categoryOf(cp) {
  // Enough of the Unicode general category table to classify the characters
  // that actually appear in this codebase. Anything unrecognised is treated as
  // needing coverage, so a new letter always fails the check.
  if (cp < 0x20 || cp === 0x7f) return 'Cc';
  if (cp === 0xa0) return 'Zs';
  if (cp >= 0x2000 && cp <= 0x206f) return 'P'; // general punctuation
  if (cp >= 0x2190 && cp <= 0x2bff) return 'S'; // arrows, symbols, dingbats
  if (cp >= 0x1f000) return 'S';               // emoji
  if (cp >= 0x0600 && cp <= 0x06ff) return 'Lo'; // Arabic letters
  if (cp >= 0xfb50 && cp <= 0xfdff) return 'Lo'; // Arabic presentation forms
  if (cp >= 0xfe70 && cp <= 0xfeff) return 'Lo'; // Arabic forms B
  if (cp >= 0x200c && cp <= 0x200f) return 'Cf'; // ZWNJ / ZWJ / bidi marks
  if (cp >= 0x2010 && cp <= 0x2027) return 'P';
  if (cp >= 0x2030 && cp <= 0x205e) return 'P';
  if (cp >= 0x20a0 && cp <= 0x20cf) return 'Sc';
  if (cp >= 0x2100 && cp <= 0x214f) return 'So';
  if ((cp >= 0x41 && cp <= 0x5a) || (cp >= 0x61 && cp <= 0x7a)) return 'Ll';
  if (cp >= 0xc0 && cp <= 0x24f) return 'Ll';
  if (cp >= 0x370 && cp <= 0x3ff) return 'Lu';
  if (cp >= 0x400 && cp <= 0x4ff) return 'Lu';
  if (cp >= 0x590 && cp <= 0x5ff) return 'Lo';
  if (cp >= 0x900 && cp <= 0x97f) return 'Lo';
  if (cp >= 0x3040 && cp <= 0x30ff) return 'Lo';
  if (cp >= 0xac00 && cp <= 0xd7af) return 'Lo';
  if (cp >= 0xff21 && cp <= 0xff3a) return 'Lu';
  if (cp >= 0xff41 && cp <= 0xff5a) return 'Ll';
  return 'Lo';
}

check(
  'every character on the site is renderable by a shipped face',
  perFile.length === 0,
  perFile.length
    ? perFile
        .slice(0, 6)
        .map(
          (f) =>
            `${f.file}: ` +
            [...f.bad]
              .slice(0, 5)
              .map(([cp]) => `U+${cp.toString(16).toUpperCase().padStart(4, '0')} ${nameOf(cp)}`)
              .join(', '),
        )
        .join(' | ')
    : `${SOURCE_FILES.length} source files scanned`,
);

// ---------------------------------------------------------------------------
// The generated CSS and the shipped files have to agree.
// ---------------------------------------------------------------------------

const css = readFileSync(path.join(ROOT, 'src', 'fonts.css'), 'utf8');

for (const f of faces) {
  const file = path.join(ROOT, 'public', 'fonts', f.file);
  let size = 0;
  try {
    size = statSync(file).size;
  } catch {
    check(`${f.family} woff2 is present`, false, `missing public/fonts/${f.file}`);
    continue;
  }
  check(
    `${f.family} woff2 is present and within budget`,
    size <= 160 * 1024,
    `${f.file} = ${(size / 1024).toFixed(1)} KB (ceiling 160 KB)`,
  );
  check(`${f.family} is referenced by fonts.css`, css.includes(`url('/fonts/${f.file}')`));
  check(
    `${f.family} declares the weight range it was instanced for`,
    css.includes(`font-weight: ${f.weightRange[0]} ${f.weightRange[1]};`),
    `expected ${f.weightRange[0]} ${f.weightRange[1]}`,
  );
}

const declared = [...css.matchAll(/url\('\/fonts\/([^']+)'\)/g)].map((m) => m[1]);
const onDisk = readdirSync(path.join(ROOT, 'public', 'fonts')).filter((n) => n.endsWith('.woff2'));
check(
  'no orphaned font files left in public/fonts',
  declared.every((d) => onDisk.includes(d)) && onDisk.every((o) => declared.includes(o)),
  `declared ${declared.length}, on disk ${onDisk.length}`,
);

// ---------------------------------------------------------------------------
// The self-hosting itself has to have stuck.
// ---------------------------------------------------------------------------

const html = readFileSync(path.join(ROOT, 'index.html'), 'utf8');
// Comments are stripped before the Google checks: the file explains in a comment
// why the Google link was removed, and a URL inside a comment is not a request.
const htmlRequests = html.replace(/<!--[\s\S]*?-->/g, '');
check('no Google Fonts stylesheet left', !/fonts\.googleapis\.com/.test(htmlRequests));
check('no preconnect to Google left', !/fonts\.gstatic\.com/.test(htmlRequests));

// The preload block is generated from the same manifest as fonts.css. Check it
// anyway: a hand-edited preload is a 404 on the critical path, and the symptom
// is only a slightly slower first paint, which nobody reports.
const preloaded = [...html.matchAll(/rel="preload"[^>]*href="\/fonts\/([^"]+)"/g)].map((m) => m[1]);
check('the preload block is present', preloaded.length >= 2, `${preloaded.length} preload(s)`);
check(
  'every preloaded font exists on disk',
  preloaded.length > 0 && preloaded.every((f) => onDisk.includes(f)),
  preloaded.filter((f) => !onDisk.includes(f)).join(', ') || 'all present',
);
check(
  'preloaded fonts are declared in fonts.css',
  preloaded.every((f) => css.includes(`/fonts/${f}`)),
  preloaded.filter((f) => !css.includes(`/fonts/${f}`)).join(', ') || 'all declared',
);
check(
  'the two above-the-fold faces are preloaded',
  preloaded.some((f) => f.startsWith('plus-jakarta-sans')) && preloaded.some((f) => f.startsWith('fraunces')),
);
check(
  'the 147 KB Nastaliq face is not preloaded',
  !preloaded.some((f) => f.startsWith('noto-nastaliq-urdu')),
  'it only appears below the fold, so preloading it delays first paint',
);
const preloadTags = html.match(/<link[^>]*rel="preload"[^>]*\/fonts\/[^>]*>/g) || [];
check(
  'preloads are crossorigin',
  preloadTags.length > 0 && preloadTags.every((tag) => tag.includes('crossorigin')),
  'fonts are fetched in CORS mode even same-origin, so without it the preload is thrown away',
);

// Total shipped weight, because a subset that is individually small but
// collectively heavy is how 1234 KB happened in the first place.
const totalKb =
  onDisk.reduce((n, name) => n + statSync(path.join(ROOT, 'public', 'fonts', name)).size, 0) / 1024;
check(
  'total font payload under the 220 KB budget',
  totalKb <= 220,
  `${totalKb.toFixed(1)} KB across ${onDisk.length} file(s)`,
);

console.log('');
if (failures.length) {
  console.error(`${failures.length} FAILED:`);
  failures.forEach((f) => console.error(`  - ${f}`));
  if (perFile.length) {
    console.error('');
    console.error('  A missing glyph is invisible until a shopkeeper spots it.');
    console.error('  Add the characters to LATIN_EXTRA/PUNCT/URDU in build/build_fonts.py,');
    console.error('  then run `npm run fonts`.');
  }
  process.exit(1);
}
console.log('ALL FONT CHECKS PASSED');