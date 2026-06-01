'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { BookGoal } from '@/lib/types';
import { loadData, saveData, getToday } from '@/lib/storage';
import {
  getCurrentPage,
  getBookStreak,
  getPercentDone,
  getDaysLeft,
  getFinishDate,
  getTodayTargetPage,
} from '@/lib/bookUtils';

export default function BookDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [book, setBook] = useState<BookGoal | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showReadModal, setShowReadModal] = useState(false);
  const [showPaceModal, setShowPaceModal] = useState(false);
  const [pageInput, setPageInput] = useState('');
  const [paceInput, setPaceInput] = useState('');

  const today = getToday();

  useEffect(() => {
    setMounted(true);
    const data = loadData();
    const found = data.bookGoals.find(b => b.id === id);
    if (found) {
      setBook(found);
    } else {
      router.push('/books');
    }
  }, [id, router]);

  const persistBook = (updatedBook: BookGoal) => {
    const data = loadData();
    const idx = data.bookGoals.findIndex(b => b.id === updatedBook.id);
    if (idx >= 0) data.bookGoals[idx] = updatedBook;
    saveData(data);
    setBook(updatedBook);
  };

  const openReadModal = () => {
    if (!book) return;
    const todayLog = book.logs.find(l => l.date === today);
    setPageInput(todayLog ? String(todayLog.pageNumber) : String(getCurrentPage(book)));
    setShowReadModal(true);
  };

  const handleMarkRead = () => {
    if (!book) return;
    const page = parseInt(pageInput);
    if (isNaN(page) || page <= book.startPage || page > book.totalPages) return;
    const newLogs = [...book.logs.filter(l => l.date !== today), { date: today, pageNumber: page }];
    persistBook({ ...book, logs: newLogs });
    setShowReadModal(false);
  };

  const openPaceModal = () => {
    if (!book) return;
    setPaceInput(String(book.currentPace));
    setShowPaceModal(true);
  };

  const handleChangePace = () => {
    if (!book) return;
    const pace = parseInt(paceInput);
    if (isNaN(pace) || pace < 1) return;
    persistBook({ ...book, currentPace: pace });
    setShowPaceModal(false);
  };

  if (!mounted || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const currentPage = getCurrentPage(book);
  const pct = getPercentDone(book, currentPage);
  const pagesLeft = book.totalPages - currentPage;
  const daysLeft = getDaysLeft(book, currentPage);
  const finishDate = getFinishDate(book, currentPage, today);
  const streak = getBookStreak(book.logs, today);
  const targetPageToday = getTodayTargetPage(book, today);
  const todayLog = book.logs.find(l => l.date === today);
  const loggedToday = !!todayLog;
  const onTrack = loggedToday && todayLog.pageNumber >= targetPageToday;

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-cyan-500 to-sky-500 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative max-w-md mx-auto px-4 pt-8 pb-6">
          <button
            onClick={() => router.push('/books')}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors mb-4 inline-flex"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-black text-white leading-snug mb-3">{book.title}</h1>
          {streak > 0 && (
            <div className="inline-flex items-center gap-3 px-4 py-2.5 bg-white/15 backdrop-blur-sm rounded-2xl">
              <span className="text-2xl animate-pulse">🔥</span>
              <div>
                <div className="text-xl font-black text-white">{streak}</div>
                <div className="text-xs text-white/70 font-medium uppercase tracking-wide">day streak</div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-6 space-y-4">
        {/* Progress card */}
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="text-4xl font-black text-slate-800">{pct}%</div>
              <div className="text-sm text-slate-500">complete</div>
            </div>
            <div className="text-right">
              <div className="text-base font-bold text-slate-700">
                p.{currentPage} <span className="text-slate-400 font-normal">/ {book.totalPages}</span>
              </div>
              <div className="text-sm text-slate-500">{pagesLeft} pages left</div>
            </div>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Stats card */}
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <div className="text-3xl font-black text-slate-800">{daysLeft}</div>
              <div className="text-xs text-slate-500 font-medium mt-1">days · {finishDate}</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <div className="text-3xl font-black text-slate-800">{book.currentPace}</div>
              <div className="text-xs text-slate-500 font-medium mt-1">pages / day</div>
            </div>
          </div>
        </div>

        {/* Today's reading card */}
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="font-bold text-slate-800 mb-0.5">Today&apos;s reading</div>
              {loggedToday ? (
                <div className="text-sm text-slate-500">
                  Read to page {todayLog.pageNumber}
                  {onTrack
                    ? <span className="ml-1.5 text-teal-600 font-semibold">· On track!</span>
                    : <span className="ml-1.5 text-slate-400">· Goal was p.{targetPageToday}</span>
                  }
                </div>
              ) : (
                <div className="text-sm text-slate-500">
                  Goal: reach page <span className="font-semibold text-slate-700">{targetPageToday}</span>
                </div>
              )}
            </div>
            {loggedToday && (
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 ml-3">
                <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          <button
            onClick={openReadModal}
            className="w-full py-3.5 font-bold rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 text-white transition-all active:scale-[0.98]"
          >
            {loggedToday ? 'Update today\'s reading' : 'Mark today\'s reading'}
          </button>
        </div>

        {/* Pace card */}
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-800">Reading pace</div>
              <div className="text-sm text-slate-500 mt-0.5">{book.currentPace} pages per day</div>
            </div>
            <button
              onClick={openPaceModal}
              className="px-4 py-2 text-sm font-bold text-teal-700 bg-teal-100 hover:bg-teal-200 rounded-xl transition-colors"
            >
              Change
            </button>
          </div>
        </div>
      </div>

      {/* Mark read modal */}
      {showReadModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4"
          onClick={() => setShowReadModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md animate-in slide-up"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-black text-slate-800 mb-1">What page did you reach?</h3>
            <p className="text-sm text-slate-500 mb-5">
              Currently at p.{currentPage} · Today&apos;s goal: p.{targetPageToday}
            </p>
            <input
              type="number"
              value={pageInput}
              onChange={e => setPageInput(e.target.value)}
              min={book.startPage + 1}
              max={book.totalPages}
              className="w-full text-3xl font-black text-center p-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-400 mb-5"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowReadModal(false)}
                className="flex-1 py-3.5 font-bold rounded-xl bg-slate-100 text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkRead}
                className="flex-1 py-3.5 font-bold rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change pace modal */}
      {showPaceModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4"
          onClick={() => setShowPaceModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md animate-in slide-up"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-black text-slate-800 mb-1">Change reading pace</h3>
            <p className="text-sm text-slate-500 mb-5">
              Updates days-to-finish based on your current position
            </p>
            <div className="flex items-center gap-3 mb-5">
              <input
                type="number"
                value={paceInput}
                onChange={e => setPaceInput(e.target.value)}
                min={1}
                className="flex-1 text-3xl font-black text-center p-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-teal-400"
                autoFocus
              />
              <span className="text-slate-500 font-semibold whitespace-nowrap">pages / day</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPaceModal(false)}
                className="flex-1 py-3.5 font-bold rounded-xl bg-slate-100 text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePace}
                className="flex-1 py-3.5 font-bold rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
