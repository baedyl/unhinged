import { auth } from '@clerk/nextjs/server';
import { createServiceClient, getOrCreateProfile } from '@/lib/supabase-server';

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, age, neighbourhood, language_preference, _step } = body;

    const supabase = createServiceClient();
    const profile = await getOrCreateProfile(userId);

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (age !== undefined) updates.age = age;
    if (neighbourhood !== undefined) updates.neighbourhood = neighbourhood;
    if (language_preference !== undefined) updates.language_preference = language_preference;
    if (_step !== undefined) {
      updates.onboarding_step = Math.max(profile.onboarding_step ?? 0, _step);
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id)
      .select()
      .single();

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ profile: data });
  } catch (err) {
    console.error('[PATCH /api/profile]', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
