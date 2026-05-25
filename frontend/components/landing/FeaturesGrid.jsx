const FEATURES = [
  {
    icon: '📊',
    title: 'Granular Audience Segmentation',
    body: 'Behavioral clustering across 100+ engagement dimensions. Move beyond demographics to true psychographic and interest-based cohorts that predict campaign performance.',
  },
  {
    icon: '🔗',
    title: 'Cross-Platform Affinity Analysis',
    body: 'Understand audience journeys beyond a single platform. Map content affinities across YouTube, TikTok, Reddit, and more to find your audience wherever they gather.',
  },
  {
    icon: '🤖',
    title: 'Predictive Modeling',
    body: 'Identify lookalike cohorts, predict purchase propensity, and model audience growth trajectories. Statistical models trained on verified first-party behavioral signals.',
  },
  {
    icon: '💬',
    title: 'Real-Time Sentiment Monitoring',
    body: 'Track what audiences are saying across Reddit, Twitter/X, and social platforms. Keyword trending, sentiment scoring, and community health metrics in real time.',
  },
  {
    icon: '⚡',
    title: 'Enterprise API',
    body: 'Plug Empirika intelligence directly into your martech stack. RESTful API with OpenAPI spec, webhook support, and SDKs for Python, Node.js, and Go.',
  },
  {
    icon: '📈',
    title: 'Statistical Validation',
    body: 'Every insight is confidence-scored. See sample sizes, p-values, and confidence intervals alongside every segment. Data science transparency as standard.',
  },
];

export default function FeaturesGrid() {
  return (
    <section style={{ padding: '100px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        <p style={{ fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase',
          color: 'var(--text-tertiary)', marginBottom: 16 }}>
          Platform
        </p>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(32px,4vw,42px)',
          fontWeight: 300, color: 'var(--text-primary)', marginBottom: 16, maxWidth: 500 }}>
          How Empirika works.
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text-secondary)',
          maxWidth: 620, marginBottom: 56 }}>
          We aggregate first-party behavioral data, apply statistical rigor, and deliver predictive
          intelligence through an enterprise API and self-service dashboard.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}
          className="features-grid">
          {FEATURES.map(f => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, body }) {
  return (
    <div
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 8, padding: 32, transition: 'border-color 0.25s, background 0.25s',
        cursor: 'default' }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--accent)';
        e.currentTarget.style.background =
          'linear-gradient(135deg,rgba(59,130,246,0.05) 0%,rgba(59,130,246,0.02) 100%)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.background = 'var(--bg-card)';
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 16 }}>{icon}</div>
      <h3 style={{ fontSize: 17, fontWeight: 500, color: 'var(--text-primary)',
        marginBottom: 10, lineHeight: 1.3 }}>
        {title}
      </h3>
      <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
        {body}
      </p>
    </div>
  );
}
