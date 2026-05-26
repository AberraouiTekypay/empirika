import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AudienceOverview from '../components/AudienceOverview';
import AffinityInsights from '../components/AffinityInsights';
import SentimentTrends from '../components/SentimentTrends';
import InsightReport from '../components/InsightReport';
import { AUDIENCE_DATA, TOTAL_TRENDS, SENTIMENT_DATA } from '../lib/fakeData';

const NICHES = [
  'Beauty & Skincare',
  'Health & Wellness',
  'Home & Living',
  'Food & Beverage',
  'Parenting & Family',
];

const TABS = [
  { id: 'overview',  label: 'Audience' },
  { id: 'affinity',  label: 'Affinity' },
  { id: 'sentiment', label: 'Sentiment' },
  { id: 'insight',   label: 'AI Insight' },
];

function fmt(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K';
  return String(n);
}

function TrendPill({ pct }) {
  const up = pct >= 0;
  return (
    <span style={{ fontSize: 10, color: up ? '#4ade80' : '#f87171' }}>
      {up ? '↑' : '↓'} {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [selectedNiche, setSelectedNiche] = useState('Beauty & Skincare');
  const [activeTab, setActiveTab] = useState('overview');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem('empirika_authed') || '{}');
      if (auth.email) setUserEmail(auth.email);
    } catch (_) {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('empirika_authed');
    router.push('/login');
  };

  const channels  = AUDIENCE_DATA[selectedNiche] || [];
  const trends    = TOTAL_TRENDS[selectedNiche] || {};
  const sentiment = SENTIMENT_DATA[selectedNiche]?.sentiment;

  const totalReach    = channels.reduce((s, c) => s + c.subscriber_count, 0);
  const totalViews    = channels.reduce((s, c) => s + c.total_views, 0);
  const totalLikes    = channels.reduce((s, c) => s + (c.total_likes || 0), 0);
  const totalComments = channels.reduce((s, c) => s + (c.total_comments || 0), 0);
  const engRate       = totalViews > 0
    ? (((totalLikes + totalComments) / totalViews) * 100).toFixed(2) + '%'
    : '—';

  const STATS = [
    {
      label: 'Audience Reach',
      value: fmt(totalReach),
      trend: trends.subscribers,
      sub: `${channels.length} channels tracked`,
    },
    {
      label: 'Monthly Views',
      value: fmt(totalViews),
      trend: trends.views,
      sub: 'last 30 days',
    },
    {
      label: 'Engagement Rate',
      value: engRate,
      sub: 'likes + comments / views',
    },
    {
      label: 'Sentiment Score',
      value: sentiment ? `${sentiment.score}` : '—',
      sub: sentiment?.label || 'community health',
      accent: sentiment?.score >= 70 ? '#4ade80'
            : sentiment?.score >= 50 ? '#fb923c'
            : '#f87171',
    },
  ];

  return (
    <>
      <Head>
        <title>Empirika — {selectedNiche} Intelligence</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{
        display: 'flex',
        height: '100vh',
        background: '#0b0f1a',
        fontFamily: 'Inter, sans-serif',
        overflow: 'hidden',
        color: '#e2e8f0',
      }}>

        {/* ── SIDEBAR ─────────────────────────────────────────────── */}
        <aside style={{
          width: 234,
          flexShrink: 0,
          background: '#070a12',
          borderRight: '1px solid #1a2235',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>

          {/* Brand */}
          <div style={{ padding: '22px 22px 18px', borderBottom: '1px solid #111827' }}>
            <a href="/" style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontSize: 22,
                fontWeight: 300,
                color: '#f1f5f9',
                letterSpacing: '-0.2px',
                lineHeight: 1,
                marginBottom: 4,
              }}>
                Empirika
              </div>
              <div style={{ fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#1e2d45' }}>
                Intelligence Platform
              </div>
            </a>
          </div>

          {/* Niche list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 10px' }}>
            <p style={{
              fontSize: 9,
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              color: '#1a2a3a',
              padding: '0 12px',
              marginBottom: 10,
            }}>
              Categories
            </p>

            {NICHES.map(niche => {
              const active  = niche === selectedNiche;
              const reach   = (AUDIENCE_DATA[niche] || []).reduce((s, c) => s + c.subscriber_count, 0);
              const trendPct = TOTAL_TRENDS[niche]?.subscribers || 0;
              return (
                <button
                  key={niche}
                  onClick={() => { setSelectedNiche(niche); setActiveTab('overview'); }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: active ? '1px solid rgba(59,130,246,0.22)' : '1px solid transparent',
                    background: active ? 'rgba(59,130,246,0.07)' : 'transparent',
                    cursor: 'pointer',
                    marginBottom: 2,
                    transition: 'all 0.12s',
                    display: 'block',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <span style={{
                      fontSize: 12.5,
                      fontWeight: active ? 500 : 400,
                      color: active ? '#93c5fd' : '#3a5070',
                      lineHeight: 1.3,
                    }}>
                      {niche}
                    </span>
                    <span style={{ fontSize: 10, color: '#4ade80', flexShrink: 0, marginLeft: 6 }}>
                      +{trendPct}%
                    </span>
                  </div>
                  <div style={{ fontSize: 10.5, color: active ? '#2a4060' : '#1a2a3a' }}>
                    {fmt(reach)} reach
                  </div>
                </button>
              );
            })}
          </div>

          {/* User footer */}
          <div style={{ padding: '14px 20px', borderTop: '1px solid #111827' }}>
            {userEmail && (
              <p style={{
                fontSize: 10.5,
                color: '#2a3a5a',
                marginBottom: 9,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {userEmail}
              </p>
            )}
            <button
              onClick={handleLogout}
              style={{
                fontSize: 11,
                color: '#3a5070',
                background: 'transparent',
                border: '1px solid #1a2a3a',
                borderRadius: 4,
                padding: '5px 12px',
                cursor: 'pointer',
                transition: 'color 0.2s, border-color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#2a3a5a'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#3a5070'; e.currentTarget.style.borderColor = '#1a2a3a'; }}
            >
              Sign out
            </button>
          </div>
        </aside>

        {/* ── MAIN ─────────────────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* Stats strip */}
          <div style={{
            background: '#06090f',
            borderBottom: '1px solid #111827',
            padding: '0 36px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            flexShrink: 0,
          }}>
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                style={{
                  padding: '16px 0',
                  paddingRight: i < 3 ? 28 : 0,
                  paddingLeft: i > 0 ? 28 : 0,
                  borderRight: i < 3 ? '1px solid #0f1826' : 'none',
                }}
              >
                <p style={{
                  fontSize: 9,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: '#1e2d45',
                  marginBottom: 6,
                }}>
                  {stat.label}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                  <span style={{
                    fontFamily: 'Cormorant Garamond, Georgia, serif',
                    fontSize: 28,
                    fontWeight: 400,
                    color: stat.accent || '#f1f5f9',
                    lineHeight: 1,
                  }}>
                    {stat.value}
                  </span>
                  {stat.trend !== undefined && <TrendPill pct={stat.trend} />}
                </div>
                <p style={{ fontSize: 10.5, color: '#2a3a5a' }}>{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Tab nav */}
          <div style={{
            background: '#090d18',
            borderBottom: '1px solid #1a2235',
            padding: '0 36px',
            display: 'flex',
            alignItems: 'center',
            gap: 28,
            flexShrink: 0,
          }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '13px 0',
                  fontSize: 12.5,
                  fontWeight: 500,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                  color: activeTab === tab.id ? '#60a5fa' : '#2a3a5a',
                  cursor: 'pointer',
                  transition: 'color 0.15s',
                  marginBottom: -1,
                }}
                onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.color = '#64748b'; }}
                onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.color = '#2a3a5a'; }}
              >
                {tab.label}
              </button>
            ))}
            <div style={{ marginLeft: 'auto' }}>
              <span style={{
                fontSize: 11,
                color: '#3b82f6',
                background: 'rgba(59,130,246,0.07)',
                border: '1px solid rgba(59,130,246,0.18)',
                borderRadius: 20,
                padding: '4px 14px',
              }}>
                {selectedNiche}
              </span>
            </div>
          </div>

          {/* Content */}
          <main style={{ flex: 1, overflowY: 'auto', padding: '36px 36px' }}>
            {activeTab === 'overview'  && <AudienceOverview  niche={selectedNiche} key={`ov-${selectedNiche}`} />}
            {activeTab === 'affinity'  && <AffinityInsights  niche={selectedNiche} key={`af-${selectedNiche}`} />}
            {activeTab === 'sentiment' && <SentimentTrends   niche={selectedNiche} key={`se-${selectedNiche}`} />}
            {activeTab === 'insight'   && <InsightReport     niche={selectedNiche} key={`in-${selectedNiche}`} />}
          </main>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e2d45; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: #2a3a5a; }
      `}</style>
    </>
  );
}
