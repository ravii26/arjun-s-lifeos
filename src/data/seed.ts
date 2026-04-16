import {
  Course,
  EveningCheckIn,
  Habit,
  LifeArea,
  MorningCheckIn,
  Note,
  Resource,
  Task,
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
    streak: 14,
    lastSevenDays: ["done", "done", "missed", "done", "done", "done", "pending"],
  },
  {
    id: "h2",
    name: "LifeOS build daily",
    areaId: "career",
    streak: 23,
    lastSevenDays: ["done", "done", "done", "done", "done", "done", "pending"],
  },
  {
    id: "h3",
    name: "Sleep by 11pm",
    areaId: "mind",
    streak: 8,
    lastSevenDays: ["done", "missed", "done", "done", "done", "done", "pending"],
  },
];

export const tasks: Task[] = [
  {
    id: "t1",
    title: "Solve 3 LeetCode problems",
    areaId: "career",
    priority: "P1",
    done: false,
    estimateMin: 45,
  },
  {
    id: "t2",
    title: "Push LifeOS dashboard to GitHub",
    areaId: "career",
    priority: "P1",
    done: true,
  },
  {
    id: "t3",
    title: "Record morning journal voice note",
    areaId: "mind",
    priority: "P2",
    done: false,
    estimateMin: 15,
  },
];

export const vaultItems: VaultItem[] = [
  { id: "v1", type: "Quote", tag: "Remember why I started", content: "You started this because you were tired of being average. Don't forget that feeling.", daysAgo: 12 },
  { id: "v2", type: "Video", tag: "When I want to quit", content: "David Goggins — Stay Hard motivation clip — saved this after missing 4 workouts", daysAgo: 23 },
  { id: "v3", type: "Note", tag: "When I feel lost", content: "The plan: Career to 60-80k in 9 months. DSA + projects + LifeOS. One step at a time.", daysAgo: 31 },
  { id: "v4", type: "Win", tag: "When I win", content: "Solved my first Hard LeetCode problem. Took 3 hours but I got it.", daysAgo: 8 },
  { id: "v5", type: "Quote", tag: "When I feel weak", content: "Discipline is choosing between what you want now and what you want most.", daysAgo: 19 },
  { id: "v6", type: "Note", tag: "When I failed", content: "Failed the mock interview. Froze on a graph problem I knew. Use this feeling.", daysAgo: 44 },
  { id: "v7", type: "Win", tag: "Remember why I started", content: "Day 1 — wrote down: I want to be someone I'm proud of by 23. Still the goal.", daysAgo: 47 },
];

export const learnNotes: Note[] = [
  { id: "n1", areaId: "career", type: "Research", title: "Redis patterns for session storage", preview: "Keep hot keys short-lived and push cold state to durable storage.", source: "Podcast: Scaling JS systems", createdAt: "Apr 12", body: "Redis note body", keyPoints: ["Use TTLs for ephemeral data", "Separate cache and source of truth", "Monitor eviction pressure", "Batch writes", "Prefer small keys"], taskTitle: "Sketch Redis cache plan", taskAreaId: "career" },
  { id: "n2", areaId: "mind", type: "Reflection", title: "What resets focus after a bad day", preview: "One walk, one clean desk, one small win.", source: "Journal voice note", createdAt: "Apr 10", body: "Reflection body", keyPoints: ["Reset the room", "Pick one task", "No doom scroll", "Hydrate", "Sleep on time"] },
  { id: "n3", areaId: "finance", type: "Idea", title: "Monthly money rules", preview: "Automate savings before the month starts.", source: "Chat with self", createdAt: "Apr 08", body: "Finance body", keyPoints: ["Auto transfer savings", "Track subscriptions", "Review weekly", "Keep a buffer"] },
  { id: "n4", areaId: "creative", type: "Quote", title: "Make ugly first drafts", preview: "Speed creates evidence. Evidence creates momentum.", source: "Saved quote", createdAt: "Apr 05", body: "Creative body", keyPoints: ["Ship first draft", "Do not polish early", "Save for later"] },
];

export const learnCourses: Course[] = [
  { id: "c1", title: "Node.js & Express — Backend Fundamentals", provider: "Udemy", areaId: "career", progress: 4, totalLessons: 12, nextLesson: "Module 2 · Lesson 3 — Building your first route", active: true },
  { id: "c2", title: "DSA Masterclass — Blind 75", provider: "NeetCode", areaId: "career", progress: 0, totalLessons: 75, nextLesson: "Not started", active: false },
  { id: "c3", title: "Personal Finance 101", provider: "Classroom", areaId: "finance", progress: 0, totalLessons: 10, nextLesson: "Not started", active: false },
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
  "Day 47, Arjun. Career is your strongest area right now — keep the momentum. Relationships has been quiet for 3 weeks, one small action today goes a long way. Your focus: finish the LifeOS dashboard push.";

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
