import React, { useEffect, useMemo, useState } from 'react';
import '../styles/design-system.css';
import './Tasks.css';
import { loadTasksStore, saveTasksStore } from '../lib/tasksStore';

const AREA_COLORS = {
  Career: 'var(--blue)',
  Health: 'var(--teal)',
  Mind: 'var(--purple)',
  Finance: 'var(--accent)',
};

const TRACKING_LABELS = {
  Boolean: 'Checkbox completion',
  Count: 'Count progress',
  Timer: 'Time tracking',
  Manual: 'Manual completion',
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
  const [tasks, setTasks] = useState(() => loadTasksStore());

  // Persist on every change
  useEffect(() => {
    saveTasksStore(tasks);
  }, [tasks]);

  const [quickOpen, setQuickOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', area: 'Career', priority: 'P2', type: 'Boolean', target: 1 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTasks((prev) => prev.map((task) => (
        task.type === 'Timer' && task.timerRunning && !task.done
          ? { ...task, timerSeconds: (task.timerSeconds || 0) + 1 }
          : task
      )));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const todayTasks = tasks.filter((task) => task.lane === 'today');
  const backlogTasks = tasks.filter((task) => task.lane === 'backlog');
  const missedTasks = tasks.filter((task) => task.lane === 'missed');

  const completed = todayTasks.filter((task) => task.done).length;
  const progress = todayTasks.length ? Math.round((completed / todayTasks.length) * 100) : 0;
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

    const target = Math.max(1, Number(newTask.target) || 1);
    setTasks((prev) => [...prev, {
      title: newTask.title,
      area: newTask.area,
      priority: newTask.priority,
      type: newTask.type,
      id: Date.now(),
      done: false,
      lane: 'today',
      target: newTask.type === 'Count' ? target : undefined,
      progress: newTask.type === 'Count' ? 0 : undefined,
      timerSeconds: newTask.type === 'Timer' ? 0 : undefined,
      timerRunning: false,
    }]);
    setNewTask({ title: '', area: 'Career', priority: 'P2', type: 'Boolean', target: 1 });
    setQuickOpen(false);
  };

  const markTopPriorityDone = () => {
    if (!topPriority) return;
    setTasks((prev) => prev.map((task) => (
      task.id === topPriority.id ? { ...task, done: true, timerRunning: false } : task
    )));
  };

  const moveTask = (taskId, lane, done = false) => {
    setTasks((prev) => prev.map((task) => (
      task.id === taskId ? { ...task, lane, done, timerRunning: lane === 'today' ? task.timerRunning : false } : task
    )));
  };

  const toggleTaskDone = (taskId) => {
    setTasks((prev) => prev.map((task) => (
      task.id === taskId
        ? { ...task, done: !task.done, timerRunning: !task.done ? false : task.timerRunning }
        : task
    )));
  };

  const removeTask = (taskId) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const toggleTimer = (taskId) => {
    setTasks((prev) => prev.map((task) => (
      task.id === taskId && task.type === 'Timer' && task.lane === 'today' && !task.done
        ? { ...task, timerRunning: !task.timerRunning }
        : task
    )));
  };

  const resetTimer = (taskId) => {
    setTasks((prev) => prev.map((task) => (
      task.id === taskId && task.type === 'Timer'
        ? { ...task, timerSeconds: 0, timerRunning: false }
        : task
    )));
  };

  const shiftTaskCount = (taskId, delta) => {
    setTasks((prev) => prev.map((task) => {
      if (task.id !== taskId || task.type !== 'Count') return task;
      const target = Math.max(1, task.target || 1);
      const nextProgress = Math.max(0, Math.min(target, (task.progress || 0) + delta));
      return {
        ...task,
        progress: nextProgress,
        done: nextProgress >= target,
      };
    }));
  };

  const formatTimer = (seconds = 0) => {
    const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    return hh === '00' ? `${mm}:${ss}` : `${hh}:${mm}:${ss}`;
  };

  const renderTaskRow = (task, options = {}) => (
    <article className="task-row" key={task.id}>
      {!options.noCheckbox && (
        <input
          type="checkbox"
          checked={task.done}
          onChange={() => toggleTaskDone(task.id)}
        />
      )}
      <div className="task-main">
        <p className={task.done ? 'done' : ''}>{task.title}</p>
        <div className="meta">
          <span className="dot" style={{ background: AREA_COLORS[task.area] }} />
          <span>{task.area}</span>
          <span>{task.type}</span>
          <span>{TRACKING_LABELS[task.type]}</span>
          <span className={`badge ${task.priority.toLowerCase()}`}>{task.priority}</span>
          <span className="badge muted">{task.lane}</span>
        </div>
        {task.type === 'Count' && (
          <div className="count-strip">
            <button className="btn tiny" onClick={() => shiftTaskCount(task.id, -1)} disabled={task.lane !== 'today'}>-</button>
            <span className="timer-readout">{task.progress || 0}/{task.target || 1}</span>
            <button className="btn tiny" onClick={() => shiftTaskCount(task.id, 1)} disabled={task.lane !== 'today'}>+</button>
          </div>
        )}
        {task.type === 'Timer' && (
          <div className="timer-strip">
            <span className="timer-readout">{formatTimer(task.timerSeconds || 0)}</span>
            <button className="btn tiny" onClick={() => toggleTimer(task.id)} disabled={task.lane !== 'today' || task.done}>
              {task.timerRunning ? 'Pause' : 'Start'}
            </button>
            <button className="btn tiny ghost" onClick={() => resetTimer(task.id)}>Reset</button>
          </div>
        )}
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
            <button className="btn ghost" onClick={() => topPriority && moveTask(topPriority.id, 'backlog', false)} disabled={!topPriority}>Defer to backlog</button>
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
              {newTask.type === 'Count' && (
                <input
                  type="number"
                  min={1}
                  value={newTask.target}
                  onChange={(event) => setNewTask((prev) => ({ ...prev, target: Number(event.target.value) || 1 }))}
                  placeholder="Count target"
                />
              )}
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
                  <button className="btn tiny" onClick={() => moveTask(task.id, 'backlog', false)}>↗</button>
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
                    onClick={() => moveTask(task.id, 'today', false)}
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
                      onClick={() => moveTask(task.id, 'today', false)}
                    >
                      Retry
                    </button>
                    <button className="btn tiny ghost" onClick={() => removeTask(task.id)}>Dismiss</button>
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
