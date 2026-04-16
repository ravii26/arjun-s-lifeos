import * as React from 'react';
import { useApp } from '@/context/appState';

export function Review() {
  const { state, dispatch } = useApp();
  const [reflection, setReflection] = React.useState(state.weeklyReflection);

  React.useEffect(() => {
    setReflection(state.weeklyReflection);
  }, [state.weeklyReflection]);

  const save = () => {
    dispatch({ type: 'SAVE_REFLECTION', reflection });
  };

  return (
    <div className="space-y-6 pb-4">
      <div>
        <div className="text-[22px] font-medium text-[var(--t1)]">Review</div>
        <div className="text-[12px] text-[var(--t3)]">Daily rating, weekly reflection, and close-out notes.</div>
      </div>

      <section className="grid gap-3 md:grid-cols-2">
        <div className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
          <div className="text-[16px] font-medium text-[var(--t1)]">Day rating</div>
          <div className="mt-3 flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button key={value} type="button" onClick={() => dispatch({ type: 'SET_DAY_RATING', rating: value })} className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--s2)] text-[13px] font-medium text-[var(--t1)]">
                {value}
              </button>
            ))}
          </div>
          <div className="mt-3 text-[12px] text-[var(--t3)]">Current: {state.dayRating ?? 'none'}</div>
        </div>

        <div className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-4">
          <div className="text-[16px] font-medium text-[var(--t1)]">Check-ins</div>
          <div className="mt-3 space-y-2 text-[12px] text-[var(--t3)]">
            <div>Morning energy: {state.morningCheckIn.energy ?? 'unset'}</div>
            <div>Evening rating: {state.eveningCheckIn.rating ?? 'unset'}</div>
            <div>Evening note: {state.eveningCheckIn.note || 'none'}</div>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
        <div className="text-[16px] font-medium text-[var(--t1)]">Weekly reflection</div>
        {(['q1', 'q2', 'q3', 'q4', 'nextAreaFocus', 'commitment'] as const).map((field) => (
          <label key={field} className="block space-y-2">
            <div className="text-[12px] text-[var(--t3)]">{field}</div>
            <input
              value={reflection[field]}
              onChange={(event) => setReflection((current) => ({ ...current, [field]: event.target.value }))}
              className="h-10 w-full rounded-[10px] bg-[var(--s2)] px-3 text-[14px] text-[var(--t1)] outline-none"
            />
          </label>
        ))}
        <button type="button" onClick={save} className="h-11 rounded-[12px] bg-[var(--primary)] px-4 text-[14px] font-medium text-white">
          Save reflection
        </button>
      </section>
    </div>
  );
}
