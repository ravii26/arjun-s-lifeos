import React from 'react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { Icons } from './Icons';
import { useApp } from '../context/AppContext';

const navItems = [
  { path: '/dashboard', label: 'Home', icon: Icons.home, locked: false },
  { path: '/focus', label: 'Focus', icon: Icons.focus, locked: false },
  { path: '/vault', label: 'Vault', icon: Icons.vault, locked: false },
  { path: '/learn', label: 'Learn', icon: Icons.learn, locked: false },
  { path: '/review', label: 'Review', icon: Icons.review, locked: true },
];

export const DesktopSidebar = () => {
  const { userName, day, theme, toggleTheme } = useApp();
  const location = useLocation();

  return (
    <aside style={{
      width: 220,
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      background: 'var(--surface-1)',
      borderRight: '0.5px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
        <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)' }}>LifeOS</span>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <RouterNavLink
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 10,
                textDecoration: 'none',
                color: active ? 'var(--primary)' : item.locked ? 'var(--text-muted)' : 'var(--text-muted)',
                fontWeight: active ? 500 : 400,
                fontSize: 14,
                background: active ? 'var(--primary-muted-bg)' : 'transparent',
                transition: 'background 150ms ease',
                opacity: item.locked ? 0.5 : 1,
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--surface-3)'; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <span style={{ display: 'flex' }}>{item.icon(active)}</span>
              <span>{item.label}</span>
              {item.locked && <span style={{ marginLeft: 'auto', display: 'flex' }}>{Icons.lock()}</span>}
            </RouterNavLink>
          );
        })}
      </nav>

      <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{userName}</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Day {day}</span>
        <button
          onClick={toggleTheme}
          className="interactive"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', borderRadius: 10, border: 'none',
            background: 'transparent', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer',
          }}
        >
          {theme === 'dark' ? Icons.sun() : Icons.moon()}
          <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        </button>
      </div>
    </aside>
  );
};

export const MobileTabBar = () => {
  const location = useLocation();

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 64,
      background: 'var(--surface-1)',
      borderTop: '0.5px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      zIndex: 50,
    }}>
      {navItems.map(item => {
        const active = location.pathname === item.path;
        return (
          <RouterNavLink
            key={item.path}
            to={item.path}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              textDecoration: 'none',
              color: active ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: 11,
              fontWeight: active ? 500 : 400,
              opacity: item.locked ? 0.4 : 1,
              transition: 'color 150ms ease',
            }}
          >
            {item.icon(active)}
            <span>{item.label}</span>
          </RouterNavLink>
        );
      })}
    </nav>
  );
};

export const MobileHeader = () => {
  const { toggleTheme, theme } = useApp();

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      position: 'sticky',
      top: 0,
      background: 'var(--background)',
      zIndex: 40,
      borderBottom: '0.5px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
        <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)' }}>LifeOS</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={toggleTheme}
          className="interactive"
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex' }}
        >
          {theme === 'dark' ? Icons.sun() : Icons.moon()}
        </button>
        <button
          className="interactive"
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex' }}
        >
          {Icons.more()}
        </button>
      </div>
    </header>
  );
};
