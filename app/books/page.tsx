'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookGoal } from '@/lib/types';
import { loadData, saveData, getToday, generateId } from '@/lib/storage';
import { getCurrentPage, getBookStreak, getPercentDone, getDaysLeft, getFinishDate } from '@/lib/bookUtils';

export default function BooksPage() {
  const router = useRouter();
  const [books, setBooks] = useState<BookGoal[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTotalPages, setNewTotalPages] = useState('');
  const [newPace, setNewPace] = useState('10');
  const today = getToday();

  useEffect(() => {
    setMounted(true);
    const data = loadData();
    setBooks(data.bookGoals);
  }, []);

  const handleAddBook = () => {
    const title = newTitle.trim();
    const totalPages = parseInt(newTotalPages);
    const pace = parseInt(newPace) || 10;
    if (!title || isNaN(totalPages) || totalPages < 1 || pace < 1) return;

    const newBook: BookGoal = {
      id: generateId(),
      title,
      totalPages,
      startPage: 0,
      startDate: today,
      currentPace: pace,
      logs: [],
    };

    const data = loadData();
    data.bookGoals.push(newBook);
    saveData(data);
    setBooks([...books, newBook]);
    setShowAddModal(false);
    setNewTitle('');
    setNewTotalPages('');
    setNewPace('10');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const activeBooks = books.filter(b => !b.completed);
  const completedBooks = books.filter(b => b.completed);

  const renderCard = (book: BookGoal) => {
    const currentPage = getCurrentPage(book);
    const pct = book.completed ? 100 : getPercentDone(book, currentPage);
    const daysLeft = getDaysLeft(book, currentPage);
    const finishDate = getFinishDate(book, currentPage, today);
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
            <p className="text-sm text-slate-500 mt-0.5">
              {book.completed ? `Finished at page ${currentPage}` : `Page ${currentPage} of ${book.totalPages}`}
            </p>
          </div>
          {book.completed ? (
            <span className="text-xs font-bold text-teal-700 bg-teal-100 px-2 py-1 rounded-full flex-shrink-0">
              Done ✓
            </span>
          ) : loggedToday ? (
            <span className="text-xs font-bold text-teal-700 bg-teal-100 px-2 py-1 rounded-full flex-shrink-0">
              Read today ✓
            </span>
          ) : null}
        </div>

        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500">
          <span className="font-medium">{pct}% done</span>
          {book.completed ? (
            <span className="text-teal-600 font-medium">Completed 🎉</span>
          ) : (
            <div className="flex items-center gap-3">
              {streak > 0 && (
                <span className="flex items-center gap-1">🔥 <span>{streak}d</span></span>
              )}
              <span>{daysLeft}d · {finishDate}</span>
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen pb-8">
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-cyan-500 to-sky-500 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative max-w-md mx-auto px-4 pt-8 pb-6">
          <div className="flex items-center justify-between">
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
            <button
              onClick={() => setShowAddModal(true)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-6 space-y-4">
        {activeBooks.map(renderCard)}

        {activeBooks.length === 0 && completedBooks.length === 0 && (
          <p className="text-center text-slate-500 py-12">No books yet. Tap + to add one.</p>
        )}

        {completedBooks.length > 0 && (
          <>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide pt-2 px-1">
              Completed
            </p>
            {completedBooks.map(renderCard)}
          </>
        )}
      </div>

      {/* Add book modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md animate-in slide-up"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-black text-slate-800 mb-5">Add a book</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">
                  Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Book title"
                  className="w-full p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-400 font-medium text-slate-800 placeholder:text-slate-300"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">
                    Total pages
                  </label>
                  <input
                    type="number"
                    value={newTotalPages}
                    onChange={e => setNewTotalPages(e.target.value)}
                    placeholder="300"
                    min={1}
                    className="w-full p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-400 font-medium text-slate-800 placeholder:text-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block">
                    Pages / day
                  </label>
                  <input
                    type="number"
                    value={newPace}
                    onChange={e => setNewPace(e.target.value)}
                    min={1}
                    className="w-full p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-400 font-medium text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3.5 font-bold rounded-xl bg-slate-100 text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBook}
                disabled={!newTitle.trim() || !newTotalPages}
                className="flex-1 py-3.5 font-bold rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 text-white disabled:opacity-40"
              >
                Add book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
