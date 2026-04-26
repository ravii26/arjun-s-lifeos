import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  areaKey: string;
}

export interface Habit {
  id: string;
  title: string;
  streak: number;
  completedToday: boolean;
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
  
  // Mock Data
  tasks: Task[];
  toggleTask: (id: string) => void;
  
  habits: Habit[];
  toggleHabit: (id: string) => void;
  
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

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now();
    setToasts(prev => [{ ...toast, id }, ...prev].slice(0, 3));
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Centralized High-Fidelity Mock Data
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Complete high-fidelity prototype', completed: false, areaKey: 'career' },
    { id: '2', title: 'Morning workout session', completed: true, areaKey: 'health' },
    { id: '3', title: 'Read 20 pages of Naval', completed: false, areaKey: 'mind' },
    { id: '4', title: 'Review Q3 financial goals', completed: false, areaKey: 'finance' }
  ]);

  const [habits, setHabits] = useState<Habit[]>([
    { id: '1', title: 'Deep Work Block', streak: 12, completedToday: false },
    { id: '2', title: 'Meditation', streak: 5, completedToday: true },
    { id: '3', title: 'Zero Inbox', streak: 21, completedToday: false },
  ]);

  const [vaultItems] = useState<VaultItem[]>([
    { id: '1', title: 'Naval Ravikant on Wealth', type: 'Podcast', tags: ['mind', 'finance'] },
    { id: '2', title: 'The Psychology of Money', type: 'Book Note', tags: ['finance'] },
    { id: '3', title: 'Dopamine Detox Protocol', type: 'System', tags: ['health', 'focus'] },
  ]);

  const toggleFocusMode = () => setIsFocusMode(prev => !prev);
  const setFocusMode = (val: boolean) => setIsFocusMode(val);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const toggleHabit = (id: string) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, completedToday: !h.completedToday } : h));
  };

  return (
    <AppContext.Provider value={{
      isFocusMode,
      toggleFocusMode,
      setFocusMode,
      tasks,
      toggleTask,
      habits,
      toggleHabit,
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
