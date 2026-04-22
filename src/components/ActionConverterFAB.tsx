import { Plus } from "lucide-react";
import { useLocation } from "react-router-dom";
import { ActionConverterSheet } from "./ActionConverterSheet";
import { useState } from "react";

export const ActionConverterFAB = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const shouldHide = (() => {
    const path = location.pathname;
    return path.startsWith("/focus") || path.startsWith("/review") || path.startsWith("/statistics");
  })();

  if (shouldHide) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Action converter"
        onClick={() => setOpen(true)}
        className="tap-scale fixed bottom-[calc(84px+env(safe-area-inset-bottom))] right-4 z-[95] inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-white md:bottom-8 md:right-8"
      >
        <Plus size={22} strokeWidth={1.8} />
      </button>

      <ActionConverterSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
};
