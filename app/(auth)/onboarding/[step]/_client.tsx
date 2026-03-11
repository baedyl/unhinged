'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

/* ─── Constants ──────────────────────────────────────────────────────────── */
const ORANGE = '#FF7518';
const MAX_PHOTOS = 4;
const TOTAL_STEPS = 5;

const NEIGHBOURHOODS = [
  'St-Henri', 'Plateau', 'Mile-End', 'Verdun', 'Rosemont',
  'Outremont', 'NDG', 'Hochelaga', 'Villeray', 'Other',
];

/* Interests by category (matches seed data) */
const INTERESTS = [
  { slug: 'poutine-connoisseur',   label_en: 'Poutine connoisseur',    label_fr: 'Connaisseur de poutine',           category: 'food' },
  { slug: 'terrasse-hopper',       label_en: 'Terrasse hopper',         label_fr: 'Sauteur de terrasses',             category: 'food' },
  { slug: 'bagel-debate-veteran',  label_en: 'Bagel debate veteran',    label_fr: 'Vétéran du débat bagel',           category: 'food' },
  { slug: 'marche-atwater-regular',label_en: 'Marché Atwater regular',  label_fr: 'Habitué du Marché Atwater',        category: 'food' },
  { slug: 'brunch-queue-warrior',  label_en: 'Brunch queue warrior',    label_fr: 'Guerrier de la file de brunch',    category: 'food' },
  { slug: 'mount-royal-picnic-pro',label_en: 'Mount Royal picnic pro',  label_fr: 'Pro des pique-niques au Mont-Royal', category: 'outdoors' },
  { slug: 'lachine-canal-cyclist', label_en: 'Lachine Canal cyclist',   label_fr: 'Cycliste du Canal Lachine',        category: 'outdoors' },
  { slug: 'parc-lafontaine-lounger',label_en:'Parc Lafontaine lounger', label_fr: 'Flâneur du Parc Lafontaine',       category: 'outdoors' },
  { slug: 'bixi-commuter',         label_en: 'Bixi commuter',           label_fr: 'Navetteur Bixi',                   category: 'outdoors' },
  { slug: 'jazz-fest-regular',     label_en: 'Jazz Fest regular',       label_fr: 'Habitué du Festival de Jazz',      category: 'culture' },
  { slug: 'osheaga-survivor',      label_en: 'Osheaga survivor',        label_fr: 'Survivant d\'Osheaga',             category: 'culture' },
  { slug: 'just-for-laughs-fan',   label_en: 'Just for Laughs fan',     label_fr: 'Fan de Just for Laughs',           category: 'culture' },
  { slug: 'fringe-theatre-goer',   label_en: 'Fringe theatre-goer',     label_fr: 'Amateur de théâtre Fringe',        category: 'culture' },
  { slug: 'dep-wine-enthusiast',   label_en: 'Dép wine enthusiast',     label_fr: 'Amateur de vins de dépanneur',     category: 'nightlife' },
  { slug: 'plateau-bar-hopper',    label_en: 'Plateau bar hopper',      label_fr: 'Barman du Plateau',                category: 'nightlife' },
  { slug: 'karaoke-devotee',       label_en: 'Karaoke devotee',         label_fr: 'Dévot du karaoké',                 category: 'nightlife' },
  { slug: 'second-hand-shopper',   label_en: 'Second-hand shopper',     label_fr: 'Acheteur de seconde main',         category: 'lifestyle' },
  { slug: 'bilingual-mixer',       label_en: 'Bilingual mixer',         label_fr: 'Mélangeur bilingue',               category: 'lifestyle' },
  { slug: 'hockey-watcher',        label_en: 'Hockey watcher',          label_fr: 'Amateur de hockey',                category: 'sports' },
  { slug: 'st-henri-local',        label_en: 'St-Henri local',          label_fr: 'Local de St-Henri',                category: 'neighbourhood' },
] as const;

const CATEGORY_LABELS: Record<string, { en: string; fr: string }> = {
  food:         { en: 'FOOD',         fr: 'ALIMENTATION' },
  outdoors:     { en: 'OUTDOORS',     fr: 'PLEIN AIR'    },
  culture:      { en: 'CULTURE',      fr: 'CULTURE'      },
  nightlife:    { en: 'NIGHTLIFE',    fr: 'SORTIES'      },
  lifestyle:    { en: 'LIFESTYLE',    fr: 'STYLE DE VIE' },
  sports:       { en: 'SPORTS',       fr: 'SPORTS'       },
  neighbourhood:{ en: 'NEIGHBOURHOOD',fr: 'QUARTIER'     },
};

/* ─── Shared types ───────────────────────────────────────────────────────── */
interface ProfileSnap {
  id: string;
  name: string;
  age: number | null;
  neighbourhood: string;
  photo_urls: string[];
  onboarding_step: number;
}

export interface DbPrompt {
  id: string;
  slug: string;
  text_en: string;
  text_fr: string;
}

export interface OnboardingClientProps {
  step: number;
  profile: ProfileSnap;
  selectedSlugs: string[];
  dbPrompts: DbPrompt[];
  promptAnswers: Record<string, string>;
}

/* ─── Shell ──────────────────────────────────────────────────────────────── */
export function OnboardingClient({ step, profile, selectedSlugs, dbPrompts, promptAnswers }: OnboardingClientProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4">
        <Logo />
        <span className="text-xs text-zinc-500 font-medium tracking-widest">
          STEP {step} OF {TOTAL_STEPS}
        </span>
      </nav>
      {/* Divider */}
      <div className="h-px bg-zinc-800 mx-6" />

      <div className="flex-1 flex flex-col items-center justify-start px-4 py-10">
        <div className="w-full max-w-xl">
          {step === 1 && <Step1 profile={profile} />}
          {step === 2 && <Step2 profile={profile} />}
          {step === 3 && <Step3 profile={profile} initialSlugs={selectedSlugs} />}
          {step === 4 && <Step4 profile={profile} prompts={dbPrompts} initialAnswers={promptAnswers} />}
          {step === 5 && <Step5 profile={profile} />}
        </div>
      </div>
    </div>
  );
}

/* ─── Step 1: Name + Age ─────────────────────────────────────────────────── */
function Step1({ profile }: { profile: ProfileSnap }) {
  const router = useRouter();
  const [name, setName] = useState(profile.name ?? '');
  const [age, setAge] = useState(profile.age?.toString() ?? '');
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    if (!name.trim()) { toast.error('Name is required'); return; }
    const ageNum = parseInt(age);
    if (!age || isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
      toast.error('Valid age (18–120) required'); return;
    }
    setLoading(true);
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), age: ageNum, _step: 1 }),
    });
    if (!res.ok) { toast.error('Could not save. Try again.'); setLoading(false); return; }
    router.push('/onboarding/2');
  }

  return (
    <StepFrame
      title="Let's start with the basics."
      subtitle="No catfishing allowed."
      onContinue={handleContinue}
      onBack={null}
      loading={loading}
      continueDisabled={!name.trim() || !age}
    >
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
            First name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex"
            className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 h-12 text-base"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
            Age
          </label>
          <Input
            type="number"
            min={18}
            max={120}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="28"
            className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 h-12 text-base"
          />
        </div>
      </div>
    </StepFrame>
  );
}

/* ─── Step 2: Neighbourhood ──────────────────────────────────────────────── */
function Step2({ profile }: { profile: ProfileSnap }) {
  const router = useRouter();
  const [selected, setSelected] = useState(profile.neighbourhood ?? '');
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    if (!selected) { toast.error('Pick your neighbourhood'); return; }
    setLoading(true);
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ neighbourhood: selected, _step: 2 }),
    });
    if (!res.ok) { toast.error('Could not save. Try again.'); setLoading(false); return; }
    router.push('/onboarding/3');
  }

  return (
    <StepFrame
      title="Where in Montreal are you?"
      subtitle="We match you with people in your area first."
      onContinue={handleContinue}
      onBack={() => router.push('/onboarding/1')}
      loading={loading}
      continueDisabled={!selected}
    >
      <div className="flex flex-wrap gap-3">
        {NEIGHBOURHOODS.map((n) => (
          <button
            key={n}
            onClick={() => setSelected(n)}
            className="px-4 py-2 rounded-full text-sm font-medium border transition-colors"
            style={
              selected === n
                ? { backgroundColor: ORANGE, borderColor: ORANGE, color: '#fff' }
                : { backgroundColor: 'transparent', borderColor: '#3f3f46', color: '#a1a1aa' }
            }
          >
            {n}
          </button>
        ))}
      </div>
    </StepFrame>
  );
}

/* ─── Step 3: Interest Picker ────────────────────────────────────────────── */
function Step3({ initialSlugs }: { profile: ProfileSnap; initialSlugs: string[] }) {
  const locale = useLocale();
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSlugs));
  const [loading, setLoading] = useState(false);

  function toggle(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) { next.delete(slug); return next; }
      if (next.size >= 12) { toast.warning('Max 12 interests'); return prev; }
      next.add(slug);
      return next;
    });
  }

  async function handleContinue() {
    if (selected.size < 5) { toast.error('Pick at least 5 interests'); return; }
    setLoading(true);
    const res = await fetch('/api/onboarding/interests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slugs: Array.from(selected) }),
    });
    if (!res.ok) { toast.error('Could not save. Try again.'); setLoading(false); return; }
    router.push('/onboarding/4');
  }

  const categories = Array.from(new Set(INTERESTS.map((i) => i.category)));

  return (
    <StepFrame
      title="What's your Montreal?"
      subtitle="Pick 5–12 things that actually describe you. This is how we match."
      onContinue={handleContinue}
      onBack={() => router.push('/onboarding/2')}
      loading={loading}
      continueDisabled={selected.size < 5}
      stickyFooterExtra={
        <span className="text-xs text-zinc-400">
          🎯 {selected.size} / 12 selected
        </span>
      }
    >
      <div className="space-y-5">
        {categories.map((cat) => {
          const items = INTERESTS.filter((i) => i.category === cat);
          const catLabel = CATEGORY_LABELS[cat];
          return (
            <div key={cat}>
              <p className="text-xs font-bold text-zinc-500 tracking-widest mb-2">
                {locale === 'fr' ? catLabel.fr : catLabel.en}
              </p>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => {
                  const isOn = selected.has(item.slug);
                  return (
                    <button
                      key={item.slug}
                      onClick={() => toggle(item.slug)}
                      className="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
                      style={
                        isOn
                          ? { backgroundColor: ORANGE, borderColor: ORANGE, color: '#fff' }
                          : { backgroundColor: 'transparent', borderColor: '#3f3f46', color: '#a1a1aa' }
                      }
                    >
                      {locale === 'fr' ? item.label_fr : item.label_en}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </StepFrame>
  );
}

/* ─── Step 4: Prompts ────────────────────────────────────────────────────── */
function Step4({
  prompts,
  initialAnswers,
}: {
  profile: ProfileSnap;
  prompts: DbPrompt[];
  initialAnswers: Record<string, string>;
}) {
  const locale = useLocale();
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [loading, setLoading] = useState(false);

  function setAnswer(id: string, val: string) {
    setAnswers((prev) => ({ ...prev, [id]: val.slice(0, 280) }));
  }

  async function handleContinue() {
    const hasAtLeastOne = Object.values(answers).some((v) => v.trim().length > 0);
    if (!hasAtLeastOne) { toast.error('Answer at least one prompt'); return; }
    setLoading(true);
    const payload = prompts.map((p) => ({ prompt_id: p.id, answer: answers[p.id] ?? '' })).filter(
      (a) => a.answer.trim()
    );
    const res = await fetch('/api/onboarding/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: payload }),
    });
    if (!res.ok) { toast.error('Could not save. Try again.'); setLoading(false); return; }
    router.push('/onboarding/5');
  }

  return (
    <StepFrame
      title="Now get unhinged."
      subtitle="Three prompts. All required. No curated nonsense — just you."
      onContinue={handleContinue}
      onBack={() => router.push('/onboarding/3')}
      loading={loading}
    >
      <div className="space-y-5">
        {prompts.map((p, idx) => {
          const val = answers[p.id] ?? '';
          return (
            <div key={p.id} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
              <p className="text-xs font-bold tracking-widest mb-1" style={{ color: ORANGE }}>
                PROMPT {idx + 1}
              </p>
              <p className="text-sm text-zinc-300 mb-3">{locale === 'fr' ? p.text_fr : p.text_en}</p>
              <Textarea
                value={val}
                onChange={(e) => setAnswer(p.id, e.target.value)}
                rows={3}
                placeholder="Go on..."
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 resize-none"
              />
              <div className="text-right text-xs text-zinc-500 mt-1">
                <span style={val.length > 260 ? { color: ORANGE } : {}}>{val.length}</span>
                {' / 280'}
              </div>
            </div>
          );
        })}
      </div>
    </StepFrame>
  );
}

/* ─── Step 5: Photo Upload ───────────────────────────────────────────────── */
function Step5({ profile }: { profile: ProfileSnap }) {
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>(profile.photo_urls ?? []);
  const [uploading, setUploading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photos.length >= MAX_PHOTOS) { toast.error(`Max ${MAX_PHOTOS} photos`); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append('photo', file);
    const res = await fetch('/api/onboarding/photo', { method: 'POST', body: fd });
    if (res.ok) {
      const { photos: updated } = await res.json();
      setPhotos(updated);
    } else {
      toast.error('Upload failed. Try again.');
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function removePhoto(url: string) {
    const res = await fetch('/api/onboarding/photo', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (res.ok) {
      const { photos: updated } = await res.json();
      setPhotos(updated);
    } else {
      toast.error('Failed to remove photo.');
    }
  }

  async function handleContinue() {
    if (photos.length === 0) { toast.error('Add at least one photo'); return; }
    setCompleting(true);
    const res = await fetch('/api/onboarding/complete', { method: 'PATCH' });
    if (!res.ok) { toast.error('Could not complete. Try again.'); setCompleting(false); return; }
    router.push('/dashboard');
  }

  const slots = Array.from({ length: MAX_PHOTOS });

  return (
    <StepFrame
      title="Add your photos."
      subtitle="They stay blurred until you've had a real conversation. Add up to 4 — at least 1 required."
      onContinue={handleContinue}
      onBack={() => router.push('/onboarding/4')}
      loading={completing}
      continueDisabled={photos.length === 0}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFileChange}
      />

      <div className="grid grid-cols-2 gap-3">
        {slots.map((_, i) => {
          const url = photos[i];
          const isFirst = i === 0;
          const colSpan = isFirst ? 'col-span-2' : '';
          const height = isFirst ? 'h-52' : 'h-32';

          if (url) {
            return (
              <div key={i} className={`relative rounded-xl overflow-hidden ${colSpan} ${height} bg-zinc-800`}>
                {/* Blurred photo preview */}
                <img
                  src={url}
                  alt={`Photo ${i + 1}`}
                  className="w-full h-full object-cover blur-xl scale-110"
                />
                {isFirst && (
                  <span
                    className="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded"
                    style={{ backgroundColor: ORANGE, color: '#fff' }}
                  >
                    SAMPLE
                  </span>
                )}
                <button
                  onClick={() => removePhoto(url)}
                  className="absolute top-2 right-2 bg-black/70 rounded-full p-1 hover:bg-black"
                >
                  <X size={14} className="text-white" />
                </button>
              </div>
            );
          }

          return (
            <button
              key={i}
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className={`${colSpan} ${height} rounded-xl border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center gap-2 text-zinc-600 hover:border-zinc-500 hover:text-zinc-400 transition-colors disabled:opacity-50`}
            >
              {uploading && i === photos.length ? (
                <span className="text-xs animate-pulse">Uploading...</span>
              ) : (
                <>
                  <Plus size={20} />
                  <span className="text-xs">Add photo</span>
                </>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-zinc-600 mt-3">
        All photos blurred until chat unlock.{' '}
        <span className="text-zinc-400 font-medium">{photos.length} / {MAX_PHOTOS} added</span>
      </p>
    </StepFrame>
  );
}

/* ─── Shared step wrapper ────────────────────────────────────────────────── */
interface StepFrameProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onContinue: () => void;
  onBack: (() => void) | null;
  loading?: boolean;
  continueDisabled?: boolean;
  stickyFooterExtra?: React.ReactNode;
}

function StepFrame({
  title,
  subtitle,
  children,
  onContinue,
  onBack,
  loading,
  continueDisabled,
  stickyFooterExtra,
}: StepFrameProps) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-2">
          {title}
        </h1>
        {subtitle && <p className="text-zinc-400 text-sm leading-relaxed">{subtitle}</p>}
      </div>

      <div>{children}</div>

      <div className="flex flex-col gap-3">
        {stickyFooterExtra && (
          <div className="flex justify-center">{stickyFooterExtra}</div>
        )}
        <Button
          onClick={onContinue}
          disabled={loading || continueDisabled}
          className="w-full h-12 font-bold text-base rounded-xl disabled:opacity-50 hover:brightness-110 active:scale-95 transition-all"
          style={{ backgroundColor: ORANGE, color: '#fff' }}
        >
          {loading ? 'Saving...' : 'Continue →'}
        </Button>
        {onBack && (
          <button
            onClick={onBack}
            className="text-sm text-zinc-500 hover:text-zinc-300 text-center transition-colors"
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Logo ───────────────────────────────────────────────────────────────── */
function Logo() {
  return (
    <span className="text-xl font-extrabold tracking-tight italic select-none">
      <span style={{ color: ORANGE }}>un</span>
      <span className="text-white">hinged</span>
    </span>
  );
}
