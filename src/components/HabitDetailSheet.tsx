import { ArrowLeft } from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import { Habit } from "../data/types";

interface HabitDetailSheetProps {
  open: boolean;
  habit: Habit | null;
  onClose: () => void;
  onLog: (habitId: string) => void;
  onSchedule: (habitId: string) => void;
}

export const HabitDetailSheet = ({ open, habit, onClose, onLog, onSchedule }: HabitDetailSheetProps) => {
  if (!habit) return null;

  const doneDays = habit.lastSevenDays.filter((entry) => entry === "done").length;

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex h-[70vh] flex-col">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
          <button type="button" className="tap-scale text-[var(--text-2)]" onClick={onClose}>
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
          <p className="text-[14px] font-medium text-[var(--text-1)]">Habit detail</p>
          <div className="h-5 w-5" />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <p className="text-[18px] font-medium text-[var(--text-1)]">{habit.name}</p>
          <p className="mt-2 text-[13px] text-[var(--text-3)]">Current streak: {habit.streak} days</p>

          <div className="mt-4 grid grid-cols-7 gap-2">
            {habit.lastSevenDays.map((entry, index) => (
              <div
                key={`${habit.id}-${index}`}
                className="rounded-[10px] border border-[var(--border)] px-2 py-2 text-center text-[11px]"
                style={{
                  background:
                    entry === "done"
                      ? "var(--teal-muted)"
                      : entry === "missed"
                        ? "var(--amber-muted)"
                        : "var(--s1)",
                  color:
                    entry === "done"
                      ? "var(--teal)"
                      : entry === "missed"
                        ? "var(--amber)"
                        : "var(--text-3)",
                }}
              >
                {entry === "done" ? "D" : entry === "missed" ? "M" : "-"}
              </div>
            ))}
          </div>

          <p className="mt-3 text-[12px] text-[var(--text-3)]">Consistency this week: {Math.round((doneDays / 7) * 100)}%</p>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              className="tap-scale w-full rounded-[12px] bg-[var(--primary)] px-4 py-3 text-[13px] font-medium text-white"
              onClick={() => onLog(habit.id)}
            >
              Mark done today
            </button>
            <button
              type="button"
              className="tap-scale w-full rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-4 py-3 text-[13px] text-[var(--text-1)]"
              onClick={() => onSchedule(habit.id)}
            >
              Schedule to calendar
            </button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};
