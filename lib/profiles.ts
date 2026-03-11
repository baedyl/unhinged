import { supabase } from '@/lib/supabase';
import type { DbProfile, ProfileInsert } from '@/types/database';

/** Look up a profile by Clerk user ID (stored in `clerk_id` column). */
export async function getProfileByClerkId(clerkId: string): Promise<DbProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as DbProfile;
}

/** Upsert by Supabase auth UUID (primary key). */
export async function upsertProfile(profile: ProfileInsert): Promise<DbProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        ...profile,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data as DbProfile;
}

/** Fetch other profiles for matching (excluding current Supabase UUID). */
export async function getMatchesForUser(
  supabaseUserId: string,
  limit = 20
): Promise<DbProfile[]> {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .neq('id', supabaseUserId)
    .not('name', 'is', null)
    .limit(limit);
  if (error) throw error;
  return profiles as DbProfile[];
}
