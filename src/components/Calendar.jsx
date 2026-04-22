import React, { useState, useEffect } from 'react';
import '../styles/design-system.css';

const Calendar = () => {
  const [view, setView] = useState('day'); // 'day' or 'week'
  const [blocks, setBlocks] = useState([
    {
      id: 1,
      title: 'Deep Work',
      area: 'Career',
      start: '09:00',
      end: '11:00',
      type: 'task',
      status: 'planned',
    },
    {
      id: 2,
      title: 'Workout',
      area: 'Health',
      start: '17:00',
      end: '18:00',
      type: 'habit',
      status: 'completed',
    },
    {
      id: 3,
      title: 'Reading',
      area: 'Mind',
      start: '20:00',
      end: '21:00',
      type: 'manual',
      status: 'missed',
    },
  ]);
  const [sessions, setSessions] = useState([
    {
      id: 1,
      title: 'Deep Work Session',
      area: 'Career',
      start: '09:15',
      end: '10:45',
    },
    {
      id: 2,
      title: 'Evening Workout',
      area: 'Health',
      start: '17:10',
      end: '17:50',
    },
  ]);

  useEffect(() => {
    // Auto-scroll to current time on load
    const now = new Date();
    const currentHour = now.getHours();
    const timeline = document.querySelector('.timeline');
    if (timeline) {
      timeline.scrollTop = currentHour * 80 - 160; // Scroll to current hour
    }
  }, []);

  const renderTimeLabels = () => {
    const hours = [];
    for (let i = 6; i <= 23; i++) {
      hours.push(
        <div
          key={i}
          style={{
            height: '80px',
            borderBottom: '1px dashed var(--border)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}
        >
          {i}:00
        </div>
      );
    }
    return hours;
  };

  const renderBlocks = () => {
    return blocks.map((block) => {
      const startHour = parseInt(block.start.split(':')[0], 10);
      const startMinute = parseInt(block.start.split(':')[1], 10);
      const endHour = parseInt(block.end.split(':')[0], 10);
      const endMinute = parseInt(block.end.split(':')[1], 10);
      const top = (startHour - 6) * 80 + (startMinute / 60) * 80;
      const height = ((endHour - startHour) * 80) + ((endMinute - startMinute) / 60) * 80;

      return (
        <div
          key={block.id}
          style={{
            position: 'absolute',
            top: `${top}px`,
            height: `${height}px`,
            width: '85%',
            backgroundColor: `var(--${block.area.toLowerCase()}-dim)`,
            borderLeft: `3px solid var(--${block.area.toLowerCase()})`,
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 10px',
            fontFamily: 'var(--font-ui)',
            fontSize: '13px',
            color: 'var(--text-primary)',
          }}
        >
          <div style={{ fontWeight: 'var(--weight-medium)' }}>{block.title}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
            {block.start}–{block.end}
          </div>
        </div>
      );
    });
  };

  const renderSessions = () => {
    return sessions.map((session) => {
      const startHour = parseInt(session.start.split(':')[0], 10);
      const startMinute = parseInt(session.start.split(':')[1], 10);
      const endHour = parseInt(session.end.split(':')[0], 10);
      const endMinute = parseInt(session.end.split(':')[1], 10);
      const top = (startHour - 6) * 80 + (startMinute / 60) * 80;
      const height = ((endHour - startHour) * 80) + ((endMinute - startMinute) / 60) * 80;

      return (
        <div
          key={session.id}
          style={{
            position: 'absolute',
            top: `${top}px`,
            height: `${height}px`,
            width: '60%',
            right: 0,
            backgroundColor: `var(--${session.area.toLowerCase()}-dim)`,
            borderLeft: `4px solid var(--${session.area.toLowerCase()})`,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            padding: '4px 8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text-primary)',
          }}
        >
          <div>{session.title}</div>
          <div>{session.start}–{session.end}</div>
        </div>
      );
    });
  };

  return (
    <div className="calendar" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left Column: Time Labels */}
      <div style={{ width: '64px', backgroundColor: 'var(--bg)', overflowY: 'auto' }}>
        {renderTimeLabels()}
      </div>

      {/* Center Column: Timeline */}
      <div className="timeline" style={{ flexGrow: 1, position: 'relative', overflowY: 'auto', backgroundColor: 'var(--surface)' }}>
        {renderBlocks()}
        {renderSessions()}
        {/* Current Time Indicator */}
        <div
          style={{
            position: 'absolute',
            top: `${(new Date().getHours() - 6) * 80 + (new Date().getMinutes() / 60) * 80}px`,
            left: 0,
            width: '100%',
            height: '2px',
            backgroundColor: 'var(--accent)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '-8px',
              width: '8px',
              height: '8px',
              backgroundColor: 'var(--accent)',
              borderRadius: '50%',
              animation: 'pulse 1.5s infinite',
            }}
          ></div>
        </div>
      </div>

      {/* Right Column: Day Summary Panel */}
      <div style={{ width: '240px', backgroundColor: 'var(--surface)', padding: 'var(--space-4)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
          Today's Summary
        </h2>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--text-secondary)' }}>
          4h 20m planned · 2h 45m actual
        </p>
      </div>
    </div>
  );
};

export default Calendar;