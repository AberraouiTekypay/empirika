# Empirika Backend

Data pipeline + ETL server for the Empirika audience intelligence platform.

## What this does

- Authenticates with YouTube via OAuth2
- Pulls analytics from 9 YouTube channels daily
- Writes metrics to Google BigQuery
- Provides admin endpoints (manual sync, health check)

## Prerequisites

- Node.js 18+
- pnpm (`npm i -g pnpm`)
- A GCP project with these APIs enabled:
  - BigQuery API
  - YouTube Analytics API
  - YouTube Data API v3
- A service account with `bigquery.datasetEditor` + `bigquery.tableEditor` roles
- OAuth2 credentials (Web Application type) for YouTube

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

Required keys:
- `GCP_PROJECT_ID` — your GCP project ID
- `GCP_KEY_FILE` — path to service account JSON key
- `YOUTUBE_CLIENT_ID` / `YOUTUBE_CLIENT_SECRET` — from GCP OAuth credentials
- `ANTHROPIC_API_KEY` — from console.anthropic.com

### 3. Create BigQuery tables

```bash
pnpm run setup:bigquery
```

This creates the `empirika` dataset and all tables. Safe to re-run.

### 4. Authorise YouTube channels

Run once per YouTube account that owns channels:

```bash
pnpm run setup:auth
```

Open the printed URL in a browser while logged in as the channel owner.
Repeat with `--account owner2` for additional channel owners.

### 5. Run first data fetch

```bash
pnpm run fetch --days 30   # backfill 30 days
pnpm run fetch             # default: last 7 days
```

### 6. Update channel IDs

Edit `config/channels.json` — replace all `REPLACE_WITH_REAL_CHANNEL_ID_*` values
with the real YouTube channel IDs.

Find a channel ID: go to the channel page → view source → search `channelId`.

## Daily automation

Schedule with cron or Cloud Scheduler:

```
0 2 * * *   node /app/scripts/fetchAnalytics.js --days 1
```

Or run the Express server and use the admin sync endpoint:

```bash
pnpm start
curl -X POST http://localhost:5000/api/admin/sync \
  -H "Content-Type: application/json" \
  -d '{"days": 1, "secret": "YOUR_ADMIN_SECRET"}'
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Service health |
| GET | `/auth/youtube?account=default` | Start OAuth flow |
| GET | `/auth/callback` | OAuth callback (automatic) |
| POST | `/api/admin/sync` | Manual data sync |

## Folder structure

```
backend/
├── config/
│   └── channels.json        ← Channel list + niche mapping
├── credentials/             ← OAuth tokens (git-ignored)
├── lib/
│   ├── youtubeApi.js        ← YouTube Data + Analytics API
│   ├── bigqueryHelpers.js   ← BigQuery insert/query helpers
│   ├── insightGenerator.js  ← Claude insight generation
│   ├── tiktokApi.js         ← TikTok trends (Week 3)
│   ├── redditApi.js         ← Reddit sentiment (Week 3)
│   ├── affinityEngine.js    ← Cross-niche affinity scoring
│   ├── logger.js            ← Structured JSON logger
│   └── cache.js             ← In-memory TTL cache
├── scripts/
│   ├── fetchAnalytics.js    ← Daily ETL batch
│   ├── server.js            ← Express server
│   ├── setupAuth.js         ← YouTube OAuth wizard
│   └── setupBigQuery.js     ← Schema initialisation
└── schema.sql               ← BigQuery DDL reference
```
