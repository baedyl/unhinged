'use client';

import Link from 'next/link';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/auth/LanguageSwitcher';
import { LogOut, LayoutDashboard, UserPlus } from 'lucide-react';

export function MainNav({ userId }: { userId: string }) {
  const t = useTranslations('common');
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          {t('appName')}
        </Link>
        <nav className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link href="/onboarding">
            <Button variant="ghost" size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              {t('onboarding')}
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              {t('dashboard')}
            </Button>
          </Link>
          <SignOutButton>
            <Button variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              {t('signOut')}
            </Button>
          </SignOutButton>
        </nav>
      </div>
    </header>
  );
}
