import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateProfile } from '@/lib/supabase-server';

export default async function OnboardingIndexPage() {
  const { userId } = await auth();
  if (!userId) redirect('/auth');

  const profile = await getOrCreateProfile(userId);
  const nextStep = Math.min((profile.onboarding_step ?? 0) + 1, 5);

  if ((profile.onboarding_step ?? 0) >= 5) redirect('/dashboard');

  redirect(`/onboarding/${nextStep}`);
}
