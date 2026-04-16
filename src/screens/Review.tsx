import { Check, Lock, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const scoreColor = (score: number): string => {
  if (score >= 65) return "var(--teal)";
  if (score >= 35) return "var(--amber)";
  return "var(--text-3)";
};

const areaTime = [
  { id: "career", planned: 40, actual: 45 },
  { id: "health", planned: 20, actual: 18 },
  { id: "mind", planned: 15, actual: 14 },
  { id: "finance", planned: 10, actual: 3 },
  { id: "relationships", planned: 10, actual: 4 },
  { id: "creative", planned: 5, actual: 1 },
];

const patternTexts = [
  "You complete 94% of tasks on days you focus on LifeOS build. Your best work has a clear single focus.",
  "Your workout habit drops to 0% on days following an evening rating of 2 or below. How you end today shapes how you start tomorrow.",
  "Wednesday has been your lowest-scoring day for 5 consecutive weeks. Something about midweek is breaking your rhythm.",
];

export const Review = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const isSunday = new Date().getDay() === 0;

  const habitsTable = useMemo(
    () => state.habits.map((habit) => ({ ...habit, area: state.areas.find((area) => area.id === habit.areaId) })),
    [state.areas, state.habits],
  );

  const saveReflection = () => {
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      navigate("/dashboard");
    }, 600);
  };

  return (
    <div className="space-y-4">
      {!isSunday ? (
        <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-5" style={{ borderLeft: "3px solid var(--amber)" }}>
          <p className="text-[14px] font-medium text-[var(--text-1)]">Full review unlocks on Sunday. Here&apos;s your week so far.</p>
        </section>
      ) : null}

      <header className="flex items-end justify-between">
        <h1 className="text-page-title text-[var(--text-1)]">Week 7 review</h1>
        <button
          type="button"
          className="tap-scale rounded-[10px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2 text-[12px] text-[var(--primary)]"
          onClick={() => navigate("/statistics")}
        >
          Open statistics
        </button>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {state.areas.map((area) => (
          <button
            key={area.id}
            type="button"
            onClick={() => navigate(`/areas/${area.id}`)}
            className="tap-scale rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4 text-left"
            style={{ borderLeft: `3px solid ${area.color}` }}
          >
            <p className="text-[13px] font-medium text-[var(--text-3)]">{area.name}</p>
            <p className="mt-2 text-[28px] font-medium" style={{ color: scoreColor(area.score) }}>
              {area.score}
            </p>
            <div className="mt-2 flex items-center gap-1 text-[12px]" style={{ color: area.scoreDelta >= 0 ? "var(--teal)" : "var(--amber)" }}>
              {area.scoreDelta >= 0 ? <TrendingUp size={12} strokeWidth={1.5} /> : <TrendingDown size={12} strokeWidth={1.5} />}
              <span>{area.scoreDelta >= 0 ? `+${area.scoreDelta}` : area.scoreDelta}</span>
            </div>
            <p className="mt-2 text-[12px] text-[var(--text-3)]">{area.keyStat}</p>
          </button>
        ))}
      </section>

      <section className="space-y-2">
        <p className="text-section text-[var(--text-1)]">Habits this week</p>
        <div className="overflow-x-auto rounded-[14px] border border-[var(--border)] bg-[var(--s1)]">
          <table className="w-full min-w-[560px] text-[12px]">
            <thead className="sticky top-0 bg-[var(--s2)]">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-[var(--text-3)]">Habit</th>
                {["M", "T", "W", "T", "F", "S", "S"].map((day) => (
                  <th key={day} className="px-2 py-2 font-medium text-[var(--text-3)]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habitsTable.map((habit) => (
                <tr key={habit.id} className="border-t border-[var(--border)]">
                  <td className="px-3 py-2 text-[var(--text-2)]">{habit.name}</td>
                  {habit.lastSevenDays.map((entry, index) => (
                    <td key={`${habit.id}-${index}`} className="px-2 py-2 text-center">
                      {entry === "done" ? (
                        <span className="inline-block h-[10px] w-[10px] rounded-full" style={{ backgroundColor: habit.area?.color ?? "var(--teal)" }} />
                      ) : entry === "missed" ? (
                        <span className="inline-block h-[10px] w-[10px] rounded-full border" style={{ borderColor: habit.area?.color ?? "var(--amber)" }} />
                      ) : (
                        <span className="inline-block h-[6px] w-[6px] rounded-full bg-[var(--text-3)]" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-2">
          {["Workout 83%", "LifeOS 100%", "Sleep 83%"].map((pill) => (
            <span key={pill} className="rounded-full bg-[var(--teal-muted)] px-3 py-1 text-[12px] text-[var(--teal)]">
              {pill}
            </span>
          ))}
        </div>
      </section>

      <section>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "11", label: "Tasks done", color: "var(--teal)" },
            { value: "2", label: "Tasks missed", color: "var(--amber)" },
            { value: "3", label: "Carried forward", color: "var(--text-3)" },
          ].map((entry) => (
            <article key={entry.label} className="rounded-[12px] border border-[var(--border)] bg-[var(--s2)] px-3 py-3">
              <p className="text-[24px] font-medium" style={{ color: entry.color }}>
                {entry.value}
              </p>
              <p className="text-[11px] text-[var(--text-3)]">{entry.label}</p>
            </article>
          ))}
        </div>
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--teal-muted)] px-3 py-1 text-[12px] text-[var(--teal)]">
          Completion streak: 11 days
        </p>
      </section>

      <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
        <p className="text-section text-[var(--text-1)]">Time distribution</p>
        <svg width="100%" height="220" viewBox="0 0 620 220" className="mt-3">
          {areaTime.map((entry, index) => {
            const y = 20 + index * 32;
            const area = state.areas.find((item) => item.id === entry.id);
            const color = area?.color ?? "var(--primary)";
            const plannedW = entry.planned * 3.2;
            const actualW = entry.actual * 3.2;
            return (
              <g key={entry.id}>
                <text x="58" y={y + 8} textAnchor="end" style={{ fontSize: 12, fill: "var(--text-3)" }}>
                  {area?.name.split(" ")[0]}
                </text>
                <rect x="72" y={y} width={plannedW} height="8" rx="4" fill="transparent" stroke={color} opacity="0.5" />
                <rect x="72" y={y + 12} width={actualW} height="8" rx="4" fill={color} />
                <text x="290" y={y + 14} style={{ fontSize: 12, fill: "var(--text-3)" }}>
                  {entry.planned}/{entry.actual}%
                </text>
              </g>
            );
          })}
        </svg>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-[var(--amber-muted)] px-3 py-1 text-[12px] text-[var(--amber)]">Estimated lost time: 11 hours</span>
          <span className="rounded-[10px] border border-[var(--border)] bg-[var(--teal-muted)] px-3 py-1 text-[12px] text-[var(--teal)]">Best day: Tuesday</span>
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-section text-[var(--text-1)]">Your patterns</p>
          <Sparkles size={16} strokeWidth={1.5} className="text-[var(--primary)]" />
        </div>
        {patternTexts.map((text) => (
          <article key={text} className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-4" style={{ borderLeft: "2px solid var(--primary)" }}>
            <p className="inline-flex items-center gap-2 text-[11px] text-[var(--primary)]">
              <Sparkles size={16} strokeWidth={1.5} /> Pattern detected
            </p>
            <p className="mt-2 text-[13px] italic text-[var(--text-2)]">{text}</p>
          </article>
        ))}
        <article className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-4">
          <p className="inline-flex items-center gap-2 text-[12px] text-[var(--text-3)]">
            <Lock size={14} strokeWidth={1.5} /> Deeper AI insights unlock at Day 90. You&apos;re on Day 47.
          </p>
          <div className="mt-3 h-1.5 rounded-[14px] bg-[var(--s3)]">
            <div className="h-1.5 rounded-[14px] bg-[var(--amber)]" style={{ width: `${(47 / 90) * 100}%` }} />
          </div>
        </article>
      </section>

      <section className="space-y-3">
        {[
          ["Q1", "What worked best this week?", "q1"],
          ["Q2", "What did you avoid this week?", "q2"],
          ["Q3", "What caused the biggest drag?", "q3"],
          ["Q4", "What are you changing next week?", "q4"],
        ].map(([label, placeholder, key]) => (
          <div key={String(key)} className={!isSunday ? "opacity-50" : ""}>
            <label className="mb-1 block text-[12px] uppercase text-[var(--text-3)]">{label}</label>
            <div className="relative">
              <textarea
                value={state.weeklyReflection[key as keyof typeof state.weeklyReflection] as string}
                onChange={(event) =>
                  dispatch({
                    type: "SAVE_REFLECTION",
                    payload: { ...state.weeklyReflection, [key]: event.target.value },
                  })
                }
                placeholder={String(placeholder)}
                disabled={!isSunday}
                className="min-h-20 w-full rounded-[14px] border border-[var(--border)] bg-[var(--s2)] px-4 py-3 text-[13px] text-[var(--text-2)] outline-none"
              />
              {!isSunday ? (
                <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-[var(--s3)] px-2 py-1 text-[11px] text-[var(--text-3)]">
                  <Lock size={12} strokeWidth={1.5} /> Unlocks Sunday
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <p className="text-section text-[var(--text-1)]">Next week setup</p>
        <div className="flex flex-wrap gap-2">
          {state.areas.map((area) => (
            <button
              key={area.id}
              type="button"
              onClick={() =>
                dispatch({
                  type: "SAVE_REFLECTION",
                  payload: { ...state.weeklyReflection, nextAreaFocus: area.id },
                })
              }
              className={`tap-scale rounded-full px-3 py-2 text-[12px] ${
                state.weeklyReflection.nextAreaFocus === area.id
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--s2)] text-[var(--text-3)]"
              }`}
            >
              {area.name}
            </button>
          ))}
        </div>
        <input
          value={state.weeklyReflection.commitment}
          onChange={(event) =>
            dispatch({
              type: "SAVE_REFLECTION",
              payload: { ...state.weeklyReflection, commitment: event.target.value },
            })
          }
          className="w-full rounded-[14px] border border-[var(--border)] bg-[var(--s2)] px-4 py-3 text-[14px] text-[var(--text-1)] outline-none"
          placeholder="One commitment for next week"
          disabled={!isSunday}
        />
        <button
          type="button"
          disabled={!isSunday}
          className="tap-scale inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-[var(--primary)] py-3 text-[14px] font-medium text-white disabled:opacity-50"
          onClick={saveReflection}
        >
          {submitting ? <Check size={16} strokeWidth={1.5} /> : null}
          Lock in next week →
        </button>
      </section>

      <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
        <p className="text-section text-[var(--text-1)]">Action conversion impact</p>
        <p className="mt-2 text-[13px] text-[var(--text-2)]">
          {state.actionHistory.length} actions converted this cycle. Most recent area: {state.actionHistory[0]?.areaId ?? "mind"}.
        </p>
      </section>
    </div>
  );
};
