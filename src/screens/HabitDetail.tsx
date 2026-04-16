import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Minus, MoreHorizontal, Pause, Play, Timer, TrendingUp, Plus } from 'lucide-react';
import { BottomSheet } from '@/components/BottomSheet';
import { useApp } from '@/context/appState';
import type { Habit, HabitLog } from '@/types';
import { cn } from '@/lib/utils';
import { buildRecentDates, getAreaById, getHabitLogForDate, getTodayLog, getTodayHabitStatusFromHabit, isoDate, minuteLabel } from '@/lib/lifeos';

function directionPill(direction: Habit['direction']) {
  return direction === 'build' ? 'bg-[var(--teal-bg)] text-[var(--teal)]' : 'bg-[var(--coral-bg)] text-[var(--coral)]';
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
      <div className="text-[28px] font-medium text-[var(--t1)]">{value}</div>
      <div className="mt-1 text-[12px] text-[var(--t3)]">{label}</div>
    </div>
  );
}

export function HabitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const habit = state.habits.find((item) => item.id === id);
  const [sheetDate, setSheetDate] = React.useState<string | null>(null);
  const [sheetValue, setSheetValue] = React.useState('');
  const [running, setRunning] = React.useState(false);
  const [seconds, setSeconds] = React.useState(getTodayLog(habit ?? ({} as Habit))?.seconds ?? 0);
  const [amountValue, setAmountValue] = React.useState(getTodayLog(habit ?? ({} as Habit))?.value ?? 0);
  const [progressValue, setProgressValue] = React.useState(habit?.progressCurrent ?? 0);

  React.useEffect(() => {
    if (!running) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [running]);

  React.useEffect(() => {
    setSeconds(getTodayLog(habit ?? ({} as Habit))?.seconds ?? 0);
    setAmountValue(getTodayLog(habit ?? ({} as Habit))?.value ?? 0);
    setProgressValue(habit?.progressCurrent ?? 0);
  }, [habit]);

  if (!habit) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={() => navigate('/habits')} className="interactive flex h-10 w-10 items-center justify-center rounded-full bg-[var(--s2)] text-[var(--t1)]">
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
        <div className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-5 text-[var(--t2)]">Habit not found.</div>
      </div>
    );
  }

  const todayLog = getTodayLog(habit);
  const status = getTodayHabitStatusFromHabit(habit);
  const area = getAreaById(habit.areaId, state.areas);
  const recentDates = buildRecentDates(30);
  const chartValues = recentDates.map((date) => {
    const log = getHabitLogForDate(habit, date);
    if (!log) {
      return 0;
    }
    if (habit.trackingType === 'boolean') {
      return log.done ? 1 : 0;
    }
    if (habit.trackingType === 'amount') {
      return log.value ?? 0;
    }
    if (habit.trackingType === 'timer') {
      return Math.round((log.seconds ?? 0) / 60);
    }
    return log.currentValue ?? 0;
  });
  const maxValue = Math.max(1, ...chartValues);

  const saveToday = () => {
    if (habit.trackingType === 'boolean') {
      dispatch({ type: 'LOG_HABIT', habitId: habit.id, log: { date: isoDate(new Date()), done: true } });
    }
    if (habit.trackingType === 'amount') {
      dispatch({ type: 'LOG_HABIT', habitId: habit.id, log: { date: isoDate(new Date()), value: amountValue } });
    }
    if (habit.trackingType === 'timer') {
      dispatch({ type: 'LOG_HABIT', habitId: habit.id, log: { date: isoDate(new Date()), seconds, done: seconds >= (habit.timerGoalSeconds ?? 0) } });
    }
    if (habit.trackingType === 'progress') {
      dispatch({ type: 'LOG_HABIT', habitId: habit.id, log: { date: isoDate(new Date()), currentValue: progressValue } });
      dispatch({ type: 'UPDATE_HABIT', habitId: habit.id, updates: { progressCurrent: progressValue } });
    }
  };

  const openSheetForDate = (date: string) => {
    setSheetDate(date);
    const existing = getHabitLogForDate(habit, date);
    if (habit.trackingType === 'boolean') {
      setSheetValue(existing?.done ? 'done' : 'missed');
    } else if (habit.trackingType === 'amount') {
      setSheetValue(String(existing?.value ?? 0));
    } else if (habit.trackingType === 'timer') {
      setSheetValue(String(Math.round((existing?.seconds ?? 0) / 60)));
    } else {
      setSheetValue(String(existing?.currentValue ?? habit.progressCurrent ?? 0));
    }
  };

  const saveSheet = () => {
    if (!sheetDate) {
      return;
    }

    if (habit.trackingType === 'boolean') {
      dispatch({ type: 'LOG_HABIT', habitId: habit.id, date: sheetDate, log: { date: sheetDate, done: sheetValue !== 'missed' } });
    }
    if (habit.trackingType === 'amount') {
      dispatch({ type: 'LOG_HABIT', habitId: habit.id, date: sheetDate, log: { date: sheetDate, value: Number(sheetValue) } });
    }
    if (habit.trackingType === 'timer') {
      dispatch({ type: 'LOG_HABIT', habitId: habit.id, date: sheetDate, log: { date: sheetDate, seconds: Number(sheetValue) * 60 } });
    }
    if (habit.trackingType === 'progress') {
      dispatch({ type: 'LOG_HABIT', habitId: habit.id, date: sheetDate, log: { date: sheetDate, currentValue: Number(sheetValue) } });
      dispatch({ type: 'UPDATE_HABIT', habitId: habit.id, updates: { progressCurrent: Number(sheetValue) } });
    }

    setSheetDate(null);
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={() => navigate('/habits')} className="interactive flex h-10 w-10 items-center justify-center rounded-full bg-[var(--s2)] text-[var(--t1)]">
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[18px] font-medium text-[var(--t1)]">{habit.name}</div>
          <div className="mt-1 flex items-center gap-2 text-[11px]">
            <span className={cn('rounded-full px-2 py-0.5', directionPill(habit.direction))}>{habit.direction === 'build' ? 'Build' : 'Quit'}</span>
            <span className="rounded-full bg-[var(--s3)] px-2 py-0.5 text-[var(--t3)]">{area?.name ?? habit.areaId}</span>
          </div>
        </div>
        <button type="button" className="interactive flex h-10 w-10 items-center justify-center rounded-full bg-[var(--s2)] text-[var(--t2)]">
          <MoreHorizontal size={18} strokeWidth={1.5} />
        </button>
      </div>

      <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-5">
        {habit.trackingType === 'boolean' ? (
          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'LOG_HABIT', habitId: habit.id, log: { date: isoDate(new Date()), done: true } });
              }}
              className={cn('flex h-[96px] w-[96px] items-center justify-center rounded-full border-2 transition-transform duration-300', status === 'done' ? 'border-[var(--teal)] bg-[var(--teal)] text-white' : 'border-[var(--border-md)] bg-[var(--s2)] text-[var(--t3)]')}
            >
              {status === 'done' ? <Check size={34} strokeWidth={2} /> : <span className="text-[12px] text-center">Tap to mark done</span>}
            </button>
            <div className={cn('text-[12px]', status === 'done' ? 'text-[var(--teal)]' : 'text-[var(--t3)]')}>{status === 'done' ? 'Done today ✓' : 'Tap to mark done'}</div>
          </div>
        ) : null}

        {habit.trackingType === 'amount' ? (
          <div className="space-y-4">
            <div className="text-center text-[48px] font-medium text-[var(--t1)]">{amountValue}</div>
            <div className="flex items-center justify-center gap-4">
              <button type="button" onClick={() => setAmountValue((current) => Math.max(0, current - 1))} className="interactive flex h-12 w-12 items-center justify-center rounded-full bg-[var(--s3)] text-[var(--t1)]">
                <Minus size={18} strokeWidth={1.5} />
              </button>
              <button type="button" onClick={() => setAmountValue((current) => current + 1)} className="interactive flex h-12 w-12 items-center justify-center rounded-full bg-[var(--s3)] text-[var(--t1)]">
                <Plus size={18} strokeWidth={1.5} />
              </button>
            </div>
            <div className="h-3 rounded-full bg-[var(--s3)]">
              <div className="h-full rounded-full bg-[var(--primary)] transition-all duration-300" style={{ width: `${Math.min(100, (amountValue / (habit.amountGoal ?? 1)) * 100)}%` }} />
            </div>
            <button type="button" onClick={saveToday} className="h-11 w-full rounded-[12px] bg-[var(--primary)] text-[14px] font-medium text-white">
              Log {amountValue} {habit.amountUnit}
            </button>
          </div>
        ) : null}

        {habit.trackingType === 'timer' ? (
          <div className="space-y-4 text-center">
            <div className="text-[48px] font-medium text-[var(--t1)]">{new Date(seconds * 1000).toISOString().slice(11, 19)}</div>
            <div className="flex justify-center gap-3">
              <button type="button" onClick={() => setRunning((value) => !value)} className="interactive flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-white">
                {running ? <Pause size={18} strokeWidth={1.5} /> : <Play size={18} strokeWidth={1.5} fill="currentColor" />}
              </button>
              <button type="button" onClick={() => { setRunning(false); saveToday(); }} className="interactive flex h-14 w-14 items-center justify-center rounded-full bg-[var(--s3)] text-[var(--t1)]">
                <Timer size={18} strokeWidth={1.5} />
              </button>
            </div>
            <div className="h-3 rounded-full bg-[var(--s3)]">
              <div className="h-full rounded-full bg-[var(--teal)] transition-all duration-300" style={{ width: `${Math.min(100, (seconds / (habit.timerGoalSeconds ?? 1)) * 100)}%` }} />
            </div>
            <div className="text-[12px] text-[var(--t3)]">{seconds ? `${Math.round(seconds / 60)}m / ${Math.round((habit.timerGoalSeconds ?? 0) / 60)}m goal` : 'Start the timer when ready.'}</div>
          </div>
        ) : null}

        {habit.trackingType === 'progress' ? (
          <div className="space-y-4">
            <div className="text-center text-[48px] font-medium text-[var(--t1)]">{progressValue.toLocaleString()}{habit.progressUnit}</div>
            <div className="h-3 rounded-full bg-[var(--s3)]">
              <div className="h-full rounded-full bg-[var(--teal)] transition-all duration-300" style={{ width: `${Math.min(100, (progressValue / (habit.progressGoal ?? 1)) * 100)}%` }} />
            </div>
            <div className="flex justify-center gap-3">
              <button type="button" onClick={() => setSheetDate(isoDate(new Date()))} className="interactive rounded-full bg-[var(--primary)] px-4 py-2 text-[13px] font-medium text-white">
                Update
              </button>
              <button type="button" onClick={() => setProgressValue(habit.progressStart ?? 0)} className="interactive rounded-full bg-[var(--s3)] px-4 py-2 text-[13px] font-medium text-[var(--t1)]">
                Reset
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="grid grid-cols-3 gap-3">
        <StatCard label="Current streak" value={`${habit.streak}d`} />
        <StatCard label="Best streak" value={`${habit.bestStreak}d`} />
        <StatCard label="Total logged" value={`${habit.logs.length}`} />
      </section>

      <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
        <div className="mb-3 text-[16px] font-medium text-[var(--t1)]">30-day calendar</div>
        <div className="grid grid-cols-7 gap-2">
          {recentDates.map((date) => {
            const log = getHabitLogForDate(habit, date);
            const isToday = date === isoDate(new Date());
            const completed = habit.trackingType === 'boolean' ? !!log?.done : habit.trackingType === 'amount' ? (log?.value ?? 0) >= (habit.amountGoal ?? 0) : habit.trackingType === 'timer' ? (log?.seconds ?? 0) >= (habit.timerGoalSeconds ?? 0) : (log?.currentValue ?? 0) >= (habit.progressGoal ?? 0);
            return (
              <button
                key={date}
                type="button"
                onClick={() => openSheetForDate(date)}
                className={cn('flex h-9 w-9 items-center justify-center rounded-[10px] border text-[11px] transition-colors', completed ? 'border-[var(--primary)] bg-[var(--primary-bg)] text-[var(--primary)]' : 'border-[var(--border)] bg-[var(--s2)] text-[var(--t3)]', isToday ? 'ring-1 ring-[var(--primary)]' : '')}
              >
                {new Date(date).getDate()}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
        <div className="mb-3 text-[16px] font-medium text-[var(--t1)]">History</div>
        <svg viewBox="0 0 320 140" className="h-[140px] w-full">
          {chartValues.map((value, index) => {
            const x = 10 + index * 10;
            const height = Math.max(4, (value / maxValue) * 100);
            const y = 120 - height;
            return <rect key={`${habit.id}-bar-${index}`} x={x} y={y} width="6" height={height} rx="3" fill="var(--primary)" opacity={value ? 1 : 0.25} />;
          })}
          <line x1="8" y1="120" x2="312" y2="120" stroke="var(--border)" strokeWidth="1" />
        </svg>
      </section>

      <BottomSheet isOpen={sheetDate !== null} onClose={() => setSheetDate(null)} title={sheetDate ? `Log ${sheetDate}` : undefined}>
        <div className="space-y-3">
          <div className="text-[12px] text-[var(--t3)]">Edit the selected log.</div>
          {habit.trackingType === 'boolean' ? (
            <div className="flex gap-2">
              <button type="button" onClick={() => setSheetValue('done')} className={cn('rounded-full px-3 py-1 text-[12px]', sheetValue === 'done' ? 'bg-[var(--primary-bg)] text-[var(--primary)]' : 'bg-[var(--s3)] text-[var(--t2)]')}>
                Done
              </button>
              <button type="button" onClick={() => setSheetValue('missed')} className={cn('rounded-full px-3 py-1 text-[12px]', sheetValue === 'missed' ? 'bg-[var(--amber-bg)] text-[var(--amber)]' : 'bg-[var(--s3)] text-[var(--t2)]')}>
                Missed
              </button>
            </div>
          ) : null}
          <input
            value={sheetValue}
            onChange={(event) => setSheetValue(event.target.value)}
            type={habit.trackingType === 'boolean' ? 'text' : 'number'}
            className="h-10 w-full rounded-[10px] bg-[var(--s3)] px-3 text-[14px] text-[var(--t1)] outline-none"
          />
          <button type="button" onClick={saveSheet} className="h-10 w-full rounded-[10px] bg-[var(--primary)] text-[13px] font-medium text-white">
            Save
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
