import { AppData, DEFAULT_APP_DATA } from './types';

const STORAGE_KEY = 'keepgoing_data';

export function loadData(): AppData {
  if (typeof window === 'undefined') {
    return DEFAULT_APP_DATA;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as AppData;
    }
  } catch (e) {
    console.error('Failed to load data:', e);
  }

  return DEFAULT_APP_DATA;
}

export function saveData(data: AppData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

export function getToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
