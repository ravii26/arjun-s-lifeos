import type { AppState as BaseAppState, Habit, Task, VaultItem } from "../data/types";

export type AreaId = BaseAppState["areas"][number]["id"];

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
  areaId?: AreaId;
  label: string;
  startedAt: string;
  endedAt?: string;
  durationSec: number;
}

export interface ActionConversion {
  id: string;
  input: string;
  output: string;
  areaId: AreaId;
  priority: Task["priority"];
  createdAt: string;
}

export interface UpgradedVaultItem extends VaultItem {
  aiContext?: {
    suggestedType: string;
    areaId: AreaId;
    reasoning: string;
    accepted: boolean;
  };
}

export interface FinalAppState extends BaseAppState {
  dumpItems: DumpItem[];
  vaultDeliveryLog: VaultDeliveryLog[];
  coachMessages: CoachMessage[];
  timeTrackerSessions: TimeTrackerSession[];
  activeTrackerSessionId: string | null;
  vaultItems: UpgradedVaultItem[];
}

export type TimeTrackerSessionStart = {
  id: string;
  label: string;
  startedAt: string;
  areaId?: AreaId;
  linkedTaskId?: string;
  linkedHabitId?: string;
  linkedCourseId?: string;
};

export type DumpProcessingResult = {
  suggestedType: string;
  areaId: AreaId;
  reasoning: string;
  accepted: boolean;
};

export type CoachHistoryItem = Pick<CoachMessage, "id" | "role" | "content" | "timestamp" | "screenContext">;

export type TrackerSessionInput = Pick<TimeTrackerSession, "id" | "label" | "startedAt" | "areaId" | "linkedTaskId" | "linkedHabitId" | "linkedCourseId">;

export type TrackerSessionDraft = Pick<TimeTrackerSession, "id" | "label" | "startedAt" | "areaId" | "linkedTaskId" | "linkedHabitId" | "linkedCourseId">;

export type VaultUpgradeContext = {
  suggestedType: string;
  areaId: AreaId;
  reasoning: string;
  accepted: boolean;
};

export type TaskLike = Task | { id: string; title: string; areaId: AreaId; done?: boolean };
export type HabitLike = Habit | { id: string; name: string; areaId: AreaId };
