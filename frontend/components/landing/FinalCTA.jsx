export default function FinalCTA() {
  return (
    <section style={{ padding: '120px 0', background: 'var(--bg-dark)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>

        <p style={{ fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase',
          color: 'var(--accent)', marginBottom: 24 }}>
          Private Beta
        </p>

        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(36px,5vw,52px)',
          fontWeight: 300, color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: 24 }}>
          Enterprise behavioral intelligence.<br />In private beta.
        </h2>

        <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--text-secondary)',
          marginBottom: 44, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
          Book a private demo to see Empirika&apos;s segmentation engine and affinity analysis
          in action. Access is by application only.
        </p>

        <a href="mailto:hello@empirika.co" style={{
          display: 'inline-block', padding: '16px 40px',
          background: 'var(--accent)', color: 'white',
          borderRadius: 6, fontSize: 16, fontWeight: 500, textDecoration: 'none',
          border: '1px solid var(--accent)', letterSpacing: '0.2px',
        }}>
          Schedule a 30-Min Demo
        </a>

        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 20 }}>
          Or email us directly at{' '}
          <a href="mailto:hello@empirika.co"
            style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>
            hello@empirika.co
          </a>
        </p>
      </div>
    </section>
  );
}
