import React, { useEffect, useMemo, useState } from 'react';
import { loadHabitsStore, saveHabitsStore } from '../lib/habitsStore';
import '../styles/design-system.css';
import './Habits.css';

const AREA_COLORS = {
  Career: 'var(--blue)',
  Health: 'var(--teal)',
  Mind: 'var(--purple)',
  Finance: 'var(--accent)',
};

const defaultHistory = () => [false, false, false, false, false, false, false];

const TRACKING_LABELS = {
  Boolean: 'Check once',
  Count: 'Count reps',
  Timer: 'Track minutes',
};

const useCountUp = (target, duration = 600) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const endValue = Number.isFinite(target) ? target : 0;
    if (endValue <= 0) {
      setValue(0);
      return undefined;
    }

    let frame = null;
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

const Habits = () => {
  const [habits, setHabits] = useState(() => loadHabitsStore());

  useEffect(() => {
    saveHabitsStore(habits);
  }, [habits]);

  const [adding, setAdding] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', area: 'Health', type: 'Boolean', target: 1 });
  const [statusFilter, setStatusFilter] = useState('active');

  useEffect(() => {
    const timer = setInterval(() => {
      setHabits((prev) => prev.map((habit) => {
        if (habit.type !== 'Timer' || !habit.timerRunning || habit.status !== 'active') return habit;

        const nextSeconds = (habit.timerSeconds || 0) + 1;
        const nextMinutes = Math.floor(nextSeconds / 60);
        return {
          ...habit,
          timerSeconds: nextSeconds,
          progress: Math.min(habit.target, nextMinutes),
        };
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const filteredHabits = habits.filter((habit) => habit.status === statusFilter);

  const topStreak = habits.length ? Math.max(...habits.map((habit) => habit.bestStreak)) : 0;
  const activeHabits = habits.filter((habit) => habit.status === 'active');
  const completedToday = activeHabits.filter((habit) => {
    if (habit.type === 'Boolean') return habit.progress >= 1;
    return habit.progress >= habit.target;
  }).length;
  const completionPct = activeHabits.length ? Math.round((completedToday / activeHabits.length) * 100) : 0;
  const totalProgress = activeHabits.reduce((sum, habit) => {
    const current = habit.type === 'Boolean' ? Math.min(1, habit.progress) : Math.min(habit.target, habit.progress);
    const safeTarget = Math.max(1, habit.target || 1);
    return sum + (current / safeTarget) * 100;
  }, 0);
  const avgProgress = activeHabits.length ? Math.round(totalProgress / activeHabits.length) : 0;

  const slotsText = `${habits.length} / 8 slots used`;

  const areaTotals = useMemo(() => {
    const counts = habits.reduce((acc, habit) => {
      acc[habit.area] = (acc[habit.area] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts);
  }, [habits]);

  const animatedCompleted = useCountUp(completedToday, 650);
  const animatedCompletionPct = useCountUp(completionPct, 650);
  const animatedAvgProgress = useCountUp(avgProgress, 650);

  const updateHabit = (habitId, updater) => {
    setHabits((prev) => prev.map((habit) => (habit.id === habitId ? updater(habit) : habit)));
  };

  const moveHabitStatus = (habitId, status) => {
    updateHabit(habitId, (entry) => ({
      ...entry,
      status,
      timerRunning: status === 'active' ? entry.timerRunning : false,
    }));
  };

  const toggleTimer = (habit) => {
    if (habit.type !== 'Timer' || habit.status !== 'active') return;
    updateHabit(habit.id, (entry) => ({ ...entry, timerRunning: !entry.timerRunning }));
  };

  const resetTimer = (habit) => {
    if (habit.type !== 'Timer') return;
    updateHabit(habit.id, (entry) => ({ ...entry, timerRunning: false, timerSeconds: 0, progress: 0 }));
  };

  const formatTimer = (seconds = 0) => {
    const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    return hh === '00' ? `${mm}:${ss}` : `${hh}:${mm}:${ss}`;
  };

  const logBoolean = (habit) => {
    updateHabit(habit.id, (entry) => {
      const done = entry.progress >= 1;
      const nextDone = !done;
      return {
        ...entry,
        progress: nextDone ? 1 : 0,
        streak: nextDone ? entry.streak + 1 : Math.max(0, entry.streak - 1),
        history: entry.history.map((value, index) => (index === entry.history.length - 1 ? nextDone : value)),
      };
    });
  };

  const shiftCount = (habit, delta) => {
    if (habit.type !== 'Count') return;
    updateHabit(habit.id, (entry) => ({
      ...entry,
      progress: Math.max(0, Math.min(entry.target, entry.progress + delta)),
      history: entry.history.map((value, index) => (index === entry.history.length - 1 ? entry.progress + delta >= entry.target : value)),
    }));
  };

  const addHabit = () => {
    if (!newHabit.name.trim()) return;

    setHabits((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...newHabit,
        target: Number(newHabit.target) || 1,
        progress: 0,
        timerSeconds: 0,
        timerRunning: false,
        status: 'active',
        streak: 0,
        bestStreak: 0,
        history: defaultHistory(),
      },
    ]);

    setNewHabit({ name: '', area: 'Health', type: 'Boolean', target: 1 });
    setAdding(false);
  };

  return (
    <div className="habits-screen">
      <header className="habits-head">
        <div>
          <h1>Habits</h1>
          <p>{activeHabits.length} active · {topStreak} day best streak</p>
          <small>{slotsText}</small>
        </div>
        <button className="btn ghost" onClick={() => setAdding((prev) => !prev)}>{adding ? 'Close' : '+ New Habit'}</button>
      </header>

      <div className="habit-status-filters">
        {['active', 'paused', 'archived'].map((status) => (
          <button key={status} className={`btn ${statusFilter === status ? 'accent' : 'ghost'}`} onClick={() => setStatusFilter(status)}>
            {status}
          </button>
        ))}
      </div>

      <section className="habits-summary">
        <article>
          <span className="mono">Completed today</span>
          <strong>{animatedCompleted}/{activeHabits.length || 0}</strong>
        </article>
        <article>
          <span className="mono">Longest current streak</span>
          <strong>{Math.max(...habits.map((habit) => habit.streak))} days</strong>
        </article>
        <article>
          <span className="mono">Area split</span>
          <div className="areas-inline">
            {areaTotals.map(([area, count]) => <span key={area}>{area}: {count}</span>)}
          </div>
        </article>
        <article>
          <span className="mono">Completion rate</span>
          <strong>{animatedCompletionPct}%</strong>
        </article>
        <article>
          <span className="mono">Average progress</span>
          <strong>{animatedAvgProgress}%</strong>
        </article>
        <article>
          <span className="mono">Slots used</span>
          <strong>{habits.length}/8</strong>
        </article>
      </section>

      {adding && (
        <section className="add-habit">
          <input
            value={newHabit.name}
            onChange={(event) => setNewHabit((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Habit name"
          />
          <select value={newHabit.area} onChange={(event) => setNewHabit((prev) => ({ ...prev, area: event.target.value }))}>
            <option>Career</option>
            <option>Health</option>
            <option>Mind</option>
            <option>Finance</option>
          </select>
          <select value={newHabit.type} onChange={(event) => setNewHabit((prev) => ({ ...prev, type: event.target.value }))}>
            <option>Boolean</option>
            <option>Count</option>
            <option>Timer</option>
          </select>
          <input
            type="number"
            min={1}
            value={newHabit.target}
            onChange={(event) => setNewHabit((prev) => ({ ...prev, target: Number(event.target.value) || 1 }))}
            placeholder="Target"
          />
          <button className="btn accent" onClick={addHabit}>Add Habit</button>
        </section>
      )}

      <section className="habit-list">
        {filteredHabits.map((habit) => (
          <article className="habit-item" key={habit.id}>
            <div className="habit-top">
              <div>
                <h3>{habit.name}</h3>
                <div className="meta">
                  <span className="dot" style={{ background: AREA_COLORS[habit.area] }} />
                  <span>{habit.area}</span>
                  <span>{habit.type}</span>
                  <span>{TRACKING_LABELS[habit.type]}</span>
                  <strong>🔥 {habit.streak}</strong>
                  <span className="habit-status-chip">{habit.status}</span>
                </div>
              </div>

              <div className="tracker">
                {habit.type === 'Boolean' && (
                  <button className={`check ${habit.progress >= 1 ? 'done' : ''}`} onClick={() => logBoolean(habit)}>
                    ✓
                  </button>
                )}

                {habit.type === 'Count' && (
                  <div className="counter">
                    <button className="btn tiny" onClick={() => shiftCount(habit, -1)}>-</button>
                    <b>{habit.progress}/{habit.target}</b>
                    <button className="btn tiny" onClick={() => shiftCount(habit, 1)}>+</button>
                  </div>
                )}

                {habit.type === 'Timer' && <span className="timer-note">Use Start/Pause to track time</span>}
              </div>
            </div>

            {habit.type === 'Timer' && (
              <div className="habit-timer-strip">
                <span className="habit-timer-readout">{formatTimer(habit.timerSeconds || 0)}</span>
                <button className="btn tiny" onClick={() => toggleTimer(habit)} disabled={habit.status !== 'active'}>
                  {habit.timerRunning ? 'Pause' : 'Start'}
                </button>
                <button className="btn tiny ghost" onClick={() => resetTimer(habit)}>Reset</button>
              </div>
            )}

            <div className="habit-progress">
              <div className="habit-progress-head">
                <span>Today</span>
                <strong>
                  {habit.type === 'Boolean'
                    ? (habit.progress >= 1 ? 'Done' : 'Open')
                    : habit.type === 'Timer'
                      ? `${habit.progress}/${habit.target} min`
                      : `${habit.progress}/${habit.target}`}
                </strong>
              </div>
              <div className="habit-progress-track">
                <div style={{ width: `${Math.min(100, Math.round((habit.type === 'Boolean' ? Math.min(1, habit.progress) : habit.progress) / habit.target * 100))}%` }} />
              </div>
            </div>

            <div className="seven-grid">
              {habit.history.map((day, idx) => (
                <span key={idx} className={`day ${day ? 'on' : 'off'} ${idx === habit.history.length - 1 ? 'today' : ''}`} />
              ))}
            </div>

            <div className="habit-status-actions">
              {habit.status === 'active' && (
                <button className="btn tiny ghost" onClick={() => moveHabitStatus(habit.id, 'paused')}>Pause</button>
              )}
              {habit.status === 'paused' && (
                <button className="btn tiny ghost" onClick={() => moveHabitStatus(habit.id, 'active')}>Resume</button>
              )}
              {habit.status !== 'archived' && (
                <button className="btn tiny ghost" onClick={() => moveHabitStatus(habit.id, 'archived')}>Archive</button>
              )}
              {habit.status === 'archived' && (
                <button className="btn tiny ghost" onClick={() => moveHabitStatus(habit.id, 'active')}>Restore</button>
              )}
            </div>
          </article>
        ))}
        {!filteredHabits.length && <p className="empty-state">No habits in {statusFilter} state.</p>}
      </section>
    </div>
  );
};

export default Habits;
