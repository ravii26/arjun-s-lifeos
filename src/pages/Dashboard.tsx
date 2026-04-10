import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, AREA_COLORS, type LifeArea } from '../context/AppContext';
import { Icons } from '../components/Icons';

const AREA_SHORT: Record<LifeArea, string> = {
  'Career & Skills': 'Career', 'Health & Body': 'Health', 'Mind & Learning': 'Mind',
  'Finance': 'Finance', 'Relationships': 'Relationships', 'Creative': 'Creative',
};
const AREA_SLUGS: Record<LifeArea, string> = {
  'Career & Skills': 'career', 'Health & Body': 'health', 'Mind & Learning': 'mind',
  'Finance': 'finance', 'Relationships': 'relationships', 'Creative': 'creative',
};

const TaskCard = ({ task }: { task: ReturnType<typeof useApp>['tasks'][0] }) => {
  const { toggleTask } = useApp();
  return (
    <div className="animate-fade-in-up" style={{
      background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: 14,
      padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 12,
      opacity: task.completed ? 0.6 : 1, transition: 'opacity 200ms ease',
    }}>
      <button onClick={() => toggleTask(task.id)} className="interactive" style={{
        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
        border: task.completed ? 'none' : '1.5px solid var(--border-strong)',
        background: task.completed ? 'var(--primary)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginTop: 1,
        transition: 'background 200ms ease, border 200ms ease',
      }}>
        {task.completed && Icons.check()}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 500, color: 'var(--text-primary)',
          textDecoration: task.completed ? 'line-through' : 'none', transition: 'text-decoration 200ms ease',
        }}>{task.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: AREA_COLORS[task.area], flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{AREA_SHORT[task.area]}</span>
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 20,
            background: task.priority === 'P1' ? 'var(--primary-muted-bg)' : task.priority === 'P2' ? 'var(--amber-muted-bg)' : 'var(--surface-3)',
            color: task.priority === 'P1' ? 'var(--primary)' : task.priority === 'P2' ? 'var(--amber)' : 'var(--text-muted)',
            fontWeight: 500,
          }}>{task.priority}</span>
        </div>
      </div>
      {task.timeEstimate && (
        <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }}>{task.timeEstimate}m</span>
      )}
    </div>
  );
};

const HabitRow = ({ habit }: { habit: ReturnType<typeof useApp>['habits'][0] }) => {
  const { logHabit } = useApp();
  const areaColor = AREA_COLORS[habit.area];
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{habit.name}</div>
          <span style={{
            fontSize: 12, padding: '2px 8px', borderRadius: 20, marginTop: 4, display: 'inline-block',
            background: `color-mix(in srgb, ${areaColor} 15%, transparent)`, color: areaColor,
          }}>{AREA_SHORT[habit.area]}</span>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {habit.last7.map((day, i) => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: '50%',
              background: day === 'done' ? areaColor : 'transparent',
              border: day === 'done' ? 'none' : day === 'pending' ? '1.5px solid var(--primary)' : `1.5px solid color-mix(in srgb, ${areaColor} 40%, transparent)`,
              animation: day === 'pending' && !habit.loggedToday ? 'pulse-dot 1.5s ease-in-out infinite' : undefined,
              transition: 'background 250ms ease',
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {Icons.flame()}
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{habit.streak}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>days</span>
        </div>
        {!habit.loggedToday && (
          <button onClick={() => logHabit(habit.id)} className="interactive" style={{
            fontSize: 12, padding: '6px 12px', borderRadius: 8,
            background: 'var(--primary-muted-bg)', color: 'var(--primary)',
            border: 'none', cursor: 'pointer', fontWeight: 500, flexShrink: 0,
          }}>Log</button>
        )}
        {habit.loggedToday && (
          <span style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 500, flexShrink: 0 }}>Done ✓</span>
        )}
      </div>
      <div style={{ height: 0.5, background: 'var(--border)' }} />
    </div>
  );
};

const ScoreRing = ({ score }: { score: number }) => {
  const r = 52, circumference = 2 * Math.PI * r;
  const progress = (score / 100) * circumference;
  const color = score >= 65 ? 'var(--teal)' : score >= 35 ? 'var(--amber)' : 'var(--text-muted)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '24px 0' }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={circumference - progress}
          strokeLinecap="round" transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset 600ms ease' }} />
        <text x="60" y="60" textAnchor="middle" dominantBaseline="central"
          style={{ fill: color, fontSize: 32, fontWeight: 500, fontFamily: 'Inter' }}>{score}</text>
      </svg>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>This week</span>
    </div>
  );
};

const QUICK_FOCUSES = ['LifeOS build', 'DSA practice', 'Workout', 'Freelance'];

const Dashboard = () => {
  const { tasks, habits, areaScores, weeklyScore, day, theme, toggleTheme, pendingResourceCount, dayRating, setDayRating } = useApp();
  const navigate = useNavigate();
  const todayTasks = tasks.filter(t => t.isToday);
  const doneCount = todayTasks.filter(t => t.completed).length;
  const allDone = todayTasks.length > 0 && doneCount === todayTasks.length;
  const habitsLogged = habits.filter(h => h.loggedToday).length;

  const [morningDismissed, setMorningDismissed] = useState(false);
  const [eveningDismissed, setEveningDismissed] = useState(false);
  const [energy, setEnergy] = useState<string | null>(null);
  const [focusText, setFocusText] = useState('');
  const [morningSet, setMorningSet] = useState(false);
  const [eveningNote, setEveningNote] = useState('');
  const [eveningSubmitted, setEveningSubmitted] = useState(false);
  const [showVaultNudgeFromRating, setShowVaultNudgeFromRating] = useState(false);

  const now = new Date();
  const isEvening = now.getHours() >= 19;

  const ratingLabels = ['Rough', 'Low', 'Okay', 'Good', 'Excellent'];
  const ratingColors = ['var(--text-muted)', 'var(--amber)', 'var(--text-secondary)', 'var(--teal)', 'var(--primary)'];

  const handleEveningSubmit = () => {
    setEveningSubmitted(true);
    if (dayRating && dayRating <= 2) {
      setShowVaultNudgeFromRating(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Day {day} </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>of building yourself</span>
        </div>
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: 8 }}>
          <button onClick={toggleTheme} className="interactive" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex' }}>
            {theme === 'dark' ? Icons.sun() : Icons.moon()}
          </button>
          <button className="interactive" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex' }}>
            {Icons.more()}
          </button>
        </div>
      </div>

      {/* AI Briefing */}
      <div style={{
        background: 'var(--surface-2)', border: '0.5px solid var(--border)',
        borderLeft: '3px solid var(--primary)', borderRadius: 14, padding: '20px 20px 20px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          {Icons.sparkle()}
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Today's briefing</span>
        </div>
        <p style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          Day 47, Arjun. Career is your strongest area right now — keep the momentum. Relationships has been quiet for 3 weeks, one small action today goes a long way. Your focus: finish the LifeOS dashboard push.
        </p>
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>Day 47 · Week 7</div>
      </div>

      {/* Morning check-in */}
      {!morningDismissed && !morningSet && (
        <div style={{
          background: 'var(--surface-2)', border: '0.5px solid var(--border)',
          borderLeft: '3px solid var(--primary)', borderRadius: 14, padding: '16px 20px', position: 'relative',
        }}>
          <button onClick={() => setMorningDismissed(true)} style={{
            position: 'absolute', top: 12, right: 12, background: 'none', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer', padding: 2, display: 'flex',
          }}>{Icons.close()}</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Morning check-in</span>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--surface-3)', color: 'var(--text-muted)' }}>optional</span>
          </div>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Energy today:</span>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {['Low', 'Medium', 'High'].map(e => (
                <button key={e} onClick={() => setEnergy(e)} style={{
                  padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'Inter',
                  background: energy === e ? 'var(--primary-muted-bg)' : 'var(--surface-3)',
                  color: energy === e ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 500,
                }}>{e}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Today's focus:</span>
            <input value={focusText} onChange={e => setFocusText(e.target.value)}
              placeholder="e.g. LifeOS build"
              style={{
                width: '100%', marginTop: 8, background: 'var(--surface-3)', border: '0.5px solid var(--border)',
                borderRadius: 8, padding: '8px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'Inter',
              }}
            />
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              {QUICK_FOCUSES.map(f => (
                <button key={f} onClick={() => setFocusText(f)} style={{
                  padding: '4px 10px', borderRadius: 16, border: 'none', cursor: 'pointer',
                  background: 'var(--surface-3)', color: 'var(--text-muted)', fontSize: 11, fontFamily: 'Inter',
                }}>{f}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setMorningSet(true)} className="interactive" style={{
              padding: '8px 20px', borderRadius: 8, background: 'var(--primary)', color: '#fff',
              border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'Inter',
            }}>Set</button>
          </div>
        </div>
      )}

      {/* Evening check-in */}
      {isEvening && !eveningDismissed && !eveningSubmitted && (
        <div style={{
          background: 'var(--surface-2)', border: '0.5px solid var(--border)',
          borderLeft: '3px solid var(--primary)', borderRadius: 14, padding: '16px 20px', position: 'relative',
        }}>
          <button onClick={() => setEveningDismissed(true)} style={{
            position: 'absolute', top: 12, right: 12, background: 'none', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer', padding: 2, display: 'flex',
          }}>{Icons.close()}</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Evening check-in</span>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--surface-3)', color: 'var(--text-muted)' }}>optional</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, justifyContent: 'center' }}>
            {[1,2,3,4,5].map(r => (
              <div key={r} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <button onClick={() => setDayRating(r)} style={{
                  width: 36, height: 36, borderRadius: '50%', border: dayRating === r ? 'none' : '1.5px solid var(--border-strong)',
                  background: dayRating === r ? ratingColors[r-1] : 'transparent',
                  color: dayRating === r ? '#fff' : ratingColors[r-1],
                  fontSize: 16, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter',
                  transform: dayRating === r ? 'scale(1.1)' : 'scale(1)', transition: 'all 200ms ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{r}</button>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: dayRating === r ? 500 : 400 }}>{ratingLabels[r-1]}</span>
              </div>
            ))}
          </div>
          <input value={eveningNote} onChange={e => setEveningNote(e.target.value)}
            placeholder="One thing you noticed:"
            style={{
              width: '100%', marginBottom: 12, background: 'var(--surface-3)', border: '0.5px solid var(--border)',
              borderRadius: 8, padding: '8px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'Inter',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleEveningSubmit} className="interactive" style={{
              padding: '8px 20px', borderRadius: 8, background: 'var(--primary)', color: '#fff',
              border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'Inter',
            }}>Done</button>
          </div>
        </div>
      )}

      {/* Score pills */}
      <div style={{ display: 'flex', gap: 12 }}>
        {[
          { value: '74', label: energy ? `Energy: ${energy}` : 'Life score', color: 'var(--teal)' },
          { value: '23d', label: 'Best streak', color: 'var(--primary)' },
          { value: `${doneCount}/${todayTasks.length}`, label: 'Tasks done', color: 'var(--amber)' },
        ].map(pill => (
          <div key={pill.label} style={{
            flex: 1, background: 'var(--surface-2)', border: '0.5px solid var(--border)',
            borderRadius: 10, padding: '12px 16px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 20, fontWeight: 500, color: pill.color }}>{pill.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{pill.label}</div>
          </div>
        ))}
      </div>

      {/* Today's Tasks */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 500 }}>Today's tasks</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{doneCount} of {todayTasks.length} done</span>
        </div>
        {allDone ? (
          <div style={{
            background: 'var(--teal)', borderRadius: 14, padding: 20, textAlign: 'center',
          }}>
            <div style={{ fontSize: 16, fontWeight: 500, color: '#fff' }}>All done today 🎯</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>Great work, Arjun.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {todayTasks.map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        )}
      </div>

      {/* Habits */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 500 }}>Habits</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{habitsLogged} of {habits.length} done</span>
        </div>
        {habits.map(h => <HabitRow key={h.id} habit={h} />)}
      </div>

      {/* Life Areas */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 500 }}>Life areas</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Week 7</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {areaScores.map(area => {
            const scoreColor = area.score >= 65 ? 'var(--teal)' : area.score >= 35 ? 'var(--amber)' : 'var(--text-muted)';
            const isNeglected = area.score < 35;
            return (
              <div key={area.area}
                className={`interactive ${isNeglected ? 'animate-pulse-border' : ''}`}
                onClick={() => navigate(`/areas/${AREA_SLUGS[area.area]}`)}
                style={{
                  background: 'var(--surface-1)', border: '0.5px solid var(--border)',
                  borderLeft: `3px solid ${area.color}`, borderRadius: 14, padding: 16, cursor: 'pointer',
                }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{AREA_SHORT[area.area]}</div>
                <div style={{ fontSize: 24, fontWeight: 500, color: scoreColor, margin: '4px 0' }}>{area.score}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                  <span style={{ color: area.change > 0 ? 'var(--teal)' : area.change < 0 ? 'var(--amber)' : 'var(--text-muted)' }}>
                    {area.change > 0 ? Icons.arrowUp() : area.change < 0 ? Icons.arrowDown() : Icons.arrowFlat()}
                  </span>
                  <span style={{ fontSize: 12, color: area.change > 0 ? 'var(--teal)' : area.change < 0 ? 'var(--amber)' : 'var(--text-muted)' }}>
                    {area.change > 0 ? `+${area.change}` : area.change === 0 ? 'flat' : area.change}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{area.keyStat}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Score Ring */}
      <ScoreRing score={weeklyScore} />

      {/* Pending resources alert */}
      {pendingResourceCount > 0 && (
        <div onClick={() => navigate('/learn')} className="interactive" style={{
          background: 'var(--amber-muted-bg)', border: '0.5px solid var(--border)',
          borderRadius: 14, padding: '12px 20px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 13, color: 'var(--amber)', fontWeight: 500 }}>
            {pendingResourceCount} resource{pendingResourceCount > 1 ? 's' : ''} waiting for decision
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>→</span>
        </div>
      )}

      {/* Vault nudge from low rating */}
      {showVaultNudgeFromRating && (
        <div style={{
          background: 'var(--primary-muted-bg)', border: '0.5px solid var(--border)',
          borderLeft: '3px solid var(--primary)', borderRadius: 14, padding: 20,
        }}>
          <p style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Your vault has something for hard days →
          </p>
          <button onClick={() => navigate('/vault')} className="interactive" style={{
            marginTop: 12, background: 'transparent', border: '0.5px solid var(--border)',
            borderRadius: 8, padding: '8px 16px', color: 'var(--primary)',
            fontSize: 13, cursor: 'pointer', fontWeight: 500,
          }}>Open Vault →</button>
        </div>
      )}

      {/* Vault nudge (relationship score) */}
      {areaScores.find(a => a.area === 'Relationships')!.score < 40 && (
        <div style={{
          background: 'var(--primary-muted-bg)', border: '0.5px solid var(--border)',
          borderLeft: '3px solid var(--primary)', borderRadius: 14, padding: 20,
        }}>
          <p style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Relationships has been quiet. Your vault has something for this.
          </p>
          <button onClick={() => navigate('/vault')} className="interactive" style={{
            marginTop: 12, background: 'transparent', border: '0.5px solid var(--border)',
            borderRadius: 8, padding: '8px 16px', color: 'var(--primary)',
            fontSize: 13, cursor: 'pointer', fontWeight: 500,
          }}>Open Vault →</button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
