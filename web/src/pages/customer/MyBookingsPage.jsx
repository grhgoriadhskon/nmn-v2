import React, { useEffect, useState } from 'react';
import { api } from '../../api/client.js';

const STATUS = {
  pending:   { label: 'Pending',   bg: '#fff8e1', color: '#d97706' },
  confirmed: { label: 'Confirmed', bg: '#dcfce7', color: '#16a34a' },
  cancelled: { label: 'Cancelled', bg: '#fde8e8', color: '#dc2626' },
  completed: { label: 'Completed', bg: '#ede9fe', color: '#6c47ff' },
  no_show:   { label: 'No show',   bg: '#f5f5f5', color: '#aaa' },
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

  const upcoming = bookings.filter(b => ['pending', 'confirmed'].includes(b.status));
  const past     = bookings.filter(b => !['pending', 'confirmed'].includes(b.status));

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>My bookings</h1>
      </div>

      {loading ? <p style={s.empty}>Loading…</p> : bookings.length === 0 ? (
        <div style={s.emptyState}>
          <p style={s.emptyIcon}>📅</p>
          <p style={s.emptyText}>No bookings yet</p>
          <p style={s.emptySub}>Find a professional and book your first appointment</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <>
              <h2 style={s.section}>Upcoming</h2>
              {upcoming.map(b => <BookingCard key={b.id} b={b} onCancel={cancel} cancelling={cancelling} />)}
            </>
          )}
          {past.length > 0 && (
            <>
              <h2 style={{ ...s.section, marginTop: 32 }}>Past</h2>
              {past.map(b => <BookingCard key={b.id} b={b} onCancel={cancel} cancelling={cancelling} />)}
            </>
          )}
        </>
      )}
    </div>
  );
}

function BookingCard({ b, onCancel, cancelling }) {
  const st = STATUS[b.status] || STATUS.pending;
  const date = b.start_at ? new Date(b.start_at) : null;
  const dateStr = date ? date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const timeStr = b.start_at?.slice(11, 16) || '';

  return (
    <div style={s.card}>
      <div style={s.cardLeft}>
        <div style={s.dateBox}>
          <span style={s.dateDay}>{date?.getDate()}</span>
          <span style={s.dateMon}>{date?.toLocaleString('en', { month: 'short' })}</span>
        </div>
      </div>
      <div style={s.cardBody}>
        <div style={s.cardTop}>
          <div>
            <p style={s.serviceName}>{b.service_name}</p>
            <p style={s.proName}>with {b.pro_name}</p>
          </div>
          <span style={{ ...s.badge, background: st.bg, color: st.color }}>{st.label}</span>
        </div>
        <div style={s.cardMeta}>
          <span>🕐 {timeStr}</span>
          <span>💶 €{Number(b.price).toFixed(2)}</span>
          <span style={s.ref}>{b.reference}</span>
        </div>
        {['pending', 'confirmed'].includes(b.status) && (
          <button style={s.cancelBtn} onClick={() => onCancel(b.id)} disabled={cancelling === b.id}>
            {cancelling === b.id ? 'Cancelling…' : 'Cancel booking'}
          </button>
        )}
      </div>
    </div>
  );
}

const s = {
  page:        { padding: '32px 24px', maxWidth: 720, margin: '0 auto' },
  header:      { marginBottom: 32 },
  title:       { fontSize: 28, fontWeight: 800, color: '#1a1a2e' },
  section:     { fontSize: 13, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  empty:       { color: '#aaa', padding: '40px 0', textAlign: 'center' },
  emptyState:  { textAlign: 'center', padding: '60px 0' },
  emptyIcon:   { fontSize: 48, marginBottom: 12 },
  emptyText:   { fontSize: 18, fontWeight: 700, color: '#333', marginBottom: 6 },
  emptySub:    { fontSize: 14, color: '#aaa' },
  card:        { display: 'flex', background: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 12, boxShadow: '0 2px 10px rgba(0,0,0,.05)' },
  cardLeft:    { background: '#f0ecff', padding: '20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 64 },
  dateBox:     { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  dateDay:     { fontSize: 22, fontWeight: 800, color: '#6c47ff', lineHeight: 1 },
  dateMon:     { fontSize: 11, fontWeight: 600, color: '#a78bfa', textTransform: 'uppercase', marginTop: 2 },
  cardBody:    { flex: 1, padding: '16px 20px' },
  cardTop:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  serviceName: { fontWeight: 700, fontSize: 16, color: '#1a1a2e', marginBottom: 2 },
  proName:     { fontSize: 13, color: '#888' },
  badge:       { fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20, flexShrink: 0 },
  cardMeta:    { display: 'flex', gap: 16, fontSize: 13, color: '#666', flexWrap: 'wrap', marginBottom: 12 },
  ref:         { fontFamily: 'monospace', fontSize: 11, color: '#ccc' },
  cancelBtn:   { padding: '7px 16px', border: '1.5px solid #fca5a5', color: '#dc2626', background: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600 },
};
