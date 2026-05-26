import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { getSandboxAffinity, VALID_NICHES } from '../../lib/sandboxData.js';
import { computeAffinity } from '../../lib/affinityEngine.js';
import { logUsage } from '../../lib/apiKeyManager.js';
import { logger } from '../../lib/logger.js';

const router = Router();

/**
 * GET /v1/affinity/:niche
 * Returns cross-niche audience overlap scores for a given niche.
 */
router.get('/:niche', authenticate, async (req, res) => {
  const start = Date.now();
  const { niche } = req.params;

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
      payload = getSandboxAffinity(niche);
    } else {
      const data = await computeAffinity(niche);
      payload = {
        mode: 'production',
        niche,
        data,
        generated_at: new Date().toISOString(),
      };
    }

    const ms = Date.now() - start;
    logUsage({ keyId: req.apiKey.id, keyPrefix: req.apiKey.key_prefix, environment: req.apiKey.environment, endpoint: '/v1/affinity/:niche', method: 'GET', niche, statusCode: 200, responseMs: ms, ip: req.ip, userAgent: req.get('user-agent') });
    res.json(payload);
  } catch (err) {
    logger.error('Affinity endpoint error', err, { niche });
    const ms = Date.now() - start;
    logUsage({ keyId: req.apiKey.id, keyPrefix: req.apiKey.key_prefix, environment: req.apiKey.environment, endpoint: '/v1/affinity/:niche', method: 'GET', niche, statusCode: 500, responseMs: ms, ip: req.ip, userAgent: req.get('user-agent') });
    res.status(500).json({ error: 'internal_error', message: 'Failed to fetch affinity data' });
  }
});

export default router;
