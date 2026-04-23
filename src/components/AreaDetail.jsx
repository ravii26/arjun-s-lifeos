import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/design-system.css';
import './AreaDetail.css';
import { AREA_META, loadAreasStore, saveAreasStore } from '../lib/areasStore';
import { areaKeyFromDomain, loadLearningGraphStore } from '../lib/learningGraphStore';

const SECTIONS = [
  { key: 'tasks', label: 'Tasks' },
  { key: 'habits', label: 'Habits' },
  { key: 'notes', label: 'Notes' },
  { key: 'resources', label: 'Resources' },
  { key: 'vault', label: 'Vault' },
];

const EMPTY_BY_SECTION = {
  tasks: { title: '', priority: 'P2', status: 'Open', estimate: '30m', notes: '' },
  habits: { name: '', target: '1/day', streak: 0, active: true },
  notes: { title: '', content: '' },
  resources: { title: '', type: 'Article', url: '' },
  vault: { title: '', type: 'Note', content: '' },
};

const nextId = (items) => (items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1);

const AreaDetail = () => {
  const { areaKey = '' } = useParams();
  const navigate = useNavigate();

  const area = AREA_META[areaKey];

  const [activeSection, setActiveSection] = useState('tasks');
  const [areasStore, setAreasStore] = useState(loadAreasStore);
  const [learningStore, setLearningStore] = useState(loadLearningGraphStore);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(EMPTY_BY_SECTION.tasks);
  const [taskErrors, setTaskErrors] = useState({});

  useEffect(() => {
    saveAreasStore(areasStore);
  }, [areasStore]);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === 'lifeos.learning-graph.v1') {
        setLearningStore(loadLearningGraphStore());
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (!area) {
    return (
      <div className="area-detail-screen">
        <div className="area-detail-head">
          <h1>Area Not Found</h1>
          <button className="area-btn" onClick={() => navigate('/areas')}>Back to Areas</button>
        </div>
      </div>
    );
  }

  const detailByArea = areasStore.detailByArea || {};
  const sectionItems = detailByArea[areaKey]?.[activeSection] || [];

  const learnByArea = useMemo(() => {
    const toArea = (entry) => entry.areaKey || areaKeyFromDomain(entry.domain);

    const topics = (learningStore.topics || []).filter((entry) => toArea(entry) === areaKey);
    const courses = (learningStore.courses || []).filter((entry) => toArea(entry) === areaKey);
    const resources = (learningStore.resources || []).filter((entry) => toArea(entry) === areaKey);
    const notes = (learningStore.notes || []).filter((entry) => toArea(entry) === areaKey);
    const notebooks = (learningStore.notebooks || []).filter((entry) => toArea(entry) === areaKey);

    return { topics, courses, resources, notes, notebooks };
  }, [learningStore, areaKey]);

  const resetDraft = (sectionKey) => {
    setEditingId(null);
    setDraft(EMPTY_BY_SECTION[sectionKey]);
    if (sectionKey === 'tasks') setTaskErrors({});
  };

  const changeSection = (sectionKey) => {
    setActiveSection(sectionKey);
    resetDraft(sectionKey);
  };

  const updateDraft = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    if (activeSection === 'tasks') {
      setTaskErrors((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validateTaskDraft = () => {
    const errors = {};

    if (!draft.title?.trim()) {
      errors.title = 'Task title is required.';
    }

    if (draft.title && draft.title.trim().length < 3) {
      errors.title = 'Task title should be at least 3 characters.';
    }

    if (draft.notes && draft.notes.length > 220) {
      errors.notes = 'Notes should be under 220 characters.';
    }

    setTaskErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveCurrent = () => {
    if (activeSection === 'tasks' && !validateTaskDraft()) return;

    setAreasStore((prev) => {
      const current = prev.detailByArea[areaKey][activeSection];

      if (editingId) {
        const updated = current.map((item) => (item.id === editingId ? { ...item, ...draft } : item));
        return {
          ...prev,
          detailByArea: {
            ...prev.detailByArea,
            [areaKey]: {
              ...prev.detailByArea[areaKey],
              [activeSection]: updated,
            },
          },
        };
      }

      const created = [...current, { id: nextId(current), ...draft }];
      return {
        ...prev,
        detailByArea: {
          ...prev.detailByArea,
          [areaKey]: {
            ...prev.detailByArea[areaKey],
            [activeSection]: created,
          },
        },
      };
    });

    resetDraft(activeSection);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setDraft({ ...item });
  };

  const removeItem = (id) => {
    setAreasStore((prev) => {
      const updated = prev.detailByArea[areaKey][activeSection].filter((item) => item.id !== id);
      return {
        ...prev,
        detailByArea: {
          ...prev.detailByArea,
          [areaKey]: {
            ...prev.detailByArea[areaKey],
            [activeSection]: updated,
          },
        },
      };
    });
    if (editingId === id) resetDraft(activeSection);
  };

  const isDraftValid = useMemo(() => {
    if (activeSection === 'tasks') return Boolean(draft.title?.trim());
    if (activeSection === 'habits') return Boolean(draft.name?.trim());
    if (activeSection === 'notes') return Boolean(draft.title?.trim()) && Boolean(draft.content?.trim());
    if (activeSection === 'resources') return Boolean(draft.title?.trim());
    return Boolean(draft.title?.trim()) && Boolean(draft.content?.trim());
  }, [activeSection, draft]);

  const renderForm = () => {
    if (activeSection === 'tasks') {
      return (
        <>
          <label className="field-label">Title</label>
          <input value={draft.title || ''} onChange={(e) => updateDraft('title', e.target.value)} placeholder="Task title" />
          {taskErrors.title && <p className="field-error">{taskErrors.title}</p>}

          <label className="field-label">Priority</label>
          <select value={draft.priority || 'P2'} onChange={(e) => updateDraft('priority', e.target.value)}>
            <option>P1</option>
            <option>P2</option>
            <option>P3</option>
          </select>

          <label className="field-label">Status</label>
          <select value={draft.status || 'Open'} onChange={(e) => updateDraft('status', e.target.value)}>
            <option>Open</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>

          <label className="field-label">Estimate</label>
          <select value={draft.estimate || '30m'} onChange={(e) => updateDraft('estimate', e.target.value)}>
            <option>15m</option>
            <option>30m</option>
            <option>1h</option>
            <option>2h</option>
          </select>

          <label className="field-label">Notes (optional)</label>
          <textarea rows={3} value={draft.notes || ''} onChange={(e) => updateDraft('notes', e.target.value)} placeholder="Execution notes" />
          {taskErrors.notes && <p className="field-error">{taskErrors.notes}</p>}
        </>
      );
    }

    if (activeSection === 'habits') {
      return (
        <>
          <input value={draft.name || ''} onChange={(e) => updateDraft('name', e.target.value)} placeholder="Habit name" />
          <input value={draft.target || ''} onChange={(e) => updateDraft('target', e.target.value)} placeholder="Target" />
          <input
            type="number"
            value={draft.streak ?? 0}
            onChange={(e) => updateDraft('streak', Number(e.target.value) || 0)}
            placeholder="Streak"
          />
          <label className="inline-switch">
            <input type="checkbox" checked={!!draft.active} onChange={(e) => updateDraft('active', e.target.checked)} />
            Active
          </label>
        </>
      );
    }

    if (activeSection === 'notes') {
      return (
        <>
          <input value={draft.title || ''} onChange={(e) => updateDraft('title', e.target.value)} placeholder="Note title" />
          <textarea rows={4} value={draft.content || ''} onChange={(e) => updateDraft('content', e.target.value)} placeholder="Note content" />
        </>
      );
    }

    if (activeSection === 'resources') {
      return (
        <>
          <input value={draft.title || ''} onChange={(e) => updateDraft('title', e.target.value)} placeholder="Resource title" />
          <select value={draft.type || 'Article'} onChange={(e) => updateDraft('type', e.target.value)}>
            <option>Article</option>
            <option>Video</option>
            <option>Tool</option>
            <option>Idea</option>
          </select>
          <input value={draft.url || ''} onChange={(e) => updateDraft('url', e.target.value)} placeholder="URL (optional)" />
        </>
      );
    }

    return (
      <>
        <input value={draft.title || ''} onChange={(e) => updateDraft('title', e.target.value)} placeholder="Vault title" />
        <select value={draft.type || 'Note'} onChange={(e) => updateDraft('type', e.target.value)}>
          <option>Note</option>
          <option>Quote</option>
          <option>Memory</option>
        </select>
        <textarea rows={4} value={draft.content || ''} onChange={(e) => updateDraft('content', e.target.value)} placeholder="Vault content" />
      </>
    );
  };

  return (
    <div className="area-detail-screen">
      <header className="area-detail-head">
        <div>
          <button className="area-btn ghost" onClick={() => navigate('/areas')}>Back to Areas</button>
          <h1 style={{ color: area.color }}>{area.label} Detail</h1>
          <p>Working CRUD for all sections in this area.</p>
        </div>
      </header>

      <section className="section-tabs">
        {SECTIONS.map((section) => (
          <button
            key={section.key}
            className={`area-tab ${activeSection === section.key ? 'active' : ''}`}
            onClick={() => changeSection(section.key)}
          >
            {section.label}
          </button>
        ))}
      </section>

      <section className="learn-link-panel">
        <header className="learn-link-head">
          <h3>Connected Learning</h3>
          <button className="area-btn ghost" onClick={() => navigate('/learn')}>Open Learn</button>
        </header>

        <div className="learn-link-grid">
          <article className="learn-link-card">
            <small>Topics</small>
            <strong>{learnByArea.topics.length}</strong>
            <span>{learnByArea.topics.slice(0, 2).map((item) => item.name).join(' • ') || 'No linked topics yet'}</span>
          </article>
          <article className="learn-link-card">
            <small>Courses</small>
            <strong>{learnByArea.courses.length}</strong>
            <span>{learnByArea.courses.slice(0, 2).map((item) => item.name).join(' • ') || 'No linked courses yet'}</span>
          </article>
          <article className="learn-link-card">
            <small>Resources</small>
            <strong>{learnByArea.resources.length}</strong>
            <span>{learnByArea.resources.slice(0, 2).map((item) => item.title).join(' • ') || 'No linked resources yet'}</span>
          </article>
          <article className="learn-link-card">
            <small>Notes</small>
            <strong>{learnByArea.notes.length}</strong>
            <span>{learnByArea.notes.slice(0, 2).map((item) => item.title).join(' • ') || 'No linked notes yet'}</span>
          </article>
          <article className="learn-link-card">
            <small>Notebooks</small>
            <strong>{learnByArea.notebooks.length}</strong>
            <span>{learnByArea.notebooks.slice(0, 2).map((item) => item.name).join(' • ') || 'No linked notebooks yet'}</span>
          </article>
        </div>
      </section>

      <section className="crud-layout">
        <article className="crud-form-card">
          <h3>{editingId ? 'Edit item' : 'Create item'}</h3>
          <div className="form-grid">{renderForm()}</div>
          <div className="form-actions">
            <button className="area-btn" onClick={saveCurrent} disabled={!isDraftValid}>{editingId ? 'Update' : 'Create'}</button>
            <button className="area-btn ghost" onClick={() => resetDraft(activeSection)}>Reset</button>
          </div>
        </article>

        <article className="crud-list-card">
          <h3>{SECTIONS.find((section) => section.key === activeSection)?.label} List</h3>
          {sectionItems.length === 0 ? (
            <p className="empty-note">No items yet. Create your first one.</p>
          ) : (
            <div className="item-list">
              {sectionItems.map((item) => (
                <div className="item-row" key={item.id}>
                  <div className="item-info">
                    <strong>{item.title || item.name}</strong>
                    {activeSection === 'tasks' ? (
                      <>
                        <div className="task-meta-row">
                          <span className={`task-chip ${String(item.priority || 'P2').toLowerCase()}`}>{item.priority || 'P2'}</span>
                          <span className="task-chip muted">{item.status || 'Open'}</span>
                          <span className="task-chip muted">{item.estimate || '30m'}</span>
                        </div>
                        {item.notes ? <span className="task-notes">{item.notes}</span> : null}
                      </>
                    ) : (
                      <span>{JSON.stringify(item)}</span>
                    )}
                  </div>
                  <div className="row-actions">
                    <button className="area-btn ghost" onClick={() => startEdit(item)}>Edit</button>
                    <button className="area-btn danger" onClick={() => removeItem(item.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
};

export default AreaDetail;