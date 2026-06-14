import React, { useEffect, useState } from 'react';
import { api } from '../../api/client.js';

const STATUS_COLORS = {
  pending:   { bg: '#fff8e1', color: '#f59e0b' },
  confirmed: { bg: '#e8f5e9', color: '#22c55e' },
  cancelled: { bg: '#ffeef0', color: '#ef4444' },
  completed: { bg: '#f0f4ff', color: '#6c47ff' },
  no_show:   { bg: '#f5f5f5', color: '#aaa' },
};

export default function ProAgendaPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/bookings/pro').then(d => setBookings(d.bookings)).finally(() => setLoading(false));
  }, []);

  async function updateStatus(id, status) {
    try {
      const d = await api.post(`/bookings/${id}/${status}`, {});
      setBookings(bs => bs.map(b => b.id === id ? d.booking : b));
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <p>Loading…</p>;

  const upcoming  = bookings.filter(b => ['pending', 'confirmed'].includes(b.status));
  const past      = bookings.filter(b => ['completed', 'cancelled', 'no_show'].includes(b.status));

  return (
    <div>
      <h1 style={s.title}>Agenda</h1>

      <h2 style={s.section}>Upcoming</h2>
      {upcoming.length === 0 && <p style={s.empty}>No upcoming bookings.</p>}
      {upcoming.map(b => <BookingCard key={b.id} booking={b} onAction={updateStatus} isPro />)}

      <h2 style={{ ...s.section, marginTop: 32 }}>Past</h2>
      {past.length === 0 && <p style={s.empty}>No past bookings.</p>}
      {past.map(b => <BookingCard key={b.id} booking={b} onAction={updateStatus} isPro={false} />)}
    </div>
  );
}

function BookingCard({ booking: b, onAction, isPro }) {
  const statusStyle = STATUS_COLORS[b.status] || STATUS_COLORS.pending;
  return (
    <div style={s.card}>
      <div style={s.cardTop}>
        <div>
          <p style={s.serviceName}>{b.service_name}</p>
          <p style={s.customerName}>👤 {b.customer_name}</p>
          <p style={s.time}>{b.start_at?.slice(0, 16).replace('T', ' ')} — {b.end_at?.slice(11, 16)}</p>
        </div>
        <div style={s.right}>
          <span style={{ ...s.badge, background: statusStyle.bg, color: statusStyle.color }}>{b.status}</span>
          <p style={s.price}>€{Number(b.price).toFixed(2)}</p>
          <p style={s.ref}>{b.reference}</p>
        </div>
      </div>
      {isPro && b.status === 'pending' && (
        <div style={s.actions}>
          <button style={s.confirmBtn} onClick={() => onAction(b.id, 'confirm')}>Confirm</button>
          <button style={s.cancelBtn}  onClick={() => onAction(b.id, 'cancel')}>Cancel</button>
        </div>
      )}
      {isPro && b.status === 'confirmed' && (
        <div style={s.actions}>
          <button style={s.confirmBtn} onClick={() => onAction(b.id, 'complete')}>Mark complete</button>
          <button style={s.cancelBtn}  onClick={() => onAction(b.id, 'cancel')}>Cancel</button>
        </div>
      )}
    </div>
  );
}

const s = {
  title:        { fontSize: 24, fontWeight: 700, marginBottom: 24 },
  section:      { fontSize: 16, fontWeight: 600, color: '#888', marginBottom: 12 },
  empty:        { color: '#aaa', fontSize: 14 },
  card:         { background: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,.06)' },
  cardTop:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  serviceName:  { fontWeight: 600, fontSize: 16, marginBottom: 2 },
  customerName: { fontSize: 13, color: '#555', marginBottom: 2 },
  time:         { fontSize: 13, color: '#888' },
  right:        { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
  badge:        { fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 },
  price:        { fontSize: 15, fontWeight: 700 },
  ref:          { fontSize: 11, color: '#ccc', fontFamily: 'monospace' },
  actions:      { display: 'flex', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid #f5f5f5' },
  confirmBtn:   { padding: '7px 16px', background: '#6c47ff', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 },
  cancelBtn:    { padding: '7px 16px', background: 'none', color: '#ef4444', border: '1px solid #ef4444', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
};
