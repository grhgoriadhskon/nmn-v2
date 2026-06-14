import { getDb } from '../../db/index.js';
import { sendBookingConfirmation } from '../../services/email.service.js';

function generateReference() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `NMN-${date}-${rand}`;
}

export function createBooking({ customerId, proId, serviceId, startAt, notes }) {
  const db = getDb();

  const service = db.prepare('SELECT * FROM services WHERE id = ? AND pro_id = ? AND is_active = 1').get(serviceId, proId);
  if (!service) throw Object.assign(new Error('Service not found'), { status: 404 });

  const start = new Date(startAt);
  const end   = new Date(start.getTime() + service.duration_min * 60 * 1000);
  const startIso = start.toISOString().slice(0, 19) + 'Z';
  const endIso   = end.toISOString().slice(0, 19) + 'Z';

  // Conflict detection: is there any pending/confirmed booking that overlaps?
  const conflict = db.prepare(`
    SELECT id FROM bookings
    WHERE pro_id = ?
      AND status IN ('pending', 'confirmed')
      AND start_at < ?
      AND end_at   > ?
  `).get(proId, endIso, startIso);

  if (conflict) throw Object.assign(new Error('This slot is no longer available'), { status: 409 });

  const reference = generateReference();
  const result = db.prepare(`
    INSERT INTO bookings (reference, customer_id, pro_id, service_id, start_at, end_at, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(reference, customerId, proId, serviceId, startIso, endIso, notes || null);

  const booking = getBookingById(result.lastInsertRowid);

  // Send confirmation email (fire and forget)
  const customer = db.prepare('SELECT email, name FROM users WHERE id = ?').get(customerId);
  const proUser  = db.prepare('SELECT u.email FROM users u JOIN professionals p ON p.user_id = u.id WHERE p.id = ?').get(proId);
  if (customer) {
    sendBookingConfirmation({
      to:           customer.email,
      customerName: customer.name,
      proName:      booking.pro_name,
      serviceName:  booking.service_name,
      date:         startIso.slice(0, 10),
      time:         startIso.slice(11, 16),
      reference,
      price:        service.price,
    }).catch(() => {});
  }

  return booking;
}

export function getBookingById(id) {
  return getDb().prepare(`
    SELECT b.*,
           u.name  AS customer_name,
           p.name  AS pro_name,
           s.name  AS service_name,
           s.duration_min,
           s.price
    FROM bookings b
    JOIN users        u ON u.id = b.customer_id
    JOIN users        p ON p.id = (SELECT user_id FROM professionals WHERE id = b.pro_id)
    JOIN services     s ON s.id = b.service_id
    WHERE b.id = ?
  `).get(id);
}

export function getBookingByReference(reference) {
  return getDb().prepare('SELECT * FROM bookings WHERE reference = ?').get(reference);
}

export function getBookingsForCustomer(customerId, { limit = 20, offset = 0 } = {}) {
  return getDb().prepare(`
    SELECT b.*, s.name AS service_name, s.price, u.name AS pro_name
    FROM bookings b
    JOIN services     s ON s.id = b.service_id
    JOIN professionals pr ON pr.id = b.pro_id
    JOIN users         u ON u.id = pr.user_id
    WHERE b.customer_id = ?
    ORDER BY b.start_at DESC
    LIMIT ? OFFSET ?
  `).all(customerId, limit, offset);
}

export function getBookingsForPro(proId, { limit = 50, offset = 0 } = {}) {
  return getDb().prepare(`
    SELECT b.*, s.name AS service_name, s.price, u.name AS customer_name
    FROM bookings b
    JOIN services s ON s.id = b.service_id
    JOIN users    u ON u.id = b.customer_id
    WHERE b.pro_id = ?
    ORDER BY b.start_at DESC
    LIMIT ? OFFSET ?
  `).all(proId, limit, offset);
}

export function updateBookingStatus(id, status, { cancelledBy, cancelReason } = {}) {
  const db = getDb();
  db.prepare(`
    UPDATE bookings
    SET status = ?, cancelled_by = ?, cancel_reason = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(status, cancelledBy || null, cancelReason || null, id);
  return getBookingById(id);
}
