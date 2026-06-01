'use client';

import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative max-w-md mx-auto px-4 pt-14 pb-8 text-center">
          <div className="text-5xl mb-4">🎯</div>
          <h1 className="text-3xl font-black text-white mb-2">KeepGoing</h1>
          <p className="text-white/70 font-medium">What are you working on today?</p>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-6 pb-8 space-y-4">
        <button
          onClick={() => router.push('/sports')}
          className="w-full text-left bg-white rounded-2xl p-6 card-shadow hover:card-shadow-hover transition-all duration-200 active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-2xl flex-shrink-0">
              🏋️
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-black text-slate-800">Sports</h2>
              <p className="text-sm text-slate-500 mt-0.5">Track your daily workout routine</p>
            </div>
            <svg className="w-5 h-5 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        <button
          onClick={() => router.push('/books')}
          className="w-full text-left bg-white rounded-2xl p-6 card-shadow hover:card-shadow-hover transition-all duration-200 active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-2xl flex-shrink-0">
              📚
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-black text-slate-800">Books</h2>
              <p className="text-sm text-slate-500 mt-0.5">Track your reading goals</p>
            </div>
            <svg className="w-5 h-5 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}
