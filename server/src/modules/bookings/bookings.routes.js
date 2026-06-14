import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import * as controller from './bookings.controller.js';

const router = Router();

// Customer
router.post('/',       requireAuth, requireRole('customer'), controller.create);
router.get('/mine',    requireAuth, requireRole('customer'), controller.myBookings);
router.post('/:id/cancel', requireAuth, controller.cancel);

// Pro
router.get('/pro',          requireAuth, requireRole('pro'), controller.proBookings);
router.post('/:id/confirm', requireAuth, requireRole('pro'), controller.confirm);
router.post('/:id/complete', requireAuth, requireRole('pro'), controller.complete);

export default router;
