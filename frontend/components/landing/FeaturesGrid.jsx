const FEATURES = [
  {
    num: '01',
    title: 'Granular Audience Segmentation',
    body: 'Behavioral clustering across 100+ engagement dimensions. Move beyond demographics to true psychographic and interest-based cohorts that predict campaign performance.',
  },
  {
    num: '02',
    title: 'Cross-Platform Affinity Analysis',
    body: 'Map content affinities across YouTube, TikTok, Reddit, and more to find your audience wherever they gather. First-party signals only.',
  },
  {
    num: '03',
    title: 'Predictive Modeling',
    body: 'Identify lookalike cohorts, predict purchase propensity, and model audience growth trajectories. Statistical models trained on verified behavioral signals.',
  },
  {
    num: '04',
    title: 'Real-Time Sentiment Monitoring',
    body: 'Track what audiences say across Reddit, Twitter/X, and social platforms. Keyword trending, sentiment scoring, and community health metrics — updated daily.',
  },
  {
    num: '05',
    title: 'Enterprise API',
    body: 'Plug Empirika intelligence directly into your martech stack. RESTful API with OpenAPI spec, webhook support, and SDKs for Python, Node.js, and Go.',
  },
  {
    num: '06',
    title: 'Statistical Validation',
    body: 'Every insight is confidence-scored. Sample sizes, p-values, and confidence intervals surface alongside every segment. Data science transparency as standard.',
  },
];

export default function FeaturesGrid() {
  return (
    <section style={{ padding: '100px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        <p style={{
          fontSize: 11,
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          color: 'var(--text-tertiary)',
          marginBottom: 16,
          fontFamily: 'Inter, sans-serif',
        }}>
          Platform
        </p>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 40,
          marginBottom: 64,
          flexWrap: 'wrap',
        }}>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(32px,4vw,44px)',
            fontWeight: 300,
            color: 'var(--text-primary)',
            lineHeight: 1.15,
            letterSpacing: '-0.5px',
            maxWidth: 420,
          }}>
            How Empirika works.
          </h2>
          <p style={{
            fontSize: 15,
            lineHeight: 1.7,
            color: 'var(--text-secondary)',
            maxWidth: 440,
          }}>
            We aggregate first-party behavioral data, apply statistical rigor, and deliver predictive
            intelligence through an enterprise API and self-service dashboard.
          </p>
        </div>

        {/* Feature list — editorial, no icons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px' }}
          className="features-grid">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.num} {...f} last={i === FEATURES.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ num, title, body }) {
  return (
    <div
      style={{
        padding: '36px 32px',
        border: '1px solid var(--border)',
        background: 'var(--bg-card)',
        transition: 'background 0.2s',
        cursor: 'default',
        position: 'relative',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background =
          'linear-gradient(135deg, rgba(59,130,246,0.04) 0%, rgba(59,130,246,0.01) 100%)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--bg-card)';
      }}
    >
      <p style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: 48,
        fontWeight: 300,
        color: 'rgba(255,255,255,0.04)',
        lineHeight: 1,
        marginBottom: 20,
        letterSpacing: '-1px',
      }}>
        {num}
      </p>
      <h3 style={{
        fontSize: 16,
        fontWeight: 500,
        color: 'var(--text-primary)',
        marginBottom: 12,
        lineHeight: 1.35,
        fontFamily: 'Inter, sans-serif',
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: 14,
        lineHeight: 1.75,
        color: 'var(--text-secondary)',
        fontFamily: 'Inter, sans-serif',
      }}>
        {body}
      </p>
    </div>
  );
}
