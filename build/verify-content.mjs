/**
 * Validates src/content.json against the field list each component actually
 * renders.
 *
 * The reason this exists: content.json is edited by hand (and through the
 * `#/admin` CMS), while the components read specific fields. Nothing in the
 * build caught a mismatch, because `content.ts` does
 * `raw as unknown as SiteContent`, which throws away all type checking. The
 * result was live, shipped bugs that looked fine in the editor:
 *
 *   - `stats` shipped `value: "500+"` while the counter animates a number
 *   - `testimonials` shipped `text` while the card renders `quote`
 *   - `steps` shipped `icon` while the card renders `num` and `urdu`
 *
 * Run: npm run verify:content
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const content = JSON.parse(
  readFileSync(fileURLToPath(new URL('../src/content.json', import.meta.url)), 'utf8'),
);

const problems = [];

/** A field must exist and be non-empty. */
const require_ = (obj, fields, where) => {
  for (const f of fields) {
    const v = obj?.[f];
    if (v === undefined || v === null || v === '') {
      problems.push(`${where}.${f} is ${v === '' ? 'empty' : 'missing'}`);
    }
  }
};

/** A field must exist and be a non-empty array. */
const requireList = (obj, field, where) => {
  if (!Array.isArray(obj?.[field]) || obj[field].length === 0) {
    problems.push(`${where}.${field} is not a non-empty array`);
  }
};

/** Duplicate values become duplicate React keys at render time. */
const requireUnique = (arr, field, where) => {
  const seen = new Set();
  for (const item of arr ?? []) {
    const k = item?.[field];
    if (seen.has(k)) problems.push(`${where}.${field} duplicates "${k}" (collides as a React key)`);
    seen.add(k);
  }
};

require_(content.features, ['eyebrow', 'titleA', 'titleB', 'lead'], 'features');
content.features.items.forEach((x, i) => require_(x, ['icon', 'title', 'desc'], `features.items[${i}]`));

content.industries.forEach((x, i) => {
  require_(x, ['id', 'name', 'urdu', 'icon', 'desc'], `industries[${i}]`);
  requireList(x, 'points', `industries[${i}]`);
});

content.steps.items.forEach((x, i) =>
  require_(x, ['num', 'title', 'desc', 'urdu'], `steps.items[${i}]`),
);

content.pricing.packages.forEach((x, i) => {
  require_(x, ['id', 'name', 'urdu', 'sub'], `pricing.packages[${i}]`);
  requireList(x, 'features', `pricing.packages[${i}]`);
});

content.download.requirements.forEach((x, i) =>
  require_(x, ['label', 'value'], `download.requirements[${i}]`),
);
content.download.faq.forEach((x, i) => require_(x, ['q', 'a'], `download.faq[${i}]`));
require_(
  content.download,
  ['eyebrow', 'titleA', 'titleB', 'lead', 'buttonLabel', 'facts', 'requirementsTitle', 'faqTitle'],
  'download',
);

content.changelog.forEach((x, i) => {
  require_(x, ['version', 'date', 'title'], `changelog[${i}]`);
  requireList(x, 'notes', `changelog[${i}]`);
});

content.stats.forEach((x, i) => {
  require_(x, ['suffix', 'label'], `stats[${i}]`);
  if (typeof x.value !== 'number' || !Number.isFinite(x.value)) {
    problems.push(`stats[${i}].value must be a finite number, got ${JSON.stringify(x.value)}`);
  }
});

content.testimonials.forEach((x, i) =>
  require_(x, ['quote', 'name', 'role'], `testimonials[${i}]`),
);

require_(
  content.hero,
  ['eyebrow', 'titleA', 'titleB', 'lead', 'ctaDownload', 'ctaHow', 'versionNote'],
  'hero',
);
requireList(content.hero, 'trust', 'hero');
require_(content.footer, ['taglineUrdu', 'tagline', 'siteTitle', 'supportTitle', 'rights'], 'footer');
require_(content.site, ['downloadUrl', 'releasesPage'], 'site');
require_(content.site.contact, ['supportHours'], 'site.contact');
content.nav.links.forEach((x, i) => require_(x, ['href', 'label'], `nav.links[${i}]`));

requireUnique(content.features.items, 'title', 'features.items');
requireUnique(content.steps.items, 'num', 'steps.items');
requireUnique(content.stats, 'label', 'stats');
requireUnique(content.industries, 'id', 'industries');
requireUnique(content.pricing.packages, 'id', 'pricing.packages');
requireUnique(content.changelog, 'version', 'changelog');
requireUnique(content.nav.links, 'href', 'nav.links');

// The download URL must survive future releases. A version pinned into it means
// the site keeps serving the previous installer until somebody remembers to
// edit this file, which has already happened once.
if (!content.site.downloadUrl.includes('/releases/latest/download/')) {
  problems.push('site.downloadUrl must point at /releases/latest/download/, not a pinned version');
}
if (content.site.downloadUrl.includes('/releases/download/v')) {
  problems.push('site.downloadUrl is pinned to one version and will go stale after the next release');
}

if (problems.length) {
  console.error(`CONTENT SHAPE: ${problems.length} problem(s)\n`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

const counts = {
  features: content.features.items.length,
  industries: content.industries.length,
  steps: content.steps.items.length,
  packages: content.pricing.packages.length,
  faq: content.download.faq.length,
  requirements: content.download.requirements.length,
  stats: content.stats.length,
  testimonials: content.testimonials.length,
  changelog: content.changelog.length,
};
console.log(`CONTENT SHAPE OK  ${Object.entries(counts).map(([k, v]) => `${k}=${v}`).join('  ')}`);