/**
 * Reddit API integration (Week 3).
 *
 * Uses snoowrap (PRAW-equivalent for Node.js) to monitor subreddits
 * for niche-relevant posts and analyse their sentiment via Claude.
 *
 * Setup: create a Reddit "script" app at https://www.reddit.com/prefs/apps
 */

import Snoowrap from 'snoowrap';
import { insertRows } from './bigqueryHelpers.js';
import { analyseSentiment } from './insightGenerator.js';
import { logger } from './logger.js';
import { sleep } from './youtubeApi.js';

let _reddit = null;

function getRedditClient() {
  if (_reddit) return _reddit;

  if (!process.env.REDDIT_CLIENT_ID) {
    throw new Error('Reddit API credentials not configured (REDDIT_CLIENT_ID missing)');
  }

  _reddit = new Snoowrap({
    userAgent: process.env.REDDIT_USER_AGENT || 'empirika-bot/1.0',
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD,
  });

  // For read-only access (recommended) use client credentials grant instead
  _reddit.config({ requestDelay: 1000, continueAfterRatelimitError: true });
  return _reddit;
}

/**
 * Monitor a list of subreddits for relevant posts and save sentiment scores.
 *
 * @param {string} niche
 * @param {string[]} subreddits   e.g. ['Welding', 'electricians']
 * @param {string[]} keywords     Keywords to filter relevant posts
 * @param {number}   [limit]      Posts per subreddit
 */
export async function monitorRedditSentiment(niche, subreddits, keywords, limit = 50) {
  if (!process.env.REDDIT_CLIENT_ID) {
    logger.warn('Reddit credentials not set — skipping Reddit monitoring', { niche });
    return;
  }

  const reddit = getRedditClient();
  const today = new Date().toISOString().split('T')[0];
  const rows = [];

  for (const subreddit of subreddits) {
    try {
      const posts = await reddit.getSubreddit(subreddit).getHot({ limit });

      for (const post of posts) {
        const text = `${post.title} ${post.selftext || ''}`.toLowerCase();
        const isRelevant = keywords.some(kw => text.includes(kw.toLowerCase()));
        if (!isRelevant) continue;

        const sentiment = await analyseSentiment(`${post.title}. ${post.selftext?.slice(0, 300) || ''}`);
        await sleep(200); // Throttle Claude calls

        rows.push({
          niche,
          subreddit,
          post_id: post.id,
          post_title: post.title.slice(0, 500),
          post_url: `https://reddit.com${post.permalink}`,
          sentiment_label: sentiment.label,
          sentiment_score: sentiment.score,
          upvotes: post.score || 0,
          num_comments: post.num_comments || 0,
          date: today,
        });
      }

      logger.info('Processed subreddit', { subreddit, relevant: rows.length });
      await sleep(1000); // Rate limit between subreddits
    } catch (err) {
      logger.error('Reddit fetch failed', err, { subreddit, niche });
    }
  }

  if (rows.length > 0) {
    await insertRows('reddit_sentiment', rows);
    logger.info('Reddit sentiment saved', { niche, count: rows.length });
  }
}
