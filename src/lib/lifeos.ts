import { format, isSameDay, parseISO, subDays } from 'date-fns';
import type { AreaId, Habit, HabitLog, HabitTrackingType, LifeArea } from '@/types';

export const today = new Date();

export function isoDate(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

export function daysAgoIso(days: number) {
  return isoDate(subDays(today, days));
}

export function dateLabel(dateString: string) {
  return format(parseISO(dateString), 'MMM d');
}

export function dayShort(dateString: string) {
  return format(parseISO(dateString), 'EEE');
}

export function getHabitLogForDate(habit: Habit, dateString: string) {
  return habit.logs.find((log) => log.date === dateString);
}

export function getTodayLog(habit: Habit) {
  return getHabitLogForDate(habit, isoDate(today));
}

export function getTrackingGoal(habit: Habit) {
  switch (habit.trackingType) {
    case 'amount':
      return habit.amountGoal ?? 0;
    case 'timer':
      return habit.timerGoalSeconds ?? 0;
    case 'progress':
      return habit.progressGoal ?? 0;
    default:
      return 1;
  }
}

export function getLogCompletionState(habit: Habit, log?: HabitLog) {
  if (!log) {
    return 'pending' as const;
  }

  if (habit.trackingType === 'boolean') {
    return log.done ? 'done' : 'missed';
  }

  if (habit.trackingType === 'amount') {
    const goal = habit.amountGoal ?? 0;
    if ((log.value ?? 0) >= goal && goal > 0) {
      return 'done';
    }
    return (log.value ?? 0) > 0 ? 'partial' : 'missed';
  }

  if (habit.trackingType === 'timer') {
    const goal = habit.timerGoalSeconds ?? 0;
    if ((log.seconds ?? 0) >= goal && goal > 0) {
      return 'done';
    }
    return (log.seconds ?? 0) > 0 ? 'partial' : 'missed';
  }

  const goal = habit.progressGoal ?? 0;
  if ((log.currentValue ?? 0) >= goal && goal > 0) {
    return 'done';
  }
  return (log.currentValue ?? 0) > 0 ? 'partial' : 'missed';
}

export function getTodayHabitStatusFromHabit(habit: Habit) {
  const todayLog = getTodayLog(habit);
  return getLogCompletionState(habit, todayLog);
}

export function getAreaThemeColor(areaId: AreaId, areas: LifeArea[]) {
  return areas.find((area) => area.id === areaId)?.color ?? '#7C6FF7';
}

export function getAreaById(areaId: AreaId, areas: LifeArea[]) {
  return areas.find((area) => area.id === areaId);
}

export function getAreaScoreTone(score: number) {
  if (score >= 70) {
    return 'var(--teal)';
  }
  if (score >= 40) {
    return 'var(--amber)';
  }
  return 'var(--coral)';
}

export function scoreToWeeklyRing(areas: LifeArea[]) {
  if (!areas.length) {
    return 0;
  }

  const total = areas.reduce((sum, area) => sum + area.score, 0);
  return Math.round(total / areas.length);
}

export function buildRecentDates(totalDays: number) {
  return Array.from({ length: totalDays }, (_, index) => isoDate(subDays(today, totalDays - 1 - index)));
}

export function isDateToday(dateString: string) {
  return isSameDay(parseISO(dateString), today);
}

export function minuteLabel(seconds: number) {
  return `${Math.round(seconds / 60)}m`;
}

export function hoursLabel(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (!hours) {
    return `${minutes}m`;
  }
  if (!minutes) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

export function habitGoalLabel(habit: Habit) {
  switch (habit.trackingType) {
    case 'amount':
      return `${habit.amountGoal ?? 0} ${habit.amountUnit ?? ''}`.trim();
    case 'timer':
      return `${Math.round((habit.timerGoalSeconds ?? 0) / 60)}m`;
    case 'progress':
      return `${habit.progressGoal ?? 0} ${habit.progressUnit ?? ''}`.trim();
    default:
      return 'done';
  }
}

export function habitProgressValue(habit: Habit, log?: HabitLog) {
  if (!log) {
    return 0;
  }

  switch (habit.trackingType) {
    case 'amount':
      return log.value ?? 0;
    case 'timer':
      return log.seconds ?? 0;
    case 'progress':
      return log.currentValue ?? 0;
    default:
      return log.done ? 1 : 0;
  }
}
