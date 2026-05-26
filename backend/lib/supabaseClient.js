import { createClient } from '@supabase/supabase-js';

let _client = null;

export function getSupabaseClient() {
  if (!_client) {
    const url  = process.env.SUPABASE_URL;
    const key  = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env');
    }

    _client = createClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return _client;
}
