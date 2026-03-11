import { auth } from '@clerk/nextjs/server';
import { createServiceClient, getOrCreateProfile } from '@/lib/supabase-server';

/** POST body: { slugs: string[] } */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { slugs } = await req.json() as { slugs: string[] };
    if (!Array.isArray(slugs) || slugs.length < 5 || slugs.length > 12) {
      return Response.json({ error: 'Select between 5 and 12 interests' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const profile = await getOrCreateProfile(userId);

    // Resolve slugs → UUIDs
    const { data: interests, error: interestErr } = await supabase
      .from('interests')
      .select('id, slug')
      .in('slug', slugs);
    if (interestErr) return Response.json({ error: interestErr.message }, { status: 500 });

    // Replace user's interests atomically
    await supabase.from('user_interests').delete().eq('user_id', profile.id);

    const rows = (interests ?? []).map((i) => ({ user_id: profile.id, interest_id: i.id }));
    if (rows.length > 0) {
      const { error: insertErr } = await supabase.from('user_interests').insert(rows);
      if (insertErr) return Response.json({ error: insertErr.message }, { status: 500 });
    }

    // Advance onboarding step
    await supabase
      .from('profiles')
      .update({ onboarding_step: Math.max(profile.onboarding_step ?? 0, 3) })
      .eq('id', profile.id);

    return Response.json({ ok: true, count: rows.length });
  } catch (err) {
    console.error('[POST /api/onboarding/interests]', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
