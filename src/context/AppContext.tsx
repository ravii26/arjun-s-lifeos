import { ReactNode, createContext, useContext, useEffect, useMemo, useReducer } from "react";
import {
  ActionConversion,
  AppState,
  Course,
  LifeArea,
  Note,
  NotebookEntry,
  Resource,
  Task,
  TimeBlock,
  VaultItem,
} from "../data/types";
import {
  actionHistory,
  areas,
  eveningCheckIn,
  habits,
  learnCourses,
  learnNotes,
  morningCheckIn,
  notebookEntries,
  pendingResources,
  resources,
  tasks,
  timeBlocks,
  topicLinks,
  topics,
  vaultItems,
  weeklyReflection,
} from "../data/seed";

const THEME_STORAGE_KEY = "lifeos-theme";
const MORNING_DISMISS_STORAGE_KEY = "lifeos-morning-dismissed";

type Action =
  | { type: "TOGGLE_THEME" }
  | { type: "TOGGLE_TASK"; payload: { taskId: string } }
  | { type: "LOG_HABIT"; payload: { habitId: string } }
  | { type: "SET_DAY_RATING"; payload: { value: number | null } }
  | { type: "ADD_TASK"; payload: { task: Task } }
  | { type: "ADD_VAULT_ITEM"; payload: { item: VaultItem } }
  | { type: "ADD_NOTE"; payload: { note: Note } }
  | { type: "ADD_TASK_FROM_NOTE"; payload: { task: Task; noteId: string } }
  | { type: "ACCEPT_RESOURCE"; payload: { resourceId: string } }
  | { type: "REJECT_RESOURCE"; payload: { resourceId: string } }
  | { type: "ADD_COURSE"; payload: { course: Course } }
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
  | { type: "UPDATE_TIME_BLOCK_STATUS"; payload: { blockId: string; status: TimeBlock["status"] } }
  | { type: "ADD_ACTION_HISTORY"; payload: { item: ActionConversion } }
  | { type: "ADD_NOTEBOOK_ENTRY"; payload: { entry: NotebookEntry } };

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

const initialState: AppState = {
  theme: getStoredTheme(),
  tasks,
  habits,
  areas,
  dayRating: null,
  vaultItems,
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
  timeBlocks,
  actionHistory,
};

const AppContext = createContext<AppContextValue | null>(null);

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case "TOGGLE_THEME": {
      return {
        ...state,
        theme: state.theme === "dark" ? "light" : "dark",
      };
    }
    case "TOGGLE_TASK": {
      const nextTasks = state.tasks.map((task) =>
        task.id === action.payload.taskId ? { ...task, done: !task.done } : task,
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
        return {
          ...habit,
          lastSevenDays: nextDays,
          streak: habit.streak + 1,
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
      const nextTasks = [...state.tasks, action.payload.task];
      return {
        ...state,
        tasks: nextTasks,
        areas: recomputeAreas({ ...state, tasks: nextTasks }),
      };
    }
    case "ADD_VAULT_ITEM": {
      return {
        ...state,
        vaultItems: [action.payload.item, ...state.vaultItems],
      };
    }
    case "ADD_NOTE": {
      return {
        ...state,
        learnNotes: [action.payload.note, ...state.learnNotes],
      };
    }
    case "ADD_TASK_FROM_NOTE": {
      const nextTasks = [...state.tasks, action.payload.task];
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
    case "ADD_COURSE": {
      return {
        ...state,
        learnCourses: [action.payload.course, ...state.learnCourses],
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
        type: "Research",
        title: entry.title,
        preview: entry.body.slice(0, 80),
        source: "Notebook",
        createdAt: "Just now",
        body: entry.body,
        keyPoints: [entry.body.slice(0, 60)],
      };

      return {
        ...state,
        learnNotes: [note, ...state.learnNotes],
        notebookEntries: state.notebookEntries.map((item) =>
          item.id === entry.id ? { ...item, convertedNoteId: noteId } : item,
        ),
      };
    }
    case "ADD_TIME_BLOCK": {
      return {
        ...state,
        timeBlocks: [...state.timeBlocks, action.payload.block],
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
    case "ADD_NOTEBOOK_ENTRY": {
      return {
        ...state,
        notebookEntries: [action.payload.entry, ...state.notebookEntries],
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

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};

