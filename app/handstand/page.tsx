'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { HandstandResult, HandstandLog, HandstandAttempt } from '@/lib/types';
import { loadData, saveData, getToday, generateId } from '@/lib/storage';

const GOAL = 100;

// Phase thresholds (based on last 15 attempts, min 5 to leave phase 1)
const PHASE2_FREESTANDING = 0.50; // 50% moment+balance → phase 2
const PHASE3_EXTENDED = 0.25;     // 25% balance → phase 3

const RESULT_CONFIG: Record<HandstandResult, {
  label: string;
  emoji: string;
  dotColor: string;
  btnBg: string;
  btnBorder: string;
  btnText: string;
}> = {
  wall: {
    label: 'Touched wall',
    emoji: '🧱',
    dotColor: 'bg-red-400',
    btnBg: 'bg-red-50 hover:bg-red-100 active:bg-red-200',
    btnBorder: 'border-red-200',
    btnText: 'text-red-700',
  },
  moment: {
    label: 'Held a sec',
    emoji: '⚡',
    dotColor: 'bg-amber-400',
    btnBg: 'bg-amber-50 hover:bg-amber-100 active:bg-amber-200',
    btnBorder: 'border-amber-200',
    btnText: 'text-amber-700',
  },
  balance: {
    label: 'Nailed it!',
    emoji: '⭐',
    dotColor: 'bg-emerald-400',
    btnBg: 'bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200',
    btnBorder: 'border-emerald-200',
    btnText: 'text-emerald-700',
  },
};

const PHASE_COLORS = {
  1: { bg: 'bg-indigo-50', border: 'border-indigo-100', badge: 'bg-indigo-500', text: 'text-indigo-700', bar: 'bg-indigo-400' },
  2: { bg: 'bg-amber-50', border: 'border-amber-100', badge: 'bg-amber-500', text: 'text-amber-700', bar: 'bg-amber-400' },
  3: { bg: 'bg-emerald-50', border: 'border-emerald-100', badge: 'bg-emerald-500', text: 'text-emerald-700', bar: 'bg-emerald-400' },
} as const;

interface PhaseInfo {
  phase: 1 | 2 | 3;
  name: string;
  focus: string;
  progressLabel: string;
  progressPct: number;
  nextPhase: string | null;
}

function getPhaseInfo(allAttempts: HandstandAttempt[]): PhaseInfo {
  const window = allAttempts.slice(-15);
  const n = window.length;
  const freeCount = window.filter(a => a.result !== 'wall').length;
  const freeRate = n > 0 ? freeCount / n : 0;
  const balanceCount = window.filter(a => a.result === 'balance').length;
  const balanceRate = n > 0 ? balanceCount / n : 0;

  if (n >= 5 && balanceRate >= PHASE3_EXTENDED) {
    return {
      phase: 3,
      name: 'Building Holds',
      focus: "Extended holds are happening! Each session, breathe and fight to stay up just a little longer.",
      progressLabel: `${Math.round(balanceRate * 100)}% of recent tries are extended holds`,
      progressPct: Math.min((balanceRate / 0.5) * 100, 100),
      nextPhase: null,
    };
  }

  if (n >= 5 && freeRate >= PHASE2_FREESTANDING) {
    return {
      phase: 2,
      name: 'Finding Balance',
      focus: "You're consistently getting airborne. The moment you stick it, breathe and fight to hold on longer.",
      progressLabel: `${Math.round(balanceRate * 100)}% extended holds in last ${n} (need 25%)`,
      progressPct: Math.min((balanceRate / PHASE3_EXTENDED) * 100, 99),
      nextPhase: 'Building Holds',
    };
  }

  return {
    phase: 1,
    name: 'Getting Airborne',
    focus: "Every kick counts. Commit fully — hesitation is the enemy. The wall is there to catch you.",
    progressLabel: n > 0
      ? `${Math.round(freeRate * 100)}% freestanding in last ${n} tries (need 50%)`
      : 'Log your first attempt to start tracking',
    progressPct: n > 0 ? Math.min((freeRate / PHASE2_FREESTANDING) * 100, 99) : 0,
    nextPhase: 'Finding Balance',
  };
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDateLabel(dateStr: string, today: string): string {
  if (dateStr === today) return 'Today';
  if (dateStr === addDays(today, -1)) return 'Yesterday';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
  });
}

function getLast7Days(today: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(today, -(6 - i)));
}

export default function HandstandPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<HandstandLog[]>([]);
  const [viewDate, setViewDate] = useState('');
  const [mounted, setMounted] = useState(false);
  const [lastAdded, setLastAdded] = useState<HandstandResult | null>(null);

  const today = getToday();
  const isToday = viewDate === today;
  const canGoForward = viewDate < today;

  useEffect(() => {
    setMounted(true);
    const data = loadData();
    setLogs(data.handstandLogs || []);
    setViewDate(getToday());
  }, []);

  const getLogForDate = useCallback((date: string): HandstandLog => {
    return logs.find(l => l.date === date) || { date, attempts: [] };
  }, [logs]);

  const persistLogs = useCallback((newLogs: HandstandLog[]) => {
    const data = loadData();
    data.handstandLogs = newLogs;
    saveData(data);
    setLogs([...newLogs]);
  }, []);

  const addAttempt = useCallback((result: HandstandResult) => {
    const attempt: HandstandAttempt = { id: generateId(), result };
    const dayLog = getLogForDate(viewDate);
    const updated: HandstandLog = { ...dayLog, attempts: [...dayLog.attempts, attempt] };
    persistLogs([...logs.filter(l => l.date !== viewDate), updated]);
    setLastAdded(result);
    setTimeout(() => setLastAdded(null), 1200);
  }, [logs, viewDate, getLogForDate, persistLogs]);

  const undoLast = useCallback(() => {
    const dayLog = getLogForDate(viewDate);
    if (dayLog.attempts.length === 0) return;
    const updated: HandstandLog = { ...dayLog, attempts: dayLog.attempts.slice(0, -1) };
    const filtered = logs.filter(l => l.date !== viewDate);
    persistLogs(updated.attempts.length > 0 ? [...filtered, updated] : filtered);
  }, [logs, viewDate, getLogForDate, persistLogs]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // All attempts in chronological order
  const allAttempts = logs
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .flatMap(l => l.attempts);

  const totalAttempts = allAttempts.length;
  const progressPct = Math.min((totalAttempts / GOAL) * 100, 100);

  // Last 10 for success rate
  const last10 = allAttempts.slice(-10);
  const last10Good = last10.filter(a => a.result !== 'wall').length;
  const last10Rate = last10.length > 0 ? Math.round((last10Good / last10.length) * 100) : 0;

  // Previous 10 for trend
  const prev10 = allAttempts.slice(-20, -10);
  const prev10Rate = prev10.length >= 5
    ? Math.round((prev10.filter(a => a.result !== 'wall').length / prev10.length) * 100)
    : null;
  const trend = (prev10Rate !== null && last10.length >= 5) ? last10Rate - prev10Rate : null;

  // Overall rate
  const overallGood = allAttempts.filter(a => a.result !== 'wall').length;
  const overallRate = totalAttempts > 0 ? Math.round((overallGood / totalAttempts) * 100) : 0;

  // Phase
  const phase = getPhaseInfo(allAttempts);
  const phaseColors = PHASE_COLORS[phase.phase];

  // 7-day chart
  const last7Days = getLast7Days(today);
  const dayStats = last7Days.map(date => {
    const log = getLogForDate(date);
    return {
      date,
      label: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'narrow' }),
      wall: log.attempts.filter(a => a.result === 'wall').length,
      moment: log.attempts.filter(a => a.result === 'moment').length,
      balance: log.attempts.filter(a => a.result === 'balance').length,
      total: log.attempts.length,
    };
  });
  const maxDayTotal = Math.max(...dayStats.map(d => d.total), 1);

  const currentLog = getLogForDate(viewDate);

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative max-w-md mx-auto px-4 pt-8 pb-8">
          <div className="flex items-center gap-2 mb-5">
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
            <h1 className="text-2xl font-black text-white flex-1">{getDateLabel(viewDate, today)}</h1>
            <button
              onClick={() => canGoForward && setViewDate(addDays(viewDate, 1))}
              disabled={!canGoForward}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-30"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {!isToday && (
            <button
              onClick={() => setViewDate(today)}
              className="mb-4 text-xs font-semibold text-white/90 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
            >
              Back to Today
            </button>
          )}

          <div className="flex items-end gap-2">
            <span className="text-6xl font-black text-white">{totalAttempts}</span>
            <div className="mb-1.5">
              <div className="text-white/70 font-semibold text-lg">/ {GOAL}</div>
              <div className="text-white/50 text-xs font-medium uppercase tracking-wide">tries</div>
            </div>
            {totalAttempts >= GOAL && <span className="text-3xl mb-1.5">🎉</span>}
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Log attempts */}
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-slate-800">
              {currentLog.attempts.length > 0
                ? `${currentLog.attempts.length} attempt${currentLog.attempts.length !== 1 ? 's' : ''} today`
                : 'Log an attempt'}
            </h2>
            {currentLog.attempts.length > 0 && (
              <button
                onClick={undoLast}
                className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Undo
              </button>
            )}
          </div>

          {currentLog.attempts.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {currentLog.attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className={`w-8 h-8 rounded-full ${RESULT_CONFIG[attempt.result].dotColor} flex items-center justify-center text-sm`}
                  title={RESULT_CONFIG[attempt.result].label}
                >
                  {RESULT_CONFIG[attempt.result].emoji}
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            {(['wall', 'moment', 'balance'] as HandstandResult[]).map(result => {
              const cfg = RESULT_CONFIG[result];
              const count = currentLog.attempts.filter(a => a.result === result).length;
              return (
                <button
                  key={result}
                  onClick={() => addAttempt(result)}
                  className={`py-3 px-2 rounded-xl border-2 ${cfg.btnBg} ${cfg.btnBorder} ${cfg.btnText} font-bold transition-all active:scale-95 flex flex-col items-center gap-1`}
                >
                  <span className="text-2xl">{cfg.emoji}</span>
                  <span className="text-xs leading-tight text-center">{cfg.label}</span>
                  {count > 0 && (
                    <span className="text-xs font-black opacity-60">{count}×</span>
                  )}
                </button>
              );
            })}
          </div>

          {lastAdded && (
            <p className="mt-3 text-center text-sm font-semibold text-slate-500 animate-in fade-in">
              {RESULT_CONFIG[lastAdded].emoji} Logged!
            </p>
          )}
        </div>

        {/* Phase */}
        <div className={`rounded-2xl p-5 border ${phaseColors.bg} ${phaseColors.border}`}>
          <div className="flex items-center gap-2.5 mb-2">
            <span className={`${phaseColors.badge} text-white text-xs font-black px-2.5 py-0.5 rounded-full`}>
              Phase {phase.phase}
            </span>
            <h2 className={`font-black ${phaseColors.text}`}>{phase.name}</h2>
            {phase.nextPhase && (
              <span className="ml-auto text-xs text-slate-400">Next: {phase.nextPhase}</span>
            )}
            {!phase.nextPhase && (
              <span className="ml-auto text-xs text-slate-400">Final phase 🔝</span>
            )}
          </div>
          <p className="text-sm text-slate-600 mb-3">{phase.focus}</p>
          <div className="h-1.5 bg-white/60 rounded-full overflow-hidden mb-1.5">
            <div
              className={`h-full ${phaseColors.bar} rounded-full transition-all duration-500`}
              style={{ width: `${phase.progressPct}%` }}
            />
          </div>
          <p className={`text-xs font-medium opacity-70 ${phaseColors.text}`}>{phase.progressLabel}</p>
        </div>

        {/* Progress to goal */}
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-slate-800">Progress to 100</h2>
            <span className="text-sm font-bold text-rose-500">{Math.round(progressPct)}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-sm text-slate-500">
            {totalAttempts >= GOAL
              ? 'Challenge complete! 🎉'
              : `${GOAL - totalAttempts} more tries to go`}
          </p>
        </div>

        {/* Success rate */}
        {totalAttempts > 0 && (
          <div className="bg-white rounded-2xl p-5 card-shadow">
            <h2 className="font-black text-slate-800 mb-4">Success rate</h2>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-3xl font-black text-rose-500">{overallRate}%</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Overall freestanding</div>
              </div>
              {last10.length >= 3 && (
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <div className="flex items-start justify-center gap-1">
                    <div className="text-3xl font-black text-rose-500">{last10Rate}%</div>
                    {trend !== null && (
                      <span className={`text-xs font-black mt-1.5 ${trend > 0 ? 'text-emerald-500' : trend < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                        {trend > 0 ? `↑+${trend}` : trend < 0 ? `↓${trend}` : '→'}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Last {last10.length} tries</div>
                </div>
              )}
            </div>

            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
              Last {last10.length} attempt{last10.length !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-1">
              {Array.from({ length: 10 }, (_, i) => {
                const attempt = last10[i];
                return (
                  <div
                    key={i}
                    className={`flex-1 h-7 rounded-md ${attempt ? RESULT_CONFIG[attempt.result].dotColor : 'bg-slate-100'} transition-colors`}
                    title={attempt ? RESULT_CONFIG[attempt.result].label : ''}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-slate-300">older</span>
              <span className="text-xs text-slate-300">latest</span>
            </div>
          </div>
        )}

        {/* 7-day chart */}
        {totalAttempts > 0 && (
          <div className="bg-white rounded-2xl p-5 card-shadow">
            <h2 className="font-black text-slate-800 mb-4">Last 7 days</h2>

            <div className="flex items-end gap-2 h-28">
              {dayStats.map(day => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex-1 flex flex-col justify-end">
                    {day.total > 0 ? (
                      <div
                        className="w-full flex flex-col overflow-hidden rounded-t-sm"
                        style={{ height: `${Math.max((day.total / maxDayTotal) * 100, 8)}%` }}
                      >
                        {day.balance > 0 && (
                          <div className="bg-emerald-400 w-full" style={{ flex: day.balance }} />
                        )}
                        {day.moment > 0 && (
                          <div className="bg-amber-400 w-full" style={{ flex: day.moment }} />
                        )}
                        {day.wall > 0 && (
                          <div className="bg-red-400 w-full" style={{ flex: day.wall }} />
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-0.5 bg-slate-100 rounded" />
                    )}
                  </div>
                  <span className={`text-xs font-bold ${day.date === today ? 'text-rose-500' : 'text-slate-400'}`}>
                    {day.label}
                  </span>
                  {day.total > 0 && (
                    <span className="text-xs text-slate-400 -mt-1">{day.total}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-emerald-400" />
                <span className="text-xs text-slate-500">Balanced</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-amber-400" />
                <span className="text-xs text-slate-500">Held a sec</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-red-400" />
                <span className="text-xs text-slate-500">Wall</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
