import type { AppState, Habit, HabitLog } from '@/types';
import { daysAgoIso, isoDate } from '@/lib/lifeos';

const today = isoDate(new Date());

const buildBooleanLogs = (days: number, pattern: boolean[]): HabitLog[] =>
  Array.from({ length: days }, (_, index) => ({
    date: daysAgoIso(days - index),
    done: pattern[index % pattern.length],
  }));

const buildTimerLogs = (days: number, doneMinutes: number[], missedEvery = 2): HabitLog[] =>
  Array.from({ length: days }, (_, index) => {
    const done = index % missedEvery !== 1;
    return {
      date: daysAgoIso(days - index),
      done,
      seconds: done ? doneMinutes[index % doneMinutes.length] * 60 : 0,
    };
  });

const buildAmountLogs = (values: number[]): HabitLog[] =>
  values.map((value, index) => ({
    date: daysAgoIso(values.length - index),
    value,
  }));

const buildProgressLogs = (values: number[]): HabitLog[] =>
  values.map((value, index) => ({
    date: daysAgoIso(values.length - index),
    currentValue: value,
  }));

export const seedState: AppState = {
  theme: 'dark',
  areas: [
    { id: 'career', name: 'Career & Skills', score: 71, scoreDelta: 8, color: '#7C6FF7', icon: 'Briefcase', keyStat: '4/5 tasks done' },
    { id: 'health', name: 'Health & Body', score: 58, scoreDelta: 0, color: '#1DB37E', icon: 'Heart', keyStat: 'Workout 4/7 days' },
    { id: 'mind', name: 'Mind & Learning', score: 64, scoreDelta: 3, color: '#4A90D9', icon: 'Brain', keyStat: '3 articles read' },
    { id: 'finance', name: 'Finance', score: 45, scoreDelta: -4, color: '#C4840A', icon: 'TrendingUp', keyStat: 'No finance tasks' },
    { id: 'relationships', name: 'Relationships', score: 38, scoreDelta: -6, color: '#E0607E', icon: 'Users', keyStat: '0 connections' },
    { id: 'creative', name: 'Creative', score: 22, scoreDelta: -8, color: '#E8850C', icon: 'Palette', keyStat: 'No creative work' },
  ],
  habits: [
    {
      id: 'h1',
      name: '5:30am workout',
      areaId: 'health',
      direction: 'build',
      trackingType: 'timer',
      timerGoalSeconds: 3600,
      timerUnit: 'hours',
      frequency: 'daily',
      streak: 14,
      bestStreak: 21,
      reminder: { time: '05:00', enabled: true },
      logs: buildTimerLogs(14, [54, 48, 60, 42, 55, 50, 58], 2),
      createdAt: today,
    },
    {
      id: 'h2',
      name: 'LifeOS build daily',
      areaId: 'career',
      direction: 'build',
      trackingType: 'timer',
      timerGoalSeconds: 5400,
      timerUnit: 'hours',
      frequency: 'daily',
      streak: 23,
      bestStreak: 23,
      logs: Array.from({ length: 23 }, (_, index) => ({
        date: daysAgoIso(23 - index),
        done: true,
        seconds: 5400,
      })),
      createdAt: today,
    },
    {
      id: 'h3',
      name: 'Sleep by 11pm',
      areaId: 'mind',
      direction: 'build',
      trackingType: 'boolean',
      frequency: 'daily',
      streak: 8,
      bestStreak: 14,
      logs: buildBooleanLogs(14, [true, true, false, true, true, false, true]),
      createdAt: today,
    },
    {
      id: 'h4',
      name: 'Drink 8 glasses of water',
      areaId: 'health',
      direction: 'build',
      trackingType: 'amount',
      amountGoal: 8,
      amountUnit: 'glasses',
      frequency: 'daily',
      streak: 5,
      bestStreak: 12,
      logs: buildAmountLogs([6, 7, 8, 5, 8, 8, 7]),
      createdAt: today,
    },
    {
      id: 'h5',
      name: 'No social media after 10pm',
      areaId: 'mind',
      direction: 'quit',
      trackingType: 'boolean',
      frequency: 'daily',
      streak: 3,
      bestStreak: 7,
      logs: buildBooleanLogs(7, [true, true, false, true, true, true, false]),
      createdAt: today,
    },
    {
      id: 'h6',
      name: 'Save ₹500 daily',
      areaId: 'finance',
      direction: 'build',
      trackingType: 'progress',
      progressStart: 0,
      progressGoal: 50000,
      progressCurrent: 12500,
      progressUnit: '₹',
      frequency: 'daily',
      streak: 10,
      bestStreak: 10,
      logs: buildProgressLogs([8200, 9000, 9700, 10200, 11200, 12000, 12500]),
      createdAt: today,
    },
  ],
  tasks: [
    { id: 't1', title: 'Solve 3 LeetCode problems', status: 'todo', priority: 'P1', areaId: 'career', estimateMin: 45, createdAt: today },
    { id: 't2', title: 'Push LifeOS dashboard to GitHub', status: 'done', priority: 'P1', areaId: 'career', createdAt: today },
    { id: 't3', title: 'Record morning journal voice note', status: 'todo', priority: 'P2', areaId: 'mind', estimateMin: 15, createdAt: today },
    { id: 't4', title: 'Set up Redis pub/sub locally', status: 'todo', priority: 'P1', areaId: 'career', estimateMin: 60, projectId: 'proj1', createdAt: today },
    { id: 't5', title: 'Read Chapter 4 of Clean Code', status: 'todo', priority: 'P2', areaId: 'career', estimateMin: 30, projectId: 'proj1', createdAt: today },
    { id: 't6', title: 'Call Mom this week', status: 'todo', priority: 'P2', areaId: 'relationships', createdAt: today },
    { id: 't7', title: 'Review monthly budget', status: 'todo', priority: 'P1', areaId: 'finance', estimateMin: 20, createdAt: today },
  ],
  projects: [
    {
      id: 'proj1',
      title: 'LifeOS Backend API',
      areaId: 'career',
      status: 'active',
      tasks: ['t4', 't5'],
      description: 'Build the Node/Express API for LifeOS',
      dueDate: '2025-05-15',
    },
  ],
  notes: [
    {
      id: 'n1',
      title: 'Atomic Habits notes',
      areaId: 'mind',
      notebookId: 'nb-default',
      topicIds: ['t-momentum'],
      type: 'book-summary',
      body: 'Focus on systems, not goals. Make the cue obvious and the friction low.',
      keyPoints: ['Identity drives habits', 'Reduce friction', 'Track streaks visually'],
      source: 'Atomic Habits',
      createdAt: today,
      linkedTaskIds: ['t3'],
    },
    {
      id: 'n2',
      title: 'Redis pub/sub reminder',
      areaId: 'career',
      notebookId: 'nb-default',
      courseId: 'c1',
      moduleId: 'm1',
      lessonId: 'l2',
      topicIds: ['t-redis'],
      type: 'course-note',
      body: 'Use pub/sub for transient notifications, not durable queues.',
      keyPoints: ['Pub/sub is ephemeral', 'Durability needs streams or queues'],
      createdAt: today,
    },
  ],
  topics: [
    { id: 't-momentum', name: 'Momentum', areaId: 'mind', color: '#4A90D9' },
    { id: 't-redis', name: 'Redis', areaId: 'career', color: '#7C6FF7' },
    { id: 't-health', name: 'Training', areaId: 'health', color: '#1DB37E' },
  ],
  courses: [
    {
      id: 'c1',
      title: 'System Design Basics',
      areaId: 'career',
      source: 'Internal notes',
      modules: [
        {
          id: 'm1',
          title: 'Caching',
          locked: false,
          lessons: [
            { id: 'l1', title: 'Cache invalidation', done: true },
            { id: 'l2', title: 'Write-through vs write-back', done: false, isCurrent: true },
          ],
        },
      ],
      totalLessons: 2,
      completedLessons: 1,
      isActive: true,
    },
  ],
  resources: [
    { id: 'r1', content: 'Article on compound habits and weekly review loops', areaId: 'mind', type: 'article', status: 'pending', daysAgo: 1 },
    { id: 'r2', content: 'Short creator workflow clip', areaId: 'creative', type: 'video', status: 'accepted', daysAgo: 3, decision: 'vaulted' },
    { id: 'r3', content: 'Budget spreadsheet template', areaId: 'finance', type: 'tool', status: 'rejected', daysAgo: 5 },
  ],
  vaultItems: [
    { id: 'v1', type: 'quote', tag: 'focus', content: 'Small daily wins compound faster than sporadic intensity.', daysAgo: 2, source: 'Notebook' },
    { id: 'v2', type: 'win', tag: 'career', content: 'Shipped the dashboard skeleton and cleaned up routing.', daysAgo: 0 },
    { id: 'v3', type: 'note', tag: 'relationships', content: 'One call can reset a whole week.', daysAgo: 6 },
  ],
  dayRating: null,
  morningCheckIn: {
    energy: null,
    focus: '',
    dismissed: false,
  },
  eveningCheckIn: {
    rating: null,
    note: '',
    dismissed: false,
  },
  weeklyReflection: {
    q1: 'What moved forward this week?',
    q2: 'Where did you avoid friction?',
    q3: 'What needs less, not more?',
    q4: 'What should be kept simple next week?',
    nextAreaFocus: 'Career',
    commitment: 'Finish the LifeOS dashboard push.',
  },
};

export function createSeedState() {
  return {
    ...seedState,
    areas: seedState.areas.map((area) => ({ ...area })),
    tasks: seedState.tasks.map((task) => ({ ...task, subtasks: task.subtasks?.map((subtask) => ({ ...subtask })) })),
    projects: seedState.projects.map((project) => ({ ...project, tasks: [...project.tasks] })),
    habits: seedState.habits.map((habit) => ({
      ...habit,
      logs: habit.logs.map((log) => ({ ...log })),
      reminder: habit.reminder ? { ...habit.reminder } : undefined,
    })) as Habit[],
    notes: seedState.notes.map((note) => ({ ...note, topicIds: [...note.topicIds], linkedTaskIds: note.linkedTaskIds ? [...note.linkedTaskIds] : undefined })),
    topics: seedState.topics.map((topic) => ({ ...topic })),
    courses: seedState.courses.map((course) => ({
      ...course,
      modules: course.modules.map((module) => ({
        ...module,
        lessons: module.lessons.map((lesson) => ({ ...lesson })),
      })),
    })),
    resources: seedState.resources.map((resource) => ({ ...resource })),
    vaultItems: seedState.vaultItems.map((item) => ({ ...item })),
  } satisfies AppState;
}
