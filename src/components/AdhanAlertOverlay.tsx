import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Bell, X, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { AzaanPlaybackState, PrePrayerAlertEvent } from '../types';

export const AdhanAlertOverlay: React.FC = () => {
  const [azaanState, setAzaanState] = useState<AzaanPlaybackState>(() => notificationService.getAzaanState());
  const [preAlert, setPreAlert] = useState<PrePrayerAlertEvent | null>(() => notificationService.getActivePreAlert());
  const [showDua, setShowDua] = useState(false);

  useEffect(() => {
    const unsubAzaan = notificationService.subscribeAzaan((state) => {
      setAzaanState(state);
      if (!state.isPlaying) {
        setShowDua(false);
      }
    });

    const unsubPre = notificationService.subscribePrePrayer((alert) => {
      setPreAlert(alert);
    });

    return () => {
      unsubAzaan();
      unsubPre();
    };
  }, []);

  const handleStopAzaan = () => {
    notificationService.stopAzaan();
  };

  const handleDismissPreAlert = () => {
    notificationService.dismissPrePrayerAlert();
  };

  if (!azaanState.isPlaying && !preAlert) {
    return null;
  }

  return (
    <div className="fixed z-50 pointer-events-none inset-x-0 bottom-16 sm:bottom-6 px-4 flex flex-col items-center space-y-2">
      {/* 1. Pre-Prayer 5-Minute Alert Toast */}
      {preAlert && (
        <div className="pointer-events-auto max-w-md w-full p-4 rounded-3xl bg-amber-500 text-amber-950 shadow-2xl border border-amber-300 ring-4 ring-amber-400/30 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="w-10 h-10 rounded-2xl bg-amber-600/20 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-amber-950 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider bg-amber-600/30 px-2 py-0.5 rounded-full">
                5-Min Warning
              </span>
              <h4 className="text-sm font-extrabold truncate">
                {preAlert.prayerName} Prayer
              </h4>
            </div>
            <p className="text-xs font-semibold text-amber-950/80 mt-0.5">
              Time for Wudu & preparation. Starts at {preAlert.prayerTime}.
            </p>
          </div>
          <button
            onClick={handleDismissPreAlert}
            className="p-1.5 rounded-xl hover:bg-amber-600/20 text-amber-950 transition-colors"
            title="Dismiss Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Active Azaan Call-to-Prayer Player Card */}
      {azaanState.isPlaying && (
        <div className="pointer-events-auto max-w-lg w-full rounded-3xl bg-gradient-to-r from-[#064E3B] to-[#043327] text-white shadow-2xl border border-emerald-400/30 ring-4 ring-emerald-500/20 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3.5 min-w-0">
              {/* Animated Equalizer Wave */}
              <div className="w-11 h-11 rounded-2xl bg-emerald-700/50 flex items-center justify-center space-x-1 shrink-0 border border-emerald-500/30 shadow-xs">
                <span className="w-1 bg-amber-300 rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-4" />
                <span className="w-1 bg-amber-300 rounded-full animate-[pulse_1.2s_ease-in-out_infinite] h-6" />
                <span className="w-1 bg-amber-300 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3" />
                <span className="w-1 bg-amber-300 rounded-full animate-[pulse_1.0s_ease-in-out_infinite] h-5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950">
                    Adhan Calling
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold truncate">
                    {azaanState.prayerName ? `${azaanState.prayerName} Prayer` : 'Salah Time'}
                  </h3>
                </div>
                <p className="text-xs text-emerald-200/90 truncate mt-0.5 font-medium flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-amber-300 shrink-0" />
                  <span>{azaanState.voiceName}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setShowDua((prev) => !prev)}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 transition-colors border border-white/10"
                title="Dua After Adhan"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Dua</span>
                {showDua ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              <button
                onClick={handleStopAzaan}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                title="Stop / Mute Adhan Audio"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Stop</span>
              </button>
            </div>
          </div>

          {/* Collapsible Authentic Dua After Adhan Card */}
          {showDua && (
            <div className="px-5 pb-5 pt-2 border-t border-emerald-700/40 bg-emerald-950/70 space-y-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                  Sunnah Supplication After Adhan
                </span>
                <span className="text-[10px] text-emerald-300/70">Sahih al-Bukhari 614</span>
              </div>

              <p
                dir="rtl"
                className="text-base sm:text-lg font-quran text-right leading-loose text-amber-100 pt-1"
              >
                اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّداً الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَاماً مَحْمُوداً الَّذِي وَعَدْتَهُ
              </p>

              <p className="text-xs text-emerald-200/90 italic font-mono">
                "Allahumma Rabba hadhihid-da'watit-tammah, was-salatil-qa'imah, ati Muhammadan al-wasilata wal-fadilah, wab'athhu maqaman mahmudan alladhi wa'adtah."
              </p>

              <p className="text-xs text-emerald-100 font-medium">
                "O Allah, Lord of this perfect call and established prayer, grant Muhammad the intercession and favor, and raise him to the praised station which You have promised him."
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
