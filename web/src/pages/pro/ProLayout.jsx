import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV = [
  { to: '/pro/agenda',        label: 'Agenda' },
  { to: '/pro/services',      label: 'Services' },
  { to: '/pro/working-hours', label: 'Working hours' },
  { to: '/pro/profile',       label: 'My profile' },
];

export default function ProLayout() {
  const { user, logout } = useAuth();

  return (
    <div style={s.shell}>
      <aside style={s.sidebar}>
        <div style={s.brand}>NMN</div>
        <p style={s.brandSub}>Pro dashboard</p>

        <nav style={s.nav}>
          {NAV.map(({ to, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({ ...s.link, ...(isActive ? s.linkActive : {}) })}>
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
  shell:      { display: 'flex', minHeight: '100vh', background: 'var(--cream)' },
  sidebar:    { width: 220, background: 'var(--white)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '32px 16px 24px', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' },
  brand:      { fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, color: 'var(--gold)', letterSpacing: 4, paddingLeft: 4, marginBottom: 2 },
  brandSub:   { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', paddingLeft: 4, marginBottom: 32 },
  nav:        { display: 'flex', flexDirection: 'column', gap: 2, flex: 1 },
  link:       { display: 'block', padding: '9px 12px', borderRadius: 6, fontSize: 14, fontWeight: 500, color: 'var(--ink-light)', textDecoration: 'none', transition: 'all .15s', letterSpacing: '.01em' },
  linkActive: { color: 'var(--ink)', background: 'var(--cream-dark)', fontWeight: 600 },
  bottom:     { borderTop: '1px solid var(--border)', paddingTop: 16 },
  userRow:    { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  userAvatar: { width: 34, height: 34, borderRadius: '50%', background: 'var(--gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, flexShrink: 0 },
  userName:   { fontSize: 13, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 },
  userRole:   { fontSize: 11, color: 'var(--muted)' },
  logoutBtn:  { width: '100%', padding: '8px', border: '1px solid var(--border)', background: 'transparent', borderRadius: 6, fontSize: 13, color: 'var(--muted)', cursor: 'pointer' },
  main:       { flex: 1, padding: 36, maxWidth: 900 },
};
