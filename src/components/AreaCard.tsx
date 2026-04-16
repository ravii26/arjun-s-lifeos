import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { LifeArea } from '@/types';
import { cn } from '@/lib/utils';
import { getAreaScoreTone } from '@/lib/lifeos';

interface AreaCardProps {
  area: LifeArea;
}

export function AreaCard({ area }: AreaCardProps) {
  const tone = getAreaScoreTone(area.score);
  const isLow = area.score < 35;

  return (
    <Link
      to={`/areas/${area.id}`}
      className={cn(
        'interactive block rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4 transition-colors duration-150 hover:bg-[var(--s3)]',
        isLow ? 'animate-creative-pulse' : '',
      )}
      style={{ borderLeft: `3px solid ${area.color}` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[14px] font-medium text-[var(--t1)]">{area.name}</div>
          <div className="mt-1 text-[11px] text-[var(--t3)]">{area.keyStat}</div>
        </div>
        <div className="flex items-center gap-1 text-[11px]" style={{ color: tone }}>
          <span>{area.scoreDelta >= 0 ? '↑' : '↓'}</span>
          <span>{Math.abs(area.scoreDelta)}</span>
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="text-[28px] font-medium leading-none" style={{ color: tone }}>
          {area.score}
        </div>
        <ArrowUpRight size={18} strokeWidth={1.5} className="text-[var(--t3)]" />
      </div>
    </Link>
  );
}
