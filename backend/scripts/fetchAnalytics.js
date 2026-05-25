/**
 * Daily analytics fetch pipeline.
 *
 * Fetches YouTube channel metadata, video lists, and engagement data
 * for all configured channels and writes them to BigQuery.
 *
 * Usage:
 *   node scripts/fetchAnalytics.js           # default: last 7 days
 *   node scripts/fetchAnalytics.js --days 30 # last 30 days (backfill)
 *   node scripts/fetchAnalytics.js --days 1  # yesterday only (scheduled)
 *
 * Schedule via Cloud Scheduler:
 *   0 2 * * *   (runs at 02:00 UTC daily)
 */

import 'dotenv/config';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  fetchChannelMetadata,
  fetchVideoList,
  fetchChannelAnalytics,
  fetchDemographics,
  withRetry,
} from '../lib/youtubeApi.js';
import {
  ensureDataset,
  upsertChannel,
  insertRows,
  deleteEngagementRange,
} from '../lib/bigqueryHelpers.js';
import { logger } from '../lib/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const channelsConfig = JSON.parse(
  readFileSync(join(__dirname, '..', 'config', 'channels.json'), 'utf8'),
);

// Parse --days argument (default 7)
const daysArg = process.argv.indexOf('--days');
const DAYS_BACK = daysArg !== -1 ? parseInt(process.argv[daysArg + 1]) : 7;

function getDateRange(daysBack) {
  const end = new Date();
  end.setDate(end.getDate() - 1); // Yesterday (today's data is incomplete)
  const start = new Date(end);
  start.setDate(start.getDate() - (daysBack - 1));

  const fmt = d => d.toISOString().split('T')[0];
  return { startDate: fmt(start), endDate: fmt(end) };
}

/**
 * Process a single channel: fetch metadata + analytics + videos.
 *
 * @param {object} channelConfig
 * @param {string} startDate
 * @param {string} endDate
 */
async function processChannel(channelConfig, startDate, endDate) {
  const { channelId, channelName, niche, accountKey = 'default' } = channelConfig;

  logger.info('Processing channel', { channelName, niche, channelId, startDate, endDate });

  // 1. Channel metadata
  try {
    const metadata = await withRetry(() => fetchChannelMetadata(channelId, accountKey));
    await upsertChannel({ ...metadata, niche_category: niche });
    logger.info('Channel metadata updated', { channelName });
  } catch (err) {
    logger.error('Failed to fetch channel metadata', err, { channelName, channelId });
    // Don't abort — still try to get analytics
  }

  // 2. Engagement analytics (delete range then re-insert to prevent dupes)
  try {
    await deleteEngagementRange('raw_youtube_engagement', channelId, startDate, endDate);
    const engagement = await withRetry(() =>
      fetchChannelAnalytics(channelId, startDate, endDate, accountKey),
    );
    if (engagement.length > 0) {
      await insertRows('raw_youtube_engagement', engagement);
    }
    logger.info('Engagement data saved', { channelName, rows: engagement.length });
  } catch (err) {
    logger.error('Failed to fetch engagement analytics', err, { channelName, channelId });
  }

  // 3. Demographics (best-effort)
  try {
    const demographics = await withRetry(() =>
      fetchDemographics(channelId, startDate, endDate, accountKey),
    );
    if (demographics.length > 0) {
      await insertRows('raw_youtube_demographics', demographics);
    }
  } catch (err) {
    logger.warn('Demographics unavailable', { channelName, error: err.message });
  }
}

/**
 * Update video list for a channel (weekly cadence recommended).
 *
 * @param {object} channelConfig
 * @param {string} uploadPlaylistId
 */
async function processVideos(channelConfig, uploadPlaylistId) {
  const { channelId, channelName, accountKey = 'default' } = channelConfig;

  if (!uploadPlaylistId) {
    logger.warn('No upload playlist ID — skipping video fetch', { channelName });
    return;
  }

  try {
    const videos = await withRetry(() =>
      fetchVideoList(channelId, uploadPlaylistId, accountKey, 500),
    );
    if (videos.length > 0) {
      await insertRows('raw_youtube_videos', videos);
    }
    logger.info('Videos updated', { channelName, count: videos.length });
  } catch (err) {
    logger.error('Failed to fetch video list', err, { channelName });
  }
}

async function main() {
  const { startDate, endDate } = getDateRange(DAYS_BACK);

  logger.info('Starting analytics fetch', {
    startDate,
    endDate,
    channelCount: channelsConfig.channels.length,
  });

  // Ensure BigQuery dataset exists
  await ensureDataset();

  const results = { success: [], failed: [] };

  for (const channel of channelsConfig.channels) {
    // Skip placeholder entries
    if (channel.channelId.startsWith('REPLACE_WITH')) {
      logger.warn('Skipping placeholder channel — update config/channels.json', {
        channelName: channel.channelName,
      });
      continue;
    }

    try {
      await processChannel(channel, startDate, endDate);
      results.success.push(channel.channelName);
    } catch (err) {
      logger.error('Channel processing failed', err, { channelName: channel.channelName });
      results.failed.push(channel.channelName);
    }
  }

  logger.info('Fetch complete', {
    success: results.success.length,
    failed: results.failed.length,
    successChannels: results.success,
    failedChannels: results.failed,
  });

  if (results.failed.length > 0) {
    process.exitCode = 1;
  }
}

main().catch(err => {
  logger.error('Fatal error in fetchAnalytics', err);
  process.exit(1);
});
