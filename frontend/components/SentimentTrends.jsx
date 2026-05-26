import { useState, useEffect } from 'react';
import { SENTIMENT_DATA } from '../lib/fakeData';

function SentimentGauge({ score, label }) {
  const isPositive = score > 65;
  const isNeutral  = score > 45;
  const color  = isPositive ? '#4ade80' : isNeutral ? '#fb923c' : '#f87171';
  const bgFill = isPositive ? 'rgba(74,222,128,0.08)' : isNeutral ? 'rgba(251,146,60,0.08)' : 'rgba(248,113,113,0.08)';
  const barColor = isPositive
    ? 'linear-gradient(90deg, #4ade80, #22c55e)'
    : isNeutral
    ? 'linear-gradient(90deg, #fb923c, #f97316)'
    : 'linear-gradient(90deg, #f87171, #ef4444)';

  return (
    <div style={{
      background: bgFill,
      border: `1px solid ${color}22`,
      borderRadius: 10,
      padding: 28,
    }}>
      <p style={{
        fontSize: 10,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        color: '#2a3a5a',
        marginBottom: 20,
        fontFamily: 'Inter, sans-serif',
      }}>
        Overall Sentiment
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
        <div style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 64,
          fontWeight: 300,
          color,
          lineHeight: 1,
        }}>
          {score}
        </div>
        <div>
          <p style={{ fontSize: 16, fontWeight: 500, color, fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>
            {label}
          </p>
          <p style={{ fontSize: 12, color: '#2a3a5a', fontFamily: 'Inter, sans-serif' }}>
            Community health index
          </p>
        </div>
      </div>
      <div style={{ height: 4, background: '#0d1422', borderRadius: 2 }}>
        <div style={{
          height: '100%',
          width: `${score}%`,
          background: barColor,
          borderRadius: 2,
          transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>
    </div>
  );
}

function Skeleton({ style = {} }) {
  return (
    <div style={{
      background: '#111827',
      borderRadius: 8,
      animation: 'pulse 1.5s ease-in-out infinite',
      ...style,
    }} />
  );
}

export default function SentimentTrends({ niche }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setData(SENTIMENT_DATA[niche] || null);
      setLoading(false);
    }, 650);
    return () => clearTimeout(t);
  }, [niche]);

  const maxMentions = data?.keywords
    ? Math.max(...data.keywords.map(k => k.mentions))
    : 1;

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
          Sentiment & Trends
        </p>
        <h2 style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 28,
          fontWeight: 400,
          color: '#f1f5f9',
          lineHeight: 1.2,
          marginBottom: 4,
        }}>
          Community Sentiment
        </h2>
        <p style={{ fontSize: 12, color: '#2a3a5a', fontFamily: 'Inter, sans-serif' }}>
          Reddit & social monitoring for {niche} keywords · last 30 days
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="sentiment-grid">

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {loading ? (
            <>
              <Skeleton style={{ height: 168 }} />
              <Skeleton style={{ height: 100 }} />
            </>
          ) : (
            <>
              <SentimentGauge
                score={data?.sentiment?.score ?? 50}
                label={data?.sentiment?.label ?? 'Neutral'}
              />
              <div style={{
                background: '#111827',
                border: '1px solid #1e2d45',
                borderRadius: 10,
                padding: 24,
              }}>
                <p style={{
                  fontSize: 10,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: '#2a3a5a',
                  marginBottom: 12,
                  fontFamily: 'Inter, sans-serif',
                }}>
                  Summary
                </p>
                <p style={{
                  fontSize: 13,
                  color: '#475569',
                  lineHeight: 1.7,
                  fontFamily: 'Inter, sans-serif',
                }}>
                  {data?.sentiment?.summary || '—'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Right column — Keyword list */}
        <div style={{
          background: '#111827',
          border: '1px solid #1e2d45',
          borderRadius: 10,
          padding: 24,
        }}>
          <p style={{
            fontSize: 10,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#2a3a5a',
            marginBottom: 20,
            fontFamily: 'Inter, sans-serif',
          }}>
            Top Keywords
          </p>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} style={{ height: 28, borderRadius: 4 }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(data?.keywords || []).map((kw, i) => {
                const pct = Math.round((kw.mentions / maxMentions) * 100);
                return (
                  <div key={kw.keyword}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 5,
                    }}>
                      <span style={{
                        fontSize: 13,
                        color: i < 3 ? '#94a3b8' : '#3a5070',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: i < 3 ? 500 : 400,
                      }}>
                        {kw.keyword}
                      </span>
                      <span style={{
                        fontSize: 11,
                        color: '#1e2d45',
                        fontFamily: 'Inter, sans-serif',
                        fontVariantNumeric: 'tabular-nums',
                      }}>
                        {kw.mentions.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ height: 2, background: '#0d1422', borderRadius: 1 }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: i < 3 ? '#3b82f6' : '#1e3a5a',
                        borderRadius: 1,
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @media (max-width: 700px) {
          .sentiment-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
