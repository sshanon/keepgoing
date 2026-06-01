'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Exercise, DayLog, AppData } from '@/lib/types';
import { loadData, saveData, getToday } from '@/lib/storage';
import { getExerciseStreak, getOverallStreak, shouldPromptIncrease } from '@/lib/streaks';
import { ExerciseItem } from '@/components/ExerciseItem';
import { Celebration } from '@/components/Celebration';
import { StreakPromptModal } from '@/components/StreakPromptModal';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function getDateLabel(dateStr: string, today: string): string {
  if (dateStr === today) return 'Today';

  const todayDate = new Date(today + 'T00:00:00');
  const yesterday = new Date(todayDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateStr === yesterdayStr) return 'Yesterday';

  return formatDate(dateStr);
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function SportsPage() {
  const router = useRouter();
  const [data, setData] = useState<AppData | null>(null);
  const [viewDate, setViewDate] = useState<string>('');
  const [dayLog, setDayLog] = useState<DayLog | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [streakPrompt, setStreakPrompt] = useState<{ exercise: Exercise; streak: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  const today = getToday();
  const isToday = viewDate === today;
  const canGoForward = viewDate < today;

  useEffect(() => {
    setMounted(true);
    const appData = loadData();

    if (!appData.onboarded) {
      router.push('/onboarding');
      return;
    }

    setData(appData);
    setViewDate(getToday());
  }, [router]);

  useEffect(() => {
    if (!data || !viewDate) return;

    const existingLog = data.logs.find(log => log.date === viewDate);
    setDayLog(existingLog || { date: viewDate, completed: [] });
  }, [data, viewDate]);

  const saveAndUpdate = useCallback((newData: AppData, newDayLog: DayLog) => {
    const logIndex = newData.logs.findIndex(log => log.date === viewDate);
    if (logIndex >= 0) {
      newData.logs[logIndex] = newDayLog;
    } else {
      newData.logs.push(newDayLog);
    }
    saveData(newData);
    setData({ ...newData });
    setDayLog({ ...newDayLog });
  }, [viewDate]);

  const toggleExercise = useCallback((exerciseId: string) => {
    if (!data || !dayLog) return;

    const isCompleted = dayLog.completed.includes(exerciseId);
    let newCompleted: string[];

    if (isCompleted) {
      newCompleted = dayLog.completed.filter(id => id !== exerciseId);
    } else {
      newCompleted = [...dayLog.completed, exerciseId];
    }

    const newDayLog = { ...dayLog, completed: newCompleted };
    saveAndUpdate(data, newDayLog);

    if (isToday && !isCompleted) {
      const exercise = data.exercises.find(e => e.id === exerciseId);
      if (exercise) {
        const streak = getExerciseStreak(exerciseId, [...data.logs.filter(l => l.date !== today), newDayLog], today);
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
  }, [data, dayLog, today, isToday, saveAndUpdate]);

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

  if (!mounted || !data || !dayLog || !viewDate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const overallStreak = getOverallStreak(data.exercises, data.logs, today);
  const completedCount = dayLog.completed.length;
  const totalCount = data.exercises.length;
  const allDone = completedCount === totalCount;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen pb-8">
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative max-w-md mx-auto px-4 pt-8 pb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={() => router.push('/')}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewDate(addDays(viewDate, -1))}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-2xl font-black text-white">
                  {getDateLabel(viewDate, today)}
                </h1>
                <button
                  onClick={() => canGoForward && setViewDate(addDays(viewDate, 1))}
                  disabled={!canGoForward}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-white/10"
                >
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <p className="text-white/70 font-medium text-sm">
                {formatDate(viewDate)}
              </p>
              {!isToday && (
                <button
                  onClick={() => setViewDate(today)}
                  className="mt-2 text-xs font-semibold text-white/90 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
                >
                  Back to Today
                </button>
              )}
            </div>
            <button
              onClick={() => router.push('/sports/edit')}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          {isToday && overallStreak > 0 && (
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

        <div className="space-y-3">
          {data.exercises.map((exercise, index) => {
            const isCompleted = dayLog.completed.includes(exercise.id);
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
                  streak={isToday ? streak : 0}
                  onToggle={() => toggleExercise(exercise.id)}
                />
              </div>
            );
          })}
        </div>

        {!isToday && (
          <p className="text-center text-sm text-slate-500 mt-6">
            Viewing {getDateLabel(viewDate, today).toLowerCase()}. Tap exercises to edit.
          </p>
        )}
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
