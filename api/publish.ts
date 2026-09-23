import type { IncomingMessage, ServerResponse } from 'node:http';
import { verifySession, writeFile, getFileSha } from './_helpers.js';
import { triggerDeployment } from './_deploy.js';

export const config = { runtime: 'nodejs' };
export const maxDuration = 60;

type Req = IncomingMessage & {
  body?: { content?: unknown; message?: string };
  headers: {
    authorization?: string;
    [key: string]: string | string[] | undefined;
  };
};

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const result = async (status: number, obj: Record<string, unknown>) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(obj));
  };

  if (req.method !== 'POST') {
    await result(405, { error: 'Method not allowed' });
    return;
  }

  const authorization = (req.headers['authorization'] as string | undefined) || '';
  const token = authorization.replace(/^Bearer\s+/i, '');
  if (!verifySession(token)) {
    await result(401, { error: 'Session expired or invalid. Log in again.' });
    return;
  }

  const body = (req as Req).body;
  if (!body || typeof body.content !== 'object' || body.content === null) {
    await result(400, { error: 'content is required' });
    return;
  }

  if (!process.env.GH_TOKEN) {
    await result(500, { error: 'GH_TOKEN not configured on server' });
    return;
  }

  try {
    await getFileSha();
    const raw = JSON.stringify(body.content, null, 2);
    const message =
      typeof body.message === 'string' && body.message.trim()
        ? body.message.trim()
        : 'Site update via admin panel';
    const commit = await writeFile(
      `${raw}\n`,
      message,
      process.env.GIT_AUTHOR_NAME || 'Rokar Admin',
      process.env.GIT_AUTHOR_EMAIL || 'admin@rokarpos.pk',
    );
    const deploy = await triggerDeployment({
      message,
      commitSha: commit.commitSha || '',
      commitUrl: commit.commitUrl || '',
    });
    await result(200, { ok: true, ...commit, deploy });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'publish failed';
    await result(500, { error: msg });
  }
}