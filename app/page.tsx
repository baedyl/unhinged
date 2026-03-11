import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getProfileByClerkId } from '@/lib/profiles';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-bold text-white mb-4">Unhinged</h1>
        <p className="text-zinc-400 mb-8 text-center max-w-md">
        Real people. Real spots. Pre-paid vibes.
        </p>
        <div className="flex gap-4">
          <Link href="/auth">
            <Button size="lg">Sign in</Button>
          </Link>
          <Link href="/auth?signUp=true">
            <Button variant="outline" size="lg">Sign up</Button>
          </Link>
        </div>
      </div>
    );
  }

  const profile = await getProfileByClerkId(userId);
  if (!profile || (profile.onboarding_step ?? 0) < 5) {
    const step = Math.min((profile?.onboarding_step ?? 0) + 1, 5);
    redirect(`/onboarding/${step}`);
  }
  redirect('/dashboard');
}
