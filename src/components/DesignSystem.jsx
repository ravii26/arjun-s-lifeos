import React from 'react';
import '../styles/design-system.css';

const DesignSystem = () => {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: 'var(--text-primary)' }}>
      <header style={{ marginBottom: '48px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', margin: '0 0 8px' }}>LifeOS Design System</h1>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', margin: 0 }}>Reference blueprint for frontend components</p>
      </header>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '16px' }}>Typography</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>Display Title H1</h1>
          <h2 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>Section Heading H2</h2>
          <h3 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>Card Title H3</h3>
          <p style={{ fontFamily: 'var(--font-ui)', margin: 0, fontSize: '15px' }}>Body text using standard UI font. Designed to be highly readable.</p>
          <small style={{ fontFamily: 'var(--font-mono)', margin: 0, color: 'var(--text-muted)' }}>Muted mono text usually used for times and system labels</small>
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '16px' }}>Buttons</h2>
        <div style={{ display: 'flex', gap: '16px', background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <button className="primary-sm" style={{ border: 'none', background: 'var(--accent)', color: '#111', padding: '0 16px', height: '36px', borderRadius: 'var(--radius-md)', fontWeight: 'bold' }}>Primary Action</button>
          <button className="ghost" style={{ border: '1px solid var(--border)', background: 'var(--surface-raised)', color: 'var(--text-secondary)', padding: '0 16px', height: '36px', borderRadius: 'var(--radius-md)' }}>Secondary Ghost</button>
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '16px' }}>Input & Forms</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <input type="text" placeholder="Standard text input..." style={{ border: '1px solid var(--border)', background: 'var(--surface-raised)', color: 'var(--text-primary)', padding: '12px', borderRadius: 'var(--radius-md)', width: '100%', outline: 'none' }} />
          <textarea placeholder="Text area input..." rows="3" style={{ border: '1px solid var(--border)', background: 'var(--surface-raised)', color: 'var(--text-primary)', padding: '12px', borderRadius: 'var(--radius-md)', width: '100%', outline: 'none', resize: 'vertical' }} />
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '16px' }}>Theme Colors</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { name: 'Accent', color: 'var(--accent)' },
            { name: 'Blue', color: 'var(--blue)' },
            { name: 'Teal', color: 'var(--teal)' },
            { name: 'Purple', color: 'var(--purple)' },
            { name: 'Pink', color: 'var(--pink)' },
            { name: 'Orange', color: 'var(--orange)' },
            { name: 'Surface', color: 'var(--surface)', border: true }
          ].map(color => (
            <div key={color.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '80px' }}>
              <div style={{ width: '100%', height: '48px', borderRadius: 'var(--radius-md)', background: color.color, border: color.border ? '1px solid var(--border-strong)' : 'none' }} />
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{color.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DesignSystem;
