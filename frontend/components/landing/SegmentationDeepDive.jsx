const BULLETS = [
  'Engagement velocity',
  'Retention patterns',
  'Social behaviors',
  'Content affinity',
  'Cross-platform gravity',
  'Temporal patterns',
];

export default function SegmentationDeepDive() {
  return (
    <section style={{ padding: '100px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80,
          alignItems: 'center' }} className="two-col-grid">

          {/* Left: Text */}
          <div>
            <p style={{ fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase',
              color: 'var(--text-tertiary)', marginBottom: 16 }}>
              Segmentation
            </p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(32px,3.5vw,42px)',
              fontWeight: 300, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: 20 }}>
              Behavioral segmentation at scale.
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 28 }}>
              Demographics tell you who showed up. Behavioral data tells you why they stayed—and
              what they&apos;ll do next. Empirika builds cohorts from observed engagement signals,
              not survey-inferred proxies.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex',
              flexDirection: 'column', gap: 10 }}>
              {BULLETS.map(b => (
                <li key={b} style={{ display: 'flex', gap: 10, fontSize: 14,
                  color: 'var(--text-secondary)', alignItems: 'center' }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>→</span>
                  {b}
                </li>
              ))}
            </ul>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.6,
              borderTop: '1px solid var(--border)', paddingTop: 20 }}>
              <strong style={{ color: 'var(--text-secondary)' }}>Result:</strong> Hyperprecise
              cohorts that predict campaign performance with 92%+ accuracy.
            </p>
          </div>

          {/* Right: Visual */}
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
            borderRadius: 12, padding: 48, border: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: 320, textAlign: 'center',
            boxShadow: '0 0 40px rgba(59,130,246,0.06)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20,
              fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>
              Segment Visualization
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.7 }}>
              High-engagement cohort · 18–45 age range<br />
              STEM interests · 94% retention signal<br />
              <span style={{ color: 'var(--accent)' }}>↑ 2.3× predicted conversion lift</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
