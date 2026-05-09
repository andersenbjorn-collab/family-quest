'use client';

interface Props {
  value: number;
  max: number;
  color?: string;
  height?: string;
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

export default function ProgressBar({ value, max, color = '#6366f1', height = 'h-3', showLabel = false, animated = true, className = '' }: Props) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{value} poeng</span>
          <span>{pct}%</span>
        </div>
      )}
      <div className={`w-full bg-white/10 rounded-full overflow-hidden ${height}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${animated ? 'animate-pulse-slow' : ''}`}
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}cc, ${color})`, boxShadow: `0 0 8px ${color}80` }}
        />
      </div>
    </div>
  );
}
