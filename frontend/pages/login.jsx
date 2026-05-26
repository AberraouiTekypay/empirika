import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!code.trim()) {
      setError('Please enter your access code.');
      return;
    }

    setLoading(true);

    // Demo gate — any valid email + code "demo"
    setTimeout(() => {
      if (code.trim().toLowerCase() === 'demo') {
        localStorage.setItem(
          'empirika_authed',
          JSON.stringify({ email: email.trim(), ts: Date.now() })
        );
        router.push('/dashboard');
      } else {
        setError('Invalid access code. Contact your account manager for credentials.');
        setLoading(false);
      }
    }, 900);
  };

  return (
    <>
      <Head>
        <title>Empirika — Platform Access</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: '#080808',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Top bar */}
        <div style={{
          padding: '24px 40px',
          borderBottom: '1px solid #1a1a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: 22,
            fontWeight: 300,
            color: '#ffffff',
            letterSpacing: '-0.3px',
          }}>
            Empirika
          </span>
          <a
            href="mailto:hello@empirika.co"
            style={{
              fontSize: 13,
              color: '#666',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.target.style.color = '#999'}
            onMouseLeave={e => e.target.style.color = '#666'}
          >
            Request access
          </a>
        </div>

        {/* Main content */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
        }}>
          <div style={{ width: '100%', maxWidth: 880, display: 'flex', gap: 80, alignItems: 'center' }}>

            {/* Left — Form */}
            <div style={{ flex: 1, maxWidth: 380 }}>
              <div style={{ marginBottom: 48 }}>
                <p style={{
                  fontSize: 11,
                  letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                  color: '#444',
                  marginBottom: 16,
                  fontFamily: 'Inter, sans-serif',
                }}>
                  Platform Access
                </p>
                <h1 style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontSize: 'clamp(32px, 4vw, 42px)',
                  fontWeight: 300,
                  color: '#ffffff',
                  lineHeight: 1.15,
                  letterSpacing: '-0.5px',
                  marginBottom: 12,
                }}>
                  Sign in to your<br />intelligence suite.
                </h1>
                <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
                  Enterprise behavioral data and audience intelligence for creator professionals.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 11,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    color: '#555',
                    marginBottom: 10,
                    fontFamily: 'Inter, sans-serif',
                  }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    disabled={loading}
                    style={{
                      width: '100%',
                      background: '#111',
                      border: '1px solid #222',
                      borderRadius: 6,
                      padding: '14px 16px',
                      fontSize: 14,
                      color: '#fff',
                      outline: 'none',
                      fontFamily: 'Inter, sans-serif',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#222'}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 11,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    color: '#555',
                    marginBottom: 10,
                    fontFamily: 'Inter, sans-serif',
                  }}>
                    Access code
                  </label>
                  <input
                    type="password"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    style={{
                      width: '100%',
                      background: '#111',
                      border: '1px solid #222',
                      borderRadius: 6,
                      padding: '14px 16px',
                      fontSize: 14,
                      color: '#fff',
                      outline: 'none',
                      fontFamily: 'Inter, sans-serif',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#222'}
                  />
                </div>

                {error && (
                  <p style={{
                    fontSize: 13,
                    color: '#f87171',
                    fontFamily: 'Inter, sans-serif',
                    padding: '10px 14px',
                    background: 'rgba(248,113,113,0.08)',
                    borderRadius: 6,
                    border: '1px solid rgba(248,113,113,0.2)',
                  }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: loading ? '#1d3a6e' : '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s',
                    letterSpacing: '0.2px',
                  }}
                  onMouseEnter={e => { if (!loading) e.target.style.background = '#2563eb'; }}
                  onMouseLeave={e => { if (!loading) e.target.style.background = '#3b82f6'; }}
                >
                  {loading ? 'Authenticating…' : 'Sign in'}
                </button>
              </form>

              <p style={{
                marginTop: 32,
                fontSize: 12,
                color: '#333',
                fontFamily: 'Inter, sans-serif',
                lineHeight: 1.6,
              }}>
                Demo access: use code{' '}
                <code style={{
                  background: '#161616',
                  color: '#666',
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontFamily: 'monospace',
                  fontSize: 12,
                }}>
                  demo
                </code>
                {' '}with any email address.
              </p>
            </div>

            {/* Right — Data Visual */}
            <div style={{
              flex: 1,
              display: 'none',
            }} className="login-visual">
              <div style={{
                background: '#0e0e0e',
                border: '1px solid #1e1e1e',
                borderRadius: 12,
                padding: 36,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 32,
                }}>
                  <p style={{ fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase', color: '#444', fontFamily: 'Inter, sans-serif' }}>
                    Live · 5 Niches Active
                  </p>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#22c55e',
                    boxShadow: '0 0 8px rgba(34,197,94,0.6)',
                    display: 'inline-block',
                  }} />
                </div>

                {[
                  { label: 'Audience Index', value: '84.2', bar: 84 },
                  { label: 'Affinity Clusters', value: '31', bar: 62 },
                  { label: 'Sentiment Score', value: '76.8', bar: 77 },
                ].map(item => (
                  <div key={item.label} style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: '#555', fontFamily: 'Inter, sans-serif' }}>{item.label}</span>
                      <span style={{ fontSize: 13, color: '#888', fontFamily: 'Cormorant Garamond, serif', fontWeight: 500 }}>{item.value}</span>
                    </div>
                    <div style={{ height: 2, background: '#1a1a1a', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${item.bar}%`, background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', borderRadius: 2 }} />
                    </div>
                  </div>
                ))}

                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 16, marginTop: 32,
                  paddingTop: 24,
                  borderTop: '1px solid #1a1a1a',
                }}>
                  {[
                    { label: 'Channels', value: '247' },
                    { label: 'Segments', value: '31' },
                    { label: 'API', value: 'Live' },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 500, color: '#e2e8f0', marginBottom: 4 }}>{s.value}</p>
                      <p style={{ fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', color: '#333', fontFamily: 'Inter, sans-serif' }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                <p style={{
                  marginTop: 28, paddingTop: 20,
                  borderTop: '1px solid #1a1a1a',
                  fontSize: 11, color: '#2a2a2a',
                  fontFamily: 'Inter, sans-serif',
                  letterSpacing: '0.5px',
                }}>
                  Updated · {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · UTC
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 40px',
          borderTop: '1px solid #111',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <p style={{ fontSize: 12, color: '#2a2a2a', fontFamily: 'Inter, sans-serif' }}>
            © {new Date().getFullYear()} Empirika. Enterprise Behavioral Intelligence.
          </p>
          <a
            href="/"
            style={{ fontSize: 12, color: '#2a2a2a', textDecoration: 'none', fontFamily: 'Inter, sans-serif' }}
            onMouseEnter={e => e.target.style.color = '#555'}
            onMouseLeave={e => e.target.style.color = '#2a2a2a'}
          >
            Back to site
          </a>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .login-visual { display: block !important; }
        }
        input::placeholder { color: #2e2e2e; }
      `}</style>
    </>
  );
}
