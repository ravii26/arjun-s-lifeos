import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadTasksStore } from '../lib/tasksStore';
import { loadLearningGraphStore } from '../lib/learningGraphStore';
import './CommandPalette.css';

const MOCK_VAULT = [
  { id: 1, type: 'Quote', title: 'Pressure Clarifier', tags: ['discipline'] },
  { id: 2, type: 'Memory', title: 'First Offer Win', tags: ['confidence'] },
  { id: 3, type: 'Note', title: 'Rescue Protocol', tags: ['focus'] },
  { id: 4, type: 'Video', title: 'Calm Nervous System Reset', tags: ['clarity'] }
];

const CommandPalette = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ tasks: [], notes: [], vault: [], actions: [] });
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
      search(''); // Initial default load
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const search = (q) => {
    setQuery(q);
    const text = q.toLowerCase();
    
    const tasksStore = loadTasksStore();
    const learnStore = loadLearningGraphStore();
    
    // Tasks search
    const foundTasks = (tasksStore.tasks || [])
      .filter((t) => t.title?.toLowerCase().includes(text) || t.notes?.toLowerCase().includes(text))
      .slice(0, 4);
    
    // Notes search
    const foundNotes = (learnStore.notes || [])
      .filter((n) => n.title?.toLowerCase().includes(text) || n.content?.toLowerCase().includes(text))
      .slice(0, 4);

    // Vault search (using mock data to fit prototype)
    const foundVault = MOCK_VAULT
      .filter((v) => v.title.toLowerCase().includes(text) || v.tags.some(tag => tag.includes(text)))
      .slice(0, 3);
    
    // System Actions
    const allActions = [
      { title: 'Create new task', path: '/tasks', icon: '☑️' },
      { title: 'Start a focus timer', path: '/calendar', icon: '⏱️' },
      { title: 'Review your vault', path: '/vault', icon: '🔐' },
      { title: 'Open Settings', path: '/settings', icon: '⚙️' }
    ];
    
    const foundActions = allActions.filter((a) => a.title.toLowerCase().includes(text));

    setResults({ tasks: foundTasks, notes: foundNotes, vault: foundVault, actions: foundActions });
  };

  const handleAction = (path) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  const totalResults = results.tasks.length + results.notes.length + results.vault.length + results.actions.length;

  return (
    <div className="cmd-overlay" onClick={onClose}>
      <div className="cmd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cmd-header">
          <span className="cmd-search-icon">🔍</span>
          <input 
            ref={inputRef}
            className="cmd-input"
            placeholder="Search tasks, notes, or type a command... (Esc to close)"
            value={query}
            onChange={(e) => search(e.target.value)}
          />
        </div>

        <div className="cmd-body">
          {totalResults === 0 && (
            <div className="cmd-empty">
              No results found for "{query}"
            </div>
          )}

          {results.actions.length > 0 && (
            <div className="cmd-section">
              <h4>System Actions</h4>
              <div className="cmd-list">
                {results.actions.map((action, i) => (
                  <button key={i} className="cmd-item" onClick={() => handleAction(action.path)}>
                    <span className="cmd-icon">{action.icon}</span>
                    <span className="cmd-label">{action.title}</span>
                    <span className="cmd-shortcut">Enter ↵</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.tasks.length > 0 && (
            <div className="cmd-section">
              <h4>Tasks</h4>
              <div className="cmd-list">
                {results.tasks.map((task) => (
                  <button key={task.id} className="cmd-item" onClick={() => handleAction('/tasks')}>
                    <span className="cmd-icon">📝</span>
                    <div className="cmd-content">
                      <span className="cmd-label">{task.title}</span>
                      {task.areaKey && <span className="cmd-meta chip-chip">{task.areaKey}</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.notes.length > 0 && (
            <div className="cmd-section">
              <h4>Learn Notes</h4>
              <div className="cmd-list">
                {results.notes.map((note) => (
                  <button key={note.id} className="cmd-item" onClick={() => handleAction('/learn')}>
                    <span className="cmd-icon">📓</span>
                    <div className="cmd-content">
                      <span className="cmd-label">{note.title}</span>
                      <span className="cmd-meta chip-chip">{note.domain}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.vault.length > 0 && (
            <div className="cmd-section">
              <h4>Vault & Intelligence</h4>
              <div className="cmd-list">
                {results.vault.map((item) => (
                  <button key={item.id} className="cmd-item" onClick={() => handleAction('/vault')}>
                    <span className="cmd-icon">💬</span>
                    <div className="cmd-content">
                      <span className="cmd-label">{item.title}</span>
                      <span className="cmd-meta">({item.type})</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="cmd-footer">
          <span className="mono">Navigate: <b>↑ ↓</b> Select: <b>Enter</b> Close: <b>Esc</b></span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
