import { SENTIMENT_DATA } from '../../../lib/fakeData';

const VALID_NICHES = new Set([
  'Beauty & Skincare',
  'Health & Wellness',
  'Home & Living',
  'Food & Beverage',
  'Parenting & Family',
]);

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { niche } = req.query;

  if (!niche || !VALID_NICHES.has(niche)) {
    return res.status(400).json({ error: 'Invalid niche' });
  }

  res.status(200).json(SENTIMENT_DATA[niche] || { sentiment: null, keywords: [] });
}
