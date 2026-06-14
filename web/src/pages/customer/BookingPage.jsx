import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/client.js';

const STEPS = ['service', 'slot', 'confirm'];

export default function BookingPage() {
  const { proId }   = useParams();
  const navigate    = useNavigate();

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

  function selectService(service) {
    setSelected(s => ({ ...s, service, slot: null }));
    setSlots([]);
    setStep('slot');
  }

  async function loadSlots(date) {
    if (!date) return;
    setSelected(s => ({ ...s, date, slot: null }));
    setSlotsLoading(true);
    setError('');
    try {
      const d = await api.get(`/availability?pro_id=${proId}&service_id=${selected.service.id}&date=${date}`);
      setSlots(d.slots || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setSlotsLoading(false);
    }
  }

  function selectSlot(slot) {
    setSelected(s => ({ ...s, slot }));
    setStep('confirm');
  }

  async function confirmBooking() {
    setSubmitting(true);
    setError('');
    try {
      const d = await api.post('/bookings', {
        pro_id:     Number(proId),
        service_id: selected.service.id,
        start_at:   selected.slot.start_at,
      });
      setBooking(d.booking);
      setStep('done');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function goBack() {
    if (step === 'service') navigate('/pros');
    else setStep(STEPS[STEPS.indexOf(step) - 1]);
  }

  if (!pro) return <div style={s.loading}>Loading…</div>;

  return (
    <div style={s.page}>
      {step !== 'done' && (
        <button style={s.back} onClick={goBack}>← Back</button>
      )}

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

      {step === 'service' && (
        <>
          <h2 style={s.stepTitle}>Choose a service</h2>
          <div style={s.list}>
            {services.length === 0 && <p style={s.empty}>No services available.</p>}
            {services.map(svc => (
              <div key={svc.id} style={s.serviceCard} onClick={() => selectService(svc)}>
                <div>
                  <p style={s.svcName}>{svc.name}</p>
                  {svc.description && <p style={s.svcDesc}>{svc.description}</p>}
                </div>
                <div style={s.svcRight}>
                  <span style={s.svcPrice}>€{Number(svc.price).toFixed(2)}</span>
                  <span style={s.svcDuration}>{svc.duration_min} min</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {step === 'slot' && (
        <>
          <h2 style={s.stepTitle}>Choose date & time</h2>
          <div style={s.selectedPill}>
            {selected.service.name} · {selected.service.duration_min} min · €{Number(selected.service.price).toFixed(2)}
          </div>
          <input
            type="date"
            style={s.dateInput}
            min={new Date().toISOString().slice(0, 10)}
            value={selected.date}
            onChange={e => loadSlots(e.target.value)}
          />
          {slotsLoading && <p style={s.empty}>Loading available slots…</p>}
          {!slotsLoading && selected.date && slots.length === 0 && (
            <p style={s.empty}>No available slots on this date.</p>
          )}
          {slots.length > 0 && (
            <div style={s.slotGrid}>
              {slots.map(slot => (
                <button key={slot.start} style={s.slotBtn} onClick={() => selectSlot(slot)}>
                  {slot.start}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {step === 'confirm' && (
        <>
          <h2 style={s.stepTitle}>Confirm your booking</h2>
          <div style={s.summary}>
            <SummaryRow label="Professional" value={pro.name} />
            <SummaryRow label="Service"      value={`${selected.service.name} (${selected.service.duration_min} min)`} />
            <SummaryRow label="Date"         value={new Date(selected.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />
            <SummaryRow label="Time"         value={`${selected.slot.start} – ${selected.slot.end}`} />
            <SummaryRow label="Price"        value={`€${Number(selected.service.price).toFixed(2)}`} last />
          </div>
          <button style={s.confirmBtn} onClick={confirmBooking} disabled={submitting}>
            {submitting ? 'Booking…' : 'Confirm booking'}
          </button>
        </>
      )}

      {step === 'done' && booking && (
        <div style={s.successWrap}>
          <div style={s.successCard}>
            <div style={s.successIcon}>✓</div>
            <h2 style={s.successTitle}>Booking confirmed!</h2>
            <p style={s.successSub}>{selected.service.name} · {selected.date} · {selected.slot.start}</p>
            <div style={s.refBox}>
              <span style={s.refLabel}>Reference</span>
              <span style={s.ref}>{booking.reference}</span>
            </div>
          </div>
          <button style={s.confirmBtn} onClick={() => navigate('/bookings')}>View my bookings</button>
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value, last }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 0', borderBottom: last ? 'none' : '1px solid #f0f0f0' }}>
      <span style={{ color: '#888', fontSize: 14 }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: 14, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  );
}

const s = {
  page:          { padding: '24px 20px', maxWidth: 560, margin: '0 auto' },
  loading:       { padding: 48, textAlign: 'center', color: '#aaa' },
  back:          { background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#6c47ff', fontWeight: 600, marginBottom: 20, padding: 0 },
  proHeader:     { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, padding: 16, background: '#fff', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,.05)' },
  proAvatarImg:  { width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' },
  proAvatar:     { width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #6c47ff, #a855f7)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700 },
  proName:       { fontWeight: 700, fontSize: 16, color: '#1a1a2e', marginBottom: 2 },
  proCity:       { fontSize: 13, color: '#888' },
  stepTitle:     { fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginBottom: 16 },
  list:          { display: 'flex', flexDirection: 'column', gap: 10 },
  serviceCard:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#fff', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,.05)', cursor: 'pointer', border: '2px solid transparent', transition: 'border-color .15s' },
  svcName:       { fontWeight: 700, fontSize: 15, color: '#1a1a2e', marginBottom: 2 },
  svcDesc:       { fontSize: 13, color: '#888' },
  svcRight:      { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 },
  svcPrice:      { fontSize: 17, fontWeight: 800, color: '#6c47ff' },
  svcDuration:   { fontSize: 12, color: '#aaa' },
  selectedPill:  { fontSize: 13, color: '#6c47ff', fontWeight: 600, background: '#f0ecff', padding: '8px 14px', borderRadius: 20, marginBottom: 16, display: 'inline-block' },
  dateInput:     { padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e8e8e8', fontSize: 15, marginBottom: 16, width: '100%' },
  slotGrid:      { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 4 },
  slotBtn:       { padding: '11px 4px', borderRadius: 10, border: '1.5px solid #ede9fe', background: '#fff', color: '#6c47ff', fontWeight: 700, fontSize: 14, transition: 'all .15s' },
  summary:       { background: '#fff', borderRadius: 16, padding: '4px 20px', marginBottom: 20, boxShadow: '0 2px 10px rgba(0,0,0,.05)' },
  confirmBtn:    { width: '100%', padding: 14, background: 'linear-gradient(135deg, #6c47ff, #a855f7)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 16 },
  successWrap:   { textAlign: 'center' },
  successCard:   { background: '#fff', borderRadius: 20, padding: '40px 32px', marginBottom: 20, boxShadow: '0 4px 20px rgba(108,71,255,.1)' },
  successIcon:   { width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, margin: '0 auto 16px' },
  successTitle:  { fontSize: 24, fontWeight: 800, color: '#1a1a2e', marginBottom: 8 },
  successSub:    { fontSize: 14, color: '#888', marginBottom: 20 },
  refBox:        { display: 'inline-flex', flexDirection: 'column', background: '#f4f4f8', borderRadius: 12, padding: '12px 20px', gap: 4 },
  refLabel:      { fontSize: 11, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 },
  ref:           { fontFamily: 'monospace', fontWeight: 700, fontSize: 16, color: '#6c47ff' },
  empty:         { color: '#aaa', fontSize: 14, padding: '12px 0' },
  error:         { background: '#fde8e8', color: '#dc2626', padding: '12px 16px', borderRadius: 12, marginBottom: 16, fontSize: 14, fontWeight: 500 },
};
