const TRADITIONAL = [
  '2–6 month research lag',
  'Sample sizes too small for niches',
  'Inferred behaviors, not observed',
  'Demographic-only segmentation',
  'No cross-platform journey data',
  'High cost for limited granularity',
];

const EMPIRIKA = [
  'Real-time data updates daily',
  'Precise cohorts for underserved audiences',
  'Observed engagement and behavioral signals',
  '100+ dimensions per audience segment',
  'Cross-platform affinity mapping',
  'Enterprise access, transparent pricing',
];

export default function ProblemSection() {
  return (
    <section style={{ padding: '100px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        <p style={{ fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase',
          color: 'var(--text-tertiary)', marginBottom: 16 }}>
          The Problem
        </p>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(32px,4vw,42px)',
          fontWeight: 300, color: 'var(--text-primary)', marginBottom: 20, maxWidth: 640 }}>
          The standard audience intelligence problem.
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text-secondary)',
          maxWidth: 680, marginBottom: 56 }}>
          Traditional audience research is slow, generic, and built on inference. Third-party panels
          miss niche communities. Public APIs are siloed. Brands are forced to choose between
          broad-stroke demographics or proprietary walled gardens.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}
          className="comparison-grid">

          {/* Traditional */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 8, padding: 36 }}>
            <p style={{ fontSize: 13, letterSpacing: '1px', textTransform: 'uppercase',
              color: 'var(--text-tertiary)', marginBottom: 20 }}>
              Traditional Panels
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex',
              flexDirection: 'column', gap: 14 }}>
              {TRADITIONAL.map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 12,
                  fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  <span style={{ color: '#ef4444', marginTop: 1, flexShrink: 0 }}>✗</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Empirika */}
          <div style={{ background: 'var(--bg-card)',
            border: '1px solid var(--accent)', borderRadius: 8, padding: 36,
            boxShadow: '0 0 30px rgba(59,130,246,0.06)' }}>
            <p style={{ fontSize: 13, letterSpacing: '1px', textTransform: 'uppercase',
              color: 'var(--accent)', marginBottom: 20 }}>
              Empirika
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex',
              flexDirection: 'column', gap: 14 }}>
              {EMPIRIKA.map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 12,
                  fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  <span style={{ color: '#22c55e', marginTop: 1, flexShrink: 0 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
