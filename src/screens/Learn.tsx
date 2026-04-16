import * as React from 'react';
import { useApp } from '@/context/appState';

export function Learn() {
  const { state } = useApp();

  return (
    <div className="space-y-6 pb-4">
      <div>
        <div className="text-[22px] font-medium text-[var(--t1)]">Learn</div>
        <div className="text-[12px] text-[var(--t3)]">Notes, topics, courses, and resources.</div>
      </div>

      <section className="space-y-3">
        <div className="text-[16px] font-medium text-[var(--t1)]">Notes</div>
        <div className="space-y-2">
          {state.notes.map((note) => (
            <div key={note.id} className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
              <div className="text-[14px] font-medium text-[var(--t1)]">{note.title}</div>
              <div className="mt-1 text-[12px] text-[var(--t3)]">{note.body}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="text-[16px] font-medium text-[var(--t1)]">Courses</div>
        <div className="space-y-2">
          {state.courses.map((course) => (
            <div key={course.id} className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[14px] font-medium text-[var(--t1)]">{course.title}</div>
                  <div className="text-[12px] text-[var(--t3)]">{course.source}</div>
                </div>
                <div className="text-[12px] text-[var(--primary)]">{course.completedLessons}/{course.totalLessons}</div>
              </div>
              <div className="mt-3 space-y-2">
                {course.modules.map((module) => (
                  <div key={module.id} className="rounded-[12px] bg-[var(--s1)] p-3">
                    <div className="text-[12px] font-medium text-[var(--t1)]">{module.title}</div>
                    <div className="mt-2 text-[11px] text-[var(--t3)]">
                      {module.lessons.map((lesson) => lesson.title).join(' · ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="text-[16px] font-medium text-[var(--t1)]">Resources</div>
        <div className="space-y-2">
          {state.resources.map((resource) => (
            <div key={resource.id} className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[14px] font-medium text-[var(--t1)]">{resource.content}</div>
                  <div className="mt-1 text-[12px] text-[var(--t3)]">{resource.type ?? 'resource'} · {resource.status}</div>
                </div>
                <div className="rounded-full bg-[var(--s3)] px-2 py-0.5 text-[11px] text-[var(--t2)]">{resource.daysAgo}d</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
