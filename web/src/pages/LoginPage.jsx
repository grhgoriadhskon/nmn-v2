import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await login(email, password);
      navigate(user.role === 'pro' ? '/pro/agenda' : '/pros', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally { setLoading(false); }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <p style={s.brand}>NMN</p>
        <h1 style={s.title}>Welcome back</h1>
        <p style={s.sub}>Sign in to your account</p>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={submit}>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button style={{ ...s.btn, opacity: loading ? .7 : 1 }} type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={s.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={s.link}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  page:   { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', padding: 20 },
  card:   { width: '100%', maxWidth: 400, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 20, padding: '48px 40px', boxShadow: 'var(--shadow-lg)' },
  brand:  { fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, color: 'var(--gold)', letterSpacing: 4, marginBottom: 28, textAlign: 'center' },
  title:  { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, marginBottom: 6, textAlign: 'center' },
  sub:    { fontSize: 14, color: 'var(--muted)', marginBottom: 32, textAlign: 'center' },
  field:  { marginBottom: 18 },
  label:  { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 },
  input:  { width: '100%', padding: '11px 14px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 15, background: 'var(--cream)', transition: 'border-color .2s' },
  btn:    { width: '100%', marginTop: 8, padding: '13px', background: 'var(--ink)', color: 'var(--cream)', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 15, letterSpacing: '.02em', transition: 'background .2s' },
  error:  { background: '#FEF2F2', color: '#B91C1C', padding: '10px 14px', borderRadius: 8, marginBottom: 18, fontSize: 14 },
  footer: { textAlign: 'center', marginTop: 28, fontSize: 14, color: 'var(--muted)' },
  link:   { color: 'var(--gold-dark)', fontWeight: 600 },
};
