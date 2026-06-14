import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [status, setStatus] = useState('loading'); // loading | authed | guest

  useEffect(() => {
    api.get('/auth/me')
      .then(data => { setUser(data.user); setStatus('authed'); })
      .catch(() => setStatus('guest'));
  }, []);

  async function login(email, password) {
    const data = await api.post('/auth/login', { email, password });
    setUser(data.user);
    setStatus('authed');
    return data.user;
  }

  async function logout() {
    await api.post('/auth/logout').catch(() => {});
    setUser(null);
    setStatus('guest');
    window.location.replace('/login');
  }

  async function register(fields) {
    const data = await api.post('/auth/register', fields);
    setUser(data.user);
    setStatus('authed');
    return data.user;
  }

  return (
    <AuthContext.Provider value={{ user, status, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
