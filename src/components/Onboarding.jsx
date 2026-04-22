import React, { useState } from 'react';
import './design-system.css';

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [userData, setUserData] = useState({
    name: '',
    goal: '',
    focusAreas: [],
    timeAllocation: {},
    firstHabit: '',
    firstTask: '',
  });

  const areaOptions = [
    { id: 'career', name: 'Career', example: 'e.g. DSA practice, job applications', color: 'var(--blue)' },
    { id: 'health', name: 'Health', example: 'e.g. daily workout, meal prep', color: 'var(--green)' },
    { id: 'mind', name: 'Mind', example: 'e.g. meditation, journaling', color: 'var(--purple)' },
    { id: 'relationships', name: 'Relationships', example: 'e.g. family time, networking', color: 'var(--orange)' },
    { id: 'finance', name: 'Finance', example: 'e.g. budgeting, investments', color: 'var(--yellow)' },
    { id: 'fun', name: 'Fun', example: 'e.g. hobbies, travel plans', color: 'var(--pink)' },
  ];

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleInputChange = (field, value) => {
    setUserData({ ...userData, [field]: value });
  };

  const handleAreaSelection = (areaId) => {
    const isSelected = userData.focusAreas.includes(areaId);
    if (isSelected) {
      setUserData({
        ...userData,
        focusAreas: userData.focusAreas.filter((id) => id !== areaId),
      });
    } else if (userData.focusAreas.length < 3) {
      setUserData({ ...userData, focusAreas: [...userData.focusAreas, areaId] });
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '56px', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
              LifeOS
            </h1>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '18px', color: 'var(--text-secondary)' }}>
              Your personal operating system
            </p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', color: 'var(--text-muted)' }}>
              Built for people who want to DO, not just plan.
            </p>
            <button
              onClick={handleNext}
              style={{
                backgroundColor: 'var(--accent)',
                color: '#000',
                padding: '12px 24px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                fontFamily: 'var(--font-ui)',
                fontWeight: 'var(--weight-semi-bold)',
                marginTop: 'var(--space-6)',
              }}
            >
              Build my system →
            </button>
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                marginTop: 'var(--space-4)',
                cursor: 'pointer',
              }}
              onClick={() => alert('Redirect to login')}
            >
              I already have an account
            </p>
          </div>
        );
      case 1:
        return (
          <div style={{ padding: 'var(--space-8)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
              Let’s set up your system
            </h2>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
              We’ll personalize everything to your goals
            </p>
            <label style={{ display: 'block', marginBottom: 'var(--space-4)' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                What should we call you?
              </span>
              <input
                type="text"
                value={userData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  marginTop: 'var(--space-2)',
                }}
              />
            </label>
            <label style={{ display: 'block', marginBottom: 'var(--space-6)' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                What’s your #1 focus for the next 90 days?
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                {[
                  { id: 'career', label: '🚀 Career & Income' },
                  { id: 'health', label: '💪 Health & Fitness' },
                  { id: 'skills', label: '🧠 Skills & Learning' },
                  { id: 'discipline', label: '🔥 Discipline & Consistency' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleInputChange('goal', option.label)}
                    style={{
                      backgroundColor: userData.goal === option.label ? 'var(--accent-dim)' : 'var(--surface)',
                      border: `1px solid ${userData.goal === option.label ? 'var(--accent)' : 'var(--border)'}`,
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-ui)',
                      fontSize: '14px',
                      fontWeight: 'var(--weight-medium)',
                      cursor: 'pointer',
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </label>
            <button
              onClick={handleNext}
              style={{
                backgroundColor: 'var(--accent)',
                color: '#000',
                padding: '12px 24px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                fontFamily: 'var(--font-ui)',
                fontWeight: 'var(--weight-semi-bold)',
              }}
            >
              Next →
            </button>
          </div>
        );
      case 2:
        return (
          <div style={{ padding: 'var(--space-8)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
              Choose your 3 focus areas
            </h2>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
              You’ll track all 6, but we’ll prioritize 3
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              {areaOptions.map((area) => (
                <button
                  key={area.id}
                  onClick={() => handleAreaSelection(area.id)}
                  style={{
                    backgroundColor: userData.focusAreas.includes(area.id) ? area.color : 'var(--surface)',
                    border: `1px solid ${area.color}`,
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '14px',
                    fontWeight: 'var(--weight-medium)',
                    cursor: 'pointer',
                  }}
                >
                  {area.name}
                </button>
              ))}
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)', marginTop: 'var(--space-4)' }}>
              {userData.focusAreas.length}/3 selected
            </p>
            <button
              onClick={handleNext}
              style={{
                backgroundColor: 'var(--accent)',
                color: '#000',
                padding: '12px 24px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                fontFamily: 'var(--font-ui)',
                fontWeight: 'var(--weight-semi-bold)',
                marginTop: 'var(--space-6)',
              }}
              disabled={userData.focusAreas.length !== 3}
            >
              Next →
            </button>
          </div>
        );
      default:
        return <div>Step {step}</div>;
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      {renderStepContent()}
      <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
        {step > 0 && (
          <button
            onClick={handleBack}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-ui)',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;