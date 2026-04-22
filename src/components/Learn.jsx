import React, { useState } from 'react';
import './design-system.css';

const Learn = () => {
  const [activeTab, setActiveTab] = useState('Active Learning');
  const [mockData] = useState({
    courses: [
      {
        id: 1,
        name: 'React for Beginners',
        source: 'YouTube',
        area: 'Career',
        progress: 33,
        lessonsCompleted: 8,
        totalLessons: 24,
        estimatedCompletion: '6 days',
      },
      {
        id: 2,
        name: 'Nutrition Basics',
        source: 'Book',
        area: 'Health',
        progress: 50,
        lessonsCompleted: 5,
        totalLessons: 10,
        estimatedCompletion: '3 days',
      },
    ],
    topics: [
      {
        id: 1,
        name: 'React',
        area: 'Career',
        skillLevel: 70,
        linkedNotes: 6,
        linkedCourses: 2,
        lastStudied: '3 days ago',
      },
      {
        id: 2,
        name: 'Fitness',
        area: 'Health',
        skillLevel: 50,
        linkedNotes: 4,
        linkedCourses: 1,
        lastStudied: '5 days ago',
      },
    ],
    notes: [
      {
        id: 1,
        title: 'React Hooks Overview',
        preview: 'Hooks simplify state management...',
        type: 'Concept',
        topic: 'React',
        source: 'React for Beginners',
        date: '2026-04-20',
      },
      {
        id: 2,
        title: 'Benefits of Cardio',
        preview: 'Cardio improves heart health...',
        type: 'Insight',
        topic: 'Fitness',
        source: 'Nutrition Basics',
        date: '2026-04-18',
      },
    ],
    resources: [
      {
        id: 1,
        title: 'Advanced React Patterns',
        url: 'https://example.com/react-patterns',
        type: 'Article',
        area: 'Career',
        dateAdded: '2026-04-20',
      },
      {
        id: 2,
        title: 'HIIT Workouts for Beginners',
        url: 'https://example.com/hiit-workouts',
        type: 'Video',
        area: 'Health',
        dateAdded: '2026-04-19',
      },
    ],
  });

  const renderActiveLearning = () => {
    const activeCourse = mockData.courses[0];
    return (
      <div>
        <div
          style={{
            backgroundColor: 'var(--surface-raised)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-4)',
            display: 'flex',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              backgroundColor: 'var(--blue-dim)',
              borderRadius: 'var(--radius-md)',
            }}
          ></div>
          <div style={{ flexGrow: 1 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
              {activeCourse.name}
            </h3>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--text-secondary)' }}>
              {activeCourse.source} · {activeCourse.area}
            </p>
            <div
              style={{
                height: '8px',
                backgroundColor: 'var(--border)',
                borderRadius: '4px',
                overflow: 'hidden',
                marginTop: 'var(--space-2)',
              }}
            >
              <div
                style={{
                  width: `${activeCourse.progress}%`,
                  height: '100%',
                  backgroundColor: 'var(--blue)',
                }}
              ></div>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
              Lesson {activeCourse.lessonsCompleted} of {activeCourse.totalLessons} · {activeCourse.progress}% complete
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)' }}>
              Estimated completion: {activeCourse.estimatedCompletion}
            </p>
          </div>
          <button
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
            Continue
          </button>
        </div>
        <h4 style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
          Other Courses
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {mockData.courses.slice(1).map((course) => (
            <div
              key={course.id}
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h5 style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
                  {course.name}
                </h5>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {course.source} · {course.area}
                </p>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                }}
              >
                {course.progress}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTopics = () => {
    return <div>Topics Tab</div>;
  };

  const renderNotes = () => {
    return <div>Notes Tab</div>;
  };

  const renderResources = () => {
    return <div>Resources Tab</div>;
  };

  return (
    <div className="learn" style={{ padding: 'var(--space-8)' }}>
      <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        {['Active Learning', 'Topics', 'Notes', 'Resources'].map((tab) => (
          <button
            key={tab}
            style={{
              backgroundColor: activeTab === tab ? 'var(--surface-raised)' : 'transparent',
              color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              fontFamily: 'var(--font-ui)',
              fontWeight: 'var(--weight-medium)',
              cursor: 'pointer',
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      {activeTab === 'Active Learning' && renderActiveLearning()}
      {activeTab === 'Topics' && renderTopics()}
      {activeTab === 'Notes' && renderNotes()}
      {activeTab === 'Resources' && renderResources()}
    </div>
  );
};

export default Learn;