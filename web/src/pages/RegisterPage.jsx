import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [fields, setFields] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = key => e => setFields(f => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(fields);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.brand}>💅 NMN</div>
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
              {['customer', 'pro'].map(role => (
                <button
                  key={role}
                  type="button"
                  style={{ ...s.roleBtn, ...(fields.role === role ? s.roleBtnActive : {}) }}
                  onClick={() => setFields(f => ({ ...f, role }))}
                >
                  {role === 'customer' ? '🛍️ Customer' : '💅 Professional'}
                </button>
              ))}
            </div>
          </div>

          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p style={s.footer}>
          Already have an account? <Link to="/login" style={s.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  page:         { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)', padding: 20 },
  card:         { width: '100%', maxWidth: 420, background: '#fff', borderRadius: 20, padding: '40px 36px', boxShadow: '0 20px 60px rgba(0,0,0,.15)' },
  brand:        { fontSize: 28, fontWeight: 800, color: '#6c47ff', marginBottom: 24, letterSpacing: '-0.5px' },
  title:        { fontSize: 24, fontWeight: 700, marginBottom: 4 },
  sub:          { fontSize: 14, color: '#888', marginBottom: 28 },
  field:        { marginBottom: 16 },
  label:        { display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 },
  input:        { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e8e8e8', fontSize: 15 },
  roleRow:      { display: 'flex', gap: 10 },
  roleBtn:      { flex: 1, padding: '11px 8px', borderRadius: 10, border: '1.5px solid #e8e8e8', background: '#fff', fontSize: 14, fontWeight: 500, color: '#555' },
  roleBtnActive:{ border: '1.5px solid #6c47ff', background: '#f0ecff', color: '#6c47ff', fontWeight: 700 },
  btn:          { width: '100%', marginTop: 8, padding: 13, background: '#6c47ff', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15 },
  error:        { background: '#fff0f0', color: '#c00', padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: 14 },
  footer:       { textAlign: 'center', marginTop: 24, fontSize: 14, color: '#888' },
  link:         { color: '#6c47ff', fontWeight: 600 },
};
