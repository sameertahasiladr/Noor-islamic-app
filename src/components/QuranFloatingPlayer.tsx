import React from 'react';
import { Volume2, Play, Pause, Square, ExternalLink, X } from 'lucide-react';
import { audioService, ActiveQuranPlayback } from '../services/audioService';

interface QuranFloatingPlayerProps {
  activePlayback: ActiveQuranPlayback;
  onOpenSurah: (surahNumber: number) => void;
}

export const QuranFloatingPlayer: React.FC<QuranFloatingPlayerProps> = ({
  activePlayback,
  onOpenSurah,
}) => {
  return (
    <div className="fixed bottom-16 sm:bottom-20 left-0 right-0 z-40 px-3 pointer-events-none animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="max-w-md mx-auto pointer-events-auto bg-zinc-900/95 dark:bg-zinc-850/95 text-white rounded-2xl shadow-2xl border border-emerald-500/40 backdrop-blur-md p-2.5 sm:p-3 flex items-center justify-between gap-2.5">
        {/* Playback info & jump */}
        <div
          onClick={() => onOpenSurah(activePlayback.surahNumber)}
          className="flex items-center space-x-2.5 min-w-0 cursor-pointer group flex-1"
          title="Click to view this Surah in Quran reader"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-600/90 text-amber-300 flex items-center justify-center shrink-0 shadow relative overflow-hidden">
            <Volume2 className={`w-4 h-4 ${!activePlayback.isPaused ? 'animate-pulse' : ''}`} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                {activePlayback.isPaused ? 'Paused' : 'Playing Quran'}
              </span>
              {activePlayback.surahArabicName && (
                <span className="text-xs font-arabic text-emerald-300 truncate">
                  {activePlayback.surahArabicName}
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-zinc-100 truncate group-hover:text-emerald-400 transition-colors">
              Surah {activePlayback.surahNumber}. {activePlayback.surahName || 'Quran'} • Ayah {activePlayback.ayahNumber}
            </p>
          </div>
        </div>

        {/* Playback action buttons */}
        <div className="flex items-center space-x-1.5 shrink-0">
          {/* Pause / Resume Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (activePlayback.isPaused) {
                audioService.resume();
              } else {
                audioService.pause();
              }
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title={activePlayback.isPaused ? 'Resume' : 'Pause'}
          >
            {activePlayback.isPaused ? (
              <Play className="w-4 h-4 fill-current text-amber-300" />
            ) : (
              <Pause className="w-4 h-4 text-white" />
            )}
          </button>

          {/* Stop Button (Immediately stops background playback) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              audioService.stop();
            }}
            className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
            title="Stop recitation"
          >
            <Square className="w-3 h-3 fill-current" />
            <span className="hidden sm:inline">Stop</span>
          </button>

          {/* Go to Surah Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenSurah(activePlayback.surahNumber);
            }}
            className="p-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white transition-colors"
            title="Open Surah Reader"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
