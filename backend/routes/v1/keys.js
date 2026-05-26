import { Router } from 'express';
import { createApiKey, listApiKeys, revokeApiKey } from '../../lib/apiKeyManager.js';
import { logger } from '../../lib/logger.js';

const router = Router();

/**
 * POST /v1/keys
 * Create a new API key. No authentication required (bootstrapping endpoint).
 * Body: { name, email, environment: 'sandbox' | 'production' }
 */
router.post('/', async (req, res) => {
  const { name, email, environment = 'sandbox' } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ error: 'missing_fields', message: '`name` and `email` are required' });
  }

  if (!email.includes('@') || email.length < 5) {
    return res.status(400).json({ error: 'invalid_email', message: 'Provide a valid email address' });
  }

  if (!['sandbox', 'production'].includes(environment)) {
    return res.status(400).json({
      error: 'invalid_environment',
      message: '`environment` must be "sandbox" or "production"',
    });
  }

  try {
    const { key, record } = await createApiKey({ name, email, environment });
    logger.info('API key created', { email, environment, keyPrefix: record.key_prefix });

    res.status(201).json({
      message: 'API key created. Store this key safely — it will not be shown again.',
      key,
      id:             record.id,
      key_prefix:     record.key_prefix,
      environment:    record.environment,
      rate_limit_rpm: record.rate_limit_rpm,
      created_at:     record.created_at,
    });
  } catch (err) {
    logger.error('Key creation failed', err, { email, environment });
    res.status(500).json({ error: 'internal_error', message: 'Failed to create API key' });
  }
});

/**
 * GET /v1/keys?email=...
 * List all active keys associated with an email address.
 */
router.get('/', async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({
      error: 'missing_email',
      message: 'Provide your email as the `email` query parameter',
    });
  }

  try {
    const keys = await listApiKeys(email);
    res.json({ keys });
  } catch (err) {
    logger.error('Key listing failed', err, { email });
    res.status(500).json({ error: 'internal_error', message: 'Failed to list API keys' });
  }
});

/**
 * DELETE /v1/keys/:id
 * Revoke a key. Requires email in body to confirm ownership.
 * Body: { email }
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({
      error: 'missing_email',
      message: 'Provide your email in the request body to confirm ownership',
    });
  }

  try {
    await revokeApiKey(id, email);
    logger.info('API key revoked', { id, email });
    res.json({ message: 'Key revoked successfully', id });
  } catch (err) {
    logger.error('Key revocation failed', err, { id, email });
    res.status(500).json({ error: 'internal_error', message: 'Failed to revoke API key' });
  }
});

export default router;
