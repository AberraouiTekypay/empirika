# Empirika

**Enterprise audience intelligence for niche YouTube markets. What Nielsen can't see.**

First-party YouTube channel data → brand intelligence API, served with sandbox mode, Swagger docs, and a self-serve developer portal. The dashboard ships in **demo mode** out of the box — no BigQuery required to explore the full product experience.

**Live:** [empirika.co](https://empirika.co) &nbsp;|&nbsp; **API Docs:** [empirika.co/docs](https://empirika.co/docs) &nbsp;|&nbsp; **Developer Portal:** [empirika.co/developer](https://empirika.co/developer)

---

## Architecture

```
YouTube Channels (9 channels, 5 niches)
        │
        ▼
YouTube Analytics API  ←  Daily ETL batch (backend/scripts/fetchAnalytics.js)
        │
        ▼
Node.js / Express Backend  (port 5000)
        │
        ├──────────────────────┐
        ▼                      ▼
Google BigQuery           Supabase (PostgreSQL)
  raw_youtube_channels      api_keys
  raw_youtube_videos        api_usage
  raw_youtube_engagement
  raw_youtube_demographics
  tiktok_trends   (Week 3)
  reddit_sentiment (Week 3)
        │
        ▼
REST API  /v1/*  ←  authenticate middleware (API key + rate limiting)
        │
        ├── Swagger UI at /docs
        ├── OpenAPI 3.0 at /v1/openapi.json
        │
        ▼
Next.js Frontend  (Vercel)
  /               Landing page
  /login          Authentication gate
  /dashboard      4-tab intelligence dashboard (demo data built-in)
  /developer      Self-serve API key portal
```

---

## Demo Mode

The dashboard is fully functional without any external services. When visiting `/dashboard` users are first routed through `/login`.

**Demo credentials:**
- Email: any valid email address
- Access code: `demo`

All four dashboard tabs (Audience, Affinity, Sentiment, AI Insight) load rich pre-built data from `frontend/lib/fakeData.js` — covering all 5 niches with realistic metrics, trend indicators, sparklines, and AI insight reports.

To connect live BigQuery data, set the environment variables in `backend/.env` and run the ETL pipeline (see Quick Start below).

---

## 5 Niches

| Niche | Description | Key Brands |
|-------|-------------|------------|
| Beauty & Skincare | Skincare routines, makeup, dermatology, clean beauty | L'Oréal, Cetaphil, The Ordinary, Fenty |
| Health & Wellness | Fitness, nutrition, supplements, biohacking, mental health | Whoop, Levels, AG1, Momentous |
| Home & Living | Interior design, decluttering, DIY, sustainable home | IKEA, Muji, Hay, Anthropologie |
| Food & Beverage | Cooking, baking, meal prep, restaurant culture, drinks | Zwilling, HelloFresh, Ooni, Vitamix |
| Parenting & Family | Child development, family lifestyle, education, toys | Fisher-Price, Lovevery, Osmo, KiwiCo |

---

## Quick Start

### Prerequisites

- Node.js 18+
- (Optional for live data) Google Cloud account — BigQuery + YouTube APIs + service account
- (Optional for AI insights) Anthropic API key
- (Optional for API key management) Supabase project

### 1. Clone & install

```bash
git clone https://github.com/AberraouiTekypay/empirika.git
cd empirika

cd backend  && npm install
cd ../frontend && npm install
```

### 2. Start in demo mode (no credentials required)

```bash
# Terminal 1 — frontend only
cd frontend && npm run dev
```

Visit http://localhost:3000, click **Dashboard**, and sign in with any email + code `demo`.

### 3. Configure environment (for live data)

```bash
cp .env.example backend/.env
# Edit backend/.env — see Environment Variables section below
```

### 4. Create Supabase tables

Run the following SQL in your Supabase SQL Editor:

```sql
-- API keys table
create table api_keys (
  id              uuid primary key default gen_random_uuid(),
  key_hash        text unique not null,
  key_prefix      text not null,
  name            text not null,
  email           text not null,
  environment     text not null default 'sandbox',
  scopes          text[] not null default '{"read"}',
  is_active       boolean not null default true,
  rate_limit_rpm  integer not null default 60,
  created_at      timestamptz not null default now(),
  last_used_at    timestamptz
);

-- Usage logging table
create table api_usage (
  id          uuid primary key default gen_random_uuid(),
  key_id      uuid references api_keys(id) on delete cascade,
  key_prefix  text,
  environment text,
  endpoint    text,
  method      text,
  niche       text,
  status_code integer,
  response_ms integer,
  ip_address  text,
  user_agent  text,
  created_at  timestamptz not null default now()
);

-- Indexes
create index on api_keys(key_hash);
create index on api_keys(email);
create index on api_usage(key_id);
create index on api_usage(created_at desc);

-- RLS
alter table api_keys  enable row level security;
alter table api_usage enable row level security;

-- Permissive policies (backend uses service role key)
create policy "service role full access" on api_keys  for all using (true) with check (true);
create policy "service role full access" on api_usage for all using (true) with check (true);
```

### 5. Create BigQuery tables

```bash
cd backend
npm run setup:bigquery
```

### 6. Authorise YouTube channels

```bash
npm run setup:auth
# Follow prompts to complete OAuth consent for each channel owner
```

### 7. Add real channel IDs

Edit `backend/config/channels.json` — replace all `REPLACE_WITH_REAL_CHANNEL_ID_*` values with actual YouTube channel IDs.

### 8. Fetch initial data

```bash
npm run fetch -- --days 30
```

### 9. Start both servers (live data mode)

```bash
# Terminal 1 — backend API (port 5000)
cd backend && npm start

# Terminal 2 — frontend (port 3000)
cd frontend && npm run dev
```

| URL | What |
|-----|------|
| http://localhost:3000 | Landing page |
| http://localhost:3000/login | Authentication |
| http://localhost:3000/dashboard | Intelligence dashboard |
| http://localhost:3000/developer | Developer portal |
| http://localhost:5000/docs | Swagger UI |
| http://localhost:5000/api/health | Backend health check |

---

## Authentication

The frontend uses a lightweight localStorage-based auth gate.

| Route | Access |
|-------|--------|
| `/` | Public |
| `/login` | Public |
| `/developer` | Public |
| `/dashboard` | Requires auth — redirects to `/login` if not signed in |

**How it works:**
1. User visits `/login`, enters email + access code
2. On success, `empirika_authed` is written to `localStorage` with email and timestamp
3. `_app.jsx` checks this on every protected page load and redirects to `/login` if absent
4. Sign-out clears `localStorage` and redirects to `/login`

To change the access code, update the check in `frontend/pages/login.jsx`.

---

## REST API

### Authentication

All data endpoints require an API key via one of:

```
X-API-Key: emp_sandbox_your_key_here
Authorization: Bearer emp_sandbox_your_key_here
```

Get a free sandbox key at `/developer` or via the API:

```bash
curl -X POST http://localhost:5000/v1/keys \
  -H "Content-Type: application/json" \
  -d '{"name": "My Key", "email": "you@co.com", "environment": "sandbox"}'
```

### Sandbox vs Production

| Key prefix | Data | Rate limit |
|---|---|---|
| `emp_sandbox_*` | Rich deterministic mock data — no BigQuery required | 60 req/min |
| `emp_live_*` | Live BigQuery — real YouTube analytics | 120 req/min |

### Rate limit headers

Every response includes:

```
X-RateLimit-Limit:     60
X-RateLimit-Remaining: 59
X-RateLimit-Reset:     1716750000
```

### Endpoints

#### Data endpoints (require API key)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/v1/audience/:niche` | Per-channel metrics: views, watch hours, subscribers gained, likes, comments |
| `GET` | `/v1/affinity/:niche` | Cross-niche audience overlap scores with examples |
| `GET` | `/v1/sentiment/:niche` | Community sentiment score (0–100), label, and top trending keywords |
| `GET` | `/v1/insights/:niche` | AI-generated audience intelligence report (Claude) |
| `GET` | `/v1/channels` | Full catalogue of tracked channels; filter with `?niche=Stories` |
| `GET` | `/v1/usage` | Last 200 API calls made with the authenticated key |

**Optional query parameter:** `?days=N` (1–90, default 30) on audience and sentiment endpoints.

#### Key management (no auth required)

| Method | Path | Body / Query | Description |
|--------|------|---|-------------|
| `POST` | `/v1/keys` | `{ name, email, environment }` | Create key — returned **once only** |
| `GET` | `/v1/keys` | `?email=you@co.com` | List keys for an email address |
| `DELETE` | `/v1/keys/:id` | `{ email }` | Revoke a key (email must match owner) |

#### System

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Server health — no auth |
| `GET` | `/docs` | Swagger UI |
| `GET` | `/v1/openapi.json` | OpenAPI 3.0 specification |

### Example: audience request

```bash
curl https://api.empirika.io/v1/audience/Mythology \
  -H "X-API-Key: emp_sandbox_your_key"
```

```json
{
  "mode": "sandbox",
  "niche": "Mythology",
  "data": [
    {
      "channel_id": "UCsandbox_myth_1",
      "channel_name": "African Mythology",
      "subscriber_count": 312000,
      "total_views": 4180000,
      "total_watch_hours": 139333,
      "avg_view_duration_seconds": 892,
      "total_subscribers_gained": 6720,
      "total_likes": 198000,
      "total_comments": 34100
    }
  ],
  "generated_at": "2026-05-26T10:00:00.000Z"
}
```

---

## Environment Variables

Copy `.env.example` to `backend/.env` and fill in:

```bash
# Google Cloud / BigQuery
GCP_PROJECT_ID=your-gcp-project-id
GCP_KEY_FILE=./gcp-key.json
BIGQUERY_DATASET=empirika
BIGQUERY_LOCATION=US

# YouTube OAuth2
YOUTUBE_CLIENT_ID=....apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=...
YOUTUBE_REDIRECT_URI=http://localhost:5000/auth/callback

# Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-...

# Supabase (API key management)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

# Server
PORT=5000
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:5000
ADMIN_SECRET=change-me-in-production

# Week 3 — optional
TIKTOK_API_KEY=...
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...
REDDIT_USER_AGENT=empirika-bot/1.0
```

---

## Project Structure

```
empirika/
├── backend/
│   ├── config/
│   │   └── channels.json          # Channel IDs + niche/subreddit mappings
│   ├── lib/
│   │   ├── apiKeyManager.js       # Key creation, validation, revocation, usage logging
│   │   ├── affinityEngine.js      # Cross-niche overlap scoring
│   │   ├── bigqueryHelpers.js     # BQ client + query helpers
│   │   ├── insightGenerator.js    # Claude-powered insight + sentiment analysis
│   │   ├── redditApi.js           # Reddit monitoring (Week 3)
│   │   ├── sandboxData.js         # Deterministic mock data for all 5 niches
│   │   ├── supabaseClient.js      # Supabase singleton
│   │   ├── tiktokApi.js           # TikTok trends (Week 3)
│   │   ├── youtubeApi.js          # OAuth2 + YouTube API wrapper
│   │   ├── cache.js               # In-memory TTL cache
│   │   └── logger.js              # Structured JSON logger
│   ├── middleware/
│   │   └── authenticate.js        # API key auth + in-memory rate limiting
│   ├── routes/
│   │   └── v1/
│   │       ├── audience.js
│   │       ├── affinity.js
│   │       ├── channels.js
│   │       ├── insights.js
│   │       ├── keys.js
│   │       ├── sentiment.js
│   │       └── usage.js
│   ├── scripts/
│   │   ├── fetchAnalytics.js      # Daily ETL batch runner
│   │   ├── server.js              # Express app entry point
│   │   ├── setupAuth.js           # YouTube OAuth wizard
│   │   └── setupBigQuery.js       # BigQuery table provisioning
│   ├── openapi.js                 # OpenAPI 3.0 specification
│   ├── schema.sql                 # BigQuery DDL
│   └── package.json
│
├── frontend/
│   ├── components/
│   │   ├── landing/               # Landing page sections
│   │   │   ├── Navigation.jsx     # Sticky nav — routes Dashboard CTA through /login
│   │   │   ├── Hero.jsx           # Hero with premium data visual (no emojis)
│   │   │   ├── FeaturesGrid.jsx   # 6 features — numbered typographic layout
│   │   │   ├── ProblemSection.jsx
│   │   │   ├── SegmentationDeepDive.jsx
│   │   │   ├── AffinityDeepDive.jsx
│   │   │   ├── UseCases.jsx
│   │   │   ├── WhyNow.jsx
│   │   │   ├── FinalCTA.jsx
│   │   │   └── Footer.jsx
│   │   ├── AudienceOverview.jsx   # Metrics + sparkline trends + channel table
│   │   ├── AffinityInsights.jsx   # Cross-niche affinity cards with progress bars
│   │   ├── SentimentTrends.jsx    # Sentiment gauge + keyword bar list
│   │   └── InsightReport.jsx      # AI insight — split behaviours/angles layout
│   ├── lib/
│   │   ├── fakeData.js            # Demo data for all 5 niches (audience, affinity,
│   │   │                          #   sentiment, insights) — powers demo mode
│   │   ├── bigqueryClient.js      # BigQuery queries (used in live mode)
│   │   └── utils.js               # formatNumber, formatDuration, downloadCSV
│   ├── pages/
│   │   ├── _app.jsx               # AuthGuard — redirects /dashboard to /login if unauthed
│   │   ├── index.jsx              # Landing page
│   │   ├── login.jsx              # Auth gate — email + access code
│   │   ├── dashboard.jsx          # 4-tab dashboard with logout + user email in header
│   │   ├── developer.jsx          # Developer portal (API key management)
│   │   └── api/
│   │       ├── audience/[niche].js
│   │       ├── affinity/[niche].js
│   │       ├── sentiment/[niche].js
│   │       ├── insights/[niche].js
│   │       └── dev/
│   │           ├── keys.js
│   │           └── keys/[id].js
│   ├── styles/
│   │   └── globals.css
│   ├── next.config.js
│   └── tailwind.config.js
│
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## Docker

```bash
cp .env.example .env   # fill in all values
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:5000

---

## Deployment

Frontend is deployed on **Vercel** (auto-deploys from GitHub `main`).

```bash
cd frontend && vercel --prod
```

Backend (Express) can be deployed to any Node.js host:

```bash
# Cloud Run
gcloud run deploy empirika-backend --source=./backend --region=us-central1

# Or Railway, Render, Fly.io — set the env vars and run: npm start
```

---

## Roadmap

- [ ] Connect live BigQuery data — fill in real channel IDs in `backend/config/channels.json`
- [ ] Add GCP service account key and run `npm run setup:auth`
- [ ] Set `TIKTOK_API_KEY` for cross-platform trend data
- [ ] Set `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET` for live sentiment pipeline
- [ ] Switch `affinityEngine.js` to `computeRealOverlapScore()` in production mode
- [ ] Deploy backend to a persistent host and set `BACKEND_API_URL` in Vercel env vars
- [ ] Replace demo auth with a proper auth provider (Clerk, Auth0, Supabase Auth)

---

*An [EM300.co](https://em300.co) Company*
