import { FormEvent, useMemo, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { HabitRow } from "../components/HabitRow";
import { TaskCard } from "../components/TaskCard";
import { useAppContext } from "../context/AppContext";
import { Task } from "../data/types";
import { todayTaskIds } from "../data/seed";

type FocusTab = "today" | "backlog";
type Priority = Task["priority"];

export const Focus = () => {
  const { state, dispatch } = useAppContext();
  const [tab, setTab] = useState<FocusTab>("today");
  const [showSheet, setShowSheet] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedArea, setSelectedArea] = useState("career");
  const [priority, setPriority] = useState<Priority>("P1");
  const [estimateMin, setEstimateMin] = useState<string>("");
  const [newTaskIds, setNewTaskIds] = useState<string[]>([]);
  const [reasonOpen, setReasonOpen] = useState<Record<string, boolean>>({});

  const todayTasks = todayTaskIds
    .map((id) => state.tasks.find((task) => task.id === id))
    .filter((task): task is NonNullable<typeof task> => Boolean(task));

  const doneTasks = todayTasks.filter((task) => task.done).length;

  const groupedTasks = useMemo(() => {
    return state.areas
      .map((area) => ({
        area,
        tasks: state.tasks.filter((task) => task.areaId === area.id),
      }))
      .filter((group) => group.tasks.length > 0);
  }, [state.areas, state.tasks]);

  const openSheet = (defaultArea?: string) => {
    if (defaultArea) {
      setSelectedArea(defaultArea);
    }
    setShowSheet(true);
  };

  const submitTask = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    const task: Task = {
      id: `t${Date.now()}`,
      title: trimmed,
      areaId: selectedArea,
      priority,
      done: false,
      estimateMin: estimateMin ? Number(estimateMin) : undefined,
    };

    dispatch({ type: "ADD_TASK", payload: { task } });
    setNewTaskIds((current) => [...current, task.id]);
    setTitle("");
    setEstimateMin("");
    setSelectedArea("career");
    setPriority("P1");
    setShowSheet(false);
  };

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--s2)] p-1">
        {(["today", "backlog"] as FocusTab[]).map((entry) => (
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
            {entry === "today" ? "Today" : "Backlog"}
          </button>
        ))}
      </div>

      {tab === "today" ? (
        <div className="space-y-4">
          <header className="flex items-end justify-between">
            <h1 className="text-page-title text-[var(--text-1)]">Focus</h1>
            <p className="text-[13px] font-normal text-[var(--text-2)]">April 16</p>
          </header>

          <section className="space-y-2">
            <p className="text-section text-[var(--text-1)]">Tasks</p>
            {todayTasks.map((task) => {
              const area = state.areas.find((entry) => entry.id === task.areaId);
              if (!area) return null;
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  area={area}
                  onToggle={() => dispatch({ type: "TOGGLE_TASK", payload: { taskId: task.id } })}
                />
              );
            })}
            <div className="pt-1">
              <p className="text-caption text-[var(--text-3)]">Completion streak: 12 days</p>
              <div className="mt-1 h-1 w-[30px] rounded-[14px] bg-[var(--border)] sm:w-[180px]">
                <div className="h-1 rounded-[14px] bg-[var(--teal)]" style={{ width: `${(12 / 30) * 100}%` }} />
              </div>
            </div>
            <p className="text-caption text-[var(--text-3)]">{doneTasks} of 3 done</p>
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
      ) : (
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
                    <div
                      key={task.id}
                      className={`flex items-center justify-between rounded-[10px] px-3 py-2 text-[13px] font-normal text-[var(--text-2)] ${
                        newTaskIds.includes(task.id) ? "animate-fade-in-up" : ""
                      }`}
                    >
                      <span>{task.title}</span>
                      <span className="text-[11px] text-[var(--text-3)]">{task.priority}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </div>
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
            <h2 className="text-[18px] font-medium text-[var(--text-1)]">Add task</h2>
            <form className="mt-4 space-y-4" onSubmit={submitTask}>
              <input
                autoFocus
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Task title"
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

              <button
                type="submit"
                className="tap-scale w-full rounded-[14px] bg-[var(--primary)] py-3 text-[14px] font-medium text-white"
              >
                Add to backlog
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};
