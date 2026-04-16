import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

type Scope = "today" | "week";

type ItemType = "task" | "habit" | "area";

export const Statistics = () => {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const [scope, setScope] = useState<Scope>("week");

  const completionRate = useMemo(() => {
    const total = state.tasks.length;
    if (!total) return 0;
    const done = state.tasks.filter((task) => task.done).length;
    return Math.round((done / total) * 100);
  }, [state.tasks]);

  const habitRate = useMemo(() => {
    const entries = state.habits.flatMap((habit) => habit.lastSevenDays);
    const done = entries.filter((entry) => entry === "done").length;
    return Math.round((done / Math.max(entries.length, 1)) * 100);
  }, [state.habits]);

  const radarPoints = state.areas
    .map((area, index) => {
      const angle = (Math.PI * 2 * index) / state.areas.length - Math.PI / 2;
      const radius = 70 * (area.score / 100);
      const x = 90 + Math.cos(angle) * radius;
      const y = 90 + Math.sin(angle) * radius;
      return `${x},${y}`;
    })
    .join(" ");

  const [selectedType, setSelectedType] = useState<ItemType>("task");

  const typeItems =
    selectedType === "task"
      ? state.tasks.map((task) => ({ id: task.id, title: task.title, score: task.done ? 100 : 45 }))
      : selectedType === "habit"
        ? state.habits.map((habit) => ({
            id: habit.id,
            title: habit.name,
            score: Math.round((habit.lastSevenDays.filter((entry) => entry === "done").length / 7) * 100),
          }))
        : state.areas.map((area) => ({ id: area.id, title: area.name, score: area.score }));

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-page-title text-[var(--text-1)]">Statistics</h1>
        <button
          type="button"
          className="tap-scale rounded-[10px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2 text-[12px] text-[var(--primary)]"
          onClick={() => navigate("/review")}
        >
          Back to review
        </button>
      </header>

      <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--s2)] p-1">
        {(["today", "week"] as Scope[]).map((entry) => (
          <button
            key={entry}
            type="button"
            onClick={() => setScope(entry)}
            className={`tap-scale rounded-full px-4 py-2 text-[13px] ${scope === entry ? "bg-[var(--primary)] text-white" : "text-[var(--text-3)]"}`}
          >
            {entry === "today" ? "Today" : "Week"}
          </button>
        ))}
      </div>

      <section className="grid grid-cols-2 gap-3">
        <article className="rounded-[12px] border border-[var(--border)] bg-[var(--s1)] p-4">
          <p className="text-[24px] font-medium text-[var(--teal)]">{completionRate}%</p>
          <p className="text-[12px] text-[var(--text-3)]">Task completion</p>
        </article>
        <article className="rounded-[12px] border border-[var(--border)] bg-[var(--s1)] p-4">
          <p className="text-[24px] font-medium text-[var(--primary)]">{habitRate}%</p>
          <p className="text-[12px] text-[var(--text-3)]">Habit consistency</p>
        </article>
      </section>

      <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
        <p className="text-section text-[var(--text-1)]">Area radar</p>
        <svg width="100%" height="220" viewBox="0 0 180 180" className="mt-2">
          {[25, 50, 75, 100].map((r) => (
            <circle key={r} cx="90" cy="90" r={(70 * r) / 100} fill="none" stroke="var(--border)" />
          ))}
          <polygon points={radarPoints} fill="var(--primary-muted)" stroke="var(--primary)" strokeWidth="2" />
          {state.areas.map((area, index) => {
            const angle = (Math.PI * 2 * index) / state.areas.length - Math.PI / 2;
            const x = 90 + Math.cos(angle) * 82;
            const y = 90 + Math.sin(angle) * 82;
            return (
              <text key={area.id} x={x} y={y} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 9, fill: "var(--text-3)" }}>
                {area.name.split(" ")[0]}
              </text>
            );
          })}
        </svg>
      </section>

      <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
        <div className="flex items-center justify-between">
          <p className="text-section text-[var(--text-1)]">Item stats</p>
          <div className="flex gap-2">
            {(["task", "habit", "area"] as ItemType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`tap-scale rounded-full px-3 py-1 text-[12px] ${selectedType === type ? "bg-[var(--primary-muted)] text-[var(--primary)]" : "bg-[var(--s2)] text-[var(--text-3)]"}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {typeItems.slice(0, 8).map((item) => (
            <div key={item.id} className="rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-3 py-2">
              <div className="flex items-center justify-between text-[12px] text-[var(--text-2)]">
                <span>{item.title}</span>
                <span>{item.score}%</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-[var(--border)]">
                <div className="h-1.5 rounded-full bg-[var(--primary)]" style={{ width: `${item.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
