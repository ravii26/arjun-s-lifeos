import React, { useState } from 'react';
import { useApp, AREA_COLORS, type LifeArea, type Task } from '../context/AppContext';
import { Icons } from '../components/Icons';

const AREA_SHORT: Record<LifeArea, string> = {
  'Career & Skills': 'Career',
  'Health & Body': 'Health',
  'Mind & Learning': 'Mind',
  'Finance': 'Finance',
  'Relationships': 'Relationships',
  'Creative': 'Creative',
};

const ALL_AREAS: LifeArea[] = ['Career & Skills', 'Health & Body', 'Mind & Learning', 'Finance', 'Relationships', 'Creative'];

const BottomSheet = ({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100 }} onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', transition: 'opacity 250ms ease' }} />
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'var(--surface-2)',
          borderRadius: '20px 20px 0 0',
          padding: '12px 20px 32px',
          maxHeight: '80vh', overflowY: 'auto',
          animation: 'slideUp 250ms cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--surface-3)', margin: '0 auto 20px' }} />
        {children}
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </div>
  );
};

const AddTaskSheet = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { addTask } = useApp();
  const [title, setTitle] = useState('');
  const [area, setArea] = useState<LifeArea>('Career & Skills');
  const [priority, setPriority] = useState<'P1' | 'P2' | 'P3'>('P1');
  const [timeEst, setTimeEst] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;
    addTask({ title: title.trim(), area, priority, completed: false, timeEstimate: timeEst ? parseInt(timeEst) : undefined, isToday: false });
    setTitle(''); setTimeEst('');
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 20 }}>Add task</h3>
      <input
        autoFocus
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        style={{
          width: '100%', fontSize: 16, background: 'transparent', border: 'none',
          borderBottom: '1px solid var(--border-strong)', padding: '8px 0 12px',
          color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
        }}
      />
      <div style={{ marginTop: 20, marginBottom: 12, fontSize: 12, color: 'var(--text-muted)' }}>Area</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {ALL_AREAS.map(a => (
          <button key={a} onClick={() => setArea(a)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20,
            border: a === area ? `1px solid ${AREA_COLORS[a]}` : '0.5px solid var(--border)',
            background: a === area ? `color-mix(in srgb, ${AREA_COLORS[a]} 15%, transparent)` : 'var(--surface-3)',
            color: a === area ? AREA_COLORS[a] : 'var(--text-muted)',
            fontSize: 12, cursor: 'pointer', fontFamily: 'Inter',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: AREA_COLORS[a] }} />
            {AREA_SHORT[a]}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 20, marginBottom: 12, fontSize: 12, color: 'var(--text-muted)' }}>Priority</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {(['P1', 'P2', 'P3'] as const).map(p => (
          <button key={p} onClick={() => setPriority(p)} style={{
            padding: '6px 16px', borderRadius: 20, fontSize: 12, cursor: 'pointer', fontWeight: 500,
            border: 'none', fontFamily: 'Inter',
            background: p === priority
              ? (p === 'P1' ? 'var(--primary-muted-bg)' : p === 'P2' ? 'var(--amber-muted-bg)' : 'var(--surface-3)')
              : 'var(--surface-3)',
            color: p === priority
              ? (p === 'P1' ? 'var(--primary)' : p === 'P2' ? 'var(--amber)' : 'var(--text-muted)')
              : 'var(--text-muted)',
          }}>
            {p}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 20 }}>
        <input
          value={timeEst}
          onChange={e => setTimeEst(e.target.value.replace(/\D/g, ''))}
          placeholder="Est. minutes"
          type="number"
          style={{
            width: 120, fontSize: 14, background: 'var(--surface-3)', border: '0.5px solid var(--border)',
            borderRadius: 8, padding: '8px 12px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
          }}
        />
      </div>
      <button onClick={handleSubmit} className="interactive" style={{
        width: '100%', marginTop: 24, padding: '14px', borderRadius: 14,
        background: 'var(--primary)', color: '#fff', fontSize: 14, fontWeight: 500,
        border: 'none', cursor: 'pointer', fontFamily: 'Inter',
      }}>
        Add to backlog
      </button>
    </BottomSheet>
  );
};

const TaskDetailSheet = ({ task, open, onClose }: { task: Task | null; open: boolean; onClose: () => void }) => {
  const { deleteTask, updateTask } = useApp();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!task) return null;

  return (
    <BottomSheet open={open} onClose={() => { onClose(); setConfirmDelete(false); }}>
      <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 16 }}>{task.title}</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <span style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20,
          background: `color-mix(in srgb, ${AREA_COLORS[task.area]} 15%, transparent)`,
          color: AREA_COLORS[task.area], fontSize: 12,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: AREA_COLORS[task.area] }} />
          {AREA_SHORT[task.area]}
        </span>
        <span style={{
          fontSize: 11, padding: '4px 10px', borderRadius: 20,
          background: task.priority === 'P1' ? 'var(--primary-muted-bg)' : task.priority === 'P2' ? 'var(--amber-muted-bg)' : 'var(--surface-3)',
          color: task.priority === 'P1' ? 'var(--primary)' : task.priority === 'P2' ? 'var(--amber)' : 'var(--text-muted)',
          fontWeight: 500,
        }}>
          {task.priority}
        </span>
        {task.timeEstimate && <span style={{ fontSize: 12, color: 'var(--text-muted)', padding: '4px 0' }}>{task.timeEstimate} min</span>}
      </div>
      {!confirmDelete ? (
        <button onClick={() => setConfirmDelete(true)} style={{
          background: 'none', border: 'none', color: 'var(--amber)', fontSize: 13, cursor: 'pointer', padding: '8px 0', fontFamily: 'Inter',
        }}>
          Delete task
        </button>
      ) : (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--delete-red)' }}>Confirm delete?</span>
          <button onClick={() => { deleteTask(task.id); onClose(); setConfirmDelete(false); }} style={{
            background: 'var(--delete-red)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 16px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter',
          }}>Yes</button>
          <button onClick={() => setConfirmDelete(false)} style={{
            background: 'var(--surface-3)', color: 'var(--text-primary)', border: 'none', borderRadius: 8, padding: '6px 16px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter',
          }}>No</button>
        </div>
      )}
    </BottomSheet>
  );
};

const Focus = () => {
  const { tasks, toggleTask, habits, logHabit, dayRating, setDayRating, setHabitMissReason } = useApp();
  const [tab, setTab] = useState<'today' | 'backlog'>('today');
  const [showAddTask, setShowAddTask] = useState(false);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [missReasonInputs, setMissReasonInputs] = useState<Record<string, boolean>>({});

  const todayTasks = tasks.filter(t => t.isToday);
  const backlogTasks = tasks.filter(t => !t.isToday);
  const doneCount = todayTasks.filter(t => t.completed).length;
  const habitsLogged = habits.filter(h => h.loggedToday).length;

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  const ratingLabels = ['Rough', 'Low', 'Okay', 'Good', 'Excellent'];
  const ratingColors = ['var(--text-muted)', 'var(--amber)', 'var(--text-secondary)', 'var(--teal)', 'var(--primary)'];

  const groupedBacklog = ALL_AREAS.reduce((acc, area) => {
    const areaTasks = backlogTasks.filter(t => t.area === area);
    if (areaTasks.length > 0) acc.push({ area, tasks: areaTasks });
    return acc;
  }, [] as { area: LifeArea; tasks: Task[] }[]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 22, fontWeight: 500 }}>Focus</span>
        <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{dateStr}</span>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--surface-2)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {(['today', 'backlog'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: tab === t ? 'var(--primary)' : 'transparent',
            color: tab === t ? '#fff' : 'var(--text-muted)',
            fontSize: 13, fontWeight: 500, fontFamily: 'Inter',
            transition: 'background 150ms ease, color 150ms ease',
          }}>
            {t === 'today' ? 'Today' : 'Backlog'}
          </button>
        ))}
      </div>

      {tab === 'today' ? (
        <>
          {/* Tasks */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 16, fontWeight: 500 }}>Tasks</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{doneCount} of {todayTasks.length} done</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {todayTasks.map(task => (
                <div key={task.id} onClick={() => setDetailTask(task)} style={{ cursor: 'pointer' }}>
                  <div
                    className="animate-fade-in-up"
                    style={{
                      background: 'var(--surface-1)', border: '0.5px solid var(--border)',
                      borderRadius: 14, padding: '16px 20px',
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      opacity: task.completed ? 0.6 : 1, transition: 'opacity 200ms ease',
                    }}
                  >
                    <button
                      onClick={e => { e.stopPropagation(); toggleTask(task.id); }}
                      style={{
                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                        border: task.completed ? 'none' : '1.5px solid var(--border-strong)',
                        background: task.completed ? 'var(--primary)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', marginTop: 1, transition: 'background 200ms ease',
                      }}
                    >
                      {task.completed && Icons.check()}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 14, fontWeight: 500, color: 'var(--text-primary)',
                        textDecoration: task.completed ? 'line-through' : 'none',
                      }}>{task.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: AREA_COLORS[task.area] }} />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{AREA_SHORT[task.area]}</span>
                        <span style={{
                          fontSize: 11, padding: '2px 8px', borderRadius: 20,
                          background: task.priority === 'P1' ? 'var(--primary-muted-bg)' : 'var(--amber-muted-bg)',
                          color: task.priority === 'P1' ? 'var(--primary)' : 'var(--amber)',
                          fontWeight: 500,
                        }}>{task.priority}</span>
                      </div>
                    </div>
                    {task.timeEstimate && <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{task.timeEstimate}m</span>}
                  </div>
                </div>
              ))}
            </div>
            {/* Completion streak bar */}
            <div style={{ marginTop: 16 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Completion streak: 12 days</span>
              <div style={{ height: 4, borderRadius: 2, background: 'var(--border)', marginTop: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(12/30)*100}%`, background: 'var(--teal)', borderRadius: 2, transition: 'width 300ms ease' }} />
              </div>
            </div>
          </div>

          {/* Habits */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 16, fontWeight: 500 }}>Habits</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{habitsLogged} of {habits.length} logged</span>
            </div>
            {habits.map(habit => {
              const areaColor = AREA_COLORS[habit.area];
              const hasMissedToday = habit.last7[6] === 'missed';
              return (
                <div key={habit.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>{habit.name}</div>
                      <span style={{
                        fontSize: 12, padding: '2px 8px', borderRadius: 20, display: 'inline-block', marginTop: 4,
                        background: `color-mix(in srgb, ${areaColor} 15%, transparent)`, color: areaColor,
                      }}>{AREA_SHORT[habit.area]}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      {habit.last7.map((d, i) => (
                        <div key={i} style={{
                          width: 12, height: 12, borderRadius: '50%',
                          background: d === 'done' ? areaColor : 'transparent',
                          border: d === 'done' ? 'none' :
                            d === 'pending' ? `1.5px solid var(--primary)` :
                            `1.5px solid color-mix(in srgb, ${areaColor} 40%, transparent)`,
                          animation: d === 'pending' && !habit.loggedToday ? 'pulse-dot 1.5s ease-in-out infinite' : undefined,
                        }} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {Icons.flame()}
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{habit.streak}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>days</span>
                    </div>
                    <div
                      onClick={() => !habit.loggedToday && logHabit(habit.id)}
                      className={!habit.loggedToday ? 'interactive' : ''}
                      style={{
                        padding: '8px 16px', borderRadius: 8, cursor: habit.loggedToday ? 'default' : 'pointer',
                        background: habit.loggedToday ? 'var(--teal-muted-bg)' : 'var(--primary-muted-bg)',
                        color: habit.loggedToday ? 'var(--teal)' : 'var(--primary)',
                        fontSize: 12, fontWeight: 500, flexShrink: 0,
                      }}
                    >
                      {habit.loggedToday ? 'Done ✓' : 'Log'}
                    </div>
                  </div>
                  {/* Missed habit reason */}
                  {habit.last7.includes('missed') && !habit.loggedToday && (
                    <div style={{ paddingBottom: 8 }}>
                      {!missReasonInputs[habit.id] ? (
                        <button onClick={() => setMissReasonInputs(p => ({ ...p, [habit.id]: true }))} style={{
                          fontSize: 11, color: 'var(--amber)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter',
                        }}>Why did you miss this?</button>
                      ) : (
                        <input
                          autoFocus
                          placeholder="Quick reason..."
                          onBlur={e => { setHabitMissReason(habit.id, e.target.value); setMissReasonInputs(p => ({ ...p, [habit.id]: false })); }}
                          onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                          style={{
                            fontSize: 12, background: 'var(--surface-3)', border: '0.5px solid var(--border)',
                            borderRadius: 6, padding: '6px 10px', color: 'var(--text-primary)', outline: 'none', width: '100%', fontFamily: 'Inter',
                          }}
                        />
                      )}
                    </div>
                  )}
                  <div style={{ height: 0.5, background: 'var(--border)' }} />
                </div>
              );
            })}
          </div>

          {/* Day Rating */}
          <div>
            <div style={{ marginBottom: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 500 }}>How was today?</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Optional · takes 1 second</span>
            <div style={{ display: 'flex', gap: 12, marginTop: 16, justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map(r => (
                <div key={r} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => setDayRating(r)}
                    style={{
                      width: 44, height: 44, borderRadius: '50%', border: dayRating === r ? 'none' : '1.5px solid var(--border-strong)',
                      background: dayRating === r ? ratingColors[r - 1] : 'transparent',
                      color: dayRating === r ? '#fff' : ratingColors[r - 1],
                      fontSize: 18, fontWeight: 500, cursor: 'pointer',
                      transform: dayRating === r ? 'scale(1.1)' : 'scale(1)',
                      transition: 'transform 200ms ease, background 200ms ease',
                      fontFamily: 'Inter', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {r}
                  </button>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: dayRating === r ? 500 : 400 }}>
                    {ratingLabels[r - 1]}
                  </span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', marginTop: 12 }}>
              Ratings of 1-2 will surface a Vault item tomorrow
            </p>
          </div>
        </>
      ) : (
        /* BACKLOG TAB */
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 500 }}>Backlog</span>
            <span style={{
              background: 'var(--surface-2)', borderRadius: 20, padding: '2px 10px',
              fontSize: 12, color: 'var(--text-muted)',
            }}>{backlogTasks.length}</span>
          </div>

          {/* AI suggestion */}
          <div style={{
            background: 'var(--surface-2)', border: '0.5px solid var(--border)',
            borderLeft: '2px solid var(--primary)', borderRadius: 14, padding: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              {Icons.sparkle()}
              <p style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, flex: 1 }}>
                Finance has no tasks in 14 days. Your score dropped 4 points this week. Add one?
              </p>
            </div>
            <button
              onClick={() => setShowAddTask(true)}
              className="interactive"
              style={{
                marginTop: 12, background: 'var(--primary-muted-bg)', color: 'var(--primary)',
                border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13,
                cursor: 'pointer', fontWeight: 500, fontFamily: 'Inter',
              }}
            >
              Add Finance task
            </button>
          </div>

          {/* Grouped tasks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {groupedBacklog.map(group => (
              <div key={group.area}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: AREA_COLORS[group.area] }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>{AREA_SHORT[group.area]}</span>
                  <span style={{
                    background: 'var(--surface-2)', borderRadius: 20, padding: '1px 8px',
                    fontSize: 11, color: 'var(--text-muted)',
                  }}>{group.tasks.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {group.tasks.map(task => (
                    <div key={task.id} onClick={() => setDetailTask(task)} className="interactive" style={{
                      padding: '10px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <span style={{ fontSize: 14, color: 'var(--text-primary)', flex: 1 }}>{task.title}</span>
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 20,
                        background: task.priority === 'P1' ? 'var(--primary-muted-bg)' : task.priority === 'P2' ? 'var(--amber-muted-bg)' : 'var(--surface-3)',
                        color: task.priority === 'P1' ? 'var(--primary)' : task.priority === 'P2' ? 'var(--amber)' : 'var(--text-muted)',
                        fontWeight: 500,
                      }}>{task.priority}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {groupedBacklog.length === 0 && (
              <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', padding: 32 }}>
                No backlog tasks yet. Add one!
              </p>
            )}
          </div>
        </>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowAddTask(true)}
        className="interactive"
        style={{
          position: 'fixed',
          bottom: 80,
          right: 20,
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--primary)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', zIndex: 40,
        }}
      >
        {Icons.plus()}
      </button>

      <AddTaskSheet open={showAddTask} onClose={() => setShowAddTask(false)} />
      <TaskDetailSheet task={detailTask} open={!!detailTask} onClose={() => setDetailTask(null)} />
    </div>
  );
};

export default Focus;
