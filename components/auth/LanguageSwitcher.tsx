'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const t = useTranslations('common');
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();

  const toggle = () => {
    const next = locale === 'en' ? 'fr' : 'en';
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000`;
    router.refresh();
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggle} className="gap-1">
      <Languages className="h-4 w-4" />
      <span className="sr-only">{t('language')}</span>
      {locale === 'en' ? t('french') : t('english')}
    </Button>
  );
}
