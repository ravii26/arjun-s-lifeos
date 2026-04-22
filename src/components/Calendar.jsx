import React, { useMemo, useState } from 'react';
import '../styles/design-system.css';
import './Calendar.css';

const AREA_COLORS = {
  Career: 'var(--blue)',
  Health: 'var(--teal)',
  Mind: 'var(--purple)',
  Finance: 'var(--accent)',
};

const HOURS = Array.from({ length: 18 }).map((_, index) => index + 6);

const toMinutes = (timeText) => {
  const [h, m] = timeText.split(':').map(Number);
  return (h - 6) * 60 + m;
};

const Calendar = () => {
  const [view, setView] = useState('Day');

  const [blocks] = useState([
    { id: 1, title: 'Deep Work', area: 'Career', start: '09:00', end: '11:00', source: 'task', status: 'Planned' },
    { id: 2, title: 'Workout', area: 'Health', start: '17:00', end: '18:00', source: 'habit', status: 'Completed' },
    { id: 3, title: 'Reading', area: 'Mind', start: '20:00', end: '21:00', source: 'manual', status: 'Missed' },
  ]);

  const [sessions] = useState([
    { id: 1, title: 'Deep Work Session', area: 'Career', start: '09:15', end: '10:45' },
    { id: 2, title: 'Evening Workout', area: 'Health', start: '17:10', end: '17:50' },
  ]);

  const now = new Date();
  const nowY = (now.getHours() - 6) * 80 + (now.getMinutes() / 60) * 80;

  const plannedMinutes = useMemo(
    () => blocks.reduce((sum, block) => sum + (toMinutes(block.end) - toMinutes(block.start)), 0),
    [blocks]
  );

  const actualMinutes = useMemo(
    () => sessions.reduce((sum, session) => sum + (toMinutes(session.end) - toMinutes(session.start)), 0),
    [sessions]
  );

  return (
    <div className="calendar-screen">
      <header className="calendar-head">
        <div>
          <h1>Calendar</h1>
          <p>Plan vs reality timeline</p>
        </div>
        <div className="toggle-row">
          {['Day', 'Week'].map((item) => (
            <button key={item} className={`btn ${view === item ? 'active' : ''}`} onClick={() => setView(item)}>{item}</button>
          ))}
        </div>
      </header>

      <div className="calendar-grid">
        <aside className="time-col">
          {HOURS.map((hour) => (
            <div key={hour} className="time-cell">{hour}:00</div>
          ))}
        </aside>

        <section className="timeline-col">
          <div className="timeline">
            {HOURS.map((hour) => (
              <div key={hour} className="timeline-line" />
            ))}

            {blocks.map((block) => {
              const top = (toMinutes(block.start) / 60) * 80;
              const height = ((toMinutes(block.end) - toMinutes(block.start)) / 60) * 80;
              return (
                <article
                  key={block.id}
                  className={`block ${block.status.toLowerCase()}`}
                  style={{ top, height, borderLeftColor: AREA_COLORS[block.area], background: `${AREA_COLORS[block.area]}18` }}
                >
                  <strong>{block.title}</strong>
                  <p>{block.start} - {block.end}</p>
                  <small>{block.source}</small>
                </article>
              );
            })}

            {sessions.map((session) => {
              const top = (toMinutes(session.start) / 60) * 80;
              const height = ((toMinutes(session.end) - toMinutes(session.start)) / 60) * 80;
              return (
                <article
                  key={session.id}
                  className="session"
                  style={{ top, height, borderLeftColor: AREA_COLORS[session.area], background: `${AREA_COLORS[session.area]}2b` }}
                >
                  <strong>{session.title}</strong>
                  <p>{session.start} - {session.end}</p>
                </article>
              );
            })}

            <div className="now-line" style={{ top: nowY }}>
              <span />
            </div>
          </div>
        </section>

        <aside className="summary-col">
          <article>
            <h4>Today&apos;s Summary</h4>
            <p>{Math.floor(plannedMinutes / 60)}h {plannedMinutes % 60}m planned</p>
            <p>{Math.floor(actualMinutes / 60)}h {actualMinutes % 60}m actual</p>
          </article>

          <article>
            <h4>Consistency</h4>
            <div className="progress"><div style={{ width: `${Math.min(100, Math.round((actualMinutes / plannedMinutes) * 100))}%` }} /></div>
            <small>{Math.min(100, Math.round((actualMinutes / plannedMinutes) * 100))}% alignment</small>
          </article>

          <article>
            <h4>Quick Actions</h4>
            <button className="btn fill">+ Add time block</button>
            <button className="btn fill">Start timer now</button>
          </article>
        </aside>
      </div>
    </div>
  );
};

export default Calendar;
