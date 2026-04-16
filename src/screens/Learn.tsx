import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Check,
  FileText,
  Lock,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Link2,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { Course, Note, Resource, Task } from "../data/types";

type LearnTab = "courses" | "notes" | "resources";
type NoteStep = 1 | 2;

const areaLabel = (areaId: string): string => {
  const labels: Record<string, string> = {
    career: "Career",
    health: "Health",
    mind: "Mind",
    finance: "Finance",
    relationships: "Relationships",
    creative: "Creative",
  };
  return labels[areaId] ?? areaId;
};

const areaColor = (areaId: string): string => {
  const colors: Record<string, string> = {
    career: "#7C6FF7",
    health: "#1DB37E",
    mind: "#4A90D9",
    finance: "#C4840A",
    relationships: "#E0607E",
    creative: "#E8850C",
  };
  return colors[areaId] ?? "var(--text-3)";
};

const noteTypes = ["All", "Career", "Health", "Mind", "Finance", "Creative", "Relationships"];

const modules = [
  {
    title: "Module 1",
    status: "done",
    lessons: ["Intro to the stack", "Project overview", "Setting up local dev"],
  },
  {
    title: "Module 2",
    status: "current",
    lessons: ["Routing basics", "Building your first route", "Saving data and responding"],
  },
  {
    title: "Module 3",
    status: "locked",
    lessons: ["Auth patterns", "Middlewares", "Validation"],
  },
  {
    title: "Module 4",
    status: "locked",
    lessons: ["Deployment", "Observability", "Final project"],
  },
];

const lessonBody = [
  "Express routing keeps your server readable by mapping each HTTP method to a focused handler.",
  "As your app grows, split features into routers so each area owns its own request flow.",
  "Route handlers should stay small: parse input, call a service, and return a response.",
];

const noteLegend = [
  { label: "Idea", color: "var(--primary)" },
  { label: "Research", color: "var(--teal)" },
  { label: "Reflection", color: "var(--amber)" },
  { label: "Quote", color: "#4A90D9" },
  { label: "Task link", color: "var(--text-3)" },
];

const priorityOptions: Task["priority"][] = ["P1", "P2", "P3"];

const areaOptions = ["career", "health", "mind", "finance", "relationships", "creative"];

const courseDecorations = (course: Course) => {
  if (course.active) {
    return "border-[var(--border-strong)] bg-[var(--s2)]";
  }
  return "opacity-70 bg-[var(--s1)]";
};

const NoteCard = ({ note, onClick }: { note: Note; onClick: () => void }) => {
  return (
    <button type="button" onClick={onClick} className="tap-scale w-full rounded-[14px] border border-[var(--border)] bg-[var(--s1)] px-5 py-4 text-left">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[12px] text-[var(--text-3)]">
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-1" style={{ background: `${areaColor(note.areaId)}22`, color: areaColor(note.areaId) }}>
              <span className="h-2 w-2 rounded-full" style={{ background: areaColor(note.areaId) }} />
              {note.type}
            </span>
            <span>{areaLabel(note.areaId)}</span>
          </div>
          <p className="mt-2 text-[14px] font-medium text-[var(--text-1)]">{note.title}</p>
          <p className="mt-1 text-[13px] font-normal text-[var(--text-3)]" style={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {note.preview}
          </p>
          <p className="mt-2 text-[12px] italic text-[var(--text-3)]">{note.source}</p>
        </div>
        <div className="text-right text-[12px] text-[var(--text-3)]">
          <p>{note.createdAt}</p>
          {note.taskTitle ? <p className="mt-1 text-[var(--primary)]">1 task →</p> : null}
        </div>
      </div>
    </button>
  );
};

const Sheet = ({ children, onClose }: { children: ReactNode; onClose: () => void }) => (
  <div className="fixed inset-0 z-[90] bg-black/50" onClick={onClose}>
    <div className="animate-slide-up fixed bottom-0 left-0 right-0 max-h-[92vh] overflow-hidden rounded-t-[20px] border border-[var(--border)] bg-[var(--s2)]" onClick={(event) => event.stopPropagation()}>
      {children}
    </div>
  </div>
);

const LessonSheet = ({ onClose, noteTaskTitle }: { onClose: () => void; noteTaskTitle?: string }) => {
  const [view, setView] = useState<"learn" | "notes">("learn");
  const { dispatch } = useAppContext();

  return (
    <Sheet onClose={onClose}>
      <div className="flex h-[92vh] flex-col">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
          <button type="button" className="tap-scale inline-flex items-center gap-2 text-[var(--text-2)]" onClick={onClose}>
            <ArrowLeft size={18} strokeWidth={1.5} />
            <span className="text-[13px] font-normal">Back</span>
          </button>
          <div className="text-center">
            <p className="text-[14px] font-medium text-[var(--text-1)]">Building your first route</p>
            <p className="text-[12px] font-normal text-[var(--text-3)]">Module 2 · Lesson 3</p>
          </div>
          <button type="button" className="tap-scale text-[var(--text-2)]">
            <MoreHorizontal size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="mx-4 mt-4 inline-flex rounded-full bg-[var(--s1)] p-1">
          {(["learn", "notes"] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={`tap-scale flex-1 rounded-full px-3 py-2 text-[13px] ${view === item ? "bg-[var(--primary)] text-white" : "text-[var(--text-3)]"}`}
              onClick={() => setView(item)}
            >
              {item === "learn" ? "Learn" : "My Notes"}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {view === "learn" ? (
            <div className="space-y-4">
              <h2 className="text-[22px] font-medium text-[var(--text-1)]">Express routes map requests to handlers.</h2>
              {lessonBody.map((paragraph) => (
                <p key={paragraph} className="text-[14px] font-normal leading-[1.7] text-[var(--text-2)]">
                  {paragraph}
                </p>
              ))}
              <pre className="overflow-x-auto rounded-[12px] bg-[#0D0D14] p-4 text-[13px] font-normal text-[var(--text-1)]">
{`app.get('/users', (req, res) => {
  res.json({ users: [] });
});`}
              </pre>
            </div>
          ) : (
            <div className="space-y-3">
              {noteTaskTitle ? (
                <div className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4 text-[13px] font-normal text-[var(--text-2)]">
                  Linked task: {noteTaskTitle}
                </div>
              ) : (
                <div className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4 text-[13px] font-normal text-[var(--text-3)]">
                  Add note →
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-[var(--border)] px-4 py-4">
          <button
            type="button"
            className="tap-scale mb-3 w-full rounded-[10px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2 text-[12px] text-[var(--text-2)]"
            onClick={() => {
              dispatch({
                type: "ADD_NOTEBOOK_ENTRY",
                payload: {
                  entry: {
                    id: `nb-${Date.now()}`,
                    areaId: "career",
                    title: "Lesson capture: Building your first route",
                    body: lessonBody.join(" "),
                    createdAt: "Just now",
                    topicIds: ["tp1"],
                  },
                },
              });
            }}
          >
            Save lesson to notebook
          </button>
          <div className="flex items-center justify-between gap-3">
            <button type="button" className="tap-scale rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-4 py-3 text-[13px] text-[var(--text-3)]">
              Previous
            </button>
            <span className="text-[12px] font-normal text-[var(--text-3)]">3 / 12</span>
            <button
              type="button"
              className="tap-scale rounded-[12px] bg-[var(--primary)] px-4 py-3 text-[13px] font-medium text-white"
              onClick={() => {
                dispatch({ type: "MARK_LESSON_COMPLETE" });
                onClose();
              }}
            >
              Mark done & next →
            </button>
          </div>
        </div>
      </div>
    </Sheet>
  );
};

const NoteDetailSheet = ({ note, onClose, onAddTask }: { note: Note; onClose: () => void; onAddTask: (task: Task) => void }) => {
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [points, setPoints] = useState(note.keyPoints);
  const [source, setSource] = useState(note.source);

  return (
    <Sheet onClose={onClose}>
      <div className="flex h-[92vh] flex-col">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
          <button type="button" className="tap-scale text-[var(--text-2)]" onClick={onClose}>
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-[60%] bg-transparent text-center text-[14px] font-medium text-[var(--text-1)] outline-none"
          />
          <button type="button" className="tap-scale text-[var(--text-2)]">
            <MoreHorizontal size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex items-center gap-2 text-[12px] text-[var(--text-3)]">
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-1" style={{ background: `${areaColor(note.areaId)}22`, color: areaColor(note.areaId) }}>
              <span className="h-2 w-2 rounded-full" style={{ background: areaColor(note.areaId) }} />
              {areaLabel(note.areaId)}
            </span>
            <span className="rounded-full bg-[var(--s3)] px-2 py-1">{note.type}</span>
          </div>

          <textarea value={body} onChange={(event) => setBody(event.target.value)} className="mt-4 min-h-28 w-full rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4 text-[14px] font-normal text-[var(--text-2)] outline-none" />

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-medium text-[var(--text-1)]">Key points</p>
              <button type="button" className="text-[12px] font-normal text-[var(--text-3)]" disabled={points.length >= 5}>
                {points.length}/5
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {points.map((point, index) => (
                <div key={`${index}-${point}`} className="flex items-center gap-2 rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2">
                  <input
                    value={point}
                    onChange={(event) => {
                      const next = [...points];
                      next[index] = event.target.value;
                      setPoints(next);
                    }}
                    className="flex-1 bg-transparent text-[13px] font-normal text-[var(--text-2)] outline-none"
                  />
                  <button
                    type="button"
                    className="text-[var(--text-3)]"
                    onClick={() => setPoints(points.filter((_, pointIndex) => pointIndex !== index))}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="tap-scale rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2 text-[13px] text-[var(--text-3)]"
                disabled={points.length >= 5}
                onClick={() => setPoints((current) => (current.length >= 5 ? current : [...current, "New point"]))}
              >
                Add point
              </button>
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-[14px] font-medium text-[var(--text-1)]">Source</p>
            <input value={source} onChange={(event) => setSource(event.target.value)} className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2 text-[13px] font-normal text-[var(--text-2)] outline-none" />
          </div>

          <button
            type="button"
            className="tap-scale mt-4 w-full rounded-[14px] bg-[var(--primary-muted)] px-4 py-3 text-[14px] font-medium text-[var(--primary)]"
            onClick={() => {
              onAddTask({
                id: `t-${Date.now()}`,
                title: `Turn note into task: ${title}`,
                areaId: note.areaId,
                priority: "P2",
                done: false,
                estimateMin: 20,
              });
              onClose();
            }}
          >
            Create task from this note
          </button>
        </div>
      </div>
    </Sheet>
  );
};

const AddNoteSheet = ({ onClose, onSave }: { onClose: () => void; onSave: (note: Note) => void }) => {
  const [step, setStep] = useState<NoteStep>(1);
  const [title, setTitle] = useState("");
  const [areaId, setAreaId] = useState("career");
  const [type, setType] = useState<Note["type"]>("Idea");
  const [body, setBody] = useState("");
  const [points, setPoints] = useState<string[]>(["First point"]);

  return (
    <Sheet onClose={onClose}>
      <div className="flex h-[90vh] flex-col px-4 pb-6 pt-8">
        <div className="absolute left-1/2 top-3 h-1 w-10 -translate-x-1/2 rounded-full bg-[var(--s3)]" />
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-medium text-[var(--text-1)]">Add note</h2>
          <span className="text-[12px] text-[var(--text-3)]">Step {step}/2</span>
        </div>

        {step === 1 ? (
          <div className="mt-5 space-y-4">
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Note title" className="w-full border-0 border-b border-[var(--border-strong)] bg-transparent px-1 py-2 text-[16px] font-normal text-[var(--text-1)] outline-none" />
            <div className="grid grid-cols-3 gap-2">
              {areaOptions.map((option) => (
                <button key={option} type="button" onClick={() => setAreaId(option)} className={`tap-scale rounded-[12px] border px-3 py-3 text-left text-[12px] ${areaId === option ? "border-[var(--primary)] bg-[var(--primary-muted)] text-[var(--primary)]" : "border-[var(--border)] bg-[var(--s1)] text-[var(--text-2)]"}`}>
                  {areaLabel(option)}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {(["Idea", "Research", "Reflection", "Quote"] as Note["type"][]).map((option) => (
                <button key={option} type="button" onClick={() => setType(option)} className={`tap-scale rounded-full px-3 py-2 text-[12px] ${type === option ? "bg-[var(--primary)] text-white" : "bg-[var(--s1)] text-[var(--text-3)]"}`}>
                  {option}
                </button>
              ))}
            </div>
            <button type="button" className="tap-scale w-full rounded-[14px] bg-[var(--primary)] py-3 text-[14px] font-medium text-white" onClick={() => setStep(2)}>
              Continue
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-4 overflow-y-auto">
            <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write the note body" className="min-h-32 w-full rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-3 text-[14px] font-normal text-[var(--text-2)] outline-none" />
            <div className="space-y-2">
              {points.map((point, index) => (
                <div key={`${index}-${point}`} className="flex items-center gap-2 rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2">
                  <input value={point} onChange={(event) => { const next = [...points]; next[index] = event.target.value; setPoints(next); }} className="flex-1 bg-transparent text-[13px] font-normal text-[var(--text-2)] outline-none" />
                  <button type="button" className="text-[var(--text-3)]" onClick={() => setPoints(points.filter((_, pointIndex) => pointIndex !== index))}>×</button>
                </div>
              ))}
              <button type="button" disabled={points.length >= 5} onClick={() => setPoints((current) => (current.length >= 5 ? current : [...current, "New point"]))} className="tap-scale rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2 text-[13px] text-[var(--text-3)]">
                Add point
              </button>
            </div>
            <button
              type="button"
              className="tap-scale w-full rounded-[14px] bg-[var(--primary)] py-3 text-[14px] font-medium text-white"
              onClick={() => {
                onSave({
                  id: `n-${Date.now()}`,
                  areaId,
                  type,
                  title: title || "Untitled note",
                  preview: body.slice(0, 80) || "Saved note",
                  source: "Captured in LifeOS",
                  createdAt: "Just now",
                  body,
                  keyPoints: points,
                });
              }}
            >
              Save note
            </button>
          </div>
        )}
      </div>
    </Sheet>
  );
};

const AddCourseSheet = ({ onClose, onSave }: { onClose: () => void; onSave: (course: Course) => void }) => {
  const [title, setTitle] = useState("");
  const [provider, setProvider] = useState("");
  const [areaId, setAreaId] = useState("career");

  return (
    <Sheet onClose={onClose}>
      <div className="px-4 pb-6 pt-8">
        <div className="absolute left-1/2 top-3 h-1 w-10 -translate-x-1/2 rounded-full bg-[var(--s3)]" />
        <h2 className="text-[18px] font-medium text-[var(--text-1)]">Add course</h2>
        <div className="mt-5 space-y-4">
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Course title" className="w-full rounded-[14px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2 text-[14px] font-normal text-[var(--text-1)] outline-none" />
          <input value={provider} onChange={(event) => setProvider(event.target.value)} placeholder="Provider" className="w-full rounded-[14px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2 text-[14px] font-normal text-[var(--text-1)] outline-none" />
          <div className="grid grid-cols-3 gap-2">
            {areaOptions.map((option) => (
              <button key={option} type="button" onClick={() => setAreaId(option)} className={`tap-scale rounded-[12px] border px-3 py-3 text-left text-[12px] ${areaId === option ? "border-[var(--primary)] bg-[var(--primary-muted)] text-[var(--primary)]" : "border-[var(--border)] bg-[var(--s1)] text-[var(--text-2)]"}`}>
                {areaLabel(option)}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="tap-scale w-full rounded-[14px] bg-[var(--primary)] py-3 text-[14px] font-medium text-white"
            onClick={() =>
              onSave({
                id: `c-${Date.now()}`,
                title: title || "New course",
                provider: provider || "Self-paced",
                areaId,
                progress: 0,
                totalLessons: 12,
                nextLesson: "Start here",
                active: false,
              })
            }
          >
            Add course
          </button>
        </div>
      </div>
    </Sheet>
  );
};

const ResourcePanel = ({
  resource,
  onAccept,
  onReject,
  onChange,
  mode,
  accepted,
  destination,
  onDestinationChange,
}: {
  resource: Resource | null;
  onAccept: () => void;
  onReject: () => void;
  onChange: () => void;
  mode: "default" | "change";
  accepted: boolean;
  destination: "task" | "note" | "vault";
  onDestinationChange: (destination: "task" | "note" | "vault") => void;
}) => {
  if (!resource) return null;

  if (accepted) {
    return (
      <div className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-4" style={{ borderLeft: "3px solid var(--teal)" }}>
        <div className="flex items-center gap-2 text-[12px] text-[var(--teal)]">
          <Check size={16} strokeWidth={1.5} />
          <span>Accepted and saved</span>
        </div>
        <p className="mt-3 text-[13px] font-normal text-[var(--text-2)]">This resource is now in your stack. It will collapse shortly.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-4" style={{ borderLeft: "3px solid var(--primary)" }}>
      <div className="flex items-center gap-2 text-[12px] text-[var(--primary)]">
        <Sparkles size={16} strokeWidth={1.5} />
        <span>AI processed this</span>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[12px] text-[var(--text-3)]">
        <span className="rounded-full bg-[var(--primary-muted)] px-2 py-1 text-[var(--primary)]">Career</span>
        <span className="rounded-full bg-[var(--s3)] px-2 py-1">Technical resource</span>
      </div>
      <p className="mt-3 text-[13px] font-normal text-[var(--text-2)]">This resource is useful because it matches your current backend focus.</p>
      <div className="mt-3 rounded-[14px] bg-[var(--primary-muted)] p-3 text-[13px] font-normal text-[var(--text-1)]">
        Suggested action: turn it into a concrete implementation checklist.
      </div>

      {mode === "change" ? (
        <div className="mt-4 space-y-2">
          <p className="text-[12px] text-[var(--text-3)]">Choose destination</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "task", label: "Focus backlog" },
              { id: "note", label: "Learn note" },
              { id: "vault", label: "Vault" },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                className={`tap-scale rounded-[12px] border px-3 py-3 text-left text-[12px] ${
                  destination === option.id ? "border-[var(--primary)] bg-[var(--primary-muted)] text-[var(--primary)]" : "border-[var(--border)] bg-[var(--s1)] text-[var(--text-2)]"
                }`}
                onClick={() => onDestinationChange(option.id as "task" | "note" | "vault")}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="rounded-[12px] border border-[var(--border)] bg-[var(--s1)] p-3 text-[12px] text-[var(--text-3)]">Area: Career</div>
            <div className="rounded-[12px] border border-[var(--border)] bg-[var(--s1)] p-3 text-[12px] text-[var(--text-3)]">Priority: P2</div>
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex gap-2">
        <button type="button" className="tap-scale flex-1 rounded-[12px] bg-[var(--primary)] px-3 py-3 text-[13px] font-medium text-white" onClick={onAccept}>
          Accept
        </button>
        <button type="button" className="tap-scale flex-1 rounded-[12px] bg-[var(--s3)] px-3 py-3 text-[13px] font-medium text-[var(--text-1)]" onClick={onChange}>
          Change it
        </button>
        <button type="button" className="tap-scale rounded-[12px] border border-[var(--border)] bg-transparent px-3 py-3 text-[13px] font-medium text-[var(--text-3)]" onClick={onReject}>
          Reject
        </button>
      </div>
    </div>
  );
};

export const Learn = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<LearnTab>("courses");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAreaFilter, setSelectedAreaFilter] = useState("All");
  const [treeOpen, setTreeOpen] = useState(true);
  const [moduleOpen, setModuleOpen] = useState<Record<number, boolean>>({ 1: true, 2: true });
  const [lessonOpen, setLessonOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState<Note | null>(null);
  const [addNoteOpen, setAddNoteOpen] = useState(false);
  const [addCourseOpen, setAddCourseOpen] = useState(false);
  const [resourceMode, setResourceMode] = useState<"default" | "change">("default");
  const [resourceAccepted, setResourceAccepted] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(state.pendingResources[0] ?? null);
  const [toast, setToast] = useState<string | null>(null);
  const [resourceDestination, setResourceDestination] = useState<"task" | "note" | "vault">("task");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "resources") setActiveTab("resources");
    if (tab === "notes") setActiveTab("notes");
    if (tab === "courses") setActiveTab("courses");
  }, [searchParams]);

  const activeCourse = state.learnCourses.find((course) => course.active) ?? state.learnCourses[0];
  const savedCourses = state.learnCourses.filter((course) => !course.active);
  const filteredNotes = state.learnNotes.filter((note) => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = selectedAreaFilter === "All" || areaLabel(note.areaId) === selectedAreaFilter;
    return matchesSearch && matchesArea;
  });

  const acceptedResources = state.resources.filter((resource) => resource.status === "accepted");
  const usedSlots = acceptedResources.length;
  const areaSlotSummary = ["career", "mind", "finance"]
    .map((areaId) => {
      const count = acceptedResources.filter((resource) => resource.areaId === areaId).length;
      return `${areaLabel(areaId)} ${count}/3`;
    })
    .join(" · ");

  const activeResource = selectedResource ?? state.pendingResources[0] ?? null;

  useEffect(() => {
    if (selectedResource && !state.pendingResources.some((resource) => resource.id === selectedResource.id)) {
      setSelectedResource(state.pendingResources[0] ?? null);
    }
  }, [selectedResource, state.pendingResources]);

  const processResource = () => {
    if (!activeResource) return;
    setToast("AI processed this");
    window.setTimeout(() => setToast(null), 2000);
  };

  const addTaskFromNote = (task: Task) => {
    if (!noteOpen) return;
    dispatch({ type: "ADD_TASK_FROM_NOTE", payload: { task, noteId: noteOpen.id } });
    setToast("Task added to Career backlog →");
    window.setTimeout(() => setToast(null), 2200);
  };

  const handleAcceptResource = () => {
    if (!activeResource) return;
    setResourceAccepted(true);

    if (resourceDestination === "task") {
      dispatch({
        type: "ADD_TASK",
        payload: {
          task: {
            id: `t-${Date.now()}`,
            title: `Action from resource: ${activeResource.source}`,
            areaId: activeResource.areaId,
            priority: "P2",
            done: false,
            estimateMin: 20,
          },
        },
      });
    }

    if (resourceDestination === "note") {
      dispatch({
        type: "ADD_NOTE",
        payload: {
          note: {
            id: `n-${Date.now()}`,
            areaId: activeResource.areaId,
            type: "Research",
            title: `Resource note: ${activeResource.source}`,
            preview: activeResource.insight,
            source: "AI Resource Processing",
            createdAt: "Just now",
            body: `${activeResource.insight} ${activeResource.suggestedAction}`,
            keyPoints: [activeResource.suggestedAction],
          },
        },
      });
    }

    if (resourceDestination === "vault") {
      dispatch({
        type: "ADD_VAULT_ITEM",
        payload: {
          item: {
            id: `v-${Date.now()}`,
            type: "Note",
            tag: "When I feel lost",
            content: `${activeResource.source}: ${activeResource.suggestedAction}`,
            daysAgo: 0,
          },
        },
      });
    }

    dispatch({ type: "ACCEPT_RESOURCE", payload: { resourceId: activeResource.id } });
    setToast("Saved and routed");
    setResourceMode("default");
    window.setTimeout(() => setToast(null), 2000);
    window.setTimeout(() => {
      setResourceAccepted(false);
      setSelectedResource((current) => {
        if (!current) {
          return null;
        }
        const remaining = state.pendingResources.filter((item) => item.id !== activeResource.id);
        return remaining[0] ?? null;
      });
    }, 3000);
  };

  const handleRejectResource = () => {
    if (!activeResource) return;
    dispatch({ type: "REJECT_RESOURCE", payload: { resourceId: activeResource.id } });
    setToast("Rejected");
    setResourceMode("default");
    window.setTimeout(() => setToast(null), 1500);
  };

  const resourceDecision = activeResource ? (
    <ResourcePanel
      resource={activeResource}
      mode={resourceMode}
      accepted={resourceAccepted}
      destination={resourceDestination}
      onDestinationChange={setResourceDestination}
      onAccept={handleAcceptResource}
      onReject={handleRejectResource}
      onChange={() => setResourceMode((current) => (current === "default" ? "change" : "default"))}
    />
  ) : null;

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--s2)] p-1">
        {(["courses", "notes", "resources"] as LearnTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab);
              setSearchParams(tab === "resources" ? { tab } : {});
            }}
            className={`tap-scale rounded-full px-4 py-2 text-[13px] ${activeTab === tab ? "bg-[var(--primary)] font-medium text-white" : "bg-transparent font-normal text-[var(--text-3)]"}`}
          >
            {tab === "courses" ? "Courses" : tab === "notes" ? "Notes" : "Resources"}
          </button>
        ))}
      </div>

      <header className="flex items-center justify-between gap-3">
        {searchOpen ? (
          <input
            autoFocus
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search notes"
            className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-4 py-3 text-[14px] font-normal text-[var(--text-1)] outline-none"
          />
        ) : (
          <h1 className="text-page-title text-[var(--text-1)]">Learn</h1>
        )}
        <button type="button" className="tap-scale inline-flex h-10 w-10 items-center justify-center rounded-[10px] text-[var(--text-2)]" onClick={() => setSearchOpen((current) => !current)}>
          <Search size={20} strokeWidth={1.5} />
        </button>
      </header>

      {activeTab === "courses" ? (
        <div className="space-y-4">
          <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] border-l-[3px] border-l-[var(--primary)] p-4">
            <p className="text-[13px] font-normal text-[var(--text-2)]">One course at a time. Finish what you started.</p>
            <p className="mt-1 text-[12px] font-normal text-[var(--text-3)]">Switch only after completing or consciously pausing.</p>
          </section>

          {activeCourse ? (
            <section className="rounded-[14px] border border-[var(--border-strong)] bg-[var(--s2)] p-5">
              <button type="button" className="w-full text-left" onClick={() => setTreeOpen((current) => !current)}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[var(--primary-muted)] px-2 py-1 text-[12px] font-normal text-[var(--primary)]">Active course</span>
                    <span className="rounded-full bg-[var(--s3)] px-2 py-1 text-[12px] font-normal text-[var(--text-3)]">Udemy</span>
                  </div>
                  <span className="rounded-full bg-[var(--s3)] px-2 py-1 text-[12px] font-normal text-[var(--text-3)]">Career</span>
                </div>
                <p className="mt-3 text-[16px] font-medium text-[var(--text-1)]">Node.js &amp; Express — Backend Fundamentals</p>
                <div className="mt-4 h-2 rounded-[14px] bg-[var(--s3)]">
                  <div className="h-2 rounded-[14px] bg-[var(--primary)]" style={{ width: `${activeCourse ? (activeCourse.progress / activeCourse.totalLessons) * 100 : 0}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[12px] font-normal text-[var(--text-3)]">{activeCourse.progress} of {activeCourse.totalLessons} lessons complete</p>
                  <span className="rounded-full bg-[var(--amber-muted)] px-2 py-1 text-[11px] font-medium text-[var(--amber)]">{Math.round((activeCourse.progress / activeCourse.totalLessons) * 100)}%</span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-[13px] font-normal text-[var(--text-2)]">
                  <BookOpen size={16} strokeWidth={1.5} />
                  <span>Next: Module 2 · Lesson 3 — Building your first route</span>
                </div>
                <div className="mt-4 text-center text-[12px] font-normal text-[var(--text-3)]">Switch active course</div>
              </button>
              <button type="button" className="tap-scale mt-4 h-11 w-full rounded-[14px] bg-[var(--primary)] text-[14px] font-medium text-white">
                Continue →
              </button>
            </section>
          ) : null}

          {treeOpen ? (
            <section className="space-y-3">
              {modules.map((module, moduleIndex) => {
                const expanded = moduleOpen[moduleIndex + 1] ?? false;
                const locked = module.status === "locked";
                return (
                  <div key={module.title} className={`rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4 ${locked ? "opacity-50" : ""}`}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between text-left"
                      onClick={() => setModuleOpen((current) => ({ ...current, [moduleIndex + 1]: !current[moduleIndex + 1] }))}
                    >
                      <div className="flex items-center gap-2 text-[14px] font-medium text-[var(--text-1)]">
                        {expanded ? <ChevronDown size={16} strokeWidth={1.5} /> : <ChevronRight size={16} strokeWidth={1.5} />}
                        {module.title}
                        {module.status === "done" ? <span className="text-[12px] text-[var(--teal)]">✓</span> : null}
                        {locked ? <Lock size={12} strokeWidth={1.5} className="text-[var(--text-3)]" /> : null}
                      </div>
                    </button>
                    {expanded ? (
                      <div className="mt-3 space-y-2">
                        {module.lessons.map((lesson, lessonIndex) => {
                          const isCurrent = moduleIndex === 1 && lessonIndex === 2;
                          const isDone = moduleIndex === 0;
                          const rowClass = isDone
                            ? "text-[var(--text-3)]"
                            : isCurrent
                              ? "border-l-2 border-[var(--primary)] pl-3 text-[var(--text-1)]"
                              : "opacity-50 text-[var(--text-3)]";
                          return (
                            <div key={lesson} className={`flex items-center justify-between rounded-[10px] py-2 text-[13px] font-normal ${rowClass}`}>
                              <div className="flex items-center gap-2">
                                {isDone ? <Check size={14} strokeWidth={1.5} className="text-[var(--teal)]" /> : null}
                                {isCurrent ? <BookOpen size={14} strokeWidth={1.5} className="text-[var(--primary)]" /> : null}
                                {locked ? <Lock size={12} strokeWidth={1.5} /> : null}
                                <span>{lesson}</span>
                              </div>
                              {isCurrent ? (
                                <button type="button" className="tap-scale rounded-full bg-[var(--primary-muted)] px-2 py-1 text-[11px] text-[var(--primary)]" onClick={() => setLessonOpen(true)}>
                                  Resume →
                                </button>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </section>
          ) : null}

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-medium text-[var(--text-1)]">All courses</p>
              <p className="text-[12px] font-normal text-[var(--text-3)]">{savedCourses.length} saved</p>
            </div>
            {savedCourses.map((course) => (
              <button key={course.id} type="button" onClick={() => setAddCourseOpen(true)} className={`tap-scale w-full rounded-[14px] border border-[var(--border)] p-4 text-left ${courseDecorations(course)}`}>
                <p className="text-[14px] font-medium text-[var(--text-1)]">{course.title}</p>
                <p className="mt-1 text-[12px] font-normal text-[var(--text-3)]">{course.provider}</p>
              </button>
            ))}
          </section>

          <button
            type="button"
            onClick={() => setAddCourseOpen(true)}
            className="tap-scale fixed bottom-[calc(84px+env(safe-area-inset-bottom))] right-4 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-white md:bottom-8 md:right-8"
            aria-label="Add course"
          >
            <Plus size={24} strokeWidth={1.5} />
          </button>
        </div>
      ) : null}

      {activeTab === "notes" ? (
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {noteTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedAreaFilter(type)}
                className={`tap-scale shrink-0 rounded-full px-3 py-2 text-[12px] ${selectedAreaFilter === type ? "bg-[var(--primary-muted)] text-[var(--primary)]" : "bg-[var(--s2)] text-[var(--text-3)]"}`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 text-[12px] text-[var(--text-3)]">
            {noteLegend.map((entry) => (
              <span key={entry.label} className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
                {entry.label}
              </span>
            ))}
          </div>

          <div className="space-y-3">
            {filteredNotes.map((note) => (
              <div key={note.id} className="space-y-2">
                <NoteCard note={note} onClick={() => setNoteOpen(note)} />
                <div className="flex flex-wrap items-center gap-2 px-1">
                  {state.topics
                    .filter((topic) => topic.areaId === note.areaId)
                    .slice(0, 2)
                    .map((topic) => (
                      <button
                        key={topic.id}
                        type="button"
                        className="tap-scale inline-flex items-center gap-1 rounded-full bg-[var(--s2)] px-2 py-1 text-[11px] text-[var(--text-3)]"
                        onClick={() => navigate(`/topics/${topic.id}`)}
                      >
                        <Link2 size={12} strokeWidth={1.5} />
                        {topic.title}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-medium text-[var(--text-1)]">Notebook</p>
              <span className="text-[12px] text-[var(--text-3)]">{state.notebookEntries.length} entries</span>
            </div>
            <div className="mt-3 space-y-2">
              {state.notebookEntries.slice(0, 3).map((entry) => (
                <div key={entry.id} className="rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-3 py-2">
                  <p className="text-[13px] font-medium text-[var(--text-1)]">{entry.title}</p>
                  <div className="mt-2 flex items-center gap-2">
                    {entry.topicIds.slice(0, 1).map((topicId) => (
                      <button
                        key={topicId}
                        type="button"
                        className="tap-scale rounded-full bg-[var(--primary-muted)] px-2 py-1 text-[11px] text-[var(--primary)]"
                        onClick={() => navigate(`/topics/${topicId}`)}
                      >
                        Open topic
                      </button>
                    ))}
                    {!entry.convertedNoteId ? (
                      <button
                        type="button"
                        className="tap-scale rounded-full bg-[var(--s3)] px-2 py-1 text-[11px] text-[var(--text-2)]"
                        onClick={() => dispatch({ type: "CONVERT_NOTEBOOK_TO_NOTE", payload: { entryId: entry.id } })}
                      >
                        Convert to note
                      </button>
                    ) : (
                      <span className="text-[11px] text-[var(--teal)]">Converted</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <button
            type="button"
            onClick={() => setAddNoteOpen(true)}
            className="tap-scale fixed bottom-[calc(84px+env(safe-area-inset-bottom))] right-4 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-white md:bottom-8 md:right-8"
            aria-label="Add note"
          >
            <Plus size={24} strokeWidth={1.5} />
          </button>
        </div>
      ) : null}

      {activeTab === "resources" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-medium text-[var(--text-1)]">Resources</p>
            <p className="text-[12px] font-normal text-[var(--text-3)]">{usedSlots} of 15 slots used</p>
          </div>

          <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-4" style={{ borderLeft: "3px solid var(--amber)" }}>
            <div className="flex items-center gap-2 text-[var(--amber)]">
              <Sparkles size={16} strokeWidth={1.5} />
              <p className="text-[13px] font-normal text-[var(--text-2)]">Use resources like tools, not hoards.</p>
            </div>
          </section>

          <textarea
            className="min-h-28 w-full rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4 text-[14px] font-normal text-[var(--text-1)] outline-none"
            placeholder="Paste a link, quote, video URL, idea, or anything..."
          />
          <button type="button" className="tap-scale h-11 w-full rounded-[14px] bg-[var(--primary)] text-[14px] font-medium text-white" onClick={processResource}>
            Process this →
          </button>

          {resourceDecision}

          <div className="space-y-2">
            <p className="text-[12px] text-[var(--text-3)]">Pending shelf</p>
            <p className="text-[12px] text-[var(--text-3)]">{areaSlotSummary}</p>
            {state.pendingResources.map((resource) => (
              <button
                key={resource.id}
                type="button"
                onClick={() => {
                  setSelectedResource(resource);
                  setResourceMode("default");
                }}
                className="tap-scale w-full rounded-[14px] border border-[var(--border)] bg-[var(--s1)] px-4 py-3 text-left"
                style={{ borderLeft: resource.ageDays >= 3 ? "2px solid var(--amber)" : "2px solid var(--border-strong)", background: resource.ageDays >= 3 ? "rgba(196,132,10,0.06)" : undefined }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[13px] font-medium text-[var(--text-1)]">{resource.source}</p>
                    <p className="mt-1 text-[12px] font-normal text-[var(--text-3)]">{resource.insight}</p>
                  </div>
                  <span className="rounded-full bg-[var(--s2)] px-2 py-1 text-[11px] text-[var(--text-3)]">Decide →</span>
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-[12px] text-[var(--text-3)]">Past actions</p>
            {state.resources.slice(0, 3).map((resource) => (
              <div key={resource.id} className="flex items-center justify-between border-b border-[var(--border)] py-3 text-[12px] text-[var(--text-3)]">
                <span>{resource.source}</span>
                <span className={resource.status === "accepted" ? "text-[var(--teal)]" : "text-[var(--amber)]"}>{resource.status}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {toast ? <div className="fixed bottom-24 left-1/2 z-[120] -translate-x-1/2 rounded-full bg-[var(--s2)] px-4 py-2 text-[12px] text-[var(--text-1)]">{toast}</div> : null}

      {lessonOpen ? <LessonSheet onClose={() => setLessonOpen(false)} noteTaskTitle={noteOpen?.taskTitle} /> : null}

      {noteOpen ? (
        <NoteDetailSheet
          note={noteOpen}
          onClose={() => setNoteOpen(null)}
          onAddTask={addTaskFromNote}
        />
      ) : null}

      {addNoteOpen ? (
        <AddNoteSheet
          onClose={() => setAddNoteOpen(false)}
          onSave={(note) => {
            dispatch({ type: "ADD_NOTE", payload: { note } });
            setAddNoteOpen(false);
          }}
        />
      ) : null}

      {addCourseOpen ? (
        <AddCourseSheet
          onClose={() => setAddCourseOpen(false)}
          onSave={(course) => {
            dispatch({ type: "ADD_COURSE", payload: { course } });
            setAddCourseOpen(false);
          }}
        />
      ) : null}
    </div>
  );
};