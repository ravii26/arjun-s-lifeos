export type AreaId = 'career' | 'health' | 'mind' | 'finance' | 'relationships' | 'creative';

export interface LifeArea {
  id: AreaId;
  name: string;
  score: number;
  scoreDelta: number;
  color: string;
  icon: string;
  keyStat: string;
}

export type Priority = 'P1' | 'P2' | 'P3';
export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'cancelled';

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  areaId: AreaId;
  projectId?: string;
  dueDate?: string;
  estimateMin?: number;
  subtasks?: Subtask[];
  notes?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  areaId: AreaId;
  status: 'active' | 'paused' | 'done';
  tasks: string[];
  description?: string;
  dueDate?: string;
}

export type HabitTrackingType = 'boolean' | 'amount' | 'timer' | 'progress';
export type HabitDirection = 'build' | 'quit';
export type FrequencyType = 'daily' | 'weekdays' | 'weekends' | 'custom' | 'x_per_week';

export interface HabitReminder {
  time: string;
  enabled: boolean;
}

export interface HabitLog {
  date: string;
  done?: boolean;
  value?: number;
  seconds?: number;
  currentValue?: number;
  note?: string;
}

export interface Habit {
  id: string;
  name: string;
  areaId: AreaId;
  direction: HabitDirection;
  trackingType: HabitTrackingType;
  amountGoal?: number;
  amountUnit?: string;
  timerGoalSeconds?: number;
  timerUnit?: 'minutes' | 'hours';
  progressStart?: number;
  progressGoal?: number;
  progressUnit?: string;
  progressCurrent?: number;
  frequency: FrequencyType;
  frequencyDays?: number[];
  frequencyXPerWeek?: number;
  reminder?: HabitReminder;
  logs: HabitLog[];
  streak: number;
  bestStreak: number;
  createdAt: string;
  color?: string;
}

export interface Note {
  id: string;
  title: string;
  areaId: AreaId;
  notebookId?: string;
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  topicIds: string[];
  type: 'topic' | 'book-summary' | 'course-note' | 'mental-model' | 'reference';
  body: string;
  keyPoints: string[];
  source?: string;
  createdAt: string;
  linkedTaskIds?: string[];
}

export interface Topic {
  id: string;
  name: string;
  areaId?: AreaId;
  color: string;
}

export interface Lesson {
  id: string;
  title: string;
  done: boolean;
  isCurrent?: boolean;
  locked?: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
  locked: boolean;
}

export interface Course {
  id: string;
  title: string;
  areaId: AreaId;
  source: string;
  modules: CourseModule[];
  totalLessons: number;
  completedLessons: number;
  isActive: boolean;
}

export interface Resource {
  id: string;
  content: string;
  areaId?: AreaId;
  type?: string;
  status: 'pending' | 'accepted' | 'rejected';
  daysAgo: number;
  decision?: 'noted' | 'tasked' | 'vaulted' | 'habited';
}

export type VaultItemType = 'quote' | 'video' | 'note' | 'win' | 'voice' | 'image';

export interface VaultItem {
  id: string;
  type: VaultItemType;
  tag: string;
  content: string;
  daysAgo: number;
  source?: string;
}

export interface AppState {
  theme: 'dark' | 'light';
  areas: LifeArea[];
  tasks: Task[];
  projects: Project[];
  habits: Habit[];
  notes: Note[];
  topics: Topic[];
  courses: Course[];
  resources: Resource[];
  vaultItems: VaultItem[];
  dayRating: number | null;
  morningCheckIn: {
    energy: 'Low' | 'Medium' | 'High' | null;
    focus: string;
    dismissed: boolean;
  };
  eveningCheckIn: {
    rating: number | null;
    note: string;
    dismissed: boolean;
  };
  weeklyReflection: {
    q1: string;
    q2: string;
    q3: string;
    q4: string;
    nextAreaFocus: string;
    commitment: string;
  };
}

export interface HabitContextSnapshot {
  state: AppState;
  getTodayLogs: (habitId: string) => HabitLog | undefined;
  getTodayHabitStatus: (habitId: string) => 'done' | 'partial' | 'pending' | 'missed';
}
