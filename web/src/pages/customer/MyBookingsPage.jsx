import React, { useEffect, useState } from 'react';
import { api } from '../../api/client.js';

const STATUS_COLORS = {
  pending:   { bg: '#fff8e1', color: '#f59e0b' },
  confirmed: { bg: '#e8f5e9', color: '#22c55e' },
  cancelled: { bg: '#ffeef0', color: '#ef4444' },
  completed: { bg: '#f0f4ff', color: '#6c47ff' },
  no_show:   { bg: '#f5f5f5', color: '#aaa' },
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    api.get('/bookings/mine').then(d => setBookings(d.bookings)).finally(() => setLoading(false));
  }, []);

  async function cancel(id) {
    if (!confirm('Cancel this booking?')) return;
    setCancelling(id);
    try {
      const d = await api.post(`/bookings/${id}/cancel`, {});
      setBookings(bs => bs.map(b => b.id === id ? d.booking : b));
    } finally {
      setCancelling(null);
    }
  }

  if (loading) return <div style={s.page}>Loading…</div>;

  return (
    <div style={s.page}>
      <h1 style={s.title}>My bookings</h1>
      {bookings.length === 0 && <p style={s.empty}>No bookings yet.</p>}
      <div style={s.list}>
        {bookings.map(b => {
          const statusStyle = STATUS_COLORS[b.status] || STATUS_COLORS.pending;
          return (
            <div key={b.id} style={s.card}>
              <div style={s.cardTop}>
                <div>
                  <p style={s.serviceName}>{b.service_name}</p>
                  <p style={s.proName}>with {b.pro_name}</p>
                </div>
                <span style={{ ...s.badge, background: statusStyle.bg, color: statusStyle.color }}>
                  {b.status}
                </span>
              </div>
              <div style={s.cardBottom}>
                <span style={s.meta}>{b.start_at?.slice(0, 16).replace('T', ' ')}</span>
                <span style={s.meta}>€{Number(b.price).toFixed(2)}</span>
                <span style={s.ref}>{b.reference}</span>
                {['pending', 'confirmed'].includes(b.status) && (
                  <button
                    style={s.cancelBtn}
                    onClick={() => cancel(b.id)}
                    disabled={cancelling === b.id}
                  >
                    {cancelling === b.id ? '…' : 'Cancel'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  page:        { padding: 32, maxWidth: 640, margin: '0 auto' },
  title:       { fontSize: 24, fontWeight: 700, marginBottom: 24 },
  empty:       { color: '#888' },
  list:        { display: 'flex', flexDirection: 'column', gap: 12 },
  card:        { background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 6px rgba(0,0,0,.07)' },
  cardTop:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  serviceName: { fontWeight: 600, fontSize: 16, marginBottom: 2 },
  proName:     { fontSize: 13, color: '#666' },
  badge:       { fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 },
  cardBottom:  { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  meta:        { fontSize: 13, color: '#888' },
  ref:         { fontSize: 12, color: '#bbb', fontFamily: 'monospace' },
  cancelBtn:   { marginLeft: 'auto', padding: '5px 14px', border: '1px solid #ef4444', color: '#ef4444', background: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
};
