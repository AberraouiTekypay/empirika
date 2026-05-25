/**
 * POST /api/admin/sync
 * Proxy to backend sync endpoint. Requires ADMIN_SECRET.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { secret, days = 7 } = req.body || {};

  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/admin/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days, secret }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('[api/admin/sync]', err.message);
    res.status(500).json({ error: 'Failed to trigger sync' });
  }
}
