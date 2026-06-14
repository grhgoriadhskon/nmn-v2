import { Router } from 'express';

const router = Router();

// GET /api/services?pro_id=X — list services for a pro
router.get('/', (req, res) => res.json({ services: [] }));

export default router;
