/**
 * Empirika backend server.
 *
 * Responsibilities:
 *   - YouTube OAuth2 callback handler (one-time setup)
 *   - Health check endpoint
 *   - Admin: manual data sync trigger
 *
 * Most data API routes live in the Next.js frontend (pages/api/).
 * This server handles auth and admin ops that need server-side secrets.
 */

import 'dotenv/config';
import express from 'express';
import { getAuthUrl, exchangeCode } from '../lib/youtubeApi.js';
import { logger } from '../lib/logger.js';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Allow Next.js frontend to call this server (CORS)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// ------------------------------------------------------------------
// Health check
// ------------------------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'empirika-backend', ts: new Date().toISOString() });
});

// ------------------------------------------------------------------
// YouTube OAuth2 flow
// ------------------------------------------------------------------

/**
 * GET /auth/youtube?account=default
 * Redirect browser here to start OAuth consent for a channel owner.
 */
app.get('/auth/youtube', (req, res) => {
  const accountKey = req.query.account || 'default';
  const url = getAuthUrl(accountKey);
  logger.info('Redirecting to OAuth consent', { accountKey });
  res.redirect(url);
});

/**
 * GET /auth/callback?code=...&state=...
 * Google redirects here after consent. Exchanges code for tokens.
 */
app.get('/auth/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    logger.warn('OAuth denied by user', { error });
    return res.status(400).send(`<h1>Access denied</h1><p>${error}</p>`);
  }

  if (!code) {
    return res.status(400).send('<h1>Missing auth code</h1>');
  }

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

// ------------------------------------------------------------------
// Admin: manual sync
// ------------------------------------------------------------------

/**
 * POST /api/admin/sync
 * Triggers a manual data fetch. Protected by a simple shared secret.
 * Body: { days: 7, secret: "..." }
 */
app.post('/api/admin/sync', async (req, res) => {
  const { days = 7, secret } = req.body;

  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  logger.info('Manual sync triggered', { days });

  res.json({ message: 'Sync started', days });

  // Run in background (don't await — fire and forget)
  try {
    execFileSync('node', [join(__dirname, 'fetchAnalytics.js'), '--days', String(days)], {
      stdio: 'inherit',
      timeout: 600_000, // 10 min max
    });
  } catch (err) {
    logger.error('Manual sync failed', err);
  }
});

// ------------------------------------------------------------------
// Start
// ------------------------------------------------------------------

app.listen(PORT, () => {
  logger.info(`Empirika backend running`, { port: PORT });
  console.log(`\n  Empirika Backend`);
  console.log(`  ─────────────────────────────────────`);
  console.log(`  Health:   http://localhost:${PORT}/api/health`);
  console.log(`  Auth:     http://localhost:${PORT}/auth/youtube`);
  console.log(`  Sync:     POST http://localhost:${PORT}/api/admin/sync\n`);
});
