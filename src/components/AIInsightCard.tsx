import { ChevronDown, ChevronUp, RefreshCcw, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

interface AIInsightCardProps {
  screenId: string;
  contextData?: Record<string, unknown>;
  insight?: string;
  insights?: string[];
  onRefresh?: () => void;
  onAskCoach?: (insightText: string) => void;
}

export const AIInsightCard = ({ screenId, contextData, insight, insights, onRefresh, onAskCoach }: AIInsightCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [index, setIndex] = useState(0);

  const catalog = useMemo(() => {
    if (insights && insights.length > 0) return insights;
    if (insight) return [insight];
    return ["No insight available yet."];
  }, [insight, insights]);

  const activeInsight = catalog[index] ?? catalog[0];

  const refresh = () => {
    if (catalog.length > 1) {
      setIndex((current) => (current + 1) % catalog.length);
    }
    onRefresh?.();
  };

  return (
    <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-[14px]" style={{ borderLeft: "3px solid var(--primary)" }} data-screen-id={screenId} data-context-size={Object.keys(contextData ?? {}).length}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={14} strokeWidth={1.5} className="text-[var(--primary)]" />
          <span className="text-[11px] font-medium text-[var(--primary)]">AI insight</span>
        </div>
        <button type="button" className="tap-scale text-[var(--text-3)]" onClick={() => setExpanded((current) => !current)}>
          {expanded ? <ChevronUp size={14} strokeWidth={1.5} /> : <ChevronDown size={14} strokeWidth={1.5} />}
        </button>
      </div>

      <p className={`mt-2 text-[13px] italic leading-[1.6] text-[var(--text-2)] ${expanded ? "" : "line-clamp-1"}`}>{activeInsight}</p>

      <div className="mt-3 flex items-center justify-between gap-3">
        <button type="button" className="tap-scale inline-flex items-center gap-1 text-[11px] text-[var(--primary)]" onClick={() => onAskCoach?.(activeInsight)}>
          Ask coach about this →
        </button>
        <button type="button" className="tap-scale text-[var(--text-3)]" onClick={refresh} aria-label="Refresh insight">
          <RefreshCcw size={14} strokeWidth={1.5} />
        </button>
      </div>
    </section>
  );
};
