import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Home,
  Moon,
  Shield,
  Sun,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

interface NavItem {
  to: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string; fill?: string }>;
}

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", Icon: Home },
  { to: "/focus", label: "Focus", Icon: CheckCircle2 },
  { to: "/vault", label: "Vault", Icon: Shield },
  { to: "/learn", label: "Learn", Icon: BookOpen },
  { to: "/review", label: "Review", Icon: BarChart3 },
];

export const Shell = () => {
  const { state, dispatch } = useAppContext();

  const toggleTheme = () => dispatch({ type: "TOGGLE_THEME" });

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-1)]">
      <aside className="fixed left-0 top-0 hidden h-screen w-[220px] border-r border-[var(--border)] bg-[var(--s1)] md:flex md:flex-col">
        <div className="px-5 py-6">
          <h1 className="flex items-center gap-2 text-section text-[var(--text-1)]">
            <span>LifeOS</span>
            <span className="h-[6px] w-[6px] rounded-full bg-[var(--primary)]" aria-hidden="true" />
          </h1>
        </div>

        <nav className="flex-1 px-3">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `hover-surface mt-1 flex items-center gap-3 rounded-[8px] px-3 py-2 transition-colors ${
                  isActive ? "text-[var(--primary)]" : "text-[var(--text-3)]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={20}
                    strokeWidth={1.5}
                    fill={isActive ? "currentColor" : "none"}
                    className={isActive ? "opacity-100" : "opacity-80"}
                  />
                  <span className={isActive ? "text-[14px] font-medium" : "text-[14px] font-normal"}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[var(--border)] px-5 py-4">
          <p className="text-[13px] font-medium text-[var(--text-1)]">Arjun Mehta</p>
          <div className="mt-1 flex items-center justify-between">
            <p className="text-[11px] text-[var(--text-3)]">Day 47</p>
            <button
              type="button"
              onClick={toggleTheme}
              className="tap-scale hover-surface inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--s2)] text-[var(--text-2)]"
              aria-label="Toggle theme"
            >
              {state.theme === "dark" ? (
                <Sun size={20} strokeWidth={1.5} />
              ) : (
                <Moon size={20} strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-[52px] items-center justify-between border-b border-[var(--border)] bg-[var(--s1)] px-4 md:hidden">
        <span className="text-section text-[var(--text-1)]">LifeOS</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            className="tap-scale inline-flex h-9 w-9 items-center justify-center rounded-[10px] text-[var(--text-2)]"
            aria-label="Toggle theme"
          >
            {state.theme === "dark" ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
          </button>
          <button
            type="button"
            className="tap-scale inline-flex h-9 min-w-9 items-center justify-center rounded-[10px] px-2 text-[18px] tracking-[0.2em] text-[var(--text-2)]"
            aria-label="More options"
          >
            ···
          </button>
        </div>
      </header>

      <main className="pb-[calc(80px+env(safe-area-inset-bottom))] md:ml-[220px] md:pb-8">
        <div className="mx-auto max-w-[680px] px-4 py-4 md:px-8 md:py-8">
          <Outlet />
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-[var(--border)] bg-[var(--s1)] px-2 pb-[env(safe-area-inset-bottom)] md:hidden">
        <ul className="flex h-[64px] items-center justify-around">
          {navItems.map(({ to, label, Icon }) => (
            <li key={to}>
              <NavLink to={to} className="tap-scale inline-flex min-w-[56px] flex-col items-center gap-1">
                {({ isActive }) => (
                  <>
                    <Icon size={20} strokeWidth={1.5} fill={isActive ? "currentColor" : "none"} className={isActive ? "text-[var(--primary)]" : "text-[var(--text-3)]"} />
                    <span className={`text-[11px] ${isActive ? "font-medium text-[var(--primary)]" : "font-normal text-[var(--text-3)]"}`}>
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
