import * as React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Flame, Minus, Plus, Timer, TrendingUp, Zap } from 'lucide-react';
import { BottomSheet } from '@/components/BottomSheet';
import { useApp } from '@/context/appState';
import type { Habit, HabitLog } from '@/types';
import { cn } from '@/lib/utils';
import { buildRecentDates, dayShort, getAreaById, getTodayLog, getTodayHabitStatusFromHabit, isoDate } from '@/lib/lifeos';

const areaFilters = ['all', 'career', 'health', 'mind', 'finance', 'relationships', 'creative'] as const;

type AreaFilter = (typeof areaFilters)[number];

function formatDateHeading() {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date());
}

function directionClass(direction: Habit['direction']) {
  return direction === 'build' ? 'bg-[var(--teal-bg)] text-[var(--teal)]' : 'bg-[var(--coral-bg)] text-[var(--coral)]';
}

function areaPill(areaId: string) {
  return 'rounded-full bg-[var(--s3)] px-2 py-0.5 text-[11px] text-[var(--t3)]';
}

function BooleanHabitRow({ habit, onLog, highlight }: { habit: Habit; onLog: (habitId: string, log: HabitLog) => void; highlight?: boolean }) {
  const todayLog = getTodayLog(habit);
  const status = getTodayHabitStatusFromHabit(habit);
  const [missedNoteOpen, setMissedNoteOpen] = React.useState(false);
  const [missedNote, setMissedNote] = React.useState(todayLog?.note ?? '');

  const markDone = () => onLog(habit.id, { date: isoDate(new Date()), done: true });

  const recentDays = habit.logs.slice(-7);

  return (
    <div className={cn('rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4 transition-colors duration-150', highlight ? 'ring-1 ring-[var(--primary-bg)]' : '')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-medium text-[var(--t1)]">{habit.name}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
            <span className={cn('rounded-full px-2 py-0.5', directionClass(habit.direction))}>{habit.direction === 'build' ? 'Build' : 'Quit'}</span>
            <span className={areaPill(habit.areaId)}>{getAreaById(habit.areaId, useApp().state.areas)?.name ?? habit.areaId}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-[var(--t3)]">
          <Flame size={16} strokeWidth={1.5} className="text-[var(--amber)]" />
          <span className="font-medium text-[var(--t1)]">{habit.streak}d</span>
          <span>d</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          {recentDays.map((log, index) => {
            const done = !!log?.done;
            return <span key={`${habit.id}-day-${index}`} className={cn('h-2.5 w-2.5 rounded-full', done ? 'bg-[var(--primary)]' : 'bg-[var(--s3)]')} />;
          })}
        </div>
        <div className="text-[11px] text-[var(--t3)]">{status === 'missed' ? 'Missed' : status === 'done' ? 'Done' : 'Pending'}</div>
      </div>

      <div className="mt-3 border-t border-[var(--border)] pt-3">
        {status === 'done' ? (
          <div className="text-[12px] font-medium text-[var(--teal)]">{habit.direction === 'quit' ? '✓ Clean' : '✓ Done'}</div>
        ) : (
          <button type="button" onClick={markDone} className="interactive rounded-full bg-[var(--primary)] px-3 py-1 text-[11px] font-medium text-white">
            Mark done
          </button>
        )}
        {status === 'missed' ? (
          <div className="mt-3">
            <button type="button" onClick={() => setMissedNoteOpen((value) => !value)} className="text-[11px] text-[var(--amber)]">
              + Why missed?
            </button>
            <div className={cn('overflow-hidden transition-all duration-200', missedNoteOpen ? 'mt-2 max-h-24 opacity-100' : 'max-h-0 opacity-0')}>
              <textarea
                value={missedNote}
                onChange={(event) => setMissedNote(event.target.value)}
                placeholder="What got in the way?"
                className="h-20 w-full rounded-[8px] bg-[var(--s3)] px-3 py-2 text-[12px] text-[var(--t1)] outline-none"
              />
              <button
                type="button"
                onClick={() => onLog(habit.id, { date: isoDate(new Date()), done: false, note: missedNote })}
                className="mt-2 rounded-full bg-[var(--amber-bg)] px-3 py-1 text-[11px] font-medium text-[var(--amber)]"
              >
                Save note
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AmountHabitRow({ habit, onLog }: { habit: Habit; onLog: (habitId: string, log: HabitLog) => void }) {
  const todayLog = getTodayLog(habit);
  const [value, setValue] = React.useState(todayLog?.value ?? 0);

  React.useEffect(() => {
    setValue(todayLog?.value ?? 0);
  }, [todayLog?.value]);

  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-medium text-[var(--t1)]">{habit.name}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
            <span className={cn('rounded-full px-2 py-0.5', directionClass(habit.direction))}>{habit.direction === 'build' ? 'Build' : 'Quit'}</span>
            <span className={areaPill(habit.areaId)}>{getAreaById(habit.areaId, useApp().state.areas)?.name ?? habit.areaId}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setValue((current) => Math.max(0, current - 1))} className="interactive flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--s3)] text-[var(--t2)]">
            <Minus size={14} strokeWidth={1.5} />
          </button>
          <div className="min-w-8 text-center text-[16px] font-medium text-[var(--t1)]">{value}</div>
          <button type="button" onClick={() => setValue((current) => current + 1)} className="interactive flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--s3)] text-[var(--t2)]">
            <Plus size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[12px] text-[var(--t3)]">
          <span>{value} / {habit.amountGoal} {habit.amountUnit}</span>
          <span>{habit.amountGoal ? `${Math.round((value / habit.amountGoal) * 100)}%` : '0%'}</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-[var(--s3)]">
          <div className="h-full rounded-full bg-[var(--primary)] transition-all duration-300" style={{ width: `${Math.min(100, (value / (habit.amountGoal ?? 1)) * 100)}%` }} />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="text-[12px] text-[var(--t3)]">{todayLog?.value ? 'Logged today' : 'Tap log after adjusting'}</div>
        {value > 0 ? (
          <button type="button" onClick={() => onLog(habit.id, { date: isoDate(new Date()), value })} className="interactive h-7 rounded-full bg-[var(--primary)] px-3 text-[11px] font-medium text-white">
            Log
          </button>
        ) : null}
      </div>
    </div>
  );
}

function TimerHabitRow({ habit, onLog, onOpenDetail }: { habit: Habit; onLog: (habitId: string, log: HabitLog) => void; onOpenDetail: () => void }) {
  const todayLog = getTodayLog(habit);
  const [running, setRunning] = React.useState(false);
  const [seconds, setSeconds] = React.useState(todayLog?.seconds ?? 0);

  React.useEffect(() => {
    if (!running) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [running]);

  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={onOpenDetail} className="min-w-0 flex-1 text-left">
          <div className="text-[14px] font-medium text-[var(--t1)]">{habit.name}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
            <span className={cn('rounded-full px-2 py-0.5', directionClass(habit.direction))}>{habit.direction === 'build' ? 'Build' : 'Quit'}</span>
            <span className={areaPill(habit.areaId)}>{getAreaById(habit.areaId, useApp().state.areas)?.name ?? habit.areaId}</span>
          </div>
        </button>
        <button type="button" onClick={() => setRunning((value) => !value)} className="interactive flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-white">
          <Timer size={16} strokeWidth={1.5} />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between text-[12px] text-[var(--t3)]">
        <span>{todayLog?.seconds ? `${Math.round(todayLog.seconds / 60)}m done ✓` : `${Math.round(seconds / 60)}m / ${Math.round((habit.timerGoalSeconds ?? 0) / 60)}m`}</span>
        <span>{running ? 'Running' : 'Stopped'}</span>
      </div>

      {running ? (
        <div className="mt-3 flex items-center gap-2">
          <button type="button" onClick={() => setRunning(false)} className="interactive h-9 rounded-full bg-[var(--s3)] px-3 text-[11px] font-medium text-[var(--t1)]">
            Pause
          </button>
          <button type="button" onClick={() => { setRunning(false); onLog(habit.id, { date: isoDate(new Date()), seconds }); }} className="interactive h-9 rounded-full bg-[var(--primary)] px-3 text-[11px] font-medium text-white">
            Stop
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ProgressHabitRow({ habit, onLog }: { habit: Habit; onLog: (habitId: string, log: HabitLog) => void }) {
  const [current, setCurrent] = React.useState(habit.progressCurrent ?? 0);

  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-medium text-[var(--t1)]">{habit.name}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
            <span className={cn('rounded-full px-2 py-0.5', directionClass(habit.direction))}>{habit.direction === 'build' ? 'Build' : 'Quit'}</span>
            <span className={areaPill(habit.areaId)}>{getAreaById(habit.areaId, useApp().state.areas)?.name ?? habit.areaId}</span>
          </div>
        </div>
        <button type="button" onClick={() => onLog(habit.id, { date: isoDate(new Date()), currentValue: current })} className="interactive rounded-full bg-[var(--primary)] px-3 py-1 text-[11px] font-medium text-white">
          Update
        </button>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[12px] text-[var(--t3)]">
          <span>{current.toLocaleString()} / {(habit.progressGoal ?? 0).toLocaleString()} {habit.progressUnit}</span>
          <span>{habit.progressGoal ? `${Math.round((current / habit.progressGoal) * 100)}%` : '0%'}</span>
        </div>
        <div className="mt-2 h-2.5 rounded-full bg-[var(--s3)]">
          <div className="h-full rounded-full bg-[var(--teal)] transition-all duration-300" style={{ width: `${Math.min(100, (current / (habit.progressGoal ?? 1)) * 100)}%` }} />
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

export function Habits() {
  const { state, dispatch, getTodayLogs } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightHabitId = searchParams.get('new');
  const [areaFilter, setAreaFilter] = React.useState<AreaFilter>('all');

  const todayLogged = state.habits.filter((habit) => Boolean(getTodayLogs(habit.id))).length;
  const sortedHabits = [...state.habits].sort((left, right) => {
    const leftStatus = getTodayHabitStatusFromHabit(left) === 'done' ? 1 : 0;
    const rightStatus = getTodayHabitStatusFromHabit(right) === 'done' ? 1 : 0;
    return leftStatus - rightStatus;
  });

  const visibleHabits = sortedHabits.filter((habit) => areaFilter === 'all' ? true : habit.areaId === areaFilter);
  const todayDate = formatDateHeading();
  const recentDates = buildRecentDates(91);
  const filteredForHeatmap = areaFilter === 'all' ? state.habits : state.habits.filter((habit) => habit.areaId === areaFilter);

  const logHabit = (habitId: string, log: HabitLog) => {
    dispatch({ type: 'LOG_HABIT', habitId, log, date: isoDate(new Date()) });
  };

  const booleanHabits = visibleHabits.filter((habit) => habit.trackingType === 'boolean');
  const amountHabits = visibleHabits.filter((habit) => habit.trackingType === 'amount');
  const timerHabits = visibleHabits.filter((habit) => habit.trackingType === 'timer');
  const progressHabits = visibleHabits.filter((habit) => habit.trackingType === 'progress');

  return (
    <div className="space-y-6 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[22px] font-medium text-[var(--t1)]">Habits</div>
          <div className="text-[12px] text-[var(--t3)]">Today {todayDate}</div>
        </div>
        <Link to="/habits/new" className="interactive inline-flex h-8 items-center rounded-full bg-[var(--primary)] px-3 text-[12px] font-medium text-white">
          + New habit
        </Link>
      </div>

      <section className="space-y-2">
        <div>
          <div className="flex items-center justify-between">
            <div className="text-[16px] font-medium text-[var(--t1)]">Today</div>
            <div className="text-[12px] text-[var(--t3)]">{todayLogged} of {state.habits.length} logged</div>
          </div>
          <div className="text-[12px] text-[var(--t2)]">Pending first, done at bottom.</div>
        </div>

        <div className="space-y-3">
          {booleanHabits.map((habit) => (
            <BooleanHabitRow key={habit.id} habit={habit} onLog={logHabit} highlight={highlightHabitId === habit.id} />
          ))}
          {amountHabits.map((habit) => (
            <AmountHabitRow key={habit.id} habit={habit} onLog={logHabit} />
          ))}
          {timerHabits.map((habit) => (
            <TimerHabitRow key={habit.id} habit={habit} onLog={logHabit} onOpenDetail={() => navigate(`/habits/${habit.id}`)} />
          ))}
          {progressHabits.map((habit) => (
            <ProgressHabitRow key={habit.id} habit={habit} onLog={logHabit} />
          ))}
        </div>
      </section>

      <section>
        <div className="text-[16px] font-medium text-[var(--t1)]">Streaks</div>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {state.habits.map((habit) => (
            <div key={habit.id} className="min-w-[140px] rounded-[12px] border border-[var(--border)] bg-[var(--s2)] p-4">
              <div className="flex items-center gap-2 text-[var(--amber)]">
                <Flame size={16} strokeWidth={1.5} />
                <span className="text-[28px] font-medium text-[var(--t1)]">{habit.streak}</span>
              </div>
              <div className="mt-1 text-[12px] text-[var(--t3)]">day streak</div>
              <div className="mt-3 text-[12px] text-[var(--t2)]">{habit.name}</div>
              <div className="mt-1 text-[11px] text-[var(--t3)]">Best: {habit.bestStreak}d</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <div className="text-[16px] font-medium text-[var(--t1)]">Activity</div>
          <div className="flex flex-wrap gap-2">
            {areaFilters.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => setAreaFilter(area)}
                className={cn('rounded-full px-3 py-1 text-[11px] font-medium', areaFilter === area ? 'bg-[var(--primary-bg)] text-[var(--primary)]' : 'bg-[var(--s3)] text-[var(--t2)]')}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-4">
          <div className="mb-3 grid gap-1 text-[10px] text-[var(--t3)]" style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))' }}>
            {recentDates.filter((_, index) => index % 7 === 0).map((date) => (
              <span key={date}>{new Intl.DateTimeFormat('en', { month: 'short' }).format(new Date(date))}</span>
            ))}
          </div>
          <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))' }}>
            {Array.from({ length: 13 }, (_, columnIndex) =>
              Array.from({ length: 7 }, (_, rowIndex) => {
                const date = recentDates[columnIndex * 7 + rowIndex];
                const logsForDate = filteredForHeatmap.flatMap((habit) => habit.logs.filter((log) => log.date === date));
                const intensity = Math.min(4, logsForDate.length);
                const colors = ['var(--s3)', 'color-mix(in srgb, var(--primary) 30%, transparent)', 'color-mix(in srgb, var(--primary) 55%, transparent)', 'color-mix(in srgb, var(--primary) 80%, transparent)', 'var(--primary)'];
                return <span key={`${columnIndex}-${rowIndex}`} title={`${date} · ${dayShort(date)}`} className="h-2.5 w-2.5 rounded-[2px]" style={{ background: colors[intensity] }} />;
              }),
            )}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="text-[16px] font-medium text-[var(--t1)]">All habits</div>
        <div className="space-y-3">
          {visibleHabits.map((habit) => {
            if (habit.trackingType === 'boolean') {
              return <BooleanHabitRow key={habit.id} habit={habit} onLog={logHabit} highlight={highlightHabitId === habit.id} />;
            }
            if (habit.trackingType === 'amount') {
              return <AmountHabitRow key={habit.id} habit={habit} onLog={logHabit} />;
            }
            if (habit.trackingType === 'timer') {
              return <TimerHabitRow key={habit.id} habit={habit} onLog={logHabit} onOpenDetail={() => navigate(`/habits/${habit.id}`)} />;
            }
            return <ProgressHabitRow key={habit.id} habit={habit} onLog={logHabit} />;
          })}
        </div>
      </section>
    </div>
  );
}
