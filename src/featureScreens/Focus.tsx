import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Flame,
  GripVertical,
  MoreHorizontal,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { BottomSheet } from '@/components/BottomSheet';
import { TaskCard } from '@/components/TaskCard';
import { HabitQuickRow } from '@/components/HabitQuickRow';
import { useApp } from '@/context/appState';
import { cn } from '@/lib/utils';
import { getAreaById, getAreaThemeColor, getTodayLog, isoDate } from '@/lib/lifeos';
import type { AreaId, Habit, HabitLog, Priority, Project, Subtask, Task } from '@/types';

const areaOrder: AreaId[] = ['career', 'health', 'mind', 'finance', 'relationships', 'creative'];
const priorityOrder: Priority[] = ['P1', 'P2', 'P3'];
const todayKey = isoDate(new Date());
const TIME_BLOCK_STORAGE_KEY = 'lifeos-time-blocks';
const TIMELINE_START_MINUTES = 6 * 60;
const TIMELINE_END_MINUTES = 23 * 60;
const TIMELINE_HOUR_HEIGHT = 54;
const TIMELINE_SNAP_MINUTES = 15;
const MIN_BLOCK_MINUTES = 15;

interface TimeBlock {
  id: string;
  date: string;
  start: string;
  end: string;
  title: string;
  taskId?: string;
  areaId?: AreaId;
  done: boolean;
}

type TimeBlockRepeatTemplate = 'none' | 'daily_7' | 'weekdays_2w' | 'weekly_4';

const areaAccent: Record<AreaId, string> = {
  career: 'var(--primary)',
  health: 'var(--teal)',
  mind: 'var(--primary)',
  finance: 'var(--amber)',
  relationships: 'var(--coral)',
  creative: 'var(--amber)',
};

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
}

function formatDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function timeToMinutes(value: string) {
  const [hourString, minuteString] = value.split(':');
  const hour = Number(hourString);
  const minute = Number(minuteString);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return 0;
  }
  return hour * 60 + minute;
}

function blockDurationMinutes(block: Pick<TimeBlock, 'start' | 'end'>) {
  return Math.max(0, timeToMinutes(block.end) - timeToMinutes(block.start));
}

function formatMinutes(totalMinutes: number) {
  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function snapMinutes(value: number, step = TIMELINE_SNAP_MINUTES) {
  return Math.round(value / step) * step;
}

function minutesToTime(totalMinutes: number) {
  const clamped = clampNumber(totalMinutes, 0, 23 * 60 + 59);
  const hour = Math.floor(clamped / 60);
  const minute = clamped % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function getOverlappingBlockIds(blocks: TimeBlock[]) {
  const ordered = [...blocks].sort((left, right) => left.start.localeCompare(right.start));
  const conflicts = new Set<string>();

  for (let index = 0; index < ordered.length; index += 1) {
    const current = ordered[index];
    const currentStart = timeToMinutes(current.start);
    const currentEnd = timeToMinutes(current.end);

    for (let nextIndex = index + 1; nextIndex < ordered.length; nextIndex += 1) {
      const next = ordered[nextIndex];
      const nextStart = timeToMinutes(next.start);
      const nextEnd = timeToMinutes(next.end);

      if (nextStart >= currentEnd) {
        break;
      }

      if (Math.max(currentStart, nextStart) < Math.min(currentEnd, nextEnd)) {
        conflicts.add(current.id);
        conflicts.add(next.id);
      }
    }
  }

  return conflicts;
}

function shiftIsoDate(dateString: string, deltaDays: number) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + deltaDays);
  return isoDate(date);
}

function getMonthStartFromIso(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function resolveTimeBlockOverlaps(blocks: TimeBlock[]) {
  const ordered = [...blocks].sort((left, right) => left.start.localeCompare(right.start));
  let cursor = TIMELINE_START_MINUTES;

  return ordered.map((block) => {
    const start = timeToMinutes(block.start);
    const end = timeToMinutes(block.end);
    const duration = Math.max(MIN_BLOCK_MINUTES, end - start);
    let nextStart = Math.max(start, cursor);
    if (nextStart + duration > TIMELINE_END_MINUTES) {
      nextStart = Math.max(TIMELINE_START_MINUTES, TIMELINE_END_MINUTES - duration);
    }
    const nextEnd = Math.min(TIMELINE_END_MINUTES, nextStart + duration);
    cursor = nextEnd;

    return {
      ...block,
      start: minutesToTime(nextStart),
      end: minutesToTime(nextEnd),
    };
  });
}

function getRepeatDates(startDate: string, template: TimeBlockRepeatTemplate) {
  const base = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(base.getTime())) {
    return [startDate];
  }

  if (template === 'none') {
    return [startDate];
  }

  if (template === 'daily_7') {
    return Array.from({ length: 7 }, (_, index) => isoDate(new Date(base.getFullYear(), base.getMonth(), base.getDate() + index)));
  }

  if (template === 'weekdays_2w') {
    const dates: string[] = [];
    for (let offset = 0; offset < 14; offset += 1) {
      const date = new Date(base.getFullYear(), base.getMonth(), base.getDate() + offset);
      const day = date.getDay();
      if (day !== 0 && day !== 6) {
        dates.push(isoDate(date));
      }
    }
    return dates;
  }

  return Array.from({ length: 4 }, (_, index) => isoDate(new Date(base.getFullYear(), base.getMonth(), base.getDate() + index * 7)));
}

function sortTasks(tasks: Task[]) {
  return [...tasks].sort((left, right) => {
    const statusOrder = (left.status === 'done' ? 1 : 0) - (right.status === 'done' ? 1 : 0);
    if (statusOrder !== 0) return statusOrder;
    const priorityDelta = priorityOrder.indexOf(left.priority) - priorityOrder.indexOf(right.priority);
    if (priorityDelta !== 0) return priorityDelta;
    const leftDue = left.dueDate ? new Date(left.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    const rightDue = right.dueDate ? new Date(right.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    if (leftDue !== rightDue) return leftDue - rightDue;
    return left.title.localeCompare(right.title);
  });
}

function taskCompletion(task: Task) {
  if (!task.subtasks?.length) {
    return task.status === 'done' ? 1 : 0;
  }
  const done = task.subtasks.filter((subtask) => subtask.done).length;
  return done / task.subtasks.length;
}

function TaskSubtasks({
  task,
  onToggleSubtask,
  onAddSubtask,
}: {
  task: Task;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
}) {
  const [value, setValue] = React.useState('');

  React.useEffect(() => {
    setValue('');
  }, [task.id]);

  return (
    <div className="mt-3 space-y-2 rounded-[12px] border border-[var(--border)] bg-[var(--s2)] px-3 py-3">
      {task.subtasks?.map((subtask) => (
        <div key={subtask.id} className="flex items-center gap-2 rounded-[10px] px-1 py-1">
          <button
            type="button"
            onClick={() => onToggleSubtask(task.id, subtask.id)}
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded-full border text-white transition-colors',
              subtask.done ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-[var(--border-md)] bg-transparent',
            )}
          >
            {subtask.done ? <Check size={11} strokeWidth={2.5} /> : null}
          </button>
          <div className={cn('flex-1 text-[13px]', subtask.done ? 'text-[var(--t3)] line-through' : 'text-[var(--t1)]')}>
            {subtask.title}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-1">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && value.trim()) {
              event.preventDefault();
              onAddSubtask(task.id, value.trim());
              setValue('');
            }
          }}
          placeholder="Add subtask..."
          className="h-9 flex-1 rounded-[10px] border border-[var(--border)] bg-[var(--s1)] px-3 text-[13px] text-[var(--t1)] outline-none placeholder:text-[var(--t3)]"
        />
        <button
          type="button"
          onClick={() => {
            if (!value.trim()) return;
            onAddSubtask(task.id, value.trim());
            setValue('');
          }}
          className="interactive flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-white"
        >
          <Plus size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

function TaskDetailSheet({ task, onClose }: { task: Task | null; onClose: () => void }) {
  const { state, dispatch } = useApp();
  const [title, setTitle] = React.useState('');
  const [areaId, setAreaId] = React.useState<AreaId>('career');
  const [priority, setPriority] = React.useState<Priority>('P1');
  const [dueDate, setDueDate] = React.useState('');
  const [estimateMin, setEstimateMin] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  React.useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setAreaId(task.areaId);
    setPriority(task.priority);
    setDueDate(task.dueDate ?? '');
    setEstimateMin(task.estimateMin ? String(task.estimateMin) : '');
    setNotes(task.notes ?? '');
    setConfirmDelete(false);
  }, [task]);

  if (!task) return null;

  const area = getAreaById(areaId, state.areas);

  const saveTask = () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    dispatch({
      type: 'UPDATE_TASK',
      taskId: task.id,
      updates: {
        title: cleanTitle,
        areaId,
        priority,
        dueDate: dueDate || undefined,
        estimateMin: estimateMin ? Number(estimateMin) : undefined,
        notes: notes || undefined,
      },
    });
    onClose();
  };

  const addSubtask = (taskId: string, subtaskTitle: string) => {
    dispatch({ type: 'ADD_TASK_SUBTASK', taskId, title: subtaskTitle });
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    dispatch({ type: 'TOGGLE_TASK_SUBTASK', taskId, subtaskId });
  };

  return (
    <BottomSheet isOpen={Boolean(task)} onClose={onClose} title="Task details" height="full">
      <div className="space-y-4 pb-4">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onClose} className="interactive flex h-9 w-9 items-center justify-center rounded-full bg-[var(--s3)] text-[var(--t2)]">
            <ArrowLeft size={16} strokeWidth={1.5} />
          </button>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Task title"
            className="h-11 flex-1 border-0 border-b border-[var(--border-md)] bg-transparent px-1 text-[18px] font-medium text-[var(--t1)] outline-none placeholder:text-[var(--t3)]"
          />
          <button type="button" className="interactive flex h-9 w-9 items-center justify-center rounded-full bg-[var(--s3)] text-[var(--t2)]">
            <MoreHorizontal size={16} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[12px]">
          <button type="button" onClick={() => setAreaId((current) => areaOrder[(areaOrder.indexOf(current) + 1) % areaOrder.length])} className="rounded-full bg-[var(--s3)] px-3 py-1 text-[var(--t2)]">
            <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: area?.color ?? 'var(--primary)' }} />
            {area?.name ?? areaId}
          </button>
          <button type="button" onClick={() => setPriority((current) => priorityOrder[(priorityOrder.indexOf(current) + 1) % priorityOrder.length])} className="rounded-full bg-[var(--s3)] px-3 py-1 text-[var(--t2)]">
            Priority {priority}
          </button>
          <label className="rounded-full bg-[var(--s3)] px-3 py-1 text-[var(--t2)]">
            <span className="mr-2 inline-flex items-center gap-1"><Calendar size={12} strokeWidth={1.5} />{dueDate ? formatDate(dueDate) : 'Due date'}</span>
            <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="ml-2 bg-transparent outline-none" />
          </label>
          <input
            value={estimateMin}
            onChange={(event) => setEstimateMin(event.target.value.replace(/\D/g, ''))}
            placeholder="Est. minutes"
            type="number"
            className="h-8 w-32 rounded-full bg-[var(--s3)] px-3 text-[12px] text-[var(--t2)] outline-none"
          />
        </div>

        <div className="space-y-2 rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
          <div className="flex items-center justify-between">
            <div className="text-[13px] font-medium text-[var(--t1)]">Subtasks</div>
            <div className="text-[11px] text-[var(--t3)]">{task.subtasks?.length ?? 0}</div>
          </div>
          {task.subtasks?.map((subtask) => (
            <div key={subtask.id} className="flex items-center gap-2 rounded-[10px] px-2 py-2 hover:bg-[var(--s3)]">
              <button
                type="button"
                onClick={() => toggleSubtask(task.id, subtask.id)}
                className={cn('flex h-5 w-5 items-center justify-center rounded-full border', subtask.done ? 'border-[var(--primary)] bg-[var(--primary)] text-white' : 'border-[var(--border-md)]')}
              >
                {subtask.done ? <Check size={11} strokeWidth={2.5} /> : null}
              </button>
              <div className={cn('flex-1 text-[13px]', subtask.done ? 'text-[var(--t3)] line-through' : 'text-[var(--t1)]')}>
                {subtask.title}
              </div>
              <button type="button" onClick={() => dispatch({ type: 'DELETE_TASK_SUBTASK', taskId: task.id, subtaskId: subtask.id })} className="text-[var(--t3)]">
                <Trash2 size={14} strokeWidth={1.5} />
              </button>
            </div>
          ))}
          <TaskSubtasks task={task} onToggleSubtask={toggleSubtask} onAddSubtask={addSubtask} />
        </div>

        <div className="space-y-2 rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
          <div className="text-[13px] font-medium text-[var(--t1)]">Notes</div>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add notes..."
            rows={4}
            className="min-h-[120px] w-full resize-none rounded-[12px] border border-[var(--border)] bg-[var(--s2)] p-3 text-[13px] text-[var(--t1)] outline-none placeholder:text-[var(--t3)]"
          />
        </div>

        <div className="flex gap-2">
          <button type="button" onClick={() => dispatch({ type: 'SCHEDULE_TASK_FOR_TODAY', taskId: task.id })} className="flex-1 rounded-[12px] bg-[var(--primary-bg)] px-4 py-3 text-[13px] font-medium text-[var(--primary)]">
            Schedule for today
          </button>
          <button type="button" onClick={saveTask} className="flex-1 rounded-[12px] bg-[var(--primary)] px-4 py-3 text-[13px] font-medium text-white">
            Save task
          </button>
        </div>

        <div className="pt-2">
          {!confirmDelete ? (
            <button type="button" onClick={() => setConfirmDelete(true)} className="text-[12px] text-[var(--amber)]">
              Delete task
            </button>
          ) : (
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4">
              <div className="w-full max-w-[280px] rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
                <div className="text-[14px] font-medium text-[var(--t1)]">Delete this task?</div>
                <div className="mt-2 text-[12px] text-[var(--t3)]">This cannot be undone.</div>
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={() => dispatch({ type: 'DELETE_TASK', taskId: task.id })} className="flex-1 rounded-[10px] bg-[var(--amber)] px-3 py-2 text-[12px] font-medium text-white">
                    Delete
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="flex-1 rounded-[10px] bg-[var(--s3)] px-3 py-2 text-[12px] font-medium text-[var(--t2)]">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}

function AddTaskSheet({ isOpen, onClose, mode = 'backlog' }: { isOpen: boolean; onClose: () => void; mode?: 'today' | 'backlog' }) {
  const { state, dispatch } = useApp();
  const [title, setTitle] = React.useState('');
  const [areaId, setAreaId] = React.useState<AreaId>('career');
  const [priority, setPriority] = React.useState<Priority>('P1');
  const [projectId, setProjectId] = React.useState('');
  const [dueDate, setDueDate] = React.useState('');
  const [estimateMin, setEstimateMin] = React.useState('');

  React.useEffect(() => {
    if (!isOpen) return;
    setTitle('');
    setAreaId('career');
    setPriority('P1');
    setProjectId('');
    setDueDate(mode === 'today' ? todayKey : '');
    setEstimateMin('');
  }, [isOpen, mode]);

  const projectsForArea = state.projects.filter((project) => project.areaId === areaId);

  const createTask = () => {
    if (!title.trim()) return;
    const task: Task = {
      id: createId('task'),
      title: title.trim(),
      status: 'todo',
      priority,
      areaId,
      projectId: projectId || undefined,
      dueDate: dueDate || (mode === 'today' ? todayKey : undefined),
      estimateMin: estimateMin ? Number(estimateMin) : undefined,
      subtasks: [],
      notes: '',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_TASK', task });
    if (projectId) {
      const project = state.projects.find((item) => item.id === projectId);
      if (project && !project.tasks.includes(task.id)) {
        dispatch({ type: 'UPDATE_PROJECT', projectId, updates: { tasks: [task.id, ...project.tasks] } });
      }
    }
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Add task" height="full">
      <div className="space-y-4 pb-4">
        <input
          autoFocus
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs to be done?"
          className="h-11 w-full rounded-[14px] border border-[var(--border-strong)] bg-[var(--s2)] px-4 text-[14px] text-[var(--t1)] outline-none placeholder:text-[var(--t3)]"
        />

        <div className="grid grid-cols-3 gap-2">
          {areaOrder.map((area) => {
            const areaData = getAreaById(area, state.areas);
            return (
              <button
                key={area}
                type="button"
                onClick={() => setAreaId(area)}
                className={cn('rounded-[12px] border px-3 py-2 text-left text-[12px]', areaId === area ? 'border-[var(--primary)] bg-[var(--primary-bg)] text-[var(--primary)]' : 'border-[var(--border)] bg-[var(--s2)] text-[var(--t2)]')}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: areaData?.color ?? 'var(--primary)' }} />
                  <span>{areaData?.name ?? area}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          {priorityOrder.map((item) => (
            <button key={item} type="button" onClick={() => setPriority(item)} className={cn('flex-1 rounded-full px-3 py-2 text-[12px]', priority === item ? 'bg-[var(--primary)] text-white' : 'bg-[var(--s3)] text-[var(--t2)]')}>
              {item}
            </button>
          ))}
        </div>

        <label className="block text-[12px] text-[var(--t3)]">
          Project
          <select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="mt-2 h-11 w-full rounded-[12px] border border-[var(--border)] bg-[var(--s2)] px-3 text-[13px] text-[var(--t1)] outline-none">
            <option value="">No project</option>
            {projectsForArea.map((project) => (
              <option key={project.id} value={project.id}>{project.title}</option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-[12px] text-[var(--t3)]">
            Due date
            <input value={dueDate} onChange={(event) => setDueDate(event.target.value)} type="date" className="mt-2 h-11 w-full rounded-[12px] border border-[var(--border)] bg-[var(--s2)] px-3 text-[13px] text-[var(--t1)] outline-none" />
          </label>
          <label className="block text-[12px] text-[var(--t3)]">
            Est. minutes
            <input value={estimateMin} onChange={(event) => setEstimateMin(event.target.value.replace(/\D/g, ''))} type="number" className="mt-2 h-11 w-full rounded-[12px] border border-[var(--border)] bg-[var(--s2)] px-3 text-[13px] text-[var(--t1)] outline-none" />
          </label>
        </div>

        <button type="button" onClick={createTask} className="h-12 w-full rounded-[12px] bg-[var(--primary)] text-[14px] font-medium text-white">
          Add to backlog
        </button>
      </div>
    </BottomSheet>
  );
}

function AddProjectSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { state, dispatch } = useApp();
  const [title, setTitle] = React.useState('');
  const [areaId, setAreaId] = React.useState<AreaId>('career');
  const [description, setDescription] = React.useState('');
  const [dueDate, setDueDate] = React.useState('');

  React.useEffect(() => {
    if (!isOpen) return;
    setTitle('');
    setAreaId('career');
    setDescription('');
    setDueDate('');
  }, [isOpen]);

  const createProject = () => {
    if (!title.trim()) return;
    dispatch({
      type: 'ADD_PROJECT',
      project: {
        id: createId('project'),
        title: title.trim(),
        areaId,
        status: 'active',
        tasks: [],
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
      },
    });
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="New project">
      <div className="space-y-4 pb-4">
        <input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Project title" className="h-11 w-full rounded-[14px] border border-[var(--border-strong)] bg-[var(--s2)] px-4 text-[14px] text-[var(--t1)] outline-none placeholder:text-[var(--t3)]" />
        <div className="grid grid-cols-3 gap-2">
          {areaOrder.map((area) => {
            const areaData = getAreaById(area, state.areas);
            return (
              <button key={area} type="button" onClick={() => setAreaId(area)} className={cn('rounded-[12px] border px-3 py-2 text-left text-[12px]', areaId === area ? 'border-[var(--primary)] bg-[var(--primary-bg)] text-[var(--primary)]' : 'border-[var(--border)] bg-[var(--s2)] text-[var(--t2)]')}>
                <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: areaData?.color ?? 'var(--primary)' }} />
                {areaData?.name ?? area}
              </button>
            );
          })}
        </div>
        <label className="block text-[12px] text-[var(--t3)]">
          Due date
          <input value={dueDate} onChange={(event) => setDueDate(event.target.value)} type="date" className="mt-2 h-11 w-full rounded-[12px] border border-[var(--border)] bg-[var(--s2)] px-3 text-[13px] text-[var(--t1)] outline-none" />
        </label>
        <label className="block text-[12px] text-[var(--t3)]">
          Description
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className="mt-2 w-full rounded-[12px] border border-[var(--border)] bg-[var(--s2)] p-3 text-[13px] text-[var(--t1)] outline-none" />
        </label>
        <button type="button" onClick={createProject} className="h-12 w-full rounded-[12px] bg-[var(--primary)] text-[14px] font-medium text-white">
          Create project →
        </button>
      </div>
    </BottomSheet>
  );
}

function ProjectDetailSheet({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const { state, dispatch } = useApp();
  const [title, setTitle] = React.useState('');
  const [status, setStatus] = React.useState<Project['status']>('active');
  const [description, setDescription] = React.useState('');
  const [taskTitle, setTaskTitle] = React.useState('');
  const [confirmDone, setConfirmDone] = React.useState(false);
  const [dragTaskId, setDragTaskId] = React.useState('');

  React.useEffect(() => {
    if (!project) return;
    setTitle(project.title);
    setStatus(project.status);
    setDescription(project.description ?? '');
    setConfirmDone(false);
    setTaskTitle('');
  }, [project]);

  if (!project) return null;

  const area = getAreaById(project.areaId, state.areas);
  const projectTasks = sortTasks(project.tasks.map((taskId) => state.tasks.find((task) => task.id === taskId)).filter(Boolean) as Task[]);
  const doneCount = projectTasks.filter((task) => task.status === 'done').length;

  const saveProject = () => {
    dispatch({
      type: 'UPDATE_PROJECT',
      projectId: project.id,
      updates: {
        title: title.trim() || project.title,
        status,
        description: description.trim() || undefined,
      },
    });
  };

  const addTaskToProject = () => {
    if (!taskTitle.trim()) return;
    const task: Task = {
      id: createId('task'),
      title: taskTitle.trim(),
      status: 'todo',
      priority: 'P2',
      areaId: project.areaId,
      projectId: project.id,
      dueDate: project.dueDate,
      estimateMin: undefined,
      subtasks: [],
      notes: '',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_TASK', task });
    dispatch({ type: 'UPDATE_PROJECT', projectId: project.id, updates: { tasks: [task.id, ...project.tasks] } });
    setTaskTitle('');
  };

  const moveTask = (taskId: string, direction: 'up' | 'down') => {
    dispatch({ type: 'REORDER_PROJECT_TASK', projectId: project.id, taskId, direction });
  };

  return (
    <BottomSheet isOpen={Boolean(project)} onClose={onClose} title="Project" height="full">
      <div className="space-y-4 pb-4">
        <div className="flex items-start gap-2">
          <button type="button" onClick={onClose} className="interactive flex h-9 w-9 items-center justify-center rounded-full bg-[var(--s3)] text-[var(--t2)]">
            <ArrowLeft size={16} strokeWidth={1.5} />
          </button>
          <div className="flex-1 space-y-2">
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Project title" className="h-11 w-full border-0 border-b border-[var(--border-md)] bg-transparent px-1 text-[18px] font-medium text-[var(--t1)] outline-none" />
            <div className="flex flex-wrap items-center gap-2 text-[12px]">
              <span className="rounded-full bg-[var(--s3)] px-3 py-1 text-[var(--t2)]">
                <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: area?.color ?? 'var(--primary)' }} />
                {area?.name ?? project.areaId}
              </span>
              <button type="button" onClick={() => setStatus((current) => (current === 'active' ? 'paused' : current === 'paused' ? 'done' : 'active'))} className={cn('rounded-full px-3 py-1', status === 'active' ? 'bg-[var(--teal-bg)] text-[var(--teal)]' : status === 'paused' ? 'bg-[var(--amber-bg)] text-[var(--amber)]' : 'bg-[var(--s3)] text-[var(--t3)]')}>
                {status}
              </button>
            </div>
          </div>
          <button type="button" onClick={() => setConfirmDone(true)} className="interactive text-[var(--t3)]">
            <MoreHorizontal size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
          <div className="mb-3 flex items-center justify-between text-[13px] text-[var(--t2)]">
            <span>{doneCount}/{projectTasks.length} tasks done</span>
            <span>{formatDate(project.dueDate)}</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--s3)]">
            <div className="h-full rounded-full" style={{ width: `${projectTasks.length ? (doneCount / projectTasks.length) * 100 : 0}%`, backgroundColor: area?.color ?? 'var(--primary)' }} />
          </div>
        </div>

        <div className="space-y-2 rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
          <div className="text-[13px] font-medium text-[var(--t1)]">Tasks</div>
          {projectTasks.map((task, index) => {
            const taskArea = getAreaById(task.areaId, state.areas);
            return (
              <div
                key={task.id}
                draggable
                onDragStart={() => setDragTaskId(task.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (!dragTaskId || dragTaskId === task.id) return;
                  const from = project.tasks.indexOf(dragTaskId);
                  const to = project.tasks.indexOf(task.id);
                  if (from < 0 || to < 0) return;
                  const next = [...project.tasks];
                  const [moved] = next.splice(from, 1);
                  next.splice(to, 0, moved);
                  dispatch({ type: 'UPDATE_PROJECT', projectId: project.id, updates: { tasks: next } });
                }}
                className="flex items-center gap-2 rounded-[12px] px-2 py-2 hover:bg-[var(--s3)]"
              >
                <GripVertical size={14} strokeWidth={1.5} className="text-[var(--t3)]" />
                <button type="button" onClick={() => dispatch({ type: 'TOGGLE_TASK_STATUS', taskId: task.id })} className={cn('flex h-5 w-5 items-center justify-center rounded-full border', task.status === 'done' ? 'border-[var(--primary)] bg-[var(--primary)] text-white' : 'border-[var(--border-md)]')}>
                  {task.status === 'done' ? <Check size={11} strokeWidth={2.5} /> : null}
                </button>
                <div className={cn('flex-1 text-[13px]', task.status === 'done' ? 'text-[var(--t3)] line-through' : 'text-[var(--t1)]')}>
                  {task.title}
                </div>
                <button type="button" onClick={() => moveTask(task.id, 'up')} className="text-[var(--t3)]"><ChevronRight size={14} strokeWidth={1.5} className="rotate-180" /></button>
                <button type="button" onClick={() => moveTask(task.id, 'down')} className="text-[var(--t3)]"><ChevronRight size={14} strokeWidth={1.5} /></button>
              </div>
            );
          })}
          <div className="flex items-center gap-2 pt-1">
            <input
              value={taskTitle}
              onChange={(event) => setTaskTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addTaskToProject();
                }
              }}
              placeholder="Add task to project..."
              className="h-9 flex-1 rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-3 text-[13px] text-[var(--t1)] outline-none placeholder:text-[var(--t3)]"
            />
            <button type="button" onClick={addTaskToProject} className="interactive flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-white">
              <Plus size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <label className="block rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4 text-[12px] text-[var(--t3)]">
          Project notes
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={5}
            className="mt-2 w-full resize-none rounded-[12px] border border-[var(--border)] bg-[var(--s2)] p-3 text-[13px] text-[var(--t1)] outline-none"
          />
        </label>

        <div className="flex gap-2">
          <button type="button" onClick={saveProject} className="flex-1 rounded-[12px] border border-[var(--amber)] px-4 py-3 text-[13px] font-medium text-[var(--amber)]">
            Mark project done
          </button>
          <button type="button" onClick={saveProject} className="flex-1 rounded-[12px] bg-[var(--primary)] px-4 py-3 text-[13px] font-medium text-white">
            Save project
          </button>
        </div>

        {confirmDone ? (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-[280px] rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
              <div className="text-[14px] font-medium text-[var(--t1)]">Mark project done?</div>
              <div className="mt-2 text-[12px] text-[var(--t3)]">This will set the project status to done.</div>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => dispatch({ type: 'SET_PROJECT_STATUS', projectId: project.id, status: 'done' })} className="flex-1 rounded-[10px] bg-[var(--amber)] px-3 py-2 text-[12px] font-medium text-white">
                  Mark done
                </button>
                <button type="button" onClick={() => setConfirmDone(false)} className="flex-1 rounded-[10px] bg-[var(--s3)] px-3 py-2 text-[12px] font-medium text-[var(--t2)]">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </BottomSheet>
  );
}

function TaskGroupRow({ task, onOpen }: { task: Task; onOpen: (task: Task) => void }) {
  const area = task.areaId;
  return (
    <button
      type="button"
      onClick={() => onOpen(task)}
      className="group flex w-full items-center gap-3 rounded-[12px] px-4 py-3 text-left transition-colors duration-150 hover:bg-[var(--s3)]"
    >
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: areaAccent[area] }} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] text-[var(--t1)]">{task.title}</div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-[var(--t3)]">
          <span className={cn('rounded-full px-2 py-0.5 text-[11px]', task.priority === 'P1' ? 'bg-[var(--primary-bg)] text-[var(--primary)]' : task.priority === 'P2' ? 'bg-[var(--amber-bg)] text-[var(--amber)]' : 'bg-[var(--s3)] text-[var(--t3)]')}>
            {task.priority}
          </span>
          {task.dueDate ? <span>{formatDate(task.dueDate)}</span> : null}
          {task.estimateMin ? <span>{task.estimateMin}m</span> : null}
        </div>
      </div>
      <ChevronRight size={16} strokeWidth={1.5} className="text-[var(--t3)]" />
    </button>
  );
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: (project: Project) => void }) {
  const { state, dispatch } = useApp();
  const area = getAreaById(project.areaId, state.areas);
  const projectTasks = project.tasks.map((taskId) => state.tasks.find((task) => task.id === taskId)).filter(Boolean) as Task[];
  const doneCount = projectTasks.filter((task) => task.status === 'done').length;
  const [expanded, setExpanded] = React.useState(false);
  const statusTone = project.status === 'active' ? 'bg-[var(--teal-bg)] text-[var(--teal)]' : project.status === 'paused' ? 'bg-[var(--amber-bg)] text-[var(--amber)]' : 'bg-[var(--teal-bg)] text-[var(--teal)]';

  return (
    <div className={cn('rounded-[14px] border border-[var(--border-md)] bg-[var(--s2)] p-5', project.status === 'done' ? 'animate-fade-in-up' : '')}>
      <button type="button" onClick={() => setExpanded((current) => !current)} className="flex w-full items-start justify-between gap-3 text-left">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2 text-[12px] text-[var(--t3)]">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: area?.color ?? 'var(--primary)' }} />
            <span>{area?.name ?? project.areaId}</span>
            <span className={cn('rounded-full px-2 py-0.5 text-[11px]', statusTone)}>{project.status}</span>
          </div>
          <div className="text-[16px] font-medium text-[var(--t1)]">{project.title}</div>
          {project.description ? <div className="text-[13px] text-[var(--t2)]">{project.description}</div> : null}
          <div className="flex items-center gap-2 text-[12px] text-[var(--t3)]">
            <span>{doneCount}/{projectTasks.length} tasks done</span>
            {project.dueDate ? <span className="flex items-center gap-1"><Calendar size={12} strokeWidth={1.5} />{formatDate(project.dueDate)}</span> : null}
          </div>
          <div className="h-1.5 rounded-full bg-[var(--s3)]">
            <div className="h-full rounded-full" style={{ width: `${projectTasks.length ? (doneCount / projectTasks.length) * 100 : 0}%`, backgroundColor: area?.color ?? 'var(--primary)' }} />
          </div>
        </div>
        <ChevronDown size={16} strokeWidth={1.5} className={cn('mt-1 text-[var(--t3)] transition-transform duration-150', expanded ? 'rotate-180' : '')} />
      </button>

      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => onOpen(project)} className="rounded-full bg-[var(--primary-bg)] px-3 py-1 text-[11px] text-[var(--primary)]">
          Open detail
        </button>
        <button type="button" onClick={() => dispatch({ type: 'SET_PROJECT_STATUS', projectId: project.id, status: 'paused' })} className="rounded-full bg-[var(--s3)] px-3 py-1 text-[11px] text-[var(--t2)]">
          Pause
        </button>
      </div>

      {expanded ? (
        <div className="mt-4 space-y-1 rounded-[12px] border border-[var(--border)] bg-[var(--s1)] p-2">
          {projectTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              compact
              areaColor={getAreaThemeColor(task.areaId, state.areas)}
              areaName={getAreaById(task.areaId, state.areas)?.name ?? task.areaId}
              projectName={project.title}
              onToggle={(taskId) => dispatch({ type: 'TOGGLE_TASK_STATUS', taskId })}
              onEdit={(editedTask) => onOpen(project) || editedTask}
              onDelete={(taskId) => dispatch({ type: 'DELETE_TASK', taskId })}
              onChangePriority={(taskId) => {
                const task = state.tasks.find((item) => item.id === taskId);
                if (!task) return;
                const next = priorityOrder[(priorityOrder.indexOf(task.priority) + 1) % priorityOrder.length];
                dispatch({ type: 'UPDATE_TASK', taskId, updates: { priority: next } });
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

type DragMode = 'move' | 'resize-start' | 'resize-end';

function TimeBlockTimeline({
  blocks,
  areas,
  conflictIds,
  onUpdateRange,
}: {
  blocks: TimeBlock[];
  areas: ReturnType<typeof useApp>['state']['areas'];
  conflictIds: Set<string>;
  onUpdateRange: (blockId: string, start: string, end: string) => void;
}) {
  const dragRef = React.useRef<{
    blockId: string;
    mode: DragMode;
    startMinutes: number;
    endMinutes: number;
    pointerStartY: number;
  } | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const totalTimelineMinutes = TIMELINE_END_MINUTES - TIMELINE_START_MINUTES;
  const timelineHeight = (totalTimelineMinutes / 60) * TIMELINE_HOUR_HEIGHT;
  const hourMarks = Array.from({ length: totalTimelineMinutes / 60 + 1 }, (_, index) => TIMELINE_START_MINUTES + index * 60);

  React.useEffect(() => {
    if (!isDragging) {
      return undefined;
    }

    const onPointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) {
        return;
      }

      const deltaY = event.clientY - drag.pointerStartY;
      const deltaMinutes = snapMinutes((deltaY / TIMELINE_HOUR_HEIGHT) * 60);

      if (drag.mode === 'move') {
        const duration = drag.endMinutes - drag.startMinutes;
        const shiftedStart = snapMinutes(drag.startMinutes + deltaMinutes);
        const nextStart = clampNumber(shiftedStart, TIMELINE_START_MINUTES, TIMELINE_END_MINUTES - duration);
        const nextEnd = nextStart + duration;
        onUpdateRange(drag.blockId, minutesToTime(nextStart), minutesToTime(nextEnd));
        return;
      }

      if (drag.mode === 'resize-start') {
        const resizedStart = snapMinutes(drag.startMinutes + deltaMinutes);
        const nextStart = clampNumber(resizedStart, TIMELINE_START_MINUTES, drag.endMinutes - MIN_BLOCK_MINUTES);
        onUpdateRange(drag.blockId, minutesToTime(nextStart), minutesToTime(drag.endMinutes));
        return;
      }

      const resizedEnd = snapMinutes(drag.endMinutes + deltaMinutes);
      const nextEnd = clampNumber(resizedEnd, drag.startMinutes + MIN_BLOCK_MINUTES, TIMELINE_END_MINUTES);
      onUpdateRange(drag.blockId, minutesToTime(drag.startMinutes), minutesToTime(nextEnd));
    };

    const onPointerUp = () => {
      dragRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [isDragging, onUpdateRange]);

  const beginDrag = (event: React.PointerEvent<HTMLDivElement>, block: TimeBlock, mode: DragMode) => {
    event.preventDefault();
    event.stopPropagation();

    dragRef.current = {
      blockId: block.id,
      mode,
      startMinutes: timeToMinutes(block.start),
      endMinutes: timeToMinutes(block.end),
      pointerStartY: event.clientY,
    };
    setIsDragging(true);
  };

  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] px-3 py-3">
      <div className="mb-2 text-[12px] text-[var(--t3)]">Drag blocks to move. Drag top/bottom handle to resize.</div>
      <div className="relative">
        <div className="pl-12" style={{ height: timelineHeight }}>
          {hourMarks.map((minutes) => {
            const top = ((minutes - TIMELINE_START_MINUTES) / 60) * TIMELINE_HOUR_HEIGHT;
            return (
              <div key={`line-${minutes}`} className="pointer-events-none absolute left-12 right-0 border-t border-[var(--border)]" style={{ top }} />
            );
          })}

          {blocks.map((block) => {
            const startMinutes = timeToMinutes(block.start);
            const endMinutes = timeToMinutes(block.end);
            const top = ((startMinutes - TIMELINE_START_MINUTES) / 60) * TIMELINE_HOUR_HEIGHT;
            const height = Math.max(26, ((endMinutes - startMinutes) / 60) * TIMELINE_HOUR_HEIGHT);
            const area = block.areaId ? getAreaById(block.areaId, areas) : undefined;
            const hasConflict = conflictIds.has(block.id);
            return (
              <div key={block.id} className="absolute left-12 right-0 pr-1" style={{ top, height }}>
                <div
                  className={cn(
                    'h-full rounded-[10px] border px-2 py-1 text-left',
                    hasConflict ? 'border-[var(--amber)] bg-[var(--amber-bg)]' : '',
                    block.done ? 'border-[var(--border)] bg-[var(--s2)] opacity-70' : 'border-[var(--primary)] bg-[var(--primary-bg)]',
                  )}
                  onPointerDown={(event) => beginDrag(event, block, 'move')}
                >
                  <div
                    className="absolute left-3 right-3 top-0 h-1.5 cursor-ns-resize rounded-b-[6px] bg-[var(--primary)]/30"
                    onPointerDown={(event) => beginDrag(event, block, 'resize-start')}
                  />
                  <div
                    className="absolute bottom-0 left-3 right-3 h-1.5 cursor-ns-resize rounded-t-[6px] bg-[var(--primary)]/30"
                    onPointerDown={(event) => beginDrag(event, block, 'resize-end')}
                  />
                  <div className="truncate pr-6 text-[12px] font-medium text-[var(--t1)]">{block.title}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] text-[var(--t3)]">
                    <span>{block.start} - {block.end}</span>
                    {area ? <span className="rounded-full bg-white/60 px-1.5 py-0.5">{area.name}</span> : null}
                    {hasConflict ? <span className="rounded-full bg-[var(--amber)] px-1.5 py-0.5 text-white">Conflict</span> : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {hourMarks.map((minutes) => {
          const top = ((minutes - TIMELINE_START_MINUTES) / 60) * TIMELINE_HOUR_HEIGHT;
          return (
            <div key={`label-${minutes}`} className="pointer-events-none absolute left-0 text-[10px] text-[var(--t3)]" style={{ top: top - 7 }}>
              {minutesToTime(minutes)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Focus() {
  const { state, dispatch, getTodayLogs } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = React.useState<'today' | 'projects' | 'backlog'>('today');
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const [showAddTask, setShowAddTask] = React.useState(false);
  const [showAddProject, setShowAddProject] = React.useState(false);
  const [quickTitle, setQuickTitle] = React.useState('');
  const [quickArea, setQuickArea] = React.useState<AreaId>('career');
  const [quickPriority, setQuickPriority] = React.useState<Priority>('P1');
  const [filterArea, setFilterArea] = React.useState<'all' | AreaId>('all');
  const [sortMode, setSortMode] = React.useState<'priority' | 'dueDate' | 'area'>('priority');
  const [toast, setToast] = React.useState('');
  const [expandedTaskId, setExpandedTaskId] = React.useState('');
  const [timeBlocks, setTimeBlocks] = React.useState<TimeBlock[]>([]);
  const [showTimeBlockSheet, setShowTimeBlockSheet] = React.useState(false);
  const [blockTitle, setBlockTitle] = React.useState('');
  const [blockTaskId, setBlockTaskId] = React.useState('');
  const [blockDate, setBlockDate] = React.useState(todayKey);
  const [blockRepeat, setBlockRepeat] = React.useState<TimeBlockRepeatTemplate>('none');
  const [preventDuplicateBlocks, setPreventDuplicateBlocks] = React.useState(false);
  const [blockStart, setBlockStart] = React.useState('09:00');
  const [blockEnd, setBlockEnd] = React.useState('10:00');
  const [selectedBlockDate, setSelectedBlockDate] = React.useState(todayKey);
  const [showBlockCalendar, setShowBlockCalendar] = React.useState(false);
  const [blockCalendarMonth, setBlockCalendarMonth] = React.useState(getMonthStartFromIso(todayKey));

  const activeTasks = state.tasks.filter((task) => task.status !== 'done');
  const doneTasks = state.tasks.filter((task) => task.status === 'done');
  const todayTasks = sortTasks(activeTasks.filter((task) => task.dueDate === todayKey || (!task.dueDate && task.status !== 'done'))).concat(sortTasks(doneTasks));
  const backlogTasks = sortTasks(activeTasks.filter((task) => task.dueDate !== todayKey));
  const habitsLogged = state.habits.filter((habit) => Boolean(getTodayLogs(habit.id))).length;
  const todayHabits = state.habits.slice(0, 3);
  const streak = state.habits.reduce((max, habit) => Math.max(max, habit.streak), 0);
  const projectCount = state.projects.length;
  const todayDoneCount = activeTasks.filter((task) => task.dueDate === todayKey && task.status === 'done').length;
  const todayCount = activeTasks.filter((task) => task.dueDate === todayKey || (!task.dueDate && task.status !== 'done')).length;

  React.useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const raw = window.localStorage.getItem(TIME_BLOCK_STORAGE_KEY);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as TimeBlock[];
      if (Array.isArray(parsed)) {
        setTimeBlocks(parsed);
      }
    } catch {
      setTimeBlocks([]);
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(TIME_BLOCK_STORAGE_KEY, JSON.stringify(timeBlocks));
  }, [timeBlocks]);

  const addQuickTask = () => {
    if (!quickTitle.trim()) return;
    const task: Task = {
      id: createId('task'),
      title: quickTitle.trim(),
      status: 'todo',
      priority: quickPriority,
      areaId: quickArea,
      dueDate: todayKey,
      createdAt: new Date().toISOString(),
      subtasks: [],
      notes: '',
    };
    dispatch({ type: 'ADD_TASK', task });
    setQuickTitle('');
    setToast('Task added to today');
  };

  const toggleTask = (taskId: string) => dispatch({ type: 'TOGGLE_TASK_STATUS', taskId });
  const changePriority = (taskId: string) => {
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) return;
    const next = priorityOrder[(priorityOrder.indexOf(task.priority) + 1) % priorityOrder.length];
    dispatch({ type: 'UPDATE_TASK', taskId, updates: { priority: next } });
  };

  const filteredBacklog = backlogTasks.filter((task) => filterArea === 'all' ? true : task.areaId === filterArea);
  const groupedBacklog = areaOrder
    .map((area) => ({ area, tasks: filteredBacklog.filter((task) => task.areaId === area) }))
    .filter((group) => group.tasks.length > 0);

  const sortPills: Array<{ key: 'priority' | 'dueDate' | 'area'; label: string }> = [
    { key: 'priority', label: 'Priority' },
    { key: 'dueDate', label: 'Due date' },
    { key: 'area', label: 'Area' },
  ];
  const openTimeBlockSheet = () => {
    setBlockTitle('');
    setBlockTaskId('');
    setBlockDate(selectedBlockDate);
    setBlockRepeat('none');
    setPreventDuplicateBlocks(false);
    setBlockStart('09:00');
    setBlockEnd('10:00');
    setShowTimeBlockSheet(true);
  };

  const selectedDateTimeBlocks = [...timeBlocks]
    .filter((block) => block.date === selectedBlockDate)
    .sort((left, right) => left.start.localeCompare(right.start));
  const overlapIds = getOverlappingBlockIds(selectedDateTimeBlocks);

  const totalBlockedMinutes = selectedDateTimeBlocks.reduce((sum, block) => sum + blockDurationMinutes(block), 0);
  const completedBlocks = selectedDateTimeBlocks.filter((block) => block.done).length;
  const selectedDateLabel = new Date(`${selectedBlockDate}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const monthYearLabel = blockCalendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const monthYear = blockCalendarMonth.getFullYear();
  const monthIndex = blockCalendarMonth.getMonth();
  const daysInMonth = new Date(monthYear, monthIndex + 1, 0).getDate();
  const firstDayMondayIndex = (new Date(monthYear, monthIndex, 1).getDay() + 6) % 7;
  const monthCells = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstDayMondayIndex + 1;
    if (day < 1 || day > daysInMonth) {
      return null;
    }
    const dateKey = isoDate(new Date(monthYear, monthIndex, day));
    return {
      day,
      dateKey,
      count: timeBlocks.filter((block) => block.date === dateKey).length,
      isSelected: dateKey === selectedBlockDate,
      isToday: dateKey === todayKey,
    };
  });
  const repeatDatesPreview = getRepeatDates(blockDate, blockRepeat);

  React.useEffect(() => {
    if (!showTimeBlockSheet || !blockTaskId) {
      return;
    }

    const linkedTask = state.tasks.find((task) => task.id === blockTaskId);
    if (!linkedTask) {
      return;
    }

    if (!blockTitle.trim()) {
      setBlockTitle(linkedTask.title);
    }

    if (!linkedTask.estimateMin) {
      return;
    }

    const nextEndMinutes = clampNumber(
      snapMinutes(timeToMinutes(blockStart) + linkedTask.estimateMin),
      timeToMinutes(blockStart) + MIN_BLOCK_MINUTES,
      TIMELINE_END_MINUTES,
    );
    setBlockEnd(minutesToTime(nextEndMinutes));
  }, [showTimeBlockSheet, blockTaskId, blockStart, blockTitle, state.tasks]);

  const createTimeBlock = () => {
    const selectedTask = blockTaskId ? state.tasks.find((task) => task.id === blockTaskId) : undefined;
    const title = blockTitle.trim() || selectedTask?.title;
    if (!title) {
      return;
    }
    if (timeToMinutes(blockEnd) <= timeToMinutes(blockStart)) {
      setToast('End time must be after start time');
      return;
    }

    const targetDates = getRepeatDates(blockDate, blockRepeat);
    const existingBlocks = timeBlocks;
    const signatures = new Set(existingBlocks.map((block) => `${block.date}|${block.start}|${block.end}|${block.title}`));

    const nextBlocks: TimeBlock[] = [];
    let skippedCount = 0;
    targetDates.forEach((date) => {
      const signature = `${date}|${blockStart}|${blockEnd}|${title}`;
      if (preventDuplicateBlocks && signatures.has(signature)) {
        skippedCount += 1;
        return;
      }

      signatures.add(signature);
      nextBlocks.push({
        id: createId('block'),
        date,
        start: blockStart,
        end: blockEnd,
        title,
        taskId: selectedTask?.id,
        areaId: selectedTask?.areaId,
        done: false,
      });
    });

    if (!nextBlocks.length) {
      setToast('All matching blocks already exist. Turn off Prevent duplicates to add anyway.');
      return;
    }

    setTimeBlocks([...existingBlocks, ...nextBlocks]);
    const addedCount = nextBlocks.length;

    setSelectedBlockDate(blockDate);
    setBlockCalendarMonth(getMonthStartFromIso(blockDate));
    setShowTimeBlockSheet(false);
    if (skippedCount > 0) {
      setToast(`${addedCount} added, ${skippedCount} skipped (already existed)`);
      return;
    }

    setToast(addedCount === 1 ? 'Time block added' : `${addedCount} time blocks added`);
  };

  const toggleTimeBlock = (blockId: string) => {
    setTimeBlocks((current) => current.map((block) => block.id === blockId ? { ...block, done: !block.done } : block));
  };

  const removeTimeBlock = (blockId: string) => {
    setTimeBlocks((current) => current.filter((block) => block.id !== blockId));
  };

  const updateTimeBlockRange = React.useCallback((blockId: string, start: string, end: string) => {
    setTimeBlocks((current) => current.map((block) => block.id === blockId ? { ...block, start, end } : block));
  }, []);

  const resolveOverlapForSelectedDate = () => {
    setTimeBlocks((current) => {
      const selectedBlocks = current.filter((block) => block.date === selectedBlockDate);
      const resolved = resolveTimeBlockOverlaps(selectedBlocks);
      const byId = new Map(resolved.map((block) => [block.id, block]));
      return current.map((block) => byId.get(block.id) ?? block);
    });
    setToast('Overlaps resolved for selected date');
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[22px] font-medium text-[var(--t1)]">Focus</div>
          <div className="text-[12px] text-[var(--t3)]">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</div>
        </div>
        <button type="button" onClick={() => setShowAddTask(true)} className="rounded-full bg-[var(--primary)] px-3 py-2 text-[12px] font-medium text-white">
          + Add
        </button>
      </div>

      <div className="flex gap-2 rounded-full bg-[var(--s2)] p-1">
        {(['today', 'projects', 'backlog'] as const).map((item) => (
          <button key={item} type="button" onClick={() => setTab(item)} className={cn('flex-1 rounded-full px-3 py-2 text-[12px]', tab === item ? 'bg-[var(--primary)] text-white' : 'bg-[var(--s2)] text-[var(--t2)]')}>
            {item === 'today' ? 'Today' : item === 'projects' ? 'Projects' : 'Backlog'}
          </button>
        ))}
      </div>

      {tab === 'today' ? (
        <div className="space-y-5">
          <section className="space-y-3">
            <div className="flex items-center justify-between text-[16px] font-medium text-[var(--t1)]">
              <div className="flex items-center gap-2">
                <Clock3 size={16} strokeWidth={1.6} className="text-[var(--primary)]" />
                <span>Time blocks</span>
              </div>
              <button type="button" onClick={openTimeBlockSheet} className="rounded-full bg-[var(--primary-bg)] px-3 py-1 text-[12px] font-medium text-[var(--primary)]">
                + Block
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 rounded-[14px] border border-[var(--border)] bg-[var(--s2)] px-3 py-2">
              <button type="button" onClick={() => {
                const nextDate = shiftIsoDate(selectedBlockDate, -1);
                setSelectedBlockDate(nextDate);
                setBlockCalendarMonth(getMonthStartFromIso(nextDate));
              }} className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--s3)] text-[var(--t2)]">
                <ArrowLeft size={14} strokeWidth={1.6} />
              </button>
              <button type="button" onClick={() => {
                const nextDate = shiftIsoDate(selectedBlockDate, 1);
                setSelectedBlockDate(nextDate);
                setBlockCalendarMonth(getMonthStartFromIso(nextDate));
              }} className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--s3)] text-[var(--t2)]">
                <ChevronRight size={14} strokeWidth={1.6} />
              </button>
              <input
                value={selectedBlockDate}
                onChange={(event) => {
                  setSelectedBlockDate(event.target.value);
                  setBlockCalendarMonth(getMonthStartFromIso(event.target.value));
                }}
                type="date"
                className="h-8 rounded-[10px] border border-[var(--border)] bg-[var(--s1)] px-3 text-[12px] text-[var(--t2)] outline-none"
              />
              <button type="button" onClick={() => setShowBlockCalendar((current) => !current)} className={cn('inline-flex items-center gap-1 rounded-[10px] px-3 py-1 text-[12px]', showBlockCalendar ? 'bg-[var(--primary-bg)] text-[var(--primary)]' : 'bg-[var(--s3)] text-[var(--t2)]')}>
                <Calendar size={13} strokeWidth={1.6} />
                Calendar
              </button>
              <button type="button" onClick={() => {
                setSelectedBlockDate(todayKey);
                setBlockCalendarMonth(getMonthStartFromIso(todayKey));
              }} className="rounded-[10px] bg-[var(--s3)] px-3 py-1 text-[12px] text-[var(--t2)]">
                Today
              </button>
              <span className="ml-auto text-[12px] text-[var(--t3)]">{selectedDateLabel}</span>
            </div>

            {showBlockCalendar ? (
              <div className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-3">
                <div className="mb-2 flex items-center justify-between text-[12px] text-[var(--t2)]">
                  <button type="button" onClick={() => setBlockCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} className="rounded-full bg-[var(--s3)] px-2 py-1">Prev</button>
                  <div className="font-medium text-[var(--t1)]">{monthYearLabel}</div>
                  <button type="button" onClick={() => setBlockCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} className="rounded-full bg-[var(--s3)] px-2 py-1">Next</button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-[var(--t3)]">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="py-1">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {monthCells.map((cell, index) => {
                    if (!cell) {
                      return <div key={`empty-${index}`} className="h-10 rounded-[8px] bg-transparent" />;
                    }
                    return (
                      <button
                        key={cell.dateKey}
                        type="button"
                        onClick={() => setSelectedBlockDate(cell.dateKey)}
                        className={cn(
                          'relative h-10 rounded-[8px] border text-[11px]',
                          cell.isSelected ? 'border-[var(--primary)] bg-[var(--primary-bg)] text-[var(--primary)]' : 'border-[var(--border)] bg-[var(--s2)] text-[var(--t2)]',
                        )}
                      >
                        {cell.day}
                        {cell.isToday ? <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[var(--teal)]" /> : null}
                        {cell.count ? <span className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-[var(--s3)] px-1 text-[9px] text-[var(--t3)]">{cell.count}</span> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] px-4 py-3">
              <div className="flex items-center justify-between text-[12px] text-[var(--t3)]">
                <span>{completedBlocks}/{selectedDateTimeBlocks.length} done</span>
                <span>{formatMinutes(totalBlockedMinutes)} planned</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-[var(--s3)]">
                <div
                  className="h-full rounded-full bg-[var(--primary)] transition-all"
                  style={{ width: `${selectedDateTimeBlocks.length ? (completedBlocks / selectedDateTimeBlocks.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {overlapIds.size ? (
              <div className="rounded-[12px] border border-[var(--amber)] bg-[var(--amber-bg)] px-4 py-3 text-[12px] text-[var(--amber)]">
                <div className="flex items-center justify-between gap-3">
                  <span>{overlapIds.size} block{overlapIds.size > 1 ? 's have' : ' has'} a time conflict. Drag blocks to separate overlaps.</span>
                  <button type="button" onClick={resolveOverlapForSelectedDate} className="rounded-full bg-[var(--amber)] px-3 py-1 text-[11px] font-medium text-white">
                    Resolve overlaps
                  </button>
                </div>
              </div>
            ) : null}

            {selectedDateTimeBlocks.length ? (
              <TimeBlockTimeline blocks={selectedDateTimeBlocks} areas={state.areas} conflictIds={overlapIds} onUpdateRange={updateTimeBlockRange} />
            ) : null}

            {selectedDateTimeBlocks.length ? (
              <div className="space-y-2">
                {selectedDateTimeBlocks.map((block) => {
                  const task = block.taskId ? state.tasks.find((item) => item.id === block.taskId) : undefined;
                  const area = block.areaId ? getAreaById(block.areaId, state.areas) : undefined;
                  const hasConflict = overlapIds.has(block.id);
                  return (
                    <div key={block.id} className={cn('rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-3', block.done ? 'opacity-70' : '')}>
                      <div className="flex items-start gap-2">
                        <button
                          type="button"
                          onClick={() => toggleTimeBlock(block.id)}
                          className={cn(
                            'mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border text-white',
                            block.done ? 'border-[var(--teal)] bg-[var(--teal)]' : 'border-[var(--border-md)]',
                          )}
                        >
                          {block.done ? <Check size={11} strokeWidth={2.5} /> : null}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className={cn('truncate text-[13px] font-medium', block.done ? 'line-through text-[var(--t3)]' : 'text-[var(--t1)]')}>
                            {block.title}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[var(--t3)]">
                            <span>{block.start} - {block.end}</span>
                            <span>{formatMinutes(blockDurationMinutes(block))}</span>
                            {area ? <span className="rounded-full bg-[var(--s3)] px-2 py-0.5">{area.name}</span> : null}
                            {task ? <span className="rounded-full bg-[var(--primary-bg)] px-2 py-0.5 text-[var(--primary)]">Task linked</span> : null}
                            {hasConflict ? <span className="rounded-full bg-[var(--amber-bg)] px-2 py-0.5 text-[var(--amber)]">Conflict</span> : null}
                          </div>
                        </div>
                        <button type="button" onClick={() => removeTimeBlock(block.id)} className="text-[var(--t3)]">
                          <X size={14} strokeWidth={1.8} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[12px] border border-dashed border-[var(--border)] bg-[var(--s1)] px-4 py-5 text-[12px] text-[var(--t3)]">
                No blocks on this date. Add your first block for {selectedDateLabel}.
              </div>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between text-[16px] font-medium text-[var(--t1)]">
              <span>Tasks</span>
              <span className="text-[12px] font-normal text-[var(--t3)]">{todayDoneCount} of {todayCount} done</span>
            </div>
            <div className="space-y-2">
              {sortTasks(todayTasks).map((task) => {
                const area = getAreaById(task.areaId, state.areas);
                const expanded = expandedTaskId === task.id;
                return (
                  <div key={task.id} className="space-y-2">
                    <div className={cn(task.status === 'done' ? 'opacity-70' : '')}>
                      <TaskCard
                        task={task}
                        compact={false}
                        areaColor={area?.color ?? 'var(--primary)'}
                        areaName={area?.name ?? task.areaId}
                        projectName={state.projects.find((project) => project.id === task.projectId)?.title}
                        onToggle={toggleTask}
                        onEdit={setSelectedTask}
                        onDelete={(taskId) => dispatch({ type: 'DELETE_TASK', taskId })}
                        onChangePriority={changePriority}
                      />
                    </div>
                    {task.subtasks?.length ? (
                      <div className="flex items-center justify-end pr-2">
                        <button type="button" onClick={() => setExpandedTaskId((current) => current === task.id ? '' : task.id)} className="flex items-center gap-1 text-[12px] text-[var(--t3)]">
                          {expanded ? 'Hide subtasks' : 'Show subtasks'}
                          <ChevronRight size={12} strokeWidth={1.5} className={cn('transition-transform', expanded ? 'rotate-90' : '')} />
                        </button>
                      </div>
                    ) : null}
                    {expanded && task.subtasks?.length ? (
                      <div className="pl-8">
                        <TaskSubtasks
                          task={task}
                          onToggleSubtask={(taskId, subtaskId) => dispatch({ type: 'TOGGLE_TASK_SUBTASK', taskId, subtaskId })}
                          onAddSubtask={(taskId, title) => dispatch({ type: 'ADD_TASK_SUBTASK', taskId, title })}
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 rounded-[14px] border border-[var(--border)] bg-[var(--s2)] px-4 py-3">
              <div className="flex items-center gap-2 text-[12px] text-[var(--t3)]">
                <Flame size={16} strokeWidth={1.5} className="text-[var(--primary)]" />
                Streak: {streak} days →
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-[var(--s3)]">
                <div className="h-full rounded-full bg-[var(--teal)]" style={{ width: `${Math.min(100, (streak / 30) * 100)}%` }} />
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between text-[16px] font-medium text-[var(--t1)]">
              <span>Quick add</span>
              <span className="text-[12px] text-[var(--t3)]">⌘K</span>
            </div>
            <div className="flex h-[44px] items-center gap-2 rounded-[14px] border border-[var(--border-strong)] bg-[var(--s2)] px-3">
              <input
                value={quickTitle}
                onChange={(event) => setQuickTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addQuickTask();
                  }
                }}
                placeholder="Add a task..."
                className="flex-1 bg-transparent text-[13px] text-[var(--t1)] outline-none placeholder:text-[var(--t3)]"
              />
              <select value={quickArea} onChange={(event) => setQuickArea(event.target.value as AreaId)} className="rounded-full bg-[var(--s3)] px-2 py-1 text-[12px] text-[var(--t2)] outline-none">
                {areaOrder.map((area) => <option key={area} value={area}>{getAreaById(area, state.areas)?.name ?? area}</option>)}
              </select>
              <select value={quickPriority} onChange={(event) => setQuickPriority(event.target.value as Priority)} className="rounded-full bg-[var(--s3)] px-2 py-1 text-[12px] text-[var(--t2)] outline-none">
                {priorityOrder.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
              </select>
              <button type="button" onClick={addQuickTask} className="rounded-full bg-[var(--primary)] px-3 py-1 text-[12px] font-medium text-white">
                Add
              </button>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between text-[16px] font-medium text-[var(--t1)]">
              <span>Habits</span>
              <button type="button" onClick={() => navigate('/habits')} className="text-[12px] text-[var(--primary)]">See all →</button>
            </div>
            <div className="space-y-2">
              {todayHabits.map((habit) => (
                <HabitQuickRow
                  key={habit.id}
                  habit={habit}
                  todayLog={getTodayLog(habit)}
                  onLog={(habitId, log) => dispatch({ type: 'LOG_HABIT', habitId, log, date: todayKey })}
                />
              ))}
            </div>
            <div className="text-[12px] text-[var(--t3)]">{habitsLogged} logged today</div>
          </section>
        </div>
      ) : null}

      {tab === 'projects' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[16px] font-medium text-[var(--t1)]">
              Projects <span className="rounded-full bg-[var(--s3)] px-2 py-0.5 text-[11px] text-[var(--t3)]">{projectCount}</span>
            </div>
            <button type="button" onClick={() => setShowAddProject(true)} className="rounded-full bg-[var(--s3)] px-3 py-2 text-[12px] text-[var(--t2)]">
              + New project
            </button>
          </div>
          <div className="space-y-3">
            {state.projects.map((project) => (
              <ProjectCard key={project.id} project={project} onOpen={setSelectedProject} />
            ))}
          </div>
        </div>
      ) : null}

      {tab === 'backlog' ? (
        <div className="space-y-4">
          <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] px-4 py-4" style={{ borderLeft: '2px solid var(--primary)' }}>
            <div className="flex items-start gap-2">
              <span className="text-[var(--primary)]">✨</span>
              <div className="flex-1">
                <div className="text-[13px] italic text-[var(--t2)]">Finance has 0 tasks in 14 days. Score dropped 4 pts. Add one?</div>
                <button type="button" onClick={() => setShowAddTask(true)} className="mt-3 rounded-full bg-[var(--primary)] px-3 py-2 text-[12px] font-medium text-white">
                  Add Finance task
                </button>
              </div>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setFilterArea('all')} className={cn('rounded-full px-3 py-2 text-[12px]', filterArea === 'all' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--s2)] text-[var(--t2)]')}>
                All areas
              </button>
              {areaOrder.map((area) => (
                <button key={area} type="button" onClick={() => setFilterArea(area)} className={cn('rounded-full px-3 py-2 text-[12px]', filterArea === area ? 'bg-[var(--primary)] text-white' : 'bg-[var(--s2)] text-[var(--t2)]')}>
                  {getAreaById(area, state.areas)?.name ?? area}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {sortPills.map((item) => (
                <button key={item.key} type="button" onClick={() => setSortMode(item.key)} className={cn('rounded-full px-3 py-2 text-[12px]', sortMode === item.key ? 'bg-[var(--primary)] text-white' : 'bg-[var(--s2)] text-[var(--t2)]')}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {groupedBacklog.map((group) => {
              const areaData = getAreaById(group.area, state.areas);
              const sortedGroupTasks = [...group.tasks].sort((left, right) => {
                if (sortMode === 'priority') return priorityOrder.indexOf(left.priority) - priorityOrder.indexOf(right.priority);
                if (sortMode === 'dueDate') return (left.dueDate ?? '9999-12-31').localeCompare(right.dueDate ?? '9999-12-31');
                return left.areaId.localeCompare(right.areaId) || left.title.localeCompare(right.title);
              });
              return (
                <div key={group.area} className="space-y-2">
                  <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--t2)]">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: areaData?.color ?? 'var(--primary)' }} />
                    <span>{areaData?.name ?? group.area}</span>
                    <span className="rounded-full bg-[var(--s3)] px-2 py-0.5 text-[11px] text-[var(--t3)]">{sortedGroupTasks.length}</span>
                  </div>
                  <div className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)]">
                    {sortedGroupTasks.map((task) => (
                      <TaskGroupRow key={task.id} task={task} onOpen={setSelectedTask} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <button type="button" onClick={() => setShowAddTask(true)} className="fixed bottom-[82px] right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-white md:bottom-6 md:right-6">
        <Plus size={24} strokeWidth={1.5} />
      </button>

      <AddTaskSheet isOpen={showAddTask} onClose={() => setShowAddTask(false)} mode={tab === 'today' ? 'today' : 'backlog'} />
      <AddProjectSheet isOpen={showAddProject} onClose={() => setShowAddProject(false)} />
      <TaskDetailSheet task={selectedTask} onClose={() => setSelectedTask(null)} />
      <ProjectDetailSheet project={selectedProject} onClose={() => setSelectedProject(null)} />
      <BottomSheet isOpen={showTimeBlockSheet} onClose={() => setShowTimeBlockSheet(false)} title="Add time block">
        <div className="space-y-4 pb-3">
          <label className="block text-[12px] text-[var(--t3)]">
            Title
            <input
              autoFocus
              value={blockTitle}
              onChange={(event) => setBlockTitle(event.target.value)}
              placeholder="Deep work, calls, admin..."
              className="mt-2 h-11 w-full rounded-[12px] border border-[var(--border)] bg-[var(--s2)] px-3 text-[13px] text-[var(--t1)] outline-none"
            />
          </label>

          <label className="block text-[12px] text-[var(--t3)]">
            Link to task (optional)
            <select value={blockTaskId} onChange={(event) => setBlockTaskId(event.target.value)} className="mt-2 h-11 w-full rounded-[12px] border border-[var(--border)] bg-[var(--s2)] px-3 text-[13px] text-[var(--t1)] outline-none">
              <option value="">No linked task</option>
              {sortTasks(activeTasks).map((task) => (
                <option key={task.id} value={task.id}>{task.title}</option>
              ))}
            </select>
          </label>

          {blockTaskId ? (
            <div className="rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-3 py-2 text-[11px] text-[var(--t3)]">
              Auto-fill: task title and estimated duration are applied when available.
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-[12px] text-[var(--t3)]">
              Date
              <input value={blockDate} onChange={(event) => setBlockDate(event.target.value)} type="date" className="mt-2 h-11 w-full rounded-[12px] border border-[var(--border)] bg-[var(--s2)] px-3 text-[13px] text-[var(--t1)] outline-none" />
            </label>
            <label className="block text-[12px] text-[var(--t3)]">
              Repeat template
              <select value={blockRepeat} onChange={(event) => setBlockRepeat(event.target.value as TimeBlockRepeatTemplate)} className="mt-2 h-11 w-full rounded-[12px] border border-[var(--border)] bg-[var(--s2)] px-3 text-[13px] text-[var(--t1)] outline-none">
                <option value="none">Do not repeat</option>
                <option value="daily_7">Daily for 7 days</option>
                <option value="weekdays_2w">Weekdays for 2 weeks</option>
                <option value="weekly_4">Weekly for 4 weeks</option>
              </select>
            </label>
          </div>

          <div className="rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-3 py-2 text-[11px] text-[var(--t3)]">
            {repeatDatesPreview.length} block{repeatDatesPreview.length > 1 ? 's' : ''} will be created.
          </div>

          <label className="flex items-center justify-between rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-3 py-2 text-[12px] text-[var(--t2)]">
            <span>Prevent duplicates</span>
            <input type="checkbox" checked={preventDuplicateBlocks} onChange={(event) => setPreventDuplicateBlocks(event.target.checked)} />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-[12px] text-[var(--t3)]">
              Start
              <input value={blockStart} onChange={(event) => setBlockStart(event.target.value)} type="time" className="mt-2 h-11 w-full rounded-[12px] border border-[var(--border)] bg-[var(--s2)] px-3 text-[13px] text-[var(--t1)] outline-none" />
            </label>
            <label className="block text-[12px] text-[var(--t3)]">
              End
              <input value={blockEnd} onChange={(event) => setBlockEnd(event.target.value)} type="time" className="mt-2 h-11 w-full rounded-[12px] border border-[var(--border)] bg-[var(--s2)] px-3 text-[13px] text-[var(--t1)] outline-none" />
            </label>
          </div>

          <button type="button" onClick={createTimeBlock} className="h-11 w-full rounded-[12px] bg-[var(--primary)] text-[13px] font-medium text-white">
            Save time block
          </button>
        </div>
      </BottomSheet>

      {toast ? (
        <div className="fixed right-4 top-4 z-50 rounded-[12px] border border-[var(--border-strong)] bg-[var(--s2)] px-4 py-3 text-[13px] text-[var(--t1)]">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
