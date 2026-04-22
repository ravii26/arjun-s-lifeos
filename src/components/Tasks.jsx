import React, { useState } from 'react';
import './design-system.css';

const Tasks = () => {
  const [todayTasks, setTodayTasks] = useState([
    { id: 1, title: 'Complete project report', area: 'Career', priority: 'P1', type: 'boolean', done: false },
    { id: 2, title: 'Workout for 30 minutes', area: 'Health', priority: 'P2', type: 'timer', done: true },
  ]);
  const [backlogTasks, setBacklogTasks] = useState([
    { id: 3, title: 'Read 10 pages', area: 'Mind', priority: 'P2', type: 'count', done: false },
    { id: 4, title: 'Plan next week', area: 'Career', priority: 'P3', type: 'manual', done: false },
  ]);
  const [missedTasks, setMissedTasks] = useState([
    { id: 5, title: 'Submit tax documents', area: 'Finance', priority: 'P1', type: 'boolean', done: false },
  ]);
  const [isQuickAddOpen, setQuickAddOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', area: 'Career', priority: 'P2', type: 'boolean' });

  const handleAddTask = () => {
    if (!newTask.title) return;
    setTodayTasks((prev) => [
      ...prev,
      { id: Date.now(), ...newTask, done: false },
    ]);
    setNewTask({ title: '', area: 'Career', priority: 'P2', type: 'boolean' });
    setQuickAddOpen(false);
  };

  return (
    <div className="tasks" style={{ display: 'flex', gap: 'var(--space-8)', padding: 'var(--space-8)' }}>
      {/* Today Column */}
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
            Today
          </h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)' }}>
            {todayTasks.filter((task) => task.done).length}/{todayTasks.length} tasks done
          </p>
          <div
            style={{
              height: '4px',
              backgroundColor: 'var(--border)',
              borderRadius: '2px',
              overflow: 'hidden',
              marginTop: 'var(--space-2)',
            }}
          >
            <div
              style={{
                width: `${(todayTasks.filter((task) => task.done).length / todayTasks.length) * 100}%`,
                height: '100%',
                backgroundColor: 'var(--accent)',
                transition: 'width 300ms ease',
              }}
            ></div>
          </div>
        </div>

        {/* Quick Add Task */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          {isQuickAddOpen ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <input
                type="text"
                placeholder="Task title..."
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                style={{
                  padding: 'var(--space-3)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                }}
              />
              <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                <button
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: '#000',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 'var(--weight-semi-bold)',
                  }}
                  onClick={handleAddTask}
                >
                  Add
                </button>
                <button
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 'var(--weight-medium)',
                  }}
                  onClick={() => setQuickAddOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              style={{
                backgroundColor: 'var(--surface)',
                color: 'var(--text-secondary)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                fontFamily: 'var(--font-ui)',
                fontWeight: 'var(--weight-medium)',
                width: '100%',
              }}
              onClick={() => setQuickAddOpen(true)}
            >
              Add a task for today...
            </button>
          )}
        </div>

        {/* Today Tasks */}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {todayTasks.map((task) => (
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
                  setTodayTasks((prev) =>
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

      {/* Backlog Column */}
      <div style={{ flex: 1 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
          Backlog
        </h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {backlogTasks.map((task) => (
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
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--text-primary)' }}>
                {task.title}
              </span>
              <button
                style={{
                  marginLeft: 'auto',
                  backgroundColor: 'var(--accent)',
                  color: '#000',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 'var(--weight-semi-bold)',
                }}
                onClick={() => {
                  setTodayTasks((prev) => [
                    ...prev,
                    { ...task, id: Date.now(), done: false },
                  ]);
                  setBacklogTasks((prev) => prev.filter((t) => t.id !== task.id));
                }}
              >
                Add to Today
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Tasks;