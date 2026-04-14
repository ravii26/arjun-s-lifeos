import React from 'react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  fullHeight?: boolean;
}

export const BottomSheet = ({ open, onClose, children, fullHeight }: BottomSheetProps) => {
  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100 }} onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--surface-2)',
          borderRadius: '20px 20px 0 0',
          padding: '12px 20px 32px',
          maxHeight: fullHeight ? '95vh' : '80vh',
          overflowY: 'auto',
          animation: 'slideUp 250ms cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--surface-3)', margin: '0 auto 20px' }} />
        {children}
      </div>
      <style>{'@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }'}</style>
    </div>
  );
};
