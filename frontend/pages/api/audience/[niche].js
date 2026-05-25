import { fetchNicheMetrics } from '../../../lib/bigqueryClient';

const VALID_NICHES = new Set(['Trades', 'Mythology', 'Scouts', 'Neurodivergent', 'Stories']);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { niche } = req.query;

  if (!niche || !VALID_NICHES.has(niche)) {
    return res.status(400).json({ error: `Invalid niche. Valid values: ${[...VALID_NICHES].join(', ')}` });
  }

  try {
    const rows = await fetchNicheMetrics(niche);

    // BigQuery returns BigQueryInt64 objects — coerce to plain numbers
    const data = rows.map(r => ({
      channel_id:                  r.channel_id,
      channel_name:                r.channel_name,
      subscriber_count:            Number(r.subscriber_count) || 0,
      total_views:                 Number(r.total_views) || 0,
      total_watch_hours:           Number(r.total_watch_hours) || 0,
      avg_view_duration_seconds:   Number(r.avg_view_duration_seconds) || 0,
      total_subscribers_gained:    Number(r.total_subscribers_gained) || 0,
      total_likes:                 Number(r.total_likes) || 0,
      total_comments:              Number(r.total_comments) || 0,
    }));

    res.status(200).json(data);
  } catch (err) {
    console.error('[api/audience]', err.message);
    res.status(500).json({ error: 'Failed to fetch audience data' });
  }
}
