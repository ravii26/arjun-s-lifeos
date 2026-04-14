import React, { useEffect, useState } from 'react';
import { useApp, AREA_COLORS, type Habit, type HabitFrequencyPeriod, type HabitMode, type LifeArea, type Task, type TrackingType, type TrackingConfig } from '../context/AppContext';
import { Icons } from '../components/Icons';
import { Dialog, DialogContent } from '../components/ui/dialog';

const AREA_SHORT: Record<LifeArea, string> = {
  'Career & Skills': 'Career',
  'Health & Body': 'Health',
  'Mind & Learning': 'Mind',
  'Finance': 'Finance',
  'Relationships': 'Relationships',
  'Creative': 'Creative',
};

const ALL_AREAS: LifeArea[] = ['Career & Skills', 'Health & Body', 'Mind & Learning', 'Finance', 'Relationships', 'Creative'];
const TRACKING_TYPES: TrackingType[] = ['binary', 'count', 'duration'];
const FREQUENCY_TYPES: HabitFrequencyPeriod[] = ['daily', 'weekly', 'custom', 'none'];
const HABIT_MODES: HabitMode[] = ['build', 'quit', 'progress', 'simple'];

const trackingLabel: Record<TrackingType, string> = {
  binary: 'Yes / No',
  duration: 'Duration',
  count: 'Count',
};

const frequencyLabel: Record<HabitFrequencyPeriod, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  custom: 'Custom',
  none: 'No timeline',
};

const habitModeLabel: Record<HabitMode, string> = {
  build: 'Build habit',
  quit: 'Quit habit',
  progress: 'Track progress goal',
  simple: 'Simple tracker',
};

const trackingExamples: Record<TrackingType, string> = {
  binary: 'For example: sobriety, flossing, laundry, watering plants',
  count: 'For example: glasses of water, coffee cups, push-ups, cigarettes',
  duration: 'For example: studying, fasting, gaming, workouts, social media, meditation',
};

const buildTrackingConfig = (
  trackingType: TrackingType,
  target: string,
  unit: string,
): TrackingConfig => {
  if (trackingType === 'duration') {
    return { type: 'duration', target: target ? parseInt(target, 10) : 30, unit: unit || 'min' };
  }
  if (trackingType === 'count') {
    return { type: 'count', target: target ? parseInt(target, 10) : 10, unit: unit || 'reps' };
  }
  return { type: 'binary' };
};

const getTrackingSummary = (tracking?: TrackingConfig) => {
  if (!tracking || tracking.type === 'binary') return null;
  if (tracking.type === 'duration') {
    return `${tracking.target ?? 30}${tracking.unit ? ` ${tracking.unit}` : 'm'}`;
  }
  if (tracking.type === 'count') {
    return `${tracking.target ?? 10}${tracking.unit ? ` ${tracking.unit}` : ''}`.trim();
  }
  return trackingLabel[tracking.type];
};

const getGoalSummary = (habit: Habit) => {
  if (habit.mode !== 'progress' || !habit.goal) return null;
  const metric = habit.goal.metric || 'goal';
  const current = habit.goal.currentValue;
  const target = habit.goal.targetValue;
  if (typeof current === 'number' && typeof target === 'number') {
    return `${current} / ${target} ${metric}`;
  }
  return metric;
};

const getTrackingDraft = (tracking?: TrackingConfig) => {
  const trackingType = tracking?.type ?? 'binary';
  return {
    trackingType,
    trackingTarget: String(tracking?.target ?? 30),
    trackingUnit: tracking?.unit ?? '',
  };
};

const dialogStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, color-mix(in srgb, var(--surface-1) 88%, white 12%), var(--surface-2))',
  border: '1px solid color-mix(in srgb, var(--border) 70%, transparent)',
  boxShadow: '0 30px 80px rgba(0, 0, 0, 0.45)',
  color: 'var(--text-primary)',
  width: 'min(92vw, 720px)',
  maxWidth: '720px',
  maxHeight: '90vh',
  overflowY: 'auto',
  borderRadius: 28,
  padding: 0,
};

const dialogSectionStyle: React.CSSProperties = {
  padding: 24,
};

const dialogHeaderStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  marginBottom: 20,
};

const dialogTitleStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 600,
  letterSpacing: '-0.02em',
};

const dialogSubtitleStyle: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--text-muted)',
  lineHeight: 1.5,
};

const fieldLabelStyle: React.CSSProperties = {
  marginTop: 18,
  marginBottom: 10,
  fontSize: 12,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

const actionRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  marginTop: 24,
  flexWrap: 'wrap',
};

const buttonBaseStyle: React.CSSProperties = {
  borderRadius: 12,
  padding: '12px 16px',
  border: 'none',
  fontSize: 13,
  cursor: 'pointer',
  fontFamily: 'Inter',
  fontWeight: 500,
};

const formatTimer = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
};

const getTimerLogValue = (seconds: number, unit?: string) => {
  const normalized = (unit || 'min').toLowerCase();
  if (normalized.includes('sec')) return seconds;
  if (normalized.includes('hour') || normalized === 'h' || normalized === 'hr' || normalized === 'hrs') {
    return Number((seconds / 3600).toFixed(2));
  }
  return Number((seconds / 60).toFixed(1));
};

const DurationTracker = ({
  unit,
  onLog,
}: {
  unit?: string;
  onLog: (value: number) => void;
}) => {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [running]);

  const handleLog = () => {
    if (seconds <= 0) return;
    onLog(getTimerLogValue(seconds, unit));
    setSeconds(0);
    setRunning(false);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <div style={{
        minWidth: 110,
        padding: '8px 10px',
        borderRadius: 8,
        background: 'var(--surface-3)',
        border: '0.5px solid var(--border)',
        fontFamily: 'monospace',
        fontSize: 15,
        color: 'var(--text-primary)',
        textAlign: 'center',
      }}>
        {formatTimer(seconds)}
      </div>
      <button onClick={() => setRunning((v) => !v)} className="interactive" style={{
        padding: '8px 12px', borderRadius: 8, border: 'none',
        background: running ? 'var(--amber-muted-bg)' : 'var(--primary-muted-bg)',
        color: running ? 'var(--amber)' : 'var(--primary)', cursor: 'pointer', fontWeight: 500,
      }}>
        {running ? 'Pause' : 'Start'}
      </button>
      <button onClick={() => { setRunning(false); setSeconds(0); }} style={{
        padding: '8px 12px', borderRadius: 8, border: '0.5px solid var(--border)',
        background: 'var(--surface-1)', color: 'var(--text-muted)', cursor: 'pointer',
      }}>
        Reset
      </button>
      <button onClick={handleLog} className="interactive" style={{
        padding: '8px 12px', borderRadius: 8, border: 'none',
        background: 'var(--primary)', color: '#fff', cursor: seconds > 0 ? 'pointer' : 'not-allowed',
        opacity: seconds > 0 ? 1 : 0.5,
      }}>
        Log timer
      </button>
    </div>
  );
};

const AddTaskSheet = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { addTask } = useApp();
  const [title, setTitle] = useState('');
  const [area, setArea] = useState<LifeArea>('Career & Skills');
  const [priority, setPriority] = useState<'P1' | 'P2' | 'P3'>('P1');
  const [timeEst, setTimeEst] = useState('');
  const [trackingType, setTrackingType] = useState<TrackingType>('binary');
  const [trackingTarget, setTrackingTarget] = useState('30');
  const [trackingUnit, setTrackingUnit] = useState('');

  useEffect(() => {
    if (!open) return;
    setTitle('');
    setArea('Career & Skills');
    setPriority('P1');
    setTimeEst('');
    setTrackingType('binary');
    setTrackingTarget('30');
    setTrackingUnit('');
  }, [open]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      area,
      priority,
      completed: false,
      timeEstimate: timeEst ? parseInt(timeEst, 10) : undefined,
      isToday: false,
      tracking: buildTrackingConfig(trackingType, trackingTarget, trackingUnit),
      logs: [],
    });
    setTitle(''); setTimeEst('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogContent style={dialogStyle}>
        <div style={dialogSectionStyle}>
          <div style={dialogHeaderStyle}>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 600 }}>To-do</div>
            <h3 style={dialogTitleStyle}>Add to-do</h3>
            <p style={dialogSubtitleStyle}>Capture a to-do, assign its area, and choose how to track completion.</p>
          </div>
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            style={{
              width: '100%', fontSize: 16, background: 'var(--surface-1)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '12px 14px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
            }}
          />
          <div style={fieldLabelStyle}>Area</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ALL_AREAS.map(a => (
              <button key={a} onClick={() => setArea(a)} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 999,
                border: a === area ? `1px solid ${AREA_COLORS[a]}` : '1px solid var(--border)',
                background: a === area ? `color-mix(in srgb, ${AREA_COLORS[a]} 18%, transparent)` : 'var(--surface-1)',
                color: a === area ? AREA_COLORS[a] : 'var(--text-muted)',
                fontSize: 12, cursor: 'pointer', fontFamily: 'Inter',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: AREA_COLORS[a] }} />
                {AREA_SHORT[a]}
              </button>
            ))}
          </div>
          <div style={fieldLabelStyle}>Priority</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(['P1', 'P2', 'P3'] as const).map(p => (
              <button key={p} onClick={() => setPriority(p)} style={{
                ...buttonBaseStyle,
                padding: '8px 14px',
                borderRadius: 999,
                background: p === priority
                  ? (p === 'P1' ? 'var(--primary-muted-bg)' : p === 'P2' ? 'var(--amber-muted-bg)' : 'var(--surface-3)')
                  : 'var(--surface-1)',
                color: p === priority
                  ? (p === 'P1' ? 'var(--primary)' : p === 'P2' ? 'var(--amber)' : 'var(--text-muted)')
                  : 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}>
                {p}
              </button>
            ))}
          </div>
          <div style={fieldLabelStyle}>Tracking type</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TRACKING_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setTrackingType(type)}
                style={{
                  ...buttonBaseStyle,
                  padding: '8px 12px',
                  borderRadius: 999,
                  border: trackingType === type ? '1px solid var(--primary)' : '1px solid var(--border)',
                  background: trackingType === type ? 'var(--primary)' : 'var(--surface-1)',
                  color: trackingType === type ? '#fff' : 'var(--text-muted)',
                }}
              >
                {trackingLabel[type]}
              </button>
            ))}
          </div>
          {trackingType !== 'binary' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              <input
                value={trackingTarget}
                onChange={e => setTrackingTarget(e.target.value.replace(/\D/g, ''))}
                placeholder="Target"
                type="number"
                style={{
                  width: 150, fontSize: 14, background: 'var(--surface-1)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '10px 12px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
                }}
              />
              <input
                value={trackingUnit}
                onChange={e => setTrackingUnit(e.target.value)}
                placeholder={trackingType === 'duration' ? 'min' : 'reps'}
                style={{
                  width: 150, fontSize: 14, background: 'var(--surface-1)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '10px 12px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
                }}
              />
            </div>
          )}
          <div style={{ marginTop: 20 }}>
            <div style={dialogSubtitleStyle}>Estimated time</div>
            <input
              value={timeEst}
              onChange={e => setTimeEst(e.target.value.replace(/\D/g, ''))}
              placeholder="Est. minutes"
              type="number"
              style={{
                width: 150, fontSize: 14, background: 'var(--surface-1)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '10px 12px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
              }}
            />
          </div>
          <div style={actionRowStyle}>
            <button onClick={onClose} style={{ ...buttonBaseStyle, flex: 1, background: 'var(--surface-1)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
              Cancel
            </button>
            <button onClick={handleSubmit} className="interactive" style={{ ...buttonBaseStyle, flex: 1, background: 'var(--primary)', color: '#fff' }}>
              Add to to-do list
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AddHabitSheet = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { addHabit } = useApp();
  const [name, setName] = useState('');
  const [area, setArea] = useState<LifeArea>('Career & Skills');
  const [mode, setMode] = useState<HabitMode>('build');
  const [trackingType, setTrackingType] = useState<TrackingType>('binary');
  const [trackingTarget, setTrackingTarget] = useState('30');
  const [trackingUnit, setTrackingUnit] = useState('');
  const [frequencyPeriod, setFrequencyPeriod] = useState<HabitFrequencyPeriod>('daily');
  const [customFrequencyDays, setCustomFrequencyDays] = useState('3');
  const [reminderTime, setReminderTime] = useState('');
  const [goalMetric, setGoalMetric] = useState('');
  const [goalStart, setGoalStart] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('');

  useEffect(() => {
    if (!open) return;
    setName('');
    setArea('Career & Skills');
    setMode('build');
    setTrackingType('binary');
    setTrackingTarget('30');
    setTrackingUnit('');
    setFrequencyPeriod('daily');
    setCustomFrequencyDays('3');
    setReminderTime('');
    setGoalMetric('');
    setGoalStart('');
    setGoalTarget('');
    setGoalCurrent('');
  }, [open]);

  useEffect(() => {
    if (mode === 'simple') {
      setFrequencyPeriod('none');
    } else if (frequencyPeriod === 'none') {
      setFrequencyPeriod('daily');
    }
  }, [mode, frequencyPeriod]);

  useEffect(() => {
    if (mode === 'progress' && trackingType === 'binary') {
      setTrackingType('count');
    }
  }, [mode, trackingType]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    const startValue = goalStart ? parseFloat(goalStart) : undefined;
    const targetValue = goalTarget ? parseFloat(goalTarget) : undefined;
    const currentValue = goalCurrent ? parseFloat(goalCurrent) : undefined;
    addHabit({
      name: name.trim(),
      area,
      mode,
      tracking: buildTrackingConfig(trackingType, trackingTarget, trackingUnit),
      frequencyPeriod,
      customFrequencyDays: frequencyPeriod === 'custom' ? parseInt(customFrequencyDays || '3', 10) : undefined,
      reminderTime: reminderTime || undefined,
      goal: mode === 'progress' ? {
        metric: goalMetric || undefined,
        startValue,
        targetValue,
        currentValue,
      } : undefined,
      logs: [],
    });
    setName('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogContent style={dialogStyle}>
        <div style={dialogSectionStyle}>
          <div style={dialogHeaderStyle}>
            <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 600 }}>Habit</div>
            <h3 style={dialogTitleStyle}>Build a habit</h3>
            <p style={dialogSubtitleStyle}>Create a build habit, quit habit, progress goal, or simple tracker.</p>
          </div>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="What habit do you want to build?"
            style={{
              width: '100%', fontSize: 16, background: 'var(--surface-1)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '12px 14px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
            }}
          />
          <div style={fieldLabelStyle}>Habit type</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {HABIT_MODES.map((habitMode) => (
              <button
                key={habitMode}
                onClick={() => setMode(habitMode)}
                style={{
                  ...buttonBaseStyle,
                  padding: '8px 12px',
                  borderRadius: 999,
                  border: mode === habitMode ? '1px solid var(--primary)' : '1px solid var(--border)',
                  background: mode === habitMode ? 'var(--primary)' : 'var(--surface-1)',
                  color: mode === habitMode ? '#fff' : 'var(--text-muted)',
                }}
              >
                {habitModeLabel[habitMode]}
              </button>
            ))}
          </div>
          <div style={fieldLabelStyle}>Area</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ALL_AREAS.map(a => (
              <button key={a} onClick={() => setArea(a)} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 999,
                border: a === area ? `1px solid ${AREA_COLORS[a]}` : '1px solid var(--border)',
                background: a === area ? `color-mix(in srgb, ${AREA_COLORS[a]} 18%, transparent)` : 'var(--surface-1)',
                color: a === area ? AREA_COLORS[a] : 'var(--text-muted)',
                fontSize: 12, cursor: 'pointer', fontFamily: 'Inter',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: AREA_COLORS[a] }} />
                {AREA_SHORT[a]}
              </button>
            ))}
          </div>
          <div style={fieldLabelStyle}>How do you want to track it?</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            Track your do's or don'ts, track a specific amount, or track specific time.
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TRACKING_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setTrackingType(type)}
                style={{
                  ...buttonBaseStyle,
                  padding: '8px 12px',
                  borderRadius: 999,
                  border: trackingType === type ? '1px solid var(--primary)' : '1px solid var(--border)',
                  background: trackingType === type ? 'var(--primary)' : 'var(--surface-1)',
                  color: trackingType === type ? '#fff' : 'var(--text-muted)',
                }}
              >
                {trackingLabel[type]}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            {trackingExamples[trackingType]}
          </div>
          {trackingType !== 'binary' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              <input
                value={trackingTarget}
                onChange={e => setTrackingTarget(e.target.value.replace(/\D/g, ''))}
                placeholder="Target"
                type="number"
                style={{
                  width: 150, fontSize: 14, background: 'var(--surface-1)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '10px 12px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
                }}
              />
              <input
                value={trackingUnit}
                onChange={e => setTrackingUnit(e.target.value)}
                placeholder={trackingType === 'duration' ? 'min' : 'reps'}
                style={{
                  width: 150, fontSize: 14, background: 'var(--surface-1)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '10px 12px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
                }}
              />
            </div>
          )}
          {mode === 'progress' && (
            <div style={{ marginTop: 16 }}>
              <div style={dialogSubtitleStyle}>Track progress over time (start and end goal)</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <input
                  value={goalMetric}
                  onChange={(e) => setGoalMetric(e.target.value)}
                  placeholder="Metric (weight, savings, etc.)"
                  style={{
                    width: 210, fontSize: 14, background: 'var(--surface-1)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '10px 12px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
                  }}
                />
                <input
                  value={goalStart}
                  onChange={(e) => setGoalStart(e.target.value)}
                  type="number"
                  placeholder="Start"
                  style={{
                    width: 120, fontSize: 14, background: 'var(--surface-1)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '10px 12px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
                  }}
                />
                <input
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  type="number"
                  placeholder="Target"
                  style={{
                    width: 120, fontSize: 14, background: 'var(--surface-1)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '10px 12px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
                  }}
                />
                <input
                  value={goalCurrent}
                  onChange={(e) => setGoalCurrent(e.target.value)}
                  type="number"
                  placeholder="Current"
                  style={{
                    width: 120, fontSize: 14, background: 'var(--surface-1)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '10px 12px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
                  }}
                />
              </div>
            </div>
          )}
          <div style={fieldLabelStyle}>Frequency</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {FREQUENCY_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setFrequencyPeriod(type)}
                style={{
                  ...buttonBaseStyle,
                  padding: '8px 12px',
                  borderRadius: 999,
                  border: frequencyPeriod === type ? '1px solid var(--primary)' : '1px solid var(--border)',
                  background: frequencyPeriod === type ? 'var(--primary)' : 'var(--surface-1)',
                  color: frequencyPeriod === type ? '#fff' : 'var(--text-muted)',
                }}
              >
                {frequencyLabel[type]}
              </button>
            ))}
          </div>
          {frequencyPeriod === 'custom' && (
            <div style={{ marginTop: 12 }}>
              <div style={dialogSubtitleStyle}>Custom cycle length in days</div>
              <input
                value={customFrequencyDays}
                onChange={(e) => setCustomFrequencyDays(e.target.value.replace(/\D/g, ''))}
                type="number"
                placeholder="3"
                style={{
                  width: 150, fontSize: 14, background: 'var(--surface-1)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '10px 12px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
                }}
              />
            </div>
          )}
          <div style={fieldLabelStyle}>Reminder</div>
          <input
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            type="time"
            style={{
              width: 170, fontSize: 14, background: 'var(--surface-1)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '10px 12px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
            }}
          />
          <div style={actionRowStyle}>
            <button onClick={onClose} style={{ ...buttonBaseStyle, flex: 1, background: 'var(--surface-1)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
              Cancel
            </button>
            <button onClick={handleSubmit} className="interactive" style={{ ...buttonBaseStyle, flex: 1, background: 'var(--primary)', color: '#fff' }}>
              Add habit
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const TaskDetailSheet = ({ task, open, onClose }: { task: Task | null; open: boolean; onClose: () => void }) => {
  const { deleteTask, updateTask, recordTaskProgress } = useApp();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [title, setTitle] = useState('');
  const [area, setArea] = useState<LifeArea>('Career & Skills');
  const [priority, setPriority] = useState<'P1' | 'P2' | 'P3'>('P1');
  const [timeEst, setTimeEst] = useState('');
  const [trackingType, setTrackingType] = useState<TrackingType>('binary');
  const [trackingTarget, setTrackingTarget] = useState('30');
  const [trackingUnit, setTrackingUnit] = useState('');
  const [progressValue, setProgressValue] = useState('1');

  useEffect(() => {
    if (!task) return;
    const trackingDraft = getTrackingDraft(task.tracking);
    setTitle(task.title);
    setArea(task.area);
    setPriority(task.priority);
    setTimeEst(task.timeEstimate ? String(task.timeEstimate) : '');
    setTrackingType(trackingDraft.trackingType);
    setTrackingTarget(trackingDraft.trackingTarget);
    setTrackingUnit(trackingDraft.trackingUnit);
    setConfirmDelete(false);
    setProgressValue('1');
  }, [task]);

  if (!task) return null;

  const closeSheet = () => {
    onClose();
    setConfirmDelete(false);
  };

  const handleSave = () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    updateTask(task.id, {
      title: cleanTitle,
      area,
      priority,
      timeEstimate: timeEst ? parseInt(timeEst, 10) : undefined,
      tracking: buildTrackingConfig(trackingType, trackingTarget, trackingUnit),
    });
    closeSheet();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) closeSheet(); }}>
      <DialogContent style={dialogStyle}>
      <div style={dialogSectionStyle}>
        <div style={dialogHeaderStyle}>
          <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 600 }}>To-do detail</div>
          <h3 style={dialogTitleStyle}>Edit to-do</h3>
          <p style={dialogSubtitleStyle}>Update the to-do and tracking settings directly from here.</p>
        </div>
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Task title"
            style={{
              width: '100%', fontSize: 16, background: 'var(--surface-1)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '12px 14px',
              color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
            }}
          />
          <div style={fieldLabelStyle}>Area</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ALL_AREAS.map(a => (
              <button key={a} onClick={() => setArea(a)} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20,
                border: a === area ? `1px solid ${AREA_COLORS[a]}` : '1px solid var(--border)',
                background: a === area ? `color-mix(in srgb, ${AREA_COLORS[a]} 18%, transparent)` : 'var(--surface-1)',
                color: a === area ? AREA_COLORS[a] : 'var(--text-muted)',
                fontSize: 12, cursor: 'pointer', fontFamily: 'Inter',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: AREA_COLORS[a] }} />
                {AREA_SHORT[a]}
              </button>
            ))}
          </div>
          <div style={fieldLabelStyle}>Priority</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(['P1', 'P2', 'P3'] as const).map(p => (
              <button key={p} onClick={() => setPriority(p)} style={{
                ...buttonBaseStyle,
                padding: '8px 14px', borderRadius: 999, fontSize: 12,
                border: '1px solid var(--border)', fontFamily: 'Inter',
                background: p === priority
                  ? (p === 'P1' ? 'var(--primary-muted-bg)' : p === 'P2' ? 'var(--amber-muted-bg)' : 'var(--surface-3)')
                  : 'var(--surface-1)',
                color: p === priority
                  ? (p === 'P1' ? 'var(--primary)' : p === 'P2' ? 'var(--amber)' : 'var(--text-muted)')
                  : 'var(--text-muted)',
              }}>
                {p}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 18 }}>
            <div style={dialogSubtitleStyle}>Estimated time</div>
            <input
              value={timeEst}
              onChange={e => setTimeEst(e.target.value.replace(/\D/g, ''))}
              placeholder="Est. minutes"
              type="number"
              style={{
                width: 150, fontSize: 14, background: 'var(--surface-1)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '10px 12px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
              }}
            />
          </div>
          <div style={fieldLabelStyle}>Tracking type</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TRACKING_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setTrackingType(type)}
                style={{
                  ...buttonBaseStyle,
                  padding: '8px 12px', borderRadius: 999, border: '1px solid var(--border)', cursor: 'pointer',
                  background: trackingType === type ? 'var(--primary)' : 'var(--surface-1)',
                  color: trackingType === type ? '#fff' : 'var(--text-muted)',
                }}
              >
                {trackingLabel[type]}
              </button>
            ))}
          </div>
          {trackingType !== 'binary' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              <input
                value={trackingTarget}
                onChange={e => setTrackingTarget(e.target.value.replace(/\D/g, ''))}
                placeholder="Target"
                type="number"
                style={{
                  width: 150, fontSize: 14, background: 'var(--surface-1)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '10px 12px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
                }}
              />
              <input
                value={trackingUnit}
                onChange={e => setTrackingUnit(e.target.value)}
                placeholder={trackingType === 'duration' ? 'min' : 'reps'}
                style={{
                  width: 150, fontSize: 14, background: 'var(--surface-1)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '10px 12px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
                }}
              />
            </div>
          )}
          <div style={actionRowStyle}>
            <button onClick={closeSheet} style={{ ...buttonBaseStyle, flex: 1, background: 'var(--surface-1)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
              Cancel
            </button>
            <button onClick={handleSave} className="interactive" style={{ ...buttonBaseStyle, flex: 1, background: 'var(--primary)', color: '#fff' }}>
              Save changes
            </button>
          </div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Delete removes the to-do from Focus.
            </div>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                style={{
                  ...buttonBaseStyle,
                  background: 'transparent',
                  color: 'var(--delete-red)',
                  border: '1px solid color-mix(in srgb, var(--delete-red) 35%, transparent)',
                }}
              >
                Delete to-do
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => { deleteTask(task.id); closeSheet(); }} style={{ ...buttonBaseStyle, background: 'var(--delete-red)', color: '#fff' }}>
                  Confirm delete
                </button>
                <button onClick={() => setConfirmDelete(false)} style={{ ...buttonBaseStyle, background: 'var(--surface-1)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                  Keep task
                </button>
              </div>
            )}
          </div>
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Manual progress log</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {task.tracking?.type === 'binary' ? (
                <button
                  onClick={() => recordTaskProgress(task.id, 1)}
                  className="interactive"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer',
                  }}
                >
                  {Icons.check()}
                  Tick done
                </button>
              ) : task.tracking?.type === 'duration' ? (
                <DurationTracker unit={task.tracking?.unit} onLog={(value) => recordTaskProgress(task.id, value)} />
              ) : (
                <>
                  <input
                    value={progressValue}
                    onChange={e => setProgressValue(e.target.value.replace(/\D/g, ''))}
                    type="number"
                    placeholder="Value"
                    style={{
                      width: 120, fontSize: 14, background: 'var(--surface-3)', border: '0.5px solid var(--border)',
                      borderRadius: 8, padding: '8px 12px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
                    }}
                  />
                  <button onClick={() => recordTaskProgress(task.id, parseInt(progressValue || '0', 10))} className="interactive" style={{
                    padding: '8px 14px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer',
                  }}>
                    Log amount
                  </button>
                </>
              )}
            </div>
          </div>
      </div>
      </DialogContent>
    </Dialog>
  );
};

const HabitDetailSheet = ({ habit, open, onClose }: { habit: Habit | null; open: boolean; onClose: () => void }) => {
  const { updateHabit, deleteHabit, recordHabitProgress } = useApp();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [name, setName] = useState('');
  const [area, setArea] = useState<LifeArea>('Career & Skills');
  const [mode, setMode] = useState<HabitMode>('build');
  const [trackingType, setTrackingType] = useState<TrackingType>('binary');
  const [trackingTarget, setTrackingTarget] = useState('30');
  const [trackingUnit, setTrackingUnit] = useState('');
  const [frequencyPeriod, setFrequencyPeriod] = useState<HabitFrequencyPeriod>('daily');
  const [customFrequencyDays, setCustomFrequencyDays] = useState('3');
  const [reminderTime, setReminderTime] = useState('');
  const [goalMetric, setGoalMetric] = useState('');
  const [goalStart, setGoalStart] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('');
  const [progressValue, setProgressValue] = useState('1');

  useEffect(() => {
    if (!habit) return;
    const trackingDraft = getTrackingDraft(habit.tracking);
    setName(habit.name);
    setArea(habit.area);
    setMode(habit.mode ?? 'build');
    setTrackingType(trackingDraft.trackingType);
    setTrackingTarget(trackingDraft.trackingTarget);
    setTrackingUnit(trackingDraft.trackingUnit);
    setFrequencyPeriod(habit.frequencyPeriod ?? 'daily');
    setCustomFrequencyDays(String(habit.customFrequencyDays ?? 3));
    setReminderTime(habit.reminderTime ?? '');
    setGoalMetric(habit.goal?.metric ?? '');
    setGoalStart(habit.goal?.startValue != null ? String(habit.goal.startValue) : '');
    setGoalTarget(habit.goal?.targetValue != null ? String(habit.goal.targetValue) : '');
    setGoalCurrent(habit.goal?.currentValue != null ? String(habit.goal.currentValue) : '');
    setConfirmDelete(false);
    setProgressValue('1');
  }, [habit]);

  useEffect(() => {
    if (mode === 'simple') {
      setFrequencyPeriod('none');
    } else if (frequencyPeriod === 'none') {
      setFrequencyPeriod('daily');
    }
  }, [mode, frequencyPeriod]);

  if (!habit) return null;

  const closeSheet = () => {
    onClose();
    setConfirmDelete(false);
  };

  const handleSave = () => {
    const cleanName = name.trim();
    if (!cleanName) return;
    const startValue = goalStart ? parseFloat(goalStart) : undefined;
    const targetValue = goalTarget ? parseFloat(goalTarget) : undefined;
    const currentValue = goalCurrent ? parseFloat(goalCurrent) : undefined;
    updateHabit(habit.id, {
      name: cleanName,
      area,
      mode,
      tracking: buildTrackingConfig(trackingType, trackingTarget, trackingUnit),
      frequencyPeriod,
      customFrequencyDays: frequencyPeriod === 'custom' ? parseInt(customFrequencyDays || '3', 10) : undefined,
      reminderTime: reminderTime || undefined,
      goal: mode === 'progress' ? {
        metric: goalMetric || undefined,
        startValue,
        targetValue,
        currentValue,
      } : undefined,
    });
    closeSheet();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) closeSheet(); }}>
      <DialogContent style={dialogStyle}>
      <div style={dialogSectionStyle}>
        <div style={dialogHeaderStyle}>
          <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 600 }}>Habit detail</div>
          <h3 style={dialogTitleStyle}>Edit habit</h3>
          <p style={dialogSubtitleStyle}>Manage build, quit, progress, or simple tracking in one place.</p>
        </div>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Habit name"
            style={{
              width: '100%', fontSize: 16, background: 'var(--surface-1)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '12px 14px',
              color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
            }}
          />
          <div style={fieldLabelStyle}>Habit type</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {HABIT_MODES.map((habitMode) => (
              <button
                key={habitMode}
                onClick={() => setMode(habitMode)}
                style={{
                  ...buttonBaseStyle,
                  padding: '8px 12px',
                  borderRadius: 999,
                  border: mode === habitMode ? '1px solid var(--primary)' : '1px solid var(--border)',
                  background: mode === habitMode ? 'var(--primary)' : 'var(--surface-1)',
                  color: mode === habitMode ? '#fff' : 'var(--text-muted)',
                }}
              >
                {habitModeLabel[habitMode]}
              </button>
            ))}
          </div>
          <div style={fieldLabelStyle}>Area</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ALL_AREAS.map(a => (
              <button key={a} onClick={() => setArea(a)} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20,
                border: a === area ? `1px solid ${AREA_COLORS[a]}` : '1px solid var(--border)',
                background: a === area ? `color-mix(in srgb, ${AREA_COLORS[a]} 18%, transparent)` : 'var(--surface-1)',
                color: a === area ? AREA_COLORS[a] : 'var(--text-muted)',
                fontSize: 12, cursor: 'pointer', fontFamily: 'Inter',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: AREA_COLORS[a] }} />
                {AREA_SHORT[a]}
              </button>
            ))}
          </div>
          <div style={fieldLabelStyle}>How do you want to track it?</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            Track your do's or don'ts, specific amount, or specific time.
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TRACKING_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setTrackingType(type)}
                style={{
                  ...buttonBaseStyle,
                  padding: '8px 12px', borderRadius: 999, border: '1px solid var(--border)', cursor: 'pointer',
                  background: trackingType === type ? 'var(--primary)' : 'var(--surface-1)',
                  color: trackingType === type ? '#fff' : 'var(--text-muted)',
                }}
              >
                {trackingLabel[type]}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            {trackingExamples[trackingType]}
          </div>
          {trackingType !== 'binary' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              <input
                value={trackingTarget}
                onChange={e => setTrackingTarget(e.target.value.replace(/\D/g, ''))}
                placeholder="Target"
                type="number"
                style={{
                  width: 150, fontSize: 14, background: 'var(--surface-1)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '10px 12px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
                }}
              />
              <input
                value={trackingUnit}
                onChange={e => setTrackingUnit(e.target.value)}
                placeholder={trackingType === 'duration' ? 'min' : 'reps'}
                style={{
                  width: 150, fontSize: 14, background: 'var(--surface-1)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '10px 12px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
                }}
              />
            </div>
          )}
          {mode === 'progress' && (
            <div style={{ marginTop: 16 }}>
              <div style={dialogSubtitleStyle}>Track progress over time (start and end goal)</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <input
                  value={goalMetric}
                  onChange={(e) => setGoalMetric(e.target.value)}
                  placeholder="Metric (weight, savings, etc.)"
                  style={{
                    width: 210, fontSize: 14, background: 'var(--surface-1)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '10px 12px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
                  }}
                />
                <input
                  value={goalStart}
                  onChange={(e) => setGoalStart(e.target.value)}
                  type="number"
                  placeholder="Start"
                  style={{
                    width: 120, fontSize: 14, background: 'var(--surface-1)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '10px 12px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
                  }}
                />
                <input
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  type="number"
                  placeholder="Target"
                  style={{
                    width: 120, fontSize: 14, background: 'var(--surface-1)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '10px 12px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
                  }}
                />
                <input
                  value={goalCurrent}
                  onChange={(e) => setGoalCurrent(e.target.value)}
                  type="number"
                  placeholder="Current"
                  style={{
                    width: 120, fontSize: 14, background: 'var(--surface-1)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '10px 12px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
                  }}
                />
              </div>
            </div>
          )}
          <div style={fieldLabelStyle}>Frequency</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {FREQUENCY_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setFrequencyPeriod(type)}
                style={{
                  ...buttonBaseStyle,
                  padding: '8px 12px',
                  borderRadius: 999,
                  border: frequencyPeriod === type ? '1px solid var(--primary)' : '1px solid var(--border)',
                  background: frequencyPeriod === type ? 'var(--primary)' : 'var(--surface-1)',
                  color: frequencyPeriod === type ? '#fff' : 'var(--text-muted)',
                }}
              >
                {frequencyLabel[type]}
              </button>
            ))}
          </div>
          {frequencyPeriod === 'custom' && (
            <div style={{ marginTop: 12 }}>
              <div style={dialogSubtitleStyle}>Custom cycle length in days</div>
              <input
                value={customFrequencyDays}
                onChange={(e) => setCustomFrequencyDays(e.target.value.replace(/\D/g, ''))}
                type="number"
                placeholder="3"
                style={{
                  width: 150, fontSize: 14, background: 'var(--surface-1)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '10px 12px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
                }}
              />
            </div>
          )}
          <div style={fieldLabelStyle}>Reminder</div>
          <input
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            type="time"
            style={{
              width: 170, fontSize: 14, background: 'var(--surface-1)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '10px 12px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
            }}
          />
          <div style={actionRowStyle}>
            <button onClick={closeSheet} style={{ ...buttonBaseStyle, flex: 1, background: 'var(--surface-1)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
              Cancel
            </button>
            <button onClick={handleSave} className="interactive" style={{ ...buttonBaseStyle, flex: 1, background: 'var(--primary)', color: '#fff' }}>
              Save changes
            </button>
          </div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Delete removes the habit and its tracking history.
            </div>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                style={{
                  ...buttonBaseStyle,
                  background: 'transparent',
                  color: 'var(--delete-red)',
                  border: '1px solid color-mix(in srgb, var(--delete-red) 35%, transparent)',
                }}
              >
                Delete habit
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => { deleteHabit(habit.id); closeSheet(); }} style={{ ...buttonBaseStyle, background: 'var(--delete-red)', color: '#fff' }}>
                  Confirm delete
                </button>
                <button onClick={() => setConfirmDelete(false)} style={{ ...buttonBaseStyle, background: 'var(--surface-1)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                  Keep habit
                </button>
              </div>
            )}
          </div>
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Manual progress log</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {habit.tracking?.type === 'binary' ? (
                <button
                  onClick={() => recordHabitProgress(habit.id, 1)}
                  className="interactive"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer',
                  }}
                >
                  {Icons.check()}
                  Tick done
                </button>
              ) : habit.tracking?.type === 'duration' ? (
                <DurationTracker unit={habit.tracking?.unit} onLog={(value) => recordHabitProgress(habit.id, value)} />
              ) : (
                <>
                  <input
                    value={progressValue}
                    onChange={e => setProgressValue(e.target.value.replace(/\D/g, ''))}
                    type="number"
                    placeholder="Value"
                    style={{
                      width: 120, fontSize: 14, background: 'var(--surface-3)', border: '0.5px solid var(--border)',
                      borderRadius: 8, padding: '8px 12px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
                    }}
                  />
                  <button onClick={() => recordHabitProgress(habit.id, parseInt(progressValue || '0', 10))} className="interactive" style={{
                    padding: '8px 14px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer',
                  }}>
                    Log amount
                  </button>
                </>
              )}
            </div>
          </div>
      </div>
      </DialogContent>
    </Dialog>
  );
};

const Focus = () => {
  const { tasks, toggleTask, habits, logHabit, dayRating, setDayRating, setHabitMissReason } = useApp();
  const [tab, setTab] = useState<'today' | 'backlog'>('today');
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [detailHabit, setDetailHabit] = useState<Habit | null>(null);
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
            {t === 'today' ? 'Today' : 'To-do backlog'}
          </button>
        ))}
      </div>

      {tab === 'today' ? (
        <>
          {/* To-do list */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 16, fontWeight: 500 }}>To-do list</span>
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
                      onClick={e => {
                        e.stopPropagation();
                        if ((task.tracking?.type ?? 'binary') === 'binary') {
                          toggleTask(task.id);
                        } else {
                          setDetailTask(task);
                        }
                      }}
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: AREA_COLORS[task.area] }} />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{AREA_SHORT[task.area]}</span>
                        <span style={{
                          fontSize: 11, padding: '2px 8px', borderRadius: 20,
                          background: task.priority === 'P1' ? 'var(--primary-muted-bg)' : 'var(--amber-muted-bg)',
                          color: task.priority === 'P1' ? 'var(--primary)' : 'var(--amber)',
                          fontWeight: 500,
                        }}>{task.priority}</span>
                        {getTrackingSummary(task.tracking) && (
                          <span style={{
                            fontSize: 11, padding: '2px 8px', borderRadius: 20,
                            background: 'var(--surface-3)', color: 'var(--text-muted)', fontWeight: 500,
                          }}>
                            {getTrackingSummary(task.tracking)}
                          </span>
                        )}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{habitsLogged} of {habits.length} logged</span>
                <button onClick={() => setShowAddHabit(true)} className="interactive" style={{
                  border: 'none', background: 'none', color: 'var(--primary)', fontSize: 12,
                  fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter',
                }}>
                  + Add habit
                </button>
              </div>
            </div>
            {habits.map(habit => {
              const areaColor = AREA_COLORS[habit.area];
              const periodLabel = frequencyLabel[habit.frequencyPeriod ?? 'daily'];
              const modeLabel = habitModeLabel[habit.mode ?? 'build'];
              const goalSummary = getGoalSummary(habit);
              const isBinaryTracker = (habit.tracking?.type ?? 'binary') === 'binary';
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {Icons.flame()}
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{habit.streak}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {habit.frequencyPeriod === 'none' ? 'tracker' : `${periodLabel} streak`}
                      </span>
                    </div>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 20,
                      background: 'var(--surface-3)', color: 'var(--text-muted)', fontWeight: 500,
                    }}>
                      {modeLabel}
                    </span>
                    {habit.frequencyPeriod !== 'none' && (
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 20,
                        background: 'var(--surface-3)', color: 'var(--text-muted)', fontWeight: 500,
                      }}>
                        {periodLabel}
                      </span>
                    )}
                    {getTrackingSummary(habit.tracking) && (
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 20,
                        background: 'var(--surface-3)', color: 'var(--text-muted)', fontWeight: 500,
                      }}>
                        {getTrackingSummary(habit.tracking)}
                      </span>
                    )}
                    {goalSummary && (
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 20,
                        background: 'var(--surface-3)', color: 'var(--text-muted)', fontWeight: 500,
                      }}>
                        {goalSummary}
                      </span>
                    )}
                    {habit.reminderTime && (
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 20,
                        background: 'var(--primary-muted-bg)', color: 'var(--primary)', fontWeight: 500,
                      }}>
                        Remind {habit.reminderTime}
                      </span>
                    )}
                    <button
                      onClick={() => setDetailHabit(habit)}
                      className="interactive"
                      style={{
                        border: 'none', background: 'none', color: 'var(--text-muted)',
                        fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter',
                      }}
                    >
                      Manage
                    </button>
                    <div
                      onClick={() => {
                        if (habit.loggedToday) return;
                        if (isBinaryTracker) {
                          logHabit(habit.id);
                        } else {
                          setDetailHabit(habit);
                        }
                      }}
                      className={!habit.loggedToday ? 'interactive' : ''}
                      style={{
                        padding: '8px 16px', borderRadius: 8, cursor: habit.loggedToday ? 'default' : 'pointer',
                        background: habit.loggedToday ? 'var(--teal-muted-bg)' : 'var(--primary-muted-bg)',
                        color: habit.loggedToday ? 'var(--teal)' : 'var(--primary)',
                        fontSize: 12, fontWeight: 500, flexShrink: 0,
                      }}
                    >
                      {habit.loggedToday ? 'Done ✓' : isBinaryTracker ? 'Tick' : 'Track'}
                    </div>
                  </div>
                  {/* Missed habit reason */}
                  {habit.frequencyPeriod === 'daily' && habit.last7.includes('missed') && !habit.loggedToday && (
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
            <span style={{ fontSize: 16, fontWeight: 500 }}>To-do backlog</span>
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
              Add Finance to-do
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
      <AddHabitSheet open={showAddHabit} onClose={() => setShowAddHabit(false)} />
      <TaskDetailSheet task={detailTask} open={!!detailTask} onClose={() => setDetailTask(null)} />
      <HabitDetailSheet habit={detailHabit} open={!!detailHabit} onClose={() => setDetailHabit(null)} />
    </div>
  );
};

export default Focus;
