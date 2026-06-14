import React, { useEffect, useState } from 'react';
import { api } from '../../api/client.js';

const STATUS = {
  pending:   { label: 'Pending',   bg: '#FFFBEB', color: '#92400E', border: '#FDE68A' },
  confirmed: { label: 'Confirmed', bg: '#F0FDF4', color: '#14532D', border: '#BBF7D0' },
  cancelled: { label: 'Cancelled', bg: '#FEF2F2', color: '#7F1D1D', border: '#FECACA' },
  completed: { label: 'Completed', bg: '#FBF7F0', color: '#78350F', border: '#FDE68A' },
  no_show:   { label: 'No show',   bg: '#F5F5F5', color: '#737373', border: '#E5E5E5' },
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
    } finally { setCancelling(null); }
  }

  const upcoming = bookings.filter(b => ['pending', 'confirmed'].includes(b.status));
  const past     = bookings.filter(b => !['pending', 'confirmed'].includes(b.status));

  return (
    <div className="nmn-page">
      <div style={s.header}>
        <h1 style={s.title}>My bookings</h1>
      </div>

      {loading ? <p style={s.empty}>Loading…</p> : bookings.length === 0 ? (
        <div style={s.emptyState}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>📅</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 300, marginBottom: 6 }}>No bookings yet</p>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Find a professional and book your first appointment</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <p style={s.section}>Upcoming</p>
              {upcoming.map(b => <BookingCard key={b.id} b={b} onCancel={cancel} cancelling={cancelling} />)}
            </section>
          )}
          {past.length > 0 && (
            <section>
              <p style={s.section}>Past</p>
              {past.map(b => <BookingCard key={b.id} b={b} onCancel={cancel} cancelling={cancelling} />)}
            </section>
          )}
        </>
      )}
    </div>
  );
}

function BookingCard({ b, onCancel, cancelling }) {
  const st   = STATUS[b.status] || STATUS.pending;
  const date = b.start_at ? new Date(b.start_at) : null;

  return (
    <div style={s.card}>
      <div style={s.cardLeft}>
        <span style={s.dateDay}>{date?.getDate()}</span>
        <span style={s.dateMon}>{date?.toLocaleString('en', { month: 'short' })?.toUpperCase()}</span>
      </div>
      <div style={s.cardBody}>
        <div style={s.cardTop}>
          <div>
            <p style={s.serviceName}>{b.service_name}</p>
            <p style={s.proName}>with {b.pro_name}</p>
          </div>
          <span style={{ ...s.badge, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>{st.label}</span>
        </div>
        <div style={s.meta}>
          <span>{b.start_at?.slice(11,16)}</span>
          <span>€{Number(b.price).toFixed(2)}</span>
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
  header:      { marginBottom: 32 },
  title:       { fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 300, color: 'var(--ink)' },
  section:     { fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 },
  empty:       { color: 'var(--muted)', textAlign: 'center', padding: '40px 0' },
  emptyState:  { textAlign: 'center', padding: '60px 0' },
  card:        { display: 'flex', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 10, boxShadow: 'var(--shadow-sm)' },
  cardLeft:    { width: 64, background: 'var(--cream-dark)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRight: '1px solid var(--border)' },
  dateDay:     { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: 'var(--gold-dark)', lineHeight: 1 },
  dateMon:     { fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.08em', marginTop: 2 },
  cardBody:    { flex: 1, padding: '14px 18px' },
  cardTop:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  serviceName: { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 },
  proName:     { fontSize: 13, color: 'var(--muted)' },
  badge:       { fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '.04em' },
  meta:        { display: 'flex', gap: 16, fontSize: 13, color: 'var(--ink-light)', marginBottom: 10 },
  ref:         { fontFamily: 'monospace', fontSize: 11, color: 'var(--stone)', marginLeft: 'auto' },
  cancelBtn:   { padding: '6px 14px', border: '1px solid var(--border)', color: 'var(--ink-light)', background: 'transparent', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer' },
};
