import React, { useState } from 'react';
import { useApp, AREA_COLORS, TAG_COLORS, TAG_BG_COLORS, type LifeArea, type LearnNote, type NoteType } from '../context/AppContext';
import { Icons } from '../components/Icons';

const AREA_SHORT: Record<LifeArea, string> = {
  'Career & Skills': 'Career', 'Health & Body': 'Health', 'Mind & Learning': 'Mind',
  'Finance': 'Finance', 'Relationships': 'Relationships', 'Creative': 'Creative',
};
const ALL_AREAS: LifeArea[] = ['Career & Skills', 'Health & Body', 'Mind & Learning', 'Finance', 'Relationships', 'Creative'];
const NOTE_TYPES: NoteType[] = ['Topic notes', 'Book summary', 'Course notes', 'Mental model', 'Reference'];
const NOTE_TYPE_COLORS: Record<NoteType, string> = {
  'Topic notes': 'var(--primary)',
  'Book summary': 'var(--area-mind)',
  'Course notes': 'var(--teal)',
  'Mental model': 'var(--amber)',
  'Reference': 'var(--text-muted)',
};
const NOTE_TYPE_BG: Record<NoteType, string> = {
  'Topic notes': 'var(--primary-muted-bg)',
  'Book summary': 'rgba(74,144,217,0.12)',
  'Course notes': 'var(--teal-muted-bg)',
  'Mental model': 'var(--amber-muted-bg)',
  'Reference': 'var(--surface-3)',
};

const BottomSheet = ({ open, onClose, children, fullHeight }: { open: boolean; onClose: () => void; children: React.ReactNode; fullHeight?: boolean }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100 }} onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
      <div onClick={e => e.stopPropagation()} style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--surface-2)',
        borderRadius: '20px 20px 0 0', padding: '12px 20px 32px',
        maxHeight: fullHeight ? '95vh' : '80vh', overflowY: 'auto',
        animation: 'slideUp 250ms cubic-bezier(0.32, 0.72, 0, 1)',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--surface-3)', margin: '0 auto 20px' }} />
        {children}
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </div>
  );
};

/* ===================== COURSES TAB ===================== */

interface Lesson { id: string; title: string; status: 'done' | 'current' | 'locked'; }
interface Module { id: string; title: string; status: 'done' | 'in-progress' | 'locked'; lessons: Lesson[]; }

const courseModules: Module[] = [
  { id: 'm1', title: 'Node.js Fundamentals', status: 'done', lessons: [
    { id: 'l1', title: 'What is Node.js?', status: 'done' },
    { id: 'l2', title: 'Event loop & async', status: 'done' },
    { id: 'l3', title: 'Modules & require', status: 'done' },
    { id: 'l4', title: 'File system basics', status: 'done' },
  ]},
  { id: 'm2', title: 'REST APIs', status: 'in-progress', lessons: [
    { id: 'l5', title: 'HTTP methods', status: 'done' },
    { id: 'l6', title: 'Express setup', status: 'done' },
    { id: 'l7', title: 'Building your first route', status: 'current' },
    { id: 'l8', title: 'Middleware', status: 'locked' },
    { id: 'l9', title: 'Error handling', status: 'locked' },
  ]},
  { id: 'm3', title: 'Databases', status: 'locked', lessons: [] },
  { id: 'm4', title: 'Auth & Security', status: 'locked', lessons: [] },
];

const CoursesTab = () => {
  const [showTree, setShowTree] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({ m1: false, m2: true });
  const [showLesson, setShowLesson] = useState(false);
  const [lessonTab, setLessonTab] = useState<'learn' | 'notes'>('learn');
  const [showSwitchConfirm, setShowSwitchConfirm] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);

  const toggleModule = (id: string) => setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  const completedLessons = 6;
  const totalLessons = 12;
  const progress = (completedLessons / totalLessons) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* One course rule */}
      <div style={{
        background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderLeft: '3px solid var(--primary)',
        borderRadius: 14, padding: '16px 20px',
      }}>
        <p style={{ fontSize: 14, color: 'var(--text-primary)', margin: 0 }}>One course at a time. Finish what you started.</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, marginBottom: 0 }}>Switch only after completing or consciously pausing.</p>
      </div>

      {/* Active course */}
      <div style={{
        background: 'var(--surface-2)', border: '0.5px solid var(--border-strong)', borderRadius: 14, padding: 20,
      }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: 'var(--primary-muted-bg)', color: 'var(--primary)' }}>Active course</span>
          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: 'var(--surface-3)', color: 'var(--text-muted)' }}>Udemy</span>
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 500, margin: '0 0 8px' }}>Node.js & Express — Backend Fundamentals</h3>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '2px 8px', borderRadius: 20,
          background: `color-mix(in srgb, var(--area-career) 15%, transparent)`, color: 'var(--area-career)',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--area-career)' }} />
          Career
        </span>

        {/* Progress */}
        <div style={{ margin: '16px 0 8px' }}>
          <div style={{ height: 8, borderRadius: 14, background: 'var(--surface-3)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--primary)', borderRadius: 14, transition: 'width 300ms ease' }} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{completedLessons} of {totalLessons} lessons complete</span>
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 20,
            background: 'var(--amber-muted-bg)', color: 'var(--amber)',
          }}>33%</span>
        </div>

        {/* Next lesson */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, padding: 12,
          background: 'var(--surface-3)', borderRadius: 10,
        }}>
          <span style={{ display: 'flex', color: 'var(--text-muted)' }}>{Icons.book()}</span>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1 }}>Next: Module 2 · Lesson 3 — Building your first route</span>
        </div>

        <button onClick={() => setShowLesson(true)} className="interactive" style={{
          width: '100%', marginTop: 12, padding: '12px', borderRadius: 14,
          background: 'var(--primary)', color: '#fff', fontSize: 14, fontWeight: 500,
          border: 'none', cursor: 'pointer', fontFamily: 'Inter',
        }}>Continue →</button>

        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <button onClick={() => setShowSwitchConfirm(true)} style={{
            background: 'none', border: 'none', fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'Inter',
          }}>Switch active course</button>
        </div>

        {/* Expandable tree toggle */}
        <button onClick={() => setShowTree(!showTree)} style={{
          display: 'flex', alignItems: 'center', gap: 6, marginTop: 12,
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, fontFamily: 'Inter',
        }}>
          <span style={{ display: 'flex', transform: showTree ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms ease' }}>
            {Icons.chevronDown()}
          </span>
          {showTree ? 'Hide lessons' : 'Show all lessons'}
        </button>
      </div>

      {/* Course tree */}
      {showTree && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, animation: 'fade-in-up 200ms ease' }}>
          {courseModules.map(mod => (
            <div key={mod.id}>
              <button onClick={() => mod.status !== 'locked' && toggleModule(mod.id)} style={{
                display: 'flex', alignItems: 'center', width: '100%', padding: '10px 12px', gap: 8,
                background: 'none', border: 'none', cursor: mod.status === 'locked' ? 'default' : 'pointer',
                fontFamily: 'Inter', opacity: mod.status === 'locked' ? 0.5 : 1,
              }}>
                {mod.status === 'done' && <span style={{ display: 'flex' }}>{Icons.checkCircle()}</span>}
                {mod.status === 'locked' && <span style={{ display: 'flex', color: 'var(--text-muted)' }}>{Icons.lockSmall()}</span>}
                {mod.status === 'in-progress' && <span style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid var(--primary)' }} />}
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', flex: 1, textAlign: 'left' }}>{mod.title}</span>
                {mod.status !== 'locked' && (
                  <span style={{ display: 'flex', transform: expandedModules[mod.id] ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 150ms' }}>
                    {Icons.chevronDown()}
                  </span>
                )}
              </button>
              {expandedModules[mod.id] && mod.lessons.length > 0 && (
                <div style={{ paddingLeft: 32, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {mod.lessons.map(lesson => (
                    <div key={lesson.id} onClick={() => lesson.status === 'current' && setShowLesson(true)} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                      borderLeft: lesson.status === 'current' ? '2px solid var(--primary)' : '2px solid transparent',
                      opacity: lesson.status === 'locked' ? 0.5 : 1,
                      cursor: lesson.status === 'current' ? 'pointer' : 'default',
                    }}>
                      {lesson.status === 'done' && <span style={{ display: 'flex' }}>{Icons.checkCircle()}</span>}
                      {lesson.status === 'current' && <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)' }} />}
                      {lesson.status === 'locked' && <span style={{ display: 'flex', color: 'var(--text-muted)' }}>{Icons.lockSmall()}</span>}
                      <span style={{ fontSize: 13, color: lesson.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)' }}>{lesson.title}</span>
                      {lesson.status === 'current' && (
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--primary-muted-bg)', color: 'var(--primary)', marginLeft: 'auto' }}>Resume →</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Saved courses */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 500 }}>All courses</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>3</span>
        </div>
        {[
          { title: 'DSA Masterclass — Blind 75', area: 'Career & Skills' as LifeArea, source: 'NeetCode', lessons: 20 },
          { title: 'Personal Finance 101', area: 'Finance' as LifeArea, source: 'Book', lessons: 8 },
        ].map((course, i) => (
          <div key={i} onClick={() => setShowSwitchConfirm(true)} className="interactive" style={{
            background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: 14,
            padding: '16px', opacity: 0.7, marginBottom: 8, cursor: 'pointer',
          }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{course.title}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '2px 8px', borderRadius: 20,
                background: `color-mix(in srgb, ${AREA_COLORS[course.area]} 15%, transparent)`, color: AREA_COLORS[course.area],
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: AREA_COLORS[course.area] }} />
                {AREA_SHORT[course.area]}
              </span>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--surface-3)', color: 'var(--text-muted)' }}>{course.source}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{course.lessons} lessons</span>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--surface-3)', color: 'var(--text-muted)' }}>Not started</span>
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button onClick={() => setShowAddCourse(true)} className="interactive" style={{
        position: 'fixed', bottom: 80, right: 20, width: 56, height: 56, borderRadius: '50%',
        background: 'var(--primary)', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', zIndex: 40,
      }}>{Icons.plus()}</button>

      {/* Lesson view */}
      <BottomSheet open={showLesson} onClose={() => setShowLesson(false)} fullHeight>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <button onClick={() => setShowLesson(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}>{Icons.arrowLeft()}</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 500 }}>Building Your First Route</div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Module 2 · Lesson 3</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4, background: 'var(--surface-3)', borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: 20 }}>
          {(['learn', 'notes'] as const).map(t => (
            <button key={t} onClick={() => setLessonTab(t)} style={{
              padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: lessonTab === t ? 'var(--primary)' : 'transparent',
              color: lessonTab === t ? '#fff' : 'var(--text-muted)',
              fontSize: 12, fontWeight: 500, fontFamily: 'Inter',
            }}>{t === 'learn' ? 'Learn' : 'My Notes'}</button>
          ))}
        </div>

        {lessonTab === 'learn' ? (
          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 16 }}>Building Your First Route</h2>
            <p style={{ fontSize: 14, marginBottom: 16 }}>Express.js makes it simple to create HTTP endpoints. A route is defined by an HTTP method, a URL path, and a handler function that processes the request and sends a response.</p>
            <p style={{ fontSize: 14, marginBottom: 16 }}>The most common HTTP methods you'll use are GET (retrieve data), POST (create data), PUT (update data), and DELETE (remove data). Express provides methods for each: app.get(), app.post(), etc.</p>
            <div style={{
              background: '#1a1a2e', borderRadius: 10, padding: 16, margin: '16px 0', fontFamily: 'monospace', fontSize: 13,
              color: '#e0e0ff', overflow: 'auto',
            }}>
              <pre style={{ margin: 0 }}>{`app.get('/users', (req, res) => {
  res.json({ users: [] });
});`}</pre>
            </div>
            <p style={{ fontSize: 14, marginBottom: 16 }}>The handler function receives two objects: req (the request, containing parameters, query strings, and body data) and res (the response, which you use to send data back to the client).</p>
            <p style={{ fontSize: 14 }}>Route parameters let you capture values from the URL. For example, /users/:id would match /users/123, and you can access 123 via req.params.id.</p>
          </div>
        ) : (
          <div style={{ padding: '20px 0', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No notes for this lesson yet.</p>
            <button style={{
              marginTop: 12, background: 'var(--primary-muted-bg)', color: 'var(--primary)',
              border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter',
            }}>Add one →</button>
          </div>
        )}

        <div style={{
          position: 'sticky', bottom: 0, background: 'var(--surface-2)', padding: '12px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '0.5px solid var(--border)',
        }}>
          <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter' }}>← Previous</button>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>3 / 12</span>
          <button className="interactive" style={{
            background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8,
            padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter',
          }}>Mark done & next →</button>
        </div>
      </BottomSheet>

      {/* Switch confirm */}
      <BottomSheet open={showSwitchConfirm} onClose={() => setShowSwitchConfirm(false)}>
        <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>Switch active course?</h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>This will pause your current course. You can resume it anytime.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowSwitchConfirm(false)} style={{
            flex: 1, padding: '12px', borderRadius: 14, border: 'none', cursor: 'pointer',
            background: 'var(--primary)', color: '#fff', fontSize: 14, fontWeight: 500, fontFamily: 'Inter',
          }}>Yes, switch</button>
          <button onClick={() => setShowSwitchConfirm(false)} style={{
            flex: 1, padding: '12px', borderRadius: 14, border: 'none', cursor: 'pointer',
            background: 'var(--surface-3)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 500, fontFamily: 'Inter',
          }}>Cancel</button>
        </div>
      </BottomSheet>

      {/* Add course */}
      <BottomSheet open={showAddCourse} onClose={() => setShowAddCourse(false)}>
        <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 20 }}>Add course</h3>
        <input placeholder="Course title" style={{
          width: '100%', fontSize: 16, background: 'transparent', border: 'none',
          borderBottom: '1px solid var(--border-strong)', padding: '8px 0 12px',
          color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
        }} />
        <div style={{ fontSize: 12, color: 'var(--text-muted)', margin: '16px 0 8px' }}>Area</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {ALL_AREAS.map(a => (
            <button key={a} style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20,
              fontSize: 11, cursor: 'pointer', fontFamily: 'Inter', border: '0.5px solid var(--border)',
              background: 'var(--surface-3)', color: 'var(--text-muted)',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: AREA_COLORS[a] }} />
              {AREA_SHORT[a]}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Source</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {['Udemy', 'YouTube', 'Book', 'Self-made', 'Mentor'].map(s => (
            <button key={s} style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
              border: '0.5px solid var(--border)', background: 'var(--surface-3)',
              color: 'var(--text-muted)', fontFamily: 'Inter',
            }}>{s}</button>
          ))}
        </div>
        <button className="interactive" style={{
          width: '100%', padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer',
          background: 'var(--primary)', color: '#fff', fontSize: 14, fontWeight: 500, fontFamily: 'Inter',
        }}>Save course →</button>
      </BottomSheet>
    </div>
  );
};

/* ===================== NOTES TAB ===================== */

const NotesTab = () => {
  const { notes, addNote, addTask, updateNoteTaskCount } = useApp();
  const [areaFilter, setAreaFilter] = useState<LifeArea | 'All'>('All');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNote, setShowNote] = useState<LearnNote | null>(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const [addStep, setAddStep] = useState<1 | 2>(1);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<NoteType>('Topic notes');
  const [newArea, setNewArea] = useState<LifeArea>('Career & Skills');
  const [newSource, setNewSource] = useState('');
  const [newKeyPoints, setNewKeyPoints] = useState<string[]>(['']);
  const [newBody, setNewBody] = useState('');

  const filtered = notes.filter(n => {
    if (areaFilter !== 'All' && n.area !== areaFilter) return false;
    if (searchQuery && !n.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleCreateTask = (note: LearnNote) => {
    addTask({
      title: `Apply: ${note.title}`,
      area: note.area,
      priority: 'P2',
      completed: false,
      isToday: false,
    });
    updateNoteTaskCount(note.id);
  };

  const handleAddNote = () => {
    if (!newTitle.trim()) return;
    addNote({
      title: newTitle.trim(),
      type: newType,
      area: newArea,
      keyPoints: newKeyPoints.filter(kp => kp.trim()),
      source: newSource || undefined,
      daysAgo: 0,
      tasksCreated: 0,
      body: newBody || undefined,
    });
    setNewTitle(''); setNewSource(''); setNewKeyPoints(['']); setNewBody('');
    setAddStep(1); setShowAddNote(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        <button onClick={() => setAreaFilter('All')} style={{
          padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer', fontFamily: 'Inter', flexShrink: 0,
          border: 'none',
          background: areaFilter === 'All' ? 'var(--primary)' : 'var(--surface-3)',
          color: areaFilter === 'All' ? '#fff' : 'var(--text-muted)',
        }}>All</button>
        {ALL_AREAS.map(a => (
          <button key={a} onClick={() => setAreaFilter(a)} style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 20,
            fontSize: 12, cursor: 'pointer', fontFamily: 'Inter', border: 'none', flexShrink: 0,
            background: areaFilter === a ? `color-mix(in srgb, ${AREA_COLORS[a]} 15%, transparent)` : 'var(--surface-3)',
            color: areaFilter === a ? AREA_COLORS[a] : 'var(--text-muted)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: AREA_COLORS[a] }} />
            {AREA_SHORT[a]}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {NOTE_TYPES.map(t => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: NOTE_TYPE_COLORS[t] }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t}</span>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(note => (
          <div key={note.id} onClick={() => setShowNote(note)} className="interactive" style={{
            background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: 14,
            padding: '16px 20px', cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 20,
                background: NOTE_TYPE_BG[note.type], color: NOTE_TYPE_COLORS[note.type],
              }}>{note.type}</span>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: AREA_COLORS[note.area] }} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>{note.title}</div>
            <p style={{
              fontSize: 13, color: 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap',
              overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{note.keyPoints[0] || ''}</p>
            {note.source && <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', margin: '4px 0 0' }}>From: {note.source}</p>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{note.daysAgo === 0 ? 'Today' : `${note.daysAgo}d ago`}</span>
              {note.tasksCreated > 0 && (
                <span style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 20,
                  background: 'var(--teal-muted-bg)', color: 'var(--teal)',
                }}>{note.tasksCreated} task{note.tasksCreated > 1 ? 's' : ''} created →</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button onClick={() => setShowAddNote(true)} className="interactive" style={{
        position: 'fixed', bottom: 80, right: 20, width: 56, height: 56, borderRadius: '50%',
        background: 'var(--primary)', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', zIndex: 40,
      }}>{Icons.plus()}</button>

      {/* Note detail */}
      <BottomSheet open={!!showNote} onClose={() => setShowNote(null)} fullHeight>
        {showNote && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <button onClick={() => setShowNote(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}>{Icons.arrowLeft()}</button>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 500 }}>{showNote.title}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <span style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 20,
                    background: `color-mix(in srgb, ${AREA_COLORS[showNote.area]} 15%, transparent)`, color: AREA_COLORS[showNote.area],
                  }}>{AREA_SHORT[showNote.area]}</span>
                  <span style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 20,
                    background: NOTE_TYPE_BG[showNote.type], color: NOTE_TYPE_COLORS[showNote.type],
                  }}>{showNote.type}</span>
                </div>
              </div>
            </div>

            {/* Notes body */}
            {showNote.body && (
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Notes</span>
                <div style={{ marginTop: 8, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {showNote.body.split('\n').map((line, i) => {
                    if (line.startsWith('# ')) return <h2 key={i} style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-primary)', margin: '16px 0 8px' }}>{line.slice(2)}</h2>;
                    if (line.startsWith('## ')) return <h3 key={i} style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)', margin: '12px 0 6px' }}>{line.slice(3)}</h3>;
                    if (line.startsWith('```')) return null;
                    if (line.startsWith('- ')) return <div key={i} style={{ paddingLeft: 16, margin: '4px 0' }}>• {line.slice(2)}</div>;
                    if (line.trim() === '') return <div key={i} style={{ height: 8 }} />;
                    return <p key={i} style={{ margin: '4px 0' }}>{line}</p>;
                  })}
                </div>
              </div>
            )}

            {/* Key points */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Key points</span>
                <span style={{ display: 'flex', color: 'var(--text-muted)' }}>{Icons.info()}</span>
              </div>
              {showNote.keyPoints.map((kp, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '0.5px solid var(--border)' }}>
                  <span style={{ display: 'flex', color: 'var(--text-muted)' }}>{Icons.drag()}</span>
                  <span style={{ flex: 1, fontSize: 14, color: 'var(--text-primary)' }}>{kp}</span>
                  <span style={{ display: 'flex', color: 'var(--text-muted)', cursor: 'pointer' }}>{Icons.trash()}</span>
                </div>
              ))}
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{showNote.keyPoints.length}/5</div>
            </div>

            {showNote.source && (
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Source</span>
                <div style={{ marginTop: 4, fontSize: 14, color: 'var(--text-secondary)' }}>{showNote.source}</div>
              </div>
            )}

            <button onClick={() => { handleCreateTask(showNote); }} className="interactive" style={{
              width: '100%', padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: 'var(--primary-muted-bg)', color: 'var(--primary)', fontSize: 14, fontWeight: 500, fontFamily: 'Inter',
            }}>Create task from this note</button>
          </div>
        )}
      </BottomSheet>

      {/* Add note */}
      <BottomSheet open={showAddNote} onClose={() => { setShowAddNote(false); setAddStep(1); }} fullHeight={addStep === 2}>
        {addStep === 1 ? (
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 20 }}>New note</h3>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} autoFocus placeholder="Note title" style={{
              width: '100%', fontSize: 16, background: 'transparent', border: 'none',
              borderBottom: '1px solid var(--border-strong)', padding: '8px 0 12px',
              color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
            }} />
            <div style={{ fontSize: 12, color: 'var(--text-muted)', margin: '16px 0 8px' }}>Type</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {NOTE_TYPES.map(t => (
                <button key={t} onClick={() => setNewType(t)} style={{
                  padding: '6px 12px', borderRadius: 20, fontSize: 11, cursor: 'pointer', fontFamily: 'Inter',
                  border: newType === t ? `1px solid ${NOTE_TYPE_COLORS[t]}` : '0.5px solid var(--border)',
                  background: newType === t ? NOTE_TYPE_BG[t] : 'var(--surface-3)',
                  color: newType === t ? NOTE_TYPE_COLORS[t] : 'var(--text-muted)',
                }}>{t}</button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Area</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {ALL_AREAS.map(a => (
                <button key={a} onClick={() => setNewArea(a)} style={{
                  display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20,
                  fontSize: 11, cursor: 'pointer', fontFamily: 'Inter',
                  border: newArea === a ? `1px solid ${AREA_COLORS[a]}` : '0.5px solid var(--border)',
                  background: newArea === a ? `color-mix(in srgb, ${AREA_COLORS[a]} 15%, transparent)` : 'var(--surface-3)',
                  color: newArea === a ? AREA_COLORS[a] : 'var(--text-muted)',
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: AREA_COLORS[a] }} />
                  {AREA_SHORT[a]}
                </button>
              ))}
            </div>
            <input value={newSource} onChange={e => setNewSource(e.target.value)} placeholder="Source (optional)" style={{
              width: '100%', fontSize: 14, background: 'var(--surface-3)', border: '0.5px solid var(--border)',
              borderRadius: 8, padding: '8px 12px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter', marginBottom: 20,
            }} />
            <button onClick={() => newTitle.trim() && setAddStep(2)} className="interactive" style={{
              width: '100%', padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: 'var(--primary)', color: '#fff', fontSize: 14, fontWeight: 500, fontFamily: 'Inter',
            }}>Start writing →</button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <button onClick={() => setAddStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}>{Icons.arrowLeft()}</button>
              <span style={{ fontSize: 16, fontWeight: 500 }}>{newTitle}</span>
              <button onClick={handleAddNote} style={{
                background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8,
                padding: '6px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter',
              }}>Save note</button>
            </div>
            <textarea value={newBody} onChange={e => setNewBody(e.target.value)} placeholder="Write your notes here..." rows={10} style={{
              width: '100%', fontSize: 14, background: 'var(--surface-3)', border: '0.5px solid var(--border)',
              borderRadius: 10, padding: 12, color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter', resize: 'none', lineHeight: 1.7,
            }} />
            <div style={{ marginTop: 16, padding: '12px 0', borderTop: '0.5px solid var(--border)' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Key points</span>
              {newKeyPoints.map((kp, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input value={kp} onChange={e => {
                    const updated = [...newKeyPoints]; updated[i] = e.target.value; setNewKeyPoints(updated);
                  }} placeholder={`Key point ${i + 1}`} style={{
                    flex: 1, fontSize: 13, background: 'var(--surface-3)', border: '0.5px solid var(--border)',
                    borderRadius: 6, padding: '6px 10px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
                  }} />
                </div>
              ))}
              {newKeyPoints.length < 5 && (
                <button onClick={() => setNewKeyPoints([...newKeyPoints, ''])} style={{
                  marginTop: 8, background: 'none', border: 'none', color: 'var(--primary)', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter',
                }}>+ Add key point</button>
              )}
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};

/* ===================== RESOURCES TAB ===================== */

const ResourcesTab = () => {
  const { pendingResources, decidePendingResource, addTask, addNote, pastActions } = useApp();
  const [inputText, setInputText] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [resultState, setResultState] = useState<'suggestion' | 'change' | 'accepted'>('suggestion');
  const activePending = pendingResources.filter(pr => !pr.decided);

  const areaSlots: Record<string, string> = {};
  ALL_AREAS.forEach(a => {
    const count = activePending.filter(pr => pr.area === a).length;
    if (count > 0) areaSlots[AREA_SHORT[a]] = `${count}/3`;
  });

  const handleProcess = () => {
    if (!inputText.trim()) return;
    setShowResult(true);
    setResultState('suggestion');
  };

  const handleAccept = () => {
    setResultState('accepted');
    addNote({
      title: 'Redis pub/sub pattern',
      type: 'Topic notes',
      area: 'Career & Skills',
      keyPoints: ['Pub/sub pattern in Redis'],
      daysAgo: 0,
      tasksCreated: 0,
    });
    addTask({
      title: 'Implement Redis pub/sub in practice project',
      area: 'Career & Skills',
      priority: 'P2',
      completed: false,
      isToday: false,
    });
    setTimeout(() => { setShowResult(false); setInputText(''); setResultState('suggestion'); }, 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Shelf status in header area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 16, fontWeight: 500 }}>Resources</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{activePending.length} of 15 slots used</span>
      </div>

      {/* Philosophy banner */}
      <div style={{
        background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderLeft: '3px solid var(--amber)',
        borderRadius: 14, padding: '16px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          {Icons.sparkle()}
          <p style={{ fontSize: 14, color: 'var(--text-primary)', margin: 0 }}>Paste anything. AI will figure out what to do with it.</p>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, marginBottom: 0 }}>Max 3 pending per life area. Action one before adding more.</p>
      </div>

      {/* Input */}
      <div>
        <textarea
          value={inputText} onChange={e => setInputText(e.target.value)}
          placeholder="Paste a link, quote, video URL, idea, or anything..."
          rows={4}
          style={{
            width: '100%', fontSize: 14, background: 'var(--surface-2)', border: '0.5px solid var(--border-strong)',
            borderRadius: 14, padding: 16, color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter', resize: 'none',
          }}
        />
        <button onClick={handleProcess} className="interactive" style={{
          width: '100%', marginTop: 8, padding: '12px', borderRadius: 14, border: 'none', cursor: 'pointer',
          background: 'var(--primary)', color: '#fff', fontSize: 14, fontWeight: 500, fontFamily: 'Inter',
        }}>Process this →</button>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>No save-for-later without a decision. Action, schedule, or reject.</p>
      </div>

      {/* AI result */}
      {showResult && (
        <div className="animate-fade-in-up" style={{
          background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderLeft: '3px solid var(--primary)',
          borderRadius: 14, padding: 20,
        }}>
          {resultState === 'accepted' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--teal)' }}>
              {Icons.checkCircle()}
              <span style={{ fontSize: 14 }}>Done. Note added to Learn. Task added to Career backlog.</span>
            </div>
          ) : resultState === 'suggestion' ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                {Icons.sparkle()}
                <span style={{ fontSize: 12, color: 'var(--primary)' }}>AI processed this</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '2px 8px', borderRadius: 20,
                  background: `color-mix(in srgb, var(--area-career) 15%, transparent)`, color: 'var(--area-career)',
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--area-career)' }} />
                  Career
                </span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--surface-3)', color: 'var(--text-muted)' }}>Technical resource</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px' }}>
                This is about Redis pub/sub pattern — a backend engineering concept. Relevant to your Career growth.
              </p>
              <div style={{
                background: 'var(--primary-muted-bg)', borderRadius: 10, padding: 12, marginBottom: 16,
                fontSize: 13, color: 'var(--primary)', lineHeight: 1.5,
              }}>
                Add to Learn as a note + Create task: "Implement Redis pub/sub in practice project" (P2, Career)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={handleAccept} className="interactive" style={{
                  width: '100%', padding: '12px', borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: 'var(--primary)', color: '#fff', fontSize: 14, fontWeight: 500, fontFamily: 'Inter',
                }}>Accept suggestion</button>
                <button onClick={() => setResultState('change')} className="interactive" style={{
                  width: '100%', padding: '12px', borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: 'var(--surface-3)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 500, fontFamily: 'Inter',
                }}>Change it</button>
                <button onClick={() => setShowResult(false)} style={{
                  width: '100%', padding: '10px', border: 'none', cursor: 'pointer',
                  background: 'transparent', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'Inter',
                }}>Reject</button>
              </div>
            </>
          ) : (
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Where to send this?</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {['Note', 'Task', 'Habit', 'Vault'].map(opt => (
                  <button key={opt} onClick={() => { setShowResult(false); setInputText(''); }} className="interactive" style={{
                    padding: 16, borderRadius: 14, border: '0.5px solid var(--border)',
                    background: 'var(--surface-3)', color: 'var(--text-primary)',
                    fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter',
                  }}>{opt}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pending shelf */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 500 }}>Pending decisions</span>
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 20,
            background: 'var(--surface-2)', color: 'var(--text-muted)',
          }}>{activePending.length}</span>
        </div>
        {activePending.map(item => (
          <div key={item.id} style={{
            background: 'var(--surface-1)', border: '0.5px solid var(--border)',
            borderLeft: item.daysAgo >= 3 ? '2px solid var(--amber)' : '0.5px solid var(--border)',
            borderRadius: 14, padding: 16, marginBottom: 8,
            background2: item.daysAgo >= 3 ? 'var(--amber-muted-bg)' : undefined,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{item.title}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '2px 8px', borderRadius: 20,
                    background: `color-mix(in srgb, ${AREA_COLORS[item.area]} 15%, transparent)`, color: AREA_COLORS[item.area],
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: AREA_COLORS[item.area] }} />
                    {AREA_SHORT[item.area]}
                  </span>
                  <span style={{ fontSize: 12, color: item.daysAgo >= 3 ? 'var(--amber)' : 'var(--text-muted)' }}>{item.daysAgo}d ago</span>
                </div>
              </div>
              <button onClick={() => decidePendingResource(item.id)} className="interactive" style={{
                padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: 'var(--primary-muted-bg)', color: 'var(--primary)',
                fontSize: 12, fontWeight: 500, fontFamily: 'Inter', flexShrink: 0,
              }}>Decide →</button>
            </div>
          </div>
        ))}
        {/* Area limit */}
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
          {Object.entries(areaSlots).map(([area, slots]) => `${area} ${slots}`).join(' · ') || 'No pending items'}
        </div>
      </div>

      {/* Past actions */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 500 }}>Past actions</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pastActions.length}</span>
        </div>
        {pastActions.map(action => {
          const actionColor = action.action.includes('habit') ? 'var(--teal)' : action.action.includes('notes') ? 'var(--primary)' : action.action.includes('Vault') ? 'var(--primary)' : 'var(--surface-3)';
          const actionBg = action.action.includes('habit') ? 'var(--teal-muted-bg)' : action.action.includes('notes') ? 'var(--primary-muted-bg)' : action.action.includes('Vault') ? 'var(--primary-muted-bg)' : 'var(--surface-3)';
          return (
            <div key={action.id} style={{
              background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: 14,
              padding: '12px 16px', marginBottom: 8,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{action.title}</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
                  <span style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 20,
                    background: `color-mix(in srgb, ${AREA_COLORS[action.area]} 15%, transparent)`, color: AREA_COLORS[action.area],
                  }}>{AREA_SHORT[action.area]}</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: actionBg, color: actionColor }}>{action.action}</span>
                  {action.detail && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{action.detail}</span>}
                </div>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>{action.daysAgo}d ago</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ===================== MAIN LEARN COMPONENT ===================== */

const Learn = () => {
  const [tab, setTab] = useState<'courses' | 'notes' | 'resources'>('courses');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {searchOpen ? (
          <input
            autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
            placeholder="Search..."
            style={{
              flex: 1, fontSize: 16, background: 'transparent', border: 'none',
              borderBottom: '1px solid var(--border-strong)', padding: '4px 0',
              color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter',
            }}
          />
        ) : (
          <span style={{ fontSize: 22, fontWeight: 500 }}>Learn</span>
        )}
        <button onClick={() => setSearchOpen(!searchOpen)} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex',
        }}>{Icons.search()}</button>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--surface-2)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {(['courses', 'notes', 'resources'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: tab === t ? 'var(--primary)' : 'transparent',
            color: tab === t ? '#fff' : 'var(--text-muted)',
            fontSize: 13, fontWeight: 500, fontFamily: 'Inter',
            transition: 'background 150ms ease, color 150ms ease',
            textTransform: 'capitalize',
          }}>{t}</button>
        ))}
      </div>

      {tab === 'courses' && <CoursesTab />}
      {tab === 'notes' && <NotesTab />}
      {tab === 'resources' && <ResourcesTab />}
    </div>
  );
};

export default Learn;
