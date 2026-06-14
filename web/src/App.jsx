import React from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

import LoginPage      from './pages/LoginPage.jsx';
import RegisterPage   from './pages/RegisterPage.jsx';
import ProsPage       from './pages/customer/ProsPage.jsx';
import BookingPage    from './pages/customer/BookingPage.jsx';
import MyBookingsPage from './pages/customer/MyBookingsPage.jsx';

function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <nav style={s.nav}>
      <span style={s.logo} onClick={() => navigate('/')}>💅 NMN</span>
      <div style={s.links}>
        <Link style={s.link} to="/pros">Find a pro</Link>
        <Link style={s.link} to="/bookings">My bookings</Link>
        <span style={s.user}>{user?.name}</span>
        <button style={s.logoutBtn} onClick={logout}>Sign out</button>
      </div>
    </nav>
  );
}

function PrivateRoute({ children }) {
  const { status } = useAuth();
  if (status === 'loading') return <div style={{ padding: 32 }}>Loading…</div>;
  if (status === 'guest')   return <Navigate to="/login" replace />;
  return (
    <>
      <Nav />
      {children}
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<PrivateRoute><Navigate to="/pros" replace /></PrivateRoute>} />
      <Route path="/pros"          element={<PrivateRoute><ProsPage /></PrivateRoute>} />
      <Route path="/pros/:proId"   element={<PrivateRoute><BookingPage /></PrivateRoute>} />
      <Route path="/bookings"      element={<PrivateRoute><MyBookingsPage /></PrivateRoute>} />
    </Routes>
  );
}

const s = {
  nav:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', height: 56, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.08)', position: 'sticky', top: 0, zIndex: 10 },
  logo:      { fontWeight: 700, fontSize: 18, cursor: 'pointer' },
  links:     { display: 'flex', alignItems: 'center', gap: 20 },
  link:      { fontSize: 14, color: '#333', textDecoration: 'none', fontWeight: 500 },
  user:      { fontSize: 14, color: '#888' },
  logoutBtn: { padding: '6px 14px', border: '1px solid #ddd', background: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
};
