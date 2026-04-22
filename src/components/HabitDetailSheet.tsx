import { ArrowLeft, Check, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { BottomSheet } from "./BottomSheet";
import { Habit, LifeArea } from "../data/types";

interface HabitDetailSheetProps {
  open: boolean;
  habit: Habit | null;
  areas: LifeArea[];
  onClose: () => void;
  onSave: (updates: { name: string; areaId: string }) => void;
  onDelete: () => void;
  onLog: (habitId: string) => void;
  onTrack: (payload: { habitId: string; value?: number; durationSec?: number; completed?: boolean; note?: string }) => void;
  onSchedule: (habitId: string) => void;
}

const formatDuration = (totalSec: number): string => {
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
};

export const HabitDetailSheet = ({ open, habit, areas, onClose, onSave, onDelete, onLog, onTrack, onSchedule }: HabitDetailSheetProps) => {
  const [name, setName] = useState(habit?.name ?? "");
  const [areaId, setAreaId] = useState(habit?.areaId ?? "career");
  const [valueInput, setValueInput] = useState<string>("0");
  const [progressValue, setProgressValue] = useState(0);
  const [note, setNote] = useState("");
  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(null);
  const [timerPreviewSec, setTimerPreviewSec] = useState(0);

  useEffect(() => {
    if (!open) return;
    setName(habit?.name ?? "");
    setAreaId(habit?.areaId ?? "career");
    setValueInput(habit?.trackingData?.value ? String(habit.trackingData.value) : "0");
    setProgressValue(habit?.trackingData?.value ?? 0);
    setNote(habit?.trackingData?.note ?? "");
    setTimerStartedAt(null);
    setTimerPreviewSec(habit?.trackingData?.durationSec ?? 0);
  }, [open, habit]);

  useEffect(() => {
    if (!timerStartedAt) {
      return;
    }
    const interval = window.setInterval(() => {
      const elapsed = Math.max(0, Math.floor((Date.now() - timerStartedAt) / 1000));
      setTimerPreviewSec((habit?.trackingData?.durationSec ?? 0) + elapsed);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerStartedAt, habit]);

  if (!habit) return null;

  const doneDays = habit.lastSevenDays.filter((entry) => entry === "done").length;
  const trackingType = habit.trackingType;
  const trackingConfig = habit.trackingConfig;
  const target = trackingConfig.targetValue;
  const currentValue = Number(valueInput) || 0;
  const totalDurationSec = timerStartedAt ? timerPreviewSec : habit.trackingData?.durationSec ?? 0;
  const progressPercent = (() => {
    if (!target || target <= 0) {
      return 0;
    }
    if (trackingType === "timer") {
      const unit = trackingConfig.unit?.toLowerCase() ?? "min";
      const divisor = unit.includes("hour") ? 3600 : unit.includes("sec") ? 1 : 60;
      return Math.min(100, Math.round(((totalDurationSec / divisor) / target) * 100));
    }
    return Math.min(100, Math.round(((trackingType === "progress" ? progressValue : currentValue) / target) * 100));
  })();

  const saveCountOrProgress = (value: number) => {
    onTrack({
      habitId: habit.id,
      value,
      note: note.trim() || undefined,
    });
  };

  const stopTimer = () => {
    if (!timerStartedAt) {
      return;
    }
    const deltaSec = Math.max(1, Math.floor((Date.now() - timerStartedAt) / 1000));
    onTrack({
      habitId: habit.id,
      durationSec: deltaSec,
      note: note.trim() || undefined,
    });
    setTimerStartedAt(null);
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex h-[70vh] flex-col">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
          <button type="button" className="tap-scale text-[var(--text-2)]" onClick={onClose}>
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
          <p className="text-[14px] font-medium text-[var(--text-1)]">Habit detail</p>
          <div className="h-5 w-5" />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <section className="space-y-3 rounded-[12px] border border-[var(--border)] bg-[var(--s1)] p-4">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full border-0 bg-transparent text-[18px] font-medium text-[var(--text-1)] outline-none"
              placeholder="Habit name"
            />
            <select
              value={areaId}
              onChange={(event) => setAreaId(event.target.value)}
              className="w-full rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-3 py-2 text-[12px] text-[var(--text-1)] outline-none"
            >
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </section>
          <p className="mt-2 text-[13px] text-[var(--text-3)]">Streak: {habit.streak} days</p>

          <div className="mt-4 grid grid-cols-7 gap-1.5">
            {habit.lastSevenDays.map((entry, index) => (
              <div
                key={`${habit.id}-${index}`}
                className="rounded-[8px] border border-[var(--border)] px-1.5 py-1.5 text-center text-[10px] font-medium"
                style={{
                  background:
                    entry === "done"
                      ? "var(--teal-muted)"
                      : entry === "missed"
                        ? "var(--amber-muted)"
                        : "var(--s1)",
                  color:
                    entry === "done"
                      ? "var(--teal)"
                      : entry === "missed"
                        ? "var(--amber)"
                        : "var(--text-3)",
                }}
              >
                {entry === "done" ? "?" : entry === "missed" ? "?" : "-"}
              </div>
            ))}
          </div>

          <p className="mt-2 text-[11px] text-[var(--text-3)]">Consistency: {Math.round((doneDays / 7) * 100)}%</p>

          {trackingType === "boolean" ? (
            <section className="mt-6 space-y-3 rounded-[12px] border border-[var(--border)] bg-[var(--s1)] p-4">
              <p className="text-[13px] font-medium text-[var(--text-2)]">Mark complete</p>
              <button
                type="button"
                className="tap-scale w-full rounded-[12px] bg-[var(--teal)] px-6 py-4 text-[14px] font-medium text-white transition-transform"
                onClick={() => onLog(habit.id)}
              >
                <div className="flex items-center justify-center gap-2">
                  <Check size={18} strokeWidth={2} />
                  <span>Done today</span>
                </div>
              </button>
            </section>
          ) : null}

          {trackingType === "count" ? (
            <section className="mt-6 space-y-4 rounded-[12px] border border-[var(--border)] bg-[var(--s1)] p-4">
              <p className="text-[13px] font-medium text-[var(--text-2)]">Count today</p>

              {target ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[12px] text-[var(--text-3)]">
                    <span>Target</span>
                    <span>{currentValue} / {target}{trackingConfig.unit ? ` ${trackingConfig.unit}` : ""}</span>
                  </div>
                  <div className="h-2 rounded-[14px] bg-[var(--s2)]">
                    <div className="h-2 rounded-[14px] bg-[var(--teal)]" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-[48px_1fr_48px] gap-2">
                <button
                  type="button"
                  className="tap-scale flex items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--s2)] text-[18px] font-medium text-[var(--text-2)] hover:bg-[var(--s3)]"
                  onClick={() => setValueInput(String(Math.max(0, currentValue - 1)))}
                >
                  -
                </button>
                <div className="flex flex-col items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-3">
                  <p className="text-[24px] font-medium text-[var(--text-1)]">{currentValue}</p>
                  <p className="text-[11px] text-[var(--text-3)]">{trackingConfig.unit ?? "items"}</p>
                </div>
                <button
                  type="button"
                  className="tap-scale flex items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--s2)] text-[18px] font-medium text-[var(--text-2)] hover:bg-[var(--s3)]"
                  onClick={() => setValueInput(String(currentValue + 1))}
                >
                  +
                </button>
              </div>

              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={2}
                className="w-full rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-3 py-2 text-[12px] text-[var(--text-1)] outline-none"
                placeholder="Optional note"
              />

              <button
                type="button"
                className="tap-scale w-full rounded-[10px] bg-[var(--teal)] px-3 py-2 text-[12px] font-medium text-white"
                onClick={() => saveCountOrProgress(currentValue)}
              >
                Save count
              </button>
            </section>
          ) : null}

          {trackingType === "timer" ? (
            <section className="mt-6 space-y-4 rounded-[12px] border border-[var(--border)] bg-[var(--s1)] p-4">
              <p className="text-[13px] font-medium text-[var(--text-2)]">Time today</p>

              {target ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[12px] text-[var(--text-3)]">
                    <span>Time completed</span>
                    <span>{formatDuration(totalDurationSec)} / {target} {trackingConfig.unit ?? "min"}</span>
                  </div>
                  <div className="h-2 rounded-[14px] bg-[var(--s2)]">
                    <div className="h-2 rounded-[14px] bg-[var(--teal)]" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
                  </div>
                </div>
              ) : null}

              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={2}
                className="w-full rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-3 py-2 text-[12px] text-[var(--text-1)] outline-none"
                placeholder="What did you work on?"
              />

              <button
                type="button"
                className="tap-scale w-full rounded-[10px] bg-[var(--teal)] px-3 py-2 text-[12px] font-medium text-white"
                onClick={() => (timerStartedAt ? stopTimer() : setTimerStartedAt(Date.now()))}
              >
                <span className="inline-flex items-center gap-2">
                  {timerStartedAt ? <Pause size={14} strokeWidth={2} /> : <Play size={14} strokeWidth={2} />}
                  {timerStartedAt ? "Stop timer" : "Start timer"}
                </span>
              </button>

              <p className="text-center text-[11px] text-[var(--text-3)]">Logged: {formatDuration(totalDurationSec)}</p>
            </section>
          ) : null}

          {trackingType === "progress" ? (
            <section className="mt-6 space-y-4 rounded-[12px] border border-[var(--border)] bg-[var(--s1)] p-4">
              <p className="text-[13px] font-medium text-[var(--text-2)]">Progress</p>

              <input
                type="range"
                min={0}
                max={target && target > 0 ? target : 100}
                value={progressValue}
                onChange={(event) => setProgressValue(Number(event.target.value))}
                className="w-full"
              />

              <p className="text-[12px] text-[var(--text-3)]">
                {progressValue}
                {target ? ` / ${target}` : ""}
                {trackingConfig.unit ? ` ${trackingConfig.unit}` : ""}
              </p>

              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={2}
                className="w-full rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-3 py-2 text-[12px] text-[var(--text-1)] outline-none"
                placeholder="Optional note"
              />

              <button
                type="button"
                className="tap-scale w-full rounded-[10px] bg-[var(--teal)] px-3 py-2 text-[12px] font-medium text-white"
                onClick={() => saveCountOrProgress(progressValue)}
              >
                Save progress
              </button>
            </section>
          ) : null}

          {trackingType === "manual" ? (
            <section className="mt-6 space-y-4 rounded-[12px] border border-[var(--border)] bg-[var(--s1)] p-4">
              <p className="text-[13px] font-medium text-[var(--text-2)]">Manual note</p>

              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={2}
                className="w-full rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-3 py-2 text-[12px] text-[var(--text-1)] outline-none"
                placeholder="Write short qualitative note"
              />

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="tap-scale w-full rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-3 py-2 text-[12px] font-medium text-[var(--text-1)]"
                  onClick={() => onTrack({ habitId: habit.id, note: note.trim() || undefined })}
                >
                  Save note
                </button>
                <button
                  type="button"
                  className="tap-scale w-full rounded-[10px] bg-[var(--teal)] px-3 py-2 text-[12px] font-medium text-white"
                  onClick={() => onTrack({ habitId: habit.id, completed: true, note: note.trim() || undefined })}
                >
                  Mark done
                </button>
              </div>
            </section>
          ) : null}

          <div className="mt-6 space-y-3">
            {trackingType !== "boolean" && (
              <button
                type="button"
                className="tap-scale w-full rounded-[12px] bg-[var(--teal)] px-4 py-3 text-[13px] font-medium text-white"
                onClick={() => onLog(habit.id)}
              >
                Done today
              </button>
            )}
            <button
              type="button"
              className="tap-scale w-full rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-4 py-3 text-[13px] text-[var(--text-1)]"
              onClick={() => onSchedule(habit.id)}
            >
              Schedule to calendar
            </button>
            <button
              type="button"
              className="tap-scale w-full rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-4 py-3 text-[13px] text-[var(--text-2)]"
              onClick={() => onSave({ name: name.trim() || habit.name, areaId })}
            >
              Save changes
            </button>
            <button
              type="button"
              className="tap-scale w-full rounded-[12px] bg-[var(--amber)] px-4 py-3 text-[13px] font-medium text-white"
              onClick={onDelete}
            >
              Delete habit
            </button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};
