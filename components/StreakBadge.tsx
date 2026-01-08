'use client';

interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
}

export function StreakBadge({ streak, size = 'md' }: StreakBadgeProps) {
  if (streak === 0) return null;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <span className={`inline-flex items-center gap-1 ${sizeClasses[size]}`}>
      <span className="animate-pulse">🔥</span>
      <span className="font-semibold text-orange-600">{streak}</span>
    </span>
  );
}
