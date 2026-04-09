import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type LifeArea = 'Career & Skills' | 'Health & Body' | 'Mind & Learning' | 'Finance' | 'Relationships' | 'Creative';

export interface Task {
  id: string;
  title: string;
  priority: 'P1' | 'P2' | 'P3';
  area: LifeArea;
  completed: boolean;
  timeEstimate?: number;
  isToday: boolean;
}

export type HabitDay = 'done' | 'missed' | 'pending';

export interface Habit {
  id: string;
  name: string;
  area: LifeArea;
  streak: number;
  last7: HabitDay[];
  loggedToday: boolean;
  missReason?: string;
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

interface AppState {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  tasks: Task[];
  toggleTask: (id: string) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  habits: Habit[];
  logHabit: (id: string) => void;
  setHabitMissReason: (id: string, reason: string) => void;
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
  pastActions: PastAction[];
  pendingResourceCount: number;
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

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('lifeos-theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [dayRating, setDayRating] = useState<number | null>(null);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>(initialVaultItems);
  const [notes, setNotes] = useState<LearnNote[]>(initialNotes);
  const [pendingResources, setPendingResources] = useState<PendingResource[]>(initialPendingResources);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lifeos-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  const toggleTask = (id: string) => setTasks(ts => ts.map(t => t.id === id ? { ...t, completed: !t.completed } : t));

  const addTask = (task: Omit<Task, 'id'>) => {
    setTasks(ts => [...ts, { ...task, id: `t${Date.now()}` }]);
  };

  const deleteTask = (id: string) => setTasks(ts => ts.filter(t => t.id !== id));

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const logHabit = (id: string) => {
    setHabits(hs => hs.map(h => {
      if (h.id !== id || h.loggedToday) return h;
      const newLast7 = [...h.last7];
      newLast7[6] = 'done';
      return { ...h, loggedToday: true, streak: h.streak + 1, last7: newLast7 };
    }));
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

  const pendingResourceCount = pendingResources.filter(pr => !pr.decided).length;

  return (
    <AppContext.Provider value={{
      theme, toggleTheme,
      tasks, toggleTask, addTask, deleteTask, updateTask,
      habits, logHabit, setHabitMissReason,
      dayRating, setDayRating,
      areaScores: initialAreas,
      weeklyScore: 74,
      userName: 'Arjun Mehta',
      day: 47,
      vaultItems, addVaultItem,
      notes, addNote, updateNoteTaskCount,
      pendingResources, decidePendingResource,
      pastActions: initialPastActions,
      pendingResourceCount,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export { AREA_COLORS, TAG_COLORS, TAG_BG_COLORS };
