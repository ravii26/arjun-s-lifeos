import React, { useMemo, useState } from 'react';
import '../styles/design-system.css';
import './Learn.css';

const AREA_COLORS = {
  coding: 'var(--blue)',
  health: 'var(--teal)',
  finance: 'var(--accent)',
};

const TABS = ['Active Learning', 'Topics', 'Notes', 'Resources'];

const initialCourses = [
  {
    id: 1,
    name: 'Advanced React Systems',
    source: 'YouTube',
    area: 'coding',
    status: 'Active',
    progress: 33,
    lesson: 8,
    totalLessons: 24,
    nextTask: 'Build custom hook architecture doc',
    eta: '~6 days at current pace',
  },
  {
    id: 2,
    name: 'Metabolic Flexibility Blueprint',
    source: 'Book',
    area: 'health',
    status: 'Paused',
    progress: 48,
    lesson: 5,
    totalLessons: 10,
    nextTask: '',
    eta: '~4 days at current pace',
  },
  {
    id: 3,
    name: 'Practical Value Investing',
    source: 'Course',
    area: 'finance',
    status: 'Completed',
    progress: 100,
    lesson: 14,
    totalLessons: 14,
    nextTask: 'Review portfolio checklist weekly',
    eta: 'Completed',
  },
];

const initialTopics = [
  {
    id: 1,
    name: 'State Management Patterns',
    area: 'coding',
    skill: 72,
    notes: ['Redux slice boundary map', 'Context anti-patterns', 'Memoization strategy'],
    courses: ['Advanced React Systems'],
    related: ['Rendering Pipeline', 'Performance Budget'],
    linkedCount: '6 notes · 2 courses',
    lastStudied: '3 days ago',
  },
  {
    id: 2,
    name: 'VO2 Max Conditioning',
    area: 'health',
    skill: 46,
    notes: ['Zone 2 weekly template', 'Interval ramp protocol'],
    courses: ['Metabolic Flexibility Blueprint'],
    related: ['Sleep Recovery', 'Cardiac Load'],
    linkedCount: '4 notes · 1 course',
    lastStudied: '1 day ago',
  },
  {
    id: 3,
    name: 'Asset Allocation Discipline',
    area: 'finance',
    skill: 61,
    notes: ['Rebalancing guardrails', 'Risk bucket framework'],
    courses: ['Practical Value Investing'],
    related: ['Cashflow Forecasting', 'Tax Efficiency'],
    linkedCount: '5 notes · 1 course',
    lastStudied: '5 days ago',
  },
];

const initialNotes = [
  {
    id: 1,
    title: 'Reducer Design for Large React Apps',
    content: 'Keep reducers event-driven and domain-scoped. Avoid giant global reducers that hide ownership.',
    type: 'Concept',
    topic: 'State Management Patterns',
    area: 'coding',
    source: 'Advanced React Systems',
    date: '2026-04-20',
  },
  {
    id: 2,
    title: 'Interval Block Structure',
    content: 'Use 4 x 4 min hard efforts with strict recovery windows. Keep weekly load measurable.',
    type: 'Insight',
    topic: 'VO2 Max Conditioning',
    area: 'health',
    source: 'Metabolic Flexibility Blueprint',
    date: '2026-04-19',
  },
  {
    id: 3,
    title: 'Three-Bucket Portfolio Logic',
    content: 'Assign assets to growth, stability, and liquidity buckets. Rebalance on drift, not emotion.',
    type: 'Summary',
    topic: 'Asset Allocation Discipline',
    area: 'finance',
    source: 'Practical Value Investing',
    date: '2026-04-18',
  },
];

const initialResources = [
  {
    id: 1,
    title: 'React Compiler Deep Dive',
    url: 'https://example.dev/react-compiler',
    type: 'Article',
    area: 'coding',
    addedAt: '2026-04-20T08:00:00.000Z',
    state: 'Pending',
  },
  {
    id: 2,
    title: 'Sleep Debt and Performance',
    url: 'https://example.health/sleep-debt',
    type: 'Video',
    area: 'health',
    addedAt: '2026-04-13T09:00:00.000Z',
    state: 'Pending',
  },
  {
    id: 3,
    title: 'Weekly Review: Portfolio Journal Prompt',
    url: '',
    type: 'Idea',
    area: 'finance',
    addedAt: '2026-04-17T20:00:00.000Z',
    state: 'Processed',
  },
];

const calcAgeHours = (isoDate) => {
  const now = Date.now();
  const target = new Date(isoDate).getTime();
  return Math.max(1, Math.floor((now - target) / (1000 * 60 * 60)));
};

const skillLabel = (value) => {
  if (value <= 33) return { text: 'Beginner', color: 'var(--red)' };
  if (value <= 66) return { text: 'Intermediate', color: 'var(--orange)' };
  return { text: 'Advanced', color: 'var(--teal)' };
};

const Learn = () => {
  const [activeTab, setActiveTab] = useState('Active Learning');

  const [courses, setCourses] = useState(initialCourses);
  const [topics] = useState(initialTopics);
  const [notes, setNotes] = useState(initialNotes);
  const [resources, setResources] = useState(initialResources);

  const [showCourseForm, setShowCourseForm] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [noteEditing, setNoteEditing] = useState(null);

  const [topicSearch, setTopicSearch] = useState('');
  const [topicArea, setTopicArea] = useState('all');

  const [noteSearch, setNoteSearch] = useState('');
  const [noteFilterTopic, setNoteFilterTopic] = useState('all');
  const [noteFilterArea, setNoteFilterArea] = useState('all');
  const [noteSort, setNoteSort] = useState('Recent');

  const [resourceFilter, setResourceFilter] = useState('Pending');
  const [resourceInput, setResourceInput] = useState('');

  const [newCourse, setNewCourse] = useState({ title: '', source: 'YouTube', url: '', area: 'coding', totalUnits: '' });

  const activeCourse = courses.find((course) => course.status === 'Active') || courses[0];

  const pendingResources = resources.filter((resource) => resource.state === 'Pending');

  const filteredTopics = topics.filter((topic) => {
    const matchesArea = topicArea === 'all' || topic.area === topicArea;
    const matchesSearch = topic.name.toLowerCase().includes(topicSearch.toLowerCase());
    return matchesArea && matchesSearch;
  });

  const filteredNotes = useMemo(() => {
    let next = [...notes].filter((note) => {
      const matchesSearch = `${note.title} ${note.content}`.toLowerCase().includes(noteSearch.toLowerCase());
      const matchesTopic = noteFilterTopic === 'all' || note.topic === noteFilterTopic;
      const matchesArea = noteFilterArea === 'all' || note.area === noteFilterArea;
      return matchesSearch && matchesTopic && matchesArea;
    });

    if (noteSort === 'Recent') {
      next.sort((a, b) => (a.date < b.date ? 1 : -1));
    }
    if (noteSort === 'Topic') {
      next.sort((a, b) => a.topic.localeCompare(b.topic));
    }
    if (noteSort === 'Area') {
      next.sort((a, b) => a.area.localeCompare(b.area));
    }

    return next;
  }, [notes, noteSearch, noteFilterTopic, noteFilterArea, noteSort]);

  const filteredResources = resources.filter((resource) => resource.state === resourceFilter);

  const stats = {
    studyTime: '9h 40m',
    notesCreated: notes.length,
    topicsReviewed: 4,
    coursesActive: courses.filter((course) => course.status === 'Active').length,
  };

  const createCourse = (event) => {
    event.preventDefault();
    if (!newCourse.title.trim()) return;

    const total = Number(newCourse.totalUnits || 12);
    const next = {
      id: Date.now(),
      name: newCourse.title,
      source: newCourse.source,
      area: newCourse.area,
      status: 'Paused',
      progress: 0,
      lesson: 0,
      totalLessons: total,
      nextTask: '',
      eta: '~2 weeks at current pace',
    };

    setCourses((prev) => [...prev, next]);
    setNewCourse({ title: '', source: 'YouTube', url: '', area: 'coding', totalUnits: '' });
    setShowCourseForm(false);
  };

  const saveNote = () => {
    if (!noteEditing || !noteEditing.title.trim()) return;

    setNotes((prev) => {
      const exists = prev.some((note) => note.id === noteEditing.id);
      if (exists) {
        return prev.map((note) => (note.id === noteEditing.id ? noteEditing : note));
      }
      return [{ ...noteEditing, id: Date.now(), date: new Date().toISOString().slice(0, 10) }, ...prev];
    });

    setNoteEditing(null);
  };

  const addResource = (event) => {
    event.preventDefault();
    if (!resourceInput.trim()) return;

    const isUrl = resourceInput.startsWith('http');

    setResources((prev) => [
      {
        id: Date.now(),
        title: isUrl ? 'Detected resource title' : resourceInput,
        url: isUrl ? resourceInput : '',
        type: isUrl ? 'Article' : 'Idea',
        area: 'coding',
        addedAt: new Date().toISOString(),
        state: 'Pending',
      },
      ...prev,
    ]);

    setResourceInput('');
  };

  const renderActiveLearning = () => (
    <div className="learn-tab-content">
      <div className="active-course-hero">
        <div className="course-thumb" style={{ background: `linear-gradient(140deg, ${AREA_COLORS[activeCourse.area]}, #ffffff15)` }} />
        <div className="course-main">
          <div className="hero-top-line">
            <h3>{activeCourse.name}</h3>
            <div className="hero-tags">
              <span className="chip-chip">{activeCourse.source}</span>
              <span className="chip-chip" style={{ borderColor: AREA_COLORS[activeCourse.area] }}>{activeCourse.area}</span>
            </div>
          </div>
          <div className="progress-wrap">
            <div className="progress-track">
              <div style={{ width: `${activeCourse.progress}%`, background: AREA_COLORS[activeCourse.area] }} />
            </div>
            <div className="mono-caption">
              Lesson {activeCourse.lesson} of {activeCourse.totalLessons} · {activeCourse.progress}% complete
            </div>
            <div className="mono-caption">Estimated completion: {activeCourse.eta}</div>
          </div>
          <div className="next-action-row">
            <span>What you&apos;ll do next:</span>
            {activeCourse.nextTask ? (
              <button className="ghost-link">{activeCourse.nextTask}</button>
            ) : (
              <button className="ghost-link">Generate tasks</button>
            )}
          </div>
        </div>
        <button className="primary-button">Continue</button>
      </div>

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
            <option value="coding">coding</option>
            <option value="health">health</option>
            <option value="finance">finance</option>
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
        {courses.filter((course) => course.id !== activeCourse.id).map((course) => (
          <article className="course-item" key={course.id}>
            <div>
              <h5>{course.name}</h5>
              <p>{course.source} · {course.area}</p>
            </div>
            <div className="course-item-right">
              <span className={`status-badge ${course.status.toLowerCase()}`}>{course.status}</span>
              <span className="mono-caption">{course.progress}%</span>
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
          {['all', 'coding', 'health', 'finance'].map((area) => (
            <button
              key={area}
              className={`pill ${topicArea === area ? 'active' : ''}`}
              onClick={() => setTopicArea(area)}
              style={{ borderColor: area === 'all' ? 'var(--border-strong)' : AREA_COLORS[area] }}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      <div className="topic-grid">
        {filteredTopics.map((topic) => {
          const level = skillLabel(topic.skill);
          return (
            <article key={topic.id} className="topic-card" style={{ borderLeftColor: AREA_COLORS[topic.area] }}>
              <h4>{topic.name}</h4>
              <div className="skill-wrap">
                <div className="skill-track">
                  <div style={{ width: `${topic.skill}%`, background: level.color }} />
                </div>
                <span style={{ color: level.color }}>{level.text}</span>
              </div>
              <p className="mono-caption">{topic.linkedCount}</p>
              <p className="mono-caption">Last studied: {topic.lastStudied}</p>
              <button className="ghost-link" onClick={() => setSelectedTopic(topic)}>Open Topic</button>
            </article>
          );
        })}
      </div>

      {selectedTopic && (
        <div className="sheet-backdrop" onClick={() => setSelectedTopic(null)}>
          <aside className="sheet" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-header">
              <h3>{selectedTopic.name}</h3>
              <button className="ghost-link" onClick={() => setSelectedTopic(null)}>✕</button>
            </div>
            <p className="mono-caption">{selectedTopic.area} · {skillLabel(selectedTopic.skill).text}</p>
            <section>
              <h5>Linked Notes</h5>
              {selectedTopic.notes.map((note) => <button key={note} className="ghost-link left">{note}</button>)}
            </section>
            <section>
              <h5>Linked Courses</h5>
              {selectedTopic.courses.map((course) => <button key={course} className="ghost-link left">{course}</button>)}
            </section>
            <section>
              <h5>Related Topics</h5>
              <div className="chip-row">
                {selectedTopic.related.map((related) => <span key={related} className="chip-chip">{related}</span>)}
              </div>
            </section>
            <div className="sheet-actions">
              <button className="primary-button">Practice this topic</button>
              <button
                className="secondary-button"
                onClick={() => {
                  setNoteEditing({
                    id: null,
                    title: `${selectedTopic.name} note`,
                    content: '',
                    type: 'Concept',
                    topic: selectedTopic.name,
                    area: selectedTopic.area,
                    source: selectedTopic.courses[0] || '',
                    date: new Date().toISOString().slice(0, 10),
                  });
                  setSelectedTopic(null);
                  setActiveTab('Notes');
                }}
              >
                Add note
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );

  const renderNotes = () => (
    <div className="learn-tab-content">
      <div className="filters-row notes-filters">
        <input placeholder="Search notes" value={noteSearch} onChange={(e) => setNoteSearch(e.target.value)} />
        <select value={noteFilterTopic} onChange={(e) => setNoteFilterTopic(e.target.value)}>
          <option value="all">All topics</option>
          {topics.map((topic) => <option key={topic.id} value={topic.name}>{topic.name}</option>)}
        </select>
        <select value={noteFilterArea} onChange={(e) => setNoteFilterArea(e.target.value)}>
          <option value="all">All areas</option>
          <option value="coding">coding</option>
          <option value="health">health</option>
          <option value="finance">finance</option>
        </select>
        <select value={noteSort} onChange={(e) => setNoteSort(e.target.value)}>
          <option>Recent</option>
          <option>Topic</option>
          <option>Area</option>
        </select>
        <button
          className="secondary-button"
          onClick={() => {
            setNoteEditing({ id: null, title: '', content: '', type: 'Concept', topic: '', area: 'coding', source: '', date: '' });
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
            <div className="note-meta">
              <span className="chip-chip">{note.type}</span>
              <span className="chip-chip" style={{ borderColor: AREA_COLORS[note.area] }}>{note.topic}</span>
            </div>
            <div className="mono-caption">From: {note.source || 'Direct note'}</div>
            <div className="mono-caption">{note.date}</div>
          </article>
        ))}
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
            <select value={noteEditing.topic} onChange={(e) => setNoteEditing((prev) => ({ ...prev, topic: e.target.value }))}>
              <option value="">Select topic</option>
              {topics.map((topic) => <option key={topic.id}>{topic.name}</option>)}
            </select>
            <select value={noteEditing.source || ''} onChange={(e) => setNoteEditing((prev) => ({ ...prev, source: e.target.value }))}>
              <option value="">Link source (optional)</option>
              {courses.map((course) => <option key={course.id}>{course.name}</option>)}
            </select>
            <div className="sheet-actions">
              <button className="secondary-button">Convert to Task</button>
              <button className="secondary-button">Share</button>
              <button className="secondary-button danger" onClick={() => setNoteEditing(null)}>Delete</button>
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
        {['Pending', 'Processed', 'Ignored'].map((state) => (
          <button key={state} className={`pill ${resourceFilter === state ? 'active' : ''}`} onClick={() => setResourceFilter(state)}>
            {state}
          </button>
        ))}
      </div>

      <form className="quick-add" onSubmit={addResource}>
        <input
          placeholder="Paste URL or type an idea"
          value={resourceInput}
          onChange={(e) => setResourceInput(e.target.value)}
        />
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
                  <span className="chip-chip" style={{ borderColor: AREA_COLORS[resource.area] }}>{resource.area}</span>
                  <span className="mono-caption">{Math.floor(ageHours / 24)} days ago</span>
                </div>
              </div>
              <div className="resource-actions">
                <button className="secondary-button">Convert</button>
                <button
                  className="secondary-button"
                  onClick={() => setResources((prev) => prev.map((item) => (item.id === resource.id ? { ...item, state: 'Ignored' } : item)))}
                >
                  Mark ignored
                </button>
                <button className="secondary-button" onClick={() => window.open(resource.url || '#', '_blank')}>Open URL</button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="learn-screen">
      <div className="learn-tabs">
        {TABS.map((tab) => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Active Learning' && renderActiveLearning()}
      {activeTab === 'Topics' && renderTopics()}
      {activeTab === 'Notes' && renderNotes()}
      {activeTab === 'Resources' && renderResources()}
    </div>
  );
};

export default Learn;
