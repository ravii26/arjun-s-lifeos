import { ArrowLeft } from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import { Task } from "../data/types";

interface TaskDetailSheetProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onToggle: (taskId: string) => void;
  onSchedule: (taskId: string) => void;
}

const priorityTone: Record<Task["priority"], string> = {
  P1: "var(--primary)",
  P2: "var(--amber)",
  P3: "var(--text-3)",
};

export const TaskDetailSheet = ({ open, task, onClose, onToggle, onSchedule }: TaskDetailSheetProps) => {
  if (!task) return null;

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex h-[72vh] flex-col">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
          <button type="button" className="tap-scale text-[var(--text-2)]" onClick={onClose}>
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
          <p className="text-[14px] font-medium text-[var(--text-1)]">Task detail</p>
          <div className="h-5 w-5" />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <p className="text-[18px] font-medium text-[var(--text-1)]">{task.title}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="rounded-full px-3 py-1 text-[12px]" style={{ background: `${priorityTone[task.priority]}22`, color: priorityTone[task.priority] }}>
              {task.priority}
            </span>
            <span className="rounded-full bg-[var(--s1)] px-3 py-1 text-[12px] text-[var(--text-3)]">{task.estimateMin ?? 20} min</span>
          </div>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              className="tap-scale w-full rounded-[12px] bg-[var(--primary)] px-4 py-3 text-[13px] font-medium text-white"
              onClick={() => onToggle(task.id)}
            >
              {task.done ? "Mark as not done" : "Mark as done"}
            </button>
            <button
              type="button"
              className="tap-scale w-full rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-4 py-3 text-[13px] text-[var(--text-1)]"
              onClick={() => onSchedule(task.id)}
            >
              Schedule to calendar
            </button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};
