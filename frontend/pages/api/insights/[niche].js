/**
 * AI insight report generation via Claude API.
 * Fetches live metrics from BigQuery, then calls Claude for synthesis.
 *
 * GET /api/insights/[niche]
 */

import Anthropic from '@anthropic-ai/sdk';
import { fetchNicheSummary } from '../../../lib/bigqueryClient';

const VALID_NICHES = new Set(['Trades', 'Mythology', 'Scouts', 'Neurodivergent', 'Stories']);

// Mock affinity for the insight prompt (real data comes from /api/affinity in prod)
const MOCK_AFFINITIES = {
  Trades:         [{ category: 'Scouts', engagementPct: 42 }, { category: 'Neurodivergent', engagementPct: 24 }],
  Mythology:      [{ category: 'Stories', engagementPct: 55 }, { category: 'Scouts', engagementPct: 22 }],
  Scouts:         [{ category: 'Trades', engagementPct: 42 }, { category: 'Neurodivergent', engagementPct: 31 }],
  Neurodivergent: [{ category: 'Scouts', engagementPct: 31 }, { category: 'Stories', engagementPct: 28 }],
  Stories:        [{ category: 'Mythology', engagementPct: 55 }, { category: 'Neurodivergent', engagementPct: 28 }],
};

const FALLBACK_METRICS = { totalViews: 0, watchHours: 0, avgDurationSeconds: 0, newSubscribers: 0 };

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { niche } = req.query;

  if (!niche || !VALID_NICHES.has(niche)) {
    return res.status(400).json({ error: 'Invalid niche' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  try {
    // Fetch live metrics (falls back to zeros if BigQuery has no data yet)
    const metrics = await fetchNicheSummary(niche).catch(() => FALLBACK_METRICS);
    const affinities = MOCK_AFFINITIES[niche] || [];

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const prompt = `You are a data analyst at a premium brand research firm. Your job is to produce concise, actionable audience intelligence reports for brand marketing teams.

AUDIENCE DATA — Niche: ${niche}
Period: Last 30 days

Core Metrics:
- Total Views: ${Math.round(metrics.totalViews).toLocaleString()}
- Total Watch Hours: ${Math.round(metrics.watchHours).toLocaleString()}
- Avg Watch Duration: ${Math.round((metrics.avgDurationSeconds || 0) / 60)} min ${Math.round(metrics.avgDurationSeconds || 0) % 60} sec
- New Subscribers: ${Math.round(metrics.newSubscribers).toLocaleString()}

Cross-niche Affinities:
${affinities.map(a => `- ${a.category}: ${a.engagementPct}% engagement overlap`).join('\n')}

Generate a brand intelligence report as valid JSON (no markdown, no explanation):
{
  "title": "<compelling title, max 8 words>",
  "summary": "<2-3 sentences: who this audience is and what drives them>",
  "keyBehaviors": ["<specific behavior 1>", "<specific behavior 2>", "<specific behavior 3>"],
  "marketingAngles": ["<concrete ad/sponsorship angle 1>", "<angle 2>"],
  "confidence": "high" | "medium" | "low"
}

Confidence: high if total views > 10000, medium if > 1000, low otherwise.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text.trim() : '{}';
    const insight = JSON.parse(text);

    res.status(200).json(insight);
  } catch (err) {
    console.error('[api/insights]', err.message);

    // Return a graceful fallback so the UI doesn't break
    res.status(200).json({
      title: `${niche} Audience Intelligence`,
      summary: 'Connecting to data pipeline… Please ensure ANTHROPIC_API_KEY is set and BigQuery is populated.',
      keyBehaviors: ['Run node scripts/fetchAnalytics.js to populate data'],
      marketingAngles: ['Check backend setup in README.md'],
      confidence: 'low',
    });
  }
}
