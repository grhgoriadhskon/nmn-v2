import React, { useEffect, useState } from 'react';
import { api } from '../../api/client.js';

const STATUS = {
  pending:   { label: 'Pending',   bg: '#fff8e1', color: '#d97706' },
  confirmed: { label: 'Confirmed', bg: '#dcfce7', color: '#16a34a' },
  cancelled: { label: 'Cancelled', bg: '#fde8e8', color: '#dc2626' },
  completed: { label: 'Completed', bg: '#ede9fe', color: '#6c47ff' },
  no_show:   { label: 'No show',   bg: '#f5f5f5', color: '#aaa' },
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
    } catch (err) {
      alert(err.message);
    }
  }

  const upcoming = bookings.filter(b => ['pending', 'confirmed'].includes(b.status));
  const past     = bookings.filter(b => !['pending', 'confirmed'].includes(b.status));

  return (
    <div>
      <div style={s.header}>
        <h1 style={s.title}>Agenda</h1>
        {upcoming.length > 0 && (
          <div style={s.pill}>{upcoming.length} upcoming</div>
        )}
      </div>

      {loading ? <p style={s.empty}>Loading…</p> : (
        <>
          <Section title="Upcoming" empty="No upcoming bookings.">
            {upcoming.map(b => <BookingCard key={b.id} booking={b} onAction={updateStatus} isPro />)}
          </Section>

          <Section title="Past" empty="No past bookings." style={{ marginTop: 36 }}>
            {past.map(b => <BookingCard key={b.id} booking={b} onAction={updateStatus} isPro={false} />)}
          </Section>
        </>
      )}
    </div>
  );
}

function Section({ title, children, empty, style }) {
  const items = React.Children.toArray(children);
  return (
    <div style={style}>
      <h2 style={s.section}>{title}</h2>
      {items.length === 0 ? <p style={s.empty}>{empty}</p> : items}
    </div>
  );
}

function BookingCard({ booking: b, onAction, isPro }) {
  const st = STATUS[b.status] || STATUS.pending;
  const date = b.start_at ? new Date(b.start_at) : null;

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
            <p style={s.customerName}>👤 {b.customer_name}</p>
            <p style={s.time}>{b.start_at?.slice(11, 16)} — {b.end_at?.slice(11, 16)}</p>
          </div>
          <div style={s.right}>
            <span style={{ ...s.badge, background: st.bg, color: st.color }}>{st.label}</span>
            <span style={s.price}>€{Number(b.price).toFixed(2)}</span>
            <span style={s.ref}>{b.reference}</span>
          </div>
        </div>

        {isPro && b.status === 'pending' && (
          <div style={s.actions}>
            <button style={s.confirmBtn} onClick={() => onAction(b.id, 'confirm')}>✓ Confirm</button>
            <button style={s.cancelBtn}  onClick={() => onAction(b.id, 'cancel')}>Cancel</button>
          </div>
        )}
        {isPro && b.status === 'confirmed' && (
          <div style={s.actions}>
            <button style={s.confirmBtn} onClick={() => onAction(b.id, 'complete')}>✓ Mark complete</button>
            <button style={s.cancelBtn}  onClick={() => onAction(b.id, 'cancel')}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  header:      { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 },
  title:       { fontSize: 28, fontWeight: 800, color: '#1a1a2e' },
  pill:        { background: '#6c47ff', color: '#fff', fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 20 },
  section:     { fontSize: 12, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  empty:       { color: '#ccc', fontSize: 14, padding: '8px 0' },
  card:        { display: 'flex', background: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 10, boxShadow: '0 2px 10px rgba(0,0,0,.05)' },
  cardLeft:    { background: '#f0ecff', padding: '20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 68 },
  dateBox:     { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  dateDay:     { fontSize: 24, fontWeight: 800, color: '#6c47ff', lineHeight: 1 },
  dateMon:     { fontSize: 11, fontWeight: 600, color: '#a78bfa', textTransform: 'uppercase', marginTop: 2 },
  cardBody:    { flex: 1, padding: '16px 20px' },
  cardTop:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  serviceName: { fontWeight: 700, fontSize: 16, color: '#1a1a2e', marginBottom: 3 },
  customerName:{ fontSize: 13, color: '#555', marginBottom: 3 },
  time:        { fontSize: 13, color: '#888' },
  right:       { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0, marginLeft: 12 },
  badge:       { fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20 },
  price:       { fontSize: 16, fontWeight: 800, color: '#1a1a2e' },
  ref:         { fontSize: 11, color: '#ddd', fontFamily: 'monospace' },
  actions:     { display: 'flex', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid #f5f5f5' },
  confirmBtn:  { padding: '8px 18px', background: '#6c47ff', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13 },
  cancelBtn:   { padding: '8px 18px', background: '#fff', color: '#dc2626', border: '1.5px solid #fca5a5', borderRadius: 8, fontWeight: 600, fontSize: 13 },
};
