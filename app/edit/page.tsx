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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/')}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">Edit Routine</h1>
          <div className="w-10" />
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Add new exercise
          </h2>
          <ExerciseForm onSave={addExercise} />
        </div>

        <div>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Your exercises ({exercises.length})
          </h2>
          <div className="space-y-2">
            {exercises.map((exercise) => (
              <div key={exercise.id}>
                {editingId === exercise.id ? (
                  <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                    <ExerciseForm
                      exercise={exercise}
                      onSave={(name, reps) => updateExercise(exercise.id, name, reps)}
                      onCancel={() => setEditingId(null)}
                      submitLabel="Save"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{exercise.name}</div>
                      <div className="text-sm text-gray-500">{exercise.reps}</div>
                    </div>
                    <button
                      onClick={() => setEditingId(exercise.id)}
                      className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => removeExercise(exercise.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
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
