'use client';

import { Exercise } from '@/lib/types';
import { StreakBadge } from './StreakBadge';
import { WeightsIcon, YogaIcon } from './ExerciseForm';

interface ExerciseItemProps {
  exercise: Exercise;
  isCompleted: boolean;
  streak: number;
  onToggle: () => void;
}

export function ExerciseItem({ exercise, isCompleted, streak, onToggle }: ExerciseItemProps) {
  const IconComponent = exercise.type === 'yoga' ? YogaIcon : WeightsIcon;

  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 active:scale-[0.98] ${
        isCompleted
          ? 'bg-gradient-to-r from-violet-500 to-indigo-500 card-shadow-hover'
          : 'bg-white card-shadow hover:card-shadow-hover'
      }`}
    >
      <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
        isCompleted
          ? 'bg-white/25'
          : 'bg-gradient-to-br from-violet-500 to-purple-600'
      }`}>
        {isCompleted ? (
          <svg className="w-5 h-5 text-white animate-in bounce-in" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <IconComponent className="w-5 h-5 text-white" />
        )}
      </div>

      <div className="flex-1 text-left">
        <div className={`font-semibold text-lg transition-colors duration-300 ${
          isCompleted ? 'text-white' : 'text-slate-800'
        }`}>
          {exercise.name}
        </div>
        <div className={`text-sm font-medium transition-colors duration-300 ${
          isCompleted ? 'text-white/75' : 'text-slate-500'
        }`}>
          {exercise.reps} reps
        </div>
      </div>

      <StreakBadge streak={streak} variant={isCompleted ? 'light' : 'default'} />
    </button>
  );
}
