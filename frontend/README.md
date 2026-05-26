# Empirika Frontend

Next.js 14 dashboard and landing page for the Empirika audience intelligence platform.

---

## What this is

- **Landing page** (`/`) — Marketing site with hero, feature grid, deep-dive sections
- **Login** (`/login`) — Auth gate with email + access code
- **Dashboard** (`/dashboard`) — 4-tab intelligence dashboard (audience, affinity, sentiment, AI insight)
- **Developer portal** (`/developer`) — Self-serve API key management

The dashboard runs in **demo mode** out of the box using pre-built data from `lib/fakeData.js`. No BigQuery or backend is required to explore the full product.

---

## Demo access

1. Run the dev server: `npm run dev`
2. Go to http://localhost:3000 → click **Dashboard**
3. Enter any email + access code **`demo`**

---

## Prerequisites

- Node.js 18+
- npm or pnpm

For **live data** (optional):
- Backend running at `http://localhost:5000`
- GCP service account with BigQuery access
- Anthropic API key

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment (live data only)

```bash
cp .env.example .env.local
# Edit .env.local
```

### 3. Start development server

```bash
npm run dev
```

Visit http://localhost:3000

### 4. Build for production

```bash
npm run build
npm start
```

---

## Authentication

Authentication uses `localStorage` — no session cookies or tokens.

**Flow:**
1. `_app.jsx` wraps every page in `AuthGuard`
2. If the route is in `PROTECTED` (`['/dashboard']`), it reads `localStorage.getItem('empirika_authed')`
3. If absent, `router.replace('/login')` fires immediately
4. `/login` validates the access code and writes `{ email, ts }` to `localStorage`
5. The dashboard header shows the signed-in email and a **Sign out** button that clears the key

To change the access code, update `pages/login.jsx`:

```js
if (code.trim().toLowerCase() === 'demo') {  // ← change 'demo' here
```

To add more protected routes, update `PROTECTED` in `pages/_app.jsx`.

---

## Demo data

`lib/fakeData.js` exports four datasets used by the dashboard in demo mode:

| Export | Used by | Contents |
|--------|---------|----------|
| `AUDIENCE_DATA` | `AudienceOverview` | Channel metrics + 7-day sparkline trends per niche |
| `TOTAL_TRENDS` | `AudienceOverview` | Aggregate % trends for the 4 metric cards |
| `AFFINITY_DATA` | `AffinityInsights` | Cross-niche affinity categories with engagement % |
| `SENTIMENT_DATA` | `SentimentTrends` | Sentiment score, label, summary, and top keywords |
| `INSIGHT_DATA` | `InsightReport` | Pre-written AI intelligence reports per niche |

All 5 niches are covered: **Beauty & Skincare, Health & Wellness, Home & Living, Food & Beverage, Parenting & Family**.

To switch a component to live data, replace the `setTimeout` + fake data import with a real `fetch()` call to the backend API.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GCP_PROJECT_ID` | Live mode only | GCP project ID |
| `GCP_KEY_FILE` | Live mode only | Path to service account JSON |
| `BIGQUERY_DATASET` | No | Dataset name (default: `empirika`) |
| `ANTHROPIC_API_KEY` | Live mode only | For AI insight generation via Claude |
| `BACKEND_URL` | No | Backend server URL (default: `http://localhost:5000`) |
| `ADMIN_SECRET` | No | Protects `/api/admin/sync` |

None of these are required to run in demo mode.

---

## API Routes

These Next.js API routes proxy requests to the backend. In demo mode they are not called — the components use `lib/fakeData.js` directly.

| Route | Description |
|-------|-------------|
| `GET /api/audience/[niche]` | Channel metrics from BigQuery |
| `GET /api/affinity/[niche]` | Cross-niche affinity data |
| `GET /api/sentiment/[niche]` | Reddit sentiment & keywords |
| `GET /api/insights/[niche]` | Claude-generated insight report |
| `GET /api/health` | Health check |
| `POST /api/admin/sync` | Trigger manual data sync |

Valid niche values: `Beauty & Skincare`, `Health & Wellness`, `Home & Living`, `Food & Beverage`, `Parenting & Family`

---

## Folder structure

```
frontend/
├── components/
│   ├── landing/
│   │   ├── Navigation.jsx         # Sticky nav — Dashboard CTA routes through /login
│   │   ├── Hero.jsx               # Hero section — premium data visual, no emojis
│   │   ├── FeaturesGrid.jsx       # 6 features — numbered typographic layout (01–06)
│   │   ├── ProblemSection.jsx
│   │   ├── SegmentationDeepDive.jsx
│   │   ├── AffinityDeepDive.jsx
│   │   ├── UseCases.jsx
│   │   ├── WhyNow.jsx
│   │   ├── FinalCTA.jsx
│   │   └── Footer.jsx
│   ├── AudienceOverview.jsx       # Metric cards with % trends + sparkline channel table
│   ├── AffinityInsights.jsx       # Cross-niche affinity cards with gradient progress bars
│   ├── SentimentTrends.jsx        # Sentiment gauge + keyword ranked bar list
│   └── InsightReport.jsx          # AI insight — split behaviours/angles layout
│
├── lib/
│   ├── fakeData.js                # Demo data for all 5 niches (all dashboard tabs)
│   ├── bigqueryClient.js          # BigQuery queries (used in live mode only)
│   └── utils.js                   # formatNumber, formatDuration, downloadCSV, cn
│
├── pages/
│   ├── _app.jsx                   # AuthGuard — protects /dashboard, redirects to /login
│   ├── index.jsx                  # Landing page
│   ├── login.jsx                  # Auth gate — email + access code form
│   ├── dashboard.jsx              # 4-tab dashboard with user email + sign-out header
│   ├── developer.jsx              # Developer portal (API key management)
│   └── api/
│       ├── audience/[niche].js
│       ├── affinity/[niche].js
│       ├── sentiment/[niche].js
│       ├── insights/[niche].js
│       └── dev/
│           ├── keys.js            # Proxy: POST/GET /v1/keys
│           └── keys/[id].js       # Proxy: DELETE /v1/keys/:id
│
├── styles/
│   └── globals.css                # Tailwind base + dashboard CSS variables
│
├── next.config.js
└── tailwind.config.js
```

---

## Design system

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-dark` | `#0a0a0a` | Page background (landing) |
| `--bg-card` | `#141414` | Landing page cards |
| `--border` | `#2a2a2a` | Landing page borders |
| `--accent` | `#3b82f6` | Primary blue (buttons, highlights) |
| `--text-primary` | `#ffffff` | Headings |
| `--text-secondary` | `#b0b0b0` | Body copy |
| `#0b0f1a` | — | Dashboard background |
| `#111827` | — | Dashboard cards |
| `#1e2d45` | — | Dashboard borders |

Fonts: **Cormorant Garamond** (headings, numerics) · **Inter** (body, labels, UI)
