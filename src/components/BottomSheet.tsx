import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  height?: 'auto' | 'full';
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, height = 'auto', children }: BottomSheetProps) {
  const touchStart = React.useRef<number | null>(null);
  const [offset, setOffset] = React.useState(0);

  React.useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-40">
      <button type="button" aria-label="Close sheet" className="absolute inset-0 bg-black/50 opacity-100 transition-opacity duration-250" onClick={onClose} />
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 w-full rounded-t-[20px] border border-[var(--border)] bg-[var(--s2)] transition-transform duration-250',
          height === 'full' ? 'h-[calc(100vh-60px)]' : 'max-h-[90vh]',
        )}
        style={{ transform: `translateY(${offset}px)`, transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)' }}
        onTouchStart={(event) => {
          touchStart.current = event.touches[0]?.clientY ?? null;
        }}
        onTouchMove={(event) => {
          if (touchStart.current === null) {
            return;
          }
          const delta = event.touches[0].clientY - touchStart.current;
          if (delta > 0) {
            setOffset(delta);
          }
        }}
        onTouchEnd={() => {
          if (offset >= 80) {
            onClose();
          }
          setOffset(0);
          touchStart.current = null;
        }}
      >
        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-[var(--s3)]" />
        </div>
        <div className="flex items-center justify-between px-4 pb-3 pt-2">
          {title ? <div className="text-[14px] font-medium text-[var(--t1)]">{title}</div> : <span />}
          <button type="button" onClick={onClose} className="interactive flex h-8 w-8 items-center justify-center rounded-full bg-[var(--s3)] text-[var(--t2)]">
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>
        <div className="overflow-y-auto px-4 pb-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
