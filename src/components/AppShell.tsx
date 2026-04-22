import React, { useState } from 'react';
import './design-system.css';
import { Icon, LucideIcon } from 'lucide-react'; // Assuming Lucide icons are installed

const AppShell = ({ children, pageTitle }) => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isTimerRunning, setTimerRunning] = useState(true); // Example state for timer

  return (
    <div className="app-shell" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: isSidebarCollapsed ? '56px' : '240px',
          backgroundColor: 'var(--bg)',
          borderRight: '1px solid var(--border)',
          transition: 'width 250ms ease-out',
          position: 'fixed',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Section */}
        <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border)' }}>
          {isSidebarCollapsed ? (
            <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--accent)', borderRadius: '50%' }}></div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--accent)', borderRadius: '50%' }}></div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>LifeOS</span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav style={{ flexGrow: 1, padding: 'var(--space-4)' }}>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Execution</span>
            <NavItem icon="grid" label="Dashboard" isCollapsed={isSidebarCollapsed} />
            <NavItem icon="check-square" label="Tasks" isCollapsed={isSidebarCollapsed} />
            <NavItem icon="repeat" label="Habits" isCollapsed={isSidebarCollapsed} />
            <NavItem icon="calendar" label="Calendar" isCollapsed={isSidebarCollapsed} />
          </div>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Growth</span>
            <NavItem icon="book-open" label="Learn" isCollapsed={isSidebarCollapsed} />
            <NavItem icon="pie-chart" label="Areas" isCollapsed={isSidebarCollapsed} />
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Support</span>
            <NavItem icon="lock" label="Vault" isCollapsed={isSidebarCollapsed} />
            <NavItem icon="inbox" label="Dump" isCollapsed={isSidebarCollapsed} />
          </div>
        </nav>

        {/* Bottom Section */}
        <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--border)' }}>
          {isTimerRunning && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--accent-dim)', padding: '4px 8px', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--accent)' }}>00:25:32</span>
              <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--accent)', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
            </div>
          )}
          <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}>
            {isSidebarCollapsed ? 'Expand' : 'Collapse'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ marginLeft: isSidebarCollapsed ? '56px' : '240px', flexGrow: 1, overflowY: 'auto' }}>
        {/* Top Bar */}
        <header
          style={{
            height: '56px',
            position: 'sticky',
            top: 0,
            backgroundColor: 'var(--bg)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 var(--space-4)',
          }}
        >
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>{pageTitle}</h1>
          <input
            type="text"
            placeholder="Search tasks, habits, notes..."
            style={{
              width: '320px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '0 var(--space-4)',
              fontFamily: 'var(--font-ui)',
              fontSize: '14px',
              color: 'var(--text-primary)',
            }}
          />
        </header>

        {/* Content Area */}
        <main style={{ padding: '32px' }}>{children}</main>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, isCollapsed }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 12px',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      color: 'var(--text-muted)',
      transition: 'background-color 150ms ease',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
  >
    <Icon name={icon} size={20} color="var(--text-muted)" iconNode={[]} />
    {!isCollapsed && <span style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--text-secondary)' }}>{label}</span>}
  </div>
);

export default AppShell;