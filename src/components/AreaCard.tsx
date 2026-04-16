import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { LifeArea } from "../data/types";

interface AreaCardProps {
  area: LifeArea;
  onClick: () => void;
}

const scoreColor = (score: number): string => {
  if (score >= 65) {
    return "var(--teal)";
  }
  if (score >= 35) {
    return "var(--amber)";
  }
  return "var(--text-3)";
};

export const AreaCard = ({ area, onClick }: AreaCardProps) => {
  const delta = area.scoreDelta;
  const trendColor = delta > 0 ? "var(--teal)" : delta < 0 ? "var(--amber)" : "var(--text-3)";
  const TrendIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`hover-surface tap-scale w-full rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4 text-left transition-colors ${
        area.score < 35 ? "animate-border-pulse" : ""
      }`}
      style={{ borderLeft: `3px solid ${area.color}` }}
    >
      <p className="text-[13px] font-medium text-[var(--text-1)]">{area.name}</p>
      <p className="mt-2 text-[24px] font-medium leading-none" style={{ color: scoreColor(area.score) }}>
        {area.score}
      </p>
      <div className="mt-2 flex items-center gap-1 text-caption" style={{ color: trendColor }}>
        <TrendIcon size={12} strokeWidth={1.5} />
        <span>{delta > 0 ? `+${delta}` : delta}</span>
      </div>
      <p className="mt-2 text-caption text-[var(--text-3)]">{area.keyStat}</p>
    </button>
  );
};
