import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface TimerDisplayProps {
  endTime: number | null;
  onTimerEnd: () => void;
  sleepTimerText: string;
  onClick: () => void;
}

export function TimerDisplay({ 
  endTime, 
  onTimerEnd, 
  sleepTimerText,
  onClick 
}: TimerDisplayProps) {
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    if (!endTime) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const remaining = endTime - now;

      if (remaining <= 0) {
        setTimeLeft(null);
        onTimerEnd();
      } else {
        const m = Math.floor(remaining / 60000);
        const s = Math.floor((remaining % 60000) / 1000);
        setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime, onTimerEnd]);

  return (
    <button 
      onClick={onClick}
      className={twMerge(
        "w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-colors",
        endTime 
          ? "bg-[var(--tg-theme-button-color)]/20 text-[var(--tg-theme-button-color)]" 
          : "bg-[var(--tg-theme-hint-color)]/10 text-[var(--tg-theme-text-color)]"
      )}
      title={sleepTimerText}
    >
      {timeLeft ? (
        <span className="text-[10px] font-bold tabular-nums">{timeLeft}</span>
      ) : (
        <Timer className="w-5 h-5" />
      )}
    </button>
  );
}
