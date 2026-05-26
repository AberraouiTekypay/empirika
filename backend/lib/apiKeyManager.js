/**
 * API Key lifecycle management.
 *
 * Key format:
 *   Sandbox:    emp_sandbox_<32 hex chars>
 *   Production: emp_live_<32 hex chars>
 *
 * Storage: only the SHA-256 hash is persisted.
 * The plaintext key is shown once at creation time.
 */

import { createHash, randomBytes } from 'crypto';
import { getSupabaseClient } from './supabaseClient.js';
import { logger } from './logger.js';

const PREFIX_SANDBOX = 'emp_sandbox_';
const PREFIX_LIVE    = 'emp_live_';

// ── Key generation ────────────────────────────────────────────────

/**
 * Generate a new API key, persist its hash, return the plaintext key once.
 *
 * @param {{ name: string, email: string, environment: 'sandbox'|'production' }} opts
 * @returns {Promise<{ key: string, record: object }>}
 */
export async function createApiKey({ name, email, environment = 'sandbox' }) {
  const prefix  = environment === 'production' ? PREFIX_LIVE : PREFIX_SANDBOX;
  const secret  = randomBytes(16).toString('hex');      // 32 hex chars
  const fullKey = `${prefix}${secret}`;
  const hash    = hashKey(fullKey);
  const displayPrefix = fullKey.slice(0, fullKey.indexOf('_', prefix.length - 1) + 9); // e.g. emp_sandbox_ab12

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      key_hash:   hash,
      key_prefix: fullKey.slice(0, 20),   // first 20 chars for lookup / display
      name,
      email,
      environment,
      scopes:      ['read'],
      rate_limit_rpm: environment === 'production' ? 120 : 60,
    })
    .select()
    .single();

  if (error) {
    logger.error('Failed to create API key', error, { email, environment });
    throw new Error('Could not create API key');
  }

  return { key: fullKey, record: data };
}

// ── Key validation ────────────────────────────────────────────────

/**
 * Validate an incoming API key. Returns the key record or null.
 *
 * @param {string} rawKey
 * @returns {Promise<object|null>}
 */
export async function validateApiKey(rawKey) {
  if (!rawKey || typeof rawKey !== 'string') return null;
  if (!rawKey.startsWith(PREFIX_SANDBOX) && !rawKey.startsWith(PREFIX_LIVE)) return null;

  const hash = hashKey(rawKey);
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key_hash', hash)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !data) return null;

  // Update last_used_at (fire and forget)
  supabase.from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id)
    .then(() => {});

  return data;
}

// ── Key listing ───────────────────────────────────────────────────

export async function listApiKeys(email) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('api_keys')
    .select('id, key_prefix, name, email, environment, scopes, is_active, rate_limit_rpm, created_at, last_used_at')
    .eq('email', email)
    .order('created_at', { ascending: false });

  if (error) throw new Error('Could not list keys');
  return data;
}

// ── Key revocation ────────────────────────────────────────────────

export async function revokeApiKey(id, email) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('api_keys')
    .update({ is_active: false })
    .eq('id', id)
    .eq('email', email);   // ensure owner can only revoke their own

  if (error) throw new Error('Could not revoke key');
}

// ── Usage logging ─────────────────────────────────────────────────

export async function logUsage({ keyId, keyPrefix, environment, endpoint, method, niche, statusCode, responseMs, ip, userAgent }) {
  const supabase = getSupabaseClient();
  // Fire-and-forget; don't block the response
  supabase.from('api_usage').insert({
    key_id:      keyId,
    key_prefix:  keyPrefix,
    environment,
    endpoint,
    method,
    niche:       niche || null,
    status_code: statusCode,
    response_ms: responseMs,
    ip_address:  ip || null,
    user_agent:  userAgent || null,
  }).then(() => {});
}

export async function getUsageSummary(keyId) {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from('api_usage')
    .select('endpoint, status_code, response_ms, created_at, niche')
    .eq('key_id', keyId)
    .order('created_at', { ascending: false })
    .limit(200);
  return data || [];
}

// ── Utilities ─────────────────────────────────────────────────────

function hashKey(key) {
  return createHash('sha256').update(key).digest('hex');
}

export function isSandboxKey(key) {
  return typeof key === 'string' && key.startsWith(PREFIX_SANDBOX);
}
