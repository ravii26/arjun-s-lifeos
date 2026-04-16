import * as React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Sun, Moon, X } from 'lucide-react';
import { useApp } from '@/context/appState';
import { AreaCard } from '@/components/AreaCard';
import { HabitQuickRow } from '@/components/HabitQuickRow';
import { TaskCard } from '@/components/TaskCard';
import { cn } from '@/lib/utils';
import { getAreaById, scoreToWeeklyRing } from '@/lib/lifeos';
import type { HabitLog } from '@/types';

const aiBriefing =
  'Day 47, Arjun. Career is your strongest area — keep the momentum. Relationships has been quiet for 3 weeks; one small action today goes a long way. Your focus: finish the LifeOS dashboard push.';

function MorningCheckInCard() {
  const { state, dispatch } = useApp();
  const [energy, setEnergy] = React.useState<'Low' | 'Medium' | 'High' | null>(state.morningCheckIn.energy);
  const [focus, setFocus] = React.useState(state.morningCheckIn.focus);
  const [closing, setClosing] = React.useState(false);

  React.useEffect(() => {
    setEnergy(state.morningCheckIn.energy);
    setFocus(state.morningCheckIn.focus);
  }, [state.morningCheckIn.energy, state.morningCheckIn.focus]);

  if (state.morningCheckIn.dismissed && !closing) {
    return null;
  }

  const hide = () => {
    setClosing(true);
    window.setTimeout(() => {
      dispatch({ type: 'DISMISS_MORNING' });
      setClosing(false);
    }, 250);
  };

  const submit = () => {
    dispatch({
      type: 'SET_MORNING_CHECKIN',
      checkin: {
        energy,
        focus,
        dismissed: false,
      },
    });
    hide();
  };

  return (
    <div className={cn('overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--s2)] px-5 py-4 transition-all duration-250', closing ? 'max-h-0 -translate-y-1 opacity-0' : 'max-h-[420px] opacity-100')} style={{ borderLeft: '3px solid var(--primary)' }}>
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="text-[13px] font-medium text-[var(--t1)]">Morning check-in</div>
          <div className="mt-1 inline-flex rounded-full bg-[var(--s3)] px-2 py-0.5 text-[11px] text-[var(--t3)]">optional</div>
        </div>
        <button type="button" onClick={hide} className="interactive absolute right-0 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--s3)] text-[var(--t2)]">
          <X size={14} strokeWidth={1.5} />
        </button>
      </div>

      <div className="mt-4">
        <div className="text-[12px] text-[var(--t3)]">Energy today:</div>
        <div className="mt-2 flex gap-2">
          {(['Low', 'Medium', 'High'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setEnergy(item)}
              className={cn('rounded-full px-3 py-1 text-[12px] font-medium transition-colors duration-150', energy === item ? 'bg-[var(--primary-bg)] text-[var(--primary)]' : 'bg-[var(--s3)] text-[var(--t2)]')}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-[12px] text-[var(--t3)]">Today's focus:</div>
        <input
          value={focus}
          onChange={(event) => setFocus(event.target.value)}
          placeholder="What matters today?"
          className="mt-2 h-9 w-full rounded-[8px] bg-[var(--s3)] px-3 text-[14px] text-[var(--t1)] outline-none placeholder:text-[var(--t3)]"
        />
        <div className="mt-2 flex flex-wrap gap-2 text-[12px]">
          {['LifeOS build', 'DSA practice', 'Workout', 'Freelance'].map((item) => (
            <button key={item} type="button" onClick={() => setFocus(item)} className="rounded-full bg-[var(--s3)] px-3 py-1 text-[var(--t2)] transition-colors hover:text-[var(--t1)]">
              {item}
            </button>
          ))}
        </div>
      </div>

      <button type="button" onClick={submit} className="mt-4 h-8 rounded-[8px] bg-[var(--primary)] px-4 text-[13px] font-medium text-white">
        Set
      </button>
    </div>
  );
}

function EveningCheckInCard() {
  const { state, dispatch } = useApp();
  const [rating, setRating] = React.useState<number | null>(state.eveningCheckIn.rating);
  const [note, setNote] = React.useState(state.eveningCheckIn.note);
  const [closing, setClosing] = React.useState(false);

  React.useEffect(() => {
    setRating(state.eveningCheckIn.rating);
    setNote(state.eveningCheckIn.note);
  }, [state.eveningCheckIn.rating, state.eveningCheckIn.note]);

  if (state.eveningCheckIn.dismissed && !closing) {
    return null;
  }

  const hide = () => {
    setClosing(true);
    window.setTimeout(() => {
      dispatch({ type: 'DISMISS_EVENING' });
      setClosing(false);
    }, 250);
  };

  const submit = () => {
    dispatch({ type: 'SET_DAY_RATING', rating });
    dispatch({
      type: 'SET_EVENING_CHECKIN',
      checkin: {
        rating,
        note,
        dismissed: false,
      },
    });
    hide();
  };

  return (
    <div className={cn('overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--s2)] px-5 py-4 transition-all duration-250', closing ? 'max-h-0 -translate-y-1 opacity-0' : 'max-h-[320px] opacity-100')} style={{ borderLeft: '3px solid var(--primary)' }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[13px] font-medium text-[var(--t1)]">Evening check-in</div>
          <div className="mt-1 text-[11px] text-[var(--t3)]">One small reflection before you close the day.</div>
        </div>
        <button type="button" onClick={hide} className="interactive flex h-7 w-7 items-center justify-center rounded-full bg-[var(--s3)] text-[var(--t2)]">
          <X size={14} strokeWidth={1.5} />
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full border text-[13px] font-medium transition-colors duration-150',
              rating === value ? 'border-[var(--primary)] bg-[var(--primary-bg)] text-[var(--primary)]' : 'border-[var(--border)] bg-[var(--s3)] text-[var(--t2)]',
            )}
          >
            {value}
          </button>
        ))}
      </div>

      <input
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="One thing you noticed"
        className="mt-4 h-9 w-full rounded-[8px] bg-[var(--s3)] px-3 text-[14px] text-[var(--t1)] outline-none placeholder:text-[var(--t3)]"
      />

      <button type="button" onClick={submit} className="mt-4 h-8 rounded-[8px] bg-[var(--primary)] px-4 text-[13px] font-medium text-white">
        Done
      </button>
    </div>
  );
}

export function Dashboard() {
  const { state, dispatch, getTodayLogs } = useApp();
  const todayTaskCount = 3;
  const sortedTasks = [...state.tasks].sort((left, right) => {
    const priorityOrder: Record<string, number> = { P1: 0, P2: 1, P3: 2 };
    return priorityOrder[left.priority] - priorityOrder[right.priority];
  });
  const visibleTasks = sortedTasks.slice(0, 3);
  const doneTasks = visibleTasks.filter((task) => task.status === 'done').length;
  const visibleHabits = state.habits.slice(0, 3);
  const loggedHabits = visibleHabits.filter((habit) => Boolean(getTodayLogs(habit.id))).length;
  const weeklyRing = scoreToWeeklyRing(state.areas) || 74;
  const relationshipsArea = getAreaById('relationships', state.areas);
  const showVaultNudge = (relationshipsArea?.score ?? 0) < 40 || (state.eveningCheckIn.rating !== null && state.eveningCheckIn.rating <= 2);
  const [showMorning, setShowMorning] = React.useState(!state.morningCheckIn.dismissed);
  const [showEvening, setShowEvening] = React.useState(!state.eveningCheckIn.dismissed);

  React.useEffect(() => {
    setShowMorning(!state.morningCheckIn.dismissed);
  }, [state.morningCheckIn.dismissed]);

  React.useEffect(() => {
    setShowEvening(!state.eveningCheckIn.dismissed);
  }, [state.eveningCheckIn.dismissed]);
  const handleLogHabit = (habitId: string, log: HabitLog) => {
    dispatch({ type: 'LOG_HABIT', habitId, log, date: new Date().toISOString().slice(0, 10) });
  };

  return (
    <div className="space-y-6 pb-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[13px] text-[var(--t3)]">Day 47</div>
          <div className="text-[12px] text-[var(--t3)]">of building yourself</div>
        </div>
        <button type="button" onClick={() => dispatch({ type: 'TOGGLE_THEME' })} className="interactive flex h-9 w-9 items-center justify-center rounded-full bg-[var(--s2)] text-[var(--t2)]">
          {state.theme === 'dark' ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
        </button>
      </div>

      {showMorning ? <MorningCheckInCard /> : null}

      <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] px-5 py-4" style={{ borderLeft: '3px solid var(--primary)' }}>
        <div className="flex items-center gap-2 text-[12px] text-[var(--t3)]">
          <Sparkles size={16} strokeWidth={1.5} className="text-[var(--primary)]" />
          Today's briefing
        </div>
        <div className="mt-3 text-[14px] italic leading-[1.65] text-[var(--t2)]">{aiBriefing}</div>
        <div className="mt-3 text-[12px] text-[var(--t3)]">Day 47 · Week 7</div>
      </section>

      <section className="flex gap-3">
        <div className="flex-1 rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-4 py-3">
          <div className="text-[20px] font-medium text-[var(--teal)]">{state.morningCheckIn.energy ? state.morningCheckIn.energy : '74'}</div>
          <div className="text-[11px] text-[var(--t3)]">{state.morningCheckIn.energy ? 'Energy' : 'Life score'}</div>
        </div>
        <div className="flex-1 rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-4 py-3">
          <div className="text-[20px] font-medium text-[var(--primary)]">23d</div>
          <div className="text-[11px] text-[var(--t3)]">Top streak</div>
        </div>
        <div className="flex-1 rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-4 py-3">
          <div className="text-[20px] font-medium text-[var(--amber)]">{doneTasks}/{todayTaskCount}</div>
          <div className="text-[11px] text-[var(--t3)]">Tasks</div>
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between text-[12px] text-[var(--t3)]">
          <div className="text-[16px] font-medium text-[var(--t1)]">Today</div>
          <div>{doneTasks} of 3 done</div>
          <Link to="/focus" className="text-[var(--primary)]">
            See all →
          </Link>
        </div>
        {doneTasks === 3 ? (
          <div className="rounded-[14px] border border-[var(--border)] bg-[var(--teal-bg)] px-4 py-5 text-[14px] font-medium text-[var(--teal)] animate-confetti-burst">
            All done today 🎯
          </div>
        ) : (
          <div className="space-y-2">
            {visibleTasks.map((task) => {
              const area = getAreaById(task.areaId, state.areas);
              const projectName = state.projects.find((project) => project.id === task.projectId)?.title;
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  areaColor={area?.color ?? 'var(--primary)'}
                  areaName={area?.name ?? task.areaId}
                  projectName={projectName}
                  onToggle={(taskId) => dispatch({ type: 'TOGGLE_TASK_STATUS', taskId })}
                  onEdit={() => undefined}
                />
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between text-[12px] text-[var(--t3)]">
          <div className="text-[16px] font-medium text-[var(--t1)]">Habits</div>
          <div>{loggedHabits} logged</div>
          <Link to="/habits" className="text-[var(--primary)]">
            See all →
          </Link>
        </div>
        <div className="space-y-2">
          {visibleHabits.map((habit) => (
            <HabitQuickRow
              key={habit.id}
              habit={habit}
              todayLog={getTodayLogs(habit.id)}
              onLog={(habitId, log) => handleLogHabit(habitId, log)}
            />
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between text-[12px] text-[var(--t3)]">
          <div className="text-[16px] font-medium text-[var(--t1)]">Life areas</div>
          <div>Week 7</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {state.areas.map((area) => (
            <AreaCard key={area.id} area={area} />
          ))}
        </div>
      </section>

      <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] px-5 py-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-[12px] text-[var(--t3)]">This week</div>
            <div className="mt-1 text-[32px] font-medium leading-none text-[var(--teal)]">{weeklyRing}</div>
          </div>
          <svg viewBox="0 0 120 120" className="h-[120px] w-[120px] -rotate-90">
            <circle cx="60" cy="60" r="46" fill="none" stroke="var(--s3)" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r="46"
              fill="none"
              stroke="var(--teal)"
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 46}`}
              strokeDashoffset={`${2 * Math.PI * 46 * (1 - weeklyRing / 100)}`}
              strokeLinecap="round"
            />
          </svg>
        </div>
      </section>

      {showVaultNudge ? (
        <section className="rounded-[14px] border border-[var(--border)] bg-[var(--primary-bg)] px-5 py-4" style={{ borderLeft: '3px solid var(--primary)' }}>
          <div className="text-[14px] italic leading-[1.65] text-[var(--t2)]">
            Relationships need one small touchpoint today. Open the Vault if you want to capture a win before the day disappears.
          </div>
          <Link to="/vault" className="mt-3 inline-flex h-8 items-center rounded-full border border-[var(--border)] px-3 text-[12px] font-medium text-[var(--primary)]">
            Open Vault →
          </Link>
        </section>
      ) : null}

      {showEvening || new Date().getHours() >= 19 ? <EveningCheckInCard /> : null}
    </div>
  );
}
