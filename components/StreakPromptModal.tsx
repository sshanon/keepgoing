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
        <div className="text-6xl mb-4">💪</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Nice work!
        </h2>
        <p className="text-gray-600 mb-4">
          You've hit a <span className="font-semibold text-orange-600">{streak}-day streak</span> on {exercise.name}!
        </p>

        {isNumeric ? (
          <>
            <p className="text-gray-600 mb-6">
              Want to bump up your reps from <span className="font-semibold">{currentReps}</span> to <span className="font-semibold text-blue-600">{suggestedReps}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={onSkip}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all"
              >
                Not yet
              </button>
              <button
                onClick={onAccept}
                className="flex-1 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 active:scale-[0.98] transition-all"
              >
                Let's go!
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              Keep pushing! You can increase your {exercise.reps} in the Edit screen.
            </p>
            <button
              onClick={onSkip}
              className="w-full py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 active:scale-[0.98] transition-all"
            >
              Got it!
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
