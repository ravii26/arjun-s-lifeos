import React, { useState } from 'react';
import './design-system.css';

const Vault = () => {
  const [view, setView] = useState('library'); // 'library' or 'triggered'
  const [mockVaultItems] = useState([
    {
      id: 1,
      type: 'Quote',
      content: 'The only way to do great work is to love what you do.',
      attribution: 'Steve Jobs',
      tags: ['motivation', 'focus'],
      area: 'Career',
      intensity: 'High',
      effectiveness: 95,
      uses: 12,
    },
    {
      id: 2,
      type: 'Note',
      title: 'Deep Work Strategies',
      content: 'Focus on one task at a time for 90 minutes.',
      tags: ['discipline', 'productivity'],
      area: 'Career',
      intensity: 'Medium',
      effectiveness: 80,
      uses: 8,
    },
    {
      id: 3,
      type: 'Memory',
      content: 'I completed my first marathon.',
      date: '2025-10-12',
      tags: ['confidence', 'achievement'],
      area: 'Health',
      intensity: 'High',
      effectiveness: 90,
      uses: 5,
    },
    {
      id: 4,
      type: 'Video',
      title: 'Mindfulness Basics',
      thumbnail: 'https://via.placeholder.com/150',
      url: 'https://example.com/mindfulness',
      tags: ['clarity', 'calm'],
      area: 'Wellness',
      intensity: 'Low',
      effectiveness: 70,
      uses: 3,
    },
  ]);

  const renderTriggeredView = () => {
    const item = mockVaultItems[0]; // Example triggered item

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--surface-raised)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-6)',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginBottom: 'var(--space-4)',
            }}
          >
            Career score dropped to 38 · from LifeOS
          </p>
          <hr style={{ borderColor: 'var(--border)' }} />
          {item.type === 'Quote' && (
            <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '24px',
                  fontWeight: 'var(--weight-bold)',
                  color: 'var(--text-primary)',
                  lineHeight: 1.6,
                }}
              >
                “{item.content}”
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '14px',
                  color: 'var(--text-muted)',
                  marginTop: 'var(--space-2)',
                }}
              >
                — {item.attribution}
              </p>
            </div>
          )}
          <div style={{ marginTop: 'var(--space-6)' }}>
            <button
              style={{
                backgroundColor: 'var(--accent)',
                color: '#000',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                fontFamily: 'var(--font-ui)',
                fontWeight: 'var(--weight-semi-bold)',
                width: '100%',
                marginBottom: 'var(--space-4)',
              }}
              onClick={() => setView('library')}
            >
              Got it — Back to work
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                👍 Helpful
              </button>
              <button
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                👎 Not useful
              </button>
              <button
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                → Next item
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLibraryView = () => {
    return (
      <div style={{ padding: 'var(--space-8)' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--text-primary)',
          }}
        >
          Vault
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '14px',
            color: 'var(--text-muted)',
            marginBottom: 'var(--space-6)',
          }}
        >
          Your personal strength system
        </p>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--text-muted)',
            marginBottom: 'var(--space-6)',
          }}
        >
          24 items · 18 used · 91% helpful
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          {mockVaultItems.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                padding: '20px',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  fontWeight: 'var(--weight-bold)',
                }}
              >
                {item.type}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '15px',
                  fontStyle: 'italic',
                  color: 'var(--text-secondary)',
                }}
              >
                {item.content || item.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return <div>{view === 'triggered' ? renderTriggeredView() : renderLibraryView()}</div>;
};

export default Vault;