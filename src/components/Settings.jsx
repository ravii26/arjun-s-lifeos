import React, { useMemo, useState } from 'react';
import '../styles/design-system.css';
import './Settings.css';

const AREA_COLORS = {
  Career: 'var(--blue)',
  Health: 'var(--teal)',
  Mind: 'var(--purple)',
  Finance: 'var(--accent)',
  Relationships: 'var(--pink)',
  Creative: 'var(--orange)',
};

const SETTINGS_GROUPS = [
  { group: 'ACCOUNT', items: ['Profile', 'Security'] },
  { group: 'SYSTEM', items: ['Areas & Goals', 'Notifications', 'Data'] },
  { group: 'PREFERENCES', items: ['Theme & Display', 'Shortcuts'] },
  { group: 'ADVANCED', items: ['Export', 'Integrations'] },
];

const Settings = () => {
  const [activeSection, setActiveSection] = useState('Profile');
  const [editingName, setEditingName] = useState(false);

  const [profile, setProfile] = useState({
    avatar: 'https://images.unsplash.com/photo-1557862921-37829c790f19?auto=format&fit=crop&w=200&q=60',
    name: 'Arjun Verma',
    email: 'arjun@lifeos.ai',
    memberSince: 'Apr 2025',
    stats: {
      tasksCompleted: 127,
      habitsLogged: 47,
      hoursTracked: 62,
    },
  });

  const [areas, setAreas] = useState([
    { id: 1, name: 'Career', hours: 12, active: true },
    { id: 2, name: 'Health', hours: 7, active: true },
    { id: 3, name: 'Mind', hours: 6, active: true },
    { id: 4, name: 'Finance', hours: 4, active: true },
    { id: 5, name: 'Relationships', hours: 3, active: false },
    { id: 6, name: 'Creative', hours: 5, active: true },
  ]);

  const [goal, setGoal] = useState('Career & Income');
  const [goalEndDate] = useState('2026-07-20');

  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    dailyTime: '08:00',
    habitReminders: true,
    lowScoreAlerts: true,
    lowScoreThreshold: 40,
    weeklySummary: true,
    weeklyDay: 'Sunday',
    vaultSuggestions: true,
  });

  const [theme, setTheme] = useState('System');
  const [density, setDensity] = useState('Comfortable');
  const [fontSize, setFontSize] = useState('Medium');
  const [scoreDisplay, setScoreDisplay] = useState('Percentage');

  const moveArea = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= areas.length) return;
    const next = [...areas];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setAreas(next);
  };

  const onDragStart = (event, index) => {
    event.dataTransfer.setData('text/plain', String(index));
  };

  const onDrop = (event, targetIndex) => {
    const sourceIndex = Number(event.dataTransfer.getData('text/plain'));
    if (Number.isNaN(sourceIndex)) return;
    moveArea(sourceIndex, targetIndex);
  };

  const usageData = useMemo(
    () => [
      { name: 'Tasks', count: 382 },
      { name: 'Habits', count: 219 },
      { name: 'Notes', count: 96 },
      { name: 'Vault', count: 31 },
      { name: 'Resources', count: 74 },
    ],
    []
  );

  const totalUsage = usageData.reduce((sum, item) => sum + item.count, 0);

  const renderProfile = () => (
    <section className="settings-section">
      <h2>Profile</h2>
      <div className="profile-card">
        <img src={profile.avatar} alt="avatar" />
        <div className="profile-meta">
          <div className="name-row">
            {editingName ? (
              <input
                value={profile.name}
                onChange={(event) => setProfile((prev) => ({ ...prev, name: event.target.value }))}
                onBlur={() => setEditingName(false)}
                autoFocus
              />
            ) : (
              <h3>{profile.name}</h3>
            )}
            <button className="ghost" onClick={() => setEditingName((prev) => !prev)}>Edit</button>
          </div>
          <p>{profile.email}</p>
          <span className="mono">Member since {profile.memberSince}</span>
        </div>
      </div>
      <div className="stats-line mono">
        {profile.stats.tasksCompleted} tasks completed · {profile.stats.habitsLogged} habits logged · {profile.stats.hoursTracked}h tracked
      </div>
    </section>
  );

  const renderAreasGoals = () => (
    <section className="settings-section">
      <h2>Your Focus Configuration</h2>
      <div className="areas-table">
        {areas.map((area, index) => (
          <div
            className="area-row"
            key={area.id}
            draggable
            onDragStart={(event) => onDragStart(event, index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => onDrop(event, index)}
          >
            <div className="area-name">
              <span className="dot" style={{ background: AREA_COLORS[area.name] }} />
              {area.name}
            </div>
            <input
              type="number"
              value={area.hours}
              onChange={(event) => {
                const hours = Number(event.target.value);
                setAreas((prev) => prev.map((entry) => (entry.id === area.id ? { ...entry, hours } : entry)));
              }}
            />
            <div className="drag-controls">
              <button className="ghost" onClick={() => moveArea(index, index - 1)}>↑</button>
              <button className="ghost" onClick={() => moveArea(index, index + 1)}>↓</button>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={area.active}
                onChange={() => setAreas((prev) => prev.map((entry) => (entry.id === area.id ? { ...entry, active: !entry.active } : entry)))}
              />
              <span />
            </label>
          </div>
        ))}
      </div>

      <div className="goal-block">
        <h4>Current 90-day goal</h4>
        <p>{goal}</p>
        <span className="mono">Goal end date: {goalEndDate}</span>
        <div className="goal-buttons">
          <button className="secondary" onClick={() => setGoal('Health & Fitness')}>Update goal</button>
        </div>
      </div>
    </section>
  );

  const renderNotifications = () => (
    <section className="settings-section">
      <h2>Notifications</h2>
      <div className="setting-list">
        <div className="setting-row">
          <div>
            <strong>Daily reminder</strong>
            <p>Get your daily action prompt at a fixed time.</p>
          </div>
          <div className="setting-controls">
            <input type="time" value={notifications.dailyTime} onChange={(event) => setNotifications((prev) => ({ ...prev, dailyTime: event.target.value }))} />
            <label className="switch"><input type="checkbox" checked={notifications.dailyReminder} onChange={() => setNotifications((prev) => ({ ...prev, dailyReminder: !prev.dailyReminder }))} /><span /></label>
          </div>
        </div>

        <div className="setting-row">
          <div>
            <strong>Habit reminders</strong>
            <p>Remind me when habit windows are at risk.</p>
          </div>
          <label className="switch"><input type="checkbox" checked={notifications.habitReminders} onChange={() => setNotifications((prev) => ({ ...prev, habitReminders: !prev.habitReminders }))} /><span /></label>
        </div>

        <div className="setting-row">
          <div>
            <strong>Low score alerts</strong>
            <p>Notify when an area score drops below threshold.</p>
          </div>
          <div className="setting-controls">
            <input
              type="range"
              min={20}
              max={70}
              value={notifications.lowScoreThreshold}
              onChange={(event) => setNotifications((prev) => ({ ...prev, lowScoreThreshold: Number(event.target.value) }))}
            />
            <span className="mono">{notifications.lowScoreThreshold}</span>
            <label className="switch"><input type="checkbox" checked={notifications.lowScoreAlerts} onChange={() => setNotifications((prev) => ({ ...prev, lowScoreAlerts: !prev.lowScoreAlerts }))} /><span /></label>
          </div>
        </div>

        <div className="setting-row">
          <div>
            <strong>Weekly summary</strong>
            <p>Weekly performance digest and recommendations.</p>
          </div>
          <div className="setting-controls">
            <select value={notifications.weeklyDay} onChange={(event) => setNotifications((prev) => ({ ...prev, weeklyDay: event.target.value }))}>
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => <option key={day}>{day}</option>)}
            </select>
            <label className="switch"><input type="checkbox" checked={notifications.weeklySummary} onChange={() => setNotifications((prev) => ({ ...prev, weeklySummary: !prev.weeklySummary }))} /><span /></label>
          </div>
        </div>

        <div className="setting-row">
          <div>
            <strong>Vault suggestions</strong>
            <p>Show supportive vault prompts during low state moments.</p>
          </div>
          <label className="switch"><input type="checkbox" checked={notifications.vaultSuggestions} onChange={() => setNotifications((prev) => ({ ...prev, vaultSuggestions: !prev.vaultSuggestions }))} /><span /></label>
        </div>
      </div>
    </section>
  );

  const renderThemeDisplay = () => (
    <section className="settings-section">
      <h2>Theme & Display</h2>
      <div className="theme-row">
        {['System', 'Dark', 'Light'].map((option) => (
          <button key={option} className={`theme-preview ${theme === option ? 'active' : ''}`} onClick={() => setTheme(option)}>
            <div className={`thumb ${option.toLowerCase()}`} />
            <span>{option}</span>
          </button>
        ))}
      </div>

      <div className="setting-row compact">
        <strong>Display density</strong>
        <div className="chip-row">
          {['Comfortable', 'Compact'].map((option) => (
            <button key={option} className={`chip ${density === option ? 'active' : ''}`} onClick={() => setDensity(option)}>{option}</button>
          ))}
        </div>
      </div>

      <div className="setting-row compact">
        <strong>Font size</strong>
        <div className="chip-row">
          {['Small', 'Medium', 'Large'].map((size) => (
            <button key={size} className={`chip ${fontSize === size ? 'active' : ''}`} onClick={() => setFontSize(size)}>{size}</button>
          ))}
        </div>
      </div>

      <div className="setting-row compact">
        <strong>Score display</strong>
        <div className="chip-row">
          {['Percentage', 'Letter grade'].map((option) => (
            <button key={option} className={`chip ${scoreDisplay === option ? 'active' : ''}`} onClick={() => setScoreDisplay(option)}>{option}</button>
          ))}
        </div>
      </div>
    </section>
  );

  const renderData = () => (
    <section className="settings-section">
      <h2>Data</h2>
      <div className="data-actions">
        <button className="secondary">Export as JSON</button>
        <button className="secondary">Import from JSON</button>
        <button className="danger">Clear data</button>
      </div>

      <div className="usage-chart">
        {usageData.map((entry) => (
          <div key={entry.name} className="usage-row">
            <span>{entry.name}</span>
            <div className="bar"><div style={{ width: `${(entry.count / totalUsage) * 100}%` }} /></div>
            <span className="mono">{entry.count}</span>
          </div>
        ))}
      </div>

      <div className="storage-block">
        <span>Storage used</span>
        <div className="bar"><div style={{ width: '58%' }} /></div>
        <span className="mono">58%</span>
      </div>
    </section>
  );

  const renderShortcuts = () => (
    <section className="settings-section">
      <h2>Keyboard Shortcuts</h2>
      <table className="shortcuts-table">
        <thead>
          <tr>
            <th>Action</th>
            <th>Shortcut</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Quick dump</td><td>⌘K D</td></tr>
          <tr><td>New task</td><td>⌘N T</td></tr>
          <tr><td>Start timer</td><td>⌘T</td></tr>
          <tr><td>Open vault</td><td>⌘V</td></tr>
          <tr><td>Command palette</td><td>⌘K</td></tr>
        </tbody>
      </table>
    </section>
  );

  const renderSimple = (title) => (
    <section className="settings-section">
      <h2>{title}</h2>
      <p className="muted">This module is available and connected. Advanced controls can be extended from here.</p>
    </section>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'Profile':
        return renderProfile();
      case 'Areas & Goals':
        return renderAreasGoals();
      case 'Notifications':
        return renderNotifications();
      case 'Theme & Display':
        return renderThemeDisplay();
      case 'Data':
        return renderData();
      case 'Shortcuts':
        return renderShortcuts();
      case 'Security':
      case 'Export':
      case 'Integrations':
        return renderSimple(activeSection);
      default:
        return renderSimple('Settings');
    }
  };

  return (
    <div className="settings-screen">
      <aside className="settings-nav">
        {SETTINGS_GROUPS.map((entry) => (
          <div key={entry.group} className="nav-group">
            <h4>{entry.group}</h4>
            {entry.items.map((item) => (
              <button key={item} className={activeSection === item ? 'active' : ''} onClick={() => setActiveSection(item)}>{item}</button>
            ))}
          </div>
        ))}
      </aside>

      <main className="settings-content">{renderContent()}</main>
    </div>
  );
};

export default Settings;
