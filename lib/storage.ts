import { AppData, BookGoal, DEFAULT_APP_DATA } from './types';

const STORAGE_KEY = 'keepgoing_data';

// Hardcoded book catalog — add new books here to make them appear in the app
const BOOK_CATALOG: Omit<BookGoal, 'logs'>[] = [
  {
    id: 'construction-mgmt-jumpstart',
    title: 'Construction Management Jumpstart',
    totalPages: 484,
    startPage: 50,
    startDate: '2026-06-01',
    currentPace: 10,
  },
];

export function loadData(): AppData {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_APP_DATA, bookGoals: BOOK_CATALOG.map(b => ({ ...b, logs: [] })) };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let data: AppData;

    if (stored) {
      data = JSON.parse(stored) as AppData;
      if (!data.bookGoals) data.bookGoals = [];
    } else {
      data = { ...DEFAULT_APP_DATA };
    }

    // Ensure every catalog book exists (preserves existing logs and pace changes)
    let changed = false;
    for (const bookDef of BOOK_CATALOG) {
      if (!data.bookGoals.find(b => b.id === bookDef.id)) {
        data.bookGoals.push({ ...bookDef, logs: [] });
        changed = true;
      }
    }

    if (changed) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    return data;
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
