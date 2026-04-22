import React, { useState } from 'react';
import './design-system.css';

const Settings = () => {
  const [activeSection, setActiveSection] = useState('Profile');
  const [profile, setProfile] = useState({
    avatar: 'https://via.placeholder.com/80',
    name: 'John Doe',
    email: 'john.doe@example.com',
    memberSince: '2023-01-15',
    stats: {
      tasksCompleted: 127,
      habitsLogged: 47,
      hoursTracked: 62,
    },
  });

  const sections = [
    { group: 'ACCOUNT', items: ['Profile', 'Security'] },
    { group: 'SYSTEM', items: ['Areas & Goals', 'Notifications', 'Data'] },
    { group: 'PREFERENCES', items: ['Theme & Display', 'Shortcuts'] },
    { group: 'ADVANCED', items: ['Export', 'Integrations'] },
  ];

  const renderSidebar = () => (
    <div
      style={{
        width: '200px',
        position: 'sticky',
        top: '0',
        height: '100vh',
        backgroundColor: 'var(--surface)',
        padding: 'var(--space-4)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {sections.map((section) => (
        <div key={section.group} style={{ marginBottom: 'var(--space-6)' }}>
          <h4
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '12px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: 'var(--space-2)',
            }}
          >
            {section.group}
          </h4>
          {section.items.map((item) => (
            <button
              key={item}
              onClick={() => setActiveSection(item)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '8px 12px',
                backgroundColor: activeSection === item ? 'var(--accent-dim)' : 'transparent',
                color: activeSection === item ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: 'none',
                borderLeft: activeSection === item ? '4px solid var(--accent)' : '4px solid transparent',
                fontFamily: 'var(--font-ui)',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              {item}
            </button>
          ))}
        </div>
      ))}
    </div>
  );

  const renderProfileSection = () => (
    <div style={{ padding: 'var(--space-8)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--space-6)' }}>
        Profile
      </h2>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <img
          src={profile.avatar}
          alt="Avatar"
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            marginRight: 'var(--space-4)',
          }}
        />
        <div>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '24px',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--text-primary)',
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              marginBottom: 'var(--space-2)',
            }}
          />
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--text-secondary)' }}>{profile.email}</p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
            Member since {profile.memberSince}
          </p>
        </div>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          color: 'var(--text-muted)',
          display: 'flex',
          gap: 'var(--space-4)',
        }}
      >
        <span>{profile.stats.tasksCompleted} tasks completed</span>
        <span>{profile.stats.habitsLogged} habits logged</span>
        <span>{profile.stats.hoursTracked}h tracked</span>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'Profile':
        return renderProfileSection();
      case 'Areas & Goals':
        return <div style={{ padding: 'var(--space-8)' }}>Areas & Goals Section</div>;
      case 'Notifications':
        return <div style={{ padding: 'var(--space-8)' }}>Notifications Section</div>;
      case 'Theme & Display':
        return <div style={{ padding: 'var(--space-8)' }}>Theme & Display Section</div>;
      case 'Data':
        return <div style={{ padding: 'var(--space-8)' }}>Data Section</div>;
      case 'Shortcuts':
        return <div style={{ padding: 'var(--space-8)' }}>Shortcuts Section</div>;
      default:
        return <div style={{ padding: 'var(--space-8)' }}>Select a section</div>;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {renderSidebar()}
      <div style={{ flexGrow: 1 }}>{renderContent()}</div>
    </div>
  );
};

export default Settings;