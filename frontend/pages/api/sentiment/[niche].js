/**
 * Sentiment & keyword data for the Sentiment/Trends dashboard tab.
 *
 * Week 2: returns mock sentiment scores.
 * Week 3: pulls from reddit_sentiment BigQuery table.
 */

import { fetchNicheSentiment, fetchNicheKeywords } from '../../../lib/bigqueryClient';

const VALID_NICHES = new Set(['Trades', 'Mythology', 'Scouts', 'Neurodivergent', 'Stories']);

// Mock data used when BigQuery table is empty (Week 2)
const MOCK_SENTIMENT = {
  Trades:         { score: 72, label: 'Positive', summary: 'Strong community pride around skilled trades. Career positivity is rising.' },
  Mythology:      { score: 68, label: 'Positive', summary: 'High engagement around cultural storytelling. Growing curiosity about African heritage.' },
  Scouts:         { score: 78, label: 'Positive', summary: 'Very strong positive sentiment. Outdoor experiences driving enthusiasm.' },
  Neurodivergent: { score: 61, label: 'Neutral',  summary: 'Mixed sentiment — parenting challenges balanced by community support.' },
  Stories:        { score: 81, label: 'Positive', summary: 'Extremely positive. Audiences love the storytelling format and escapism.' },
};

const MOCK_KEYWORDS = {
  Trades:         [{ keyword: 'apprenticeship', mentions: 142 }, { keyword: 'tradie life', mentions: 98 }, { keyword: 'blue collar', mentions: 87 }, { keyword: 'trade school', mentions: 73 }, { keyword: 'electrician', mentions: 65 }],
  Mythology:      [{ keyword: 'anansi', mentions: 201 }, { keyword: 'yoruba gods', mentions: 167 }, { keyword: 'african folklore', mentions: 134 }, { keyword: 'griots', mentions: 89 }, { keyword: 'orisha', mentions: 76 }],
  Scouts:         [{ keyword: 'survival skills', mentions: 189 }, { keyword: 'camping tips', mentions: 156 }, { keyword: 'knot tying', mentions: 112 }, { keyword: 'scout badge', mentions: 94 }, { keyword: 'bushcraft', mentions: 87 }],
  Neurodivergent: [{ keyword: 'adhd parenting', mentions: 234 }, { keyword: 'autism support', mentions: 198 }, { keyword: 'iep tips', mentions: 143 }, { keyword: 'sensory processing', mentions: 121 }, { keyword: 'neurodiversity', mentions: 108 }],
  Stories:        [{ keyword: '1001 nights', mentions: 312 }, { keyword: 'scheherazade', mentions: 267 }, { keyword: 'sinbad', mentions: 189 }, { keyword: 'arabian nights', mentions: 176 }, { keyword: 'ali baba', mentions: 145 }],
};

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { niche } = req.query;

  if (!niche || !VALID_NICHES.has(niche)) {
    return res.status(400).json({ error: 'Invalid niche' });
  }

  try {
    // Try to fetch real data; fall back to mock
    const [sentimentRows, keywordRows] = await Promise.all([
      fetchNicheSentiment(niche).catch(() => []),
      fetchNicheKeywords(niche).catch(() => []),
    ]);

    let sentimentData;
    let keywords;

    if (sentimentRows.length > 0) {
      // Build score from real data
      const positiveCount = sentimentRows.find(r => r.sentiment_label === 'positive')?.count || 0;
      const total = sentimentRows.reduce((s, r) => s + Number(r.count || 0), 0);
      const score = total > 0 ? Math.round((Number(positiveCount) / total) * 100) : 50;

      sentimentData = {
        score,
        label: score > 65 ? 'Positive' : score > 45 ? 'Neutral' : 'Negative',
        summary: `Based on ${total} Reddit posts in the last 30 days.`,
      };

      keywords = keywordRows.slice(0, 10).map(r => ({
        keyword: r.post_title?.split(' ').slice(0, 3).join(' ') || 'unknown',
        mentions: Number(r.upvotes) || 0,
      }));
    } else {
      // Use mock data
      sentimentData = MOCK_SENTIMENT[niche];
      keywords = MOCK_KEYWORDS[niche];
    }

    res.status(200).json({ sentiment: sentimentData, keywords });
  } catch (err) {
    console.error('[api/sentiment]', err.message);
    res.status(500).json({ error: 'Failed to fetch sentiment data' });
  }
}
