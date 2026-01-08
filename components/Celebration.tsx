'use client';

import { useEffect, useState } from 'react';

interface CelebrationProps {
  show: boolean;
  streak: number;
  onDismiss: () => void;
}

export function Celebration({ show, streak, onDismiss }: CelebrationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-b from-green-400/90 to-emerald-500/90"
      onClick={() => {
        setVisible(false);
        onDismiss();
      }}
    >
      <div className="text-center animate-in zoom-in duration-300">
        <div className="text-8xl mb-4">🎉</div>
        <h2 className="text-4xl font-bold text-white mb-2">All Done!</h2>
        {streak > 0 && (
          <p className="text-xl text-white/90">
            🔥 {streak} day streak!
          </p>
        )}
        <p className="text-white/70 mt-4 text-sm">Tap to dismiss</p>
      </div>
    </div>
  );
}
