'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Exercise, DayLog, AppData } from '@/lib/types';
import { loadData, saveData, getToday } from '@/lib/storage';
import { getExerciseStreak, getOverallStreak, shouldPromptIncrease } from '@/lib/streaks';
import { ExerciseItem } from '@/components/ExerciseItem';
import { Celebration } from '@/components/Celebration';
import { StreakPromptModal } from '@/components/StreakPromptModal';

export default function TodayPage() {
  const router = useRouter();
  const [data, setData] = useState<AppData | null>(null);
  const [todayLog, setTodayLog] = useState<DayLog | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [streakPrompt, setStreakPrompt] = useState<{ exercise: Exercise; streak: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  const today = getToday();

  useEffect(() => {
    setMounted(true);
    const appData = loadData();

    if (!appData.onboarded) {
      router.push('/onboarding');
      return;
    }

    setData(appData);

    const existingLog = appData.logs.find(log => log.date === today);
    setTodayLog(existingLog || { date: today, completed: [] });
  }, [router, today]);

  const saveAndUpdate = useCallback((newData: AppData, newTodayLog: DayLog) => {
    const logIndex = newData.logs.findIndex(log => log.date === today);
    if (logIndex >= 0) {
      newData.logs[logIndex] = newTodayLog;
    } else {
      newData.logs.push(newTodayLog);
    }
    saveData(newData);
    setData({ ...newData });
    setTodayLog({ ...newTodayLog });
  }, [today]);

  const toggleExercise = useCallback((exerciseId: string) => {
    if (!data || !todayLog) return;

    const isCompleted = todayLog.completed.includes(exerciseId);
    let newCompleted: string[];

    if (isCompleted) {
      newCompleted = todayLog.completed.filter(id => id !== exerciseId);
    } else {
      newCompleted = [...todayLog.completed, exerciseId];
    }

    const newTodayLog = { ...todayLog, completed: newCompleted };
    saveAndUpdate(data, newTodayLog);

    if (!isCompleted) {
      const exercise = data.exercises.find(e => e.id === exerciseId);
      if (exercise) {
        const streak = getExerciseStreak(exerciseId, [...data.logs.filter(l => l.date !== today), newTodayLog], today);
        const lastPrompted = data.lastStreakPrompt[exerciseId];

        if (shouldPromptIncrease(exerciseId, streak, lastPrompted)) {
          setStreakPrompt({ exercise, streak });
        }
      }

      const allDone = data.exercises.every(e => newCompleted.includes(e.id));
      if (allDone) {
        setShowCelebration(true);
      }
    }
  }, [data, todayLog, today, saveAndUpdate]);

  const handleAcceptIncrease = useCallback(() => {
    if (!data || !streakPrompt) return;

    const currentReps = parseInt(streakPrompt.exercise.reps) || 0;
    const newReps = currentReps + 2;

    const newExercises = data.exercises.map(e =>
      e.id === streakPrompt.exercise.id ? { ...e, reps: String(newReps) } : e
    );

    const newData = {
      ...data,
      exercises: newExercises,
      lastStreakPrompt: {
        ...data.lastStreakPrompt,
        [streakPrompt.exercise.id]: streakPrompt.streak,
      },
    };

    saveData(newData);
    setData(newData);
    setStreakPrompt(null);
  }, [data, streakPrompt]);

  const handleSkipIncrease = useCallback(() => {
    if (!data || !streakPrompt) return;

    const newData = {
      ...data,
      lastStreakPrompt: {
        ...data.lastStreakPrompt,
        [streakPrompt.exercise.id]: streakPrompt.streak,
      },
    };

    saveData(newData);
    setData(newData);
    setStreakPrompt(null);
  }, [data, streakPrompt]);

  if (!mounted || !data || !todayLog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const overallStreak = getOverallStreak(data.exercises, data.logs, today);
  const completedCount = todayLog.completed.length;
  const totalCount = data.exercises.length;
  const allDone = completedCount === totalCount;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative max-w-md mx-auto px-4 pt-8 pb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-black text-white mb-1">Today</h1>
              <p className="text-white/70 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
            <button
              onClick={() => router.push('/edit')}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          {/* Streak display */}
          {overallStreak > 0 && (
            <div className="inline-flex items-center gap-3 px-5 py-3 bg-white/15 backdrop-blur-sm rounded-2xl">
              <span className="text-3xl animate-pulse">🔥</span>
              <div>
                <div className="text-2xl font-black text-white">{overallStreak}</div>
                <div className="text-xs text-white/70 font-medium uppercase tracking-wide">day streak</div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Progress section */}
      <div className="max-w-md mx-auto px-4 pt-6">
        <div className="bg-white rounded-2xl p-4 card-shadow mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-600">
              {completedCount} of {totalCount} completed
            </span>
            {allDone && (
              <span className="text-sm font-bold text-violet-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Complete!
              </span>
            )}
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Exercise list */}
        <div className="space-y-3">
          {data.exercises.map((exercise, index) => {
            const isCompleted = todayLog.completed.includes(exercise.id);
            const streak = getExerciseStreak(exercise.id, data.logs, today);

            return (
              <div
                key={exercise.id}
                className="animate-in slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ExerciseItem
                  exercise={exercise}
                  isCompleted={isCompleted}
                  streak={streak}
                  onToggle={() => toggleExercise(exercise.id)}
                />
              </div>
            );
          })}
        </div>
      </div>

      <Celebration
        show={showCelebration}
        streak={overallStreak}
        onDismiss={() => setShowCelebration(false)}
      />

      {streakPrompt && (
        <StreakPromptModal
          exercise={streakPrompt.exercise}
          streak={streakPrompt.streak}
          onAccept={handleAcceptIncrease}
          onSkip={handleSkipIncrease}
        />
      )}
    </div>
  );
}
