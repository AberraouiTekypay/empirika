const STATS = [
  { label: 'Data Quality',        value: 'First-Party Only', sub: '100% verified behavioral signals. Zero inferred data.' },
  { label: 'Refresh Rate',        value: 'Daily Updates',    sub: 'Catch audience shifts as they happen, every 24 hours.' },
  { label: 'Segmentation Depth',  value: 'Micro-Level',      sub: 'Granular cohorts across 100+ behavioral dimensions.' },
];

const LIVE_METRICS = [
  { label: 'Audience Index',     value: 84.2,  bar: 84,  unit: '' },
  { label: 'Affinity Clusters',  value: 31,    bar: 62,  unit: '' },
  { label: 'Sentiment Score',    value: 76.8,  bar: 77,  unit: '' },
];

export default function Hero() {
  return (
    <section style={{ padding: '120px 0 100px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* Asymmetric grid: text left, visual right */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 400px', gap: 80,
          alignItems: 'center',
        }} className="hero-grid">

          {/* Left: Content */}
          <div>
            <p style={{
              fontSize: 11,
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: 24,
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
            }}>
              Enterprise Behavioral Intelligence
            </p>

            <h1 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(44px,5vw,68px)',
              fontWeight: 300,
              lineHeight: 1.08,
              letterSpacing: '-1.5px',
              color: 'var(--text-primary)',
              marginBottom: 28,
            }}>
              Behavioral<br />intelligence from<br />first-party data.
            </h1>

            <p style={{
              fontSize: 17,
              lineHeight: 1.75,
              color: 'var(--text-secondary)',
              maxWidth: 500,
              marginBottom: 44,
              fontFamily: 'Inter, sans-serif',
            }}>
              Enterprise-grade audience segmentation and predictive analytics built on
              verified engagement data. Understand not just <em>who</em> your audience
              is — but <em>why they engage</em>, <em>what drives them</em>, and{' '}
              <em>how to reach them</em> at scale.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <a href="/login" style={{
                padding: '14px 32px',
                background: 'var(--accent)',
                color: 'white',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                fontFamily: 'Inter, sans-serif',
                textDecoration: 'none',
                border: '1px solid var(--accent)',
                display: 'inline-block',
                transition: 'background 0.2s',
                letterSpacing: '0.2px',
              }}
              onMouseEnter={e => e.target.style.background = 'var(--accent-dark)'}
              onMouseLeave={e => e.target.style.background = 'var(--accent)'}>
                View Dashboard
              </a>
              <a href="mailto:hello@empirika.co" style={{
                padding: '14px 32px',
                background: 'transparent',
                color: 'var(--text-secondary)',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 400,
                fontFamily: 'Inter, sans-serif',
                textDecoration: 'none',
                border: '1px solid var(--border)',
                display: 'inline-block',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => { e.target.style.borderColor = '#444'; e.target.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-secondary)'; }}>
                Request Demo
              </a>
            </div>
          </div>

          {/* Right: Premium data visual */}
          <div style={{
            background: '#0e0e0e',
            borderRadius: 12,
            border: '1px solid #1e1e1e',
            padding: 32,
            boxShadow: '0 0 80px rgba(59,130,246,0.06)',
          }}>
            {/* Status row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 28,
            }}>
              <span style={{
                fontSize: 10,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: '#333',
                fontFamily: 'Inter, sans-serif',
              }}>
                Live · 5 Niches Active
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#22c55e',
                  boxShadow: '0 0 8px rgba(34,197,94,0.5)',
                  display: 'inline-block',
                }} />
                <span style={{ fontSize: 10, color: '#333', fontFamily: 'Inter, sans-serif' }}>
                  Live
                </span>
              </div>
            </div>

            {/* Metric bars */}
            {LIVE_METRICS.map(m => (
              <div key={m.label} style={{ marginBottom: 22 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}>
                  <span style={{ fontSize: 12, color: '#444', fontFamily: 'Inter, sans-serif' }}>
                    {m.label}
                  </span>
                  <span style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 18,
                    fontWeight: 500,
                    color: '#777',
                  }}>
                    {m.value}
                  </span>
                </div>
                <div style={{ height: 2, background: '#1a1a1a', borderRadius: 1 }}>
                  <div style={{
                    height: '100%',
                    width: `${m.bar}%`,
                    background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                    borderRadius: 1,
                  }} />
                </div>
              </div>
            ))}

            {/* Divider */}
            <div style={{ borderTop: '1px solid #151515', margin: '24px 0' }} />

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[
                { label: 'Channels', value: '247' },
                { label: 'Segments', value: '31' },
                { label: 'Data Points', value: '18M+' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <p style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 24,
                    fontWeight: 400,
                    color: '#555',
                    marginBottom: 4,
                    lineHeight: 1,
                  }}>
                    {s.value}
                  </p>
                  <p style={{
                    fontSize: 10,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    color: '#252525',
                    fontFamily: 'Inter, sans-serif',
                  }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Timestamp */}
            <p style={{
              marginTop: 24,
              paddingTop: 20,
              borderTop: '1px solid #111',
              fontSize: 10,
              color: '#202020',
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '0.3px',
            }}>
              Updated daily · verified first-party data only
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
          marginTop: 72, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden',
        }} className="stats-grid">
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              padding: '32px 36px',
              background: 'var(--bg-card)',
              borderRight: i < 2 ? '1px solid var(--border)' : 'none',
            }}>
              <p style={{
                fontSize: 10,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
                marginBottom: 10,
                fontFamily: 'Inter, sans-serif',
              }}>
                {s.label}
              </p>
              <p style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 26,
                fontWeight: 400,
                color: 'var(--accent)',
                marginBottom: 8,
              }}>
                {s.value}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
                {s.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
