import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './design-system.css';

const Areas = () => {
  const [selectedArea, setSelectedArea] = useState(null);
  const [isBreakdownExpanded, setBreakdownExpanded] = useState(false);

  const areas = [
    { name: 'Career', score: 68, trend: '+12', tasks: '4/5', habits: '3d streak', time: '2h 40m', color: 'var(--blue)' },
    { name: 'Health', score: 71, trend: '+5', tasks: '3/4', habits: '12d streak', time: '4h 20m', color: 'var(--teal)' },
    { name: 'Mind', score: 45, trend: '-8', tasks: '2/5', habits: '1d streak', time: '1h 10m', color: 'var(--purple)' },
    { name: 'Finance', score: 82, trend: '→', tasks: '5/5', habits: '7d streak', time: '3h 30m', color: 'var(--accent)' },
    { name: 'Relationships', score: 39, trend: '-5', tasks: '1/3', habits: '0d streak', time: '0h 50m', color: 'var(--pink)' },
    { name: 'Creative', score: 64, trend: '+3', tasks: '3/5', habits: '5d streak', time: '2h 15m', color: 'var(--orange)' },
  ];

  const trendData = [
    { week: 'W1', Career: 60, Health: 65, Mind: 50, Finance: 80, Relationships: 40, Creative: 55 },
    { week: 'W2', Career: 62, Health: 68, Mind: 48, Finance: 82, Relationships: 42, Creative: 58 },
    { week: 'W3', Career: 64, Health: 70, Mind: 46, Finance: 82, Relationships: 39, Creative: 60 },
    { week: 'W4', Career: 68, Health: 71, Mind: 45, Finance: 82, Relationships: 39, Creative: 64 },
  ];

  const handleAreaClick = (area) => {
    setSelectedArea(area);
  };

  const renderAreaCards = () => {
    return areas.map((area) => (
      <div
        key={area.name}
        style={{
          width: '260px',
          height: '180px',
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-4)',
          position: 'relative',
          cursor: 'pointer',
        }}
        onClick={() => handleAreaClick(area)}
      >
        <div
          style={{
            height: '4px',
            backgroundColor: area.color,
            borderRadius: 'var(--radius-sm)',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        ></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 'var(--weight-bold)', color: area.color }}>
            {area.name}
          </h3>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: area.trend.startsWith('+') ? 'var(--teal)' : area.trend.startsWith('-') ? 'var(--red)' : 'var(--text-muted)' }}>
            {area.trend}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '96px' }}>
          <div
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              border: `6px solid ${area.color}`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: '32px',
              fontWeight: 'var(--weight-bold)',
              color: area.color,
            }}
          >
            {area.score}
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
          <p>Tasks: {area.tasks}</p>
          <p>Habits: {area.habits}</p>
          <p>Time: {area.time}</p>
        </div>
      </div>
    ));
  };

  return (
    <div className="areas" style={{ padding: 'var(--space-8)' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
          Life Areas
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)' }}>
          Weekly performance · Rolling 7 days
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-4)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '64px', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
            68
          </span>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Average across all areas
          </span>
        </div>
      </div>

      {/* Area Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        {renderAreaCards()}
      </div>

      {/* Score Breakdown Section */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-ui)',
            fontSize: '14px',
            cursor: 'pointer',
          }}
          onClick={() => setBreakdownExpanded(!isBreakdownExpanded)}
        >
          {isBreakdownExpanded ? 'Hide' : 'How scores are calculated'}
        </button>
        {isBreakdownExpanded && (
          <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-4)' }}>
            <div style={{ flex: 1, backgroundColor: 'var(--surface)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
                Task Score (40%)
              </h4>
              <div style={{ height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden', marginTop: 'var(--space-2)' }}>
                <div style={{ width: '80%', height: '100%', backgroundColor: 'var(--accent)' }}></div>
              </div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'var(--surface)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
                Habit Score (30%)
              </h4>
              <div style={{ height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden', marginTop: 'var(--space-2)' }}>
                <div style={{ width: '60%', height: '100%', backgroundColor: 'var(--accent)' }}></div>
              </div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'var(--surface)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
                Time Score (30%)
              </h4>
              <div style={{ height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden', marginTop: 'var(--space-2)' }}>
                <div style={{ width: '50%', height: '100%', backgroundColor: 'var(--accent)' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trend Chart */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h4 style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
          8-Week Trend
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <XAxis dataKey="week" stroke="var(--text-muted)" />
            <YAxis domain={[0, 100]} stroke="var(--text-muted)" />
            <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: 'none', borderRadius: 'var(--radius-md)' }} />
            <Legend />
            {areas.map((area) => (
              <Line
                key={area.name}
                type="monotone"
                dataKey={area.name}
                stroke={area.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Areas;