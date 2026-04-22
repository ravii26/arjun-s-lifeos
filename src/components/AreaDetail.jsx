import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/design-system.css';
import './AreaDetail.css';

const AREAS = {
  career: { label: 'Career', color: 'var(--blue)' },
  health: { label: 'Health', color: 'var(--teal)' },
  mind: { label: 'Mind', color: 'var(--purple)' },
  finance: { label: 'Finance', color: 'var(--accent)' },
  relationships: { label: 'Relationships', color: 'var(--pink)' },
  creative: { label: 'Creative', color: 'var(--orange)' },
};

const SECTIONS = [
  { key: 'tasks', label: 'Tasks' },
  { key: 'habits', label: 'Habits' },
  { key: 'notes', label: 'Notes' },
  { key: 'resources', label: 'Resources' },
  { key: 'vault', label: 'Vault' },
];

const makeSeed = (prefix) => ({
  tasks: [{ id: 1, title: `${prefix} weekly priority`, priority: 'P1', status: 'Open' }],
  habits: [{ id: 1, name: `${prefix} daily ritual`, target: '1/day', streak: 3, active: true }],
  notes: [{ id: 1, title: `${prefix} insights`, content: `Capture what is improving in ${prefix}.` }],
  resources: [{ id: 1, title: `${prefix} reference`, type: 'Article', url: 'https://example.com' }],
  vault: [{ id: 1, title: `${prefix} anchor`, type: 'Quote', content: 'Consistent action beats intensity.' }],
});

const INITIAL_DATA = {
  career: makeSeed('Career'),
  health: makeSeed('Health'),
  mind: makeSeed('Mind'),
  finance: makeSeed('Finance'),
  relationships: makeSeed('Relationships'),
  creative: makeSeed('Creative'),
};

const STORAGE_KEY = 'lifeos.area-detail-data.v1';

const EMPTY_BY_SECTION = {
  tasks: { title: '', priority: 'P2', status: 'Open' },
  habits: { name: '', target: '1/day', streak: 0, active: true },
  notes: { title: '', content: '' },
  resources: { title: '', type: 'Article', url: '' },
  vault: { title: '', type: 'Note', content: '' },
};

const nextId = (items) => (items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1);

const loadStoredData = () => {
  if (typeof window === 'undefined') return INITIAL_DATA;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_DATA;

    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_DATA,
      ...parsed,
    };
  } catch {
    return INITIAL_DATA;
  }
};

const AreaDetail = () => {
  const { areaKey = '' } = useParams();
  const navigate = useNavigate();

  const area = AREAS[areaKey];

  const [activeSection, setActiveSection] = useState('tasks');
  const [dataByArea, setDataByArea] = useState(loadStoredData);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(EMPTY_BY_SECTION.tasks);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dataByArea));
  }, [dataByArea]);

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

  const sectionItems = dataByArea[areaKey][activeSection];

  const resetDraft = (sectionKey) => {
    setEditingId(null);
    setDraft(EMPTY_BY_SECTION[sectionKey]);
  };

  const changeSection = (sectionKey) => {
    setActiveSection(sectionKey);
    resetDraft(sectionKey);
  };

  const updateDraft = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const saveCurrent = () => {
    setDataByArea((prev) => {
      const current = prev[areaKey][activeSection];

      if (editingId) {
        const updated = current.map((item) => (item.id === editingId ? { ...item, ...draft } : item));
        return { ...prev, [areaKey]: { ...prev[areaKey], [activeSection]: updated } };
      }

      const created = [...current, { id: nextId(current), ...draft }];
      return { ...prev, [areaKey]: { ...prev[areaKey], [activeSection]: created } };
    });

    resetDraft(activeSection);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setDraft({ ...item });
  };

  const removeItem = (id) => {
    setDataByArea((prev) => {
      const updated = prev[areaKey][activeSection].filter((item) => item.id !== id);
      return { ...prev, [areaKey]: { ...prev[areaKey], [activeSection]: updated } };
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
          <input value={draft.title || ''} onChange={(e) => updateDraft('title', e.target.value)} placeholder="Task title" />
          <select value={draft.priority || 'P2'} onChange={(e) => updateDraft('priority', e.target.value)}>
            <option>P1</option>
            <option>P2</option>
            <option>P3</option>
          </select>
          <select value={draft.status || 'Open'} onChange={(e) => updateDraft('status', e.target.value)}>
            <option>Open</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>
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
                    <span>{JSON.stringify(item)}</span>
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