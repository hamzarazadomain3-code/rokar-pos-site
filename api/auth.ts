import type { IncomingMessage, ServerResponse } from 'node:http';
import { verifyPassword, signSession } from './_helpers.js';

export const config = { runtime: 'nodejs' };

type Req = IncomingMessage & { body?: { password?: string } };

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const body = (req as Req).body;
  if (!body || typeof body.password !== 'string') {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'password required' }));
    return;
  }

  if (!verifyPassword(body.password)) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Wrong password' }));
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ ok: true, token: signSession() }));
}