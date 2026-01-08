'use client';

import { Exercise } from '@/lib/types';
import { StreakBadge } from './StreakBadge';

interface ExerciseItemProps {
  exercise: Exercise;
  isCompleted: boolean;
  streak: number;
  onToggle: () => void;
}

export function ExerciseItem({ exercise, isCompleted, streak, onToggle }: ExerciseItemProps) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 active:scale-[0.98] ${
        isCompleted
          ? 'bg-green-50 border-2 border-green-200'
          : 'bg-gray-50 border-2 border-gray-100'
      }`}
    >
      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
        isCompleted
          ? 'bg-green-500 border-green-500'
          : 'border-gray-300'
      }`}>
        {isCompleted && (
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      <div className="flex-1 text-left">
        <div className={`font-medium ${isCompleted ? 'text-green-700' : 'text-gray-900'}`}>
          {exercise.name}
        </div>
        <div className={`text-sm ${isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
          {exercise.reps}
        </div>
      </div>

      <StreakBadge streak={streak} size="sm" />
    </button>
  );
}
