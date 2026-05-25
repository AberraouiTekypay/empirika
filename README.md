# Empirika

**Enterprise audience intelligence for niche markets. What Nielsen can't see.**

First-party YouTube niche channel data → predictive brand intelligence.

---

## Architecture

```
YouTube Channels (9 channels, 5 niches)
        ↓
YouTube Analytics API (daily batch)
        ↓
Node.js Backend (ETL pipeline)
        ↓
Google BigQuery
  ├── raw_youtube_channels
  ├── raw_youtube_videos
  ├── raw_youtube_engagement
  ├── raw_youtube_demographics
  ├── tiktok_trends        (Week 3)
  └── reddit_sentiment     (Week 3)
        ↓
Next.js API Layer
        ↓
Dashboard (4 tabs)
  ├── Audience Overview
  ├── Affinity Insights
  ├── Sentiment & Trends
  └── AI Insight Report (Claude)
```

## Quick Start

### Prerequisites

- Node.js 18+, pnpm (`npm i -g pnpm`)
- Google Cloud account with BigQuery + YouTube APIs enabled
- Anthropic API key (claude.ai)

### 1. Clone & install

```bash
git clone https://github.com/AberraouiTekypay/empirika.git
cd empirika

cd backend && pnpm install
cd ../frontend && pnpm install
```

### 2. Configure credentials

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env.local
```

Fill in both `.env` files:
- `GCP_PROJECT_ID` — your GCP project
- `GCP_KEY_FILE` — path to service account JSON key file
- `YOUTUBE_CLIENT_ID` / `YOUTUBE_CLIENT_SECRET`
- `ANTHROPIC_API_KEY`

### 3. Create BigQuery tables

```bash
cd backend
pnpm run setup:bigquery
```

### 4. Authorise YouTube channels

```bash
cd backend
pnpm run setup:auth
```

Follow the console instructions to authenticate via OAuth.

### 5. Edit channel list

Open `backend/config/channels.json` and replace all `REPLACE_WITH_REAL_CHANNEL_ID_*` values with actual YouTube channel IDs.

### 6. Fetch initial data

```bash
cd backend
pnpm run fetch --days 30     # 30-day backfill
```

### 7. Start the dashboard

```bash
# Terminal 1 — backend
cd backend && pnpm start

# Terminal 2 — frontend
cd frontend && pnpm dev
```

Dashboard: **http://localhost:3000/dashboard**

---

## Docker

```bash
cp .env.example .env   # fill in all values
cp backend/gcp-key.json gcp-key.json

docker compose up --build
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:5000

---

## Niches

| Niche | Channels | Description |
|-------|----------|-------------|
| Trades | 2 | Path2Pro Trades — vocational & skilled trades |
| Mythology | 2 | African Mythology — stories, gods, folklore |
| Scouts | 1 | Scouting Skills — outdoor & wilderness |
| Neurodivergent | 1 | Neurodivergent Parenting — ADHD, autism |
| Stories | 3 | 1001 Nights — Arabian Nights storytelling |

---

## API Reference

Base URL: `http://localhost:3000`

| Endpoint | Description |
|----------|-------------|
| `GET /api/audience/[niche]` | Audience metrics (last 30 days) |
| `GET /api/affinity/[niche]` | Cross-niche affinity scores |
| `GET /api/sentiment/[niche]` | Sentiment & trending keywords |
| `GET /api/insights/[niche]` | AI-generated insight report |
| `GET /api/health` | Frontend health |
| `GET http://localhost:5000/api/health` | Backend health |

Valid niches: `Trades`, `Mythology`, `Scouts`, `Neurodivergent`, `Stories`

---

## Sprint Timeline

| Week | Deliverable |
|------|------------|
| 1 | BigQuery schema + YouTube data pipeline for all 9 channels |
| 2 | Next.js dashboard, 4 tabs, Claude AI insights |
| 3 | TikTok + Reddit data, real affinity clustering, Docker deploy |

---

## Week 3 Checklist

- [ ] Update `config/channels.json` with real channel IDs
- [ ] Add `TIKTOK_API_KEY` and run TikTok trends collection
- [ ] Add `REDDIT_CLIENT_ID`/`REDDIT_CLIENT_SECRET` for Reddit monitoring
- [ ] Switch `computeAffinity()` in `affinityEngine.js` to use `computeRealOverlapScore()`
- [ ] Replace mock data in `/api/affinity/[niche].js` with real BigQuery call

---

## Deployment (Cloud Run)

```bash
gcloud run deploy empirika-backend  --source=./backend  --region=us-central1
gcloud run deploy empirika-frontend --source=./frontend --region=us-central1
```

---

*An [EM300.co](https://em300.co) Company*
