import { createHmac, timingSafeEqual } from 'node:crypto';

export const REPO = 'hamzarazadomain3-code/rokar-pos-site';
export const BRANCH = 'main';
export const FILE_PATH = 'src/content.json';

const SECRET = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || 'rokar-change-me';

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