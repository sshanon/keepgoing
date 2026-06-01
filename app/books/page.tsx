'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookGoal } from '@/lib/types';
import { loadData, getToday } from '@/lib/storage';
import { getCurrentPage, getBookStreak, getPercentDone, getDaysLeft } from '@/lib/bookUtils';

export default function BooksPage() {
  const router = useRouter();
  const [books, setBooks] = useState<BookGoal[]>([]);
  const [mounted, setMounted] = useState(false);
  const today = getToday();

  useEffect(() => {
    setMounted(true);
    const data = loadData();
    setBooks(data.bookGoals);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative max-w-md mx-auto px-4 pt-8 pb-12">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-black text-white">Books</h1>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 -mt-6 space-y-4">
        {books.map(book => {
          const currentPage = getCurrentPage(book);
          const pct = getPercentDone(book, currentPage);
          const daysLeft = getDaysLeft(book, currentPage);
          const streak = getBookStreak(book.logs, today);
          const loggedToday = book.logs.some(l => l.date === today);

          return (
            <button
              key={book.id}
              onClick={() => router.push(`/books/${book.id}`)}
              className="w-full text-left bg-white rounded-2xl p-5 card-shadow hover:card-shadow-hover transition-all duration-200 active:scale-[0.98]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 mr-3">
                  <h2 className="font-black text-slate-800 text-base leading-tight">{book.title}</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Page {currentPage} of {book.totalPages}</p>
                </div>
                {loggedToday && (
                  <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full flex-shrink-0">
                    Read today ✓
                  </span>
                )}
              </div>

              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-sm text-slate-500">
                <span className="font-medium">{pct}% done</span>
                <div className="flex items-center gap-3">
                  {streak > 0 && (
                    <span className="flex items-center gap-1">
                      🔥 <span>{streak}d</span>
                    </span>
                  )}
                  <span>{daysLeft} days left</span>
                </div>
              </div>
            </button>
          );
        })}

        {books.length === 0 && (
          <p className="text-center text-slate-500 py-12">No books configured yet.</p>
        )}
      </div>
    </div>
  );
}
