import { Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AreaCard } from "../components/AreaCard";
import { HabitRow } from "../components/HabitRow";
import { TaskCard } from "../components/TaskCard";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAppContext } from "../context/AppContext";
import { aiBriefing, todayTaskIds } from "../data/seed";

export const Dashboard = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [morningLocalDismiss, setMorningLocalDismiss] = useState(false);
  const [eveningNote, setEveningNote] = useState(state.eveningCheckIn.note);

  const todayTasks = todayTaskIds
    .map((id) => state.tasks.find((task) => task.id === id))
    .filter((task): task is NonNullable<typeof task> => Boolean(task));

  const doneTasks = todayTasks.filter((task) => task.done).length;
  const doneHabits = state.habits.filter((habit) => habit.lastSevenDays[6] === "done").length;
  const relationshipsArea = state.areas.find((area) => area.id === "relationships");
  const isEvening = new Date().getHours() >= 19;
  const showMorning = !state.morningCheckIn.dismissed && !morningLocalDismiss;
  const showEvening = isEvening && !state.eveningCheckIn.dismissed;
  const allDone = doneTasks === todayTasks.length && todayTasks.length > 0;

  const score = 74;
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <p className="text-[13px] font-normal text-[var(--text-3)]">
          Day 47 <span className="ml-1">of building yourself</span>
        </p>
        <ThemeToggle />
      </header>

      <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] px-5 py-5 pl-6" style={{ borderLeft: "3px solid var(--primary)" }}>
        <div className="flex items-center gap-2">
          <Sparkles size={16} strokeWidth={1.5} className="text-[var(--primary)]" />
          <p className="text-caption text-[var(--text-3)]">Today&apos;s briefing</p>
        </div>
        <p className="mt-3 text-ai leading-[1.6] text-[var(--text-2)]">{aiBriefing}</p>
        <p className="mt-3 text-caption text-[var(--text-3)]">Day 47 · Week 7</p>
      </section>

      {showMorning ? (
        <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] px-5 py-4" style={{ borderLeft: "3px solid var(--primary)" }}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-medium text-[var(--text-1)]">Morning check-in</p>
              <span className="rounded-full bg-[var(--s3)] px-2 py-1 text-[11px] text-[var(--text-3)]">optional</span>
            </div>
            <button
              type="button"
              className="tap-scale text-[var(--text-3)]"
              onClick={() => {
                setMorningLocalDismiss(true);
                dispatch({ type: "DISMISS_MORNING" });
              }}
              aria-label="Dismiss morning check-in"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          <div className="mt-3 space-y-3">
            <div>
              <p className="text-[12px] text-[var(--text-3)]">Energy today:</p>
              <div className="mt-2 flex gap-2">
                {(["Low", "Medium", "High"] as const).map((energy) => (
                  <button
                    key={energy}
                    type="button"
                    onClick={() =>
                      dispatch({
                        type: "SET_MORNING_CHECKIN",
                        payload: { energy, focus: state.morningCheckIn.focus },
                      })
                    }
                    className={`tap-scale rounded-full px-3 py-2 text-[12px] ${
                      state.morningCheckIn.energy === energy
                        ? "bg-[var(--primary-muted)] text-[var(--primary)]"
                        : "bg-[var(--s3)] text-[var(--text-3)]"
                    }`}
                  >
                    {energy}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[12px] text-[var(--text-3)]">Today&apos;s focus:</p>
              <input
                value={state.morningCheckIn.focus}
                onChange={(event) =>
                  dispatch({
                    type: "SET_MORNING_CHECKIN",
                    payload: { energy: state.morningCheckIn.energy, focus: event.target.value },
                  })
                }
                className="mt-2 w-full rounded-[10px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2 text-[13px] text-[var(--text-1)] outline-none"
                placeholder="What matters most today?"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {["LifeOS build", "DSA practice", "Workout", "Freelance"].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    className="tap-scale rounded-full bg-[var(--s3)] px-2 py-1 text-[11px] text-[var(--text-3)]"
                    onClick={() =>
                      dispatch({
                        type: "SET_MORNING_CHECKIN",
                        payload: { energy: state.morningCheckIn.energy, focus: chip },
                      })
                    }
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="tap-scale h-8 rounded-[8px] bg-[var(--primary)] px-4 text-[12px] text-white"
              onClick={() => setMorningLocalDismiss(true)}
            >
              Set
            </button>
          </div>
        </section>
      ) : null}

      {showEvening ? (
        <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] px-5 py-4" style={{ borderLeft: "3px solid var(--primary)" }}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-medium text-[var(--text-1)]">Evening check-in</p>
              <span className="rounded-full bg-[var(--s3)] px-2 py-1 text-[11px] text-[var(--text-3)]">optional</span>
            </div>
            <button
              type="button"
              className="tap-scale text-[var(--text-3)]"
              onClick={() => dispatch({ type: "DISMISS_EVENING" })}
              aria-label="Dismiss evening check-in"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => {
              const active = state.eveningCheckIn.rating === value;
              const color = value === 1 ? "var(--text-3)" : value === 2 ? "var(--amber)" : value === 3 ? "var(--text-2)" : value === 4 ? "var(--teal)" : "var(--primary)";
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => dispatch({ type: "SET_EVENING_CHECKIN", payload: { rating: value, note: eveningNote } })}
                  className="tap-scale inline-flex h-9 w-9 items-center justify-center rounded-full border text-[12px]"
                  style={{ borderColor: color, background: active ? color : "transparent", color: active ? "white" : color }}
                >
                  {value}
                </button>
              );
            })}
          </div>

          <input
            value={eveningNote}
            onChange={(event) => setEveningNote(event.target.value)}
            className="mt-3 w-full rounded-[10px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2 text-[13px] text-[var(--text-1)] outline-none"
            placeholder="One thing you noticed"
          />

          <button
            type="button"
            className="tap-scale mt-3 h-8 rounded-[8px] bg-[var(--primary)] px-4 text-[12px] text-white"
            onClick={() => dispatch({ type: "SET_EVENING_CHECKIN", payload: { rating: state.eveningCheckIn.rating, note: eveningNote } })}
          >
            Done
          </button>

          {(state.eveningCheckIn.rating ?? 0) <= 2 && state.eveningCheckIn.rating !== null ? (
            <div className="mt-3 rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-3">
              <p className="text-[13px] italic text-[var(--text-2)]">Your vault has something for hard days →</p>
              <button
                type="button"
                className="tap-scale mt-2 rounded-[8px] border border-[var(--border)] px-3 py-2 text-[12px] text-[var(--primary)]"
                onClick={() => navigate("/vault")}
              >
                Open vault
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="flex gap-3">
        <article className="flex-1 rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-4 py-3">
          <p className="text-[20px] font-medium text-[var(--teal)]">{state.morningCheckIn.energy ?? "74"}</p>
          <p className="text-[11px] font-normal text-[var(--text-3)]">{state.morningCheckIn.energy ? "Energy" : "Life score"}</p>
        </article>
        <article className="flex-1 rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-4 py-3">
          <p className="text-[20px] font-medium text-[var(--primary)]">23d</p>
          <p className="text-[11px] font-normal text-[var(--text-3)]">Best streak</p>
        </article>
        <article className="flex-1 rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-4 py-3">
          <p className="text-[20px] font-medium text-[var(--amber)]">{doneTasks}/3 done</p>
          <p className="text-[11px] font-normal text-[var(--text-3)]">Tasks today</p>
        </article>
      </section>

      <section className="space-y-2">
        {allDone ? (
          <div className="rounded-[14px] bg-[var(--teal)] px-4 py-4 text-white">
            <p className="text-[16px] font-medium">All done today 🎯</p>
            <p className="mt-1 text-[12px] font-normal">Strong execution. Protect your shutdown and recover well.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-section text-[var(--text-1)]">Today&apos;s tasks</p>
              <p className="text-caption text-[var(--text-3)]">{doneTasks} of 3 done</p>
            </div>
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
          </>
        )}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-section text-[var(--text-1)]">Habits</p>
          <p className="text-caption text-[var(--text-3)]">{doneHabits} of 3 done</p>
        </div>
        {state.habits.map((habit) => {
          const area = state.areas.find((entry) => entry.id === habit.areaId);
          if (!area) return null;
          return (
            <HabitRow
              key={habit.id}
              habit={habit}
              area={area}
              onLog={() => dispatch({ type: "LOG_HABIT", payload: { habitId: habit.id } })}
            />
          );
        })}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-section text-[var(--text-1)]">Life areas</p>
          <p className="text-caption text-[var(--text-3)]">Week 7</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {state.areas.map((area) => (
            <AreaCard key={area.id} area={area} onClick={() => navigate(`/areas/${area.id}`)} />
          ))}
        </div>
      </section>

      <section className="card-base flex flex-col items-center justify-center">
        <svg width="120" height="120" viewBox="0 0 120 120" role="img" aria-label="Weekly score ring">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--border)" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="var(--teal)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 60 60)"
          />
          <text x="60" y="60" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 32, fontWeight: 500, fill: "var(--teal)" }}>
            74
          </text>
        </svg>
        <p className="mt-2 text-caption text-[var(--text-3)]">This week</p>
      </section>

      {relationshipsArea && relationshipsArea.score < 40 ? (
        <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-5" style={{ borderLeft: "3px solid var(--primary)", backgroundImage: "linear-gradient(var(--primary-muted), var(--primary-muted))" }}>
          <p className="text-[13px] font-normal italic text-[var(--text-2)]">
            Relationships is asking for one intentional action today. A small reach out can reset momentum.
          </p>
          <button
            type="button"
            className="tap-scale mt-3 rounded-[10px] border border-[var(--border)] bg-transparent px-3 py-2 text-[13px] font-normal text-[var(--primary)]"
          >
            Open Vault →
          </button>
        </section>
      ) : null}

      {state.pendingResources.length > 0 ? (
        <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] font-normal text-[var(--text-2)]">{state.pendingResources.length} resources waiting</p>
            <span className="rounded-full bg-[var(--amber-muted)] px-2 py-1 text-[11px] font-medium text-[var(--amber)]">
              Learn
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate("/learn?tab=resources")}
            className="tap-scale mt-3 rounded-[10px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2 text-[13px] font-normal text-[var(--text-1)]"
          >
            Open resources
          </button>
        </section>
      ) : null}
    </div>
  );
};
