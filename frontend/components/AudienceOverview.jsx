import { useState, useEffect } from 'react';
import { formatNumber, formatDuration, downloadCSV } from '../lib/utils';
import { AUDIENCE_DATA, TOTAL_TRENDS } from '../lib/fakeData';

function Sparkline({ bars }) {
  const max = Math.max(...bars);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 28, width: 60 }}>
      {bars.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            borderRadius: 2,
            background: '#3b82f6',
            height: `${Math.round((v / max) * 100)}%`,
            opacity: 0.25 + (i / bars.length) * 0.75,
          }}
        />
      ))}
    </div>
  );
}

function TrendBadge({ pct }) {
  const up = pct >= 0;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      fontSize: 11,
      fontWeight: 500,
      fontFamily: 'Inter, sans-serif',
      color: up ? '#4ade80' : '#f87171',
    }}>
      {up ? '↑' : '↓'} {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

function MetricCard({ label, value, sub, trend }) {
  return (
    <div style={{
      background: '#111827',
      border: '1px solid #1e2d45',
      borderRadius: 8,
      padding: '20px 24px',
    }}>
      <p style={{
        fontSize: 10,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        color: '#3a5070',
        marginBottom: 8,
        fontFamily: 'Inter, sans-serif',
      }}>
        {label}
      </p>
      <p style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: 32,
        fontWeight: 500,
        color: '#f1f5f9',
        lineHeight: 1,
        marginBottom: 6,
      }}>
        {value}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 11, color: '#2a3a5a', fontFamily: 'Inter, sans-serif' }}>{sub}</p>
        {trend !== undefined && <TrendBadge pct={trend} />}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{
      background: '#111827',
      border: '1px solid #1e2d45',
      borderRadius: 8,
      padding: '20px 24px',
      height: 108,
      animation: 'pulse 1.5s ease-in-out infinite',
    }} />
  );
}

export default function AudienceOverview({ niche }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setData(AUDIENCE_DATA[niche] || []);
      setLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, [niche]);

  const trends = TOTAL_TRENDS[niche] || {};
  const totalViews       = data.reduce((s, r) => s + (r.total_views || 0), 0);
  const totalWatchHours  = data.reduce((s, r) => s + (r.total_watch_hours || 0), 0);
  const avgDuration      = data.length
    ? data.reduce((s, r) => s + (r.avg_view_duration_seconds || 0), 0) / data.length
    : 0;
  const totalSubscribers = data.reduce((s, r) => s + (r.total_subscribers_gained || 0), 0);

  return (
    <div>
      {/* Section header */}
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
            Audience Overview
          </p>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: 28,
            fontWeight: 400,
            color: '#f1f5f9',
            lineHeight: 1.2,
            marginBottom: 4,
          }}>
            {niche} Audience
          </h2>
          <p style={{ fontSize: 12, color: '#2a3a5a', fontFamily: 'Inter, sans-serif' }}>
            Last 30 days · {loading ? '–' : data.length} channel{data.length !== 1 ? 's' : ''} tracked
          </p>
        </div>

        <button
          onClick={() => downloadCSV(data, `empirika-${niche.toLowerCase()}-audience.csv`)}
          disabled={data.length === 0 || loading}
          style={{
            padding: '8px 18px',
            background: 'transparent',
            border: '1px solid #1e2d45',
            borderRadius: 6,
            fontSize: 12,
            color: '#3a5070',
            cursor: data.length === 0 || loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Inter, sans-serif',
            opacity: data.length === 0 || loading ? 0.4 : 1,
            transition: 'color 0.2s, border-color 0.2s',
          }}
          onMouseEnter={e => { if (!loading) { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#2a3a5a'; } }}
          onMouseLeave={e => { e.currentTarget.style.color = '#3a5070'; e.currentTarget.style.borderColor = '#1e2d45'; }}
        >
          Export CSV
        </button>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }} className="metrics-grid">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)
        ) : (
          <>
            <MetricCard label="Total Views (30d)"  value={formatNumber(totalViews)}       sub="across all channels"    trend={trends.views} />
            <MetricCard label="Watch Hours (30d)"  value={formatNumber(totalWatchHours)}  sub="estimated total"        trend={trends.watchHours} />
            <MetricCard label="Avg Watch Duration" value={formatDuration(avgDuration)}    sub="per video"              trend={trends.avgDuration} />
            <MetricCard label="New Subscribers"    value={`+${formatNumber(totalSubscribers)}`} sub="30-day net gain"  trend={trends.subscribers} />
          </>
        )}
      </div>

      {/* Channel table */}
      <div style={{
        background: '#0d1422',
        border: '1px solid #1e2d45',
        borderRadius: 10,
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #1a2235',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h3 style={{
            fontSize: 13,
            fontWeight: 500,
            color: '#475569',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.2px',
          }}>
            Channel Breakdown
          </h3>
          <span style={{ fontSize: 11, color: '#1e2d45', fontFamily: 'Inter, sans-serif' }}>7-day trend</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1a2235' }}>
                {['Channel', 'Subscribers', 'Views (30d)', 'Watch Hrs', 'Avg Duration', 'Trend'].map((h, i) => (
                  <th key={h} style={{
                    padding: i === 0 ? '12px 24px' : '12px 16px',
                    textAlign: i === 0 ? 'left' : 'right',
                    fontSize: 10,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    color: '#1e2d45',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #111827' }}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} style={{ padding: j === 0 ? '14px 24px' : '14px 16px' }}>
                        <div style={{
                          height: 14,
                          background: '#1a2235',
                          borderRadius: 3,
                          width: j === 0 ? 180 : '80%',
                          animation: 'pulse 1.5s ease-in-out infinite',
                        }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                data.map((ch, idx) => (
                  <tr
                    key={ch.channel_id}
                    style={{
                      borderBottom: idx < data.length - 1 ? '1px solid #111827' : 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: `hsl(${(idx * 60) + 200}, 60%, 15%)`,
                          border: `1px solid hsl(${(idx * 60) + 200}, 60%, 22%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 600, color: `hsl(${(idx * 60) + 200}, 80%, 60%)`,
                          fontFamily: 'Inter, sans-serif',
                          flexShrink: 0,
                        }}>
                          {ch.channel_name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 500, color: '#cbd5e1', fontFamily: 'Inter, sans-serif' }}>
                          {ch.channel_name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', color: '#475569', fontFamily: 'Inter, sans-serif' }}>
                      {formatNumber(ch.subscriber_count)}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', color: '#475569', fontFamily: 'Inter, sans-serif' }}>
                      {formatNumber(ch.total_views)}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', color: '#475569', fontFamily: 'Inter, sans-serif' }}>
                      {formatNumber(Math.round(ch.total_watch_hours))}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', color: '#475569', fontFamily: 'Inter, sans-serif' }}>
                      {formatDuration(ch.avg_view_duration_seconds)}
                    </td>
                    <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                        <TrendBadge pct={ch.trend_pct} />
                        <Sparkline bars={ch.trend} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @media (max-width: 900px) {
          .metrics-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .metrics-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
