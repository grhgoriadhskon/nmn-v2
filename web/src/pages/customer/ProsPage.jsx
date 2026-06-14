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
    <div className="nmn-page">
      <div style={s.header}>
        <h1 style={s.title}>Find a professional</h1>
        <p style={s.sub}>Discover and book talented beauty professionals near you</p>
      </div>

      {loading ? (
        <p style={s.empty}>Loading…</p>
      ) : pros.length === 0 ? (
        <p style={s.empty}>No professionals available yet.</p>
      ) : (
        <div style={s.grid}>
          {pros.map(pro => (
            <div key={pro.id} style={s.card} onClick={() => navigate(`/pros/${pro.id}`)}>
              <div style={s.cardInner}>
                {pro.avatar_url
                  ? <img src={pro.avatar_url} alt={pro.name} style={s.avatarImg} />
                  : <div style={s.avatar}>{pro.name?.[0]?.toUpperCase()}</div>
                }
                <div style={s.info}>
                  <p style={s.name}>{pro.name}</p>
                  {pro.city && <p style={s.city}>📍 {pro.city}</p>}
                  {pro.bio  && <p style={s.bio}>{pro.bio}</p>}
                </div>
              </div>
              <div style={s.cardFooter}>
                <span style={s.bookBtn}>Book →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  header:    { marginBottom: 36 },
  title:     { fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 300, color: 'var(--ink)', marginBottom: 8 },
  sub:       { fontSize: 15, color: 'var(--muted)' },
  empty:     { color: 'var(--muted)', textAlign: 'center', padding: '60px 0' },
  grid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 },
  card:      { background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow .2s, border-color .2s', boxShadow: 'var(--shadow-sm)' },
  cardInner: { padding: '20px 20px 16px', display: 'flex', gap: 14, alignItems: 'flex-start' },
  avatarImg: { width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--stone)' },
  avatar:    { width: 52, height: 52, borderRadius: '50%', background: 'var(--gold)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 600, flexShrink: 0 },
  info:      { flex: 1, minWidth: 0 },
  name:      { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 },
  city:      { fontSize: 13, color: 'var(--muted)', marginBottom: 6 },
  bio:       { fontSize: 13, color: 'var(--ink-light)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  cardFooter:{ borderTop: '1px solid var(--stone)', padding: '12px 20px', display: 'flex', justifyContent: 'flex-end' },
  bookBtn:   { fontSize: 13, fontWeight: 600, color: 'var(--gold-dark)', letterSpacing: '.04em', textTransform: 'uppercase' },
};
