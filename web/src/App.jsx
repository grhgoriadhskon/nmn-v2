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
      <span style={s.logo} onClick={() => navigate('/pros')}>💅 NMN</span>
      <div style={s.links}>
        <NavLink to="/pros"     style={({ isActive }) => ({ ...s.navLink, ...(isActive ? s.navLinkActive : {}) })}>Find a pro</NavLink>
        <NavLink to="/bookings" style={({ isActive }) => ({ ...s.navLink, ...(isActive ? s.navLinkActive : {}) })}>My bookings</NavLink>
      </div>
      <div style={s.navRight}>
        <span style={s.navUser}>{user?.name}</span>
        <button style={s.signOutBtn} onClick={logout}>Sign out</button>
      </div>
    </nav>
  );
}

function RequireAuth({ children, role }) {
  const { status, user } = useAuth();
  if (status === 'loading') return <div style={{ padding: 48, textAlign: 'center', color: '#888' }}>Loading…</div>;
  if (status === 'guest')   return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;
  return children;
}

function CustomerRoute({ children }) {
  return (
    <RequireAuth>
      <CustomerNav />
      <div style={s.customerContent}>{children}</div>
    </RequireAuth>
  );
}

function DefaultRedirect() {
  const { user, status } = useAuth();
  if (status === 'loading') return <div style={{ padding: 48, textAlign: 'center', color: '#888' }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'pro') return <Navigate to="/pro/agenda" replace />;
  return <Navigate to="/pros" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<DefaultRedirect />} />

      <Route path="/pros"        element={<CustomerRoute><ProsPage /></CustomerRoute>} />
      <Route path="/pros/:proId" element={<CustomerRoute><BookingPage /></CustomerRoute>} />
      <Route path="/bookings"    element={<CustomerRoute><MyBookingsPage /></CustomerRoute>} />

      <Route path="/pro" element={<RequireAuth role="pro"><ProLayout /></RequireAuth>}>
        <Route index element={<Navigate to="/pro/agenda" replace />} />
        <Route path="agenda"        element={<ProAgendaPage />} />
        <Route path="services"      element={<ProServicesPage />} />
        <Route path="working-hours" element={<ProWorkingHoursPage />} />
        <Route path="profile"       element={<ProProfilePage />} />
      </Route>
    </Routes>
  );
}

const s = {
  nav: {
    display: 'flex', alignItems: 'center', gap: 0,
    padding: '0 28px', height: 60,
    background: '#fff',
    borderBottom: '1px solid #ececec',
    position: 'sticky', top: 0, zIndex: 100,
  },
  logo:           { fontWeight: 800, fontSize: 20, cursor: 'pointer', marginRight: 36, color: '#6c47ff', letterSpacing: '-0.5px' },
  links:          { display: 'flex', gap: 4, flex: 1 },
  navLink:        { padding: '6px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#555', transition: 'all .15s' },
  navLinkActive:  { color: '#6c47ff', background: '#f0ecff' },
  navRight:       { display: 'flex', alignItems: 'center', gap: 16 },
  navUser:        { fontSize: 14, color: '#999', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  signOutBtn:     { padding: '7px 16px', border: '1px solid #e0e0e0', background: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#555', transition: 'border-color .15s' },
  customerContent:{ minHeight: 'calc(100vh - 60px)', background: '#f4f4f8' },
};
