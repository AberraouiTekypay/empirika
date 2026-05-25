import { useState } from 'react';
import Head from 'next/head';
import AudienceOverview from '../components/AudienceOverview';
import AffinityInsights from '../components/AffinityInsights';
import SentimentTrends from '../components/SentimentTrends';
import InsightReport from '../components/InsightReport';

const NICHES = ['Trades', 'Mythology', 'Scouts', 'Neurodivergent', 'Stories'];
const TABS = [
  { id: 'overview',  label: 'Audience Overview' },
  { id: 'affinity',  label: 'Affinity' },
  { id: 'sentiment', label: 'Sentiment & Trends' },
  { id: 'insight',   label: 'AI Insight' },
];

export default function Dashboard() {
  const [selectedNiche, setSelectedNiche] = useState('Trades');
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <>
      <Head>
        <title>Empirika Dashboard</title>
      </Head>

      <div className="min-h-screen bg-slate-900 text-slate-100">

        {/* ── Header ─────────────────────────────────────────────── */}
        <header className="bg-black border-b border-slate-800 px-6 py-5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold text-white">Empirika</h1>
              <p className="text-slate-500 text-xs mt-0.5 tracking-widest uppercase">
                Enterprise Audience Intelligence
              </p>
            </div>
            <div className="text-slate-600 text-xs">
              {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </header>

        {/* ── Niche Selector ─────────────────────────────────────── */}
        <div className="bg-slate-800/60 border-b border-slate-700 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap">
            <span className="text-slate-500 text-xs uppercase tracking-widest mr-2">Niche</span>
            {NICHES.map(niche => (
              <button
                key={niche}
                onClick={() => { setSelectedNiche(niche); setActiveTab('overview'); }}
                className={`px-4 py-1.5 rounded text-sm font-medium transition-colors duration-150 ${
                  selectedNiche === niche
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {niche}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Navigation ─────────────────────────────────────── */}
        <div className="bg-slate-800/40 border-b border-slate-700 px-6">
          <div className="max-w-7xl mx-auto flex gap-8">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn py-3 ${
                  activeTab === tab.id ? 'tab-btn-active' : 'tab-btn-inactive'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ────────────────────────────────────────────── */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {activeTab === 'overview'  && <AudienceOverview niche={selectedNiche} key={`ov-${selectedNiche}`} />}
          {activeTab === 'affinity'  && <AffinityInsights niche={selectedNiche} key={`af-${selectedNiche}`} />}
          {activeTab === 'sentiment' && <SentimentTrends  niche={selectedNiche} key={`se-${selectedNiche}`} />}
          {activeTab === 'insight'   && <InsightReport    niche={selectedNiche} key={`in-${selectedNiche}`} />}
        </main>

      </div>
    </>
  );
}
