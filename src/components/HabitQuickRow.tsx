import * as React from 'react';
import { ArrowRight, Check, Minus, Plus, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Habit, HabitLog } from '@/types';
import { cn } from '@/lib/utils';
import { getTodayHabitStatusFromHabit, habitGoalLabel, habitProgressValue } from '@/lib/lifeos';

interface HabitQuickRowProps {
  habit: Habit;
  todayLog?: HabitLog;
  onLog: (habitId: string, log: HabitLog) => void;
}

export function HabitQuickRow({ habit, todayLog, onLog }: HabitQuickRowProps) {
  const status = getTodayHabitStatusFromHabit(habit);
  const [amountValue, setAmountValue] = React.useState(todayLog?.value ?? 0);
  const [timerActive, setTimerActive] = React.useState(false);
  const [timerSeconds, setTimerSeconds] = React.useState(todayLog?.seconds ?? 0);

  React.useEffect(() => {
    setAmountValue(todayLog?.value ?? 0);
    setTimerSeconds(todayLog?.seconds ?? 0);
  }, [todayLog?.value, todayLog?.seconds]);

  React.useEffect(() => {
    if (!timerActive) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setTimerSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timerActive]);

  const commitAmount = () => {
    onLog(habit.id, { date: todayLog?.date ?? new Date().toISOString().slice(0, 10), value: amountValue });
  };

  const commitTimer = () => {
    onLog(habit.id, { date: todayLog?.date ?? new Date().toISOString().slice(0, 10), seconds: timerSeconds, done: timerSeconds >= (habit.timerGoalSeconds ?? 0) });
  };

  const renderDots = () => {
    const recentLogs = habit.logs.slice(-7);
    const dots = Array.from({ length: 7 }, (_, index) => recentLogs[index]);
    return (
      <div className="flex items-center gap-1">
        {dots.map((log, index) => {
          const isToday = index === dots.length - 1;
          const completed = habit.trackingType === 'boolean' ? log?.done : habit.trackingType === 'amount' ? (log?.value ?? 0) >= (habit.amountGoal ?? 0) : habit.trackingType === 'timer' ? (log?.seconds ?? 0) >= (habit.timerGoalSeconds ?? 0) : (log?.currentValue ?? 0) >= (habit.progressGoal ?? 0);
          return (
            <span
              key={`${habit.id}-dot-${index}`}
              className={cn('h-2.5 w-2.5 rounded-full border border-[var(--border)]', completed ? 'bg-[var(--primary)]' : 'bg-[var(--s3)]', isToday ? 'ring-1 ring-[var(--border-strong)]' : '')}
            />
          );
        })}
      </div>
    );
  };

  if (habit.trackingType === 'amount') {
    return (
      <div className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-medium text-[var(--t1)]">{habit.name}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[var(--t3)]">
              <span className={cn('rounded-full px-2 py-0.5', habit.direction === 'build' ? 'bg-[var(--teal-bg)] text-[var(--teal)]' : 'bg-[var(--coral-bg)] text-[var(--coral)]')}>
                {habit.direction === 'build' ? 'Build' : 'Quit'}
              </span>
              <span className="rounded-full bg-[var(--s3)] px-2 py-0.5">{habit.areaId}</span>
            </div>
          </div>
          <button type="button" onClick={() => onLog(habit.id, { date: new Date().toISOString().slice(0, 10), value: amountValue })} className="interactive flex h-8 w-8 items-center justify-center rounded-full bg-[var(--s3)] text-[var(--t1)]">
            <ArrowRight size={16} strokeWidth={1.5} />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 rounded-full bg-[var(--s3)]">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
              style={{ width: `${Math.min(100, ((todayLog?.value ?? amountValue) / (habit.amountGoal ?? 1)) * 100)}%` }}
            />
          </div>
          <span className="text-[12px] text-[var(--t3)]">{todayLog?.value ?? amountValue} / {habit.amountGoal} {habit.amountUnit}</span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setAmountValue((value) => Math.max(0, value - 1))} className="interactive flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--s3)] text-[var(--t2)]">
              <Minus size={14} strokeWidth={1.5} />
            </button>
            <div className="min-w-8 text-center text-[16px] font-medium text-[var(--t1)]">{amountValue}</div>
            <button type="button" onClick={() => setAmountValue((value) => value + 1)} className="interactive flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--s3)] text-[var(--t2)]">
              <Plus size={14} strokeWidth={1.5} />
            </button>
          </div>
          {amountValue > 0 ? (
            <button type="button" onClick={commitAmount} className="interactive h-7 rounded-full bg-[var(--primary)] px-3 text-[11px] font-medium text-white">
              Log
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  if (habit.trackingType === 'timer') {
    return (
      <div className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-medium text-[var(--t1)]">{habit.name}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[var(--t3)]">
              <span className={cn('rounded-full px-2 py-0.5', habit.direction === 'build' ? 'bg-[var(--teal-bg)] text-[var(--teal)]' : 'bg-[var(--coral-bg)] text-[var(--coral)]')}>
                {habit.direction === 'build' ? 'Build' : 'Quit'}
              </span>
              <span className="rounded-full bg-[var(--s3)] px-2 py-0.5">{habit.areaId}</span>
              <span className="rounded-full bg-[var(--s3)] px-2 py-0.5">{habitGoalLabel(habit)}</span>
            </div>
          </div>
          <button type="button" onClick={() => setTimerActive((value) => !value)} className="interactive flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-white">
            <Play size={16} strokeWidth={1.5} fill="currentColor" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-[12px] text-[var(--t3)]">
          <span>{timerSeconds > 0 ? `${Math.round(timerSeconds / 60)}m done` : 'Tap play to start'}</span>
          <span>{habit.timerGoalSeconds ? `${Math.round(timerSeconds / 60)} / ${Math.round(habit.timerGoalSeconds / 60)}m` : ''}</span>
        </div>

        {timerActive ? (
          <div className="mt-3 flex items-center gap-2">
            <button type="button" onClick={() => setTimerActive(false)} className="interactive flex h-8 w-8 items-center justify-center rounded-full bg-[var(--s3)] text-[var(--t1)]">
              <Check size={14} strokeWidth={1.5} />
            </button>
            <button type="button" onClick={commitTimer} className="interactive h-8 rounded-full bg-[var(--primary)] px-3 text-[11px] font-medium text-white">
              Log
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  if (habit.trackingType === 'progress') {
    return (
      <div className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-medium text-[var(--t1)]">{habit.name}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[var(--t3)]">
              <span className={cn('rounded-full px-2 py-0.5', habit.direction === 'build' ? 'bg-[var(--teal-bg)] text-[var(--teal)]' : 'bg-[var(--coral-bg)] text-[var(--coral)]')}>
                {habit.direction === 'build' ? 'Build' : 'Quit'}
              </span>
              <span className="rounded-full bg-[var(--s3)] px-2 py-0.5">{habit.areaId}</span>
            </div>
          </div>
          <button type="button" onClick={() => onLog(habit.id, { date: new Date().toISOString().slice(0, 10), currentValue: habit.progressCurrent ?? 0 })} className="interactive rounded-full bg-[var(--primary)] px-3 py-1 text-[11px] font-medium text-white">
            Update
          </button>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-[12px] text-[var(--t3)]">
            <span>{habit.progressCurrent?.toLocaleString() ?? 0} / {habit.progressGoal?.toLocaleString()} {habit.progressUnit}</span>
            <span>{habit.progressGoal ? `${Math.round(((habit.progressCurrent ?? 0) / habit.progressGoal) * 100)}%` : '0%'}</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-[var(--s3)]">
            <div className="h-full rounded-full bg-[var(--teal)] transition-all duration-300" style={{ width: `${Math.min(100, ((habit.progressCurrent ?? 0) / (habit.progressGoal ?? 1)) * 100)}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--t3)]">
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
          </div>
        </div>
      </div>
    );
  }

  const completed = status === 'done';
  return (
    <div className={cn('rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-3', completed ? 'opacity-80' : '')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-medium text-[var(--t1)]">{habit.name}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[var(--t3)]">
            <span className={cn('rounded-full px-2 py-0.5', habit.direction === 'build' ? 'bg-[var(--teal-bg)] text-[var(--teal)]' : 'bg-[var(--coral-bg)] text-[var(--coral)]')}>
              {habit.direction === 'build' ? 'Build' : 'Quit'}
            </span>
            <span className="rounded-full bg-[var(--s3)] px-2 py-0.5">{habit.areaId}</span>
          </div>
        </div>
        <Link to={`/habits/${habit.id}`} className="interactive flex h-8 w-8 items-center justify-center rounded-full bg-[var(--s3)] text-[var(--t1)]">
          <ArrowRight size={16} strokeWidth={1.5} />
        </Link>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        {renderDots()}
        <div className="flex items-center gap-1 text-[12px] text-[var(--t3)]">
          <span>{habit.streak}d</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="text-[12px] text-[var(--t3)]">{habit.trackingType === 'boolean' ? (habit.direction === 'quit' ? 'Avoid today' : 'Log today') : 'Track today'}</div>
        <button
          type="button"
          onClick={() => onLog(habit.id, { date: new Date().toISOString().slice(0, 10), done: true })}
          className={cn('interactive rounded-full px-3 py-1 text-[11px] font-medium', completed ? 'bg-[var(--teal-bg)] text-[var(--teal)]' : 'bg-[var(--primary)] text-white')}
        >
          {completed ? (habit.direction === 'quit' ? '✓ Clean' : '✓ Done') : 'Log'}
        </button>
      </div>
    </div>
  );
}
