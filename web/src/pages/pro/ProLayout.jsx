import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV = [
  { to: '/pro/agenda',        icon: '📅', label: 'Agenda' },
  { to: '/pro/services',      icon: '💅', label: 'Services' },
  { to: '/pro/working-hours', icon: '🕐', label: 'Working hours' },
  { to: '/pro/profile',       icon: '👤', label: 'My profile' },
];

export default function ProLayout() {
  const { user, logout } = useAuth();

  return (
    <div style={s.shell}>
      <aside style={s.sidebar}>
        <div style={s.brand}>💅 NMN Pro</div>

        <nav style={s.nav}>
          {NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({ ...s.link, ...(isActive ? s.linkActive : {}) })}>
              <span style={s.icon}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={s.bottom}>
          <div style={s.userRow}>
            <div style={s.userAvatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <p style={s.userName}>{user?.name}</p>
              <p style={s.userRole}>Professional</p>
            </div>
          </div>
          <button style={s.logoutBtn} onClick={logout}>Sign out</button>
        </div>
      </aside>

      <main style={s.main}>
        <Outlet />
      </main>
    </div>
  );
}

const s = {
  shell:      { display: 'flex', minHeight: '100vh', background: '#f4f4f8' },
  sidebar:    { width: 232, background: '#fff', borderRight: '1px solid #ececec', display: 'flex', flexDirection: 'column', padding: '24px 16px', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' },
  brand:      { fontWeight: 800, fontSize: 20, color: '#6c47ff', marginBottom: 32, paddingLeft: 12, letterSpacing: '-0.5px' },
  nav:        { display: 'flex', flexDirection: 'column', gap: 2, flex: 1 },
  link:       { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, fontWeight: 500, fontSize: 14, color: '#555', textDecoration: 'none', transition: 'all .15s' },
  linkActive: { color: '#6c47ff', background: '#f0ecff', fontWeight: 700 },
  icon:       { fontSize: 16, width: 20, textAlign: 'center', flexShrink: 0 },
  bottom:     { borderTop: '1px solid #ececec', paddingTop: 16 },
  userRow:    { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  userAvatar: { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6c47ff, #a855f7)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0 },
  userName:   { fontSize: 14, fontWeight: 600, color: '#1a1a2e' },
  userRole:   { fontSize: 12, color: '#aaa' },
  logoutBtn:  { width: '100%', padding: '9px', border: '1.5px solid #ececec', background: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#888' },
  main:       { flex: 1, padding: 36 },
};
