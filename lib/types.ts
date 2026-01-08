export type ExerciseType = 'weights' | 'yoga';

export interface Exercise {
  id: string;
  name: string;
  reps: string;
  order: number;
  type?: ExerciseType;
}

export interface DayLog {
  date: string; // "2026-01-08"
  completed: string[]; // exercise IDs
}

export interface AppData {
  exercises: Exercise[];
  logs: DayLog[];
  onboarded: boolean;
  lastStreakPrompt: Record<string, number>; // exerciseId -> streak when last prompted
}

export const DEFAULT_APP_DATA: AppData = {
  exercises: [],
  logs: [],
  onboarded: false,
  lastStreakPrompt: {},
};
