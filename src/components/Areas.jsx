import React, { useMemo, useState } from 'react';
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useNavigate } from 'react-router-dom';
import '../styles/design-system.css';
import './Areas.css';

const AREAS = [
  { name: 'Career', score: 68, trend: '+12', tasks: '4/5', habits: '3d streak', time: '2h 40m', color: 'var(--blue)' },
  { name: 'Health', score: 71, trend: '+5', tasks: '3/4', habits: '12d streak', time: '4h 20m', color: 'var(--teal)' },
  { name: 'Mind', score: 45, trend: '-8', tasks: '2/5', habits: '1d streak', time: '1h 10m', color: 'var(--purple)' },
  { name: 'Finance', score: 82, trend: '→', tasks: '5/5', habits: '7d streak', time: '3h 30m', color: 'var(--accent)' },
  { name: 'Relationships', score: 39, trend: '-5', tasks: '1/3', habits: '0d streak', time: '0h 50m', color: 'var(--pink)' },
  { name: 'Creative', score: 64, trend: '+3', tasks: '3/5', habits: '5d streak', time: '2h 15m', color: 'var(--orange)' },
];

const TREND = [
  { week: 'W1', Career: 60, Health: 65, Mind: 50, Finance: 80, Relationships: 40, Creative: 55 },
  { week: 'W2', Career: 62, Health: 68, Mind: 48, Finance: 82, Relationships: 42, Creative: 58 },
  { week: 'W3', Career: 64, Health: 70, Mind: 46, Finance: 82, Relationships: 39, Creative: 60 },
  { week: 'W4', Career: 68, Health: 71, Mind: 45, Finance: 82, Relationships: 39, Creative: 64 },
  { week: 'W5', Career: 66, Health: 73, Mind: 52, Finance: 80, Relationships: 44, Creative: 63 },
  { week: 'W6', Career: 69, Health: 72, Mind: 49, Finance: 84, Relationships: 43, Creative: 66 },
  { week: 'W7', Career: 67, Health: 74, Mind: 47, Finance: 83, Relationships: 41, Creative: 67 },
  { week: 'W8', Career: 68, Health: 71, Mind: 45, Finance: 82, Relationships: 39, Creative: 64 },
];

const Areas = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(AREAS[0].name);
  const [showBreakdown, setShowBreakdown] = useState(true);

  const average = Math.round(AREAS.reduce((sum, area) => sum + area.score, 0) / AREAS.length);
  const selectedArea = AREAS.find((area) => area.name === selected) || AREAS[0];

  const breakdown = useMemo(() => {
    return {
      task: Math.min(100, selectedArea.score + 8),
      habit: Math.max(20, selectedArea.score - 6),
      time: Math.max(15, selectedArea.score - 12),
    };
  }, [selectedArea]);

  return (
    <div className="areas-screen">
      <header className="areas-head">
        <h1>Life Areas</h1>
        <p>Weekly performance · Rolling 7 days</p>
        <div className="avg-wrap">
          <span>{average}</span>
          <small>Average across all areas</small>
          <button className="open-detail" onClick={() => navigate(`/areas/${selected.toLowerCase()}`)}>
            Open {selected} detail
          </button>
        </div>
      </header>

      <section className="areas-grid">
        {AREAS.map((area) => (
          <article
            className={`area-tile ${selected === area.name ? 'active' : ''}`}
            key={area.name}
            onClick={() => setSelected(area.name)}
          >
            <div className="line" style={{ background: area.color }} />
            <div className="tile-top">
              <h3 style={{ color: area.color }}>{area.name}</h3>
              <em className={area.trend.startsWith('+') ? 'pos' : area.trend.startsWith('-') ? 'neg' : ''}>{area.trend}</em>
            </div>

            <div className="score-ring" style={{ '--ring-color': area.color, '--score': `${area.score}%` }}>
              <span>{area.score}</span>
            </div>

            <div className="tile-stats mono">
              <div>Tasks: {area.tasks}</div>
              <div>Habits: {area.habits}</div>
              <div>Time: {area.time}</div>
            </div>

            <button
              className="open-detail mini"
              onClick={(event) => {
                event.stopPropagation();
                navigate(`/areas/${area.name.toLowerCase()}`);
              }}
            >
              View details
            </button>
          </article>
        ))}
      </section>

      <section className="breakdown">
        <button className="toggle" onClick={() => setShowBreakdown((prev) => !prev)}>
          {showBreakdown ? 'Hide' : 'Show'} score breakdown
        </button>

        {showBreakdown && (
          <div className="break-grid">
            <article>
              <h4>Task Score (40%)</h4>
              <div className="bar"><div style={{ width: `${breakdown.task}%` }} /></div>
            </article>
            <article>
              <h4>Habit Score (30%)</h4>
              <div className="bar"><div style={{ width: `${breakdown.habit}%` }} /></div>
            </article>
            <article>
              <h4>Time Score (30%)</h4>
              <div className="bar"><div style={{ width: `${breakdown.time}%` }} /></div>
            </article>
          </div>
        )}
      </section>

      <section className="chart-section">
        <h4>8-Week Trend</h4>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={TREND}>
            <XAxis dataKey="week" stroke="var(--text-muted)" />
            <YAxis domain={[0, 100]} stroke="var(--text-muted)" />
            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-raised)' }} />
            <Legend />
            {AREAS.map((area) => (
              <Line key={area.name} type="monotone" dataKey={area.name} stroke={area.color} strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 5 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
};

export default Areas;
