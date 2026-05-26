# Changelog

All notable changes to Empirika are documented here.

---

## [Unreleased]

_Next priorities: wire real YouTube channel IDs, add GCP/OAuth credentials, connect TikTok/Reddit APIs, switch affinity engine to production mode, set Supabase env vars on backend server._

---

## 2026-05-26

### feat: rename niches to FMCG/brand-relevant categories with new demo data (`a032269`)

Replaced the 5 internal niche identifiers with consumer brand categories that resonate with FMCG, agencies, and creator economy clients:

| Before | After |
|---|---|
| Trades | Beauty & Skincare |
| Mythology | Health & Wellness |
| Scouts | Home & Living |
| Neurodivergent | Food & Beverage |
| Stories | Parenting & Family |

- Rewrote `frontend/lib/fakeData.js` with category-appropriate channels (Hyram, Lisa Eldridge, Andrew Huberman, Yoga with Adriene, Joshua Weissman, Babish, Studio McGee, Mark Rober, etc.), realistic subscriber/view metrics, 7-day sparkline trends, cross-niche affinity categories (e.g. Fashion & Luxury, Supplements & Biohacking, Restaurant & Dining Culture), sentiment keywords, and full AI insight reports with business-relevant marketing angles per category
- Updated `NICHES` array in `dashboard.jsx`
- Updated `README.md` niche table with Key Brands per category
- Updated `frontend/README.md` niche references

---

### docs: update all READMEs to reflect auth gate, demo mode, and UI changes (`e895cc7`)

- **Root README:** added Demo Mode section with credentials, updated Quick Start with frontend-only demo path, added `/login` to architecture and URL table, updated project structure with new files, refreshed roadmap
- **frontend/README:** rewrote to document auth gate flow, demo data exports (`fakeData.js`), design system tokens, new pages (`login.jsx`), updated folder tree, env variables table with demo mode notes
- **backend/README:** added sandbox mode section, env variable table, updated niche name references to FMCG categories

---

### feat: auth gate, demo data, and premium UI/UX upgrade (`ea2f8b6`)

Major UX and reliability overhaul — the dashboard now works fully offline without a backend.

**Auth gate**
- New `/login` page with email + access code (`demo`) authentication
- `_app.jsx` `AuthGuard` component protects `/dashboard` via `localStorage`; unauthenticated users are redirected to `/login`
- Dashboard header shows the logged-in user's email and a Sign Out button

**Demo data**
- Created `frontend/lib/fakeData.js` with rich, realistic demo data for all 5 niches: audience metrics, affinity maps, sentiment analysis, and full AI insight reports
- Replaced BigQuery/backend API calls with fake data across all 4 dashboard components — eliminates HTTP 500 errors in demo mode

**Dashboard UI upgrades**
- `AudienceOverview`: sparkline trend bars and percentage trend indicators in the channel table and metric cards
- `SentimentTrends`: keyword sentiment upgraded to a ranked bar list with mention counts
- `InsightReport`: redesigned with split behavioral/marketing layout

**Landing page**
- `FeaturesGrid`: removed all emoji icons, replaced with large numbered typographic system (01–06)
- `Hero`: right panel replaced with a premium data visual (live metrics bars, stats grid — no emojis)
- Nav "Dashboard" CTA now routes through the `/login` gate

---

### docs: rewrite README to document full v1 API system (`92bb04e`)

Root `README.md` fully rewritten to cover: authentication, sandbox/production modes, all 9 endpoints, rate limit headers, environment variables, full project structure, Supabase setup SQL, and Week 3 checklist.

---

### feat: add versioned REST API with sandbox mode, Swagger docs, and developer portal (`bf7742f`)

Complete backend API layer and frontend developer portal.

**Backend — Express API (port 5000)**
- 7 REST routes under `/v1`: `audience/:niche`, `affinity/:niche`, `sentiment/:niche`, `insights/:niche`, `channels`, `keys`, `usage`
- `authenticate` middleware with in-memory sliding window rate limiting; `X-RateLimit-*` response headers (sandbox: 60 rpm, production: 120 rpm)
- Supabase-backed API key management: sandbox (`emp_sandbox_<32hex>`) and production (`emp_live_<32hex>`) keys, SHA-256 hashed at rest
- Deterministic sandbox data engine (`sandboxData.js`) covering all 5 niches — no BigQuery required for sandbox requests
- OpenAPI 3.0 spec served at `GET /v1/openapi.json`; Swagger UI at `GET /docs`
- BigQuery query helpers in `bigqueryHelpers.js`: `fetchNicheMetrics`, `fetchNicheSentiment`, `fetchChannels`
- Added `cors` and `helmet` to Express server

**Frontend — Developer portal**
- New `/developer` page: API key creation, lookup by email, revoke, and interactive code samples (cURL, Node, Python)
- Next.js API proxy routes: `pages/api/dev/keys.js` and `pages/api/dev/keys/[id].js`
- "Developers" link added to the landing page navigation

---

## 2026-05-25

### Add full enterprise landing page — 10 sections (`68da540`)

Built the full marketing landing page as modular React components:

| Component | Description |
|---|---|
| `Navigation` | Sticky blurred header, dark institutional style |
| `Hero` | Asymmetric layout, 3-stat grid, behavioral intelligence positioning |
| `ProblemSection` | Traditional vs Empirika comparison cards |
| `FeaturesGrid` | 6 platform feature cards with hover states |
| `SegmentationDeepDive` | 2-column, 100+ dimension messaging |
| `AffinityDeepDive` | 2-column reversed, cross-platform journey |
| `UseCases` | 4-column for Brands, Agencies, Research, AdTech |
| `WhyNow` | 6-column market timing grid |
| `FinalCTA` | Private beta demo request |
| `Footer` | EM300.co attribution link |

- Responsive breakpoints via inline `<style>`
- CSS variables for all colors, no `@apply` usage

---

### Fix Next.js 14 config and Tailwind brand color palette (`1d44f49`)

- Used `experimental.serverComponentsExternalPackages` (correct Next.js 14 API)
- Added `brand.300` and `brand.400` to the Tailwind color scale

---

## 2026-05-25 — Initial release

### Initial MVP build — full Empirika monorepo (`67cc8ea`)

Full monorepo scaffolded from scratch:

**Backend**
- YouTube Analytics ETL pipeline (`fetchAnalytics.js`)
- BigQuery schema and setup script (`schema.sql`, `setupBigQuery.js`)
- OAuth2 setup script (`setupAuth.js`)
- Affinity engine (`affinityEngine.js`)
- Claude insight generator (`insightGenerator.js`)
- TikTok and Reddit API integrations
- Express server (`server.js`)

**Frontend**
- Next.js 14 dashboard with 4 tabs: Audience Overview, Affinity Insights, Sentiment & Trends, AI Insight Report
- Landing page
- Next.js API proxy routes for all data endpoints
- `bigqueryClient.js` utility

**Infrastructure**
- `docker-compose.yml` for local dev and production
- `.env.example` files for backend and frontend
- Comprehensive README for each package
