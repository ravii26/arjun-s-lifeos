import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Concept, Course, DomainId, InboxLearningItem, Note, Resource, ReviewRating, Skill, Topic } from "../../data/types";
import { formatMonthDay, getDayDifference, getTodayDateKey } from "../../lib/date";

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

const getReviewToneClass = (tone: string): string => {
  const tones: Record<string, string> = {
    urgent: "bg-[#4D1F24] text-[#FFB5C0]",
    due: "bg-[#3B2B18] text-[#FFD58A]",
    upcoming: "bg-[var(--primary-muted)] text-[var(--primary)]",
    calm: "bg-[var(--s3)] text-[var(--text-2)]",
    neutral: "bg-[var(--s3)] text-[var(--text-3)]",
  };
  return tones[tone] ?? tones.neutral;
};

const getConceptToneClass = (tone: string): string => getReviewToneClass(tone);

const getReviewState = (note: Note) => {
  const today = getTodayDateKey();
  if (!note.reviewDueDate) {
    return { tone: "neutral", label: "No review set", detail: "Capture one review touchpoint to keep this note alive." };
  }

  const dayDiff = getDayDifference(today, note.reviewDueDate);
  if (dayDiff < 0) {
    return {
      tone: "urgent",
      label: `${Math.abs(dayDiff)} day${Math.abs(dayDiff) === 1 ? "" : "s"} overdue`,
      detail: `Review was due ${formatMonthDay(note.reviewDueDate)}.`,
    };
  }

  if (dayDiff === 0) {
    return { tone: "due", label: "Due today", detail: "A quick review now will help this stick." };
  }

  if (dayDiff <= 3) {
    return {
      tone: "upcoming",
      label: `Due ${formatMonthDay(note.reviewDueDate)}`,
      detail: `${dayDiff} day${dayDiff === 1 ? "" : "s"} until the next review.`,
    };
  }

  return {
    tone: "calm",
    label: `Later review on ${formatMonthDay(note.reviewDueDate)}`,
  };
};

export const ConceptCard = ({
    concept,
    skill,
    onReview,
    onPractice,
  }: {
    concept: Concept;
    skill?: Skill;
    onReview: (rating: ReviewRating) => void;
    onPractice: () => void;
  }) => {
    const reviewState = getConceptReviewState(concept);

    return (
      <article className="rounded-[16px] border border-[var(--border)] bg-[var(--s1)] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-3)]">
              <span className="rounded-full bg-[var(--primary-muted)] px-2 py-1 text-[var(--primary)]">{areaLabel(concept.domainId)}</span>
              <span className="rounded-full bg-[var(--s3)] px-2 py-1">{concept.status}</span>
              {skill ? <span className="rounded-full bg-[var(--s3)] px-2 py-1">{skill.name}</span> : null}
            </div>
            <p className="mt-2 text-[15px] font-medium text-[var(--text-1)]">{concept.title}</p>
            <p className="mt-2 text-[13px] text-[var(--text-2)]">{concept.explanationSimple}</p>
            <p className="mt-1 text-[12px] italic text-[var(--text-3)]">{concept.example}</p>
          </div>
          <span className={`rounded-full px-2 py-1 text-[11px] ${getConceptToneClass(reviewState.tone)}`}>{reviewState.label}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[var(--text-3)]">
          <span className="rounded-full bg-[var(--s2)] px-2 py-1">Confidence {concept.confidenceLevel}/5</span>
          <span className="rounded-full bg-[var(--s2)] px-2 py-1">Interval {concept.reviewIntervalDays} days</span>
          <span className="rounded-full bg-[var(--s2)] px-2 py-1">{concept.reviewCount} reviews</span>
        </div>

        <p className="mt-3 text-[12px] text-[var(--text-3)]">{concept.useCaseInMyLife}</p>
        <p className="mt-2 text-[12px] text-[var(--text-3)]"><span className="font-medium text-[var(--text-2)]">First action:</span> {concept.firstAction}</p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button type="button" className="tap-scale rounded-[12px] border border-[var(--border)] bg-[var(--s2)] px-3 py-3 text-[12px] text-[var(--text-2)]" onClick={() => onReview("hard")}>Hard</button>
          <button type="button" className="tap-scale rounded-[12px] bg-[var(--teal)] px-3 py-3 text-[12px] font-medium text-white" onClick={() => onReview("easy")}>Easy</button>
          <button type="button" className="tap-scale rounded-[12px] border border-[var(--border)] bg-[var(--s2)] px-3 py-3 text-[12px] text-[var(--text-2)]" onClick={onPractice}>Practice</button>
        </div>
      </article>
    );
  };

const getConceptReviewState = (concept: Concept) => {
  const today = getTodayDateKey();
  const dayDiff = getDayDifference(today, concept.nextReviewDate);

  if (dayDiff < 0) {
    return {
      tone: "urgent",
      label: `${Math.abs(dayDiff)} day${Math.abs(dayDiff) === 1 ? "" : "s"} overdue`,
      detail: `Review was due ${formatMonthDay(concept.nextReviewDate)}.`,
    };
  }

  if (dayDiff === 0) {
    return { tone: "due", label: "Due today", detail: "Do one quick recall pass now." };
  }

  if (dayDiff <= 3) {
    return {
      tone: "upcoming",
      label: `Due ${formatMonthDay(concept.nextReviewDate)}`,
      detail: `${dayDiff} day${dayDiff === 1 ? "" : "s"} until the next review.`,
    };
  }

  return {
    tone: "calm",
    label: `Later review on ${formatMonthDay(concept.nextReviewDate)}`,
    detail: "This concept is in a healthy rhythm.",
  };
};

const conceptTitleFromText = (text: string): string => {
  const trimmed = text.trim();
  if (!trimmed) return "Untitled concept";
  return trimmed.split(/\s+/).slice(0, 5).join(" ").replace(/[.,;:!?]+$/, "");
};

const Sheet = ({ children, onClose }: { children: ReactNode; onClose: () => void }) => (
  <div className="fixed inset-0 z-[90] bg-black/50" onClick={onClose}>
    <div className="animate-slide-up fixed bottom-0 left-0 right-0 max-h-[92vh] overflow-hidden rounded-t-[20px] border border-[var(--border)] bg-[var(--s2)]" onClick={(event) => event.stopPropagation()}>
      {children}
    </div>
  </div>
);

export const ResourceDecisionCard = ({
  resource,
  destination,
  onDestinationChange,
  onAccept,
  onReject,
  onCreateConcept,
}: {
  resource: Resource;
  destination: "task" | "note" | "vault";
  onDestinationChange: (value: "task" | "note" | "vault") => void;
  onAccept: () => void;
  onReject: () => void;
  onCreateConcept: () => void;
}) => (
  <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[14px] font-medium text-[var(--text-1)]">{resource.source}</p>
        <p className="mt-1 text-[12px] text-[var(--text-3)]">{resource.type} · {areaLabel(resource.areaId)}</p>
      </div>
      <span className="rounded-full bg-[var(--primary-muted)] px-2 py-1 text-[11px] text-[var(--primary)]">Ready to route</span>
    </div>
    <p className="mt-3 text-[13px] text-[var(--text-2)]">{resource.insight}</p>
    <p className="mt-2 text-[12px] text-[var(--text-3)]">{resource.suggestedAction}</p>
    <div className="mt-4 grid grid-cols-3 gap-2">
      {(["task", "note", "vault"] as const).map((option) => (
        <button key={option} type="button" className={`tap-scale rounded-[12px] border px-3 py-3 text-left text-[12px] ${destination === option ? "border-[var(--primary)] bg-[var(--primary-muted)] text-[var(--primary)]" : "border-[var(--border)] bg-[var(--s2)] text-[var(--text-2)]"}`} onClick={() => onDestinationChange(option)}>
          {option === "task" ? "Task" : option === "note" ? "Note" : "Vault"}
        </button>
      ))}
    </div>
    <div className="mt-4 grid grid-cols-3 gap-2">
      <button type="button" className="tap-scale rounded-[12px] bg-[var(--primary)] px-3 py-3 text-[13px] font-medium text-white" onClick={onAccept}>
        Accept
      </button>
      <button type="button" className="tap-scale rounded-[12px] border border-[var(--border)] bg-[var(--s2)] px-3 py-3 text-[13px] text-[var(--text-2)]" onClick={onCreateConcept}>
        Concept
      </button>
      <button type="button" className="tap-scale rounded-[12px] border border-[var(--border)] bg-[var(--s2)] px-3 py-3 text-[13px] text-[var(--text-2)]" onClick={onReject}>
        Reject
      </button>
    </div>
  </section>
);

export const NoteDetailSheet = ({
  note,
  topics,
  onClose,
  onSave,
  onAddTask,
  onAddTopic,
  onCreateConcept,
  onCompleteReview,
  onSnoozeReview,
}: {
  note: Note;
  topics: Topic[];
  onClose: () => void;
  onSave: (updates: Partial<Note>) => void;
  onAddTask: () => void;
  onAddTopic: (topicId: string) => void;
  onCreateConcept: () => void;
  onCompleteReview: () => void;
  onSnoozeReview: (days: number) => void;
}) => {
  const [title, setTitle] = useState(note.title);
  const [source, setSource] = useState(note.source);
  const [body, setBody] = useState(note.body);
  const [points, setPoints] = useState<string[]>(note.keyPoints.length > 0 ? note.keyPoints : [""]);
  const availableTopics = topics.filter((topic) => !(note.topicIds ?? []).includes(topic.id));
  const reviewState = getReviewState(note);

  return (
    <Sheet onClose={onClose}>
      <div className="flex h-[92vh] flex-col">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
          <button type="button" className="tap-scale text-[var(--text-2)]" onClick={onClose}>
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
          <p className="text-[14px] font-medium text-[var(--text-1)]">Note details</p>
          <div className="w-5" />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex items-center gap-2 text-[12px] text-[var(--text-3)]">
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-1" style={{ background: `${areaColor(note.areaId)}22`, color: areaColor(note.areaId) }}>
              <span className="h-2 w-2 rounded-full" style={{ background: areaColor(note.areaId) }} />
              {areaLabel(note.areaId)}
            </span>
            <span className="rounded-full bg-[var(--s3)] px-2 py-1">{note.type}</span>
            {note.linkedLesson ? <span className="rounded-full bg-[var(--primary-muted)] px-2 py-1 text-[var(--primary)]">Lesson linked</span> : null}
          </div>

          <div className="mt-4 rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[13px] font-medium text-[var(--text-1)]">Review rhythm</p>
                <p className="mt-1 text-[12px] text-[var(--text-3)]">{reviewState.detail}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-[11px] ${getReviewToneClass(reviewState.tone)}`}>{reviewState.label}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[var(--text-3)]">
              <span className="rounded-full bg-[var(--s2)] px-2 py-1">Reviews: {note.reviewCount ?? 0}</span>
              <span className="rounded-full bg-[var(--s2)] px-2 py-1">Interval: {note.reviewIntervalDays ?? 2} days</span>
              {note.lastReviewedAt ? <span className="rounded-full bg-[var(--s2)] px-2 py-1">Last: {formatMonthDay(note.lastReviewedAt)}</span> : null}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" className="tap-scale rounded-[12px] border border-[var(--border)] bg-[var(--s2)] px-3 py-3 text-[12px] text-[var(--text-2)]" onClick={() => onSnoozeReview(2)}>
                Snooze 2 days
              </button>
              <button type="button" className="tap-scale rounded-[12px] bg-[var(--teal)] px-3 py-3 text-[12px] font-medium text-white" onClick={onCompleteReview}>
                Mark reviewed
              </button>
            </div>
          </div>

          <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-4 w-full rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-3 text-[15px] font-medium text-[var(--text-1)] outline-none" />
          <input value={source} onChange={(event) => setSource(event.target.value)} className="mt-3 w-full rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-3 text-[13px] text-[var(--text-2)] outline-none" />
          <textarea value={body} onChange={(event) => setBody(event.target.value)} className="mt-3 min-h-32 w-full rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-3 text-[14px] text-[var(--text-2)] outline-none" />

          <div className="mt-4 space-y-2">
            <p className="text-[13px] font-medium text-[var(--text-1)]">Key points</p>
            {points.map((point, index) => (
              <div key={`${index}-${point}`} className="flex items-center gap-2 rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2">
                <input value={point} onChange={(event) => setPoints((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} className="flex-1 bg-transparent text-[13px] text-[var(--text-2)] outline-none" />
                <button type="button" className="text-[var(--text-3)]" onClick={() => setPoints((current) => current.length === 1 ? current : current.filter((_, itemIndex) => itemIndex !== index))}>
                  x
                </button>
              </div>
            ))}
            <button type="button" className="tap-scale rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2 text-[13px] text-[var(--text-3)]" onClick={() => setPoints((current) => [...current, ""]) }>
              Add point
            </button>
          </div>

          <div className="mt-4 rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium text-[var(--text-1)]">Topic links</p>
              <span className="text-[11px] text-[var(--text-3)]">{(note.topicIds ?? []).length} linked</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(note.topicIds ?? []).map((topicId) => {
                const topic = topics.find((item) => item.id === topicId);
                return topic ? <span key={topicId} className="rounded-full bg-[var(--primary-muted)] px-2 py-1 text-[11px] text-[var(--primary)]">{topic.title}</span> : null;
              })}
              {availableTopics.slice(0, 3).map((topic) => (
                <button key={topic.id} type="button" className="tap-scale rounded-full bg-[var(--s3)] px-2 py-1 text-[11px] text-[var(--text-2)]" onClick={() => onAddTopic(topic.id)}>
                  + {topic.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border)] px-4 py-4">
          <div className="grid grid-cols-3 gap-2">
            <button type="button" className="tap-scale rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-4 py-3 text-[13px] text-[var(--text-2)]" onClick={onAddTask}>
              Create task
            </button>
            <button type="button" className="tap-scale rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-4 py-3 text-[13px] text-[var(--text-2)]" onClick={onCreateConcept}>
              Create concept
            </button>
            <button type="button" className="tap-scale rounded-[12px] bg-[var(--primary)] px-4 py-3 text-[13px] font-medium text-white" onClick={() => { onSave({ title: title.trim() || note.title, source: source.trim() || note.source, body: body.trim(), preview: (body.trim() || note.preview).slice(0, 90), keyPoints: points.map((point) => point.trim()).filter(Boolean) }); onClose(); }}>
              Save note
            </button>
          </div>
        </div>
      </div>
    </Sheet>
  );
};

export const LessonSheet = ({
  course,
  onClose,
  onSaveNotebook,
  onCreateConcept,
  onComplete,
}: {
  course: Course;
  onClose: () => void;
  onSaveNotebook: () => void;
  onCreateConcept: () => void;
  onComplete: () => void;
}) => (
  <Sheet onClose={onClose}>
    <div className="flex h-[92vh] flex-col">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
        <button type="button" className="tap-scale inline-flex items-center gap-2 text-[var(--text-2)]" onClick={onClose}>
          <ArrowLeft size={18} strokeWidth={1.5} />
          <span className="text-[13px]">Back</span>
        </button>
        <div className="text-center">
          <p className="text-[14px] font-medium text-[var(--text-1)]">{course.title}</p>
          <p className="text-[12px] text-[var(--text-3)]">{course.nextLesson}</p>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="rounded-[16px] border border-[var(--border)] bg-[var(--s1)] p-4">
          <div className="flex items-center gap-2 text-[12px] text-[var(--primary)]">
            <Sparkles size={14} strokeWidth={1.5} />
            Learning focus
          </div>
          <p className="mt-2 text-[14px] leading-[1.7] text-[var(--text-2)]">
            Finish the lesson, capture one idea, and leave with one usable next step. That keeps this course connected to your real system.
          </p>
        </div>

        <div className="mt-4 space-y-4">
          <h2 className="text-[22px] font-medium text-[var(--text-1)]">Build reusable understanding, not just progress.</h2>
          <p className="text-[14px] leading-[1.7] text-[var(--text-2)]">Good learning systems turn lessons into evidence. The point is not just to watch the course, but to leave with a reusable mental model.</p>
          <p className="text-[14px] leading-[1.7] text-[var(--text-2)]">When you capture one note, one key point, and one concrete next action, a lesson becomes part of your system instead of staying trapped in the course player.</p>
          <p className="text-[14px] leading-[1.7] text-[var(--text-2)]">This view is designed to keep the loop tight: learn, capture, link, and apply.</p>
          <pre className="overflow-x-auto rounded-[12px] bg-[#0D0D14] p-4 text-[13px] text-[var(--text-1)]">{`app.get("/users", (req, res) => {
  res.json({ users: [] });
});`}</pre>
        </div>
      </div>

      <div className="border-t border-[var(--border)] px-4 py-4">
        <button type="button" className="tap-scale mb-3 w-full rounded-[10px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2 text-[12px] text-[var(--text-2)]" onClick={onSaveNotebook}>
          Save lesson to notebook
        </button>
        <div className="grid grid-cols-3 gap-2">
          <button type="button" className="tap-scale rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-4 py-3 text-[13px] text-[var(--text-2)]" onClick={onClose}>
            Keep reading
          </button>
          <button type="button" className="tap-scale rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-4 py-3 text-[13px] text-[var(--text-2)]" onClick={onCreateConcept}>
            Capture concept
          </button>
          <button type="button" className="tap-scale rounded-[12px] bg-[var(--primary)] px-4 py-3 text-[13px] font-medium text-white" onClick={onComplete}>
            Mark done
          </button>
        </div>
      </div>
    </div>
  </Sheet>
);

const hasSourceText = (source: InboxLearningItem): boolean => Boolean(source.rawText.trim());

export const ConceptDistillSheet = ({
  item,
  skills,
  onClose,
  onSave,
}: {
  item: InboxLearningItem;
  skills: Skill[];
  onClose: () => void;
  onSave: (concept: Concept) => void;
}) => {
  const initialDomain = item.domainHint ?? "career";
  const [title, setTitle] = useState(conceptTitleFromText(item.rawText));
  const [domainId, setDomainId] = useState<DomainId>(initialDomain);
  const [skillId, setSkillId] = useState<string>(skills.find((skill) => skill.domainId === initialDomain)?.id ?? skills[0]?.id ?? "");
  const [explanationSimple, setExplanationSimple] = useState(`Explain ${conceptTitleFromText(item.rawText).toLowerCase()} in simple words.`);
  const [example, setExample] = useState("");
  const [useCaseInMyLife, setUseCaseInMyLife] = useState("");
  const [firstAction, setFirstAction] = useState("");
  const [confidenceLevel, setConfidenceLevel] = useState<1 | 2 | 3 | 4 | 5>(3);

  useEffect(() => {
    setTitle(conceptTitleFromText(item.rawText));
    setDomainId(initialDomain);
    setSkillId(skills.find((skill) => skill.domainId === initialDomain)?.id ?? skills[0]?.id ?? "");
    setExplanationSimple(`Explain ${conceptTitleFromText(item.rawText).toLowerCase()} in simple words.`);
    setExample("");
    setUseCaseInMyLife("");
    setFirstAction("");
    setConfidenceLevel(3);
  }, [item, initialDomain, skills]);

  const availableSkills = skills.filter((skill) => skill.domainId === domainId);

  return (
    <Sheet onClose={onClose}>
      <div className="px-4 pb-6 pt-8">
        <div className="absolute left-1/2 top-3 h-1 w-10 -translate-x-1/2 rounded-full bg-[var(--s3)]" />
        <h2 className="text-[18px] font-medium text-[var(--text-1)]">Distill concept</h2>
        <p className="mt-1 text-[12px] text-[var(--text-3)]">Turn a raw capture into something you can review and use.</p>

        <div className="mt-5 space-y-4">
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Concept title" className="w-full rounded-[14px] border border-[var(--border)] bg-[var(--s1)] px-3 py-3 text-[14px] text-[var(--text-1)] outline-none" />

          <div className="grid grid-cols-3 gap-2">
            {(["career", "health", "mind", "finance", "relationships", "creative"] as DomainId[]).map((option) => (
              <button key={option} type="button" onClick={() => setDomainId(option)} className={`tap-scale rounded-[12px] border px-3 py-3 text-left text-[12px] ${domainId === option ? "border-[var(--primary)] bg-[var(--primary-muted)] text-[var(--primary)]" : "border-[var(--border)] bg-[var(--s1)] text-[var(--text-2)]"}`}>
                {areaLabel(option)}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {skills.length > 0 ? (
              skills.map((skill) => (
                <button key={skill.id} type="button" onClick={() => { setSkillId(skill.id); setDomainId(skill.domainId); }} className={`tap-scale rounded-full px-3 py-2 text-[12px] ${skillId === skill.id ? "bg-[var(--primary)] text-white" : "bg-[var(--s1)] text-[var(--text-3)]"}`}>
                  {skill.name}
                </button>
              ))
            ) : (
              <p className="text-[12px] text-[var(--text-3)]">Add a skill first.</p>
            )}
          </div>

          <textarea value={explanationSimple} onChange={(event) => setExplanationSimple(event.target.value)} placeholder="Explain simply" className="min-h-24 w-full rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-3 text-[14px] text-[var(--text-2)] outline-none" />
          <textarea value={example} onChange={(event) => setExample(event.target.value)} placeholder="Give one example" className="min-h-20 w-full rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-3 text-[14px] text-[var(--text-2)] outline-none" />
          <textarea value={useCaseInMyLife} onChange={(event) => setUseCaseInMyLife(event.target.value)} placeholder="Where will I use this this week?" className="min-h-20 w-full rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-3 text-[14px] text-[var(--text-2)] outline-none" />
          <textarea value={firstAction} onChange={(event) => setFirstAction(event.target.value)} placeholder="First action" className="min-h-20 w-full rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-3 text-[14px] text-[var(--text-2)] outline-none" />

          <div className="flex flex-wrap gap-2">
            {([1, 2, 3, 4, 5] as const).map((level) => (
              <button key={level} type="button" onClick={() => setConfidenceLevel(level)} className={`tap-scale rounded-full px-3 py-2 text-[12px] ${confidenceLevel === level ? "bg-[var(--teal)] text-white" : "bg-[var(--s1)] text-[var(--text-3)]"}`}>
                Confidence {level}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="tap-scale w-full rounded-[14px] bg-[var(--primary)] py-3 text-[14px] font-medium text-white"
            onClick={() => {
              const now = new Date().toISOString();
              const concept: Concept = {
                id: `cp-${Date.now()}`,
                title: title.trim() || conceptTitleFromText(item.rawText),
                domainId,
                skillId: skillId || undefined,
                sourceIds: [item.id],
                explanationSimple: explanationSimple.trim() || "Write the simplest possible explanation here.",
                example: example.trim() || "Add one concrete example.",
                useCaseInMyLife: useCaseInMyLife.trim() || "Add where you will use this concept.",
                firstAction: firstAction.trim() || "Add one action you can do today.",
                confidenceLevel,
                status: "new",
                nextReviewDate: getTodayDateKey(),
                reviewIntervalDays: 1,
                reviewCount: 0,
                createdAt: now,
                updatedAt: now,
              };
              onSave(concept);
            }}
            disabled={!hasSourceText(item)}
          >
            Save concept
          </button>

          <p className="text-[12px] text-[var(--text-3)]">Skills available in this domain: {availableSkills.length}</p>
        </div>
      </div>
    </Sheet>
  );
};