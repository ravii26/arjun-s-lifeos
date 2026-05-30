/**
 * Domain Service - The Single Source of Truth for LifeOS.
 * Unifies Tasks, Habits, Learning, Areas, and Vault.
 */

import { loadTasksStore, saveTasksStore } from './tasksStore';
import { loadHabitsStore, saveHabitsStore } from './habitsStore';
import { loadLearningGraphStore, saveLearningGraphStore } from './learningGraphStore';
import { loadAreasStore, saveAreasStore } from './areasStore';

export const STORAGE_KEYS = {
  TASKS: 'lifeos.tasks.v1',
  HABITS: 'lifeos.habits.v1',
  LEARNING: 'lifeos.learning-graph.v1',
  AREAS: 'lifeos.areas.v1',
  CALENDAR: 'lifeos.calendar.v1',
  SETTINGS: 'lifeos.settings.v1',
  VAULT: 'lifeos.vault.v1'
};

export const AREA_MAP = {
  career: { label: 'Career', color: 'var(--blue)' },
  health: { label: 'Health', color: 'var(--teal)' },
  mind: { label: 'Mind', color: 'var(--purple)' },
  finance: { label: 'Finance', color: 'var(--accent)' },
  relationships: { label: 'Relationships', color: 'var(--pink)' },
  creative: { label: 'Creative', color: 'var(--orange)' },
};

// --- Utilities ---

const get = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error(`Failed to load ${key}`, e);
    return fallback;
  }
};

const set = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key}`, e);
  }
};

// --- Tasks ---

export const getTasks = () => loadTasksStore();

export const saveTasks = (tasks) => saveTasksStore(tasks);

export const addTask = (task) => {
  const tasks = getTasks();
  const newTask = {
    id: Date.now().toString(),
    done: false,
    lane: 'today',
    createdAt: new Date().toISOString(),
    ...task
  };
  saveTasks([newTask, ...tasks]);
  return newTask;
};

// --- Projects ---

export const getProjects = () => {
  const learning = loadLearningGraphStore();
  return learning.projects || [];
};

export const saveProjects = (projects) => {
  const learning = loadLearningGraphStore();
  saveLearningGraphStore({ ...learning, projects });
};

export const addProject = (project) => {
  const projects = getProjects();
  const newProject = {
    id: Date.now().toString(),
    status: 'active',
    progress: 0,
    createdAt: new Date().toISOString(),
    tasks: [],
    ...project
  };
  saveProjects([newProject, ...projects]);
  return newProject;
};

// --- Habits ---

export const getHabits = () => loadHabitsStore();

export const saveHabits = (habits) => saveHabitsStore(habits);

// --- Areas ---

export const getAreas = () => loadAreasStore();

export const saveAreas = (areas) => saveAreasStore(areas);

export const updateAreaScore = (areaKey, scoreChange) => {
  const areas = getAreas();
  const updatedOverview = areas.overview.map(a => {
    if (a.key === areaKey) {
      return { ...a, score: Math.max(0, Math.min(100, (a.score || 0) + scoreChange)) };
    }
    return a;
  });
  saveAreas({ ...areas, overview: updatedOverview });
};

// --- AI Service Simulation ---

export const simulateAIService = async (content) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const text = content.toLowerCase();
  let suggestion = { type: 'Task', confidence: 85, reason: 'Action item language' };

  if (text.includes('every day') || text.includes('daily')) {
    suggestion = { type: 'Habit', confidence: 92, reason: 'Behavioral pattern' };
  } else if (text.includes('http') || text.includes('read')) {
    suggestion = { type: 'Resource', confidence: 88, reason: 'Reference material' };
  } else if (text.includes('learn') || text.includes('master')) {
    suggestion = { type: 'Course', confidence: 80, reason: 'Growth objective' };
  }

  return suggestion;
};
