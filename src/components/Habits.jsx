import React, { useEffect, useMemo, useState } from 'react';
import '../styles/design-system.css';
import './Habits.css';

const AREA_COLORS = {
  Career: 'var(--blue)',
  Health: 'var(--teal)',
  Mind: 'var(--purple)',
  Finance: 'var(--accent)',
};

const defaultHistory = () => [false, false, false, false, false, false, false];

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
  const [habits, setHabits] = useState([
    {
      id: 1,
      name: 'Hydration',
      area: 'Health',
      type: 'Count',
      target: 8,
      progress: 6,
      streak: 14,
      bestStreak: 21,
      history: [true, true, false, true, true, true, false],
    },
    {
      id: 2,
      name: 'Deep Work Block',
      area: 'Career',
      type: 'Timer',
      target: 60,
      progress: 35,
      streak: 7,
      bestStreak: 16,
      history: [true, true, true, false, true, true, true],
    },
    {
      id: 3,
      name: 'Evening Reflection',
      area: 'Mind',
      type: 'Boolean',
      target: 1,
      progress: 0,
      streak: 3,
      bestStreak: 9,
      history: [false, true, true, true, false, false, true],
    },
  ]);

  const [adding, setAdding] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', area: 'Health', type: 'Boolean', target: 1 });

  const topStreak = Math.max(...habits.map((habit) => habit.bestStreak));
  const completedToday = habits.filter((habit) => {
    if (habit.type === 'Boolean') return habit.progress >= 1;
    return habit.progress >= habit.target;
  }).length;
  const completionPct = Math.round((completedToday / habits.length) * 100);
  const totalProgress = habits.reduce((sum, habit) => {
    const current = habit.type === 'Boolean' ? Math.min(1, habit.progress) : Math.min(habit.target, habit.progress);
    return sum + (current / habit.target) * 100;
  }, 0);
  const avgProgress = Math.round(totalProgress / habits.length);

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
          <p>{habits.length} active · {topStreak} day best streak</p>
          <small>{slotsText}</small>
        </div>
        <button className="btn ghost" onClick={() => setAdding((prev) => !prev)}>{adding ? 'Close' : '+ New Habit'}</button>
      </header>

      <section className="habits-summary">
        <article>
          <span className="mono">Completed today</span>
          <strong>{animatedCompleted}/{habits.length}</strong>
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
        {habits.map((habit) => (
          <article className="habit-item" key={habit.id}>
            <div className="habit-top">
              <div>
                <h3>{habit.name}</h3>
                <div className="meta">
                  <span className="dot" style={{ background: AREA_COLORS[habit.area] }} />
                  <span>{habit.area}</span>
                  <span>{habit.type}</span>
                  <strong>🔥 {habit.streak}</strong>
                </div>
              </div>

              <div className="tracker">
                {habit.type === 'Boolean' && (
                  <button className={`check ${habit.progress >= 1 ? 'done' : ''}`} onClick={() => logBoolean(habit)}>
                    ✓
                  </button>
                )}

                {habit.type !== 'Boolean' && (
                  <div className="counter">
                    <button className="btn tiny" onClick={() => shiftCount(habit, -1)}>-</button>
                    <b>{habit.progress}/{habit.target}{habit.type === 'Timer' ? 'm' : ''}</b>
                    <button className="btn tiny" onClick={() => shiftCount(habit, 1)}>+</button>
                  </div>
                )}
              </div>
            </div>

            <div className="habit-progress">
              <div className="habit-progress-head">
                <span>Today</span>
                <strong>{habit.type === 'Boolean' ? (habit.progress >= 1 ? 'Done' : 'Open') : `${habit.progress}/${habit.target}${habit.type === 'Timer' ? 'm' : ''}`}</strong>
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
          </article>
        ))}
      </section>
    </div>
  );
};

export default Habits;
