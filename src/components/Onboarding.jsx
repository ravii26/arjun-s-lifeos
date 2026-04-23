import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const DEFAULT_AREAS = [
  { id: 'Career', color: 'var(--blue)' },
  { id: 'Health', color: 'var(--teal)' },
  { id: 'Finance', color: 'var(--accent)' },
  { id: 'Mind', color: 'var(--purple)' },
  { id: 'Relationships', color: 'var(--pink)' },
  { id: 'Creative', color: 'var(--orange)' },
];

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedAreas, setSelectedAreas] = useState(['Career', 'Health', 'Finance']);
  const navigate = useNavigate();

  const toggleArea = (id) => {
    setSelectedAreas(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (step === 1) {
      if (selectedAreas.length === 0) return;
      setStep(2);
    } else {
      // Finish Onboarding
      localStorage.setItem('lifeos_onboarded', 'true');
      onComplete();
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card onboard-card">
        <div className="auth-header" style={{ marginBottom: '16px' }}>
          <h1>{step === 1 ? 'Design your LifeOS' : 'You are all set'}</h1>
          <p>
            {step === 1 
              ? 'Select the primary areas of your life you want to track and master.' 
              : 'Your workspace has been compiled. You can modify areas later in Settings.'}
          </p>
        </div>

        {step === 1 && (
          <div className="area-selector-grid">
            {DEFAULT_AREAS.map(area => (
              <div 
                key={area.id} 
                className={`area-tile ${selectedAreas.includes(area.id) ? 'selected' : ''}`}
                onClick={() => toggleArea(area.id)}
              >
                <div className="area-color-dot" style={{ background: area.color }} />
                <h3>{area.id}</h3>
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              {selectedAreas.length} Areas Initialized
            </h3>
            <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px', marginTop: '8px' }}>
              Building initial habits... Syncing local storage...
            </p>
          </div>
        )}

        <button 
          className="auth-btn" 
          onClick={handleNext}
          disabled={step === 1 && selectedAreas.length === 0}
        >
          {step === 1 ? 'Continue →' : 'Enter Workspace'}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;