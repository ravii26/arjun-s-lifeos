import * as React from 'react';
import { Lock, Sparkles, Flame, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/appState';
import { cn } from '@/lib/utils';
import { getAreaById } from '@/lib/lifeos';
import type { AreaId } from '@/types';

const areaRows: Array<{ id: AreaId; score: number; delta: number; keyStat: string }> = [
  { id: 'career', score: 71, delta: 8, keyStat: '4/5 tasks done' },
  { id: 'health', score: 58, delta: 0, keyStat: 'Workout 4/7' },
  { id: 'mind', score: 64, delta: 3, keyStat: '3 articles read' },
  { id: 'finance', score: 45, delta: -4, keyStat: 'No finance tasks' },
  { id: 'relationships', score: 38, delta: -6, keyStat: '0 connections' },
  { id: 'creative', score: 22, delta: -8, keyStat: 'No creative work' },
];

const habitRows = [
  { name: '5:30am workout', color: '#1DB37E', data: ['done', 'done', 'missed', 'done', 'done', 'done', 'pending'] as const },
  { name: 'LifeOS build daily', color: '#7C6FF7', data: ['done', 'done', 'done', 'done', 'done', 'done', 'done'] as const },
  { name: 'Sleep by 11pm', color: '#4A90D9', data: ['done', 'missed', 'done', 'done', 'done', 'done', 'pending'] as const },
];

const timeRows = [
  { id: 'career' as AreaId, planned: 40, actual: 45 },
  { id: 'health' as AreaId, planned: 20, actual: 18 },
  { id: 'mind' as AreaId, planned: 15, actual: 14 },
  { id: 'finance' as AreaId, planned: 10, actual: 3 },
  { id: 'relationships' as AreaId, planned: 10, actual: 4 },
  { id: 'creative' as AreaId, planned: 5, actual: 1 },
];

const patterns = [
  'You complete 94% of tasks on days you focus on LifeOS build. Your best work has a clear single focus.',
  'Your workout habit drops to 0% on days following an evening rating of 2 or below. How you end today shapes how you start tomorrow.',
  'Wednesday has been your lowest-scoring day for 5 consecutive weeks. Something about midweek is breaking your rhythm.',
];

const reflectionLabels = [
  { key: 'q1', label: 'WHAT MOVED YOU FORWARD THIS WEEK?', placeholder: 'What moved you forward this week?' },
  { key: 'q2', label: 'WHAT WASTED YOUR TIME?', placeholder: 'What wasted your time?' },
  { key: 'q3', label: 'WHAT DID YOU KEEP AVOIDING?', placeholder: 'What did you keep avoiding?' },
  { key: 'q4', label: 'WHAT CHANGES NEXT WEEK?', placeholder: 'What changes next week?' },
] as const;

function scoreTone(score: number) {
  if (score >= 65) return 'var(--teal)';
  if (score >= 35) return 'var(--amber)';
  return 'var(--t3)';
}

function deltaTone(delta: number) {
  if (delta > 0) return 'var(--teal)';
  if (delta < 0) return 'var(--amber)';
  return 'var(--t3)';
}

export function Review() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const isSunday = new Date().getDay() === 0;
  const [reflection, setReflection] = React.useState(state.weeklyReflection);
  const [nextArea, setNextArea] = React.useState<AreaId>('relationships');
  const [commitment, setCommitment] = React.useState(state.weeklyReflection.commitment || '');
  const [submitting, setSubmitting] = React.useState(false);
  const maxTimeValue = Math.max(...timeRows.map((row) => Math.max(row.actual, row.planned)));

  React.useEffect(() => {
    setReflection(state.weeklyReflection);
  }, [state.weeklyReflection]);

  const saveReflection = (next: typeof reflection) => {
    dispatch({ type: 'SAVE_REFLECTION', reflection: next });
  };

  const submit = () => {
    const nextReflection = {
      ...reflection,
      nextAreaFocus: nextArea,
      commitment,
    };
    dispatch({ type: 'SAVE_REFLECTION', reflection: nextReflection });
    setSubmitting(true);
    window.setTimeout(() => navigate('/dashboard'), 600);
  };

  return (
    <div className="space-y-6 pb-6">
      {!isSunday ? (
        <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-5" style={{ borderLeft: '3px solid var(--amber)' }}>
          <div className="text-[14px] font-medium text-[var(--t1)]">Full review unlocks on Sunday. Here's your week so far.</div>
        </section>
      ) : null}

      <header className="flex items-baseline justify-between gap-3">
        <h1 className="text-[22px] font-medium text-[var(--t1)]">Week 7 review</h1>
        <div className="text-[13px] text-[var(--t2)]">Mar 31 - Apr 6</div>
      </header>

      <section className="grid grid-cols-2 gap-3">
        {areaRows.map((row) => {
          const area = getAreaById(row.id, state.areas);
          if (!area) return null;
          return (
            <button
              key={row.id}
              type="button"
              onClick={() => navigate(`/areas/${row.id}`)}
              className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4 text-left"
              style={{ borderLeft: `3px solid ${area.color}` }}
            >
              <div className="text-[13px] font-medium text-[var(--t3)]">{area.name}</div>
              <div className="mt-1 text-[28px] font-medium" style={{ color: scoreTone(row.score) }}>{row.score}</div>
              <div className="mt-1 text-[12px]" style={{ color: deltaTone(row.delta) }}>
                {row.delta > 0 ? `↑${row.delta}` : row.delta < 0 ? `↓${Math.abs(row.delta)}` : '→'}
              </div>
              <div className="mt-1 text-[12px] text-[var(--t3)]">{row.keyStat}</div>
            </button>
          );
        })}
      </section>

      <section>
        <div className="mb-3 text-[16px] font-medium text-[var(--t1)]">Habits this week</div>
        <div className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="px-1 py-2 text-left text-[13px] font-medium text-[var(--t3)]" />
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <th key={day} className="px-1 py-2 text-center text-[13px] font-medium text-[var(--t3)]">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habitRows.map((row) => (
                <tr key={row.name} className="border-b border-[var(--border)] last:border-b-0">
                  <td className="py-2 pr-2 text-[13px] text-[var(--t2)]">{row.name}</td>
                  {row.data.map((cell, index) => (
                    <td key={`${row.name}-${index}`} className="h-7 w-7 px-1 py-2 text-center">
                      {cell === 'done' ? (
                        <span className="mx-auto block h-[10px] w-[10px] rounded-full" style={{ backgroundColor: row.color }} />
                      ) : cell === 'missed' ? (
                        <span className="mx-auto block h-[10px] w-[10px] rounded-full border" style={{ borderColor: `${row.color}66` }} />
                      ) : (
                        <span className="mx-auto block h-[6px] w-[6px] rounded-full bg-[var(--t3)]" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 flex flex-wrap gap-2">
            {['Workout 83%', 'LifeOS 100%', 'Sleep 83%'].map((item) => (
              <span key={item} className="rounded-full bg-[var(--teal-bg)] px-3 py-1 text-[12px] text-[var(--teal)]">{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 grid grid-cols-3 gap-3">
          {[
            { value: '11', label: 'Tasks done', color: 'var(--teal)' },
            { value: '2', label: 'Tasks missed', color: 'var(--amber)' },
            { value: '3', label: 'Carried forward', color: 'var(--t3)' },
          ].map((item) => (
            <div key={item.label} className="rounded-[12px] bg-[var(--s2)] p-4 text-center">
              <div className="text-[28px] font-medium" style={{ color: item.color }}>{item.value}</div>
              <div className="text-[12px] text-[var(--t3)]">{item.label}</div>
            </div>
          ))}
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--teal-bg)] px-3 py-1 text-[12px] text-[var(--teal)]">
          <Flame size={14} strokeWidth={1.5} />
          Completion streak: 11 days
        </div>
      </section>

      <section>
        <div className="mb-3 text-[16px] font-medium text-[var(--t1)]">Time distribution</div>
        <div className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-5">
          <svg width="100%" height="240" viewBox="0 0 640 240" preserveAspectRatio="none">
            {timeRows.map((row, rowIndex) => {
              const area = getAreaById(row.id, state.areas);
              if (!area) return null;
              const y = rowIndex * 32 + 18;
              const barX = 74;
              const barW = 320;
              const plannedW = (row.planned / maxTimeValue) * barW;
              const actualW = (row.actual / maxTimeValue) * barW;
              return (
                <g key={row.id}>
                  <text x="60" y={y + 7} textAnchor="end" fontSize="12" fill="var(--t3)">{area.name.split(' ')[0]}</text>
                  <rect x={barX} y={y} width={plannedW} height={8} rx={4} fill="none" stroke={area.color} strokeWidth={1} opacity={0.6} />
                  <rect x={barX} y={y + 12} width={actualW} height={8} rx={4} fill={area.color} />
                  <text x={barX + barW + 14} y={y + 15} fontSize="12" fill="var(--t3)">{row.actual}%</text>
                </g>
              );
            })}
          </svg>
          <div className="mt-3 inline-flex rounded-full bg-[var(--amber-bg)] px-3 py-1 text-[12px] text-[var(--amber)]">
            Estimated lost time: 11 hours
          </div>
          <div className="mt-3 rounded-[10px] bg-[var(--teal-bg)] px-3 py-2 text-[12px] text-[var(--teal)]">
            Best day: Tuesday - 3/3 tasks, 3/3 habits, rated 4/5
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2 text-[16px] font-medium text-[var(--t1)]">
          Your patterns
          <Sparkles size={16} strokeWidth={1.5} className="text-[var(--primary)]" />
        </div>
        <div className="space-y-3">
          {patterns.map((pattern) => (
            <article key={pattern} className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-4" style={{ borderLeft: '2px solid var(--primary)' }}>
              <div className="mb-2 flex items-center gap-2 text-[11px] text-[var(--primary)]">
                <Sparkles size={14} strokeWidth={1.5} />
                Pattern detected
              </div>
              <p className="text-[13px] italic text-[var(--t2)]">{pattern}</p>
            </article>
          ))}
          <article className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-4">
            <div className="mb-2 flex items-center gap-2 text-[12px] text-[var(--t2)]">
              <Lock size={16} strokeWidth={1.5} />
              Deeper AI insights unlock at Day 90. You're on Day 47.
            </div>
            <div className="h-[6px] rounded-full bg-[var(--s3)]">
              <div className="h-full rounded-full bg-[var(--amber)]" style={{ width: `${(47 / 90) * 100}%` }} />
            </div>
          </article>
        </div>
      </section>

      <section className="space-y-3">
        {reflectionLabels.map((item) => {
          const disabled = !isSunday;
          return (
            <div key={item.key} className={cn('space-y-2', disabled ? 'opacity-50 pointer-events-none' : '')}>
              <div className="flex items-center gap-2 text-[12px] text-[var(--t3)]">
                {item.label}
                {disabled ? <span className="inline-flex items-center gap-1 rounded-full bg-[var(--s3)] px-2 py-0.5 text-[11px] text-[var(--t2)]"><Lock size={12} strokeWidth={1.5} />Unlocks Sunday</span> : null}
              </div>
              <input
                value={reflection[item.key]}
                onChange={(event) => setReflection((current) => ({ ...current, [item.key]: event.target.value }))}
                onBlur={() => isSunday && saveReflection(reflection)}
                placeholder={item.placeholder}
                className="h-11 w-full rounded-[14px] border border-[var(--border)] bg-[var(--s2)] px-4 text-[14px] text-[var(--t1)] outline-none"
              />
            </div>
          );
        })}
      </section>

      <section className="space-y-3">
        <div className="text-[14px] font-medium text-[var(--t1)]">Next week setup</div>
        <div className="flex flex-wrap gap-2">
          {(['career', 'health', 'mind', 'finance', 'relationships', 'creative'] as AreaId[]).map((id) => {
            const area = getAreaById(id, state.areas);
            return (
              <button
                key={id}
                type="button"
                onClick={() => setNextArea(id)}
                className={cn('rounded-full px-3 py-1 text-[12px]', nextArea === id ? 'bg-[var(--primary)] text-white' : 'bg-[var(--s3)] text-[var(--t2)]')}
              >
                {area?.name ?? id}
              </button>
            );
          })}
        </div>
        <input
          value={commitment}
          onChange={(event) => setCommitment(event.target.value)}
          placeholder="One promise to yourself"
          className="h-11 w-full rounded-[14px] border border-[var(--border)] bg-[var(--s2)] px-4 text-[14px] text-[var(--t1)] outline-none"
        />
        <button
          type="button"
          onClick={submit}
          className="relative h-12 w-full rounded-[12px] bg-[var(--primary)] text-[14px] font-medium text-white"
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2" style={{ animation: 'check-pop 400ms ease' }}>
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20"><Check size={12} strokeWidth={2} /></span>
              Locked in
            </span>
          ) : 'Lock in next week →'}
        </button>
      </section>

      <style>{`@keyframes check-pop {0% {transform: scale(0.8); opacity: 0.7;} 100% {transform: scale(1); opacity: 1;}}`}</style>
    </div>
  );
}

export default Review;
