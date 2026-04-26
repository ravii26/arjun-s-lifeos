import React, { useState, useEffect } from 'react';
import '../styles/design-system.css';
import * as Icons from 'lucide-react'; // Import all icons as a single object
import { NavLink } from 'react-router-dom';
import './AppShell.css';
import CommandPalette from './CommandPalette';
import { useAppContext } from '../context/AppContext';

const NAV_GROUPS = [
  {
    title: 'Execution',
    items: [
      { icon: Icons.LayoutGrid, label: 'Dashboard', path: '/dashboard' },
      { icon: Icons.CheckSquare, label: 'Tasks', path: '/tasks' },
      { icon: Icons.Repeat, label: 'Habits', path: '/habits' },
      { icon: Icons.Calendar, label: 'Calendar', path: '/calendar' },
    ],
  },
  {
    title: 'Growth',
    items: [
      { icon: Icons.BookOpen, label: 'Learn', path: '/learn' },
      { icon: Icons.PieChart, label: 'Areas', path: '/areas' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: Icons.Lock, label: 'Vault', path: '/vault' },
      { icon: Icons.Inbox, label: 'Dump', path: '/dump' },
      { icon: Icons.Settings, label: 'Settings', path: '/settings' },
    ],
  },
];

const AppShell = ({ children, pageTitle }: { children: React.ReactNode; pageTitle: string }) => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);
  const [isTimerRunning, setTimerRunning] = useState(true); // Example state for timer
  const [isCmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  
  const { currentVibe, setVibe, toasts, removeToast } = useAppContext();

  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  return (
    <div className="app-shell">
      <div
        className={`shell-overlay ${isMobileNavOpen ? 'open' : ''}`}
        onClick={() => setMobileNavOpen(false)}
      />

      <aside
        className={`shell-sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileNavOpen ? 'mobile-open' : ''}`}
      >
        <div className="sidebar-top">
          {isSidebarCollapsed ? (
            <div className="logo-dot" />
          ) : (
            <div className="logo-wrap">
              <div className="logo-dot" />
              <span>LifeOS</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="nav-group">
              <span className="group-title">{group.title}</span>
              {group.items.map((item) => (
                <NavItem
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  path={item.path}
                  isCollapsed={isSidebarCollapsed}
                  onNavigate={() => setMobileNavOpen(false)}
                />
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          {isTimerRunning && (
            <div className="mini-timer">
              <span>00:25:32</span>
              <div className="pulse-dot" />
            </div>
          )}

          <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}>
            {isSidebarCollapsed ? 'Expand' : 'Collapse'}
          </button>
        </div>
      </aside>

      <div className={`shell-main ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <header className="shell-topbar">
          <div className="left-actions">
            <button className="mobile-menu-btn" onClick={() => setMobileNavOpen(true)}>☰</button>
            <h1>{pageTitle}</h1>
          </div>

          <div className="topbar-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select 
              value={currentVibe} 
              onChange={(e) => setVibe(e.target.value)}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '0 10px',
                height: '36px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-ui)',
                fontSize: '13px',
                outline: 'none'
              }}
            >
              <option value="default">Default Vibe</option>
              <option value="morning">Morning Routine</option>
              <option value="deepWork">Deep Work</option>
              <option value="evening">Evening Wind-Down</option>
            </select>

            <button 
                title="Toggle Focus Mode (Sidebar)"
                style={{ 
                  background: isSidebarCollapsed ? 'var(--accent-dim)' : 'transparent', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '0 10px', 
                  height: '36px', 
                  color: isSidebarCollapsed ? 'var(--accent)' : 'var(--text-secondary)', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px' 
                }}
                onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
            >
              <Icons.Focus size={16} />
              <span style={{ fontSize: '13px', fontFamily: 'var(--font-ui)' }}>Focus Mode</span>
            </button>
            <input 
              type="text" 
              placeholder="Search tasks, habits, notes... (Cmd+K)" 
              className="shell-search" 
              readOnly 
              style={{ cursor: 'pointer' }}
              onClick={() => setCmdPaletteOpen(true)}
            />
          </div>
        </header>

        <main className="app-main-content page-enter">{children}</main>
      </div>

      <CommandPalette isOpen={isCmdPaletteOpen} onClose={() => setCmdPaletteOpen(false)} />

      {/* Global Toasts Overlay */}
      <div className="toast-overlay">
        {toasts.map((toast) => (
          <article className={`toast-card toast-${toast.type.toLowerCase()}`} key={toast.id}>
            <div className="toast-icon">
              {toast.type === 'SUCCESS' ? '✓' : toast.type === 'ERROR' ? '×' : toast.type === 'WARNING' ? '⚠' : toast.type === 'INFO' ? 'ℹ' : '✦'}
            </div>
            <div className="toast-body">
              <strong>{toast.title}</strong>
              <p>{toast.desc}</p>
            </div>
            {toast.action && (
              <button 
                className="toast-action" 
                onClick={() => {
                  toast.onAction?.();
                  removeToast(toast.id);
                }}
              >
                {toast.action}
              </button>
            )}
            <button className="toast-close" onClick={() => removeToast(toast.id)}>✕</button>
            <div className="toast-timer-bar" />
          </article>
        ))}
      </div>
    </div>
  );
};

const NavItem = ({ icon: IconComponent, label, path, isCollapsed, onNavigate }: { icon: React.ComponentType<{ size?: string | number; color?: string }>; label: string; path: string; isCollapsed: boolean; onNavigate: () => void }) => {

  return (
    <NavLink
      to={path}
      onClick={onNavigate}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 12px',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        textDecoration: 'none',
        backgroundColor: isActive ? 'var(--surface-hover)' : 'transparent',
        color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
        transition: 'background-color 150ms ease',
        marginTop: '4px',
        minHeight: '38px',
      })}
    >
      <IconComponent size={20} color="currentColor" />
      {!isCollapsed && <span style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'currentColor' }}>{label}</span>}
    </NavLink>
  );
};

export default AppShell;