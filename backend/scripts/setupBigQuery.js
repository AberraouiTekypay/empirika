/**
 * BigQuery schema initialisation script.
 *
 * Run once before first data ingestion:
 *   node scripts/setupBigQuery.js
 *
 * Creates the dataset and all tables if they don't already exist.
 * Safe to re-run — existing tables are not modified.
 */

import 'dotenv/config';
import { BigQuery } from '@google-cloud/bigquery';
import { logger } from '../lib/logger.js';

const PROJECT = process.env.GCP_PROJECT_ID;
const DATASET = process.env.BIGQUERY_DATASET || 'empirika';
const LOCATION = process.env.BIGQUERY_LOCATION || 'US';

const TABLE_SCHEMAS = {
  raw_youtube_channels: {
    description: 'YouTube channel metadata',
    fields: [
      { name: 'channel_id',          type: 'STRING',    mode: 'REQUIRED' },
      { name: 'channel_name',        type: 'STRING',    mode: 'NULLABLE' },
      { name: 'niche_category',      type: 'STRING',    mode: 'NULLABLE' },
      { name: 'description',         type: 'STRING',    mode: 'NULLABLE' },
      { name: 'subscriber_count',    type: 'INTEGER',   mode: 'NULLABLE' },
      { name: 'video_count',         type: 'INTEGER',   mode: 'NULLABLE' },
      { name: 'view_count',          type: 'INTEGER',   mode: 'NULLABLE' },
      { name: 'thumbnail_url',       type: 'STRING',    mode: 'NULLABLE' },
      { name: 'upload_playlist_id',  type: 'STRING',    mode: 'NULLABLE' },
      { name: 'created_date',        type: 'DATE',      mode: 'NULLABLE' },
      { name: 'last_updated',        type: 'TIMESTAMP', mode: 'NULLABLE' },
    ],
  },

  raw_youtube_videos: {
    description: 'YouTube video metadata',
    fields: [
      { name: 'video_id',          type: 'STRING',    mode: 'REQUIRED' },
      { name: 'channel_id',        type: 'STRING',    mode: 'REQUIRED' },
      { name: 'title',             type: 'STRING',    mode: 'NULLABLE' },
      { name: 'description',       type: 'STRING',    mode: 'NULLABLE' },
      { name: 'published_at',      type: 'TIMESTAMP', mode: 'NULLABLE' },
      { name: 'duration_seconds',  type: 'INTEGER',   mode: 'NULLABLE' },
      { name: 'thumbnail_url',     type: 'STRING',    mode: 'NULLABLE' },
      { name: 'tags',              type: 'STRING',    mode: 'REPEATED' },
      { name: 'category_id',       type: 'STRING',    mode: 'NULLABLE' },
    ],
    timePartitioning: { type: 'DAY', field: 'published_at' },
  },

  raw_youtube_engagement: {
    description: 'Daily YouTube channel engagement metrics',
    fields: [
      { name: 'channel_id',                    type: 'STRING',  mode: 'REQUIRED' },
      { name: 'date',                          type: 'DATE',    mode: 'REQUIRED' },
      { name: 'views',                         type: 'INTEGER', mode: 'NULLABLE' },
      { name: 'watch_time_hours',              type: 'FLOAT',   mode: 'NULLABLE' },
      { name: 'average_view_duration_seconds', type: 'INTEGER', mode: 'NULLABLE' },
      { name: 'likes',                         type: 'INTEGER', mode: 'NULLABLE' },
      { name: 'comments',                      type: 'INTEGER', mode: 'NULLABLE' },
      { name: 'shares',                        type: 'INTEGER', mode: 'NULLABLE' },
      { name: 'subscribers_gained',            type: 'INTEGER', mode: 'NULLABLE' },
      { name: 'unsubscribes',                  type: 'INTEGER', mode: 'NULLABLE' },
    ],
    timePartitioning: { type: 'DAY', field: 'date' },
  },

  raw_youtube_demographics: {
    description: 'YouTube audience demographics',
    fields: [
      { name: 'channel_id',         type: 'STRING',  mode: 'REQUIRED' },
      { name: 'date',               type: 'DATE',    mode: 'REQUIRED' },
      { name: 'age_group',          type: 'STRING',  mode: 'NULLABLE' },
      { name: 'gender',             type: 'STRING',  mode: 'NULLABLE' },
      { name: 'viewer_percentage',  type: 'FLOAT',   mode: 'NULLABLE' },
    ],
    timePartitioning: { type: 'DAY', field: 'date' },
  },

  tiktok_trends: {
    description: 'TikTok trending hashtags per niche',
    fields: [
      { name: 'niche',        type: 'STRING',  mode: 'NULLABLE' },
      { name: 'keyword',      type: 'STRING',  mode: 'NULLABLE' },
      { name: 'trend_name',   type: 'STRING',  mode: 'NULLABLE' },
      { name: 'hashtag',      type: 'STRING',  mode: 'NULLABLE' },
      { name: 'video_count',  type: 'INTEGER', mode: 'NULLABLE' },
      { name: 'view_count',   type: 'INTEGER', mode: 'NULLABLE' },
      { name: 'date',         type: 'DATE',    mode: 'NULLABLE' },
    ],
    timePartitioning: { type: 'DAY', field: 'date' },
  },

  reddit_sentiment: {
    description: 'Reddit post sentiment analysis per niche',
    fields: [
      { name: 'niche',             type: 'STRING',  mode: 'NULLABLE' },
      { name: 'subreddit',         type: 'STRING',  mode: 'NULLABLE' },
      { name: 'post_id',           type: 'STRING',  mode: 'NULLABLE' },
      { name: 'post_title',        type: 'STRING',  mode: 'NULLABLE' },
      { name: 'post_url',          type: 'STRING',  mode: 'NULLABLE' },
      { name: 'sentiment_label',   type: 'STRING',  mode: 'NULLABLE' },
      { name: 'sentiment_score',   type: 'FLOAT',   mode: 'NULLABLE' },
      { name: 'upvotes',           type: 'INTEGER', mode: 'NULLABLE' },
      { name: 'num_comments',      type: 'INTEGER', mode: 'NULLABLE' },
      { name: 'date',              type: 'DATE',    mode: 'NULLABLE' },
    ],
    timePartitioning: { type: 'DAY', field: 'date' },
  },
};

async function main() {
  if (!PROJECT) {
    console.error('ERROR: GCP_PROJECT_ID is not set in .env');
    process.exit(1);
  }

  const opts = { projectId: PROJECT };
  if (process.env.GCP_KEY_FILE) opts.keyFilename = process.env.GCP_KEY_FILE;
  const bq = new BigQuery(opts);

  // 1. Ensure dataset exists
  const dataset = bq.dataset(DATASET);
  const [dsExists] = await dataset.exists();
  if (!dsExists) {
    await bq.createDataset(DATASET, { location: LOCATION });
    logger.info('Created dataset', { dataset: DATASET });
  } else {
    logger.info('Dataset already exists', { dataset: DATASET });
  }

  // 2. Create tables
  for (const [tableName, config] of Object.entries(TABLE_SCHEMAS)) {
    const table = dataset.table(tableName);
    const [exists] = await table.exists();

    if (exists) {
      logger.info(`Table already exists — skipping`, { table: tableName });
      continue;
    }

    const tableOptions = {
      schema: { fields: config.fields },
      description: config.description,
    };
    if (config.timePartitioning) {
      tableOptions.timePartitioning = config.timePartitioning;
    }

    await dataset.createTable(tableName, tableOptions);
    logger.info('Created table', { table: tableName });
  }

  console.log('\n✅ BigQuery setup complete.');
  console.log(`   Project:  ${PROJECT}`);
  console.log(`   Dataset:  ${DATASET}`);
  console.log(`   Tables:   ${Object.keys(TABLE_SCHEMAS).join(', ')}\n`);
  console.log('Next step: node scripts/setupAuth.js  (to authorise YouTube channels)');
}

main().catch(err => {
  logger.error('Setup failed', err);
  process.exit(1);
});
