import React from 'react';
import './design-system.css';

const DesignSystemShowcase = () => {
  return (
    <div style={{ padding: 'var(--space-8)', backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-hero)', lineHeight: 'var(--line-hero)' }}>
        LifeOS Design System
      </h1>

      {/* Buttons */}
      <section>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-title)', lineHeight: 'var(--line-title)' }}>Buttons</h2>
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <button style={{ backgroundColor: 'var(--accent)', color: '#000', fontWeight: 'var(--weight-semi-bold)', padding: '0 var(--space-4)', height: '36px', borderRadius: 'var(--radius-md)', border: 'none' }}>
            Primary
          </button>
          <button style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-primary)', fontWeight: 'var(--weight-medium)', padding: '0 var(--space-4)', height: '36px', borderRadius: 'var(--radius-md)', border: `1px solid var(--border-strong)` }}>
            Secondary
          </button>
          <button style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', fontWeight: 'var(--weight-medium)', padding: '0 var(--space-4)', height: '36px', borderRadius: 'var(--radius-md)', border: 'none' }}>
            Ghost
          </button>
          <button style={{ backgroundColor: 'var(--red-dim)', color: 'var(--red)', fontWeight: 'var(--weight-medium)', padding: '0 var(--space-4)', height: '36px', borderRadius: 'var(--radius-md)', border: `1px solid var(--red)` }}>
            Destructive
          </button>
        </div>
      </section>

      {/* Input Fields */}
      <section>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-title)', lineHeight: 'var(--line-title)' }}>Input Fields</h2>
        <input
          style={{
            width: '100%',
            maxWidth: '300px',
            height: '40px',
            backgroundColor: 'var(--surface)',
            border: `1px solid var(--border)`,
            borderRadius: 'var(--radius-md)',
            padding: '0 var(--space-4)',
            fontFamily: 'var(--font-ui)',
            fontSize: 'var(--font-body)',
            color: 'var(--text-primary)',
          }}
          placeholder="Enter text..."
        />
      </section>

      {/* Cards */}
      <section>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-title)', lineHeight: 'var(--line-title)' }}>Cards</h2>
        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: `1px solid var(--border)`,
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-5)',
            maxWidth: '300px',
          }}
        >
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-title)', lineHeight: 'var(--line-title)' }}>Card Title</h3>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--font-body)', lineHeight: 'var(--line-body)', color: 'var(--text-secondary)' }}>
            This is a card description.
          </p>
        </div>
      </section>

      {/* Tags / Badges */}
      <section>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-title)', lineHeight: 'var(--line-title)' }}>Tags / Badges</h2>
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <span style={{ backgroundColor: 'var(--blue-dim)', color: 'var(--blue)', padding: '0 var(--space-3)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-ui)', fontSize: 'var(--font-caption)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Career
          </span>
          <span style={{ backgroundColor: 'var(--teal-dim)', color: 'var(--teal)', padding: '0 var(--space-3)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-ui)', fontSize: 'var(--font-caption)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Health
          </span>
        </div>
      </section>

      {/* More components can be added here */}
    </div>
  );
};

export default DesignSystemShowcase;