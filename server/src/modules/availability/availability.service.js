import { getDb } from '../../db/index.js';

const SLOT_INTERVAL_MIN = 15; // generate a slot candidate every 15 minutes

/**
 * Returns available time slots for a given pro + service + date.
 *
 * Algorithm:
 * 1. Get pro's working hours for that day of week.
 * 2. Get existing bookings for that day (pending + confirmed).
 * 3. Walk from open to close in SLOT_INTERVAL_MIN steps.
 * 4. For each candidate slot [start, start + duration], check no existing booking overlaps.
 * 5. Return non-overlapping slots.
 */
export function getAvailableSlots(proId, serviceId, dateStr) {
  const db = getDb();

  const service = db.prepare('SELECT * FROM services WHERE id = ? AND pro_id = ? AND is_active = 1').get(serviceId, proId);
  if (!service) return { error: 'Service not found' };

  const date = new Date(dateStr);
  if (isNaN(date)) return { error: 'Invalid date' };

  const dayOfWeek = date.getUTCDay(); // 0=Sunday

  const workingHours = db
    .prepare('SELECT * FROM working_hours WHERE pro_id = ? AND day = ?')
    .get(proId, dayOfWeek);

  if (!workingHours) return { slots: [] }; // pro doesn't work this day

  // Fetch existing bookings that block time on this date
  const existingBookings = db.prepare(`
    SELECT start_at, end_at FROM bookings
    WHERE pro_id = ?
      AND status IN ('pending', 'confirmed')
      AND date(start_at) = ?
  `).all(proId, dateStr);

  const slots = generateSlots({
    date: dateStr,
    openTime:     workingHours.start_time,
    closeTime:    workingHours.end_time,
    durationMin:  service.duration_min,
    existingBookings,
  });

  return { slots, service };
}

function generateSlots({ date, openTime, closeTime, durationMin, existingBookings }) {
  const openMinutes  = timeToMinutes(openTime);
  const closeMinutes = timeToMinutes(closeTime);
  const slots = [];

  for (let start = openMinutes; start + durationMin <= closeMinutes; start += SLOT_INTERVAL_MIN) {
    const end = start + durationMin;

    const hasConflict = existingBookings.some(b => {
      const bStart = timeToMinutes(b.start_at.slice(11, 16)); // extract HH:MM from ISO
      const bEnd   = timeToMinutes(b.end_at.slice(11, 16));
      return start < bEnd && end > bStart;
    });

    if (!hasConflict) {
      slots.push({
        start: minutesToTime(start),
        end:   minutesToTime(end),
        start_at: `${date}T${minutesToTime(start)}:00Z`,
        end_at:   `${date}T${minutesToTime(end)}:00Z`,
      });
    }
  }

  return slots;
}

function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}
