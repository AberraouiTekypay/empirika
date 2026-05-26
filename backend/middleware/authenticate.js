/**
 * API key authentication middleware.
 *
 * Accepts the key via:
 *   Authorization: Bearer emp_sandbox_xxx
 *   X-API-Key: emp_sandbox_xxx
 *
 * Sets req.apiKey (the DB record) and req.isSandbox on success.
 * Returns 401 on missing/invalid key, 429 on rate limit.
 */

import { validateApiKey, isSandboxKey } from '../lib/apiKeyManager.js';

// Simple in-memory rate limiter: { keyPrefix -> { count, windowStart } }
const rateLimitStore = new Map();

export async function authenticate(req, res, next) {
  const raw =
    req.headers['x-api-key'] ||
    (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '');

  if (!raw) {
    return res.status(401).json({
      error: 'missing_api_key',
      message: 'Provide your API key via X-API-Key header or Authorization: Bearer <key>.',
      docs: `${req.protocol}://${req.get('host')}/docs`,
    });
  }

  const keyRecord = await validateApiKey(raw);

  if (!keyRecord) {
    return res.status(401).json({
      error: 'invalid_api_key',
      message: 'The API key provided is invalid or has been revoked.',
      docs: `${req.protocol}://${req.get('host')}/docs`,
    });
  }

  // Rate limiting (per-minute sliding window)
  const now    = Date.now();
  const bucket = rateLimitStore.get(keyRecord.key_prefix) || { count: 0, windowStart: now };

  if (now - bucket.windowStart > 60_000) {
    bucket.count       = 0;
    bucket.windowStart = now;
  }

  bucket.count += 1;
  rateLimitStore.set(keyRecord.key_prefix, bucket);

  const limit     = keyRecord.rate_limit_rpm;
  const remaining = Math.max(0, limit - bucket.count);

  res.setHeader('X-RateLimit-Limit',     limit);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset',     Math.ceil((bucket.windowStart + 60_000) / 1000));

  if (bucket.count > limit) {
    return res.status(429).json({
      error: 'rate_limit_exceeded',
      message: `Rate limit of ${limit} requests/minute exceeded.`,
      retry_after: Math.ceil((bucket.windowStart + 60_000 - now) / 1000),
    });
  }

  req.apiKey    = keyRecord;
  req.isSandbox = isSandboxKey(raw) || keyRecord.environment === 'sandbox';
  req.rawKey    = raw;

  next();
}
