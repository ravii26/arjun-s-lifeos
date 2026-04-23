import { AREA_META } from './areasStore';

export const LEARNING_GRAPH_STORAGE_KEY = 'lifeos.learning-graph.v1';
const LEGACY_LEARN_STORAGE_KEY = 'lifeos.learn.v1';

export const DOMAIN_PRESETS = [
  { key: 'coding', label: 'Coding', areaKey: 'career' },
  { key: 'health', label: 'Health', areaKey: 'health' },
  { key: 'finance', label: 'Finance', areaKey: 'finance' },
  { key: 'self-development', label: 'Self Development', areaKey: 'mind' },
];

const TOPIC_SEEDS = [
  { id: 1, name: 'State Management Patterns', domain: 'coding', skill: 72, lastStudied: '3 days ago', relatedTopicIds: [2] },
  { id: 2, name: 'Rendering Pipeline', domain: 'coding', skill: 61, lastStudied: '2 days ago', relatedTopicIds: [1] },
  { id: 3, name: 'VO2 Max Conditioning', domain: 'health', skill: 46, lastStudied: '1 day ago', relatedTopicIds: [] },
  { id: 4, name: 'Asset Allocation Discipline', domain: 'finance', skill: 61, lastStudied: '5 days ago', relatedTopicIds: [] },
  { id: 5, name: 'Identity Habits', domain: 'self-development', skill: 49, lastStudied: '4 days ago', relatedTopicIds: [] },
];

const COURSE_SEEDS = [
  {
    id: 101,
    name: 'Advanced React Systems',
    source: 'YouTube',
    url: '',
    domain: 'coding',
    status: 'Active',
    progress: 33,
    lesson: 8,
    totalLessons: 24,
    nextTask: 'Build custom hook architecture doc',
    eta: '~6 days at current pace',
    topicIds: [1, 2],
  },
  {
    id: 102,
    name: 'Metabolic Flexibility Blueprint',
    source: 'Book',
    url: '',
    domain: 'health',
    status: 'Paused',
    progress: 48,
    lesson: 5,
    totalLessons: 10,
    nextTask: '',
    eta: '~4 days at current pace',
    topicIds: [3],
  },
  {
    id: 103,
    name: 'Practical Value Investing',
    source: 'Course',
    url: '',
    domain: 'finance',
    status: 'Completed',
    progress: 100,
    lesson: 14,
    totalLessons: 14,
    nextTask: 'Review portfolio checklist weekly',
    eta: 'Completed',
    topicIds: [4],
  },
];

const RESOURCE_SEEDS = [
  {
    id: 201,
    title: 'React Compiler Deep Dive',
    url: 'https://example.dev/react-compiler',
    type: 'Article',
    domain: 'coding',
    addedAt: '2026-04-20T08:00:00.000Z',
    state: 'Pending',
    topicId: 1,
    courseId: 101,
  },
  {
    id: 202,
    title: 'Sleep Debt and Performance',
    url: 'https://example.health/sleep-debt',
    type: 'Video',
    domain: 'health',
    addedAt: '2026-04-13T09:00:00.000Z',
    state: 'Pending',
    topicId: 3,
    courseId: 102,
  },
  {
    id: 203,
    title: 'Weekly Review: Portfolio Journal Prompt',
    url: '',
    type: 'Idea',
    domain: 'finance',
    addedAt: '2026-04-17T20:00:00.000Z',
    state: 'Processed',
    topicId: 4,
    courseId: 103,
  },
];

const NOTEBOOK_SEEDS = [
  { id: 301, name: 'Coding Lab', domain: 'coding', description: 'Code architecture and implementation notes' },
  { id: 302, name: 'Health Playbook', domain: 'health', description: 'Training and recovery notes' },
  { id: 303, name: 'Finance Journal', domain: 'finance', description: 'Market and portfolio notes' },
  { id: 304, name: 'Growth Journal', domain: 'self-development', description: 'Mindset and behavior notes' },
];

const NOTE_SEEDS = [
  {
    id: 401,
    title: 'Reducer Design for Large React Apps',
    content: 'Keep reducers event-driven and domain-scoped. Avoid giant global reducers that hide ownership.',
    type: 'Concept',
    domain: 'coding',
    notebookId: 301,
    topicId: 1,
    courseId: 101,
    resourceId: 201,
    date: '2026-04-20',
  },
  {
    id: 402,
    title: 'Interval Block Structure',
    content: 'Use 4 x 4 min hard efforts with strict recovery windows. Keep weekly load measurable.',
    type: 'Insight',
    domain: 'health',
    notebookId: 302,
    topicId: 3,
    courseId: 102,
    resourceId: 202,
    date: '2026-04-19',
  },
  {
    id: 403,
    title: 'Three-Bucket Portfolio Logic',
    content: 'Assign assets to growth, stability, and liquidity buckets. Rebalance on drift, not emotion.',
    type: 'Summary',
    domain: 'finance',
    notebookId: 303,
    topicId: 4,
    courseId: 103,
    resourceId: 203,
    date: '2026-04-18',
  },
];

const mergeArrays = (raw, fallback) => (Array.isArray(raw) ? raw : fallback);

const withAreaKey = (items, domainField = 'domain') => items.map((item) => ({
  ...item,
  areaKey: item.areaKey || areaKeyFromDomain(item[domainField]),
}));

export const areaKeyFromDomain = (domain) => {
  const preset = DOMAIN_PRESETS.find((entry) => entry.key === domain);
  if (preset) return preset.areaKey;
  return Object.prototype.hasOwnProperty.call(AREA_META, domain) ? domain : 'mind';
};

export const createDefaultLearningGraphStore = () => ({
  version: 1,
  domains: DOMAIN_PRESETS,
  topics: withAreaKey(TOPIC_SEEDS),
  courses: withAreaKey(COURSE_SEEDS),
  resources: withAreaKey(RESOURCE_SEEDS),
  notebooks: withAreaKey(NOTEBOOK_SEEDS),
  notes: withAreaKey(NOTE_SEEDS),
});

const normalizeStore = (raw) => {
  const base = createDefaultLearningGraphStore();
  if (!raw || typeof raw !== 'object') return base;

  return {
    version: 1,
    domains: mergeArrays(raw.domains, base.domains),
    topics: withAreaKey(mergeArrays(raw.topics, base.topics)),
    courses: withAreaKey(mergeArrays(raw.courses, base.courses)),
    resources: withAreaKey(mergeArrays(raw.resources, base.resources)),
    notebooks: withAreaKey(mergeArrays(raw.notebooks, base.notebooks)),
    notes: withAreaKey(mergeArrays(raw.notes, base.notes)),
  };
};

const toId = () => Date.now() + Math.floor(Math.random() * 100000);

const legacyToGraph = (legacyRaw) => {
  const base = createDefaultLearningGraphStore();
  if (!legacyRaw || typeof legacyRaw !== 'object') return base;

  const topics = [...base.topics];
  const topicsByName = new Map(topics.map((topic) => [topic.name.toLowerCase(), topic.id]));

  const notebooksByDomain = new Map(base.notebooks.map((item) => [item.domain, item.id]));

  const courses = Array.isArray(legacyRaw.courses)
    ? legacyRaw.courses.map((course) => ({
      id: toId(),
      name: course.name,
      source: course.source || 'Course',
      url: course.url || '',
      domain: course.area || 'coding',
      status: course.status || 'Paused',
      progress: Number(course.progress) || 0,
      lesson: Number(course.lesson) || 0,
      totalLessons: Number(course.totalLessons) || 1,
      nextTask: course.nextTask || '',
      eta: course.eta || '~2 weeks',
      topicIds: [],
    }))
    : base.courses;

  const courseByName = new Map(courses.map((course) => [String(course.name || '').toLowerCase(), course.id]));

  const resources = Array.isArray(legacyRaw.resources)
    ? legacyRaw.resources.map((resource) => ({
      id: toId(),
      title: resource.title,
      url: resource.url || '',
      type: resource.type || (resource.url ? 'Article' : 'Idea'),
      domain: resource.area || 'coding',
      addedAt: resource.addedAt || new Date().toISOString(),
      state: resource.state || 'Pending',
      topicId: null,
      courseId: null,
    }))
    : base.resources;

  const resourceByTitle = new Map(resources.map((resource) => [String(resource.title || '').toLowerCase(), resource.id]));

  const notes = Array.isArray(legacyRaw.notes)
    ? legacyRaw.notes.map((note) => {
      const topicName = String(note.topic || '').trim();
      let topicId = topicName ? topicsByName.get(topicName.toLowerCase()) : null;

      if (!topicId && topicName) {
        topicId = toId();
        topicsByName.set(topicName.toLowerCase(), topicId);
        topics.push({
          id: topicId,
          name: topicName,
          domain: note.area || 'coding',
          skill: 40,
          lastStudied: 'today',
          relatedTopicIds: [],
        });
      }

      return {
        id: toId(),
        title: note.title,
        content: note.content || '',
        type: note.type || 'Concept',
        domain: note.area || 'coding',
        notebookId: notebooksByDomain.get(note.area || 'coding') || base.notebooks[0].id,
        topicId: topicId || null,
        courseId: courseByName.get(String(note.source || '').toLowerCase()) || null,
        resourceId: resourceByTitle.get(String(note.source || '').toLowerCase()) || null,
        date: note.date || new Date().toISOString().slice(0, 10),
      };
    })
    : base.notes;

  return {
    version: 1,
    domains: base.domains,
    topics,
    courses,
    resources,
    notebooks: base.notebooks,
    notes,
  };
};

export const loadLearningGraphStore = () => {
  if (typeof window === 'undefined') return createDefaultLearningGraphStore();

  try {
    const raw = window.localStorage.getItem(LEARNING_GRAPH_STORAGE_KEY);
    if (raw) {
      return normalizeStore(JSON.parse(raw));
    }

    const legacyRaw = window.localStorage.getItem(LEGACY_LEARN_STORAGE_KEY);
    if (!legacyRaw) return createDefaultLearningGraphStore();

    return normalizeStore(legacyToGraph(JSON.parse(legacyRaw)));
  } catch {
    return createDefaultLearningGraphStore();
  }
};

export const saveLearningGraphStore = (store) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LEARNING_GRAPH_STORAGE_KEY, JSON.stringify(normalizeStore(store)));
};
