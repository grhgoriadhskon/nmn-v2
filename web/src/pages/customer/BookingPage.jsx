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

  if (!pro) return <div style={s.page}>Loading…</div>;

  return (
    <div style={s.page}>
      <button style={s.back} onClick={() => step === 'service' ? navigate('/pros') : setStep(STEPS[STEPS.indexOf(step) - 1])}>
        ← Back
      </button>

      <div style={s.proHeader}>
        <div style={s.avatar}>{pro.name?.[0]?.toUpperCase()}</div>
        <div>
          <p style={s.proName}>{pro.name}</p>
          <p style={s.proCity}>{pro.city}</p>
        </div>
      </div>

      {error && <p style={s.error}>{error}</p>}

      {step === 'service' && (
        <>
          <h2 style={s.stepTitle}>Choose a service</h2>
          <div style={s.list}>
            {services.map(svc => (
              <div key={svc.id} style={s.serviceCard} onClick={() => selectService(svc)}>
                <div>
                  <p style={s.svcName}>{svc.name}</p>
                  {svc.description && <p style={s.svcDesc}>{svc.description}</p>}
                </div>
                <div style={s.svcMeta}>
                  <span style={s.svcDuration}>{svc.duration_min} min</span>
                  <span style={s.svcPrice}>€{Number(svc.price).toFixed(2)}</span>
                </div>
              </div>
            ))}
            {services.length === 0 && <p style={s.empty}>No services available.</p>}
          </div>
        </>
      )}

      {step === 'slot' && (
        <>
          <h2 style={s.stepTitle}>Choose a date & time</h2>
          <p style={s.selectedService}>{selected.service.name} · {selected.service.duration_min} min · €{Number(selected.service.price).toFixed(2)}</p>
          <input
            type="date"
            style={s.dateInput}
            min={new Date().toISOString().slice(0, 10)}
            value={selected.date}
            onChange={e => loadSlots(e.target.value)}
          />
          {slotsLoading && <p style={s.empty}>Loading slots…</p>}
          {!slotsLoading && selected.date && slots.length === 0 && (
            <p style={s.empty}>No available slots on this date.</p>
          )}
          <div style={s.slotGrid}>
            {slots.map(slot => (
              <button key={slot.start} style={s.slotBtn} onClick={() => selectSlot(slot)}>
                {slot.start}
              </button>
            ))}
          </div>
        </>
      )}

      {step === 'confirm' && (
        <>
          <h2 style={s.stepTitle}>Confirm booking</h2>
          <div style={s.summary}>
            <Row label="Professional" value={pro.name} />
            <Row label="Service"      value={`${selected.service.name} (${selected.service.duration_min} min)`} />
            <Row label="Date"         value={selected.date} />
            <Row label="Time"         value={`${selected.slot.start} – ${selected.slot.end}`} />
            <Row label="Price"        value={`€${Number(selected.service.price).toFixed(2)}`} />
          </div>
          <button style={s.confirmBtn} onClick={confirmBooking} disabled={submitting}>
            {submitting ? 'Booking…' : 'Confirm booking'}
          </button>
        </>
      )}

      {step === 'done' && booking && (
        <>
          <div style={s.success}>
            <p style={s.successIcon}>✓</p>
            <h2 style={s.successTitle}>Booking confirmed!</h2>
            <p style={s.ref}>Reference: <strong>{booking.reference}</strong></p>
            <p style={s.successSub}>{selected.service.name} on {selected.date} at {selected.slot.start}</p>
          </div>
          <button style={s.confirmBtn} onClick={() => navigate('/bookings')}>View my bookings</button>
        </>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
      <span style={{ color: '#888', fontSize: 14 }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

const s = {
  page:          { padding: 24, maxWidth: 560, margin: '0 auto' },
  back:          { background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#6c47ff', marginBottom: 20, padding: 0 },
  proHeader:     { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: 16, background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,.07)' },
  avatar:        { width: 44, height: 44, borderRadius: '50%', background: '#6c47ff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 },
  proName:       { fontWeight: 600, fontSize: 16 },
  proCity:       { fontSize: 13, color: '#888' },
  stepTitle:     { fontSize: 18, fontWeight: 600, marginBottom: 16 },
  list:          { display: 'flex', flexDirection: 'column', gap: 10 },
  serviceCard:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,.07)', cursor: 'pointer' },
  svcName:       { fontWeight: 600, marginBottom: 2 },
  svcDesc:       { fontSize: 13, color: '#666' },
  svcMeta:       { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
  svcDuration:   { fontSize: 13, color: '#888' },
  svcPrice:      { fontSize: 16, fontWeight: 700, color: '#6c47ff' },
  selectedService: { fontSize: 14, color: '#555', marginBottom: 16, padding: '8px 12px', background: '#f5f3ff', borderRadius: 8 },
  dateInput:     { padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15, marginBottom: 16, width: '100%' },
  slotGrid:      { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },
  slotBtn:       { padding: '10px 4px', borderRadius: 8, border: '1px solid #e0d9ff', background: '#f5f3ff', color: '#6c47ff', fontWeight: 600, cursor: 'pointer', fontSize: 14 },
  summary:       { background: '#fff', borderRadius: 12, padding: '4px 16px', marginBottom: 20, boxShadow: '0 1px 6px rgba(0,0,0,.07)' },
  confirmBtn:    { width: '100%', padding: 14, background: '#6c47ff', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 16, cursor: 'pointer' },
  success:       { textAlign: 'center', padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 1px 6px rgba(0,0,0,.07)', marginBottom: 20 },
  successIcon:   { fontSize: 48, color: '#22c55e', marginBottom: 8 },
  successTitle:  { fontSize: 22, fontWeight: 700, marginBottom: 8 },
  ref:           { fontSize: 15, marginBottom: 8 },
  successSub:    { color: '#666', fontSize: 14 },
  empty:         { color: '#888', fontSize: 14, padding: '8px 0' },
  error:         { color: '#d00', background: '#fff0f0', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 },
};
