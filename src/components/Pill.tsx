import React from 'react';

interface PillProps {
  text: string;
  color?: string;
  background?: string;
}

export const Pill = ({ text, color = 'var(--text-muted)', background = 'var(--surface-3)' }: PillProps) => {
  return (
    <span
      style={{
        fontSize: 11,
        padding: '2px 8px',
        borderRadius: 20,
        background,
        color,
      }}
    >
      {text}
    </span>
  );
};
