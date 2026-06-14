import { Router } from 'express';

const router = Router();

// Booking endpoints — implemented in feature/booking-engine branch
router.get('/', (req, res) => res.json({ bookings: [] }));

export default router;
