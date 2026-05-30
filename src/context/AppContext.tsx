import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import * as domainService from "../lib/domainService";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  areaKey: string;
  lane?: string;
  priority?: string;
}

export interface Project {
  id: string;
  title: string;
  areaKey: string;
  status: 'active' | 'completed' | 'on-hold';
  progress: number;
  courseId?: string;
}

export interface Habit {
  id: string;
  title: string;
  streak: number;
  completedToday: boolean;
  areaKey?: string;
}

export interface VaultItem {
  id: string;
  title: string;
  type: string;
  tags: string[];
}

export interface Toast {
  id: number;
  type: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO' | 'AI';
  title: string;
  desc: string;
  action?: string;
  onAction?: () => void;
}

interface AppContextType {
  // Focus Mode
  isFocusMode: boolean;
  toggleFocusMode: () => void;
  setFocusMode: (val: boolean) => void;
  
  // Vibe State
  currentVibe: string;
  setVibe: (vibe: string) => void;
  
  // Domain Data
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  toggleTask: (id: string) => void;
  
  habits: Habit[];
  toggleHabit: (id: string) => void;
  
  projects: Project[];
  addProject: (project: Omit<Project, 'id'>) => void;
  
  vaultItems: VaultItem[];
  
  // Toasts
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [currentVibe, setVibe] = useState('default');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Domain State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);

  // Initialize from storage
  useEffect(() => {
    setTasks(domainService.getTasks());
    setHabits(domainService.getHabits());
    setProjects(domainService.getProjects());
    // Seed vault if empty
    const v = domainService.getHabits(); // wait, check vault
  }, []);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now();
    setToasts(prev => [{ ...toast, id }, ...prev].slice(0, 3));
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask = domainService.addTask(task as any);
    setTasks(prev => [newTask as any, ...prev]);
  };

  const toggleTask = (id: string) => {
    const next = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(next);
    domainService.saveTasks(next);
  };

  const toggleHabit = (id: string) => {
    const next = habits.map(h => h.id === id ? { ...h, completedToday: !h.completedToday } : h);
    setHabits(next);
    domainService.saveHabits(next);
  };

  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject = domainService.addProject(project as any);
    setProjects(prev => [newProject as any, ...prev]);
  };

  const toggleFocusMode = () => setIsFocusMode(prev => !prev);
  const setFocusMode = (val: boolean) => setIsFocusMode(val);

  return (
    <AppContext.Provider value={{
      isFocusMode,
      toggleFocusMode,
      setFocusMode,
      tasks,
      addTask,
      toggleTask,
      habits,
      toggleHabit,
      projects,
      addProject,
      vaultItems,
      currentVibe,
      setVibe,
      toasts,
      addToast,
      removeToast
    }}>
      <div className={`vibe-${currentVibe} ${isFocusMode ? "immersive-focus-active" : ""}`}>
        {children}
      </div>
    </AppContext.Provider>
  );
};


export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
