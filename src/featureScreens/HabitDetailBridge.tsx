import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '@/context/appState';
import { HabitDetail as LegacyHabitDetail } from '@/screens/HabitDetail';

export function HabitDetailBridge() {
  const { id } = useParams();
  const { state } = useApp();
  const habit = state.habits.find((item) => item.id === id);

  return (
    <div className="space-y-3 pb-4">
      {habit ? (
        <Link to={`/areas/${habit.areaId}`} className="inline-flex rounded-full bg-[var(--s3)] px-3 py-1 text-[12px] text-[var(--t2)]">
          Open {habit.areaId} area →
        </Link>
      ) : null}
      <LegacyHabitDetail />
    </div>
  );
}

export default HabitDetailBridge;
