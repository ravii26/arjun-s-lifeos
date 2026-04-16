import * as React from 'react';
import type { AppState, Habit, HabitLog, Note, Project, Resource, Task, Topic, VaultItem } from '@/types';
import { createSeedState } from '@/data/seed';
import { getTodayHabitStatusFromHabit, getTodayLog, isoDate } from '@/lib/lifeos';
import { AppContext, type AppContextValue } from '@/context/appState';

const STORAGE_KEY = 'lifeos-theme';

type AppAction =
  | { type: 'TOGGLE_THEME' }
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'UPDATE_TASK'; taskId: string; updates: Partial<Task> }
  | { type: 'DELETE_TASK'; taskId: string }
  | { type: 'TOGGLE_TASK_STATUS'; taskId: string }
  | { type: 'SCHEDULE_TASK_FOR_TODAY'; taskId: string }
  | { type: 'ADD_TASK_SUBTASK'; taskId: string; title: string }
  | { type: 'TOGGLE_TASK_SUBTASK'; taskId: string; subtaskId: string }
  | { type: 'DELETE_TASK_SUBTASK'; taskId: string; subtaskId: string }
  | { type: 'ADD_PROJECT'; project: Project }
  | { type: 'UPDATE_PROJECT'; projectId: string; updates: Partial<Project> }
  | { type: 'SET_PROJECT_STATUS'; projectId: string; status: Project['status'] }
  | { type: 'REORDER_PROJECT_TASK'; projectId: string; taskId: string; direction: 'up' | 'down' }
  | { type: 'ADD_HABIT'; habit: Habit }
  | { type: 'UPDATE_HABIT'; habitId: string; updates: Partial<Habit> }
  | { type: 'DELETE_HABIT'; habitId: string }
  | { type: 'LOG_HABIT'; habitId: string; log: HabitLog; date?: string }
  | { type: 'ADD_NOTE'; note: Note }
  | { type: 'UPDATE_NOTE'; noteId: string; updates: Partial<Note> }
  | { type: 'DELETE_NOTE'; noteId: string }
  | { type: 'ADD_TOPIC'; topic: Topic }
  | { type: 'ADD_COURSE'; course: AppState['courses'][number] }
  | { type: 'UPDATE_COURSE'; courseId: string; updates: Partial<AppState['courses'][number]> }
  | { type: 'SET_ACTIVE_COURSE'; courseId: string }
  | { type: 'TOGGLE_COURSE_LESSON'; courseId: string; moduleId: string; lessonId: string }
  | { type: 'ADD_VAULT_ITEM'; item: VaultItem }
  | { type: 'ADD_RESOURCE'; resource: Resource }
  | { type: 'DECIDE_RESOURCE'; resourceId: string; status: Resource['status']; decision?: Resource['decision'] }
  | { type: 'SET_DAY_RATING'; rating: number | null }
  | { type: 'SET_MORNING_CHECKIN'; checkin: AppState['morningCheckIn'] }
  | { type: 'DISMISS_MORNING' }
  | { type: 'SET_EVENING_CHECKIN'; checkin: AppState['eveningCheckIn'] }
  | { type: 'DISMISS_EVENING' }
  | { type: 'SAVE_REFLECTION'; reflection: AppState['weeklyReflection'] };

function readInitialTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') {
    return 'dark' as const;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  return 'dark' as const;
}

function sortLogs(logs: HabitLog[]) {
  return [...logs].sort((left, right) => left.date.localeCompare(right.date));
}

function isCompletedHabitLog(habit: Habit, log: HabitLog) {
  if (habit.trackingType === 'boolean') {
    return !!log.done;
  }

  if (habit.trackingType === 'amount') {
    return (log.value ?? 0) >= (habit.amountGoal ?? 0);
  }

  if (habit.trackingType === 'timer') {
    return (log.seconds ?? 0) >= (habit.timerGoalSeconds ?? 0);
  }

  return (log.currentValue ?? 0) >= (habit.progressGoal ?? 0);
}

function updateHabitStreak(habit: Habit, nextLogs: HabitLog[], dateString: string) {
  const existingToday = nextLogs.find((log) => log.date === dateString);
  if (!existingToday) {
    return habit;
  }

  const completedNow = isCompletedHabitLog(habit, existingToday);
  const previousToday = getTodayLog(habit);
  const previousComplete = previousToday ? isCompletedHabitLog(habit, previousToday) : false;

  if (completedNow && !previousComplete && dateString === isoDate(new Date())) {
    const nextStreak = habit.streak + 1;
    return {
      ...habit,
      logs: sortLogs(nextLogs),
      streak: nextStreak,
      bestStreak: Math.max(habit.bestStreak, nextStreak),
    };
  }

  return {
    ...habit,
    logs: sortLogs(nextLogs),
  };
}

function syncTaskSubtaskStatus(task: Task): Task {
  if (!task.subtasks?.length) {
    return task;
  }

  const allDone = task.subtasks.every((subtask) => subtask.done);
  return {
    ...task,
    status: allDone ? 'done' : task.status === 'done' ? 'todo' : task.status,
  };
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

function updateAreaScore(areas: AppState['areas'], areaId: Task['areaId'], delta: number) {
  return areas.map((area) => {
    if (area.id !== areaId) return area;
    const score = Math.max(0, Math.min(100, Math.round((area.score + delta) * 10) / 10));
    return {
      ...area,
      score,
      scoreDelta: Math.round((score - area.score) * 10) / 10,
    };
  });
}

function syncProjectStatusFromTasks(projects: AppState['projects'], tasks: AppState['tasks']): AppState['projects'] {
  return projects.map((project) => {
    const relatedTasks = project.tasks
      .map((taskId) => tasks.find((task) => task.id === taskId))
      .filter(Boolean) as Task[];

    if (!relatedTasks.length) {
      return project.status === 'done' ? { ...project, status: 'active' as const } : project;
    }

    const allDone = relatedTasks.every((task) => task.status === 'done');
    if (allDone && project.status !== 'done') {
      return { ...project, status: 'done' as const };
    }

    if (!allDone && project.status === 'done') {
      return { ...project, status: 'active' as const };
    }

    return project;
  });
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'TOGGLE_THEME': {
      const theme = state.theme === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem(STORAGE_KEY, theme);
      return { ...state, theme };
    }
    case 'ADD_TASK':
      return { ...state, tasks: [action.task, ...state.tasks] };
    case 'UPDATE_TASK':
      {
      const nextTasks = state.tasks.map((task) => (task.id === action.taskId ? { ...task, ...action.updates } : task));
      return {
        ...state,
        tasks: nextTasks,
        projects: syncProjectStatusFromTasks(state.projects, nextTasks),
      };
      }
    case 'DELETE_TASK':
      {
      const nextTasks = state.tasks.filter((task) => task.id !== action.taskId);
      const nextProjects = syncProjectStatusFromTasks(
        state.projects.map((project) => ({ ...project, tasks: project.tasks.filter((taskId) => taskId !== action.taskId) })),
        nextTasks,
      );
      return { ...state, tasks: nextTasks, projects: nextProjects };
      }
    case 'TOGGLE_TASK_STATUS':
      {
      const nextTasks = state.tasks.map((task) => {
        if (task.id !== action.taskId) return task;
        const status: Task['status'] = task.status === 'done' ? 'todo' : 'done';
        return { ...task, status };
      });
      return {
        ...state,
        tasks: nextTasks,
        projects: syncProjectStatusFromTasks(state.projects, nextTasks),
      };
      }
    case 'SCHEDULE_TASK_FOR_TODAY': {
      const today = isoDate(new Date());
      return {
        ...state,
        tasks: state.tasks.map((task) => (
          task.id === action.taskId
            ? { ...task, dueDate: today, status: task.status === 'done' ? 'todo' : task.status }
            : task
        )),
      };
    }
    case 'ADD_TASK_SUBTASK': {
      const nextTasks = state.tasks.map((task) => {
        if (task.id !== action.taskId) {
          return task;
        }

        const nextSubtasks = [
          ...(task.subtasks ?? []),
          { id: `${task.id}-sub-${Date.now()}`, title: action.title, done: false },
        ];
        return syncTaskSubtaskStatus({ ...task, subtasks: nextSubtasks });
      });
      return {
        ...state,
        tasks: nextTasks,
        projects: syncProjectStatusFromTasks(state.projects, nextTasks),
      };
    }
    case 'TOGGLE_TASK_SUBTASK': {
      const nextTasks = state.tasks.map((task) => {
        if (task.id !== action.taskId || !task.subtasks?.length) {
          return task;
        }

        const nextSubtasks = task.subtasks.map((subtask) => (
          subtask.id === action.subtaskId ? { ...subtask, done: !subtask.done } : subtask
        ));
        return syncTaskSubtaskStatus({ ...task, subtasks: nextSubtasks });
      });
      return {
        ...state,
        tasks: nextTasks,
        projects: syncProjectStatusFromTasks(state.projects, nextTasks),
      };
    }
    case 'DELETE_TASK_SUBTASK': {
      const nextTasks = state.tasks.map((task) => {
        if (task.id !== action.taskId || !task.subtasks?.length) {
          return task;
        }

        const nextSubtasks = task.subtasks.filter((subtask) => subtask.id !== action.subtaskId);
        return syncTaskSubtaskStatus({ ...task, subtasks: nextSubtasks });
      });
      return {
        ...state,
        tasks: nextTasks,
        projects: syncProjectStatusFromTasks(state.projects, nextTasks),
      };
    }
    case 'ADD_PROJECT':
      return { ...state, projects: [action.project, ...state.projects] };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.projectId ? { ...project, ...action.updates } : project,
        ),
      };
    case 'SET_PROJECT_STATUS':
      return {
        ...state,
        projects: state.projects.map((project) => (
          project.id === action.projectId ? { ...project, status: action.status } : project
        )),
      };
    case 'REORDER_PROJECT_TASK': {
      return {
        ...state,
        projects: state.projects.map((project) => {
          if (project.id !== action.projectId) {
            return project;
          }

          const currentIndex = project.tasks.indexOf(action.taskId);
          if (currentIndex < 0) {
            return project;
          }

          const targetIndex = action.direction === 'up' ? currentIndex - 1 : currentIndex + 1;
          if (targetIndex < 0 || targetIndex >= project.tasks.length) {
            return project;
          }

          return { ...project, tasks: moveItem(project.tasks, currentIndex, targetIndex) };
        }),
      };
    }
    case 'ADD_HABIT':
      return { ...state, habits: [action.habit, ...state.habits] };
    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map((habit) => (habit.id === action.habitId ? { ...habit, ...action.updates } : habit)),
      };
    case 'DELETE_HABIT':
      return { ...state, habits: state.habits.filter((habit) => habit.id !== action.habitId) };
    case 'LOG_HABIT': {
      const dateString = action.date ?? isoDate(new Date());
      let scoreAreaId: Habit['areaId'] | null = null;
      let scoreDelta = 0;

      const nextHabits = state.habits.map((habit) => {
        if (habit.id !== action.habitId) {
          return habit;
        }

        const previousLog = habit.logs.find((log) => log.date === dateString);
        const wasComplete = previousLog ? isCompletedHabitLog(habit, previousLog) : false;

        const nextLogs = habit.logs.some((log) => log.date === dateString)
          ? habit.logs.map((log) => (log.date === dateString ? { ...log, ...action.log } : log))
          : [...habit.logs, { ...action.log, date: dateString }];

        const nextLog = nextLogs.find((log) => log.date === dateString);
        const isComplete = nextLog ? isCompletedHabitLog(habit, nextLog) : false;
        if (isComplete !== wasComplete) {
          scoreAreaId = habit.areaId;
          scoreDelta = isComplete ? 1 : -0.5;
        }

        return updateHabitStreak(habit, nextLogs, dateString);
      });

      return {
        ...state,
        habits: nextHabits,
        areas: scoreAreaId ? updateAreaScore(state.areas, scoreAreaId, scoreDelta) : state.areas,
      };
    }
    case 'ADD_NOTE':
      return { ...state, notes: [action.note, ...state.notes] };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map((note) => (note.id === action.noteId ? { ...note, ...action.updates } : note)),
      };
    case 'DELETE_NOTE':
      return { ...state, notes: state.notes.filter((note) => note.id !== action.noteId) };
    case 'ADD_TOPIC':
      return { ...state, topics: [action.topic, ...state.topics] };
    case 'ADD_COURSE':
      return { ...state, courses: [action.course, ...state.courses] };
    case 'UPDATE_COURSE':
      return {
        ...state,
        courses: state.courses.map((course) =>
          course.id === action.courseId ? { ...course, ...action.updates } : course,
        ),
      };
    case 'SET_ACTIVE_COURSE':
      return {
        ...state,
        courses: state.courses.map((course) => ({
          ...course,
          isActive: course.id === action.courseId,
        })),
      };
    case 'TOGGLE_COURSE_LESSON':
      return {
        ...state,
        courses: state.courses.map((course) => {
          if (course.id !== action.courseId) return course;
          const modules = course.modules.map((module) => {
            const lessons = module.lessons.map((lesson) => {
              if (module.id === action.moduleId && lesson.id === action.lessonId) {
                return { ...lesson, done: !lesson.done, isCurrent: true };
              }
              return { ...lesson, isCurrent: false };
            });
            return { ...module, lessons };
          });

          const completedLessons = modules.reduce(
            (sum, module) => sum + module.lessons.filter((lesson) => lesson.done).length,
            0,
          );

          return {
            ...course,
            modules,
            completedLessons,
          };
        }),
      };
    case 'ADD_VAULT_ITEM':
      return { ...state, vaultItems: [action.item, ...state.vaultItems] };
    case 'ADD_RESOURCE':
      return { ...state, resources: [action.resource, ...state.resources] };
    case 'DECIDE_RESOURCE':
      return {
        ...state,
        resources: state.resources.map((resource) =>
          resource.id === action.resourceId ? { ...resource, status: action.status, decision: action.decision } : resource,
        ),
      };
    case 'SET_DAY_RATING':
      return { ...state, dayRating: action.rating };
    case 'SET_MORNING_CHECKIN':
      return { ...state, morningCheckIn: action.checkin };
    case 'DISMISS_MORNING':
      return { ...state, morningCheckIn: { ...state.morningCheckIn, dismissed: true } };
    case 'SET_EVENING_CHECKIN':
      return { ...state, eveningCheckIn: action.checkin };
    case 'DISMISS_EVENING':
      return { ...state, eveningCheckIn: { ...state.eveningCheckIn, dismissed: true } };
    case 'SAVE_REFLECTION':
      return { ...state, weeklyReflection: action.reflection };
    default:
      return state;
  }
}

function createInitialState(): AppState {
  return {
    ...createSeedState(),
    theme: readInitialTheme(),
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, createInitialState());

  React.useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
    window.localStorage.setItem(STORAGE_KEY, state.theme);
  }, [state.theme]);

  const value = React.useMemo<AppContextValue>(
    () => ({
      state,
      dispatch,
      getTodayLogs: (habitId) => {
        const habit = state.habits.find((entry) => entry.id === habitId);
        return habit ? getTodayLog(habit) : undefined;
      },
      getTodayHabitStatus: (habitId) => {
        const habit = state.habits.find((entry) => entry.id === habitId);
        return habit ? getTodayHabitStatusFromHabit(habit) : 'pending';
      },
    }),
    [state],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

