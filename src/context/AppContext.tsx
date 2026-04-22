import { ReactNode, createContext, useContext, useEffect, useMemo, useReducer } from "react";
import {
  ActionConversion,
  AppState,
  CoachMessage,
  Concept,
  Course,
  DumpItem,
  Habit,
  HabitLog,
  InboxLearningItem,
  LifeArea,
  Note,
  NotebookEntry,
  PracticeLog,
  Resource,
  ReviewRating,
  Skill,
  Task,
  TrackingConfig,
  TrackingData,
  TrackingLog,
  TrackingType,
  TimeTrackerSession,
  TimeBlock,
  VaultDeliveryLog,
  VaultItem,
} from "../data/types";
import {
  actionHistory,
  actionConverterHistory,
  areas,
  eveningCheckIn,
  habits,
  concepts,
  learningInbox,
  learnCourses,
  learnNotes,
  practiceLogs,
  morningCheckIn,
  notebookEntries,
  pendingResources,
  resources,
  skills,
  tasks,
  timeBlocks,
  todayTaskIds,
  topicPages,
  topicLinks,
  topics,
  vaultItems,
  weeklyReflection,
} from "../data/seed";
import type { FinalAppState, VaultUpgradeContext } from "../types";
import { coachMessages, dumpItems, timeTrackerSessions, vaultDeliveryLog } from "./finalSeed";
import { addDaysToDateKey, getDayDifference, getTodayDateKey } from "../lib/date";

const THEME_STORAGE_KEY = "lifeos-theme";
const MORNING_DISMISS_STORAGE_KEY = "lifeos-morning-dismissed";
const APP_STATE_STORAGE_KEY = "lifeos-app-state-v1";
const SEED_ACTIVE_DATE = "2026-04-16";

type Action =
  | { type: "TOGGLE_THEME" }
  | { type: "REPLACE_APP_STATE"; payload: { state: Partial<FinalAppState> } }
  | { type: "RESET_APP_STATE" }
  | { type: "TOGGLE_TASK"; payload: { taskId: string } }
  | { type: "LOG_HABIT"; payload: { habitId: string } }
  | { type: "UPDATE_HABIT"; payload: { habitId: string; updates: Partial<Habit> } }
  | {
      type: "LOG_TRACKING_ENTRY";
      payload: {
        entityType: "task" | "habit";
        entityId: string;
        value?: number;
        durationSec?: number;
        completed?: boolean;
        note?: string;
      };
    }
  | { type: "SET_DAY_RATING"; payload: { value: number | null } }
  | { type: "ADD_TASK"; payload: { task: Task } }
  | { type: "UPDATE_TASK"; payload: { taskId: string; updates: Partial<Task> } }
  | { type: "DELETE_TASK"; payload: { taskId: string } }
  | { type: "ADD_HABIT"; payload: { habit: Habit } }
  | { type: "DELETE_HABIT"; payload: { habitId: string } }
  | { type: "ADD_VAULT_ITEM"; payload: { item: VaultItem } }
  | { type: "ADD_SKILL"; payload: { skill: Skill } }
  | { type: "ADD_CONCEPT"; payload: { concept: Concept } }
  | { type: "UPDATE_SKILL"; payload: { skillId: string; updates: Partial<Skill> } }
  | { type: "TOGGLE_SKILL_WEEKLY_FOCUS"; payload: { skillId: string } }
  | { type: "ADD_LEARNING_INBOX_ITEM"; payload: { item: InboxLearningItem } }
  | { type: "CONVERT_INBOX_TO_CONCEPT"; payload: { inboxItemId: string; concept: Concept } }
  | { type: "UPDATE_CONCEPT"; payload: { conceptId: string; updates: Partial<Concept> } }
  | { type: "COMPLETE_CONCEPT_REVIEW"; payload: { conceptId: string; rating: ReviewRating } }
  | { type: "SNOOZE_CONCEPT_REVIEW"; payload: { conceptId: string; days: number } }
  | { type: "ADD_PRACTICE_LOG"; payload: { log: PracticeLog } }
  | { type: "ADD_NOTE"; payload: { note: Note } }
  | { type: "UPDATE_NOTE"; payload: { noteId: string; updates: Partial<Note> } }
  | { type: "COMPLETE_NOTE_REVIEW"; payload: { noteId: string } }
  | { type: "SNOOZE_NOTE_REVIEW"; payload: { noteId: string; days: number } }
  | { type: "ADD_TASK_FROM_NOTE"; payload: { task: Task; noteId: string } }
  | { type: "ACCEPT_RESOURCE"; payload: { resourceId: string } }
  | { type: "REJECT_RESOURCE"; payload: { resourceId: string } }
  | { type: "ADD_PENDING_RESOURCE"; payload: { resource: Resource } }
  | { type: "ADD_COURSE"; payload: { course: Course } }
  | { type: "SET_ACTIVE_COURSE"; payload: { courseId: string } }
  | {
      type: "SET_MORNING_CHECKIN";
      payload: { energy: "Low" | "Medium" | "High" | null; focus: string; dismissed?: boolean };
    }
  | { type: "DISMISS_MORNING" }
  | { type: "SET_EVENING_CHECKIN"; payload: { rating: number | null; note: string } }
  | { type: "DISMISS_EVENING" }
  | { type: "SAVE_REFLECTION"; payload: AppState["weeklyReflection"] }
  | { type: "MARK_LESSON_COMPLETE" }
  | { type: "ADD_TOPIC_NOTE_LINK"; payload: { topicId: string; noteId: string } }
  | { type: "CONVERT_NOTEBOOK_TO_NOTE"; payload: { entryId: string } }
  | { type: "ADD_TIME_BLOCK"; payload: { block: TimeBlock } }
  | { type: "UPDATE_TIME_BLOCK"; payload: { blockId: string; updates: Partial<TimeBlock> } }
  | { type: "DELETE_TIME_BLOCK"; payload: { blockId: string } }
  | { type: "UPDATE_TIME_BLOCK_STATUS"; payload: { blockId: string; status: TimeBlock["status"] } }
  | { type: "ADD_ACTION_HISTORY"; payload: { item: ActionConversion } }
  | {
      type: "ADD_CONVERTED_ACTION";
      payload: {
        item: {
          id: string;
          originalInput: string;
          detectedType: string;
          result: "note" | "task" | "habit" | "course" | "vault";
          resultId: string;
          createdAt: string;
        };
      };
    }
  | {
      type: "LINK_NOTE_TO_LESSON";
      payload: { noteId: string; courseId: string; moduleId: string; lessonId: string };
    }
  | { type: "ADD_NOTEBOOK_ENTRY"; payload: { entry: NotebookEntry } }
  | { type: "ADD_DUMP_ITEM"; payload: { item: DumpItem } }
  | { type: "UPDATE_DUMP_ITEM"; payload: { item: DumpItem } }
  | { type: "DELETE_DUMP_ITEM"; payload: { itemId: string } }
  | { type: "CLEAR_PROCESSED_DUMPS" }
  | { type: "LOG_VAULT_DELIVERY"; payload: { entry: VaultDeliveryLog } }
  | { type: "ADD_COACH_MESSAGE"; payload: { message: CoachMessage } }
  | { type: "CLEAR_COACH_HISTORY" }
  | { type: "START_TRACKER_SESSION"; payload: { session: TimeTrackerSession } }
  | { type: "END_TRACKER_SESSION"; payload: { sessionId: string; endedAt: string; durationSec: number } }
  | { type: "DISCARD_TRACKER_SESSION" }
  | { type: "UPGRADE_VAULT_ITEM"; payload: { itemId: string; context: VaultUpgradeContext } };

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const getStoredTheme = (): "dark" | "light" => {
  if (typeof window === "undefined") {
    return "dark";
  }
  const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
  return saved === "light" ? "light" : "dark";
};

const getMorningDismissed = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }
  return window.sessionStorage.getItem(MORNING_DISMISS_STORAGE_KEY) === "1";
};

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const mapLegacyModeToTrackingType = (mode?: string): TrackingType => {
  switch (mode) {
    case "duration":
      return "timer";
    case "count":
      return "count";
    case "rating":
      return "progress";
    case "binary":
    default:
      return "boolean";
  }
};

const normalizeTrackingConfig = (config?: TrackingConfig): TrackingConfig => ({
  targetValue: config?.targetValue,
  unit: config?.unit,
});

const toTargetSeconds = (config?: TrackingConfig): number | undefined => {
  if (!config?.targetValue || config.targetValue <= 0) {
    return undefined;
  }
  const normalizedUnit = config.unit?.toLowerCase() ?? "min";
  if (normalizedUnit.includes("sec")) {
    return config.targetValue;
  }
  if (normalizedUnit.includes("hour") || normalizedUnit === "h" || normalizedUnit === "hr" || normalizedUnit === "hrs") {
    return config.targetValue * 3600;
  }
  return config.targetValue * 60;
};

const isTrackingComplete = (
  trackingType: TrackingType,
  config: TrackingConfig,
  data: TrackingData,
  entityType: "task" | "habit",
): boolean => {
  switch (trackingType) {
    case "boolean":
      return data.completed === true;
    case "timer": {
      const durationSec = data.durationSec ?? 0;
      const targetSec = toTargetSeconds(config);
      if (targetSec) {
        return durationSec >= targetSec;
      }
      return entityType === "task" ? durationSec > 0 : false;
    }
    case "count":
    case "progress": {
      if (!config.targetValue || config.targetValue <= 0) {
        return false;
      }
      return (data.value ?? 0) >= config.targetValue;
    }
    case "manual":
      return data.completed === true;
    default:
      return false;
  }
};

const toStatus = (completed: boolean): "done" | "pending" => (completed ? "done" : "pending");

const createTrackingLog = ({
  trackingType,
  completed,
  value,
  durationSec,
  note,
}: {
  trackingType: TrackingType;
  completed: boolean;
  value?: number;
  durationSec?: number;
  note?: string;
}): TrackingLog => ({
  id: `trk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  date: todayDateKey,
  createdAt: new Date().toISOString(),
  trackingType,
  value,
  durationSec,
  note,
  completed: completed || undefined,
  status: completed ? "done" : "pending",
});

const todayDateKey = getTodayDateKey();
const seedDateOffset = getDayDifference(SEED_ACTIVE_DATE, todayDateKey);

const normalizeTask = (task: Task): Task => {
  const legacyTask = task as Task & {
    tracking?: { mode?: string; targetValue?: number; unit?: string };
    trackingLogs?: Array<{ numericValue?: number; durationSec?: number; note?: string; completed?: boolean; mode?: string }>;
  };
  const trackingType = task.trackingType ?? mapLegacyModeToTrackingType(legacyTask.tracking?.mode);
  const trackingConfig = normalizeTrackingConfig(task.trackingConfig ?? legacyTask.tracking);
  const trackingLogs = (task.trackingLogs ?? legacyTask.trackingLogs ?? []).map((log) => ({
    id: "id" in log && typeof log.id === "string" ? log.id : `trk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    date: "date" in log && typeof log.date === "string" ? log.date : todayDateKey,
    createdAt: "createdAt" in log && typeof log.createdAt === "string" ? log.createdAt : new Date().toISOString(),
    trackingType: "trackingType" in log && log.trackingType ? log.trackingType : trackingType,
    value: "value" in log ? log.value : log.numericValue,
    durationSec: "durationSec" in log ? log.durationSec : undefined,
    note: "note" in log ? log.note : undefined,
    completed: "completed" in log ? log.completed : undefined,
    status: "status" in log && log.status ? log.status : log.completed ? "done" : "pending",
  }));
  const latestLog = trackingLogs.at(-1);
  const trackingData: TrackingData = task.trackingData ?? {
    completed: task.done,
    value: latestLog?.value,
    durationSec: latestLog?.durationSec,
    note: latestLog?.note,
  };
  const done = task.done ?? task.status === "done";

  return {
    ...task,
    status: task.status ?? (done ? "done" : "pending"),
    date: task.date ?? task.scheduledDate ?? todayDateKey,
    trackingType,
    trackingConfig,
    trackingData,
    trackingLogs,
    linkedSessionIds: task.linkedSessionIds ?? [],
    createdAt: task.createdAt ?? new Date().toISOString(),
    done,
  };
};

const normalizeHabit = (habit: Habit): Habit => {
  const legacyHabit = habit as Habit & {
    tracking?: { mode?: string; targetValue?: number; unit?: string };
    trackingLogs?: Array<{ date?: string; numericValue?: number; durationSec?: number; note?: string; completed?: boolean }>;
  };
  const trackingType = habit.trackingType ?? mapLegacyModeToTrackingType(legacyHabit.tracking?.mode);
  const trackingConfig = normalizeTrackingConfig(habit.trackingConfig ?? legacyHabit.tracking);
  const logs: HabitLog[] = (habit.logs ?? legacyHabit.trackingLogs ?? []).map((log) => ({
    date: log.date ?? todayDateKey,
    value: "value" in log ? log.value : log.numericValue,
    completed: log.completed,
    durationSec: log.durationSec,
    note: log.note,
    status: "status" in log && log.status ? log.status : log.completed ? "done" : "pending",
  }));
  const latest = logs.at(-1);

  return {
    ...habit,
    trackingType,
    trackingConfig,
    trackingData: habit.trackingData ?? {
      completed: latest?.completed,
      value: latest?.value,
      durationSec: latest?.durationSec,
      note: latest?.note,
    },
    bestStreak: habit.bestStreak ?? habit.streak,
    logs,
    createdAt: habit.createdAt ?? new Date().toISOString(),
  };
};

const seededTasks = tasks.map((task) =>
  normalizeTask(todayTaskIds.includes(task.id) ? { ...task, scheduledDate: todayDateKey } : task),
);

const seededHabits = habits.map(normalizeHabit);

const seededTimeBlocks = timeBlocks.map((block) => ({
  ...block,
  date: addDaysToDateKey(block.date, seedDateOffset),
}));

const baseInitialState: FinalAppState = {
  theme: getStoredTheme(),
  tasks: seededTasks,
  habits: seededHabits,
  areas,
  dayRating: null,
  vaultItems,
  skills,
  concepts,
  learningInbox,
  practiceLogs,
  learnNotes,
  learnCourses,
  resources,
  pendingResources,
  morningCheckIn: {
    ...morningCheckIn,
    dismissed: getMorningDismissed(),
  },
  eveningCheckIn,
  weeklyReflection,
  topics,
  topicLinks,
  notebookEntries,
  timeBlocks: seededTimeBlocks,
  actionHistory,
  topicPages,
  actionConverterHistory,
  dumpItems,
  vaultDeliveryLog,
  coachMessages,
  timeTrackerSessions,
  activeTrackerSessionId: null,
};

const loadSavedState = (): Partial<FinalAppState> | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(APP_STATE_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as Partial<FinalAppState>;
  } catch {
    return null;
  }
};

const normalizePartialState = (state: Partial<FinalAppState> | null): Partial<FinalAppState> | null => {
  if (!state) {
    return null;
  }

  return {
    ...state,
    tasks: state.tasks?.map(normalizeTask),
    habits: state.habits?.map(normalizeHabit),
  };
};

const recomputeAreas = (state: Pick<AppState, "areas" | "tasks" | "habits">): LifeArea[] => {
  return state.areas.map((area) => {
    const areaTasks = state.tasks.filter((task) => task.areaId === area.id);
    const areaHabits = state.habits.filter((habit) => habit.areaId === area.id);

    const taskDone = areaTasks.filter((task) => task.done).length;
    const taskCompletion = areaTasks.length > 0 ? taskDone / areaTasks.length : null;

    const habitWeekEntries = areaHabits.flatMap((habit) => habit.lastSevenDays);
    const habitDone = habitWeekEntries.filter((entry) => entry === "done").length;
    const habitTrackable = habitWeekEntries.filter((entry) => entry !== "pending").length;
    const habitCompletion = habitTrackable > 0 ? habitDone / habitTrackable : null;

    const components = [taskCompletion, habitCompletion].filter((value): value is number => value !== null);
    const consistency = components.length > 0 ? components.reduce((acc, value) => acc + value, 0) / components.length : area.score / 100;
    const baseline = components.length === 0 ? area.score : area.score * 0.3;
    const computed =
      baseline +
      (taskCompletion ?? consistency) * 35 +
      (habitCompletion ?? consistency) * 40 +
      consistency * 25;
    const score = Math.round(clamp(computed, 0, 100));
    const delta = score - area.score;

    const keyStat =
      areaTasks.length > 0
        ? `${taskDone}/${areaTasks.length} tasks completed`
        : areaHabits.length > 0
          ? `${habitDone}/${Math.max(habitTrackable, 1)} habit marks`
          : area.keyStat;

    return {
      ...area,
      score,
      scoreDelta: delta,
      keyStat,
    };
  });
};

const initialState: FinalAppState = {
  ...baseInitialState,
  ...normalizePartialState(loadSavedState()),
};

const AppContext = createContext<AppContextValue | null>(null);

const appReducer = (state: FinalAppState, action: Action): FinalAppState => {
  switch (action.type) {
    case "REPLACE_APP_STATE": {
      return {
        ...baseInitialState,
        ...normalizePartialState(action.payload.state),
      };
    }
    case "RESET_APP_STATE": {
      return {
        ...baseInitialState,
        theme: state.theme,
      };
    }
    case "TOGGLE_THEME": {
      return {
        ...state,
        theme: state.theme === "dark" ? "light" : "dark",
      };
    }
    case "TOGGLE_TASK": {
      const nextTasks = state.tasks.map((task) =>
        task.id === action.payload.taskId
          ? {
              ...task,
              done: !task.done,
              status: !task.done ? "done" : "pending",
              completedAt: !task.done ? new Date().toISOString() : undefined,
              trackingData: {
                ...task.trackingData,
                completed: !task.done,
              },
              trackingLogs: !task.done
                ? [
                    ...(task.trackingLogs ?? []),
                    createTrackingLog({
                      trackingType: task.trackingType,
                      completed: true,
                      value: task.trackingData?.value,
                      durationSec: task.trackingData?.durationSec,
                      note: task.trackingData?.note,
                    }),
                  ]
                : task.trackingLogs,
            }
          : task,
      );
      return {
        ...state,
        tasks: nextTasks,
        areas: recomputeAreas({ ...state, tasks: nextTasks }),
      };
    }
    case "LOG_HABIT": {
      const nextHabits = state.habits.map((habit) => {
        if (habit.id !== action.payload.habitId) {
          return habit;
        }
        const nextDays = [...habit.lastSevenDays];
        const pendingIndex = nextDays.lastIndexOf("pending");
        if (pendingIndex === -1) {
          return habit;
        }
        nextDays[pendingIndex] = "done";
        const nextStreak = habit.streak + 1;
        const log: HabitLog = {
          date: todayDateKey,
          completed: true,
          value: habit.trackingData?.value,
          durationSec: habit.trackingData?.durationSec,
          note: habit.trackingData?.note,
          status: "done",
        };
        return {
          ...habit,
          lastSevenDays: nextDays,
          streak: nextStreak,
          bestStreak: Math.max(habit.bestStreak, nextStreak),
          trackingData: {
            ...habit.trackingData,
            completed: true,
          },
          logs: [...habit.logs.filter((entry) => entry.date !== todayDateKey), log],
        };
      });
      return {
        ...state,
        habits: nextHabits,
        areas: recomputeAreas({ ...state, habits: nextHabits }),
      };
    }
    case "UPDATE_HABIT": {
      const nextHabits = state.habits.map((habit) =>
        habit.id === action.payload.habitId ? normalizeHabit({ ...habit, ...action.payload.updates }) : habit,
      );
      return {
        ...state,
        habits: nextHabits,
        areas: recomputeAreas({ ...state, habits: nextHabits }),
      };
    }
    case "LOG_TRACKING_ENTRY": {
      if (action.payload.entityType === "task") {
        const nextTasks = state.tasks.map((task) => {
          if (task.id !== action.payload.entityId) {
            return task;
          }

          const nextData: TrackingData = {
            ...task.trackingData,
            value: action.payload.value ?? task.trackingData?.value,
            durationSec:
              task.trackingType === "timer" && typeof action.payload.durationSec === "number"
                ? (task.trackingData?.durationSec ?? 0) + action.payload.durationSec
                : task.trackingData?.durationSec,
            note: action.payload.note ?? task.trackingData?.note,
            completed: action.payload.completed ?? task.trackingData?.completed,
          };

          const completed = isTrackingComplete(task.trackingType, task.trackingConfig ?? {}, nextData, "task");

          return {
            ...task,
            done: completed || task.done,
            status: completed || task.done ? "done" : "pending",
            completedAt: completed || task.done ? task.completedAt ?? new Date().toISOString() : undefined,
            trackingData: nextData,
            trackingLogs: [
              ...(task.trackingLogs ?? []),
              createTrackingLog({
                trackingType: task.trackingType,
                completed,
                value: nextData.value,
                durationSec: nextData.durationSec,
                note: action.payload.note,
              }),
            ],
          };
        });

        return {
          ...state,
          tasks: nextTasks,
          areas: recomputeAreas({ ...state, tasks: nextTasks }),
        };
      }

      const nextHabits = state.habits.map((habit) => {
        if (habit.id !== action.payload.entityId) {
          return habit;
        }
        const nextData: TrackingData = {
          ...habit.trackingData,
          value: action.payload.value ?? habit.trackingData?.value,
          durationSec:
            habit.trackingType === "timer" && typeof action.payload.durationSec === "number"
              ? (habit.trackingData?.durationSec ?? 0) + action.payload.durationSec
              : habit.trackingData?.durationSec,
          note: action.payload.note ?? habit.trackingData?.note,
          completed: action.payload.completed ?? habit.trackingData?.completed,
        };
        const completed = isTrackingComplete(habit.trackingType, habit.trackingConfig, nextData, "habit");
        const nextDays = [...habit.lastSevenDays];
        const pendingIndex = nextDays.lastIndexOf("pending");
        if (completed && pendingIndex !== -1) {
          nextDays[pendingIndex] = "done";
        }

        const nextStreak = completed && pendingIndex !== -1 ? habit.streak + 1 : habit.streak;
        const nextLog: HabitLog = {
          date: todayDateKey,
          value: nextData.value,
          completed,
          durationSec: nextData.durationSec,
          note: nextData.note,
          status: toStatus(completed),
        };

        return {
          ...habit,
          lastSevenDays: nextDays,
          streak: nextStreak,
          bestStreak: Math.max(habit.bestStreak, nextStreak),
          trackingData: nextData,
          logs: [...habit.logs.filter((entry) => entry.date !== todayDateKey), nextLog],
        };
      });

      return {
        ...state,
        habits: nextHabits,
        areas: recomputeAreas({ ...state, habits: nextHabits }),
      };
    }
    case "SET_DAY_RATING": {
      return {
        ...state,
        dayRating: action.payload.value,
      };
    }
    case "ADD_TASK": {
      const nextTasks = [...state.tasks, normalizeTask(action.payload.task)];
      return {
        ...state,
        tasks: nextTasks,
        areas: recomputeAreas({ ...state, tasks: nextTasks }),
      };
    }
    case "DELETE_TASK": {
      const nextTasks = state.tasks.filter((task) => task.id !== action.payload.taskId);
      return {
        ...state,
        tasks: nextTasks,
        areas: recomputeAreas({ ...state, tasks: nextTasks }),
      };
    }
    case "UPDATE_TASK": {
      const nextTasks = state.tasks.map((task) =>
        task.id === action.payload.taskId ? normalizeTask({ ...task, ...action.payload.updates }) : task,
      );
      return {
        ...state,
        tasks: nextTasks,
        areas: recomputeAreas({ ...state, tasks: nextTasks }),
      };
    }
    case "ADD_HABIT": {
      const nextHabits = [...state.habits, normalizeHabit(action.payload.habit)];
      return {
        ...state,
        habits: nextHabits,
        areas: recomputeAreas({ ...state, habits: nextHabits }),
      };
    }
    case "DELETE_HABIT": {
      const nextHabits = state.habits.filter((habit) => habit.id !== action.payload.habitId);
      return {
        ...state,
        habits: nextHabits,
        areas: recomputeAreas({ ...state, habits: nextHabits }),
      };
    }
    case "ADD_VAULT_ITEM": {
      return {
        ...state,
        vaultItems: [action.payload.item, ...state.vaultItems],
      };
    }
    case "ADD_CONCEPT": {
      const concept = action.payload.concept;
      return {
        ...state,
        concepts: [concept, ...state.concepts],
        skills: state.skills.map((skill) =>
          skill.id === concept.skillId && !skill.conceptIds.includes(concept.id)
            ? { ...skill, conceptIds: [...skill.conceptIds, concept.id], updatedAt: todayDateKey }
            : skill,
        ),
      };
    }
    case "ADD_SKILL": {
      return {
        ...state,
        skills: [action.payload.skill, ...state.skills],
      };
    }
    case "UPDATE_SKILL": {
      return {
        ...state,
        skills: state.skills.map((skill) =>
          skill.id === action.payload.skillId ? { ...skill, ...action.payload.updates, updatedAt: todayDateKey } : skill,
        ),
      };
    }
    case "TOGGLE_SKILL_WEEKLY_FOCUS": {
      return {
        ...state,
        skills: state.skills.map((skill) =>
          skill.id === action.payload.skillId
            ? { ...skill, weeklyFocus: !skill.weeklyFocus, updatedAt: todayDateKey }
            : skill,
        ),
      };
    }
    case "ADD_LEARNING_INBOX_ITEM": {
      return {
        ...state,
        learningInbox: [action.payload.item, ...state.learningInbox],
      };
    }
    case "CONVERT_INBOX_TO_CONCEPT": {
      const inboxItem = state.learningInbox.find((item) => item.id === action.payload.inboxItemId);
      if (!inboxItem) {
        return state;
      }
      return {
        ...state,
        concepts: [action.payload.concept, ...state.concepts],
        learningInbox: state.learningInbox.map((item) =>
          item.id === inboxItem.id ? { ...item, convertedConceptId: action.payload.concept.id } : item,
        ),
        skills: state.skills.map((skill) =>
          skill.id === action.payload.concept.skillId && !skill.conceptIds.includes(action.payload.concept.id)
            ? { ...skill, conceptIds: [...skill.conceptIds, action.payload.concept.id], updatedAt: todayDateKey }
            : skill,
        ),
      };
    }
    case "UPDATE_CONCEPT": {
      return {
        ...state,
        concepts: state.concepts.map((concept) =>
          concept.id === action.payload.conceptId ? { ...concept, ...action.payload.updates, updatedAt: todayDateKey } : concept,
        ),
      };
    }
    case "COMPLETE_CONCEPT_REVIEW": {
      const concept = state.concepts.find((item) => item.id === action.payload.conceptId);
      if (!concept) {
        return state;
      }
      const nextIntervalDays = action.payload.rating === "easy" ? Math.max(1, Math.round((concept.reviewIntervalDays || 1) * 2.2)) : 1;
      return {
        ...state,
        concepts: state.concepts.map((item) =>
          item.id === action.payload.conceptId
            ? {
                ...item,
                reviewCount: item.reviewCount + 1,
                reviewIntervalDays: nextIntervalDays,
                nextReviewDate: addDaysToDateKey(todayDateKey, nextIntervalDays),
                lastReviewedAt: todayDateKey,
                status: action.payload.rating === "easy" && item.reviewCount >= 2 ? "applied" : item.status === "new" ? "learning" : item.status,
                updatedAt: todayDateKey,
              }
            : item,
        ),
      };
    }
    case "SNOOZE_CONCEPT_REVIEW": {
      return {
        ...state,
        concepts: state.concepts.map((concept) =>
          concept.id === action.payload.conceptId
            ? {
                ...concept,
                nextReviewDate: addDaysToDateKey(todayDateKey, action.payload.days),
                updatedAt: todayDateKey,
              }
            : concept,
        ),
      };
    }
    case "ADD_PRACTICE_LOG": {
      return {
        ...state,
        practiceLogs: [action.payload.log, ...state.practiceLogs],
      };
    }
    case "ADD_NOTE": {
      return {
        ...state,
        learnNotes: [action.payload.note, ...state.learnNotes],
      };
    }
    case "UPDATE_NOTE": {
      return {
        ...state,
        learnNotes: state.learnNotes.map((note) =>
          note.id === action.payload.noteId ? { ...note, ...action.payload.updates } : note,
        ),
      };
    }
    case "COMPLETE_NOTE_REVIEW": {
      const note = state.learnNotes.find((item) => item.id === action.payload.noteId);
      if (!note) {
        return state;
      }
      const nextIntervalDays = clamp((note.reviewIntervalDays ?? 2) * 2, 2, 21);
      return {
        ...state,
        learnNotes: state.learnNotes.map((item) =>
          item.id === action.payload.noteId
            ? {
                ...item,
                lastReviewedAt: todayDateKey,
                reviewDueDate: addDaysToDateKey(todayDateKey, nextIntervalDays),
                reviewIntervalDays: nextIntervalDays,
                reviewCount: (item.reviewCount ?? 0) + 1,
              }
            : item,
        ),
      };
    }
    case "SNOOZE_NOTE_REVIEW": {
      const note = state.learnNotes.find((item) => item.id === action.payload.noteId);
      if (!note) {
        return state;
      }
      return {
        ...state,
        learnNotes: state.learnNotes.map((item) =>
          item.id === action.payload.noteId
            ? {
                ...item,
                reviewDueDate: addDaysToDateKey(todayDateKey, action.payload.days),
              }
            : item,
        ),
      };
    }
    case "ADD_TASK_FROM_NOTE": {
      const nextTasks = [...state.tasks, normalizeTask(action.payload.task)];
      return {
        ...state,
        tasks: nextTasks,
        areas: recomputeAreas({ ...state, tasks: nextTasks }),
        learnNotes: state.learnNotes.map((note) =>
          note.id === action.payload.noteId
            ? { ...note, taskTitle: action.payload.task.title, taskAreaId: action.payload.task.areaId }
            : note,
        ),
      };
    }
    case "ACCEPT_RESOURCE": {
      const accepted = state.pendingResources.find((resource) => resource.id === action.payload.resourceId);
      if (!accepted) {
        return state;
      }
      return {
        ...state,
        pendingResources: state.pendingResources.filter((resource) => resource.id !== action.payload.resourceId),
        resources: [{ ...accepted, status: "accepted" }, ...state.resources],
      };
    }
    case "REJECT_RESOURCE": {
      const rejected = state.pendingResources.find((resource) => resource.id === action.payload.resourceId);
      if (!rejected) {
        return state;
      }
      return {
        ...state,
        pendingResources: state.pendingResources.filter((resource) => resource.id !== action.payload.resourceId),
        resources: [{ ...rejected, status: "rejected" }, ...state.resources],
      };
    }
    case "ADD_PENDING_RESOURCE": {
      return {
        ...state,
        pendingResources: [action.payload.resource, ...state.pendingResources],
      };
    }
    case "ADD_COURSE": {
      return {
        ...state,
        learnCourses: [action.payload.course, ...state.learnCourses],
      };
    }
    case "SET_ACTIVE_COURSE": {
      return {
        ...state,
        learnCourses: state.learnCourses.map((course) => ({
          ...course,
          active: course.id === action.payload.courseId,
          paused: course.id === action.payload.courseId ? false : course.paused,
        })),
      };
    }
    case "SET_MORNING_CHECKIN": {
      return {
        ...state,
        morningCheckIn: {
          energy: action.payload.energy,
          focus: action.payload.focus,
          dismissed: action.payload.dismissed ?? state.morningCheckIn.dismissed,
        },
      };
    }
    case "DISMISS_MORNING": {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(MORNING_DISMISS_STORAGE_KEY, "1");
      }
      return {
        ...state,
        morningCheckIn: {
          ...state.morningCheckIn,
          dismissed: true,
        },
      };
    }
    case "SET_EVENING_CHECKIN": {
      return {
        ...state,
        eveningCheckIn: {
          rating: action.payload.rating,
          note: action.payload.note,
          dismissed: false,
        },
      };
    }
    case "DISMISS_EVENING": {
      return {
        ...state,
        eveningCheckIn: {
          ...state.eveningCheckIn,
          dismissed: true,
        },
      };
    }
    case "SAVE_REFLECTION": {
      return {
        ...state,
        weeklyReflection: action.payload,
      };
    }
    case "MARK_LESSON_COMPLETE": {
      return {
        ...state,
        learnCourses: state.learnCourses.map((course) => {
          if (!course.active) {
            return course;
          }
          const nextProgress = clamp(course.progress + 1, 0, course.totalLessons);
          return {
            ...course,
            progress: nextProgress,
          };
        }),
      };
    }
    case "ADD_TOPIC_NOTE_LINK": {
      const topic = state.topics.find((item) => item.id === action.payload.topicId);
      const note = state.learnNotes.find((item) => item.id === action.payload.noteId);
      if (!topic || !note) {
        return state;
      }
      const linkLabel = note.title.length > 28 ? `${note.title.slice(0, 28)}...` : note.title;
      return {
        ...state,
        topicLinks: [
          {
            id: `tl-${Date.now()}`,
            topicId: topic.id,
            label: linkLabel,
            strength: 66,
          },
          ...state.topicLinks,
        ],
        topicPages: state.topicPages.map((topicPage) =>
          topicPage.topicId === topic.id && !topicPage.linkedNoteIds.includes(note.id)
            ? { ...topicPage, linkedNoteIds: [...topicPage.linkedNoteIds, note.id] }
            : topicPage,
        ),
      };
    }
    case "CONVERT_NOTEBOOK_TO_NOTE": {
      const entry = state.notebookEntries.find((item) => item.id === action.payload.entryId);
      if (!entry || entry.convertedNoteId) {
        return state;
      }
      const noteId = `n-${Date.now()}`;
      const note: Note = {
        id: noteId,
        areaId: entry.areaId,
        topicIds: entry.topicIds,
        type: "Research",
        title: entry.title,
        preview: entry.body.slice(0, 80),
        source: "Notebook",
        createdAt: "Just now",
        body: entry.body,
        keyPoints: [entry.body.slice(0, 60)],
        reviewDueDate: addDaysToDateKey(todayDateKey, 1),
        reviewIntervalDays: 2,
        reviewCount: 0,
      };

      return {
        ...state,
        learnNotes: [note, ...state.learnNotes],
        notebookEntries: state.notebookEntries.map((item) =>
          item.id === entry.id ? { ...item, convertedNoteId: noteId } : item,
        ),
        topicPages: state.topicPages.map((topicPage) =>
          entry.topicIds.includes(topicPage.topicId) && !topicPage.linkedNoteIds.includes(noteId)
            ? { ...topicPage, linkedNoteIds: [...topicPage.linkedNoteIds, noteId] }
            : topicPage,
        ),
      };
    }
    case "ADD_TIME_BLOCK": {
      return {
        ...state,
        timeBlocks: [...state.timeBlocks, action.payload.block],
      };
    }
    case "UPDATE_TIME_BLOCK": {
      return {
        ...state,
        timeBlocks: state.timeBlocks.map((block) =>
          block.id === action.payload.blockId ? { ...block, ...action.payload.updates } : block,
        ),
      };
    }
    case "DELETE_TIME_BLOCK": {
      return {
        ...state,
        timeBlocks: state.timeBlocks.filter((block) => block.id !== action.payload.blockId),
      };
    }
    case "UPDATE_TIME_BLOCK_STATUS": {
      return {
        ...state,
        timeBlocks: state.timeBlocks.map((block) =>
          block.id === action.payload.blockId ? { ...block, status: action.payload.status } : block,
        ),
      };
    }
    case "ADD_ACTION_HISTORY": {
      return {
        ...state,
        actionHistory: [action.payload.item, ...state.actionHistory].slice(0, 20),
      };
    }
    case "ADD_CONVERTED_ACTION": {
      return {
        ...state,
        actionConverterHistory: [action.payload.item, ...state.actionConverterHistory].slice(0, 30),
      };
    }
    case "LINK_NOTE_TO_LESSON": {
      const { noteId, courseId, moduleId, lessonId } = action.payload;
      return {
        ...state,
        learnNotes: state.learnNotes.map((note) =>
          note.id === noteId
            ? {
                ...note,
                linkedLesson: { courseId, moduleId, lessonId },
              }
            : note,
        ),
        topicPages: state.topicPages.map((topicPage) => {
          const note = state.learnNotes.find((entry) => entry.id === noteId);
          if (!note || !(note.topicIds ?? []).includes(topicPage.topicId)) {
            return topicPage;
          }
          if (topicPage.linkedCourseIds.includes(courseId) && topicPage.linkedNoteIds.includes(noteId)) {
            return topicPage;
          }
          return {
            ...topicPage,
            linkedCourseIds: topicPage.linkedCourseIds.includes(courseId)
              ? topicPage.linkedCourseIds
              : [...topicPage.linkedCourseIds, courseId],
            linkedNoteIds: topicPage.linkedNoteIds.includes(noteId)
              ? topicPage.linkedNoteIds
              : [...topicPage.linkedNoteIds, noteId],
          };
        }),
      };
    }
    case "ADD_NOTEBOOK_ENTRY": {
      return {
        ...state,
        notebookEntries: [action.payload.entry, ...state.notebookEntries],
      };
    }
    case "ADD_DUMP_ITEM": {
      return {
        ...state,
        dumpItems: [action.payload.item, ...state.dumpItems],
      };
    }
    case "UPDATE_DUMP_ITEM": {
      return {
        ...state,
        dumpItems: state.dumpItems.map((item) => (item.id === action.payload.item.id ? action.payload.item : item)),
      };
    }
    case "DELETE_DUMP_ITEM": {
      return {
        ...state,
        dumpItems: state.dumpItems.filter((item) => item.id !== action.payload.itemId),
      };
    }
    case "CLEAR_PROCESSED_DUMPS": {
      return {
        ...state,
        dumpItems: state.dumpItems.filter((item) => !item.processed),
      };
    }
    case "LOG_VAULT_DELIVERY": {
      return {
        ...state,
        vaultDeliveryLog: [action.payload.entry, ...state.vaultDeliveryLog],
      };
    }
    case "ADD_COACH_MESSAGE": {
      return {
        ...state,
        coachMessages: [...state.coachMessages, action.payload.message],
      };
    }
    case "CLEAR_COACH_HISTORY": {
      return {
        ...state,
        coachMessages: [],
      };
    }
    case "START_TRACKER_SESSION": {
      return {
        ...state,
        timeTrackerSessions: [...state.timeTrackerSessions, action.payload.session],
        activeTrackerSessionId: action.payload.session.id,
      };
    }
    case "END_TRACKER_SESSION": {
      return {
        ...state,
        timeTrackerSessions: state.timeTrackerSessions.map((session) =>
          session.id === action.payload.sessionId
            ? { ...session, endedAt: action.payload.endedAt, durationSec: action.payload.durationSec }
            : session,
        ),
        activeTrackerSessionId: null,
      };
    }
    case "DISCARD_TRACKER_SESSION": {
      if (!state.activeTrackerSessionId) {
        return state;
      }
      return {
        ...state,
        timeTrackerSessions: state.timeTrackerSessions.filter((session) => session.id !== state.activeTrackerSessionId),
        activeTrackerSessionId: null,
      };
    }
    case "UPGRADE_VAULT_ITEM": {
      return {
        ...state,
        vaultItems: state.vaultItems.map((item) =>
          item.id === action.payload.itemId
            ? { ...item, aiContext: action.payload.context, content: `${item.content}\n\nAI context: ${action.payload.context.reasoning}` }
            : item,
        ),
      };
    }
    default:
      return state;
  }
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", state.theme === "dark");
    root.setAttribute("data-theme", state.theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, state.theme);
  }, [state.theme]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};

