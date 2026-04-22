import { ArrowRight, CalendarDays, Clock3, PencilLine, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";
import type { Habit, Task, TimeBlock } from "../data/types";
import { addDaysToDateKey, getStartOfWeekDateKey, getTodayDateKey } from "../lib/date";
import { BottomSheet } from "./BottomSheet";
import { HabitDetailSheet } from "./HabitDetailSheet";
import { TaskDetailSheet } from "./TaskDetailSheet";

const weekDayLabels = ["M", "T", "W", "T", "F", "S", "S"];

const formatHour = (hour: number): string => {
  const wholeHour = Math.floor(hour);
  const minute = Math.round((hour - wholeHour) * 60);
  const suffix = wholeHour >= 12 ? "PM" : "AM";
  const displayHour = wholeHour === 0 ? 12 : wholeHour > 12 ? wholeHour - 12 : wholeHour;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${suffix}`;
};

const hourToTimeString = (hour: number): string => {
  const totalMinutes = Math.round(hour * 60);
  const hourPart = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutePart = String(totalMinutes % 60).padStart(2, "0");
  return `${hourPart}:${minutePart}`;
};

const timeStringToHour = (value: string): number => {
  const [hours, minutes] = value.split(":").map(Number);
  return hours + minutes / 60;
};

export const FocusCalendar = () => {
  const { state, dispatch } = useAppContext();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeHabit, setActiveHabit] = useState<Habit | null>(null);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  const [showBlockSheet, setShowBlockSheet] = useState(false);
  const [blockTitle, setBlockTitle] = useState("");
  const [blockArea, setBlockArea] = useState("career");
  const [blockStart, setBlockStart] = useState("09:00");
  const [blockDuration, setBlockDuration] = useState("60");
  const activeDate = getTodayDateKey();
  const weekStart = getStartOfWeekDateKey(activeDate);
  const weekDays = weekDayLabels.map((day, index) => ({
    day,
    date: addDaysToDateKey(weekStart, index),
  }));

  const todayBlocks = useMemo(
    () => state.timeBlocks.filter((block) => block.date === activeDate).sort((a, b) => a.startHour - b.startHour),
    [activeDate, state.timeBlocks],
  );

  const unscheduledTasks = useMemo(
    () => state.tasks.filter((task) => !state.timeBlocks.some((block) => block.date === activeDate && block.linkedTaskId === task.id)),
    [activeDate, state.tasks, state.timeBlocks],
  );

  const unscheduledHabits = useMemo(
    () => state.habits.filter((habit) => !state.timeBlocks.some((block) => block.date === activeDate && block.linkedHabitId === habit.id)),
    [activeDate, state.habits, state.timeBlocks],
  );

  const unscheduledCourses = useMemo(
    () => state.learnCourses.filter((course) => !state.timeBlocks.some((block) => block.date === activeDate && block.linkedCourseId === course.id)),
    [activeDate, state.learnCourses, state.timeBlocks],
  );

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

  const scheduleCourse = (courseId: string) => {
    const targetCourse = state.learnCourses.find((course) => course.id === courseId);
    if (!targetCourse) return;
    const startHour = todayBlocks.length === 0 ? 13 : Math.min(todayBlocks[todayBlocks.length - 1].endHour + 1, 22);
    dispatch({
      type: "ADD_TIME_BLOCK",
      payload: {
        block: {
          id: `tb-${Date.now()}`,
          date: activeDate,
          title: targetCourse.nextLesson,
          areaId: targetCourse.areaId,
          startHour,
          endHour: Math.min(startHour + 1, 23),
          linkedCourseId: targetCourse.id,
          status: "planned",
        },
      },
    });
  };

  const addManualBlock = (event: FormEvent) => {
    event.preventDefault();
    const title = blockTitle.trim();
    if (!title) return;
    const start = timeStringToHour(blockStart);
    const durationMinutes = Math.max(Number(blockDuration) || 0, 15);
    const end = Math.min(start + durationMinutes / 60, 23);

    dispatch({
      type: "ADD_TIME_BLOCK",
      payload: {
        block: {
          id: `tb-${Date.now()}`,
          date: activeDate,
          title,
          areaId: blockArea,
          startHour: start,
          endHour: end,
          startTime: blockStart,
          endTime: hourToTimeString(end),
          status: "planned",
        },
      },
    });

    setBlockTitle("");
    setBlockStart("09:00");
    setBlockDuration("60");
    setShowBlockSheet(false);
  };

  const saveBlockEdit = (event: FormEvent) => {
    event.preventDefault();
    if (!editingBlock) return;
    const start = timeStringToHour(blockStart);
    const durationMinutes = Math.max(Number(blockDuration) || 0, 15);
    const end = Math.min(start + durationMinutes / 60, 23);

    dispatch({
      type: "UPDATE_TIME_BLOCK",
      payload: {
        blockId: editingBlock.id,
        updates: {
          title: blockTitle.trim() || editingBlock.title,
          areaId: blockArea,
          startHour: start,
          endHour: end,
          startTime: blockStart,
          endTime: hourToTimeString(end),
        },
      },
    });
    setEditingBlock(null);
  };

  return (
    <div className="space-y-4 pb-20">
      <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-4">
        <div className="flex items-center gap-2 text-[14px] font-medium text-[var(--text-1)]">
          <CalendarDays size={16} strokeWidth={1.5} />
          Weekly grid
        </div>
        <div className="mt-3 grid grid-cols-7 gap-2 text-center text-[11px]">
          {weekDays.map((cell) => (
            <div
              key={`${cell.day}-${cell.date}`}
              className="rounded-[10px] border border-[var(--border)] px-2 py-3"
              style={{
                background: cell.date === activeDate ? "var(--primary-muted)" : "var(--s1)",
                color: cell.date === activeDate ? "var(--primary)" : "var(--text-3)",
              }}
            >
              <p>{cell.day}</p>
              <p className="mt-1 text-[12px]">{new Date(`${cell.date}T00:00:00`).getDate()}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-section text-[var(--text-1)]">Time blocks</p>
            <button
              type="button"
              className="tap-scale rounded-[10px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2 text-[12px] text-[var(--primary)]"
              onClick={() => setShowBlockSheet(true)}
            >
              Add block
            </button>
          </div>

          {todayBlocks.length === 0 ? <p className="text-[12px] text-[var(--text-3)]">No blocks scheduled today.</p> : null}

          {todayBlocks.map((block) => {
            const area = state.areas.find((item) => item.id === block.areaId);
            return (
              <article
                key={block.id}
                className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-3 text-left"
                style={{ borderLeft: `3px solid ${area?.color ?? "var(--primary)"}` }}
              >
                <button
                  type="button"
                  className="tap-scale w-full text-left"
                  onClick={() => {
                    setEditingBlock(block);
                    setBlockTitle(block.title);
                    setBlockArea(block.areaId);
                    setBlockStart(hourToTimeString(block.startHour));
                    setBlockDuration(String(Math.max(15, Math.round((block.endHour - block.startHour) * 60))));
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[13px] font-medium text-[var(--text-1)]">{block.title}</p>
                      <p className="mt-1 text-[11px] text-[var(--text-3)]">{area?.name ?? block.areaId}</p>
                    </div>
                    <span className="text-[11px] text-[var(--text-3)]">{`${formatHour(block.startHour)} - ${formatHour(block.endHour)}`}</span>
                  </div>
                </button>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-3)]">
                  <span className="rounded-full bg-[var(--s2)] px-2 py-1">{block.status}</span>
                  {(["planned", "done", "missed"] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={`tap-scale rounded-full px-2 py-1 ${block.status === status ? "bg-[var(--primary-muted)] text-[var(--primary)]" : "bg-[var(--s2)] text-[var(--text-3)]"}`}
                      onClick={() =>
                        dispatch({
                          type: "UPDATE_TIME_BLOCK_STATUS",
                          payload: { blockId: block.id, status },
                        })
                      }
                    >
                      {status}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[var(--primary)]"
                    onClick={() => {
                      setEditingBlock(block);
                      setBlockTitle(block.title);
                      setBlockArea(block.areaId);
                      setBlockStart(hourToTimeString(block.startHour));
                      setBlockDuration(String(Math.max(15, Math.round((block.endHour - block.startHour) * 60))));
                    }}
                  >
                    <PencilLine size={12} strokeWidth={1.7} />
                    Edit
                  </button>
                </div>
              </article>
            );
          })}

          <div className="grid gap-3 sm:grid-cols-2">
            {state.tasks.slice(0, 4).map((task) => (
              <button
                key={task.id}
                type="button"
                className="tap-scale rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-3 text-left"
                onClick={() => setActiveTask(task)}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-medium text-[var(--text-1)]">{task.title}</p>
                  <ArrowRight size={14} strokeWidth={1.8} className="text-[var(--text-3)]" />
                </div>
                <p className="mt-1 text-[11px] text-[var(--text-3)]">Task - {task.priority}</p>
              </button>
            ))}
          </div>
        </div>

        <aside className="space-y-3">
          <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-medium text-[var(--text-1)]">Unscheduled</p>
              <Clock3 size={14} strokeWidth={1.5} className="text-[var(--text-3)]" />
            </div>

            <div className="mt-3 space-y-3">
              {unscheduledTasks.slice(0, 3).map((task) => (
                <button key={task.id} type="button" className="tap-scale w-full rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-3 py-3 text-left" onClick={() => setActiveTask(task)}>
                  <p className="text-[13px] text-[var(--text-1)]">{task.title}</p>
                  <p className="mt-1 text-[11px] text-[var(--text-3)]">Task - {task.priority}</p>
                </button>
              ))}
              {unscheduledHabits.slice(0, 2).map((habit) => (
                <button key={habit.id} type="button" className="tap-scale w-full rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-3 py-3 text-left" onClick={() => setActiveHabit(habit)}>
                  <p className="text-[13px] text-[var(--text-1)]">{habit.name}</p>
                  <p className="mt-1 text-[11px] text-[var(--text-3)]">Habit - {habit.streak} day streak</p>
                </button>
              ))}
              {unscheduledCourses.slice(0, 2).map((course) => (
                <button key={course.id} type="button" className="tap-scale w-full rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-3 py-3 text-left" onClick={() => scheduleCourse(course.id)}>
                  <p className="text-[13px] text-[var(--text-1)]">{course.title}</p>
                  <p className="mt-1 text-[11px] text-[var(--text-3)]">Course - tap to schedule lesson</p>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
            <p className="text-[14px] font-medium text-[var(--text-1)]">Quick add</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {state.tasks.slice(0, 2).map((task) => (
                <button
                  key={`schedule-${task.id}`}
                  type="button"
                  className="tap-scale rounded-[10px] bg-[var(--primary-muted)] px-3 py-2 text-[12px] text-[var(--primary)]"
                  onClick={() => scheduleTask(task.id)}
                >
                  Schedule task
                </button>
              ))}
              {state.habits.slice(0, 2).map((habit) => (
                <button
                  key={`schedule-${habit.id}`}
                  type="button"
                  className="tap-scale rounded-[10px] bg-[var(--teal-muted)] px-3 py-2 text-[12px] text-[var(--teal)]"
                  onClick={() => scheduleHabit(habit.id)}
                >
                  Schedule habit
                </button>
              ))}
            </div>
          </section>
        </aside>
      </section>

      <TaskDetailSheet
        open={Boolean(activeTask)}
        task={activeTask}
        areas={state.areas}
        onClose={() => setActiveTask(null)}
        onToggle={(taskId) => dispatch({ type: "TOGGLE_TASK", payload: { taskId } })}
        onTrack={({ taskId, value, durationSec, completed, note }) => dispatch({
          type: "LOG_TRACKING_ENTRY",
          payload: {
            entityType: "task",
            entityId: taskId,
            value,
            durationSec,
            completed,
            note,
          },
        })}
        onSchedule={scheduleTask}
        onSave={({ title, areaId, priority, estimateMin }) => {
          if (!activeTask) return;
          dispatch({
            type: "UPDATE_TASK",
            payload: {
              taskId: activeTask.id,
              updates: { title, areaId, priority, estimateMin },
            },
          });
          setActiveTask(null);
        }}
        onDelete={() => {
          if (!activeTask) return;
          dispatch({ type: "DELETE_TASK", payload: { taskId: activeTask.id } });
          setActiveTask(null);
        }}
      />

      <HabitDetailSheet
        open={Boolean(activeHabit)}
        habit={activeHabit}
        areas={state.areas}
        onClose={() => setActiveHabit(null)}
        onLog={(habitId) => dispatch({ type: "LOG_HABIT", payload: { habitId } })}
        onTrack={({ habitId, value, durationSec, completed, note }) => dispatch({
          type: "LOG_TRACKING_ENTRY",
          payload: {
            entityType: "habit",
            entityId: habitId,
            value,
            durationSec,
            completed,
            note,
          },
        })}
        onSchedule={scheduleHabit}
        onSave={({ name, areaId }) => {
          if (!activeHabit) return;
          dispatch({
            type: "UPDATE_HABIT",
            payload: {
              habitId: activeHabit.id,
              updates: { name, areaId },
            },
          });
          setActiveHabit(null);
        }}
        onDelete={() => {
          if (!activeHabit) return;
          dispatch({ type: "DELETE_HABIT", payload: { habitId: activeHabit.id } });
          setActiveHabit(null);
        }}
      />

      <BottomSheet open={showBlockSheet} onClose={() => setShowBlockSheet(false)}>
        <form className="px-4 pb-6 pt-8" onSubmit={addManualBlock}>
          <p className="text-[16px] font-medium text-[var(--text-1)]">Add time block</p>
          <input
            value={blockTitle}
            onChange={(event) => setBlockTitle(event.target.value)}
            placeholder="Block title"
            className="mt-4 w-full rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-3 text-[14px] text-[var(--text-1)] outline-none"
          />
          <div className="mt-3 grid grid-cols-3 gap-2">
            <select value={blockArea} onChange={(event) => setBlockArea(event.target.value)} className="rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-3 text-[13px] text-[var(--text-1)] outline-none">
              {state.areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
            <input type="time" value={blockStart} onChange={(event) => setBlockStart(event.target.value)} className="rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-3 text-[13px] text-[var(--text-1)] outline-none" />
            <input type="number" min="15" step="15" value={blockDuration} onChange={(event) => setBlockDuration(event.target.value)} className="rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-3 text-[13px] text-[var(--text-1)] outline-none" />
          </div>
          <button type="submit" className="tap-scale mt-4 w-full rounded-[12px] bg-[var(--primary)] px-4 py-3 text-[13px] font-medium text-white">
            Create block
          </button>
        </form>
      </BottomSheet>

      <BottomSheet open={Boolean(editingBlock)} onClose={() => setEditingBlock(null)}>
        {editingBlock ? (
          <form className="px-4 pb-6 pt-8" onSubmit={saveBlockEdit}>
            <p className="text-[16px] font-medium text-[var(--text-1)]">Edit time block</p>
            <input value={blockTitle} onChange={(event) => setBlockTitle(event.target.value)} className="mt-4 w-full rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-3 text-[14px] text-[var(--text-1)] outline-none" />
            <div className="mt-3 grid grid-cols-3 gap-2">
              <select value={blockArea} onChange={(event) => setBlockArea(event.target.value)} className="rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-3 text-[13px] text-[var(--text-1)] outline-none">
                {state.areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
              <input type="time" value={blockStart} onChange={(event) => setBlockStart(event.target.value)} className="rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-3 text-[13px] text-[var(--text-1)] outline-none" />
              <input type="number" min="15" step="15" value={blockDuration} onChange={(event) => setBlockDuration(event.target.value)} className="rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-3 text-[13px] text-[var(--text-1)] outline-none" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="tap-scale rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-4 py-3 text-[13px] text-[var(--text-2)]"
                onClick={() => {
                  dispatch({ type: "DELETE_TIME_BLOCK", payload: { blockId: editingBlock.id } });
                  setEditingBlock(null);
                }}
              >
                <Trash2 size={14} strokeWidth={1.8} className="mr-2 inline-block" />
                Delete
              </button>
              <button type="submit" className="tap-scale rounded-[12px] bg-[var(--primary)] px-4 py-3 text-[13px] font-medium text-white">
                Save changes
              </button>
            </div>
          </form>
        ) : null}
      </BottomSheet>
    </div>
  );
};
