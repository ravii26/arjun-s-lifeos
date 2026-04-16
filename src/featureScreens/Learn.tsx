import * as React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  GripVertical,
  Link2,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { BottomSheet } from '@/components/BottomSheet';
import { useApp } from '@/context/appState';
import type { AreaId, Course, CourseModule, Lesson, Note, Resource, Topic } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const tabs = ['notes', 'topics', 'courses', 'resources', 'knowledge'] as const;
type LearnTab = (typeof tabs)[number];

type NoteDraft = {
  title: string;
  areaId: AreaId;
  type: Note['type'];
  source: string;
  body: string;
};

type TopicDraft = {
  name: string;
  areaId: AreaId;
  color: string;
};

type CourseDraft = {
  title: string;
  areaId: AreaId;
  source: string;
};

type ResourceDraft = {
  content: string;
  areaId: AreaId;
  type: string;
};

interface Notebook {
  id: string;
  name: string;
  createdAt: string;
}

interface LessonLink {
  courseId: string;
  moduleId: string;
  lessonId: string;
}

type NoteViewMode = 'all' | 'standalone' | 'linked';
type CourseViewMode = 'all' | 'standalone' | 'linked';

const DEFAULT_NOTEBOOK_ID = 'nb-default';
const ALL_NOTEBOOKS_ID = 'nb-all';
const NOTEBOOKS_STORAGE_KEY = 'lifeos-notebooks';
const NOTE_NOTEBOOK_MAP_STORAGE_KEY = 'lifeos-note-notebook-map';
const NOTE_LESSON_LINK_MAP_STORAGE_KEY = 'lifeos-note-lesson-link-map';

const areaOptions: Array<{ id: AreaId; label: string; color: string }> = [
  { id: 'career', label: 'Career', color: '#7C6FF7' },
  { id: 'health', label: 'Health', color: '#1DB37E' },
  { id: 'mind', label: 'Mind', color: '#4A90D9' },
  { id: 'finance', label: 'Finance', color: '#C4840A' },
  { id: 'relationships', label: 'Relationships', color: '#E0607E' },
  { id: 'creative', label: 'Creative', color: '#E8850C' },
];

const noteTypes: Array<{ value: Note['type']; label: string }> = [
  { value: 'topic', label: 'Topic' },
  { value: 'book-summary', label: 'Book summary' },
  { value: 'course-note', label: 'Course note' },
  { value: 'mental-model', label: 'Mental model' },
  { value: 'reference', label: 'Reference' },
];

const resourceTypes = ['article', 'video', 'podcast', 'tool', 'thread', 'note'] as const;

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function stripBodyPreview(body: string) {
  return body.replace(/\s+/g, ' ').trim().slice(0, 110);
}

function courseProgress(course: Course) {
  const completed = course.completedLessons || 0;
  const total = course.totalLessons || course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
  return { completed, total, percent: total ? Math.round((completed / total) * 100) : 0 };
}

function getCourseCurrentLesson(course: Course) {
  for (const module of course.modules) {
    const lesson = module.lessons.find((item) => item.isCurrent) || module.lessons.find((item) => !item.done);
    if (lesson) {
      return { module, lesson };
    }
  }

  const firstModule = course.modules[0];
  return firstModule ? { module: firstModule, lesson: firstModule.lessons[0] } : null;
}

function lessonBody(lesson: Lesson) {
  const snippets: Record<string, string> = {
    'cache invalidation': 'Focus on freshness strategy, invalidation triggers, and the cost of stale data.',
    'write-through vs write-back': 'Compare latency, consistency, and operational complexity before choosing.',
  };

  return snippets[lesson.title.toLowerCase()] || 'Use this lesson to capture the key idea, one example, and one action to apply today.';
}

function toolbarAction(ref: React.RefObject<HTMLTextAreaElement>, setter: (nextValue: string) => void, wrapLeft: string, wrapRight = wrapLeft) {
  const textarea = ref.current;
  if (!textarea) return;

  const { selectionStart, selectionEnd, value } = textarea;
  const selected = value.slice(selectionStart, selectionEnd) || 'text';
  const nextValue = `${value.slice(0, selectionStart)}${wrapLeft}${selected}${wrapRight}${value.slice(selectionEnd)}`;
  setter(nextValue);

  window.requestAnimationFrame(() => {
    textarea.focus();
    const start = selectionStart + wrapLeft.length;
    const end = start + selected.length;
    textarea.setSelectionRange(start, end);
  });
}

function NoteComposer({
  draft,
  setDraft,
  onSave,
}: {
  draft: NoteDraft;
  setDraft: React.Dispatch<React.SetStateAction<NoteDraft>>;
  onSave: () => void;
}) {
  const bodyRef = React.useRef<HTMLTextAreaElement>(null);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={draft.title}
          onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
          placeholder="Note title"
          className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none transition placeholder:text-white/40 focus:border-white/20"
        />
        <select
          value={draft.type}
          onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value as Note['type'] }))}
          className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none transition focus:border-white/20"
        >
          {noteTypes.map((option) => (
            <option key={option.value} value={option.value} className="bg-slate-900">
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-white/70">
        {(['bold', 'italic', 'list', 'code', 'link'] as const).map((action) => (
          <button
            key={action}
            type="button"
            onClick={() => {
              if (action === 'bold') toolbarAction(bodyRef, (next) => setDraft((current) => ({ ...current, body: next })), '**');
              if (action === 'italic') toolbarAction(bodyRef, (next) => setDraft((current) => ({ ...current, body: next })), '*');
              if (action === 'list') toolbarAction(bodyRef, (next) => setDraft((current) => ({ ...current, body: next })), '- ');
              if (action === 'code') toolbarAction(bodyRef, (next) => setDraft((current) => ({ ...current, body: next })), '`');
              if (action === 'link') {
                const url = window.prompt('Paste a link for this note');
                if (url) {
                  toolbarAction(bodyRef, (next) => setDraft((current) => ({ ...current, body: next })), '[', `](${url})`);
                }
              }
            }}
            className="rounded-full border border-white/10 px-3 py-1.5 transition hover:border-white/20 hover:bg-white/5"
          >
            {action}
          </button>
        ))}
      </div>

      <textarea
        ref={bodyRef}
        value={draft.body}
        onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))}
        rows={8}
        placeholder="Capture the idea, summary, or takeaway. Use the toolbar to format it."
        className="w-full rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition placeholder:text-white/40 focus:border-white/20"
      />

      <input
        value={draft.source}
        onChange={(event) => setDraft((current) => ({ ...current, source: event.target.value }))}
        placeholder="Source or link"
        className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none transition placeholder:text-white/40 focus:border-white/20"
      />

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onSave}
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
        >
          Save note
        </button>
      </div>
    </div>
  );
}

function AddNoteSheet({
  open,
  courses,
  initialLessonLink,
  onClose,
  onSave,
}: {
  open: boolean;
  courses: Course[];
  initialLessonLink?: LessonLink;
  onClose: () => void;
  onSave: (draft: NoteDraft, lessonLink?: LessonLink) => void;
}) {
  const [draft, setDraft] = React.useState<NoteDraft>({
    title: '',
    areaId: 'mind',
    type: 'reference',
    source: '',
    body: '',
  });
  const [linkMode, setLinkMode] = React.useState<'standalone' | 'linked'>('standalone');
  const [linkCourseId, setLinkCourseId] = React.useState('');
  const [linkModuleId, setLinkModuleId] = React.useState('');
  const [linkLessonId, setLinkLessonId] = React.useState('');

  const selectedCourse = courses.find((course) => course.id === linkCourseId) || null;
  const selectedModule = selectedCourse?.modules.find((module) => module.id === linkModuleId) || null;

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setDraft({ title: '', areaId: 'mind', type: 'reference', source: '', body: '' });
      const firstCourse = courses[0];
    const firstModule = firstCourse?.modules[0];
    const firstLesson = firstModule?.lessons[0];

    if (initialLessonLink) {
      setLinkMode('linked');
      setLinkCourseId(initialLessonLink.courseId);
      setLinkModuleId(initialLessonLink.moduleId);
      setLinkLessonId(initialLessonLink.lessonId);
    } else {
      setLinkMode('standalone');
      setLinkCourseId(firstCourse?.id ?? '');
      setLinkModuleId(firstModule?.id ?? '');
      setLinkLessonId(firstLesson?.id ?? '');
    }
  }, [open, courses, initialLessonLink]);

  React.useEffect(() => {
    if (!selectedCourse) {
      setLinkModuleId('');
      setLinkLessonId('');
      return;
    }
    if (!selectedCourse.modules.some((module) => module.id === linkModuleId)) {
      const firstModule = selectedCourse.modules[0];
      setLinkModuleId(firstModule?.id ?? '');
      setLinkLessonId(firstModule?.lessons[0]?.id ?? '');
    }
  }, [selectedCourse, linkModuleId]);

  React.useEffect(() => {
    if (!selectedModule) {
      setLinkLessonId('');
      return;
    }
    if (!selectedModule.lessons.some((lesson) => lesson.id === linkLessonId)) {
      setLinkLessonId(selectedModule.lessons[0]?.id ?? '');
    }
  }, [selectedModule, linkLessonId]);

  const saveWithMode = () => {
    if (linkMode === 'linked' && linkCourseId && linkModuleId && linkLessonId) {
      onSave(draft, { courseId: linkCourseId, moduleId: linkModuleId, lessonId: linkLessonId });
      return;
    }
    onSave(draft);
  };

  return (
    <BottomSheet isOpen={open} onClose={onClose} title="Add note">
      <div className="space-y-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            value={draft.areaId}
            onChange={(event) => setDraft((current) => ({ ...current, areaId: event.target.value as AreaId }))}
            className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none transition focus:border-white/20"
          >
            {areaOptions.map((option) => (
              <option key={option.id} value={option.id} className="bg-slate-900">
                {option.label}
              </option>
            ))}
          </select>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
            Add a note, clip, or lesson and format it inline.
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 text-xs">
          <button
            type="button"
            onClick={() => setLinkMode('standalone')}
            className={cn('rounded-full px-3 py-1.5 transition', linkMode === 'standalone' ? 'bg-white text-slate-950' : 'text-white/70')}
          >
            Standalone note
          </button>
          <button
            type="button"
            onClick={() => setLinkMode('linked')}
            className={cn('rounded-full px-3 py-1.5 transition', linkMode === 'linked' ? 'bg-white text-slate-950' : 'text-white/70')}
          >
            Link to lesson
          </button>
        </div>

        {linkMode === 'linked' ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <select value={linkCourseId} onChange={(event) => setLinkCourseId(event.target.value)} className="h-11 rounded-2xl border border-white/10 bg-white/5 px-3 text-sm outline-none transition focus:border-white/20">
              {courses.map((course) => (
                <option key={course.id} value={course.id} className="bg-slate-900">{course.title}</option>
              ))}
            </select>
            <select value={linkModuleId} onChange={(event) => setLinkModuleId(event.target.value)} className="h-11 rounded-2xl border border-white/10 bg-white/5 px-3 text-sm outline-none transition focus:border-white/20">
              {selectedCourse?.modules.map((module) => (
                <option key={module.id} value={module.id} className="bg-slate-900">{module.title}</option>
              ))}
            </select>
            <select value={linkLessonId} onChange={(event) => setLinkLessonId(event.target.value)} className="h-11 rounded-2xl border border-white/10 bg-white/5 px-3 text-sm outline-none transition focus:border-white/20">
              {selectedModule?.lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id} className="bg-slate-900">{lesson.title}</option>
              ))}
            </select>
          </div>
        ) : null}

        <NoteComposer draft={draft} setDraft={setDraft} onSave={saveWithMode} />
      </div>
    </BottomSheet>
  );
}

function AddTopicSheet({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (draft: TopicDraft) => void;
}) {
  const [draft, setDraft] = React.useState<TopicDraft>({ name: '', areaId: 'mind', color: '#4A90D9' });

  React.useEffect(() => {
    if (open) {
      setDraft({ name: '', areaId: 'mind', color: '#4A90D9' });
    }
  }, [open]);

  return (
    <BottomSheet isOpen={open} onClose={onClose} title="Add topic">
      <div className="space-y-4 p-4">
        <input
          value={draft.name}
          onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
          placeholder="Topic name"
          className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none transition placeholder:text-white/40 focus:border-white/20"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            value={draft.areaId}
            onChange={(event) => setDraft((current) => ({ ...current, areaId: event.target.value as AreaId }))}
            className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none transition focus:border-white/20"
          >
            {areaOptions.map((option) => (
              <option key={option.id} value={option.id} className="bg-slate-900">
                {option.label}
              </option>
            ))}
          </select>
          <input
            value={draft.color}
            onChange={(event) => setDraft((current) => ({ ...current, color: event.target.value }))}
            placeholder="#4A90D9"
            className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none transition placeholder:text-white/40 focus:border-white/20"
          />
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(draft)}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950"
          >
            Save topic
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

function AddCourseSheet({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (draft: CourseDraft) => void;
}) {
  const [draft, setDraft] = React.useState<CourseDraft>({ title: '', areaId: 'career', source: '' });

  React.useEffect(() => {
    if (open) {
      setDraft({ title: '', areaId: 'career', source: '' });
    }
  }, [open]);

  return (
    <BottomSheet isOpen={open} onClose={onClose} title="Add course">
      <div className="space-y-4 p-4">
        <input
          value={draft.title}
          onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
          placeholder="Course title"
          className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none transition placeholder:text-white/40 focus:border-white/20"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            value={draft.areaId}
            onChange={(event) => setDraft((current) => ({ ...current, areaId: event.target.value as AreaId }))}
            className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none transition focus:border-white/20"
          >
            {areaOptions.map((option) => (
              <option key={option.id} value={option.id} className="bg-slate-900">
                {option.label}
              </option>
            ))}
          </select>
          <input
            value={draft.source}
            onChange={(event) => setDraft((current) => ({ ...current, source: event.target.value }))}
            placeholder="Source"
            className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none transition placeholder:text-white/40 focus:border-white/20"
          />
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(draft)}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950"
          >
            Save course
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

function AddResourceSheet({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (draft: ResourceDraft) => void;
}) {
  const [draft, setDraft] = React.useState<ResourceDraft>({ content: '', areaId: 'mind', type: 'article' });

  React.useEffect(() => {
    if (open) {
      setDraft({ content: '', areaId: 'mind', type: 'article' });
    }
  }, [open]);

  return (
    <BottomSheet isOpen={open} onClose={onClose} title="Add resource">
      <div className="space-y-4 p-4">
        <textarea
          value={draft.content}
          onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))}
          rows={5}
          placeholder="Paste an article, clip, idea, or snippet."
          className="w-full rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition placeholder:text-white/40 focus:border-white/20"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            value={draft.areaId}
            onChange={(event) => setDraft((current) => ({ ...current, areaId: event.target.value as AreaId }))}
            className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none transition focus:border-white/20"
          >
            {areaOptions.map((option) => (
              <option key={option.id} value={option.id} className="bg-slate-900">
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={draft.type}
            onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))}
            className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none transition focus:border-white/20"
          >
            {resourceTypes.map((type) => (
              <option key={type} value={type} className="bg-slate-900">
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(draft)}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950"
          >
            Save resource
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

function NoteDetailSheet({
  open,
  note,
  topics,
  notebooks,
  courses,
  noteNotebookId,
  noteLessonLink,
  onClose,
  onSave,
  onCreateTaskFromNote,
  onDelete,
}: {
  open: boolean;
  note: Note | null;
  topics: Topic[];
  notebooks: Notebook[];
  courses: Course[];
  noteNotebookId: string;
  noteLessonLink?: LessonLink;
  onClose: () => void;
  onSave: (noteId: string, updates: Partial<Note>, notebookId: string, lessonLink?: LessonLink) => void;
  onCreateTaskFromNote: (noteId: string, title: string, body: string, areaId: AreaId, linkedTaskIds: string[]) => void;
  onDelete: (noteId: string) => void;
}) {
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [source, setSource] = React.useState('');
  const [topicIds, setTopicIds] = React.useState<string[]>([]);
  const [areaId, setAreaId] = React.useState<AreaId>('mind');
  const [notebookId, setNotebookId] = React.useState(DEFAULT_NOTEBOOK_ID);
  const [linkMode, setLinkMode] = React.useState<'standalone' | 'linked'>('standalone');
  const [linkCourseId, setLinkCourseId] = React.useState('');
  const [linkModuleId, setLinkModuleId] = React.useState('');
  const [linkLessonId, setLinkLessonId] = React.useState('');
  const bodyRef = React.useRef<HTMLTextAreaElement>(null);

  const selectedCourse = courses.find((course) => course.id === linkCourseId) || null;
  const selectedModule = selectedCourse?.modules.find((module) => module.id === linkModuleId) || null;

  React.useEffect(() => {
    if (!note) return;
    setTitle(note.title);
    setBody(note.body);
    setSource(note.source || '');
    setTopicIds(note.topicIds || []);
    setAreaId(note.areaId);
    setNotebookId(noteNotebookId || DEFAULT_NOTEBOOK_ID);
    if (noteLessonLink) {
      setLinkMode('linked');
      setLinkCourseId(noteLessonLink.courseId);
      setLinkModuleId(noteLessonLink.moduleId);
      setLinkLessonId(noteLessonLink.lessonId);
    } else {
      setLinkMode('standalone');
      const firstCourse = courses[0];
      const firstModule = firstCourse?.modules[0];
      const firstLesson = firstModule?.lessons[0];
      setLinkCourseId(firstCourse?.id ?? '');
      setLinkModuleId(firstModule?.id ?? '');
      setLinkLessonId(firstLesson?.id ?? '');
    }
  }, [note, noteNotebookId, noteLessonLink, courses]);

  React.useEffect(() => {
    if (!selectedCourse) {
      setLinkModuleId('');
      setLinkLessonId('');
      return;
    }
    if (!selectedCourse.modules.some((module) => module.id === linkModuleId)) {
      const firstModule = selectedCourse.modules[0];
      setLinkModuleId(firstModule?.id ?? '');
      setLinkLessonId(firstModule?.lessons[0]?.id ?? '');
    }
  }, [selectedCourse, linkModuleId]);

  React.useEffect(() => {
    if (!selectedModule) {
      setLinkLessonId('');
      return;
    }
    if (!selectedModule.lessons.some((lesson) => lesson.id === linkLessonId)) {
      setLinkLessonId(selectedModule.lessons[0]?.id ?? '');
    }
  }, [selectedModule, linkLessonId]);

  if (!note) return null;

  return (
    <BottomSheet isOpen={open} onClose={onClose} title="Note editor">
      <div className="space-y-4 p-4">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none transition focus:border-white/20"
        />

        <div className="flex flex-wrap gap-2 text-xs text-white/70">
          {(['bold', 'italic', 'list', 'highlight'] as const).map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => {
                const textarea = bodyRef.current;
                if (!textarea) return;
                const { selectionStart, selectionEnd, value } = textarea;
                const selected = value.slice(selectionStart, selectionEnd) || 'text';
                const next =
                  action === 'bold'
                    ? `${value.slice(0, selectionStart)}**${selected}**${value.slice(selectionEnd)}`
                    : action === 'italic'
                      ? `${value.slice(0, selectionStart)}*${selected}*${value.slice(selectionEnd)}`
                      : action === 'list'
                        ? `${value.slice(0, selectionStart)}- ${selected}${value.slice(selectionEnd)}`
                        : `${value.slice(0, selectionStart)}==${selected}==${value.slice(selectionEnd)}`;
                setBody(next);
                window.requestAnimationFrame(() => {
                  textarea.focus();
                  textarea.setSelectionRange(selectionStart + 2, selectionStart + 2 + selected.length);
                });
              }}
              className="rounded-full border border-white/10 px-3 py-1.5 transition hover:border-white/20 hover:bg-white/5"
            >
              {action}
            </button>
          ))}
        </div>

        <textarea
          ref={bodyRef}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={10}
          className="w-full rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-white/20"
        />

        <input
          value={source}
          onChange={(event) => setSource(event.target.value)}
          placeholder="Source"
          className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none transition placeholder:text-white/40 focus:border-white/20"
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <select
            value={areaId}
            onChange={(event) => setAreaId(event.target.value as AreaId)}
            className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none transition focus:border-white/20"
          >
            {areaOptions.map((option) => (
              <option key={option.id} value={option.id} className="bg-slate-900">
                {option.label}
              </option>
            ))}
          </select>
            <select
              value={notebookId}
              onChange={(event) => setNotebookId(event.target.value)}
              className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none transition focus:border-white/20"
            >
              {notebooks.map((notebook) => (
                <option key={notebook.id} value={notebook.id} className="bg-slate-900">
                  {notebook.name}
                </option>
              ))}
            </select>
          </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
            {topics.slice(0, 4).map((topic) => {
              const selected = topicIds.includes(topic.id);
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() =>
                    setTopicIds((current) =>
                      current.includes(topic.id) ? current.filter((id) => id !== topic.id) : [...current, topic.id],
                    )
                  }
                  className={cn(
                    'rounded-full px-3 py-1.5 transition',
                    selected ? 'bg-white text-slate-950' : 'border border-white/10 hover:bg-white/5',
                  )}
                >
                  #{topic.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="text-xs uppercase tracking-[0.2em] text-white/45">Course connection</div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 p-1 text-xs">
            <button
              type="button"
              onClick={() => setLinkMode('standalone')}
              className={cn('rounded-full px-3 py-1.5 transition', linkMode === 'standalone' ? 'bg-white text-slate-950' : 'text-white/70')}
            >
              Standalone
            </button>
            <button
              type="button"
              onClick={() => setLinkMode('linked')}
              className={cn('rounded-full px-3 py-1.5 transition', linkMode === 'linked' ? 'bg-white text-slate-950' : 'text-white/70')}
            >
              Linked to lesson
            </button>
          </div>

          {linkMode === 'linked' ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <select value={linkCourseId} onChange={(event) => setLinkCourseId(event.target.value)} className="h-10 rounded-xl border border-white/10 bg-black/20 px-3 text-sm outline-none">
                {courses.map((course) => (
                  <option key={course.id} value={course.id} className="bg-slate-900">{course.title}</option>
                ))}
              </select>
              <select value={linkModuleId} onChange={(event) => setLinkModuleId(event.target.value)} className="h-10 rounded-xl border border-white/10 bg-black/20 px-3 text-sm outline-none">
                {selectedCourse?.modules.map((module) => (
                  <option key={module.id} value={module.id} className="bg-slate-900">{module.title}</option>
                ))}
              </select>
              <select value={linkLessonId} onChange={(event) => setLinkLessonId(event.target.value)} className="h-10 rounded-xl border border-white/10 bg-black/20 px-3 text-sm outline-none">
                {selectedModule?.lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id} className="bg-slate-900">{lesson.title}</option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onDelete(note.id)}
            className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-500/10"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
          <button
            type="button"
            onClick={() => onCreateTaskFromNote(note.id, title, body, areaId, note.linkedTaskIds ?? [])}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/85 transition hover:bg-white/10"
          >
            <ClipboardList className="h-4 w-4" /> Create task
          </button>
          <button
            type="button"
            onClick={() => onSave(
              note.id,
              { title, body, source, topicIds, areaId },
              notebookId,
              linkMode === 'linked' && linkCourseId && linkModuleId && linkLessonId
                ? { courseId: linkCourseId, moduleId: linkModuleId, lessonId: linkLessonId }
                : undefined,
            )}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950"
          >
            Save changes
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

function LessonSheet({
  open,
  course,
  module,
  lesson,
  onClose,
  onToggleLesson,
  onCreateLinkedNote,
  onNext,
  onPrevious,
}: {
  open: boolean;
  course: Course | null;
  module: CourseModule | null;
  lesson: Lesson | null;
  onClose: () => void;
  onToggleLesson: (moduleId: string, lessonId: string) => void;
  onCreateLinkedNote: (courseId: string, moduleId: string, lessonId: string) => void;
  onNext: () => void;
  onPrevious: () => void;
}) {
  const [tab, setTab] = React.useState<'learn' | 'notes'>('learn');

  React.useEffect(() => {
    setTab('learn');
  }, [lesson?.id]);

  if (!course || !module || !lesson) return null;

  return (
    <BottomSheet isOpen={open} onClose={onClose} title={course.title}>
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 text-xs">
          {(['learn', 'notes'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={cn(
                'flex-1 rounded-full px-3 py-2 transition',
                tab === item ? 'bg-white text-slate-950' : 'text-white/70',
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3 text-xs text-white/60">
            <span>{module.title}</span>
            <span>Lesson {course.modules.flatMap((currentModule) => currentModule.lessons).findIndex((item) => item.id === lesson.id) + 1}</span>
          </div>
          <h3 className="mt-2 text-xl font-semibold text-white">{lesson.title}</h3>
          <p className="mt-3 text-sm leading-6 text-white/70">
            {tab === 'learn'
              ? lessonBody(lesson)
              : 'Capture your own explanation, examples, and action items from this lesson.'}
          </p>
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs text-white/70">
            {tab === 'learn' ? (
              <>
                <div className="mb-2 font-medium text-white/90">Key idea</div>
                {lessonBody(lesson)}
              </>
            ) : (
              <>
                <div className="mb-2 font-medium text-white/90">Linked note space</div>
                Use the note editor to create a lesson note, link it to a topic, and save the source.
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onPrevious}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4" /> Previous
          </button>
          <button
            type="button"
            onClick={() => onCreateLinkedNote(course.id, module.id, lesson.id)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
          >
            <Plus className="h-4 w-4" /> Add note
          </button>
          <button
            type="button"
            onClick={() => onToggleLesson(module.id, lesson.id)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
              lesson.done ? 'bg-emerald-400 text-slate-950' : 'bg-white text-slate-950',
            )}
          >
            <Check className="h-4 w-4" /> {lesson.done ? 'Done' : 'Mark done'}
          </button>
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
          >
            Next <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

function ResourceProcessSheet({
  open,
  resource,
  onClose,
  onProcess,
}: {
  open: boolean;
  resource: Resource | null;
  onClose: () => void;
  onProcess: (resource: Resource, mode: 'note' | 'task' | 'vault' | 'habit') => void;
}) {
  const [mode, setMode] = React.useState<'note' | 'task' | 'vault' | 'habit'>('note');

  React.useEffect(() => {
    if (open) setMode('note');
  }, [open]);

  if (!resource) return null;

  return (
    <BottomSheet isOpen={open} onClose={onClose} title="AI resource processing">
      <div className="space-y-4 p-4">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
          <div className="text-xs uppercase tracking-[0.24em] text-white/40">Incoming resource</div>
          <p className="mt-3 text-sm leading-6 text-white/80">{resource.content}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(['note', 'task', 'vault', 'habit'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={cn(
                'rounded-2xl border px-4 py-3 text-left text-sm transition',
                mode === item ? 'border-white bg-white text-slate-950' : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10',
              )}
            >
              <div className="font-medium capitalize">{item}</div>
              <div className="mt-1 text-xs opacity-80">
                {item === 'note' && 'Turn this into a structured note.'}
                {item === 'task' && 'Convert this into a todo.'}
                {item === 'vault' && 'Save it to the vault.'}
                {item === 'habit' && 'Use it to build a habit.'}
              </div>
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onProcess(resource, mode)}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950"
          >
            Process resource
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

export function Learn() {
  const { state, dispatch } = useApp();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState<LearnTab>('notes');
  const [query, setQuery] = React.useState('');
  const [showQuery, setShowQuery] = React.useState(false);
  const [showAddNote, setShowAddNote] = React.useState(false);
  const [showAddTopic, setShowAddTopic] = React.useState(false);
  const [showAddCourse, setShowAddCourse] = React.useState(false);
  const [showAddResource, setShowAddResource] = React.useState(false);
  const [activeNoteId, setActiveNoteId] = React.useState<string | null>(null);
  const [activeResourceId, setActiveResourceId] = React.useState<string | null>(null);
  const [activeCourseId, setActiveCourseId] = React.useState<string>(state.courses.find((course) => course.isActive)?.id || state.courses[0]?.id || '');
  const [showLessonSheet, setShowLessonSheet] = React.useState(false);
  const [initialLessonLinkForNewNote, setInitialLessonLinkForNewNote] = React.useState<LessonLink | undefined>(undefined);
  const [notebooks, setNotebooks] = React.useState<Notebook[]>([
    { id: DEFAULT_NOTEBOOK_ID, name: 'General', createdAt: new Date().toISOString() },
  ]);
  const [noteNotebookMap, setNoteNotebookMap] = React.useState<Record<string, string>>({});
  const [noteLessonLinkMap, setNoteLessonLinkMap] = React.useState<Record<string, LessonLink>>({});
  const [activeNotebookId, setActiveNotebookId] = React.useState<string>(ALL_NOTEBOOKS_ID);
  const [noteViewMode, setNoteViewMode] = React.useState<NoteViewMode>('all');
  const [courseViewMode, setCourseViewMode] = React.useState<CourseViewMode>('all');
  const [expandedModuleIds, setExpandedModuleIds] = React.useState<string[]>(() => {
    const firstCourse = state.courses[0];
    return firstCourse?.modules[0] ? [firstCourse.modules[0].id] : [];
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const rawNotebooks = window.localStorage.getItem(NOTEBOOKS_STORAGE_KEY);
      const rawMap = window.localStorage.getItem(NOTE_NOTEBOOK_MAP_STORAGE_KEY);
      const rawLessonMap = window.localStorage.getItem(NOTE_LESSON_LINK_MAP_STORAGE_KEY);

      if (rawNotebooks) {
        const parsed = JSON.parse(rawNotebooks) as Notebook[];
        if (Array.isArray(parsed) && parsed.length) {
          const hasDefault = parsed.some((notebook) => notebook.id === DEFAULT_NOTEBOOK_ID);
          setNotebooks(hasDefault ? parsed : [{ id: DEFAULT_NOTEBOOK_ID, name: 'General', createdAt: new Date().toISOString() }, ...parsed]);
        }
      }

      if (rawMap) {
        const parsedMap = JSON.parse(rawMap) as Record<string, string>;
        if (parsedMap && typeof parsedMap === 'object') {
          setNoteNotebookMap(parsedMap);
        }
      }

      if (rawLessonMap) {
        const parsedLessonMap = JSON.parse(rawLessonMap) as Record<string, LessonLink>;
        if (parsedLessonMap && typeof parsedLessonMap === 'object') {
          setNoteLessonLinkMap(parsedLessonMap);
        }
      }
    } catch {
      setNotebooks([{ id: DEFAULT_NOTEBOOK_ID, name: 'General', createdAt: new Date().toISOString() }]);
      setNoteNotebookMap({});
      setNoteLessonLinkMap({});
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(NOTEBOOKS_STORAGE_KEY, JSON.stringify(notebooks));
    window.localStorage.setItem(NOTE_NOTEBOOK_MAP_STORAGE_KEY, JSON.stringify(noteNotebookMap));
    window.localStorage.setItem(NOTE_LESSON_LINK_MAP_STORAGE_KEY, JSON.stringify(noteLessonLinkMap));
  }, [notebooks, noteNotebookMap, noteLessonLinkMap]);

  React.useEffect(() => {
    const notebookIdSet = new Set(notebooks.map((notebook) => notebook.id));
    setNoteNotebookMap((current) => {
      const next: Record<string, string> = {};
      let changed = false;

      state.notes.forEach((note) => {
        const mappedNotebookId = current[note.id];
        if (mappedNotebookId && notebookIdSet.has(mappedNotebookId)) {
          next[note.id] = mappedNotebookId;
        } else {
          next[note.id] = DEFAULT_NOTEBOOK_ID;
          if (mappedNotebookId !== DEFAULT_NOTEBOOK_ID) {
            changed = true;
          }
        }
      });

      if (!changed && Object.keys(next).length === Object.keys(current).length) {
        const same = Object.keys(next).every((key) => next[key] === current[key]);
        if (same) {
          return current;
        }
      }

      return next;
    });
  }, [state.notes, notebooks]);

  React.useEffect(() => {
    setNoteLessonLinkMap((current) => {
      const next: Record<string, LessonLink> = {};
      state.notes.forEach((note) => {
        const link = current[note.id];
        if (link) {
          next[note.id] = link;
        }
      });

      if (Object.keys(next).length === Object.keys(current).length) {
        const same = Object.keys(next).every((key) => {
          const left = next[key];
          const right = current[key];
          return left.courseId === right.courseId && left.moduleId === right.moduleId && left.lessonId === right.lessonId;
        });
        if (same) {
          return current;
        }
      }
      return next;
    });
  }, [state.notes]);

  React.useEffect(() => {
    if (!activeCourseId && state.courses[0]) {
      setActiveCourseId(state.courses[0].id);
    }
  }, [activeCourseId, state.courses]);

  const activeCourse = state.courses.find((course) => course.id === activeCourseId) || state.courses.find((course) => course.isActive) || state.courses[0] || null;
  const activeNote = state.notes.find((note) => note.id === activeNoteId) || null;
  const activeNoteNotebookId = activeNote ? activeNote.notebookId ?? noteNotebookMap[activeNote.id] ?? DEFAULT_NOTEBOOK_ID : DEFAULT_NOTEBOOK_ID;
  const activeNoteLessonLink = activeNote?.courseId && activeNote?.moduleId && activeNote?.lessonId
    ? { courseId: activeNote.courseId, moduleId: activeNote.moduleId, lessonId: activeNote.lessonId }
    : activeNote
      ? noteLessonLinkMap[activeNote.id]
      : undefined;
  const activeResource = state.resources.find((resource) => resource.id === activeResourceId) || null;
  const activeLessonInfo = activeCourse ? getCourseCurrentLesson(activeCourse) : null;
  const activeLesson = activeLessonInfo?.lesson || null;
  const activeModule = activeLessonInfo?.module || null;

  React.useEffect(() => {
    if (!activeCourse?.modules.length) {
      return;
    }

    const validModuleIds = new Set(activeCourse.modules.map((module) => module.id));
    setExpandedModuleIds((current) => {
      const filtered = current.filter((id) => validModuleIds.has(id));
      const noChange = filtered.length === current.length && filtered.every((id, index) => id === current[index]);
      if (noChange) {
        return current;
      }
      if (filtered.length) {
        return filtered;
      }
      return [activeCourse.modules[0].id];
    });
  }, [activeCourse]);

  const filteredNotes = React.useMemo(() => {
    const lowered = query.trim().toLowerCase();
    return state.notes.filter((note) => {
      const notebookId = note.notebookId ?? noteNotebookMap[note.id] ?? DEFAULT_NOTEBOOK_ID;
      const matchesNotebook = activeNotebookId === ALL_NOTEBOOKS_ID ? true : notebookId === activeNotebookId;
      const isLinked = Boolean(note.courseId && note.moduleId && note.lessonId) || Boolean(noteLessonLinkMap[note.id]);
      const matchesMode = noteViewMode === 'all' ? true : noteViewMode === 'linked' ? isLinked : !isLinked;
      const matchesQuery = !lowered || [note.title, note.body, note.source || ''].some((value) => value.toLowerCase().includes(lowered));
      return matchesQuery && matchesNotebook && matchesMode;
    });
  }, [query, state.notes, noteNotebookMap, activeNotebookId, noteLessonLinkMap, noteViewMode]);

  const filteredTopics = React.useMemo(() => {
    const lowered = query.trim().toLowerCase();
    return state.topics.filter((topic) => !lowered || topic.name.toLowerCase().includes(lowered));
  }, [query, state.topics]);

  const filteredResources = React.useMemo(() => {
    const lowered = query.trim().toLowerCase();
    return state.resources.filter((resource) => !lowered || resource.content.toLowerCase().includes(lowered));
  }, [query, state.resources]);

  const visibleNotes = filteredNotes.slice(0, 8);
  const visibleTopics = filteredTopics.slice(0, 8);
  const visibleResources = filteredResources.slice(0, 8);
  const linkedNotes = state.notes.filter((note) => Boolean((note.courseId && note.moduleId && note.lessonId) || noteLessonLinkMap[note.id]));
  const standaloneNotes = state.notes.filter((note) => !((note.courseId && note.moduleId && note.lessonId) || noteLessonLinkMap[note.id]));
  const pendingResources = state.resources.filter((resource) => resource.status === 'pending');
  const notesWithTopic = state.notes.filter((note) => note.topicIds.length > 0);
  const notesWithoutTopic = state.notes.filter((note) => note.topicIds.length === 0);
  const coursesWithLinkedNotes = state.courses.filter((course) =>
    state.notes.some((note) => (note.courseId ?? noteLessonLinkMap[note.id]?.courseId) === course.id),
  );
  const orphanNotes = state.notes.filter((note) => {
    const hasTopic = note.topicIds.length > 0;
    const hasCourseLink = Boolean((note.courseId && note.moduleId && note.lessonId) || noteLessonLinkMap[note.id]);
    const hasTaskLink = Boolean(note.linkedTaskIds?.length);
    return !hasTopic && !hasCourseLink && !hasTaskLink;
  });
  const visibleCourses = React.useMemo(() => {
    return state.courses.filter((course) => {
      const noteCount = state.notes.filter((note) => (note.courseId ?? noteLessonLinkMap[note.id]?.courseId) === course.id).length;
      const matchesMode = courseViewMode === 'all' ? true : courseViewMode === 'linked' ? noteCount > 0 : noteCount === 0;
      return matchesMode;
    });
  }, [state.courses, state.notes, noteLessonLinkMap, courseViewMode]);

  const courseNoteCount = (courseId: string) =>
    state.notes.filter((note) => (note.courseId ?? noteLessonLinkMap[note.id]?.courseId) === courseId).length;

  const createNotebook = () => {
    const input = window.prompt('Notebook name');
    const name = input?.trim();
    if (!name) {
      return;
    }

    const notebook: Notebook = {
      id: createId('notebook'),
      name,
      createdAt: new Date().toISOString(),
    };
    setNotebooks((current) => [...current, notebook]);
    setActiveNotebookId(notebook.id);
    toast({ title: 'Notebook created', description: `${name} is ready.` });
  };

  const renameActiveNotebook = () => {
    if (activeNotebookId === ALL_NOTEBOOKS_ID || activeNotebookId === DEFAULT_NOTEBOOK_ID) {
      return;
    }
    const notebook = notebooks.find((item) => item.id === activeNotebookId);
    if (!notebook) {
      return;
    }
    const input = window.prompt('Rename notebook', notebook.name);
    const name = input?.trim();
    if (!name || name === notebook.name) {
      return;
    }
    setNotebooks((current) => current.map((item) => item.id === notebook.id ? { ...item, name } : item));
    toast({ title: 'Notebook renamed', description: `Updated to ${name}.` });
  };

  const deleteActiveNotebook = () => {
    if (activeNotebookId === ALL_NOTEBOOKS_ID || activeNotebookId === DEFAULT_NOTEBOOK_ID) {
      return;
    }
    const notebook = notebooks.find((item) => item.id === activeNotebookId);
    if (!notebook) {
      return;
    }
    const confirmed = window.confirm(`Delete notebook "${notebook.name}"? Notes will be moved to General.`);
    if (!confirmed) {
      return;
    }

    setNotebooks((current) => current.filter((item) => item.id !== notebook.id));
    setNoteNotebookMap((current) => {
      const next: Record<string, string> = {};
      Object.entries(current).forEach(([noteId, notebookId]) => {
        next[noteId] = notebookId === notebook.id ? DEFAULT_NOTEBOOK_ID : notebookId;
      });
      return next;
    });
    setActiveNotebookId(ALL_NOTEBOOKS_ID);
    toast({ title: 'Notebook deleted', description: 'Notes were moved to General.' });
  };

  const saveNote = (draft: NoteDraft, lessonLink?: LessonLink) => {
    const targetNotebookId = activeNotebookId === ALL_NOTEBOOKS_ID ? DEFAULT_NOTEBOOK_ID : activeNotebookId;
    const note: Note = {
      id: createId('note'),
      title: draft.title || 'Untitled note',
      areaId: draft.areaId,
      notebookId: targetNotebookId,
      courseId: lessonLink?.courseId,
      moduleId: lessonLink?.moduleId,
      lessonId: lessonLink?.lessonId,
      type: draft.type,
      source: draft.source || undefined,
      body: draft.body,
      topicIds: [],
      keyPoints: draft.body
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 4),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_NOTE', note });
    setNoteNotebookMap((current) => ({ ...current, [note.id]: targetNotebookId }));
    setNoteLessonLinkMap((current) => {
      if (!lessonLink) {
        const next = { ...current };
        delete next[note.id];
        return next;
      }
      return { ...current, [note.id]: lessonLink };
    });
    toast({ title: 'Note saved', description: 'Added to your knowledge base.' });
    setShowAddNote(false);
  };

  const saveTopic = (draft: TopicDraft) => {
    const topic: Topic = {
      id: createId('topic'),
      name: draft.name || 'Untitled topic',
      areaId: draft.areaId,
      color: draft.color || '#4A90D9',
    };
    dispatch({ type: 'ADD_TOPIC', topic });
    toast({ title: 'Topic saved', description: 'Your new topic is ready.' });
    setShowAddTopic(false);
  };

  const saveCourse = (draft: CourseDraft) => {
    const course: Course = {
      id: createId('course'),
      title: draft.title || 'Untitled course',
      areaId: draft.areaId,
      source: draft.source || 'Manual entry',
      modules: [
        {
          id: createId('module'),
          title: 'Module 1',
          locked: false,
          lessons: [
            { id: createId('lesson'), title: 'Lesson 1', done: false, isCurrent: true },
            { id: createId('lesson'), title: 'Lesson 2', done: false },
          ],
        },
      ],
      totalLessons: 2,
      completedLessons: 0,
      isActive: true,
    };
    dispatch({ type: 'ADD_COURSE', course });
    dispatch({ type: 'SET_ACTIVE_COURSE', courseId: course.id });
    setActiveCourseId(course.id);
    setExpandedModuleIds(course.modules[0] ? [course.modules[0].id] : []);
    toast({ title: 'Course created', description: 'New course added to Learn.' });
    setShowAddCourse(false);
  };

  const saveResource = (draft: ResourceDraft) => {
    const resource: Resource = {
      id: createId('resource'),
      content: draft.content || 'Untitled resource',
      areaId: draft.areaId,
      type: draft.type,
      status: 'pending',
      daysAgo: 0,
    };
    dispatch({ type: 'ADD_RESOURCE', resource });
    toast({ title: 'Resource added', description: 'Queued for processing.' });
    setShowAddResource(false);
  };

  const processResource = (resource: Resource, mode: 'note' | 'task' | 'vault' | 'habit') => {
    const baseText = stripBodyPreview(resource.content);

    if (mode === 'note') {
      dispatch({
        type: 'ADD_NOTE',
        note: {
          id: createId('note'),
          title: baseText.slice(0, 42) || 'Resource note',
          areaId: resource.areaId || 'mind',
          type: 'reference',
          body: resource.content,
          keyPoints: [baseText],
          createdAt: new Date().toISOString(),
        },
      });
      dispatch({ type: 'DECIDE_RESOURCE', resourceId: resource.id, status: 'accepted', decision: 'noted' });
    }

    if (mode === 'task') {
      dispatch({
        type: 'ADD_TASK',
        task: {
          id: createId('task'),
          title: baseText.slice(0, 50) || 'Follow up on resource',
          status: 'todo',
          priority: 'P2',
          areaId: resource.areaId || 'mind',
          notes: resource.content,
          createdAt: new Date().toISOString(),
        },
      });
      dispatch({ type: 'DECIDE_RESOURCE', resourceId: resource.id, status: 'accepted', decision: 'tasked' });
    }

    if (mode === 'vault') {
      dispatch({
        type: 'ADD_VAULT_ITEM',
        item: {
          id: createId('vault'),
          type: 'note',
          tag: resource.areaId || 'learn',
          content: baseText,
          daysAgo: 0,
        },
      });
      dispatch({ type: 'DECIDE_RESOURCE', resourceId: resource.id, status: 'accepted', decision: 'vaulted' });
    }

    if (mode === 'habit') {
      dispatch({
        type: 'ADD_HABIT',
        habit: {
          id: createId('habit'),
          name: baseText.slice(0, 40) || 'New habit idea',
          areaId: resource.areaId || 'mind',
          direction: 'build',
          trackingType: 'boolean',
          frequency: 'daily',
          logs: [],
          streak: 0,
          bestStreak: 0,
          createdAt: new Date().toISOString(),
        },
      });
      dispatch({ type: 'DECIDE_RESOURCE', resourceId: resource.id, status: 'accepted', decision: 'habited' });
    }

    toast({ title: 'Processed', description: `Resource converted into a ${mode}.` });
    setActiveResourceId(null);
  };

  const moveLesson = (direction: 'next' | 'previous') => {
    if (!activeCourse || !activeLessonInfo) return;
    const flat = activeCourse.modules.flatMap((module) => module.lessons.map((lesson) => ({ module, lesson })));
    const index = flat.findIndex((item) => item.lesson.id === activeLessonInfo.lesson.id);
    const nextIndex = direction === 'next' ? index + 1 : index - 1;
    const next = flat[nextIndex];
    if (next) {
      setActiveCourseId(activeCourse.id);
      dispatch({ type: 'SET_ACTIVE_COURSE', courseId: activeCourse.id });
      dispatch({
        type: 'UPDATE_COURSE',
        courseId: activeCourse.id,
        updates: {
          modules: activeCourse.modules.map((module) => ({
            ...module,
            lessons: module.lessons.map((lesson) => ({ ...lesson, isCurrent: lesson.id === next.lesson.id })),
          })),
        },
      });
    }
  };

  const toggleLesson = (moduleId: string, lessonId: string) => {
    if (!activeCourse) return;
    dispatch({ type: 'TOGGLE_COURSE_LESSON', courseId: activeCourse.id, moduleId, lessonId });
  };

  const createTaskFromNote = (noteId: string, title: string, body: string, areaId: AreaId, linkedTaskIds: string[]) => {
    const taskId = createId('task');
    dispatch({
      type: 'ADD_TASK',
      task: {
        id: taskId,
        title: title ? `Action: ${title}` : 'Action from note',
        status: 'todo',
        priority: 'P2',
        areaId,
        notes: stripBodyPreview(body),
        createdAt: new Date().toISOString(),
      },
    });
    dispatch({
      type: 'UPDATE_NOTE',
      noteId,
      updates: {
        linkedTaskIds: Array.from(new Set([...(linkedTaskIds || []), taskId])),
      },
    });
    toast({ title: 'Task created', description: 'Linked this note to an executable task.' });
  };

  const startLinkedNoteFromLesson = (courseId: string, moduleId: string, lessonId: string) => {
    setInitialLessonLinkForNewNote({ courseId, moduleId, lessonId });
    setShowLessonSheet(false);
    setActiveTab('notes');
    setShowAddNote(true);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(91,150,255,0.18),_transparent_35%),linear-gradient(180deg,_#0d1528_0%,_#08111f_50%,_#050a13_100%)] text-white">
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle,_rgba(255,255,255,0.12),_transparent_60%)] opacity-50" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_24px_100px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-white/40">Learn</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Notes, topics, courses, and resources</h1>
            </div>
            <button
              type="button"
              onClick={() => setShowQuery((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
            >
              <Search className="h-4 w-4" /> {showQuery ? 'Close search' : 'Search'}
            </button>
          </div>

          {showQuery ? (
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <Search className="h-4 w-4 text-white/40" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search notes, topics, courses, resources"
                className="w-full bg-transparent text-sm outline-none placeholder:text-white/35"
              />
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-black/20 p-1 text-sm">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'rounded-full px-4 py-2 transition',
                  activeTab === tab ? 'bg-white text-slate-950' : 'text-white/65 hover:bg-white/5',
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        <main className="mt-5 grid flex-1 gap-5 lg:grid-cols-[1.4fr_0.9fr]">
          <section className="space-y-5">
            {activeTab === 'notes' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">Notes</h2>
                    <p className="text-sm text-white/55">Format ideas with links, highlights, and quick structure.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setInitialLessonLinkForNewNote(undefined);
                      setShowAddNote(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
                  >
                    <Plus className="h-4 w-4" /> New note
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
                  <span className="text-white/55">Notebook:</span>
                  <select
                    value={activeNotebookId}
                    onChange={(event) => setActiveNotebookId(event.target.value)}
                    className="h-8 rounded-full border border-white/10 bg-black/20 px-3 text-xs outline-none"
                  >
                    <option value={ALL_NOTEBOOKS_ID} className="bg-slate-900">All notebooks</option>
                    {notebooks.map((notebook) => (
                      <option key={notebook.id} value={notebook.id} className="bg-slate-900">
                        {notebook.name}
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={createNotebook} className="rounded-full border border-white/10 px-3 py-1.5 transition hover:bg-white/5">+ Notebook</button>
                  <button
                    type="button"
                    onClick={renameActiveNotebook}
                    disabled={activeNotebookId === ALL_NOTEBOOKS_ID || activeNotebookId === DEFAULT_NOTEBOOK_ID}
                    className="rounded-full border border-white/10 px-3 py-1.5 transition enabled:hover:bg-white/5 disabled:opacity-40"
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={deleteActiveNotebook}
                    disabled={activeNotebookId === ALL_NOTEBOOKS_ID || activeNotebookId === DEFAULT_NOTEBOOK_ID}
                    className="rounded-full border border-rose-500/30 px-3 py-1.5 text-rose-200 transition enabled:hover:bg-rose-500/10 disabled:opacity-40"
                  >
                    Delete
                  </button>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 text-xs">
                  {([
                    { key: 'all' as const, label: 'All notes' },
                    { key: 'standalone' as const, label: 'Standalone' },
                    { key: 'linked' as const, label: 'Linked to lessons' },
                  ]).map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setNoteViewMode(option.key)}
                      className={cn('rounded-full px-3 py-1.5 transition', noteViewMode === option.key ? 'bg-white text-slate-950' : 'text-white/70')}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="grid gap-3">
                  {visibleNotes.map((note) => (
                    <button
                      key={note.id}
                      type="button"
                      onClick={() => setActiveNoteId(note.id)}
                      className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/10"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-[0.24em] text-white/35">{note.type}</div>
                          <h3 className="mt-2 text-base font-semibold text-white">{note.title}</h3>
                        </div>
                        <div className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-white/60">
                          {areaOptions.find((option) => option.id === note.areaId)?.label}
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-white/65">{stripBodyPreview(note.body)}</p>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/55">
                        <span className="rounded-full border border-white/10 px-2 py-1">
                          {notebooks.find((item) => item.id === (note.notebookId ?? noteNotebookMap[note.id] ?? DEFAULT_NOTEBOOK_ID))?.name ?? 'General'}
                        </span>
                        {(note.courseId && note.moduleId && note.lessonId) || noteLessonLinkMap[note.id] ? (
                          <span className="rounded-full border border-emerald-400/30 px-2 py-1 text-emerald-200">
                            Linked lesson
                          </span>
                        ) : (
                          <span className="rounded-full border border-white/10 px-2 py-1">Standalone</span>
                        )}
                        {note.topicIds.slice(0, 3).map((topicId) => {
                          const topic = state.topics.find((item) => item.id === topicId);
                          return topic ? <span key={topic.id} className="rounded-full border border-white/10 px-2 py-1">#{topic.name}</span> : null;
                        })}
                        {note.linkedTaskIds?.length ? (
                          <span className="rounded-full border border-white/10 px-2 py-1">
                            {note.linkedTaskIds.length} task{note.linkedTaskIds.length === 1 ? '' : 's'}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {activeTab === 'topics' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">Topics</h2>
                    <p className="text-sm text-white/55">Use topics to organize notes, lessons, and sources.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddTopic(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
                  >
                    <Plus className="h-4 w-4" /> New topic
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleTopics.map((topic) => (
                    <div key={topic.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2 text-sm font-medium text-white">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: topic.color }} />
                          {topic.name}
                        </div>
                        <Tag className="h-4 w-4 text-white/35" />
                      </div>
                      <p className="mt-3 text-sm leading-6 text-white/60">
                        Link notes and lessons here to keep the knowledge graph clean and searchable.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {activeTab === 'courses' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">Courses</h2>
                    <p className="text-sm text-white/55">Track the current lesson, mark progress, and keep linked or standalone courses separate.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddCourse(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
                  >
                    <Plus className="h-4 w-4" /> New course
                  </button>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 text-xs">
                  {([
                    { key: 'all' as const, label: 'All courses' },
                    { key: 'standalone' as const, label: 'Standalone' },
                    { key: 'linked' as const, label: 'Linked to notes' },
                  ]).map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setCourseViewMode(option.key)}
                      className={cn('rounded-full px-3 py-1.5 transition', courseViewMode === option.key ? 'bg-white text-slate-950' : 'text-white/70')}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {activeCourse ? (
                  <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.24em] text-white/35">Active course</div>
                        <h3 className="mt-2 text-xl font-semibold">{activeCourse.title}</h3>
                        <p className="mt-2 text-sm text-white/60">{activeCourse.source}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right text-sm">
                        <div className="text-xs uppercase tracking-[0.24em] text-white/35">Progress</div>
                        <div className="mt-1 text-lg font-semibold">{courseProgress(activeCourse).percent}%</div>
                        <div className="text-xs text-white/55">
                          {courseProgress(activeCourse).completed}/{courseProgress(activeCourse).total} lessons
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 space-y-3">
                      {activeCourse.modules.map((module) => {
                        const expanded = expandedModuleIds.includes(module.id);
                        return (
                          <div key={module.id} className="rounded-2xl border border-white/10 bg-black/15">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedModuleIds((current) =>
                                  current.includes(module.id)
                                    ? current.filter((id) => id !== module.id)
                                    : [...current, module.id],
                                )
                              }
                              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                            >
                              <div>
                                <div className="text-sm font-medium text-white">{module.title}</div>
                                <div className="text-xs text-white/45">{module.lessons.filter((lesson) => lesson.done).length}/{module.lessons.length} done</div>
                              </div>
                              {expanded ? <ChevronDown className="h-4 w-4 text-white/50" /> : <ChevronRight className="h-4 w-4 text-white/50" />}
                            </button>
                            {expanded ? (
                              <div className="border-t border-white/10 px-4 py-3">
                                <div className="space-y-2">
                                  {module.lessons.map((lesson) => (
                                    <button
                                      key={lesson.id}
                                      type="button"
                                      onClick={() => {
                                        setActiveCourseId(activeCourse.id);
                                        setShowLessonSheet(true);
                                        dispatch({ type: 'SET_ACTIVE_COURSE', courseId: activeCourse.id });
                                        dispatch({
                                          type: 'UPDATE_COURSE',
                                          courseId: activeCourse.id,
                                          updates: {
                                            modules: activeCourse.modules.map((currentModule) => ({
                                              ...currentModule,
                                              lessons: currentModule.lessons.map((currentLesson) => ({
                                                ...currentLesson,
                                                isCurrent: currentLesson.id === lesson.id,
                                              })),
                                            })),
                                          },
                                        });
                                      }}
                                      className={cn(
                                        'flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-left text-sm transition',
                                        lesson.done ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-50' : 'border-white/10 bg-white/5 text-white/75 hover:bg-white/10',
                                      )}
                                    >
                                      <span className="inline-flex items-center gap-2">
                                        <span className={cn('h-2 w-2 rounded-full', lesson.done ? 'bg-emerald-400' : 'bg-white/30')} />
                                        {lesson.title}
                                      </span>
                                      <div className="flex items-center gap-2 text-xs text-white/55">
                                        {state.notes.filter((note) => (note.courseId ?? noteLessonLinkMap[note.id]?.courseId) === activeCourse.id && (note.moduleId ?? noteLessonLinkMap[note.id]?.moduleId) === module.id && (note.lessonId ?? noteLessonLinkMap[note.id]?.lessonId) === lesson.id).length ? (
                                          <span className="rounded-full border border-emerald-400/30 px-2 py-1 text-emerald-200">
                                            {state.notes.filter((note) => (note.courseId ?? noteLessonLinkMap[note.id]?.courseId) === activeCourse.id && (note.moduleId ?? noteLessonLinkMap[note.id]?.moduleId) === module.id && (note.lessonId ?? noteLessonLinkMap[note.id]?.lessonId) === lesson.id).length} notes
                                          </span>
                                        ) : null}
                                        {lesson.isCurrent ? <span className="rounded-full border border-white/10 px-2 py-1">Current</span> : null}
                                        <button
                                          type="button"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            toggleLesson(module.id, lesson.id);
                                          }}
                                          className="rounded-full border border-white/10 px-2 py-1"
                                        >
                                          {lesson.done ? 'Undo' : 'Done'}
                                        </button>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <div className="space-y-3">
                  {visibleCourses.map((course) => {
                    const linkedCount = courseNoteCount(course.id);
                    return (
                      <button key={course.id} type="button" onClick={() => setActiveCourseId(course.id)} className={cn('w-full rounded-[1.5rem] border p-4 text-left transition hover:-translate-y-0.5', activeCourse?.id === course.id ? 'border-white bg-white/10' : 'border-white/10 bg-white/5 hover:bg-white/10')}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-xs uppercase tracking-[0.24em] text-white/35">{course.areaId}</div>
                            <h3 className="mt-2 text-base font-semibold text-white">{course.title}</h3>
                            <p className="mt-2 text-sm text-white/60">{course.source}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2 text-xs text-white/55">
                            <span className="rounded-full border border-white/10 px-2 py-1">{linkedCount ? `${linkedCount} linked notes` : 'Standalone'}</span>
                            <span className="rounded-full border border-white/10 px-2 py-1">{course.completedLessons}/{course.totalLessons} lessons</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {activeTab === 'resources' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">Resources</h2>
                    <p className="text-sm text-white/55">Let AI process incoming links into notes, tasks, vault items, or habits.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddResource(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
                  >
                    <Plus className="h-4 w-4" /> Add resource
                  </button>
                </div>
                <div className="grid gap-3">
                  {visibleResources.map((resource) => (
                    <button
                      key={resource.id}
                      type="button"
                      onClick={() => setActiveResourceId(resource.id)}
                      className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/10"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-[0.24em] text-white/35">{resource.type}</div>
                          <p className="mt-2 text-sm leading-6 text-white/75">{resource.content}</p>
                        </div>
                        <div className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-white/60">
                          {resource.status}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {activeTab === 'knowledge' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">Knowledge</h2>
                    <p className="text-sm text-white/55">Relationship health across notes, notebooks, topics, lessons, and tasks.</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-white/35">Linked notes</div>
                    <div className="mt-2 text-2xl font-semibold text-white">{linkedNotes.length}</div>
                    <div className="mt-1 text-xs text-white/55">Connected to course modules/lessons</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-white/35">Standalone notes</div>
                    <div className="mt-2 text-2xl font-semibold text-white">{standaloneNotes.length}</div>
                    <div className="mt-1 text-xs text-white/55">Independent notebook knowledge</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-white/35">Topic coverage</div>
                    <div className="mt-2 text-2xl font-semibold text-white">{notesWithTopic.length}/{state.notes.length}</div>
                    <div className="mt-1 text-xs text-white/55">Notes classified by topics</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-white/35">Courses mapped</div>
                    <div className="mt-2 text-2xl font-semibold text-white">{coursesWithLinkedNotes.length}/{state.courses.length}</div>
                    <div className="mt-1 text-xs text-white/55">Courses with linked notes</div>
                  </div>
                </div>

                <div className="grid gap-3 xl:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <div className="mb-3 text-sm font-medium text-white">Coverage gaps</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                        <span className="text-white/70">Notes without topic</span>
                        <span className="font-medium text-amber-300">{notesWithoutTopic.length}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                        <span className="text-white/70">Orphan notes</span>
                        <span className="font-medium text-rose-300">{orphanNotes.length}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                        <span className="text-white/70">Standalone notes</span>
                        <span className="font-medium text-white">{standaloneNotes.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <div className="mb-3 text-sm font-medium text-white">Knowledge links</div>
                    <div className="space-y-2">
                      {state.notes.slice(0, 8).map((note) => {
                        const notebookName = notebooks.find((item) => item.id === (note.notebookId ?? noteNotebookMap[note.id] ?? DEFAULT_NOTEBOOK_ID))?.name ?? 'General';
                        const linked = (note.courseId && note.moduleId && note.lessonId) || noteLessonLinkMap[note.id];
                        return (
                          <div key={note.id} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm">
                            <div className="font-medium text-white">{note.title}</div>
                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-white/60">
                              <span className="rounded-full border border-white/10 px-2 py-1">{notebookName}</span>
                              <span className="rounded-full border border-white/10 px-2 py-1">{note.topicIds.length ? `${note.topicIds.length} topics` : 'No topic'}</span>
                              <span className={cn('rounded-full px-2 py-1', linked ? 'border border-emerald-400/30 text-emerald-200' : 'border border-white/10 text-white/60')}>
                                {linked ? 'Lesson linked' : 'Standalone'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          <aside className="space-y-5 lg:sticky lg:top-5 lg:self-start">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <div className="flex items-center gap-3 text-sm font-medium text-white/85">
                <Sparkles className="h-4 w-4 text-amber-300" /> Learn dashboard
              </div>
              <p className="mt-3 text-sm leading-6 text-white/60">
                Notes, topics, and lessons stay connected here. Search to turn a resource into the right next action.
              </p>
              <div className="mt-5 grid gap-3 text-sm text-white/70">
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.24em] text-white/35">Notes</div>
                  <div className="mt-1 font-medium text-white">{state.notes.length} saved</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.24em] text-white/35">Connected</div>
                  <div className="mt-1 font-medium text-white">{linkedNotes.length} linked notes</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.24em] text-white/35">Topics</div>
                  <div className="mt-1 font-medium text-white">{state.topics.length} tracked</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.24em] text-white/35">Courses</div>
                  <div className="mt-1 font-medium text-white">{state.courses.length} active paths</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.24em] text-white/35">Resources</div>
                  <div className="mt-1 font-medium text-white">{pendingResources.length} pending</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.24em] text-white/35">Vault</div>
                  <div className="mt-1 font-medium text-white">{state.vaultItems.length} saved</div>
                </div>
                {activeCourse && activeLesson ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowLessonSheet(true);
                      setActiveTab('courses');
                    }}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left transition hover:bg-white/10"
                  >
                    <div className="text-xs uppercase tracking-[0.24em] text-white/35">Continue lesson</div>
                    <div className="mt-1 font-medium text-white">{activeCourse.title}</div>
                    <div className="text-xs text-white/55">{activeLesson.title}</div>
                  </button>
                ) : null}
              </div>
            </div>
          </aside>
        </main>
      </div>

      <AddNoteSheet
        open={showAddNote}
        courses={state.courses}
        initialLessonLink={initialLessonLinkForNewNote}
        onClose={() => {
          setShowAddNote(false);
          setInitialLessonLinkForNewNote(undefined);
        }}
        onSave={saveNote}
      />
      <AddTopicSheet open={showAddTopic} onClose={() => setShowAddTopic(false)} onSave={saveTopic} />
      <AddCourseSheet open={showAddCourse} onClose={() => setShowAddCourse(false)} onSave={saveCourse} />
      <AddResourceSheet open={showAddResource} onClose={() => setShowAddResource(false)} onSave={saveResource} />
      <NoteDetailSheet
        open={Boolean(activeNote)}
        note={activeNote}
        topics={state.topics}
        notebooks={notebooks}
        courses={state.courses}
        noteNotebookId={activeNoteNotebookId}
        noteLessonLink={activeNoteLessonLink}
        onClose={() => setActiveNoteId(null)}
        onCreateTaskFromNote={createTaskFromNote}
        onSave={(noteId, updates, notebookId, lessonLink) => {
          dispatch({
            type: 'UPDATE_NOTE',
            noteId,
            updates: {
              ...updates,
              notebookId,
              courseId: lessonLink?.courseId,
              moduleId: lessonLink?.moduleId,
              lessonId: lessonLink?.lessonId,
            },
          });
          setNoteNotebookMap((current) => ({ ...current, [noteId]: notebookId || DEFAULT_NOTEBOOK_ID }));
          setNoteLessonLinkMap((current) => {
            if (!lessonLink) {
              const next = { ...current };
              delete next[noteId];
              return next;
            }
            return { ...current, [noteId]: lessonLink };
          });
          toast({ title: 'Note updated', description: 'Changes saved.' });
          setActiveNoteId(null);
        }}
        onDelete={(noteId) => {
          dispatch({ type: 'DELETE_NOTE', noteId });
          setNoteNotebookMap((current) => {
            const next = { ...current };
            delete next[noteId];
            return next;
          });
          setNoteLessonLinkMap((current) => {
            const next = { ...current };
            delete next[noteId];
            return next;
          });
          toast({ title: 'Note deleted', description: 'Removed from Learn.' });
          setActiveNoteId(null);
        }}
      />
      <LessonSheet
        open={showLessonSheet && Boolean(activeCourse && activeLesson)}
        course={activeCourse}
        module={activeModule}
        lesson={activeLesson}
        onClose={() => setShowLessonSheet(false)}
        onToggleLesson={toggleLesson}
        onCreateLinkedNote={startLinkedNoteFromLesson}
        onNext={() => moveLesson('next')}
        onPrevious={() => moveLesson('previous')}
      />
      <ResourceProcessSheet
        open={Boolean(activeResource)}
        resource={activeResource}
        onClose={() => setActiveResourceId(null)}
        onProcess={processResource}
      />
    </div>
  );
}

export default Learn;
