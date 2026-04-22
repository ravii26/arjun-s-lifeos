import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  Lightbulb,
  Link2,
  Lock,
  NotebookPen,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AIInsightCard } from "../components/AIInsightCard";
import { useAppContext } from "../context/AppContext";
import { insightCatalog } from "../data/insights";
import { Concept, Course, DomainId, InboxLearningItem, Note, PracticeLog, ReviewRating, Resource, Skill, Task, Topic } from "../data/types";
import { formatMonthDay, getDayDifference, getTodayDateKey } from "../lib/date";
import { ConceptCard, ConceptDistillSheet, LessonSheet, NoteDetailSheet, ResourceDecisionCard } from "./learn/KnowledgeFeatures";

type LearnTab = "courses" | "notes" | "resources";
type LearningMode = "capture" | "concepts" | "review";

const learningModeOptions: Array<{ id: LearningMode; label: string }> = [
  { id: "capture", label: "Capture" },
  { id: "concepts", label: "Concepts" },
  { id: "review", label: "Review" },
];

const noteTypes = ["All", "Career", "Health", "Mind", "Finance", "Creative", "Relationships"];
const reviewFilterOptions = ["All", "Due", "Upcoming", "Reviewed"];
const areaOptions = ["career", "health", "mind", "finance", "relationships", "creative"];
const sourceTypeOptions: InboxLearningItem["sourceType"][] = ["idea", "link", "video", "book", "course"];
const conceptStatusOptions: Array<"All" | Concept["status"]> = ["All", "new", "learning", "applied", "mastered"];
const lessonParagraphs = [
  "Good learning systems turn lessons into evidence. The point is not just to watch the course, but to leave with a reusable mental model.",
  "When you capture one note, one key point, and one concrete next action, a lesson becomes part of your system instead of staying trapped in the course player.",
  "This view is designed to keep the loop tight: learn, capture, link, and apply.",
];

const modules = [
  { title: "Module 1", status: "done" as const, lessons: ["Intro to the stack", "Project overview", "Setting up local dev"] },
  { title: "Module 2", status: "current" as const, lessons: ["Routing basics", "Building your first route", "Saving data and responding"] },
  { title: "Module 3", status: "locked" as const, lessons: ["Auth patterns", "Middlewares", "Validation"] },
];

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

// Helper components
const NoteCard = ({ note, onClick }: { note: Note; onClick: () => void }) => {
  const reviewState = getReviewState(note);
  return (
    <article className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4 cursor-pointer tap-scale" onClick={onClick}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-[var(--text-1)]">{note.title}</p>
          <p className="mt-1 text-[12px] text-[var(--text-3)]">{note.preview}</p>
        </div>
        <span className={`rounded-full px-2 py-1 text-[11px] ${getReviewToneClass(reviewState.tone)}`}>{reviewState.label}</span>
      </div>
    </article>
  );
};

const AddNoteSheet = ({ onClose, onSave }: { onClose: () => void; onSave: (note: Note) => void }) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [areaId, setAreaId] = useState<DomainId>("career");

  return (
    <div className="fixed inset-0 z-[90] bg-black/50" onClick={onClose}>
      <div className="animate-slide-up fixed bottom-0 left-0 right-0 max-h-[92vh] overflow-hidden rounded-t-[20px] border border-[var(--border)] bg-[var(--s2)] p-4" onClick={(event) => event.stopPropagation()}>
        <h2 className="text-[18px] font-medium text-[var(--text-1)]">Add Note</h2>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="mt-4 w-full rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-3 outline-none" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Body" className="mt-3 min-h-32 w-full rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-3 outline-none" />
        <div className="mt-4 flex gap-2">
          <button type="button" className="tap-scale flex-1 rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-4 py-3" onClick={onClose}>Cancel</button>
          <button type="button" className="tap-scale flex-1 rounded-[12px] bg-[var(--primary)] px-4 py-3 text-white font-medium" onClick={() => {
            if (title.trim()) {
              onSave({
                id: `n-${Date.now()}`,
                areaId,
                type: "Idea" as const,
                title,
                preview: body.slice(0, 90),
                source: "Manual",
                body,
                keyPoints: [],
                linkedLesson: undefined,
                createdAt: new Date().toISOString(),
                topicIds: [],
                reviewDueDate: getTodayDateKey(),
                reviewIntervalDays: 2,
                reviewCount: 0,
              });
              onClose();
            }
          }}>Save</button>
        </div>
      </div>
    </div>
  );
};

const AddCourseSheet = ({ onClose, onSave }: { onClose: () => void; onSave: (course: Course) => void }) => {
  const [title, setTitle] = useState("");
  const [areaId, setAreaId] = useState<DomainId>("career");

  return (
    <div className="fixed inset-0 z-[90] bg-black/50" onClick={onClose}>
      <div className="animate-slide-up fixed bottom-0 left-0 right-0 max-h-[92vh] overflow-hidden rounded-t-[20px] border border-[var(--border)] bg-[var(--s2)] p-4" onClick={(event) => event.stopPropagation()}>
        <h2 className="text-[18px] font-medium text-[var(--text-1)]">Add Course</h2>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Course title" className="mt-4 w-full rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-3 outline-none" />
        <div className="mt-4 flex gap-2">
          <button type="button" className="tap-scale flex-1 rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-4 py-3" onClick={onClose}>Cancel</button>
          <button type="button" className="tap-scale flex-1 rounded-[12px] bg-[var(--primary)] px-4 py-3 text-white font-medium" onClick={() => {
            if (title.trim()) {
              onSave({
                id: `c-${Date.now()}`,
                areaId,
                title,
                provider: "Manual",
                active: false,
                progress: 0,
                totalLessons: 0,
                nextLesson: "Start course",
              });
              onClose();
            }
          }}>Save</button>
        </div>
      </div>
    </div>
  );
};

const Learn = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<LearnTab>("courses");
  const [learningMode, setLearningMode] = useState<LearningMode>("capture");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAreaFilter, setSelectedAreaFilter] = useState("All");
  const [selectedReviewFilter, setSelectedReviewFilter] = useState("All");
  const [conceptSearch, setConceptSearch] = useState("");
  const [conceptDomainFilter, setConceptDomainFilter] = useState<"All" | DomainId>("All");
  const [conceptStatusFilter, setConceptStatusFilter] = useState<"All" | Concept["status"]>("All");
  const [captureDraft, setCaptureDraft] = useState("");
  const [captureDomain, setCaptureDomain] = useState<DomainId>("career");
  const [captureSourceType, setCaptureSourceType] = useState<InboxLearningItem["sourceType"]>("idea");
  const [distillSource, setDistillSource] = useState<InboxLearningItem | null>(state.learningInbox[0] ?? null);
  const [distillOpen, setDistillOpen] = useState(false);
  const [moduleOpen, setModuleOpen] = useState<Record<number, boolean>>({ 1: true, 2: true });
  const [lessonOpen, setLessonOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(state.pendingResources[0]?.id ?? null);
  const [addNoteOpen, setAddNoteOpen] = useState(false);
  const [addCourseOpen, setAddCourseOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [resourceDraft, setResourceDraft] = useState("");
  const [resourceDestination, setResourceDestination] = useState<"task" | "note" | "vault">("task");

  // Computed values
  const activeSkills = useMemo(() => state.skills.filter((skill) => skill.weeklyFocus), [state.skills]);
  const activeCourse = useMemo(() => state.learnCourses.find((course) => course.active) ?? state.learnCourses[0] ?? null, [state.learnCourses]);
  const activeCourseProgress = activeCourse ? Math.round((activeCourse.progress / Math.max(1, activeCourse.totalLessons)) * 100) : 0;
  const today = getTodayDateKey();
  const reviewedNotesCount = state.learnNotes.filter((note) => Boolean(note.lastReviewedAt)).length;
  const inboxCaptureCount = state.learningInbox.length;
  
  const dueConcepts = useMemo(() => state.concepts.filter((c) => getDayDifference(today, c.nextReviewDate) <= 0), [state.concepts, today]);
  const linkedNotesCount = state.learnNotes.filter((note) => (note.topicIds ?? []).length > 0).length;
  const dueReviewCount = state.learnNotes.filter((note) => note.reviewDueDate && getDayDifference(today, note.reviewDueDate) <= 0).length;
  const upcomingReviewCount = state.learnNotes.filter((note) => note.reviewDueDate && getDayDifference(today, note.reviewDueDate) > 0 && getDayDifference(today, note.reviewDueDate) <= 3).length;

  const selectedNote = state.learnNotes.find((note) => note.id === selectedNoteId);
  const selectedResource = state.pendingResources.find((resource) => resource.id === selectedResourceId);
  const selectedInboxItem = distillSource ?? state.learningInbox[0];
  const acceptedResources = state.resources ?? [];

  const filteredConcepts = useMemo(() => {
    return state.concepts.filter((concept) => {
      if (conceptStatusFilter !== "All" && concept.status !== conceptStatusFilter) return false;
      if (conceptDomainFilter !== "All" && concept.domainId !== conceptDomainFilter) return false;
      if (conceptSearch && !concept.title.toLowerCase().includes(conceptSearch.toLowerCase())) return false;
      return true;
    });
  }, [state.concepts, conceptStatusFilter, conceptDomainFilter, conceptSearch]);

  const filteredNotes = useMemo(() => {
    return state.learnNotes.filter((note) => {
      if (selectedAreaFilter !== "All" && areaLabel(note.areaId) !== selectedAreaFilter) return false;
      if (searchTerm && !note.title.toLowerCase().includes(searchTerm.toLowerCase()) && !note.body.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (selectedReviewFilter === "Due" && getDayDifference(today, note.reviewDueDate ?? "") > 0) return false;
      if (selectedReviewFilter === "Upcoming" && getDayDifference(today, note.reviewDueDate ?? "") <= 0) return false;
      if (selectedReviewFilter === "Reviewed" && !note.lastReviewedAt) return false;
      return true;
    });
  }, [state.learnNotes, selectedAreaFilter, searchTerm, selectedReviewFilter, today]);

  const conceptsBySkillId = useMemo(() => new Map(state.concepts.map((c) => [c.skillId || "", c])), [state.concepts]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "notes" || tab === "resources") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const setTab = (tab: LearnTab) => {
    setActiveTab(tab);
    if (tab === "courses") {
      setSearchParams({});
      return;
    }
    setSearchParams({ tab });
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const captureLearningItem = () => {
    if (!captureDraft.trim()) return;
    const item: InboxLearningItem = {
      id: `li-${Date.now()}`,
      sourceType: captureSourceType,
      rawText: captureDraft,
      domainHint: captureDomain,
      createdAt: new Date().toISOString(),
      convertedConceptId: undefined,
    };
    dispatch({ type: "ADD_LEARNING_INBOX_ITEM", payload: { item } });
    setCaptureDraft("");
    showToast("Learning item captured");
  };

  const openConceptDistill = (item: InboxLearningItem) => {
    setDistillSource(item);
    setDistillOpen(true);
  };

  const saveConceptFromDistill = (concept: Concept) => {
    dispatch({ type: "ADD_CONCEPT", payload: { concept } });
    setDistillOpen(false);
    showToast("Concept saved");
  };

  const logPractice = (concept: Concept) => {
    const log: PracticeLog = {
      id: `p-${Date.now()}`,
      conceptId: concept.id,
      whatIDid: "Practiced concept",
      result: "completed",
      lessonLearned: "Reinforced understanding",
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: "ADD_PRACTICE_LOG", payload: { log } });
    showToast("Practice logged");
  };

  const createConceptFromNote = (note: Note) => {
    const concept: Concept = {
      id: `cp-${Date.now()}`,
      title: note.title,
      domainId: note.areaId as DomainId,
      sourceIds: [note.id],
      explanationSimple: note.body,
      example: "",
      useCaseInMyLife: "",
      firstAction: "",
      confidenceLevel: 3,
      status: "new",
      nextReviewDate: getTodayDateKey(),
      reviewIntervalDays: 1,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: "ADD_CONCEPT", payload: { concept } });
    showToast("Concept created from note");
  };

  const createConceptFromCourse = (course: Course) => {
    const concept: Concept = {
      id: `cp-${Date.now()}`,
      title: course.nextLesson,
      domainId: course.areaId as DomainId,
      sourceIds: [course.id],
      explanationSimple: `Concept from ${course.title}`,
      example: "",
      useCaseInMyLife: "",
      firstAction: "",
      confidenceLevel: 2,
      status: "new",
      nextReviewDate: getTodayDateKey(),
      reviewIntervalDays: 1,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: "ADD_CONCEPT", payload: { concept } });
    showToast("Concept created from lesson");
  };

  const createConceptFromResource = (resource: Resource) => {
    const concept: Concept = {
      id: `cp-${Date.now()}`,
      title: resource.source,
      domainId: resource.areaId as DomainId,
      sourceIds: [resource.id],
      explanationSimple: resource.insight,
      example: "",
      useCaseInMyLife: resource.suggestedAction,
      firstAction: resource.suggestedAction,
      confidenceLevel: 2,
      status: "new",
      nextReviewDate: getTodayDateKey(),
      reviewIntervalDays: 1,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: "ADD_CONCEPT", payload: { concept } });
    showToast("Concept created from resource");
  };

  const processResourceDraft = () => {
    if (!resourceDraft.trim()) return;
    const resource: Resource = {
      id: `r-${Date.now()}`,
      areaId: captureDomain,
      type: "Link",
      source: resourceDraft.slice(0, 50),
      insight: resourceDraft,
      suggestedAction: "Review and consider adding to system",
      ageDays: 0,
      status: "pending",
    };
    dispatch({ type: "ADD_PENDING_RESOURCE", payload: { resource } });
    setResourceDraft("");
    showToast("Resource added to inbox");
  };

  const acceptSelectedResource = () => {
    if (!selectedResource) return;
    if (resourceDestination === "task") {
      const task: Task = {
        id: `t-${Date.now()}`,
        title: `Action from resource: ${selectedResource.source}`,
        areaId: selectedResource.areaId,
        priority: "P2",
        status: "pending",
        date: getTodayDateKey(),
        trackingType: "boolean",
        trackingConfig: {},
        trackingData: {
          completed: false,
        },
        linkedSessionIds: [],
        createdAt: new Date().toISOString(),
        done: false,
        estimateMin: 20,
      };
      dispatch({ type: "ADD_TASK", payload: { task } });
    }
    if (resourceDestination === "note") {
      const note: Note = {
        id: `n-${Date.now()}`,
        areaId: selectedResource.areaId,
        type: "Research",
        title: `Resource note: ${selectedResource.source}`,
        preview: selectedResource.insight,
        source: "Resource inbox",
        createdAt: new Date().toISOString(),
        body: `${selectedResource.insight}\n\n${selectedResource.suggestedAction}`,
        keyPoints: [selectedResource.suggestedAction],
        reviewDueDate: getTodayDateKey(),
        reviewIntervalDays: 2,
        reviewCount: 0,
      };
      dispatch({ type: "ADD_NOTE", payload: { note } });
    }
    if (resourceDestination === "vault") {
      dispatch({
        type: "ADD_VAULT_ITEM",
        payload: {
          item: {
            id: `v-${Date.now()}`,
            type: "Note",
            tag: "When I feel lost",
            content: `${selectedResource.source}: ${selectedResource.suggestedAction}`,
            daysAgo: 0,
          },
        },
      });
    }
    dispatch({ type: "ACCEPT_RESOURCE", payload: { resourceId: selectedResource.id } });
    showToast("Resource accepted");
  };

  const rejectSelectedResource = () => {
    if (!selectedResource) return;
    dispatch({ type: "REJECT_RESOURCE", payload: { resourceId: selectedResource.id } });
    showToast("Resource rejected");
  };

  return (
    <div className="space-y-4">
      {/* Main content here - will be added progressively */}
      <section className="rounded-[18px] border border-[var(--border)] bg-[var(--s2)] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[20px] font-medium text-[var(--text-1)]">Learning Hub</h2>
            <p className="mt-1 text-[12px] text-[var(--text-3)]">Capture, refine, and review your learning</p>
          </div>
          <div className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] px-3 py-3 text-right">
            <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-3)]">Progress</p>
            <p className="mt-2 text-[18px] font-medium text-[var(--text-1)]">{activeCourseProgress}%</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <article className="rounded-[14px] bg-[var(--s1)] px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-3)]">Captured</p>
            <p className="mt-2 text-[24px] font-medium text-[var(--text-1)]">{inboxCaptureCount}</p>
            <p className="mt-1 text-[12px] text-[var(--text-3)]">Items in learning inbox</p>
          </article>
          <article className="rounded-[14px] bg-[var(--s1)] px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-3)]">Concepts</p>
            <p className="mt-2 text-[24px] font-medium text-[var(--text-1)]">{dueConcepts.length}</p>
            <p className="mt-1 text-[12px] text-[var(--text-3)]">Due for review today</p>
          </article>
          <article className="rounded-[14px] bg-[var(--s1)] px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-3)]">Knowledge Links</p>
            <p className="mt-2 text-[24px] font-medium text-[var(--text-1)]">{linkedNotesCount}</p>
            <p className="mt-1 text-[12px] text-[var(--text-3)]">Notes connected to topics</p>
          </article>
        </div>

        <div className="mt-4 inline-flex rounded-full border border-[var(--border)] bg-[var(--s1)] p-1">
          {learningModeOptions.map((option) => (
            <button key={option.id} type="button" onClick={() => setLearningMode(option.id)} className={`tap-scale rounded-full px-4 py-2 text-[13px] ${learningMode === option.id ? "bg-[var(--primary)] font-medium text-white" : "bg-transparent text-[var(--text-3)]"}`}>
              {option.label}
            </button>
          ))}
        </div>

        {learningMode === "capture" ? (
          <div className="mt-4 space-y-4">
            <textarea value={captureDraft} onChange={(event) => setCaptureDraft(event.target.value)} className="min-h-28 w-full rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4 text-[14px] text-[var(--text-1)] outline-none" placeholder="What did you learn? Paste a quote, rule, lesson, or idea." />
            <div className="flex flex-wrap gap-2">
              <select value={captureSourceType} onChange={(e) => setCaptureSourceType(e.target.value as InboxLearningItem["sourceType"])} className="rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2 text-[13px]">
                {sourceTypeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
              <select value={captureDomain} onChange={(e) => setCaptureDomain(e.target.value as DomainId)} className="rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2 text-[13px]">
                {areaOptions.map((area) => <option key={area} value={area}>{areaLabel(area)}</option>)}
              </select>
              <button type="button" className="tap-scale ml-auto rounded-[12px] bg-[var(--primary)] px-4 py-2 text-[13px] font-medium text-white" onClick={captureLearningItem}>
                Capture
              </button>
            </div>
          </div>
        ) : null}

        {learningMode === "concepts" ? (
          <div className="mt-4 space-y-4">
            <input value={conceptSearch} onChange={(event) => setConceptSearch(event.target.value)} placeholder="Search concepts" className="w-full rounded-[14px] border border-[var(--border)] bg-[var(--s1)] px-4 py-3 text-[14px] text-[var(--text-1)] outline-none" />
            <div className="flex flex-wrap gap-2">
              {(["All", ...conceptStatusOptions.slice(1)] as const).map((status) => (
                <button key={status} type="button" onClick={() => setConceptStatusFilter(status)} className={`tap-scale rounded-full px-3 py-2 text-[12px] ${conceptStatusFilter === status ? "bg-[var(--primary)] text-white" : "bg-[var(--s2)] text-[var(--text-3)]"}`}>
                  {status}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {filteredConcepts.slice(0, 5).map((concept) => (
                <ConceptCard key={concept.id} concept={concept} onReview={(rating) => showToast(`Review recorded: ${rating}`)} onPractice={() => logPractice(concept)} />
              ))}
            </div>
          </div>
        ) : null}

        {learningMode === "review" ? (
          <div className="mt-4 space-y-3">
            {dueConcepts.slice(0, 3).map((concept) => (
                <ConceptCard key={concept.id} concept={concept} onReview={(rating) => showToast(`Review: ${rating}`)} onPractice={() => logPractice(concept)} />
            ))}
            {dueConcepts.length === 0 ? (
              <section className="rounded-[14px] border border-dashed border-[var(--border)] bg-[var(--s1)] p-5">
                <p className="text-[14px] font-medium text-[var(--text-1)]">No concepts due today.</p>
                <p className="mt-2 text-[13px] text-[var(--text-3)]">Come back later or add some concepts to review.</p>
              </section>
            ) : null}
          </div>
        ) : null}
      </section>

      <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--s2)] p-1">
        {(["courses", "notes", "resources"] as LearnTab[]).map((tab) => (
          <button key={tab} type="button" onClick={() => setTab(tab)} className={`tap-scale rounded-full px-4 py-2 text-[13px] ${activeTab === tab ? "bg-[var(--primary)] font-medium text-white" : "bg-transparent text-[var(--text-3)]"}`}>
            {tab === "courses" ? "Courses" : tab === "notes" ? "Notes" : "Resources"}
          </button>
        ))}
      </div>

      <AIInsightCard
        screenId={`learn-${activeTab}`}
        insights={activeTab === "courses" ? insightCatalog.learnCourses : activeTab === "notes" ? insightCatalog.learnNotes : insightCatalog.learnResources}
        onAskCoach={(insight) => {
          window.dispatchEvent(new CustomEvent("lifeos:open-coach", { detail: { message: `I was looking at learn and saw: ${insight}. Can you explain more?` } }));
        }}
      />

      {activeTab === "courses" ? (
        <div className="space-y-4">
          {activeCourse ? (
            <section className="rounded-[16px] border border-[var(--border-strong)] bg-[var(--s2)] p-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-3)]">Active course</p>
                  <p className="mt-1 text-[16px] font-medium text-[var(--text-1)]">{activeCourse?.title}</p>
                </div>
                <button type="button" onClick={() => setLessonOpen(true)} className="tap-scale rounded-[12px] bg-[var(--primary)] px-4 py-3 text-[13px] font-medium text-white">
                  View lesson
                </button>
              </div>
              <p className="mt-3 text-[18px] font-medium text-[var(--text-1)]">{activeCourse?.nextLesson}</p>
              <p className="mt-2 text-[13px] text-[var(--text-2)]">Stay with one course long enough to create durable notes, not just more tabs.</p>
              <div className="mt-4 h-2 rounded-[14px] bg-[var(--s3)]">
                <div className="h-2 rounded-[14px] bg-[var(--primary)]" style={{ width: `${activeCourseProgress}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[12px] text-[var(--text-3)]">
                <span>{activeCourseProgress}% complete</span>
                <span>{activeCourse?.progress || 0} of {activeCourse?.totalLessons || 0} lessons</span>
              </div>
            </section>
          ) : null}

          <section className="space-y-3">
            <h3 className="text-[16px] font-medium text-[var(--text-1)]">Learning structure</h3>
            {modules.map((module, index) => (
              <div key={index}>
                <button type="button" onClick={() => setModuleOpen((curr) => ({ ...curr, [index + 1]: !curr[index + 1] }))} className="w-full tap-scale rounded-[14px] border border-[var(--border)] bg-[var(--s1)] px-4 py-3 text-left">
                  <div className="flex items-center justify-between">
                    <p className="text-[14px] font-medium text-[var(--text-1)]">{module.title}</p>
                    <span className="text-[12px] text-[var(--text-3)]">{module.status}</span>
                  </div>
                </button>
                {moduleOpen[index + 1] ? (
                  <div className="mt-2 space-y-2 pl-4">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div key={lessonIndex} className="text-[13px] text-[var(--text-2)]">• {lesson}</div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <h3 className="text-[16px] font-medium text-[var(--text-1)]">Your courses</h3>
            {state.learnCourses.map((course) => (
              <article key={course.id} className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[14px] font-medium text-[var(--text-1)]">{course.title}</p>
                    <p className="mt-1 text-[12px] text-[var(--text-3)]">{course.provider}</p>
                  </div>
                  <button type="button" className="tap-scale rounded-[8px] bg-[var(--s2)] px-2 py-1 text-[11px]">{course.active ? "Active" : "Paused"}</button>
                </div>
              </article>
            ))}
          </section>
        </div>
      ) : null}

      {activeTab === "notes" ? (
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {noteTypes.map((type) => (
              <button key={type} type="button" onClick={() => setSelectedAreaFilter(type)} className={`tap-scale rounded-full px-4 py-2 text-[13px] whitespace-nowrap ${selectedAreaFilter === type ? "bg-[var(--primary)] text-white" : "bg-[var(--s2)] text-[var(--text-2)]"}`}>
                {type}
              </button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {reviewFilterOptions.map((filter) => (
              <button key={filter} type="button" onClick={() => setSelectedReviewFilter(filter)} className={`tap-scale rounded-full px-4 py-2 text-[13px] whitespace-nowrap ${selectedReviewFilter === filter ? "bg-[var(--primary)] text-white" : "bg-[var(--s2)] text-[var(--text-2)]"}`}>
                {filter}
              </button>
            ))}
          </div>

          <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-medium text-[var(--text-1)]">Review rhythm</h3>
              <span className="text-[11px] text-[var(--text-3)]">{dueReviewCount} due, {upcomingReviewCount} upcoming</span>
            </div>
            <p className="mt-2 text-[13px] text-[var(--text-2)]">Good learning happens when lesson notes connect to topics, turn into tasks, and come back at the right time.</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[12px]">
              <div className="rounded-full bg-[var(--s2)] px-3 py-2">
                <span className="text-[var(--text-3)]">Reviewed: {reviewedNotesCount}</span>
              </div>
              <div className="rounded-full bg-[var(--s2)] px-3 py-2">
                <span className="text-[var(--text-3)]">Due: {dueReviewCount}</span>
              </div>
              <div className="rounded-full bg-[var(--s2)] px-3 py-2">
                <span className="text-[var(--text-3)]">Linked: {linkedNotesCount}</span>
              </div>
            </div>
          </section>

          {filteredNotes.length > 0 ? (
            <div className="space-y-3">
              {filteredNotes.map((note) => (
                <NoteCard key={note.id} note={note} onClick={() => setSelectedNoteId(note.id)} />
              ))}
            </div>
          ) : (
            <section className="rounded-[14px] border border-dashed border-[var(--border)] bg-[var(--s1)] p-5">
              <p className="text-[14px] font-medium text-[var(--text-1)]">No notes match this filter yet.</p>
              <p className="mt-2 text-[13px] text-[var(--text-3)]">Try a different review state, or capture a fresh note so the loop has something to work with.</p>
            </section>
          )}

          <button type="button" onClick={() => setAddNoteOpen(true)} className="tap-scale fixed bottom-[calc(84px+env(safe-area-inset-bottom))] right-4 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-white md:bottom-8 md:right-8" aria-label="Add note">
            <Plus size={24} strokeWidth={1.5} />
          </button>
        </div>
      ) : null}

      {activeTab === "resources" ? (
        <div className="space-y-4">
          <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-4" style={{ borderLeft: "3px solid var(--amber)" }}>
            <p className="text-[13px] font-medium text-[var(--text-1)]">🎯 Decision queue</p>
            <p className="mt-1 text-[12px] text-[var(--text-3)]">Route resources into your system thoughtfully</p>
          </section>

          <textarea value={resourceDraft} onChange={(event) => setResourceDraft(event.target.value)} className="min-h-28 w-full rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4 text-[14px] text-[var(--text-1)] outline-none" placeholder="Paste a link, quote, course, or idea and route it into the system" />
          <button type="button" className="tap-scale h-11 w-full rounded-[14px] bg-[var(--primary)] text-[14px] font-medium text-white" onClick={processResourceDraft}>
            Process this
          </button>

          <section className="grid grid-cols-2 gap-3">
            <article className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
              <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-3)]">Pending</p>
              <p className="mt-2 text-[22px] font-medium text-[var(--text-1)]">{state.pendingResources.length}</p>
              <p className="mt-1 text-[12px] text-[var(--text-3)]">Waiting for a decision</p>
            </article>
            <article className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
              <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-3)]">Accepted</p>
              <p className="mt-2 text-[22px] font-medium text-[var(--text-1)]">{acceptedResources.length}</p>
              <p className="mt-1 text-[12px] text-[var(--text-3)]">Now in the system</p>
            </article>
          </section>

          {selectedResource ? (
            <ResourceDecisionCard resource={selectedResource} destination={resourceDestination} onDestinationChange={setResourceDestination} onAccept={acceptSelectedResource} onReject={rejectSelectedResource} onCreateConcept={() => createConceptFromResource(selectedResource)} />
          ) : null}

          <section className="space-y-2">
            <p className="text-[12px] text-[var(--text-3)]">Pending shelf</p>
            {state.pendingResources.map((resource) => (
              <button key={resource.id} type="button" onClick={() => setSelectedResourceId(resource.id)} className={`tap-scale w-full rounded-[14px] border px-4 py-3 text-left ${selectedResource?.id === resource.id ? "border-[var(--primary)] bg-[var(--primary-muted)]" : "border-[var(--border)] bg-[var(--s1)]"}`}>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[13px] font-medium text-[var(--text-1)]">{resource.source}</p>
                    <p className="mt-1 text-[12px] text-[var(--text-3)]">{resource.insight}</p>
                  </div>
                  <span className="rounded-full bg-[var(--s2)] px-2 py-1 text-[11px] text-[var(--text-3)]">{areaLabel(resource.areaId)}</span>
                </div>
              </button>
            ))}
          </section>
        </div>
      ) : null}

      {toast ? <div className="fixed bottom-24 left-1/2 z-[120] -translate-x-1/2 rounded-full bg-[var(--s2)] px-4 py-2 text-[12px] text-[var(--text-1)]">{toast}</div> : null}

      {distillOpen && selectedInboxItem ? (
        <ConceptDistillSheet item={selectedInboxItem} skills={state.skills} onClose={() => setDistillOpen(false)} onSave={saveConceptFromDistill} />
      ) : null}

      {selectedNote ? (
        <NoteDetailSheet
          note={selectedNote}
          topics={state.topics.filter((topic) => topic.areaId === selectedNote.areaId)}
          onClose={() => setSelectedNoteId(null)}
          onSave={(updates) => dispatch({ type: "UPDATE_NOTE", payload: { noteId: selectedNote.id, updates } })}
          onAddTask={() => createConceptFromNote(selectedNote)}
          onCreateConcept={() => createConceptFromNote(selectedNote)}
          onCompleteReview={() => {
            dispatch({ type: "COMPLETE_NOTE_REVIEW", payload: { noteId: selectedNote.id } });
            showToast("Review completed");
          }}
          onSnoozeReview={(days) => {
            dispatch({ type: "SNOOZE_NOTE_REVIEW", payload: { noteId: selectedNote.id, days } });
            showToast(`Review moved by ${days} days`);
          }}
          onAddTopic={(topicId) => {
            const nextTopicIds = Array.from(new Set([...(selectedNote.topicIds ?? []), topicId]));
            dispatch({ type: "UPDATE_NOTE", payload: { noteId: selectedNote.id, updates: { topicIds: nextTopicIds } } });
            showToast("Topic link added");
          }}
        />
      ) : null}

      {lessonOpen && activeCourse ? (
        <LessonSheet
          course={activeCourse}
          onClose={() => setLessonOpen(false)}
          onSaveNotebook={() => showToast("Lesson saved")}
          onCreateConcept={() => createConceptFromCourse(activeCourse)}
          onComplete={() => showToast("Lesson marked complete")}
        />
      ) : null}

      {addNoteOpen ? (
        <AddNoteSheet
          onClose={() => setAddNoteOpen(false)}
          onSave={(note) => {
            dispatch({ type: "ADD_NOTE", payload: { note } });
            setAddNoteOpen(false);
            showToast("Note saved");
          }}
        />
      ) : null}

      {addCourseOpen ? (
        <AddCourseSheet
          onClose={() => setAddCourseOpen(false)}
          onSave={(course) => {
            dispatch({ type: "ADD_COURSE", payload: { course } });
            setAddCourseOpen(false);
            showToast("Course saved");
          }}
        />
      ) : null}
    </div>
  );
};

export { Learn };
