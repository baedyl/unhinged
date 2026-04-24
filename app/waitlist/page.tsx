'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

/* ─── Constants ─────────────────────────────────────────────────────────── */
const TOTAL_SPOTS = 47;
const ORANGE = '#FF7518';

/* ─── Schema ─────────────────────────────────────────────────────────────── */
function buildSchema(t: ReturnType<typeof useTranslations>) {
  return z.object({
    email: z.string().email(t('validationEmail')),
    neighbourhood: z.string().min(1, t('validationNeighbourhood')),
    vibe_check: z
      .string()
      .min(1, t('validationVibeCheck'))
      .min(10, t('validationVibeCheckMin')),
    hot_take: z
      .string()
      .optional()
      .refine((v) => !v || v.length === 0 || v.length >= 10, {
        message: t('validationHotTakeMin'),
      }),
  });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

/* ─── Language switcher helper ───────────────────────────────────────────── */
function LanguageToggle({ locale }: { locale: string }) {
  function switchTo(next: 'en' | 'fr') {
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000`;
    window.location.reload();
  }
  return (
    <div className="flex gap-1 text-xs font-bold">
      <button
        onClick={() => switchTo('en')}
        className={`px-3 py-1 rounded transition-colors ${
          locale === 'en'
            ? 'text-white'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
        style={locale === 'en' ? { backgroundColor: ORANGE } : {}}
      >
        EN
      </button>
      <button
        onClick={() => switchTo('fr')}
        className={`px-3 py-1 rounded transition-colors ${
          locale === 'fr'
            ? 'text-white'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
        style={locale === 'fr' ? { backgroundColor: ORANGE } : {}}
      >
        FR
      </button>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function WaitlistPage() {
  const t = useTranslations('waitlist');
  const locale = useLocale();
  const schema = buildSchema(t);

  const [submitted, setSubmitted] = useState(false);
  const [position, setPosition] = useState<number | null>(null);
  const [userNeighbourhood, setUserNeighbourhood] = useState('');
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);

  /* ─── Real-time spots counter ─────────────────────────────────────────── */
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function fetchCount() {
      const { count } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true });
      setSpotsLeft(Math.max(0, TOTAL_SPOTS - (count ?? 0)));
    }

    fetchCount();
    channel = supabase
      .channel('waitlist-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'waitlist' }, fetchCount)
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  /* ─── Form ────────────────────────────────────────────────────────────── */
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', neighbourhood: '', vibe_check: '', hot_take: '' },
  });

  const vibeCheck = watch('vibe_check');
  const vibeToastShown = useRef(false);

  /* real-time vibe check warning */
  useEffect(() => {
    if (vibeCheck && vibeCheck.length > 0 && vibeCheck.length < 10) {
      if (!vibeToastShown.current) {
        vibeToastShown.current = true;
        toast.warning(t('vibeCheckWarning'), { id: 'vibe-warning', duration: 3500 });
      }
    } else {
      vibeToastShown.current = false;
    }
  }, [vibeCheck, t]);

  const onSubmit = async (data: FormValues) => {
    // Generate a verification token before insert so the edge function
    // can read it directly from the webhook record — no extra DB round-trip needed.
    const verificationToken = crypto.randomUUID();

    // Insert row
    const { error } = await supabase.from('waitlist').insert({
      email: data.email,
      neighbourhood: data.neighbourhood,
      vibe_check: data.vibe_check,
      hot_take: data.hot_take || null,
      status: data.neighbourhood, // keep legacy column populated
      verification_token: verificationToken,
    });

    if (error) {
      toast.error(error.code === '23505' ? t('errorDuplicate') : t('errorGeneric'));
      return;
    }

    // Get position (total count)
    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    setPosition(count ?? null);
    setUserNeighbourhood(data.neighbourhood);
    setSubmitted(true);
  };

  /* ─── Success state ────────────────────────────────────────────────────── */
  if (submitted) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex flex-col">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-4 md:px-12">
          <Logo />
          <LanguageToggle locale={locale} />
        </nav>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-center">
            <CardContent className="pt-10 pb-10 px-8 flex flex-col items-center gap-6">
              {/* Green check */}
              <div className="w-16 h-16 rounded-full border-2 border-green-500 flex items-center justify-center">
                <CheckCircle2 className="text-green-500" size={36} />
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold tracking-tight text-white">
                  {t('successTitle')}
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {t('successSubtitle')}
                </p>
              </div>

              {/* Position card */}
              {position !== null && (
                <div className="w-full rounded-xl bg-zinc-800 py-6 flex flex-col items-center gap-2">
                  <span
                    className="text-5xl font-extrabold tracking-tight"
                    style={{ color: ORANGE }}
                  >
                    {t('positionPrefix')}{position}
                  </span>
                  <span className="text-zinc-400 text-sm">{t('positionSuffix')}</span>
                  {userNeighbourhood && (
                    <span
                      className="mt-1 text-xs font-bold px-3 py-1 rounded-full"
                      style={{ backgroundColor: ORANGE, color: '#fff' }}
                    >
                      🏘 {userNeighbourhood}
                    </span>
                  )}
                </div>
              )}

              {/* Share nudge */}
              <div className="space-y-1 pt-2">
                <p className="font-bold text-white text-sm">{t('shareTitle')}</p>
                <p className="text-zinc-400 text-xs leading-relaxed">{t('shareText')}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Footer t={t} />
      </main>
    );
  }

  /* ─── Default state ─────────────────────────────────────────────────────── */
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12">
        <Logo />
        <LanguageToggle locale={locale} />
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 pt-8 pb-6 text-center">
        {/* FOMO pill */}
        <div
          className="inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full mb-8"
          style={{ backgroundColor: ORANGE, color: '#fff' }}
        >
          <span className="w-2 h-2 rounded-full bg-white opacity-80 animate-pulse" />
          {t('betaBadge')}
        </div>

        {/* Big headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-4">
          <span className="block">{t('heroTitle')}</span>
          <span className="block">{t('heroTitleLine2')}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-zinc-400 text-base md:text-lg max-w-xl mb-8 leading-relaxed">
          {t('heroSubtitle')}
        </p>

        {/* Value prop badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {(['badge1', 'badge2', 'badge3'] as const).map((key) => (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 border border-zinc-700 bg-zinc-900 text-zinc-300 text-xs font-medium px-4 py-2 rounded-full"
            >
              {key === 'badge1' && '🧠'}
              {key === 'badge2' && '💸'}
              {key === 'badge3' && '🚫'}
              {t(key)}
            </span>
          ))}
        </div>

        {/* Spots counter */}
        {spotsLeft !== null && (
          <p className="text-sm mb-6" style={{ color: ORANGE }}>
            {t('spotsLeft', { count: spotsLeft })}
          </p>
        )}

        {/* Form card */}
        <Card className="w-full max-w-lg bg-zinc-900 border-zinc-800">
          <CardContent className="pt-5 pb-6 px-5 space-y-4">
            <p className="text-xs text-zinc-500 tracking-widest font-semibold uppercase">
              {t('formTitle')}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              {/* Email + Neighbourhood row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-orange-500 h-10"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div className="sm:w-44">
                  <Select
                    placeholder={t('neighbourhoodPlaceholder')}
                    className="bg-zinc-800 border-zinc-700 text-white h-10"
                    defaultValue=""
                    {...register('neighbourhood')}
                  >
                    <option value="St-Henri">{t('neighbourhoodStHenri')}</option>
                    <option value="Plateau">{t('neighbourhoodPlateau')}</option>
                    <option value="Mile-End">{t('neighbourhoodMileEnd')}</option>
                    <option value="Verdun">{t('neighbourhoodVerdun')}</option>
                    <option value="Rosemont">{t('neighbourhoodRosemont')}</option>
                    <option value="Other">{t('neighbourhoodOther')}</option>
                  </Select>
                  {errors.neighbourhood && (
                    <p className="text-red-400 text-xs mt-1">{errors.neighbourhood.message}</p>
                  )}
                </div>
              </div>

              {/* Vibe Check */}
              <div>
                <Input
                  placeholder={t('vibeCheckPlaceholder')}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-orange-500 h-10"
                  {...register('vibe_check')}
                />
                {errors.vibe_check && (
                  <p className="text-red-400 text-xs mt-1">{errors.vibe_check.message}</p>
                )}
              </div>

              {/* Hot Take */}
              <div>
                <Textarea
                  placeholder={t('hotTakePlaceholder')}
                  rows={2}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-orange-500 resize-none"
                  {...register('hot_take')}
                />
                {errors.hot_take && (
                  <p className="text-red-400 text-xs mt-1">{errors.hot_take.message}</p>
                )}
              </div>

              {/* CTA button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-base font-bold text-white rounded-lg transition-transform active:scale-95 hover:brightness-110 disabled:opacity-60"
                style={{ backgroundColor: ORANGE }}
              >
                {isSubmitting ? t('submitting') : t('submitButton')}
              </Button>
            </form>

            <p className="text-zinc-600 text-xs text-center">{t('formDisclaimer')}</p>
          </CardContent>
        </Card>
      </section>

      <Footer t={t} />
    </main>
  );
}

/* ─── Shared sub-components ──────────────────────────────────────────────── */
function Logo() {
  return (
    <span className="text-xl font-extrabold tracking-tight italic select-none">
      <span style={{ color: ORANGE }}>un</span>
      <span className="text-white">hinged</span>
    </span>
  );
}

function Footer({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <footer className="text-center pb-8 pt-6">
      <p className="text-zinc-700 text-xs tracking-widest font-medium">{t('footer')}</p>
    </footer>
  );
}
