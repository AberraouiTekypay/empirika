import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { getSandboxChannels } from '../../lib/sandboxData.js';
import { fetchChannels } from '../../lib/bigqueryHelpers.js';
import { logUsage } from '../../lib/apiKeyManager.js';
import { logger } from '../../lib/logger.js';

const router = Router();

/**
 * GET /v1/channels
 * Returns all tracked YouTube channels with metadata.
 * Optional query: ?niche=Stories to filter by niche.
 */
router.get('/', authenticate, async (req, res) => {
  const start = Date.now();
  const { niche } = req.query;

  try {
    let payload;

    if (req.isSandbox) {
      const all = getSandboxChannels();
      payload = niche
        ? { ...all, data: all.data.filter(c => c.niche_category === niche) }
        : all;
    } else {
      const rows = await fetchChannels();
      const data  = rows
        .filter(r => !niche || r.niche_category === niche)
        .map(r => ({
          channel_id:       r.channel_id,
          channel_name:     r.channel_name,
          niche_category:   r.niche_category,
          subscriber_count: Number(r.subscriber_count) || 0,
          video_count:      Number(r.video_count)      || 0,
          view_count:       Number(r.view_count)       || 0,
          thumbnail_url:    r.thumbnail_url || null,
        }));

      payload = {
        mode: 'production',
        data,
        generated_at: new Date().toISOString(),
      };
    }

    const ms = Date.now() - start;
    logUsage({ keyId: req.apiKey.id, keyPrefix: req.apiKey.key_prefix, environment: req.apiKey.environment, endpoint: '/v1/channels', method: 'GET', statusCode: 200, responseMs: ms, ip: req.ip, userAgent: req.get('user-agent') });
    res.json(payload);
  } catch (err) {
    logger.error('Channels endpoint error', err);
    const ms = Date.now() - start;
    logUsage({ keyId: req.apiKey.id, keyPrefix: req.apiKey.key_prefix, environment: req.apiKey.environment, endpoint: '/v1/channels', method: 'GET', statusCode: 500, responseMs: ms, ip: req.ip, userAgent: req.get('user-agent') });
    res.status(500).json({ error: 'internal_error', message: 'Failed to fetch channels' });
  }
});

export default router;
