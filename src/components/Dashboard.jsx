import React, { useMemo, useState } from 'react';
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

const Dashboard = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Finalize architecture deck', area: 'Career', priority: 'P1', done: false },
    { id: 2, title: '45 min strength training', area: 'Health', priority: 'P2', done: true },
    { id: 3, title: 'Review cashflow sheet', area: 'Finance', priority: 'P1', done: false },
  ]);

  const [habits, setHabits] = useState([
    { id: 1, name: 'Hydration', current: 5, target: 8, streak: 12 },
    { id: 2, name: '20m Learning', current: 1, target: 1, streak: 9 },
  ]);

  const [areas, setAreas] = useState([
    { name: 'Career', score: 42, trend: '+4', stat: '2/3 tasks' },
    { name: 'Health', score: 71, trend: '+3', stat: '1/1 task' },
    { name: 'Mind', score: 58, trend: '+1', stat: '1/2 habits' },
    { name: 'Finance', score: 39, trend: '-5', stat: '0/1 tasks' },
    { name: 'Relationships', score: 51, trend: '→', stat: '1 check-in' },
    { name: 'Creative', score: 64, trend: '+2', stat: '2 outputs' },
  ]);

  const [timerRunning, setTimerRunning] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(1532);

  React.useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => setTimerSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const doneToday = tasks.filter((task) => task.done).length;
  const completionPct = Math.round((doneToday / tasks.length) * 100);

  const weakestArea = useMemo(() => {
    return [...areas].sort((a, b) => a.score - b.score)[0];
  }, [areas]);

  const nextAction = useMemo(() => {
    const lowAreaTask = tasks.find((task) => !task.done && task.area === weakestArea.name);
    return lowAreaTask || tasks.find((task) => !task.done) || null;
  }, [tasks, weakestArea]);

  const hh = String(Math.floor(timerSeconds / 3600)).padStart(2, '0');
  const mm = String(Math.floor((timerSeconds % 3600) / 60)).padStart(2, '0');
  const ss = String(timerSeconds % 60).padStart(2, '0');

  return (
    <div className="dashboard-screen">
      <section className="dashboard-col left">
        <header className="day-header">
          <h2>Wednesday</h2>
          <p>22 April · Week 16</p>
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
            <button className="btn accent">Start now</button>
            <button className="btn ghost">Skip</button>
          </div>
        </article>

        <article className="task-list-card">
          <div className="card-head">
            <h4>Today Tasks</h4>
            <span>{doneToday}/{tasks.length} done</span>
          </div>
          <div className="progress-track"><div style={{ width: `${completionPct}%` }} /></div>
          <ul>
            {tasks.map((task) => (
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
        <div className="section-head">
          <h4>Life Areas · This Week</h4>
        </div>
        <div className="area-grid">
          {areas.map((area) => (
            <article className="area-card" key={area.name}>
              <div className="score-ring" style={{ '--ring-color': AREA_COLORS[area.name], '--score': `${area.score}%` }}>
                <span>{area.score}</span>
              </div>
              <div>
                <h5 style={{ color: AREA_COLORS[area.name] }}>{area.name}</h5>
                <p>{area.trend}</p>
                <small>{area.stat}</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-col right">
        <article className="timer-card">
          <h4>Focus Work</h4>
          <p>{hh}:{mm}:{ss}</p>
          <button className="btn ghost" onClick={() => setTimerRunning((prev) => !prev)}>
            {timerRunning ? 'Pause' : 'Resume'}
          </button>
        </article>

        <article className="habit-card">
          <h4>Quick Habit Log</h4>
          {habits.map((habit) => (
            <div className="habit-row" key={habit.id}>
              <span>{habit.name}</span>
              <div className="habit-controls">
                <button
                  className="btn tiny"
                  onClick={() => setHabits((prev) => prev.map((h) => (h.id === habit.id ? { ...h, current: Math.max(0, h.current - 1) } : h)))}
                >
                  -
                </button>
                <b>{habit.current}/{habit.target}</b>
                <button
                  className="btn tiny"
                  onClick={() => setHabits((prev) => prev.map((h) => (h.id === habit.id ? { ...h, current: Math.min(h.target, h.current + 1) } : h)))}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </article>
      </section>
    </div>
  );
};

export default Dashboard;
