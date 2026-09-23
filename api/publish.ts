import { verifySession, writeFile, getFileSha } from './_helpers';

export const config = { runtime: 'nodejs' };

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!verifySession(token)) {
    return jsonResponse(401, { error: 'Session expired or invalid. Log in again.' });
  }

  let body: { content?: unknown; message?: string } = {};
  try {
    body = (await req.json()) as { content?: unknown; message?: string };
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON' });
  }

  if (!body.content || typeof body.content !== 'object') {
    return jsonResponse(400, { error: 'content is required' });
  }

  if (!process.env.GH_TOKEN) {
    return jsonResponse(500, { error: 'GH_TOKEN not configured on server' });
  }

  try {
    await getFileSha();
    const raw = JSON.stringify(body.content, null, 2);
    const message =
      typeof body.message === 'string' && body.message.trim()
        ? body.message.trim()
        : 'Site update via admin panel';
    const result = await writeFile(
      `${raw}\n`,
      message,
      process.env.GIT_AUTHOR_NAME || 'Rokar Admin',
      process.env.GIT_AUTHOR_EMAIL || 'admin@rokarpos.pk',
    );
    return jsonResponse(200, { ok: true, ...result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'publish failed';
    return jsonResponse(500, { error: msg });
  }
}