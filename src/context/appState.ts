import * as React from 'react';
import type { AppState, HabitLog } from '@/types';

export interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<{ type: string; [key: string]: unknown }>;
  getTodayLogs: (habitId: string) => HabitLog | undefined;
  getTodayHabitStatus: (habitId: string) => 'done' | 'partial' | 'pending' | 'missed';
}

export const AppContext = React.createContext<AppContextValue | null>(null);

export function useApp() {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }

  return context;
}
