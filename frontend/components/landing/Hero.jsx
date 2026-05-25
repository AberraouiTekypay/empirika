const STATS = [
  { label: 'Data Quality',        value: 'First-Party Only', sub: '100% verified behavioral signals. Zero inferred data.' },
  { label: 'Refresh Rate',        value: 'Real-Time',        sub: 'Daily updates. Catch audience shifts as they happen.' },
  { label: 'Segmentation Depth',  value: 'Micro-Level',      sub: 'Granular cohorts. 100+ behavioral dimensions.' },
];

export default function Hero() {
  return (
    <section style={{ padding: '120px 0 100px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* Asymmetric grid: text left, visual right */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 420px', gap: 80,
          alignItems: 'center',
        }} className="hero-grid">

          {/* Left: Content */}
          <div>
            <p style={{ fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase',
              color: 'var(--accent)', marginBottom: 24, fontWeight: 500 }}>
              Enterprise Behavioral Intelligence
            </p>

            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(44px,5vw,64px)',
              fontWeight: 300, lineHeight: 1.1, letterSpacing: '-1px',
              color: 'var(--text-primary)', marginBottom: 28 }}>
              Behavioral intelligence from proprietary first-party data.
            </h1>

            <p style={{ fontSize: 18, lineHeight: 1.7, color: 'var(--text-secondary)',
              maxWidth: 520, marginBottom: 40 }}>
              Enterprise-grade audience segmentation and predictive analytics built on verified
              engagement data. Understand not just <em>who</em> your audience is—but{' '}
              <em>why they engage</em>, <em>what drives them</em>, and{' '}
              <em>how to reach them</em> at scale.
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <a href="/dashboard" style={{
                padding: '14px 32px', background: 'var(--accent)', color: 'white',
                borderRadius: 6, fontSize: 15, fontWeight: 500, textDecoration: 'none',
                border: '1px solid var(--accent)', display: 'inline-block',
              }}>
                View Dashboard
              </a>
              <a href="mailto:hello@empirika.co" style={{
                padding: '14px 32px', background: 'transparent', color: 'var(--accent)',
                borderRadius: 6, fontSize: 15, fontWeight: 500, textDecoration: 'none',
                border: '1px solid var(--accent)', display: 'inline-block',
              }}>
                Request Demo
              </a>
            </div>
          </div>

          {/* Right: Visual */}
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
            borderRadius: 12, padding: 40, border: '1px solid var(--border)',
            boxShadow: '0 0 60px rgba(59,130,246,0.08)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: 340, textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📈</div>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22,
              fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>
              Behavioral Intelligence Dashboard
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
              Real-time segmentation · Affinity mapping<br />Predictive cohorts · API access
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1,
          marginTop: 64, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}
          className="stats-grid">
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              padding: '28px 32px', background: 'var(--bg-card)',
              borderRight: i < 2 ? '1px solid var(--border)' : 'none',
            }}>
              <p style={{ fontSize: 12, letterSpacing: '1.5px', textTransform: 'uppercase',
                color: 'var(--text-tertiary)', marginBottom: 8 }}>
                {s.label}
              </p>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28,
                fontWeight: 500, color: 'var(--accent)', marginBottom: 6 }}>
                {s.value}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {s.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
