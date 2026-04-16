import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '@/context/appState';
import { AreaCard } from '@/components/AreaCard';
import { TaskCard } from '@/components/TaskCard';
import { getAreaById } from '@/lib/lifeos';
import type { AreaId } from '@/types';

export function AreaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const area = id ? getAreaById(id as AreaId, state.areas) : undefined;

  if (!area) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={() => navigate('/dashboard')} className="interactive flex h-10 w-10 items-center justify-center rounded-full bg-[var(--s2)] text-[var(--t1)]">
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
        <div className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4 text-[var(--t2)]">Area not found.</div>
      </div>
    );
  }

  const areaTasks = state.tasks.filter((task) => task.areaId === area.id);
  const areaHabits = state.habits.filter((habit) => habit.areaId === area.id);
  const areaNotes = state.notes.filter((note) => note.areaId === area.id);

  return (
    <div className="space-y-6 pb-4">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => navigate(-1)} className="interactive flex h-10 w-10 items-center justify-center rounded-full bg-[var(--s2)] text-[var(--t1)]">
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
        <div>
          <div className="text-[22px] font-medium text-[var(--t1)]">{area.name}</div>
          <div className="text-[12px] text-[var(--t3)]">Score {area.score} · {area.keyStat}</div>
        </div>
      </div>

      <AreaCard area={area} />

      <section className="space-y-3">
        <div className="text-[16px] font-medium text-[var(--t1)]">Tasks</div>
        <div className="space-y-2">
          {areaTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              areaColor={area.color}
              areaName={area.name}
              onToggle={(taskId) => dispatch({ type: 'TOGGLE_TASK_STATUS', taskId })}
              onEdit={() => undefined}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="text-[16px] font-medium text-[var(--t1)]">Habits</div>
        <div className="space-y-2">
          {areaHabits.map((habit) => (
            <div key={habit.id} className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
              <div className="text-[14px] font-medium text-[var(--t1)]">{habit.name}</div>
              <div className="mt-1 text-[12px] text-[var(--t3)]">{habit.streak} day streak</div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="text-[16px] font-medium text-[var(--t1)]">Notes</div>
        <div className="space-y-2">
          {areaNotes.map((note) => (
            <div key={note.id} className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-4">
              <div className="text-[14px] font-medium text-[var(--t1)]">{note.title}</div>
              <div className="mt-1 text-[12px] text-[var(--t3)]">{note.body}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
