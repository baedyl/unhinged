import { auth } from '@clerk/nextjs/server';
import { createServiceClient, getProfileByClerkId } from '@/lib/supabase-server';
import type { MatchResult } from '@/types/database';
import Link from 'next/link';

const ORANGE = '#FF7518';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = createServiceClient();
  const profile = await getProfileByClerkId(userId);

  // Fetch ranked matches via RPC
  const { data: matchData, error } = await supabase.rpc('get_matches', {
    p_clerk_id: userId,
  });

  const matches: MatchResult[] = Array.isArray(matchData) ? matchData : [];

  return (
    <main className="min-h-screen bg-zinc-950 text-white pb-16">
      {/* Header */}
      <div className="px-4 pt-8 pb-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
            Your Matches
            {profile?.neighbourhood && (
              <span> — {matches.length} in {profile.neighbourhood}</span>
            )}
          </h2>
          {profile?.neighbourhood && (
            <span
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
              style={{ backgroundColor: 'transparent', border: `1px solid ${ORANGE}`, color: ORANGE }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: ORANGE }} />
              {profile.neighbourhood}
            </span>
          )}
        </div>
      </div>

      {/* Match cards */}
      <div className="max-w-lg mx-auto px-4 space-y-4">
        {error && (
          <p className="text-red-400 text-sm text-center py-8">
            Could not load matches. Please refresh.
          </p>
        )}

        {!error && matches.length === 0 && (
          <EmptyState />
        )}

        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </main>
  );
}

/* ─── Match Card ─────────────────────────────────────────────────────────── */
function MatchCard({ match }: { match: MatchResult }) {
  const topInterests = (match.all_interests ?? []).slice(0, 3);
  const hasPhoto = match.photo_urls?.length > 0;

  return (
    <div className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
      {/* Blurred photo */}
      <div className="relative h-72 bg-zinc-800 overflow-hidden">
        {hasPhoto ? (
          <img
            src={match.photo_urls[0]}
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: 'blur(20px)', transform: 'scale(1.1)' }}
          />
        ) : (
          /* Placeholder with coloured circle (matches design) */
          <div className="w-full h-full flex items-center justify-center bg-zinc-800">
            <div
              className="w-20 h-20 rounded-full opacity-60"
              style={{ backgroundColor: ORANGE }}
            />
          </div>
        )}
        {/* Unlock hint */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-zinc-300">
          🔒 Unlocks after chat
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        {/* Name + age + location */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-xl tracking-tight">{match.name ?? '—'}</span>
            {match.age && <span className="text-zinc-400 text-lg">{match.age}</span>}
          </div>
          {match.neighbourhood && (
            <p className="text-zinc-500 text-xs mt-0.5">{match.neighbourhood}</p>
          )}
        </div>

        {/* Shared + other interests */}
        <div className="flex flex-wrap gap-2">
          {match.shared_count > 0 && (
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ backgroundColor: ORANGE, color: '#fff' }}
            >
              {match.shared_count} in common
            </span>
          )}
          {topInterests.map((label) => (
            <span
              key={label}
              className="text-xs px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300"
            >
              {label}
            </span>
          ))}
        </div>

        {/* Prompt answer */}
        {match.prompt && (
          <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700/50">
            <p className="text-xs text-zinc-500 mb-1 italic">{match.prompt.question}</p>
            <p className="text-sm text-white leading-relaxed">
              &ldquo;{match.prompt.answer}&rdquo;
            </p>
          </div>
        )}

        {/* CTA */}
        <Link
          href={`/chat/${match.id}`}
          className="block w-full text-center text-sm font-bold py-3 rounded-xl transition-all hover:brightness-110 active:scale-95"
          style={{ backgroundColor: ORANGE, color: '#fff' }}
        >
          Start chatting →
        </Link>
      </div>
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="text-center py-20">
      <p className="text-4xl mb-4">🌆</p>
      <h3 className="text-xl font-bold text-white mb-2">No matches yet</h3>
      <p className="text-zinc-500 text-sm max-w-xs mx-auto">
        We&apos;re still building out your neighbourhood. Check back soon — or share
        Unhinged so more locals join.
      </p>
    </div>
  );
}
