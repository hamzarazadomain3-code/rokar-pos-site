/**
 * Renders the real <App /> to HTML with react-dom/server, through Vite's SSR
 * pipeline so TSX/TS and CSS imports resolve exactly as they do in the browser.
 *
 * This exists because the marketing page is entirely client-rendered, so a
 * content shape mistake (a stat value arriving as a string, a testimonial
 * missing its `quote` field) does not fail the build -- it just renders an
 * empty card or a literal "NaN" on the live page. SSR is the cheapest place to
 * catch that.
 *
 * Run: npm run verify:ssr
 */
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const content = JSON.parse(
  readFileSync(fileURLToPath(new URL('../src/content.json', import.meta.url)), 'utf8'),
);

const failures = [];
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  -- ${detail}` : ''}`);
  if (!ok) failures.push(name);
};

const server = await createServer({
  configFile: fileURLToPath(new URL('../vite.config.ts', import.meta.url)),
  server: { middlewareMode: true },
  appType: 'custom',
});

try {
  const { default: App } = await server.ssrLoadModule('/src/App.tsx');
  const html = renderToString(createElement(App));

  check('renders without throwing', html.length > 2000, `${html.length} chars of HTML`);

  // --- The bugs this suite was written for -------------------------------
  check('no "NaN" leaked into the page', !html.includes('>NaN<') && !html.includes('NaN%'));

  // --- Headings ----------------------------------------------------------
  const h1s = html.match(/<h1[\s>]/g) || [];
  check('exactly one <h1>', h1s.length === 1, `found ${h1s.length}`);

  // --- Honesty: nothing invented may survive ----------------------------
  const fake = [
    ['4.9 / 5', 'invented rating'],
    ['500+ Dukanon', 'invented shop count'],
    ['Asif Bhai', 'invented testimonial'],
    ['Rs 25,000', 'invented savings claim'],
    ['1234567', 'placeholder phone number'],
    ['support@rokarpos.pk', 'placeholder email'],
  ];
  for (const [needle, why] of fake) {
    check(`removed: ${why} ("${needle}")`, !html.includes(needle));
  }

  // --- Version numbers ---------------------------------------------------
  // The current build number must not be advertised, but the changelog is a
  // release history and stays meaningful only if it names what it shipped.
  // So: strip the whole changelog section, then assert the number is gone.
  const chStart = html.indexOf('<section id="updates"');
  const chEnd = chStart === -1 ? -1 : html.indexOf('</section>', chStart);
  check('changelog section located', chStart !== -1 && chEnd !== -1);
  const outsideChangelog =
    chStart === -1 ? html : html.slice(0, chStart) + html.slice(chEnd);
  check(
    'no version number outside the changelog',
    !outsideChangelog.includes(content.site.latestVersion),
    `latestVersion = ${content.site.latestVersion}`,
  );
  // React separates adjacent text nodes with `<!-- -->` in SSR output, so
  // `<b>v{version}</b>` arrives as `v<!-- -->2.10.0`. Strip those before matching.
  const plain = html.replace(/<!-- -->/g, '');
  const missingVersions = content.changelog
    .map((c) => c.version)
    .filter((v) => !plain.includes(`v${v}`));
  check(
    'changelog still names each release',
    missingVersions.length === 0,
    missingVersions.length ? `missing: ${missingVersions.join(', ')}` : `${content.changelog.length} releases`,
  );

  // --- Content that must be on the page ---------------------------------
  const mustHave = [
    ['hero headline', content.hero.titleA],
    ['features section', content.features.items[0].title],
    ['stats label', content.stats[0].label],
    ['stat sub-line', content.stats[0].sub],
    ['faq question', content.download.faq[0].q],
    ['faq question (newest)', content.download.faq.at(-1).q],
    ['pricing plan', content.pricing.packages[0].name],
    ['changelog entry', content.changelog[0].title],
    ['download requirements', content.download.requirements[0].label],
  ];
  for (const [what, needle] of mustHave) {
    check(`present: ${what}`, html.includes(needle));
  }

  // --- The empty-testimonials fix ---------------------------------------
  // With no real quotes the carousel must vanish, not leave an empty shell.
  check(
    'empty testimonials section is not rendered',
    !html.includes('tst-quote') && !html.includes('Shopkeepers ki raay'),
  );

  // --- Download link must be version-proof ------------------------------
  const dl = html.match(/href="(https:\/\/github\.com[^"]*RokarPOS[^"]*)"/g) || [];
  check('download link uses releases/latest', dl.length > 0 && dl.every((h) => h.includes('releases/latest')));
  check('no version-pinned download link', !html.includes('releases/download/v'));

  // --- Contact rows are hidden while unconfigured -----------------------
  check('no empty wa.me link', !/href="https:\/\/wa\.me\/"/.test(html));
  check('no tel: link while phone unconfigured', !html.includes('href="tel:'));
  check('no mailto: link while email unconfigured', !html.includes('href="mailto:'));
  check('main has id="main"', html.includes('id="main"'));

  // --- 3D hero fallback -------------------------------------------------
  // useCanRender3D() is false during SSR (and on every device that cannot afford
  // three.js), so the CSS-only receipt poster is what actually renders here.
  check('hero falls back to the CSS poster', html.includes('hero-poster-slip'));
  check('poster carries an accessible label', html.includes('Rokar POS ka billing screen'));
  check('poster is not empty', html.includes('hero-poster-total'));

  // --- The "how it works" steps used to render blank ---------------------
  // content.json shipped steps as {icon,title,desc} while HowItWorks renders
  // {num,urdu,title,desc}, so the numbers, the Urdu lines and the React keys
  // were all undefined. Assert the real fields reached the page.
  check(
    'every step shows its number',
    content.steps.items.every((s) => html.includes(s.num)),
  );
  check(
    'every step shows its Urdu line',
    content.steps.items.every((s) => html.includes(s.urdu)),
  );

  // --- Real product screenshots -----------------------------------------
  // The tour used to draw Billing/Khata/Stock/Reports in HTML from hand-written
  // mock rows, which is not evidence of anything. It now shows actual captures of
  // the app. Three things must stay true, or the section becomes either broken
  // or dishonest:
  //   1. every referenced file exists and is within the size budget,
  //   2. the active tab renders a real <img> with dimensions and alt text,
  //   3. the "sample data" caption is present — these pictures are of a demo
  //      database, and nobody should be able to mistake one for a real shop.
  const shotsDir = fileURLToPath(new URL('../public/screens/', import.meta.url));
  const manifest = JSON.parse(readFileSync(path.join(shotsDir, 'manifest.json'), 'utf8'));
  const manifestFiles = new Set(manifest.shots.map((s) => s.file));

  const referenced = [...html.matchAll(/src="\/screens\/([^"]+)"/g)].map((m) => m[1]);
  check('tour references at least one screenshot', referenced.length > 0, `${referenced.length} found`);
  check(
    'every referenced screenshot exists',
    referenced.every((f) => existsSync(path.join(shotsDir, f))),
    referenced.filter((f) => !existsSync(path.join(shotsDir, f))).join(', ') || 'all present',
  );
  check(
    'no screenshot exceeds the 150 KB budget',
    manifest.shots.every((s) => s.kb <= 150),
    `largest is ${Math.max(...manifest.shots.map((s) => s.kb))} KB`,
  );
  // Only the ACTIVE tab's <img> is in the server-rendered HTML — the other five
  // load when the visitor clicks a tab. So coverage is checked against the
  // component source, and existence/size against the files on disk.
  const tourSrc = readFileSync(
    fileURLToPath(new URL('../src/components/ProductTour.tsx', import.meta.url)),
    'utf8',
  );
  const unused = [...manifestFiles].filter((f) => !tourSrc.includes(f));
  check(
    'every capture in the manifest is wired into the tour',
    unused.length === 0,
    unused.join(', ') || `${manifestFiles.size} shots wired`,
  );

  const tourImg = html.match(/<img[^>]*class="tour-shot-img"[^>]*>/);
  check('tour renders a screenshot <img>', !!tourImg);
  check('screenshot has intrinsic dimensions', !!tourImg && /width="\d+"/.test(tourImg[0]) && /height="\d+"/.test(tourImg[0]));
  check('screenshot is lazy-loaded', !!tourImg && /loading="lazy"/.test(tourImg[0]));
  check(
    'screenshot carries descriptive alt text',
    !!tourImg && /alt="[^"]{40,}"/.test(tourImg[0]),
    tourImg ? `alt is ${(tourImg[0].match(/alt="([^"]*)"/) || [, ''])[1].length} chars` : '',
  );

  check('tour labels the screenshots as sample data', html.includes('sample data'));
  check('tour offers a full-size view', html.includes('tour-shot-btn'));
  check('tour tabs are a real tablist', html.includes('role="tablist"') && html.includes('aria-selected'));

  // --- No version number anywhere on the site ----------------------------
  // The download button is deliberately version-less and always points at the
  // newest release, so a version printed on the page would go stale immediately
  // and imply a specific build. This has to be checked on the source, because
  // the worst offender was a version drawn into a <canvas> by Hero3D, which no
  // amount of HTML inspection would ever see.
  const srcFiles = [];
  (function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (/\.(tsx?|css)$/.test(entry.name)) srcFiles.push(p);
    }
  })(fileURLToPath(new URL('../src/', import.meta.url)));

  const versionLeaks = srcFiles
    .filter((f) => /v\d+\.\d+/.test(readFileSync(f, 'utf8')))
    .map((f) => path.relative(fileURLToPath(new URL('../', import.meta.url)), f));
  check('no version number in any source file', versionLeaks.length === 0, versionLeaks.join(', ') || 'clean');

  // --- index.html shell (not part of the React tree) --------------------
  const shell = readFileSync(fileURLToPath(new URL('../index.html', import.meta.url)), 'utf8');
  check('skip link in the HTML shell', shell.includes('class="skip-link"'));
  check('webmanifest linked', shell.includes('site.webmanifest'));
  check('apple-touch-icon linked', shell.includes('apple-touch-icon'));
  check('viewport-fit=cover set', shell.includes('viewport-fit=cover'));
  check('max-image-preview requested', shell.includes('max-image-preview:large'));
  check('jsonld placeholder present for the build plugin', shell.includes('<!--@seo:jsonld-->'));

  console.log(`\n${failures.length === 0 ? 'ALL CHECKS PASSED' : `${failures.length} CHECK(S) FAILED`}`);
  process.exit(failures.length === 0 ? 0 : 1);
} finally {
  await server.close();
}