import { ArrowLeft, Sparkles } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HabitRow } from "../components/HabitRow";
import { NoteDetailSheet } from "../components/NoteDetailSheet";
import { TaskCard } from "../components/TaskCard";
import { useAppContext } from "../context/AppContext";
import { Note } from "../data/types";

const insightByArea: Record<string, string> = {
  career:
    "Your task completion in Career dropped when content consumption exceeded 3 items in a day. You may be in a passive learning loop.",
  health:
    "Your workout habit has a strong correlation with your sleep score. Miss sleep, miss workout.",
  finance:
    "No Finance tasks in 14 days. This area will continue declining without a single weekly action.",
  relationships:
    "This is your most neglected area. A 5-minute text counts as a real action.",
  mind: "Your Mind score improves on weeks you finish a course lesson.",
  creative: "Creative is at 22 — your lowest. Even 20 minutes of creative work shifts the score.",
};

const phases = ["Building", "Exploring", "Maintaining", "Recovering"] as const;

const AddNoteSheet = ({
  areaId,
  onClose,
  onSave,
}: {
  areaId: string;
  onClose: () => void;
  onSave: (note: Note) => void;
}) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    onSave({
      id: `n-${Date.now()}`,
      areaId,
      type: "Idea",
      title: trimmed,
      preview: body.slice(0, 90) || "Saved note",
      source: "Area detail",
      createdAt: "Just now",
      body,
      keyPoints: ["First point"],
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div className="animate-slide-up fixed bottom-0 left-0 right-0 rounded-t-[20px] border border-[var(--border)] bg-[var(--s2)] px-5 pb-6 pt-8" onClick={(event) => event.stopPropagation()}>
        <div className="absolute left-1/2 top-3 h-1 w-10 -translate-x-1/2 rounded-full bg-[var(--s3)]" />
        <h3 className="text-[18px] font-medium text-[var(--text-1)]">Add note</h3>
        <form className="mt-4 space-y-3" onSubmit={submit}>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2 text-[14px] text-[var(--text-1)] outline-none"
            placeholder="Note title"
            autoFocus
          />
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="min-h-24 w-full rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2 text-[13px] text-[var(--text-2)] outline-none"
            placeholder="Capture what you learned"
          />
          <button type="submit" className="tap-scale w-full rounded-[14px] bg-[var(--primary)] py-3 text-[14px] font-medium text-white">
            Save note
          </button>
        </form>
      </div>
    </div>
  );
};

const NoteCard = ({ note }: { note: Note }) => {
  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] px-4 py-3">
      <p className="text-[14px] font-medium text-[var(--text-1)]">{note.title}</p>
      <p className="mt-1 text-[12px] text-[var(--text-3)]">{note.preview}</p>
      <p className="mt-2 text-[11px] italic text-[var(--text-3)]">{note.source}</p>
    </div>
  );
};

export const AreaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const [goal, setGoal] = useState("Switch to ₹60-80k role in 9 months");
  const [phase, setPhase] = useState<(typeof phases)[number]>("Building");
  const [editingGoal, setEditingGoal] = useState(false);
  const [showNoteSheet, setShowNoteSheet] = useState(false);
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  const area = state.areas.find((item) => item.id === id);

  const areaHabits = state.habits.filter((habit) => habit.areaId === id);
  const areaTasks = state.tasks.filter((task) => task.areaId === id);
  const areaNotes = state.learnNotes.filter((note) => note.areaId === id);
  const areaTopics = state.topics.filter((topic) => topic.areaId === id);
  const areaActionHistory = state.actionHistory.filter((entry) => entry.areaId === id);
  const areaBlocks = state.timeBlocks.filter((block) => block.areaId === id);

  const scoreColor = area
    ? area.score >= 65
      ? "var(--teal)"
      : area.score >= 35
        ? "var(--amber)"
        : "var(--text-3)"
    : "var(--text-3)";

  const trendData = useMemo(() => [55, 61, 63, area?.score ?? 71], [area?.score]);

  const chart = {
    width: 280,
    height: 140,
    padding: 20,
  };

  const points = trendData
    .map((value, index) => {
      const x = chart.padding + (index * (chart.width - chart.padding * 2)) / 3;
      const y = chart.height - chart.padding - (value / 100) * (chart.height - chart.padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const ringRadius = 52;
  const circumference = 2 * Math.PI * ringRadius;
  const ringOffset = circumference - ((area?.score ?? 0) / 100) * circumference;

  if (!area) {
    return (
      <section className="card-base">
        <p className="text-section text-[var(--text-1)]">Area not found</p>
        <button type="button" className="mt-4 text-[14px] text-[var(--primary)]" onClick={() => navigate("/dashboard")}>
          Back to dashboard
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="tap-scale inline-flex items-center gap-2 rounded-[10px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2 text-[13px] text-[var(--text-2)]"
        >
          <ArrowLeft size={16} strokeWidth={1.5} /> Back
        </button>
        <div className="flex items-center gap-3">
          <h2 className="text-[20px] font-medium text-[var(--text-1)]">{area.name}</h2>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[14px] text-white" style={{ backgroundColor: area.color }}>
            {area.name[0]}
          </span>
        </div>
      </header>

      <section className="card-base">
        {editingGoal ? (
          <input
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            onBlur={() => setEditingGoal(false)}
            className="w-full rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-3 py-2 text-[13px] text-[var(--text-2)] outline-none"
            autoFocus
          />
        ) : (
          <button type="button" className="text-[13px] text-[var(--text-2)]" onClick={() => setEditingGoal(true)}>
            {goal}
          </button>
        )}

        <div className="mt-3 inline-flex rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-1">
          {phases.map((entry) => (
            <button
              key={entry}
              type="button"
              onClick={() => setPhase(entry)}
              className={`tap-scale rounded-[14px] px-3 py-2 text-[12px] ${phase === entry ? "bg-[var(--primary)] text-white" : "bg-transparent text-[var(--text-3)]"}`}
            >
              {entry}
            </button>
          ))}
        </div>
      </section>

      <section className="card-base flex flex-col items-center">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={ringRadius} fill="none" stroke="var(--border)" strokeWidth="10" />
          <circle
            cx="70"
            cy="70"
            r={ringRadius}
            fill="none"
            stroke={scoreColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={ringOffset}
            transform="rotate(-90 70 70)"
          />
          <text x="70" y="70" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 36, fontWeight: 500, fill: scoreColor }}>
            {area.score}
          </text>
        </svg>
        <p className="mt-2 text-[13px]" style={{ color: area.scoreDelta >= 0 ? "var(--teal)" : "var(--amber)" }}>
          ↑ {Math.abs(area.scoreDelta)} points from last week
        </p>
      </section>

      <section className="card-base space-y-3">
        {[
          { label: "Habit completion", value: 78, weight: "40%" },
          { label: "Task completion", value: 65, weight: "35%" },
          { label: "Consistency", value: 68, weight: "25%" },
        ].map((entry) => (
          <div key={entry.label}>
            <div className="flex items-center justify-between text-[12px] text-[var(--text-2)]">
              <span>{entry.label}</span>
              <span>{entry.weight}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-[14px] bg-[var(--s3)]">
              <div className="h-1.5 rounded-[14px]" style={{ width: `${entry.value}%`, backgroundColor: scoreColor }} />
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-5">
        <p className="text-section text-[var(--text-1)]">4-week trend</p>
        <svg width="100%" height="160" viewBox="0 0 280 160" className="mt-3">
          {[0, 50, 100].map((tick) => {
            const y = 140 - (tick / 100) * 100;
            return <line key={tick} x1="20" y1={y} x2="260" y2={y} stroke="var(--border)" strokeWidth="1" />;
          })}
          <polyline points={points} fill="none" stroke={area.color} strokeWidth="2" />
          {trendData.map((value, index) => {
            const x = 20 + (index * (260 - 20)) / 3;
            const y = 140 - (value / 100) * 100;
            return <circle key={`${value}-${index}`} cx={x} cy={y} r="3" fill={area.color} />;
          })}
          {[
            ["W4", 20],
            ["W5", 100],
            ["W6", 180],
            ["W7", 260],
          ].map(([label, x]) => (
            <text key={label} x={x} y="156" textAnchor="middle" style={{ fontSize: 12, fill: "var(--text-3)" }}>
              {label}
            </text>
          ))}
          {[0, 50, 100].map((value) => (
            <text key={value} x="8" y={144 - (value / 100) * 100} textAnchor="middle" style={{ fontSize: 12, fill: "var(--text-3)" }}>
              {value}
            </text>
          ))}
        </svg>
      </section>

      <section className="space-y-2">
        <p className="text-section text-[var(--text-1)]">Habits</p>
        {areaHabits.length === 0 ? <p className="text-[12px] text-[var(--text-3)]">No habits linked.</p> : null}
        {areaHabits.map((habit) => (
          <HabitRow
            key={habit.id}
            habit={habit}
            area={area}
            onLog={() => dispatch({ type: "LOG_HABIT", payload: { habitId: habit.id } })}
          />
        ))}
      </section>

      <section className="space-y-2">
        <p className="text-section text-[var(--text-1)]">Tasks</p>
        {areaTasks.length === 0 ? <p className="text-[12px] text-[var(--text-3)]">No tasks linked.</p> : null}
        {areaTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            area={area}
            onToggle={() => dispatch({ type: "TOGGLE_TASK", payload: { taskId: task.id } })}
          />
        ))}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-section text-[var(--text-1)]">Notes & knowledge</p>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[var(--s2)] px-2 py-1 text-[11px] text-[var(--text-3)]">{areaNotes.length}</span>
            <button
              type="button"
              className="tap-scale rounded-[10px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2 text-[12px] text-[var(--primary)]"
              onClick={() => setShowNoteSheet(true)}
            >
              Add note
            </button>
          </div>
        </div>
        {areaNotes.map((note) => (
          <button key={note.id} type="button" className="w-full text-left" onClick={() => setActiveNote(note)}>
            <NoteCard note={note} />
          </button>
        ))}
        {areaTopics.length > 0 ? (
          <div className="pt-1">
            <p className="text-[12px] text-[var(--text-3)]">Connected topics</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {areaTopics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  className="tap-scale rounded-full bg-[var(--primary-muted)] px-3 py-1 text-[11px] text-[var(--primary)]"
                  onClick={() => navigate(`/topics/${topic.id}`)}
                >
                  {topic.title}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="space-y-2">
        <p className="text-section text-[var(--text-1)]">Area statistics</p>
        <div className="grid grid-cols-3 gap-2">
          <article className="rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-3">
            <p className="text-[18px] font-medium text-[var(--teal)]">{areaTasks.filter((task) => task.done).length}</p>
            <p className="text-[11px] text-[var(--text-3)]">Tasks done</p>
          </article>
          <article className="rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-3">
            <p className="text-[18px] font-medium text-[var(--primary)]">{areaBlocks.length}</p>
            <p className="text-[11px] text-[var(--text-3)]">Time blocks</p>
          </article>
          <article className="rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-3">
            <p className="text-[18px] font-medium text-[var(--amber)]">{areaActionHistory.length}</p>
            <p className="text-[11px] text-[var(--text-3)]">Action conversions</p>
          </article>
        </div>

        {areaActionHistory.length > 0 ? (
          <div className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-3">
            <p className="text-[12px] text-[var(--text-3)]">Latest converted action</p>
            <p className="mt-1 text-[13px] text-[var(--text-2)]">{areaActionHistory[0].output}</p>
          </div>
        ) : null}
      </section>

      <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-4" style={{ borderLeft: "3px solid var(--primary)" }}>
        <div className="flex items-center gap-2 text-[12px] text-[var(--primary)]">
          <Sparkles size={16} strokeWidth={1.5} />
          AI observation
        </div>
        <p className="mt-2 text-[13px] italic text-[var(--text-2)]">{insightByArea[area.id] ?? insightByArea.career}</p>
      </section>

      {showNoteSheet ? (
        <AddNoteSheet
          areaId={area.id}
          onClose={() => setShowNoteSheet(false)}
          onSave={(note) => {
            dispatch({ type: "ADD_NOTE", payload: { note } });
            setShowNoteSheet(false);
          }}
        />
      ) : null}

      <NoteDetailSheet
        open={Boolean(activeNote)}
        note={activeNote}
        topics={areaTopics}
        onClose={() => setActiveNote(null)}
        onAddToTopic={(topicId) => {
          if (!activeNote) return;
          dispatch({ type: "ADD_TOPIC_NOTE_LINK", payload: { topicId, noteId: activeNote.id } });
          setActiveNote(null);
        }}
      />
    </section>
  );
};
