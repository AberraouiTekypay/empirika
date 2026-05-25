/**
 * TikTok Research API integration (Week 3).
 *
 * Uses TikTok Research API to fetch trending hashtags and video data
 * for keywords related to each niche. Requires TikTok Developer account.
 *
 * Docs: https://developers.tiktok.com/products/research-api/
 */

import axios from 'axios';
import { insertRows } from './bigqueryHelpers.js';
import { logger } from './logger.js';
import { sleep } from './youtubeApi.js';

const TIKTOK_API_BASE = 'https://open.tiktokapis.com/v2';

/** Fetch trending hashtag data for a list of keywords. */
export async function fetchTikTokTrends(niche, keywords) {
  if (!process.env.TIKTOK_API_KEY) {
    logger.warn('TIKTOK_API_KEY not set — skipping TikTok trends', { niche });
    return;
  }

  const trends = [];
  const today = new Date().toISOString().split('T')[0];

  for (const keyword of keywords) {
    try {
      const response = await axios.get(`${TIKTOK_API_BASE}/research/hashtag/query/`, {
        headers: {
          Authorization: `Bearer ${process.env.TIKTOK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        params: { keyword, fields: 'id,name,video_count,view_count' },
      });

      const items = response.data?.data?.hashtag_list || [];
      trends.push(...items.map(item => ({
        niche,
        keyword,
        trend_name: item.name,
        hashtag: `#${item.name}`,
        video_count: parseInt(item.video_count || '0', 10),
        view_count: parseInt(item.view_count || '0', 10),
        date: today,
      })));

      await sleep(500); // Respect rate limits
    } catch (err) {
      logger.error('TikTok trend fetch failed', err, { niche, keyword });
    }
  }

  if (trends.length > 0) {
    await insertRows('tiktok_trends', trends);
    logger.info('TikTok trends saved', { niche, count: trends.length });
  }
}
