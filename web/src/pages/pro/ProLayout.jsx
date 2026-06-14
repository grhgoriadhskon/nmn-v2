import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ProLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={s.shell}>
      <aside style={s.sidebar}>
        <div style={s.logo} onClick={() => navigate('/pro')}>💅 NMN Pro</div>
        <nav style={s.nav}>
          <NavLink to="/pro/agenda"        style={navStyle}>Agenda</NavLink>
          <NavLink to="/pro/services"      style={navStyle}>Services</NavLink>
          <NavLink to="/pro/working-hours" style={navStyle}>Working hours</NavLink>
        </nav>
        <div style={s.bottom}>
          <p style={s.userName}>{user?.name}</p>
          <button style={s.logoutBtn} onClick={logout}>Sign out</button>
        </div>
      </aside>
      <main style={s.main}>
        <Outlet />
      </main>
    </div>
  );
}

function navStyle({ isActive }) {
  return {
    display: 'block',
    padding: '10px 16px',
    borderRadius: 8,
    fontWeight: 500,
    fontSize: 15,
    color: isActive ? '#6c47ff' : '#333',
    background: isActive ? '#f0ecff' : 'transparent',
    textDecoration: 'none',
  };
}

const s = {
  shell:     { display: 'flex', minHeight: '100vh' },
  sidebar:   { width: 220, background: '#fff', borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', padding: 20, gap: 8, flexShrink: 0 },
  logo:      { fontWeight: 700, fontSize: 18, cursor: 'pointer', marginBottom: 24 },
  nav:       { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
  bottom:    { borderTop: '1px solid #f0f0f0', paddingTop: 16 },
  userName:  { fontSize: 13, color: '#888', marginBottom: 8 },
  logoutBtn: { width: '100%', padding: '8px', border: '1px solid #eee', background: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  main:      { flex: 1, padding: 32, background: '#f9f9f9' },
};
