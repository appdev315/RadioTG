/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import WebApp from '@twa-dev/sdk';
import { Globe } from 'lucide-react';
import stationsData from './stations.json';
import { StationList } from './components/StationList';
import { Player } from './components/Player';
import { CategoryFilter } from './components/CategoryFilter';
import { translations, Language } from './i18n';

export interface Station {
  id: string;
  name: string;
  logo: string;
  stream: string;
  category: string;
}

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];

  const categories = [
    { id: 'all', name: t.categories.all },
    { id: 'favorites', name: t.categories.favorites },
    { id: 'top', name: t.categories.top },
    { id: 'pop', name: t.categories.pop },
    { id: 'news', name: t.categories.news },
    { id: 'chillout', name: t.categories.chillout },
    { id: 'rock', name: t.categories.rock },
    { id: 'russian', name: t.categories.russian },
    { id: 'foreign', name: t.categories.foreign },
    { id: 'retro', name: t.categories.retro },
    { id: 'jazz', name: t.categories.jazz },
    { id: 'classical', name: t.categories.classical },
    { id: 'kids', name: t.categories.kids },
  ];

  const [stations, setStations] = useState<Station[]>(stationsData);
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [volume, setVolume] = useState(1);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('radiotg_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    localStorage.setItem('radiotg_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    
    const tgLang = WebApp.initDataUnsafe?.user?.language_code;
    if (tgLang === 'ru') {
      setLang('ru');
    }
    
    // Set theme colors based on Telegram
    document.documentElement.style.setProperty('--tg-theme-bg-color', WebApp.themeParams.bg_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-text-color', WebApp.themeParams.text_color || '#000000');
    document.documentElement.style.setProperty('--tg-theme-hint-color', WebApp.themeParams.hint_color || '#999999');
    document.documentElement.style.setProperty('--tg-theme-link-color', WebApp.themeParams.link_color || '#2481cc');
    document.documentElement.style.setProperty('--tg-theme-button-color', WebApp.themeParams.button_color || '#2481cc');
    document.documentElement.style.setProperty('--tg-theme-button-text-color', WebApp.themeParams.button_text_color || '#ffffff');
  }, []);

  useEffect(() => {
    let filtered = stationsData;
    if (activeCategory === 'favorites') {
      filtered = filtered.filter(s => favorites.includes(s.id));
    } else if (activeCategory !== 'all') {
      filtered = filtered.filter(s => s.category === activeCategory);
    }
    if (searchQuery) {
      filtered = filtered.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    setStations(filtered);
  }, [activeCategory, searchQuery, favorites]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handlePlayPause = (forcePause?: boolean) => {
    if (!audioRef.current) return;
    
    if (isPlaying || forcePause === true) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(e => {
        console.error("Playback failed", e);
        setIsPlaying(false);
      });
    }
  };

  const handleStationSelect = (station: Station) => {
    if (currentStation?.id === station.id) {
      handlePlayPause();
      return;
    }
    
    setCurrentStation(station);
    setIsPlaying(true);
    
    if (audioRef.current) {
      audioRef.current.src = station.stream;
      audioRef.current.play().catch(e => {
        console.error("Playback failed", e);
        setIsPlaying(false);
      });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--tg-theme-bg-color)] text-[var(--tg-theme-text-color)] pb-24 font-sans">
      <div className="sticky top-0 z-10 bg-[var(--tg-theme-bg-color)]/90 backdrop-blur-md border-b border-[var(--tg-theme-hint-color)]/20 pt-4 pb-2 px-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">RadioTG</h1>
            <div className="flex flex-col">
              <span className="text-[10px] bg-[var(--tg-theme-button-color)]/20 text-[var(--tg-theme-button-color)] px-1.5 py-0.5 rounded font-mono leading-none">v0.0.2</span>
              <span className="text-[8px] opacity-30 font-mono mt-0.5">Build: 07:03</span>
            </div>
          </div>
          <button 
            onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--tg-theme-hint-color)]/10 text-[var(--tg-theme-text-color)] hover:bg-[var(--tg-theme-hint-color)]/20 transition-colors text-sm font-medium"
          >
            <Globe className="w-4 h-4" />
            {lang === 'ru' ? 'EN' : 'RU'}
          </button>
        </div>
        
        <div className="relative mb-3">
          <input 
            type="text" 
            placeholder={t.searchPlaceholder} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--tg-theme-hint-color)]/10 text-[var(--tg-theme-text-color)] rounded-xl py-2 px-4 outline-none border border-transparent focus:border-[var(--tg-theme-button-color)] transition-colors"
          />
        </div>
        
        <CategoryFilter 
          categories={categories} 
          activeCategory={activeCategory} 
          onSelect={setActiveCategory} 
        />
      </div>

      <div className="p-4">
        <StationList 
          stations={stations} 
          currentStation={currentStation}
          isPlaying={isPlaying}
          onSelect={handleStationSelect} 
          emptyStateText={t.emptyState}
        />
      </div>

      <Player 
        station={currentStation} 
        isPlaying={isPlaying} 
        onPlayPause={handlePlayPause} 
        volume={volume}
        onVolumeChange={setVolume}
        nowPlayingText={t.nowPlaying}
        pausedText={t.paused}
        sleepTimerText={t.sleepTimer}
        supportText={t.support}
        timerSetText={t.timerSet}
        supportAlertText={t.supportAlert}
        isFavorite={currentStation ? favorites.includes(currentStation.id) : false}
        onToggleFavorite={toggleFavorite}
      />
      
      <audio 
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
      />
    </div>
  );
}
