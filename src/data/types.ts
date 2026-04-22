export interface LifeArea {
  id: string;
  name: string;
  score: number;
  scoreDelta: number;
  color: string;
  keyStat: string;
}

export interface Habit {
  id: string;
  name: string;
  areaId: string;
  trackingType: TrackingType;
  trackingConfig: TrackingConfig;
  trackingData?: TrackingData;
  streak: number;
  bestStreak: number;
  lastSevenDays: ("done" | "missed" | "pending")[];
  logs: HabitLog[];
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  areaId: string;
  priority: "P1" | "P2" | "P3";
  status: "pending" | "done" | "missed";
  date: string;
  trackingType: TrackingType;
  trackingConfig?: TrackingConfig;
  trackingData?: TrackingData;
  linkedSessionIds: string[];
  createdAt: string;
  completedAt?: string;
  done: boolean;
  estimateMin?: number;
  scheduledDate?: string;
  trackingLogs?: TrackingLog[];
}

export type TrackingType = "boolean" | "timer" | "count" | "progress" | "manual";

export interface TrackingConfig {
  unit?: string;
  targetValue?: number;
}

export interface TrackingData {
  value?: number;
  completed?: boolean;
  durationSec?: number;
  note?: string;
}

export interface HabitLog {
  date: string;
  value?: number;
  completed?: boolean;
  durationSec?: number;
  note?: string;
  status: "done" | "missed" | "pending";
}

export interface TrackingLog {
  id: string;
  date: string;
  createdAt: string;
  trackingType: TrackingType;
  value?: number;
  durationSec?: number;
  note?: string;
  completed?: boolean;
  status: "done" | "missed" | "pending";
}

export interface AppState {
  theme: "dark" | "light";
  tasks: Task[];
  habits: Habit[];
  areas: LifeArea[];
  dayRating: number | null;
  vaultItems: VaultItem[];
  skills: Skill[];
  concepts: Concept[];
  learningInbox: InboxLearningItem[];
  practiceLogs: PracticeLog[];
  learnNotes: Note[];
  learnCourses: Course[];
  resources: Resource[];
  pendingResources: Resource[];
  morningCheckIn: MorningCheckIn;
  eveningCheckIn: EveningCheckIn;
  weeklyReflection: WeeklyReflection;
  topics: Topic[];
  topicLinks: TopicLink[];
  notebookEntries: NotebookEntry[];
  timeBlocks: TimeBlock[];
  actionHistory: ActionConversion[];
  topicPages: TopicPage[];
  actionConverterHistory: ConvertedAction[];
  dumpItems: DumpItem[];
  vaultDeliveryLog: VaultDeliveryLog[];
  coachMessages: CoachMessage[];
  timeTrackerSessions: TimeTrackerSession[];
  activeTrackerSessionId: string | null;
}

export interface Topic {
  id: string;
  title: string;
  areaId: string;
  summary: string;
}

export interface TopicLink {
  id: string;
  topicId: string;
  label: string;
  strength: number;
}

export interface NotebookEntry {
  id: string;
  areaId: string;
  title: string;
  body: string;
  createdAt: string;
  topicIds: string[];
  convertedNoteId?: string;
}

export interface TimeBlock {
  id: string;
  date: string;
  title: string;
  areaId: string;
  startTime?: string;
  endTime?: string;
  startHour: number;
  endHour: number;
  linkedTaskId?: string;
  linkedHabitId?: string;
  linkedCourseId?: string;
  color?: string;
  notes?: string;
  status: "planned" | "done" | "missed";
}

export interface TopicPage {
  topicId: string;
  linkedNoteIds: string[];
  linkedCourseIds: string[];
  linkedResourceIds: string[];
}

export interface ConvertedAction {
  id: string;
  originalInput: string;
  detectedType: string;
  result: "note" | "task" | "habit" | "course" | "vault";
  resultId: string;
  createdAt: string;
}

export interface ActionConversion {
  id: string;
  input: string;
  output: string;
  areaId: string;
  priority: Task["priority"];
  createdAt: string;
}

export interface DumpItem {
  id: string;
  content: string;
  createdAt: string;
  processed: boolean;
  processingResult?: {
    suggestedType: string;
    areaId: string;
    reasoning: string;
    accepted: boolean;
  };
}

export interface VaultDeliveryLog {
  id: string;
  vaultItemId: string;
  triggeredBy: "emergency" | "auto-score" | "auto-habit" | "auto-rating";
  triggerDetail: string;
  response: "helped" | "skipped" | "another";
  deliveredAt: string;
}

export interface CoachMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  screenContext?: string;
}

export interface TimeTrackerSession {
  id: string;
  linkedTaskId?: string;
  linkedHabitId?: string;
  linkedCourseId?: string;
  areaId?: string;
  label: string;
  startedAt: string;
  endedAt?: string;
  durationSec: number;
}

export interface MorningCheckIn {
  energy: "Low" | "Medium" | "High" | null;
  focus: string;
  dismissed: boolean;
}

export interface EveningCheckIn {
  rating: number | null;
  note: string;
  dismissed: boolean;
}

export interface WeeklyReflection {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  nextAreaFocus: string;
  commitment: string;
}

export interface VaultItem {
  id: string;
  type: "Quote" | "Video" | "Note" | "Win";
  tag: string;
  content: string;
  daysAgo: number;
}

export type DomainId = "career" | "finance" | "mind" | "health" | "relationships" | "creative";

export type ConceptStatus = "new" | "learning" | "applied" | "mastered";

export type ReviewRating = "easy" | "hard";

export interface Skill {
  id: string;
  name: string;
  domainId: DomainId;
  whyItMatters: string;
  currentLevel: number;
  targetLevel: number;
  weeklyFocus: boolean;
  conceptIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Concept {
  id: string;
  title: string;
  domainId: DomainId;
  skillId?: string;
  sourceIds: string[];
  explanationSimple: string;
  example: string;
  useCaseInMyLife: string;
  firstAction: string;
  confidenceLevel: 1 | 2 | 3 | 4 | 5;
  status: ConceptStatus;
  nextReviewDate: string;
  reviewIntervalDays: number;
  reviewCount: number;
  lastReviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PracticeLog {
  id: string;
  conceptId: string;
  whatIDid: string;
  result: string;
  lessonLearned: string;
  createdAt: string;
}

export interface InboxLearningItem {
  id: string;
  rawText: string;
  domainHint?: DomainId;
  sourceType: "link" | "video" | "book" | "idea" | "course";
  createdAt: string;
  convertedConceptId?: string;
}

export interface Note {
  id: string;
  areaId: string;
  topicIds?: string[];
  type: "Idea" | "Reflection" | "Research" | "Quote";
  title: string;
  preview: string;
  source: string;
  createdAt: string;
  body: string;
  keyPoints: string[];
  reviewDueDate?: string;
  reviewIntervalDays?: number;
  lastReviewedAt?: string;
  reviewCount?: number;
  taskTitle?: string;
  taskAreaId?: string;
  linkedLesson?: {
    courseId: string;
    moduleId: string;
    lessonId: string;
  };
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  areaId: string;
  progress: number;
  totalLessons: number;
  nextLesson: string;
  active: boolean;
  paused?: boolean;
}

export interface Resource {
  id: string;
  source: string;
  areaId: string;
  type: string;
  insight: string;
  suggestedAction: string;
  status: "pending" | "accepted" | "rejected";
  ageDays: number;
}
