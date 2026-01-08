'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Exercise, ExerciseType } from '@/lib/types';
import { loadData, saveData, generateId } from '@/lib/storage';
import { ExerciseForm, WeightsIcon, YogaIcon } from '@/components/ExerciseForm';

export default function OnboardingPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const addExercise = (name: string, reps: string, type: ExerciseType) => {
    const newExercise: Exercise = {
      id: generateId(),
      name,
      reps,
      type,
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
    <div className="min-h-screen">
      {/* Header */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative max-w-md mx-auto px-4 pt-12 pb-16 text-center">
          <div className="text-6xl mb-4 animate-float">💪</div>
          <h1 className="text-3xl font-black text-white mb-2">
            Welcome to KeepGoing
          </h1>
          <p className="text-white/70 font-medium">
            Build your daily exercise routine
          </p>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 -mt-6 pb-8">
        {/* Add exercise card */}
        <div className="bg-white rounded-2xl p-5 card-shadow mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            Add your exercises
          </h2>
          <ExerciseForm onSave={addExercise} />
        </div>

        {/* Exercise list */}
        {exercises.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3 px-1">
              Your Routine ({exercises.length})
            </h3>
            <div className="space-y-2">
              {exercises.map((exercise, index) => {
                const IconComponent = exercise.type === 'yoga' ? YogaIcon : WeightsIcon;
                return (
                  <div
                    key={exercise.id}
                    className="flex items-center justify-between p-4 bg-white rounded-xl card-shadow animate-in slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{exercise.name}</div>
                        <div className="text-sm text-slate-500">{exercise.reps} reps</div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeExercise(exercise.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Start button */}
        <button
          onClick={handleStart}
          disabled={exercises.length === 0}
          className={`w-full py-4 text-lg font-bold rounded-2xl transition-all duration-300 active:scale-[0.98] ${
            exercises.length === 0
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white card-shadow hover:card-shadow-hover'
          }`}
        >
          {exercises.length === 0 ? 'Add at least one exercise' : "Let's Go!"}
        </button>
      </div>
    </div>
  );
}
