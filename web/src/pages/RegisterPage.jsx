import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [fields, setFields]   = useState({ name: '', email: '', password: '', role: 'customer' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const set = key => e => setFields(f => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(fields);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <p style={s.brand}>NMN</p>
        <h1 style={s.title}>Create account</h1>
        <p style={s.sub}>Join as a customer or professional</p>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>Full name</label>
            <input style={s.input} value={fields.name} onChange={set('name')} placeholder="Your name" required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" value={fields.email} onChange={set('email')} placeholder="you@example.com" required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" value={fields.password} onChange={set('password')} placeholder="Min. 8 characters" required minLength={8} />
          </div>

          <div style={s.field}>
            <label style={s.label}>I am a…</label>
            <div style={s.roleRow}>
              {[
                { value: 'customer', label: 'Customer', desc: 'Book beauty services' },
                { value: 'pro',      label: 'Professional', desc: 'Offer your services' },
              ].map(r => (
                <button
                  key={r.value}
                  type="button"
                  style={{ ...s.roleBtn, ...(fields.role === r.value ? s.roleBtnActive : {}) }}
                  onClick={() => setFields(f => ({ ...f, role: r.value }))}
                >
                  <span style={s.roleName}>{r.label}</span>
                  <span style={s.roleDesc}>{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <button style={{ ...s.btn, opacity: loading ? .7 : 1 }} type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p style={s.footer}>
          Already have an account?{' '}
          <Link to="/login" style={s.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  page:         { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', padding: 20 },
  card:         { width: '100%', maxWidth: 420, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 20, padding: '48px 40px', boxShadow: 'var(--shadow-lg)' },
  brand:        { fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, color: 'var(--gold)', letterSpacing: 4, marginBottom: 28, textAlign: 'center' },
  title:        { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, marginBottom: 6, textAlign: 'center' },
  sub:          { fontSize: 14, color: 'var(--muted)', marginBottom: 32, textAlign: 'center' },
  field:        { marginBottom: 18 },
  label:        { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 },
  input:        { width: '100%', padding: '11px 14px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 15, background: 'var(--cream)', transition: 'border-color .2s' },
  roleRow:      { display: 'flex', gap: 10 },
  roleBtn:      { flex: 1, padding: '12px 10px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--cream)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 3, textAlign: 'left', transition: 'all .2s' },
  roleBtnActive:{ border: '1.5px solid var(--gold)', background: '#FBF7F0' },
  roleName:     { fontSize: 14, fontWeight: 700, color: 'var(--ink)' },
  roleDesc:     { fontSize: 12, color: 'var(--muted)' },
  btn:          { width: '100%', marginTop: 8, padding: 13, background: 'var(--ink)', color: 'var(--cream)', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 15, letterSpacing: '.02em' },
  error:        { background: '#FEF2F2', color: '#B91C1C', padding: '10px 14px', borderRadius: 8, marginBottom: 18, fontSize: 14 },
  footer:       { textAlign: 'center', marginTop: 28, fontSize: 14, color: 'var(--muted)' },
  link:         { color: 'var(--gold-dark)', fontWeight: 600 },
};
