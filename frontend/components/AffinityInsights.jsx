import { useState, useEffect } from 'react';
import { AFFINITY_DATA } from '../lib/fakeData';

function AffinityBar({ pct }) {
  return (
    <div style={{ width: '100%', height: 3, background: '#1a2235', borderRadius: 2, marginTop: 10 }}>
      <div style={{
        height: '100%',
        width: `${pct}%`,
        background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
        borderRadius: 2,
        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
      }} />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{
      background: '#111827',
      border: '1px solid #1e2d45',
      borderRadius: 8,
      padding: 24,
      animation: 'pulse 1.5s ease-in-out infinite',
    }}>
      <div style={{ height: 14, background: '#1a2235', borderRadius: 3, width: 140, marginBottom: 12 }} />
      <div style={{ height: 12, background: '#1a2235', borderRadius: 3, width: '90%', marginBottom: 8 }} />
      <div style={{ height: 3, background: '#1a2235', borderRadius: 2, marginTop: 16 }} />
    </div>
  );
}

export default function AffinityInsights({ niche }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setData(AFFINITY_DATA[niche] || []);
      setLoading(false);
    }, 700);
    return () => clearTimeout(t);
  }, [niche]);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p style={{
          fontSize: 10,
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          color: '#2a3a5a',
          marginBottom: 6,
          fontFamily: 'Inter, sans-serif',
        }}>
          Cross-Niche Affinity
        </p>
        <h2 style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 28,
          fontWeight: 400,
          color: '#f1f5f9',
          lineHeight: 1.2,
          marginBottom: 4,
        }}>
          What {niche} Audiences Also Watch
        </h2>
        <p style={{ fontSize: 12, color: '#2a3a5a', fontFamily: 'Inter, sans-serif' }}>
          Audience overlap strength between niche segments · ranked by engagement signal
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="affinity-grid">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : data.map((aff, idx) => (
              <div
                key={aff.category}
                style={{
                  background: '#111827',
                  border: '1px solid #1e2d45',
                  borderRadius: 8,
                  padding: 24,
                  transition: 'border-color 0.2s, background 0.2s',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)';
                  e.currentTarget.style.background = 'rgba(59,130,246,0.04)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#1e2d45';
                  e.currentTarget.style.background = '#111827';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <h3 style={{
                    fontFamily: 'Cormorant Garamond, Georgia, serif',
                    fontSize: 20,
                    fontWeight: 500,
                    color: '#e2e8f0',
                    lineHeight: 1.2,
                  }}>
                    {aff.category}
                  </h3>
                  <span style={{
                    fontFamily: 'Cormorant Garamond, Georgia, serif',
                    fontSize: 22,
                    fontWeight: 500,
                    color: '#3b82f6',
                    flexShrink: 0,
                    marginLeft: 12,
                  }}>
                    {aff.engagement_pct}%
                  </span>
                </div>

                <p style={{ fontSize: 13, color: '#3a5070', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
                  {aff.description}
                </p>

                <AffinityBar pct={aff.engagement_pct} />

                {aff.examples && aff.examples.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
                    {aff.examples.map(ex => (
                      <span key={ex} style={{
                        fontSize: 11,
                        fontFamily: 'Inter, sans-serif',
                        color: '#2a3a5a',
                        background: '#0d1422',
                        border: '1px solid #1a2235',
                        borderRadius: 4,
                        padding: '3px 8px',
                      }}>
                        {ex}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @media (max-width: 700px) {
          .affinity-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
