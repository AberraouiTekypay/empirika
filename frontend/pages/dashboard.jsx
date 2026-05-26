import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AudienceOverview from '../components/AudienceOverview';
import AffinityInsights from '../components/AffinityInsights';
import SentimentTrends from '../components/SentimentTrends';
import InsightReport from '../components/InsightReport';

const NICHES = ['Trades', 'Mythology', 'Scouts', 'Neurodivergent', 'Stories'];
const TABS = [
  { id: 'overview',   label: 'Audience' },
  { id: 'affinity',   label: 'Affinity' },
  { id: 'sentiment',  label: 'Sentiment' },
  { id: 'insight',    label: 'AI Insight' },
];

export default function Dashboard() {
  const router = useRouter();
  const [selectedNiche, setSelectedNiche] = useState('Trades');
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

  return (
    <>
      <Head>
        <title>Empirika — Intelligence Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ minHeight: '100vh', background: '#0b0f1a', color: '#e2e8f0' }}>

        {/* ── Header ──────────────────────────────────────────────── */}
        <header style={{
          background: '#070a12',
          borderBottom: '1px solid #1a2235',
          padding: '0 32px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <a href="/" style={{ textDecoration: 'none' }}>
              <span style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontSize: 22,
                fontWeight: 300,
                color: '#ffffff',
                letterSpacing: '-0.3px',
              }}>
                Empirika
              </span>
            </a>
            <span style={{
              fontSize: 11,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#2a3a5a',
              fontFamily: 'Inter, sans-serif',
            }}>
              Intelligence Dashboard
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {userEmail && (
              <span style={{
                fontSize: 12,
                color: '#3a5070',
                fontFamily: 'Inter, sans-serif',
              }}>
                {userEmail}
              </span>
            )}
            <button
              onClick={handleLogout}
              style={{
                fontSize: 12,
                color: '#3a5070',
                background: 'transparent',
                border: '1px solid #1a2a3a',
                borderRadius: 5,
                padding: '6px 14px',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                transition: 'color 0.2s, border-color 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.borderColor = '#2a3a5a';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = '#3a5070';
                e.currentTarget.style.borderColor = '#1a2a3a';
              }}
            >
              Sign out
            </button>
          </div>
        </header>

        {/* ── Niche Selector ──────────────────────────────────────── */}
        <div style={{
          background: '#090d18',
          borderBottom: '1px solid #1a2235',
          padding: '0 32px',
        }}>
          <div style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            height: 52,
          }}>
            <span style={{
              fontSize: 10,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#2a3a5a',
              marginRight: 12,
              fontFamily: 'Inter, sans-serif',
            }}>
              Niche
            </span>
            {NICHES.map(niche => (
              <button
                key={niche}
                onClick={() => { setSelectedNiche(niche); setActiveTab('overview'); }}
                style={{
                  padding: '6px 16px',
                  borderRadius: 5,
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  border: selectedNiche === niche ? '1px solid rgba(59,130,246,0.4)' : '1px solid transparent',
                  background: selectedNiche === niche ? 'rgba(59,130,246,0.12)' : 'transparent',
                  color: selectedNiche === niche ? '#60a5fa' : '#3a5070',
                }}
                onMouseEnter={e => {
                  if (selectedNiche !== niche) {
                    e.currentTarget.style.color = '#64748b';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }
                }}
                onMouseLeave={e => {
                  if (selectedNiche !== niche) {
                    e.currentTarget.style.color = '#3a5070';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {niche}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Navigation ──────────────────────────────────────── */}
        <div style={{
          background: '#090d18',
          borderBottom: '1px solid #1a2235',
          padding: '0 32px',
        }}>
          <div style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'flex',
            gap: 32,
          }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 0',
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: 'Inter, sans-serif',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                  color: activeTab === tab.id ? '#60a5fa' : '#2a3a5a',
                  cursor: 'pointer',
                  transition: 'color 0.15s, border-color 0.15s',
                  marginBottom: -1,
                }}
                onMouseEnter={e => {
                  if (activeTab !== tab.id) e.currentTarget.style.color = '#64748b';
                }}
                onMouseLeave={e => {
                  if (activeTab !== tab.id) e.currentTarget.style.color = '#2a3a5a';
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ─────────────────────────────────────────────── */}
        <main style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 32px' }}>
          {activeTab === 'overview'  && <AudienceOverview  niche={selectedNiche} key={`ov-${selectedNiche}`} />}
          {activeTab === 'affinity'  && <AffinityInsights  niche={selectedNiche} key={`af-${selectedNiche}`} />}
          {activeTab === 'sentiment' && <SentimentTrends   niche={selectedNiche} key={`se-${selectedNiche}`} />}
          {activeTab === 'insight'   && <InsightReport     niche={selectedNiche} key={`in-${selectedNiche}`} />}
        </main>

      </div>
    </>
  );
}
