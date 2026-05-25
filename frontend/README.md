# Empirika Dashboard (Frontend)

Next.js 14 dashboard for the Empirika audience intelligence platform.

## What this does

- Displays YouTube audience metrics per niche (Overview tab)
- Shows cross-niche affinity signals (Affinity tab)
- Displays Reddit/social sentiment (Sentiment & Trends tab)
- Generates AI insight reports via Claude (AI Insight tab)

## Prerequisites

- Node.js 18+
- pnpm
- Backend running (or GCP credentials for direct BigQuery access)

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

### 3. Start development server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GCP_PROJECT_ID` | Yes | GCP project ID |
| `GCP_KEY_FILE` | Yes | Path to service account JSON |
| `BIGQUERY_DATASET` | No | Dataset name (default: `empirika`) |
| `ANTHROPIC_API_KEY` | Yes | For AI insight generation |
| `BACKEND_URL` | No | Backend server URL (default: `http://localhost:5000`) |
| `ADMIN_SECRET` | No | Protects `/api/admin/sync` |

## API Routes

| Route | Description |
|-------|-------------|
| `GET /api/audience/[niche]` | Channel metrics from BigQuery |
| `GET /api/affinity/[niche]` | Cross-niche affinity data |
| `GET /api/sentiment/[niche]` | Reddit sentiment & keywords |
| `GET /api/insights/[niche]` | Claude-generated insight report |
| `GET /api/health` | Health check |
| `POST /api/admin/sync` | Trigger manual data sync |

Valid niche values: `Trades`, `Mythology`, `Scouts`, `Neurodivergent`, `Stories`

## Building for production

```bash
pnpm build
pnpm start
```

## Folder structure

```
frontend/
├── components/
│   ├── AudienceOverview.jsx  ← Overview tab
│   ├── AffinityInsights.jsx  ← Affinity tab
│   ├── SentimentTrends.jsx   ← Sentiment tab
│   └── InsightReport.jsx     ← AI Insight tab
├── lib/
│   ├── bigqueryClient.js     ← BigQuery queries
│   └── utils.js              ← formatNumber, downloadCSV, etc.
├── pages/
│   ├── index.jsx             ← Landing page
│   ├── dashboard.jsx         ← Main dashboard
│   └── api/                  ← Next.js API routes
├── styles/
│   └── globals.css           ← Tailwind + custom styles
├── next.config.js
└── tailwind.config.js
```
