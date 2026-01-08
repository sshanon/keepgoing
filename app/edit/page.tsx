'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Exercise } from '@/lib/types';
import { loadData, saveData, generateId } from '@/lib/storage';
import { ExerciseForm } from '@/components/ExerciseForm';

export default function EditPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const data = loadData();
    if (!data.onboarded) {
      router.push('/onboarding');
      return;
    }
    setExercises(data.exercises);
  }, [router]);

  const save = (newExercises: Exercise[]) => {
    setExercises(newExercises);
    const data = loadData();
    data.exercises = newExercises;
    saveData(data);
  };

  const addExercise = (name: string, reps: string) => {
    const newExercise: Exercise = {
      id: generateId(),
      name,
      reps,
      order: exercises.length,
    };
    save([...exercises, newExercise]);
  };

  const updateExercise = (id: string, name: string, reps: string) => {
    const updated = exercises.map(e =>
      e.id === id ? { ...e, name, reps } : e
    );
    save(updated);
    setEditingId(null);
  };

  const removeExercise = (id: string) => {
    if (exercises.length <= 1) {
      alert('You need at least one exercise!');
      return;
    }
    save(exercises.filter(e => e.id !== id));
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700" />

        <div className="relative max-w-md mx-auto px-4 pt-6 pb-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-black text-white">Edit Routine</h1>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 -mt-4">
        {/* Add exercise card */}
        <div className="bg-white rounded-2xl p-5 card-shadow mb-6">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
            Add new exercise
          </h2>
          <ExerciseForm onSave={addExercise} />
        </div>

        {/* Exercise list */}
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3 px-1">
            Your exercises ({exercises.length})
          </h2>
          <div className="space-y-2">
            {exercises.map((exercise, index) => (
              <div key={exercise.id}>
                {editingId === exercise.id ? (
                  <div className="p-4 bg-violet-50 rounded-xl border-2 border-violet-200 animate-in zoom-in">
                    <ExerciseForm
                      exercise={exercise}
                      onSave={(name, reps) => updateExercise(exercise.id, name, reps)}
                      onCancel={() => setEditingId(null)}
                      submitLabel="Save"
                    />
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-3 p-4 bg-white rounded-xl card-shadow animate-in slide-up"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 truncate">{exercise.name}</div>
                      <div className="text-sm text-slate-500">{exercise.reps} reps</div>
                    </div>
                    <button
                      onClick={() => setEditingId(exercise.id)}
                      className="p-2 text-slate-400 hover:text-violet-500 hover:bg-violet-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => removeExercise(exercise.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
