/**
 * BigQuery client for Next.js API routes.
 * Runs server-side only — never exposed to the browser.
 */

import { BigQuery } from '@google-cloud/bigquery';

let _client = null;

export function getBigQueryClient() {
  if (!_client) {
    const opts = { projectId: process.env.GCP_PROJECT_ID };
    if (process.env.GCP_KEY_FILE) opts.keyFilename = process.env.GCP_KEY_FILE;
    _client = new BigQuery(opts);
  }
  return _client;
}

const DATASET = () => process.env.BIGQUERY_DATASET || 'empirika';
const LOCATION = () => process.env.BIGQUERY_LOCATION || 'US';

/**
 * Run a parameterised BigQuery query.
 *
 * @param {string} query
 * @param {object} [params]
 * @returns {Promise<object[]>}
 */
export async function runQuery(query, params = {}) {
  const bq = getBigQueryClient();
  const options = { query, location: LOCATION() };
  if (Object.keys(params).length > 0) options.params = params;
  const [rows] = await bq.query(options);
  return rows;
}

/** @param {string} niche */
export async function fetchNicheMetrics(niche) {
  const rows = await runQuery(
    `SELECT
       channel_id,
       channel_name,
       subscriber_count,
       total_views,
       total_watch_hours,
       avg_view_duration_seconds,
       total_subscribers_gained,
       total_likes,
       total_comments
     FROM \`${process.env.GCP_PROJECT_ID}.${DATASET()}.audiences_by_niche\`
     WHERE niche_category = @niche
     ORDER BY total_views DESC`,
    { niche },
  );
  return rows;
}

/** @param {string} niche  @returns {{ totalViews, watchHours, avgDurationSeconds, newSubscribers }} */
export async function fetchNicheSummary(niche) {
  const rows = await fetchNicheMetrics(niche);
  return {
    totalViews: rows.reduce((s, r) => s + Number(r.total_views || 0), 0),
    watchHours: rows.reduce((s, r) => s + Number(r.total_watch_hours || 0), 0),
    avgDurationSeconds: rows.length
      ? rows.reduce((s, r) => s + Number(r.avg_view_duration_seconds || 0), 0) / rows.length
      : 0,
    newSubscribers: rows.reduce((s, r) => s + Number(r.total_subscribers_gained || 0), 0),
  };
}

/** @param {string} niche  @returns {object[]}  Daily sentiment summary */
export async function fetchNicheSentiment(niche) {
  try {
    return await runQuery(
      `SELECT
         sentiment_label,
         COUNT(*) AS count,
         AVG(sentiment_score) AS avg_score,
         AVG(upvotes) AS avg_upvotes
       FROM \`${process.env.GCP_PROJECT_ID}.${DATASET()}.reddit_sentiment\`
       WHERE niche = @niche
         AND date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
       GROUP BY sentiment_label
       ORDER BY count DESC`,
      { niche },
    );
  } catch {
    return []; // No data yet (Week 3)
  }
}

/** @param {string} niche  @returns {object[]}  Top keywords by mention */
export async function fetchNicheKeywords(niche) {
  try {
    return await runQuery(
      `SELECT
         post_title,
         sentiment_label,
         upvotes,
         subreddit,
         date
       FROM \`${process.env.GCP_PROJECT_ID}.${DATASET()}.reddit_sentiment\`
       WHERE niche = @niche
         AND date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
       ORDER BY upvotes DESC
       LIMIT 20`,
      { niche },
    );
  } catch {
    return [];
  }
}
