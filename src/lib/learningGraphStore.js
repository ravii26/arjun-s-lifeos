import { AREA_META } from './areasStore';

export const LEARNING_GRAPH_STORAGE_KEY = 'lifeos.learning-graph.v2';
const LEGACY_LEARN_STORAGE_KEY = 'lifeos.learn.v1';

export const DOMAIN_PRESETS = [
  { key: 'coding', label: 'Coding', areaKey: 'career' },
  { key: 'health', label: 'Health', areaKey: 'health' },
  { key: 'finance', label: 'Finance', areaKey: 'finance' },
  { key: 'self-development', label: 'Self Development', areaKey: 'mind' },
];

const TOPIC_SEEDS = [
  { id: 1, name: 'Backend Architecture', domain: 'coding', skill: 45, lastStudied: 'today', relatedTopicIds: [2] },
  { id: 2, name: 'DSA Mastery', domain: 'coding', skill: 60, lastStudied: 'yesterday', relatedTopicIds: [1] },
  { id: 3, name: 'Value Investing & Markets', domain: 'finance', skill: 30, lastStudied: '3 days ago', relatedTopicIds: [] },
  { id: 4, name: 'Behavior & Habits', domain: 'self-development', skill: 55, lastStudied: 'today', relatedTopicIds: [] },
];

const COURSE_SEEDS = [
  {
    id: 101,
    name: 'Backend System Design',
    source: 'Course',
    url: '',
    domain: 'coding',
    status: 'Active',
    progress: 35,
    lesson: 14,
    totalLessons: 40,
    nextTask: 'Design a scalable rate limiter',
    eta: '~3 weeks',
    topicIds: [1],
  },
  {
    id: 102,
    name: '100 Days DSA Sheet',
    source: 'Self-defined',
    url: 'https://leetcode.com',
    domain: 'coding',
    status: 'Active',
    progress: 15,
    lesson: 15,
    totalLessons: 100,
    nextTask: 'Solve sliding window pattern problems',
    eta: '~85 days',
    topicIds: [2],
  },
  {
    id: 103,
    name: 'The Psychology of Money',
    source: 'Book',
    url: '',
    domain: 'finance',
    status: 'Paused',
    progress: 70,
    lesson: 14,
    totalLessons: 20,
    nextTask: 'Read Chapter 15: Nothing is Free',
    eta: '~1 week',
    topicIds: [3],
  },
  {
    id: 104,
    name: 'Atomic Habits',
    source: 'Book',
    url: '',
    domain: 'self-development',
    status: 'Completed',
    progress: 100,
    lesson: 20,
    totalLessons: 20,
    nextTask: '',
    eta: 'Completed',
    topicIds: [4],
  }
];

const RESOURCE_SEEDS = [
  {
    id: 201,
    title: 'Stripe API Design Guidelines',
    url: 'https://stripe.com/api',
    type: 'Article',
    domain: 'coding',
    addedAt: '2026-04-20T08:00:00.000Z',
    state: 'Processed',
    topicId: 1,
    courseId: 101,
  },
  {
    id: 202,
    title: 'Dynamic Programming Patterns in Python',
    url: 'https://example.com/dp',
    type: 'Video',
    domain: 'coding',
    addedAt: '2026-04-24T09:00:00.000Z',
    state: 'Pending',
    topicId: 2,
    courseId: 102,
  },
  {
    id: 203,
    title: 'Naval Ravikant on Wealth Creation (Random Knowledge)',
    url: 'https://youtube.com',
    type: 'Video',
    domain: 'finance',
    addedAt: '2026-04-25T20:00:00.000Z',
    state: 'Pending',
    topicId: 3,
    courseId: null,
  },
];

const NOTEBOOK_SEEDS = [
  { id: 301, name: 'System Design Lab', domain: 'coding', description: 'Architectural patterns and backend notes' },
  { id: 302, name: 'Algorithmic Playbook', domain: 'coding', description: 'DSA patterns and solutions' },
  { id: 303, name: 'Wealth & Markets', domain: 'finance', description: 'Investment philosophy and book notes' },
  { id: 304, name: 'Growth Engine', domain: 'self-development', description: 'Mental models and habit tracking' },
];

const NOTE_SEEDS = [
  {
    id: 401,
    title: 'Idempotency in Distributed Systems',
    content: 'An API call is idempotent if executing it multiple times produces the same result. Crucial for payments (like Stripe) to avoid double-charging during network drops. Use idempotency keys!',
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
    title: 'Slow Pointers vs Fast Pointers',
    content: 'Cycle detection logic (Floyd algorithm). Fast moves 2x, slow moves 1x. If they meet, there is a cycle. Used a lot in LinkedList problems from the 100 Days DSA Sheet.',
    type: 'Insight',
    domain: 'coding',
    notebookId: 302,
    topicId: 2,
    courseId: 102,
    resourceId: null,
    date: '2026-04-25',
  },
  {
    id: 403,
    title: 'Compounding is continuous, not just financial',
    content: 'From Atomic Habits: Habits are the compound interest of self-improvement. The same way that money multiplies through compound interest, the effects of your habits multiply as you repeat them.',
    type: 'Summary',
    domain: 'self-development',
    notebookId: 304,
    topicId: 4,
    courseId: 104,
    resourceId: null,
    date: '2026-04-18',
  },
  {
    id: 404,
    title: 'Time in the market > Timing the market',
    content: 'The most powerful tool in finance is simply survival and time. Psychology of Money mentions Warren Buffett made 95% of his wealth after his 65th birthday.',
    type: 'Snippet',
    domain: 'finance',
    notebookId: 303,
    topicId: 3,
    courseId: 103,
    resourceId: null,
    date: '2026-04-26',
  }
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
