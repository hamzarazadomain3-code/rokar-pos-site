import { createHmac, timingSafeEqual } from 'node:crypto';

export const REPO = 'hamzarazadomain3-code/rokar-pos-site';
export const BRANCH = 'main';
export const FILE_PATH = 'src/content.json';

/**
 * The secret that signs admin session tokens.
 *
 * This used to end in `|| 'rokar-change-me'`. That fallback is a loaded gun: the
 * moment both env vars were missing from Vercel, every session token on the site
 * became forgeable by anyone who had read the source, and `/api/publish` would have
 * rewritten the whole site's content and triggered a deploy on their say-so. The
 * probe in build/probe-publish-auth.mjs confirms today's deployment is not signing
 * with that literal -- it is masked because ADMIN_PASSWORD is set -- but "it
 * happens to be configured today" is not the same as "it cannot get worse".
 *
 * So there is no fallback. If neither variable is present the module refuses to
 * load, which turns a silent catastrophic state into an immediate loud one.
 *
 * This cannot break a working deployment, and that is the point worth noting:
 * `verifyPassword` already returns false without ADMIN_PASSWORD, so an
 * installation missing both could never have logged in anyway. Failing closed here
 * costs nothing that was previously possible.
 *
 * SESSION_SECRET is listed first on purpose. Falling back to ADMIN_PASSWORD means
 * the password doubles as the signing key, so anything that leaks the password --
 * a log line, a screenshot, a shoulder-surf -- also grants the ability to mint
 * admin sessions. Setting a separate SESSION_SECRET breaks that coupling, and the
 * warning below is there until it is done.
 */
function resolveSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error(
      'Refusing to start: neither SESSION_SECRET nor ADMIN_PASSWORD is set. ' +
        'Without one of them every admin session token would be signed with a value ' +
        'an attacker can read in this file. Set SESSION_SECRET to a long random string.',
    );
  }
  if (!process.env.SESSION_SECRET && process.env.ADMIN_PASSWORD) {
    console.warn(
      '[rokar] SESSION_SECRET is not set, so ADMIN_PASSWORD is being used to sign ' +
        'session tokens. Anyone who learns the password can mint an admin session. ' +
        'Set a separate SESSION_SECRET.',
    );
  }
  return secret;
}

const SECRET = resolveSecret();

export function signSession(expiresInMs = 1000 * 60 * 60 * 12): string {
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + expiresInMs, sub: 'admin' }),
  ).toString('base64url');
  const mac = createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${mac}`;
}

export function verifySession(token: string | null | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, mac] = parts;
  const expected = createHmac('sha256', SECRET).update(payload).digest();
  const provided = Buffer.from(mac, 'base64url');
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof exp === 'number' && exp > Date.now();
  } catch {
    return false;
  }
}

export function verifyPassword(input: string | undefined | null): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !input) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

const GITHUB = 'https://api.github.com';
const GH_TOKEN = process.env.GH_TOKEN;

function ghHeaders(extra: Record<string, string> = {}) {
  return {
    Authorization: `token ${GH_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'rokar-site-admin',
    ...extra,
  };
}

export async function getFileSha(): Promise<string> {
  const res = await fetch(
    `${GITHUB}/repos/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
    { headers: ghHeaders() },
  );
  if (!res.ok) throw new Error(`read failed (${res.status})`);
  const data = (await res.json()) as { sha?: string };
  if (!data.sha) throw new Error('no sha returned');
  return data.sha;
}

export async function writeFile(
  content: string,
  message: string,
  authorName: string,
  authorEmail: string,
): Promise<{ commitSha: string; commitUrl: string }> {
  const sha = await getFileSha();
  const body = {
    message,
    content: Buffer.from(content, 'utf8').toString('base64'),
    sha,
    branch: BRANCH,
    author: { name: authorName, email: authorEmail },
  };
  const res = await fetch(`${GITHUB}/repos/${REPO}/contents/${FILE_PATH}`, {
    method: 'PUT',
    headers: ghHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { commit?: { sha?: string; html_url?: string }; message?: string };
  if (!res.ok) throw new Error(data.message || `publish failed (${res.status})`);
  return {
    commitSha: data.commit?.sha || '',
    commitUrl: data.commit?.html_url || '',
  };
}