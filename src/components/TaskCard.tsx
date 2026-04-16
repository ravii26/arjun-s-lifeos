import * as React from 'react';
import { Check, MoreHorizontal } from 'lucide-react';
import type { Priority, Task } from '@/types';
import { cn } from '@/lib/utils';

const priorityStyles: Record<Priority, string> = {
  P1: 'bg-[var(--primary-bg)] text-[var(--primary)]',
  P2: 'bg-[var(--amber-bg)] text-[var(--amber)]',
  P3: 'bg-[var(--s3)] text-[var(--t3)]',
};

interface TaskCardProps {
  task: Task;
  compact?: boolean;
  areaColor: string;
  areaName: string;
  projectName?: string;
  onToggle: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onChangePriority?: (taskId: string) => void;
}

export function TaskCard({
  task,
  compact = false,
  areaColor,
  areaName,
  projectName,
  onToggle,
  onEdit,
  onDelete,
  onChangePriority,
}: TaskCardProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const pressTimer = React.useRef<number | null>(null);

  const closeMenu = () => setMenuOpen(false);

  const handleMenuOpen = () => {
    setMenuOpen(true);
  };

  const beginPress = () => {
    if (pressTimer.current) {
      window.clearTimeout(pressTimer.current);
    }

    pressTimer.current = window.setTimeout(() => {
      handleMenuOpen();
    }, 400);
  };

  const cancelPress = () => {
    if (pressTimer.current) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  return (
    <div
      className={cn(
        'relative rounded-[14px] border border-[var(--border)] bg-[var(--s1)] transition-colors duration-150 hover:bg-[var(--s3)]',
        compact ? 'px-4 py-3' : 'px-5 py-4',
      )}
      onContextMenu={(event) => {
        event.preventDefault();
        handleMenuOpen();
      }}
      onPointerDown={beginPress}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
      onPointerCancel={cancelPress}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          aria-label={task.status === 'done' ? 'Mark task as todo' : 'Mark task as done'}
          onClick={() => onToggle(task.id)}
          className={cn(
            'mt-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-full border transition-colors duration-200',
            task.status === 'done' ? 'border-[var(--primary)] bg-[var(--primary)] text-white' : 'border-[var(--border-md)] bg-transparent',
          )}
        >
          {task.status === 'done' ? <Check size={12} strokeWidth={2.5} /> : null}
        </button>

        <div className="min-w-0 flex-1">
          <div
            className={cn(
              'text-[14px] font-medium transition-all duration-200',
              task.status === 'done' ? 'text-[var(--t3)] line-through opacity-60' : 'text-[var(--t1)]',
            )}
          >
            {task.title}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-[var(--t3)]">
            {projectName ? <span className="rounded-full bg-[var(--s3)] px-2 py-0.5 text-[11px] text-[var(--t2)]">{projectName}</span> : null}
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: areaColor }} />
              {areaName}
            </span>
            <span className={cn('rounded-full px-2 py-0.5 text-[11px]', priorityStyles[task.priority])}>{task.priority}</span>
            {task.dueDate ? <span>{task.dueDate}</span> : null}
            {task.subtasks?.length ? (
              <span className={cn('rounded-full px-2 py-0.5 text-[11px]', task.subtasks.every((subtask) => subtask.done) ? 'bg-[var(--teal-bg)] text-[var(--teal)]' : 'bg-[var(--s3)] text-[var(--t2)]')}>
                {task.subtasks.filter((subtask) => subtask.done).length}/{task.subtasks.length} subtasks
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[12px] text-[var(--t3)]">
          {task.estimateMin ? <span>{task.estimateMin}m</span> : null}
          <button
            type="button"
            aria-label="Task actions"
            onClick={() => setMenuOpen((value) => !value)}
            className="interactive flex h-8 w-8 items-center justify-center rounded-full bg-[var(--s3)] text-[var(--t2)]"
          >
            <MoreHorizontal size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="absolute right-3 top-11 z-20 w-40 rounded-[12px] border border-[var(--border)] bg-[var(--s1)] p-1">
          <button type="button" className="w-full rounded-[10px] px-3 py-2 text-left text-[12px] font-medium text-[var(--t1)] transition-colors hover:bg-[var(--s3)]" onClick={() => { closeMenu(); onEdit(task); }}>
            Edit
          </button>
          <button
            type="button"
            className="w-full rounded-[10px] px-3 py-2 text-left text-[12px] font-medium text-[var(--t1)] transition-colors hover:bg-[var(--s3)]"
            onClick={() => {
              closeMenu();
              onChangePriority?.(task.id);
            }}
          >
            Change priority
          </button>
          <button
            type="button"
            className="w-full rounded-[10px] px-3 py-2 text-left text-[12px] font-medium text-[var(--coral)] transition-colors hover:bg-[var(--coral-bg)]"
            onClick={() => {
              closeMenu();
              onDelete?.(task.id);
            }}
          >
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}
