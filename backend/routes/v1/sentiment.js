import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { getSandboxSentiment, VALID_NICHES } from '../../lib/sandboxData.js';
import { fetchNicheSentiment } from '../../lib/bigqueryHelpers.js';
import { logUsage } from '../../lib/apiKeyManager.js';
import { logger } from '../../lib/logger.js';

const router = Router();

/**
 * GET /v1/sentiment/:niche
 * Returns community sentiment score and trending keywords for a niche.
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
      payload = getSandboxSentiment(niche);
    } else {
      const result = await fetchNicheSentiment(niche, days);

      if (!result) {
        // Live pipeline not yet active — serve sandbox data with honest mode label
        payload = {
          ...getSandboxSentiment(niche),
          mode: 'production_fallback',
          message: 'Live sentiment pipeline is not yet active for this niche. Showing representative data.',
        };
      } else {
        payload = {
          mode: 'production',
          niche,
          sentiment: { score: result.score, label: result.label, summary: result.summary },
          keywords: result.keywords,
          generated_at: new Date().toISOString(),
        };
      }
    }

    const ms = Date.now() - start;
    logUsage({ keyId: req.apiKey.id, keyPrefix: req.apiKey.key_prefix, environment: req.apiKey.environment, endpoint: '/v1/sentiment/:niche', method: 'GET', niche, statusCode: 200, responseMs: ms, ip: req.ip, userAgent: req.get('user-agent') });
    res.json(payload);
  } catch (err) {
    logger.error('Sentiment endpoint error', err, { niche });
    const ms = Date.now() - start;
    logUsage({ keyId: req.apiKey.id, keyPrefix: req.apiKey.key_prefix, environment: req.apiKey.environment, endpoint: '/v1/sentiment/:niche', method: 'GET', niche, statusCode: 500, responseMs: ms, ip: req.ip, userAgent: req.get('user-agent') });
    res.status(500).json({ error: 'internal_error', message: 'Failed to fetch sentiment data' });
  }
});

export default router;
