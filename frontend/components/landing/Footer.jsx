export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg-darker)', borderTop: '1px solid var(--border)',
      padding: '40px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>

        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20,
          fontWeight: 300, color: 'var(--text-primary)' }}>
          Empirika
        </span>

        <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
          Enterprise behavioral intelligence for niche markets.
        </p>

        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', display: 'flex',
          alignItems: 'center', gap: 6 }}>
          <span>© {new Date().getFullYear()} Empirika. An</span>
          <a href="https://em300.co" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--text-secondary)', textDecoration: 'underline',
              textUnderlineOffset: 3, fontWeight: 500, transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
            EM300.co
          </a>
          <span>Company</span>
        </p>
      </div>
    </footer>
  );
}
