const DATE_KEY_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const MONTH_DAY_FORMATTER = new Intl.DateTimeFormat(undefined, {
  month: "long",
  day: "numeric",
});

const parseDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const getDateKey = (date: Date): string => DATE_KEY_FORMATTER.format(date);

export const getTodayDateKey = (): string => getDateKey(new Date());

export const addDaysToDateKey = (dateKey: string, days: number): string => {
  const next = parseDateKey(dateKey);
  next.setDate(next.getDate() + days);
  return getDateKey(next);
};

export const getDayDifference = (fromDateKey: string, toDateKey: string): number => {
  const from = parseDateKey(fromDateKey);
  const to = parseDateKey(toDateKey);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((to.getTime() - from.getTime()) / msPerDay);
};

export const getStartOfWeekDateKey = (dateKey: string): string => {
  const date = parseDateKey(dateKey);
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diffToMonday);
  return getDateKey(date);
};

export const formatMonthDay = (dateKey: string): string => MONTH_DAY_FORMATTER.format(parseDateKey(dateKey));
