import * as React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Sun, Moon, X } from 'lucide-react';
import { useApp } from '@/context/appState';
import { AreaCard } from '@/components/AreaCard';
import { HabitQuickRow } from '@/components/HabitQuickRow';
import { TaskCard } from '@/components/TaskCard';
import { getAreaById, isoDate, scoreToWeeklyRing } from '@/lib/lifeos';
import type { HabitLog, Task } from '@/types';

const briefing =
  'Day 47, Arjun. Career is your strongest area right now. Relationships has been quiet for 3 weeks. Keep momentum with one meaningful action.';

function MorningCard() {
  const { state, dispatch } = useApp();
  const [energy, setEnergy] = React.useState(state.morningCheckIn.energy);
  const [focus, setFocus] = React.useState(state.morningCheckIn.focus);

  if (state.morningCheckIn.dismissed) return null;

  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-4" style={{ borderLeft: '3px solid var(--primary)' }}>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[13px] font-medium text-[var(--t1)]">Morning check-in</div>
        <button type="button" onClick={() => dispatch({ type: 'DISMISS_MORNING' })} className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--s3)] text-[var(--t2)]">
          <X size={14} strokeWidth={1.5} />
        </button>
      </div>
      <div className="mb-2 flex gap-2">
        {(['Low', 'Medium', 'High'] as const).map((item) => (
          <button key={item} type="button" onClick={() => setEnergy(item)} className={energy === item ? 'rounded-full bg-[var(--primary-bg)] px-3 py-1 text-[12px] text-[var(--primary)]' : 'rounded-full bg-[var(--s3)] px-3 py-1 text-[12px] text-[var(--t2)]'}>
            {item}
          </button>
        ))}
      </div>
      <input value={focus} onChange={(event) => setFocus(event.target.value)} placeholder="Today's focus" className="h-9 w-full rounded-[8px] bg-[var(--s3)] px-3 text-[13px] outline-none" />
      <button
        type="button"
        onClick={() => dispatch({ type: 'SET_MORNING_CHECKIN', checkin: { energy, focus, dismissed: false } })}
        className="mt-3 h-8 rounded-[8px] bg-[var(--primary)] px-3 text-[12px] font-medium text-white"
      >
        Set
      </button>
    </div>
  );
}

function EveningCard() {
  const { state, dispatch } = useApp();
  const [rating, setRating] = React.useState<number | null>(state.eveningCheckIn.rating);
  const [note, setNote] = React.useState(state.eveningCheckIn.note);
  const showEvening = new Date().getHours() >= 19 && !state.eveningCheckIn.dismissed;

  if (!showEvening) return null;

  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-4" style={{ borderLeft: '3px solid var(--primary)' }}>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[13px] font-medium text-[var(--t1)]">Evening check-in</div>
        <button type="button" onClick={() => dispatch({ type: 'DISMISS_EVENING' })} className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--s3)] text-[var(--t2)]">
          <X size={14} strokeWidth={1.5} />
        </button>
      </div>
      <div className="mb-2 flex gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button key={value} type="button" onClick={() => setRating(value)} className={rating === value ? 'h-8 w-8 rounded-full bg-[var(--primary-bg)] text-[12px] text-[var(--primary)]' : 'h-8 w-8 rounded-full bg-[var(--s3)] text-[12px] text-[var(--t2)]'}>
            {value}
          </button>
        ))}
      </div>
      <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="One thing you noticed" className="h-9 w-full rounded-[8px] bg-[var(--s3)] px-3 text-[13px] outline-none" />
      <button
        type="button"
        onClick={() => dispatch({ type: 'SET_EVENING_CHECKIN', checkin: { rating, note, dismissed: false } })}
        className="mt-3 h-8 rounded-[8px] bg-[var(--primary)] px-3 text-[12px] font-medium text-white"
      >
        Save
      </button>
    </div>
  );
}

export function Dashboard() {
  const { state, dispatch, getTodayLogs } = useApp();
  const today = isoDate(new Date());
  const todayTasks = state.tasks.filter((task) => task.dueDate === today || (!task.dueDate && task.status !== 'done'));
  const doneCount = todayTasks.filter((task) => task.status === 'done').length;
  const allDone = todayTasks.length > 0 && doneCount === todayTasks.length;
  const topTasks = [...todayTasks].slice(0, 5);
  const habits = state.habits.slice(0, 3);
  const loggedHabits = habits.filter((habit) => Boolean(getTodayLogs(habit.id))).length;
  const weeklyScore = scoreToWeeklyRing(state.areas);
  const pendingResources = state.resources.filter((resource) => resource.status === 'pending').length;
  const lowEvening = state.eveningCheckIn.rating !== null && state.eveningCheckIn.rating <= 2;

  const logHabit = (habitId: string, log: HabitLog) => dispatch({ type: 'LOG_HABIT', habitId, log, date: today });

  return (
    <div className="space-y-6 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[13px] text-[var(--t3)]">Day 47</div>
          <div className="text-[12px] text-[var(--t3)]">of building yourself</div>
        </div>
        <button type="button" onClick={() => dispatch({ type: 'TOGGLE_THEME' })} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--s2)] text-[var(--t2)]">
          {state.theme === 'dark' ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
        </button>
      </div>

      <MorningCard />

      <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-4" style={{ borderLeft: '3px solid var(--primary)' }}>
        <div className="mb-2 flex items-center gap-2 text-[12px] text-[var(--primary)]">
          <Sparkles size={14} strokeWidth={1.5} />
          Today's briefing
        </div>
        <div className="text-[14px] italic text-[var(--t2)]">{briefing}</div>
      </section>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-[10px] bg-[var(--s2)] p-3 text-center">
          <div className="text-[20px] font-medium text-[var(--teal)]">{state.morningCheckIn.energy ?? weeklyScore}</div>
          <div className="text-[11px] text-[var(--t3)]">{state.morningCheckIn.energy ? 'Energy' : 'Life score'}</div>
        </div>
        <div className="rounded-[10px] bg-[var(--s2)] p-3 text-center">
          <div className="text-[20px] font-medium text-[var(--primary)]">{Math.max(...state.habits.map((habit) => habit.streak), 0)}d</div>
          <div className="text-[11px] text-[var(--t3)]">Best streak</div>
        </div>
        <div className="rounded-[10px] bg-[var(--s2)] p-3 text-center">
          <div className="text-[20px] font-medium text-[var(--amber)]">{doneCount}/{todayTasks.length}</div>
          <div className="text-[11px] text-[var(--t3)]">Tasks done</div>
        </div>
      </div>

      <section className="space-y-2">
        <div className="flex items-center justify-between text-[12px] text-[var(--t3)]">
          <div className="text-[16px] font-medium text-[var(--t1)]">Today's tasks</div>
          <div>{doneCount} of {todayTasks.length} done</div>
        </div>
        {allDone ? (
          <div className="rounded-[14px] bg-[var(--teal)] p-5 text-[14px] text-white">All done today 🎯</div>
        ) : (
          <div className="space-y-2">
            {topTasks.map((task) => {
              const area = getAreaById(task.areaId, state.areas);
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  areaColor={area?.color ?? 'var(--primary)'}
                  areaName={area?.name ?? task.areaId}
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
          <div>{loggedHabits} of {habits.length} logged</div>
        </div>
        <div className="space-y-2">
          {habits.map((habit) => <HabitQuickRow key={habit.id} habit={habit} todayLog={getTodayLogs(habit.id)} onLog={logHabit} />)}
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between text-[12px] text-[var(--t3)]">
          <div className="text-[16px] font-medium text-[var(--t1)]">Life areas</div>
          <div>Week 7</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {state.areas.map((area) => <AreaCard key={area.id} area={area} />)}
        </div>
      </section>

      {pendingResources > 0 ? (
        <Link to="/learn" className="block rounded-[14px] bg-[var(--amber-bg)] p-3 text-[13px] text-[var(--amber)]">
          {pendingResources} resources waiting for decision →
        </Link>
      ) : null}

      {lowEvening ? (
        <Link to="/vault" className="block rounded-[14px] bg-[var(--primary-bg)] p-4 text-[13px] italic text-[var(--t2)]" style={{ borderLeft: '3px solid var(--primary)' }}>
          Your vault has something for hard days →
        </Link>
      ) : null}

      <EveningCard />
    </div>
  );
}

export default Dashboard;
