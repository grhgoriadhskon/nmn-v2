import React, { useEffect, useState } from 'react';
import { api } from '../../api/client.js';

export default function ProProfilePage() {
  const [form, setForm]       = useState({ bio: '', city: '', address: '', avatar_url: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get('/pros/me').then(d => {
      const p = d.pro;
      setForm({ bio: p.bio || '', city: p.city || '', address: p.address || '', avatar_url: p.avatar_url || '' });
    }).finally(() => setLoading(false));
  }, []);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setSaved(false);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.patch('/pros/me', form);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading…</p>;

  const initials = form.bio?.[0]?.toUpperCase() || '?';

  return (
    <div>
      <h1 style={s.title}>My profile</h1>

      <div style={s.card}>
        <div style={s.avatarSection}>
          {form.avatar_url
            ? <img src={form.avatar_url} alt="avatar" style={s.avatarImg} />
            : <div style={s.avatarPlaceholder}>{initials}</div>
          }
          <div style={{ flex: 1 }}>
            <label style={s.label}>Photo URL</label>
            <input
              style={s.input}
              placeholder="https://..."
              value={form.avatar_url}
              onChange={e => set('avatar_url', e.target.value)}
            />
            <p style={s.hint}>Paste a direct image URL (e.g. from Imgur or Cloudinary)</p>
          </div>
        </div>

        <form onSubmit={save}>
          <div style={s.field}>
            <label style={s.label}>Bio</label>
            <textarea
              style={{ ...s.input, height: 100, resize: 'vertical' }}
              placeholder="Tell customers about yourself, your specialities, your experience…"
              value={form.bio}
              onChange={e => set('bio', e.target.value)}
            />
          </div>

          <div style={s.row}>
            <div style={s.field}>
              <label style={s.label}>City</label>
              <input style={s.input} placeholder="e.g. Athens" value={form.city} onChange={e => set('city', e.target.value)} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Address</label>
              <input style={s.input} placeholder="e.g. 12 Ermou St" value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
          </div>

          {error && <p style={s.error}>{error}</p>}

          <button style={s.btn} type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save profile'}
          </button>
          {saved && <span style={s.saved}>Saved!</span>}
        </form>
      </div>
    </div>
  );
}

const s = {
  title:             { fontSize: 24, fontWeight: 700, marginBottom: 24 },
  card:              { background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 1px 6px rgba(0,0,0,.07)', maxWidth: 680 },
  avatarSection:     { display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f0f0f0' },
  avatarImg:         { width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: '50%', background: '#6c47ff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, flexShrink: 0 },
  field:             { marginBottom: 16, flex: 1 },
  row:               { display: 'flex', gap: 16 },
  label:             { display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6 },
  input:             { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' },
  hint:              { fontSize: 12, color: '#aaa', marginTop: 4 },
  btn:               { padding: '11px 24px', background: '#6c47ff', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: 'pointer', marginTop: 8 },
  saved:             { marginLeft: 12, color: '#22c55e', fontWeight: 600, fontSize: 14 },
  error:             { color: '#d00', fontSize: 14, marginBottom: 12 },
};
