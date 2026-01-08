'use client';

import { Modal } from './Modal';
import { Exercise } from '@/lib/types';

interface StreakPromptModalProps {
  exercise: Exercise | null;
  streak: number;
  onAccept: () => void;
  onSkip: () => void;
}

export function StreakPromptModal({ exercise, streak, onAccept, onSkip }: StreakPromptModalProps) {
  if (!exercise) return null;

  const currentReps = parseInt(exercise.reps) || 0;
  const suggestedReps = currentReps + 2;
  const isNumeric = !isNaN(currentReps) && !exercise.reps.includes('s');

  return (
    <Modal isOpen={true} onClose={onSkip}>
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <span className="text-4xl">💪</span>
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">
          Nice work!
        </h2>
        <p className="text-slate-600 mb-6">
          You've hit a <span className="font-bold text-orange-500">{streak}-day streak</span> on {exercise.name}!
        </p>

        {isNumeric ? (
          <>
            <div className="bg-slate-50 rounded-2xl p-4 mb-6">
              <p className="text-slate-600 mb-2">Ready to level up?</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl font-bold text-slate-400">{currentReps}</span>
                <svg className="w-6 h-6 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span className="text-2xl font-black text-violet-600">{suggestedReps}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onSkip}
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 active:scale-[0.98] transition-all"
              >
                Not yet
              </button>
              <button
                onClick={onAccept}
                className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Let's go!
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-slate-600 mb-6">
              Keep pushing! You can update your target in the Edit screen.
            </p>
            <button
              onClick={onSkip}
              className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Got it!
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
