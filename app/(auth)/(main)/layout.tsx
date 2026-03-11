import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { MainNav } from '@/components/auth/MainNav';
import { getProfileByClerkId } from '@/lib/supabase-server';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/auth');

  // Guard: user must have completed onboarding (step 5)
  const profile = await getProfileByClerkId(userId);

  if (!profile || (profile.onboarding_step ?? 0) < 5) {
    const nextStep = profile ? Math.min((profile.onboarding_step ?? 0) + 1, 5) : 1;
    redirect(`/onboarding/${nextStep}`);
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <MainNav userId={userId} />
      {children}
    </div>
  );
}
