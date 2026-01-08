'use client';

interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'light';
}

export function StreakBadge({ streak, size = 'md', variant = 'default' }: StreakBadgeProps) {
  if (streak === 0) return null;

  const sizeClasses = {
    sm: 'text-sm px-2.5 py-1 gap-1',
    md: 'text-base px-3 py-1.5 gap-1.5',
    lg: 'text-lg px-4 py-2 gap-2',
  };

  const variantClasses = {
    default: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white',
    light: 'bg-white/20 text-white',
  };

  return (
    <div className={`inline-flex items-center rounded-full font-bold ${sizeClasses[size]} ${variantClasses[variant]}`}>
      <span className="animate-pulse">🔥</span>
      <span>{streak}</span>
    </div>
  );
}
