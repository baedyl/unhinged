'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ChatStubPage() {
  const params = useParams();
  const t = useTranslations('chat');
  const matchId = params.matchId as string;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <header className="border-b border-zinc-800 p-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold text-white">{t('title')}</h1>
      </header>
      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-zinc-400 text-center">
          {t('stub')} {matchId}
        </p>
      </div>
    </div>
  );
}
