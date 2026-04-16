import * as React from 'react';
import { ArrowLeft, CheckCircle2, Timer, TrendingUp, XCircle, Zap, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/appState';
import type { AreaId, Habit, HabitDirection, HabitTrackingType, FrequencyType } from '@/types';
import { cn } from '@/lib/utils';

const trackingOptions: Array<{
  value: HabitTrackingType;
  title: string;
  description: string;
  examples: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}> = [
  { value: 'boolean', title: 'Do / Don\'t', description: 'Simple yes or no each day', examples: 'sobriety, flossing, laundry, watering plants', icon: Zap },
  { value: 'amount', title: 'Track amount', description: 'Log a number toward a goal', examples: 'glasses of water, push-ups, cups of coffee, cigarettes', icon: Hash },
  { value: 'timer', title: 'Track time', description: 'Log duration toward a daily goal', examples: 'studying, fasting, working out, meditation, social media', icon: Timer },
  { value: 'progress', title: 'Track progress', description: 'A start-to-end goal over time', examples: 'weight, savings, pages read, km run', icon: TrendingUp },
];

export function NewHabitFlow() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = React.useState(1);
  const [direction, setDirection] = React.useState<HabitDirection | null>(null);
  const [trackingType, setTrackingType] = React.useState<HabitTrackingType | null>(null);
  const [name, setName] = React.useState('');
  const [areaId, setAreaId] = React.useState<AreaId | ''>('');
  const [amountGoal, setAmountGoal] = React.useState('');
  const [amountUnit, setAmountUnit] = React.useState('');
  const [timerGoalMinutes, setTimerGoalMinutes] = React.useState('30');
  const [progressStart, setProgressStart] = React.useState('0');
  const [progressGoal, setProgressGoal] = React.useState('');
  const [progressUnit, setProgressUnit] = React.useState('');
  const [frequency, setFrequency] = React.useState<FrequencyType>('daily');
  const [xPerWeek, setXPerWeek] = React.useState('3');
  const [customDays, setCustomDays] = React.useState<number[]>([1, 2, 3, 4, 5]);
  const [reminderEnabled, setReminderEnabled] = React.useState(true);
  const [reminderTime, setReminderTime] = React.useState('07:00');

  const back = () => {
    if (step === 1) {
      navigate('/habits');
      return;
    }
    setStep((current) => current - 1);
  };

  const submit = () => {
    if (!direction || !trackingType || !areaId) {
      return;
    }

    const id = `habit-${Date.now()}`;
    const baseHabit: Habit = {
      id,
      name,
      areaId,
      direction,
      trackingType,
      frequency,
      logs: [],
      streak: 0,
      bestStreak: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      reminder: reminderEnabled ? { time: reminderTime, enabled: true } : { time: reminderTime, enabled: false },
      frequencyDays: frequency === 'custom' ? customDays : undefined,
      frequencyXPerWeek: frequency === 'x_per_week' ? Number(xPerWeek) : undefined,
    };

    const nextHabit: Habit =
      trackingType === 'amount'
        ? { ...baseHabit, amountGoal: Number(amountGoal), amountUnit }
        : trackingType === 'timer'
          ? { ...baseHabit, timerGoalSeconds: Number(timerGoalMinutes) * 60, timerUnit: 'minutes' }
          : trackingType === 'progress'
            ? { ...baseHabit, progressStart: Number(progressStart), progressGoal: Number(progressGoal), progressCurrent: Number(progressStart), progressUnit }
            : baseHabit;

    dispatch({ type: 'ADD_HABIT', habit: nextHabit });
    navigate(`/habits?new=${id}`);
  };

  const canContinue = Boolean(direction && trackingType && name.trim() && areaId);

  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 py-4 text-[var(--t1)]">
      <div className="mx-auto flex max-w-[680px] flex-col gap-6 pb-8">
        <div className="flex items-center justify-between">
          <button type="button" onClick={back} className="interactive flex h-10 w-10 items-center justify-center rounded-full bg-[var(--s2)] text-[var(--t1)]">
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((dot) => (
              <span key={dot} className={cn('h-2.5 w-2.5 rounded-full transition-colors', dot <= step ? 'bg-[var(--primary)]' : 'bg-[var(--s3)]')} />
            ))}
          </div>
          <div className="w-10" />
        </div>

        {step === 1 ? (
          <section className="space-y-4 pt-8">
            <h1 className="text-center text-[18px] font-medium">Do you want to build or quit a habit?</h1>
            <div className="grid gap-4">
              <button
                type="button"
                onClick={() => {
                  setDirection('build');
                  setStep(2);
                }}
                className="rounded-[16px] border border-[var(--border)] bg-[var(--s2)] p-5 text-left transition-colors hover:bg-[var(--s3)]"
              >
                <div className="flex items-center gap-3 text-[var(--teal)]">
                  <CheckCircle2 size={24} strokeWidth={1.5} />
                  <div className="text-[14px] font-medium text-[var(--t1)]">Build a habit</div>
                </div>
                <div className="mt-2 text-[12px] text-[var(--t2)]">Track something you want to do more of</div>
                <div className="mt-2 text-[11px] text-[var(--t3)]">Examples: workout, study, meditate.</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDirection('quit');
                  setStep(2);
                }}
                className="rounded-[16px] border border-[var(--border)] bg-[var(--s2)] p-5 text-left transition-colors hover:bg-[var(--s3)]"
              >
                <div className="flex items-center gap-3 text-[var(--coral)]">
                  <XCircle size={24} strokeWidth={1.5} />
                  <div className="text-[14px] font-medium text-[var(--t1)]">Quit a habit</div>
                </div>
                <div className="mt-2 text-[12px] text-[var(--t2)]">Track something you want to stop doing</div>
                <div className="mt-2 text-[11px] text-[var(--t3)]">Examples: smoking, social media, junk food.</div>
              </button>
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="space-y-4 pt-8">
            <h1 className="text-center text-[18px] font-medium">How do you want to track it?</h1>
            <div className="grid grid-cols-2 gap-4">
              {trackingOptions.map((option) => {
                const Icon = option.icon;
                const selected = trackingType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setTrackingType(option.value);
                      setStep(3);
                    }}
                    className={cn('rounded-[16px] border border-[var(--border)] bg-[var(--s2)] p-4 text-left transition-colors hover:bg-[var(--s3)]', selected ? 'border-[var(--primary)] bg-[var(--primary-bg)]' : '')}
                  >
                    <Icon size={24} strokeWidth={1.5} className="text-[var(--primary)]" />
                    <div className="mt-3 text-[14px] font-medium text-[var(--t1)]">{option.title}</div>
                    <div className="mt-1 text-[12px] text-[var(--t2)]">{option.description}</div>
                    <div className="mt-2 text-[11px] italic text-[var(--t3)]">{option.examples}</div>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section className="space-y-5 pt-8">
            <h1 className="text-[18px] font-medium">Name your habit</h1>
            <input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={direction === 'quit' ? 'No social media after 10pm' : 'e.g. Morning workout'}
              className="w-full border-b border-[var(--border-md)] bg-transparent pb-3 text-[18px] text-[var(--t1)] outline-none placeholder:text-[var(--t3)]"
            />

            {trackingType === 'amount' ? (
              <div className="grid gap-3">
                <input value={amountGoal} onChange={(event) => setAmountGoal(event.target.value)} type="number" min="0" placeholder="Daily goal" className="h-10 rounded-[10px] bg-[var(--s2)] px-3 text-[14px] outline-none" />
                <input value={amountUnit} onChange={(event) => setAmountUnit(event.target.value)} placeholder="Unit (e.g. glasses, push-ups)" className="h-10 rounded-[10px] bg-[var(--s2)] px-3 text-[14px] outline-none" />
                <div className="text-[12px] text-[var(--t2)]">I want to do {amountGoal || 'X'} {amountUnit || 'units'} per day</div>
              </div>
            ) : null}

            {trackingType === 'timer' ? (
              <div className="grid gap-3">
                <div className="flex flex-wrap gap-2">
                  {['15', '30', '45', '60', '120'].map((value) => (
                    <button key={value} type="button" onClick={() => setTimerGoalMinutes(value)} className={cn('rounded-full bg-[var(--s3)] px-3 py-1 text-[12px]', timerGoalMinutes === value ? 'bg-[var(--primary-bg)] text-[var(--primary)]' : 'text-[var(--t2)]')}>
                      {Number(value) >= 60 ? `${Number(value) / 60}h` : `${value}m`}
                    </button>
                  ))}
                </div>
                <input value={timerGoalMinutes} onChange={(event) => setTimerGoalMinutes(event.target.value)} type="number" min="1" className="h-10 rounded-[10px] bg-[var(--s2)] px-3 text-[14px] outline-none" />
                <div className="text-[12px] text-[var(--t2)]">I want to {direction === 'build' ? 'build' : 'quit'} this for {timerGoalMinutes || 'X'} minutes per day</div>
              </div>
            ) : null}

            {trackingType === 'progress' ? (
              <div className="grid gap-3">
                <input value={progressStart} onChange={(event) => setProgressStart(event.target.value)} type="number" placeholder="Start value" className="h-10 rounded-[10px] bg-[var(--s2)] px-3 text-[14px] outline-none" />
                <input value={progressGoal} onChange={(event) => setProgressGoal(event.target.value)} type="number" placeholder="End goal value" className="h-10 rounded-[10px] bg-[var(--s2)] px-3 text-[14px] outline-none" />
                <input value={progressUnit} onChange={(event) => setProgressUnit(event.target.value)} placeholder="Unit (kg, ₹, pages)" className="h-10 rounded-[10px] bg-[var(--s2)] px-3 text-[14px] outline-none" />
                <div className="text-[12px] text-[var(--t2)]">From {progressStart || 'X'} to {progressGoal || 'Y'} {progressUnit || 'units'}</div>
              </div>
            ) : null}

            <div className="space-y-2">
              <div className="text-[14px] font-medium">Area</div>
              <div className="grid grid-cols-2 gap-2">
                {state.areas.map((area) => (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => setAreaId(area.id)}
                    className={cn('rounded-[12px] border border-[var(--border)] bg-[var(--s2)] px-3 py-2 text-left text-[12px] transition-colors', areaId === area.id ? 'border-[var(--primary)] bg-[var(--primary-bg)]' : '')}
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: area.color }} />
                      {area.name}
                    </div>
                  </button>
                ))}
              </div>
              <div className="text-[12px] text-[var(--teal)]">This contributes to {areaId ? state.areas.find((area) => area.id === areaId)?.name : 'an area'} score</div>
            </div>

            <button type="button" onClick={() => setStep(4)} className="h-12 w-full rounded-[12px] bg-[var(--primary)] text-[14px] font-medium text-white disabled:opacity-40" disabled={!canContinue}>
              Continue →
            </button>
          </section>
        ) : null}

        {step === 4 ? (
          <section className="space-y-5 pt-8">
            <h1 className="text-[16px] font-medium">How often?</h1>

            <div className="space-y-2">
              {[
                ['daily', 'Every day', 'Daily'],
                ['weekdays', 'Weekdays only', 'Mon–Fri'],
                ['weekends', 'Weekends only', 'Sat–Sun'],
                ['x_per_week', 'X times per week', 'Shows a number stepper'],
                ['custom', 'Custom days', 'M T W T F S S day toggles'],
              ].map(([value, label, description]) => (
                <button key={value} type="button" onClick={() => setFrequency(value as FrequencyType)} className={cn('w-full rounded-[12px] border border-[var(--border)] bg-[var(--s2)] p-3 text-left', frequency === value ? 'border-[var(--primary)] bg-[var(--primary-bg)]' : '')}>
                  <div className="text-[14px] font-medium">{label}</div>
                  <div className="mt-1 text-[12px] text-[var(--t2)]">{description}</div>
                  {value === 'x_per_week' && frequency === 'x_per_week' ? (
                    <input value={xPerWeek} onChange={(event) => setXPerWeek(event.target.value)} type="number" min="1" className="mt-2 h-9 w-24 rounded-[8px] bg-[var(--s3)] px-3 text-[14px] outline-none" />
                  ) : null}
                  {value === 'custom' && frequency === 'custom' ? (
                    <div className="mt-2 flex gap-2">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                        <button key={`${day}-${index}`} type="button" onClick={() => setCustomDays((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index])} className={cn('flex h-8 w-8 items-center justify-center rounded-full text-[12px]', customDays.includes(index) ? 'bg-[var(--primary)] text-white' : 'bg-[var(--s3)] text-[var(--t3)]')}>
                          {day}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-[12px] border border-[var(--border)] bg-[var(--s2)] px-3 py-3">
              <div>
                <div className="text-[14px] font-medium">Reminder</div>
                <div className="text-[12px] text-[var(--t2)]">Send a daily nudge</div>
              </div>
              <button type="button" onClick={() => setReminderEnabled((value) => !value)} className={cn('h-[22px] w-10 rounded-full transition-colors', reminderEnabled ? 'bg-[var(--primary)]' : 'bg-[var(--s3)]')}>
                <span className={cn('block h-[18px] w-[18px] rounded-full bg-white transition-transform', reminderEnabled ? 'translate-x-5' : 'translate-x-0.5')} />
              </button>
            </div>

            {reminderEnabled ? (
              <input type="time" value={reminderTime} onChange={(event) => setReminderTime(event.target.value)} className="h-11 w-full rounded-[10px] bg-[var(--s2)] px-3 text-[14px] outline-none" />
            ) : null}

            <button type="button" onClick={submit} className="h-12 w-full rounded-[12px] bg-[var(--primary)] text-[14px] font-medium text-white" disabled={!canContinue}>
              Start tracking →
            </button>
          </section>
        ) : null}
      </div>
    </div>
  );
}
