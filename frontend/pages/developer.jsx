import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

const NICHES = ['Trades', 'Mythology', 'Scouts', 'Neurodivergent', 'Stories'];

const CODE_SAMPLES = {
  curl: (key, niche) => `curl -s https://api.empirika.io/v1/audience/${niche} \\
  -H "X-API-Key: ${key}"`,

  js: (key, niche) => `const res = await fetch(
  'https://api.empirika.io/v1/audience/${niche}',
  { headers: { 'X-API-Key': '${key}' } }
);
const data = await res.json();
console.log(data);`,

  python: (key, niche) => `import requests

resp = requests.get(
    'https://api.empirika.io/v1/audience/${niche}',
    headers={'X-API-Key': '${key}'}
)
print(resp.json())`,
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      style={{
        position: 'absolute', top: 12, right: 12,
        background: copied ? '#22c55e' : 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: copied ? '#fff' : '#9ca3af',
        borderRadius: 6, padding: '4px 12px',
        fontSize: 12, cursor: 'pointer', transition: 'all 0.2s',
      }}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

function CodeBlock({ code, lang }) {
  return (
    <div style={{ position: 'relative' }}>
      <pre style={{
        background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12, padding: '20px 24px', overflowX: 'auto',
        fontSize: 13, lineHeight: 1.7, color: '#e2e8f0', margin: 0,
        fontFamily: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
      }}>
        <code>{code}</code>
      </pre>
      <CopyButton text={code} />
    </div>
  );
}

function KeyRow({ k, onRevoke }) {
  const [confirming, setConfirming] = useState(false);
  const [email, setEmail] = useState('');
  const [revoking, setRevoking] = useState(false);

  const handleRevoke = async () => {
    if (!email) return;
    setRevoking(true);
    try {
      const r = await fetch(`/api/dev/keys/${k.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (r.ok) onRevoke(k.id);
    } finally {
      setRevoking(false);
      setConfirming(false);
    }
  };

  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <td style={{ padding: '14px 16px', color: '#e2e8f0', fontFamily: 'monospace', fontSize: 13 }}>
        {k.key_prefix}…
      </td>
      <td style={{ padding: '14px 16px' }}>
        <span style={{
          background: k.environment === 'production' ? 'rgba(34,197,94,0.12)' : 'rgba(59,130,246,0.12)',
          color: k.environment === 'production' ? '#22c55e' : '#60a5fa',
          borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
        }}>
          {k.environment}
        </span>
      </td>
      <td style={{ padding: '14px 16px', color: '#9ca3af', fontSize: 13 }}>{k.name}</td>
      <td style={{ padding: '14px 16px', color: '#9ca3af', fontSize: 12 }}>
        {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'Never'}
      </td>
      <td style={{ padding: '14px 16px', color: '#9ca3af', fontSize: 12 }}>
        {new Date(k.created_at).toLocaleDateString()}
      </td>
      <td style={{ padding: '14px 16px' }}>
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171', borderRadius: 6, padding: '4px 12px',
              fontSize: 12, cursor: 'pointer',
            }}
          >
            Revoke
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              type="email"
              placeholder="Confirm email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#e2e8f0', borderRadius: 6, padding: '4px 8px', fontSize: 12, width: 160,
              }}
            />
            <button
              onClick={handleRevoke}
              disabled={revoking}
              style={{
                background: '#ef4444', border: 'none', color: '#fff',
                borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer',
              }}
            >
              {revoking ? '…' : 'Confirm'}
            </button>
            <button
              onClick={() => setConfirming(false)}
              style={{
                background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                color: '#9ca3af', borderRadius: 6, padding: '4px 8px', fontSize: 12, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

export default function DeveloperPortal() {
  // ── Create key form ───────────────────────────────────────────────
  const [form, setForm] = useState({ name: '', email: '', environment: 'sandbox' });
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey]   = useState(null);
  const [createError, setCreateError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    setNewKey(null);
    try {
      const r = await fetch('/api/dev/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || 'Failed to create key');
      setNewKey(data);
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  // ── Look up existing keys ─────────────────────────────────────────
  const [lookupEmail, setLookupEmail] = useState('');
  const [keys, setKeys]               = useState(null);
  const [lookingUp, setLookingUp]     = useState(false);

  const handleLookup = async (e) => {
    e.preventDefault();
    setLookingUp(true);
    try {
      const r = await fetch(`/api/dev/keys?email=${encodeURIComponent(lookupEmail)}`);
      const data = await r.json();
      setKeys(data.keys || []);
    } finally {
      setLookingUp(false);
    }
  };

  const handleRevoke = (id) => setKeys(prev => prev.filter(k => k.id !== id));

  // ── Code samples ──────────────────────────────────────────────────
  const [lang, setLang]   = useState('curl');
  const [niche, setNiche] = useState('Mythology');
  const sampleKey = newKey?.key || 'emp_sandbox_your_key_here';

  // ── Styles ────────────────────────────────────────────────────────
  const s = {
    page:    { background: '#0a0a0a', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' },
    nav:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 48px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
    section: { maxWidth: 900, margin: '0 auto', padding: '0 24px' },
    card:    { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '32px' },
    h2:      { fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: '0 0 8px' },
    label:   { display: 'block', fontSize: 13, color: '#9ca3af', marginBottom: 6, fontWeight: 500 },
    input:   { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' },
    btn:     { background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', border: 'none', color: '#fff', borderRadius: 8, padding: '11px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
    pill:    (active) => ({
      background: active ? 'rgba(59,130,246,0.15)' : 'transparent',
      border: active ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.08)',
      color: active ? '#60a5fa' : '#9ca3af',
      borderRadius: 6, padding: '6px 14px', fontSize: 13,
      cursor: 'pointer', transition: 'all 0.15s',
    }),
  };

  return (
    <>
      <Head>
        <title>Developer Portal — Empirika</title>
        <meta name="description" content="Generate API keys, test in sandbox, and go live with the Empirika Audience Intelligence API." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div style={s.page}>

        {/* ── Nav ── */}
        <nav style={s.nav}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: 6 }} />
            <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16 }}>Empirika</span>
          </Link>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <a href="/docs" target="_blank" rel="noopener" style={{ color: '#9ca3af', fontSize: 14, textDecoration: 'none' }}>API Docs ↗</a>
            <Link href="/dashboard" style={{ color: '#9ca3af', fontSize: 14, textDecoration: 'none' }}>Dashboard</Link>
          </div>
        </nav>

        {/* ── Hero ── */}
        <div style={{ textAlign: 'center', padding: '72px 24px 56px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 20, padding: '5px 14px', fontSize: 12, color: '#60a5fa', marginBottom: 24, fontWeight: 600 }}>
            ◉ DEVELOPER PORTAL
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, color: '#f1f5f9', margin: '0 0 20px', lineHeight: 1.15 }}>
            Build with the<br />
            <span style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Empirika API
            </span>
          </h1>
          <p style={{ fontSize: 18, color: '#94a3b8', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Programmatic access to audience intelligence across five high-value YouTube niches.
            Start free in sandbox, go live in minutes.
          </p>

          {/* Steps */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            {[
              { n: '1', label: 'Create your API key', sub: 'Free sandbox included' },
              { n: '2', label: 'Test in sandbox',     sub: 'Rich mock data, no limits' },
              { n: '3', label: 'Go live',             sub: 'Real YouTube data' },
            ].map(step => (
              <div key={step.n} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px 28px', minWidth: 180, textAlign: 'left' }}>
                <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 12 }}>{step.n}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>{step.label}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{step.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...s.section, paddingTop: 64 }}>

          {/* ── Create Key ── */}
          <section style={{ marginBottom: 64 }}>
            <div style={s.card}>
              <h2 style={s.h2}>Get your API key</h2>
              <p style={{ color: '#6b7280', fontSize: 14, marginTop: 0, marginBottom: 28 }}>
                Sandbox keys are free and instant. Production keys require a paid plan.
              </p>

              {newKey ? (
                <div>
                  <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                    <div style={{ fontSize: 13, color: '#22c55e', fontWeight: 600, marginBottom: 10 }}>
                      ✓ Key created — copy it now, it won't be shown again
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '12px 16px' }}>
                      <code style={{ flex: 1, color: '#e2e8f0', fontSize: 13, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        {newKey.key}
                      </code>
                      <CopyButton text={newKey.key} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {[
                      { label: 'Environment', value: newKey.environment },
                      { label: 'Rate limit',  value: `${newKey.rate_limit_rpm} req/min` },
                      { label: 'Key prefix',  value: newKey.key_prefix },
                    ].map(item => (
                      <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '12px 16px' }}>
                        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.label}</div>
                        <div style={{ fontSize: 13, color: '#e2e8f0', fontFamily: 'monospace' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setNewKey(null)} style={{ ...s.btn, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', marginTop: 16 }}>
                    Create another key
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreate}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={s.label}>Key name</label>
                      <input style={s.input} placeholder="e.g. My App — Production" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                    </div>
                    <div>
                      <label style={s.label}>Email address</label>
                      <input style={s.input} type="email" placeholder="you@company.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                    </div>
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <label style={s.label}>Environment</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['sandbox', 'production'].map(env => (
                        <button key={env} type="button" onClick={() => setForm(f => ({ ...f, environment: env }))} style={s.pill(form.environment === env)}>
                          {env === 'sandbox' ? '🧪 Sandbox' : '🚀 Production'}
                        </button>
                      ))}
                    </div>
                    <p style={{ fontSize: 12, color: '#4b5563', marginTop: 8 }}>
                      {form.environment === 'sandbox'
                        ? 'Sandbox keys return deterministic mock data. Rate limit: 60 req/min.'
                        : 'Production keys return live BigQuery data. Rate limit: 120 req/min. Requires paid plan.'}
                    </p>
                  </div>
                  {createError && (
                    <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13, marginBottom: 16 }}>
                      {createError}
                    </div>
                  )}
                  <button type="submit" disabled={creating} style={s.btn}>
                    {creating ? 'Creating…' : 'Create API key →'}
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* ── Code Samples ── */}
          <section style={{ marginBottom: 64 }}>
            <h2 style={{ ...s.h2, marginBottom: 6 }}>Make your first request</h2>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>
              Pick a language and niche below. The example uses your sandbox key (or a placeholder if you haven't created one yet).
            </p>

            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 4 }}>
                {['curl', 'js', 'python'].map(l => (
                  <button key={l} onClick={() => setLang(l)} style={{ ...s.pill(lang === l), border: 'none', borderRadius: 6 }}>
                    {l === 'js' ? 'JavaScript' : l.charAt(0).toUpperCase() + l.slice(1)}
                  </button>
                ))}
              </div>
              <select
                value={niche}
                onChange={e => setNiche(e.target.value)}
                style={{ ...s.input, width: 'auto', paddingRight: 32 }}
              >
                {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <CodeBlock code={CODE_SAMPLES[lang](sampleKey, niche)} lang={lang} />

            <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
              <a href="/docs" target="_blank" rel="noopener" style={{ ...s.btn, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', textDecoration: 'none', display: 'inline-block' }}>
                Full API Reference ↗
              </a>
            </div>
          </section>

          {/* ── Manage Keys ── */}
          <section style={{ marginBottom: 64 }}>
            <div style={s.card}>
              <h2 style={s.h2}>Manage your keys</h2>
              <p style={{ color: '#6b7280', fontSize: 14, marginTop: 0, marginBottom: 24 }}>
                Look up your existing keys by email address.
              </p>
              <form onSubmit={handleLookup} style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                <input
                  style={{ ...s.input, flex: 1 }}
                  type="email" placeholder="your@email.com"
                  value={lookupEmail}
                  onChange={e => setLookupEmail(e.target.value)}
                  required
                />
                <button type="submit" disabled={lookingUp} style={s.btn}>
                  {lookingUp ? 'Looking up…' : 'Look up keys'}
                </button>
              </form>

              {keys !== null && (
                keys.length === 0 ? (
                  <div style={{ color: '#6b7280', fontSize: 14 }}>No keys found for this email address.</div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                          {['Key prefix', 'Environment', 'Name', 'Last used', 'Created', 'Actions'].map(h => (
                            <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#6b7280', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {keys.map(k => <KeyRow key={k.id} k={k} onRevoke={handleRevoke} />)}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </div>
          </section>

          {/* ── Endpoints reference ── */}
          <section style={{ marginBottom: 64 }}>
            <h2 style={{ ...s.h2, marginBottom: 24 }}>Available endpoints</h2>
            <div style={{ display: 'grid', gap: 2 }}>
              {[
                { method: 'GET', path: '/v1/audience/:niche',  desc: 'Per-channel YouTube metrics (views, watch hours, subscribers)' },
                { method: 'GET', path: '/v1/affinity/:niche',  desc: 'Cross-niche audience overlap scores' },
                { method: 'GET', path: '/v1/sentiment/:niche', desc: 'Community sentiment score and trending keywords' },
                { method: 'GET', path: '/v1/insights/:niche',  desc: 'AI-generated audience intelligence report (Claude-powered)' },
                { method: 'GET', path: '/v1/channels',         desc: 'Full catalogue of tracked YouTube channels' },
                { method: 'GET', path: '/v1/usage',            desc: 'API usage history for your key' },
              ].map(ep => (
                <div key={ep.path} style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700, minWidth: 36, textAlign: 'center', fontFamily: 'monospace' }}>
                    {ep.method}
                  </span>
                  <code style={{ color: '#60a5fa', fontSize: 13, minWidth: 240 }}>{ep.path}</code>
                  <span style={{ color: '#6b7280', fontSize: 13 }}>{ep.desc}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20 }}>
              <a href="/docs" target="_blank" rel="noopener" style={{ color: '#3b82f6', fontSize: 14, textDecoration: 'none' }}>
                View full OpenAPI documentation → /docs ↗
              </a>
            </div>
          </section>

          {/* ── Rate limits ── */}
          <section style={{ marginBottom: 80 }}>
            <div style={s.card}>
              <h2 style={{ ...s.h2, marginBottom: 20 }}>Rate limits &amp; plans</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { plan: 'Sandbox', key: 'emp_sandbox_*', rpm: 60, data: 'Mock data', color: '#3b82f6', features: ['All endpoints', 'Rich deterministic data', 'Instant access', 'Free forever'] },
                  { plan: 'Production', key: 'emp_live_*', rpm: 120, data: 'Live BigQuery', color: '#8b5cf6', features: ['All endpoints', 'Real YouTube analytics', 'AI insight reports', 'Priority support'] },
                ].map(plan => (
                  <div key={plan.plan} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 12, padding: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: plan.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{plan.plan}</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{plan.rpm}<span style={{ fontSize: 14, color: '#6b7280', fontWeight: 400 }}> req/min</span></div>
                    <div style={{ fontSize: 12, color: '#4b5563', fontFamily: 'monospace', marginBottom: 20 }}>{plan.key}</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {plan.features.map(f => (
                        <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#9ca3af' }}>
                          <span style={{ color: plan.color }}>✓</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>

        {/* ── Footer ── */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 24 }}>
            <Link href="/" style={{ color: '#4b5563', fontSize: 13, textDecoration: 'none' }}>Home</Link>
            <Link href="/dashboard" style={{ color: '#4b5563', fontSize: 13, textDecoration: 'none' }}>Dashboard</Link>
            <a href="/docs" target="_blank" rel="noopener" style={{ color: '#4b5563', fontSize: 13, textDecoration: 'none' }}>API Docs</a>
          </div>
          <span style={{ color: '#374151', fontSize: 12 }}>
            An{' '}
            <a href="https://em300.co" target="_blank" rel="noopener" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              EM300.co
            </a>{' '}
            Company
          </span>
        </footer>
      </div>
    </>
  );
}
