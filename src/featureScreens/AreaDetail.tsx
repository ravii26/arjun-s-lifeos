import * as React from 'react';
import { ArrowLeft, Calendar, Lock, Plus, Sparkles } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/context/appState';
import { BottomSheet } from '@/components/BottomSheet';
import { TaskCard } from '@/components/TaskCard';
import { HabitQuickRow } from '@/components/HabitQuickRow';
import { cn } from '@/lib/utils';
import { getAreaById, getTodayLog, isoDate } from '@/lib/lifeos';
import type { AreaId, Note, Priority, Task } from '@/types';

const defaultGoals: Record<AreaId, string> = {
  career: 'Switch to ₹60-80k role in 9 months',
  health: 'Build a healthy body with daily training',
  mind: 'Grow clarity and depth every week',
  finance: 'Build reliable savings and control expenses',
  relationships: 'Show up consistently for important people',
  creative: 'Ship one creative piece every month',
};

const areaInsights: Record<AreaId, string> = {
  career: 'Your task completion in Career dropped when content consumption exceeded 3 items in a day. You may be in a passive learning loop.',
  health: 'Your workout habit has a strong correlation with your sleep score. Miss sleep, miss workout.',
  mind: 'Your Mind score improves on weeks you finish a course lesson.',
  finance: 'No Finance tasks in 14 days. This area will continue declining without a single weekly action.',
  relationships: 'This is your most neglected area. A 5-minute text counts as a real action.',
  creative: 'Creative is at 22 - your lowest. Even 20 minutes of creative work shifts the score.',
};

const trendByArea: Record<AreaId, number[]> = {
  career: [55, 61, 63, 71],
  health: [49, 53, 56, 58],
  mind: [52, 58, 61, 64],
  finance: [54, 51, 49, 45],
  relationships: [46, 43, 41, 38],
  creative: [35, 30, 26, 22],
};

function clampScore(score: number) {
  return Math.max(0, Math.min(100, score));
}

function scoreTone(score: number) {
  if (score >= 65) return 'var(--teal)';
  if (score >= 35) return 'var(--amber)';
  return 'var(--t3)';
}

function ProgressRow({ label, pct, weight }: { label: string; pct: number; weight: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-[120px] text-[12px] text-[var(--t3)]">{label}</div>
      <div className="h-[6px] flex-1 rounded-full bg-[var(--s3)]">
        <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${pct}%` }} />
      </div>
      <div className="w-[44px] text-right text-[12px] text-[var(--t2)]">{pct}%</div>
      <div className="w-[92px] text-right text-[12px] text-[var(--t3)]">({weight}% of score)</div>
    </div>
  );
}

function AddTaskSheet({
  isOpen,
  onClose,
  areaId,
}: {
  isOpen: boolean;
  onClose: () => void;
  areaId: AreaId;
}) {
  const { dispatch } = useApp();
  const [title, setTitle] = React.useState('');
  const [priority, setPriority] = React.useState<Priority>('P2');
  const [dueDate, setDueDate] = React.useState('');

  React.useEffect(() => {
    if (!isOpen) return;
    setTitle('');
    setPriority('P2');
    setDueDate('');
  }, [isOpen]);

  const addTask = () => {
    if (!title.trim()) return;
    dispatch({
      type: 'ADD_TASK',
      task: {
        id: `task-${Date.now()}`,
        title: title.trim(),
        status: 'todo',
        priority,
        areaId,
        dueDate: dueDate || undefined,
        createdAt: new Date().toISOString(),
      },
    });
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Add task">
      <div className="space-y-3 pb-3">
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Task title" className="h-10 w-full rounded-[10px] bg-[var(--s3)] px-3 text-[14px] outline-none" />
        <div className="flex gap-2">
          {(['P1', 'P2', 'P3'] as Priority[]).map((item) => (
            <button key={item} type="button" onClick={() => setPriority(item)} className={cn('rounded-full px-3 py-1 text-[12px]', priority === item ? 'bg-[var(--primary)] text-white' : 'bg-[var(--s3)] text-[var(--t2)]')}>
              {item}
            </button>
          ))}
        </div>
        <label className="block text-[12px] text-[var(--t3)]">
          Due date
          <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="mt-2 h-10 w-full rounded-[10px] bg-[var(--s3)] px-3 text-[14px] outline-none" />
        </label>
        <button type="button" onClick={addTask} className="h-10 w-full rounded-[10px] bg-[var(--primary)] text-[13px] font-medium text-white">Add task</button>
      </div>
    </BottomSheet>
  );
}

function AddNoteSheet({ isOpen, onClose, areaId }: { isOpen: boolean; onClose: () => void; areaId: AreaId }) {
  const { dispatch } = useApp();
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');

  React.useEffect(() => {
    if (!isOpen) return;
    setTitle('');
    setBody('');
  }, [isOpen]);

  const addNote = () => {
    if (!title.trim() || !body.trim()) return;
    const note: Note = {
      id: `note-${Date.now()}`,
      title: title.trim(),
      areaId,
      topicIds: [],
      type: 'reference',
      body: body.trim(),
      keyPoints: body.split('.').map((line) => line.trim()).filter(Boolean).slice(0, 3),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_NOTE', note });
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Add note">
      <div className="space-y-3 pb-3">
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Note title" className="h-10 w-full rounded-[10px] bg-[var(--s3)] px-3 text-[14px] outline-none" />
        <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={5} placeholder="Capture insight" className="w-full rounded-[10px] bg-[var(--s3)] p-3 text-[14px] outline-none" />
        <button type="button" onClick={addNote} className="h-10 w-full rounded-[10px] bg-[var(--primary)] text-[13px] font-medium text-white">Add note</button>
      </div>
    </BottomSheet>
  );
}

export function AreaDetail() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const { id } = useParams();
  const areaId = id as AreaId | undefined;
  const area = areaId ? getAreaById(areaId, state.areas) : undefined;
  const [goal, setGoal] = React.useState('');
  const [editingGoal, setEditingGoal] = React.useState(false);
  const [phase, setPhase] = React.useState<'Building' | 'Exploring' | 'Maintaining' | 'Recovering'>('Building');
  const [showAddTask, setShowAddTask] = React.useState(false);
  const [showAddNote, setShowAddNote] = React.useState(false);
  const [selectedNoteId, setSelectedNoteId] = React.useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!area) return;
    setGoal(defaultGoals[area.id]);
  }, [area]);

  if (!area || !areaId) {
    return (
      <div className="space-y-4 pb-6">
        <button type="button" onClick={() => navigate(-1)} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--s2)] text-[var(--t1)]">
          <ArrowLeft size={18} strokeWidth={1.5} />
        </button>
        <div className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-5 text-[14px] text-[var(--t2)]">Area not found</div>
      </div>
    );
  }

  const areaTasks = state.tasks.filter((task) => task.areaId === area.id);
  const areaHabits = state.habits.filter((habit) => habit.areaId === area.id);
  const areaNotes = state.notes.filter((note) => note.areaId === area.id);
  const today = isoDate(new Date());
  const sortedTasks = [...areaTasks].sort((left, right) => {
    const rank = (task: Task) => {
      if (task.status === 'done') return 2;
      if (task.dueDate === today) return 0;
      return 1;
    };
    return rank(left) - rank(right);
  });

  const score = clampScore(area.score);
  const delta = area.scoreDelta;
  const ringRadius = 60;
  const circumference = 2 * Math.PI * ringRadius;
  const progress = (score / 100) * circumference;

  const trend = trendByArea[area.id];
  const chartW = 560;
  const chartH = 140;
  const padTop = 20;
  const padBottom = 30;
  const padLeft = 35;
  const padRight = 20;
  const plotW = chartW - padLeft - padRight;
  const plotH = chartH - padTop - padBottom;
  const points = trend.map((value, index) => {
    const x = padLeft + (index / (trend.length - 1)) * plotW;
    const y = padTop + (1 - value / 100) * plotH;
    return { x, y, value, week: `W${index + 4}` };
  });
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const selectedNote = selectedNoteId ? areaNotes.find((note) => note.id === selectedNoteId) : null;

  const saveGoal = () => setEditingGoal(false);

  return (
    <div className="space-y-6 pb-8">
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate(-1)} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--s2)] text-[var(--t1)]">
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[16px] font-medium text-white" style={{ backgroundColor: area.color }}>
            {area.name.charAt(0)}
          </div>
          <h1 className="text-[20px] font-medium text-[var(--t1)]">{area.name}</h1>
        </div>

        {editingGoal ? (
          <input
            autoFocus
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            onBlur={saveGoal}
            onKeyDown={(event) => event.key === 'Enter' && saveGoal()}
            className="w-full border-0 border-b border-[var(--border-md)] bg-transparent pb-2 text-[18px] text-[var(--t2)] outline-none"
          />
        ) : (
          <button type="button" onClick={() => setEditingGoal(true)} className="text-left text-[14px] text-[var(--t2)]">{goal}</button>
        )}

        <div className="flex flex-wrap gap-1 rounded-[14px] bg-[var(--s3)] p-1">
          {(['Building', 'Exploring', 'Maintaining', 'Recovering'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setPhase(item)}
              className={cn('rounded-[14px] px-3 py-2 text-[12px]', phase === item ? 'bg-[var(--primary)] text-white' : 'text-[var(--t3)]')}
            >
              {item}
            </button>
          ))}
        </div>
      </header>

      <section className="flex flex-col items-center justify-center">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={ringRadius} fill="none" stroke="var(--s3)" strokeWidth="10" />
          <circle
            cx="70"
            cy="70"
            r={ringRadius}
            fill="none"
            stroke={scoreTone(score)}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            transform="rotate(-90 70 70)"
          />
          <text x="70" y="70" textAnchor="middle" dominantBaseline="central" fontSize="36" fill={scoreTone(score)}>
            {score}
          </text>
        </svg>
        <div className="mt-2 text-[13px]" style={{ color: delta >= 0 ? 'var(--teal)' : 'var(--amber)' }}>
          {delta >= 0 ? '+' : ''}{delta} points this week
        </div>
      </section>

      <section className="space-y-3">
        <ProgressRow label="Habit completion" pct={78} weight={40} />
        <ProgressRow label="Task completion" pct={65} weight={35} />
        <ProgressRow label="Consistency" pct={68} weight={25} />
      </section>

      <section className="rounded-[14px] bg-[var(--s2)] p-5">
        <div className="mb-3 text-[16px] font-medium text-[var(--t1)]">4-week trend</div>
        <div className="relative">
          <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`}>
            {[0, 50, 100].map((yMark) => {
              const y = padTop + (1 - yMark / 100) * plotH;
              return (
                <g key={yMark}>
                  <line x1={padLeft} y1={y} x2={chartW - padRight} y2={y} stroke="var(--border)" strokeWidth="1" />
                  <text x={padLeft - 6} y={y + 3} textAnchor="end" fontSize="11" fill="var(--t3)">{yMark}</text>
                </g>
              );
            })}
            <path d={path} fill="none" stroke={area.color} strokeWidth="2" />
            {points.map((point, index) => (
              <g key={point.week}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill={area.color}
                  stroke="white"
                  strokeWidth="2"
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onClick={() => setHoveredPoint(index)}
                />
                <text x={point.x} y={chartH - 8} textAnchor="middle" fontSize="12" fill="var(--t3)">{point.week}</text>
              </g>
            ))}
          </svg>
          {hoveredPoint !== null ? (
            <div className="absolute rounded-[8px] bg-[var(--s1)] px-2 py-1 text-[11px] text-[var(--t1)]" style={{ left: `${(points[hoveredPoint].x / chartW) * 100}%`, top: `${(points[hoveredPoint].y / chartH) * 100}%`, transform: 'translate(-10%, -130%)' }}>
              {points[hoveredPoint].week}: {points[hoveredPoint].value}
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[16px] font-medium text-[var(--t1)]">
            Habits
            <span className="rounded-full bg-[var(--s3)] px-2 py-0.5 text-[11px] text-[var(--t3)]">{areaHabits.length}</span>
          </div>
          <button type="button" onClick={() => navigate(`/habits/new?area=${area.id}`)} className="inline-flex items-center gap-1 rounded-full bg-[var(--s3)] px-3 py-1 text-[12px] text-[var(--t2)]">
            <Plus size={12} strokeWidth={1.5} /> Add habit
          </button>
        </div>
        <div className="space-y-2">
          {areaHabits.map((habit) => (
            <HabitQuickRow key={habit.id} habit={habit} todayLog={getTodayLog(habit)} onLog={(habitId, log) => dispatch({ type: 'LOG_HABIT', habitId, log, date: today })} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[16px] font-medium text-[var(--t1)]">
            Tasks
            <span className="rounded-full bg-[var(--s3)] px-2 py-0.5 text-[11px] text-[var(--t3)]">{areaTasks.length}</span>
          </div>
          <button type="button" onClick={() => setShowAddTask(true)} className="inline-flex items-center gap-1 rounded-full bg-[var(--s3)] px-3 py-1 text-[12px] text-[var(--t2)]">
            <Plus size={12} strokeWidth={1.5} /> Add task
          </button>
        </div>
        <div className="space-y-2">
          {sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              areaColor={area.color}
              areaName={area.name}
              onToggle={(taskId) => dispatch({ type: 'TOGGLE_TASK_STATUS', taskId })}
              onEdit={(item) => dispatch({ type: 'UPDATE_TASK', taskId: item.id, updates: {} })}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[16px] font-medium text-[var(--t1)]">
            Notes
            <span className="rounded-full bg-[var(--s3)] px-2 py-0.5 text-[11px] text-[var(--t3)]">{areaNotes.length}</span>
          </div>
          <button type="button" onClick={() => setShowAddNote(true)} className="inline-flex items-center gap-1 rounded-full bg-[var(--s3)] px-3 py-1 text-[12px] text-[var(--t2)]">
            <Plus size={12} strokeWidth={1.5} /> Note
          </button>
        </div>
        <div className="space-y-2">
          {areaNotes.map((note) => (
            <button key={note.id} type="button" onClick={() => setSelectedNoteId(note.id)} className="w-full rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4 text-left">
              <div className="text-[14px] font-medium text-[var(--t1)]">{note.title}</div>
              <div className="mt-1 text-[12px] text-[var(--t3)]">{note.body}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-4" style={{ borderLeft: '3px solid var(--primary)' }}>
        <div className="mb-2 flex items-center gap-2 text-[12px] text-[var(--primary)]">
          <Sparkles size={16} strokeWidth={1.5} />
          AI observation
        </div>
        <div className="text-[13px] italic text-[var(--t2)]">{areaInsights[area.id]}</div>
      </section>

      <AddTaskSheet isOpen={showAddTask} onClose={() => setShowAddTask(false)} areaId={area.id} />
      <AddNoteSheet isOpen={showAddNote} onClose={() => setShowAddNote(false)} areaId={area.id} />

      <BottomSheet isOpen={Boolean(selectedNote)} onClose={() => setSelectedNoteId(null)} title={selectedNote?.title}>
        <div className="space-y-3 pb-3">
          <div className="text-[13px] text-[var(--t2)]">{selectedNote?.body}</div>
          <div className="text-[12px] text-[var(--t3)]">Created {selectedNote?.createdAt?.slice(0, 10)}</div>
        </div>
      </BottomSheet>
    </div>
  );
}

export default AreaDetail;
