/**
 * Empirika backend server.
 *
 * Routes:
 *   GET  /api/health              — health check
 *   GET  /docs                    — Swagger UI
 *   GET  /v1/openapi.json         — raw OpenAPI spec
 *   GET  /v1/audience/:niche      — audience metrics
 *   GET  /v1/affinity/:niche      — cross-niche affinity
 *   GET  /v1/sentiment/:niche     — community sentiment
 *   GET  /v1/insights/:niche      — AI insight reports
 *   GET  /v1/channels             — channel catalogue
 *   POST /v1/keys                 — create API key
 *   GET  /v1/keys                 — list keys by email
 *   DEL  /v1/keys/:id             — revoke key
 *   GET  /v1/usage                — usage analytics
 *   GET  /auth/youtube            — start YouTube OAuth
 *   GET  /auth/callback           — YouTube OAuth callback
 *   POST /api/admin/sync          — manual data sync
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import { getAuthUrl, exchangeCode } from '../lib/youtubeApi.js';
import { logger } from '../lib/logger.js';
import { openApiSpec } from '../openapi.js';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

// Routes
import audienceRouter  from '../routes/v1/audience.js';
import affinityRouter  from '../routes/v1/affinity.js';
import sentimentRouter from '../routes/v1/sentiment.js';
import insightsRouter  from '../routes/v1/insights.js';
import channelsRouter  from '../routes/v1/channels.js';
import keysRouter      from '../routes/v1/keys.js';
import usageRouter     from '../routes/v1/usage.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security & parsing ────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Disabled so Swagger UI loads correctly
}));

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://empirika-dashboard.vercel.app',
];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Swagger UI, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true,
}));

app.use(express.json());

// ── Swagger UI ────────────────────────────────────────────────────────
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
  customSiteTitle: 'Empirika API Docs',
  customCss: `
    .swagger-ui .topbar { background: #0a0a0a; }
    .swagger-ui .topbar-wrapper img { display: none; }
    .swagger-ui .topbar-wrapper::before {
      content: 'Empirika API';
      color: #3b82f6;
      font-size: 1.2rem;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
  `,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    tryItOutEnabled: true,
  },
}));

app.get('/v1/openapi.json', (req, res) => res.json(openApiSpec));

// ── Health check ──────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'empirika-backend', ts: new Date().toISOString() });
});

// ── v1 API routes ─────────────────────────────────────────────────────
app.use('/v1/audience',  audienceRouter);
app.use('/v1/affinity',  affinityRouter);
app.use('/v1/sentiment', sentimentRouter);
app.use('/v1/insights',  insightsRouter);
app.use('/v1/channels',  channelsRouter);
app.use('/v1/keys',      keysRouter);
app.use('/v1/usage',     usageRouter);

// ── YouTube OAuth ─────────────────────────────────────────────────────
app.get('/auth/youtube', (req, res) => {
  const accountKey = req.query.account || 'default';
  const url = getAuthUrl(accountKey);
  logger.info('Redirecting to OAuth consent', { accountKey });
  res.redirect(url);
});

app.get('/auth/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    logger.warn('OAuth denied by user', { error });
    return res.status(400).send(`<h1>Access denied</h1><p>${error}</p>`);
  }
  if (!code) return res.status(400).send('<h1>Missing auth code</h1>');

  try {
    const accountKey = state || 'default';
    await exchangeCode(code, accountKey);
    logger.info('OAuth tokens saved', { accountKey });
    res.send(`
      <h1>✅ Authorisation successful!</h1>
      <p>Account: <strong>${accountKey}</strong></p>
      <p>Tokens saved to <code>credentials/tokens.json</code>.</p>
      <p>You can close this tab.</p>
    `);
  } catch (err) {
    logger.error('OAuth callback failed', err);
    res.status(500).send(`<h1>Error</h1><pre>${err.message}</pre>`);
  }
});

// ── Admin: manual sync ────────────────────────────────────────────────
app.post('/api/admin/sync', async (req, res) => {
  const { days = 7, secret } = req.body;

  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  logger.info('Manual sync triggered', { days });
  res.json({ message: 'Sync started', days });

  try {
    execFileSync('node', [join(__dirname, 'fetchAnalytics.js'), '--days', String(days)], {
      stdio: 'inherit',
      timeout: 600_000,
    });
  } catch (err) {
    logger.error('Manual sync failed', err);
  }
});

// ── 404 catch-all ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'not_found', message: `No route for ${req.method} ${req.path}` });
});

// ── Start ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info('Empirika backend running', { port: PORT });
  console.log(`\n  Empirika Backend`);
  console.log(`  ─────────────────────────────────────────────`);
  console.log(`  Health:   http://localhost:${PORT}/api/health`);
  console.log(`  API Docs: http://localhost:${PORT}/docs`);
  console.log(`  OpenAPI:  http://localhost:${PORT}/v1/openapi.json`);
  console.log(`  Auth:     http://localhost:${PORT}/auth/youtube`);
  console.log(`  Sync:     POST http://localhost:${PORT}/api/admin/sync\n`);
});
