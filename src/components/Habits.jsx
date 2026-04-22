import React, { useState } from 'react';
import '../styles/design-system.css';

const Habits = () => {
  const [habits, setHabits] = useState([
    {
      id: 1,
      name: 'Drink Water',
      area: 'Health',
      type: 'count',
      target: 8,
      progress: 6,
      streak: 14,
      bestStreak: 21,
      history: [true, true, false, true, true, true, false],
    },
    {
      id: 2,
      name: 'Meditate',
      area: 'Mind',
      type: 'timer',
      target: '15m',
      progress: '10m',
      streak: 7,
      bestStreak: 15,
      history: [true, true, true, false, true, true, true],
    },
    {
      id: 3,
      name: 'Read 10 Pages',
      area: 'Career',
      type: 'boolean',
      streak: 3,
      bestStreak: 10,
      history: [false, true, true, true, false, false, true],
    },
  ]);
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', area: 'Health', type: 'boolean', target: '' });

  const handleAddHabit = () => {
    if (!newHabit.name) return;
    setHabits((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...newHabit,
        streak: 0,
        bestStreak: 0,
        history: [false, false, false, false, false, false, false],
      },
    ]);
    setNewHabit({ name: '', area: 'Health', type: 'boolean', target: '' });
    setIsAddingHabit(false);
  };

  return (
    <div className="habits" style={{ padding: 'var(--space-8)' }}>
      {/* Top Section */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
          Habits
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)' }}>
          {habits.length} active · {Math.max(...habits.map((h) => h.bestStreak))} day best streak
        </p>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--text-secondary)' }}>
          {habits.length} / 3 slots used
        </p>
      </div>

      {/* Habit Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {habits.map((habit) => (
          <div
            key={habit.id}
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 'var(--weight-semi-bold)', color: 'var(--text-primary)' }}>
                  {habit.name}
                </h2>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--orange)' }}>
                  🔥 {habit.streak}
                </p>
              </div>
              <div>
                {habit.type === 'boolean' && (
                  <button
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: habit.history[6] ? 'var(--teal)' : 'transparent',
                      border: `2px solid ${habit.history[6] ? 'var(--teal)' : 'var(--border)'}`,
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setHabits((prev) =>
                        prev.map((h) =>
                          h.id === habit.id
                            ? {
                                ...h,
                                history: h.history.map((day, i) => (i === 6 ? !day : day)),
                                streak: h.history[6] ? h.streak - 1 : h.streak + 1,
                              }
                            : h
                        )
                      );
                    }}
                  ></button>
                )}
                {habit.type === 'count' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <button
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--surface-hover)',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        setHabits((prev) =>
                          prev.map((h) =>
                            h.id === habit.id && h.progress > 0
                              ? { ...h, progress: h.progress - 1 }
                              : h
                          )
                        );
                      }}
                    >
                      -
                    </button>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-primary)' }}>
                      {habit.progress} / {habit.target}
                    </span>
                    <button
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--surface-hover)',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        setHabits((prev) =>
                          prev.map((h) =>
                            h.id === habit.id && h.progress < h.target
                              ? { ...h, progress: h.progress + 1 }
                              : h
                          )
                        );
                      }}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 7-Day Grid */}
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {habit.history.map((day, index) => (
                <div
                  key={index}
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: day
                      ? 'var(--teal)'
                      : index === 6
                      ? 'transparent'
                      : 'var(--red-dim)',
                    border: index === 6 ? '2px solid var(--teal)' : 'none',
                  }}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Habit */}
      {isAddingHabit ? (
        <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <input
            type="text"
            placeholder="Habit name..."
            value={newHabit.name}
            onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-ui)',
              fontSize: '14px',
              color: 'var(--text-primary)',
            }}
          />
          <button
            style={{
              marginTop: 'var(--space-4)',
              backgroundColor: 'var(--accent)',
              color: '#000',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              fontFamily: 'var(--font-ui)',
              fontWeight: 'var(--weight-semi-bold)',
            }}
            onClick={handleAddHabit}
          >
            Add Habit
          </button>
        </div>
      ) : (
        <button
          style={{
            marginTop: 'var(--space-6)',
            backgroundColor: 'var(--surface)',
            color: 'var(--text-secondary)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            fontFamily: 'var(--font-ui)',
            fontWeight: 'var(--weight-medium)',
          }}
          onClick={() => setIsAddingHabit(true)}
        >
          + New Habit
        </button>
      )}
    </div>
  );
};

export default Habits;