import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '../styles/design-system.css';
import './Calendar.css';

const AREA_COLORS = {
  Career: 'var(--blue)',
  Health: 'var(--teal)',
  Mind: 'var(--purple)',
  Finance: 'var(--accent)',
};

const AREAS = ['Career', 'Health', 'Mind', 'Finance'];
const SOURCES = ['manual', 'task', 'habit'];
const STATUSES = ['Planned', 'Completed', 'Missed'];
const HOURS = Array.from({ length: 18 }).map((_, i) => i + 6);
const HOUR_HEIGHT = 72;
const STORE_KEY = 'lifeos.calendar.v1';

const toId = () => Date.now() + Math.floor(Math.random() * 100000);

const fmt = (date) => date.toISOString().slice(0, 10);

const dayName = (date) => date.toLocaleDateString('en-US', { weekday: 'long' });
const shortDay = (date) => date.toLocaleDateString('en-US', { weekday: 'short' });
const monthDay = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const toMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return (h - 6) * 60 + m;
};

const minutesToTime = (mins) => {
  const totalMins = mins + 6 * 60;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const loadStore = () => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
};

const saveStore = (data) => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
};

const getDefaultBlocks = () => [
  { id: 1, title: 'Deep Work', area: 'Career', start: '09:00', end: '11:00', source: 'task', status: 'Planned', date: fmt(new Date()) },
  { id: 2, title: 'Workout', area: 'Health', start: '17:00', end: '18:00', source: 'habit', status: 'Completed', date: fmt(new Date()) },
  { id: 3, title: 'Reading', area: 'Mind', start: '20:00', end: '21:00', source: 'manual', status: 'Missed', date: fmt(new Date()) },
];

const getDefaultSessions = () => [
  { id: 1, title: 'Deep Work Session', area: 'Career', start: '09:15', end: '10:45', date: fmt(new Date()) },
  { id: 2, title: 'Evening Workout', area: 'Health', start: '17:10', end: '17:50', date: fmt(new Date()) },
];

const useCountUp = (target, duration = 600) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const end = Number.isFinite(target) ? target : 0;
    if (end <= 0) { setValue(0); return; }
    let frame = null;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      setValue(Math.round(end * p));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { if (frame) cancelAnimationFrame(frame); };
  }, [target, duration]);
  return value;
};

const Calendar = () => {
  const persisted = useMemo(() => loadStore(), []);
  const [blocks, setBlocks] = useState(persisted?.blocks || getDefaultBlocks());
  const [sessions, setSessions] = useState(persisted?.sessions || getDefaultSessions());

  const [view, setView] = useState('Day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const today = fmt(new Date());
  const dateStr = fmt(selectedDate);

  // Modal state
  const [blockModal, setBlockModal] = useState(null); // null or block object (id===null = create)
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Live timer
  const [liveTimer, setLiveTimer] = useState(null); // { title, area, startedAt }
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  // Persist
  useEffect(() => {
    saveStore({ blocks, sessions });
  }, [blocks, sessions]);

  // Timer tick
  useEffect(() => {
    if (!liveTimer) { setElapsed(0); return; }
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - liveTimer.startedAt) / 1000));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [liveTimer]);

  // Date navigation
  const goDay = (offset) => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + offset);
      return d;
    });
  };

  const isToday = dateStr === today;

  // Week helpers
  const weekDates = useMemo(() => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((day + 6) % 7));
    return Array.from({ length: 7 }).map((_, i) => {
      const dd = new Date(monday);
      dd.setDate(monday.getDate() + i);
      return dd;
    });
  }, [selectedDate]);

  // Filtered data
  const dayBlocks = blocks.filter((b) => b.date === dateStr);
  const daySessions = sessions.filter((s) => s.date === dateStr);

  // Stats
  const plannedMinutes = dayBlocks.reduce((s, b) => s + Math.max(0, toMinutes(b.end) - toMinutes(b.start)), 0);
  const actualMinutes = daySessions.reduce((s, b) => s + Math.max(0, toMinutes(b.end) - toMinutes(b.start)), 0);
  const plannedHours = plannedMinutes / 60;
  const actualHours = actualMinutes / 60;
  const alignmentPct = Math.min(100, Math.round((actualMinutes / Math.max(plannedMinutes, 1)) * 100));
  const completedCount = dayBlocks.filter((b) => b.status === 'Completed').length;
  const missedCount = dayBlocks.filter((b) => b.status === 'Missed').length;

  const animPlanned = useCountUp(dayBlocks.length, 650);
  const animCompleted = useCountUp(completedCount, 650);
  const animAlignment = useCountUp(alignmentPct, 650);

  // Current time indicator
  const now = new Date();
  const nowY = Math.max(0, (now.getHours() - 6) * HOUR_HEIGHT + (now.getMinutes() / 60) * HOUR_HEIGHT);

  // Block CRUD
  const openCreateBlock = () => {
    const currentHour = Math.max(6, Math.min(22, new Date().getHours()));
    setBlockModal({
      id: null,
      title: '',
      area: 'Career',
      start: `${String(currentHour).padStart(2, '0')}:00`,
      end: `${String(Math.min(23, currentHour + 1)).padStart(2, '0')}:00`,
      source: 'manual',
      status: 'Planned',
      date: dateStr,
    });
  };

  const openEditBlock = (block) => setBlockModal({ ...block });

  const saveBlock = () => {
    if (!blockModal?.title?.trim()) return;
    if (blockModal.id === null) {
      setBlocks((prev) => [...prev, { ...blockModal, id: toId() }]);
    } else {
      setBlocks((prev) => prev.map((b) => (b.id === blockModal.id ? blockModal : b)));
    }
    setBlockModal(null);
  };

  const deleteBlock = (id) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setBlockModal(null);
  };

  const cycleStatus = (block) => {
    const idx = STATUSES.indexOf(block.status);
    const next = STATUSES[(idx + 1) % STATUSES.length];
    setBlocks((prev) => prev.map((b) => (b.id === block.id ? { ...b, status: next } : b)));
  };

  // Timer
  const startTimer = () => {
    setLiveTimer({
      title: 'Focus Session',
      area: 'Career',
      startedAt: Date.now(),
    });
  };

  const stopTimer = () => {
    if (!liveTimer) return;
    const startDate = new Date(liveTimer.startedAt);
    const endDate = new Date();
    const startStr = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
    const endStr = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
    setSessions((prev) => [
      ...prev,
      {
        id: toId(),
        title: liveTimer.title,
        area: liveTimer.area,
        start: startStr,
        end: endStr,
        date: fmt(startDate),
      },
    ]);
    setLiveTimer(null);
  };

  const fmtElapsed = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Render a single day timeline
  const renderDayTimeline = useCallback((dayDate, compact = false) => {
    const ds = fmt(dayDate);
    const dBlocks = blocks.filter((b) => b.date === ds);
    const dSessions = sessions.filter((s) => s.date === ds);
    const isCurrentDay = ds === today;

    return (
      <div className={`timeline ${compact ? 'compact' : ''}`} key={ds}>
        {HOURS.map((h) => (
          <div key={h} className="timeline-line" style={{ height: compact ? 40 : HOUR_HEIGHT }} />
        ))}

        {dBlocks.map((block) => {
          const top = (toMinutes(block.start) / 60) * (compact ? 40 : HOUR_HEIGHT);
          const height = Math.max(compact ? 20 : 32, ((toMinutes(block.end) - toMinutes(block.start)) / 60) * (compact ? 40 : HOUR_HEIGHT));
          return (
            <article
              key={block.id}
              className={`block ${block.status.toLowerCase()}`}
              style={{ top, height, borderLeftColor: AREA_COLORS[block.area], background: `${AREA_COLORS[block.area]}18` }}
              onClick={() => !compact && openEditBlock(block)}
              title={compact ? `${block.title}  ${block.start}-${block.end}` : undefined}
            >
              {!compact && (
                <>
                  <div className="block-top-row">
                    <span className="block-chip" onClick={(e) => { e.stopPropagation(); cycleStatus(block); }}>{block.status}</span>
                    <small className="block-source">{block.source}</small>
                  </div>
                  <strong>{block.title}</strong>
                  <p>{block.start} – {block.end}</p>
                </>
              )}
              {compact && <span className="block-compact-label">{block.title}</span>}
            </article>
          );
        })}

        {!compact && dSessions.map((session) => {
          const top = (toMinutes(session.start) / 60) * HOUR_HEIGHT;
          const height = Math.max(32, ((toMinutes(session.end) - toMinutes(session.start)) / 60) * HOUR_HEIGHT);
          return (
            <article
              key={`s-${session.id}`}
              className="session"
              style={{ top, height, borderLeftColor: AREA_COLORS[session.area], background: `${AREA_COLORS[session.area]}2b` }}
            >
              <span className="block-chip session-chip">Actual</span>
              <strong>{session.title}</strong>
              <p>{session.start} – {session.end}</p>
            </article>
          );
        })}

        {isCurrentDay && !compact && (
          <div className="now-line" style={{ top: nowY }}>
            <span />
          </div>
        )}
      </div>
    );
  }, [blocks, sessions, today, nowY]);

  return (
    <div className="calendar-screen">
      {/* ── Header ── */}
      <header className="calendar-head">
        <div>
          <h1>Calendar</h1>
          <p className="cal-subtitle">
            {dayName(selectedDate)} · {monthDay(selectedDate)}
            {isToday && <span className="today-badge">Today</span>}
          </p>
        </div>
        <div className="cal-head-right">
          <div className="date-nav">
            <button className="btn" onClick={() => goDay(-1)}>‹</button>
            <button className="btn" onClick={() => setSelectedDate(new Date())} disabled={isToday}>Today</button>
            <button className="btn" onClick={() => goDay(1)}>›</button>
          </div>
          <div className="toggle-row">
            {['Day', 'Week'].map((v) => (
              <button key={v} className={`btn ${view === v ? 'active' : ''}`} onClick={() => setView(v)}>{v}</button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Stats ── */}
      <section className="calendar-snapshot-grid">
        <article className="calendar-snapshot-card">
          <small>Planned blocks</small>
          <strong>{animPlanned}</strong>
          <span>{plannedHours.toFixed(1)}h planned</span>
        </article>
        <article className="calendar-snapshot-card">
          <small>Completed</small>
          <strong>{animCompleted}</strong>
          <span>{completedCount}/{dayBlocks.length}</span>
        </article>
        <article className="calendar-snapshot-card">
          <small>Alignment</small>
          <strong>{animAlignment}%</strong>
          <span>{actualHours.toFixed(1)}h actual</span>
        </article>
        <article className="calendar-snapshot-card">
          <small>Missed</small>
          <strong>{missedCount}</strong>
          <span>needs recovery</span>
        </article>
      </section>

      {/* ── Day View ── */}
      {view === 'Day' && (
        <div className="calendar-grid">
          <aside className="time-col">
            <div className="time-col-head">Timeline</div>
            {HOURS.map((h) => (
              <div key={h} className="time-cell">{h}:00</div>
            ))}
          </aside>

          <section className="timeline-col">
            {renderDayTimeline(selectedDate)}
          </section>

          <aside className="summary-col">
            <article>
              <h4>Day Summary</h4>
              <p>{Math.floor(plannedMinutes / 60)}h {plannedMinutes % 60}m planned</p>
              <p>{Math.floor(actualMinutes / 60)}h {actualMinutes % 60}m actual</p>
              <div className="area-breakdown">
                {AREAS.map((area) => {
                  const areaMins = dayBlocks.filter((b) => b.area === area).reduce((s, b) => s + Math.max(0, toMinutes(b.end) - toMinutes(b.start)), 0);
                  if (!areaMins) return null;
                  return (
                    <div key={area} className="area-break-row">
                      <span className="area-dot" style={{ background: AREA_COLORS[area] }} />
                      <span>{area}</span>
                      <span className="mono-cap">{Math.floor(areaMins / 60)}h {areaMins % 60}m</span>
                    </div>
                  );
                })}
              </div>
            </article>

            <article>
              <h4>Consistency</h4>
              <div className="progress"><div style={{ width: `${alignmentPct}%` }} /></div>
              <small>{alignmentPct}% alignment</small>
            </article>

            {/* Live Timer */}
            <article className={`timer-card ${liveTimer ? 'active-timer' : ''}`}>
              <h4>{liveTimer ? '⏱ Timer Running' : 'Timer'}</h4>
              {liveTimer ? (
                <>
                  <div className="timer-display">{fmtElapsed(elapsed)}</div>
                  <div className="timer-meta">
                    <input
                      className="timer-title-input"
                      value={liveTimer.title}
                      onChange={(e) => setLiveTimer((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Session name"
                    />
                    <select
                      className="timer-area-select"
                      value={liveTimer.area}
                      onChange={(e) => setLiveTimer((prev) => ({ ...prev, area: e.target.value }))}
                    >
                      {AREAS.map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                  <button className="btn fill danger-btn" onClick={stopTimer}>Stop & Save</button>
                </>
              ) : (
                <button className="btn fill accent-btn" onClick={startTimer}>▶ Start Focus Timer</button>
              )}
            </article>

            <article>
              <h4>Quick Actions</h4>
              <button className="btn fill accent-btn" onClick={openCreateBlock}>+ Add time block</button>
            </article>
          </aside>
        </div>
      )}

      {/* ── Week View ── */}
      {view === 'Week' && (
        <div className="week-grid">
          <aside className="time-col week-time-col">
            <div className="time-col-head">Week</div>
            {HOURS.map((h) => (
              <div key={h} className="time-cell week-time-cell">{h}:00</div>
            ))}
          </aside>
          {weekDates.map((wd) => {
            const ds = fmt(wd);
            const isCurrentDay = ds === today;
            const dayBlockCount = blocks.filter((b) => b.date === ds).length;
            return (
              <section
                key={ds}
                className={`week-day-col ${isCurrentDay ? 'week-day-today' : ''}`}
                onClick={() => { setSelectedDate(new Date(wd)); setView('Day'); }}
              >
                <div className="week-day-head">
                  <span className={`week-day-name ${isCurrentDay ? 'today-text' : ''}`}>{shortDay(wd)}</span>
                  <span className={`week-day-num ${isCurrentDay ? 'today-num' : ''}`}>{wd.getDate()}</span>
                  {dayBlockCount > 0 && <span className="week-block-count">{dayBlockCount}</span>}
                </div>
                <div className="week-day-timeline">
                  {renderDayTimeline(wd, true)}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* ── Block Create / Edit Modal ── */}
      {blockModal && (
        <div className="cal-backdrop" onClick={() => setBlockModal(null)}>
          <aside className="cal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="cal-sheet-header">
              <h3>{blockModal.id === null ? '+ Add Time Block' : 'Edit Time Block'}</h3>
              <button className="ghost-close" onClick={() => setBlockModal(null)}>✕</button>
            </div>
            <input
              className="editor-title"
              value={blockModal.title}
              onChange={(e) => setBlockModal((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Block title"
              autoFocus
            />
            <div className="cal-form-row">
              <div className="cal-form-field">
                <label>Start</label>
                <input
                  type="time"
                  value={blockModal.start}
                  onChange={(e) => setBlockModal((prev) => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div className="cal-form-field">
                <label>End</label>
                <input
                  type="time"
                  value={blockModal.end}
                  onChange={(e) => setBlockModal((prev) => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>
            <select value={blockModal.area} onChange={(e) => setBlockModal((prev) => ({ ...prev, area: e.target.value }))}>
              {AREAS.map((a) => <option key={a}>{a}</option>)}
            </select>
            <select value={blockModal.source} onChange={(e) => setBlockModal((prev) => ({ ...prev, source: e.target.value }))}>
              {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={blockModal.status} onChange={(e) => setBlockModal((prev) => ({ ...prev, status: e.target.value }))}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <div className="cal-sheet-actions">
              {blockModal.id !== null && (
                <button className="btn danger-btn" onClick={() => setConfirmDelete({ id: blockModal.id, name: blockModal.title })}>Delete</button>
              )}
              <button className="btn accent-btn" onClick={saveBlock} disabled={!blockModal.title?.trim()}>
                {blockModal.id === null ? 'Create Block' : 'Save Changes'}
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {confirmDelete && (
        <div className="cal-backdrop confirm-backdrop" onClick={() => setConfirmDelete(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Block</h3>
            <p>Delete <strong>{confirmDelete.name}</strong>?</p>
            <div className="cal-sheet-actions">
              <button className="btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn danger-btn" onClick={() => { deleteBlock(confirmDelete.id); setConfirmDelete(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
