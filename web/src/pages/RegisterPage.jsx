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
    <div style={styles.page}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h1 style={styles.title}>Nail Me Now</h1>
        <h2 style={styles.subtitle}>Create account</h2>

        {error && <p style={styles.error}>{error}</p>}

        <label style={styles.label}>Full name</label>
        <input style={styles.input} value={fields.name} onChange={set('name')} required />

        <label style={styles.label}>Email</label>
        <input style={styles.input} type="email" value={fields.email} onChange={set('email')} required />

        <label style={styles.label}>Password</label>
        <input style={styles.input} type="password" value={fields.password} onChange={set('password')} required minLength={8} />

        <label style={styles.label}>I am a…</label>
        <select style={styles.input} value={fields.role} onChange={set('role')}>
          <option value="customer">Customer</option>
          <option value="pro">Professional</option>
        </select>

        <button style={styles.btn} type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <p style={styles.link}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  page:     { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' },
  card:     { background: '#fff', padding: 40, borderRadius: 12, width: 360, display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 2px 16px rgba(0,0,0,.08)' },
  title:    { fontSize: 24, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 18, fontWeight: 500, color: '#555', marginBottom: 8 },
  label:    { fontSize: 14, fontWeight: 500, color: '#333' },
  input:    { padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15, outline: 'none' },
  btn:      { padding: '12px', borderRadius: 8, border: 'none', background: '#6c47ff', color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginTop: 4 },
  error:    { color: '#d00', fontSize: 14, background: '#fff0f0', padding: '8px 12px', borderRadius: 8 },
  link:     { fontSize: 14, textAlign: 'center', color: '#555' },
};
