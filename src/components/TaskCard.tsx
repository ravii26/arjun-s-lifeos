import { Check } from "lucide-react";
import { Task, LifeArea } from "../data/types";

interface TaskCardProps {
  task: Task;
  area: LifeArea;
  onToggle: () => void;
  animated?: boolean;
}

const priorityStyles: Record<Task["priority"], string> = {
  P1: "bg-[var(--primary-muted)] text-[var(--primary)]",
  P2: "bg-[var(--amber-muted)] text-[var(--amber)]",
  P3: "bg-[var(--s2)] text-[var(--text-2)]",
};

export const TaskCard = ({ task, area, onToggle, animated = false }: TaskCardProps) => {
  return (
    <article
      className={`hover-surface tap-scale rounded-[14px] border border-[var(--border)] bg-[var(--s1)] px-5 py-4 transition-colors ${animated ? "animate-fade-in-up" : ""}`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          className={`tap-scale inline-flex h-6 w-6 items-center justify-center rounded-full border-[1.5px] transition-all duration-200 ${
            task.done
              ? "border-[var(--primary)] bg-[var(--primary)] text-white"
              : "border-[var(--border-strong)] bg-transparent text-transparent"
          }`}
          aria-label={`Toggle ${task.title}`}
        >
          <Check size={14} strokeWidth={1.5} />
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={`text-card-title transition-all duration-200 ${
              task.done ? "line-through opacity-60" : "text-[var(--text-1)]"
            }`}
          >
            {task.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-caption text-[var(--text-3)]">
            <span className="inline-flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: area.color }}
                aria-hidden="true"
              />
              {area.name}
            </span>
            <span className={`rounded-full px-2 py-[3px] text-[11px] ${priorityStyles[task.priority]}`}>
              {task.priority}
            </span>
            {task.estimateMin ? <span>{task.estimateMin}m</span> : null}
          </div>
        </div>

        {task.estimateMin ? <span className="text-caption text-[var(--text-3)]">{task.estimateMin}m</span> : null}
      </div>
    </article>
  );
};
