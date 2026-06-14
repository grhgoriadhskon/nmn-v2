import React, { useEffect, useState } from 'react';
import { api } from '../../api/client.js';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_HOURS = DAYS.map((_, day) => ({
  day,
  closed: day === 0 || day === 6, // closed on weekends by default
  start_time: '09:00',
  end_time: '18:00',
}));

export default function ProWorkingHoursPage() {
  const [hours, setHours]   = useState(DEFAULT_HOURS);
  const [proId, setProId]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get('/pros/me').then(pro => {
      setProId(pro.pro.id);
      return api.get(`/pros/${pro.pro.id}/working-hours`);
    }).then(d => {
      if (d.working_hours.length > 0) {
        setHours(DAYS.map((_, day) => {
          const existing = d.working_hours.find(h => h.day === day);
          return existing
            ? { day, closed: false, start_time: existing.start_time, end_time: existing.end_time }
            : { day, closed: true, start_time: '09:00', end_time: '18:00' };
        }));
      }
    }).finally(() => setLoading(false));
  }, []);

  function toggle(day) {
    setHours(h => h.map(x => x.day === day ? { ...x, closed: !x.closed } : x));
  }

  function setTime(day, key, value) {
    setHours(h => h.map(x => x.day === day ? { ...x, [key]: value } : x));
  }

  async function save() {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await api.put('/pros/me/working-hours', { hours });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h1 style={s.title}>Working hours</h1>
      <div style={s.card}>
        {hours.map(h => (
          <div key={h.day} style={s.row}>
            <div style={s.dayCol}>
              <input type="checkbox" checked={!h.closed} onChange={() => toggle(h.day)} id={`day-${h.day}`} />
              <label htmlFor={`day-${h.day}`} style={s.dayLabel}>{DAYS[h.day]}</label>
            </div>
            {h.closed ? (
              <span style={s.closed}>Closed</span>
            ) : (
              <div style={s.timeRow}>
                <input style={s.timeInput} type="time" value={h.start_time} onChange={e => setTime(h.day, 'start_time', e.target.value)} />
                <span style={s.dash}>–</span>
                <input style={s.timeInput} type="time" value={h.end_time}   onChange={e => setTime(h.day, 'end_time', e.target.value)} />
              </div>
            )}
          </div>
        ))}
      </div>
      {error  && <p style={s.error}>{error}</p>}
      {saved  && <p style={s.success}>Saved!</p>}
      <button style={s.saveBtn} onClick={save} disabled={saving}>
        {saving ? 'Saving…' : 'Save working hours'}
      </button>
    </div>
  );
}

const s = {
  title:      { fontSize: 24, fontWeight: 700, marginBottom: 24 },
  card:       { background: '#fff', borderRadius: 12, padding: '8px 20px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,.06)' },
  row:        { display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f5f5f5', gap: 16 },
  dayCol:     { display: 'flex', alignItems: 'center', gap: 8, width: 130 },
  dayLabel:   { fontWeight: 500, cursor: 'pointer', userSelect: 'none' },
  closed:     { color: '#aaa', fontSize: 14 },
  timeRow:    { display: 'flex', alignItems: 'center', gap: 8 },
  timeInput:  { padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14 },
  dash:       { color: '#aaa' },
  saveBtn:    { padding: '10px 24px', background: '#6c47ff', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500, fontSize: 15 },
  error:      { color: '#d00', fontSize: 13, marginBottom: 8 },
  success:    { color: '#22c55e', fontSize: 13, marginBottom: 8 },
};
