import { useState, useEffect } from 'react';
import { INSIGHT_DATA } from '../lib/fakeData';

function ConfidenceBadge({ level }) {
  const map = {
    high:   { bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.2)',  text: '#4ade80', label: 'High confidence' },
    medium: { bg: 'rgba(251,146,60,0.08)',  border: 'rgba(251,146,60,0.2)',  text: '#fb923c', label: 'Medium confidence' },
    low:    { bg: 'rgba(100,116,139,0.08)', border: 'rgba(100,116,139,0.2)', text: '#64748b', label: 'Low confidence' },
  };
  const s = map[level] || map.low;
  return (
    <span style={{
      fontSize: 11,
      fontFamily: 'Inter, sans-serif',
      color: s.text,
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderRadius: 4,
      padding: '4px 10px',
      letterSpacing: '0.3px',
      flexShrink: 0,
    }}>
      {s.label}
    </span>
  );
}

function Skeleton({ style = {} }) {
  return (
    <div style={{
      background: '#1a2235',
      borderRadius: 4,
      animation: 'pulse 1.5s ease-in-out infinite',
      ...style,
    }} />
  );
}

export default function InsightReport({ niche }) {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setInsight(null);
    const t = setTimeout(() => {
      setInsight(INSIGHT_DATA[niche] || null);
      setLoading(false);
    }, 1200);
    return () => clearTimeout(t);
  };

  useEffect(load, [niche]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <p style={{
            fontSize: 10,
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
            color: '#2a3a5a',
            marginBottom: 6,
            fontFamily: 'Inter, sans-serif',
          }}>
            AI Intelligence Report
          </p>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: 28,
            fontWeight: 400,
            color: '#f1f5f9',
            lineHeight: 1.2,
            marginBottom: 4,
          }}>
            {niche} Analysis
          </h2>
          <p style={{ fontSize: 12, color: '#2a3a5a', fontFamily: 'Inter, sans-serif' }}>
            Powered by Claude · behavioral intelligence synthesis
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          style={{
            padding: '8px 18px',
            background: 'transparent',
            border: '1px solid #1e2d45',
            borderRadius: 6,
            fontSize: 12,
            color: loading ? '#1e2d45' : '#3a5070',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Inter, sans-serif',
            transition: 'color 0.2s, border-color 0.2s',
          }}
          onMouseEnter={e => { if (!loading) { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#2a3a5a'; } }}
          onMouseLeave={e => { e.currentTarget.style.color = '#3a5070'; e.currentTarget.style.borderColor = '#1e2d45'; }}
        >
          {loading ? 'Generating…' : 'Regenerate'}
        </button>
      </div>

      {loading ? (
        <div style={{
          background: '#0d1422',
          border: '1px solid #1e2d45',
          borderRadius: 12,
          padding: 40,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <Skeleton style={{ height: 28, width: '60%' }} />
            <Skeleton style={{ height: 22, width: 120, borderRadius: 4 }} />
          </div>
          <Skeleton style={{ height: 14, width: '95%', marginBottom: 10 }} />
          <Skeleton style={{ height: 14, width: '88%', marginBottom: 10 }} />
          <Skeleton style={{ height: 14, width: '72%', marginBottom: 32 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            {[0, 1].map(col => (
              <div key={col}>
                <Skeleton style={{ height: 12, width: 140, marginBottom: 20 }} />
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} style={{ height: 12, width: `${85 - i * 8}%`, marginBottom: 12 }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : insight && (
        <div style={{
          background: '#0d1422',
          border: '1px solid #1e2d45',
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          {/* Report header */}
          <div style={{
            padding: '32px 40px',
            borderBottom: '1px solid #1a2235',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.04) 0%, transparent 60%)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
              <h3 style={{
                fontFamily: 'Cormorant Garamond, Georgia, serif',
                fontSize: 26,
                fontWeight: 400,
                color: '#f1f5f9',
                lineHeight: 1.25,
                maxWidth: 620,
              }}>
                {insight.title}
              </h3>
              <ConfidenceBadge level={insight.confidence} />
            </div>
            <p style={{
              fontSize: 14,
              lineHeight: 1.8,
              color: '#475569',
              maxWidth: 700,
              fontFamily: 'Inter, sans-serif',
              paddingLeft: 16,
              borderLeft: '2px solid rgba(59,130,246,0.4)',
            }}>
              {insight.summary}
            </p>
          </div>

          {/* Report body */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 0,
          }} className="insight-body-grid">

            {/* Key behaviors */}
            <div style={{ padding: '32px 40px', borderRight: '1px solid #1a2235' }}>
              <p style={{
                fontSize: 10,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: '#2a3a5a',
                marginBottom: 20,
                fontFamily: 'Inter, sans-serif',
              }}>
                Key Audience Behaviours
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {(insight.keyBehaviors || []).map((b, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{
                      color: '#3b82f6',
                      flexShrink: 0,
                      marginTop: 2,
                      fontSize: 12,
                    }}>
                      ▸
                    </span>
                    <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Marketing angles */}
            <div style={{ padding: '32px 40px' }}>
              <p style={{
                fontSize: 10,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: '#2a3a5a',
                marginBottom: 20,
                fontFamily: 'Inter, sans-serif',
              }}>
                Marketing Angles
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {(insight.marketingAngles || []).map((a, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{
                      color: '#22c55e',
                      flexShrink: 0,
                      marginTop: 2,
                      fontSize: 12,
                    }}>
                      ▸
                    </span>
                    <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
                      {a}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '16px 40px',
            borderTop: '1px solid #111827',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <p style={{ fontSize: 11, color: '#1e2d45', fontFamily: 'Inter, sans-serif' }}>
              Generated by Claude · Empirika Behavioral Intelligence
            </p>
            <p style={{ fontSize: 11, color: '#1e2d45', fontFamily: 'Inter, sans-serif' }}>
              {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @media (max-width: 700px) {
          .insight-body-grid { grid-template-columns: 1fr !important; }
          .insight-body-grid > div:first-child { border-right: none !important; border-bottom: 1px solid #1a2235; }
        }
      `}</style>
    </div>
  );
}
