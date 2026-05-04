import { memo } from 'react';
import { Station } from '../App';
import { Play, Pause } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface StationListProps {
  stations: Station[];
  currentStation: Station | null;
  isPlaying: boolean;
  onSelect: (station: Station) => void;
  emptyStateText: string;
}

// StationList component displays a grid of radio stations with favorite toggles.
export const StationList = memo(({ stations, currentStation, isPlaying, onSelect, emptyStateText }: StationListProps) => {
  if (stations.length === 0) {
    return (
      <div className="text-center py-10 text-[var(--tg-theme-hint-color)]">
        {emptyStateText}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {stations.map((station) => {
        const isActive = currentStation?.id === station.id;
        
        return (
          <div
            key={station.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(station)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(station);
              }
            }}
            className={twMerge(
              "flex flex-col items-center p-3 rounded-2xl transition-all active:scale-95 relative group cursor-pointer",
              isActive 
                ? "bg-[var(--tg-theme-button-color)]/10 ring-2 ring-[var(--tg-theme-button-color)]" 
                : "bg-[var(--tg-theme-hint-color)]/5 hover:bg-[var(--tg-theme-hint-color)]/10"
            )}
          >
            <div className="relative w-full aspect-square mb-3 rounded-xl overflow-hidden bg-white/5">
              <img 
                src={station.logo} 
                alt={station.name}
                className="w-full h-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              
              <div className={twMerge(
                "absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity",
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}>
                <div className="w-10 h-10 rounded-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] flex items-center justify-center shadow-lg">
                  {isActive && isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-1" />
                  )}
                </div>
              </div>
            </div>
            
            <span className="text-sm font-medium text-center line-clamp-2 leading-tight">
              {station.name}
            </span>
          </div>
        );
      })}
    </div>
  );
});
