import { DayLog, Exercise } from './types';

function getPreviousDate(dateStr: string): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

export function getExerciseStreak(
  exerciseId: string,
  logs: DayLog[],
  today: string
): number {
  const logMap = new Map(logs.map(log => [log.date, log.completed]));

  let streak = 0;
  let currentDate = today;

  while (true) {
    const completed = logMap.get(currentDate);
    if (completed && completed.includes(exerciseId)) {
      streak++;
      currentDate = getPreviousDate(currentDate);
    } else {
      break;
    }
  }

  return streak;
}

export function getOverallStreak(
  exercises: Exercise[],
  logs: DayLog[],
  today: string
): number {
  if (exercises.length === 0) return 0;

  const exerciseIds = new Set(exercises.map(e => e.id));
  const logMap = new Map(logs.map(log => [log.date, new Set(log.completed)]));

  let streak = 0;
  let currentDate = today;

  while (true) {
    const completedSet = logMap.get(currentDate);
    if (!completedSet) break;

    const allDone = [...exerciseIds].every(id => completedSet.has(id));
    if (allDone) {
      streak++;
      currentDate = getPreviousDate(currentDate);
    } else {
      break;
    }
  }

  return streak;
}

export function shouldPromptIncrease(
  exerciseId: string,
  currentStreak: number,
  lastPrompted: number | undefined
): boolean {
  if (currentStreak < 10) return false;

  const milestone = Math.floor(currentStreak / 10) * 10;
  const lastMilestone = lastPrompted ? Math.floor(lastPrompted / 10) * 10 : 0;

  return milestone > lastMilestone;
}
