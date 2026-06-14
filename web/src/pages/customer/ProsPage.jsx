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

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>Find a professional</h1>
        <p style={s.sub}>Book beauty services with top local professionals</p>
      </div>

      {loading ? (
        <div style={s.loading}>Loading professionals…</div>
      ) : pros.length === 0 ? (
        <div style={s.empty}>No professionals available yet.</div>
      ) : (
        <div style={s.grid}>
          {pros.map(pro => (
            <div key={pro.id} style={s.card} onClick={() => navigate(`/pros/${pro.id}`)}>
              <div style={s.cardTop}>
                {pro.avatar_url
                  ? <img src={pro.avatar_url} alt={pro.name} style={s.avatarImg} />
                  : <div style={s.avatar}>{pro.name?.[0]?.toUpperCase()}</div>
                }
                <div style={s.info}>
                  <p style={s.name}>{pro.name}</p>
                  {pro.city && <p style={s.city}>📍 {pro.city}</p>}
                </div>
              </div>
              {pro.bio && <p style={s.bio}>{pro.bio}</p>}
              <div style={s.cta}>Book now →</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  page:     { padding: '32px 24px', maxWidth: 960, margin: '0 auto' },
  header:   { marginBottom: 32 },
  title:    { fontSize: 28, fontWeight: 800, color: '#1a1a2e', marginBottom: 6 },
  sub:      { fontSize: 15, color: '#888' },
  loading:  { color: '#aaa', textAlign: 'center', padding: 48 },
  empty:    { color: '#aaa', textAlign: 'center', padding: 48 },
  grid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 },
  card:     { background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,.06)', cursor: 'pointer', transition: 'transform .15s, box-shadow .15s', border: '1px solid transparent' },
  cardTop:  { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 },
  avatarImg:{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 },
  avatar:   { width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #6c47ff, #a855f7)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, flexShrink: 0 },
  info:     { flex: 1, minWidth: 0 },
  name:     { fontWeight: 700, fontSize: 16, color: '#1a1a2e', marginBottom: 2 },
  city:     { fontSize: 13, color: '#888' },
  bio:      { fontSize: 13, color: '#666', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 14 },
  cta:      { fontSize: 13, fontWeight: 700, color: '#6c47ff' },
};
