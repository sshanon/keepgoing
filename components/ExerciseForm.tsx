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
          className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-violet-500 focus:outline-none transition-all text-slate-800 placeholder:text-slate-400"
        />
        <input
          type="text"
          placeholder="Reps"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          className="w-24 px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-violet-500 focus:outline-none transition-all text-slate-800 placeholder:text-slate-400 text-center"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!name.trim() || !reps.trim()}
          className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98] transition-all"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 active:scale-[0.98] transition-all"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
