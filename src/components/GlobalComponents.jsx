import React, { useEffect, useMemo, useState } from 'react';
import '../styles/design-system.css';
import './GlobalComponents.css';

const toastSeed = [
  { id: 1, type: 'SUCCESS', title: 'Task completed', desc: 'Career score updated +3', action: 'Undo' },
  { id: 2, type: 'ERROR', title: 'Sync failed', desc: 'Could not save note draft', action: '' },
  { id: 3, type: 'WARNING', title: 'Low energy trend', desc: 'Health score dropped below baseline', action: 'Review' },
  { id: 4, type: 'INFO', title: 'Session started', desc: 'Focus timer is running', action: '' },
  { id: 5, type: 'AI', title: 'AI suggestion', desc: 'Looks like a Habit from your dump', action: 'Convert' },
];

const emptyStates = [
  { icon: '☑', title: 'Nothing to execute today', body: "Add your 3 most important tasks. That's all you need.", cta: 'Add task' },
  { icon: '🔁', title: 'No habits yet', body: 'One good habit beats ten scattered intentions.', cta: 'Add your first habit' },
  { icon: '🔐', title: 'Your vault is empty', body: 'Save a quote, a memory, or a win. This is your personal fuel.', cta: 'Add to vault' },
  { icon: '📄', title: 'No notes yet', body: 'Every lesson consumed without a note is forgotten.', cta: 'Write a note' },
];

const GlobalComponents = () => {
  const [theme, setTheme] = useState('dark');
  const [toasts, setToasts] = useState(toastSeed.slice(0, 3));
  const [showConfirm, setShowConfirm] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetState, setSheetState] = useState('half');
  const [menuOpen, setMenuOpen] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(1532);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timers = toasts.map((toast) =>
      setTimeout(() => {
        setToasts((prev) => prev.filter((entry) => entry.id !== toast.id));
      }, 4000)
    );

    return () => timers.forEach((id) => clearTimeout(id));
  }, [toasts]);

  const mm = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
  const ss = String(timerSeconds % 60).padStart(2, '0');

  const addToast = () => {
    const next = toastSeed[Math.floor(Math.random() * toastSeed.length)];
    setToasts((prev) => [
      { ...next, id: Date.now() },
      ...prev,
    ].slice(0, 3));
  };

  const paletteResults = useMemo(
    () => ({
      recent: ['Completed Deep Work Session', 'Logged workout', 'Converted dump to task'],
      tasks: ['Finish onboarding polish', 'Review investment notes'],
      habits: ['Morning walk', '20 min learning'],
      quick: ['Add task', 'Start timer', 'Open Vault'],
    }),
    []
  );

  return (
    <div className={`global-showcase ${theme}`}>
      <header className="global-head">
        <h1>Global Components</h1>
        <div className="head-buttons">
          <button className="btn ghost" onClick={addToast}>Push Toast</button>
          <button className="btn ghost" onClick={() => setShowConfirm(true)}>Open Dialog</button>
          <button className="btn ghost" onClick={() => setPaletteOpen(true)}>⌘K Palette</button>
          <button className="btn ghost" onClick={() => setSheetOpen(true)}>Open Sheet</button>
          <button className="btn toggle" onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}>
            <span className={`toggle-icon ${theme}`}>{theme === 'dark' ? '🌙' : '☀️'}</span>
            Theme: {theme}
          </button>
        </div>
      </header>

      <section>
        <h2>1. Toast Notifications</h2>
        <div className="toast-stack">
          {toasts.map((toast) => (
            <article className={`toast ${toast.type.toLowerCase()}`} key={toast.id}>
              <div className="toast-icon">{toast.type === 'SUCCESS' ? '✓' : toast.type === 'ERROR' ? '×' : toast.type === 'WARNING' ? '⚠' : toast.type === 'INFO' ? 'ℹ' : '✦'}</div>
              <div className="toast-copy">
                <strong>{toast.title}</strong>
                <p>{toast.desc}</p>
              </div>
              {toast.action && <button className="link-btn">{toast.action}</button>}
              <button className="close" onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}>✕</button>
              <div className="toast-progress" />
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>2. Confirmation Dialogs</h2>
        <div className="card-grid">
          <article className="demo-card">
            <h3>Destructive</h3>
            <p>Delete vault item permanently</p>
            <div className="row"><button className="btn ghost">Cancel</button><button className="btn danger">Delete</button></div>
          </article>
          <article className="demo-card">
            <h3>Confirm</h3>
            <p>Archive 9 processed dump items</p>
            <div className="row"><button className="btn ghost">Cancel</button><button className="btn accent">Confirm</button></div>
          </article>
        </div>
      </section>

      <section>
        <h2>3. Loading Skeletons</h2>
        <div className="card-grid">
          <div className="skeleton task" />
          <div className="skeleton habit" />
          <div className="skeleton area" />
        </div>
      </section>

      <section>
        <h2>4. Empty States</h2>
        <div className="card-grid four">
          {emptyStates.map((state) => (
            <article className="empty-card" key={state.title}>
              <span>{state.icon}</span>
              <h3>{state.title}</h3>
              <p>{state.body}</p>
              <button className="btn accent">{state.cta}</button>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>5. Command Palette</h2>
        <article className="palette-preview">
          <input placeholder="Search tasks, habits, type a command..." />
          <div className="palette-groups">
            <div><strong>RECENT</strong>{paletteResults.recent.map((item) => <p key={item}>• {item}</p>)}</div>
            <div><strong>TASKS</strong>{paletteResults.tasks.map((item) => <p key={item}>• {item}</p>)}</div>
            <div><strong>HABITS</strong>{paletteResults.habits.map((item) => <p key={item}>• {item}</p>)}</div>
            <div><strong>QUICK ACTIONS</strong>{paletteResults.quick.map((item) => <p key={item}>• {item}</p>)}</div>
          </div>
        </article>
      </section>

      <section>
        <h2>6. Bottom Sheets</h2>
        <div className="row">
          {['peek', 'half', 'full'].map((state) => (
            <button key={state} className={`btn ghost ${sheetState === state ? 'active' : ''}`} onClick={() => setSheetState(state)}>{state}</button>
          ))}
          <button className="btn ghost" onClick={() => setSheetOpen(true)}>Show mobile sheet</button>
        </div>
      </section>

      <section>
        <h2>7. Contextual Menus</h2>
        <div className="row">
          <button className="btn ghost" onClick={() => setMenuOpen((prev) => !prev)}>Toggle Menu</button>
          {menuOpen && (
            <div className="context-menu">
              <button>✎ Edit</button>
              <button>⎘ Duplicate</button>
              <hr />
              <button className="danger-text">🗑 Delete</button>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2>8. Progress States</h2>
        <div className="card-grid">
          <article className="demo-card">
            <h3>Timer Running</h3>
            <div className="timer-pill"><span className="pulse" /> Portfolio Rewrite · {mm}:{ss}</div>
          </article>
          <article className="demo-card">
            <h3>Session Complete</h3>
            <p>2h 15m logged to Career ✓</p>
          </article>
          <article className="demo-card">
            <h3>Score Update</h3>
            <p className="score">41 → 44</p>
          </article>
        </div>
      </section>

      <section>
        <h2>9. Error States</h2>
        <div className="card-grid">
          <article className="error-card"><h3>📶 Can&apos;t connect</h3><button className="btn ghost">Retry</button></article>
          <article className="error-card"><h3>⚠ Something went wrong</h3><details><summary>Technical detail</summary>Fetch timeout after 10s.</details><button className="btn ghost">Retry</button></article>
          <article className="error-card"><h3>No results for "focus matrix"</h3><p>Try removing filters or checking spelling.</p></article>
        </div>
      </section>

      {showConfirm && (
        <div className="modal-backdrop" onClick={() => setShowConfirm(false)}>
          <div className="confirm-modal" onClick={(event) => event.stopPropagation()}>
            <div className="icon">⚠</div>
            <h3>Delete this vault item?</h3>
            <p>This action cannot be undone. The item and usage history will be removed permanently.</p>
            <div className="row">
              <button className="btn ghost" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="btn danger" onClick={() => setShowConfirm(false)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {paletteOpen && (
        <div className="palette-backdrop" onClick={() => setPaletteOpen(false)}>
          <div className="palette-modal" onClick={(event) => event.stopPropagation()}>
            <input autoFocus placeholder="Search tasks, habits, type a command..." />
            <div className="palette-groups compact">
              <div><strong>RECENT</strong>{paletteResults.recent.map((item) => <p key={item}>{item}</p>)}</div>
              <div><strong>QUICK ACTIONS</strong>{paletteResults.quick.map((item) => <p key={item}>{item}</p>)}</div>
            </div>
          </div>
        </div>
      )}

      {sheetOpen && (
        <div className="sheet-backdrop" onClick={() => setSheetOpen(false)}>
          <div className={`bottom-sheet ${sheetState}`} onClick={(event) => event.stopPropagation()}>
            <div className="handle" />
            <h3>Universal Mobile Sheet</h3>
            <p>Drag state: {sheetState}</p>
            <button className="btn ghost" onClick={() => setSheetOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalComponents;
