import { REPO, BRANCH } from './_helpers.js';

const VERCEL_API = 'https://api.vercel.com';
const GITHUB_API = 'https://api.github.com';

const V_TOKEN = process.env.VERCEL_TOKEN;
const GH_TOKEN = process.env.GH_TOKEN;
const PROJECT_ID = process.env.VERCEL_PROJECT_ID || 'prj_IzZp7mmUD2tXTeA846vvltprpph1';
const TEAM_ID = process.env.VERCEL_TEAM_ID || 'team_92jGw1HUnBthVY9Ro7q6FE5Q';
const PROJECT_NAME = 'rokar-site';

const SKIP_PREFIXES = ['node_modules/', 'dist/', '.vercel/', '.git/'];
const MAX_FILE_BYTES = 2 * 1024 * 1024;

type BlobEntry = { path: string; sha: string; size?: number };

function ghHeaders() {
  return {
    Authorization: `token ${GH_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'rokar-site-admin',
  };
}

export type DeployResult =
  | { ok: true; deployId: string; deployUrl: string; readyState: string }
  | { ok: true; skipped: true; reason: string }
  | { ok: false; error: string };

async function isGitConnected(): Promise<boolean> {
  if (!V_TOKEN) return false;
  try {
    const res = await fetch(`${VERCEL_API}/v9/projects/${PROJECT_ID}?teamId=${TEAM_ID}`, {
      headers: { Authorization: `Bearer ${V_TOKEN}` },
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { link?: unknown };
    return !!data.link;
  } catch {
    return false;
  }
}

async function listRepoFiles(): Promise<BlobEntry[]> {
  const res = await fetch(
    `${GITHUB_API}/repos/${REPO}/git/trees/${BRANCH}?recursive=1`,
    { headers: ghHeaders() },
  );
  if (!res.ok) throw new Error(`repo tree read failed (${res.status})`);
  const data = (await res.json()) as {
    tree?: { path: string; type: string; sha: string; size?: number }[];
  };
  return (data.tree || [])
    .filter((t) => t.type === 'blob')
    .filter((t) => !SKIP_PREFIXES.some((p) => t.path.startsWith(p)))
    .filter((t) => (t.size ?? 0) <= MAX_FILE_BYTES)
    .map((t) => ({ path: t.path, sha: t.sha, size: t.size }));
}

async function fetchBlobs(entries: BlobEntry[]): Promise<{ file: string; data: string; encoding: string }[]> {
  const out: { file: string; data: string; encoding: string }[] = [];
  const BATCH = 12;
  for (let i = 0; i < entries.length; i += BATCH) {
    const batch = entries.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map(async (e) => {
        const res = await fetch(`${GITHUB_API}/repos/${REPO}/git/blobs/${e.sha}`, {
          headers: ghHeaders(),
        });
        if (!res.ok) throw new Error(`blob read failed for ${e.path} (${res.status})`);
        const blob = (await res.json()) as { content?: string };
        if (!blob.content) throw new Error(`empty blob for ${e.path}`);
        return { file: e.path, data: blob.content.replace(/\s+/g, ''), encoding: 'base64' };
      }),
    );
    out.push(...results);
  }
  return out;
}

export async function triggerDeployment(opts: {
  message: string;
  commitSha: string;
  commitUrl: string;
}): Promise<DeployResult> {
  if (!V_TOKEN) return { ok: false, error: 'VERCEL_TOKEN not configured on server' };
  if (!GH_TOKEN) return { ok: false, error: 'GH_TOKEN not configured on server' };

  if (await isGitConnected()) {
    return { ok: true, skipped: true, reason: 'git-connected' };
  }

  try {
    const entries = await listRepoFiles();
    if (entries.length === 0) return { ok: false, error: 'no files found in repo' };
    const files = await fetchBlobs(entries);

    const body = {
      name: PROJECT_NAME,
      project: PROJECT_ID,
      target: 'production',
      files,
      projectSettings: {
        framework: 'vite',
        buildCommand: 'npm run build',
        installCommand: 'npm install',
        outputDirectory: 'dist',
      },
      gitMetadata: {
        remoteUrl: `https://github.com/${REPO}.git`,
        commitRef: BRANCH,
        commitSha: opts.commitSha,
        commitMessage: opts.message,
        commitAuthorName: process.env.GIT_AUTHOR_NAME || 'Rokar Admin',
        commitAuthorEmail: process.env.GIT_AUTHOR_EMAIL || 'admin@rokarpos.pk',
        dirty: false,
        ci: true,
        ciType: 'rokar-admin',
      },
    };

    const res = await fetch(
      `${VERCEL_API}/v13/deployments?forceNew=1&skipAutoDetectionConfirmation=1&teamId=${TEAM_ID}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${V_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );
    const data = (await res.json()) as {
      id?: string;
      url?: string;
      readyState?: string;
      error?: { message?: string };
      errorMessage?: string;
    };
    if (!res.ok || !data.id) {
      return {
        ok: false,
        error: data.error?.message || data.errorMessage || `deploy failed (${res.status})`,
      };
    }
    return {
      ok: true,
      deployId: data.id,
      deployUrl: data.url ? `https://${data.url}` : '',
      readyState: data.readyState || 'QUEUED',
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'deploy failed' };
  }
}