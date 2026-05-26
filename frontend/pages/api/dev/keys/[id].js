/**
 * Next.js API proxy: DELETE /api/dev/keys/:id → DELETE {BACKEND}/v1/keys/:id
 */

const BACKEND = process.env.BACKEND_API_URL || 'http://localhost:5000';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const { id } = req.query;
  const upstream = await fetch(`${BACKEND}/v1/keys/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body),
  });
  const data = await upstream.json();
  res.status(upstream.status).json(data);
}
