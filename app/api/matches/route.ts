import { auth } from '@clerk/nextjs/server';
import { createServiceClient } from '@/lib/supabase-server';
import type { MatchResult } from '@/types/database';

/** GET — return ranked matches via RPC */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createServiceClient();

    const { data, error } = await supabase.rpc('get_matches', { p_clerk_id: userId });
    if (error) return Response.json({ error: error.message }, { status: 500 });

    const matches: MatchResult[] = Array.isArray(data) ? data : [];
    return Response.json({ matches });
  } catch (err) {
    console.error('[GET /api/matches]', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
