const CASES = [
  {
    audience: 'For Brands',
    body: 'Identify high-intent audience cohorts before your competitors do. Move beyond demographic targeting to precise behavioral segments with verified engagement histories. Launch campaigns into audiences you know will convert.',
  },
  {
    audience: 'For Agencies',
    body: 'Win new business with superior audience insights your clients can\'t get elsewhere. Differentiate your media planning with first-party behavioral data and cross-platform affinity maps no panel can replicate.',
  },
  {
    audience: 'For Research Firms',
    body: 'Access niche panels traditional methodology can\'t reach. Statistical validation and confidence scoring built in. Export raw segments or access via API for integration into your existing research stack.',
  },
  {
    audience: 'For AdTech Platforms',
    body: 'Integrate Empirika\'s segmentation API to enrich your targeting layer. RESTful API, webhook support, and real-time segment refresh. Plug behavioral intelligence directly into your bidding and optimization pipeline.',
  },
];

export default function UseCases() {
  return (
    <section style={{ padding: '100px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        <p style={{ fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase',
          color: 'var(--text-tertiary)', marginBottom: 16 }}>
          Use Cases
        </p>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(32px,4vw,42px)',
          fontWeight: 300, color: 'var(--text-primary)', marginBottom: 56, maxWidth: 480 }}>
          Built for every layer of the intelligence stack.
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}
          className="usecases-grid">
          {CASES.map(c => (
            <div key={c.audience}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 8, padding: 28, transition: 'border-color 0.25s, background 0.25s' }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.background =
                  'linear-gradient(135deg,rgba(59,130,246,0.05) 0%,rgba(59,130,246,0.02) 100%)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'var(--bg-card)';
              }}>
              <p style={{ fontSize: 12, letterSpacing: '1.5px', textTransform: 'uppercase',
                color: 'var(--accent)', marginBottom: 14 }}>
                {c.audience}
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
