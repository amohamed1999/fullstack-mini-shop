import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

/**
 * Public client — respects RLS, uses anon key.
 * Use for most read operations.
 */
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

/**
 * Service-role client — bypasses RLS.
 * Use ONLY for privileged server-side operations (seeding, admin writes).
 */
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

/**
 * Returns a Supabase client authenticated as the requesting user.
 * Pass the raw Authorization header value (e.g. "Bearer <jwt>").
 */
export function createUserClient(authHeader: string) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: authHeader },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
