/**
 * One-off probe: render the app through the same Vite SSR path verify:ssr uses and
 * print the per-industry mockup tiles, to confirm they now come from content.json
 * and that the hardcoded fabrications are gone from the rendered page.
 */
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

const server = await createServer({
  configFile: fileURLToPath(new URL('../vite.config.ts', import.meta.url)),
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});
const { default: App } = await server.ssrLoadModule('/src/App.tsx');
const html = renderToString(createElement(App));
await server.close();

const tiles = [...html.matchAll(/class="mockup-stat-tile"><span>([^<]*)<\/span><b>([^<]*)<\/b>/g)];
console.log('mockup tiles rendered: ' + tiles.length);
for (const [, k, v] of tiles) console.log('  ' + k.padEnd(20) + ' -> ' + v);

console.log('\nfabrications that must be absent from the rendered page:');
const gone = [
  '100% Active',
  '~3 Seconds',
  'All Thermal',
  '3-Sec Billing',
  'BayLan',
  'formula search',
  'fast-sync',
  'fast key buttons',
  'Digital weight scale',
  'Weighing scale integration',
];
let stillThere = 0;
for (const g of gone) {
  const present = html.includes(g);
  if (present) stillThere++;
  console.log('  ' + (present ? 'STILL PRESENT: ' : 'gone:           ') + g);
}

// The first industry renders by default; confirm its heading is the real one.
console.log('\nindustry heading in HTML: ' + (html.match(/Tailored for ([^<]*)/) || ['(none)'])[1]);
process.exit(stillThere ? 1 : 0);