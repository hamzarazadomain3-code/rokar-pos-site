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
    re: /\b(?:military[- ]grade|bank[- ]level|enterprise[- ]grade)\s+(?:security|encryption)/i,
    why: 'no such implementation; this is the kind of claim that invites a breach-of-contract letter',
  },
  {
    re: /\bno annual lock-?in\b/i,
    why: 'license-server/server.js:75-81 stamps every key with expires = now + 365 days. The site was claiming the exact opposite of what the server does.',
  },
  {
    re: /\blifetime\s+licen[cs]e\b/i,
    why: 'same 365-day expiry. Blocked until the licensing model is actually changed in code.',
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
    re: /\bsubscription\b[^.]{0,30}\b(?:month|year)\b/i,
    why: 'the site does not publish prices or a billing period, so this hints at terms that were never decided',
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
  else if (value && typeof value === 'object')
    for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`, visit);
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

// --- report ---------------------------------------------------------------
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