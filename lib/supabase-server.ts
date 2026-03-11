import { createClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client — bypasses RLS.
 * Use only in server-side code (API routes, Server Components, middleware).
 * Never expose this to the browser.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.'
    );
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Helper: get profile row by Clerk user ID. Returns null if not found. */
export async function getProfileByClerkId(clerkId: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data ?? null;
}

/** Helper: get or create profile by Clerk user ID. */
export async function getOrCreateProfile(clerkId: string) {
  const existing = await getProfileByClerkId(clerkId);
  if (existing) return existing;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: crypto.randomUUID(), clerk_id: clerkId, onboarding_step: 0 })
    .select()
    .single();
  if (error) throw error;
  return data;
}
