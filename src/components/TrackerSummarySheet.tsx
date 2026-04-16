import { Check } from "lucide-react";
import { useMemo } from "react";
import { BottomSheet } from "./BottomSheet";
import { useAppContext } from "../context/AppContext";

interface TrackerSummarySheetProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  onDiscard: () => void;
}

const formatDuration = (durationSec: number): string => {
  const totalMinutes = Math.round(durationSec / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

export const TrackerSummarySheet = ({ open, onClose, onSave, onDiscard }: TrackerSummarySheetProps) => {
  const { state } = useAppContext();
  const session = useMemo(
    () => state.timeTrackerSessions.find((item) => item.id === state.activeTrackerSessionId) ?? null,
    [state.activeTrackerSessionId, state.timeTrackerSessions],
  );

  if (!open || !session) return null;

  return (
    <BottomSheet open={open} onClose={onClose} maxHeightClassName="h-auto max-h-[80vh]">
      <div className="px-4 pb-6 pt-8">
        <div className="flex items-center gap-2 text-[var(--teal)]">
          <Check size={16} strokeWidth={1.8} />
          <p className="text-[16px] font-medium text-[var(--text-1)]">Session complete</p>
        </div>
        <p className="mt-5 text-center text-[28px] font-medium text-[var(--teal)]">{formatDuration(session.durationSec)}</p>
        <p className="mt-2 text-center text-[13px] text-[var(--text-2)]">{session.label}</p>
        <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-[var(--text-3)]">
          {session.areaId ? <span className="rounded-full bg-[var(--s2)] px-2 py-1">{session.areaId}</span> : null}
          {session.linkedTaskId ? <span className="rounded-full bg-[var(--s2)] px-2 py-1">Task</span> : null}
          {session.linkedHabitId ? <span className="rounded-full bg-[var(--s2)] px-2 py-1">Habit</span> : null}
          {session.linkedCourseId ? <span className="rounded-full bg-[var(--s2)] px-2 py-1">Course</span> : null}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <button type="button" className="tap-scale rounded-[10px] bg-[var(--primary)] px-4 py-3 text-[13px] font-medium text-white" onClick={onSave}>
            Save session
          </button>
          <button type="button" className="tap-scale rounded-[10px] bg-[var(--s2)] px-4 py-3 text-[13px] text-[var(--text-2)]" onClick={onDiscard}>
            Discard
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};
