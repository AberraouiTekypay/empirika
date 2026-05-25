/**
 * AI-powered insight generation using Claude API.
 * Used by the backend batch pipeline to generate and cache insights.
 * The frontend also calls this via the /api/insights route.
 */

import Anthropic from '@anthropic-ai/sdk';
import { logger } from './logger.js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Generate an audience insight report for a niche.
 *
 * @param {string} niche
 * @param {object} metrics  - { totalViews, watchHours, avgDurationSeconds, newSubscribers }
 * @param {object[]} affinities  - [{ category, description, engagementPct }]
 * @returns {Promise<object>}  - { title, summary, keyBehaviors, marketingAngles, confidence }
 */
export async function generateAudienceInsight(niche, metrics, affinities) {
  const prompt = `You are a data analyst at a premium brand research firm. Your job is to produce concise, actionable audience intelligence reports for brand marketing teams.

AUDIENCE DATA — Niche: ${niche}
Period: Last 30 days

Core Metrics:
- Total Views: ${(metrics.totalViews || 0).toLocaleString()}
- Total Watch Hours: ${Math.round(metrics.watchHours || 0).toLocaleString()}
- Avg Watch Duration: ${Math.round((metrics.avgDurationSeconds || 0) / 60)} min ${(metrics.avgDurationSeconds || 0) % 60} sec
- New Subscribers: ${(metrics.newSubscribers || 0).toLocaleString()}

Cross-niche Affinities (what else this audience engages with):
${(affinities || []).map(a => `- ${a.category}: ${a.engagementPct}% overlap`).join('\n') || '- No affinity data available yet.'}

Generate a brand intelligence report with this exact JSON structure:
{
  "title": "<compelling report title, max 8 words>",
  "summary": "<2-3 sentence audience summary — who they are, what drives them>",
  "keyBehaviors": ["<behavior 1>", "<behavior 2>", "<behavior 3>"],
  "marketingAngles": ["<angle 1>", "<angle 2>"],
  "confidence": "high" | "medium" | "low"
}

Rules:
- Be specific, not generic. Use the numbers.
- keyBehaviors: observable patterns from the metrics (e.g. high watch time implies deep interest)
- marketingAngles: concrete ad/sponsorship angles for brands
- confidence: "high" if >10k views, "medium" if >1k, "low" otherwise
- Output ONLY valid JSON. No markdown, no explanation.`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '{}';
    const parsed = JSON.parse(text.trim());

    // Validate shape
    if (!parsed.title || !parsed.summary) {
      throw new Error('Invalid insight response shape');
    }

    return parsed;
  } catch (err) {
    logger.error('Insight generation failed', err, { niche });
    // Return a fallback so the dashboard doesn't break
    return {
      title: `${niche} Audience Overview`,
      summary: 'Insight generation is temporarily unavailable. Please check your ANTHROPIC_API_KEY and retry.',
      keyBehaviors: [],
      marketingAngles: [],
      confidence: 'low',
    };
  }
}

/**
 * Analyse sentiment of a short piece of text using Claude.
 * Used by the Reddit/TikTok monitoring pipeline.
 *
 * @param {string} text
 * @returns {Promise<{ label: string, score: number }>}
 */
export async function analyseSentiment(text) {
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 80,
      messages: [{
        role: 'user',
        content: `Rate the sentiment of this text. Reply ONLY with valid JSON: {"label":"positive"|"negative"|"neutral","score":0.0-1.0}\n\nText: "${text.slice(0, 500)}"`,
      }],
    });

    const text2 = response.content[0]?.type === 'text' ? response.content[0].text : '{}';
    return JSON.parse(text2.trim());
  } catch {
    return { label: 'neutral', score: 0.5 };
  }
}
