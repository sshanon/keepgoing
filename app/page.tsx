'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Exercise, DayLog, AppData } from '@/lib/types';
import { loadData, saveData, getToday } from '@/lib/storage';
import { getExerciseStreak, getOverallStreak, shouldPromptIncrease } from '@/lib/streaks';
import { ExerciseItem } from '@/components/ExerciseItem';
import { Celebration } from '@/components/Celebration';
import { StreakPromptModal } from '@/components/StreakPromptModal';
import { StreakBadge } from '@/components/StreakBadge';

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  const overallStreak = getOverallStreak(data.exercises, data.logs, today);
  const completedCount = todayLog.completed.length;
  const totalCount = data.exercises.length;
  const allDone = completedCount === totalCount;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Today</h1>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StreakBadge streak={overallStreak} size="lg" />
            <button
              onClick={() => router.push('/edit')}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </header>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-600">
              {completedCount} of {totalCount} done
            </span>
            {allDone && <span className="text-sm text-green-600 font-medium">Complete!</span>}
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          {data.exercises.map((exercise) => {
            const isCompleted = todayLog.completed.includes(exercise.id);
            const streak = getExerciseStreak(
              exercise.id,
              data.logs,
              today
            );

            return (
              <ExerciseItem
                key={exercise.id}
                exercise={exercise}
                isCompleted={isCompleted}
                streak={streak}
                onToggle={() => toggleExercise(exercise.id)}
              />
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
