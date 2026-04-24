import Link from 'next/link';

const ORANGE = '#FF7518';

export const metadata = {
  title: "You're Verified — unhinged",
  description: "You're officially Unhinged. Welcome to the neighborhood.",
};

export default function WaitlistVerifiedPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center px-6 py-4 md:px-12">
        <Logo />
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center space-y-8">

          {/* Animated badge */}
          <div className="flex justify-center">
            <span
              className="inline-flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: ORANGE, color: '#fff' }}
            >
              <span className="w-2 h-2 rounded-full bg-white opacity-80" />
              OFFICIALLY UNHINGED
            </span>
          </div>

          {/* Big icon */}
          <div
            className="mx-auto w-24 h-24 rounded-full flex items-center justify-center text-5xl"
            style={{ border: `3px solid ${ORANGE}`, boxShadow: `0 0 40px ${ORANGE}33` }}
          >
            🌪️
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              You're officially{' '}
              <span style={{ color: ORANGE }}>Unhinged.</span>
            </h1>
            <p className="text-zinc-400 text-base md:text-lg leading-relaxed">
              Welcome to the neighborhood. Your email is confirmed, your chaos is
              authorized, and your hot takes are now on the record.
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-800" />

          {/* What's next */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-left space-y-4">
            <p className="text-xs text-zinc-500 tracking-widest font-semibold uppercase">
              What happens next
            </p>
            <ul className="space-y-3">
              {[
                { icon: '📬', text: "We'll ping you when your invite drops. Check your inbox." },
                { icon: '🏘', text: 'Your neighbourhood spot is locked in — first come, first chaos.' },
                { icon: '🤫', text: "No spam. Just the signal. We're unhinged, not disorganized." },
              ].map(({ icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-sm text-zinc-300">
                  <span className="mt-0.5 text-base flex-shrink-0">{icon}</span>
                  <span className="leading-relaxed">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Back link */}
          <Link
            href="/waitlist"
            className="inline-block text-sm text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-4"
          >
            ← Back to the waitlist
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center pb-8 pt-6">
        <p className="text-zinc-700 text-xs tracking-widest font-medium">
          UNHINGED · MONTREAL · EST. 2025
        </p>
      </footer>
    </main>
  );
}

function Logo() {
  return (
    <span className="text-xl font-extrabold tracking-tight italic select-none">
      <span style={{ color: ORANGE }}>un</span>
      <span className="text-white">hinged</span>
    </span>
  );
}
