import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
  const locale = (localeCookie === 'fr' || localeCookie === 'en' ? localeCookie : 'en') as Locale;

  const messages = (await import(`../locales/${locale}.json`)).default;
  return {
    locale,
    messages,
  };
});
