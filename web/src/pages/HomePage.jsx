import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Welcome, {user?.name}</h1>
      <p style={styles.sub}>Role: {user?.role}</p>
      <button style={styles.btn} onClick={logout}>Sign out</button>
    </div>
  );
}

const styles = {
  page:  { padding: 40 },
  title: { fontSize: 28, fontWeight: 700, marginBottom: 8 },
  sub:   { color: '#666', marginBottom: 24 },
  btn:   { padding: '10px 20px', background: '#111', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' },
};
