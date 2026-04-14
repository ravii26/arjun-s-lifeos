import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, AREA_COLORS, type DemoPresetName, type LifeArea } from '../context/AppContext';
import { Icons } from '../components/Icons';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';

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

const DEMO_PRESETS: Array<{ key: DemoPresetName; label: string; hint: string }> = [
  { key: 'momentum', label: 'Momentum Week', hint: 'High execution and strong streaks' },
  { key: 'slump', label: 'Slump Week', hint: 'Low output and neglected signals' },
  { key: 'recovery', label: 'Recovery Week', hint: 'Stabilizing with small wins' },
];

const WALKTHROUGH_STEPS: Array<{ title: string; detail: string; route?: string }> = [
  { title: 'Daily orientation', detail: 'Start at Dashboard to see AI briefing, score pulse, and immediate focus.' },
  { title: 'Execution loop', detail: 'Move to Focus to complete today tasks and habits quickly.', route: '/focus' },
  { title: 'Learning conversion', detail: 'Use Learn resources to convert content into tasks or notes.', route: '/learn' },
  { title: 'Emotional backup', detail: 'Open Vault for difficult days and confidence resets.', route: '/vault' },
  { title: 'Weekly insight', detail: 'Finish in Review for patterns, confidence tags, and next-week commitment.', route: '/review' },
];

const Dashboard = () => {
  const {
    tasks,
    habits,
    areaScores,
    weeklyScore,
    day,
    theme,
    toggleTheme,
    pendingResourceCount,
    dayRating,
    setDayRating,
    canShowAIMessage,
    trackAIMessage,
    applyDemoPreset,
    presentationMode,
  } = useApp();
  const navigate = useNavigate();
  const todayTasks = tasks.filter(t => t.isToday);
  const doneCount = todayTasks.filter(t => t.completed).length;
  const allDone = todayTasks.length > 0 && doneCount === todayTasks.length;
  const habitsLogged = habits.filter(h => h.loggedToday).length;
  const bestStreak = habits.reduce((max, habit) => Math.max(max, habit.streak), 0);
  const relationshipsScore = areaScores.find((area) => area.area === 'Relationships')?.score ?? 0;

  const [morningDismissed, setMorningDismissed] = useState(false);
  const [eveningDismissed, setEveningDismissed] = useState(false);
  const [energy, setEnergy] = useState<string | null>(null);
  const [focusText, setFocusText] = useState('');
  const [morningSet, setMorningSet] = useState(false);
  const [eveningNote, setEveningNote] = useState('');
  const [eveningSubmitted, setEveningSubmitted] = useState(false);
  const [showVaultNudgeFromRating, setShowVaultNudgeFromRating] = useState(false);
  const [showBriefingWhy, setShowBriefingWhy] = useState(false);
  const [trackedBriefing, setTrackedBriefing] = useState(false);
  const [trackedNudge, setTrackedNudge] = useState(false);
  const [activePreset, setActivePreset] = useState<DemoPresetName | null>(null);
  const [walkthroughOpen, setWalkthroughOpen] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);
  const [presetAnimationKey, setPresetAnimationKey] = useState(0);
  const [walkthroughAnimationKey, setWalkthroughAnimationKey] = useState(0);

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

  const showBriefing = canShowAIMessage('briefing', 1);
  const showRelationshipNudge = relationshipsScore < 40 && canShowAIMessage('nudge', 2);

  const currentWalkthrough = WALKTHROUGH_STEPS[walkthroughStep];
  const isLastWalkthroughStep = walkthroughStep === WALKTHROUGH_STEPS.length - 1;

  useEffect(() => {
    if (showBriefing && !trackedBriefing) {
      trackAIMessage('briefing');
      setTrackedBriefing(true);
    }
  }, [showBriefing, trackedBriefing, trackAIMessage]);

  useEffect(() => {
    if (showRelationshipNudge && !trackedNudge) {
      trackAIMessage('nudge');
      setTrackedNudge(true);
    }
  }, [showRelationshipNudge, trackedNudge, trackAIMessage]);

  const handlePresetApply = (preset: DemoPresetName) => {
    applyDemoPreset(preset);
    setActivePreset(preset);
    setPresetAnimationKey(k => k + 1);
  };

  const handleWalkthroughOpen = () => {
    setWalkthroughStep(0);
    setWalkthroughOpen(true);
    setWalkthroughAnimationKey(k => k + 1);
    navigate('/dashboard');
  };

  const handleWalkthroughClose = () => {
    setWalkthroughOpen(false);
    setWalkthroughStep(0);
  };

  const handleWalkthroughSkipTo = (step: number) => {
    setWalkthroughStep(step);
    setWalkthroughAnimationKey(k => k + 1);
  };

  const handleWalkthroughNext = () => {
    if (isLastWalkthroughStep) {
      handleWalkthroughClose();
      return;
    }

    const nextStep = walkthroughStep + 1;
    setWalkthroughStep(nextStep);
    setWalkthroughAnimationKey(k => k + 1);
  };

  const handleWalkthroughBack = () => {
    if (walkthroughStep === 0) return;
    const previousStep = walkthroughStep - 1;
    setWalkthroughStep(previousStep);
    setWalkthroughAnimationKey(k => k + 1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Day {day} </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>of building yourself</span>
          {presentationMode && (
            <div className="presentation-mode-badge" style={{ marginLeft: 12 }}>
              ▶ Live demo
            </div>
          )}
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

      {/* Demo controls */}
      <div className="demo-section" key={presetAnimationKey} style={{
        background: presentationMode ? 'var(--primary-muted-bg)' : 'var(--surface-2)',
        border: presentationMode ? '0.5px solid var(--primary)' : '0.5px solid var(--border)',
        borderRadius: 14,
        padding: '14px 16px',
        transition: 'all 300ms ease',
      }}>
        <SectionHeader title="Demo mode" subtitle="Switch scenario and run a 2-minute guided flow" />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          {DEMO_PRESETS.map((preset) => (
            <button
              key={preset.key}
              onClick={() => handlePresetApply(preset.key)}
              style={{
                padding: '6px 12px',
                borderRadius: 20,
                border: 'none',
                cursor: 'pointer',
                background: activePreset === preset.key ? 'var(--primary)' : 'var(--surface-3)',
                color: activePreset === preset.key ? '#fff' : 'var(--text-muted)',
                fontSize: 12,
                fontWeight: 500,
                transition: 'all 200ms ease',
              }}
              title={preset.hint}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleWalkthroughOpen}
          className="interactive"
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 10,
            border: presentationMode ? 'none' : '0.5px solid var(--border)',
            background: presentationMode ? 'var(--primary)' : 'var(--surface-1)',
            color: presentationMode ? '#fff' : 'var(--text-primary)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 200ms ease',
          }}
        >
          Start guided walkthrough
        </button>
      </div>

      {/* Guided walkthrough */}
      {walkthroughOpen && (
        <div key={walkthroughAnimationKey} className="walkthrough-card" style={{
          background: 'var(--primary-muted-bg)',
          border: '0.5px solid var(--border)',
          borderLeft: '3px solid var(--primary)',
          borderRadius: 14,
          padding: '16px 18px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 500 }}>
              Walkthrough step {walkthroughStep + 1}/{WALKTHROUGH_STEPS.length}
            </span>
            <button
              onClick={handleWalkthroughClose}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}
            >
              Skip tour
            </button>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {WALKTHROUGH_STEPS.map((step, index) => (
              <button
                key={step.title}
                onClick={() => handleWalkthroughSkipTo(index)}
                style={{
                  border: 'none',
                  borderRadius: 20,
                  padding: '4px 10px',
                  fontSize: 11,
                  cursor: 'pointer',
                  background: walkthroughStep === index ? 'var(--primary)' : 'var(--surface-1)',
                  color: walkthroughStep === index ? '#fff' : 'var(--text-muted)',
                }}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>{currentWalkthrough.title}</div>
          <p style={{ margin: '6px 0 12px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {currentWalkthrough.detail}
          </p>
          {currentWalkthrough.route && (
            <button
              onClick={() => navigate(currentWalkthrough.route!)}
              style={{
                marginBottom: 10,
                border: 'none',
                borderRadius: 8,
                padding: '7px 10px',
                background: 'var(--surface-1)',
                color: 'var(--primary)',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Open page
            </button>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleWalkthroughBack}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 8,
                border: '0.5px solid var(--border)',
                background: 'var(--surface-1)',
                color: 'var(--text-muted)',
                cursor: walkthroughStep === 0 ? 'not-allowed' : 'pointer',
                opacity: walkthroughStep === 0 ? 0.5 : 1,
                transition: 'all 150ms ease',
              }}
              disabled={walkthroughStep === 0}
            >
              Back
            </button>
            <button
              onClick={handleWalkthroughNext}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 8,
                border: 'none',
                background: 'var(--primary)',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 150ms ease',
              }}
            >
              {isLastWalkthroughStep ? 'Finish tour' : 'Next'}
            </button>
          </div>
        </div>
      )}

      {/* AI Briefing */}
      {showBriefing && (
        <div style={{
          background: 'var(--surface-2)', border: '0.5px solid var(--border)',
          borderLeft: '3px solid var(--primary)', borderRadius: 14, padding: '20px 20px 20px 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {Icons.sparkle()}
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Today's briefing</span>
            </div>
            <button onClick={() => setShowBriefingWhy((v) => !v)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--primary)', fontSize: 12,
            }}>
              Why this insight?
            </button>
          </div>
          <p style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            Day {day}, Arjun. Career is your strongest area right now. Relationships is still your weakest area, so one small action there changes your balance fastest. Keep your focus on shipping one meaningful task first.
          </p>
          {showBriefingWhy && (
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Based on: current area scores, today's task completion ({doneCount}/{todayTasks.length || 0}), and recent habit logging.
            </div>
          )}
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>Day {day} · Week snapshot</div>
        </div>
      )}

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
        <StatCard value={String(weeklyScore)} label={energy ? `Energy: ${energy}` : 'Life score'} color="var(--teal)" compact />
        <StatCard value={`${bestStreak}d`} label="Best streak" color="var(--primary)" compact />
        <StatCard value={`${doneCount}/${todayTasks.length}`} label="Tasks done" color="var(--amber)" compact />
      </div>

      {/* Today's Tasks */}
      <div>
        <SectionHeader title="Today's tasks" rightText={`${doneCount} of ${todayTasks.length} done`} />
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
        <SectionHeader title="Habits" rightText={`${habitsLogged} of ${habits.length} done`} />
        {habits.map(h => <HabitRow key={h.id} habit={h} />)}
      </div>

      {/* Life Areas */}
      <div>
        <SectionHeader title="Life areas" rightText="Week snapshot" />
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
      {showRelationshipNudge && (
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
