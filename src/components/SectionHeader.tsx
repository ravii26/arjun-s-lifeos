import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  rightText?: string;
}

export const SectionHeader = ({ title, subtitle, rightText }: SectionHeaderProps) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 16, fontWeight: 500 }}>{title}</span>
        {subtitle && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{subtitle}</span>}
      </div>
      {rightText && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{rightText}</span>}
    </div>
  );
};
