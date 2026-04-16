import { Flame } from "lucide-react";
import { Habit, LifeArea } from "../data/types";

interface HabitRowProps {
  habit: Habit;
  area: LifeArea;
  onLog: () => void;
  circleSize?: number;
}

const hexToRgba = (hex: string, alpha: number): string => {
  const normalized = hex.replace("#", "");
  const bigint = Number.parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const HabitRow = ({ habit, area, onLog, circleSize = 10 }: HabitRowProps) => {
  const hasPending = habit.lastSevenDays.includes("pending");

  return (
    <button
      type="button"
      className="hover-surface tap-scale flex w-full items-center gap-3 rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-4 py-3 text-left transition-colors"
      onClick={() => {
        if (hasPending) {
          onLog();
        }
      }}
    >
      <div className="min-w-0 flex-1">
        <p className="text-card-title text-[var(--text-1)]">{habit.name}</p>
        <span
          className="mt-1 inline-flex rounded-full px-2 py-1 text-caption"
          style={{
            backgroundColor: hexToRgba(area.color, 0.15),
            color: area.color,
          }}
        >
          {area.name}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {habit.lastSevenDays.map((day, index) => {
          const shared = {
            width: `${circleSize}px`,
            height: `${circleSize}px`,
          };

          if (day === "done") {
            return (
              <span
                key={`${habit.id}-${index}`}
                className="rounded-full"
                style={{ ...shared, backgroundColor: area.color }}
                aria-hidden="true"
              />
            );
          }

          if (day === "missed") {
            return (
              <span
                key={`${habit.id}-${index}`}
                className="rounded-full border"
                style={{ ...shared, borderColor: hexToRgba(area.color, 0.4) }}
                aria-hidden="true"
              />
            );
          }

          return (
            <span
              key={`${habit.id}-${index}`}
              className="animate-pulse rounded-full border border-[var(--primary)]"
              style={shared}
              aria-hidden="true"
            />
          );
        })}
      </div>

      <div className="flex min-w-[64px] items-center justify-end gap-1">
        <Flame size={20} strokeWidth={1.5} className="text-[var(--amber)]" />
        <span className="text-card-title text-[var(--text-1)]">{habit.streak}</span>
        <span className="text-[11px] text-[var(--text-3)]">d</span>
      </div>
    </button>
  );
};
