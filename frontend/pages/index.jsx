import Head from 'next/head';
import Link from 'next/link';

const FEATURES = [
  {
    icon: '◈',
    title: 'Niche Audience Intelligence',
    body: 'Deep metrics across 5 proprietary YouTube niches — Trades, Mythology, Scouts, Neurodivergent Parenting, and Storytelling.',
  },
  {
    icon: '◉',
    title: 'Cross-Platform Affinity',
    body: 'Understand what else your audience watches. Map affinities across niches for precise brand targeting.',
  },
  {
    icon: '◐',
    title: 'AI-Powered Reports',
    body: 'Claude-generated insight reports synthesising audience behaviour into actionable marketing intelligence.',
  },
  {
    icon: '◆',
    title: 'Sentiment Monitoring',
    body: 'Real-time Reddit and social monitoring. Keyword tracking. Sentiment scoring across your niches.',
  },
];

const NICHES = [
  { label: 'Path2Pro Trades',        color: 'from-orange-900/60 to-orange-800/30',   accent: 'text-orange-400',   stat: '9 channels' },
  { label: 'African Mythology',       color: 'from-purple-900/60 to-purple-800/30',   accent: 'text-purple-400',   stat: '5 niches' },
  { label: 'Scouting Skills',         color: 'from-emerald-900/60 to-emerald-800/30', accent: 'text-emerald-400',  stat: 'Real-time data' },
  { label: 'Neurodivergent Parenting',color: 'from-sky-900/60 to-sky-800/30',         accent: 'text-sky-400',      stat: 'Daily refresh' },
  { label: '1001 Nights',             color: 'from-amber-900/60 to-amber-800/30',     accent: 'text-amber-400',    stat: 'AI insights' },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>Empirika — Enterprise Audience Intelligence</title>
        <meta name="description" content="What Nielsen can't see. Niche YouTube audience intelligence for brands, agencies, and adtech." />
        <meta property="og:title" content="Empirika — Enterprise Audience Intelligence" />
        <meta property="og:description" content="First-party YouTube niche audience data. AI-powered brand insights." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">

        {/* ── Nav ─────────────────────────────────────────────────── */}
        <nav className="border-b border-slate-800 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <span className="font-serif text-2xl font-bold tracking-tight">Empirika</span>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors"
            >
              Open Dashboard →
            </Link>
          </div>
        </nav>

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="flex-1 flex items-center justify-center px-6 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-brand-400 text-sm tracking-[0.2em] uppercase font-medium mb-6">
              Enterprise Audience Intelligence
            </p>
            <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-none mb-6">
              What Nielsen<br />
              <span className="text-slate-400">can't see.</span>
            </h1>
            <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed mb-10">
              First-party YouTube niche audience data — transformed into predictive brand intelligence.
              Built for agencies, adtech, and brands who need to reach the audiences no one else is tracking.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/dashboard"
                className="px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors duration-150 text-sm"
              >
                View Dashboard
              </Link>
              <a
                href="mailto:hello@empirika.co"
                className="px-8 py-3.5 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white font-medium rounded-lg transition-colors duration-150 text-sm"
              >
                Request Demo
              </a>
            </div>
          </div>
        </section>

        {/* ── Niche Grid ───────────────────────────────────────────── */}
        <section className="px-6 py-16 bg-black/30">
          <div className="max-w-6xl mx-auto">
            <p className="text-slate-500 text-xs uppercase tracking-[0.2em] text-center mb-8">
              5 Proprietary Niches · 9 Channels · Exclusive First-Party Data
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {NICHES.map(n => (
                <div
                  key={n.label}
                  className={`bg-gradient-to-br ${n.color} border border-slate-700/50 rounded-xl p-5`}
                >
                  <p className={`font-serif text-lg font-semibold ${n.accent} mb-1`}>{n.label}</p>
                  <p className="text-slate-500 text-xs">{n.stat}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────────── */}
        <section className="px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-serif text-4xl font-bold text-center text-white mb-14">
              The intelligence layer brands are missing.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FEATURES.map(f => (
                <div key={f.title} className="metric-card group hover:border-slate-600 transition-colors">
                  <span className="text-brand-500 text-2xl block mb-3">{f.icon}</span>
                  <h3 className="font-serif text-xl font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA strip ────────────────────────────────────────────── */}
        <section className="px-6 py-16 bg-brand-600/10 border-y border-brand-600/20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-4xl font-bold text-white mb-4">
              Ready to see your audience?
            </h2>
            <p className="text-slate-400 mb-8">
              Empirika is in private beta. Book a demo to access your niche intelligence dashboard.
            </p>
            <a
              href="mailto:hello@empirika.co"
              className="inline-block px-10 py-4 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors duration-150"
            >
              Book a Demo
            </a>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <footer className="border-t border-slate-800 px-6 py-8">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <span className="font-serif font-bold text-white">Empirika</span>
              <span className="text-slate-600 text-sm">Enterprise Audience Intelligence</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <span>An</span>
              <a
                href="https://em300.co"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors font-medium underline underline-offset-2"
              >
                EM300.co
              </a>
              <span>Company</span>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
