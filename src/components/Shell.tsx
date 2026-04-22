import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Home,
  Inbox,
  MessageSquare,
  Moon,
  Pause,
  Play,
  Settings2,
  Shield,
  Square,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { ActionConverterFAB } from "./ActionConverterFAB";
import { CoachPanel } from "./CoachPanel";
import { DumpSheet } from "./DumpSheet";
import { useNavigate } from "react-router-dom";

interface NavItem {
  to: string;
  label: string;
  Icon: LucideIcon;
}

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", Icon: Home },
  { to: "/focus", label: "Focus", Icon: CheckCircle2 },
  { to: "/vault", label: "Vault", Icon: Shield },
  { to: "/knowledge", label: "Knowledge", Icon: BookOpen },
  { to: "/skills", label: "Skills", Icon: BarChart3 },
  { to: "/statistics", label: "Stats", Icon: BarChart3 },
];

export const Shell = () => {
  const { state, dispatch } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [dumpOpen, setDumpOpen] = useState(false);
  const [coachOpen, setCoachOpen] = useState(false);
  const [coachPrefill, setCoachPrefill] = useState<string | undefined>(undefined);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseStartedAt, setPauseStartedAt] = useState<number | null>(null);
  const [pausedMs, setPausedMs] = useState(0);
  const [tickNow, setTickNow] = useState(Date.now());

  const toggleTheme = () => dispatch({ type: "TOGGLE_THEME" });

  const activeSession = useMemo(
    () => state.timeTrackerSessions.find((session) => session.id === state.activeTrackerSessionId) ?? null,
    [state.activeTrackerSessionId, state.timeTrackerSessions],
  );

  useEffect(() => {
    if (!activeSession) {
      setIsPaused(false);
      setPauseStartedAt(null);
      setPausedMs(0);
      return;
    }
    const id = window.setInterval(() => setTickNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [activeSession]);

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ message?: string }>;
      setCoachPrefill(custom.detail?.message);
      setCoachOpen(true);
    };

    window.addEventListener("lifeos:open-coach", handler as EventListener);
    return () => window.removeEventListener("lifeos:open-coach", handler as EventListener);
  }, []);

  const elapsedMs = useMemo(() => {
    if (!activeSession) return 0;
    const started = new Date(activeSession.startedAt).getTime();
    const pauseCarry = pausedMs + (isPaused && pauseStartedAt ? tickNow - pauseStartedAt : 0);
    return Math.max(tickNow - started - pauseCarry, 0);
  }, [activeSession, isPaused, pauseStartedAt, pausedMs, tickNow]);

  const elapsedLabel = useMemo(() => {
    const totalSec = Math.floor(elapsedMs / 1000);
    const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
    const s = String(totalSec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }, [elapsedMs]);

  const currentScreen = useMemo(() => {
    if (location.pathname.startsWith("/dashboard")) return "dashboard";
    if (location.pathname.startsWith("/focus")) return "focus";
    if (location.pathname.startsWith("/habits")) return "habits";
    if (location.pathname.startsWith("/knowledge")) return "knowledge";
    if (location.pathname.startsWith("/learn")) return "knowledge";
    if (location.pathname.startsWith("/skills")) return "skills";
    if (location.pathname.startsWith("/settings")) return "settings";
    if (location.pathname.startsWith("/vault")) return "vault";
    if (location.pathname.startsWith("/review")) return "review";
    if (location.pathname.startsWith("/areas")) return "area";
    return "lifeos";
  }, [location.pathname]);

  const contextSummary = useMemo(() => {
    const done = state.tasks.filter((task) => task.done).length;
    const total = state.tasks.length;
    return `${done}/${total} tasks done`;
  }, [state.tasks]);

  const unprocessedDumpCount = state.dumpItems.filter((item) => !item.processed).length;

  const togglePause = () => {
    if (!activeSession) return;
    if (!isPaused) {
      setIsPaused(true);
      setPauseStartedAt(Date.now());
      return;
    }
    const delta = pauseStartedAt ? Date.now() - pauseStartedAt : 0;
    setPausedMs((current) => current + Math.max(delta, 0));
    setPauseStartedAt(null);
    setIsPaused(false);
  };

  const stopSession = () => {
    if (!activeSession) return;
    dispatch({
      type: "END_TRACKER_SESSION",
      payload: {
        sessionId: activeSession.id,
        endedAt: new Date().toISOString(),
        durationSec: Math.floor(elapsedMs / 1000),
      },
    });
    setIsPaused(false);
    setPauseStartedAt(null);
    setPausedMs(0);
  };

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
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCoachOpen(true)}
                className="tap-scale hover-surface inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--s2)] text-[var(--text-2)]"
                aria-label="Open AI Coach"
              >
                <MessageSquare size={20} strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => navigate("/settings")}
                className="tap-scale hover-surface inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--s2)] text-[var(--text-2)]"
                aria-label="Open settings"
              >
                <Settings2 size={20} strokeWidth={1.5} />
              </button>
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
            className="tap-scale inline-flex h-9 w-9 items-center justify-center rounded-[10px] text-[var(--text-2)]"
            aria-label="Open AI Coach"
            onClick={() => setCoachOpen(true)}
          >
            <MessageSquare size={20} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            className="tap-scale inline-flex h-9 min-w-9 items-center justify-center rounded-[10px] px-2 text-[18px] tracking-[0.2em] text-[var(--text-2)]"
            aria-label="More options"
            onClick={() => navigate("/settings")}
          >
            ...
          </button>
        </div>
      </header>

      <main className={`pb-[calc(80px+env(safe-area-inset-bottom))] md:ml-[220px] md:pb-8 ${activeSession ? "pb-[calc(128px+env(safe-area-inset-bottom))]" : ""}`}>
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

      <ActionConverterFAB />

      <button
        type="button"
        aria-label="Open dump"
        onClick={() => setDumpOpen(true)}
        className="tap-scale fixed bottom-[148px] right-5 z-[90] inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-md)] bg-[var(--s2)] text-[var(--text-2)] transition-colors duration-150 hover:bg-[var(--s3)] md:bottom-[104px]"
      >
        <Inbox size={18} strokeWidth={1.5} />
        {unprocessedDumpCount > 0 ? <span className="absolute right-[6px] top-[6px] h-2 w-2 rounded-full bg-[#E0607E]" /> : null}
      </button>

      {activeSession ? (
        <div className="fixed bottom-[calc(64px+env(safe-area-inset-bottom))] left-0 right-0 z-40 border-t border-[var(--border-md)] bg-[var(--s1)] px-3 py-2 md:bottom-0 md:left-[220px]">
          <div className="mx-auto flex max-w-[980px] items-center gap-2 text-[11px] text-[var(--text-3)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#E0607E]" />
            <span>Tracking:</span>
            <span className="truncate text-[13px] font-medium text-[var(--text-1)]">{activeSession.label}</span>
            <span className="ml-auto text-[13px] font-medium text-[var(--text-1)]">{elapsedLabel}</span>
            {activeSession.areaId ? <span className="rounded-full bg-[var(--s3)] px-2 py-1 text-[11px]">{activeSession.areaId}</span> : null}
            <button type="button" className="tap-scale text-[var(--text-2)]" onClick={togglePause} aria-label={isPaused ? "Resume timer" : "Pause timer"}>
              {isPaused ? <Play size={18} strokeWidth={1.8} /> : <Pause size={18} strokeWidth={1.8} />}
            </button>
            <button type="button" className="tap-scale text-[var(--amber)]" onClick={stopSession} aria-label="Stop timer">
              <Square size={18} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      ) : null}

      <DumpSheet open={dumpOpen} onClose={() => setDumpOpen(false)} />
      <CoachPanel
        open={coachOpen}
        currentScreen={currentScreen}
        contextSummary={contextSummary}
        prefilledMessage={coachPrefill}
        onClose={() => setCoachOpen(false)}
      />
    </div>
  );
};
