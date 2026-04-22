import type {
  ActionConversion,
  AppState,
  CoachMessage,
  DumpItem,
  Habit,
  Task,
  TimeTrackerSession,
  VaultDeliveryLog,
  VaultItem,
} from "../data/types";

export type AreaId = AppState["areas"][number]["id"];

export interface UpgradedVaultItem extends VaultItem {
  aiContext?: {
    suggestedType: string;
    areaId: AreaId;
    reasoning: string;
    accepted: boolean;
  };
}

export type FinalAppState = AppState;

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
