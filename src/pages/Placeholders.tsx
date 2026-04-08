import React from 'react';

const placeholder = (name: string) => () => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    minHeight: '60vh', gap: 16,
  }}>
    <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--text-primary)' }}>{name}</div>
    <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
      Coming in {name === 'Vault' ? 'Part 2' : name === 'Learn' ? 'Part 2' : 'Part 3'}
    </p>
    <div style={{
      width: 48, height: 48, borderRadius: 14,
      background: 'var(--primary-muted-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--primary)', fontSize: 24,
    }}>
      🔒
    </div>
  </div>
);

export const VaultPlaceholder = placeholder('Vault');
export const LearnPlaceholder = placeholder('Learn');
export const ReviewPlaceholder = placeholder('Review');
export const AreaDetailPlaceholder = () => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    minHeight: '60vh', gap: 16,
  }}>
    <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--text-primary)' }}>Life Area Detail</div>
    <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Coming in Part 3</p>
  </div>
);
