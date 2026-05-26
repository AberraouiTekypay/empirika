import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { getSandboxAudience, VALID_NICHES } from '../../lib/sandboxData.js';
import { fetchNicheMetrics } from '../../lib/bigqueryHelpers.js';
import { logUsage } from '../../lib/apiKeyManager.js';
import { logger } from '../../lib/logger.js';

const router = Router();

/**
 * GET /v1/audience/:niche
 * Returns audience metrics for a niche (last 30 days by default).
 */
router.get('/:niche', authenticate, async (req, res) => {
  const start = Date.now();
  const { niche } = req.params;
  const days = Math.min(parseInt(req.query.days) || 30, 90);

  if (!VALID_NICHES.has(niche)) {
    return res.status(400).json({
      error: 'invalid_niche',
      message: `Niche must be one of: ${[...VALID_NICHES].join(', ')}`,
      valid_niches: [...VALID_NICHES],
    });
  }

  try {
    let payload;

    if (req.isSandbox) {
      payload = getSandboxAudience(niche);
    } else {
      const rows = await fetchNicheMetrics(niche, days);
      payload = {
        mode: 'production',
        niche,
        data: rows.map(r => ({
          channel_id:                r.channel_id,
          channel_name:              r.channel_name,
          subscriber_count:          Number(r.subscriber_count)       || 0,
          total_views:               Number(r.total_views)            || 0,
          total_watch_hours:         Number(r.total_watch_hours)      || 0,
          avg_view_duration_seconds: Number(r.avg_view_duration_seconds) || 0,
          total_subscribers_gained:  Number(r.total_subscribers_gained)  || 0,
          total_likes:               Number(r.total_likes)            || 0,
          total_comments:            Number(r.total_comments)         || 0,
        })),
        generated_at: new Date().toISOString(),
      };
    }

    const ms = Date.now() - start;
    logUsage({ keyId: req.apiKey.id, keyPrefix: req.apiKey.key_prefix, environment: req.apiKey.environment, endpoint: '/v1/audience/:niche', method: 'GET', niche, statusCode: 200, responseMs: ms, ip: req.ip, userAgent: req.get('user-agent') });
    res.json(payload);
  } catch (err) {
    logger.error('Audience endpoint error', err, { niche });
    const ms = Date.now() - start;
    logUsage({ keyId: req.apiKey.id, keyPrefix: req.apiKey.key_prefix, environment: req.apiKey.environment, endpoint: '/v1/audience/:niche', method: 'GET', niche, statusCode: 500, responseMs: ms, ip: req.ip, userAgent: req.get('user-agent') });
    res.status(500).json({ error: 'internal_error', message: 'Failed to fetch audience data' });
  }
});

export default router;
