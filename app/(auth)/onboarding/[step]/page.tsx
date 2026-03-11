import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServiceClient, getOrCreateProfile } from '@/lib/supabase-server';
import { OnboardingClient } from './_client';

export default async function OnboardingStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step: stepStr } = await params;
  const step = Math.max(1, Math.min(5, parseInt(stepStr) || 1));

  const { userId } = await auth();
  if (!userId) redirect('/auth');

  const supabase = createServiceClient();
  const profile = await getOrCreateProfile(userId);

  // Guard: if already complete, send to dashboard
  if (profile.onboarding_step >= 5) redirect('/dashboard');

  // Guard: can't skip steps
  const maxAllowedStep = Math.min((profile.onboarding_step ?? 0) + 1, 5);
  if (step > maxAllowedStep) redirect(`/onboarding/${maxAllowedStep}`);

  // Fetch supplementary data per step
  let selectedSlugs: string[] = [];
  if (step === 3) {
    const { data } = await supabase
      .from('user_interests')
      .select('interests(slug)')
      .eq('user_id', profile.id);
    selectedSlugs = (data ?? []).flatMap((row: { interests: unknown }) => {
      const i = row.interests as { slug: string } | null;
      return i ? [i.slug] : [];
    });
  }

  let dbPrompts: Array<{ id: string; slug: string; text_en: string; text_fr: string }> = [];
  let promptAnswers: Record<string, string> = {};
  if (step === 4) {
    const { data: promptRows } = await supabase
      .from('prompts')
      .select('id, slug, text_en, text_fr')
      .eq('is_active', true);
    dbPrompts = promptRows ?? [];

    const { data: answerRows } = await supabase
      .from('user_prompt_answers')
      .select('prompt_id, answer_text')
      .eq('user_id', profile.id);
    promptAnswers = Object.fromEntries((answerRows ?? []).map((r) => [r.prompt_id, r.answer_text]));
  }

  const serialisedProfile = {
    id: profile.id,
    name: profile.name ?? '',
    age: profile.age ?? null,
    neighbourhood: profile.neighbourhood ?? '',
    photo_urls: profile.photo_urls ?? [],
    onboarding_step: profile.onboarding_step ?? 0,
  };

  return (
    <OnboardingClient
      step={step}
      profile={serialisedProfile}
      selectedSlugs={selectedSlugs}
      dbPrompts={dbPrompts}
      promptAnswers={promptAnswers}
    />
  );
}
