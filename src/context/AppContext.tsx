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

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('lifeos-theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [dayRating, setDayRating] = useState<number | null>(null);

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
    }}>
      {children}
    </AppContext.Provider>
  );
};

export { AREA_COLORS };
