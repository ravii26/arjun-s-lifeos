import React, { useMemo, useState } from 'react';
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useNavigate } from 'react-router-dom';
import '../styles/design-system.css';
import './Areas.css';
import { loadAreasStore } from '../lib/areasStore';

const Areas = () => {
  const navigate = useNavigate();
  const [areasStore] = useState(loadAreasStore);
  const areas = areasStore.overview;
  const trend = areasStore.trend;

  const [selected, setSelected] = useState(areas[0]?.key || 'career');
  const [showBreakdown, setShowBreakdown] = useState(true);

  const average = Math.round(areas.reduce((sum, area) => sum + area.score, 0) / areas.length);
  const selectedArea = areas.find((area) => area.key === selected) || areas[0];

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
          <button className="open-detail" onClick={() => navigate(`/areas/${selected}`)}>
            Open {selectedArea?.name || 'Area'} detail
          </button>
        </div>
      </header>

      <section className="areas-grid">
        {areas.map((area) => (
          <article
            className={`area-tile ${selected === area.key ? 'active' : ''}`}
            key={area.key}
            onClick={() => setSelected(area.key)}
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
                navigate(`/areas/${area.key}`);
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
          <LineChart data={trend}>
            <XAxis dataKey="week" stroke="var(--text-muted)" />
            <YAxis domain={[0, 100]} stroke="var(--text-muted)" />
            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-raised)' }} />
            <Legend />
            {areas.map((area) => (
              <Line key={area.name} type="monotone" dataKey={area.name} stroke={area.color} strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 5 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
};

export default Areas;
