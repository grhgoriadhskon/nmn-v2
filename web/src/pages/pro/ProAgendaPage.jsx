import React, { useEffect, useState } from 'react';
import { api } from '../../api/client.js';

const STATUS = {
  pending:   { label: 'Pending',   bg: '#FFFBEB', color: '#92400E', border: '#FDE68A' },
  confirmed: { label: 'Confirmed', bg: '#F0FDF4', color: '#14532D', border: '#BBF7D0' },
  cancelled: { label: 'Cancelled', bg: '#FEF2F2', color: '#7F1D1D', border: '#FECACA' },
  completed: { label: 'Completed', bg: '#FBF7F0', color: '#78350F', border: '#FDE68A' },
  no_show:   { label: 'No show',   bg: '#F5F5F5', color: '#737373', border: '#E5E5E5' },
};

export default function ProAgendaPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/bookings/pro').then(d => setBookings(d.bookings)).finally(() => setLoading(false));
  }, []);

  async function updateStatus(id, action) {
    try {
      const d = await api.post(`/bookings/${id}/${action}`, {});
      setBookings(bs => bs.map(b => b.id === id ? d.booking : b));
    } catch (err) { alert(err.message); }
  }

  const upcoming = bookings.filter(b => ['pending', 'confirmed'].includes(b.status));
  const past     = bookings.filter(b => !['pending', 'confirmed'].includes(b.status));

  return (
    <div>
      <div style={s.pageHeader}>
        <h1 style={s.title}>Agenda</h1>
        {upcoming.length > 0 && <span style={s.count}>{upcoming.length} upcoming</span>}
      </div>

      {loading ? <p style={s.empty}>Loading…</p> : (
        <>
          <p style={s.section}>Upcoming</p>
          {upcoming.length === 0
            ? <p style={s.empty}>No upcoming bookings.</p>
            : upcoming.map(b => <Card key={b.id} b={b} onAction={updateStatus} isPro />)
          }

          <p style={{ ...s.section, marginTop: 36 }}>Past</p>
          {past.length === 0
            ? <p style={s.empty}>No past bookings.</p>
            : past.map(b => <Card key={b.id} b={b} onAction={updateStatus} isPro={false} />)
          }
        </>
      )}
    </div>
  );
}

function Card({ b, onAction, isPro }) {
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
            <p style={s.customerName}>{b.customer_name}</p>
            <p style={s.time}>{b.start_at?.slice(11,16)} — {b.end_at?.slice(11,16)}</p>
          </div>
          <div style={s.right}>
            <span style={{ ...s.badge, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>{st.label}</span>
            <span style={s.price}>€{Number(b.price).toFixed(2)}</span>
            <span style={s.ref}>{b.reference}</span>
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
    </div>
  );
}

const s = {
  pageHeader:  { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 },
  title:       { fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 300, color: 'var(--ink)' },
  count:       { fontSize: 12, fontWeight: 700, color: 'var(--white)', background: 'var(--gold)', padding: '3px 10px', borderRadius: 20, letterSpacing: '.04em' },
  section:     { fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 },
  empty:       { color: 'var(--muted)', fontSize: 14, padding: '8px 0' },
  card:        { display: 'flex', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 10, boxShadow: 'var(--shadow-sm)' },
  cardLeft:    { width: 64, background: 'var(--cream-dark)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRight: '1px solid var(--border)' },
  dateDay:     { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: 'var(--gold-dark)', lineHeight: 1 },
  dateMon:     { fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.08em', marginTop: 2 },
  cardBody:    { flex: 1, padding: '14px 18px' },
  cardTop:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  serviceName: { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 },
  customerName:{ fontSize: 13, color: 'var(--ink-light)', marginBottom: 2 },
  time:        { fontSize: 13, color: 'var(--muted)' },
  right:       { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0, marginLeft: 12 },
  badge:       { fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '.04em' },
  price:       { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--gold-dark)' },
  ref:         { fontFamily: 'monospace', fontSize: 10, color: 'var(--stone)' },
  actions:     { display: 'flex', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--stone)' },
  confirmBtn:  { padding: '7px 18px', background: 'var(--ink)', color: 'var(--cream)', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer' },
  cancelBtn:   { padding: '7px 18px', background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 6, fontWeight: 500, fontSize: 13, cursor: 'pointer' },
};
