// One-shot probe: is the live /api/publish endpoint protected by a real secret?
//
// Why this must be careful. publish.ts writes src/content.json on the marketing
// site, so a false negative here means either a false alarm or a false sense of
// safety. Two things follow from that.
//
// 1. The forged token is built by Node and written to disk. An earlier attempt
//    piped Node's stdout through PowerShell and $tok came out empty, so the
//    "forged" request was really sent with NO Authorization header at all -- and
//    returned 401, which looked like a pass but proved nothing. A test that cannot
//    fail is not a test, so the token is now asserted non-empty before it is sent.
//
// 2. Nothing is published. publish.ts checks the session at line 30, before it
//    touches GitHub at line 52, and it rejects a missing `content` field with 400.
//    So the request carries an empty object: a 401 means the token was rejected,
//    and a 400 "content is required" means auth PASSED and the endpoint would have
//    accepted an unauthenticated write.
//
// Usage: node build/probe-publish-auth.mjs [baseUrl]
// Writes the verdict to stdout; exits 0 only if auth rejected the forgery.

import { createHmac } from 'node:crypto';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = process.argv[2] || 'https://rokarpos.co.uk';

// The literal fallback in api/_helpers.ts. If the deployed function ever falls
// through to this, every session token on the site becomes forgeable by anyone.
const FALLBACK_SECRET = 'rokar-change-me';

const dir = mkdtempSync(join(tmpdir(), 'rokar-probe-'));
const tokenPath = join(dir, 'token.txt');
const bodyPath = join(dir, 'body.json');

const payload = Buffer.from(
  JSON.stringify({ exp: Date.now() + 3_600_000, sub: 'admin' }),
).toString('base64url');
const token = `${payload}.${createHmac('sha256', FALLBACK_SECRET).update(payload).digest('base64url')}`;

writeFileSync(tokenPath, token, 'utf8');
// An empty object: no content, so a passing auth check stops at the 400 guard
// instead of writing anything to the repository.
writeFileSync(bodyPath, '{}', 'utf8');

if (!token || token.length < 40) {
  console.error(`PROBE INVALID: built a ${token.length}-char token, refusing to send it.`);
  process.exit(1);
}

async function post(authHeader) {
  const res = await fetch(`${BASE}/api/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
    body: '{}',
  });
  const text = await res.text();
  return { status: res.status, text: text.slice(0, 200) };
}

console.log(`probe: ${BASE}/api/publish`);
console.log(`token: ${token.length} chars, signed with the literal fallback secret\n`);

const garbage = await post('Bearer garbage.token');
console.log(`  garbage token      -> HTTP ${garbage.status}  ${garbage.text}`);

const forged = await post(`Bearer ${token}`);
console.log(`  forged token       -> HTTP ${forged.status}  ${forged.text}`);

const none = await post(null);
console.log(`  no header          -> HTTP ${none.status}  ${none.text}\n`);

const baselineOk = garbage.status === 401 && none.status === 401;
const forgedRejected = forged.status === 401;

if (!baselineOk) {
  console.log('PROBE INCONCLUSIVE: the endpoint did not reject an obviously invalid session.');
  console.log('That means this probe cannot tell whether the forgery worked.');
  process.exit(1);
}

if (forgedRejected) {
  console.log('RESULT: SAFE. The deployed server is not signing with the fallback secret,');
  console.log('so the forgery is rejected exactly like any other bad token.');
  process.exit(0);
}

console.log('RESULT: VULNERABLE. The forgery was accepted.');
console.log('A 400 rather than a 401 means the session verified, and the only reason the');
console.log('write did not happen is the missing content field -- a request that included');
console.log('content would have rewritten src/content.json and triggered a deploy.');
console.log('\nFix: set SESSION_SECRET in Vercel to a long random value and redeploy.');
console.log('Then confirm this probe reports SAFE.');
process.exit(1);