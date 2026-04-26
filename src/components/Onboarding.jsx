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
      <div className="auth-bg-blob blob-1" />
      <div className="auth-bg-blob blob-2" />
      <div className="auth-card onboard-card">
        <div className="auth-header" style={{ marginBottom: '24px' }}>
          <h1>{step === 1 ? 'Design your LifeOS' : 'Initialization Complete'}</h1>
          <p>
            {step === 1 
              ? 'Select the core domains of your existence to master.' 
              : 'Your digital nervous system is synchronized.'}
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
          <div className="onboard-success-flow">
            <div className="success-icon">✨</div>
            <h3 className="success-title">
              {selectedAreas.length} Domains Loaded
            </h3>
            <p className="success-caption">
              Initializing neural links... Compiling habits... 
            </p>
            <div className="success-progress-track">
               <div className="success-progress-fill" />
            </div>
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