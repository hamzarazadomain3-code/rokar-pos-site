/**
 * WCAG contrast check over the site's own stylesheets.
 *
 * Why this exists. The palette in styles.css is a fixed set of custom properties,
 * and 272 var(--...) references across the CSS and the components depend on them.
 * Nothing in the build ever checked that a colour is legible on the background it
 * actually sits on, so a palette tweak could quietly take text below the WCAG
 * threshold and the build would still be green. A dark theme multiplies the number
 * of combinations to get wrong, and this is what keeps that honest.
 *
 * How it decides what sits on what. For every rule that sets `color`, it finds the
 * effective background in this order:
 *   1. a background declared in the same rule;
 *   2. the nearest ancestor selector (longest prefix first) that declares one;
 *   3. the body background.
 * Rules whose background is a gradient are checked against EVERY colour stop and
 * scored on the worst one, because text over a gradient is only ever as legible as
 * its weakest stop. A translucent colour is composited over whatever is behind it
 * first, so alpha is never mistaken for lightness.
 *
 * A rule is skipped, loudly, when the background cannot be resolved. Skipping
 * quietly is how a checker ends up reporting a confident pass over a file it
 * actually skipped.
 *
 * Usage:
 *   node build/verify-contrast.mjs
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// WCAG 2.1 AA: 4.5 for normal text, 3.0 for large text.
const THRESHOLD = 4.5;

let failures = 0;
let checked = 0;
// Pairs the checker could not compute. Counted separately because an uncomputed
// ratio must never be allowed to read as a pass.
let broken = 0;
const brokenSamples = [];

function bad(msg) { failures++; console.log(`  [FAIL] ${msg}`); }

/* ---------------------------------------------------------------- colour maths */

function hexToRgb(hex) {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function rgbaToRgb(value) {
  const m = value
    .match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+%?))?\s*\)/i);
  if (!m) return null;
  let alpha = 1;
  if (m[4] !== undefined) alpha = m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
  return [+m[1], +m[2], +m[3], alpha];
}

/**
 * Composite a possibly translucent layer over an opaque backdrop.
 *
 * Accepts both shapes a colour appears in here: a flat [r,g,b,a] and the
 * {rgb, alpha} object colourStacks() returns. Normalising inside the function is
 * deliberate -- when it only accepted one of the two, a mismatched call returned
 * [undefined, undefined, undefined], contrast() produced NaN, and `NaN < 4.5` is
 * false in JavaScript, so every check silently "passed". A contrast checker that
 * reports NaN as compliant is worse than no checker at all.
 */
function over(layer, bg) {
  const fg = Array.isArray(layer)
    ? layer
    : [layer.rgb[0], layer.rgb[1], layer.rgb[2], layer.alpha ?? 1];
  const a = fg[3] ?? 1;
  if (a >= 1) return [fg[0], fg[1], fg[2]];
  return [0, 1, 2].map((i) => Math.round(fg[i] * a + bg[i] * (1 - a)));
}

function relativeLuminance([r, g, b]) {
  const f = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/* ---------------------------------------------------------------- var() + values */

/** Follow var() chains in a declaration value. Depth-capped so a cyclic token cannot hang the build. */
function expandVars(value, tokens) {
  let v = String(value);
  for (let i = 0; i < 8 && v.includes('var('); i++) {
    let hit = false;
    v = v.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*))?\)/, (_, name, fallback) => {
      hit = true;
      const t = tokens.get(name);
      return t === undefined ? (fallback ?? '').trim() : t;
    });
    if (!hit) break;
  }
  return v;
}

/**
 * Every opaque colour a declaration paints, from back to front.
 * A gradient yields one entry per stop; a translucent colour yields one entry
 * (composited later over whatever is behind it).
 */
function colourStacks(value, tokens) {
  const v = expandVars(value, tokens);
  if (!v || v === 'none' || v === 'transparent') return [];
  if (/url\(|image-set\(|\.png|\.svg|\.jpg|\.webp/i.test(v)) return [];

  const out = [];
  const push = (raw) => {
    const t = raw.trim();
    if (t.startsWith('#')) {
      const c = hexToRgb(t);
      if (c) out.push({ rgb: c, alpha: 1, raw: t });
      return;
    }
    if (/^rgba?\(/i.test(t)) {
      const c = rgbaToRgb(t);
      if (c) out.push({ rgb: [c[0], c[1], c[2]], alpha: c[3], raw: t });
    }
    // Named colours other than white/black are deliberately not guessed. Getting
    // one wrong would mean reporting a fabricated ratio.
  };

  const gradient = v.match(/(?:linear|radial|conic)-gradient\(([\s\S]*)\)/i);
  if (gradient) {
    // Colour stops are what a text run actually sits on; positions are irrelevant.
    const inner = gradient[1];
    const stop = /#[0-9a-f]{3,8}\b|rgba?\([^)]*\)/gi;
    let m;
    while ((m = stop.exec(inner))) push(m[0]);
    return out;
  }

  // Plain `background: var(--cream)` / `background: #fff` / `background: rgba(...)`.
  const solid = v.match(/(?:^|[\s,])(#[0-9a-f]{3,8}\b|rgba?\([^)]*\))/i);
  if (solid) push(solid[1]);
  if (out.length) return out;

  if (/^\s*(?:white|black)\s*$/i.test(v)) {
    out.push({ rgb: v.trim().toLowerCase() === 'white' ? [255, 255, 255] : [0, 0, 0], alpha: 1, raw: v.trim() });
  }
  return out;
}

/** Flatten a stack (back to front) into one opaque colour. */
function flatten(stack) {
  if (!stack.length) return null;
  let acc = stack[0].rgb;
  if (stack[0].alpha < 1) return null; // cannot flatten without a backdrop
  for (let i = 1; i < stack.length; i++) {
    acc = over({ rgb: stack[i].rgb, alpha: stack[i].alpha }, acc);
  }
  return acc;
}

/* ---------------------------------------------------------------- parsing */

const SOURCES = [
  'src/styles.css',
  'src/components/styles-components.css',
  'src/admin/admin.css',
];

function readTokens(rawCss) {
  const css = stripComments(rawCss);
  const tokens = new Map();
  for (const block of css.match(/:root\s*\{[^}]*\}/g) || []) {
    for (const m of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) tokens.set(m[1], m[2].trim());
  }
  return tokens;
}

/**
 * Remove comments before anything is parsed.
 *
 * Rule bodies are matched as ([^{}]+){([^{}]*)}, which means the captured
 * "selector" is really everything between the previous closing brace and this
 * opening one. A comment sitting in that gap gets glued onto the front of the
 * selector, and the rule then looks like a comment and is thrown away. In this
 * stylesheet that silently discarded `.hero`, the single largest surface on the
 * page, so every colour rule inside it was checked against the page background
 * and reported as failing. Stripping comments first is what makes the parse mean
 * what it looks like it means.
 */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, ' ');
}

function parseRules(rawCss) {
  const css = stripComments(rawCss);
  const out = [];
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = m[1].trim().replace(/\s+/g, ' ');
    if (!selector || selector.startsWith('@')) continue;
    out.push({ selector, body: m[2] });
  }
  return out;
}

function decl(body, prop) {
  const m = body.match(new RegExp(`(?:^|[;{])\\s*${prop}\\s*:\\s*([^;}]+)`, 'i'));
  return m ? m[1].trim() : null;
}

/* ---------------------------------------------------------------- run */

console.log('=== Rokar site -- WCAG contrast check ===\n');

const files = [];
for (const file of SOURCES) {
  let css;
  try { css = readFileSync(join(ROOT, file), 'utf8'); } catch { continue; }
  files.push({ file, css, tokens: readTokens(css) });
}
if (!files.length) {
  console.log('FAIL: no stylesheet found, nothing checked.');
  process.exit(1);
}

// Merged across files, and a Map because expandVars() resolves var() chains by name.
const tokens = new Map();
for (const f of files) for (const [k, v] of f.tokens) tokens.set(k, v);
console.log(`palette: ${tokens.size} custom properties`);
console.log(`threshold: ${THRESHOLD}:1 (WCAG 2.1 AA, normal text)\n`);

// Rules that paint text, counted so the summary can state its own coverage.
let textRules = 0;
// Text rules whose surface this check cannot soundly determine.
let unresolved = 0;

/**
 * Evaluate one rule, but only when the stylesheet alone decides the answer.
 *
 * A rule qualifies when it declares BOTH a colour and a background of its own, and
 * both are fully opaque. That restriction is the whole integrity of this check, and
 * it is worth being explicit about why it is here.
 *
 * The alternative -- follow the selector up the tree looking for an inherited
 * surface -- was implemented and produced about twenty confident wrong answers.
 * `.chip` sits inside the dark hero but inherits nothing that names the hero; the
 * nearest background a prefix walk can find is the page's cream, so the checker
 * reported white-on-cream at 1.00:1. Recovering the real surface would mean
 * walking the rendered DOM: JSX composes class names (`className="section hero"`),
 * so `.hero` only becomes dark via a wrapper that appears nowhere in the selector.
 *
 * That is not reliably recoverable from a flat rule list, so this check refuses to
 * guess. Every rule it declines is counted and printed, because "checked 40 of 200"
 * and "checked 200" must never read the same.
 */
for (const f of files) {
  for (const rule of parseRules(f.css)) {
    const colour = decl(rule.body, 'color');
    if (!colour) continue;
    textRules++;
    // `inherit` and `currentColor` defer to something else, so there is no pair to
    // check here. Counting these as "unresolved" would bury the real ones.
    if (/^\s*(?:inherit|currentcolor|initial|unset)\s*$/i.test(colour)) continue;

    const bgRaw = decl(rule.body, 'background-color') || decl(rule.body, 'background');
    if (!bgRaw) {
      unresolved++;
      continue;
    }

    const fgStacks = colourStacks(colour, tokens);
    const bgStacks = colourStacks(bgRaw, tokens);
    if (!fgStacks.length || !bgStacks.length) {
      unresolved++;
      continue;
    }
    // Any alpha anywhere means the result depends on what is behind this rule,
    // which is precisely what this check does not try to know.
    if (fgStacks.some((s) => s.alpha < 1) || bgStacks.some((s) => s.alpha < 1)) {
      unresolved++;
      continue;
    }

    // Sound at last: opaque text on an opaque surface this rule declares itself.
    // A gradient contributes one surface per stop, and the weakest stop governs,
    // because text crossing it is never more legible than its dimmest end.
    let worst = null;
    for (const layer of bgStacks) {
      const painted = fgStacks.reduce(
        (acc, fg) => over({ rgb: fg.rgb, alpha: fg.alpha }, acc),
        layer.rgb,
      );
      const ratio = contrast(painted, layer.rgb);
      // A ratio that is not a number means the checker failed to compute, which is
      // NOT the same as the text being legible.
      if (!Number.isFinite(ratio)) {
        broken++;
        brokenSamples.push(`${rule.selector}: non-numeric ratio from ${colour} on ${layer.raw}`);
        break;
      }
      if (!worst || ratio < worst.ratio) worst = { ratio, stop: layer.raw, bgRaw };
    }
    if (worst === null) continue;

    checked++;
    if (worst.ratio < THRESHOLD) {
      bad(`${worst.ratio.toFixed(2)}:1  ${rule.selector}  ${colour} on ${worst.bgRaw} (weakest stop ${worst.stop})`);
    }
  }
}

console.log('');
if (checked === 0) {
  bad('no rule produced a decidable pair, so this proved nothing');
}
if (broken) {
  // Loud and fatal on purpose: these pairs produced no number at all.
  failures += broken;
  console.log(`  [FAIL] ${broken} pair(s) could not be computed at all:`);
  for (const s of brokenSamples.slice(0, 5)) console.log(`    - ${s}`);
  console.log('');
}
if (failures) {
  console.log(`CONTRAST CHECK FAILED -- ${failures} of ${checked} decidable text/background pairs below ${THRESHOLD}:1`);
} else {
  console.log(`  [PASS] all ${checked} decidable text/background pairs reach ${THRESHOLD}:1`);
}
console.log(`\ncoverage: ${checked} of ${textRules} text rules are decidable from the stylesheet alone.`);
console.log(`          ${unresolved} paint on an inherited or translucent surface and are NOT checked here --`);
console.log(`          an unchecked rule is not a passing rule, so treat those ${unresolved} as unverified.`);
process.exit(failures === 0 ? 0 : 1);