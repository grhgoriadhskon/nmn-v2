import * as bookingsService from './bookings.service.js';
import { getDb } from '../../db/index.js';

export function create(req, res, next) {
  try {
    const { pro_id, service_id, start_at, notes } = req.body;
    if (!pro_id || !service_id || !start_at) {
      return res.status(400).json({ error: 'pro_id, service_id and start_at are required' });
    }
    const booking = bookingsService.createBooking({
      customerId: req.user.id,
      proId: pro_id,
      serviceId: service_id,
      startAt: start_at,
      notes,
    });
    res.status(201).json({ booking });
  } catch (err) { next(err); }
}

export function myBookings(req, res, next) {
  try {
    const limit  = Math.min(Number(req.query.limit)  || 20, 100);
    const offset = Number(req.query.offset) || 0;
    const bookings = bookingsService.getBookingsForCustomer(req.user.id, { limit, offset });
    res.json({ bookings });
  } catch (err) { next(err); }
}

export function proBookings(req, res, next) {
  try {
    const pro = getDb().prepare('SELECT id FROM professionals WHERE user_id = ?').get(req.user.id);
    if (!pro) return res.status(403).json({ error: 'Pro profile not found' });

    const limit  = Math.min(Number(req.query.limit)  || 50, 200);
    const offset = Number(req.query.offset) || 0;
    const bookings = bookingsService.getBookingsForPro(pro.id, { limit, offset });
    res.json({ bookings });
  } catch (err) { next(err); }
}

export function cancel(req, res, next) {
  try {
    const booking = bookingsService.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const isPro      = req.user.role === 'pro';
    const isCustomer = req.user.role === 'customer' && booking.customer_id === req.user.id;
    if (!isPro && !isCustomer) return res.status(403).json({ error: 'Forbidden' });

    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ error: 'Booking cannot be cancelled' });
    }

    const updated = bookingsService.updateBookingStatus(booking.id, 'cancelled', {
      cancelledBy:  req.user.role,
      cancelReason: req.body.reason || null,
    });
    res.json({ booking: updated });
  } catch (err) { next(err); }
}

export function confirm(req, res, next) {
  try {
    const pro = getDb().prepare('SELECT id FROM professionals WHERE user_id = ?').get(req.user.id);
    if (!pro) return res.status(403).json({ error: 'Pro profile not found' });

    const booking = bookingsService.getBookingById(req.params.id);
    if (!booking || booking.pro_id !== pro.id) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'pending') return res.status(400).json({ error: 'Booking is not pending' });

    res.json({ booking: bookingsService.updateBookingStatus(booking.id, 'confirmed') });
  } catch (err) { next(err); }
}

export function complete(req, res, next) {
  try {
    const pro = getDb().prepare('SELECT id FROM professionals WHERE user_id = ?').get(req.user.id);
    if (!pro) return res.status(403).json({ error: 'Pro profile not found' });

    const booking = bookingsService.getBookingById(req.params.id);
    if (!booking || booking.pro_id !== pro.id) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'confirmed') return res.status(400).json({ error: 'Booking is not confirmed' });

    res.json({ booking: bookingsService.updateBookingStatus(booking.id, 'completed') });
  } catch (err) { next(err); }
}
