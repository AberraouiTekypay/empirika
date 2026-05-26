/**
 * Next.js API proxy for developer portal key management.
 * Forwards requests to the backend Express API.
 *
 * GET  /api/dev/keys?email=...  → GET  {BACKEND}/v1/keys?email=...
 * POST /api/dev/keys            → POST {BACKEND}/v1/keys
 */

const BACKEND = process.env.BACKEND_API_URL || 'http://localhost:5000';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'missing_email', message: 'email is required' });

    const upstream = await fetch(`${BACKEND}/v1/keys?email=${encodeURIComponent(email)}`);
    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  }

  if (req.method === 'POST') {
    const upstream = await fetch(`${BACKEND}/v1/keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).json({ error: 'method_not_allowed' });
}
