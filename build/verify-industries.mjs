/**
 * Cross-checks the per-industry copy against the actual pos-app source.
 *
 * Why this exists: `verify-claims.mjs` can only prove a claim is FALSE, using a
 * list of shapes that are known to be fabrications. That caught the obvious ones
 * -- "Weighing scale integration (BayLan)", "Digital weight scale direct sync",
 * "formula search", "Fresh item fast key buttons" -- but it is blind to the more
 * expensive failure mode: copy that describes a feature which is *real but
 * different from what is written*. "Size & color matrix stock" happened to be
 * exactly right; "Fast exchange / return handling" was half right (returns exist,
 * exchange is not a flow); "Digital weight scale direct sync" was entirely wrong
 * (the operator types the weight, there is no device). None of those three can be
 * caught by a ban list, because each contains no banned word.
 *
 * So the claims are inverted. Instead of "this wording is forbidden", each claim
 * names the source symbols that must exist for the wording to be true. If a
 * future release deletes FIFO allocation, or renames the credit-limit service, or
 * removes quotation-to-sale conversion, the site silently starts lying again --
 * and this fails the build instead.
 *
 * Each rule is scoped to one industry's own text, so "supplier" in the pharmacy
 * section is checked against the supplier ledger while "variants" in the garments
 * section is checked against the variant generator.
 *
 * Needs the app repo, which lives outside the site repo, so it is skipped when
 * ROKAR_APP_DIR is unset (Vercel's build image has no checkout of the app).
 * Skipping while claims are present is reported as a failure rather than a pass,
 * for the same reason the licensing cross-check does it: a claim that was true
 * when the rule was written can quietly stop being true.
 *
 * Run:
 *   $env:ROKAR_APP_DIR="E:\antigravty\billing softwere\pos-app"; npm run verify:industries
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const appDir = process.env.ROKAR_APP_DIR;
const problems = [];

/** Cached file/dir reads so a dozen rules over the same tree stay cheap. */
const cache = new Map();

function readIfPresent(rel) {
  if (cache.has(rel)) return cache.get(rel);
  let text = null;
  try {
    text = readFileSync(join(appDir, rel), 'utf8');
  } catch {
    text = null;
  }
  cache.set(rel, text);
  return text;
}

function readDirIfPresent(rel) {
  if (cache.has(`dir:${rel}`)) return cache.get(`dir:${rel}`);
  let text = null;
  try {
    const parts = [];
    (function walk(abs) {
      for (const entry of readdirSync(abs)) {
        if (entry === 'node_modules' || entry === 'dist') continue;
        const full = join(abs, entry);
        if (statSync(full).isDirectory()) walk(full);
        else if (/\.(ts|tsx|js|jsx|sql)$/.test(entry)) parts.push(readFileSync(full, 'utf8'));
      }
    })(join(appDir, rel));
    text = parts.join('\n');
  } catch {
    text = null;
  }
  cache.set(`dir:${rel}`, text);
  return text;
}

/** One piece of proof. `file` proves the module exists; `re` proves a symbol is in it. */
function ok(ev) {
  const src = ev.dir ? readDirIfPresent(ev.dir) : readIfPresent(ev.file);
  if (src === null) return false;
  return !ev.re || ev.re.test(src);
}

const where = (ev) => (ev.dir ? `${ev.dir}/` : ev.file) + (ev.re ? ` still matching ${ev.re}` : '');

/**
 * `when` matches the industry's own copy. `evidence` must all hold once it does.
 * `note` explains the claim's provenance for whoever has to fix a failure.
 */
const CLAIMS = [
  // --- grocery / kirana -----------------------------------------------------
  {
    industry: 'grocery',
    when: /\bbarcode\b/i,
    note: 'replaces "Fast barcode scanner support", which was directionally right but said nothing true about how it works. The hook is a keyboard-wedge scanner: no device enumeration exists.',
    evidence: [
      { file: 'src/renderer/src/hooks/useBarcodeScan.ts', re: /onScan/, what: 'the shared barcode-scan hook' },
      { file: 'src/main/services/variants.ts', re: /findVariantByBarcode/, what: 'barcode lookup' },
    ],
  },
  {
    industry: 'grocery',
    when: /\blimit\b/i,
    note: 'the copy says a bill is stopped when the limit is crossed. That needs BOTH the limit service and the enforcement in the sale transaction, so both are required -- a limit stored but never enforced is exactly the kind of half-truth this guard is for.',
    evidence: [
      { file: 'src/main/services/creditLimits.ts', re: /block_on_exceed/, what: 'per-customer limit with a block flag' },
      { file: 'src/main/services/sales.ts', re: /Credit limit exceeded/, what: 'the sale actually being refused' },
    ],
  },
  {
    industry: 'grocery',
    when: /\b(?:record|history|poora record)\b/i,
    note: '"Limit ka poora record" is only true because every limit change is journalled.',
    evidence: [
      { dir: 'migrations', re: /credit_limit_history/, what: 'the limit-change audit table' },
    ],
  },
  {
    industry: 'grocery',
    when: /\b(?:low-?stock|threshold)\b/i,
    note: 'low-stock alert needs the per-product threshold column and the service that raises the alert.',
    evidence: [
      { dir: 'migrations', re: /low_stock_threshold/, what: 'the per-product low-stock threshold column' },
      { file: 'src/main/services/alertService.ts', re: /low_stock/, what: 'the low-stock alert service' },
      { file: 'src/main/services/emailService.ts', what: 'email delivery for the alert' },
    ],
  },

  // --- pharmacy -------------------------------------------------------------
  {
    industry: 'pharmacy',
    when: /\bexpiry\b/i,
    note: 'the copy names both the default warning window and the 7-day critical threshold, so both numbers are pinned rather than just the word "expiry".',
    evidence: [
      { file: 'src/main/services/alertService.ts', re: /expiry_warning_days/, what: 'the configurable warning window' },
      { file: 'src/main/services/alertService.ts', re: /days_to_expiry <= 7/, what: 'the 7-day critical threshold' },
    ],
  },
  {
    industry: 'pharmacy',
    when: /\b30 din|30 days\b/i,
    note: 'the default is a real number in the source, so it is allowed -- but only because it is a default the owner can change, and the copy says "default".',
    evidence: [
      { file: 'src/main/services/alertService.ts', re: /expiry_warning_days',\s*30/, what: 'a 30-day default' },
    ],
  },
  {
    industry: 'pharmacy',
    when: /\bbatch\b/i,
    note: '"Jaldi expire hone wala batch pehle" is a promise about allocation ORDER, which lives in the FIFO engine, not just in the batch table. Requiring allocateFIFO is what makes the sentence true.',
    evidence: [
      { dir: 'migrations', re: /product_batches/, what: 'the batch table' },
      { file: 'src/main/services/fifoEngine.ts', re: /allocateFIFO/, what: 'expiry-first batch allocation' },
    ],
  },
  {
    industry: 'pharmacy',
    when: /\bsupplier\b/i,
    note: '"Kharid, payment aur chal balance" needs all three columns to be real.',
    evidence: [
      { file: 'src/main/services/purchases.ts', re: /paySupplier/, what: 'supplier payments' },
      { file: 'src/main/services/purchases.ts', re: /SUM\(amount\) OVER/, what: 'a running balance' },
    ],
  },
  {
    industry: 'pharmacy',
    when: /supplier[^.]{0,40}credit limit|credit limit[^.]{0,40}supplier/i,
    note: 'the copy says a limit can be set on a supplier as well as a customer.',
    evidence: [
      { file: 'src/main/services/creditLimits.ts', re: /setSupplierLimit/, what: 'supplier-side credit limits' },
    ],
  },

  // --- bakery ---------------------------------------------------------------
  {
    industry: 'bakery',
    when: /\b(?:weight|toulay|tolay|weigh)\b/i,
    note: 'this is the rule that keeps the copy honest about the absent hardware. The app has NO scale integration: there is no serialport, no driver, no device manager. What it has is a PLU mode where the operator enters a weight. So the required evidence is the manual-weight field and the PLU badge -- if someone ever adds a real serial driver this rule still passes, and the copy can then be upgraded honestly.',
    evidence: [
      { file: 'src/renderer/src/pages/Billing.tsx', re: /scale_weight_kg/, what: 'manual weight entry on a cart line' },
      { file: 'src/renderer/src/pages/Billing.tsx', re: /scale_plu/, what: 'the PLU (weighed item) mode' },
      { file: 'src/main/services/inventory.ts', re: /wholesale_price/, what: 'per-unit pricing used by the kg rate' },
    ],
  },
  {
    industry: 'bakery',
    when: /\b50 gram|0\.05\b/i,
    note: 'the copy names a 50-gram step, so the 0.05 nudge is pinned.',
    evidence: [
      { file: 'src/renderer/src/pages/Billing.tsx', re: /0\.05/, what: 'the 0.05 kg step' },
    ],
  },
  {
    industry: 'bakery',
    when: /\b(?:gram|\bkg\b|kilogram|box)\b/i,
    note: 'multi-unit selling (500 Gram / 1 kg / a whole box, each with its own price and barcode) is a real flexible-units feature, not a bakery-specific one.',
    evidence: [
      { dir: 'migrations', re: /product_units/, what: 'the per-product units table' },
    ],
  },
  {
    industry: 'bakery',
    when: /\bshift\b/i,
    note: 'the copy claims a per-shift closing with a variance, which needs the session bookkeeping in both shifts.ts and cashDrawer.ts.',
    evidence: [
      { file: 'src/main/services/shifts.ts', re: /shiftTotals/, what: 'per-shift totals' },
      { file: 'src/main/services/cashDrawer.ts', re: /cash_drawer_sessions/, what: 'cash drawer sessions' },
    ],
  },
  {
    industry: 'bakery',
    when: /\b(?:variance|farq)\b/i,
    note: 'a variance figure needs the expected-cash calculation, not just a closing balance.',
    evidence: [
      { file: 'src/main/services/cashDrawer.ts', re: /variance/, what: 'a tracked variance' },
    ],
  },

  // --- garments -------------------------------------------------------------
  {
    industry: 'garments',
    when: /\b(?:size|colour|color|variant)\b/i,
    note: '"Size x colour ki list daalein, app har combination khud bana deta hai" is the autoGenerateVariants cross-product. The copy even uses the source\'s own example shape (colours x sizes), which is why this rule requires the generator function and not just a variants table.',
    evidence: [
      { file: 'src/main/services/variants.ts', re: /autoGenerateVariants/, what: 'the size x colour cross-product generator' },
      { file: 'src/main/services/variants.ts', re: /variant_attributes/, what: 'attribute definitions (Size, Colour)' },
    ],
  },
  {
    industry: 'garments',
    when: /\b(?:apna barcode|per-?variant barcode)\b/i,
    note: 'each variant carries its own barcode, MRP, rate and stock.',
    evidence: [
      { file: 'src/main/services/variants.ts', re: /barcode/, what: 'a barcode per variant' },
      { file: 'src/main/services/variants.ts', re: /mrp|sale_price/, what: 'per-variant pricing' },
    ],
  },
  {
    industry: 'garments',
    when: /\b(?:sticker|label|pitch)\b/i,
    note: '"Roll ka pitch (mm) set karein" is the label gap. printService.ts documents it in millimetres as the roll pitch gap; requiring the word keeps the unit honest.',
    evidence: [
      { file: 'src/main/services/labelTemplates.ts', re: /buildLabelBatchHtml/, what: 'batch label generation' },
      { file: 'src/main/services/printService.ts', re: /pitch/, what: 'the configurable roll pitch gap' },
    ],
  },
  {
    industry: 'garments',
    when: /\bpromotion\b/i,
    note: '"2 kharido 1 free" is the buy_qty/free_qty bundle. Requiring both columns proves the BOGO wording is a real promotion type rather than a discount with extra steps.',
    evidence: [
      { file: 'src/main/services/promotions.ts', re: /buy_qty/, what: 'buy-X quantity' },
      { file: 'src/main/services/promotions.ts', re: /free_qty/, what: 'get-Y-free quantity' },
    ],
  },
  {
    industry: 'garments',
    when: /\breturn\b|\brestock\b/i,
    note: 'this replaced "Fast exchange / return handling". Exchange is NOT a flow in the app -- my first grep missed returns entirely and nearly caused a false accusation -- but returns with restock and a cash-or-credit refund are real, so the copy now says returns and restock. refund_mode is required because the copy names both refund kinds.',
    evidence: [
      { file: 'src/main/services/returns.ts', re: /restock/, what: 'returned goods going back into stock' },
      { file: 'src/main/services/returns.ts', re: /refund_mode/, what: 'cash-or-credit refunds' },
    ],
  },

  // --- wholesale ------------------------------------------------------------
  {
    industry: 'wholesale',
    when: /\bwholesale\b/i,
    note: '"Retail ya wholesale mode" needs the wholesale price column and the sale-level price mode. The copy deliberately does not say "auto-switches by customer", which the app does not do.',
    evidence: [
      { file: 'src/main/services/inventory.ts', re: /wholesale_price/, what: 'a per-product wholesale price' },
      { file: 'src/main/services/sales.ts', re: /wholesale/, what: 'a wholesale price mode on the sale' },
    ],
  },
  {
    industry: 'wholesale',
    when: /\bquotation|\bquote\b/i,
    note: 'quotations are a genuine wholesale need and were entirely missing from the old copy. "Usi quotation se bill ban jata hai" is convertToSale.',
    evidence: [
      { file: 'src/main/services/quotations.ts', re: /convertToSale/, what: 'quotation-to-sale conversion' },
    ],
  },
  {
    industry: 'wholesale',
    when: /\bledger\b/i,
    note: 'the ledger is the per-party running history, so both the customer and supplier sides are required.',
    evidence: [
      { file: 'src/main/services/sales.ts', re: /customerLedger/, what: 'the customer ledger' },
      { file: 'src/main/services/purchases.ts', re: /supplierLedger/, what: 'the supplier ledger' },
    ],
  },
  {
    industry: 'wholesale',
    when: /\bexcel\b|\bexport\b/i,
    note: 'the export is filtered by payment status and date range, which is what the copy promises.',
    evidence: [
      { file: 'src/main/services/export.ts', re: /exportCustomersXlsx/, what: 'an Excel export for customers' },
    ],
  },
  {
    industry: 'wholesale',
    when: /\bpurchase order\b/i,
    note: 'purchase orders are real; without them the wholesale section would omit the shop\'s actual replenishment workflow.',
    evidence: [
      { file: 'src/main/services/purchases.ts', re: /createPurchaseOrder/, what: 'purchase orders' },
    ],
  },
];

// --- run -------------------------------------------------------------------

const content = JSON.parse(readFileSync(join(root, 'src/content.json'), 'utf8'));
const industries = content.industries || [];

/** Every scrap of text an industry renders: heading, description, bullets, tiles. */
function copyOf(ind) {
  return [
    ind.name,
    ind.desc,
    ...(ind.points || []),
    ...(ind.preview || []).flatMap((t) => [t.k, t.v]),
  ].join('\n');
}

let checked = 0;
let matched = 0;
const missed = [];

for (const ind of industries) {
  const text = copyOf(ind);
  for (const claim of CLAIMS) {
    if (claim.industry !== ind.id) continue;
    if (!claim.when.test(text)) continue;
    matched++;
    if (!appDir) {
      missed.push(`${ind.id}: ${claim.when} matched but ROKAR_APP_DIR is unset`);
      continue;
    }
    for (const ev of claim.evidence) {
      if (!ok(ev)) {
        problems.push(
          `industries[${ind.id}] promises something the app no longer does.\n` +
            `      copy: ${JSON.stringify(copyOf(ind).split('\n').filter((l) => claim.when.test(l))[0] || '')}\n` +
            `      missing: ${where(ev)}\n` +
            `      why it was written: ${claim.note}`,
        );
      }
    }
    checked++;
  }
}

// Every industry must contribute at least one checked claim, otherwise a typo in
// an id would silently drop that industry out of the check.
for (const ind of industries) {
  if (!CLAIMS.some((c) => c.industry === ind.id)) {
    problems.push(
      `industries[${ind.id}] has no source cross-check rules at all. Every industry ` +
        `in content.json must have at least one CLAIM entry in verify-industries.mjs, ` +
        `otherwise its copy is unverified.`,
    );
  }
}

if (missed.length) {
  problems.push(
    missed.join('\n      ') +
      '\n      Set ROKAR_APP_DIR and re-run:\n' +
      '      $env:ROKAR_APP_DIR="E:\\antigravty\\billing softwere\\pos-app"; npm run verify:industries',
  );
}

if (problems.length) {
  console.error(`INDUSTRY SOURCE CHECK FAILED -- ${problems.length} problem(s):\n`);
  for (const p of problems) console.error(`  - ${p}\n`);
  process.exit(1);
}

console.log(
  `industry source check passed: ${matched} claim(s) across ${industries.length} industries ` +
    `verified against pos-app source${appDir ? '' : ' (no claims matched)'}.`,
);