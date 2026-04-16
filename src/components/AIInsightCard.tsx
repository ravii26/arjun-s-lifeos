import { ChevronDown, ChevronUp, RefreshCcw, Sparkles } from "lucide-react";
import { useState } from "react";

interface AIInsightCardProps {
  screenId: string;
  insight: string;
  onRefresh?: () => void;
  onAskCoach?: () => void;
}

export const AIInsightCard = ({ screenId, insight, onRefresh, onAskCoach }: AIInsightCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-[14px]" style={{ borderLeft: "3px solid var(--primary)" }} data-screen-id={screenId}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={14} strokeWidth={1.5} className="text-[var(--primary)]" />
          <span className="text-[11px] font-medium text-[var(--primary)]">AI insight</span>
        </div>
        <button type="button" className="tap-scale text-[var(--text-3)]" onClick={() => setExpanded((current) => !current)}>
          {expanded ? <ChevronUp size={14} strokeWidth={1.5} /> : <ChevronDown size={14} strokeWidth={1.5} />}
        </button>
      </div>

      <p className={`mt-2 text-[13px] italic leading-[1.6] text-[var(--text-2)] ${expanded ? "" : "line-clamp-1"}`}>{insight}</p>

      <div className="mt-3 flex items-center justify-between gap-3">
        <button type="button" className="tap-scale inline-flex items-center gap-1 text-[11px] text-[var(--primary)]" onClick={onAskCoach}>
          Ask coach about this →
        </button>
        <button type="button" className="tap-scale text-[var(--text-3)]" onClick={onRefresh} aria-label="Refresh insight">
          <RefreshCcw size={14} strokeWidth={1.5} />
        </button>
      </div>
    </section>
  );
};
