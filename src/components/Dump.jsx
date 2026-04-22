import React, { useState } from 'react';
import './design-system.css';

const Dump = () => {
  const [dumpItems, setDumpItems] = useState([
    {
      id: 1,
      content: 'Finish the quarterly report by Friday.',
      createdAt: '2h ago',
      processed: false,
      aiSuggestion: 'Task',
    },
    {
      id: 2,
      content: 'Start a daily meditation habit.',
      createdAt: '1d ago',
      processed: false,
      aiSuggestion: 'Habit',
    },
    {
      id: 3,
      content: 'Read the book “Atomic Habits”.',
      createdAt: '3d ago',
      processed: true,
      resultType: 'Task created',
    },
  ]);

  const [quickInput, setQuickInput] = useState('');
  const [showConverter, setShowConverter] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleQuickInputSubmit = () => {
    if (quickInput.trim() === '') return;

    const newItem = {
      id: dumpItems.length + 1,
      content: quickInput,
      createdAt: 'Just now',
      processed: false,
      aiSuggestion: 'Note', // Default suggestion
    };

    setDumpItems([newItem, ...dumpItems]);
    setQuickInput('');
  };

  const handleConvert = (item) => {
    setSelectedItem(item);
    setShowConverter(true);
  };

  const handleDelete = (id) => {
    setDumpItems(dumpItems.filter((item) => item.id !== id));
  };

  const renderQuickInputArea = () => (
    <div style={{ marginBottom: 'var(--space-6)' }}>
      <textarea
        value={quickInput}
        onChange={(e) => setQuickInput(e.target.value)}
        placeholder="Dump anything on your mind..."
        style={{
          width: '100%',
          height: '80px',
          fontSize: '18px',
          fontFamily: 'var(--font-ui)',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          outline: 'none',
          resize: 'none',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)' }}>
        <button
          onClick={handleQuickInputSubmit}
          style={{
            backgroundColor: 'var(--accent)',
            color: '#000',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontFamily: 'var(--font-ui)',
            fontWeight: 'var(--weight-semi-bold)',
          }}
        >
          Add
        </button>
        {quickInput.length > 200 && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
            {quickInput.length} characters
          </span>
        )}
      </div>
    </div>
  );

  const renderUnprocessedList = () => (
    <div style={{ marginBottom: 'var(--space-6)' }}>
      <h4 style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 'var(--space-4)' }}>
        Process These
      </h4>
      {dumpItems.filter((item) => !item.processed).length === 0 ? (
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center' }}>
          Your mind is clear 🧘
        </p>
      ) : (
        dumpItems
          .filter((item) => !item.processed)
          .map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-4)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-4)',
                backgroundColor: 'var(--surface)',
              }}
            >
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
                  {item.createdAt}
                </p>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', color: 'var(--text-primary)' }}>
                  {item.content}
                </p>
                {item.aiSuggestion && (
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--purple)', marginTop: 'var(--space-2)' }}>
                    Looks like a {item.aiSuggestion} →
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  onClick={() => handleConvert(item)}
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: '#000',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '12px',
                  }}
                >
                  Convert →
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '12px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))
      )}
    </div>
  );

  const renderProcessedSection = () => (
    <div>
      <h4 style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 'var(--space-4)' }}>
        Processed
      </h4>
      {dumpItems.filter((item) => item.processed).map((item) => (
        <div
          key={item.id}
          style={{
            padding: 'var(--space-4)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-4)',
            backgroundColor: 'var(--surface-dim)',
          }}
        >
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', color: 'var(--text-secondary)' }}>
            {item.content}
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
            {item.resultType}
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ padding: 'var(--space-8)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
        Dump
      </h1>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
        {dumpItems.filter((item) => !item.processed).length} unprocessed · {dumpItems.length} total
      </p>
      {renderQuickInputArea()}
      {renderUnprocessedList()}
      {renderProcessedSection()}
    </div>
  );
};

export default Dump;