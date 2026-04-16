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
  streak: number;
  lastSevenDays: ("done" | "missed" | "pending")[];
}

export interface Task {
  id: string;
  title: string;
  areaId: string;
  priority: "P1" | "P2" | "P3";
  done: boolean;
  estimateMin?: number;
}

export interface AppState {
  theme: "dark" | "light";
  tasks: Task[];
  habits: Habit[];
  areas: LifeArea[];
  dayRating: number | null;
  vaultItems: VaultItem[];
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
  startHour: number;
  endHour: number;
  linkedTaskId?: string;
  linkedHabitId?: string;
  status: "planned" | "done" | "missed";
}

export interface ActionConversion {
  id: string;
  input: string;
  output: string;
  areaId: string;
  priority: Task["priority"];
  createdAt: string;
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

export interface Note {
  id: string;
  areaId: string;
  type: "Idea" | "Reflection" | "Research" | "Quote";
  title: string;
  preview: string;
  source: string;
  createdAt: string;
  body: string;
  keyPoints: string[];
  taskTitle?: string;
  taskAreaId?: string;
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
