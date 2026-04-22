import { useEffect, useState, type ReactNode } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxHeightClassName?: string;
}

export const BottomSheet = ({ open, onClose, children, maxHeightClassName = "max-h-[92vh]" }: BottomSheetProps) => {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const frame = window.requestAnimationFrame(() => setVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }

    setVisible(false);
    const timeout = window.setTimeout(() => setMounted(false), 180);
    return () => window.clearTimeout(timeout);
  }, [open]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[120] transition-opacity duration-200 ease-out ${visible ? "bg-black/50 opacity-100" : "bg-black/0 opacity-0"}`}
      onClick={onClose}
    >
      <div
        className={`fixed bottom-0 left-0 right-0 overflow-hidden rounded-t-[20px] border border-[var(--border)] bg-[var(--s2)] transition-all duration-200 ease-out ${maxHeightClassName} ${
          visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="absolute left-1/2 top-3 h-1 w-10 -translate-x-1/2 rounded-full bg-[var(--s3)]" />
        {children}
      </div>
    </div>
  );
};
