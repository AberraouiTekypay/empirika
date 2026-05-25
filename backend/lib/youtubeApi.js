/**
 * YouTube API wrapper.
 *
 * Handles OAuth2 authentication, token persistence, and data fetching
 * from both YouTube Data API v3 and YouTube Analytics API v2.
 *
 * First-time setup:
 *   node scripts/setupAuth.js
 * This opens a browser for OAuth consent and saves tokens to
 *   credentials/tokens.json  (git-ignored)
 */

import { google } from 'googleapis';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { logger } from './logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CREDENTIALS_DIR = join(__dirname, '..', 'credentials');
const TOKENS_PATH = join(CREDENTIALS_DIR, 'tokens.json');

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
];

// ------------------------------------------------------------------
// Token persistence helpers
// ------------------------------------------------------------------

function loadAllTokens() {
  if (!existsSync(TOKENS_PATH)) return {};
  return JSON.parse(readFileSync(TOKENS_PATH, 'utf8'));
}

function saveTokens(accountKey, tokens) {
  if (!existsSync(CREDENTIALS_DIR)) mkdirSync(CREDENTIALS_DIR, { recursive: true });
  const all = loadAllTokens();
  all[accountKey] = tokens;
  writeFileSync(TOKENS_PATH, JSON.stringify(all, null, 2));
}

// ------------------------------------------------------------------
// OAuth2 client factory
// ------------------------------------------------------------------

function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:5000/auth/callback',
  );
}

/**
 * Generate the Google OAuth consent URL.
 * Direct the channel owner to this URL.
 *
 * @param {string} [accountKey]  Identifier stored in state param (e.g. email).
 * @returns {string}
 */
export function getAuthUrl(accountKey = 'default') {
  const client = createOAuth2Client();
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
    state: accountKey,
  });
}

/**
 * Exchange an auth code for tokens and persist them.
 *
 * @param {string} code
 * @param {string} [accountKey]
 * @returns {Promise<object>}  The token object.
 */
export async function exchangeCode(code, accountKey = 'default') {
  const client = createOAuth2Client();
  const { tokens } = await client.getToken(code);
  saveTokens(accountKey, tokens);
  logger.info('Saved OAuth tokens', { accountKey });
  return tokens;
}

// ------------------------------------------------------------------
// Authenticated API clients
// ------------------------------------------------------------------

/**
 * Returns an authenticated OAuth2 client for the given account.
 * Automatically refreshes tokens if needed and persists the new ones.
 *
 * @param {string} [accountKey]
 */
async function getAuthClient(accountKey = 'default') {
  const all = loadAllTokens();
  const tokens = all[accountKey];

  if (!tokens) {
    throw new Error(
      `No OAuth tokens for account "${accountKey}". Run: node scripts/setupAuth.js`,
    );
  }

  const client = createOAuth2Client();
  client.setCredentials(tokens);

  // Auto-save refreshed tokens
  client.on('tokens', (newTokens) => {
    saveTokens(accountKey, { ...tokens, ...newTokens });
    logger.info('OAuth tokens auto-refreshed', { accountKey });
  });

  return client;
}

// ------------------------------------------------------------------
// YouTube Data API v3
// ------------------------------------------------------------------

/**
 * Fetch channel metadata (snippet, statistics, contentDetails).
 *
 * @param {string} channelId
 * @param {string} [accountKey]
 * @returns {Promise<object>}
 */
export async function fetchChannelMetadata(channelId, accountKey = 'default') {
  const auth = await getAuthClient(accountKey);
  const youtube = google.youtube({ version: 'v3', auth });

  const resp = await youtube.channels.list({
    part: ['snippet', 'statistics', 'contentDetails'],
    id: [channelId],
  });

  const ch = resp.data.items?.[0];
  if (!ch) throw new Error(`Channel not found: ${channelId}`);

  return {
    channel_id: channelId,
    channel_name: ch.snippet.title,
    description: ch.snippet.description?.slice(0, 1000) || '',
    subscriber_count: parseInt(ch.statistics.subscriberCount || '0', 10),
    video_count: parseInt(ch.statistics.videoCount || '0', 10),
    view_count: parseInt(ch.statistics.viewCount || '0', 10),
    thumbnail_url: ch.snippet.thumbnails?.default?.url || '',
    upload_playlist_id: ch.contentDetails?.relatedPlaylists?.uploads || null,
    created_date: ch.snippet.publishedAt?.split('T')[0] || null,
  };
}

/**
 * Fetch video list for a channel (via uploads playlist).
 * Batches video detail calls in groups of 50.
 *
 * @param {string} channelId
 * @param {string} uploadPlaylistId
 * @param {string} [accountKey]
 * @param {number} [maxVideos]
 * @returns {Promise<object[]>}
 */
export async function fetchVideoList(channelId, uploadPlaylistId, accountKey = 'default', maxVideos = 200) {
  const auth = await getAuthClient(accountKey);
  const youtube = google.youtube({ version: 'v3', auth });

  // Step 1: Collect playlist item IDs (paginated)
  const videoIds = [];
  let pageToken = undefined;

  do {
    const resp = await youtube.playlistItems.list({
      part: ['contentDetails'],
      playlistId: uploadPlaylistId,
      maxResults: 50,
      pageToken,
    });
    videoIds.push(...(resp.data.items || []).map(i => i.contentDetails.videoId));
    pageToken = resp.data.nextPageToken;
    if (videoIds.length >= maxVideos) break;
  } while (pageToken);

  // Step 2: Fetch full video details in batches of 50
  const videos = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const resp = await youtube.videos.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      id: batch,
    });
    videos.push(...(resp.data.items || []));
  }

  return videos.map(v => ({
    video_id: v.id,
    channel_id: channelId,
    title: v.snippet.title,
    description: v.snippet.description?.slice(0, 500) || '',
    published_at: v.snippet.publishedAt,
    duration_seconds: parseDuration(v.contentDetails?.duration),
    thumbnail_url: v.snippet.thumbnails?.default?.url || '',
    tags: v.snippet.tags || [],
    category_id: v.snippet.categoryId || '',
  }));
}

// ------------------------------------------------------------------
// YouTube Analytics API v2
// ------------------------------------------------------------------

/**
 * Fetch daily engagement metrics for a channel over a date range.
 *
 * @param {string} channelId
 * @param {string} startDate  YYYY-MM-DD
 * @param {string} endDate    YYYY-MM-DD
 * @param {string} [accountKey]
 * @returns {Promise<object[]>}
 */
export async function fetchChannelAnalytics(channelId, startDate, endDate, accountKey = 'default') {
  const auth = await getAuthClient(accountKey);
  const youtubeAnalytics = google.youtubeAnalytics({ version: 'v2', auth });

  const resp = await youtubeAnalytics.reports.query({
    ids: 'channel==MINE',
    startDate,
    endDate,
    metrics: [
      'views',
      'estimatedMinutesWatched',
      'averageViewDuration',
      'likes',
      'comments',
      'shares',
      'subscribersGained',
      'subscribersLost',
    ].join(','),
    dimensions: 'day',
    sort: 'day',
  });

  const headers = (resp.data.columnHeaders || []).map(h => h.name);
  const rows = resp.data.rows || [];

  return rows.map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });

    return {
      channel_id: channelId,
      date: obj.day,
      views: Math.round(Number(obj.views) || 0),
      watch_time_hours: (Number(obj.estimatedMinutesWatched) || 0) / 60,
      average_view_duration_seconds: Math.round(Number(obj.averageViewDuration) || 0),
      likes: Math.round(Number(obj.likes) || 0),
      comments: Math.round(Number(obj.comments) || 0),
      shares: Math.round(Number(obj.shares) || 0),
      subscribers_gained: Math.round(Number(obj.subscribersGained) || 0),
      unsubscribes: Math.round(Number(obj.subscribersLost) || 0),
    };
  });
}

/**
 * Fetch audience demographics (age/gender breakdown) for a date range.
 *
 * @param {string} channelId
 * @param {string} startDate
 * @param {string} endDate
 * @param {string} [accountKey]
 * @returns {Promise<object[]>}
 */
export async function fetchDemographics(channelId, startDate, endDate, accountKey = 'default') {
  const auth = await getAuthClient(accountKey);
  const youtubeAnalytics = google.youtubeAnalytics({ version: 'v2', auth });

  try {
    const resp = await youtubeAnalytics.reports.query({
      ids: 'channel==MINE',
      startDate,
      endDate,
      metrics: 'viewerPercentage',
      dimensions: 'ageGroup,gender',
    });

    const headers = (resp.data.columnHeaders || []).map(h => h.name);
    const rows = resp.data.rows || [];

    return rows.map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });

      return {
        channel_id: channelId,
        date: endDate,
        age_group: obj.ageGroup,
        gender: obj.gender,
        viewer_percentage: Number(obj.viewerPercentage) || 0,
      };
    });
  } catch (err) {
    // Demographics may not be available for small channels
    logger.warn('Demographics not available', { channelId, error: err.message });
    return [];
  }
}

// ------------------------------------------------------------------
// Utility
// ------------------------------------------------------------------

/** Parse ISO 8601 duration string (PT1H2M3S) → seconds. */
function parseDuration(duration) {
  if (!duration) return 0;
  const m = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] || '0') * 3600)
    + (parseInt(m[2] || '0') * 60)
    + parseInt(m[3] || '0');
}

/** Sleep helper for rate-limit backoff. */
export function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

/**
 * Retry a function up to maxAttempts with exponential backoff.
 *
 * @param {Function} fn
 * @param {number} [maxAttempts]
 * @returns {Promise<any>}
 */
export async function withRetry(fn, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      const delay = 1000 * Math.pow(2, attempt);
      logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`, { error: err.message });
      await sleep(delay);
    }
  }
}
