export const TASKS_STORAGE_KEY = 'lifeos.tasks.v1';

const DEFAULT_TASKS = [
  { id: 1, title: 'Finalize architecture deck', area: 'Career', priority: 'P1', type: 'Boolean', done: false, lane: 'today', isStale: true },
  { id: 2, title: '45 min strength training', area: 'Health', priority: 'P2', type: 'Timer', done: true, lane: 'today', timerSeconds: 1380, timerRunning: false },
  { id: 3, title: 'Create sprint estimation rubric', area: 'Career', priority: 'P2', type: 'Manual', done: false, lane: 'backlog' },
  { id: 4, title: 'Write investment review note', area: 'Finance', priority: 'P1', type: 'Boolean', done: false, lane: 'backlog' },
  { id: 5, title: 'Sleep by 11:00 PM', area: 'Health', priority: 'P2', type: 'Boolean', done: false, lane: 'missed' },
];

export const domainToTaskArea = (domain) => {
  if (domain === 'coding') return 'Career';
  if (domain === 'health') return 'Health';
  if (domain === 'finance') return 'Finance';
  if (domain === 'self-development') return 'Mind';
  return 'Career';
};

export const createDefaultTasks = () => DEFAULT_TASKS;

const normalizeTask = (task) => ({
  ...task,
  timerRunning: task.type === 'Timer' ? Boolean(task.timerRunning) : false,
  timerSeconds: task.type === 'Timer' ? Number(task.timerSeconds || 0) : undefined,
  progress: task.type === 'Count' ? Number(task.progress || 0) : undefined,
  target: task.type === 'Count' ? Number(task.target || 1) : undefined,
});

export const loadTasksStore = () => {
  if (typeof window === 'undefined') return createDefaultTasks();

  try {
    const raw = window.localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) return createDefaultTasks();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return createDefaultTasks();
    return parsed.map(normalizeTask);
  } catch {
    return createDefaultTasks();
  }
};

export const saveTasksStore = (tasks) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks.map(normalizeTask)));
};

export const appendLearnTask = (payload) => {
  const existing = loadTasksStore();
  const task = {
    id: Date.now() + Math.floor(Math.random() * 100000),
    title: payload.title,
    area: payload.area || 'Career',
    priority: payload.priority || 'P2',
    type: payload.type || 'Manual',
    done: false,
    lane: payload.lane || 'today',
    notes: payload.notes || '',
    source: 'Learn',
    links: payload.links || {},
    timerSeconds: payload.type === 'Timer' ? 0 : undefined,
    timerRunning: false,
    progress: payload.type === 'Count' ? 0 : undefined,
    target: payload.type === 'Count' ? Number(payload.target || 1) : undefined,
  };

  const next = [task, ...existing];
  saveTasksStore(next);
  return task;
};
