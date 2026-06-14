import React from 'react';
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

import LoginPage            from './pages/LoginPage.jsx';
import RegisterPage         from './pages/RegisterPage.jsx';
import ProsPage             from './pages/customer/ProsPage.jsx';
import BookingPage          from './pages/customer/BookingPage.jsx';
import MyBookingsPage       from './pages/customer/MyBookingsPage.jsx';
import ProLayout            from './pages/pro/ProLayout.jsx';
import ProAgendaPage        from './pages/pro/ProAgendaPage.jsx';
import ProServicesPage      from './pages/pro/ProServicesPage.jsx';
import ProWorkingHoursPage  from './pages/pro/ProWorkingHoursPage.jsx';
import ProProfilePage       from './pages/pro/ProProfilePage.jsx';

function CustomerNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <nav style={s.nav}>
      <span style={s.logo} onClick={() => navigate('/pros')}>NMN</span>
      <div style={s.navLinks}>
        <NavLink to="/pros"     style={({ isActive }) => ({ ...s.navLink, ...(isActive ? s.navActive : {}) })}>Find a pro</NavLink>
        <NavLink to="/bookings" style={({ isActive }) => ({ ...s.navLink, ...(isActive ? s.navActive : {}) })}>My bookings</NavLink>
      </div>
      <div style={s.navRight}>
        <span style={s.navUser}>{user?.name}</span>
        <button style={s.signOut} onClick={logout}>Sign out</button>
      </div>
    </nav>
  );
}

function RequireAuth({ children, role }) {
  const { status, user } = useAuth();
  if (status === 'loading') return <div style={s.loading}>Loading…</div>;
  if (status === 'guest')   return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;
  return children;
}

function CustomerRoute({ children }) {
  return (
    <RequireAuth>
      <div style={s.customerShell}>
        <CustomerNav />
        <main style={s.customerMain}>{children}</main>
      </div>
    </RequireAuth>
  );
}

function DefaultRedirect() {
  const { user, status } = useAuth();
  if (status === 'loading') return <div style={s.loading}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'pro' ? '/pro/agenda' : '/pros'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/"         element={<DefaultRedirect />} />

      <Route path="/pros"        element={<CustomerRoute><ProsPage /></CustomerRoute>} />
      <Route path="/pros/:proId" element={<CustomerRoute><BookingPage /></CustomerRoute>} />
      <Route path="/bookings"    element={<CustomerRoute><MyBookingsPage /></CustomerRoute>} />

      <Route path="/pro" element={<RequireAuth role="pro"><ProLayout /></RequireAuth>}>
        <Route index                element={<Navigate to="/pro/agenda" replace />} />
        <Route path="agenda"        element={<ProAgendaPage />} />
        <Route path="services"      element={<ProServicesPage />} />
        <Route path="working-hours" element={<ProWorkingHoursPage />} />
        <Route path="profile"       element={<ProProfilePage />} />
      </Route>
    </Routes>
  );
}

const s = {
  loading:      { padding: 48, textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-body)' },
  customerShell:{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column' },
  customerMain: { flex: 1 },

  nav:       { display: 'flex', alignItems: 'center', height: 58, padding: '0 32px', background: 'var(--white)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 },
  logo:      { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--gold)', letterSpacing: 3, cursor: 'pointer', marginRight: 40 },
  navLinks:  { display: 'flex', gap: 4, flex: 1 },
  navLink:   { padding: '6px 14px', borderRadius: 6, fontSize: 14, fontWeight: 500, color: 'var(--ink-light)', transition: 'all .15s' },
  navActive: { color: 'var(--ink)', background: 'var(--cream-dark)' },
  navRight:  { display: 'flex', alignItems: 'center', gap: 16 },
  navUser:   { fontSize: 13, color: 'var(--muted)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  signOut:   { padding: '6px 14px', border: '1px solid var(--border)', background: 'transparent', borderRadius: 6, fontSize: 13, color: 'var(--ink-light)', fontWeight: 500 },
};
