import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type LifeArea = 'Career & Skills' | 'Health & Body' | 'Mind & Learning' | 'Finance' | 'Relationships' | 'Creative';

export type TrackingType = 'binary' | 'duration' | 'count';

export interface TrackingConfig {
  type: TrackingType;
  target?: number;
  unit?: string;
}

export interface TrackingLog {
  date: string;
  value: number;
  note?: string;
}

const getTodayKey = () => new Date().toISOString().slice(0, 10);

export interface Task {
  id: string;
  title: string;
  priority: 'P1' | 'P2' | 'P3';
  area: LifeArea;
  completed: boolean;
  timeEstimate?: number;
  isToday: boolean;
  tracking?: TrackingConfig;
  logs?: TrackingLog[];
}

export type HabitDay = 'done' | 'missed' | 'pending';
export type HabitFrequencyPeriod = 'daily' | 'weekly' | 'custom' | 'none';
export type HabitMode = 'build' | 'quit' | 'progress' | 'simple';

export interface HabitGoal {
  metric?: string;
  startValue?: number;
  targetValue?: number;
  currentValue?: number;
}

export interface Habit {
  id: string;
  name: string;
  area: LifeArea;
  mode?: HabitMode;
  streak: number;
  last7: HabitDay[];
  loggedToday: boolean;
  missReason?: string;
  tracking?: TrackingConfig;
  logs?: TrackingLog[];
  frequencyPeriod?: HabitFrequencyPeriod;
  customFrequencyDays?: number;
  reminderTime?: string;
  goal?: HabitGoal;
}

export interface AreaScore {
  area: LifeArea;
  score: number;
  change: number;
  color: string;
  keyStat: string;
}

export type VaultItemType = 'Quote' | 'Video' | 'Voice Note' | 'Image' | 'Note' | 'Win';

export interface VaultItem {
  id: string;
  type: VaultItemType;
  tag: string;
  tagColor: string;
  content: string;
  daysAgo: number;
}

export type NoteType = 'Topic notes' | 'Book summary' | 'Course notes' | 'Mental model' | 'Reference';

export interface LearnNote {
  id: string;
  title: string;
  type: NoteType;
  area: LifeArea;
  keyPoints: string[];
  source?: string;
  daysAgo: number;
  tasksCreated: number;
  body?: string;
}

export interface PendingResource {
  id: string;
  title: string;
  area: LifeArea;
  daysAgo: number;
  decided: boolean;
}

export interface PastAction {
  id: string;
  title: string;
  area: LifeArea;
  action: string;
  detail?: string;
  daysAgo: number;
}

export type DemoPresetName = 'momentum' | 'slump' | 'recovery';

interface AppState {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  tasks: Task[];
  toggleTask: (id: string) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'last7' | 'loggedToday'>) => void;
  updateHabit: (id: string, updates: Partial<Pick<Habit, 'name' | 'area' | 'mode' | 'missReason' | 'tracking' | 'logs' | 'frequencyPeriod' | 'customFrequencyDays' | 'reminderTime' | 'goal'>>) => void;
  deleteHabit: (id: string) => void;
  logHabit: (id: string) => void;
  setHabitMissReason: (id: string, reason: string) => void;
  recordTaskProgress: (id: string, value: number, note?: string) => void;
  recordHabitProgress: (id: string, value: number, note?: string) => void;
  dayRating: number | null;
  setDayRating: (r: number) => void;
  areaScores: AreaScore[];
  weeklyScore: number;
  userName: string;
  day: number;
  vaultItems: VaultItem[];
  addVaultItem: (item: Omit<VaultItem, 'id'>) => void;
  notes: LearnNote[];
  addNote: (note: Omit<LearnNote, 'id'>) => void;
  updateNoteTaskCount: (id: string) => void;
  pendingResources: PendingResource[];
  decidePendingResource: (id: string) => void;
  applyDemoPreset: (preset: DemoPresetName) => void;
  pastActions: PastAction[];
  pendingResourceCount: number;
  canShowAIMessage: (channel: 'briefing' | 'nudge' | 'pattern', maxPerDay?: number) => boolean;
  trackAIMessage: (channel: 'briefing' | 'nudge' | 'pattern') => void;
  presentationMode: boolean;
  togglePresentationMode: () => void;
}

const AppContext = createContext<AppState | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};

const AREA_COLORS: Record<LifeArea, string> = {
  'Career & Skills': 'var(--area-career)',
  'Health & Body': 'var(--area-health)',
  'Mind & Learning': 'var(--area-mind)',
  'Finance': 'var(--area-finance)',
  'Relationships': 'var(--area-relationships)',
  'Creative': 'var(--area-creative)',
};

const TAG_COLORS: Record<string, string> = {
  'Remember why I started': 'var(--primary)',
  'When I want to quit': 'var(--amber)',
  'When I feel lost': 'var(--area-mind)',
  'When I failed': 'var(--text-muted)',
  'When I feel weak': 'var(--area-relationships)',
  'When I win': 'var(--teal)',
};

const TAG_BG_COLORS: Record<string, string> = {
  'Remember why I started': 'var(--primary-muted-bg)',
  'When I want to quit': 'var(--amber-muted-bg)',
  'When I feel lost': 'rgba(74,144,217,0.12)',
  'When I failed': 'var(--surface-3)',
  'When I feel weak': 'rgba(224,96,126,0.12)',
  'When I win': 'var(--teal-muted-bg)',
};

const initialTasks: Task[] = [
  { id: 't1', title: 'Solve 3 LeetCode problems', priority: 'P1', area: 'Career & Skills', completed: false, timeEstimate: 45, isToday: true },
  { id: 't2', title: 'Push LifeOS dashboard to GitHub', priority: 'P1', area: 'Career & Skills', completed: true, isToday: true },
  { id: 't3', title: 'Record morning journal voice note', priority: 'P2', area: 'Mind & Learning', completed: false, timeEstimate: 15, isToday: true },
];

const initialHabits: Habit[] = [
  { id: 'h1', name: '5:30am workout', area: 'Health & Body', streak: 14, last7: ['done','done','missed','done','done','done','pending'], loggedToday: false },
  { id: 'h2', name: 'LifeOS build daily', area: 'Career & Skills', streak: 23, last7: ['done','done','done','done','done','done','pending'], loggedToday: false },
  { id: 'h3', name: 'Sleep by 11pm', area: 'Mind & Learning', streak: 8, last7: ['done','missed','done','done','done','done','pending'], loggedToday: false },
];

const initialAreas: AreaScore[] = [
  { area: 'Career & Skills', score: 71, change: 8, color: AREA_COLORS['Career & Skills'], keyStat: 'LeetCode 12/15 this week' },
  { area: 'Health & Body', score: 58, change: 0, color: AREA_COLORS['Health & Body'], keyStat: 'Workout 5/7 days' },
  { area: 'Mind & Learning', score: 64, change: 3, color: AREA_COLORS['Mind & Learning'], keyStat: 'Read 4 chapters' },
  { area: 'Finance', score: 45, change: -4, color: AREA_COLORS['Finance'], keyStat: 'No budget review yet' },
  { area: 'Relationships', score: 38, change: -6, color: AREA_COLORS['Relationships'], keyStat: 'No social plans this week' },
  { area: 'Creative', score: 22, change: -8, color: AREA_COLORS['Creative'], keyStat: 'No creative work in 14 days' },
];

const initialVaultItems: VaultItem[] = [
  { id: 'v1', type: 'Quote', tag: 'Remember why I started', tagColor: TAG_COLORS['Remember why I started'], content: 'You started this because you were tired of being average. Don\'t forget that feeling.', daysAgo: 12 },
  { id: 'v2', type: 'Video', tag: 'When I want to quit', tagColor: TAG_COLORS['When I want to quit'], content: 'David Goggins — Stay Hard motivation clip — saved this after missing 4 workouts', daysAgo: 23 },
  { id: 'v3', type: 'Note', tag: 'When I feel lost', tagColor: TAG_COLORS['When I feel lost'], content: 'The plan: Career to 60-80k in 9 months. DSA + projects + LifeOS. One step at a time.', daysAgo: 31 },
  { id: 'v4', type: 'Win', tag: 'When I win', tagColor: TAG_COLORS['When I win'], content: 'Solved my first Hard LeetCode problem. Took 3 hours but I got it.', daysAgo: 8 },
  { id: 'v5', type: 'Quote', tag: 'When I feel weak', tagColor: TAG_COLORS['When I feel weak'], content: 'Discipline is choosing between what you want now and what you want most.', daysAgo: 19 },
  { id: 'v6', type: 'Note', tag: 'When I failed', tagColor: TAG_COLORS['When I failed'], content: 'Failed the mock interview. Froze on a graph problem I knew. Use this feeling.', daysAgo: 44 },
  { id: 'v7', type: 'Win', tag: 'Remember why I started', tagColor: TAG_COLORS['Remember why I started'], content: 'Day 1 — wrote down: I want to be someone I\'m proud of by 23. Still the goal.', daysAgo: 47 },
];

const initialNotes: LearnNote[] = [
  { id: 'n1', title: 'Redis — core concepts', type: 'Topic notes', area: 'Career & Skills', keyPoints: ['In-memory key-value store', 'Supports pub/sub messaging pattern', 'Used for caching and session storage', 'Data persists with RDB/AOF options', 'Single-threaded, very fast'], source: 'redis.io', daysAgo: 3, tasksCreated: 2, body: '# Redis — Core Concepts\n\nRedis is an open-source, in-memory data structure store used as a database, cache, message broker, and streaming engine.\n\n## Key Features\n\n- **In-memory storage**: All data is stored in RAM for ultra-fast access\n- **Data structures**: Supports strings, hashes, lists, sets, sorted sets\n- **Persistence**: Optional durability via RDB snapshots and AOF logs\n\n## Pub/Sub Pattern\n\nRedis supports publish/subscribe messaging:\n\n```\nSUBSCRIBE channel1\nPUBLISH channel1 "hello"\n```\n\n## Use Cases\n\n- Session caching\n- Real-time leaderboards\n- Rate limiting\n- Message queues' },
  { id: 'n2', title: 'Atomic Habits — key takeaways', type: 'Book summary', area: 'Mind & Learning', keyPoints: ['Identity-based habits over outcome-based goals', 'Make it obvious, attractive, easy, satisfying', 'Small 1% improvements compound'], source: 'Book by James Clear', daysAgo: 9, tasksCreated: 0 },
  { id: 'n3', title: 'DSA patterns — sliding window', type: 'Topic notes', area: 'Career & Skills', keyPoints: ['Use when asked for max/min subarray of size k', 'Two pointer variant for variable windows', 'O(n) time complexity'], daysAgo: 14, tasksCreated: 0 },
  { id: 'n4', title: 'Compound interest mental model', type: 'Mental model', area: 'Finance', keyPoints: ['Small consistent gains compound dramatically over 10+ years', 'Rule of 72: divide 72 by rate to get doubling time'], daysAgo: 21, tasksCreated: 0 },
];

const initialPendingResources: PendingResource[] = [
  { id: 'pr1', title: 'Clean Code — Chapter 4 notes', area: 'Career & Skills', daysAgo: 2, decided: false },
  { id: 'pr2', title: 'Meditation for focus — YouTube', area: 'Mind & Learning', daysAgo: 1, decided: false },
  { id: 'pr3', title: 'SIP calculator article', area: 'Finance', daysAgo: 3, decided: false },
];

const initialPastActions: PastAction[] = [
  { id: 'pa1', title: 'Atomic Habits video', area: 'Mind & Learning', action: 'Executed as habit', detail: 'Read 10 pages daily', daysAgo: 9 },
  { id: 'pa2', title: 'System design article', area: 'Career & Skills', action: 'Added to notes', daysAgo: 14 },
  { id: 'pa3', title: 'Motivational clip', area: 'Mind & Learning', action: 'Saved to Vault', daysAgo: 19 },
];

const LIFE_AREAS: LifeArea[] = ['Career & Skills', 'Health & Body', 'Mind & Learning', 'Finance', 'Relationships', 'Creative'];

const STORAGE_KEYS = {
  theme: 'lifeos-theme',
  tasks: 'lifeos-tasks',
  habits: 'lifeos-habits',
  dayRating: 'lifeos-day-rating',
  vaultItems: 'lifeos-vault-items',
  notes: 'lifeos-notes',
  pendingResources: 'lifeos-pending-resources',
  startDate: 'lifeos-start-date',
  aiLog: 'lifeos-ai-log',
  presentationMode: 'lifeos-presentation-mode',
} as const;

const readJSON = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const toPct = (num: number, den: number) => (den > 0 ? (num / den) * 100 : 0);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const createBinaryTracking = (): TrackingConfig => ({ type: 'binary' });

const normalizeTracking = (tracking?: TrackingConfig): TrackingConfig => {
  if (!tracking) return createBinaryTracking();
  const legacy = tracking as TrackingConfig & { maxRating?: number; checklistItems?: string[]; type: string };
  if (legacy.type === 'duration' || legacy.type === 'count' || legacy.type === 'binary') {
    return {
      type: legacy.type,
      target: legacy.target,
      unit: legacy.unit,
    };
  }
  if (legacy.type === 'timer') {
    return {
      type: 'duration',
      target: legacy.target ?? 30,
      unit: legacy.unit || 'min',
    };
  }
  if (legacy.type === 'rating') {
    return {
      type: 'count',
      target: legacy.maxRating ?? legacy.target ?? 5,
      unit: 'points',
    };
  }
  if (legacy.type === 'checklist') {
    return {
      type: 'count',
      target: legacy.checklistItems?.length ?? 3,
      unit: 'steps',
    };
  }
  return createBinaryTracking();
};

const normalizeFrequencyPeriod = (period?: HabitFrequencyPeriod) => {
  if (period === 'weekly' || period === 'custom' || period === 'daily' || period === 'none') return period;
  return 'daily';
};

const normalizeHabitMode = (mode?: HabitMode) => {
  if (mode === 'build' || mode === 'quit' || mode === 'progress' || mode === 'simple') return mode;
  return 'build';
};

const normalizeHabitGoal = (goal?: HabitGoal): HabitGoal | undefined => {
  if (!goal) return undefined;
  return {
    metric: goal.metric,
    startValue: goal.startValue,
    targetValue: goal.targetValue,
    currentValue: goal.currentValue,
  };
};

const toDateKey = (date: Date) => date.toISOString().slice(0, 10);
const dateFromKey = (dateKey: string) => new Date(`${dateKey}T00:00:00.000Z`);
const startOfUtcDay = (date: Date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
const addUtcDays = (date: Date, days: number) => new Date(date.getTime() + (days * MS_PER_DAY));

const getPeriodRange = (period: HabitFrequencyPeriod, customDays = 3, referenceDate = new Date()) => {
  const dayStart = startOfUtcDay(referenceDate);
  if (period === 'daily' || period === 'none') {
    return { start: dayStart, end: addUtcDays(dayStart, 1) };
  }
  if (period === 'weekly') {
    const day = dayStart.getUTCDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    const start = addUtcDays(dayStart, -diffToMonday);
    return { start, end: addUtcDays(start, 7) };
  }

  const safeCustomDays = Math.max(2, customDays);
  const anchor = new Date(Date.UTC(2026, 0, 1));
  const daysSinceAnchor = Math.floor((dayStart.getTime() - anchor.getTime()) / MS_PER_DAY);
  const block = Math.floor(daysSinceAnchor / safeCustomDays);
  const start = addUtcDays(anchor, block * safeCustomDays);
  return { start, end: addUtcDays(start, safeCustomDays) };
};

const getPeriodProgress = (logs: TrackingLog[] = [], period: HabitFrequencyPeriod, customDays = 3, referenceDate = new Date()) => {
  const { start, end } = getPeriodRange(period, customDays, referenceDate);
  const startMs = start.getTime();
  const endMs = end.getTime();
  return logs
    .filter((log) => {
      const logMs = dateFromKey(log.date).getTime();
      return logMs >= startMs && logMs < endMs;
    })
    .reduce((sum, log) => sum + log.value, 0);
};

const getHabitTarget = (habit: Habit) => {
  const mode = normalizeHabitMode(habit.mode);
  if (mode === 'progress') {
    const start = habit.goal?.startValue;
    const target = habit.goal?.targetValue;
    if (typeof start === 'number' && typeof target === 'number' && start !== target) {
      return Math.abs(target - start);
    }
  }
  const tracking = normalizeTracking(habit.tracking);
  return tracking.type === 'binary' ? 1 : Math.max(1, tracking.target ?? 1);
};

const getNormalizedHabit = (habit: Habit): Habit => {
  const tracking = normalizeTracking(habit.tracking);
  const mode = normalizeHabitMode(habit.mode);
  const frequencyPeriod = normalizeFrequencyPeriod(habit.frequencyPeriod);
  const customFrequencyDays = habit.customFrequencyDays ?? 3;
  const logs = habit.logs ?? [];
  const goal = normalizeHabitGoal(habit.goal);
  const dailyProgress = getPeriodProgress(logs, 'daily', customFrequencyDays);
  const target = getHabitTarget({ ...habit, mode, tracking, goal, frequencyPeriod, customFrequencyDays });
  const loggedToday = dailyProgress > 0;

  const last7 = Array.from({ length: 7 }, (_, idx) => {
    const date = addUtcDays(startOfUtcDay(new Date()), idx - 6);
    const progress = getPeriodProgress(logs, 'daily', customFrequencyDays, date);
    const isToday = idx === 6;
    if (frequencyPeriod === 'none') {
      if (progress >= target) return 'done' as const;
      return 'pending' as const;
    }
    if (progress >= target) return 'done' as const;
    if (isToday && progress === 0) return 'pending' as const;
    return progress > 0 ? 'done' as const : 'missed' as const;
  });

  const getIsPeriodComplete = (referenceDate: Date) => {
    const periodProgress = getPeriodProgress(logs, frequencyPeriod, customFrequencyDays, referenceDate);
    return periodProgress >= target;
  };

  let streak = 0;
  if (frequencyPeriod !== 'none') {
    let cursor = startOfUtcDay(new Date());
    for (let i = 0; i < 24; i += 1) {
      if (!getIsPeriodComplete(cursor)) break;
      streak += 1;
      if (frequencyPeriod === 'daily') cursor = addUtcDays(cursor, -1);
      if (frequencyPeriod === 'weekly') cursor = addUtcDays(cursor, -7);
      if (frequencyPeriod === 'custom') cursor = addUtcDays(cursor, -(Math.max(2, customFrequencyDays)));
    }
  }

  return {
    ...habit,
    mode,
    tracking,
    logs,
    goal,
    frequencyPeriod,
    customFrequencyDays,
    loggedToday,
    last7,
    streak,
  };
};

const normalizeTask = (task: Task): Task => ({
  ...task,
  tracking: normalizeTracking(task.tracking),
  logs: task.logs ?? [],
});

const getTrackingTarget = (tracking?: TrackingConfig) => {
  const safeTracking = normalizeTracking(tracking);
  if (safeTracking.type === 'binary') return 1;
  return Math.max(1, safeTracking.target ?? 1);
};

const isTrackingComplete = (tracking: TrackingConfig, value: number) => {
  if (tracking.type === 'binary') return value > 0;
  return value >= getTrackingTarget(tracking);
};

const getLatestTrackingProgress = (tracking?: TrackingConfig, logs?: TrackingLog[], fallbackProgress = 0) => {
  if (!tracking || tracking.type === 'binary') return fallbackProgress;
  const latest = logs?.[logs.length - 1];
  if (!latest) return fallbackProgress;
  const target = getTrackingTarget(tracking);
  return clamp((latest.value / target) * 100, 0, 100);
};

const getTaskProgress = (task: Task) => {
  const tracking = normalizeTracking(task.tracking);
  if (tracking.type === 'binary') return task.completed ? 100 : 0;
  return getLatestTrackingProgress(tracking, task.logs, task.completed ? 100 : 0);
};

const getHabitProgress = (habit: Habit) => {
  const normalized = getNormalizedHabit(habit);
  if (normalized.mode === 'progress') {
    const start = normalized.goal?.startValue;
    const target = normalized.goal?.targetValue;
    const current = normalized.goal?.currentValue;
    if (typeof start === 'number' && typeof target === 'number' && typeof current === 'number' && start !== target) {
      return clamp(Math.abs(((current - start) / (target - start)) * 100), 0, 100);
    }
  }
  if (normalized.frequencyPeriod === 'none') {
    const target = getHabitTarget(normalized);
    const latest = normalized.logs?.[normalized.logs.length - 1]?.value ?? 0;
    return clamp(toPct(latest, target), 0, 100);
  }
  const target = getHabitTarget(normalized);
  const periodProgress = getPeriodProgress(
    normalized.logs,
    normalized.frequencyPeriod ?? 'daily',
    normalized.customFrequencyDays ?? 3,
  );
  return clamp(toPct(periodProgress, target), 0, 100);
};

const computeAreaScores = (tasks: Task[], habits: Habit[]): AreaScore[] => {
  return LIFE_AREAS.map((area) => {
    const areaTasks = tasks.filter((task) => task.area === area);
    const taskRate = areaTasks.length > 0
      ? Math.round(areaTasks.reduce((acc, task) => acc + getTaskProgress(task), 0) / areaTasks.length)
      : 0;

    const areaHabits = habits.filter((habit) => habit.area === area);
    const habitRate = areaHabits.length > 0
      ? Math.round(areaHabits.reduce((acc, habit) => acc + getHabitProgress(habit), 0) / areaHabits.length)
      : 0;

    const consistencySignal = areaHabits.length > 0
      ? toPct(areaHabits.reduce((acc, habit) => acc + clamp(habit.streak, 0, 30), 0), areaHabits.length * 30)
      : taskRate;

    const score = Math.round((habitRate * 0.4) + (taskRate * 0.35) + (consistencySignal * 0.25));
    const normalizedScore = clamp(score, 0, 100);

    let keyStat = 'No activity yet';
    if (areaHabits.length > 0) {
      const loggedToday = areaHabits.filter((habit) => habit.loggedToday).length;
      const trackedHabits = areaHabits.filter((habit) => (habit.tracking?.type ?? 'binary') !== 'binary').length;
      keyStat = trackedHabits > 0
        ? `${loggedToday}/${areaHabits.length} habits active, ${trackedHabits} tracked`
        : `Habits logged ${loggedToday}/${areaHabits.length} today`;
    } else if (areaTasks.length > 0) {
      const trackedTasks = areaTasks.filter((task) => (task.tracking?.type ?? 'binary') !== 'binary').length;
      const completedTasks = areaTasks.filter((task) => task.completed).length;
      keyStat = trackedTasks > 0
        ? `${completedTasks}/${areaTasks.length} tasks done, ${trackedTasks} tracked`
        : `${completedTasks}/${areaTasks.length} tasks completed`;
    }

    return {
      area,
      score: normalizedScore,
      change: 0,
      color: AREA_COLORS[area],
      keyStat,
    };
  });
};

const cloneTasks = (items: Task[]) => items.map((task) => ({ ...task }));
const cloneHabits = (items: Habit[]) => items.map((habit) => ({ ...habit, last7: [...habit.last7] }));
const clonePendingResources = (items: PendingResource[]) => items.map((resource) => ({ ...resource }));

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.theme);
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });
  const [tasks, setTasks] = useState<Task[]>(() => readJSON<Task[]>(STORAGE_KEYS.tasks, initialTasks).map(normalizeTask));
  const [habits, setHabits] = useState<Habit[]>(() => readJSON<Habit[]>(STORAGE_KEYS.habits, initialHabits).map(getNormalizedHabit));
  const [dayRating, setDayRating] = useState<number | null>(() => readJSON<number | null>(STORAGE_KEYS.dayRating, null));
  const [vaultItems, setVaultItems] = useState<VaultItem[]>(() => readJSON<VaultItem[]>(STORAGE_KEYS.vaultItems, initialVaultItems));
  const [notes, setNotes] = useState<LearnNote[]>(() => readJSON<LearnNote[]>(STORAGE_KEYS.notes, initialNotes));
  const [pendingResources, setPendingResources] = useState<PendingResource[]>(() => readJSON<PendingResource[]>(STORAGE_KEYS.pendingResources, initialPendingResources));
  const [startDate] = useState<string>(() => {
    const existing = localStorage.getItem(STORAGE_KEYS.startDate);
    if (existing) return existing;
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(STORAGE_KEYS.startDate, today);
    return today;
  });
  const [aiLog, setAiLog] = useState<Record<string, number>>(() => readJSON<Record<string, number>>(STORAGE_KEYS.aiLog, {}));
  const [presentationMode, setPresentationMode] = useState<boolean>(() => readJSON<boolean>(STORAGE_KEYS.presentationMode, false));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.dayRating, JSON.stringify(dayRating));
  }, [dayRating]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.vaultItems, JSON.stringify(vaultItems));
  }, [vaultItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.pendingResources, JSON.stringify(pendingResources));
  }, [pendingResources]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.aiLog, JSON.stringify(aiLog));
  }, [aiLog]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.presentationMode, JSON.stringify(presentationMode));
  }, [presentationMode]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  const toggleTask = (id: string) => setTasks(ts => ts.map(t => t.id === id ? { ...t, completed: !t.completed } : t));

  const addTask = (task: Omit<Task, 'id'>) => {
    setTasks(ts => [...ts, normalizeTask({ ...task, id: `t${Date.now()}` })]);
  };

  const deleteTask = (id: string) => setTasks(ts => ts.filter(t => t.id !== id));

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(ts => ts.map(t => t.id === id ? normalizeTask({ ...t, ...updates }) : t));
  };

  const recordTaskProgress = (id: string, value: number, note?: string) => {
    setTasks(ts => ts.map(task => {
      if (task.id !== id) return task;
      const tracking = normalizeTracking(task.tracking);
      const logs = [...(task.logs ?? []), { date: getTodayKey(), value, note }];
      const meetsTarget = isTrackingComplete(tracking, value);
      return normalizeTask({
        ...task,
        logs,
        completed: meetsTarget,
      });
    }));
  };

  const logHabit = (id: string) => {
    setHabits((hs) => hs.map((habit) => {
      if (habit.id !== id) return habit;
      const target = getHabitTarget(habit);
      const tracking = normalizeTracking(habit.tracking);
      const value = tracking.type === 'binary' ? 1 : target;
      const next = { ...habit, logs: [...(habit.logs ?? []), { date: getTodayKey(), value }] };
      return getNormalizedHabit(next);
    }));
  };

  const addHabit = (habit: Omit<Habit, 'id' | 'streak' | 'last7' | 'loggedToday'>) => {
    setHabits(hs => [
      getNormalizedHabit({
        id: `h${Date.now()}`,
        name: habit.name.trim(),
        area: habit.area,
        mode: normalizeHabitMode(habit.mode),
        streak: 0,
        last7: ['pending', 'pending', 'pending', 'pending', 'pending', 'pending', 'pending'],
        loggedToday: false,
        tracking: normalizeTracking(habit.tracking),
        logs: habit.logs ?? [],
        frequencyPeriod: habit.frequencyPeriod ?? 'daily',
        customFrequencyDays: habit.customFrequencyDays ?? 3,
        reminderTime: habit.reminderTime,
        goal: normalizeHabitGoal(habit.goal),
      }),
      ...hs,
    ]);
  };

  const updateHabit = (id: string, updates: Partial<Pick<Habit, 'name' | 'area' | 'mode' | 'missReason' | 'tracking' | 'logs' | 'frequencyPeriod' | 'customFrequencyDays' | 'reminderTime' | 'goal'>>) => {
    setHabits(hs => hs.map(h => h.id === id ? getNormalizedHabit({
      ...h,
      ...updates,
      mode: normalizeHabitMode(updates.mode ?? h.mode),
      tracking: normalizeTracking(updates.tracking ?? h.tracking),
      goal: normalizeHabitGoal(updates.goal ?? h.goal),
    }) : h));
  };

  const recordHabitProgress = (id: string, value: number, note?: string) => {
    setHabits(hs => hs.map(habit => {
      if (habit.id !== id) return habit;
      const tracking = normalizeTracking(habit.tracking);
      const logs = [...(habit.logs ?? []), { date: getTodayKey(), value, note }];
      const next = {
        ...habit,
        tracking,
        logs,
        goal: habit.mode === 'progress' ? { ...habit.goal, currentValue: value } : habit.goal,
      };
      return getNormalizedHabit(next);
    }));
  };

  const deleteHabit = (id: string) => {
    setHabits(hs => hs.filter(h => h.id !== id));
  };

  const setHabitMissReason = (id: string, reason: string) => {
    setHabits(hs => hs.map(h => h.id === id ? { ...h, missReason: reason } : h));
  };

  const addVaultItem = (item: Omit<VaultItem, 'id'>) => {
    setVaultItems(vs => [{ ...item, id: `v${Date.now()}` }, ...vs]);
  };

  const addNote = (note: Omit<LearnNote, 'id'>) => {
    setNotes(ns => [{ ...note, id: `n${Date.now()}` }, ...ns]);
  };

  const updateNoteTaskCount = (id: string) => {
    setNotes(ns => ns.map(n => n.id === id ? { ...n, tasksCreated: n.tasksCreated + 1 } : n));
  };

  const decidePendingResource = (id: string) => {
    setPendingResources(prs => prs.map(pr => pr.id === id ? { ...pr, decided: true } : pr));
  };

  const applyDemoPreset = (preset: DemoPresetName) => {
    if (preset === 'momentum') {
      setTasks(cloneTasks([
        { id: 'dm1', title: 'Complete DSA daily set', priority: 'P1', area: 'Career & Skills', completed: true, timeEstimate: 50, isToday: true },
        { id: 'dm2', title: 'Ship feature polish pass', priority: 'P1', area: 'Career & Skills', completed: true, timeEstimate: 60, isToday: true },
        { id: 'dm3', title: 'Call family in evening', priority: 'P2', area: 'Relationships', completed: true, timeEstimate: 20, isToday: true },
        { id: 'dm4', title: 'Review monthly budget', priority: 'P2', area: 'Finance', completed: false, timeEstimate: 25, isToday: false },
        { id: 'dm5', title: 'Draft one UI concept sketch', priority: 'P3', area: 'Creative', completed: true, timeEstimate: 30, isToday: true },
      ]));
      setHabits(cloneHabits([
        { id: 'dh1', name: '5:30am workout', area: 'Health & Body', streak: 26, last7: ['done', 'done', 'done', 'done', 'done', 'done', 'done'], loggedToday: true },
        { id: 'dh2', name: 'LifeOS build daily', area: 'Career & Skills', streak: 31, last7: ['done', 'done', 'done', 'done', 'done', 'done', 'done'], loggedToday: true },
        { id: 'dh3', name: 'Sleep by 11pm', area: 'Mind & Learning', streak: 18, last7: ['done', 'done', 'done', 'missed', 'done', 'done', 'done'], loggedToday: true },
        { id: 'dh4', name: '20 minutes creative output', area: 'Creative', streak: 12, last7: ['done', 'done', 'done', 'done', 'missed', 'done', 'done'], loggedToday: true },
      ]));
      setDayRating(4);
      setPendingResources(clonePendingResources([
        { id: 'dpr1', title: 'System design note', area: 'Career & Skills', daysAgo: 0, decided: true },
      ]));
    }

    if (preset === 'slump') {
      setTasks(cloneTasks([
        { id: 'ds1', title: 'Solve 2 LeetCode problems', priority: 'P1', area: 'Career & Skills', completed: false, timeEstimate: 45, isToday: true },
        { id: 'ds2', title: 'Workout session', priority: 'P1', area: 'Health & Body', completed: false, timeEstimate: 35, isToday: true },
        { id: 'ds3', title: 'Message one close friend', priority: 'P2', area: 'Relationships', completed: false, timeEstimate: 10, isToday: true },
        { id: 'ds4', title: 'Review expenses', priority: 'P2', area: 'Finance', completed: false, timeEstimate: 20, isToday: false },
        { id: 'ds5', title: 'Write 4 lines for project idea', priority: 'P3', area: 'Creative', completed: false, timeEstimate: 12, isToday: true },
      ]));
      setHabits(cloneHabits([
        { id: 'dhs1', name: '5:30am workout', area: 'Health & Body', streak: 1, last7: ['missed', 'missed', 'done', 'missed', 'missed', 'missed', 'pending'], loggedToday: false },
        { id: 'dhs2', name: 'LifeOS build daily', area: 'Career & Skills', streak: 2, last7: ['done', 'missed', 'missed', 'missed', 'done', 'missed', 'pending'], loggedToday: false },
        { id: 'dhs3', name: 'Sleep by 11pm', area: 'Mind & Learning', streak: 0, last7: ['missed', 'missed', 'missed', 'done', 'missed', 'missed', 'pending'], loggedToday: false },
        { id: 'dhs4', name: '20 minutes creative output', area: 'Creative', streak: 0, last7: ['missed', 'missed', 'missed', 'missed', 'done', 'missed', 'pending'], loggedToday: false },
      ]));
      setDayRating(2);
      setPendingResources(clonePendingResources([
        { id: 'dprs1', title: 'Clean Code chapter', area: 'Career & Skills', daysAgo: 3, decided: false },
        { id: 'dprs2', title: 'Finance planning article', area: 'Finance', daysAgo: 4, decided: false },
        { id: 'dprs3', title: 'Meditation clip', area: 'Mind & Learning', daysAgo: 2, decided: false },
      ]));
    }

    if (preset === 'recovery') {
      setTasks(cloneTasks([
        { id: 'dr1', title: 'Solve one LeetCode problem', priority: 'P1', area: 'Career & Skills', completed: true, timeEstimate: 35, isToday: true },
        { id: 'dr2', title: '20 minute walk', priority: 'P2', area: 'Health & Body', completed: true, timeEstimate: 20, isToday: true },
        { id: 'dr3', title: 'Message sibling', priority: 'P2', area: 'Relationships', completed: false, timeEstimate: 10, isToday: true },
        { id: 'dr4', title: 'Budget check-in', priority: 'P3', area: 'Finance', completed: false, timeEstimate: 15, isToday: false },
        { id: 'dr5', title: 'Sketch one screen variation', priority: 'P3', area: 'Creative', completed: false, timeEstimate: 20, isToday: true },
      ]));
      setHabits(cloneHabits([
        { id: 'dhr1', name: '5:30am workout', area: 'Health & Body', streak: 4, last7: ['missed', 'missed', 'done', 'done', 'done', 'done', 'pending'], loggedToday: false },
        { id: 'dhr2', name: 'LifeOS build daily', area: 'Career & Skills', streak: 6, last7: ['done', 'missed', 'done', 'done', 'done', 'done', 'pending'], loggedToday: false },
        { id: 'dhr3', name: 'Sleep by 11pm', area: 'Mind & Learning', streak: 3, last7: ['missed', 'done', 'missed', 'done', 'done', 'done', 'pending'], loggedToday: false },
        { id: 'dhr4', name: '20 minutes creative output', area: 'Creative', streak: 2, last7: ['missed', 'done', 'missed', 'done', 'done', 'missed', 'pending'], loggedToday: false },
      ]));
      setDayRating(3);
      setPendingResources(clonePendingResources([
        { id: 'dprr1', title: 'Atomic habits notes', area: 'Mind & Learning', daysAgo: 1, decided: false },
      ]));
    }

    setAiLog({});
  };

  const areaScores = computeAreaScores(tasks, habits);
  const weeklyScore = Math.round(areaScores.reduce((acc, area) => acc + area.score, 0) / areaScores.length);

  const start = new Date(startDate);
  const now = new Date();
  const day = Math.max(1, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  const getAIKey = (channel: 'briefing' | 'nudge' | 'pattern') => `${new Date().toISOString().slice(0, 10)}:${channel}`;

  const canShowAIMessage = (channel: 'briefing' | 'nudge' | 'pattern', maxPerDay = 3) => {
    const current = aiLog[getAIKey(channel)] ?? 0;
    return current < maxPerDay;
  };

  const trackAIMessage = (channel: 'briefing' | 'nudge' | 'pattern') => {
    const key = getAIKey(channel);
    setAiLog((prev) => ({
      ...prev,
      [key]: (prev[key] ?? 0) + 1,
    }));
  };

  const pendingResourceCount = pendingResources.filter(pr => !pr.decided).length;

  const togglePresentationMode = () => setPresentationMode(p => !p);

  return (
    <AppContext.Provider value={{
      theme, toggleTheme,
      tasks, toggleTask, addTask, deleteTask, updateTask,
      habits, addHabit, updateHabit, deleteHabit, logHabit, setHabitMissReason, recordTaskProgress, recordHabitProgress,
      dayRating, setDayRating,
      areaScores,
      weeklyScore,
      userName: 'Arjun Mehta',
      day,
      vaultItems, addVaultItem,
      notes, addNote, updateNoteTaskCount,
      pendingResources, decidePendingResource, applyDemoPreset,
      pastActions: initialPastActions,
      pendingResourceCount,
      canShowAIMessage,
      trackAIMessage,
      presentationMode,
      togglePresentationMode,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export { AREA_COLORS, TAG_COLORS, TAG_BG_COLORS };
