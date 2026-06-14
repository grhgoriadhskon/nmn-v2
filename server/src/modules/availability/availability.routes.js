import { Router } from 'express';
import { getAvailableSlots } from './availability.service.js';

const router = Router();

// GET /api/availability?pro_id=1&service_id=2&date=2026-06-20
router.get('/', (req, res, next) => {
  try {
    const { pro_id, service_id, date } = req.query;
    if (!pro_id || !service_id || !date) {
      return res.status(400).json({ error: 'pro_id, service_id and date are required' });
    }
    const result = getAvailableSlots(Number(pro_id), Number(service_id), date);
    if (result.error) return res.status(400).json({ error: result.error });
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
