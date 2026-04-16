import * as React from 'react';
import { ArrowLeft, CheckCircle2, Hash, Timer, TrendingUp, XCircle, Zap } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '@/context/appState';
import type { AreaId, Habit, HabitDirection, HabitTrackingType, FrequencyType } from '@/types';
import { cn } from '@/lib/utils';

const trackingOptions = [
  { value: 'boolean' as HabitTrackingType, title: 'Do / Don\'t', icon: Zap },
  { value: 'amount' as HabitTrackingType, title: 'Track amount', icon: Hash },
  { value: 'timer' as HabitTrackingType, title: 'Track time', icon: Timer },
  { value: 'progress' as HabitTrackingType, title: 'Track progress', icon: TrendingUp },
];

export function NewHabitFlow() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, dispatch } = useApp();
  const prefillArea = searchParams.get('area') as AreaId | null;
  const [step, setStep] = React.useState(prefillArea ? 3 : 1);
  const [direction, setDirection] = React.useState<HabitDirection>(prefillArea ? 'build' : 'build');
  const [trackingType, setTrackingType] = React.useState<HabitTrackingType>(prefillArea ? 'boolean' : 'boolean');
  const [name, setName] = React.useState('');
  const [areaId, setAreaId] = React.useState<AreaId | ''>(prefillArea ?? '');
  const [frequency, setFrequency] = React.useState<FrequencyType>('daily');
  const [reminderEnabled, setReminderEnabled] = React.useState(true);
  const [reminderTime, setReminderTime] = React.useState('07:00');
  const [amountGoal, setAmountGoal] = React.useState('8');
  const [amountUnit, setAmountUnit] = React.useState('units');
  const [timerMinutes, setTimerMinutes] = React.useState('30');
  const [progressStart, setProgressStart] = React.useState('0');
  const [progressGoal, setProgressGoal] = React.useState('100');
  const [progressUnit, setProgressUnit] = React.useState('');

  const submit = () => {
    if (!name.trim() || !areaId) return;
    const habit: Habit = {
      id: `habit-${Date.now()}`,
      name: name.trim(),
      areaId,
      direction,
      trackingType,
      frequency,
      logs: [],
      streak: 0,
      bestStreak: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      reminder: { enabled: reminderEnabled, time: reminderTime },
      amountGoal: trackingType === 'amount' ? Number(amountGoal) : undefined,
      amountUnit: trackingType === 'amount' ? amountUnit : undefined,
      timerGoalSeconds: trackingType === 'timer' ? Number(timerMinutes) * 60 : undefined,
      timerUnit: trackingType === 'timer' ? 'minutes' : undefined,
      progressStart: trackingType === 'progress' ? Number(progressStart) : undefined,
      progressGoal: trackingType === 'progress' ? Number(progressGoal) : undefined,
      progressCurrent: trackingType === 'progress' ? Number(progressStart) : undefined,
      progressUnit: trackingType === 'progress' ? progressUnit : undefined,
    };

    dispatch({ type: 'ADD_HABIT', habit });
    navigate(`/habits?new=${habit.id}`);
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => (step === 1 ? navigate(-1) : setStep((current) => current - 1))} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--s2)] text-[var(--t1)]">
          <ArrowLeft size={18} strokeWidth={1.5} />
        </button>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => <span key={i} className={cn('h-2.5 w-2.5 rounded-full', i <= step ? 'bg-[var(--primary)]' : 'bg-[var(--s3)]')} />)}
        </div>
        <span className="w-10" />
      </div>

      {step === 1 ? (
        <section className="space-y-3">
          <h1 className="text-[18px] font-medium text-[var(--t1)]">Build or quit a habit?</h1>
          <button type="button" onClick={() => { setDirection('build'); setStep(2); }} className="w-full rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-4 text-left">
            <div className="mb-2 flex items-center gap-2 text-[var(--teal)]"><CheckCircle2 size={20} strokeWidth={1.5} />Build</div>
            <div className="text-[12px] text-[var(--t2)]">Track something you want to do more.</div>
          </button>
          <button type="button" onClick={() => { setDirection('quit'); setStep(2); }} className="w-full rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-4 text-left">
            <div className="mb-2 flex items-center gap-2 text-[var(--amber)]"><XCircle size={20} strokeWidth={1.5} />Quit</div>
            <div className="text-[12px] text-[var(--t2)]">Track something you want to avoid.</div>
          </button>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="space-y-3">
          <h1 className="text-[18px] font-medium text-[var(--t1)]">How do you want to track it?</h1>
          <div className="grid grid-cols-2 gap-2">
            {trackingOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button key={option.value} type="button" onClick={() => { setTrackingType(option.value); setStep(3); }} className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-4 text-left">
                  <Icon size={18} strokeWidth={1.5} className="text-[var(--primary)]" />
                  <div className="mt-2 text-[13px] text-[var(--t1)]">{option.title}</div>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="space-y-3">
          <h1 className="text-[18px] font-medium text-[var(--t1)]">Name your habit</h1>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Habit name" className="h-11 w-full rounded-[12px] border border-[var(--border)] bg-[var(--s2)] px-4 text-[14px] outline-none" />

          {trackingType === 'amount' ? (
            <div className="grid gap-2">
              <input value={amountGoal} onChange={(event) => setAmountGoal(event.target.value)} type="number" className="h-10 rounded-[10px] bg-[var(--s3)] px-3 text-[14px] outline-none" />
              <input value={amountUnit} onChange={(event) => setAmountUnit(event.target.value)} className="h-10 rounded-[10px] bg-[var(--s3)] px-3 text-[14px] outline-none" />
            </div>
          ) : null}

          {trackingType === 'timer' ? (
            <input value={timerMinutes} onChange={(event) => setTimerMinutes(event.target.value)} type="number" className="h-10 w-full rounded-[10px] bg-[var(--s3)] px-3 text-[14px] outline-none" />
          ) : null}

          {trackingType === 'progress' ? (
            <div className="grid gap-2">
              <input value={progressStart} onChange={(event) => setProgressStart(event.target.value)} type="number" className="h-10 rounded-[10px] bg-[var(--s3)] px-3 text-[14px] outline-none" />
              <input value={progressGoal} onChange={(event) => setProgressGoal(event.target.value)} type="number" className="h-10 rounded-[10px] bg-[var(--s3)] px-3 text-[14px] outline-none" />
              <input value={progressUnit} onChange={(event) => setProgressUnit(event.target.value)} className="h-10 rounded-[10px] bg-[var(--s3)] px-3 text-[14px] outline-none" />
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-2">
            {state.areas.map((area) => (
              <button key={area.id} type="button" onClick={() => setAreaId(area.id)} className={cn('rounded-[12px] border border-[var(--border)] bg-[var(--s2)] px-3 py-2 text-left text-[12px]', areaId === area.id ? 'border-[var(--primary)] bg-[var(--primary-bg)]' : '')}>
                <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: area.color }} />
                {area.name}
              </button>
            ))}
          </div>

          <button type="button" onClick={() => setStep(4)} className="h-11 w-full rounded-[12px] bg-[var(--primary)] text-[13px] font-medium text-white" disabled={!name.trim() || !areaId}>Continue</button>
        </section>
      ) : null}

      {step === 4 ? (
        <section className="space-y-3">
          <h1 className="text-[18px] font-medium text-[var(--t1)]">Frequency and reminder</h1>
          <div className="flex flex-wrap gap-2">
            {(['daily', 'weekdays', 'weekends', 'x_per_week', 'custom'] as FrequencyType[]).map((item) => (
              <button key={item} type="button" onClick={() => setFrequency(item)} className={cn('rounded-full px-3 py-1 text-[12px]', frequency === item ? 'bg-[var(--primary)] text-white' : 'bg-[var(--s3)] text-[var(--t2)]')}>
                {item}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-[12px] border border-[var(--border)] bg-[var(--s2)] px-3 py-3">
            <div className="text-[13px] text-[var(--t1)]">Reminder</div>
            <button type="button" onClick={() => setReminderEnabled((value) => !value)} className={cn('h-[22px] w-10 rounded-full', reminderEnabled ? 'bg-[var(--primary)]' : 'bg-[var(--s3)]')}>
              <span className={cn('block h-[18px] w-[18px] rounded-full bg-white transition-transform', reminderEnabled ? 'translate-x-5' : 'translate-x-0.5')} />
            </button>
          </div>

          {reminderEnabled ? <input type="time" value={reminderTime} onChange={(event) => setReminderTime(event.target.value)} className="h-10 w-full rounded-[10px] bg-[var(--s3)] px-3 text-[14px] outline-none" /> : null}

          <button type="button" onClick={submit} className="h-12 w-full rounded-[12px] bg-[var(--primary)] text-[14px] font-medium text-white">Start tracking</button>
        </section>
      ) : null}
    </div>
  );
}

export default NewHabitFlow;
