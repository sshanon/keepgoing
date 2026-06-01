import { BookGoal } from './types';

export function getCurrentPage(book: BookGoal): number {
  if (book.logs.length === 0) return book.startPage;
  return [...book.logs].sort((a, b) => b.date.localeCompare(a.date))[0].pageNumber;
}

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getBookStreak(logs: BookGoal['logs'], today: string): number {
  const logDates = new Set(logs.map(l => l.date));
  let streak = 0;
  const date = new Date(today + 'T00:00:00');
  while (logDates.has(toDateStr(date))) {
    streak++;
    date.setDate(date.getDate() - 1);
  }
  return streak;
}

export function getPercentDone(book: BookGoal, currentPage: number): number {
  const totalReadable = book.totalPages - book.startPage;
  if (totalReadable <= 0) return 100;
  return Math.min(100, Math.round(((currentPage - book.startPage) / totalReadable) * 100));
}

export function getDaysLeft(book: BookGoal, currentPage: number): number {
  const pagesLeft = book.totalPages - currentPage;
  if (pagesLeft <= 0) return 0;
  return Math.ceil(pagesLeft / book.currentPace);
}

export function getFinishDate(book: BookGoal, currentPage: number, today: string): string {
  const daysLeft = getDaysLeft(book, currentPage);
  const date = new Date(today + 'T00:00:00');
  date.setDate(date.getDate() + daysLeft);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getTodayTargetPage(book: BookGoal, today: string): number {
  const start = new Date(book.startDate + 'T00:00:00');
  const now = new Date(today + 'T00:00:00');
  const daysElapsed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.min(book.totalPages, book.startPage + (daysElapsed + 1) * book.currentPace);
}
