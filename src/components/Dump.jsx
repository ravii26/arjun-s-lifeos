import React, { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import * as domainService from '../lib/domainService';
import '../styles/design-system.css';
import './Dump.css';

const OUTPUT_TYPES = ['Task', 'Habit', 'Note', 'Course', 'Resource', 'Vault'];

const initialDumpItems = [
  {
    id: 1,
    content: 'Need to call recruiter and finish portfolio landing page tonight',
    createdAt: '2h ago',
    processed: false,
    suggestion: { type: 'Task', confidence: 92, reason: 'action-oriented deadline language' },
  },
  {
    id: 2,
    content: 'Every morning I skip my mobility warmup and then feel stiff later',
    createdAt: '4h ago',
    processed: false,
    suggestion: { type: 'Habit', confidence: 88, reason: 'daily behavior pattern detected' },
  },
];

const prefillByType = (text, type) => {
  const split = text.split(' ');
  const short = split.slice(0, 8).join(' ');

  const defaults = {
    Task: {
      title: short,
      areaKey: 'career',
      priority: 'P2',
      lane: 'today',
    },
    Habit: {
      title: short,
      areaKey: 'health',
      streak: 0,
    },
    Note: {
      title: short,
      content: text,
    },
    Course: {
      title: short,
    },
    Resource: {
      title: short,
    },
    Vault: {
      title: short,
    },
  };

  return defaults[type];
};

const analyzeDump = (content) => {
  const text = content.toLowerCase();
  let suggestion = { type: 'Task', confidence: 85, reason: 'Action item language' };

  if (text.includes('every day') || text.includes('daily')) {
    suggestion = { type: 'Habit', confidence: 92, reason: 'Behavioral pattern' };
  } else if (text.includes('http') || text.includes('read')) {
    suggestion = { type: 'Resource', confidence: 88, reason: 'Reference material' };
  } else if (text.includes('learn') || text.includes('master')) {
    suggestion = { type: 'Course', confidence: 80, reason: 'Growth objective' };
  }

  return suggestion;
};

const useCountUp = (target, duration = 600) => {
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

const Dump = () => {
  const { addTask, toggleHabit, addProject, addToast } = useAppContext();
  const [dumpItems, setDumpItems] = useState(initialDumpItems);
  const [input, setInput] = useState('');
  const [showProcessed, setShowProcessed] = useState(false);

  const [converterOpen, setConverterOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState('Task');
  const [formData, setFormData] = useState(prefillByType('', 'Task'));

  const [drafts, setDrafts] = useState([]);
  const [batchMode, setBatchMode] = useState(false);
  const [batchIndex, setBatchIndex] = useState(0);
  const [isSimulatingBatch, setIsSimulatingBatch] = useState(false);
  const [simulationId, setSimulationId] = useState(null);

  const unprocessed = dumpItems.filter((item) => !item.processed);
  const processed = dumpItems.filter((item) => item.processed);

  const simulateBatchProcessing = () => {
    setIsSimulatingBatch(true);
    let i = 0;

    const unprocList = dumpItems.filter((item) => !item.processed);

    const processNext = async () => {
      if (i >= unprocList.length) {
        setIsSimulatingBatch(false);
        setSimulationId(null);
        return;
      }

      const item = unprocList[i];
      setSimulationId(item.id);

      const suggestion = await domainService.simulateAIService(item.content);
      const resultLabel = `${suggestion.type} automatically created`;

      setDumpItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, processed: true, resultType: resultLabel, suggestion } : it))
      );

      i++;
      setTimeout(processNext, 500);
    };

    processNext();
  };

  const openConverter = async (item) => {
    setSelectedItem(item);
    const suggestion = item.suggestion || await domainService.simulateAIService(item.content);
    setSelectedType(suggestion.type);
    setFormData(prefillByType(item.content, suggestion.type));
    setConverterOpen(true);
  };

  const closeConverter = () => {
    setConverterOpen(false);
    setSelectedItem(null);
    setBatchMode(false);
    setBatchIndex(0);
  };

  const submitDump = async () => {
    if (!input.trim()) return;

    const content = input;
    setInput('');

    const suggestion = await domainService.simulateAIService(content);

    setDumpItems((prev) => [
      {
        id: Date.now(),
        content,
        createdAt: 'just now',
        processed: false,
        suggestion,
      },
      ...prev,
    ]);

    addToast({
      type: 'AI',
      title: 'Neural link established',
      desc: `Recognized as ${suggestion.type}. AI suggests prioritizing immediately.`,
    });
  };

  const convertItem = () => {
    if (!selectedItem) return;

    // Actual creation logic
    if (selectedType === 'Task') {
      addTask({
        title: formData.title,
        completed: false,
        areaKey: formData.areaKey,
        lane: formData.lane,
        priority: formData.priority
      });
    }

    const resultLabel = `${selectedType} created`;

    setDumpItems((prev) =>
      prev.map((item) => (item.id === selectedItem.id ? { ...item, processed: true, resultType: resultLabel } : item))
    );

    if (batchMode) {
      const nextIndex = batchIndex + 1;
      const pendingAfter = unprocessed.length - 1;

      if (nextIndex < pendingAfter) {
        const nextItem = unprocessed[nextIndex];
        if (nextItem) {
          openConverter(nextItem);
          setBatchIndex(nextIndex);
        }
      } else {
        closeConverter();
      }
      return;
    }

    closeConverter();
  };

  const deleteDump = (id) => {
    setDumpItems((prev) => prev.filter((item) => item.id !== id));
  };

  const saveDraft = () => {
    if (drafts.length >= 5) return;
    if (!selectedItem) return;

    setDrafts((prev) => [
      ...prev,
      {
        id: Date.now(),
        itemId: selectedItem.id,
        type: selectedType,
        data: formData,
      },
    ]);
  };

  const changeType = (type) => {
    setSelectedType(type);
    setFormData(prefillByType(selectedItem?.content || '', type));
  };

  const confidence = selectedItem?.suggestion?.confidence || analyzeDump(selectedItem?.content || '').confidence;
  const reason = selectedItem?.suggestion?.reason || analyzeDump(selectedItem?.content || '').reason;

  const avgConfidence = useMemo(() => {
    if (!dumpItems.length) return 0;
    const total = dumpItems.reduce((sum, item) => sum + (item.suggestion?.confidence || 0), 0);
    return Math.round(total / dumpItems.length);
  }, [dumpItems]);

  const animatedUnprocessed = useCountUp(unprocessed.length, 600);
  const animatedProcessed = useCountUp(processed.length, 600);
  const animatedDrafts = useCountUp(drafts.length, 600);
  const animatedConfidence = useCountUp(avgConfidence, 600);

  const progressLabel = batchMode ? `${Math.min(batchIndex + 1, unprocessed.length)} of ${unprocessed.length} processed` : '';

  const renderedForm = useMemo(() => {
    const update = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

    if (selectedType === 'Task') {
      return (
        <>
          <input value={formData.title || ''} onChange={(e) => update('title', e.target.value)} placeholder="Title" />
          <div className="chip-row">
            {['coding', 'health', 'finance'].map((area) => (
              <button key={area} className={`chip ${formData.area === area ? 'active' : ''}`} onClick={() => update('area', area)}>{area}</button>
            ))}
          </div>
          <div className="chip-row">
            {['P1', 'P2', 'P3'].map((priority) => (
              <button key={priority} className={`chip ${formData.priority === priority ? 'active' : ''}`} onClick={() => update('priority', priority)}>{priority}</button>
            ))}
          </div>
          <div className="chip-row">
            {['30m', '1h', '2h', 'Custom'].map((estimate) => (
              <button key={estimate} className={`chip ${formData.estimate === estimate ? 'active' : ''}`} onClick={() => update('estimate', estimate)}>{estimate}</button>
            ))}
          </div>
        </>
      );
    }

    if (selectedType === 'Habit') {
      return (
        <>
          <input value={formData.name || ''} onChange={(e) => update('name', e.target.value)} placeholder="Habit name" />
          <div className="chip-row">
            {['Build', 'Quit'].map((habitType) => (
              <button key={habitType} className={`chip ${formData.habitType === habitType ? 'active' : ''}`} onClick={() => update('habitType', habitType)}>{habitType}</button>
            ))}
          </div>
          <input value={formData.target || ''} onChange={(e) => update('target', e.target.value)} placeholder="Target" />
        </>
      );
    }

    if (selectedType === 'Note') {
      return (
        <>
          <input value={formData.title || ''} onChange={(e) => update('title', e.target.value)} placeholder="Title" />
          <select value={formData.noteType || 'Insight'} onChange={(e) => update('noteType', e.target.value)}>
            <option>Concept</option>
            <option>Insight</option>
            <option>Summary</option>
          </select>
          <textarea rows={6} value={formData.content || ''} onChange={(e) => update('content', e.target.value)} />
          <input value={formData.topic || ''} onChange={(e) => update('topic', e.target.value)} placeholder="Topic" />
        </>
      );
    }

    if (selectedType === 'Course') {
      return (
        <>
          <input value={formData.title || ''} onChange={(e) => update('title', e.target.value)} placeholder="Course title" />
          <select value={formData.sourceType || 'YouTube'} onChange={(e) => update('sourceType', e.target.value)}>
            <option>YouTube</option>
            <option>Book</option>
            <option>Course</option>
            <option>Custom</option>
          </select>
          <input value={formData.url || ''} onChange={(e) => update('url', e.target.value)} placeholder="URL (optional)" />
          <label className="inline-check">
            <input type="checkbox" checked={!!formData.createTasks} onChange={(e) => update('createTasks', e.target.checked)} />
            Also create tasks for this course
          </label>
          {formData.createTasks && (
            <div className="mini-list">
              {(formData.suggestedTasks || []).map((task) => <div key={task}>• {task}</div>)}
            </div>
          )}
        </>
      );
    }

    if (selectedType === 'Resource') {
      return (
        <>
          <input value={formData.value || ''} onChange={(e) => update('value', e.target.value)} placeholder="URL or title" />
          <select value={formData.resourceType || 'Article'} onChange={(e) => update('resourceType', e.target.value)}>
            <option>Video</option>
            <option>Article</option>
            <option>Tweet</option>
            <option>Idea</option>
          </select>
        </>
      );
    }

    return (
      <>
        <select value={formData.vaultType || 'Note'} onChange={(e) => update('vaultType', e.target.value)}>
          <option>Quote</option>
          <option>Note</option>
          <option>Memory</option>
        </select>
        <textarea rows={6} value={formData.content || ''} onChange={(e) => update('content', e.target.value)} />
        <div className="chip-row">
          {['Low', 'Medium', 'High'].map((level) => (
            <button key={level} className={`chip ${formData.intensity === level ? 'active' : ''}`} onClick={() => update('intensity', level)}>{level}</button>
          ))}
        </div>
      </>
    );
  }, [formData, selectedType]);

  return (
    <div className="dump-screen">
      <section className="dump-left">
        <header className="dump-head">
          <h1>Dump</h1>
          <p>{unprocessed.length} unprocessed · {dumpItems.length} total</p>
        </header>

        <section className="dump-snapshot-grid">
          <article className="dump-snapshot-card">
            <small>Unprocessed</small>
            <strong>{animatedUnprocessed}</strong>
            <span>items waiting</span>
          </article>
          <article className="dump-snapshot-card">
            <small>Processed</small>
            <strong>{animatedProcessed}</strong>
            <span>outputs created</span>
          </article>
          <article className="dump-snapshot-card">
            <small>Drafts</small>
            <strong>{animatedDrafts}</strong>
            <span>saved drafts</span>
          </article>
          <article className="dump-snapshot-card">
            <small>Avg confidence</small>
            <strong>{animatedConfidence}%</strong>
            <span>suggestion strength</span>
          </article>
        </section>

        <div className="quick-input-wrap">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitDump();
              }
            }}
            placeholder="Dump anything on your mind..."
          />
          <div className="quick-actions">
            <button className="voice-btn">🎙</button>
            {input.trim() && <button className="send-btn" onClick={submitDump}>→</button>}
            {input.length > 200 && <span className="count">{input.length}</span>}
          </div>
        </div>

        <div className="unprocessed-head">
          <span>PROCESS THESE</span>
          <b>{unprocessed.length}</b>
          {unprocessed.length > 1 && (
            <div className="batch-actions" style={{ display: 'flex', gap: '8px' }}>
              <button
                className="ghost"
                onClick={() => {
                  setBatchMode(true);
                  setBatchIndex(0);
                  openConverter(unprocessed[0]);
                }}
                disabled={isSimulatingBatch}
              >
                Manual Batch
              </button>
              <button
                className="primary-sm"
                style={{
                  animation: isSimulatingBatch ? 'pulse-border 1.5s infinite' : 'none',
                  background: isSimulatingBatch ? 'var(--teal-dim)' : 'var(--accent)',
                  color: isSimulatingBatch ? 'var(--teal)' : '#111',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onClick={simulateBatchProcessing}
                disabled={isSimulatingBatch}
              >
                ✨ {isSimulatingBatch ? 'Auto-Processing...' : 'Auto-Process All'}
              </button>
            </div>
          )}
        </div>

        {unprocessed.length === 0 ? (
          <div className="clear-state">
            <h3>Your mind is clear 🧘</h3>
            <p>Your mind is clear - now execute</p>
          </div>
        ) : (
          <div className="dump-list">
            {unprocessed.map((item) => (
              <article
                className={`dump-item ${simulationId === item.id ? 'simulating' : ''}`}
                key={item.id}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  opacity: (isSimulatingBatch && simulationId !== item.id) ? 0.6 : 1,
                  transition: 'opacity 0.3s ease'
                }}
              >
                {simulationId === item.id && (
                  <div style={{
                    position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 15%, transparent), transparent)',
                    animation: 'scan-x 1s linear infinite'
                  }} />
                )}

                <div className="item-main">
                  <span className="time mono">{item.createdAt}</span>
                  <p>{item.content}</p>
                  <small>
                    {simulationId === item.id ? '🧠 AI analyzing context...' : `Looks like a ${item.suggestion.type} →`}
                  </small>
                </div>
                <div className="item-actions">
                  <button className="primary-sm" onClick={() => openConverter(item)} disabled={isSimulatingBatch}>Convert →</button>
                  <button className="ghost" onClick={() => deleteDump(item.id)} disabled={isSimulatingBatch}>✕</button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="processed-block">
          <button className="collapse-btn" onClick={() => setShowProcessed((prev) => !prev)}>
            PROCESSED · {processed.length} items {showProcessed ? '▾' : '▸'}
          </button>
          {showProcessed && (
            <div className="dump-list">
              {processed.map((item) => (
                <article className="dump-item processed" key={item.id}>
                  <div className="item-main">
                    <p>{item.content}</p>
                    <span className="badge mono">{item.resultType}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {converterOpen && (
        <aside className={`converter ${batchMode ? 'batch' : ''}`}>
          <div className="converter-head">
            <h3>{batchMode ? 'Batch Convert' : 'Convert'}</h3>
            {!batchMode && <button className="ghost" onClick={closeConverter}>✕</button>}
          </div>

          <div className="draft-bar mono">{drafts.length} / 5 drafts used</div>
          {drafts.length >= 5 && <div className="draft-warning">Draft limit reached. Clear drafts to save more.</div>}

          <div className="ai-banner">
            <div>✨</div>
            <div>
              <strong>Suggested Type: {selectedType}</strong>
              <p className="mono">{confidence}% · {reason}</p>
            </div>
            <div className="confidence-ring">{confidence}%</div>
          </div>

          <div className="type-grid">
            {OUTPUT_TYPES.map((type) => (
              <button key={type} className={`type-card ${selectedType === type ? 'active' : ''}`} onClick={() => changeType(type)}>
                {type}
              </button>
            ))}
          </div>

          <div className="dynamic-form">{renderedForm}</div>

          <button className="create-btn" onClick={convertItem}>Create {selectedType}</button>
          <button className="secondary-btn" onClick={saveDraft}>Save as Draft</button>

          <div className="mono shortcut">⌘+Enter to create</div>

          {batchMode && (
            <div className="batch-footer">
              <span className="mono">{progressLabel}</span>
              <button
                className="ghost"
                onClick={() => {
                  if (batchIndex + 1 < unprocessed.length) {
                    const nextItem = unprocessed[batchIndex + 1];
                    setBatchIndex((prev) => prev + 1);
                    openConverter(nextItem);
                  } else {
                    closeConverter();
                  }
                }}
              >
                Skip
              </button>
            </div>
          )}
        </aside>
      )}
    </div>
  );
};

export default Dump;
