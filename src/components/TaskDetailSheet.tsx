import { ArrowLeft, Check, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { BottomSheet } from "./BottomSheet";
import { LifeArea, Task } from "../data/types";

interface TaskDetailSheetProps {
  open: boolean;
  task: Task | null;
  areas: LifeArea[];
  onClose: () => void;
  onSave: (updates: { title: string; areaId: string; priority: Task["priority"]; estimateMin?: number }) => void;
  onDelete: () => void;
  onToggle: (taskId: string) => void;
  onTrack: (payload: { taskId: string; value?: number; durationSec?: number; completed?: boolean; note?: string }) => void;
  onSchedule: (taskId: string) => void;
}

const priorityTone: Record<Task["priority"], string> = {
  P1: "var(--primary)",
  P2: "var(--amber)",
  P3: "var(--text-3)",
};

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

export const TaskDetailSheet = ({ open, task, areas, onClose, onSave, onDelete, onToggle, onTrack, onSchedule }: TaskDetailSheetProps) => {
  const [title, setTitle] = useState(task?.title ?? "");
  const [areaId, setAreaId] = useState(task?.areaId ?? "career");
  const [priority, setPriority] = useState<Task["priority"]>(task?.priority ?? "P2");
  const [estimateMin, setEstimateMin] = useState<string>(task?.estimateMin ? String(task.estimateMin) : "");
  const [valueInput, setValueInput] = useState<string>("");
  const [progressValue, setProgressValue] = useState<number>(0);
  const [note, setNote] = useState("");
  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(null);
  const [timerPreviewSec, setTimerPreviewSec] = useState(0);

  useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? "");
    setAreaId(task?.areaId ?? "career");
    setPriority(task?.priority ?? "P2");
    setEstimateMin(task?.estimateMin ? String(task.estimateMin) : "");
    setValueInput(task?.trackingData?.value ? String(task.trackingData.value) : "0");
    setProgressValue(task?.trackingData?.value ?? 0);
    setNote(task?.trackingData?.note ?? "");
    setTimerStartedAt(null);
    setTimerPreviewSec(task?.trackingData?.durationSec ?? 0);
  }, [open, task]);

  useEffect(() => {
    if (!timerStartedAt) {
      return;
    }
    const interval = window.setInterval(() => {
      const elapsed = Math.max(0, Math.floor((Date.now() - timerStartedAt) / 1000));
      setTimerPreviewSec((task?.trackingData?.durationSec ?? 0) + elapsed);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerStartedAt, task]);

  if (!task) return null;

  const trackingType = task.trackingType;
  const trackingConfig = task.trackingConfig ?? {};
  const target = trackingConfig.targetValue;
  const currentValue = Number(valueInput) || 0;
  const totalDurationSec = timerStartedAt ? timerPreviewSec : task.trackingData?.durationSec ?? 0;
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
      taskId: task.id,
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
      taskId: task.id,
      durationSec: deltaSec,
      note: note.trim() || undefined,
    });
    setTimerStartedAt(null);
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex h-[72vh] flex-col">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
          <button type="button" className="tap-scale text-[var(--text-2)]" onClick={onClose}>
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
          <p className="text-[14px] font-medium text-[var(--text-1)]">Task detail</p>
          <div className="h-5 w-5" />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <section className="space-y-3 rounded-[12px] border border-[var(--border)] bg-[var(--s1)] p-4">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full border-0 bg-transparent text-[18px] font-medium text-[var(--text-1)] outline-none"
              placeholder="Task title"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={areaId}
                onChange={(event) => setAreaId(event.target.value)}
                className="rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-3 py-2 text-[12px] text-[var(--text-1)] outline-none"
              >
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value as Task["priority"])}
                className="rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-3 py-2 text-[12px] text-[var(--text-1)] outline-none"
              >
                {(["P1", "P2", "P3"] as Task["priority"][]).map((level) => (
                  <option key={level} value={level}>
                    Priority {level}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="number"
              value={estimateMin}
              onChange={(event) => setEstimateMin(event.target.value)}
              className="w-full rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-3 py-2 text-[12px] text-[var(--text-1)] outline-none"
              placeholder="Estimated minutes"
            />
          </section>

          <div className="mt-3 flex items-center gap-2">
            <span className="rounded-full px-3 py-1 text-[12px]" style={{ background: `${priorityTone[priority]}22`, color: priorityTone[priority] }}>
              {priority}
            </span>
            <span className="rounded-full bg-[var(--s1)] px-3 py-1 text-[12px] text-[var(--text-3)]">{estimateMin || task.estimateMin || 20} min</span>
          </div>

          {trackingType === "boolean" ? (
            <section className="mt-6 space-y-3 rounded-[12px] border border-[var(--border)] bg-[var(--s1)] p-4">
              <p className="text-[13px] font-medium text-[var(--text-2)]">Task completion</p>
              <button
                type="button"
                className="tap-scale w-full rounded-[12px] bg-[var(--primary)] px-6 py-4 text-[14px] font-medium text-white transition-transform"
                onClick={() => onToggle(task.id)}
              >
                <div className="flex items-center justify-center gap-2">
                  <Check size={18} strokeWidth={2} />
                  <span>{task.done ? "Undo" : "Mark as done"}</span>
                </div>
              </button>
            </section>
          ) : null}

          {trackingType === "count" ? (
            <section className="mt-6 space-y-4 rounded-[12px] border border-[var(--border)] bg-[var(--s1)] p-4">
              <p className="text-[13px] font-medium text-[var(--text-2)]">Count progress</p>

              {target ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[12px] text-[var(--text-3)]">
                    <span>Progress</span>
                    <span>{currentValue} / {target}{trackingConfig.unit ? ` ${trackingConfig.unit}` : ""}</span>
                  </div>
                  <div className="h-2 rounded-[14px] bg-[var(--s2)]">
                    <div className="h-2 rounded-[14px] bg-[var(--primary)]" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-[48px_1fr_48px] gap-2">
                <button
                  type="button"
                  className="tap-scale flex items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--s2)] text-[18px] font-medium text-[var(--text-2)] hover:bg-[var(--s3)]"
                  onClick={() => setValueInput(String(Math.max(0, currentValue - 1)))}
                >
                  −
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

              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((val) => (
                  <button
                    key={val}
                    type="button"
                    className="tap-scale rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-2 py-1 text-[12px] text-[var(--text-2)]"
                    onClick={() => setValueInput(String(currentValue + val))}
                  >
                    +{val}
                  </button>
                ))}
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
                className="tap-scale w-full rounded-[10px] bg-[var(--primary)] px-3 py-2 text-[12px] font-medium text-white disabled:opacity-60"
                onClick={() => saveCountOrProgress(currentValue)}
              >
                Save count
              </button>
            </section>
          ) : null}

          {trackingType === "timer" ? (
            <section className="mt-6 space-y-4 rounded-[12px] border border-[var(--border)] bg-[var(--s1)] p-4">
              <p className="text-[13px] font-medium text-[var(--text-2)]">Time tracking</p>

              {target ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[12px] text-[var(--text-3)]">
                    <span>Time logged</span>
                    <span>{formatDuration(totalDurationSec)} / {target} {trackingConfig.unit ?? "min"}</span>
                  </div>
                  <div className="h-2 rounded-[14px] bg-[var(--s2)]">
                    <div className="h-2 rounded-[14px] bg-[var(--teal)]" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 45, 60].map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    className={`tap-scale rounded-[10px] border px-2 py-2 text-[12px] font-medium ${
                      minutes * 60 === totalDurationSec
                        ? "border-[var(--primary)] bg-[var(--primary-muted)] text-[var(--primary)]"
                        : "border-[var(--border)] bg-[var(--s2)] text-[var(--text-2)]"
                    }`}
                    onClick={() => onTrack({ taskId: task.id, durationSec: minutes * 60, note: note.trim() || undefined })}
                  >
                    {minutes}m
                  </button>
                ))}
              </div>

              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={2}
                className="w-full rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-3 py-2 text-[12px] text-[var(--text-1)] outline-none"
                placeholder="What did you work on?"
              />

              <button
                type="button"
                className="tap-scale w-full rounded-[10px] bg-[var(--primary)] px-3 py-2 text-[12px] font-medium text-white disabled:opacity-60"
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
                className="tap-scale w-full rounded-[10px] bg-[var(--primary)] px-3 py-2 text-[12px] font-medium text-white disabled:opacity-60"
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
                  onClick={() => onTrack({ taskId: task.id, note: note.trim() || undefined })}
                >
                  Save note
                </button>
                <button
                  type="button"
                  className="tap-scale w-full rounded-[10px] bg-[var(--primary)] px-3 py-2 text-[12px] font-medium text-white"
                  onClick={() => onTrack({ taskId: task.id, completed: true, note: note.trim() || undefined })}
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
                className="tap-scale w-full rounded-[12px] bg-[var(--primary)] px-4 py-3 text-[13px] font-medium text-white"
                onClick={() => onToggle(task.id)}
              >
                {task.done ? "Mark as not done" : "Mark as done"}
              </button>
            )}
            <button
              type="button"
              className="tap-scale w-full rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-4 py-3 text-[13px] text-[var(--text-1)]"
              onClick={() => onSchedule(task.id)}
            >
              Schedule to calendar
            </button>
            <button
              type="button"
              className="tap-scale w-full rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-4 py-3 text-[13px] text-[var(--text-2)]"
              onClick={() => onSave({ title: title.trim() || task.title, areaId, priority, estimateMin: estimateMin ? Number(estimateMin) : undefined })}
            >
              Save changes
            </button>
            <button
              type="button"
              className="tap-scale w-full rounded-[12px] bg-[var(--amber)] px-4 py-3 text-[13px] font-medium text-white"
              onClick={onDelete}
            >
              Delete task
            </button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};
