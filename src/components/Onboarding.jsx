import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/design-system.css';
import './Onboarding.css';

const GOALS = [
  {
    id: 'career',
    label: 'Career & Income',
    icon: '🚀',
    description: 'Build output, skills, and earning power',
    defaultArea: 'career',
  },
  {
    id: 'health',
    label: 'Health & Fitness',
    icon: '💪',
    description: 'Increase energy, consistency, and recovery',
    defaultArea: 'health',
  },
  {
    id: 'skills',
    label: 'Skills & Learning',
    icon: '🧠',
    description: 'Turn learning into practical execution',
    defaultArea: 'mind',
  },
  {
    id: 'discipline',
    label: 'Discipline & Consistency',
    icon: '🔥',
    description: 'Create routines you can actually keep',
    defaultArea: 'career',
  },
];

const AREAS = [
  { id: 'career', name: 'Career', example: 'e.g. DSA practice, job applications', color: 'var(--blue)', icon: '💼' },
  { id: 'health', name: 'Health', example: 'e.g. workouts, steps, sleep', color: 'var(--teal)', icon: '🏃' },
  { id: 'mind', name: 'Mind', example: 'e.g. deep work, learning, reflection', color: 'var(--purple)', icon: '🧠' },
  { id: 'finance', name: 'Finance', example: 'e.g. savings, budgeting, investing', color: 'var(--accent)', icon: '💰' },
  { id: 'relationships', name: 'Relationships', example: 'e.g. quality conversations, family time', color: 'var(--pink)', icon: '🤝' },
  { id: 'creative', name: 'Creative', example: 'e.g. writing, building, design', color: 'var(--orange)', icon: '🎨' },
];

const TRACKING_TYPES = ['Boolean', 'Count', 'Timer'];

const toMinutesLabel = (minutes) => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  if (minutes % 60 === 0) {
    return `${minutes / 60}h`;
  }
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

const byId = (id) => AREAS.find((area) => area.id === id);

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [customGoal, setCustomGoal] = useState('');
  const [showCustomHabit, setShowCustomHabit] = useState(false);

  const [userData, setUserData] = useState({
    name: '',
    focusAreas: [],
    timeAllocation: {},
    firstHabit: '',
    firstHabitArea: '',
    firstHabitTracking: 'Boolean',
    firstTask: '',
    firstTaskArea: '',
    firstTaskPriority: 'P1',
  });

  const goalData = GOALS.find((goal) => goal.id === selectedGoalId);
  const goalLabel = customGoal.trim() || goalData?.label || 'Not set';

  const habitSuggestions = useMemo(() => {
    const map = {
      career: [
        { name: '1h Deep Work', tracking: 'Timer', why: 'Compounds focused output every day' },
        { name: '3 Job Applications', tracking: 'Count', why: 'Increases opportunity volume weekly' },
        { name: 'Read 20 pages', tracking: 'Count', why: 'Builds skill edge with consistency' },
      ],
      health: [
        { name: '30m Walk', tracking: 'Timer', why: 'Raises baseline energy and recovery' },
        { name: '8k Steps', tracking: 'Count', why: 'Makes movement measurable and daily' },
        { name: 'No sugar after dinner', tracking: 'Boolean', why: 'Improves sleep and control' },
      ],
      skills: [
        { name: '45m Skill Drill', tracking: 'Timer', why: 'Turns learning into repetitions' },
        { name: '1 Practical Note', tracking: 'Count', why: 'Converts input into usable knowledge' },
        { name: 'Build 1 mini output', tracking: 'Boolean', why: 'Prevents passive consumption' },
      ],
      discipline: [
        { name: 'Wake up on first alarm', tracking: 'Boolean', why: 'Strengthens self-trust daily' },
        { name: 'Plan tomorrow tonight', tracking: 'Boolean', why: 'Reduces morning friction' },
        { name: '2h focus block', tracking: 'Timer', why: 'Trains consistency over motivation' },
      ],
    };

    return map[selectedGoalId] || map.skills;
  }, [selectedGoalId]);

  const totalDailyMinutes = Object.values(userData.timeAllocation).reduce((sum, minutes) => sum + Number(minutes || 0), 0);

  const progressIndex = Math.min(Math.max(step - 1, 0), 4);

  const canContinue = useMemo(() => {
    if (step === 1) {
      return userData.name.trim().length > 0 && (selectedGoalId || customGoal.trim().length > 0);
    }
    if (step === 2) {
      return userData.focusAreas.length === 3;
    }
    if (step === 3) {
      return userData.focusAreas.every((areaId) => Number(userData.timeAllocation[areaId]) >= 30);
    }
    if (step === 4) {
      return userData.firstHabit.trim().length > 0;
    }
    if (step === 5) {
      return userData.firstTask.trim().length > 0;
    }
    return true;
  }, [step, userData, selectedGoalId, customGoal]);

  const nextStep = () => {
    if (!canContinue) {
      return;
    }

    if (step === 1 && !userData.firstTaskArea) {
      const defaultArea = goalData?.defaultArea || userData.focusAreas[0] || 'career';
      setUserData((prev) => ({ ...prev, firstTaskArea: defaultArea, firstHabitArea: defaultArea }));
    }

    setStep((prev) => Math.min(prev + 1, 6));
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const updateUserData = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArea = (areaId) => {
    const selected = userData.focusAreas;

    if (selected.includes(areaId)) {
      const nextAreas = selected.filter((id) => id !== areaId);
      setUserData((prev) => ({
        ...prev,
        focusAreas: nextAreas,
      }));
      return;
    }

    if (selected.length === 3) {
      return;
    }

    setUserData((prev) => {
      const nextAreas = [...prev.focusAreas, areaId];
      const nextAreaForTask = prev.firstTaskArea || areaId;
      const nextAreaForHabit = prev.firstHabitArea || areaId;
      return {
        ...prev,
        focusAreas: nextAreas,
        firstTaskArea: nextAreaForTask,
        firstHabitArea: nextAreaForHabit,
      };
    });
  };

  const setAreaMinutes = (areaId, minutes) => {
    setUserData((prev) => ({
      ...prev,
      timeAllocation: {
        ...prev.timeAllocation,
        [areaId]: minutes,
      },
    }));
  };

  const applyHabitSuggestion = (suggestion) => {
    setShowCustomHabit(false);
    setUserData((prev) => ({
      ...prev,
      firstHabit: suggestion.name,
      firstHabitTracking: suggestion.tracking,
      firstHabitArea: prev.firstHabitArea || prev.focusAreas[0] || 'career',
    }));
  };

  const renderWelcome = () => (
    <div className="onboarding-welcome">
      <div className="onboarding-logo-wrap">
        <div className="onboarding-logo-mark" />
        <div className="onboarding-floating-dots">
          {AREAS.map((area, i) => (
            <span key={area.id} style={{ background: area.color, animationDelay: `${i * 120}ms` }} />
          ))}
        </div>
      </div>
      <h1>LifeOS</h1>
      <p className="onboarding-subtitle">Your personal operating system</p>
      <p className="onboarding-muted">Built for people who want to DO, not just plan.</p>
      <button className="onboarding-primary" onClick={nextStep}>
        Build my system →
      </button>
      <button className="onboarding-ghost" onClick={() => navigate('/dashboard')}>
        I already have an account
      </button>
    </div>
  );

  const renderIdentityStep = () => (
    <div className="onboarding-step-grid">
      <div className="onboarding-side-visual">
        {AREAS.map((area) => (
          <div key={area.id} className="area-pill" style={{ borderColor: area.color }}>
            <span style={{ background: area.color }} />
            {area.name}
          </div>
        ))}
      </div>
      <div className="onboarding-step-body">
        <h2>Let&apos;s set up your system</h2>
        <p>We&apos;ll personalize everything to your goals</p>

        <label>
          What should we call you?
          <input
            autoFocus
            value={userData.name}
            onChange={(e) => updateUserData('name', e.target.value)}
            placeholder="Type your name"
          />
        </label>

        <div className="onboarding-field-title">What&apos;s your #1 focus for the next 90 days?</div>
        <div className="goal-grid">
          {GOALS.map((goal) => {
            const active = selectedGoalId === goal.id;
            return (
              <button
                key={goal.id}
                className={`goal-card ${active ? 'active' : ''}`}
                onClick={() => {
                  setSelectedGoalId(goal.id);
                  setCustomGoal('');
                }}
              >
                <div>{goal.icon} {goal.label}</div>
                <small>{goal.description}</small>
              </button>
            );
          })}
        </div>

        <input
          value={customGoal}
          onChange={(e) => {
            setCustomGoal(e.target.value);
            if (e.target.value.trim()) {
              setSelectedGoalId('');
            }
          }}
          placeholder="Or write a custom 90-day goal"
        />
      </div>
    </div>
  );

  const renderFocusAreaStep = () => (
    <div className="onboarding-step-body onboarding-wide">
      <h2>Choose your 3 focus areas</h2>
      <p>You&apos;ll track all 6, but we&apos;ll prioritize 3</p>

      <div className="area-grid">
        {AREAS.map((area) => {
          const selected = userData.focusAreas.includes(area.id);
          return (
            <button
              key={area.id}
              className={`area-card ${selected ? 'selected' : ''}`}
              style={{ '--area-color': area.color }}
              onClick={() => toggleArea(area.id)}
            >
              <div className="area-card-title">{area.icon} {area.name}</div>
              <small>{area.example}</small>
              {selected && <span className="area-check">✓</span>}
            </button>
          );
        })}
      </div>

      <div className="selection-counter">{userData.focusAreas.length}/3 selected</div>
      <div className="selection-note">
        Don&apos;t worry - you can track all 6 areas. These are just your primary focus.
      </div>
    </div>
  );

  const renderTimeStep = () => (
    <div className="onboarding-step-body onboarding-wide">
      <h2>How much time daily?</h2>
      <p>This calibrates your area scores realistically</p>

      <div className="time-rows">
        {userData.focusAreas.map((areaId) => {
          const area = byId(areaId);
          const minutes = Number(userData.timeAllocation[areaId] || 60);
          const suggested = goalData?.defaultArea === areaId ? 120 : 60;
          return (
            <div className="time-row" key={areaId}>
              <div className="time-row-left">
                <span className="dot" style={{ background: area.color }} />
                <strong>{area.name}</strong>
              </div>
              <div className="time-controls">
                <input
                  type="range"
                  min={30}
                  max={240}
                  step={30}
                  value={minutes}
                  onChange={(e) => setAreaMinutes(areaId, Number(e.target.value))}
                />
                <div className="chip-row">
                  {[30, 60, 120, 180].map((preset) => (
                    <button
                      key={preset}
                      className={`chip ${minutes === preset ? 'active' : ''}`}
                      onClick={() => setAreaMinutes(areaId, preset)}
                    >
                      {toMinutesLabel(preset)}
                    </button>
                  ))}
                  <span className="time-value">{toMinutesLabel(minutes)}</span>
                </div>
                <div className="hint">We suggest {toMinutesLabel(suggested)} for {area.name} based on your goal.</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderHabitStep = () => (
    <div className="onboarding-step-body onboarding-wide">
      <h2>Add your first habit</h2>
      <p>Start with ONE. Just one.</p>

      <div className="habit-suggestions">
        {habitSuggestions.map((suggestion) => (
          <div key={suggestion.name} className="habit-card">
            <strong>{suggestion.name}</strong>
            <small>{suggestion.tracking} tracking</small>
            <p>{suggestion.why}</p>
            <button className="chip active" onClick={() => applyHabitSuggestion(suggestion)}>
              Use this
            </button>
          </div>
        ))}
      </div>

      <button className="onboarding-ghost left" onClick={() => setShowCustomHabit((prev) => !prev)}>
        {showCustomHabit ? 'Hide custom habit' : 'Custom habit'}
      </button>

      {showCustomHabit && (
        <div className="custom-habit">
          <input
            placeholder="Habit name"
            value={userData.firstHabit}
            onChange={(e) => updateUserData('firstHabit', e.target.value)}
          />
          <div className="chip-row">
            {userData.focusAreas.map((areaId) => {
              const area = byId(areaId);
              const active = userData.firstHabitArea === areaId;
              return (
                <button key={areaId} className={`chip ${active ? 'active' : ''}`} onClick={() => updateUserData('firstHabitArea', areaId)}>
                  {area.name}
                </button>
              );
            })}
          </div>
          <div className="chip-row">
            {TRACKING_TYPES.map((type) => (
              <button
                key={type}
                className={`chip ${userData.firstHabitTracking === type ? 'active' : ''}`}
                onClick={() => updateUserData('firstHabitTracking', type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {!userData.firstHabit && (
        <button className="onboarding-ghost left" onClick={() => updateUserData('firstHabit', 'I will add this later')}>
          I&apos;ll add habits later
        </button>
      )}
    </div>
  );

  const renderTaskStep = () => (
    <div className="onboarding-step-body">
      <h2>What&apos;s your most important task?</h2>
      <p>The #1 thing you need to do today</p>

      <input
        autoFocus
        value={userData.firstTask}
        onChange={(e) => updateUserData('firstTask', e.target.value)}
        placeholder="Write your most important task"
      />

      <div className="chip-row">
        {userData.focusAreas.map((areaId) => {
          const area = byId(areaId);
          const active = userData.firstTaskArea === areaId;
          return (
            <button key={areaId} className={`chip ${active ? 'active' : ''}`} onClick={() => updateUserData('firstTaskArea', areaId)}>
              {area.name}
            </button>
          );
        })}
      </div>

      <div className="chip-row">
        {['P1', 'P2', 'P3'].map((priority) => (
          <button
            key={priority}
            className={`chip ${userData.firstTaskPriority === priority ? 'active' : ''}`}
            onClick={() => updateUserData('firstTaskPriority', priority)}
          >
            {priority}
          </button>
        ))}
      </div>

      {userData.firstTask.trim() && (
        <div className="task-confirmation">This is already added to today&apos;s tasks ✓</div>
      )}
    </div>
  );

  const renderCompletion = () => (
    <div className="onboarding-complete">
      <div className="checkmark">✓</div>
      <h2>Your system is ready</h2>
      <div className="summary-card">
        <p><strong>Your 90-day goal:</strong> {goalLabel}</p>
        <p>
          <strong>3 focus areas:</strong>{' '}
          {userData.focusAreas.map((id) => byId(id)?.name).join(', ')}
        </p>
        <p><strong>Daily time target:</strong> {toMinutesLabel(totalDailyMinutes)}</p>
        <p><strong>First habit:</strong> {userData.firstHabit}</p>
        <p><strong>Today&apos;s first task:</strong> {userData.firstTask}</p>
      </div>
      <button className="onboarding-primary" onClick={() => navigate('/dashboard')}>
        Enter LifeOS
      </button>
    </div>
  );

  const renderStep = () => {
    if (step === 0) return renderWelcome();
    if (step === 1) return renderIdentityStep();
    if (step === 2) return renderFocusAreaStep();
    if (step === 3) return renderTimeStep();
    if (step === 4) return renderHabitStep();
    if (step === 5) return renderTaskStep();
    return renderCompletion();
  };

  return (
    <div className="onboarding-screen">
      <div className="onboarding-grid" />
      <div className="onboarding-frame">
        <div className="onboarding-card" key={step}>
          {renderStep()}
        </div>

        {step > 0 && step < 6 && (
          <div className="onboarding-footer">
            <button className="onboarding-ghost left" onClick={prevStep}>Back</button>
            <div className="progress-dots" aria-label="Onboarding progress">
              {Array.from({ length: 5 }).map((_, idx) => {
                const status = idx < progressIndex ? 'done' : idx === progressIndex ? 'current' : 'upcoming';
                return <span key={idx} className={`dot-${status}`} />;
              })}
            </div>
            <button className="onboarding-primary" onClick={nextStep} disabled={!canContinue}>
              {step === 5 ? 'Let\'s go →' : 'Next →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;