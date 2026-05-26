import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { getUsageSummary } from '../../lib/apiKeyManager.js';
import { logger } from '../../lib/logger.js';

const router = Router();

/**
 * GET /v1/usage
 * Returns the last 200 API calls made with the authenticated key.
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const usage = await getUsageSummary(req.apiKey.id);
    res.json({
      key_prefix:   req.apiKey.key_prefix,
      environment:  req.apiKey.environment,
      rate_limit_rpm: req.apiKey.rate_limit_rpm,
      usage,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    logger.error('Usage endpoint error', err);
    res.status(500).json({ error: 'internal_error', message: 'Failed to fetch usage data' });
  }
});

export default router;
