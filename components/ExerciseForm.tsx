'use client';

import { useState } from 'react';
import { Exercise, ExerciseType } from '@/lib/types';

interface ExerciseFormProps {
  exercise?: Exercise;
  onSave: (name: string, reps: string, type: ExerciseType) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

function WeightsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5h-2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1z" />
      <path d="M17.5 6.5h2a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z" />
      <path d="M7.5 12h9" />
      <path d="M3.5 10v4" />
      <path d="M20.5 10v4" />
    </svg>
  );
}

function YogaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="2" />
      <path d="M12 6v4" />
      <path d="M8 14l4-4 4 4" />
      <path d="M6 18l6-4 6 4" />
    </svg>
  );
}

export function ExerciseForm({ exercise, onSave, onCancel, submitLabel = 'Add' }: ExerciseFormProps) {
  const [name, setName] = useState(exercise?.name || '');
  const [reps, setReps] = useState(exercise?.reps || '');
  const [type, setType] = useState<ExerciseType>(exercise?.type || 'weights');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && reps.trim()) {
      onSave(name.trim(), reps.trim(), type);
      if (!exercise) {
        setName('');
        setReps('');
        setType('weights');
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

      {/* Type selector */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setType('weights')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${
            type === 'weights'
              ? 'border-violet-500 bg-violet-50 text-violet-700'
              : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
          }`}
        >
          <WeightsIcon className="w-5 h-5" />
          <span className="font-medium">Weights</span>
        </button>
        <button
          type="button"
          onClick={() => setType('yoga')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${
            type === 'yoga'
              ? 'border-violet-500 bg-violet-50 text-violet-700'
              : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
          }`}
        >
          <YogaIcon className="w-5 h-5" />
          <span className="font-medium">Yoga</span>
        </button>
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

export { WeightsIcon, YogaIcon };
