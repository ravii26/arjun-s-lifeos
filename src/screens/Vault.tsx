import * as React from 'react';
import { useApp } from '@/context/appState';

export function Vault() {
  const { state } = useApp();

  return (
    <div className="space-y-6 pb-4">
      <div>
        <div className="text-[22px] font-medium text-[var(--t1)]">Vault</div>
        <div className="text-[12px] text-[var(--t3)]">Captured wins, notes, quotes, and loose thoughts.</div>
      </div>

      <section className="space-y-3">
        <div className="text-[16px] font-medium text-[var(--t1)]">Items</div>
        <div className="space-y-2">
          {state.vaultItems.map((item) => (
            <div key={item.id} className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[14px] font-medium text-[var(--t1)]">{item.content}</div>
                  <div className="mt-1 text-[12px] text-[var(--t3)]">{item.type} · {item.tag}</div>
                </div>
                <div className="rounded-full bg-[var(--s3)] px-2 py-0.5 text-[11px] text-[var(--t2)]">{item.daysAgo}d</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
