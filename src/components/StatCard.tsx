import React from 'react';

interface StatCardProps {
  value: string;
  label: string;
  color?: string;
  compact?: boolean;
}

export const StatCard = ({ value, label, color = 'var(--text-primary)', compact = false }: StatCardProps) => {
  return (
    <div
      style={{
        flex: 1,
        background: 'var(--surface-1)',
        border: '0.5px solid var(--border)',
        borderRadius: compact ? 10 : 14,
        padding: compact ? '12px 16px' : '16px 12px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: compact ? 20 : 24, fontWeight: 500, color }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
    </div>
  );
};
