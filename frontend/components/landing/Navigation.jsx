export default function Navigation() {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(10,10,10,0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64 }}>

        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24,
          fontWeight: 300, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Empirika
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          {[
            { label: 'Platform',      href: '#' },
            { label: 'Use Cases',     href: '#' },
            { label: 'Developers',    href: '/developer' },
            { label: 'Contact',       href: 'mailto:hello@empirika.co' },
          ].map(link => (
            <a key={link.label} href={link.href}
              style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 400,
                textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
              {link.label}
            </a>
          ))}
          <a href="/login" style={{
            padding: '8px 20px', background: 'var(--accent)', color: 'white',
            borderRadius: 6, fontSize: 14, fontWeight: 500, textDecoration: 'none',
            border: '1px solid var(--accent)', transition: 'background 0.2s',
            fontFamily: 'Inter, sans-serif',
          }}
          onMouseEnter={e => e.target.style.background = 'var(--accent-dark)'}
          onMouseLeave={e => e.target.style.background = 'var(--accent)'}>
            Dashboard
          </a>
        </div>
      </div>
    </nav>
  );
}
