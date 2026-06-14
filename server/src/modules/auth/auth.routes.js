import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../../middleware/auth.js';
import * as controller from './auth.controller.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts, please try again later' },
});

router.post('/register', authLimiter, controller.register);
router.post('/login',    authLimiter, controller.login);
router.post('/logout',   controller.logout);
router.get('/me',        requireAuth, controller.me);

export default router;
