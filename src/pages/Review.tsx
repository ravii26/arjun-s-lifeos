import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, AREA_COLORS, type LifeArea } from '../context/AppContext';
import { Icons } from '../components/Icons';

const AREA_SHORT: Record<LifeArea, string> = {
  'Career & Skills': 'Career', 'Health & Body': 'Health', 'Mind & Learning': 'Mind',
  'Finance': 'Finance', 'Relationships': 'Relationships', 'Creative': 'Creative',
};
const AREA_SLUGS: Record<LifeArea, string> = {
  'Career & Skills': 'career', 'Health & Body': 'health', 'Mind & Learning': 'mind',
  'Finance': 'finance', 'Relationships': 'relationships', 'Creative': 'creative',
};
const ALL_AREAS: LifeArea[] = ['Career & Skills', 'Health & Body', 'Mind & Learning', 'Finance', 'Relationships', 'Creative'];

const REVIEW_STATS: Record<LifeArea, string> = {
  'Career & Skills': '4/5 tasks completed',
  'Health & Body': 'Workout 4/7 days',
  'Mind & Learning': '3 books/articles read',
  'Finance': 'No finance tasks this week',
  'Relationships': '0 intentional connections',
  'Creative': 'No creative work logged',
};

const HABIT_WEEK = [
  { name: '5:30am workout', data: ['done','done','missed','done','done','done','pending'] as const },
  { name: 'LifeOS build daily', data: ['done','done','done','done','done','done','pending'] as const },
  { name: 'Sleep by 11pm', data: ['done','missed','done','done','done','done','pending'] as const },
];
const DAYS = ['M','T','W','T','F','S','S'];

const TIME_DATA = [
  { area: 'Career & Skills' as LifeArea, planned: 40, actual: 45 },
  { area: 'Health & Body' as LifeArea, planned: 20, actual: 18 },
  { area: 'Mind & Learning' as LifeArea, planned: 15, actual: 14 },
  { area: 'Finance' as LifeArea, planned: 10, actual: 3 },
  { area: 'Relationships' as LifeArea, planned: 10, actual: 4 },
  { area: 'Creative' as LifeArea, planned: 5, actual: 1 },
];

const PATTERNS = [
  'You complete 94% of tasks on days you focus on LifeOS build. Your best work has a clear single focus.',
  'Your workout habit drops to 0% on days following an evening rating of 2 or below. How you end today shapes how you start tomorrow.',
  'Wednesday has been your lowest-scoring day for 5 consecutive weeks. Something about midweek is breaking your rhythm.',
];

const Review = () => {
  const { areaScores } = useApp();
  const navigate = useNavigate();
  const isSunday = new Date().getDay() === 0;

  const [reflections, setReflections] = useState(['','','','']);
  const [focusArea, setFocusArea] = useState<LifeArea>('Relationships');
  const [commitment, setCommitment] = useState('');

  const handleSubmit = () => {
    navigate('/dashboard');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 22, fontWeight: 500 }}>Week 7 review</span>
        <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Mar 31 — Apr 6</span>
      </div>

      {/* Non-Sunday banner */}
      {!isSunday && (
        <div style={{
          background: 'var(--surface-2)', border: '0.5px solid var(--border)',
          borderLeft: '3px solid var(--amber)', borderRadius: 14, padding: 20,
        }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
            Full review unlocks on Sunday. Here's your week so far.
          </div>
        </div>
      )}

      {/* Area score cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {areaScores.map(area => {
          const scoreColor = area.score >= 65 ? 'var(--teal)' : area.score >= 35 ? 'var(--amber)' : 'var(--text-muted)';
          return (
            <div key={area.area} onClick={() => navigate(`/areas/${AREA_SLUGS[area.area]}`)}
              className="interactive" style={{
                background: 'var(--surface-1)', border: '0.5px solid var(--border)',
                borderLeft: `3px solid ${area.color}`, borderRadius: 14, padding: 16, cursor: 'pointer',
              }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>{AREA_SHORT[area.area]}</div>
              <div style={{ fontSize: 28, fontWeight: 500, color: scoreColor, margin: '4px 0' }}>{area.score}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                <span style={{ color: area.change > 0 ? 'var(--teal)' : area.change < 0 ? 'var(--amber)' : 'var(--text-muted)' }}>
                  {area.change > 0 ? Icons.arrowUp() : area.change < 0 ? Icons.arrowDown() : Icons.arrowFlat()}
                </span>
                <span style={{ fontSize: 12, color: area.change > 0 ? 'var(--teal)' : area.change < 0 ? 'var(--amber)' : 'var(--text-muted)' }}>
                  {area.change > 0 ? `+${area.change}` : area.change === 0 ? 'flat' : area.change}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{REVIEW_STATS[area.area]}</div>
            </div>
          );
        })}
      </div>

      {/* Habits table */}
      <div>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>Habits this week</div>
        <div style={{ background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: 14, padding: 16, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', fontSize: 12, color: 'var(--text-muted)', fontWeight: 400, padding: '4px 8px 8px 0', minWidth: 120 }}></th>
                {DAYS.map((d, i) => (
                  <th key={i} style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400, padding: '4px 8px 8px', textAlign: 'center', minWidth: 28 }}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HABIT_WEEK.map((h, hi) => (
                <tr key={hi}>
                  <td style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', padding: '8px 8px 8px 0' }}>{h.name}</td>
                  {h.data.map((d, di) => (
                    <td key={di} style={{ textAlign: 'center', padding: '8px' }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%', margin: '0 auto',
                        background: d === 'done' ? AREA_COLORS[hi === 0 ? 'Health & Body' : hi === 1 ? 'Career & Skills' : 'Mind & Learning'] : 'transparent',
                        border: d === 'done' ? 'none' : d === 'pending' ? '1.5px solid var(--primary)' : '1.5px solid var(--border-strong)',
                      }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {[
              { name: 'Workout', pct: '83%' },
              { name: 'LifeOS', pct: '100%' },
              { name: 'Sleep', pct: '83%' },
            ].map(p => (
              <span key={p.name} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: 'var(--teal-muted-bg)', color: 'var(--teal)' }}>
                {p.name} {p.pct}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Task performance */}
      <div style={{ display: 'flex', gap: 12 }}>
        {[
          { value: '11', label: 'Tasks done', color: 'var(--teal)' },
          { value: '2', label: 'Tasks missed', color: 'var(--amber)' },
          { value: '3', label: 'Carried forward', color: 'var(--text-muted)' },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, background: 'var(--surface-1)', border: '0.5px solid var(--border)',
            borderRadius: 14, padding: '16px 12px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 24, fontWeight: 500, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {Icons.flame()}
        <span style={{ fontSize: 12, color: 'var(--teal)', padding: '4px 10px', borderRadius: 20, background: 'var(--teal-muted-bg)' }}>
          Completion streak: 11 days
        </span>
      </div>

      {/* Time distribution */}
      <div>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>Time distribution</div>
        <div style={{ background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: 14, padding: 20 }}>
          {TIME_DATA.map(t => (
            <div key={t.area} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 60, flexShrink: 0 }}>{AREA_SHORT[t.area]}</span>
              <div style={{ flex: 1, position: 'relative', height: 16 }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: `${t.planned}%`, height: 8, borderRadius: 4, border: `1px solid ${AREA_COLORS[t.area]}`, opacity: 0.5 }} />
                <div style={{ position: 'absolute', top: 0, left: 0, width: `${t.actual}%`, height: 8, borderRadius: 4, background: AREA_COLORS[t.area] }} />
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 32, textAlign: 'right', flexShrink: 0 }}>{t.actual}%</span>
            </div>
          ))}
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--amber)', padding: '4px 10px', borderRadius: 20, background: 'var(--amber-muted-bg)', alignSelf: 'flex-start' }}>
              Estimated lost time: 11 hours
            </span>
            <div style={{ background: 'var(--teal-muted-bg)', borderRadius: 10, padding: '8px 12px' }}>
              <span style={{ fontSize: 12, color: 'var(--teal)' }}>Best day: Tuesday — 3/3 tasks, 3/3 habits, rated 4/5</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Patterns */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 500 }}>Your patterns</span>
          {Icons.sparkle()}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PATTERNS.map((p, i) => (
            <div key={i} style={{
              background: 'var(--surface-2)', border: '0.5px solid var(--border)',
              borderLeft: '2px solid var(--primary)', borderRadius: 14, padding: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                {Icons.sparkle()}
                <span style={{ fontSize: 11, color: 'var(--primary)' }}>Pattern detected</span>
              </div>
              <p style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{p}</p>
            </div>
          ))}
          {/* Locked Layer 3 */}
          <div style={{
            background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 14, padding: 16,
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {Icons.lock()}
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Deeper AI insights unlock at Day 90. You're on Day 47.</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-3)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(47/90)*100}%`, background: 'var(--amber)', borderRadius: 3 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Reflection fields */}
      <div>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>Reflections</div>
        {[
          { label: 'WHAT MOVED ME FORWARD THIS WEEK?', placeholder: 'e.g. Stayed consistent with LifeOS' },
          { label: 'WHAT WASTED MY TIME?', placeholder: 'e.g. Too much YouTube in evenings' },
          { label: 'WHAT DID I KEEP AVOIDING?', placeholder: 'e.g. Finance tasks, calling parents' },
          { label: 'WHAT CHANGES NEXT WEEK?', placeholder: 'e.g. No phone until 9am, one Finance task daily' },
        ].map((field, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>
              {field.label}
              {!isSunday && <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--amber)' }}>Unlocks Sunday</span>}
            </label>
            <input
              value={reflections[i]}
              onChange={e => { const r = [...reflections]; r[i] = e.target.value; setReflections(r); }}
              disabled={!isSunday}
              placeholder={field.placeholder}
              style={{
                width: '100%', marginTop: 8, background: 'var(--surface-2)', border: '0.5px solid var(--border)',
                borderRadius: 14, padding: '12px 16px', color: 'var(--text-primary)', fontSize: 14,
                outline: 'none', fontFamily: 'Inter', opacity: isSunday ? 1 : 0.5,
              }}
            />
          </div>
        ))}
      </div>

      {/* Next week setup */}
      <div>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>Next week</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Which area needs most attention?</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {ALL_AREAS.map(a => (
            <button key={a} onClick={() => setFocusArea(a)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20,
              border: a === focusArea ? `1px solid ${AREA_COLORS[a]}` : '0.5px solid var(--border)',
              background: a === focusArea ? `color-mix(in srgb, ${AREA_COLORS[a]} 15%, transparent)` : 'var(--surface-3)',
              color: a === focusArea ? AREA_COLORS[a] : 'var(--text-muted)',
              fontSize: 12, cursor: 'pointer', fontFamily: 'Inter',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: AREA_COLORS[a] }} />
              {AREA_SHORT[a]}
            </button>
          ))}
        </div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>One promise to yourself:</label>
        <input
          value={commitment}
          onChange={e => setCommitment(e.target.value)}
          placeholder="e.g. Text one person I care about every day"
          style={{
            width: '100%', marginTop: 8, background: 'var(--surface-2)', border: '0.5px solid var(--border)',
            borderRadius: 14, padding: '12px 16px', color: 'var(--text-primary)', fontSize: 14,
            outline: 'none', fontFamily: 'Inter',
          }}
        />
        <button onClick={handleSubmit} className="interactive" style={{
          width: '100%', marginTop: 20, padding: 14, borderRadius: 14,
          background: 'var(--primary)', color: '#fff', fontSize: 14, fontWeight: 500,
          border: 'none', cursor: 'pointer', fontFamily: 'Inter',
        }}>
          Lock in next week →
        </button>
      </div>
    </div>
  );
};

export default Review;
