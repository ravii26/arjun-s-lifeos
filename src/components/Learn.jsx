import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/design-system.css';
import './Learn.css';
import { areaKeyFromDomain, loadLearningGraphStore, saveLearningGraphStore } from '../lib/learningGraphStore';
import { AREA_META } from '../lib/areasStore';
import { appendLearnTask, domainToTaskArea } from '../lib/tasksStore';

const AREA_COLORS = {
  coding: 'var(--blue)',
  health: 'var(--teal)',
  finance: 'var(--accent)',
  'self-development': 'var(--purple)',
};

const TABS = ['Active Learning', 'Topics', 'Notebooks', 'Notes', 'Resources'];

const toId = () => Date.now() + Math.floor(Math.random() * 100000);

const calcAgeHours = (isoDate) => {
  const now = Date.now();
  const target = new Date(isoDate).getTime();
  return Math.max(1, Math.floor((now - target) / (1000 * 60 * 60)));
};

const useCountUp = (target, duration = 650) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const endValue = Number.isFinite(target) ? target : 0;
    if (endValue <= 0) {
      setValue(0);
      return undefined;
    }

    let frame = null;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(endValue * progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [target, duration]);

  return value;
};

const skillLabel = (value) => {
  if (value <= 33) return { text: 'Beginner', color: 'var(--red)' };
  if (value <= 66) return { text: 'Intermediate', color: 'var(--orange)' };
  return { text: 'Advanced', color: 'var(--teal)' };
};

const Learn = () => {
  const initialPersisted = useMemo(() => loadLearningGraphStore(), []);
  const location = useLocation();
  const navigate = useNavigate();

  // Read deep-link query params emitted by AreaDetail cards
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const [domains] = useState(initialPersisted.domains || []);
  const [courses, setCourses] = useState(initialPersisted.courses || []);
  const [topics, setTopics] = useState(initialPersisted.topics || []);
  const [notebooks, setNotebooks] = useState(initialPersisted.notebooks || []);
  const [notes, setNotes] = useState(initialPersisted.notes || []);
  const [resources, setResources] = useState(initialPersisted.resources || []);

  const [activeTab, setActiveTab] = useState(() => {
    const tab = queryParams.get('tab');
    return tab && TABS.includes(tab) ? tab : 'Active Learning';
  });
  const [areaScope, setAreaScope] = useState(() => queryParams.get('area') || 'all');

  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showNotebookForm, setShowNotebookForm] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [noteEditing, setNoteEditing] = useState(null);
  const [resourceEditing, setResourceEditing] = useState(null);
  const [convertTaskDraft, setConvertTaskDraft] = useState(null);

  // Topic CRUD
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [newTopic, setNewTopic] = useState({ name: '', domain: 'coding', skill: 30 });
  const [topicEditing, setTopicEditing] = useState(null);

  // Course / Notebook edit modals
  const [courseEditing, setCourseEditing] = useState(null);
  const [notebookEditing, setNotebookEditing] = useState(null);

  // Delete confirmation { type, id, name }
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [topicSearch, setTopicSearch] = useState('');
  const [topicDomain, setTopicDomain] = useState('all');

  const [noteSearch, setNoteSearch] = useState('');
  const [noteFilterTopicId, setNoteFilterTopicId] = useState('all');
  const [noteFilterDomain, setNoteFilterDomain] = useState('all');
  const [noteFilterNotebookId, setNoteFilterNotebookId] = useState('all');
  const [noteSort, setNoteSort] = useState('Recent');

  const [resourceFilter, setResourceFilter] = useState('All');
  const [resourceDomainFilter, setResourceDomainFilter] = useState('all');
  const [resourceInput, setResourceInput] = useState('');
  const [resourceArea, setResourceArea] = useState('coding');
  const [resourceType, setResourceType] = useState('Article');
  const [resourceTopicId, setResourceTopicId] = useState('');
  const [resourceCourseId, setResourceCourseId] = useState('');

  const [newCourse, setNewCourse] = useState({ title: '', source: 'YouTube', url: '', area: 'coding', totalUnits: '', topicId: '' });
  const [newNotebook, setNewNotebook] = useState({ name: '', domain: 'coding', description: '' });

  const areaOptions = useMemo(() => {
    const keys = new Set();
    domains.forEach((domain) => keys.add(domain.areaKey || areaKeyFromDomain(domain.key)));
    return ['all', ...Array.from(keys)];
  }, [domains]);

  const matchesAreaScope = (entityAreaKey, domain) => {
    if (areaScope === 'all') return true;
    const derived = entityAreaKey || areaKeyFromDomain(domain);
    return derived === areaScope;
  };

  const visibleCourses = useMemo(() => {
    return courses.filter((course) => matchesAreaScope(course.areaKey, course.domain));
  }, [courses, areaScope]);

  const activeVisibleCourse = useMemo(() => {
    return visibleCourses.find((course) => course.status === 'Active') || visibleCourses[0] || null;
  }, [visibleCourses]);

  const topicMap = useMemo(() => {
    const map = new Map();
    topics.forEach((topic) => map.set(topic.id, topic));
    return map;
  }, [topics]);

  const courseMap = useMemo(() => {
    const map = new Map();
    courses.forEach((course) => map.set(course.id, course));
    return map;
  }, [courses]);

  const notebookMap = useMemo(() => {
    const map = new Map();
    notebooks.forEach((notebook) => map.set(notebook.id, notebook));
    return map;
  }, [notebooks]);

  const resourceMap = useMemo(() => {
    const map = new Map();
    resources.forEach((resource) => map.set(resource.id, resource));
    return map;
  }, [resources]);

  useEffect(() => {
    saveLearningGraphStore({ domains, topics, courses, notebooks, notes, resources });
  }, [domains, topics, courses, notebooks, notes, resources]);

  const pendingResources = resources.filter((resource) => resource.state === 'Pending');

  const filteredTopics = topics.filter((topic) => {
    const matchesArea = topicDomain === 'all' || topic.domain === topicDomain;
    const matchesSearch = topic.name.toLowerCase().includes(topicSearch.toLowerCase());
    const matchesScope = matchesAreaScope(topic.areaKey, topic.domain);
    return matchesArea && matchesSearch && matchesScope;
  });

  const filteredNotebooks = notebooks.filter((item) => {
    const matchesDomain = noteFilterDomain === 'all' || item.domain === noteFilterDomain;
    const matchesScope = matchesAreaScope(item.areaKey, item.domain);
    return matchesDomain && matchesScope;
  });

  const filteredNotes = useMemo(() => {
    let next = [...notes].filter((note) => {
      const matchesSearch = `${note.title} ${note.content}`.toLowerCase().includes(noteSearch.toLowerCase());
      const matchesTopic = noteFilterTopicId === 'all' || String(note.topicId || '') === String(noteFilterTopicId);
      const matchesArea = noteFilterDomain === 'all' || note.domain === noteFilterDomain;
      const matchesNotebook = noteFilterNotebookId === 'all' || String(note.notebookId || '') === String(noteFilterNotebookId);
      const matchesScope = matchesAreaScope(note.areaKey, note.domain);
      return matchesSearch && matchesTopic && matchesArea && matchesNotebook && matchesScope;
    });

    if (noteSort === 'Recent') {
      next.sort((a, b) => (a.date < b.date ? 1 : -1));
    }
    if (noteSort === 'Topic') {
      next.sort((a, b) => (topicMap.get(a.topicId)?.name || '').localeCompare(topicMap.get(b.topicId)?.name || ''));
    }
    if (noteSort === 'Domain') {
      next.sort((a, b) => a.domain.localeCompare(b.domain));
    }

    return next;
  }, [notes, noteSearch, noteFilterTopicId, noteFilterDomain, noteFilterNotebookId, noteSort, topicMap]);

  const filteredResources = resources.filter((resource) => {
    const matchesState = resourceFilter === 'All' ? true : resource.state === resourceFilter;
    const matchesDomain = resourceDomainFilter === 'all' || resource.domain === resourceDomainFilter;
    const matchesScope = matchesAreaScope(resource.areaKey, resource.domain);
    return matchesState && matchesDomain && matchesScope;
  });

  const stats = {
    studyTime: '9h 40m',
    notesCreated: notes.length,
    topicsReviewed: topics.length,
    coursesActive: visibleCourses.filter((course) => course.status === 'Active').length,
  };

  const animatedNotes = useCountUp(stats.notesCreated, 700);
  const animatedTopics = useCountUp(stats.topicsReviewed, 700);
  const animatedCourses = useCountUp(stats.coursesActive, 700);
  const activeProgress = useCountUp(activeVisibleCourse?.progress || 0, 700);

  const createCourse = (event) => {
    event.preventDefault();
    if (!newCourse.title.trim()) return;

    const total = Number(newCourse.totalUnits || 12);
    const topicId = newCourse.topicId ? Number(newCourse.topicId) : null;
    const next = {
      id: toId(),
      name: newCourse.title,
      source: newCourse.source,
      url: newCourse.url,
      domain: newCourse.area,
      status: 'Paused',
      progress: 0,
      lesson: 0,
      totalLessons: total,
      nextTask: '',
      eta: '~2 weeks at current pace',
      topicIds: topicId ? [topicId] : [],
    };

    setCourses((prev) => [...prev, next]);
    setNewCourse({ title: '', source: 'YouTube', url: '', area: 'coding', totalUnits: '', topicId: '' });
    setShowCourseForm(false);
  };

  const createNotebook = (event) => {
    event.preventDefault();
    if (!newNotebook.name.trim()) return;

    setNotebooks((prev) => [
      {
        id: toId(),
        name: newNotebook.name,
        domain: newNotebook.domain,
        areaKey: areaKeyFromDomain(newNotebook.domain),
        description: newNotebook.description,
      },
      ...prev,
    ]);

    setNewNotebook({ name: '', domain: 'coding', description: '' });
    setShowNotebookForm(false);
  };

  const setCourseStatus = (courseId, status) => {
    setCourses((prev) => prev.map((course) => {
      if (course.id === courseId) {
        return {
          ...course,
          status,
          progress: status === 'Completed' ? 100 : course.progress,
          lesson: status === 'Completed' ? course.totalLessons : course.lesson,
          eta: status === 'Completed' ? 'Completed' : course.eta,
        };
      }

      if (status === 'Active' && course.status === 'Active') {
        return { ...course, status: 'Paused' };
      }

      return course;
    }));
  };

  const continueCourse = () => {
    if (!activeVisibleCourse) return;

    setCourses((prev) => prev.map((course) => {
      if (course.id !== activeVisibleCourse.id) return course;

      const nextLesson = Math.min(course.totalLessons, (course.lesson || 0) + 1);
      const nextProgress = Math.round((nextLesson / Math.max(1, course.totalLessons)) * 100);
      const completed = nextLesson >= course.totalLessons;

      return {
        ...course,
        lesson: nextLesson,
        progress: nextProgress,
        status: completed ? 'Completed' : 'Active',
        eta: completed ? 'Completed' : course.eta,
      };
    }));
  };

  const openNoteDraftFromCourse = () => {
    if (!activeVisibleCourse) return;
    const firstNotebook = notebooks.find((item) => item.domain === activeVisibleCourse.domain) || notebooks[0] || null;
    setNoteEditing({
      id: null,
      title: `${activeVisibleCourse.name} next-step note`,
      content: activeVisibleCourse.nextTask || '',
      type: 'Concept',
      domain: activeVisibleCourse.domain,
      notebookId: firstNotebook?.id || null,
      topicId: activeVisibleCourse.topicIds?.[0] || null,
      courseId: activeVisibleCourse.id,
      resourceId: null,
      date: new Date().toISOString().slice(0, 10),
    });
    setActiveTab('Notes');
  };

  const inferDomainForNote = (draft) => {
    if (draft.topicId && topicMap.get(Number(draft.topicId))?.domain) return topicMap.get(Number(draft.topicId)).domain;
    if (draft.courseId && courseMap.get(Number(draft.courseId))?.domain) return courseMap.get(Number(draft.courseId)).domain;
    if (draft.resourceId && resourceMap.get(Number(draft.resourceId))?.domain) return resourceMap.get(Number(draft.resourceId)).domain;
    if (draft.notebookId && notebookMap.get(Number(draft.notebookId))?.domain) return notebookMap.get(Number(draft.notebookId)).domain;
    return draft.domain || 'coding';
  };

  const saveNote = () => {
    if (!noteEditing || !noteEditing.title.trim()) return;

    if (!noteEditing.notebookId) return;

    const normalized = {
      ...noteEditing,
      date: noteEditing.date || new Date().toISOString().slice(0, 10),
      notebookId: Number(noteEditing.notebookId),
      topicId: noteEditing.topicId ? Number(noteEditing.topicId) : null,
      courseId: noteEditing.courseId ? Number(noteEditing.courseId) : null,
      resourceId: noteEditing.resourceId ? Number(noteEditing.resourceId) : null,
      domain: inferDomainForNote(noteEditing),
      areaKey: areaKeyFromDomain(inferDomainForNote(noteEditing)),
    };

    setNotes((prev) => {
      const exists = prev.some((note) => note.id === noteEditing.id);
      if (exists) {
        return prev.map((note) => (note.id === noteEditing.id ? normalized : note));
      }
      return [{ ...normalized, id: toId() }, ...prev];
    });

    setNoteEditing(null);
  };

  const deleteNote = () => {
    if (!noteEditing) return;
    if (!noteEditing.id) {
      setNoteEditing(null);
      return;
    }

    setNotes((prev) => prev.filter((note) => note.id !== noteEditing.id));
    setNoteEditing(null);
  };

  const copyNote = async () => {
    if (!noteEditing) return;
    const payload = `${noteEditing.title}\n\n${noteEditing.content}`;
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(payload);
      } catch {
        // no-op
      }
    }
  };

  const addResource = (event) => {
    event.preventDefault();
    if (!resourceInput.trim()) return;

    const isUrl = /^https?:\/\//i.test(resourceInput.trim());

    const selectedCourse = resourceCourseId ? courseMap.get(Number(resourceCourseId)) : null;
    const selectedTopic = resourceTopicId ? topicMap.get(Number(resourceTopicId)) : null;
    const domain = selectedCourse?.domain || selectedTopic?.domain || resourceArea;

    setResources((prev) => [
      {
        id: toId(),
        title: isUrl ? 'Saved URL resource' : resourceInput,
        url: isUrl ? resourceInput : '',
        type: isUrl ? resourceType : 'Idea',
        domain,
        areaKey: areaKeyFromDomain(domain),
        addedAt: new Date().toISOString(),
        state: 'Pending',
        topicId: resourceTopicId ? Number(resourceTopicId) : null,
        courseId: resourceCourseId ? Number(resourceCourseId) : null,
      },
      ...prev,
    ]);

    setResourceInput('');
    setResourceTopicId('');
    setResourceCourseId('');
  };

  const convertResourceToNote = (resource) => {
    setResources((prev) => prev.map((item) => (item.id === resource.id ? { ...item, state: 'Processed' } : item)));
    const firstNotebook = notebooks.find((item) => item.domain === resource.domain) || notebooks[0] || null;
    setNoteEditing({
      id: null,
      title: resource.title,
      content: resource.url || '',
      type: 'Insight',
      domain: resource.domain,
      notebookId: firstNotebook?.id || null,
      topicId: resource.topicId || null,
      courseId: resource.courseId || null,
      resourceId: resource.id,
      date: new Date().toISOString().slice(0, 10),
    });
    setActiveTab('Notes');
  };

  const updateResourceState = (resourceId, state) => {
    setResources((prev) => prev.map((item) => (item.id === resourceId ? { ...item, state } : item)));
  };

  const openResourceUrl = (resource) => {
    if (!resource.url) return;
    window.open(resource.url, '_blank', 'noopener,noreferrer');
  };

  // Resource inline edit/delete
  const openResourceEdit = (resource) => setResourceEditing({ ...resource });

  const saveResourceEdit = () => {
    if (!resourceEditing || !resourceEditing.title?.trim()) return;
    setResources((prev) =>
      prev.map((item) => (item.id === resourceEditing.id ? { ...item, ...resourceEditing } : item))
    );
    setResourceEditing(null);
  };

  const deleteResource = (resourceId) => {
    setResources((prev) => prev.filter((item) => item.id !== resourceId));
    if (resourceEditing?.id === resourceId) setResourceEditing(null);
  };

  // Convert note → Task
  const openConvertToTask = () => {
    if (!noteEditing) return;
    const domain = inferDomainForNote(noteEditing);
    setConvertTaskDraft({
      title: noteEditing.title,
      area: domainToTaskArea(domain),
      priority: 'P2',
      type: 'Manual',
      notes: noteEditing.content?.slice(0, 200) || '',
      links: {
        noteId: noteEditing.id,
        topicId: noteEditing.topicId,
        courseId: noteEditing.courseId,
      },
    });
  };

  const submitConvertToTask = () => {
    if (!convertTaskDraft?.title?.trim()) return;
    appendLearnTask(convertTaskDraft);
    setConvertTaskDraft(null);
    navigate('/tasks');
  };

  // ── Topic CRUD ──
  const createTopic = (event) => {
    event.preventDefault();
    if (!newTopic.name.trim()) return;
    setTopics((prev) => [
      {
        id: toId(),
        name: newTopic.name,
        domain: newTopic.domain,
        areaKey: areaKeyFromDomain(newTopic.domain),
        skill: Math.max(0, Math.min(100, Number(newTopic.skill) || 30)),
        lastStudied: 'never',
        relatedTopicIds: [],
      },
      ...prev,
    ]);
    setNewTopic({ name: '', domain: 'coding', skill: 30 });
    setShowTopicForm(false);
  };

  const openTopicEdit = (topic) => {
    setTopicEditing({ ...topic });
    setSelectedTopic(null);
  };

  const saveTopicEdit = () => {
    if (!topicEditing?.name?.trim()) return;
    const normalized = {
      ...topicEditing,
      skill: Math.max(0, Math.min(100, Number(topicEditing.skill) || 0)),
      areaKey: areaKeyFromDomain(topicEditing.domain),
    };
    setTopics((prev) => prev.map((t) => (t.id === normalized.id ? normalized : t)));
    setTopicEditing(null);
  };

  const deleteTopic = (topicId) => {
    setTopics((prev) => prev.filter((t) => t.id !== topicId));
    if (topicEditing?.id === topicId) setTopicEditing(null);
    if (selectedTopic?.id === topicId) setSelectedTopic(null);
  };

  // ── Course Edit / Delete ──
  const openCourseEdit = (course) => setCourseEditing({ ...course });

  const saveCourseEdit = () => {
    if (!courseEditing?.name?.trim()) return;
    setCourses((prev) => prev.map((c) => (c.id === courseEditing.id ? { ...c, ...courseEditing } : c)));
    setCourseEditing(null);
  };

  const deleteCourse = (courseId) => {
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    if (courseEditing?.id === courseId) setCourseEditing(null);
  };

  // ── Notebook Edit / Delete ──
  const openNotebookEdit = (notebook) => setNotebookEditing({ ...notebook });

  const saveNotebookEdit = () => {
    if (!notebookEditing?.name?.trim()) return;
    const updated = {
      ...notebookEditing,
      areaKey: areaKeyFromDomain(notebookEditing.domain),
    };
    setNotebooks((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    setNotebookEditing(null);
  };

  const deleteNotebook = (notebookId) => {
    setNotebooks((prev) => prev.filter((n) => n.id !== notebookId));
    if (notebookEditing?.id === notebookId) setNotebookEditing(null);
  };

  // ── Resource → Task direct ──
  const convertResourceToTask = (resource) => {
    setConvertTaskDraft({
      title: resource.title,
      area: domainToTaskArea(resource.domain),
      priority: 'P2',
      type: 'Manual',
      notes: resource.url ? `From resource: ${resource.url}` : '',
      links: { resourceId: resource.id, topicId: resource.topicId },
    });
  };

  // ── Confirm Delete executor ──
  const executeConfirmDelete = () => {
    if (!confirmDelete) return;
    const { type, id } = confirmDelete;
    if (type === 'topic') deleteTopic(id);
    if (type === 'course') deleteCourse(id);
    if (type === 'notebook') deleteNotebook(id);
    if (type === 'note') { setNotes((prev) => prev.filter((n) => n.id !== id)); setNoteEditing(null); }
    if (type === 'resource') deleteResource(id);
    setConfirmDelete(null);
  };

  const openEntityDetail = (type, id) => {
    navigate(`/learn/${type}/${id}`, { state: { from: `${location.pathname}${location.search}` } });
  };

  const renderActiveLearning = () => (
    <div className="learn-tab-content">
      {!activeVisibleCourse && (
        <div className="empty-panel">
          <p>No courses yet. Add your first course to start tracking your learning.</p>
          <button className="primary-button" onClick={() => setShowCourseForm(true)}>Add Course</button>
        </div>
      )}

      {activeVisibleCourse && (
      <div className="active-course-hero">
        <div className="course-thumb" style={{ background: `linear-gradient(140deg, ${AREA_COLORS[activeVisibleCourse.domain] || 'var(--blue)'}, #ffffff15)` }} />
        <div className="course-main">
          <div className="hero-top-line">
            <h3>{activeVisibleCourse.name}</h3>
            <div className="hero-tags">
              <span className="chip-chip">{activeVisibleCourse.source}</span>
              <span className="chip-chip" style={{ borderColor: AREA_COLORS[activeVisibleCourse.domain] || 'var(--blue)' }}>{activeVisibleCourse.domain}</span>
            </div>
          </div>
          <div className="progress-wrap">
            <div className="progress-track">
              <div style={{ width: `${activeProgress}%`, background: AREA_COLORS[activeVisibleCourse.domain] || 'var(--blue)' }} />
            </div>
            <div className="mono-caption">
              Lesson {activeVisibleCourse.lesson} of {activeVisibleCourse.totalLessons} · {activeVisibleCourse.progress}% complete
            </div>
            <div className="mono-caption">Estimated completion: {activeVisibleCourse.eta}</div>
          </div>
          <div className="next-action-row">
            <span>What you&apos;ll do next:</span>
            {activeVisibleCourse.nextTask ? (
              <button className="ghost-link" onClick={openNoteDraftFromCourse}>{activeVisibleCourse.nextTask}</button>
            ) : (
              <button className="ghost-link" onClick={openNoteDraftFromCourse}>Generate note</button>
            )}
          </div>
        </div>
        <div className="hero-actions">
          <button className="primary-button" onClick={continueCourse} disabled={activeVisibleCourse.status === 'Completed'}>
            {activeVisibleCourse.status === 'Completed' ? 'Completed' : 'Continue'}
          </button>
          <button className="secondary-button" onClick={() => openEntityDetail('courses', activeVisibleCourse.id)}>
            View Details
          </button>
        </div>
      </div>
      )}

      <div className="section-head">
        <h4>Other Courses</h4>
        <button className="secondary-button" onClick={() => setShowCourseForm((prev) => !prev)}>+ Add Course</button>
      </div>

      {showCourseForm && (
        <form className="course-form" onSubmit={createCourse}>
          <input
            placeholder="Title"
            value={newCourse.title}
            onChange={(e) => setNewCourse((prev) => ({ ...prev, title: e.target.value }))}
          />
          <select value={newCourse.source} onChange={(e) => setNewCourse((prev) => ({ ...prev, source: e.target.value }))}>
            <option>YouTube</option>
            <option>Book</option>
            <option>Course</option>
            <option>Self-defined</option>
          </select>
          <input
            placeholder="Source URL (optional)"
            value={newCourse.url}
            onChange={(e) => setNewCourse((prev) => ({ ...prev, url: e.target.value }))}
          />
          <select value={newCourse.area} onChange={(e) => setNewCourse((prev) => ({ ...prev, area: e.target.value }))}>
            {domains.map((domain) => <option key={domain.key} value={domain.key}>{domain.key}</option>)}
          </select>
          <select value={newCourse.topicId} onChange={(e) => setNewCourse((prev) => ({ ...prev, topicId: e.target.value }))}>
            <option value="">Link topic (optional)</option>
            {topics
              .filter((topic) => topic.domain === newCourse.area)
              .map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
          </select>
          <input
            placeholder="Total units (optional)"
            value={newCourse.totalUnits}
            onChange={(e) => setNewCourse((prev) => ({ ...prev, totalUnits: e.target.value }))}
          />
          <button className="primary-button" type="submit">Save Course</button>
        </form>
      )}

      <div className="course-list">
        {visibleCourses.filter((course) => !activeVisibleCourse || course.id !== activeVisibleCourse.id).map((course) => (
          <article className="course-item" key={course.id}>
            <div>
              <h5>{course.name}</h5>
              <p>{course.source} · {course.domain}</p>
            </div>
            <div className="course-item-right">
              <span className={`status-badge ${course.status.toLowerCase()}`}>{course.status}</span>
              <span className="mono-caption">{course.progress}%</span>
              <div className="course-actions">
                <button className="secondary-button" onClick={() => openEntityDetail('courses', course.id)}>Details</button>
                {course.status !== 'Active' && (
                  <button className="secondary-button" onClick={() => setCourseStatus(course.id, 'Active')}>Set active</button>
                )}
                {course.status !== 'Paused' && course.status !== 'Completed' && (
                  <button className="secondary-button" onClick={() => setCourseStatus(course.id, 'Paused')}>Pause</button>
                )}
                {course.status !== 'Completed' && (
                  <button className="secondary-button" onClick={() => setCourseStatus(course.id, 'Completed')}>Complete</button>
                )}
                <button className="secondary-button" onClick={() => openCourseEdit(course)}>Edit</button>
                <button className="secondary-button danger" onClick={() => setConfirmDelete({ type: 'course', id: course.id, name: course.name })}>Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="learn-stats-bar">
        <h4>Your Learning This Week</h4>
        <div className="stats-row-mono">
          <span>{stats.studyTime} study time</span>
          <span>{stats.notesCreated} notes created</span>
          <span>{stats.topicsReviewed} topics reviewed</span>
          <span>{stats.coursesActive} courses active</span>
        </div>
      </div>
    </div>
  );

  const renderTopics = () => (
    <div className="learn-tab-content">
      <div className="filters-row">
        <input placeholder="Search topics" value={topicSearch} onChange={(e) => setTopicSearch(e.target.value)} />
        <div className="area-filter-row">
          {['all', ...domains.map((domain) => domain.key)].map((area) => (
            <button
              key={area}
              className={`pill ${topicDomain === area ? 'active' : ''}`}
              onClick={() => setTopicDomain(area)}
              style={{ borderColor: area === 'all' ? 'var(--border-strong)' : (AREA_COLORS[area] || 'var(--border-strong)') }}
            >
              {area}
            </button>
          ))}
        </div>
        <button className="secondary-button" onClick={() => setShowTopicForm((prev) => !prev)}>+ Add Topic</button>
      </div>

      {showTopicForm && (
        <form className="course-form" onSubmit={createTopic} style={{ marginTop: 10 }}>
          <input
            placeholder="Topic name"
            value={newTopic.name}
            onChange={(e) => setNewTopic((prev) => ({ ...prev, name: e.target.value }))}
          />
          <select value={newTopic.domain} onChange={(e) => setNewTopic((prev) => ({ ...prev, domain: e.target.value }))}>
            {domains.map((domain) => <option key={domain.key} value={domain.key}>{domain.key}</option>)}
          </select>
          <div className="skill-input-row">
            <label className="mono-caption">Skill: {newTopic.skill}%</label>
            <input
              type="range"
              min={0}
              max={100}
              value={newTopic.skill}
              onChange={(e) => setNewTopic((prev) => ({ ...prev, skill: Number(e.target.value) }))}
            />
          </div>
          <button className="primary-button" type="submit">Save Topic</button>
        </form>
      )}

      <div className="topic-grid">
        {filteredTopics.map((topic) => {
          const level = skillLabel(topic.skill);
          const linkedNoteCount = notes.filter((note) => note.topicId === topic.id).length;
          const linkedCourseCount = courses.filter((course) => (course.topicIds || []).includes(topic.id)).length;
          return (
            <article key={topic.id} className="topic-card" style={{ borderLeftColor: AREA_COLORS[topic.domain] || 'var(--blue)' }}>
              <h4>{topic.name}</h4>
              <div className="skill-wrap">
                <div className="skill-track">
                  <div style={{ width: `${topic.skill}%`, background: level.color }} />
                </div>
                <span style={{ color: level.color }}>{level.text}</span>
              </div>
              <p className="mono-caption">{linkedNoteCount} notes · {linkedCourseCount} courses</p>
              <p className="mono-caption">Last studied: {topic.lastStudied}</p>
              <div className="topic-card-actions">
                <button className="ghost-link" onClick={() => openEntityDetail('topics', topic.id)}>Open</button>
                <button className="ghost-link" onClick={() => openTopicEdit(topic)}>Edit</button>
                <button className="ghost-link danger-text" onClick={() => setConfirmDelete({ type: 'topic', id: topic.id, name: topic.name })}>Delete</button>
              </div>
            </article>
          );
        })}

        {!filteredTopics.length && <p className="empty-state">No topics match your filters.</p>}
      </div>

      {selectedTopic && (
        <div className="sheet-backdrop" onClick={() => setSelectedTopic(null)}>
          <aside className="sheet" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-header">
              <h3>{selectedTopic.name}</h3>
              <button className="ghost-link" onClick={() => setSelectedTopic(null)}>✕</button>
            </div>
            <p className="mono-caption">{selectedTopic.domain} · {skillLabel(selectedTopic.skill).text} · {selectedTopic.skill}%</p>
            <section>
              <h5>Linked Notes</h5>
              {notes.filter((note) => note.topicId === selectedTopic.id).length > 0
                ? notes.filter((note) => note.topicId === selectedTopic.id).map((note) => (
                  <button key={note.id} className="ghost-link left" onClick={() => openEntityDetail('notes', note.id)}>{note.title}</button>
                ))
                : <p className="mono-caption">No linked notes yet</p>}
            </section>
            <section>
              <h5>Linked Courses</h5>
              {courses.filter((course) => (course.topicIds || []).includes(selectedTopic.id)).length > 0
                ? courses.filter((course) => (course.topicIds || []).includes(selectedTopic.id)).map((course) => (
                  <button key={course.id} className="ghost-link left" onClick={() => openEntityDetail('courses', course.id)}>{course.name}</button>
                ))
                : <p className="mono-caption">No linked courses yet</p>}
            </section>
            <section>
              <h5>Linked Resources</h5>
              <div className="chip-row">
                {resources.filter((resource) => resource.topicId === selectedTopic.id).length > 0
                  ? resources.filter((resource) => resource.topicId === selectedTopic.id).map((resource) => <span key={resource.id} className="chip-chip">{resource.title}</span>)
                  : <p className="mono-caption">No linked resources yet</p>}
              </div>
            </section>
            <div className="sheet-actions">
              <button
                className="primary-button"
                onClick={() => {
                  const bumped = Math.min(100, (selectedTopic.skill || 0) + 3);
                  const next = { ...selectedTopic, lastStudied: 'today', skill: bumped };
                  setTopics((prev) => prev.map((topic) => (topic.id === selectedTopic.id ? next : topic)));
                  setSelectedTopic(next);
                }}
              >
                Mark studied (+3%)
              </button>
              <button className="secondary-button" onClick={() => openTopicEdit(selectedTopic)}>Edit Topic</button>
              <button
                className="secondary-button"
                onClick={() => {
                  const firstNotebook = notebooks.find((item) => item.domain === selectedTopic.domain) || notebooks[0] || null;
                  setNoteEditing({
                    id: null,
                    title: `${selectedTopic.name} note`,
                    content: '',
                    type: 'Concept',
                    domain: selectedTopic.domain,
                    notebookId: firstNotebook?.id || null,
                    topicId: selectedTopic.id,
                    courseId: null,
                    resourceId: null,
                    date: new Date().toISOString().slice(0, 10),
                  });
                  setSelectedTopic(null);
                  setActiveTab('Notes');
                }}
              >
                Add note
              </button>
              <button className="secondary-button danger" onClick={() => { setConfirmDelete({ type: 'topic', id: selectedTopic.id, name: selectedTopic.name }); setSelectedTopic(null); }}>Delete</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );

  const renderNotebooks = () => (
    <div className="learn-tab-content">
      <div className="section-head">
        <h4>Notebooks</h4>
        <button className="secondary-button" onClick={() => setShowNotebookForm((prev) => !prev)}>+ Add Notebook</button>
      </div>

      {showNotebookForm && (
        <form className="course-form" onSubmit={createNotebook}>
          <input
            placeholder="Notebook name"
            value={newNotebook.name}
            onChange={(e) => setNewNotebook((prev) => ({ ...prev, name: e.target.value }))}
          />
          <select value={newNotebook.domain} onChange={(e) => setNewNotebook((prev) => ({ ...prev, domain: e.target.value }))}>
            {domains.map((domain) => <option key={domain.key} value={domain.key}>{domain.key}</option>)}
          </select>
          <input
            placeholder="Description"
            value={newNotebook.description}
            onChange={(e) => setNewNotebook((prev) => ({ ...prev, description: e.target.value }))}
          />
          <button className="primary-button" type="submit">Save Notebook</button>
        </form>
      )}

      <div className="course-list">
        {filteredNotebooks.map((notebook) => {
          const notesCount = notes.filter((note) => note.notebookId === notebook.id).length;
          const resourcesCount = notes
            .filter((note) => note.notebookId === notebook.id && note.resourceId)
            .filter((note, index, arr) => arr.findIndex((item) => item.resourceId === note.resourceId) === index).length;

          return (
            <article className="course-item" key={notebook.id}>
              <div>
                <h5>{notebook.name}</h5>
                <p>{notebook.domain} · {notebook.description || 'No description'}</p>
              </div>
              <div className="course-item-right">
                <span className="chip-chip">{notesCount} notes</span>
                <span className="chip-chip">{resourcesCount} linked resources</span>
                <button className="secondary-button" onClick={() => openEntityDetail('notebooks', notebook.id)}>
                  Details
                </button>
                <button className="secondary-button" onClick={() => {
                  setNoteFilterNotebookId(String(notebook.id));
                  setActiveTab('Notes');
                }}>
                  Open notes
                </button>
                <button className="secondary-button" onClick={() => openNotebookEdit(notebook)}>Edit</button>
                <button className="secondary-button danger" onClick={() => setConfirmDelete({ type: 'notebook', id: notebook.id, name: notebook.name })}>Delete</button>
              </div>
            </article>
          );
        })}

        {!filteredNotebooks.length && <p className="empty-state">No notebooks for this domain.</p>}
      </div>
    </div>
  );

  const renderNotes = () => (
    <div className="learn-tab-content">
      <div className="filters-row notes-filters">
        <input placeholder="Search notes" value={noteSearch} onChange={(e) => setNoteSearch(e.target.value)} />
        <select value={noteFilterTopicId} onChange={(e) => setNoteFilterTopicId(e.target.value)}>
          <option value="all">All topics</option>
          {topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
        </select>
        <select value={noteFilterDomain} onChange={(e) => setNoteFilterDomain(e.target.value)}>
          <option value="all">All domains</option>
          {domains.map((domain) => <option key={domain.key} value={domain.key}>{domain.key}</option>)}
        </select>
        <select value={noteFilterNotebookId} onChange={(e) => setNoteFilterNotebookId(e.target.value)}>
          <option value="all">All notebooks</option>
          {notebooks.map((notebook) => <option key={notebook.id} value={notebook.id}>{notebook.name}</option>)}
        </select>
        <select value={noteSort} onChange={(e) => setNoteSort(e.target.value)}>
          <option>Recent</option>
          <option>Topic</option>
          <option>Domain</option>
        </select>
        <button
          className="secondary-button"
          onClick={() => {
            const firstNotebook = notebooks[0] || null;
            setNoteEditing({
              id: null,
              title: '',
              content: '',
              type: 'Concept',
              domain: firstNotebook?.domain || 'coding',
              notebookId: firstNotebook?.id || null,
              topicId: null,
              courseId: null,
              resourceId: null,
              date: new Date().toISOString().slice(0, 10),
            });
          }}
        >
          + New Note
        </button>
      </div>

      <div className="notes-masonry">
        {filteredNotes.map((note) => (
          <article key={note.id} className="note-card" onClick={() => setNoteEditing(note)}>
            <h4>{note.title}</h4>
            <p>{note.content}</p>
            <div className="note-card-actions" onClick={(event) => event.stopPropagation()}>
              <button className="ghost-link" onClick={() => openEntityDetail('notes', note.id)}>Open details</button>
            </div>
            <div className="note-meta">
              <span className="chip-chip">{note.type}</span>
              {note.topicId && (
                <span className="chip-chip" style={{ borderColor: AREA_COLORS[note.domain] || 'var(--blue)' }}>
                  {topicMap.get(note.topicId)?.name || 'Topic'}
                </span>
              )}
              {note.notebookId && <span className="chip-chip">{notebookMap.get(note.notebookId)?.name || 'Notebook'}</span>}
            </div>
            <div className="mono-caption">From: {note.courseId ? (courseMap.get(note.courseId)?.name || 'Course') : 'Direct note'}</div>
            <div className="mono-caption">{note.date}</div>
          </article>
        ))}

        {!filteredNotes.length && <p className="empty-state">No notes match your filters.</p>}
      </div>

      {noteEditing && (
        <div className="sheet-backdrop" onClick={() => setNoteEditing(null)}>
          <aside className="sheet note-editor" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-header">
              <h3>Note Editor</h3>
              <button className="ghost-link" onClick={() => setNoteEditing(null)}>✕</button>
            </div>
            <input
              className="editor-title"
              value={noteEditing.title}
              onChange={(e) => setNoteEditing((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Note title"
            />
            <select value={noteEditing.type} onChange={(e) => setNoteEditing((prev) => ({ ...prev, type: e.target.value }))}>
              <option>Concept</option>
              <option>Insight</option>
              <option>Summary</option>
            </select>
            <textarea
              rows={8}
              value={noteEditing.content}
              onChange={(e) => setNoteEditing((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Write your note"
            />
            <select value={noteEditing.notebookId || ''} onChange={(e) => setNoteEditing((prev) => ({ ...prev, notebookId: e.target.value }))}>
              <option value="">Select notebook</option>
              {notebooks.map((notebook) => <option key={notebook.id} value={notebook.id}>{notebook.name}</option>)}
            </select>
            <select
              value={noteEditing.topicId || ''}
              onChange={(e) => setNoteEditing((prev) => ({ ...prev, topicId: e.target.value || null }))}
            >
              <option value="">Link topic (optional)</option>
              {topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
            </select>
            <select value={noteEditing.courseId || ''} onChange={(e) => setNoteEditing((prev) => ({ ...prev, courseId: e.target.value || null }))}>
              <option value="">Link course (optional)</option>
              {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
            </select>
            <select value={noteEditing.resourceId || ''} onChange={(e) => setNoteEditing((prev) => ({ ...prev, resourceId: e.target.value || null }))}>
              <option value="">Link resource (optional)</option>
              {resources.map((resource) => <option key={resource.id} value={resource.id}>{resource.title}</option>)}
            </select>
            <div className="sheet-actions">
              <button className="secondary-button" onClick={openConvertToTask} disabled={!noteEditing?.title?.trim()}>⚡ Convert to Task</button>
              <button className="secondary-button" onClick={copyNote}>Share</button>
              <button className="secondary-button danger" onClick={deleteNote}>Delete</button>
              <button className="primary-button" onClick={saveNote}>Save Note</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );

  const renderResources = () => (
    <div className="learn-tab-content">
      {pendingResources.length > 10 && (
        <div className="warning-banner">
          You have {pendingResources.length} unprocessed resources. Process them before adding more.
        </div>
      )}

      <div className="filters-row">
        {['All', 'Pending', 'Processed', 'Ignored'].map((state) => (
          <button key={state} className={`pill ${resourceFilter === state ? 'active' : ''}`} onClick={() => setResourceFilter(state)}>
            {state}
          </button>
        ))}
        <select value={resourceDomainFilter} onChange={(e) => setResourceDomainFilter(e.target.value)}>
          <option value="all">all domains</option>
          {domains.map((domain) => <option key={domain.key} value={domain.key}>{domain.key}</option>)}
        </select>
      </div>

      <form className="quick-add" onSubmit={addResource}>
        <input
          placeholder="Paste URL or type an idea"
          value={resourceInput}
          onChange={(e) => setResourceInput(e.target.value)}
        />
        <select value={resourceArea} onChange={(e) => setResourceArea(e.target.value)}>
          {domains.map((domain) => <option key={domain.key} value={domain.key}>{domain.key}</option>)}
        </select>
        <select value={resourceType} onChange={(e) => setResourceType(e.target.value)}>
          <option>Article</option>
          <option>Video</option>
          <option>Book</option>
          <option>Idea</option>
        </select>
        <select value={resourceTopicId} onChange={(e) => setResourceTopicId(e.target.value)}>
          <option value="">Link topic</option>
          {topics
            .filter((topic) => topic.domain === resourceArea)
            .map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
        </select>
        <select value={resourceCourseId} onChange={(e) => setResourceCourseId(e.target.value)}>
          <option value="">Link course</option>
          {courses
            .filter((course) => course.domain === resourceArea)
            .map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
        </select>
        <button className="primary-button" type="submit">Add Resource</button>
      </form>

      <div className="resource-list">
        {filteredResources.map((resource) => {
          const ageHours = calcAgeHours(resource.addedAt);
          const tint = ageHours > 24 * 7 ? 'resource-old-red' : ageHours > 48 ? 'resource-old' : '';
          return (
            <article key={resource.id} className={`resource-row ${tint}`}>
              <div className="resource-main">
                <div className="resource-title">{resource.title}</div>
                <div className="mono-caption">{resource.url || 'Idea / text resource'}</div>
                <div className="resource-meta">
                  <span className="chip-chip">{resource.type}</span>
                  <span className="chip-chip" style={{ borderColor: AREA_COLORS[resource.domain] || 'var(--blue)' }}>{resource.domain}</span>
                  {resource.topicId && <span className="chip-chip">{topicMap.get(resource.topicId)?.name || 'Topic'}</span>}
                  <span className="mono-caption">{Math.floor(ageHours / 24)} days ago</span>
                </div>
              </div>
              <div className="resource-actions">
                <button className="secondary-button" onClick={() => openEntityDetail('resources', resource.id)}>Details</button>
                <button className="secondary-button" onClick={() => convertResourceToNote(resource)}>➜ Note</button>
                <button className="secondary-button" onClick={() => convertResourceToTask(resource)}>⚡ Task</button>
                <button className="secondary-button" onClick={() => openResourceEdit(resource)}>Edit</button>
                <button className="secondary-button danger" onClick={() => setConfirmDelete({ type: 'resource', id: resource.id, name: resource.title })}>Delete</button>
                {resource.state !== 'Processed' && (
                  <button className="secondary-button" onClick={() => updateResourceState(resource.id, 'Processed')}>Mark processed</button>
                )}
                <button className="secondary-button" onClick={() => openResourceUrl(resource)} disabled={!resource.url}>Open URL</button>
              </div>
            </article>
          );
        })}

        {!filteredResources.length && <p className="empty-state">No resources in {resourceFilter}.</p>}
      </div>
    </div>
  );

  return (
    <div className="learn-screen">
      <div className="learn-area-filter">
        {areaOptions.map((key) => (
          <button
            key={key}
            className={`pill ${areaScope === key ? 'active' : ''}`}
            onClick={() => setAreaScope(key)}
            style={{ borderColor: key === 'all' ? 'var(--border-strong)' : AREA_META[key]?.color || 'var(--border-strong)' }}
          >
            {key === 'all' ? 'all areas' : (AREA_META[key]?.label || key)}
          </button>
        ))}
      </div>

      <div className="learn-tabs">
        {TABS.map((tab) => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      <section className="learn-snapshot-grid">
        <article className="learn-snapshot-card">
          <small>Study time</small>
          <strong>{stats.studyTime}</strong>
          <span>This week</span>
        </article>
        <article className="learn-snapshot-card">
          <small>Notes created</small>
          <strong>{animatedNotes}</strong>
          <span>captured insights</span>
        </article>
        <article className="learn-snapshot-card">
          <small>Topics reviewed</small>
          <strong>{animatedTopics}</strong>
          <span>linked topics</span>
        </article>
        <article className="learn-snapshot-card">
          <small>Active courses</small>
          <strong>{animatedCourses}</strong>
          <span>in motion</span>
        </article>
      </section>

      {activeTab === 'Active Learning' && renderActiveLearning()}
      {activeTab === 'Topics' && renderTopics()}
      {activeTab === 'Notebooks' && renderNotebooks()}
      {activeTab === 'Notes' && renderNotes()}
      {activeTab === 'Resources' && renderResources()}

      {/* ── Resource Edit Modal ── */}
      {resourceEditing && (
        <div className="sheet-backdrop" onClick={() => setResourceEditing(null)}>
          <aside className="sheet note-editor" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <h3>Edit Resource</h3>
              <button className="ghost-link" onClick={() => setResourceEditing(null)}>✕</button>
            </div>
            <input
              className="editor-title"
              value={resourceEditing.title}
              onChange={(e) => setResourceEditing((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Resource title"
            />
            <select value={resourceEditing.type} onChange={(e) => setResourceEditing((prev) => ({ ...prev, type: e.target.value }))}>
              <option>Article</option>
              <option>Video</option>
              <option>Book</option>
              <option>Idea</option>
            </select>
            <input
              value={resourceEditing.url || ''}
              onChange={(e) => setResourceEditing((prev) => ({ ...prev, url: e.target.value }))}
              placeholder="URL (optional)"
            />
            <select value={resourceEditing.domain} onChange={(e) => setResourceEditing((prev) => ({ ...prev, domain: e.target.value }))}>
              {domains.map((domain) => <option key={domain.key} value={domain.key}>{domain.key}</option>)}
            </select>
            <select value={resourceEditing.topicId || ''} onChange={(e) => setResourceEditing((prev) => ({ ...prev, topicId: e.target.value ? Number(e.target.value) : null }))}>
              <option value="">Link topic (optional)</option>
              {topics.filter((t) => t.domain === resourceEditing.domain).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select value={resourceEditing.state} onChange={(e) => setResourceEditing((prev) => ({ ...prev, state: e.target.value }))}>
              <option>Pending</option>
              <option>Processed</option>
              <option>Ignored</option>
            </select>
            <div className="sheet-actions">
              <button className="secondary-button danger" onClick={() => { deleteResource(resourceEditing.id); setResourceEditing(null); }}>Delete</button>
              <button className="primary-button" onClick={saveResourceEdit} disabled={!resourceEditing.title?.trim()}>Save</button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Convert Note → Task Modal ── */}
      {convertTaskDraft && (
        <div className="sheet-backdrop" onClick={() => setConvertTaskDraft(null)}>
          <aside className="sheet note-editor" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <h3>⚡ Convert to Task</h3>
              <button className="ghost-link" onClick={() => setConvertTaskDraft(null)}>✕</button>
            </div>
            <p className="mono-caption" style={{ marginBottom: '0.5rem' }}>This note will be sent to Tasks and you'll be navigated there.</p>
            <input
              className="editor-title"
              value={convertTaskDraft.title}
              onChange={(e) => setConvertTaskDraft((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Task title"
            />
            <select value={convertTaskDraft.area} onChange={(e) => setConvertTaskDraft((prev) => ({ ...prev, area: e.target.value }))}>
              <option>Career</option>
              <option>Health</option>
              <option>Mind</option>
              <option>Finance</option>
            </select>
            <select value={convertTaskDraft.priority} onChange={(e) => setConvertTaskDraft((prev) => ({ ...prev, priority: e.target.value }))}>
              <option>P1</option>
              <option>P2</option>
              <option>P3</option>
            </select>
            <select value={convertTaskDraft.type} onChange={(e) => setConvertTaskDraft((prev) => ({ ...prev, type: e.target.value }))}>
              <option>Boolean</option>
              <option>Manual</option>
              <option>Count</option>
              <option>Timer</option>
            </select>
            <textarea
              rows={3}
              value={convertTaskDraft.notes}
              onChange={(e) => setConvertTaskDraft((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Notes (optional)"
            />
            <div className="sheet-actions">
              <button className="secondary-button" onClick={() => setConvertTaskDraft(null)}>Cancel</button>
              <button className="primary-button" onClick={submitConvertToTask} disabled={!convertTaskDraft.title?.trim()}>Create Task &amp; Go to Tasks →</button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Topic Edit Modal ── */}
      {topicEditing && (
        <div className="sheet-backdrop" onClick={() => setTopicEditing(null)}>
          <aside className="sheet note-editor" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <h3>Edit Topic</h3>
              <button className="ghost-link" onClick={() => setTopicEditing(null)}>✕</button>
            </div>
            <input
              className="editor-title"
              value={topicEditing.name}
              onChange={(e) => setTopicEditing((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Topic name"
            />
            <select value={topicEditing.domain} onChange={(e) => setTopicEditing((prev) => ({ ...prev, domain: e.target.value }))}>
              {domains.map((domain) => <option key={domain.key} value={domain.key}>{domain.key}</option>)}
            </select>
            <div className="skill-input-row">
              <label className="mono-caption">Skill: {topicEditing.skill}%</label>
              <input
                type="range"
                min={0}
                max={100}
                value={topicEditing.skill}
                onChange={(e) => setTopicEditing((prev) => ({ ...prev, skill: Number(e.target.value) }))}
                className="skill-slider"
              />
            </div>
            <div className="sheet-actions">
              <button className="secondary-button danger" onClick={() => { setConfirmDelete({ type: 'topic', id: topicEditing.id, name: topicEditing.name }); setTopicEditing(null); }}>Delete</button>
              <button className="primary-button" onClick={saveTopicEdit} disabled={!topicEditing.name?.trim()}>Save</button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Course Edit Modal ── */}
      {courseEditing && (
        <div className="sheet-backdrop" onClick={() => setCourseEditing(null)}>
          <aside className="sheet note-editor" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <h3>Edit Course</h3>
              <button className="ghost-link" onClick={() => setCourseEditing(null)}>✕</button>
            </div>
            <input
              className="editor-title"
              value={courseEditing.name}
              onChange={(e) => setCourseEditing((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Course name"
            />
            <select value={courseEditing.source} onChange={(e) => setCourseEditing((prev) => ({ ...prev, source: e.target.value }))}>
              <option>YouTube</option>
              <option>Book</option>
              <option>Course</option>
              <option>Self-defined</option>
            </select>
            <input
              value={courseEditing.url || ''}
              onChange={(e) => setCourseEditing((prev) => ({ ...prev, url: e.target.value }))}
              placeholder="Source URL (optional)"
            />
            <select value={courseEditing.domain} onChange={(e) => setCourseEditing((prev) => ({ ...prev, domain: e.target.value }))}>
              {domains.map((domain) => <option key={domain.key} value={domain.key}>{domain.key}</option>)}
            </select>
            <input
              type="number"
              value={courseEditing.totalLessons || ''}
              onChange={(e) => setCourseEditing((prev) => ({ ...prev, totalLessons: Number(e.target.value) || 1 }))}
              placeholder="Total lessons"
            />
            <input
              value={courseEditing.nextTask || ''}
              onChange={(e) => setCourseEditing((prev) => ({ ...prev, nextTask: e.target.value }))}
              placeholder="Next task description"
            />
            <div className="sheet-actions">
              <button className="secondary-button danger" onClick={() => { setConfirmDelete({ type: 'course', id: courseEditing.id, name: courseEditing.name }); setCourseEditing(null); }}>Delete</button>
              <button className="primary-button" onClick={saveCourseEdit} disabled={!courseEditing.name?.trim()}>Save</button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Notebook Edit Modal ── */}
      {notebookEditing && (
        <div className="sheet-backdrop" onClick={() => setNotebookEditing(null)}>
          <aside className="sheet note-editor" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <h3>Edit Notebook</h3>
              <button className="ghost-link" onClick={() => setNotebookEditing(null)}>✕</button>
            </div>
            <input
              className="editor-title"
              value={notebookEditing.name}
              onChange={(e) => setNotebookEditing((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Notebook name"
            />
            <select value={notebookEditing.domain} onChange={(e) => setNotebookEditing((prev) => ({ ...prev, domain: e.target.value }))}>
              {domains.map((domain) => <option key={domain.key} value={domain.key}>{domain.key}</option>)}
            </select>
            <input
              value={notebookEditing.description || ''}
              onChange={(e) => setNotebookEditing((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Description"
            />
            <div className="sheet-actions">
              <button className="secondary-button danger" onClick={() => { setConfirmDelete({ type: 'notebook', id: notebookEditing.id, name: notebookEditing.name }); setNotebookEditing(null); }}>Delete</button>
              <button className="primary-button" onClick={saveNotebookEdit} disabled={!notebookEditing.name?.trim()}>Save</button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ── */}
      {confirmDelete && (
        <div className="sheet-backdrop confirm-backdrop" onClick={() => setConfirmDelete(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete <strong>{confirmDelete.name}</strong>?</p>
            <p className="mono-caption">This action cannot be undone.</p>
            <div className="sheet-actions">
              <button className="secondary-button" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="primary-button danger-btn" onClick={executeConfirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Learn;
