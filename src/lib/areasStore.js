export const AREAS_STORAGE_KEY = 'lifeos.areas.v1';

export const AREA_META = {
  career: { label: 'Career', color: 'var(--blue)' },
  health: { label: 'Health', color: 'var(--teal)' },
  mind: { label: 'Mind', color: 'var(--purple)' },
  finance: { label: 'Finance', color: 'var(--accent)' },
  relationships: { label: 'Relationships', color: 'var(--pink)' },
  creative: { label: 'Creative', color: 'var(--orange)' },
};

const DEFAULT_OVERVIEW = [
  { key: 'career', name: 'Career', score: 68, trend: '+12', tasks: '4/5', habits: '3d streak', time: '2h 40m', color: 'var(--blue)' },
  { key: 'health', name: 'Health', score: 71, trend: '+5', tasks: '3/4', habits: '12d streak', time: '4h 20m', color: 'var(--teal)' },
  { key: 'mind', name: 'Mind', score: 45, trend: '-8', tasks: '2/5', habits: '1d streak', time: '1h 10m', color: 'var(--purple)' },
  { key: 'finance', name: 'Finance', score: 82, trend: '→', tasks: '5/5', habits: '7d streak', time: '3h 30m', color: 'var(--accent)' },
  { key: 'relationships', name: 'Relationships', score: 39, trend: '-5', tasks: '1/3', habits: '0d streak', time: '0h 50m', color: 'var(--pink)' },
  { key: 'creative', name: 'Creative', score: 64, trend: '+3', tasks: '3/5', habits: '5d streak', time: '2h 15m', color: 'var(--orange)' },
];

const DEFAULT_TREND = [
  { week: 'W1', Career: 60, Health: 65, Mind: 50, Finance: 80, Relationships: 40, Creative: 55 },
  { week: 'W2', Career: 62, Health: 68, Mind: 48, Finance: 82, Relationships: 42, Creative: 58 },
  { week: 'W3', Career: 64, Health: 70, Mind: 46, Finance: 82, Relationships: 39, Creative: 60 },
  { week: 'W4', Career: 68, Health: 71, Mind: 45, Finance: 82, Relationships: 39, Creative: 64 },
  { week: 'W5', Career: 66, Health: 73, Mind: 52, Finance: 80, Relationships: 44, Creative: 63 },
  { week: 'W6', Career: 69, Health: 72, Mind: 49, Finance: 84, Relationships: 43, Creative: 66 },
  { week: 'W7', Career: 67, Health: 74, Mind: 47, Finance: 83, Relationships: 41, Creative: 67 },
  { week: 'W8', Career: 68, Health: 71, Mind: 45, Finance: 82, Relationships: 39, Creative: 64 },
];

const makeSeed = (prefix) => ({
  tasks: [{ id: 1, title: `${prefix} weekly priority`, priority: 'P1', status: 'Open' }],
  habits: [{ id: 1, name: `${prefix} daily ritual`, target: '1/day', streak: 3, active: true }],
  notes: [{ id: 1, title: `${prefix} insights`, content: `Capture what is improving in ${prefix}.` }],
  resources: [{ id: 1, title: `${prefix} reference`, type: 'Article', url: 'https://example.com' }],
  vault: [{ id: 1, title: `${prefix} anchor`, type: 'Quote', content: 'Consistent action beats intensity.' }],
});

const DEFAULT_DETAIL = {
  career: makeSeed('Career'),
  health: makeSeed('Health'),
  mind: makeSeed('Mind'),
  finance: makeSeed('Finance'),
  relationships: makeSeed('Relationships'),
  creative: makeSeed('Creative'),
};

export const createDefaultAreasStore = () => ({
  overview: DEFAULT_OVERVIEW,
  trend: DEFAULT_TREND,
  detailByArea: DEFAULT_DETAIL,
});

const mergeDetailArea = (fallback, raw = {}) => ({
  tasks: Array.isArray(raw.tasks) ? raw.tasks : fallback.tasks,
  habits: Array.isArray(raw.habits) ? raw.habits : fallback.habits,
  notes: Array.isArray(raw.notes) ? raw.notes : fallback.notes,
  resources: Array.isArray(raw.resources) ? raw.resources : fallback.resources,
  vault: Array.isArray(raw.vault) ? raw.vault : fallback.vault,
});

const mergeStore = (raw) => {
  const base = createDefaultAreasStore();
  if (!raw || typeof raw !== 'object') return base;

  const detailByArea = {};
  Object.keys(base.detailByArea).forEach((areaKey) => {
    detailByArea[areaKey] = mergeDetailArea(base.detailByArea[areaKey], raw.detailByArea?.[areaKey]);
  });

  return {
    overview: Array.isArray(raw.overview) && raw.overview.length ? raw.overview : base.overview,
    trend: Array.isArray(raw.trend) && raw.trend.length ? raw.trend : base.trend,
    detailByArea,
  };
};

export const loadAreasStore = () => {
  if (typeof window === 'undefined') return createDefaultAreasStore();

  try {
    const raw = window.localStorage.getItem(AREAS_STORAGE_KEY);
    if (!raw) return createDefaultAreasStore();
    return mergeStore(JSON.parse(raw));
  } catch {
    return createDefaultAreasStore();
  }
};

export const saveAreasStore = (store) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AREAS_STORAGE_KEY, JSON.stringify(store));
};
