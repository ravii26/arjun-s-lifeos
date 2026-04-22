import React, { useState } from 'react';
import './design-system.css';
import { motion } from 'framer-motion';

const GlobalComponents = () => {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    document.body.setAttribute('data-theme', theme === 'light' ? 'dark' : 'light');
  };

  const renderToastNotifications = () => (
    <div style={{ position: 'relative', padding: 'var(--space-8)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--space-6)' }}>
        Toast Notifications
      </h2>
      <div style={{ position: 'fixed', top: 'var(--space-8)', right: 'var(--space-8)', width: '360px' }}>
        {['success', 'error', 'warning', 'info', 'ai'].map((type, index) => (
          <motion.div
            key={type}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.2 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--surface)',
              borderLeft: `3px solid var(--${type})`,
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              marginBottom: 'var(--space-4)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ marginRight: 'var(--space-4)' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '20px',
                  height: '20px',
                  backgroundColor: 'var(--text-muted)',
                  borderRadius: '50%',
                }}
              ></span>
            </div>
            <div style={{ flexGrow: 1 }}>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 'var(--weight-medium)', color: 'var(--text-primary)' }}>
                {type.charAt(0).toUpperCase() + type.slice(1)} Notification
              </p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                This is a {type} message.
              </p>
            </div>
            <button
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderConfirmationDialogs = () => (
    <div style={{ padding: 'var(--space-8)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--space-6)' }}>
        Confirmation Dialogs
      </h2>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          width: '400px',
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-6)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
          textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <span
            style={{
              display: 'inline-block',
              width: '40px',
              height: '40px',
              backgroundColor: 'var(--red)',
              borderRadius: '50%',
            }}
          ></span>
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
          Are you sure?
        </h3>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
          This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 16px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            style={{
              backgroundColor: 'var(--red)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '8px 16px',
              cursor: 'pointer',
            }}
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', padding: 'var(--space-8)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
          Global Components
        </h1>
        <button
          onClick={toggleTheme}
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 16px',
            fontFamily: 'var(--font-ui)',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Toggle Theme
        </button>
      </div>
      {renderToastNotifications()}
      {renderConfirmationDialogs()}
    </div>
  );
};

export default GlobalComponents;