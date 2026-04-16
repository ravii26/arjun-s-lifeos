import * as React from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Archive,
  BarChart3,
  BookOpen,
  CheckSquare,
  Flame,
  LayoutDashboard,
  Menu,
  Moon,
  PanelLeftClose,
  Sparkles,
  Sun,
} from 'lucide-react';
import { useApp } from '@/context/appState';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const navigation = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/focus', label: 'Focus', icon: CheckSquare },
  { to: '/habits', label: 'Habits', icon: Flame },
  { to: '/learn', label: 'Learn', icon: BookOpen },
  { to: '/vault', label: 'Vault', icon: Archive },
  { to: '/review', label: 'Review', icon: BarChart3 },
];

function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { state, dispatch } = useApp();
  const Icon = state.theme === 'dark' ? Sun : Moon;

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
      className={cn(
        'interactive flex items-center justify-center rounded-full border border-transparent text-[var(--t2)]',
        compact ? 'h-9 w-9 bg-[var(--s2)]' : 'h-10 w-10 bg-[var(--s1)]',
      )}
    >
      <Icon size={20} strokeWidth={1.5} />
    </button>
  );
}

function DesktopSidebar() {
  const { state } = useApp();
  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-[220px] flex-col border-r border-[var(--border)] bg-[var(--s1)] px-4 py-4 text-[13px] text-[var(--t2)]">
      <div className="mb-6 flex items-center gap-2 px-2 text-[16px] font-medium text-[var(--t1)]">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)] text-[8px] text-white">
          <Sparkles size={10} strokeWidth={2} />
        </span>
        LifeOS
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navigation.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'interactive flex h-10 items-center gap-3 rounded-[10px] px-3 font-normal transition-colors duration-150',
                isActive
                  ? 'bg-[var(--primary-bg)] text-[var(--primary)]'
                  : 'text-[var(--t3)] hover:bg-[var(--s3)] hover:text-[var(--t1)]',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={1.5} fill={isActive ? 'currentColor' : 'none'} />
                <span className={isActive ? 'font-medium' : 'font-normal'}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 border-t border-[var(--border)] pt-4">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary-bg)] text-[12px] font-medium text-[var(--primary)]">
            AM
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-medium text-[var(--t1)]">Arjun Mehta</div>
            <div className="text-[11px] text-[var(--t3)]">Day 47</div>
          </div>
          <ThemeToggle compact />
        </div>
      </div>
    </aside>
  );
}

function MobileHeader() {
  const { state } = useApp();
  return (
    <header className="sticky top-0 z-30 flex h-[52px] items-center justify-between border-b border-[var(--border)] bg-[var(--s1)] px-4 text-[14px] font-medium text-[var(--t1)]">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)] text-[8px] text-white">
          <Sparkles size={10} strokeWidth={2} />
        </span>
        LifeOS
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle compact />
        <button type="button" className="interactive flex h-9 w-9 items-center justify-center rounded-full bg-[var(--s2)] text-[var(--t2)]">
          <Menu size={20} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}

function MobileTabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-[64px] items-stretch border-t border-[var(--border)] bg-[var(--s1)] pb-[env(safe-area-inset-bottom)]">
      {navigation.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center justify-center gap-1 text-[10px] transition-colors duration-150',
              isActive ? 'font-medium text-[var(--primary)]' : 'font-normal text-[var(--t3)]',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={20} strokeWidth={1.5} fill={isActive ? 'currentColor' : 'none'} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export function Shell() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { state } = useApp();

  React.useEffect(() => {
    document.title = `LifeOS · ${location.pathname.replace('/', '').replace('-', ' ') || 'dashboard'}`;
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--t1)] transition-colors duration-300">
      {isMobile ? <MobileHeader /> : <DesktopSidebar />}

      <main
        className={cn(
          'min-h-screen',
          isMobile ? 'px-4 pb-20 pt-4' : 'ml-[220px] px-8 py-8',
        )}
      >
        <div className={cn('mx-auto w-full', isMobile ? 'max-w-none' : 'max-w-[680px]')}> 
          <Outlet context={{ state }} />
        </div>
      </main>

      {isMobile ? <MobileTabBar /> : null}
    </div>
  );
}

export function DesktopShellSpacer() {
  return <div className="h-0" />;
}
