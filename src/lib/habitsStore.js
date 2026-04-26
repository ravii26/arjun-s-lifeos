export const HABITS_STORAGE_KEY = 'lifeos.habits.v1';

const defaultHistory = () => [false, false, false, false, false, false, false];

const DEFAULT_HABITS = [
  {
    id: 1,
    name: 'Hydration',
    area: 'Health',
    type: 'Count',
    target: 8,
    progress: 6,
    timerSeconds: 0,
    timerRunning: false,
    status: 'active',
    streak: 14,
    bestStreak: 21,
    history: [true, true, false, true, true, true, false],
  },
  {
    id: 2,
    name: 'Deep Work Block',
    area: 'Career',
    type: 'Timer',
    target: 60,
    progress: 35,
    timerSeconds: 2100,
    timerRunning: false,
    status: 'active',
    streak: 7,
    bestStreak: 16,
    history: [true, true, true, false, true, true, true],
  },
  {
    id: 3,
    name: 'Evening Reflection',
    area: 'Mind',
    type: 'Boolean',
    target: 1,
    progress: 0,
    timerSeconds: 0,
    timerRunning: false,
    status: 'active',
    streak: 3,
    bestStreak: 9,
    history: [false, true, true, true, false, false, true],
  },
];

export const createDefaultHabits = () => DEFAULT_HABITS;

export const loadHabitsStore = () => {
  if (typeof window === 'undefined') return createDefaultHabits();

  try {
    const raw = window.localStorage.getItem(HABITS_STORAGE_KEY);
    if (!raw) return createDefaultHabits();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return createDefaultHabits();
    return parsed;
  } catch {
    return createDefaultHabits();
  }
};

export const saveHabitsStore = (habits) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
};
