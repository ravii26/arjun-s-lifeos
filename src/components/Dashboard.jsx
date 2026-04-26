import React, { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { loadTasksStore, saveTasksStore } from '../lib/tasksStore';
import { loadHabitsStore, saveHabitsStore } from '../lib/habitsStore';
import { loadAreasStore } from '../lib/areasStore';
import '../styles/design-system.css';
import './Dashboard.css';

const AREA_COLORS = {
  Career: 'var(--blue)',
  Health: 'var(--teal)',
  Mind: 'var(--purple)',
  Finance: 'var(--accent)',
  Relationships: 'var(--pink)',
  Creative: 'var(--orange)',
};

const useCountUp = (target, duration = 600) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const to = Number.isFinite(target) ? target : 0;
    if (to <= 0) {
      setValue(0);
      return undefined;
    }

    let frame = null;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(to * progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [target, duration]);

  return value;
};

const Dashboard = () => {
  const [tasks, setTasks] = useState(() => loadTasksStore());

  useEffect(() => {
    saveTasksStore(tasks);
  }, [tasks]);

  const [habits, setHabits] = useState(() => loadHabitsStore());

  useEffect(() => {
    saveHabitsStore(habits);
  }, [habits]);

  const [areas, setAreas] = useState(() => loadAreasStore().overview);

  const [timerRunning, setTimerRunning] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(1532);
  const [focusLabel, setFocusLabel] = useState('Focus Work');

  const { isFocusMode, toggleFocusMode } = useAppContext();

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => setTimerSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const todayTasks = tasks.filter((task) => task.lane === 'today');
  const doneToday = todayTasks.filter((task) => task.done).length;
  const completionPct = todayTasks.length ? Math.round((doneToday / todayTasks.length) * 100) : 0;
  const habitDone = habits.filter((habit) => habit.progress >= habit.target).length;
  const avgScore = Math.round(areas.reduce((sum, area) => sum + area.score, 0) / areas.length);
  const habitsPct = Math.round((habitDone / habits.length) * 100);

  const now = new Date();
  const weekDay = now.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = now.toLocaleDateString('en-US', { day: '2-digit', month: 'long' });
  const weekNumber = Math.ceil(((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000 + new Date(now.getFullYear(), 0, 1).getDay() + 1) / 7);

  const weakestArea = useMemo(() => {
    return [...areas].sort((a, b) => a.score - b.score)[0];
  }, [areas]);

  const animatedCompletion = useCountUp(completionPct, 700);
  const animatedAvgScore = useCountUp(avgScore, 700);
  const animatedWeakest = useCountUp(weakestArea?.score ?? 0, 700);

  const nextAction = useMemo(() => {
    const lowAreaTask = todayTasks.find((task) => !task.done && task.area === weakestArea.name);
    return lowAreaTask || todayTasks.find((task) => !task.done) || null;
  }, [todayTasks, weakestArea]);

  const markNextActionDone = () => {
    if (!nextAction) return;
    setTasks((prev) => prev.map((task) => (task.id === nextAction.id ? { ...task, done: true } : task)));
  };

  const snoozeNextAction = () => {
    if (!nextAction) return;
    setTasks((prev) => {
      const current = [...prev];
      const index = current.findIndex((task) => task.id === nextAction.id);
      if (index === -1) return prev;
      const [item] = current.splice(index, 1);
      current.push(item);
      return current;
    });
  };

  const hh = String(Math.floor(timerSeconds / 3600)).padStart(2, '0');
  const mm = String(Math.floor((timerSeconds % 3600) / 60)).padStart(2, '0');
  const ss = String(timerSeconds % 60).padStart(2, '0');

  const [centerTab, setCenterTab] = useState('Overview');

  // Random data generator for the mock matrix to keep it mostly static per render
  const matrixData = useMemo(() => {
    return Array.from({ length: 14 }).map(() =>
      Array.from({ length: 7 }).map(() => Math.random() > 0.3 ? Math.random() * 0.8 + 0.2 : 0)
    );
  }, []);

  return (
    <div className="dashboard-screen">
      <section className="dashboard-col left">
        <header className="day-header">
          <h2>{weekDay}</h2>
          <p>{monthDay} · Week {weekNumber}</p>
          <span>12 day streak 🔥</span>
        </header>

        <article className="next-action-card">
          <small>NEXT ACTION</small>
          {nextAction ? (
            <>
              <h3>{nextAction.title}</h3>
              <p>{weakestArea.name} score is {weakestArea.score} - lowest this week</p>
            </>
          ) : (
            <>
              <h3>All clear for now</h3>
              <p>No remaining tasks for today.</p>
            </>
          )}
          <div className="row">
            <button className="btn accent" onClick={markNextActionDone}>Mark done</button>
            <button className="btn ghost" onClick={snoozeNextAction}>Snooze</button>
          </div>
        </article>

        <article className="task-list-card">
          <div className="card-head">
            <h4>Today Tasks</h4>
            <span>{doneToday}/{todayTasks.length} done</span>
          </div>
          <div className="progress-track"><div style={{ width: `${completionPct}%` }} /></div>
          <ul>
            {todayTasks.slice(0, 6).map((task) => (
              <li key={task.id}>
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)))}
                />
                <span className={task.done ? 'done' : ''}>{task.title}</span>
                <span className="dot" style={{ background: AREA_COLORS[task.area] }} />
                <em>{task.priority}</em>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="dashboard-col center">
        <div className="section-head" style={{ marginBottom: '12px' }}>
          <h4>{centerTab === 'Overview' ? 'Life Areas · This Week' : 'Deep Insights'}</h4>
          <div className="chip-row">
            <button className={`chip ${centerTab === 'Overview' ? 'active' : ''}`} onClick={() => setCenterTab('Overview')}>Overview</button>
            <button className={`chip ${centerTab === 'Insights' ? 'active' : ''}`} onClick={() => setCenterTab('Insights')}>Insights</button>
          </div>
        </div>

        {centerTab === 'Overview' && (
          <>
            <div className="snapshot-grid">
              <article className="snapshot-card">
                <small>Execution</small>
                <strong>{animatedCompletion}%</strong>
                <span>{doneToday}/{todayTasks.length} tasks complete</span>
              </article>
              <article className="snapshot-card">
                <small>Habits</small>
                <strong>{habitDone}/{habits.length}</strong>
                <span>completed today</span>
              </article>
              <article className="snapshot-card">
                <small>Overall score</small>
                <strong>{animatedAvgScore}</strong>
                <span>across all areas</span>
              </article>
            </div>

            <div className="area-grid">
              {areas.map((area) => (
                <article className="area-card" key={area.name} style={{ '--ring-score': `${area.score}%` }}>
                  <div className="score-ring" style={{ '--ring-color': area.color || AREA_COLORS[area.name], '--score': `${area.score}%` }}>
                    <span>{area.score}</span>
                  </div>
                  <div>
                    <h5 style={{ color: area.color || AREA_COLORS[area.name] }}>{area.name}</h5>
                    <p className={`trend ${area.trend.startsWith('+') ? 'up' : area.trend.startsWith('-') ? 'down' : 'flat'}`}>{area.trend}</p>
                    <small>{area.tasks} tasks</small>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {centerTab === 'Insights' && (
          <div className="insights-view page-enter">
            <article className="chart-card">
              <h4>Momentum Trend</h4>
              <p className="subtitle">Overall engagement score over the last 10 days</p>
              <svg viewBox="0 0 400 120" className="area-chart">
                <defs>
                  <linearGradient id="gradientPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polyline points="0,110 40,90 80,100 120,60 160,80 200,40 240,50 280,20 320,30 360,10 400,25" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <polygon points="0,120 0,110 40,90 80,100 120,60 160,80 200,40 240,50 280,20 320,30 360,10 400,25 400,120" fill="url(#gradientPrimary)" />
              </svg>
            </article>

            <article className="chart-card">
              <h4>Activity Matrix</h4>
              <p className="subtitle">Daily completions over the last 14 weeks</p>
              <div className="matrix-wrapper">
                {matrixData.map((col, colIdx) => (
                  <div key={colIdx} className="matrix-col">
                    {col.map((val, cellIdx) => (
                      <div
                        key={cellIdx}
                        className="matrix-cell"
                        style={{
                          background: val === 0 ? 'var(--surface-raised)' : 'var(--teal)',
                          opacity: val === 0 ? 1 : val
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </article>
          </div>
        )}
      </section>

      <section className="dashboard-col right">
        <article className={`timer-card ${isFocusMode ? 'focus-highlight' : ''}`}>
          <h4>{focusLabel}</h4>
          <p>{hh}:{mm}:{ss}</p>
          <div className="row">
            <button className="btn ghost" onClick={() => setTimerRunning((prev) => !prev)}>
              {timerRunning ? 'Pause' : 'Resume'}
            </button>
            <button className="btn ghost" onClick={() => { setTimerSeconds(0); setFocusLabel('Reset Focus'); }}>
              Reset
            </button>
          </div>
          <button
            className="btn accent"
            style={{ width: '100%', marginTop: '12px' }}
            onClick={toggleFocusMode}
          >
            {isFocusMode ? 'Exit Immersive Mode' : 'Enter Immersive Mode'}
          </button>
        </article>

        <article className="habit-card">
          <h4>Quick Habit Log</h4>
          {habits.slice(0, 4).map((habit) => (
            <div className="habit-row" key={habit.id}>
              <span>{habit.name}</span>
              <div className="habit-controls">
                <button
                  className="btn tiny"
                  onClick={() => setHabits((prev) => prev.map((h) => (h.id === habit.id ? { ...h, progress: Math.max(0, h.progress - 1) } : h)))}
                >
                  -
                </button>
                <b>{habit.progress}/{habit.target}</b>
                <button
                  className="btn tiny"
                  onClick={() => setHabits((prev) => prev.map((h) => (h.id === habit.id ? { ...h, progress: Math.min(h.target, h.progress + 1) } : h)))}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </article>

        <article className="pulse-card">
          <h4>Execution Pulse</h4>
          <div className="pulse-row">
            <span>Tasks</span>
            <div className="mini-track"><div style={{ width: `${completionPct}%` }} /></div>
          </div>
          <div className="pulse-row">
            <span>Habits</span>
            <div className="mini-track"><div style={{ width: `${habitsPct}%` }} /></div>
          </div>
          <div className="pulse-row">
            <span>Area floor</span>
            <div className="mini-track"><div style={{ width: `${weakestArea.score}%` }} /></div>
          </div>
          <p className="pulse-caption">Low area now at {animatedWeakest}% in {weakestArea.name}</p>
        </article>
      </section>
    </div>
  );
};

export default Dashboard;
