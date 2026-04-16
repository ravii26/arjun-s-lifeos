import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Circle, Layers3 } from 'lucide-react';
import { TaskCard } from '@/components/TaskCard';
import { useApp } from '@/context/appState';
import type { Priority, Task } from '@/types';
import { getAreaById } from '@/lib/lifeos';

const priorityOrder: Priority[] = ['P1', 'P2', 'P3'];

export function Focus() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const cyclePriority = (taskId: string) => {
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) {
      return;
    }

    const index = priorityOrder.indexOf(task.priority);
    const nextPriority = priorityOrder[(index + 1) % priorityOrder.length];
    dispatch({ type: 'UPDATE_TASK', taskId, updates: { priority: nextPriority } });
  };

  const toggleTask = (taskId: string) => dispatch({ type: 'TOGGLE_TASK_STATUS', taskId });
  const deleteTask = (taskId: string) => dispatch({ type: 'DELETE_TASK', taskId });

  const projectTasks = state.projects.flatMap((project) => project.tasks.map((taskId) => state.tasks.find((task) => task.id === taskId)).filter(Boolean) as Task[]);
  const remainingTasks = state.tasks.filter((task) => task.status !== 'done');
  const sortedTasks = [...remainingTasks].sort((left, right) => priorityOrder.indexOf(left.priority) - priorityOrder.indexOf(right.priority));

  return (
    <div className="space-y-6 pb-4">
      <div>
        <div className="text-[22px] font-medium text-[var(--t1)]">Focus</div>
        <div className="text-[12px] text-[var(--t3)]">Tasks and projects that need attention today.</div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[16px] font-medium text-[var(--t1)]">
          <Circle size={16} strokeWidth={1.5} className="text-[var(--primary)]" />
          Today
        </div>
        <div className="space-y-2">
          {sortedTasks.slice(0, 5).map((task) => {
            const area = getAreaById(task.areaId, state.areas);
            const projectName = state.projects.find((project) => project.id === task.projectId)?.title;
            return (
              <TaskCard
                key={task.id}
                task={task}
                areaColor={area?.color ?? 'var(--primary)'}
                areaName={area?.name ?? task.areaId}
                projectName={projectName}
                onToggle={toggleTask}
                onEdit={() => undefined}
                onDelete={deleteTask}
                onChangePriority={cyclePriority}
              />
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[16px] font-medium text-[var(--t1)]">
          <Layers3 size={16} strokeWidth={1.5} className="text-[var(--primary)]" />
          Projects
        </div>
        <div className="space-y-3">
          {state.projects.map((project) => (
            <div key={project.id} className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[14px] font-medium text-[var(--t1)]">{project.title}</div>
                  <div className="mt-1 text-[12px] text-[var(--t3)]">{project.description}</div>
                </div>
                <div className="rounded-full bg-[var(--s3)] px-2 py-0.5 text-[11px] text-[var(--t2)]">{project.status}</div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[var(--t3)]">
                {project.tasks.map((taskId) => {
                  const task = state.tasks.find((item) => item.id === taskId);
                  return task ? <span key={task.id} className="rounded-full bg-[var(--s3)] px-2 py-0.5">{task.title}</span> : null;
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-4 text-[12px] text-[var(--t2)]">
        {projectTasks.length} project-linked tasks are currently loaded. Navigate into habit tracking or the dashboard once the focus block is done.
      </section>
    </div>
  );
}
