import {
  ActionConversion,
  ConvertedAction,
  Course,
  EveningCheckIn,
  Concept,
  Habit,
  InboxLearningItem,
  LifeArea,
  MorningCheckIn,
  Note,
  NotebookEntry,
  PracticeLog,
  Resource,
  Skill,
  Task,
  TimeBlock,
  Topic,
  TopicPage,
  TopicLink,
  VaultItem,
  WeeklyReflection,
} from "./types";

export const areas: LifeArea[] = [
  {
    id: "career",
    name: "Career & Skills",
    score: 71,
    scoreDelta: 8,
    color: "#7C6FF7",
    keyStat: "4/5 tasks completed",
  },
  {
    id: "health",
    name: "Health & Body",
    score: 58,
    scoreDelta: 0,
    color: "#1DB37E",
    keyStat: "Workout 4/7 days",
  },
  {
    id: "mind",
    name: "Mind & Learning",
    score: 64,
    scoreDelta: 3,
    color: "#4A90D9",
    keyStat: "3 articles read",
  },
  {
    id: "finance",
    name: "Finance",
    score: 45,
    scoreDelta: -4,
    color: "#C4840A",
    keyStat: "No finance tasks",
  },
  {
    id: "relationships",
    name: "Relationships",
    score: 38,
    scoreDelta: -6,
    color: "#E0607E",
    keyStat: "0 connections",
  },
  {
    id: "creative",
    name: "Creative",
    score: 22,
    scoreDelta: -8,
    color: "#E8850C",
    keyStat: "No creative work",
  },
];

export const habits: Habit[] = [
  {
    id: "h1",
    name: "5:30am workout",
    areaId: "health",
    trackingType: "timer",
    trackingConfig: {
      unit: "min",
      targetValue: 45,
    },
    trackingData: {
      durationSec: 0,
    },
    streak: 14,
    bestStreak: 14,
    lastSevenDays: ["done", "done", "missed", "done", "done", "done", "pending"],
    logs: [],
    createdAt: "2026-04-01T08:00:00.000Z",
  },
  {
    id: "h2",
    name: "LifeOS build daily",
    areaId: "career",
    trackingType: "count",
    trackingConfig: {
      unit: "blocks",
      targetValue: 2,
    },
    trackingData: {
      value: 0,
    },
    streak: 23,
    bestStreak: 23,
    lastSevenDays: ["done", "done", "done", "done", "done", "done", "pending"],
    logs: [],
    createdAt: "2026-04-01T08:00:00.000Z",
  },
  {
    id: "h3",
    name: "Sleep by 11pm",
    areaId: "mind",
    trackingType: "progress",
    trackingConfig: {
      targetValue: 5,
      unit: "rating",
    },
    trackingData: {
      value: 0,
    },
    streak: 8,
    bestStreak: 8,
    lastSevenDays: ["done", "missed", "done", "done", "done", "done", "pending"],
    logs: [],
    createdAt: "2026-04-01T08:00:00.000Z",
  },
];

export const tasks: Task[] = [
  {
    id: "t1",
    title: "Solve 3 LeetCode problems",
    areaId: "career",
    priority: "P1",
    status: "pending",
    date: "2026-04-22",
    trackingType: "count",
    trackingConfig: {
      unit: "problems",
      targetValue: 3,
    },
    trackingData: {
      value: 0,
    },
    linkedSessionIds: [],
    createdAt: "2026-04-22T08:00:00.000Z",
    done: false,
    estimateMin: 45,
  },
  {
    id: "t2",
    title: "Push LifeOS dashboard to GitHub",
    areaId: "career",
    priority: "P1",
    status: "done",
    date: "2026-04-22",
    trackingType: "boolean",
    trackingConfig: {},
    trackingData: {
      completed: true,
    },
    linkedSessionIds: [],
    createdAt: "2026-04-22T08:00:00.000Z",
    completedAt: "2026-04-22T09:00:00.000Z",
    done: true,
  },
  {
    id: "t3",
    title: "Record morning journal voice note",
    areaId: "mind",
    priority: "P2",
    status: "pending",
    date: "2026-04-22",
    trackingType: "manual",
    trackingConfig: {},
    trackingData: {
      note: "",
    },
    linkedSessionIds: [],
    createdAt: "2026-04-22T08:00:00.000Z",
    done: false,
    estimateMin: 15,
  },
];

export const vaultItems: VaultItem[] = [
  { id: "v1", type: "Quote", tag: "Remember why I started", content: "You started this because you were tired of being average. Don't forget that feeling.", daysAgo: 12 },
  { id: "v2", type: "Video", tag: "When I want to quit", content: "David Goggins - Stay Hard motivation clip - saved this after missing 4 workouts", daysAgo: 23 },
  { id: "v3", type: "Note", tag: "When I feel lost", content: "The plan: Career to 60-80k in 9 months. DSA + projects + LifeOS. One step at a time.", daysAgo: 31 },
  { id: "v4", type: "Win", tag: "When I win", content: "Solved my first Hard LeetCode problem. Took 3 hours but I got it.", daysAgo: 8 },
  { id: "v5", type: "Quote", tag: "When I feel weak", content: "Discipline is choosing between what you want now and what you want most.", daysAgo: 19 },
  { id: "v6", type: "Note", tag: "When I failed", content: "Failed the mock interview. Froze on a graph problem I knew. Use this feeling.", daysAgo: 44 },
  { id: "v7", type: "Win", tag: "Remember why I started", content: "Day 1 - wrote down: I want to be someone I'm proud of by 23. Still the goal.", daysAgo: 47 },
];

export const learnNotes: Note[] = [
  { id: "n1", areaId: "career", topicIds: ["tp1"], type: "Research", title: "Redis patterns for session storage", preview: "Keep hot keys short-lived and push cold state to durable storage.", source: "Podcast: Scaling JS systems", createdAt: "Apr 12", body: "Redis note body", keyPoints: ["Use TTLs for ephemeral data", "Separate cache and source of truth", "Monitor eviction pressure", "Batch writes", "Prefer small keys"], reviewDueDate: "2026-04-20", reviewIntervalDays: 3, lastReviewedAt: "2026-04-17", reviewCount: 2, taskTitle: "Sketch Redis cache plan", taskAreaId: "career" },
  { id: "n2", areaId: "mind", topicIds: ["tp3"], type: "Reflection", title: "What resets focus after a bad day", preview: "One walk, one clean desk, one small win.", source: "Journal voice note", createdAt: "Apr 10", body: "Reflection body", keyPoints: ["Reset the room", "Pick one task", "No doom scroll", "Hydrate", "Sleep on time"], reviewDueDate: "2026-04-21", reviewIntervalDays: 2, lastReviewedAt: "2026-04-19", reviewCount: 3 },
  { id: "n3", areaId: "finance", topicIds: ["tp2"], type: "Idea", title: "Monthly money rules", preview: "Automate savings before the month starts.", source: "Chat with self", createdAt: "Apr 08", body: "Finance body", keyPoints: ["Auto transfer savings", "Track subscriptions", "Review weekly", "Keep a buffer"], reviewDueDate: "2026-04-24", reviewIntervalDays: 7, lastReviewedAt: "2026-04-17", reviewCount: 1 },
  { id: "n4", areaId: "creative", type: "Quote", title: "Make ugly first drafts", preview: "Speed creates evidence. Evidence creates momentum.", source: "Saved quote", createdAt: "Apr 05", body: "Creative body", keyPoints: ["Ship first draft", "Do not polish early", "Save for later"], reviewDueDate: "2026-04-18", reviewIntervalDays: 4, lastReviewedAt: "2026-04-14", reviewCount: 1 },
];

export const learnCourses: Course[] = [
  { id: "c1", title: "Node.js & Express - Backend Fundamentals", provider: "Udemy", areaId: "career", progress: 4, totalLessons: 12, nextLesson: "Module 2 - Lesson 3 - Building your first route", active: true },
  { id: "c2", title: "DSA Masterclass - Blind 75", provider: "NeetCode", areaId: "career", progress: 0, totalLessons: 75, nextLesson: "Not started", active: false },
  { id: "c3", title: "Personal Finance 101", provider: "Classroom", areaId: "finance", progress: 0, totalLessons: 10, nextLesson: "Not started", active: false },
];

export const skills: Skill[] = [
  {
    id: "sk1",
    name: "Backend Development",
    domainId: "career",
    whyItMatters: "Helps you ship systems that are stable, scalable, and easy to maintain.",
    currentLevel: 4,
    targetLevel: 8,
    weeklyFocus: true,
    conceptIds: ["cp1", "cp2"],
    createdAt: "Apr 12",
    updatedAt: "Apr 21",
  },
  {
    id: "sk2",
    name: "Money Management",
    domainId: "finance",
    whyItMatters: "Keeps your spending intentional and creates room for long-term growth.",
    currentLevel: 3,
    targetLevel: 7,
    weeklyFocus: false,
    conceptIds: ["cp3"],
    createdAt: "Apr 10",
    updatedAt: "Apr 18",
  },
  {
    id: "sk3",
    name: "Self Regulation",
    domainId: "mind",
    whyItMatters: "Improves consistency by helping you recover quickly after a bad day.",
    currentLevel: 5,
    targetLevel: 8,
    weeklyFocus: true,
    conceptIds: ["cp4"],
    createdAt: "Apr 11",
    updatedAt: "Apr 20",
  },
];

export const concepts: Concept[] = [
  {
    id: "cp1",
    title: "Thin route handlers",
    domainId: "career",
    skillId: "sk1",
    sourceIds: ["n1", "tp1"],
    explanationSimple: "A route should only accept input, call the right service, and return a response.",
    example: "Validate a request in middleware, then let the handler focus on business logic.",
    useCaseInMyLife: "Use this when building LifeOS features so screens stay readable and easy to change.",
    firstAction: "Refactor one route handler into service + validation today.",
    confidenceLevel: 4,
    status: "learning",
    nextReviewDate: "2026-04-21",
    reviewIntervalDays: 1,
    reviewCount: 2,
    lastReviewedAt: "2026-04-20",
    createdAt: "Apr 12",
    updatedAt: "Apr 20",
  },
  {
    id: "cp2",
    title: "Separate cache from source of truth",
    domainId: "career",
    skillId: "sk1",
    sourceIds: ["n1"],
    explanationSimple: "Store fast temporary data in cache, but keep the real record in durable storage.",
    example: "Keep session data in Redis while the actual user profile lives in the database.",
    useCaseInMyLife: "Use this to avoid losing important notes or tasks when temporary state disappears.",
    firstAction: "List one piece of state in LifeOS that should never live only in memory.",
    confidenceLevel: 3,
    status: "new",
    nextReviewDate: "2026-04-22",
    reviewIntervalDays: 1,
    reviewCount: 1,
    createdAt: "Apr 15",
    updatedAt: "Apr 18",
  },
  {
    id: "cp3",
    title: "Pay yourself first",
    domainId: "finance",
    skillId: "sk2",
    sourceIds: ["n3", "tp2"],
    explanationSimple: "Move savings out first so you spend from what is left, not the other way around.",
    example: "Auto transfer 10 percent of income into savings on payday.",
    useCaseInMyLife: "Use this to keep finances simple and reduce monthly drift.",
    firstAction: "Set up one auto-transfer or recurring savings rule.",
    confidenceLevel: 5,
    status: "applied",
    nextReviewDate: "2026-04-23",
    reviewIntervalDays: 3,
    reviewCount: 4,
    lastReviewedAt: "2026-04-20",
    createdAt: "Apr 10",
    updatedAt: "Apr 20",
  },
  {
    id: "cp4",
    title: "Reset with one small win",
    domainId: "mind",
    skillId: "sk3",
    sourceIds: ["n2", "tp3"],
    explanationSimple: "After a bad day, do one tiny action that restores momentum instead of trying to fix everything.",
    example: "Take a walk, clear the desk, and finish one 20-minute block before sleep.",
    useCaseInMyLife: "Use this when your energy drops so the next day starts clean.",
    firstAction: "Write down one reset ritual you can complete in under 10 minutes.",
    confidenceLevel: 4,
    status: "learning",
    nextReviewDate: "2026-04-21",
    reviewIntervalDays: 2,
    reviewCount: 2,
    lastReviewedAt: "2026-04-19",
    createdAt: "Apr 11",
    updatedAt: "Apr 19",
  },
];

export const learningInbox: InboxLearningItem[] = [
  {
    id: "li1",
    rawText: "Async await makes promise flow easier to read in Node and React code.",
    domainHint: "career",
    sourceType: "idea",
    createdAt: "Just now",
  },
  {
    id: "li2",
    rawText: "Automate savings before the month begins so spending happens from the remainder.",
    domainHint: "finance",
    sourceType: "book",
    createdAt: "Just now",
  },
  {
    id: "li3",
    rawText: "If today is noisy, do one small reset before trying to solve the whole day.",
    domainHint: "mind",
    sourceType: "video",
    createdAt: "Just now",
  },
];

export const practiceLogs: PracticeLog[] = [
  {
    id: "pl1",
    conceptId: "cp1",
    whatIDid: "Refactored one route handler into middleware plus service logic.",
    result: "The code became shorter and easier to test.",
    lessonLearned: "Thin handlers make the whole feature easier to reason about.",
    createdAt: "Apr 20",
  },
  {
    id: "pl2",
    conceptId: "cp3",
    whatIDid: "Moved savings transfer to payday automation.",
    result: "I spent less by default that week.",
    lessonLearned: "Good money systems remove the need for constant willpower.",
    createdAt: "Apr 18",
  },
];

export const resources: Resource[] = [
  { id: "r1", source: "Build systems note", areaId: "career", type: "Technical resource", insight: "This resource reinforces your backend roadmap.", suggestedAction: "Turn it into a 3-step implementation plan.", status: "accepted", ageDays: 1 },
  { id: "r2", source: "Money routine idea", areaId: "finance", type: "Practical resource", insight: "Short, repeatable finance actions win here.", suggestedAction: "Bundle it into your weekly review.", status: "accepted", ageDays: 2 },
  { id: "r3", source: "Calm reset prompt", areaId: "mind", type: "Reflection resource", insight: "Use this when your day feels noisy.", suggestedAction: "Save it to your evening routine.", status: "accepted", ageDays: 3 },
];

export const pendingResources: Resource[] = [
  { id: "pr1", source: "Graph crash note", areaId: "career", type: "Technical resource", insight: "Strong fit for your interview prep backlog.", suggestedAction: "Accept into Career or reject if stale.", status: "pending", ageDays: 4 },
  { id: "pr2", source: "Workout cue clip", areaId: "health", type: "Video", insight: "Could become an energy trigger.", suggestedAction: "Decide where this belongs.", status: "pending", ageDays: 6 },
  { id: "pr3", source: "Savings rule quote", areaId: "finance", type: "Quote", insight: "A concise reminder for spending discipline.", suggestedAction: "Place into Finance or Vault.", status: "pending", ageDays: 8 },
];

export const aiBriefing =
  "Day 47, Arjun. Career is your strongest area right now - keep the momentum. Relationships has been quiet for 3 weeks, one small action today goes a long way. Your focus: finish the LifeOS dashboard push.";

export const todayTaskIds = ["t1", "t2", "t3"];

export const morningCheckIn: MorningCheckIn = {
  energy: null,
  focus: "",
  dismissed: false,
};

export const eveningCheckIn: EveningCheckIn = {
  rating: null,
  note: "",
  dismissed: false,
};

export const weeklyReflection: WeeklyReflection = {
  q1: "",
  q2: "",
  q3: "",
  q4: "",
  nextAreaFocus: "relationships",
  commitment: "",
};

export const topics: Topic[] = [
  {
    id: "tp1",
    title: "Node routing patterns",
    areaId: "career",
    summary: "Keep handlers thin, isolate validation, and compose middleware by concern.",
  },
  {
    id: "tp2",
    title: "Finance weekly reset",
    areaId: "finance",
    summary: "A short weekly check avoids money drift and keeps spending intentional.",
  },
  {
    id: "tp3",
    title: "Recovery rituals",
    areaId: "mind",
    summary: "Small transitions after low-energy days protect the next morning.",
  },
];

export const topicLinks: TopicLink[] = [
  { id: "tl1", topicId: "tp1", label: "Express middleware", strength: 82 },
  { id: "tl2", topicId: "tp1", label: "Request validation", strength: 67 },
  { id: "tl3", topicId: "tp1", label: "Error boundaries", strength: 52 },
  { id: "tl4", topicId: "tp2", label: "Subscription audit", strength: 74 },
  { id: "tl5", topicId: "tp2", label: "Automated transfers", strength: 69 },
  { id: "tl6", topicId: "tp3", label: "Evening shutdown", strength: 77 },
];

export const notebookEntries: NotebookEntry[] = [
  {
    id: "nb1",
    areaId: "career",
    title: "Route validation checklist",
    body: "Every route should validate input before touching domain logic. Add lightweight schemas and return clear error codes.",
    createdAt: "Apr 15",
    topicIds: ["tp1"],
  },
  {
    id: "nb2",
    areaId: "mind",
    title: "Low-energy recovery",
    body: "When rating <=2, do 15-minute walk, desk reset, and one 20-minute focused block before sleep.",
    createdAt: "Apr 14",
    topicIds: ["tp3"],
  },
];

export const timeBlocks: TimeBlock[] = [
  {
    id: "tb1",
    date: "2026-04-16",
    title: "LifeOS build sprint",
    areaId: "career",
    startTime: "09:00",
    endTime: "10:30",
    startHour: 9,
    endHour: 10.5,
    linkedTaskId: "t1",
    status: "planned",
  },
  {
    id: "tb2",
    date: "2026-04-16",
    title: "LeetCode practice",
    areaId: "career",
    startTime: "11:00",
    endTime: "11:45",
    startHour: 11,
    endHour: 11.75,
    linkedTaskId: "t1",
    status: "planned",
  },
  {
    id: "tb3",
    date: "2026-04-16",
    title: "Morning workout",
    areaId: "health",
    startTime: "05:30",
    endTime: "06:30",
    startHour: 5.5,
    endHour: 6.5,
    linkedHabitId: "h1",
    status: "planned",
  },
  {
    id: "tb4",
    date: "2026-04-16",
    title: "Workout",
    areaId: "health",
    startTime: "18:00",
    endTime: "19:00",
    startHour: 18,
    endHour: 19,
    linkedHabitId: "h1",
    status: "planned",
  },
];

export const actionHistory: ActionConversion[] = [
  {
    id: "ac1",
    input: "I should probably revise linked lists this week",
    output: "Solve 2 linked-list medium problems and write one recap note by Friday",
    areaId: "career",
    priority: "P2",
    createdAt: "Apr 15",
  },
];

export const topicPages: TopicPage[] = [
  {
    topicId: "tp1",
    linkedNoteIds: ["n1"],
    linkedCourseIds: ["c1"],
    linkedResourceIds: ["r1"],
  },
  {
    topicId: "tp2",
    linkedNoteIds: ["n3"],
    linkedCourseIds: ["c3"],
    linkedResourceIds: ["r2"],
  },
  {
    topicId: "tp3",
    linkedNoteIds: ["n2"],
    linkedCourseIds: [],
    linkedResourceIds: ["r3"],
  },
];

export const actionConverterHistory: ConvertedAction[] = [
  {
    id: "ca1",
    originalInput: "Need to get better at linked lists",
    detectedType: "task",
    result: "task",
    resultId: "t1",
    createdAt: "Apr 15",
  },
  {
    id: "ca2",
    originalInput: "Read one strong backend architecture resource",
    detectedType: "note",
    result: "note",
    resultId: "n1",
    createdAt: "Apr 14",
  },
];
