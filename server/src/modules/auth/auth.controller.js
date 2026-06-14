import * as authService from './auth.service.js';
import { getDb } from '../../db/index.js';

export function register(req, res, next) {
  try {
    const { email, password, name, phone, role } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'email, password and name are required' });

    const existing = authService.findUserByEmail(email);
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const user = authService.createUser({ email, password, name, phone, role });

    // Auto-create professional profile when registering as pro
    if (user.role === 'pro') {
      getDb().prepare('INSERT INTO professionals (user_id) VALUES (?)').run(user.id);
    }

    const token = authService.signToken(user);
    authService.setAuthCookie(res, token);

    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

export function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

    const user = authService.findUserByEmail(email);
    if (!user || !authService.verifyPassword(user, password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Ensure pro profile exists (handles users created before auto-create was added)
    if (user.role === 'pro') {
      const db = getDb();
      const existing = db.prepare('SELECT id FROM professionals WHERE user_id = ?').get(user.id);
      if (!existing) db.prepare('INSERT INTO professionals (user_id) VALUES (?)').run(user.id);
    }

    const token = authService.signToken(user);
    authService.setAuthCookie(res, token);

    const { password_hash, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (err) {
    next(err);
  }
}

export function logout(req, res) {
  authService.clearAuthCookie(res);
  res.json({ ok: true });
}

export function me(req, res, next) {
  try {
    const user = authService.findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
