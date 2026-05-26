# Empirika Backend

Data pipeline + REST API server for the Empirika audience intelligence platform.

---

## What this does

- Authenticates with YouTube via OAuth2 and pulls analytics daily
- Writes metrics to Google BigQuery (raw channels, videos, engagement, demographics)
- Provides a versioned REST API (`/v1/*`) with API key auth, rate limiting, and sandbox mode
- Generates AI audience insight reports via Claude
- Exposes Swagger UI at `/docs` and OpenAPI 3.0 at `/v1/openapi.json`

---

## Prerequisites

- Node.js 18+
- npm or pnpm
- A GCP project with these APIs enabled:
  - BigQuery API
  - YouTube Analytics API v2
  - YouTube Data API v3
- A service account with `bigquery.datasetEditor` + `bigquery.tableEditor` roles
- OAuth2 credentials (Web Application type) for YouTube channel access
- Anthropic API key (for `/v1/insights`)
- Supabase project (for API key management)

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your credentials — see Environment Variables below
```

### 3. Create BigQuery tables

```bash
npm run setup:bigquery
```

Creates the `empirika` dataset and all tables. Safe to re-run.

### 4. Authorise YouTube channels

Run once per YouTube account that owns channels:

```bash
npm run setup:auth
```

Open the printed URL in a browser while signed in as the channel owner. Repeat with `--account owner2` for additional owners.

### 5. Add real channel IDs

Edit `config/channels.json` — replace all `REPLACE_WITH_REAL_CHANNEL_ID_*` values with real YouTube channel IDs.

Find a channel ID: go to the channel page → view source → search `channelId`.

### 6. Run first data fetch

```bash
npm run fetch -- --days 30   # backfill 30 days
npm run fetch                 # default: last 7 days
```

### 7. Start the server

```bash
npm start        # production
npm run dev      # nodemon watch mode
```

---

## Sandbox mode

The API ships with deterministic sandbox data in `lib/sandboxData.js`. Any key prefixed `emp_sandbox_*` returns sandbox data — no BigQuery required.

Get a sandbox key from the frontend developer portal at `/developer`, or:

```bash
curl -X POST http://localhost:5000/v1/keys \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"you@co.com","environment":"sandbox"}'
```

---

## API Reference

### Authentication

Send the API key in one of:

```
X-API-Key: emp_sandbox_your_key
Authorization: Bearer emp_sandbox_your_key
```

### Rate limit headers

```
X-RateLimit-Limit:     60
X-RateLimit-Remaining: 59
X-RateLimit-Reset:     1716750000
```

### Data endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/v1/audience/:niche` | Per-channel metrics (views, watch hours, subs gained, likes, comments) |
| `GET` | `/v1/affinity/:niche` | Cross-niche audience overlap scores with example channels |
| `GET` | `/v1/sentiment/:niche` | Sentiment score (0–100), label, summary, and top keywords |
| `GET` | `/v1/insights/:niche` | AI-generated audience intelligence report (Claude) |
| `GET` | `/v1/channels` | Full channel catalogue; filter with `?niche=Beauty & Skincare` |
| `GET` | `/v1/usage` | Last 200 API calls for the authenticated key |

**Query param:** `?days=N` (1–90, default 30) on audience and sentiment endpoints.

### Key management (no auth required)

| Method | Path | Body / Query | Description |
|--------|------|---|-------------|
| `POST` | `/v1/keys` | `{ name, email, environment }` | Create key — shown **once** |
| `GET` | `/v1/keys` | `?email=you@co.com` | List keys by email |
| `DELETE` | `/v1/keys/:id` | `{ email }` | Revoke key (email must match) |

### System

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check — no auth |
| `POST` | `/api/admin/sync` | Manual ETL trigger — requires `ADMIN_SECRET` |
| `GET` | `/docs` | Swagger UI |
| `GET` | `/v1/openapi.json` | OpenAPI 3.0 spec |

---

## Daily automation

Schedule with cron or Cloud Scheduler:

```
0 2 * * *   node /app/scripts/fetchAnalytics.js --days 1
```

Or use the admin sync endpoint:

```bash
curl -X POST http://localhost:5000/api/admin/sync \
  -H "Content-Type: application/json" \
  -d '{"days": 1, "secret": "YOUR_ADMIN_SECRET"}'
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GCP_PROJECT_ID` | Yes | GCP project ID |
| `GCP_KEY_FILE` | Yes | Path to service account JSON key |
| `BIGQUERY_DATASET` | No | Dataset name (default: `empirika`) |
| `BIGQUERY_LOCATION` | No | BQ region (default: `US`) |
| `YOUTUBE_CLIENT_ID` | Yes | OAuth2 client ID |
| `YOUTUBE_CLIENT_SECRET` | Yes | OAuth2 client secret |
| `YOUTUBE_REDIRECT_URI` | No | OAuth callback URL |
| `ANTHROPIC_API_KEY` | Yes | For Claude insight generation |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Yes | Supabase service role key |
| `PORT` | No | Server port (default: `5000`) |
| `FRONTEND_URL` | No | CORS origin (default: `http://localhost:3000`) |
| `ADMIN_SECRET` | Yes | Protects `POST /api/admin/sync` |
| `TIKTOK_API_KEY` | No | Cross-platform trend data (Week 3) |
| `REDDIT_CLIENT_ID` | No | Reddit monitoring (Week 3) |
| `REDDIT_CLIENT_SECRET` | No | Reddit monitoring (Week 3) |
| `REDDIT_USER_AGENT` | No | Reddit API user agent |

---

## Folder structure

```
backend/
├── config/
│   └── channels.json          # Channel IDs, niche mapping, subreddit mapping
├── credentials/               # OAuth tokens per account (git-ignored)
├── lib/
│   ├── apiKeyManager.js       # Key creation, hashing, validation, usage logging
│   ├── affinityEngine.js      # Cross-niche overlap scoring
│   ├── bigqueryHelpers.js     # BigQuery client + query helpers
│   ├── insightGenerator.js    # Claude insight + sentiment generation
│   ├── redditApi.js           # Reddit sentiment monitoring (Week 3)
│   ├── sandboxData.js         # Deterministic mock data for sandbox keys
│   ├── supabaseClient.js      # Supabase singleton
│   ├── tiktokApi.js           # TikTok trend API (Week 3)
│   ├── youtubeApi.js          # YouTube Data + Analytics API wrapper
│   ├── cache.js               # In-memory TTL cache
│   └── logger.js              # Structured JSON logger (Winston)
├── middleware/
│   └── authenticate.js        # API key validation + in-memory rate limiter
├── routes/
│   └── v1/
│       ├── audience.js        # GET /v1/audience/:niche
│       ├── affinity.js        # GET /v1/affinity/:niche
│       ├── channels.js        # GET /v1/channels
│       ├── insights.js        # GET /v1/insights/:niche
│       ├── keys.js            # POST/GET/DELETE /v1/keys
│       ├── sentiment.js       # GET /v1/sentiment/:niche
│       └── usage.js           # GET /v1/usage
├── scripts/
│   ├── fetchAnalytics.js      # Daily ETL batch runner
│   ├── server.js              # Express app entry point
│   ├── setupAuth.js           # Interactive YouTube OAuth wizard
│   └── setupBigQuery.js       # BigQuery schema provisioning
├── openapi.js                 # OpenAPI 3.0 specification
├── schema.sql                 # BigQuery DDL reference
└── package.json
```
