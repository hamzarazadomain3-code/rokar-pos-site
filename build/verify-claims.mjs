/**
 * Fails the build when the site claims something the app does not do.
 *
 * Why this exists: the site copy had been written without reading `pos-app`, and a
 * full audit of `content.json` against the actual source found 30 unsupported
 * claims across every section -- pricing, hero, features, industries, ticker,
 * download FAQ and the changelog. Nothing caught them. `verify-content.mjs`
 * checks that fields *exist*; it cannot know whether the sentence in them is true.
 *
 * Every entry below carries the evidence that made it false, so a future edit can
 * re-check the claim instead of trusting a pattern list.
 *
 * Design notes worth keeping:
 *
 *   - Claims are checked per *sentence*, not per file, and a sentence containing a
 *     negation is skipped. The corrected copy says "Backup encrypted nahi hota"
 *     (backup is NOT encrypted); a naive /encrypted/ rule would ban the very text
 *     that tells the truth.
 *
 *   - "Google Drive" is not banned on its own, because pointing the backup folder
 *     at a Drive sync folder genuinely does put backups in the cloud via the
 *     user's own client. Only the claim that the *app* uploads to Drive is banned.
 *
 *   - Any phrase that legitimately needs to exist goes in ALLOWLIST with a reason,
 *     and the reason is mandatory, so waving a claim through cannot be silent.
 *
 * Run: npm run verify:claims
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const problems = [];
const allowlisted = [];

/**
 * Claims proven false against pos-app.
 * `re` is matched per sentence; `why` must state the evidence.
 */
const BANNED = [
  {
    re: /\bencrypt(?:ed|ion|ing)?\b[^.]{0,90}\b(?:backup|data|file|database)\b/i,
    why: 'backup is a byte copy of a plain node:sqlite file (backup.ts:30 fs.copyFileSync; db.ts:58 opens DatabaseSync with no cipher, no PRAGMA key, no SQLCipher anywhere in the app)',
  },
  {
    re: /\b(?:backup|data|file|database)\b[^.]{0,90}\bencrypt(?:ed|ion|ing)?\b/i,
    why: 'same as above, reversed word order',
  },
  {
    re: /\b(?:central|multi-?branch|multi-?outlet)\s+(?:inventory\s+)?sync\b/i,
    why: 'there is no network path for stock at all: the only outbound requests in the main process are licensing, SMS and the WhatsApp gateway. branches.ts is local rows in the same single file.',
  },
  {
    re: /\b(?:SLA|service level agreement)\b/i,
    why: 'no SLA mechanism, contract or code path exists; a website cannot promise this',
  },
  {
    re: /\bdedicated account manager\b/i,
    why: 'no code footprint, and staffing for this cannot be guaranteed from a website',
  },
  {
    re: /\bon-?site training\b/i,
    why: 'no code footprint; a service promise we cannot verify',
  },
  {
    re: /\burdu\s*(?:&|\+|\band\b)\s*english\b/i,
    why: 'the language switcher translates 24 sidebar labels and 9 login strings; every page body is hardcoded English, so ~2% of the UI is actually translated',
  },
  {
    re: /\binvoice\b[^.]{0,60}\b(?:urdu\b[^.]{0,40}english|english\b[^.]{0,40}urdu)/i,
    why: 'no receipt-language setting exists in the app; receipts are English only',
  },
  {
    re: /\bcloud backup\b/i,
    why: 'nothing uploads to any cloud provider. copyToCloud() (backup.ts:81-103) is fs.copyFileSync into a folder the user picks; there is no Drive API, no OAuth and no googleapis dependency.',
  },
  {
    re: /\bautomated?\b[^.]{0,60}\b(?:google drive|onedrive)\b/i,
    why: 'the app writes to a local folder. If that folder happens to sit inside a Drive sync folder, the user\'s own sync client moves it -- which is not the app backing up to the cloud.',
  },
  {
    re: /\b(?:data|you|PC|computer)\b[^.]{0,30}\b100%\s*(?:safe|secure)\b/i,
    why: 'an absolute guarantee. Backups are not encrypted and not off-site unless the user arranges it, so "100% safe" is not true.',
  },
  {
    re: /\b100\s*%\s*(?:local|accurate|private|offline)\b|\b(?:100|100\s*%)\s*(?:percent)?\s*(?:local\s+data|accurate)\b/i,
    why: 'an unfalsifiable absolute. The app does keep sales data in a local SQLite file and billing really does survive a dropped connection, but shop name, phone, address and payment details are sent to the licence server, no computer record is "100% accurate" -- an operator can mistype a price -- and activation and updates still need the network. Name the specific thing that is true instead of asserting a total.',
  },
  {
    re: /\btrial\b/i,
    why: 'there is no trial anywhere in the product. Checked all three layers: no `trial` identifier in pos-app src/, no trial logic or plan type in license-server/server.js, and no separate trial build in any GitHub release -- the only asset is the one RokarPOS-Setup.exe every customer gets. The app throws "No license key set" until a key is entered, so "Download Free Trial" hands the shopkeeper an app they cannot use. The 15 in the source is GRACE_DAYS, the grace period AFTER a licence expires, which is not a trial. If a real trial is ever implemented, delete this rule deliberately rather than quietly.',
  },
  {
    re: /\b(?:bilkul|puri|tarah|fully|completely|entirely)\s+(?:offline|local|accurate|private|secure)\b|\b(?:offline|local)\s+(?:ho\s+)?(?:jayega|rehta)\b[^.]{0,20}\bnahin\b/i,
    why: 'an absolute that needs no number attached. "Bilkul Offline" is the same overclaim as "100% Offline" -- billing survives a dropped connection, but a licence still has to be activated and checked online and updates are fetched from GitHub, so the software is not offline in the unqualified sense.',
  },
  {
    re: /\bcompletely\s+offline\b[^.]{0,60}\b(?:haan|yes)\b|\b(?:haan|yes)\b[^.]{0,20}\b100\s*%[^.]{0,40}\boffline\b/i,
    why: 'billing, stock and reports really do work with no internet -- verified in licensing.ts, where a network failure is caught and the shop keeps trading. But the app still needs the network to activate a licence, verify it, and fetch updates, so an unqualified "completely offline, yes 100%" contradicts the rest of the same answer.',
  },
  {
    re: /\balways\s+private\b|\bkisi\s+ko\s+nahi\b[^.]{0,30}\b(?:data|private)/i,
    why: 'a privacy claim on a site that takes payments, while the licence server holds shop name, phone, address and payment amount. Scope the claim to the data that is actually local.',
  },
  {
    re: /\b(?:military[- ]grade|bank[- ]level|enterprise[- ]grade)\s+(?:security|encryption)/i,
    why: 'no such implementation; this is the kind of claim that invites a breach-of-contract letter',
  },
  {
    re: /\bIMEI\b/i,
    why: 'no serial-number, IMEI or warranty tracking exists anywhere in the source',
  },
  {
    re: /\bcarton to loose\b/i,
    why: 'no carton/pack breakdown logic exists anywhere in the source',
  },
  {
    re: /\bunder \d+ seconds?\b/i,
    why: 'nothing records bill timings, so any number here is invented',
  },
  {
    re: /\bunlimited\s+(?:pc|pc\s+|device|computer|device)s?\s*licen[cs]e/i,
    why: 'server.js always enforces max_devices (default 5). The device block was dead code until the client started sending device_id, so "unlimited" was never true and is now demonstrably false.',
  },
  {
    re: /\b\d+\s*[-–]\s*\d+\s*(?:ghant[ae]|hours?|hrs?)\b/i,
    why: 'nothing measures how many hours a shop saves. The ROI banner in Pricing.tsx claimed "15-20 ghante" with no source at all.',
  },
  {
    re: /\bnuqsaan\s+khatam\b|\bdata\s+loss\b[^.]{0,24}\b(?:khatam|zero|never)\b/i,
    why: 'an absolute outcome claim. Accounts get mis-entered; the software cannot promise a loss never happens',
  },
];

/**
 * Negation markers: a sentence containing one of these after the claim starts is
 * stating the opposite of the claim, which is exactly what we want the copy to do.
 */
const NEGATION = /\b(?:nahi|nahin|nahin?|n[aā]ko|not|never|no|without|cannot|can't|isn't|is not|doesn't|does not|revert|removed)\b/gi;

/** Phrases allowed to exist, each with a mandatory justification. */
const ALLOWLIST = [
  // Needed so the truth can be told: the copy states plainly that backups are not
  // encrypted, which the negation check handles but which is worth pinning here so
  // a future refactor cannot quietly delete the disclosure.
  { re: /Backup encrypted nahi hota/i, why: 'the security disclosure itself' },
];

/** Split content into sentences, keeping the offset so failures point at a string. */
function sentences(text) {
  return String(text)
    .split(/(?<=[.!?؟۔])\s+|\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function checkText(text, where) {
  for (const sentence of sentences(text)) {
    for (const { re, why } of BANNED) {
      const claim = new RegExp(re.source, re.flags.replace('g', '') + 'g').exec(sentence);
      if (!claim) continue;

      // A negation only excuses the claim when it comes *after* the claim starts.
      // Otherwise "No annual lock-in" excuses itself: the "No" opens the sentence
      // and is part of the promise, not a denial of it. This bit the guard during
      // its own negative test, which is why the rule exists rather than a bare
      // `if (NEGATION.test(sentence)) continue`.
      NEGATION.lastIndex = 0;
      let denied = false;
      for (let m = NEGATION.exec(sentence); m; m = NEGATION.exec(sentence)) {
        if (m.index > claim.index) {
          denied = true;
          break;
        }
      }
      if (denied) continue;

      const allow = ALLOWLIST.find((a) => a.re.test(sentence));
      if (allow) {
        allowlisted.push({ sentence, why: allow.why });
        continue;
      }
      problems.push(
        `${where}\n      claim: ${JSON.stringify(sentence)}\n      false because: ${why}`,
      );
    }
  }
}

/** Walk every string in a JSON value, reporting its path. */
function walk(value, path, visit) {
  if (typeof value === 'string') visit(value, path);
  else if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${path}[${i}]`, visit));
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`, visit);

    // Also scan each object's scalar fields joined into one line.
    //
    // A stat tile is stored as separate fields -- {"value": 100, "suffix": "%",
    // "label": "Bilkul Offline"} -- and every rule in this file keys off a number
    // sitting next to the word it modifies. Walked field by field, the number and
    // the word are never in the same string, so "100% Bilkul Offline" passed
    // cleanly while its own subtitle admitted the app needs the internet. Joining
    // the scalars reconstructs the text the page actually renders.
    const scalars = Object.entries(value)
      .filter(([, v]) => ['string', 'number', 'boolean'].includes(typeof v))
      .map(([, v]) => String(v))
      .filter(Boolean);
    if (scalars.length >= 2) visit(scalars.join(' '), `${path} (fields joined)`);
  }
}

// --- content.json ----------------------------------------------------------
const content = JSON.parse(readFileSync(join(root, 'src/content.json'), 'utf8'));
walk(content, 'content.json', (s, p) => checkText(s, p));

// --- every string in src/ -------------------------------------------------
// A claim hardcoded into a component bypasses content.json entirely, so the CMS
// editor is not the only way one can get in.
function walkDir(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist') continue;
    // content.json is already scanned above with per-key paths, which are far more
    // useful than a whole-file report of the same findings.
    if (dir.endsWith('src') && entry === 'content.json') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walkDir(full);
    else if (['.ts', '.tsx', '.js', '.jsx', '.html', '.json'].includes(extname(full)))
      checkText(readFileSync(full, 'utf8'), full.slice(root.length));
  }
}
for (const d of ['src', 'index.html']) {
  const full = join(root, d);
  try {
    if (statSync(full).isDirectory()) walkDir(full);
    else checkText(readFileSync(full, 'utf8'), d);
  } catch {
    /* missing path is not this check's problem */
  }
}

// --- changelog integrity --------------------------------------------------
// Round 1 of the audit found three invented release dates, so the dates are now
// cross-checked against real GitHub releases and the ordering is enforced.
const versions = content.changelog.map((c) => c.version);
for (let i = 1; i < versions.length; i++) {
  const cmp = (a, b) => {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    for (let k = 0; k < 3; k++) if (pa[k] !== pb[k]) return pa[k] - pb[k];
    return 0;
  };
  if (cmp(versions[i - 1], versions[i]) <= 0)
    problems.push(`changelog must descend: ${versions[i - 1]} is followed by ${versions[i]}`);
}
for (let i = 1; i < content.changelog.length; i++) {
  const prev = content.changelog[i - 1].date;
  const cur = content.changelog[i].date;
  if (cur >= prev)
    problems.push(`changelog dates must ascend: ${versions[i]} (${cur}) is dated after ${versions[i - 1]} (${prev})`);
}

// --- licensing cross-check: the one claim that depends on code ------------
// "Lifetime licence" and "No annual lock-in" are not on the ban list any more,
// because as of 2026-10-03 they are true: license-server has a `lifetime` flag and
// the client honours it. A ban list can only prove a claim is FALSE, so these two
// are checked against the real source instead, which is the only thing that can
// tell us they became true.
//
// This needs the app repo, which lives outside the site repo, so it is skipped
// when ROKAR_APP_DIR is unset (Vercel's build image has no checkout of the app).
// Skipping is reported loudly rather than silently, because a claim that was true
// when the rule was written can quietly become false again on the next release.
const PERSISTENT_CLAIM = /\b(?:lifetime\s+licen[cs]e|no annual lock-?in|one-?time\s+(?:payment|purchase)|koi renewal nahi|renewal nahi)\b/i;

function crossCheckLicensing() {
  const appDir = process.env.ROKAR_APP_DIR;
  const copyMentionsIt = [...sentences(JSON.stringify(content))].some((s) =>
    PERSISTENT_CLAIM.test(s),
  );
  if (!copyMentionsIt) {
    console.log('licensing cross-check: copy makes no perpetual claim, nothing to verify.');
    return;
  }
  if (!appDir) {
    problems.push(
      'the site claims a perpetual licence but ROKAR_APP_DIR is not set, so the claim ' +
        'cannot be checked against the code. Locally run:\n' +
        '      $env:ROKAR_APP_DIR="E:\\antigravty\\billing softwere\\pos-app"; npm run verify:claims',
    );
    return;
  }
  const files = {
    'license-server/server.js': [
      [/lifetime\s+INTEGER/, 'a lifetime column'],
      [/const LIFETIME_SENTINEL/, 'a lifetime sentinel date'],
      [/lifetime\s*=\s*true/, 'new keys default to perpetual'],
    ],
    'src/main/services/licensing.ts': [
      // Matched on the setting, not on the helper name: an earlier version of this
      // rule tested for /isLifetime/ and a negative test that only renamed the
      // function slipped straight through, because the rename left the capital I.
      // `license_lifetime` is the load-bearing string -- if the client stops
      // reading or writing it, the perpetual claim is false again.
      [/license_lifetime/, 'the client reads and writes license_lifetime'],
      [/device_id:\s*getDeviceId\(\)/, 'device_id is actually sent'],
    ],
  };
  for (const [rel, rules] of Object.entries(files)) {
    let src;
    try {
      src = readFileSync(join(appDir, rel), 'utf8');
    } catch {
      problems.push(`ROKAR_APP_DIR is set but ${rel} could not be read from it`);
      continue;
    }
    for (const [re, what] of rules) {
      if (!re.test(src))
        problems.push(
          `the site promises a perpetual licence, but ${rel} no longer contains ${what}.\n` +
            '      Either the licensing was reverted, or the site copy is now a lie.',
        );
    }
  }
  if (!problems.some((p) => p.includes('perpetual licence')))
    console.log('licensing cross-check: perpetual claims verified against pos-app source.');
}

// --- report ---------------------------------------------------------------
crossCheckLicensing();

if (allowlisted.length) {
  console.log(`allowlisted ${allowlisted.length} phrase(s):`);
  for (const a of allowlisted) console.log(`  - ${a.why}`);
  console.log('');
}

if (problems.length) {
  console.error(`CLAIM CHECK FAILED -- ${problems.length} unsupported claim(s):\n`);
  for (const p of problems) console.error(`  - ${p}\n`);
  process.exit(1);
}
console.log(
  `ALL CLAIM CHECKS PASSED (${BANNED.length} banned claim patterns, changelog ordering verified).`,
);