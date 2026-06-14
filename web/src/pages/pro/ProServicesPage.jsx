import React, { useEffect, useState } from 'react';
import { api } from '../../api/client.js';

const EMPTY_FORM = { name: '', description: '', duration_min: 60, price: '' };

export default function ProServicesPage() {
  const [services, setServices] = useState([]);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [editing, setEditing]   = useState(null); // service id being edited
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    api.get('/pros/me').then(d => {
      return api.get(`/services?pro_id=${d.pro.id}`);
    }).then(d => setServices(d.services)).finally(() => setLoading(false));
  }, []);

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  function startEdit(svc) {
    setEditing(svc.id);
    setForm({ name: svc.name, description: svc.description || '', duration_min: svc.duration_min, price: svc.price });
    setError('');
  }

  function cancelEdit() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
  }

  async function save() {
    if (!form.name || !form.price) return setError('Name and price are required');
    setSaving(true);
    setError('');
    try {
      if (editing) {
        const d = await api.patch(`/services/${editing}`, { ...form, duration_min: Number(form.duration_min), price: Number(form.price) });
        setServices(s => s.map(x => x.id === editing ? d.service : x));
        cancelEdit();
      } else {
        const d = await api.post('/services', { ...form, duration_min: Number(form.duration_min), price: Number(form.price) });
        setServices(s => [...s, d.service]);
        setForm(EMPTY_FORM);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!confirm('Remove this service?')) return;
    await api.delete(`/services/${id}`);
    setServices(s => s.filter(x => x.id !== id));
  }

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h1 style={s.title}>Services</h1>

      {/* Form */}
      <div style={s.formCard}>
        <h3 style={s.formTitle}>{editing ? 'Edit service' : 'Add service'}</h3>
        {error && <p style={s.error}>{error}</p>}
        <div style={s.grid2}>
          <div>
            <label style={s.label}>Name *</label>
            <input style={s.input} value={form.name} onChange={set('name')} placeholder="e.g. Gel manicure" />
          </div>
          <div>
            <label style={s.label}>Price (€) *</label>
            <input style={s.input} type="number" value={form.price} onChange={set('price')} placeholder="35" />
          </div>
          <div>
            <label style={s.label}>Duration (min)</label>
            <input style={s.input} type="number" value={form.duration_min} onChange={set('duration_min')} />
          </div>
          <div>
            <label style={s.label}>Description</label>
            <input style={s.input} value={form.description} onChange={set('description')} placeholder="Optional" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button style={s.saveBtn} onClick={save} disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Add service'}</button>
          {editing && <button style={s.cancelBtn} onClick={cancelEdit}>Cancel</button>}
        </div>
      </div>

      {/* List */}
      <div style={s.list}>
        {services.length === 0 && <p style={s.empty}>No services yet.</p>}
        {services.map(svc => (
          <div key={svc.id} style={s.card}>
            <div>
              <p style={s.svcName}>{svc.name}</p>
              {svc.description && <p style={s.svcDesc}>{svc.description}</p>}
              <p style={s.svcMeta}>{svc.duration_min} min · €{Number(svc.price).toFixed(2)}</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={s.editBtn}   onClick={() => startEdit(svc)}>Edit</button>
              <button style={s.deleteBtn} onClick={() => remove(svc.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  title:     { fontSize: 24, fontWeight: 700, marginBottom: 24 },
  formCard:  { background: '#fff', borderRadius: 12, padding: 20, marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,.06)' },
  formTitle: { fontSize: 16, fontWeight: 600, marginBottom: 16 },
  grid2:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  label:     { fontSize: 13, fontWeight: 500, color: '#555', display: 'block', marginBottom: 4 },
  input:     { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 },
  saveBtn:   { padding: '9px 20px', background: '#6c47ff', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500 },
  cancelBtn: { padding: '9px 20px', background: 'none', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer' },
  error:     { color: '#d00', fontSize: 13, marginBottom: 12 },
  list:      { display: 'flex', flexDirection: 'column', gap: 10 },
  empty:     { color: '#aaa' },
  card:      { background: '#fff', borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.06)' },
  svcName:   { fontWeight: 600, marginBottom: 2 },
  svcDesc:   { fontSize: 13, color: '#666', marginBottom: 2 },
  svcMeta:   { fontSize: 13, color: '#888' },
  editBtn:   { padding: '6px 14px', border: '1px solid #ddd', background: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  deleteBtn: { padding: '6px 14px', border: '1px solid #ef4444', color: '#ef4444', background: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
};
