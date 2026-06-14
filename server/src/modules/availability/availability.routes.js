import { Router } from 'express';

const router = Router();

// GET /api/availability?pro_id=X&service_id=Y&date=YYYY-MM-DD
router.get('/', (req, res) => res.json({ slots: [] }));

export default router;
