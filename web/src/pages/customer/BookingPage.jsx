import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/client.js';

const STEPS = ['service', 'slot', 'confirm'];

export default function BookingPage() {
  const { proId } = useParams();
  const navigate  = useNavigate();

  const [pro, setPro]           = useState(null);
  const [services, setServices] = useState([]);
  const [step, setStep]         = useState('service');
  const [selected, setSelected] = useState({ service: null, date: '', slot: null });
  const [slots, setSlots]       = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking]   = useState(null);
  const [error, setError]       = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/pros/${proId}`).then(d => setPro(d.pro));
    api.get(`/services?pro_id=${proId}`).then(d => setServices(d.services));
  }, [proId]);

  async function loadSlots(date) {
    if (!date) return;
    setSelected(s => ({ ...s, date, slot: null }));
    setSlotsLoading(true); setError('');
    try {
      const d = await api.get(`/availability?pro_id=${proId}&service_id=${selected.service.id}&date=${date}`);
      setSlots(d.slots || []);
    } catch (err) { setError(err.message); }
    finally { setSlotsLoading(false); }
  }

  async function confirmBooking() {
    setSubmitting(true); setError('');
    try {
      const d = await api.post('/bookings', {
        pro_id: Number(proId), service_id: selected.service.id, start_at: selected.slot.start_at,
      });
      setBooking(d.booking); setStep('done');
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  }

  function goBack() {
    if (step === 'service') navigate('/pros');
    else setStep(STEPS[STEPS.indexOf(step) - 1]);
  }

  if (!pro) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>Loading…</div>;

  return (
    <div className="nmn-page" style={{ maxWidth: 580 }}>
      {step !== 'done' && (
        <button style={s.back} onClick={goBack}>← Back</button>
      )}

      {/* Pro header */}
      <div style={s.proHeader}>
        {pro.avatar_url
          ? <img src={pro.avatar_url} alt={pro.name} style={s.proAvatarImg} />
          : <div style={s.proAvatar}>{pro.name?.[0]?.toUpperCase()}</div>
        }
        <div>
          <p style={s.proName}>{pro.name}</p>
          {pro.city && <p style={s.proCity}>📍 {pro.city}</p>}
        </div>
      </div>

      {error && <div style={s.error}>{error}</div>}

      {/* Step: service */}
      {step === 'service' && (
        <>
          <h2 style={s.stepTitle}>Choose a service</h2>
          <div style={s.list}>
            {services.length === 0 && <p style={{ color: 'var(--muted)', padding: '12px 0' }}>No services available.</p>}
            {services.map(svc => (
              <div key={svc.id} style={s.serviceCard}
                onClick={() => { setSelected(s => ({ ...s, service: svc, slot: null })); setSlots([]); setStep('slot'); }}>
                <div>
                  <p style={s.svcName}>{svc.name}</p>
                  {svc.description && <p style={s.svcDesc}>{svc.description}</p>}
                </div>
                <div style={s.svcRight}>
                  <span style={s.svcPrice}>€{Number(svc.price).toFixed(2)}</span>
                  <span style={s.svcDur}>{svc.duration_min} min</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Step: slot */}
      {step === 'slot' && (
        <>
          <h2 style={s.stepTitle}>Choose date & time</h2>
          <div style={s.pill}>{selected.service.name} · {selected.service.duration_min} min · €{Number(selected.service.price).toFixed(2)}</div>
          <input type="date" style={s.dateInput} min={new Date().toISOString().slice(0,10)}
            value={selected.date} onChange={e => loadSlots(e.target.value)} />
          {slotsLoading && <p style={{ color: 'var(--muted)', padding: '8px 0' }}>Loading slots…</p>}
          {!slotsLoading && selected.date && slots.length === 0 && (
            <p style={{ color: 'var(--muted)', padding: '8px 0' }}>No available slots on this date.</p>
          )}
          <div style={s.slotGrid}>
            {slots.map(slot => (
              <button key={slot.start} style={s.slotBtn}
                onClick={() => { setSelected(s => ({ ...s, slot })); setStep('confirm'); }}>
                {slot.start}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Step: confirm */}
      {step === 'confirm' && (
        <>
          <h2 style={s.stepTitle}>Confirm booking</h2>
          <div style={s.summary}>
            {[
              ['Professional', pro.name],
              ['Service', `${selected.service.name} (${selected.service.duration_min} min)`],
              ['Date', new Date(selected.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })],
              ['Time', `${selected.slot.start} – ${selected.slot.end}`],
              ['Price', `€${Number(selected.service.price).toFixed(2)}`],
            ].map(([label, value], i, arr) => (
              <div key={label} style={{ ...s.row, ...(i === arr.length - 1 ? { borderBottom: 'none' } : {}) }}>
                <span style={s.rowLabel}>{label}</span>
                <span style={s.rowValue}>{value}</span>
              </div>
            ))}
          </div>
          <button style={{ ...s.confirmBtn, opacity: submitting ? .7 : 1 }} onClick={confirmBooking} disabled={submitting}>
            {submitting ? 'Booking…' : 'Confirm booking'}
          </button>
        </>
      )}

      {/* Done */}
      {step === 'done' && booking && (
        <div style={s.success}>
          <div style={s.checkmark}>✓</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 300, marginBottom: 8 }}>Booking confirmed</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 20 }}>{selected.service.name} · {selected.date} · {selected.slot.start}</p>
          <div style={s.refBox}>
            <span style={s.refLabel}>Reference number</span>
            <span style={s.refValue}>{booking.reference}</span>
          </div>
          <button style={{ ...s.confirmBtn, marginTop: 28 }} onClick={() => navigate('/bookings')}>
            View my bookings
          </button>
        </div>
      )}
    </div>
  );
}

const s = {
  back:        { background: 'none', border: 'none', fontSize: 14, color: 'var(--muted)', fontWeight: 500, marginBottom: 24, padding: 0, cursor: 'pointer' },
  proHeader:   { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, padding: 16, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-sm)' },
  proAvatarImg:{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--stone)' },
  proAvatar:   { width: 48, height: 48, borderRadius: '50%', background: 'var(--gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 600 },
  proName:     { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 },
  proCity:     { fontSize: 13, color: 'var(--muted)' },
  stepTitle:   { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 300, color: 'var(--ink)', marginBottom: 20 },
  list:        { display: 'flex', flexDirection: 'column', gap: 10 },
  serviceCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, cursor: 'pointer', transition: 'border-color .2s' },
  svcName:     { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 },
  svcDesc:     { fontSize: 13, color: 'var(--muted)' },
  svcRight:    { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0, marginLeft: 16 },
  svcPrice:    { fontSize: 18, fontWeight: 700, color: 'var(--gold-dark)' },
  svcDur:      { fontSize: 12, color: 'var(--muted)' },
  pill:        { display: 'inline-block', fontSize: 13, color: 'var(--gold-dark)', background: '#FBF7F0', border: '1px solid var(--stone)', padding: '6px 14px', borderRadius: 20, marginBottom: 16 },
  dateInput:   { width: '100%', padding: '11px 14px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 15, background: 'var(--cream)', marginBottom: 16 },
  slotGrid:    { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },
  slotBtn:     { padding: '10px 4px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--white)', color: 'var(--ink)', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all .15s' },
  summary:     { background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: '4px 20px', marginBottom: 20, boxShadow: 'var(--shadow-sm)' },
  row:         { display: 'flex', justifyContent: 'space-between', padding: '13px 0', borderBottom: '1px solid var(--stone)' },
  rowLabel:    { fontSize: 13, color: 'var(--muted)' },
  rowValue:    { fontSize: 13, fontWeight: 600, color: 'var(--ink)', textAlign: 'right', maxWidth: '60%' },
  confirmBtn:  { width: '100%', padding: 14, background: 'var(--ink)', color: 'var(--cream)', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 15, letterSpacing: '.02em', cursor: 'pointer' },
  success:     { textAlign: 'center', padding: '40px 0' },
  checkmark:   { width: 64, height: 64, borderRadius: '50%', background: '#E8F5E9', color: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, margin: '0 auto 20px' },
  refBox:      { display: 'inline-flex', flexDirection: 'column', gap: 6, background: 'var(--cream-dark)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 24px' },
  refLabel:    { fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' },
  refValue:    { fontFamily: 'monospace', fontSize: 18, fontWeight: 700, color: 'var(--gold-dark)' },
  error:       { background: '#FEF2F2', color: '#B91C1C', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14 },
};
