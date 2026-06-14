import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client.js';

export default function ProsPage() {
  const [pros, setPros]       = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();

  useEffect(() => {
    api.get('/pros').then(d => setPros(d.pros)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={s.page}>Loading…</div>;

  return (
    <div style={s.page}>
      <h1 style={s.title}>Find a professional</h1>
      {pros.length === 0 && <p style={s.empty}>No professionals available yet.</p>}
      <div style={s.grid}>
        {pros.map(pro => (
          <div key={pro.id} style={s.card} onClick={() => navigate(`/pros/${pro.id}`)}>
            <div style={s.avatar}>{pro.name?.[0]?.toUpperCase()}</div>
            <div style={s.info}>
              <p style={s.name}>{pro.name}</p>
              <p style={s.city}>{pro.city || 'Location not set'}</p>
              {pro.bio && <p style={s.bio}>{pro.bio}</p>}
            </div>
            <span style={s.arrow}>→</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  page:  { padding: 32, maxWidth: 720, margin: '0 auto' },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 24 },
  empty: { color: '#888' },
  grid:  { display: 'flex', flexDirection: 'column', gap: 12 },
  card:  { display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,.07)', cursor: 'pointer' },
  avatar:{ width: 48, height: 48, borderRadius: '50%', background: '#6c47ff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, flexShrink: 0 },
  info:  { flex: 1 },
  name:  { fontWeight: 600, fontSize: 16, marginBottom: 2 },
  city:  { fontSize: 13, color: '#888', marginBottom: 4 },
  bio:   { fontSize: 13, color: '#555', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: 400 },
  arrow: { fontSize: 20, color: '#aaa' },
};
