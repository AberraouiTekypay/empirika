const REASONS = [
  {
    title: 'Cookie Deprecation',
    body: 'Third-party cookies are gone. First-party behavioral data is the new targeting foundation. Brands that build proprietary data pipelines now will own their audience relationships.',
  },
  {
    title: 'Creator Economy Growth',
    body: 'The creator economy generates billions of verified engagement signals daily. This is real behavioral data—more honest than any survey, more granular than any panel.',
  },
  {
    title: 'Niche Audiences = Higher Intent',
    body: 'Niche audiences self-select around deep passions. They exhibit 4–7× higher engagement rates than broad audiences and convert at significantly higher rates on aligned products.',
  },
  {
    title: 'AI Demands Data Quality',
    body: 'AI-powered targeting and optimization is only as good as its training data. First-party behavioral signals produce dramatically more accurate models than inferred proxies.',
  },
  {
    title: 'Real-Time > Batch',
    body: 'Audience behavior shifts in days, not quarters. Daily data refresh means campaigns can respond to behavioral changes before competitors even detect them.',
  },
  {
    title: 'Transparency Wins',
    body: 'Brands are demanding provenance for their audience data. Empirika provides full methodological transparency: sample sizes, confidence intervals, and data lineage on every segment.',
  },
];

export default function WhyNow() {
  return (
    <section style={{ padding: '100px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        <p style={{ fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase',
          color: 'var(--text-tertiary)', marginBottom: 16 }}>
          Market Timing
        </p>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(32px,4vw,42px)',
          fontWeight: 300, color: 'var(--text-primary)', marginBottom: 56, maxWidth: 520 }}>
          Why the market needs this now.
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}
          className="features-grid">
          {REASONS.map(r => (
            <div key={r.title}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 8, padding: 32, transition: 'border-color 0.25s, background 0.25s' }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.background =
                  'linear-gradient(135deg,rgba(59,130,246,0.05) 0%,rgba(59,130,246,0.02) 100%)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'var(--bg-card)';
              }}>
              <h3 style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)',
                marginBottom: 10 }}>
                {r.title}
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                {r.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
