'use client';

import { SignIn, SignUp } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { clerkDarkAppearance } from '@/lib/clerk-appearance';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const isSignUp = searchParams.get('signUp') === 'true';
  const t = useTranslations('auth');

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-white mb-6">
          {isSignUp ? t('signUpTitle') : t('signInTitle')}
        </h1>
        {isSignUp ? (
          <SignUp
            signInUrl="/auth"
            signInFallbackRedirectUrl="/onboarding"
            fallbackRedirectUrl="/onboarding"
            appearance={clerkDarkAppearance}
          />
        ) : (
          <SignIn
            signUpUrl="/auth?signUp=true"
            fallbackRedirectUrl="/onboarding"
            appearance={clerkDarkAppearance}
          />
        )}
      </div>
    </div>
  );
}
