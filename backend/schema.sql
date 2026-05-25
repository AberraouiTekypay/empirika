-- Empirika BigQuery Schema
-- Run via: node scripts/setupBigQuery.js
-- Or manually in BigQuery console

-- Dataset: empirika (create first)
-- CREATE SCHEMA IF NOT EXISTS empirika OPTIONS (location = 'US');

-- ============================================================
-- Table 1: Channel Metadata
-- ============================================================
CREATE TABLE IF NOT EXISTS empirika.raw_youtube_channels (
  channel_id      STRING NOT NULL,
  channel_name    STRING,
  niche_category  STRING, -- "Trades" | "Scouts" | "Neurodivergent" | "Mythology" | "Stories"
  description     STRING,
  subscriber_count  INT64,
  video_count       INT64,
  view_count        INT64,
  thumbnail_url     STRING,
  upload_playlist_id STRING,
  created_date    DATE,
  last_updated    TIMESTAMP
)
OPTIONS (description = 'YouTube channel metadata, refreshed daily');

-- ============================================================
-- Table 2: Video Metadata
-- ============================================================
CREATE TABLE IF NOT EXISTS empirika.raw_youtube_videos (
  video_id        STRING NOT NULL,
  channel_id      STRING NOT NULL,
  title           STRING,
  description     STRING,
  published_at    TIMESTAMP,
  duration_seconds  INT64,
  thumbnail_url   STRING,
  tags            ARRAY<STRING>,
  category_id     STRING
)
PARTITION BY DATE(published_at)
OPTIONS (description = 'YouTube video metadata');

-- ============================================================
-- Table 3: Daily Engagement Metrics
-- ============================================================
CREATE TABLE IF NOT EXISTS empirika.raw_youtube_engagement (
  channel_id      STRING NOT NULL,
  date            DATE NOT NULL,
  views           INT64,
  watch_time_hours  FLOAT64,
  average_view_duration_seconds INT64,
  likes           INT64,
  comments        INT64,
  shares          INT64,
  subscribers_gained  INT64,
  unsubscribes    INT64
)
PARTITION BY date
OPTIONS (description = 'Daily YouTube channel engagement metrics from Analytics API');

-- ============================================================
-- Table 4: Audience Demographics
-- ============================================================
CREATE TABLE IF NOT EXISTS empirika.raw_youtube_demographics (
  channel_id  STRING NOT NULL,
  date        DATE NOT NULL,
  age_group   STRING, -- "AGE_13_17" | "AGE_18_24" | etc.
  gender      STRING, -- "MALE" | "FEMALE" | "USER_SPECIFIED"
  viewer_percentage FLOAT64
)
PARTITION BY date
OPTIONS (description = 'YouTube audience demographics from Analytics API');

-- ============================================================
-- Table 5: TikTok Trends (Week 3)
-- ============================================================
CREATE TABLE IF NOT EXISTS empirika.tiktok_trends (
  niche           STRING,
  keyword         STRING,
  trend_name      STRING,
  hashtag         STRING,
  video_count     INT64,
  view_count      INT64,
  date            DATE
)
PARTITION BY date
OPTIONS (description = 'TikTok trending hashtags and sounds per niche');

-- ============================================================
-- Table 6: Reddit Sentiment (Week 3)
-- ============================================================
CREATE TABLE IF NOT EXISTS empirika.reddit_sentiment (
  niche           STRING,
  subreddit       STRING,
  post_id         STRING,
  post_title      STRING,
  post_url        STRING,
  sentiment_label STRING, -- "positive" | "negative" | "neutral"
  sentiment_score FLOAT64, -- 0.0 to 1.0
  upvotes         INT64,
  num_comments    INT64,
  date            DATE
)
PARTITION BY date
OPTIONS (description = 'Reddit post sentiment analysis per niche');

-- ============================================================
-- View: Audiences by Niche (last 30 days)
-- ============================================================
CREATE OR REPLACE VIEW empirika.audiences_by_niche AS
SELECT
  c.niche_category,
  c.channel_id,
  c.channel_name,
  c.subscriber_count,
  SUM(e.views)                        AS total_views,
  SUM(e.watch_time_hours)             AS total_watch_hours,
  AVG(e.average_view_duration_seconds) AS avg_view_duration_seconds,
  SUM(e.subscribers_gained)           AS total_subscribers_gained,
  SUM(e.likes)                        AS total_likes,
  SUM(e.comments)                     AS total_comments,
  COUNT(DISTINCT e.date)              AS days_of_data
FROM empirika.raw_youtube_channels c
JOIN empirika.raw_youtube_engagement e ON c.channel_id = e.channel_id
WHERE e.date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
GROUP BY 1, 2, 3, 4;

-- ============================================================
-- View: Channel Performance Ranking
-- ============================================================
CREATE OR REPLACE VIEW empirika.channel_performance_ranking AS
SELECT
  c.channel_id,
  c.channel_name,
  c.niche_category,
  c.subscriber_count,
  e.views,
  e.watch_time_hours,
  e.average_view_duration_seconds,
  e.subscribers_gained,
  e.date,
  ROW_NUMBER() OVER (PARTITION BY c.niche_category ORDER BY e.views DESC) AS rank_in_niche
FROM empirika.raw_youtube_channels c
JOIN empirika.raw_youtube_engagement e ON c.channel_id = e.channel_id
WHERE e.date = (SELECT MAX(date) FROM empirika.raw_youtube_engagement);
