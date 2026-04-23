import React, { useEffect, useMemo, useState } from 'react';
import '../styles/design-system.css';
import './Vault.css';

const AREA_COLORS = {
  coding: 'var(--blue)',
  health: 'var(--teal)',
  finance: 'var(--accent)',
};

const TAGS = ['all', 'low_motivation', 'fear', 'discipline', 'focus', 'clarity', 'confidence', 'consistency', 'burnout'];

const TYPE_ICONS = {
  Quote: '💬',
  Note: '🗒',
  Video: '🎬',
  Audio: '🎤',
  Memory: '🏆',
};

const initialItems = [
  {
    id: 1,
    type: 'Quote',
    title: 'Pressure Clarifier',
    content: 'You do not rise to your goals. You fall to your systems.',
    attribution: 'James Clear',
    area: 'coding',
    tags: ['discipline', 'consistency'],
    stateTag: 'low_motivation',
    purposeTag: 'focus',
    intensity: 'High',
    uses: 12,
    helpful: 11,
    avgRating: 4.6,
    createdAt: '2026-03-01',
  },
  {
    id: 2,
    type: 'Memory',
    title: 'First Offer Win',
    content: 'I remember when I prepared 21 days straight and landed my first remote role.',
    date: '2024-11-17',
    area: 'coding',
    tags: ['confidence', 'consistency'],
    stateTag: 'fear',
    purposeTag: 'confidence',
    intensity: 'High',
    uses: 9,
    helpful: 8,
    avgRating: 4.3,
    createdAt: '2026-02-10',
  },
  {
    id: 3,
    type: 'Note',
    title: 'Rescue Protocol',
    content: 'When overwhelmed: 1) breathe 90 seconds 2) choose one task 3) run 25-minute timer.',
    area: 'health',
    tags: ['clarity', 'discipline'],
    stateTag: 'burnout',
    purposeTag: 'clarity',
    intensity: 'Medium',
    uses: 7,
    helpful: 6,
    avgRating: 4.1,
    createdAt: '2026-03-28',
  },
  {
    id: 4,
    type: 'Video',
    title: 'Calm Nervous System Reset',
    content: '4-minute breathing reset before deep work.',
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=60',
    url: 'https://example.com/reset',
    area: 'health',
    tags: ['focus', 'clarity'],
    stateTag: 'fear',
    purposeTag: 'clarity',
    intensity: 'Low',
    uses: 4,
    helpful: 4,
    avgRating: 4.8,
    createdAt: '2026-04-02',
  },
  {
    id: 5,
    type: 'Audio',
    title: 'Future Self Voice Note',
    content: 'You have done hard things before. Start small and move now.',
    area: 'finance',
    tags: ['confidence', 'focus'],
    stateTag: 'low_motivation',
    purposeTag: 'confidence',
    intensity: 'Medium',
    uses: 3,
    helpful: 2,
    avgRating: 3.9,
    createdAt: '2026-04-05',
  },
  {
    id: 6,
    type: 'Quote',
    title: 'Compounding Reminder',
    content: 'Tiny consistent actions outgrow brilliant inconsistent efforts.',
    attribution: '',
    area: 'finance',
    tags: ['consistency', 'discipline'],
    stateTag: 'low_motivation',
    purposeTag: 'consistency',
    intensity: 'Low',
    uses: 1,
    helpful: 1,
    avgRating: 5,
    createdAt: '2026-04-20',
  },
];

const intensityClass = {
  Low: 'dot-low',
  Medium: 'dot-mid',
  High: 'dot-high',
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

const Vault = () => {
  const [items, setItems] = useState(initialItems);
  const [triggeredMode, setTriggeredMode] = useState(false);
  const [triggerIndex, setTriggerIndex] = useState(0);
  const [tagFilter, setTagFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [viewMode, setViewMode] = useState('Grid');
  const [detailItem, setDetailItem] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [insightOpen, setInsightOpen] = useState(true);

  const [createState, setCreateState] = useState({
    type: 'Note',
    title: '',
    content: '',
    attribution: '',
    url: '',
    area: 'coding',
    intensity: 'Medium',
    stateTag: 'low_motivation',
    purposeTag: 'focus',
  });

  const [quoteWordsVisible, setQuoteWordsVisible] = useState(0);

  const triggerItem = items[triggerIndex % items.length];

  useEffect(() => {
    if (!triggeredMode || triggerItem?.type !== 'Quote') {
      setQuoteWordsVisible(0);
      return;
    }

    const words = triggerItem.content.split(' ');
    let idx = 0;

    const timer = setInterval(() => {
      idx += 1;
      setQuoteWordsVisible(idx);
      if (idx >= words.length) clearInterval(timer);
    }, 30);

    return () => clearInterval(timer);
  }, [triggeredMode, triggerItem]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const tagOk = tagFilter === 'all' || item.tags.includes(tagFilter) || item.stateTag === tagFilter || item.purposeTag === tagFilter;
      const areaOk = areaFilter === 'all' || item.area === areaFilter;
      return tagOk && areaOk;
    });
  }, [items, tagFilter, areaFilter]);

  const stats = useMemo(() => {
    const total = items.length;
    const used = items.filter((item) => item.uses > 0).length;
    const totalHelpful = items.reduce((sum, item) => sum + item.helpful, 0);
    const totalUses = items.reduce((sum, item) => sum + item.uses, 0);
    const helpfulPct = totalUses ? Math.round((totalHelpful / totalUses) * 100) : 0;

    return { total, used, helpfulPct };
  }, [items]);

  const triggeredItemCount = items.filter((item) => ['low_motivation', 'fear', 'burnout'].includes(item.stateTag)).length;
  const uniqueTags = new Set(items.flatMap((item) => item.tags)).size;

  const animatedTotal = useCountUp(stats.total, 700);
  const animatedHelpfulness = useCountUp(stats.helpfulPct, 700);
  const animatedTriggered = useCountUp(triggeredItemCount, 700);
  const animatedUniqueTags = useCountUp(uniqueTags, 700);

  const topUsed = [...items].sort((a, b) => b.uses - a.uses).slice(0, 3);

  const neverUsed = items.filter((item) => item.uses === 0).length;

  const saveItem = () => {
    if (!createState.content.trim() && !createState.title.trim()) return;

    const next = {
      id: Date.now(),
      type: createState.type,
      title: createState.title || `${createState.type} entry`,
      content: createState.content,
      attribution: createState.attribution,
      url: createState.url,
      thumbnail: createState.type === 'Video' ? 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=400&q=60' : '',
      area: createState.area,
      tags: [createState.stateTag, createState.purposeTag],
      stateTag: createState.stateTag,
      purposeTag: createState.purposeTag,
      intensity: createState.intensity,
      uses: 0,
      helpful: 0,
      avgRating: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      date: new Date().toISOString().slice(0, 10),
    };

    setItems((prev) => [next, ...prev]);
    setShowCreate(false);
  };

  const renderTriggeredBody = () => {
    if (!triggerItem) return null;

    if (triggerItem.type === 'Quote') {
      const words = triggerItem.content.split(' ');
      const text = words.slice(0, quoteWordsVisible).join(' ');
      return (
        <div className="trigger-quote">
          <span className="quote-mark">“</span>
          <p>{text}</p>
          {triggerItem.attribution && <small>— {triggerItem.attribution}</small>}
        </div>
      );
    }

    if (triggerItem.type === 'Memory') {
      return (
        <div className="trigger-memory">
          <div className="memory-label">Your Past Win</div>
          <p>{triggerItem.content}</p>
          <small>{triggerItem.date}</small>
        </div>
      );
    }

    if (triggerItem.type === 'Video') {
      return (
        <div className="trigger-video">
          <img src={triggerItem.thumbnail} alt={triggerItem.title} />
          <h4>{triggerItem.title}</h4>
        </div>
      );
    }

    return (
      <div className="trigger-note">
        <h4>{triggerItem.title}</h4>
        <p>{triggerItem.content}</p>
      </div>
    );
  };

  const renderTriggerView = () => (
    <div className="vault-trigger-wrap">
      <div className="vault-trigger-card">
        <button className="trigger-close" onClick={() => setTriggeredMode(false)}>✕</button>
        <p className="trigger-reason">Career score dropped to 38 · from LifeOS</p>
        <hr />
        {renderTriggeredBody()}

        <button className="vault-primary" onClick={() => setTriggeredMode(false)}>
          Got it — Back to work
        </button>

        <div className="trigger-actions">
          <button className="vault-ghost">👍 Helpful</button>
          <button className="vault-ghost">👎 Not useful</button>
          <button className="vault-ghost" onClick={() => setTriggerIndex((prev) => (prev + 1) % items.length)}>→ Next item</button>
        </div>

        <button className="vault-ghost action-link">Take action: Add a task</button>
      </div>
    </div>
  );

  const renderItemPreview = (item) => {
    if (item.type === 'Quote') return <p className="vault-preview quote">"{item.content.slice(0, 80)}..."</p>;
    if (item.type === 'Memory') return <p className="vault-preview"><strong>Your Win:</strong> {item.content.slice(0, 72)}...</p>;
    if (item.type === 'Video') return <img className="mini-thumb" src={item.thumbnail} alt={item.title} />;
    if (item.type === 'Audio') return <p className="vault-preview">{item.content.slice(0, 84)}...</p>;
    return (
      <div className="vault-preview">
        <strong>{item.title}</strong>
        <p>{item.content.slice(0, 72)}...</p>
      </div>
    );
  };

  const openDetail = (item) => {
    setDetailItem(item);
  };

  const renderDetailSheet = () => {
    if (!detailItem) return null;

    return (
      <div className="vault-overlay" onClick={() => setDetailItem(null)}>
        <aside className="vault-sheet" onClick={(event) => event.stopPropagation()}>
          <div className="vault-sheet-head">
            <h3>{TYPE_ICONS[detailItem.type]} {detailItem.type}</h3>
            <div>
              <button className="vault-ghost">Edit</button>
              <button className="vault-ghost" onClick={() => setDetailItem(null)}>✕</button>
            </div>
          </div>

          <div className="sheet-content-block">
            {detailItem.type === 'Video' && detailItem.thumbnail && <img className="sheet-thumb" src={detailItem.thumbnail} alt={detailItem.title} />}
            {detailItem.type !== 'Video' && <h4>{detailItem.title}</h4>}
            <p>{detailItem.content}</p>
          </div>

          <div className="sheet-meta mono">
            Used {detailItem.uses} times · avg rating {detailItem.avgRating}/5
          </div>

          <div className="chip-row">
            {detailItem.tags.map((tag) => <span className="vault-chip" key={tag}>{tag}</span>)}
          </div>

          <div className="sheet-footer-actions">
            <button className="vault-primary">Practice this now</button>
          </div>
        </aside>
      </div>
    );
  };

  const renderCreateForm = () => {
    if (!showCreate) return null;

    return (
      <div className="vault-overlay" onClick={() => setShowCreate(false)}>
        <aside className="vault-sheet" onClick={(event) => event.stopPropagation()}>
          <div className="vault-sheet-head">
            <h3>Add Vault Item</h3>
            <button className="vault-ghost" onClick={() => setShowCreate(false)}>✕</button>
          </div>

          <div className="type-row">
            {['Note', 'Quote', 'Video', 'Audio', 'Memory'].map((type) => (
              <button
                key={type}
                className={`type-btn ${createState.type === type ? 'active' : ''}`}
                onClick={() => setCreateState((prev) => ({ ...prev, type }))}
              >
                {TYPE_ICONS[type]} {type}
              </button>
            ))}
          </div>

          <input
            placeholder="Title"
            value={createState.title}
            onChange={(e) => setCreateState((prev) => ({ ...prev, title: e.target.value }))}
          />

          <textarea
            rows={6}
            placeholder={createState.type === 'Memory' ? 'I remember when...' : 'Content'}
            value={createState.content}
            onChange={(e) => setCreateState((prev) => ({ ...prev, content: e.target.value }))}
          />

          {createState.type === 'Quote' && (
            <input
              placeholder="Attribution"
              value={createState.attribution}
              onChange={(e) => setCreateState((prev) => ({ ...prev, attribution: e.target.value }))}
            />
          )}

          {createState.type === 'Video' && (
            <input
              placeholder="Video URL"
              value={createState.url}
              onChange={(e) => setCreateState((prev) => ({ ...prev, url: e.target.value }))}
            />
          )}

          <div className="type-row">
            {['coding', 'health', 'finance'].map((area) => (
              <button
                key={area}
                className={`vault-chip ${createState.area === area ? 'selected' : ''}`}
                onClick={() => setCreateState((prev) => ({ ...prev, area }))}
                style={{ borderColor: AREA_COLORS[area] }}
              >
                {area}
              </button>
            ))}
          </div>

          <div className="type-row">
            {['Low', 'Medium', 'High'].map((level) => (
              <button
                key={level}
                className={`vault-chip ${createState.intensity === level ? 'selected' : ''}`}
                onClick={() => setCreateState((prev) => ({ ...prev, intensity: level }))}
              >
                {level}
              </button>
            ))}
          </div>

          <div className="mono preview-label">Preview (triggered view)</div>
          <div className={`preview-box ${createState.type === 'Memory' ? 'warm' : ''}`}>{createState.content || 'Your item preview appears here'}</div>

          <button className="vault-primary" onClick={saveItem}>Save</button>
        </aside>
      </div>
    );
  };

  const renderLibrary = () => (
    <section className="vault-screen">
      <header className="vault-head">
        <div>
          <h1>Vault</h1>
          <p>Your personal strength system</p>
          <span className="mono">{animatedTotal} items · {stats.used} used · {animatedHelpfulness}% helpful</span>
        </div>
        <div className="head-actions">
          <button className="secondary" onClick={() => setTriggeredMode(true)}>Simulate trigger</button>
          <button className="vault-primary" onClick={() => setShowCreate(true)}>+ Add</button>
        </div>
      </header>

      <section className="vault-snapshot-grid">
        <article className="vault-snapshot-card">
          <small>Total items</small>
          <strong>{animatedTotal}</strong>
          <span>stored in your vault</span>
        </article>
        <article className="vault-snapshot-card">
          <small>Helpful rate</small>
          <strong>{animatedHelpfulness}%</strong>
          <span>average usefulness</span>
        </article>
        <article className="vault-snapshot-card">
          <small>Trigger-ready</small>
          <strong>{animatedTriggered}</strong>
          <span>items mapped to states</span>
        </article>
        <article className="vault-snapshot-card">
          <small>Unique tags</small>
          <strong>{animatedUniqueTags}</strong>
          <span>active themes</span>
        </article>
      </section>

      <div className="filter-bar">
        <div className="tag-scroll">
          {TAGS.map((tag) => (
            <button key={tag} className={`vault-chip ${tagFilter === tag ? 'selected' : ''}`} onClick={() => setTagFilter(tag)}>
              {tag === 'all' ? 'All Tags' : tag}
            </button>
          ))}
        </div>

        <div className="tag-scroll">
          {['all', 'coding', 'health', 'finance'].map((area) => (
            <button
              key={area}
              className={`vault-chip ${areaFilter === area ? 'selected' : ''}`}
              onClick={() => setAreaFilter(area)}
              style={{ borderColor: area === 'all' ? 'var(--border)' : AREA_COLORS[area] }}
            >
              {area === 'all' ? 'All Areas' : area}
            </button>
          ))}
        </div>

        <div className="toggle-row">
          {['Grid', 'List'].map((mode) => (
            <button key={mode} className={`vault-chip ${viewMode === mode ? 'selected' : ''}`} onClick={() => setViewMode(mode)}>{mode}</button>
          ))}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="vault-empty">
          <div className="empty-icon">🔐</div>
          <h3>Your vault is empty</h3>
          <p>Save what moves you. A quote, a win, a reminder. This is for you.</p>
          <button className="vault-primary" onClick={() => setShowCreate(true)}>Add your first item</button>
        </div>
      ) : (
        <div className={`vault-items ${viewMode.toLowerCase()}`}>
          {filteredItems.map((item) => (
            <article className="vault-card" key={item.id} onClick={() => openDetail(item)}>
              <div className="vault-card-head">
                <span>{TYPE_ICONS[item.type]} {item.type}</span>
                <span className={`intensity-dot ${intensityClass[item.intensity]}`} />
                {item.uses >= 5 && <span className="mono">{Math.round((item.helpful / item.uses) * 100)}% helpful</span>}
              </div>

              {renderItemPreview(item)}

              <div className="vault-bottom">
                <div className="chip-row">
                  {item.tags.slice(0, 2).map((tag) => <span className="vault-chip" key={tag}>{tag}</span>)}
                  {item.tags.length > 2 && <span className="vault-chip">+{item.tags.length - 2} more</span>}
                </div>
                <div className="mono">Used {item.uses} times</div>
              </div>
            </article>
          ))}
        </div>
      )}

      <section className="insights">
        <button className="vault-ghost" onClick={() => setInsightOpen((prev) => !prev)}>
          Your Vault Performance {insightOpen ? '▾' : '▸'}
        </button>
        {insightOpen && (
          <div className="insight-grid">
            <div className="insight-card">
              <h4>Most used items</h4>
              {topUsed.map((item) => (
                <div key={item.id} className="bar-row">
                  <span>{item.title}</span>
                  <div className="bar-track"><div style={{ width: `${Math.min(100, item.uses * 10)}%` }} /></div>
                </div>
              ))}
            </div>
            <div className="insight-card">
              <h4>Tag effectiveness</h4>
              <p className="mono">confidence and discipline have highest helpful ratings this month.</p>
            </div>
            <div className="insight-card">
              <h4>Items never used</h4>
              <p className="mono">{neverUsed} items are untouched. Review or remove stale items.</p>
            </div>
          </div>
        )}
      </section>

      {renderDetailSheet()}
      {renderCreateForm()}
    </section>
  );

  return <>{triggeredMode ? renderTriggerView() : renderLibrary()}</>;
};

export default Vault;
