import { useState, useEffect, ChangeEvent } from 'react';
import { Station } from '../App';
import { Play, Pause, Radio, Timer, Heart, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import WebApp from '@twa-dev/sdk';
import { twMerge } from 'tailwind-merge';

interface PlayerProps {
  station: Station | null;
  isPlaying: boolean;
  isBuffering?: boolean;
  onPlayPause: (forcePause?: boolean) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  nowPlayingText: string;
  pausedText: string;
  sleepTimerText: string;
  supportText: string;
  timerSetText: string;
  supportAlertText: string;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export function Player({ 
  station, 
  isPlaying, 
  isBuffering,
  onPlayPause, 
  volume,
  onVolumeChange,
  nowPlayingText, 
  pausedText,
  sleepTimerText,
  supportText,
  timerSetText,
  supportAlertText,
  isFavorite,
  onToggleFavorite
}: PlayerProps) {
  const [showTimerMenu, setShowTimerMenu] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    if (!endTime) {
      setTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = endTime - now;

      if (remaining <= 0) {
        clearInterval(interval);
        setEndTime(null);
        setTimerMinutes(0);
        setTimeLeft(null);
        onPlayPause(true);
      } else {
        const m = Math.floor(remaining / 60000);
        const s = Math.floor((remaining % 60000) / 1000);
        setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`);
      }
    }, 1000);

    // Initial call to set immediately
    const remaining = endTime - Date.now();
    if (remaining > 0) {
      const m = Math.floor(remaining / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`);
    }

    return () => clearInterval(interval);
  }, [endTime, onPlayPause]);

  const handleTimerChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setTimerMinutes(val);
    if (val === 0) {
      setEndTime(null);
    } else {
      setEndTime(Date.now() + val * 60000);
    }
  };

  const safeShowAlert = (message: string) => {
    if (WebApp.isVersionAtLeast('6.2')) {
      WebApp.showAlert(message);
    } else {
      window.alert(message);
    }
  };

  const handleSupport = () => {
    safeShowAlert(supportAlertText);
  };
  return (
    <AnimatePresence>
      {station && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 p-4 z-50"
        >
          <div className="bg-[var(--tg-theme-bg-color)] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border border-[var(--tg-theme-hint-color)]/20 rounded-2xl p-3 flex flex-col gap-3 backdrop-blur-xl bg-opacity-90">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-[var(--tg-theme-hint-color)]/10 shrink-0">
              {station.logo ? (
                <img 
                  src={station.logo} 
                  alt={station.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--tg-theme-hint-color)]">
                  <Radio />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate text-[var(--tg-theme-text-color)]">
                {station.name}
              </div>
              <div className="text-xs text-[var(--tg-theme-hint-color)] truncate flex items-center gap-2">
                {isBuffering ? (
                  <span className="flex items-center gap-1.5 text-[var(--tg-theme-button-color)] animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                    Buffering...
                  </span>
                ) : isPlaying ? (
                  <span className="flex items-center gap-1.5 text-[var(--tg-theme-button-color)]">
                    <div className="flex items-end gap-[2px] h-3">
                      <div className="w-[3px] bg-current animate-eq h-full rounded-sm"></div>
                      <div className="w-[3px] bg-current animate-eq-fast h-2/3 rounded-sm"></div>
                      <div className="w-[3px] bg-current animate-eq-slow h-1/2 rounded-sm"></div>
                    </div>
                    {nowPlayingText}
                  </span>
                ) : (
                  <span>{pausedText}</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={() => setShowTimerMenu(!showTimerMenu)}
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
              
              <button 
                onClick={() => station && onToggleFavorite(station.id)}
                className={twMerge(
                  "w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform",
                  isFavorite ? "bg-red-500/10 text-red-500" : "bg-[var(--tg-theme-hint-color)]/10 text-[var(--tg-theme-text-color)]"
                )}
                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={twMerge("w-5 h-5", isFavorite && "fill-current")} />
              </button>

              <button 
                onClick={() => onPlayPause()}
                className="w-12 h-12 rounded-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] flex items-center justify-center active:scale-95 transition-transform shadow-md ml-1"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current ml-1" />
                )}
              </button>
            </div>
            </div>

            <div className="flex items-center gap-3 px-1">
              <button 
                onClick={() => onVolumeChange(volume === 0 ? 1 : 0)}
                className="text-[var(--tg-theme-hint-color)] active:scale-95 transition-transform"
              >
                {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume} 
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-[var(--tg-theme-hint-color)]/20 rounded-lg appearance-none cursor-pointer accent-[var(--tg-theme-button-color)]"
              />
            </div>

            <AnimatePresence>
              {showTimerMenu && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 px-1 pt-3 pb-1 border-t border-[var(--tg-theme-hint-color)]/10 mt-1">
                    <Timer className="w-4 h-4 text-[var(--tg-theme-hint-color)] shrink-0" />
                    <input 
                      type="range" 
                      min="0" 
                      max="60" 
                      step="5" 
                      value={timerMinutes} 
                      onChange={handleTimerChange}
                      className="flex-1 h-1.5 bg-[var(--tg-theme-hint-color)]/20 rounded-lg appearance-none cursor-pointer accent-[var(--tg-theme-button-color)]"
                    />
                    <span className="text-xs font-medium text-[var(--tg-theme-text-color)] w-8 text-right tabular-nums shrink-0">
                      {timerMinutes === 0 ? 'Off' : `${timerMinutes}m`}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
