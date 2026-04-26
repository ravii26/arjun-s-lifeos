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
  { 
    key: 'career', name: 'Career', score: 68, trend: '+12', tasks: '4/5', habits: '3d streak', time: '2h 40m', color: 'var(--blue)',
    currentGoal: 'Senior Architect Promotion',
    milestones: [
      { label: 'System Design Mastery', progress: 85 },
      { label: 'Lead Infrastructure Project', progress: 40 }
    ],
    aiSuggestion: 'Schedule 1:1 with manager to discuss architecture roadmap.'
  },
  { 
    key: 'health', name: 'Health', score: 71, trend: '+5', tasks: '3/4', habits: '12d streak', time: '4h 20m', color: 'var(--teal)',
    currentGoal: 'Half-Marathon Readiness',
    milestones: [
      { label: 'Weekly Mileage (15km)', progress: 100 },
      { label: 'Strength Training 2x', progress: 50 }
    ],
    aiSuggestion: 'Optimal heart rate variability today. Recommended intensity: High.'
  },
  { 
    key: 'mind', name: 'Mind', score: 45, trend: '-8', tasks: '2/5', habits: '1d streak', time: '1h 10m', color: 'var(--purple)',
    currentGoal: 'Emotional Intelligence (EQ) Baseline',
    milestones: [
      { label: 'Daily Reflection Series', progress: 30 },
      { label: 'Meditation Consistency', progress: 15 }
    ],
    aiSuggestion: 'Cognitive fatigue detected. Recommended: 5min box breathing.'
  },
  { 
    key: 'finance', name: 'Finance', score: 82, trend: '→', tasks: '5/5', habits: '7d streak', time: '3h 30m', color: 'var(--accent)',
    currentGoal: 'Diversified Portfolio Launch',
    milestones: [
      { label: 'Index Fund Setup', progress: 100 },
      { label: 'Crypto Allocation Study', progress: 75 }
    ],
    aiSuggestion: 'Market volatility high. Review stop-loss orders on active trades.'
  },
  { 
    key: 'relationships', name: 'Relationships', score: 39, trend: '-5', tasks: '1/3', habits: '0d streak', time: '0h 50m', color: 'var(--pink)',
    currentGoal: 'Quality Core Connection',
    milestones: [
      { label: 'Bi-weekly Family Dinner', progress: 100 },
      { label: 'Deeper Networking', progress: 20 }
    ],
    aiSuggestion: 'It has been 12 days since you contacted Mom. Send a quick voice note.'
  },
  { 
    key: 'creative', name: 'Creative', score: 64, trend: '+3', tasks: '3/5', habits: '5d streak', time: '2h 15m', color: 'var(--orange)',
    currentGoal: 'LifeOS Feature Complete',
    milestones: [
      { label: 'AI Intelligence Layer', progress: 95 },
      { label: 'Premium UX Polish', progress: 80 }
    ],
    aiSuggestion: 'Flow state window opening soon. Block 90mins for UI refine.'
  },
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

  const mergedOverview = base.overview.map((baseArea) => {
    const rawArea = Array.isArray(raw.overview) ? raw.overview.find((r) => r.key === baseArea.key) : null;
    if (!rawArea) return baseArea;
    
    // Explicitly merge new intelligence fields if missing in raw storage
    return {
      ...baseArea,
      ...rawArea,
      currentGoal: rawArea.currentGoal || baseArea.currentGoal,
      milestones: Array.isArray(rawArea.milestones) ? rawArea.milestones : baseArea.milestones,
      aiSuggestion: rawArea.aiSuggestion || baseArea.aiSuggestion
    };
  });

  const detailByArea = {};
  Object.keys(base.detailByArea).forEach((areaKey) => {
    detailByArea[areaKey] = mergeDetailArea(base.detailByArea[areaKey], raw.detailByArea?.[areaKey]);
  });

  return {
    overview: mergedOverview,
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
