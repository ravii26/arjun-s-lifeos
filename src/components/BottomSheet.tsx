import type { ReactNode } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxHeightClassName?: string;
}

export const BottomSheet = ({ open, onClose, children, maxHeightClassName = "max-h-[92vh]" }: BottomSheetProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/50" onClick={onClose}>
      <div
        className={`animate-slide-up fixed bottom-0 left-0 right-0 overflow-hidden rounded-t-[20px] border border-[var(--border)] bg-[var(--s2)] ${maxHeightClassName}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="absolute left-1/2 top-3 h-1 w-10 -translate-x-1/2 rounded-full bg-[var(--s3)]" />
        {children}
      </div>
    </div>
  );
};
