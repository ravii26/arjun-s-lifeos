import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import '../styles/design-system.css';
import './Learn.css';
import './LearnDetail.css';
import { areaKeyFromDomain, loadLearningGraphStore } from '../lib/learningGraphStore';
import { AREA_META } from '../lib/areasStore';

const ENTITY_LABEL = {
  topics: 'Topic',
  courses: 'Course',
  notebooks: 'Notebook',
  notes: 'Note',
  resources: 'Resource',
};

const listForType = (store, type) => {
  if (type === 'topics') return store.topics || [];
  if (type === 'courses') return store.courses || [];
  if (type === 'notebooks') return store.notebooks || [];
  if (type === 'notes') return store.notes || [];
  if (type === 'resources') return store.resources || [];
  return [];
};

const titleForEntity = (type, entity) => {
  if (!entity) return '';
  if (type === 'topics') return entity.name;
  if (type === 'courses') return entity.name;
  if (type === 'notebooks') return entity.name;
  if (type === 'notes') return entity.title;
  if (type === 'resources') return entity.title;
  return '';
};

const LearnDetail = () => {
  const { entityType = '', entityId = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [store, setStore] = useState(loadLearningGraphStore);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === 'lifeos.learning-graph.v1') {
        setStore(loadLearningGraphStore());
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const id = Number(entityId);

  const entity = useMemo(() => {
    const list = listForType(store, entityType);
    return list.find((item) => Number(item.id) === id) || null;
  }, [store, entityType, id]);

  const topicMap = useMemo(() => {
    const map = new Map();
    (store.topics || []).forEach((item) => map.set(item.id, item));
    return map;
  }, [store.topics]);

  const courseMap = useMemo(() => {
    const map = new Map();
    (store.courses || []).forEach((item) => map.set(item.id, item));
    return map;
  }, [store.courses]);

  const notebookMap = useMemo(() => {
    const map = new Map();
    (store.notebooks || []).forEach((item) => map.set(item.id, item));
    return map;
  }, [store.notebooks]);

  const resourceMap = useMemo(() => {
    const map = new Map();
    (store.resources || []).forEach((item) => map.set(item.id, item));
    return map;
  }, [store.resources]);

  const getAreaChip = () => {
    const domain = entity?.domain;
    if (!domain) return null;
    const areaKey = entity.areaKey || areaKeyFromDomain(domain);
    const area = AREA_META[areaKey];
    return {
      label: area?.label || areaKey,
      color: area?.color || 'var(--border-strong)',
    };
  };

  const areaChip = getAreaChip();

  const related = useMemo(() => {
    if (!entity) {
      return { topics: [], courses: [], notebooks: [], notes: [], resources: [] };
    }

    if (entityType === 'topics') {
      return {
        topics: [],
        courses: (store.courses || []).filter((course) => (course.topicIds || []).includes(entity.id)),
        notebooks: [],
        notes: (store.notes || []).filter((note) => note.topicId === entity.id),
        resources: (store.resources || []).filter((resource) => resource.topicId === entity.id),
      };
    }

    if (entityType === 'courses') {
      return {
        topics: (entity.topicIds || []).map((topicId) => topicMap.get(topicId)).filter(Boolean),
        courses: [],
        notebooks: [],
        notes: (store.notes || []).filter((note) => note.courseId === entity.id),
        resources: (store.resources || []).filter((resource) => resource.courseId === entity.id),
      };
    }

    if (entityType === 'notebooks') {
      const notes = (store.notes || []).filter((note) => note.notebookId === entity.id);
      const topicIds = Array.from(new Set(notes.map((note) => note.topicId).filter(Boolean)));
      const courseIds = Array.from(new Set(notes.map((note) => note.courseId).filter(Boolean)));
      const resourceIds = Array.from(new Set(notes.map((note) => note.resourceId).filter(Boolean)));

      return {
        topics: topicIds.map((topicId) => topicMap.get(topicId)).filter(Boolean),
        courses: courseIds.map((courseId) => courseMap.get(courseId)).filter(Boolean),
        notebooks: [],
        notes,
        resources: resourceIds.map((resourceId) => resourceMap.get(resourceId)).filter(Boolean),
      };
    }

    if (entityType === 'notes') {
      const topic = entity.topicId ? topicMap.get(entity.topicId) : null;
      const course = entity.courseId ? courseMap.get(entity.courseId) : null;
      const notebook = entity.notebookId ? notebookMap.get(entity.notebookId) : null;
      const resource = entity.resourceId ? resourceMap.get(entity.resourceId) : null;

      return {
        topics: topic ? [topic] : [],
        courses: course ? [course] : [],
        notebooks: notebook ? [notebook] : [],
        notes: [],
        resources: resource ? [resource] : [],
      };
    }

    if (entityType === 'resources') {
      const topic = entity.topicId ? topicMap.get(entity.topicId) : null;
      const course = entity.courseId ? courseMap.get(entity.courseId) : null;

      return {
        topics: topic ? [topic] : [],
        courses: course ? [course] : [],
        notebooks: [],
        notes: (store.notes || []).filter((note) => note.resourceId === entity.id),
        resources: [],
      };
    }

    return { topics: [], courses: [], notebooks: [], notes: [], resources: [] };
  }, [entity, entityType, store, topicMap, courseMap, notebookMap, resourceMap]);

  const backTarget = location.state?.from || '/learn';

  const openLearnTab = (tab) => {
    const params = new URLSearchParams();
    params.set('tab', tab);

    if (entity?.domain) {
      params.set('area', entity.areaKey || areaKeyFromDomain(entity.domain));
    }

    navigate(`/learn?${params.toString()}`);
  };

  const openEntity = (type, value) => {
    navigate(`/learn/${type}/${value.id}`, { state: { from: backTarget } });
  };

  const renderEntitySummary = () => {
    if (!entity) return null;

    if (entityType === 'topics') {
      return (
        <>
          <p className="learn-detail-body">Skill: <strong>{entity.skill || 0}%</strong> · Last studied: <strong>{entity.lastStudied || 'never'}</strong></p>
          <div className="chip-row">
            <span className="chip-chip">{related.notes.length} notes</span>
            <span className="chip-chip">{related.courses.length} courses</span>
            <span className="chip-chip">{related.resources.length} resources</span>
          </div>
        </>
      );
    }

    if (entityType === 'courses') {
      return (
        <>
          <p className="learn-detail-body">Status: <strong>{entity.status}</strong> · Progress: <strong>{entity.progress || 0}%</strong></p>
          <p className="learn-detail-body">Lessons: <strong>{entity.lesson || 0}</strong> / <strong>{entity.totalLessons || 0}</strong></p>
          <p className="learn-detail-body">Next task: {entity.nextTask || 'No next task set'}</p>
        </>
      );
    }

    if (entityType === 'notebooks') {
      return (
        <>
          <p className="learn-detail-body">{entity.description || 'No description yet.'}</p>
          <div className="chip-row">
            <span className="chip-chip">{related.notes.length} notes</span>
            <span className="chip-chip">{related.topics.length} topics covered</span>
          </div>
        </>
      );
    }

    if (entityType === 'notes') {
      return (
        <>
          <p className="learn-detail-body">Type: <strong>{entity.type || 'Concept'}</strong> · Date: <strong>{entity.date || 'Unknown'}</strong></p>
          <p className="learn-detail-note">{entity.content || 'No content yet.'}</p>
        </>
      );
    }

    if (entityType === 'resources') {
      return (
        <>
          <p className="learn-detail-body">Type: <strong>{entity.type}</strong> · State: <strong>{entity.state}</strong></p>
          <p className="learn-detail-body">Added: <strong>{entity.addedAt ? new Date(entity.addedAt).toLocaleString() : 'Unknown'}</strong></p>
          {entity.url ? (
            <button className="secondary-button" onClick={() => window.open(entity.url, '_blank', 'noopener,noreferrer')}>Open URL</button>
          ) : (
            <p className="learn-detail-body">No URL attached to this resource.</p>
          )}
        </>
      );
    }

    return null;
  };

  const renderRelatedList = (title, type, items) => (
    <article className="learn-detail-card">
      <h3>{title}</h3>
      {!items.length ? (
        <p className="empty-state">No linked {title.toLowerCase()}.</p>
      ) : (
        <div className="learn-detail-list">
          {items.map((item) => (
            <button key={item.id} className="ghost-link left learn-detail-link" onClick={() => openEntity(type, item)}>
              {titleForEntity(type, item)}
            </button>
          ))}
        </div>
      )}
    </article>
  );

  if (!ENTITY_LABEL[entityType]) {
    return (
      <div className="learn-detail-screen">
        <div className="learn-detail-head">
          <h1>Learn Detail</h1>
          <p>Unknown detail type.</p>
          <button className="secondary-button" onClick={() => navigate('/learn')}>Back to Learn</button>
        </div>
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="learn-detail-screen">
        <div className="learn-detail-head">
          <button className="secondary-button" onClick={() => navigate(backTarget)}>Back</button>
          <h1>{ENTITY_LABEL[entityType]} Not Found</h1>
          <p>This item does not exist or may have been deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="learn-detail-screen">
      <header className="learn-detail-head">
        <button className="secondary-button" onClick={() => navigate(backTarget)}>Back to Learn</button>
        <h1>{titleForEntity(entityType, entity)}</h1>
        <div className="chip-row">
          <span className="chip-chip">{ENTITY_LABEL[entityType]}</span>
          {entity.domain ? <span className="chip-chip">{entity.domain}</span> : null}
          {areaChip ? <span className="chip-chip" style={{ borderColor: areaChip.color }}>{areaChip.label}</span> : null}
        </div>
      </header>

      <section className="learn-detail-grid">
        <article className="learn-detail-card">
          <h3>Summary</h3>
          {renderEntitySummary()}
          <div className="learn-detail-actions">
            {entityType === 'topics' && <button className="secondary-button" onClick={() => openLearnTab('Topics')}>Open in Topics</button>}
            {entityType === 'courses' && <button className="secondary-button" onClick={() => openLearnTab('Active Learning')}>Open in Active Learning</button>}
            {entityType === 'notebooks' && <button className="secondary-button" onClick={() => openLearnTab('Notebooks')}>Open in Notebooks</button>}
            {entityType === 'notes' && <button className="secondary-button" onClick={() => openLearnTab('Notes')}>Open in Notes</button>}
            {entityType === 'resources' && <button className="secondary-button" onClick={() => openLearnTab('Resources')}>Open in Resources</button>}
          </div>
        </article>

        {entityType !== 'topics' && renderRelatedList('Topics', 'topics', related.topics)}
        {entityType !== 'courses' && renderRelatedList('Courses', 'courses', related.courses)}
        {entityType !== 'notebooks' && renderRelatedList('Notebooks', 'notebooks', related.notebooks)}
        {entityType !== 'notes' && renderRelatedList('Notes', 'notes', related.notes)}
        {entityType !== 'resources' && renderRelatedList('Resources', 'resources', related.resources)}
      </section>
    </div>
  );
};

export default LearnDetail;
