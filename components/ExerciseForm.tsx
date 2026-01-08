'use client';

import { useState } from 'react';
import { Exercise } from '@/lib/types';

interface ExerciseFormProps {
  exercise?: Exercise;
  onSave: (name: string, reps: string) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function ExerciseForm({ exercise, onSave, onCancel, submitLabel = 'Add' }: ExerciseFormProps) {
  const [name, setName] = useState(exercise?.name || '');
  const [reps, setReps] = useState(exercise?.reps || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && reps.trim()) {
      onSave(name.trim(), reps.trim());
      if (!exercise) {
        setName('');
        setReps('');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Exercise name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
        />
        <input
          type="text"
          placeholder="Reps (e.g. 15)"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          className="w-28 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!name.trim() || !reps.trim()}
          className="flex-1 py-3 bg-blue-500 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 active:scale-[0.98] transition-all"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
