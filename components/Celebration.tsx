'use client';

import { useEffect, useState } from 'react';

interface CelebrationProps {
  show: boolean;
  streak: number;
  onDismiss: () => void;
}

function Confetti() {
  const colors = ['#8b5cf6', '#0ea5e9', '#22c55e', '#f97316', '#ec4899'];
  const confetti = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 1,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 6 + Math.random() * 8,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {confetti.map((c) => (
        <div
          key={c.id}
          className="absolute top-0"
          style={{
            left: `${c.left}%`,
            width: c.size,
            height: c.size,
            backgroundColor: c.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `fall ${c.duration}s ease-out ${c.delay}s forwards`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export function Celebration({ show, streak, onDismiss }: CelebrationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={() => {
        setVisible(false);
        onDismiss();
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700" />
      <Confetti />

      <div className="relative text-center animate-in zoom-in duration-500">
        <div className="text-8xl mb-6 animate-float">🎉</div>
        <h2 className="text-5xl font-black text-white mb-3 drop-shadow-lg">
          All Done!
        </h2>
        {streak > 0 && (
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full">
            <span className="text-3xl">🔥</span>
            <span className="text-2xl font-bold text-white">{streak} day streak!</span>
          </div>
        )}
        <p className="text-white/60 mt-8 text-sm">Tap anywhere to continue</p>
      </div>
    </div>
  );
}
