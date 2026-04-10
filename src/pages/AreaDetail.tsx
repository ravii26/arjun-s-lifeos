import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp, AREA_COLORS, type LifeArea } from '../context/AppContext';
import { Icons } from '../components/Icons';

const SLUG_TO_AREA: Record<string, LifeArea> = {
  career: 'Career & Skills', health: 'Health & Body', mind: 'Mind & Learning',
  finance: 'Finance', relationships: 'Relationships', creative: 'Creative',
};
const AREA_SHORT: Record<LifeArea, string> = {
  'Career & Skills': 'Career', 'Health & Body': 'Health', 'Mind & Learning': 'Mind',
  'Finance': 'Finance', 'Relationships': 'Relationships', 'Creative': 'Creative',
};
const AREA_GOALS: Record<LifeArea, string> = {
  'Career & Skills': 'Switch to ₹60-80k role in 9 months',
  'Health & Body': 'Build consistent daily workout habit',
  'Mind & Learning': 'Read 24 books this year',
  'Finance': 'Build 6-month emergency fund',
  'Relationships': 'Strengthen 3 key relationships',
  'Creative': 'Ship one creative project per quarter',
};
const AREA_INSIGHTS: Record<LifeArea, string> = {
  'Career & Skills': 'Your task completion in Career dropped when content consumption exceeded 3 items in a day. You may be in a passive learning loop.',
  'Health & Body': 'Your workout habit has a strong correlation with your sleep score. Miss sleep, miss workout.',
  'Mind & Learning': 'Your Mind score improves on weeks you finish a course lesson.',
  'Finance': 'No Finance tasks in 14 days. This area will continue declining without a single weekly action.',
  'Relationships': 'This is your most neglected area. A 5-minute text counts as a real action.',
  'Creative': 'Creative is at 22 — your lowest. Even 20 minutes of creative work shifts the score.',
};
const TREND_DATA: Record<LifeArea, number[]> = {
  'Career & Skills': [55, 61, 63, 71],
  'Health & Body': [52, 56, 58, 58],
  'Mind & Learning': [58, 60, 61, 64],
  'Finance': [52, 50, 49, 45],
  'Relationships': [48, 44, 44, 38],
  'Creative': [35, 30, 30, 22],
};
const SCORE_BREAKDOWN = [
  { label: 'Habit completion', pct: 78, weight: 40 },
  { label: 'Task completion', pct: 65, weight: 35 },
  { label: 'Consistency', pct: 68, weight: 25 },
];

const AreaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { areaScores, tasks, habits, notes, toggleTask } = useApp();

  const area = SLUG_TO_AREA[id || ''];
  if (!area) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Area not found</div>;

  const areaScore = areaScores.find(a => a.area === area)!;
  const areaColor = AREA_COLORS[area];
  const scoreColor = areaScore.score >= 65 ? 'var(--teal)' : areaScore.score >= 35 ? 'var(--amber)' : 'var(--text-muted)';
  const areaHabits = habits.filter(h => h.area === area);
  const areaTasks = tasks.filter(t => t.area === area);
  const areaNotes = notes.filter(n => n.area === area);
  const trend = TREND_DATA[area];

  const [phase, setPhase] = useState('Building');
  const [goal, setGoal] = useState(AREA_GOALS[area]);
  const [editingGoal, setEditingGoal] = useState(false);

  // SVG chart
  const chartW = 280, chartH = 140, padX = 30, padY = 20;
  const plotW = chartW - padX * 2, plotH = chartH - padY * 2;
  const points = trend.map((v, i) => ({
    x: padX + (i / 3) * plotW,
    y: padY + plotH - (v / 100) * plotH,
  }));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  // Score ring
  const r = 60, circ = 2 * Math.PI * r;
  const progress = (areaScore.score / 100) * circ;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} className="interactive" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
          {Icons.arrowLeft()}
        </button>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: areaColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 14, fontWeight: 500,
        }}>
          {AREA_SHORT[area][0]}
        </div>
        <span style={{ fontSize: 20, fontWeight: 500 }}>{area}</span>
      </div>

      {/* Goal */}
      <div style={{ padding: '0 4px' }}>
        {editingGoal ? (
          <input
            autoFocus value={goal}
            onChange={e => setGoal(e.target.value)}
            onBlur={() => setEditingGoal(false)}
            onKeyDown={e => e.key === 'Enter' && setEditingGoal(false)}
            style={{
              width: '100%', fontSize: 14, color: 'var(--text-secondary)', background: 'var(--surface-2)',
              border: '0.5px solid var(--border)', borderRadius: 8, padding: '8px 12px', outline: 'none', fontFamily: 'Inter',
            }}
          />
        ) : (
          <div onClick={() => setEditingGoal(true)} style={{ fontSize: 14, color: 'var(--text-secondary)', cursor: 'pointer' }}>
            {goal}
          </div>
        )}
      </div>

      {/* Phase selector */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--surface-2)', borderRadius: 10, padding: 4, width: 'fit-content', flexWrap: 'wrap' }}>
        {['Building', 'Exploring', 'Maintaining', 'Recovering'].map(p => (
          <button key={p} onClick={() => setPhase(p)} style={{
            padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: phase === p ? 'var(--primary)' : 'transparent',
            color: phase === p ? '#fff' : 'var(--text-muted)',
            fontSize: 12, fontWeight: 500, fontFamily: 'Inter', transition: 'all 150ms ease',
          }}>{p}</button>
        ))}
      </div>

      {/* Score ring */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
          <circle cx="70" cy="70" r={r} fill="none" stroke={scoreColor} strokeWidth="10"
            strokeDasharray={circ} strokeDashoffset={circ - progress}
            strokeLinecap="round" transform="rotate(-90 70 70)" style={{ transition: 'stroke-dashoffset 600ms ease' }} />
          <text x="70" y="70" textAnchor="middle" dominantBaseline="central"
            style={{ fill: scoreColor, fontSize: 36, fontWeight: 500, fontFamily: 'Inter' }}>
            {areaScore.score}
          </text>
        </svg>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
          <span style={{ color: areaScore.change > 0 ? 'var(--teal)' : areaScore.change < 0 ? 'var(--amber)' : 'var(--text-muted)' }}>
            {areaScore.change > 0 ? Icons.arrowUp() : areaScore.change < 0 ? Icons.arrowDown() : Icons.arrowFlat()}
          </span>
          <span style={{ fontSize: 13, color: areaScore.change > 0 ? 'var(--teal)' : areaScore.change < 0 ? 'var(--amber)' : 'var(--text-muted)' }}>
            {Math.abs(areaScore.change)} points from last week
          </span>
        </div>
      </div>

      {/* Score breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {SCORE_BREAKDOWN.map(b => (
          <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 100, flexShrink: 0 }}>{b.label}</span>
            <div style={{ flex: 1, height: 6, borderRadius: 14, background: 'var(--surface-3)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${b.pct}%`, borderRadius: 14, background: b.pct >= 65 ? 'var(--teal)' : 'var(--amber)' }} />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 70, textAlign: 'right', flexShrink: 0 }}>({b.weight}% of score)</span>
          </div>
        ))}
      </div>

      {/* 4-week trend */}
      <div>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>4-week trend</div>
        <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 14, padding: 20, display: 'flex', justifyContent: 'center' }}>
          <svg width={chartW} height={chartH} viewBox={`0 0 ${chartW} ${chartH}`}>
            {[0, 50, 100].map(v => {
              const y = padY + plotH - (v / 100) * plotH;
              return (
                <g key={v}>
                  <line x1={padX} y1={y} x2={chartW - padX} y2={y} stroke="var(--border)" strokeWidth="1" />
                  <text x={padX - 6} y={y + 4} textAnchor="end" style={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'Inter' }}>{v}</text>
                </g>
              );
            })}
            <path d={pathD} fill="none" stroke={areaColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="4" fill={areaColor} />
                <text x={p.x} y={chartH - 4} textAnchor="middle" style={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'Inter' }}>W{i + 4}</text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Habits */}
      {areaHabits.length > 0 && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>Habits</div>
          {areaHabits.map(habit => (
            <div key={habit.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
              borderBottom: '0.5px solid var(--border)',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{habit.name}</div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {habit.last7.map((d, i) => (
                  <div key={i} style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: d === 'done' ? areaColor : 'transparent',
                    border: d === 'done' ? 'none' : d === 'pending' ? '1.5px solid var(--primary)' : `1.5px solid color-mix(in srgb, ${areaColor} 40%, transparent)`,
                  }} />
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {Icons.flame()}
                <span style={{ fontSize: 14, fontWeight: 500 }}>{habit.streak}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>days</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tasks */}
      <div>
        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>Tasks</div>
        {areaTasks.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No tasks for this area yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {areaTasks.map(task => (
              <div key={task.id} style={{
                background: 'var(--surface-1)', border: '0.5px solid var(--border)',
                borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
                opacity: task.completed ? 0.6 : 1,
              }}>
                <button onClick={() => toggleTask(task.id)} style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  border: task.completed ? 'none' : '1.5px solid var(--border-strong)',
                  background: task.completed ? 'var(--primary)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}>
                  {task.completed && Icons.check()}
                </button>
                <span style={{ fontSize: 14, fontWeight: 500, textDecoration: task.completed ? 'line-through' : 'none', flex: 1 }}>{task.title}</span>
                <span style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 20,
                  background: task.priority === 'P1' ? 'var(--primary-muted-bg)' : task.priority === 'P2' ? 'var(--amber-muted-bg)' : 'var(--surface-3)',
                  color: task.priority === 'P1' ? 'var(--primary)' : task.priority === 'P2' ? 'var(--amber)' : 'var(--text-muted)',
                  fontWeight: 500,
                }}>{task.priority}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      {areaNotes.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 500 }}>Notes & knowledge</span>
              <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 20, background: 'var(--surface-2)', color: 'var(--text-muted)' }}>{areaNotes.length}</span>
            </div>
          </div>
          {areaNotes.map(note => (
            <div key={note.id} style={{
              background: 'var(--surface-1)', border: '0.5px solid var(--border)',
              borderRadius: 14, padding: '12px 16px', marginBottom: 8,
            }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{note.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{note.keyPoints.slice(0, 2).join(', ')}</div>
            </div>
          ))}
        </div>
      )}

      {/* AI insight */}
      <div style={{
        background: 'var(--surface-2)', border: '0.5px solid var(--border)',
        borderLeft: '3px solid var(--primary)', borderRadius: 14, padding: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          {Icons.sparkle()}
          <span style={{ fontSize: 12, color: 'var(--primary)' }}>AI observation</span>
        </div>
        <p style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
          {AREA_INSIGHTS[area]}
        </p>
      </div>
    </div>
  );
};

export default AreaDetail;
