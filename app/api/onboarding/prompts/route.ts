import { auth } from '@clerk/nextjs/server';
import { createServiceClient, getOrCreateProfile } from '@/lib/supabase-server';

/** POST body: { answers: Array<{ prompt_id: string; answer: string }> } */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { answers } = await req.json() as {
      answers: Array<{ prompt_id: string; answer: string }>;
    };

    if (!Array.isArray(answers) || answers.length === 0) {
      return Response.json({ error: 'answers array required' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const profile = await getOrCreateProfile(userId);

    // Upsert each answer (prompt_id is a UUID string matching the live DB)
    for (const { prompt_id, answer } of answers) {
      if (!answer?.trim()) continue;
      const { error } = await supabase.from('user_prompt_answers').upsert(
        {
          user_id: profile.id,
          prompt_id,
          answer_text: answer.trim().slice(0, 280),
        },
        { onConflict: 'user_id,prompt_id' }
      );
      if (error) return Response.json({ error: error.message }, { status: 500 });
    }

    // Advance onboarding step
    await supabase
      .from('profiles')
      .update({ onboarding_step: Math.max(profile.onboarding_step ?? 0, 4) })
      .eq('id', profile.id);

    return Response.json({ ok: true });
  } catch (err) {
    console.error('[POST /api/onboarding/prompts]', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
