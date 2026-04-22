import React, { useState, useEffect } from 'react';
import './design-system.css';

const Dashboard = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Complete project report', area: 'Career', priority: 'P1', done: false },
    { id: 2, title: 'Workout for 30 minutes', area: 'Health', priority: 'P2', done: true },
  ]);
  const [habits, setHabits] = useState([
    { id: 1, name: 'Drink water', type: 'boolean', done: false, streak: 12 },
    { id: 2, name: 'Read 10 pages', type: 'count', count: 5, target: 10, streak: 8 },
  ]);
  const [areaScores, setAreaScores] = useState([
    { name: 'Career', score: 41, trend: '+8', keyStat: '4/5 tasks · 3d streak', color: 'var(--blue)' },
    { name: 'Health', score: 71, trend: '+5', keyStat: '3/4 habits · 12d streak', color: 'var(--teal)' },
  ]);
  const [timer, setTimer] = useState({ running: true, label: 'Focus Work', time: '00:25:32', area: 'Career' });

  useEffect(() => {
    // Mock animation delays or data fetching
  }, []);

  return (
    <div className="dashboard" style={{ display: 'flex', gap: 'var(--space-8)', padding: 'var(--space-8)' }}>
      {/* Left Column */}
      <div style={{ width: '320px', position: 'sticky', top: 0 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>Wednesday</h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)' }}>22 April · Week 16</p>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent)' }}>12 day streak 🔥</div>
        </div>

        {/* Next Action Card */}
        <div
          style={{
            marginTop: 'var(--space-6)',
            padding: 'var(--space-4)',
            backgroundColor: 'var(--accent-dim)',
            border: '2px solid var(--accent)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', fontWeight: 'var(--weight-semi-bold)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Next Action
          </p>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
            Complete your Career P1 task
          </h3>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Career score is 41 — lowest this week
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
            <button style={{ backgroundColor: 'var(--accent)', color: '#000', padding: '8px 16px', borderRadius: 'var(--radius-md)', border: 'none', fontFamily: 'var(--font-ui)', fontWeight: 'var(--weight-semi-bold)' }}>
              Start Now
            </button>
            <button style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: 'var(--radius-md)', border: 'none', fontFamily: 'var(--font-ui)', fontWeight: 'var(--weight-medium)' }}>
              Skip
            </button>
          </div>
        </div>

        {/* Tasks */}
        <div style={{ marginTop: 'var(--space-6)' }}>
          <h4 style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 'var(--weight-semi-bold)', color: 'var(--text-primary)' }}>
            Tasks (2/4 done)
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: 'var(--space-4)' }}>
            {tasks.map((task) => (
              <li
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)',
                  padding: '8px 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => {
                    setTasks((prev) =>
                      prev.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t))
                    );
                  }}
                  style={{ width: '18px', height: '18px', borderRadius: '4px', border: '1px solid var(--border)' }}
                />
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: task.done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.done ? 'line-through' : 'none' }}>
                  {task.title}
                </span>
                <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--blue)', borderRadius: '50%' }}></span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--text-secondary)', padding: '2px 8px', backgroundColor: 'var(--blue-dim)', borderRadius: 'var(--radius-sm)' }}>
                  {task.priority}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Center Column */}
      <div style={{ flexGrow: 1 }}>
        <h4 style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', fontWeight: 'var(--weight-semi-bold)', color: 'var(--text-muted)' }}>
          Life Areas · This Week
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
          {areaScores.map((area) => (
            <div
              key={area.name}
              style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--surface)',
                border: `1px solid var(--border)`,
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                gap: 'var(--space-4)',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  border: `4px solid ${area.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '18px',
                  fontWeight: 'var(--weight-bold)',
                  color: area.color,
                }}
              >
                {area.score}
              </div>
              <div>
                <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 'var(--weight-bold)', color: area.color }}>
                  {area.name}
                </h5>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--text-secondary)' }}>{area.trend}</p>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--text-muted)' }}>{area.keyStat}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column */}
      <div style={{ width: '280px' }}>
        {timer.running ? (
          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--accent-dim)',
              border: '1px solid var(--accent)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <h4 style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 'var(--weight-semi-bold)', color: 'var(--text-primary)' }}>
              {timer.label}
            </h4>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '36px', fontWeight: 'var(--weight-bold)', color: 'var(--accent)' }}>
              {timer.time}
            </p>
            <button
              style={{
                marginTop: 'var(--space-4)',
                width: '100%',
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-ui)',
                fontWeight: 'var(--weight-medium)',
              }}
            >
              Stop
            </button>
          </div>
        ) : (
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--text-secondary)' }}>No active session</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;