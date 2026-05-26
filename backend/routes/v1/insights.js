import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { getSandboxInsight, VALID_NICHES } from '../../lib/sandboxData.js';
import { fetchNicheMetrics } from '../../lib/bigqueryHelpers.js';
import { computeAffinity } from '../../lib/affinityEngine.js';
import { generateAudienceInsight } from '../../lib/insightGenerator.js';
import { logUsage } from '../../lib/apiKeyManager.js';
import { logger } from '../../lib/logger.js';

const router = Router();

/**
 * GET /v1/insights/:niche
 * Returns an AI-generated audience intelligence report for a niche.
 * Sandbox: static curated report. Production: live Claude-generated report.
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
      payload = getSandboxInsight(niche);
    } else {
      const [rows, affinities] = await Promise.all([
        fetchNicheMetrics(niche, 30),
        computeAffinity(niche),
      ]);

      // Aggregate metrics across all channels in the niche
      const metrics = rows.reduce(
        (acc, r, i) => ({
          totalViews:          acc.totalViews       + (Number(r.total_views)              || 0),
          watchHours:          acc.watchHours       + (Number(r.total_watch_hours)        || 0),
          newSubscribers:      acc.newSubscribers   + (Number(r.total_subscribers_gained) || 0),
          avgDurationSeconds:  i === 0
            ? (Number(r.avg_view_duration_seconds) || 0)
            : (acc.avgDurationSeconds + (Number(r.avg_view_duration_seconds) || 0)) / 2,
        }),
        { totalViews: 0, watchHours: 0, newSubscribers: 0, avgDurationSeconds: 0 }
      );

      const insight = await generateAudienceInsight(
        niche,
        metrics,
        affinities.map(a => ({ category: a.category, engagementPct: a.engagement_pct }))
      );

      payload = {
        mode: 'production',
        niche,
        ...insight,
        generated_at: new Date().toISOString(),
      };
    }

    const ms = Date.now() - start;
    logUsage({ keyId: req.apiKey.id, keyPrefix: req.apiKey.key_prefix, environment: req.apiKey.environment, endpoint: '/v1/insights/:niche', method: 'GET', niche, statusCode: 200, responseMs: ms, ip: req.ip, userAgent: req.get('user-agent') });
    res.json(payload);
  } catch (err) {
    logger.error('Insights endpoint error', err, { niche });
    const ms = Date.now() - start;
    logUsage({ keyId: req.apiKey.id, keyPrefix: req.apiKey.key_prefix, environment: req.apiKey.environment, endpoint: '/v1/insights/:niche', method: 'GET', niche, statusCode: 500, responseMs: ms, ip: req.ip, userAgent: req.get('user-agent') });
    res.status(500).json({ error: 'internal_error', message: 'Failed to generate insight report' });
  }
});

export default router;
