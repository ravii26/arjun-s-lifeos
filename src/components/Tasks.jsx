import React, { useEffect, useMemo, useState } from 'react';
import '../styles/design-system.css';
import './Tasks.css';

const AREA_COLORS = {
  Career: 'var(--blue)',
  Health: 'var(--teal)',
  Mind: 'var(--purple)',
  Finance: 'var(--accent)',
};

const useCountUp = (target, duration = 550) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const endValue = Number.isFinite(target) ? target : 0;
    let frame = null;

    if (endValue <= 0) {
      setValue(0);
      return undefined;
    }

    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(endValue * progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [target, duration]);

  return value;
};

const Tasks = () => {
  const [todayTasks, setTodayTasks] = useState([
    { id: 1, title: 'Finalize architecture deck', area: 'Career', priority: 'P1', type: 'Boolean', done: false },
    { id: 2, title: '45 min strength training', area: 'Health', priority: 'P2', type: 'Timer', done: true },
  ]);

  const [backlogTasks, setBacklogTasks] = useState([
    { id: 3, title: 'Create sprint estimation rubric', area: 'Career', priority: 'P2', type: 'Manual', done: false },
    { id: 4, title: 'Write investment review note', area: 'Finance', priority: 'P1', type: 'Boolean', done: false },
  ]);

  const [missedTasks, setMissedTasks] = useState([
    { id: 5, title: 'Sleep by 11:00 PM', area: 'Health', priority: 'P2', type: 'Boolean', done: false },
  ]);

  const [quickOpen, setQuickOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', area: 'Career', priority: 'P2', type: 'Boolean' });

  const completed = todayTasks.filter((task) => task.done).length;
  const progress = Math.round((completed / todayTasks.length) * 100);
  const remaining = todayTasks.length - completed;
  const backlogCount = backlogTasks.length;
  const missedCount = missedTasks.length;

  const topPriority = useMemo(() => {
    return todayTasks.find((task) => !task.done && task.priority === 'P1') || todayTasks.find((task) => !task.done) || null;
  }, [todayTasks]);

  const animatedProgress = useCountUp(progress, 650);
  const animatedCompleted = useCountUp(completed, 650);
  const animatedRemaining = useCountUp(remaining, 650);

  const addTask = () => {
    if (!newTask.title.trim()) return;
    setTodayTasks((prev) => [...prev, { ...newTask, id: Date.now(), done: false }]);
    setNewTask({ title: '', area: 'Career', priority: 'P2', type: 'Boolean' });
    setQuickOpen(false);
  };

  const markTopPriorityDone = () => {
    if (!topPriority) return;
    setTodayTasks((prev) => prev.map((task) => (task.id === topPriority.id ? { ...task, done: true } : task)));
  };

  const renderTaskRow = (task, options = {}) => (
    <article className="task-row" key={task.id}>
      {!options.noCheckbox && (
        <input
          type="checkbox"
          checked={task.done}
          onChange={() => setTodayTasks((prev) => prev.map((entry) => (entry.id === task.id ? { ...entry, done: !entry.done } : entry)))}
        />
      )}
      <div className="task-main">
        <p className={task.done ? 'done' : ''}>{task.title}</p>
        <div className="meta">
          <span className="dot" style={{ background: AREA_COLORS[task.area] }} />
          <span>{task.area}</span>
          <span>{task.type}</span>
          <span className={`badge ${task.priority.toLowerCase()}`}>{task.priority}</span>
        </div>
      </div>
      <div className="actions">{options.actions}</div>
    </article>
  );

  return (
    <div className="tasks-screen">
      <section className="tasks-main">
        <header className="tasks-head">
          <h1>Tasks</h1>
          <p>{animatedCompleted}/{todayTasks.length} done today · {animatedProgress}% complete</p>
        </header>

        <div className="tasks-snapshot-grid">
          <article className="tasks-snapshot-card">
            <small>Done</small>
            <strong>{animatedCompleted}</strong>
            <span>today</span>
          </article>
          <article className="tasks-snapshot-card">
            <small>Remaining</small>
            <strong>{animatedRemaining}</strong>
            <span>open tasks</span>
          </article>
          <article className="tasks-snapshot-card">
            <small>Backlog</small>
            <strong>{backlogCount}</strong>
            <span>queued</span>
          </article>
          <article className="tasks-snapshot-card">
            <small>Missed</small>
            <strong>{missedCount}</strong>
            <span>needs review</span>
          </article>
        </div>

        <article className="focus-card">
          <small>TOP PRIORITY</small>
          <h3>{topPriority ? topPriority.title : 'No pending tasks'}</h3>
          <div className="progress-track"><div style={{ width: `${progress}%` }} /></div>
          <div className="focus-actions">
            <button className="btn accent" onClick={markTopPriorityDone} disabled={!topPriority}>Mark done</button>
            <button className="btn ghost" onClick={() => topPriority && setBacklogTasks((prev) => [...prev, { ...topPriority, id: Date.now(), done: false }])} disabled={!topPriority}>Defer to backlog</button>
          </div>
        </article>

        <article className="quick-add-card">
          {quickOpen ? (
            <div className="quick-grid">
              <input
                value={newTask.title}
                onChange={(event) => setNewTask((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Task title"
              />
              <select value={newTask.area} onChange={(event) => setNewTask((prev) => ({ ...prev, area: event.target.value }))}>
                <option>Career</option>
                <option>Health</option>
                <option>Mind</option>
                <option>Finance</option>
              </select>
              <select value={newTask.priority} onChange={(event) => setNewTask((prev) => ({ ...prev, priority: event.target.value }))}>
                <option>P1</option>
                <option>P2</option>
                <option>P3</option>
              </select>
              <select value={newTask.type} onChange={(event) => setNewTask((prev) => ({ ...prev, type: event.target.value }))}>
                <option>Boolean</option>
                <option>Count</option>
                <option>Timer</option>
                <option>Manual</option>
              </select>
              <div className="quick-actions">
                <button className="btn accent" onClick={addTask}>Add Task</button>
                <button className="btn ghost" onClick={() => setQuickOpen(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="btn ghost fill" onClick={() => setQuickOpen(true)}>+ Add a task for today...</button>
          )}
        </article>

        <section className="list-section">
          <h4>Today</h4>
          <div className="task-list">
            {todayTasks.map((task) =>
              renderTaskRow(task, {
                actions: (
                  <button className="btn tiny" onClick={() => setBacklogTasks((prev) => [...prev, { ...task, id: Date.now(), done: false }])}>↗</button>
                ),
              })
            )}
          </div>
        </section>
      </section>

      <aside className="tasks-side">
        <section className="list-section">
          <h4>Backlog</h4>
          <div className="task-list">
            {backlogTasks.map((task) =>
              renderTaskRow(task, {
                noCheckbox: true,
                actions: (
                  <button
                    className="btn tiny"
                    onClick={() => {
                      setTodayTasks((prev) => [...prev, { ...task, id: Date.now(), done: false }]);
                      setBacklogTasks((prev) => prev.filter((entry) => entry.id !== task.id));
                    }}
                  >
                    +
                  </button>
                ),
              })
            )}
          </div>
        </section>

        <section className="list-section">
          <h4>Missed</h4>
          <div className="task-list">
            {missedTasks.map((task) =>
              renderTaskRow(task, {
                noCheckbox: true,
                actions: (
                  <>
                    <button
                      className="btn tiny"
                      onClick={() => {
                        setTodayTasks((prev) => [...prev, { ...task, id: Date.now(), done: false }]);
                        setMissedTasks((prev) => prev.filter((entry) => entry.id !== task.id));
                      }}
                    >
                      Retry
                    </button>
                    <button className="btn tiny ghost" onClick={() => setMissedTasks((prev) => prev.filter((entry) => entry.id !== task.id))}>Dismiss</button>
                  </>
                ),
              })
            )}
          </div>
        </section>
      </aside>
    </div>
  );
};

export default Tasks;
