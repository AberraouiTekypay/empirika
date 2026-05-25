const BULLETS = [
  'Intra-platform affinities (content clusters within a single network)',
  'Cross-platform affinities (behavior patterns that span platforms)',
  'Intent signal affinities (purchase intent proxies from engagement velocity)',
];

export default function AffinityDeepDive() {
  return (
    <section style={{ padding: '100px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80,
          alignItems: 'center' }} className="two-col-grid">

          {/* Left: Visual (reversed from Segmentation section) */}
          <div style={{
            background: 'linear-gradient(135deg, #0f1a2e 0%, #0a0f1a 100%)',
            borderRadius: 12, padding: 48, border: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: 320, textAlign: 'center',
            boxShadow: '0 0 40px rgba(59,130,246,0.06)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔀</div>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20,
              fontWeight: 500, color: 'var(--text-primary)', marginBottom: 10 }}>
              Cross-Platform Journey
            </p>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 2 }}>
              <span style={{ color: 'var(--text-secondary)' }}>YouTube viewer</span>
              <span style={{ color: 'var(--accent)', margin: '0 6px' }}>→</span>
              <span style={{ color: 'var(--text-secondary)' }}>TikTok sound</span>
              <br />
              <span style={{ color: 'var(--accent)', margin: '0 6px' }}>→</span>
              <span style={{ color: 'var(--text-secondary)' }}>Reddit discussion</span>
              <span style={{ color: 'var(--accent)', margin: '0 6px' }}>→</span>
              <span style={{ color: '#22c55e' }}>Purchase</span>
            </div>
          </div>

          {/* Right: Text */}
          <div>
            <p style={{ fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase',
              color: 'var(--text-tertiary)', marginBottom: 16 }}>
              Affinity Mapping
            </p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(32px,3.5vw,42px)',
              fontWeight: 300, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: 20 }}>
              Affinity: the untapped data.
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 28 }}>
              Audiences don&apos;t live on one platform. They watch, listen, scroll, and discuss
              across multiple surfaces. Empirika maps these journeys—revealing where your audience
              goes next, and what content moves them toward intent.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex',
              flexDirection: 'column', gap: 12 }}>
              {BULLETS.map(b => (
                <li key={b} style={{ display: 'flex', gap: 10, fontSize: 14,
                  color: 'var(--text-secondary)', lineHeight: 1.5, alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 600, marginTop: 1 }}>→</span>
                  {b}
                </li>
              ))}
            </ul>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.6,
              borderTop: '1px solid var(--border)', paddingTop: 20 }}>
              This reveals lookalike audiences your brand can&apos;t find through standard
              targeting—audiences with verified behavioral signals, not modeled proxies.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
