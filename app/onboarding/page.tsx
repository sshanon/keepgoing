'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Exercise } from '@/lib/types';
import { loadData, saveData, generateId } from '@/lib/storage';
import { ExerciseForm } from '@/components/ExerciseForm';

export default function OnboardingPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const addExercise = (name: string, reps: string) => {
    const newExercise: Exercise = {
      id: generateId(),
      name,
      reps,
      order: exercises.length,
    };
    setExercises([...exercises, newExercise]);
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(e => e.id !== id));
  };

  const handleStart = () => {
    if (exercises.length === 0) return;

    const data = loadData();
    data.exercises = exercises;
    data.onboarded = true;
    saveData(data);

    router.push('/');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to KeepGoing
          </h1>
          <p className="text-gray-600">
            Set up your daily exercise routine
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Add your exercises
          </h2>
          <ExerciseForm onSave={addExercise} />
        </div>

        {exercises.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Your Routine ({exercises.length})
            </h3>
            <div className="space-y-2">
              {exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div>
                    <div className="font-medium text-gray-900">{exercise.name}</div>
                    <div className="text-sm text-gray-500">{exercise.reps}</div>
                  </div>
                  <button
                    onClick={() => removeExercise(exercise.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleStart}
          disabled={exercises.length === 0}
          className="w-full py-4 bg-green-500 text-white text-lg font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 active:scale-[0.98] transition-all"
        >
          {exercises.length === 0 ? 'Add at least one exercise' : "Let's Go!"}
        </button>
      </div>
    </div>
  );
}
