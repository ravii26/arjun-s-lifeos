import { FormEvent, useMemo, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { AIInsightCard } from "../components/AIInsightCard";
import { HabitRow } from "../components/HabitRow";
import { TaskCard } from "../components/TaskCard";
import { HabitDetailSheet } from "../components/HabitDetailSheet";
import { TaskDetailSheet } from "../components/TaskDetailSheet";
import { FocusCalendar } from "../components/FocusCalendar";
import { useAppContext } from "../context/AppContext";
import { Habit, Task, TrackingType } from "../data/types";
import { insightCatalog } from "../data/insights";
import { formatMonthDay, getTodayDateKey } from "../lib/date";

type FocusTab = "today" | "backlog" | "calendar";
type Priority = Task["priority"];
type DraftEntityType = "task" | "habit";

const VALID_TABS: FocusTab[] = ["today", "backlog", "calendar"];

export const Focus = () => {
  const { state, dispatch } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSheet, setShowSheet] = useState(false);
  const [draftEntityType, setDraftEntityType] = useState<DraftEntityType>("task");
  const [title, setTitle] = useState("");
  const [selectedArea, setSelectedArea] = useState("career");
  const [priority, setPriority] = useState<Priority>("P1");
  const [estimateMin, setEstimateMin] = useState<string>("");
  const [trackingType, setTrackingType] = useState<TrackingType>("boolean");
  const [trackingUnit, setTrackingUnit] = useState<string>("");
  const [trackingTarget, setTrackingTarget] = useState<string>("");
  const [newTaskIds, setNewTaskIds] = useState<string[]>([]);
  const [reasonOpen, setReasonOpen] = useState<Record<string, boolean>>({});
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeHabit, setActiveHabit] = useState<Habit | null>(null);
  const activeDate = getTodayDateKey();
  const tabParam = searchParams.get("tab");
  const tab = VALID_TABS.includes(tabParam as FocusTab) ? (tabParam as FocusTab) : "today";

  const setTab = (nextTab: FocusTab) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextTab === "today") {
      nextParams.delete("tab");
    } else {
      nextParams.set("tab", nextTab);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const todayBlockTaskIds = useMemo(
    () =>
      new Set(
        state.timeBlocks
          .filter((block) => block.date === activeDate && block.linkedTaskId)
          .map((block) => block.linkedTaskId as string),
      ),
    [activeDate, state.timeBlocks],
  );

  const todayTasks = useMemo(
    () => state.tasks.filter((task) => task.scheduledDate === activeDate || todayBlockTaskIds.has(task.id)),
    [activeDate, state.tasks, todayBlockTaskIds],
  );

  const doneTasks = todayTasks.filter((task) => task.done).length;

  const groupedTasks = useMemo(() => {
    return state.areas
      .map((area) => ({
        area,
        tasks: state.tasks.filter((task) => task.areaId === area.id),
      }))
      .filter((group) => group.tasks.length > 0);
  }, [state.areas, state.tasks]);

  const todayBlocks = state.timeBlocks
    .filter((block) => block.date === activeDate)
    .sort((a, b) => a.startHour - b.startHour);

  const scheduleTask = (taskId: string) => {
    const targetTask = state.tasks.find((task) => task.id === taskId);
    if (!targetTask) return;
    const startHour = todayBlocks.length === 0 ? 9 : Math.min(todayBlocks[todayBlocks.length - 1].endHour + 1, 22);
    dispatch({
      type: "ADD_TIME_BLOCK",
      payload: {
        block: {
          id: `tb-${Date.now()}`,
          date: activeDate,
          title: targetTask.title,
          areaId: targetTask.areaId,
          startHour,
          endHour: Math.min(startHour + 1, 23),
          linkedTaskId: targetTask.id,
          status: "planned",
        },
      },
    });
  };

  const scheduleHabit = (habitId: string) => {
    const targetHabit = state.habits.find((habit) => habit.id === habitId);
    if (!targetHabit) return;
    const startHour = todayBlocks.length === 0 ? 7 : Math.min(todayBlocks[todayBlocks.length - 1].endHour + 1, 22);
    dispatch({
      type: "ADD_TIME_BLOCK",
      payload: {
        block: {
          id: `tb-${Date.now()}`,
          date: activeDate,
          title: targetHabit.name,
          areaId: targetHabit.areaId,
          startHour,
          endHour: Math.min(startHour + 1, 23),
          linkedHabitId: targetHabit.id,
          status: "planned",
        },
      },
    });
  };

  const openSheet = (defaultArea?: string, entityType: DraftEntityType = "task") => {
    if (defaultArea) {
      setSelectedArea(defaultArea);
    }
    setDraftEntityType(entityType);
    setShowSheet(true);
  };

  const resetDraft = () => {
    setTitle("");
    setEstimateMin("");
    setTrackingType("boolean");
    setTrackingUnit("");
    setTrackingTarget("");
    setSelectedArea("career");
    setPriority("P1");
    setDraftEntityType("task");
  };

  const buildTrackingConfig = () => ({
    unit: trackingUnit.trim() || undefined,
    targetValue: trackingTarget ? Number(trackingTarget) : undefined,
  });

  const buildTrackingData = () => {
    if (trackingType === "boolean") {
      return { completed: false };
    }
    if (trackingType === "timer") {
      return { durationSec: 0 };
    }
    if (trackingType === "count" || trackingType === "progress") {
      return { value: 0 };
    }
    return { note: "", completed: false };
  };

  const submitTask = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    if (draftEntityType === "habit") {
      const habit: Habit = {
        id: `h${Date.now()}`,
        name: trimmed,
        areaId: selectedArea,
        trackingType,
        trackingConfig: buildTrackingConfig(),
        trackingData: buildTrackingData(),
        streak: 0,
        bestStreak: 0,
        lastSevenDays: ["pending", "pending", "pending", "pending", "pending", "pending", "pending"],
        logs: [],
        createdAt: new Date().toISOString(),
      };

      dispatch({ type: "ADD_HABIT", payload: { habit } });
      setShowSheet(false);
      resetDraft();
      return;
    }

    const task: Task = {
      id: `t${Date.now()}`,
      title: trimmed,
      areaId: selectedArea,
      priority,
      status: "pending",
      date: activeDate,
      trackingType,
      trackingConfig: buildTrackingConfig(),
      trackingData: buildTrackingData(),
      linkedSessionIds: [],
      createdAt: new Date().toISOString(),
      done: false,
      estimateMin: estimateMin ? Number(estimateMin) : undefined,
      scheduledDate: activeDate,
    };

    dispatch({ type: "ADD_TASK", payload: { task } });
    setNewTaskIds((current) => [...current, task.id]);
    setShowSheet(false);
    resetDraft();
  };

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--s2)] p-1">
        {VALID_TABS.map((entry) => (
          <button
            key={entry}
            type="button"
            onClick={() => setTab(entry)}
            className={`tap-scale rounded-full px-4 py-2 text-[13px] transition-opacity duration-150 ${
              tab === entry
                ? "bg-[var(--primary)] font-medium text-white"
                : "bg-transparent font-normal text-[var(--text-3)]"
            }`}
          >
            {entry === "today" ? "Today" : entry === "backlog" ? "Backlog" : "Calendar"}
          </button>
        ))}
      </div>

      <AIInsightCard
        screenId={`focus-${tab}`}
        insights={tab === "calendar" ? insightCatalog.focusCalendar : insightCatalog.focusToday}
        onAskCoach={(insight) => {
          window.dispatchEvent(
            new CustomEvent("lifeos:open-coach", {
              detail: {
                message: `I was looking at focus and saw: ${insight}. Can you explain more?`,
              },
            }),
          );
        }}
      />

      {tab === "today" ? (
        <div className="space-y-4">
          <header className="flex items-end justify-between">
            <h1 className="text-page-title text-[var(--text-1)]">Focus</h1>
            <p className="text-[13px] font-normal text-[var(--text-2)]">{formatMonthDay(activeDate)}</p>
          </header>

          <section className="space-y-2">
            <p className="text-section text-[var(--text-1)]">Tasks</p>
            {todayTasks.map((task) => {
              const area = state.areas.find((entry) => entry.id === task.areaId);
              if (!area) return null;
              return (
                <div key={task.id}>
                  <TaskCard
                    task={task}
                    area={area}
                    onToggle={() => dispatch({ type: "TOGGLE_TASK", payload: { taskId: task.id } })}
                  />
                  <button
                    type="button"
                    className="mt-1 text-[11px] text-[var(--primary)]"
                    onClick={() => setActiveTask(task)}
                  >
                    Details
                  </button>
                </div>
              );
            })}
            <div className="pt-1">
              <p className="text-caption text-[var(--text-3)]">Completion streak: 12 days</p>
              <div className="mt-1 h-1 w-[30px] rounded-[14px] bg-[var(--border)] sm:w-[180px]">
                <div className="h-1 rounded-[14px] bg-[var(--teal)]" style={{ width: `${(12 / 30) * 100}%` }} />
              </div>
            </div>
            <p className="text-caption text-[var(--text-3)]">{doneTasks} of {todayTasks.length} done</p>
          </section>

          <section className="space-y-2">
            <p className="text-section text-[var(--text-1)]">Habits</p>
            {state.habits.map((habit) => {
              const area = state.areas.find((entry) => entry.id === habit.areaId);
              if (!area) return null;

              const hasMissed = habit.lastSevenDays.includes("missed");

              return (
                <div key={habit.id}>
                  <HabitRow
                    habit={habit}
                    area={area}
                    onLog={() => dispatch({ type: "LOG_HABIT", payload: { habitId: habit.id } })}
                    circleSize={12}
                  />
                  <button type="button" className="mt-1 text-[11px] text-[var(--primary)]" onClick={() => setActiveHabit(habit)}>
                    Details
                  </button>
                  {hasMissed ? (
                    <div className="pt-1">
                      <button
                        type="button"
                        className="text-[11px] font-normal text-[var(--amber)]"
                        onClick={() => setReasonOpen((current) => ({ ...current, [habit.id]: !current[habit.id] }))}
                      >
                        Why did you miss this?
                      </button>
                      {reasonOpen[habit.id] ? (
                        <textarea
                          className="mt-2 w-full rounded-[12px] border border-[var(--border)] bg-[var(--s2)] p-3 text-[13px] font-normal text-[var(--text-2)] outline-none"
                          placeholder="Write one quick reason and adjustment for tomorrow"
                          rows={2}
                        />
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </section>

          <section className="card-base">
            <p className="text-section text-[var(--text-1)]">How was today?</p>
            <div className="mt-3 flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => {
                const isSelected = state.dayRating === value;
                const color =
                  value === 1
                    ? "var(--text-3)"
                    : value === 2
                      ? "var(--amber)"
                      : value === 3
                        ? "var(--text-2)"
                        : value === 4
                          ? "var(--teal)"
                          : "var(--primary)";

                return (
                  <button
                    key={value}
                    type="button"
                    className="tap-scale inline-flex h-11 w-11 items-center justify-center rounded-full border text-[13px] font-medium transition-all duration-200"
                    style={{
                      borderColor: color,
                      color,
                      background: isSelected ? color : "transparent",
                      transform: isSelected ? "scale(1.1)" : "scale(1)",
                    }}
                    onClick={() => dispatch({ type: "SET_DAY_RATING", payload: { value } })}
                    aria-label={`Rate ${value}`}
                  >
                    <span style={{ color: isSelected ? "white" : color }}>{value}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-2 grid grid-cols-5 text-center text-[11px] font-normal text-[var(--text-3)]">
              <span>Low</span>
              <span>Off</span>
              <span>Okay</span>
              <span>Good</span>
              <span>Great</span>
            </div>
            <p className="mt-2 text-[11px] font-normal italic text-[var(--text-3)]">
              Pick your day score honestly. Consistency beats perfection.
            </p>
          </section>
        </div>
      ) : tab === "backlog" ? (
        <div className="space-y-4">
          <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] px-4 py-3" style={{ borderLeft: "2px solid var(--primary)" }}>
            <p className="inline-flex items-center gap-2 text-[13px] font-normal italic text-[var(--text-2)]">
              <Sparkles size={16} strokeWidth={1.5} className="text-[var(--primary)]" />
              Finance has no active tasks right now. Add one small money move for this week.
            </p>
            <button
              type="button"
              className="tap-scale mt-3 rounded-[10px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2 text-[13px] font-normal text-[var(--primary)]"
              onClick={() => openSheet("finance")}
            >
              Add Finance task
            </button>
          </section>

          <section className="space-y-3 pb-20">
            {groupedTasks.map(({ area, tasks }) => (
              <div key={area.id}>
                <div className="mb-1 flex items-center gap-2 text-[13px] font-medium text-[var(--text-2)]">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: area.color }} aria-hidden="true" />
                  <span>{area.name}</span>
                  <span className="text-[11px] font-normal text-[var(--text-3)]">({tasks.length})</span>
                </div>
                <div className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] px-2 py-1">
                  {tasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      className={`flex items-center justify-between rounded-[10px] px-3 py-2 text-[13px] font-normal text-[var(--text-2)] ${
                        newTaskIds.includes(task.id) ? "animate-fade-in-up" : ""
                      }`}
                      onClick={() => setActiveTask(task)}
                    >
                      <span className="text-left">{task.title}</span>
                      <span className="text-[11px] text-[var(--text-3)]">{task.priority}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </div>
      ) : (
        <FocusCalendar />
      )}

      <button
        type="button"
        onClick={() => openSheet()}
        className="tap-scale fixed bottom-[calc(84px+env(safe-area-inset-bottom))] right-4 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-white md:bottom-8 md:right-8"
        aria-label="Add task"
      >
        <Plus size={24} strokeWidth={1.5} />
      </button>

      {showSheet ? (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowSheet(false)}>
          <div
            className="animate-slide-up fixed bottom-0 left-0 right-0 rounded-t-[20px] border border-[var(--border)] bg-[var(--s2)] px-5 pb-6 pt-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute left-1/2 top-3 h-1 w-10 -translate-x-1/2 rounded-full bg-[var(--s3)]" />
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[18px] font-medium text-[var(--text-1)]">Add {draftEntityType}</h2>
              <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--s1)] p-1">
                {(["task", "habit"] as DraftEntityType[]).map((entry) => (
                  <button
                    key={entry}
                    type="button"
                    onClick={() => setDraftEntityType(entry)}
                    className={`tap-scale rounded-full px-3 py-1 text-[12px] ${draftEntityType === entry ? "bg-[var(--primary)] text-white" : "text-[var(--text-3)]"}`}
                  >
                    {entry === "task" ? "Task" : "Habit"}
                  </button>
                ))}
              </div>
            </div>
            <form className="mt-4 space-y-4" onSubmit={submitTask}>
              <input
                autoFocus
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={draftEntityType === "task" ? "Task title" : "Habit name"}
                className="w-full border-0 border-b border-[var(--border-strong)] bg-transparent px-1 py-2 text-[16px] font-normal text-[var(--text-1)] outline-none"
              />

              <div>
                <p className="mb-2 text-caption text-[var(--text-3)]">Area</p>
                <div className="grid grid-cols-3 gap-2">
                  {state.areas.map((area) => (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => setSelectedArea(area.id)}
                      className={`tap-scale rounded-[12px] border px-2 py-2 text-left text-[12px] ${
                        selectedArea === area.id
                          ? "border-[var(--primary)] bg-[var(--primary-muted)] text-[var(--primary)]"
                          : "border-[var(--border)] bg-[var(--s1)] text-[var(--text-2)]"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: area.color }} />
                        {area.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {draftEntityType === "task" ? (
                <div>
                  <p className="mb-2 text-caption text-[var(--text-3)]">Priority</p>
                  <div className="flex gap-2">
                    {(["P1", "P2", "P3"] as Priority[]).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setPriority(level)}
                        className={`tap-scale rounded-full px-3 py-1 text-[12px] ${
                          priority === level
                            ? "bg-[var(--primary)] text-white"
                            : "bg-[var(--s1)] text-[var(--text-3)]"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {draftEntityType === "task" ? (
                <div>
                  <p className="mb-2 text-caption text-[var(--text-3)]">Est. minutes</p>
                  <input
                    type="number"
                    value={estimateMin}
                    onChange={(event) => setEstimateMin(event.target.value)}
                    className="w-full rounded-[10px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2 text-[14px] font-normal text-[var(--text-1)] outline-none"
                    placeholder="e.g. 30"
                  />
                </div>
              ) : null}

              <div>
                <p className="mb-2 text-caption text-[var(--text-3)]">Tracking type</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["boolean", "timer", "count", "progress", "manual"] as TrackingType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTrackingType(type)}
                      className={`tap-scale rounded-[10px] border px-3 py-2 text-[12px] ${
                        trackingType === type
                          ? "border-[var(--primary)] bg-[var(--primary-muted)] text-[var(--primary)]"
                          : "border-[var(--border)] bg-[var(--s1)] text-[var(--text-3)]"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {trackingType === "count" || trackingType === "progress" || trackingType === "timer" ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="mb-2 text-caption text-[var(--text-3)]">Unit (optional)</p>
                    <input
                      value={trackingUnit}
                      onChange={(event) => setTrackingUnit(event.target.value)}
                      className="w-full rounded-[10px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2 text-[14px] font-normal text-[var(--text-1)] outline-none"
                      placeholder="min, reps, pages"
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-caption text-[var(--text-3)]">Target (optional)</p>
                    <input
                      type="number"
                      value={trackingTarget}
                      onChange={(event) => setTrackingTarget(event.target.value)}
                      className="w-full rounded-[10px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2 text-[14px] font-normal text-[var(--text-1)] outline-none"
                      placeholder="e.g. 3"
                    />
                  </div>
                </div>
              ) : null}

              <button
                type="submit"
                className="tap-scale w-full rounded-[14px] bg-[var(--primary)] py-3 text-[14px] font-medium text-white"
              >
                {draftEntityType === "task" ? "Add to backlog" : "Add habit"}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      <TaskDetailSheet
        open={Boolean(activeTask)}
        task={activeTask}
        areas={state.areas}
        onClose={() => setActiveTask(null)}
        onSave={({ title: nextTitle, areaId, priority: nextPriority, estimateMin: nextEstimateMin }) => {
          if (!activeTask) return;
          dispatch({
            type: "UPDATE_TASK",
            payload: {
              taskId: activeTask.id,
              updates: {
                title: nextTitle,
                areaId,
                priority: nextPriority,
                estimateMin: nextEstimateMin,
              },
            },
          });
          setActiveTask(null);
        }}
        onDelete={() => {
          if (!activeTask) return;
          const confirmed = window.confirm("Delete this task? This cannot be undone.");
          if (!confirmed) return;
          dispatch({ type: "DELETE_TASK", payload: { taskId: activeTask.id } });
          setActiveTask(null);
        }}
        onToggle={(taskId) => {
          dispatch({ type: "TOGGLE_TASK", payload: { taskId } });
          setActiveTask((current) => (current ? { ...current, done: !current.done } : current));
        }}
        onTrack={({ taskId, value, durationSec, completed, note }) => {
          dispatch({
            type: "LOG_TRACKING_ENTRY",
            payload: {
              entityType: "task",
              entityId: taskId,
              value,
              durationSec,
              completed,
              note,
            },
          });
        }}
        onSchedule={(taskId) => {
          scheduleTask(taskId);
          setActiveTask(null);
          setTab("calendar");
        }}
      />

      <HabitDetailSheet
        open={Boolean(activeHabit)}
        habit={activeHabit}
        areas={state.areas}
        onClose={() => setActiveHabit(null)}
        onSave={({ name: nextName, areaId }) => {
          if (!activeHabit) return;
          dispatch({
            type: "UPDATE_HABIT",
            payload: {
              habitId: activeHabit.id,
              updates: {
                name: nextName,
                areaId,
              },
            },
          });
          setActiveHabit(null);
        }}
        onDelete={() => {
          if (!activeHabit) return;
          const confirmed = window.confirm("Delete this habit? This cannot be undone.");
          if (!confirmed) return;
          dispatch({ type: "DELETE_HABIT", payload: { habitId: activeHabit.id } });
          setActiveHabit(null);
        }}
        onLog={(habitId) => {
          dispatch({ type: "LOG_HABIT", payload: { habitId } });
          setActiveHabit(null);
        }}
        onTrack={({ habitId, value, durationSec, completed, note }) => {
          dispatch({
            type: "LOG_TRACKING_ENTRY",
            payload: {
              entityType: "habit",
              entityId: habitId,
              value,
              durationSec,
              completed,
              note,
            },
          });
        }}
        onSchedule={(habitId) => {
          scheduleHabit(habitId);
          setActiveHabit(null);
          setTab("calendar");
        }}
      />
    </div>
  );
};
