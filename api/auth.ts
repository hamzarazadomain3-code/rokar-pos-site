import { verifyPassword, signSession } from './_helpers';

export const config = { runtime: 'nodejs' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { password?: string } = {};
  try {
    body = (await req.json()) as { password?: string };
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!verifyPassword(body.password)) {
    return new Response(JSON.stringify({ error: 'Wrong password' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({ ok: true, token: signSession() }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
}