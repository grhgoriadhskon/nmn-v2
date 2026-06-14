import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../../db/index.js';
import { config } from '../../config/index.js';

export function findUserByEmail(email) {
  return getDb().prepare('SELECT * FROM users WHERE email = ?').get(email);
}

export function findUserById(id) {
  return getDb().prepare('SELECT id, email, name, phone, role, email_verified FROM users WHERE id = ?').get(id);
}

export function createUser({ email, password, name, phone, role = 'customer' }) {
  const password_hash = bcrypt.hashSync(password, 10);
  const db = getDb();
  const result = db.prepare(
    'INSERT INTO users (email, password_hash, name, phone, role) VALUES (?, ?, ?, ?, ?)'
  ).run(email, password_hash, name, phone || null, role);
  return findUserById(result.lastInsertRowid);
}

export function verifyPassword(user, password) {
  return bcrypt.compareSync(password, user.password_hash);
}

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

export function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
}

export function clearAuthCookie(res) {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
}
