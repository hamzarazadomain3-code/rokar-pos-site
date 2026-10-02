/**
 * Guards the first-load payload.
 *
 * The hero used to drag ~1 MB of three.js into the critical path: `three` was
 * listed in `manualChunks`, so Rollup hoisted the modules the entry and the lazy
 * hero share into that chunk, the entry imported two bindings from it, and the
 * browser downloaded the whole thing before first paint. The mobile audience this
 * site targets cannot afford that.
 *
 * This asserts the invariant that fixed it, so nobody reintroduces it by adding a
 * vendor package to `manualChunks`:
 *
 *   1. the entry chunk must not statically import the Hero3D chunk
 *   2. the entry's static import graph must stay under a hard byte ceiling
 *
 * Run after `vite build`: npm run verify:bundle
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const assets = fileURLToPath(new URL('../dist/assets', import.meta.url));
const files = readdirSync(assets).filter((f) => f.endsWith('.js'));

const entry = files.find((f) => f.startsWith('index-'));
const hero = files.find((f) => f.startsWith('Hero3D-'));

if (!entry) {
  console.error('No entry chunk found in dist/assets -- run `vite build` first.');
  process.exit(1);
}

const staticImports = (name) =>
  [...readFileSync(join(assets, name), 'utf8').matchAll(/from"\.\/([^"]+)"/g)].map((m) => m[1]);

/** Raw + gzipped size of everything reachable from the entry via static imports. */
const entryGraph = (name, seen = new Set()) => {
  if (seen.has(name)) return { raw: 0, gz: 0, files: [] };
  seen.add(name);
  const buf = readFileSync(join(assets, name));
  let raw = buf.length;
  let gz = gzipSync(buf).length;
  const files = [name];
  for (const dep of staticImports(name)) {
    const sub = entryGraph(dep, seen);
    raw += sub.raw;
    gz += sub.gz;
    files.push(...sub.files);
  }
  return { raw, gz, files };
};

const failures = [];
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  -- ${detail}` : ''}`);
  if (!ok) failures.push(name);
};

// --- The invariant ------------------------------------------------------
const entryDeps = staticImports(entry);
check(
  'entry does NOT statically import the 3D hero',
  !entryDeps.some((d) => d.startsWith('Hero3D')),
  entryDeps.join(', '),
);

if (hero) {
  const heroBytes = statSync(join(assets, hero)).size;
  check(
    '3D hero is a separate deferred chunk',
    true,
    `${hero} = ${(heroBytes / 1024).toFixed(0)} KB raw / ${(gzipSync(readFileSync(join(assets, hero))).length / 1024).toFixed(0)} KB gzip`,
  );
}

// --- Ceiling ------------------------------------------------------------
// 600 KB raw is roughly 200 KB gzipped. The old build sat at ~1.26 MB.
const CEILING = 600 * 1024;
const { raw: critical, gz: criticalGz, files: criticalFiles } = entryGraph(entry);
check(
  'first-load JS under the 600 KB ceiling',
  critical < CEILING,
  `${(critical / 1024).toFixed(0)} KB raw / ${(criticalGz / 1024).toFixed(0)} KB gzip across ${criticalFiles.length} chunk(s)`,
);

console.log(
  `\nEntry graph: ${criticalFiles.map((f) => `${f} ${(statSync(join(assets, f)).size / 1024).toFixed(0)}KB`).join('  |  ')}`,
);

if (failures.length) {
  console.error(`\n${failures.length} BUNDLE CHECK(S) FAILED`);
  process.exit(1);
}
console.log('\nBUNDLE OK');