/**
 * Affinity Engine — cross-niche audience overlap analysis.
 *
 * Week 2: Returns mock affinity data so the dashboard has something to show.
 * Week 3: Replace with real overlap computation from engagement data.
 *
 * The core idea: if niche A and niche B share a high proportion of their
 * engaged viewers, brands targeting niche A should also consider niche B.
 */

import { runQuery } from './bigqueryHelpers.js';
import { logger } from './logger.js';

const NICHES = ['Trades', 'Mythology', 'Scouts', 'Neurodivergent', 'Stories'];

// Static descriptions for each niche (displayed in the UI)
const NICHE_DESCRIPTIONS = {
  Trades:       'Skilled trade workers & vocational training audiences',
  Mythology:    'African mythology, folklore & world culture enthusiasts',
  Scouts:       'Outdoor skills, scouting & wilderness adventure fans',
  Neurodivergent: 'Parents & caregivers of neurodivergent children (ADHD, autism)',
  Stories:      '1001 Nights & world storytelling audiences',
};

/**
 * Compute affinity scores for a given niche against all other niches.
 * Returns data in the shape the frontend AffinityInsights component expects.
 *
 * @param {string} niche
 * @returns {Promise<object[]>}  [{ category, description, engagement_pct, examples }]
 */
export async function computeAffinity(niche) {
  const otherNiches = NICHES.filter(n => n !== niche);

  // Week 2: Use mock scores with small random variation for realism
  // Week 3: Uncomment the real overlap calculation below
  const results = otherNiches.map(other => {
    const mockScore = getMockScore(niche, other);
    return {
      category: other,
      description: NICHE_DESCRIPTIONS[other],
      engagement_pct: mockScore,
      examples: getMockExamples(other),
    };
  });

  return results.sort((a, b) => b.engagement_pct - a.engagement_pct);
}

// ------------------------------------------------------------------
// WEEK 3: Real overlap computation
// Requires: a viewer_engagement table capturing which viewers watch which channels.
// YouTube Analytics API does not expose individual viewer IDs (by design).
// Real affinity requires:
//  - YouTube channel membership overlap (via Content Owner API — requires MCN/partnership)
//  - Or: proxy via comment-author overlap (limited)
//  - Or: third-party panel data (future)
//
// For now, overlap is approximated using relative engagement distributions
// across niches from the same time period.
// ------------------------------------------------------------------

/**
 * Compute overlap score between two niches using engagement pattern similarity.
 * This is a simplified Jaccard-like score based on aggregate metrics.
 *
 * @param {string} niche1
 * @param {string} niche2
 * @returns {Promise<number>}  0–100
 */
export async function computeRealOverlapScore(niche1, niche2) {
  try {
    const query = `
      WITH n1 AS (
        SELECT
          e.date,
          SUM(e.views) AS views,
          AVG(e.average_view_duration_seconds) AS avg_duration
        FROM \`${process.env.GCP_PROJECT_ID}.empirika.raw_youtube_engagement\` e
        JOIN \`${process.env.GCP_PROJECT_ID}.empirika.raw_youtube_channels\` c
          ON e.channel_id = c.channel_id
        WHERE c.niche_category = @niche1
          AND e.date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
        GROUP BY e.date
      ),
      n2 AS (
        SELECT
          e.date,
          SUM(e.views) AS views,
          AVG(e.average_view_duration_seconds) AS avg_duration
        FROM \`${process.env.GCP_PROJECT_ID}.empirika.raw_youtube_engagement\` e
        JOIN \`${process.env.GCP_PROJECT_ID}.empirika.raw_youtube_channels\` c
          ON e.channel_id = c.channel_id
        WHERE c.niche_category = @niche2
          AND e.date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
        GROUP BY e.date
      )
      SELECT
        CORR(n1.views, n2.views) AS view_correlation,
        CORR(n1.avg_duration, n2.avg_duration) AS duration_correlation
      FROM n1
      JOIN n2 ON n1.date = n2.date
    `;

    const rows = await runQuery(query, { niche1, niche2 });
    const row = rows[0];

    if (!row) return 0;

    // Convert correlation (-1 to 1) → percentage (0–100)
    const viewCorr = Math.max(0, Number(row.view_correlation) || 0);
    const durCorr = Math.max(0, Number(row.duration_correlation) || 0);
    const score = Math.round(((viewCorr + durCorr) / 2) * 100);

    return Math.min(score, 99); // Cap at 99% (100% would mean identical)
  } catch (err) {
    logger.error('Overlap computation failed', err, { niche1, niche2 });
    return getMockScore(niche1, niche2);
  }
}

// ------------------------------------------------------------------
// Mock data (Week 2 fallback)
// ------------------------------------------------------------------

const MOCK_SCORES = {
  Trades: { Mythology: 18, Scouts: 42, Neurodivergent: 24, Stories: 15 },
  Mythology: { Trades: 18, Scouts: 22, Neurodivergent: 20, Stories: 55 },
  Scouts: { Trades: 42, Mythology: 22, Neurodivergent: 31, Stories: 19 },
  Neurodivergent: { Trades: 24, Mythology: 20, Scouts: 31, Stories: 28 },
  Stories: { Mythology: 55, Neurodivergent: 28, Scouts: 19, Trades: 15 },
};

function getMockScore(niche1, niche2) {
  return MOCK_SCORES[niche1]?.[niche2] ?? 10;
}

function getMockExamples(niche) {
  const examples = {
    Trades: ['How to wire an outlet', 'HVAC certification tips', 'Plumbing 101'],
    Mythology: ['Anansi the Spider God', 'Zulu creation myths', 'African folklore explained'],
    Scouts: ['Building a survival shelter', 'Wilderness navigation', 'Camp cooking guide'],
    Neurodivergent: ['ADHD parenting strategies', 'Autism sensory tips', 'IEP guide for parents'],
    Stories: ['Scheherazade and the King', 'Ali Baba and the 40 thieves', 'Sinbad the Sailor'],
  };
  return examples[niche] || [];
}
