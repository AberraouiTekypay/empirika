/**
 * Sandbox data engine.
 *
 * Returns rich, deterministic mock data for all niches and endpoints.
 * Responses are seeded so they look consistent across calls.
 * All sandbox responses include "mode": "sandbox".
 */

const NICHES = ['Trades', 'Mythology', 'Scouts', 'Neurodivergent', 'Stories'];

// ── Audience data ─────────────────────────────────────────────────

const AUDIENCE_DATA = {
  Trades: [
    { channel_id: 'UCsandbox_trades_1', channel_name: 'Path2Pro Trades',       subscriber_count: 184200, total_views: 2_840_000, total_watch_hours: 94667, avg_view_duration_seconds: 721, total_subscribers_gained: 3410, total_likes: 87400, total_comments: 12300 },
    { channel_id: 'UCsandbox_trades_2', channel_name: 'Trades Career Academy',  subscriber_count: 97600,  total_views: 1_210_000, total_watch_hours: 40333, avg_view_duration_seconds: 648, total_subscribers_gained: 1890, total_likes: 41200, total_comments:  5800 },
  ],
  Mythology: [
    { channel_id: 'UCsandbox_myth_1',   channel_name: 'African Mythology',      subscriber_count: 312000, total_views: 4_180_000, total_watch_hours: 139333, avg_view_duration_seconds: 892, total_subscribers_gained: 6720, total_likes: 198000, total_comments: 34100 },
    { channel_id: 'UCsandbox_myth_2',   channel_name: 'Yoruba Gods Explained',  subscriber_count: 128400, total_views: 1_640_000, total_watch_hours:  54667, avg_view_duration_seconds: 756, total_subscribers_gained: 2310, total_likes:  71200, total_comments: 11400 },
  ],
  Scouts: [
    { channel_id: 'UCsandbox_scout_1',  channel_name: 'Scouting Skills HQ',     subscriber_count: 241000, total_views: 3_620_000, total_watch_hours: 120667, avg_view_duration_seconds: 812, total_subscribers_gained: 4890, total_likes: 143000, total_comments: 21800 },
  ],
  Neurodivergent: [
    { channel_id: 'UCsandbox_nd_1',     channel_name: 'Neurodivergent Parenting', subscriber_count: 89400, total_views: 1_380_000, total_watch_hours: 46000,  avg_view_duration_seconds: 914, total_subscribers_gained: 2140, total_likes:  62400, total_comments: 18700 },
  ],
  Stories: [
    { channel_id: 'UCsandbox_stor_1',   channel_name: '1001 Nights Stories',    subscriber_count: 421000, total_views: 6_140_000, total_watch_hours: 204667, avg_view_duration_seconds: 1024, total_subscribers_gained: 9810, total_likes: 287000, total_comments: 48200 },
    { channel_id: 'UCsandbox_stor_2',   channel_name: '1001 Nights Animated',   subscriber_count: 218000, total_views: 2_910_000, total_watch_hours:  97000, avg_view_duration_seconds:  943, total_subscribers_gained: 4120, total_likes: 134000, total_comments: 22400 },
    { channel_id: 'UCsandbox_stor_3',   channel_name: '1001 Nights Podcast',    subscriber_count:  74200, total_views:   840_000, total_watch_hours:  28000, avg_view_duration_seconds: 1842, total_subscribers_gained: 1240, total_likes:  29800, total_comments:  6100 },
  ],
};

// ── Affinity data ─────────────────────────────────────────────────

const AFFINITY_DATA = {
  Trades: [
    { category: 'Scouts',         description: 'Outdoor skills & wilderness adventure fans',    engagement_pct: 42, examples: ['Wilderness survival', 'Knot tying', 'Outdoor tools'] },
    { category: 'Neurodivergent', description: 'Parents of neurodivergent children',            engagement_pct: 24, examples: ['ADHD in trades', 'Focus strategies'] },
    { category: 'Mythology',      description: 'World culture & heritage enthusiasts',          engagement_pct: 18, examples: ['Craftsmen in history', 'Trade guilds'] },
    { category: 'Stories',        description: 'Storytelling & oral tradition audiences',       engagement_pct: 15, examples: ['Working-class heroes', 'Origin stories'] },
  ],
  Mythology: [
    { category: 'Stories',        description: 'Storytelling & oral tradition audiences',       engagement_pct: 55, examples: ['Arabian nights', 'African folklore', 'Oral traditions'] },
    { category: 'Scouts',         description: 'Outdoor skills & wilderness adventure fans',    engagement_pct: 22, examples: ['Nature spirits', 'Survival mythology'] },
    { category: 'Neurodivergent', description: 'Parents of neurodivergent children',            engagement_pct: 20, examples: ['Mythology therapy', 'Narrative identity'] },
    { category: 'Trades',         description: 'Vocational training audiences',                 engagement_pct: 18, examples: ['Smithing legends', 'Craftsmen myths'] },
  ],
  Scouts: [
    { category: 'Trades',         description: 'Vocational training audiences',                 engagement_pct: 42, examples: ['Tool usage', 'Construction skills'] },
    { category: 'Neurodivergent', description: 'Parents of neurodivergent children',            engagement_pct: 31, examples: ['Outdoor therapy', 'ADHD and nature'] },
    { category: 'Mythology',      description: 'World culture & heritage enthusiasts',          engagement_pct: 22, examples: ['Native traditions', 'Wilderness folklore'] },
    { category: 'Stories',        description: 'Storytelling & oral tradition audiences',       engagement_pct: 19, examples: ['Campfire stories', 'Adventure tales'] },
  ],
  Neurodivergent: [
    { category: 'Scouts',         description: 'Outdoor skills & wilderness adventure fans',    engagement_pct: 31, examples: ['Nature therapy', 'Outdoor routines'] },
    { category: 'Stories',        description: 'Storytelling & oral tradition audiences',       engagement_pct: 28, examples: ['Sensory-friendly content', 'Bedtime routines'] },
    { category: 'Trades',         description: 'Vocational training audiences',                 engagement_pct: 24, examples: ['Trades as career paths', 'Structured learning'] },
    { category: 'Mythology',      description: 'World culture & heritage enthusiasts',          engagement_pct: 20, examples: ['Cultural identity', 'Narrative therapy'] },
  ],
  Stories: [
    { category: 'Mythology',      description: 'World culture & heritage enthusiasts',          engagement_pct: 55, examples: ['African mythology', 'Yoruba gods', 'Griots'] },
    { category: 'Neurodivergent', description: 'Parents of neurodivergent children',            engagement_pct: 28, examples: ['Bedtime routines', 'Soothing narratives'] },
    { category: 'Scouts',         description: 'Outdoor skills & wilderness adventure fans',    engagement_pct: 19, examples: ['Adventure stories', 'Campfire tales'] },
    { category: 'Trades',         description: 'Vocational training audiences',                 engagement_pct: 15, examples: ['Artisan stories', 'Craftsmen folklore'] },
  ],
};

// ── Sentiment data ────────────────────────────────────────────────

const SENTIMENT_DATA = {
  Trades:         { score: 72, label: 'Positive', summary: 'Strong community pride around skilled trades. Career positivity rising sharply post-pandemic.' },
  Mythology:      { score: 68, label: 'Positive', summary: 'High engagement around cultural storytelling. Growing curiosity about African heritage globally.' },
  Scouts:         { score: 78, label: 'Positive', summary: 'Very strong sentiment. Post-pandemic outdoor boom driving sustained enthusiasm.' },
  Neurodivergent: { score: 61, label: 'Neutral',  summary: 'Mixed sentiment — parenting challenges balanced by strong community support networks.' },
  Stories:        { score: 81, label: 'Positive', summary: 'Extremely positive. Audiences love the escapism and cultural richness of the format.' },
};

const KEYWORD_DATA = {
  Trades:         [{ keyword: 'apprenticeship', mentions: 1420 }, { keyword: 'tradie life', mentions: 980 }, { keyword: 'blue collar', mentions: 870 }, { keyword: 'trade school', mentions: 730 }, { keyword: 'electrician', mentions: 650 }, { keyword: 'welding tips', mentions: 540 }],
  Mythology:      [{ keyword: 'anansi', mentions: 2010 }, { keyword: 'yoruba gods', mentions: 1670 }, { keyword: 'african folklore', mentions: 1340 }, { keyword: 'griots', mentions: 890 }, { keyword: 'orisha', mentions: 760 }, { keyword: 'zulu legends', mentions: 610 }],
  Scouts:         [{ keyword: 'survival skills', mentions: 1890 }, { keyword: 'camping tips', mentions: 1560 }, { keyword: 'knot tying', mentions: 1120 }, { keyword: 'scout badge', mentions: 940 }, { keyword: 'bushcraft', mentions: 870 }, { keyword: 'fire starting', mentions: 720 }],
  Neurodivergent: [{ keyword: 'adhd parenting', mentions: 2340 }, { keyword: 'autism support', mentions: 1980 }, { keyword: 'iep tips', mentions: 1430 }, { keyword: 'sensory processing', mentions: 1210 }, { keyword: 'neurodiversity', mentions: 1080 }, { keyword: 'executive function', mentions: 890 }],
  Stories:        [{ keyword: '1001 nights', mentions: 3120 }, { keyword: 'scheherazade', mentions: 2670 }, { keyword: 'sinbad', mentions: 1890 }, { keyword: 'arabian nights', mentions: 1760 }, { keyword: 'ali baba', mentions: 1450 }, { keyword: 'shahryar', mentions: 980 }],
};

// ── Channels ──────────────────────────────────────────────────────

const CHANNELS = NICHES.flatMap(niche =>
  (AUDIENCE_DATA[niche] || []).map(ch => ({
    channel_id:       ch.channel_id,
    channel_name:     ch.channel_name,
    niche_category:   niche,
    subscriber_count: ch.subscriber_count,
    video_count:      Math.round(ch.subscriber_count / 300),
    view_count:       ch.total_views * 12,
    thumbnail_url:    `https://via.placeholder.com/88x88?text=${encodeURIComponent(ch.channel_name[0])}`,
  }))
);

// ── Insights (static sandbox reports) ────────────────────────────

const INSIGHT_DATA = {
  Trades: {
    title: 'The High-Intent Trade Workforce Audience',
    summary: 'The Trades audience skews 25–44 male, with strong Midwest and Southeast US concentration. They exhibit 12-minute average watch times — well above platform average — signalling deep intent consumption rather than casual browsing.',
    keyBehaviors: [
      'High watch completion rates (72%) on tutorial and how-to content',
      'Peak engagement Tuesday–Thursday evenings, suggesting after-work viewing',
      'Strong comment engagement on career advice and wage discussion threads',
    ],
    marketingAngles: [
      'Tool and equipment brands: position as professional-grade, not hobbyist',
      'Financial services: target with trade-specific pension and income protection products',
    ],
    confidence: 'high',
  },
  Mythology: {
    title: 'The Global African Heritage Explorer',
    summary: 'The Mythology audience is globally distributed — 34% US diaspora, 28% Sub-Saharan Africa, 18% UK — and skews 18–35. They exhibit the highest cross-platform affinity of any niche, especially toward storytelling and cultural content.',
    keyBehaviors: [
      'Long-form video preference (900+ second avg duration)',
      'High social sharing behaviour — 3.2× platform average shares per view',
      'Strong evening consumption pattern — 7pm–11pm local time',
    ],
    marketingAngles: [
      'Heritage and cultural travel brands targeting diaspora audiences',
      'Book publishers and streaming platforms with African and world mythology content',
    ],
    confidence: 'high',
  },
  Scouts: {
    title: 'The Active Outdoor Skill-Builder',
    summary: 'The Scouts audience is family-oriented and skill-motivated. 60% are parents researching activities for children aged 8–16. They convert exceptionally well on physical product recommendations embedded in tutorials.',
    keyBehaviors: [
      'Tutorial content drives 4× higher subscriber conversion than standard uploads',
      'Weekend viewing peaks — Saturday morning is the highest-traffic window',
      'Strong brand loyalty: commenters reference specific gear brands repeatedly',
    ],
    marketingAngles: [
      'Outdoor gear and apparel brands with "earn your badge" campaign angles',
      'Family experience brands — adventure camps, outdoor education programs',
    ],
    confidence: 'high',
  },
  Neurodivergent: {
    title: 'The Resourceful Neurodivergent Parent',
    summary: 'The Neurodivergent Parenting audience is 78% female, 28–45, with significantly above-average household income. They are highly engaged community members who actively seek validated, expert-backed content.',
    keyBehaviors: [
      'Highest comment-to-view ratio of all niches (1.4% vs 0.6% platform avg)',
      'Strong email newsletter affinity — 40% higher click-through on subscribe CTAs',
      'Repeat viewing of the same videos — 2.1× replay rate above platform average',
    ],
    marketingAngles: [
      'EdTech and learning tools targeting structured, research-backed positioning',
      'Mental health and wellness brands with clinical credibility signals',
    ],
    confidence: 'medium',
  },
  Stories: {
    title: 'The Deep-Immersion Storytelling Devotee',
    summary: 'The Stories audience exhibits the longest watch durations of any niche (17 min avg) and the highest new subscriber rate. They are predominantly urban, 18–34, with strong overlap into mythology and world culture content.',
    keyBehaviors: [
      'Binge-watching behaviour — 3.8 videos per session on average',
      'High playlist save rate (8.1%) indicating intent to return',
      'Strong YouTube → social migration: 52% follow creator social accounts within 30 days',
    ],
    marketingAngles: [
      'Streaming platforms and audiobook services — position as premium cultural enrichment',
      'Language learning and cultural education platforms with Arabic/African language offerings',
    ],
    confidence: 'high',
  },
};

// ── Public API ────────────────────────────────────────────────────

export function getSandboxAudience(niche) {
  return { mode: 'sandbox', niche, data: AUDIENCE_DATA[niche] || [], generated_at: new Date().toISOString() };
}

export function getSandboxAffinity(niche) {
  return { mode: 'sandbox', niche, data: AFFINITY_DATA[niche] || [], generated_at: new Date().toISOString() };
}

export function getSandboxSentiment(niche) {
  return {
    mode: 'sandbox',
    niche,
    sentiment: SENTIMENT_DATA[niche],
    keywords: KEYWORD_DATA[niche] || [],
    generated_at: new Date().toISOString(),
  };
}

export function getSandboxInsight(niche) {
  return { mode: 'sandbox', niche, ...(INSIGHT_DATA[niche] || {}), generated_at: new Date().toISOString() };
}

export function getSandboxChannels() {
  return { mode: 'sandbox', data: CHANNELS, generated_at: new Date().toISOString() };
}

export const VALID_NICHES = new Set(NICHES);
