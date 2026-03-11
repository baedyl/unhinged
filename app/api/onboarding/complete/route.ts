import { auth } from '@clerk/nextjs/server';
import { createServiceClient, getOrCreateProfile } from '@/lib/supabase-server';

/** PATCH — mark onboarding complete (onboarding_step = 5) */
export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createServiceClient();
    const profile = await getOrCreateProfile(userId);

    if ((profile.photo_urls ?? []).length === 0) {
      return Response.json({ error: 'At least one photo is required' }, { status: 400 });
    }

    await supabase
      .from('profiles')
      .update({ onboarding_step: 5 })
      .eq('id', profile.id);

    return Response.json({ ok: true });
  } catch (err) {
    console.error('[PATCH /api/onboarding/complete]', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
